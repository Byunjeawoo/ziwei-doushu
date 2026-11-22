/* *
 * 회귀: 윤달 소유권 정책의 런타임 검증 및 4개 조리개 상호성.
 *
 * `generateChart` / `resolveEffectiveLunarDate`는 런타임 JavaScript 및 JSON API에서 직접 호출할 수 있으며,
 * `LunarMonthPolicy`의 리터럴 결합 유형은 쓸모가 없습니다. 철자가 틀린 정책은 if/else 체인의 끝에 떨어졌을 것입니다.
 * "이번 달로 돌아가기" 배반를 조용히 누르면 `chart.birthInfo.leapMonthPolicy` 직렬화로 오류 값이 전파됩니다.
 * 성별 확인과 동일한 계열(#38): 런타임 시 유형이 보호되지 않습니다.
 *
 * 구경 오라클 테이블(테스트된 구현의 분기를 참조하지 않고 README/주석의 4구경 정의에서 독립적으로 기록됨):
 * 윤달 내의 특정 날짜에 대해(rawLunarDay는 d로 기록됨):
 * 원월 → 실제 윤월(isLeapMonth=true, 월은 변경되지 않음)
 * prev-month → 이번 달로 돌아가기 (isLeapMonth=false, 해당 월은 변경되지 않음)
 * 분할 → d ≤ 15는 이번 달로 반환, d > 15는 다음 달로 반환 (isLeapMonth=false)
 * 다음달 → 다음달로 복귀(월+1, isLeapMonth=false)
 *
 * 심각하게 생각할 가치가 있는 이유: 윤달는 소유권이 1개월 남았고, 명궁/신궁/사화는 모두 잘못되었으며, 정책 철자가 잘못되었습니다.
 * 원래는 보고된 오류가 없었습니다. */
import { generateChart, resolveEffectiveLunarDate } from '../../lib/ziwei/algorithm';

const POLICIES = ['split', 'next-month', 'prev-month', 'origin-month'] as const;

/* * 2025년 윤년 6월(양력 2025-07-25 ~ 2025-08-22) 매월 상반기, 하반기 각 1일씩 수강하세요. */
const LEAP_MONTH_DATES: Array<[number, number, number]> = [
  [2025, 8, 10], // 윤달의 열흘(상월)
  [2025, 8, 18], // 闰六月下旬（下半月）
];

let bad = 0;
const fail = (m: string) => { bad++; console.log(`  ❌ ${m}`); };

/* ── ① 잘못된 정책이 현장에 있어야 합니다. RangeError ──────────────────────────── */
{
  console.log("① 유효하지 않은 정책은 그 자리에서 거절됩니다.");
  const invalid: unknown[] = ['nextmonth', 'next-monthh', '', 'NEXT-MONTH', null, 42, true];
  for (const p of invalid) {
    try {
      resolveEffectiveLunarDate(2025, 8, 10, p as never);
      fail(`policy=${JSON.stringify(p)}거부되지 않음(이번 달 배반로 돌아가려면 자동 누르기)`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!(e instanceof RangeError) || !msg.includes('leapMonth policy')) {
        fail(`policy=${JSON.stringify(p)}발생한 오류 유형/정보가 올바르지 않습니다.${msg}`);
      }
    }
  }
  if (!bad) console.log("✅ 유효하지 않은 값 7개 모두 RangeError 및 LeapMonth 정책이라는 정보");
}

/* ── ② 명시적 정의되지 않음 = 기본값 사용, 오류가 보고되지 않음 ─────────────────────── */
{
  console.log("② 명시적 undefed는 기본 이전 월을 사용합니다.");
  try {
    const r = resolveEffectiveLunarDate(2025, 8, 10);
    console.log("✅ 기본 구경 사용 가능");
    void r;
  } catch (e) {
    fail(`기본 호출이 실수로 거부되었습니다.${e instanceof Error ? e.message : String(e)}`);
  }
}

/* ── ③ 4개의 구경은 윤달 내에서 서로 다르며, 항목별 오라클 테이블 항목과 일치합니다. ────────────────────── */
{
  console.log("③ 4구경은 항목별 오라클 테이블과 일치함(윤6월 상·하반기 각 1일)");
  for (const [y, m, d] of LEAP_MONTH_DATES) {
    for (const policy of POLICIES) {
      const r = resolveEffectiveLunarDate(y, m, d, policy);
      if (r.rawLunarMonth !== -6) {
        fail(`${y}-${m}-${d}윤달이 아님(rawLunarMonth=${r.rawLunarMonth}), Oracle 테이블 벤치마크가 실패합니다.`);
        continue;
      }
      const day = r.rawLunarDay;
      // Oracle 테이블: 네 가지 구경 정의에 따라 독립적으로 기록됨
      const want =
        policy === 'origin-month' ? { month: 6, leap: true }
        : policy === 'prev-month' ? { month: 6, leap: false }
        : policy === 'next-month' ? { month: 7, leap: false }
        : (day > 15 ? { month: 7, leap: false } : { month: 6, leap: false });
      if (r.lunarMonth !== want.month || r.isLeapMonth !== want.leap) {
        fail(`${policy}@ 도약 6월${day}일 → 집에 가져가기 (월${r.lunarMonth}, 도약=${r.isLeapMonth})는 (월)이어야 합니다.${want.month}, 도약=${want.leap})`);
      }
    }
  }
  if (!bad) console.log("✅ 구경 4개 × 날짜 2개는 모두 오라클 테이블과 일치합니다.");
}

/* ── ④ generateChart end-to-end: 법적 정책 정상 배반 및 다시 쓰기 ──────────── */
{
  console.log("④ generateChart end-to-end(법적 정책 배반 및 LeapMonthPolicy 다시 쓰기)");
  for (const policy of POLICIES) {
    try {
      const chart = generateChart(
        { year: 2025, month: 8, day: 10, hour: 5, gender: 'female' },
        { leapMonth: policy },
      );
      const echoed = (chart.birthInfo as { leapMonthPolicy?: string }).leapMonthPolicy;
      if (echoed !== policy) fail(`policy=${policy}쓰기 저장이 일치하지 않습니다:${String(echoed)}`);
      if (!chart.palaces || chart.palaces.length !== 12) fail(`policy=${policy}배반 결과가 비정상입니다.`);
    } catch (e) {
      fail(`policy=${policy}배반에서 오류가 발생합니다.${e instanceof Error ? e.message : String(e)}`);
    }
  }
  if (!bad) console.log("✅ 4구경 엔드 투 엔드 배반는 정상이며, LeapMonthPolicy 다시 쓰기는 일관됩니다.");
}

if (bad) {
  console.error(`\n❌ ${bad}항목이 일치하지 않음 - 윤달 귀속 정책 확인 또는 구경이 정의와 일치하지 않아 전체 디스크가 잘못 정렬됩니다.`);
  process.exit(1);
}
console.log("✅ 모두 통과됨: 잘못된 정책이 현장에서 거부되었습니다. 네 가지 구경이 서로 다르며 정의와 일치합니다.");
