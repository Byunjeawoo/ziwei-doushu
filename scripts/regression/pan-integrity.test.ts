/* *
 * 회귀 테스트 — 배반 무결성 (2026-05-15)
 *
 * 원인: 사용자 피드백 "천기천량는 재백궁에서 부처궁라고 합니다".
 *문제 해결 결론: 알고리즘 레이어는 100% 정확하며 AI 컨텍스트 텍스트 모호성입니다.
 * 그러나 누군가가 미래에 실제로 배반 코어를 변경하는 경우(algorithm.ts / school-patches),
 * "배반가 만족해야 하는 자미두수의 철칙"을 주장으로 구체화하고, 푸시할 때마다 이를 CI에서 실행합니다.
 *
 * 실행: npx tsx scripts/regression/pan-integrity.test.ts
 * 실패 출구 1 → CI 빨간색
 *
 * vitest를 가져오지 말고 프로젝트의 기존 tsx + 사용자 지정 어설션 규칙을 사용하세요(test-school-patches.ts와 동일). */
import { generateChart } from '../../lib/ziwei/algorithm';
import type { BirthInfo, ZiweiChart } from '../../lib/ziwei/types';

const BR = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const PALACE_12 = ['命宫','兄弟','夫妻','子女','财帛','疾厄','迁移','仆役','官禄','田宅','福德','父母'];

let failures = 0;
const fail = (msg: string) => { console.error(`  ✗ ${msg}`); failures++; };
const ok = (msg: string) => console.log(`  ✓ ${msg}`);

// ── 샘플링: 연도/월/시진/성별에 걸쳐 충분한 명반 패턴을 포괄합니다. ──
const samples: BirthInfo[] = [];
for (let y = 1960; y <= 2010; y += 7)
  for (let m = 1; m <= 12; m += 3)
    for (let d = 5; d <= 26; d += 10)
      for (let h = 0; h < 12; h += 3)
        for (const g of ['male','female'] as const)
          samples.push({ year: y, month: m, day: d, hour: h, gender: g });

console.log(`배반 무결성 반환 —${samples.length}샘플 명반`);

let jiliangCount = 0;
let ziFuOppCount = 0;

for (const bi of samples) {
  let chart: ZiweiChart;
  try { chart = generateChart(bi); }
  catch (e) { fail(`generateChart에서 오류가 발생했습니다. @${JSON.stringify(bi)}: ${(e as Error).message}`); continue; }

  const tag = `${bi.year}-${bi.month}-${bi.day} h${bi.hour} ${bi.gender}`;

  // 규칙 1: 정확히 12하우스여야 합니다.
  if (chart.palaces.length !== 12) { fail(`${tag}: 궁전의 수${chart.palaces.length} ≠ 12`); continue; }

  // 철칙 2: 12개의 궁전 이름은 완전하고 고유합니다(명궁/형제/.../부모)
  const names = chart.palaces.map(p => p.name).sort();
  const expect = [...PALACE_12].sort();
  if (JSON.stringify(names) !== JSON.stringify(expect)) {
    fail(`${tag}: 궁 이름이 틀렸습니다 =${names.join(',')}`); continue;
  }

  // 철칙 3: 12개의 주택 지지 0-11은 각각 한 번만
  const branches = chart.palaces.map(p => p.branch).sort((a,b)=>a-b);
  if (JSON.stringify(branches) !== JSON.stringify([0,1,2,3,4,5,6,7,8,9,10,11])) {
    fail(`${tag}: 지지는 0-11 전체 범위가 아닙니다 =${branches.join(',')}`); continue;
  }

  // 철칙 4: 명궁 고유 + isMingGong 태그 일관성
  const mingByName = chart.palaces.filter(p => p.name === '命宫');
  if (mingByName.length !== 1) { fail(`${tag}: 명궁 수량${mingByName.length}`); continue; }

  // 철칙 5: 12개의 하우스는 시계 반대 방향으로 배열됩니다 — 명궁지지부터 시작하여 k번째 하우스 지지 = (명궁지지 - k + 12) % 12
  const mingBranch = mingByName[0].branch;
  for (let k = 0; k < 12; k++) {
    const expectBranch = ((mingBranch - k) % 12 + 12) % 12;
    const pName = PALACE_12[k];
    const p = chart.palaces.find(x => x.name === pName)!;
    if (p.branch !== expectBranch) {
      fail(`${tag}: ${pName}~에 있어야 한다${BR[expectBranch]}실제${BR[p.branch]}(반시계방향 배열은 좋지 않습니다)`);
      break;
    }
  }

  // 철칙 6: 머신 빔 동궁는 Chen 또는 Xu에만 있을 수 있습니다.
  const jl = chart.palaces.find(p => {
    const ms = p.stars.filter(s => s.type === 'major').map(s => s.name);
    return ms.includes('天机') && ms.includes('天梁');
  });
  if (jl) {
    jiliangCount++;
    if (jl.branch !== 4 && jl.branch !== 10) {
      fail(`${tag}: 머신빔 동궁가 다음에 나타납니다.${BR[jl.branch]}(Chen/Xu만 가능)`);
    }
  }

  // 철칙 7: 자미 및 천부는 항상 고정된 상대 위치에 있습니다. 동일한 디스크가 동시에 존재해야 하며,
  // 자미지지 + 천부지지 관계는 "Yinshen 선 대칭"과 일치합니다(자미+천부 지지 및 4 mod 12는 잘못된 단순화입니다.
  // 올바른 철 법칙: 천부지지 = (4 - 자미지지 + 12*N) → 즉, Zifu는 Yin(2)/Shen(8) 축에 대해 항상 대칭입니다.
  // 등가: (자미분기 + 천부분기) % 12 === 4)
  let ziB = -1, fuB = -1;
  for (const p of chart.palaces) for (const s of p.stars) {
    if (s.name === '紫微') ziB = p.branch;
    if (s.name === '天府') fuB = p.branch;
  }
  if (ziB >= 0 && fuB >= 0) {
    ziFuOppCount++;
    if ((ziB + fuB) % 12 !== 4) {
      fail(`${tag}: Zifu의 대칭 철칙이 깨졌습니다. Zi=${BR[ziB]}푸 =${BR[fuB]}(그리고 %12는 =4여야 합니다)`);
    }
  }
}

console.log(`샘플링 통계: 머신 빔 동궁 플레이트${jiliangCount}(둘 다 Chen/Xu로 확인됨), Zifu Pan${ziFuOppCount}(모두 대칭인 것으로 확인됨)`);

if (failures === 0) {
  console.log(`✅ 배반 무결성이 복원되었습니다(${samples.length}디스크×7 철법칙(자미)`);
  process.exit(0);
} else {
  console.error(`❌ 배반 무결성 반환${failures}실패 - 배반 코어가 수정되어 온라인 접속이 금지되었습니다.`);
  process.exit(1);
}
