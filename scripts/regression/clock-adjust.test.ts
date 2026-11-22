/* *
 * 반환: 출생 시계 시간 이동(lib/ziwei/clock-adjust.ts) 및 해외 시간대 진태양시(true-solar-time.ts의 utcOffsetMinutes).
 *
 * · 번역 방향: 표준시 = 시계 판독값 - (연도의 실제 오프셋 - 표준 오프셋); 날짜에 따라 변경되지 않습니다(null로 제공됨).
 * · 중국에서 utcOffsetMinutes를 통과하지 못한 일일 결과는 480을 통과한 것과 같습니다. 해외에서는 출생지 시간대의 중심 자오선에 따라 경도가 수정됩니다. */
import { clockToStandardDelta, formatClock, shiftClock } from '../../lib/ziwei/clock-adjust';
import { calculateTrueSolarTime } from '../../lib/ziwei/true-solar-time';

let fails = 0;
function ok(name: string, cond: boolean) {
  console.log(`${cond ? '✓' : '✗'} ${name}`);
  if (!cond) fails++;
}
const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

ok("중국 본토 일광 절약 시간(+9:00 대 +8:00) → 마이너스 60", clockToStandardDelta(540, 480) === -60);
ok("동부 일광 절약 시간(-4:00 대 -5:00) → 마이너스 60", clockToStandardDelta(-240, -300) === -60);
ok("1982년 이전 말레이시아(+7:30 대 +8:00) → 30 추가", clockToStandardDelta(450, 480) === 30);

ok("14:30 - 60 → 13:30", eq(shiftClock({ clockHour: '14', clockMinute: '30' }, -60), { clockHour: '13', clockMinute: '30' }));
ok("1:05 - 60 → 0:05", eq(shiftClock({ clockHour: '1', clockMinute: '5' }, -60), { clockHour: '0', clockMinute: '5' }));
ok("0:30 - 60 전날과 교차 → null", shiftClock({ clockHour: '0', clockMinute: '30' }, -60) === null);
ok("8:15 더하기 30 → 8:45", eq(shiftClock({ clockHour: '8', clockMinute: '15' }, 30), { clockHour: '8', clockMinute: '45' }));
ok("23:45 다음날 30추가 → null", shiftClock({ clockHour: '23', clockMinute: '45' }, 30) === null);
ok("채워지지 않음 → null", shiftClock({ clockHour: '', clockMinute: '0' }, -60) === null);
ok("Shift 0분 → null", shiftClock({ clockHour: '9', clockMinute: '0' }, 0) === null);
ok("formatClock 제로 패딩", formatClock({ clockHour: '7', clockMinute: '5' }) === '07:05');

// 국내 : 오프셋 전송 안함 = 480 전송, 일일 불시 점검 결과는 정확히 같음
let same = true;
for (let m = 1; m <= 12; m++) {
  for (const d of [1, 15, 28]) {
    const base = { year: 1990, month: m, day: d, clockHour: 9, clockMinute: 16, longitude: 116.4 };
    if (!eq(calculateTrueSolarTime(base), calculateTrueSolarTime({ ...base, utcOffsetMinutes: 480 }))) same = false;
  }
}
ok("중국에서는 utcOffsetMinutes가 통과되지 않아 결과가 480과 동일합니다.", same);

// 해외 : 뉴욕(경도 -74.0, -5:00 EST, 중심 자오선 -75°) → 경도 보정(-74 − (-75)) × 4 = +4분
const ny = calculateTrueSolarTime({ year: 1995, month: 1, day: 15, clockHour: 14, clockMinute: 0, longitude: -74, utcOffsetMinutes: -300 });
ok("뉴욕 경도 보정 +4분", Math.abs(ny.longitudeCorrectionMinutes - 4) < 1e-9);

if (fails) { console.error(`✗ 시계 시간 이동 반환${fails}해당 항목이 통과되지 않았습니다.`); process.exit(1); }
console.log("✓ 모든 시계 시간 이동 반환이 통과되었습니다.");
