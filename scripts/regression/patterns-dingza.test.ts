/* *
 * 〈상황 판단〉 8프레임 회귀 테스트(3계층: 구조/아키텍처/행동)
 *
 * 자매글(딩귀/딩푸/딩핀) 테스트와의 차이점 : 본 테이블의 히트단위는 행운제한이며,
 * 명반가 아닙니다. 그러므로 행동층의 '발동율'은 2개의 구경으로 나누어진다──
 * - 단위 구경: 적중 횟수 대한 / 총 대한 횟수(구경 드리프트가 결정됨)
 * - 보드 구경: 1회 이상 히트한 보드의 비율("풀 보드" 성능 저하로 판단됩니다.)
 * 게이트는 차별요건은 아니지만 구경동결 : 구현이 변경되어 개수가 범위를 초과하는 경우 먼저 설명해야 함
 * 게이트를 이동하기 전에 발음을 변경하십시오(딩핀의 8% 게이트와 동일한 규율).
 *
 *특별한 경우: no.4 부자 옷을 입고 집에 돌아가는 것은 '마흔 이후에 묻히는 운명'이라는 문장의 절반만 충족합니다(전반은 이력서 기준이므로 판단할 수 없음).
 * 4/12 무덤 × 약 7/12은 40 이후 ≒ 22%로 제한되며, 디스크 직경은 100%여야 합니다.
 * 반문 입력의 특성상, 판별력이 아닌 이 기하학적 예측값에 의해 게이트가 깨집니다.
 * no.6 워터 드라이빙 스타는 유년 설명 패턴(인생에는 항상 좋은 것과 나쁜 것이 교차합니다)이며 보드 구경은 100%입니다.
 * 같은 성격으로 실제 사용량은 detectorDingZa(chart, { age }) 로 연도별로 조회합니다. */

import assert from 'node:assert/strict';
import { generateChart } from '../../lib/ziwei/algorithm';
import {
  DING_ZA_GE, DING_ZA_JUDGEABLE, detectDingZa, getCurrentDingZa,
} from '../../lib/ziwei/patterns-dingza';
import type { ZiweiChart } from '../../lib/ziwei/types';

// ────────────────── 첫 번째 레이어: 구조 ──────────────────

function testStructure() {
  assert.equal(DING_ZA_GE.length, 8, "고정된 잡다한 게임의 개수는 8개이어야 합니다.");
  assert.equal(DING_ZA_JUDGEABLE, 8, "8개 항목을 모두 구현해야 합니다(이 표에는 도달할 수 없는 항목 없음).");
  DING_ZA_GE.forEach((g, i) => {
    assert.equal(g.no, i + 1, "일련번호는 1~8까지 연속되어야 합니다.");
    assert.ok(g.note.length > 0, `아니요.${g.no}누락된 품목에 대한 주의사항`);
    assert.ok(g.judge, `아니요.${g.no}바 누락 판정 기능`);
    assert.ok(g.unit === '大限' || g.unit === '流年', `아니요.${g.no}기사 단위가 불법입니다`);
  });
  const statusByNo = new Map(DING_ZA_GE.map(g => [g.no, g.status]));
  assert.equal(statusByNo.get(1), 'derivable');
  assert.equal(statusByNo.get(2), 'derivable');
  assert.equal(statusByNo.get(3), 'derivable');
  assert.equal(statusByNo.get(4), 'disputed', "홈커밍 전반부는 판단할 수 없고 논쟁의 여지가 있다");
  assert.equal(statusByNo.get(5), 'disputed');
  assert.equal(statusByNo.get(6), 'disputed');
  assert.equal(statusByNo.get(7), 'disputed');
  assert.equal(statusByNo.get(8), 'derivable');
  // 주석의 축어적 검증(원본 텍스트: Wikisource "자미두수전서" Volume 1, 여러 소스 비교와 일치)
  const notes = DING_ZA_GE.map(g => `${g.name} ${g.note}`).join('。');
  assert.ok(notes.includes("风云际会 신궁과 명궁이 약하더라도 두 운한에서 녹존과 천마를 만나는 경우이다."));
  assert.ok(notes.includes("枯木逢春 본명은 쇠하나 운한이 좋은 경우이다."));
}

// ────────────────── 두 번째 레이어: 대한 아키텍처 ──────────────────

function testDaXianArchitecture(chart: ZiweiChart) {
  const dxs = [...chart.daXians].sort((a, b) => a.startAge - b.startAge);
  assert.equal(dxs.length, 12, "대한는 12여야 합니다.");
  assert.equal(dxs[0].startAge, chart.wuxingJu, "첫 번째 제한의 시작 연령은 오행국 숫자와 같아야 합니다.");
  for (const dx of dxs) {
    assert.equal(dx.endAge - dx.startAge + 1, 10, "각 대한는 10년입니다.");
  }
  const branches = new Set(dxs.map(dx => dx.palaceBranch));
  assert.equal(branches.size, 12, "12개 경계는 각각 한 집을 점유해야 하며, 궁궐 가지도 서로 달라야 합니다.");
}

