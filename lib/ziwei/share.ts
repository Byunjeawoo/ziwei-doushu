import type { BirthFormState } from '@/components/BirthForm';
import type { BirthInfo } from './types';
import { calculateTrueSolarTime, resolveZiweiDayOffset, shiftGregorianDate } from './true-solar-time';

function isValidLongitude(longitude: number): boolean {
  return longitude >= -180 && longitude <= 180;
}

/* * 양식 미리보기 및 제출 공통 : 베이징 시간 + 경도 보정 + 생년월일에 해당하는 평균 시차. */
export function formToTrueSolarTime(form: Pick<BirthFormState, 'year' | 'month' | 'day' | 'clockHour' | 'clockMinute' | 'province' | 'longitude'>) {
  return calculateTrueSolarTime({
    year: parseInt(form.year) || 0,
    month: parseInt(form.month) || 0,
    day: parseInt(form.day) || 0,
    clockHour: parseInt(form.clockHour) || 0,
    clockMinute: parseInt(form.clockMinute) || 0,
    longitude: form.province ? form.longitude : undefined,
  });
}

/* * BirthFormState → BirthInfo
 *
 * 자시 규칙(니하이샤 시스템/삼합파 표준, 다음은 모두 진태양시에 따릅니다):
 * · 23:00-23:59 = 야자시, **다음날까지** 배반 (날짜 +1)
 * · 00:00-00:59 = 조자시, 오늘의 배반 기준
 * "시진 브랜치는 동일 자식(0)"과 충돌하지 않습니다. - 자시는 오전과 저녁 섹션으로 나누어 날짜별로 구분해야 합니다. */
export function formToBirthInfo(form: BirthFormState): BirthInfo {
  let y = parseInt(form.year) || 0;
  let m = parseInt(form.month) || 0;
  let d = parseInt(form.day) || 0;
  let hour = 0;

  // 야자시 일 변경은 시진과 동일한 구경인 진태양시에 따라 결정됩니다(true-solar-time.ts의 resolveZiweiDayOffset 참조).
  if (!form.unknownTime) {
    const solar = formToTrueSolarTime(form);
    hour = solar.branch;
    const dayOffset = resolveZiweiDayOffset(solar);
    if (dayOffset !== 0 && solar.dateValid) {
      ({ year: y, month: m, day: d } = shiftGregorianDate({ year: y, month: m, day: d }, dayOffset));
    }
  }

  return {
    year: y, month: m, day: d,
    hour,
    gender: form.gender,
    name: form.name || undefined,
    province: form.province || undefined,
    city: form.city || undefined,
    longitude: form.province ? form.longitude : undefined,
  };
}

/* * BirthFormState → URLSearchParams(공유 링크의 경우) */
export function formToSearchParams(form: BirthFormState): URLSearchParams {
  const p = new URLSearchParams();
  if (form.name) p.set('n', form.name);
  p.set('y', form.year);
  p.set('m', form.month);
  p.set('d', form.day);
  if (form.unknownTime) {
    p.set('u', '1');
  } else {
    p.set('h', form.clockHour);
    p.set('mi', form.clockMinute);
  }
  if (form.province) p.set('p', form.province);
  if (form.city) p.set('c', form.city);
  if (form.longitude !== 120 && isValidLongitude(form.longitude)) p.set('lo', String(form.longitude));
  p.set('g', form.gender === 'male' ? 'm' : 'f');
  return p;
}

/* * URLSearchParams → Partial<BirthFormState>, 돌아가기 불완전한 경우 null */
export function searchParamsToForm(params: URLSearchParams): Partial<BirthFormState> | null {
  const year = params.get('y');
  const month = params.get('m');
  const day = params.get('d');
  if (!year || !month || !day) return null;
  const rawLongitude = params.get('lo')?.trim();
  const longitude = rawLongitude ? Number(rawLongitude) : 120;
  return {
    name: params.get('n') || '',
    year,
    month,
    day,
    unknownTime: params.get('u') === '1',
    clockHour: params.get('h') || '8',
    clockMinute: params.get('mi') || '0',
    province: params.get('p') || '',
    city: params.get('c') || '',
    longitude: isValidLongitude(longitude) ? longitude : 120,
    gender: params.get('g') === 'f' ? 'female' : 'male',
  };
}
