import type { Palace, ZiweiChart } from './types';

export type YunxianView = 'mingpan' | 'daxian' | 'liunian' | 'xiaoxian' | 'liuyue' | 'liuri' | 'liushi';

/* * 독립적인 동한 선택을 위한 전용 센티널; -1은 "실제 대한 소유 없음"을 위해 예약되어 있습니다. */
export const CHILDHOOD_DAXIAN_INDEX = -2;

// 소한 및 유년은 선택된 유년(세는나이)에 따라 대한에 속하므로 둘 다 FLOW_VIEWS에 속합니다.
const FLOW_VIEWS = new Set<YunxianView>(['liunian', 'xiaoxian', 'liuyue', 'liuri', 'liushi']);

function isValidDaXianIndex(chart: ZiweiChart, index: number | null | undefined): index is number {
  return typeof index === 'number'
    && Number.isInteger(index)
    && index >= 0
    && index < chart.daXians.length;
}

/* * 세는나이를 누르면 해당 제품이 속한 대한을 확인할 수 있습니다. 대한 연령대는 처음부터 끝까지 포괄적으로 처리됩니다. */
export function getDaXianIndexForAge(chart: ZiweiChart, age: number): number {
  if (!Number.isFinite(age)) return -1;
  const safeAge = Math.trunc(age);
  return chart.daXians.findIndex(dx => safeAge >= dx.startAge && safeAge <= dx.endAge);
}

/* * 음력유년을 세는나이로 변환한 후 해당 대한을 찾습니다. */
export function getDaXianIndexForYear(chart: ZiweiChart, year: number): number {
  if (!Number.isFinite(year)) return -1;
  // UI의 liunianYear는 음력유년입니다. 봄 축제 이전에 태어난 사람들의 경우 음력생년는 양력보다 1 작을 수 있습니다.
  // 세는나이는 음력 연도 차이를 사용해야 합니다. 그렇지 않으면 전체 대한 경계 세트가 1년 뒤쳐집니다.
  return getDaXianIndexForAge(chart, Math.trunc(year) - chart.lunarInfo.lunarYear + 1);
}

/* * 세는나이부터 시작하는 대한은 해당 음력유년로 변환됩니다. */
export function getDaXianStartYear(chart: ZiweiChart, index: number): number | null {
  if (!isValidDaXianIndex(chart, index)) return null;
  return chart.lunarInfo.lunarYear + chart.daXians[index].startAge - 1;
}

/* * 돌아가기 대한은 양력유년과 완전히 일치합니다. 일반 대한은 정확히 10년이 되었습니다. */
export function getDaXianYears(chart: ZiweiChart, index: number): number[] {
  if (!isValidDaXianIndex(chart, index)) return [];
  const dx = chart.daXians[index];
  const startYear = getDaXianStartYear(chart, index);
  if (startYear === null) return [];
  return Array.from({ length: dx.endAge - dx.startAge + 1 }, (_, offset) => startYear + offset);
}

/* * 주류 배반 구경은 1.. 제한 -1 세는나이 이전의 첫 번째 실제 대한을 독립적인 동한로 취급합니다. */
export function getChildhoodYears(chart: ZiweiChart): number[] {
  const firstStartAge = chart.daXians[0]?.startAge;
  if (!Number.isFinite(firstStartAge) || firstStartAge <= 1) return [];
  return Array.from({ length: firstStartAge - 1 }, (_, offset) => chart.lunarInfo.lunarYear + offset);
}

export function isChildhoodYear(chart: ZiweiChart, year: number): boolean {
  const age = Math.trunc(year) - chart.lunarInfo.lunarYear + 1;
  const firstStartAge = chart.daXians[0]?.startAge;
  return Number.isFinite(firstStartAge) && age >= 1 && age < firstStartAge;
}

/* *
 * 동한는 본명명궁을 기준으로 지지(세는나이 1–5)에서 오프셋됩니다.
 * 궁궐 바닥에 있는 연도별 "큰 운명"의 금본위판 4개 세는나이1=본명명궁에 이어 -4/-1/+3/+4와 동일한 세트입니다.
 * 양남 Hai → Wei → Wu → You; 음남 하이 → 웨이; 양녀 Hai → Wei → Wu → You → Chou; 봄의 시작 음녀 Wei → Mao → Yin → Si → You. */
const CHILDHOOD_MING_OFFSET: Record<number, number> = {
  1: 0,
  2: -4,
  3: -5,
  4: -2,
  5: 2,
};

/* *
 * 동한의 위대한 운명은 본명 궁에 있습니다(궁 줄기를 얻은 다음 SiHuaByStem / Dachang Daqu를 얻는 데 사용됨).
 * 음력유년 및 세는나이 1–5 사용: 이동하려면 CHILDHOOD_MING_OFFSET을 누르세요.
 * 연도 없음 또는 부외 연도: 음녀는 명궁−2(2026=Si 고정 유지)로 대체되고 나머지는 본명명궁입니다. */
export function getChildhoodDaXianPalace(chart: ZiweiChart, year?: number): Palace | null {
  if (getChildhoodYears(chart).length === 0) return null;
  if (year != null) {
    const age = Math.trunc(year) - chart.lunarInfo.lunarYear + 1;
    if (age in CHILDHOOD_MING_OFFSET) {
      const branch = ((chart.mingGongBranch + CHILDHOOD_MING_OFFSET[age]) % 12 + 12) % 12;
      return chart.palaces.find((p) => p.branch === branch) ?? null;
    }
  }
  const yinFemale = chart.yinYangGender === '阴女'
    || (chart.birthInfo.gender === 'female' && chart.lunarInfo.yearStem % 2 === 1);
  const branch = yinFemale
    ? ((chart.mingGongBranch - 2) % 12 + 12) % 12
    : chart.mingGongBranch;
  return chart.palaces.find((p) => p.branch === branch) ?? null;
}

/* *
 * 모든 배송 인터페이스에서 공유되는 대한 소스:
 * - 대한 보기는 사용자가 선택한 대한을 사용합니다.
 * - 유년, 유월, 스트리밍 데이 및 스트리밍은 선택한 유년이 실제로 속한 대한을 사용합니다.
 * - 본명 또는 예외 입력은 현재 대한로 대체됩니다. */
export function resolveEffectiveDaXianIndex(
  chart: ZiweiChart,
  view: YunxianView,
  liunianYear: number,
  selectedDaXianIndex?: number | null,
): number {
  if (view === 'daxian' && isValidDaXianIndex(chart, selectedDaXianIndex)) {
    return selectedDaXianIndex;
  }
  if (view === 'daxian' && selectedDaXianIndex === CHILDHOOD_DAXIAN_INDEX && getChildhoodYears(chart).length > 0) {
    return CHILDHOOD_DAXIAN_INDEX;
  }

  if (FLOW_VIEWS.has(view)) {
    const yearIndex = getDaXianIndexForYear(chart, liunianYear);
    // -1은 동한를 의미하거나 생성된 대한 범위를 초과함을 의미합니다. 실제 전류 대한로 오류가 발생할 수 없습니다.
    return isValidDaXianIndex(chart, yearIndex) ? yearIndex : -1;
  }

  if (isValidDaXianIndex(chart, chart.currentDaXianIndex)) return chart.currentDaXianIndex;
  // 실제 동한가 currentDaXianIndex=-1인 경우; 첫 번째 실제 대한은 값을 위해 실수로 설정될 수 없습니다.
  return -1;
}
