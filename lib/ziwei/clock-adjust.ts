/* *
 * 생년월일 시간 이동(서머타임/타임존이 지금과 다름) - 순수 기능, 배반 엔진 레이어.
 *
 * 목적 : 출생 당일 현지 지역에서 일광 절약 시간제를 시행하거나(예: 중국 본토의 1986~1991년 여름, dst-cn.ts 참조), 해당 연도의 시간대가 현재 시간과 다른 경우,
 * 사용자가 보고하는 내용은 해당 연도의 시계 수치인 경우가 많습니다. 배반 구경은 표준시(true-solar-time.ts)에 따라 계산되므로 먼저 시계 판독값을 표준시로 변환해야 합니다.
 * 버튼은 사용자가 클릭하여 취소할 수 있도록 만드는 것을 권장합니다. **자동으로 변경하지 마십시오**: 프로그램은 사용자가 현재 연도의 시계 판독값을 채웠는지 또는 변환된 표준 시간을 채웠는지 알 수 없습니다.
 * (주류 배반 소프트웨어는 메시지만 표시하고 자동으로 축소하지 않습니다. dst-cn.ts 파일 헤더 참조).
 *
 * 변환 방향: 표준시 = 시계 판독값 - (해당 실제 오프셋 - 표준 오프셋)
 * · 중국 본토 1986-1991 일광 절약 시간: 차이 +60분 → 마이너스 60;
 * · 해외 일광 절약 시간제(예: 미국의 경우 -4:00 대 -5:00 → 마이너스 60)도 마찬가지입니다. 당시의 시간대는 지금보다 느렸습니다(예: 1982년 이전에는 말레이시아 +7:30, 현재 +8:00). 차이는 -30 → 30을 더합니다.
 *
 * 날짜가 날짜를 넘어가는 경우(결과가 0:00-23:59 사이가 아닌 경우) null이 되며 사용자에 대해 날짜가 변경되지 않습니다: 음력 월 크기, 윤달, 야자시 날짜 변경 인터리빙,
 * 자동 날짜 교차는 수정하기 쉽고 사용자가 날짜와 시간을 수동으로 변경할 수 있습니다. */

export interface ClockTime { clockHour: string; clockMinute: string }

/* * 올해의 시계 읽기 → 표준 시간을 이동하는 분 수(실제 및 표준은 모두 UTC를 기준으로 한 분 오프셋, 동서 마이너스) */
export function clockToStandardDelta(actualOffsetMin: number, stdOffsetMin: number): number {
  return stdOffsetMin - actualOffsetMin;
}

/* * 시계 시간 이동 deltaMin 분; 시간/분이 채워지지 않았거나 정수가 아니거나 교대가 일수에 걸쳐 있는 경우 null이 제공됩니다. */
export function shiftClock(t: ClockTime, deltaMin: number): ClockTime | null {
  if (t.clockHour === '' || t.clockMinute === '') return null;
  const h = Number(t.clockHour); const m = Number(t.clockMinute);
  if (!Number.isInteger(h) || !Number.isInteger(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
  if (!Number.isInteger(deltaMin) || deltaMin === 0) return null;
  const total = h * 60 + m + deltaMin;
  if (total < 0 || total >= 24 * 60) return null;
  return { clockHour: String(Math.floor(total / 60)), clockMinute: String(total % 60) };
}

/* * "HH:MM" 두 자리 숫자는 0으로 채워집니다. */
export function formatClock(t: ClockTime): string {
  return `${t.clockHour.padStart(2, '0')}:${t.clockMinute.padStart(2, '0')}`;
}
