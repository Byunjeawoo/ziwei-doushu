/* *
 * formToBirthInfo: 야자시 날짜 변경은 진태양시에 따라 결정되어야 하며 이는 시진와 동일합니다.
 *
 * 요일을 바꿀 때는 시계의 "23시"만 봤습니다. 수정된 시진와 잘못 정렬되었을 때 배반 날짜가 하루 뒤쳐졌습니다.
 *다음 2000-01-31 샘플에는 경도 수정 및 평균 시차(약 -13분)가 포함되어 있습니다.
 * 요일 변경 구경은 lib/ziwei/true-solar-time.ts의solveZiweiDayOffset('next-day')과 일치합니다. */
import assert from 'node:assert/strict';
import { formToBirthInfo, formToSearchParams, searchParamsToForm } from '../../lib/ziwei/share';
import type { BirthFormState } from '../../components/BirthForm';

function formAt(clockHour: string, clockMinute: string, longitude: number): BirthFormState {
  return {
    name: '',
    year: '2000',
    month: '1',
    day: '31',
    clockHour,
    clockMinute,
    unknownTime: false,
    province: longitude === 120 ? '' : '测试',
    city: '',
    longitude,
    gender: 'male',
  };
}

const pick = (b: ReturnType<typeof formToBirthInfo>) => ({ year: b.year, month: b.month, day: b.day, hour: b.hour });

const cases: Array<[string, string, number, { year: number; month: number; day: number; hour: number }, string]> = [
  ['23', '30', 120, { year: 2000, month: 2, day: 1, hour: 0 }, "경도 120° 23:30 야자시 → 다음날 자시"],
  ['0', '30', 120, { year: 2000, month: 1, day: 31, hour: 0 }, "경도 120° 00:30 조자시 → 오늘의 자시"],
  ['23', '30', 100, { year: 2000, month: 1, day: 31, hour: 11 }, "경도 100° 23:30 → 오늘의 해시"],
  ['22', '30', 135, { year: 2000, month: 2, day: 1, hour: 0 }, "경도 135° 22:30 → 다음날 자시"],
  ['0', '30', 80, { year: 2000, month: 1, day: 30, hour: 11 }, "경도 80° 00:30 → 전날 해시"],
  ['23', '50', 130, { year: 2000, month: 2, day: 1, hour: 0 }, "경도 130° 23:50 → 다음날 자시"],
];

for (const [h, mi, lon, expected, label] of cases) {
  assert.deepEqual(pick(formToBirthInfo(formAt(h, mi, lon))), expected, label);
}

const unknown = formToBirthInfo({ ...formAt('23', '30', 100), unknownTime: true });
assert.deepEqual(pick(unknown), { year: 2000, month: 1, day: 31, hour: 0 }, '时辰不详不换日');

for (const longitude of [0, -180, 180, 120, 116.4]) {
  const form = formAt('8', '0', longitude);
  assert.equal(searchParamsToForm(formToSearchParams(form))?.longitude, longitude, "공유 링크는 유효한 경도를 유지합니다");
}

for (const invalid of ['', ' ', 'Infinity', 'NaN', '116.4abc', '-181', '181']) {
  const params = new URLSearchParams({ y: '2000', m: '1', d: '31', lo: invalid });
  assert.equal(searchParamsToForm(params)?.longitude, 120, "잘못된 경도는 공유 링크의 기본값을 사용합니다.");
}

assert.equal(formToSearchParams(formAt('8', '0', Number.NaN)).has('lo'), false);

console.log('form true-solar day rollover regression passed');