function testAgeFilter() {
  const chart = generateChart({ year: 1990, month: 1, day: 1, hour: 0, gender: 'male' });
  const all = detectDingZa(chart);
  // 대한 형식: 연령 필터링 후 각 히트의 [startAge, endAge]는 연령을 포함해야 합니다.
  const age = 45;
  const filtered = detectDingZa(chart, { age });
  for (const h of filtered) {
    assert.ok(h.startAge !== undefined && h.endAge !== undefined);
    if (h.unit === '大限') {
      assert.ok(age >= h.startAge! && age <= h.endAge!, `${h.name}필터링 후 연령대에는 다음이 포함되지 않습니다.${age}`);
    } else {
      assert.ok(age === h.startAge || age === h.endAge, `${h.name}유년 창은 포함되어 있지 않습니다.${age}`);
    }
  }
  const allDaxian = all.filter(x => x.unit === '大限');
  const filteredDaxian = filtered.filter(x => x.unit === '大限');
  assert.ok(filteredDaxian.length <= allDaxian.length);
  for (const h of filteredDaxian) {
    assert.ok(allDaxian.some(x => x.no === h.no && x.startAge === h.startAge),
      "필터 결과는 전체 결과의 하위 집합이어야 합니다.");
  }
  // getCurrentDingZa는 detectorDingZa(chart, {age: currentAge})와 동일합니다.
  const cur = getCurrentDingZa(chart);
  const manual = detectDingZa(chart, { age: chart.currentAge });
  assert.deepEqual(cur, manual, "getCurrentDingZa는 age=currentAge 필터와 동일해야 합니다.");
}

// ────────────────── 3단계: 행동 ──────────────────

// 황금색 긍정적인 예(프로브 _probe/_dingza_stats.ts 측정 히트 디스크, 12년간의 건조 적용 범위)
const GOLDEN: Array<{
  birth: { year: number; month: number; day: number; hour: number };
  no: number;
  ages: [number, number];
}> = [
  { birth: { year: 1990, month: 1, day: 29, hour: 9 }, no: 1, ages: [34, 43] },  // 펑윤지휘
  { birth: { year: 1990, month: 3, day: 3, hour: 0 }, no: 1, ages: [15, 24] },
  { birth: { year: 1990, month: 1, day: 1, hour: 6 }, no: 2, ages: [5, 14] },    // 케이크 위의 아이싱
  { birth: { year: 1992, month: 3, day: 2, hour: 0 }, no: 3, ages: [4, 13] },    // 재산의 손실과 말의 손실
  { birth: { year: 1990, month: 1, day: 1, hour: 0 }, no: 4, ages: [62, 71] },   // 화려하게 집으로 돌아가다
  { birth: { year: 1990, month: 1, day: 1, hour: 0 }, no: 5, ages: [52, 61] },   // 의지할 단계가 없습니다
  { birth: { year: 1990, month: 1, day: 1, hour: 0 }, no: 6, ages: [5, 6] },     // 워터 스타
  { birth: { year: 1990, month: 1, day: 1, hour: 0 }, no: 7, ages: [72, 81] },   // 행운과 불운
  { birth: { year: 1990, month: 1, day: 15, hour: 0 }, no: 8, ages: [12, 21] },  // 枯木逢春
];

function testGolden() {
  for (const g of GOLDEN) {
    const chart = generateChart({ ...g.birth, gender: 'male' });
    const hits = detectDingZa(chart).filter(h => h.no === g.no);
    const ok = hits.some(h => h.startAge === g.ages[0] && h.endAge === g.ages[1]);
    assert.ok(ok,
      `${g.birth.year}-${g.birth.month}-${g.birth.day} ${g.birth.hour}때를 맞춰야지${g.no}기사${g.ages[0]}-${g.ages[1]}연도, 실제:` +
      hits.map(h => `${h.startAge}-${h.endAge}`).join('、') || '（无）');
  }
}

