/* *
 * 진태양시 통합 계산.
 *
 *구경: 로컬 진태양시 = 시계 시간 + 경도 보정 + 평균 시차; 경도 보정 = (출생지 경도 - 시계 시간대 중심 자오선) × 4분.
 * 국내에서는 모든 지역이 동팔구(중심경선 120°)에 위치함. ★ 2026-10-27 동기화 : 해외 출생지 전송 utcOffsetMinutes (출생지 시간대 고정 표준 오프셋),
 * 주류 배반 구경과 일치 - 일광 절약 시간제 및 과거 시간대를 처리하지 않습니다. 사용자가 현재 연도의 시계 판독값을 입력하는 경우 먼저 clock-adjust.ts를 사용하여 이를 표준 시간으로 변경한 다음 전달합니다.
 *평균 시차는 NOAA의 분수 연도 근사 공식을 채택하며 이는 1900-2026 범위에서 충분히 안정적입니다.
 * 자미두수의 2시간 시진 경계를 결정합니다.
 *
 * 참고 : https://gml.noaa.gov/grad/solcalc/solareqns.PDF */

export interface GregorianDate {
  year: number;
  month: number;
  day: number;
}

export type LateZishiRule = 'next-day' | 'current-day' | 'all-current' | 'day-cur-time-next';

export interface TrueSolarTimeInput extends GregorianDate {
  clockHour: number;
  clockMinute: number;
  /* * 경도가 제공되지 않는 경우 원래 시계 시간이 유지되며 진태양시 보정이 수행되지 않습니다. */
  longitude?: number;
  /* * 시계 시간이 위치한 시간대의 표준 오프셋(분, 동서 마이너스) 전송되지 않음 = 베이징 시간 480(국내, 오래된 데이터) */
  utcOffsetMinutes?: number;
}

export interface TrueSolarTimeResult {
  dateValid: boolean;
  corrected: boolean;
  longitudeCorrectionMinutes: number;
  equationOfTimeMinutes: number;
  totalCorrectionMinutes: number;
  rawMinutes: number;
  normalizedMinutes: number;
  dayOffset: number;
  hour: number;
  minute: number;
  second: number;
  branch: number;
}

const MINUTES_PER_DAY = 1440;
const SECONDS_PER_DAY = 86400;
const mod = (value: number, base: number) => ((value % base) + base) % base;

export function isValidGregorianDate(year: number, month: number, day: number): boolean {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function shiftGregorianDate(date: GregorianDate, dayOffset: number): GregorianDate {
  const shifted = new Date(Date.UTC(date.year, date.month - 1, date.day + dayOffset));
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

export function sameGregorianDate(a: GregorianDate, b: GregorianDate): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function dayOfYear(year: number, month: number, day: number): number {
  return Math.floor((Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 0)) / 86_400_000);
}

/* *NOAA 대략적인 평균 시차(돌아가기분); 양수 값은 진태양시가 평균 태양 시간보다 빠르다는 것을 의미합니다. */
export function equationOfTimeMinutes(
  year: number,
  month: number,
  day: number,
  clockHour = 12,
  clockMinute = 0,
): number {
  if (!isValidGregorianDate(year, month, day)) return 0;
  const daysInYear = isLeapYear(year) ? 366 : 365;
  const fractionalHour = clockHour + clockMinute / 60;
  const gamma = (2 * Math.PI / daysInYear)
    * (dayOfYear(year, month, day) - 1 + (fractionalHour - 12) / 24);
  return 229.18 * (
    0.000075
    + 0.001868 * Math.cos(gamma)
    - 0.032077 * Math.sin(gamma)
    - 0.014615 * Math.cos(2 * gamma)
    - 0.040849 * Math.sin(2 * gamma)
  );
}

export function branchFromSolarMinutes(normalizedMinutes: number): number {
  if (normalizedMinutes >= 1380 || normalizedMinutes < 60) return 0;
  return Math.floor((normalizedMinutes - 60) / 120) + 1;
}

export function calculateTrueSolarTime(input: TrueSolarTimeInput): TrueSolarTimeResult {
  const dateValid = isValidGregorianDate(input.year, input.month, input.day);
  const corrected = input.longitude !== undefined && Number.isFinite(input.longitude);
  // 중앙 자오선 = 시간대 오프셋 / 4(480분 → 120°); 국내에서는 여전히 원래 공식(경도 - 120) × 4이며 결과는 조금씩 변경되지 않습니다.
  const meridian = input.utcOffsetMinutes !== undefined && Number.isFinite(input.utcOffsetMinutes) ? input.utcOffsetMinutes / 4 : 120;
  const longitudeCorrectionMinutes = corrected ? (input.longitude! - meridian) * 4 : 0;
  const eot = corrected && dateValid
    ? equationOfTimeMinutes(input.year, input.month, input.day, input.clockHour, input.clockMinute)
    : 0;
  const totalCorrectionMinutes = longitudeCorrectionMinutes + eot;
  const rawMinutes = input.clockHour * 60 + input.clockMinute + totalCorrectionMinutes;

  // 페이지의 입력 정밀도는 분입니다. 디스플레이 및 시진 경계는 부동 소수점 결함을 방지하기 위해 최신 초를 기준으로 균일하게 적용됩니다.
  const roundedTotalSeconds = Math.round(rawMinutes * 60);
  const dayOffset = Math.floor(roundedTotalSeconds / SECONDS_PER_DAY);
  const secondOfDay = mod(roundedTotalSeconds, SECONDS_PER_DAY);
  const hour = Math.floor(secondOfDay / 3600);
  const minute = Math.floor((secondOfDay % 3600) / 60);
  const second = secondOfDay % 60;
  const normalizedMinutes = secondOfDay / 60;

  return {
    dateValid,
    corrected,
    longitudeCorrectionMinutes,
    equationOfTimeMinutes: eot,
    totalCorrectionMinutes,
    rawMinutes,
    normalizedMinutes,
    dayOffset,
    hour,
    minute,
    second,
    branch: branchFromSolarMinutes(normalizedMinutes),
  };
}

/* * 실제 태양일과 야자시 장르 규칙을 입력일을 기준으로 최종 배반일의 오프셋에 병합합니다. */
export function resolveZiweiDayOffset(
  solar: Pick<TrueSolarTimeResult, 'dayOffset' | 'normalizedMinutes' | 'branch'>,
  lateZishi: LateZishiRule = 'next-day',
): number {
  // day-cur-time-next changes the hour-pillar convention, not the Ziwei
  // main-chart date. Only the explicit next-day rule advances this date.
  const nextDayRule = lateZishi === 'next-day';
  const isLateZishi = solar.branch === 0 && solar.normalizedMinutes >= 1380;

  if (solar.dayOffset < 0 && isLateZishi) {
    return nextDayRule ? solar.dayOffset + 1 : solar.dayOffset;
  }
  if (solar.dayOffset !== 0) return solar.dayOffset;
  if (isLateZishi) return nextDayRule ? 1 : 0;
  return 0;
}

export function formatTrueSolarClock(solar: Pick<TrueSolarTimeResult, 'hour' | 'minute' | 'second'>, withSeconds = false): string {
  const base = `${String(solar.hour).padStart(2, '0')}:${String(solar.minute).padStart(2, '0')}`;
  return withSeconds ? `${base}:${String(solar.second).padStart(2, '0')}` : base;
}

export function formatSignedMinutes(value: number): string {
  const rounded = Math.round(value);
  return `${rounded > 0 ? '+' : ''}${rounded}`;
}
