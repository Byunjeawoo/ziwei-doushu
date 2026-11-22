/* *
 * 음력 ⇄ 양력 변환 - **달력만, 명리학은 아님**.
 *
 * ★ 2026-08-05 추출 이유 :
 * 1) 음력 버전의 네이티브 앱은 Swift 측에 lunar-javascript가 없기 때문에 웹페이지 레이어로 돌아가야 합니다.
 * 변환 기능. `POST /api/lunar-to-solar`를 사용하면 기본 HTTP가 양력 날짜를 얻을 수 있습니다.
 * 이는 WebView를 해체하는 데 있어 실질적인 장애물입니다.
 * 2) 변환 구경은 이전에는 `lib/ziwei/share.ts`(형태 전용)에서만 사용할 수 있었습니다. 인터페이스를 다시 복사하세요.
 * 윤달 규칙은 2세트가 될 예정이므로 여기서 일률적으로 수신되며, share.ts가 이 모듈을 호출하도록 변경됩니다.
 *
 * Caliber(변경 없이 lunar-javascript 및 share.ts의 원래 작성 방법 사용):
 * · 윤달는 **음수 월**로 표시됩니다: 윤월 5월 = -5.
 * · 월의 일수와 윤달가 존재하는지 여부는 항상 `LunarMonth` 테이블을 확인하고 양력의 월 길이를 추측하지 마십시오.
 *
 * ⚠️ 여기에서는 배반 / 시진 / 진태양시 / 사화 라인이 **허용되지 않습니다**.
 * lib/ziwei/algorithm.ts, /api/generate에 속한 것들은 쉽게 삽입하지 마세요. */
import { Lunar, LunarMonth } from 'lunar-javascript';

export interface SolarDate {
  year: number;
  month: number;
  day: number;
}

/* * 승인 연도 범위는 /api/generate와 일치하며 그 이상은 직접적으로 불법입니다(극단적인 해에는 음력 테이블을 신뢰할 수 없음). */
export const LUNAR_YEAR_MIN = 1900;
export const LUNAR_YEAR_MAX = 2050;

function isIntInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}

/* *
 * 음력 연도(29 또는 30) 중 이번 달의 일수입니다.
 * 해당 월이 존재하지 않습니다. (예: 해당 연도에는 윤달이 전혀 없는 4월이 있었습니다.) 돌아가기 0. */
export function lunarMonthDayCount(year: number, month: number, isLeapMonth = false): number {
  if (!isIntInRange(year, LUNAR_YEAR_MIN, LUNAR_YEAR_MAX) || !isIntInRange(month, 1, 12)) return 0;
  try {
    const lunarMonth = LunarMonth.fromYm(year, isLeapMonth ? -month : month);
    const dayCount = lunarMonth?.getDayCount();
    return typeof dayCount === 'number' && Number.isInteger(dayCount) && dayCount > 0 ? dayCount : 0;
  } catch {
    return 0;
  }
}

/* * 음력 연도의 윤달 월(1-12); 아니요 윤달돌아가기 0 */
export function leapMonthOfLunarYear(year: number): number {
  if (!isIntInRange(year, LUNAR_YEAR_MIN, LUNAR_YEAR_MAX)) return 0;
  for (let month = 1; month <= 12; month++) {
    if (lunarMonthDayCount(year, month, true) > 0) return month;
  }
  return 0;
}

/* * 음력라는 날짜가 실제로 존재하는지 여부(윤달가 존재하는지, 당월에 이 날이 존재하는지 포함) */
export function isValidLunarDate(year: number, month: number, day: number, isLeapMonth = false): boolean {
  if (!isIntInRange(day, 1, 30)) return false;
  const dayCount = lunarMonthDayCount(year, month, isLeapMonth);
  return dayCount > 0 && day <= dayCount;
}

/* *
 * 음력 → 양력. 입력이 잘못된 경우(연도가 범위를 벗어남/윤달가 존재하지 않음/월의 날짜가 존재하지 않음) 항상 돌아가기 null이 됩니다.
 * **인접한 날짜로 자동으로 스크롤하지 마십시오** - 그러면 사용자가 알지 못한 채 잘못된 디스크를 대기열에 추가하게 됩니다. */
export function lunarToSolar(year: number, month: number, day: number, isLeapMonth = false): SolarDate | null {
  if (!isValidLunarDate(year, month, day, isLeapMonth)) return null;
  try {
    const solar = Lunar.fromYmd(year, isLeapMonth ? -month : month, day).getSolar();
    const result = { year: solar.getYear(), month: solar.getMonth(), day: solar.getDay() };
    if (!Number.isInteger(result.year) || !Number.isInteger(result.month) || !Number.isInteger(result.day)) return null;
    return result;
  } catch {
    return null;
  }
}