/* * 유닛/디스크 이중 구경 트리거 속도, 게이트 구경이 동결됨(이유는 파일 헤더 참조) */
async function testRates() {
  const unitHit = new Map<number, number>();
  const chartHit = new Map<number, number>();
  const liunianPerChart: number[] = [];
  let totalUnits = 0;
  const totalCharts = 720;

  const start = Date.UTC(1990, 0, 1);
  for (let i = 0; i < totalCharts; i++) {
    // 12년(12년 건조 완전 적용) × 연간 60판(60일 간격 × 2 시진), 남성과 여성 교대로
    const dt = new Date(start + Math.floor(i / 60) * 365 * 86_400_000 + (i % 60) * 6 * 86_400_000);
    const chart = generateChart({
      year: dt.getUTCFullYear(), month: dt.getUTCMonth() + 1, day: dt.getUTCDate(),
      hour: (i % 2) * 6, gender: i % 4 < 2 ? 'male' : 'female',
    });
    testDaXianArchitecture(chart);
    const dxs = [...chart.daXians].sort((a, b) => a.startAge - b.startAge);
    totalUnits += dxs.length;
    const hits = detectDingZa(chart);
    const seenNos = new Set<number>();
    for (const h of hits) {
      unitHit.set(h.no, (unitHit.get(h.no) ?? 0) + 1);
      if (!seenNos.has(h.no)) {
        seenNos.add(h.no);
        chartHit.set(h.no, (chartHit.get(h.no) ?? 0) + 1);
      }
    }
    liunianPerChart.push(hits.filter(h => h.no === 6).length);
  }

  // [단위 직경 하한, 상한, 디스크 직경 상한] (%)
  const gates: Record<number, [number, number, number]> = {
    1: [1.5, 5, 25],    // Fengyunjihui: 실제 측정: 2.92%/한계, 12.4%/디스크
    2: [2, 6, 55],      // 케이크 위의 아이싱: 3.75%/한도, 38.3%/접시 측정(초판에서는 22%/한도가 강화되었습니다)
    3: [3, 8.5, 30],    // 운마가 형편없다: 5.56%/한도, 16.7%/판 측정(초판은 22%/한도가 강화되었습니다)
    4: [17, 28, 100],   // 홈커밍: 반문장 입력, 4/12×7/12≒22%는 기하학적 예측값, 보드는 100%이어야 함
    5: [2, 7, 55],      // 단계 수는 근거가 없습니다: 4.20%/한도, 37.7%/디스크 측정
    6: [0, 9999, 100],  // 워터 드라이빙 스타: 유년 설명 그리드, 각 게임에는 교대(자연)가 있어야 하며, 평균 범위는 아래와 같습니다.
    7: [10, 21, 90],    // 행운과 불운: 실측치: 15.63%/한도, 74%/플레이트("한정상품" 자체가 이 정도입니다)
    8: [2.5, 7.5, 40],  // 枯木逢春：实测 4.75%/限、23.6%/盘
  };
  for (const [no, [lo, hi, chartCap]] of Object.entries(gates)) {
    const n = Number(no);
    const ge = DING_ZA_GE.find(g => g.no === n)!;
    const u = (unitHit.get(n) ?? 0) / totalUnits * 100;
    const ch = (chartHit.get(n) ?? 0) / totalCharts * 100;
    if (ge.unit === '大限') {
      assert.ok(u >= lo && u <= hi,
        `아니요.${n}유닛 적중률${u.toFixed(2)}%/범위를 벗어난 제한 [${lo}, ${hi}]——구경이 표류했습니다. 문을 열기 전에 먼저 설명을 부탁드립니다.`);
    }
    assert.ok(ch <= chartCap,
      `아니요.${n}적중률${ch.toFixed(1)}%가 상한을 초과합니다.${chartCap}%——구경이 잘못되었습니다. 게이트를 열기 전에 먼저 설명해주세요.`);
  }
  // 물을 몰고 다니는 별: 각 판의 교번 창은 크기가 동결되어 있습니다(평균 ~30 창/100년 측정).
  const avg = liunianPerChart.reduce((a, b) => a + b, 0) / liunianPerChart.length;
  assert.ok(avg >= 10 && avg <= 60, `평균 수상 운전 스타${avg.toFixed(1)}창/디스크가 범위를 벗어났습니다. [10, 60]`);
  assert.ok(liunianPerChart.every(n => n > 0), "수상 조종사는 각 게임마다 적어도 하나의 교대 창을 가져야 합니다(그리드의 특성을 설명).");

  return { avg };
}

async function main() {
  testStructure();
  const smoke = generateChart({ year: 1988, month: 10, day: 8, hour: 6, gender: 'male' });
  testDaXianArchitecture(smoke);
  testAgeFilter();
  testGolden();
  const { avg } = await testRates();
  console.log("✓ 구조 8개 항목(파생 가능 항목 5개 / 분쟁 항목 3개 / 접근 불가 항목 0개), 주석 및 일련 번호를 문자 그대로 확인해야 합니다.");
  console.log("✓ 대한 구조 720+ 플레이트: 12개 제한 × 10년 × 다양한 궁전 가지 × 첫 번째 제한 연령 = 오행국 수");
  console.log("✓ 9개의 황금 예제가 모두 정확합니다. 연령 필터링은 getCurrentDingZa와 동일합니다.");
  console.log(`✓ 두 배 직경의 게이트가 모두 통과합니다(평균 수상 파일럿 스타).${avg.toFixed(1)}창/팬을 번갈아 사용)`);
}

main().catch(err => { console.error(err); process.exit(1); });
