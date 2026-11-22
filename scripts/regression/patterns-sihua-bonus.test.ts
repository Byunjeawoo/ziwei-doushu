/* *
 * 격국 보너스 아이템의 "화록 / 화권 / 화과"는 반드시 스타명이 아닌 해당 스타의 시화필드로 판정되어야 합니다.
 *
 * 사화는 Star.siHua(예: { name: '천기', siHua: '科' })에 나열되어 있으며 디스크에 "화과"라는 이름의 별이 없습니다.
 * 앞서 조원 총리는 "명궁 Jianlu", Yangliang Changlu/Jiyue Tongliang "Goodbye 화과", Sha Polang "3당에는 화록 또는 화권가 있습니다"
 * hasStar / sanFangAllStars를 사용하여 "Hua X"의 별 이름을 검색하지만 찾을 수 없습니다. 이러한 보너스 포인트는 절대 나타나지 않습니다.
 *
 * Patterns.ts에는 `server-only`가 포함되어 있습니다(이 패키지는 웨어하우스에 설치되지 않으며 Next가 빌드된 경우에만 사용할 수 있습니다). 여기서는 빈 모듈로 구문 분석된 후 가져옵니다. */
import assert from 'node:assert/strict';
import * as nodeModule from 'node:module';
import { generateChart } from '../../lib/ziwei/algorithm';
import type { ZiweiChart, SiHua } from '../../lib/ziwei/types';

// module.registerHooks: 노드 22.15+ / 23.5+; @types/node 20에는 아직 선언이 없으며 여기에 최소 유형이 제공됩니다.
type HookResult = { url?: string; format?: string; source?: string; shortCircuit?: boolean };
const { registerHooks } = nodeModule as unknown as {
  registerHooks(hooks: {
    resolve(specifier: string, context: unknown, next: (s: string, c: unknown) => HookResult): HookResult;
    load(url: string, context: unknown, next: (u: string, c: unknown) => HookResult): HookResult;
  }): void;
};
const SERVER_ONLY_STUB = 'data:text/javascript,';
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'server-only') return { url: SERVER_ONLY_STUB, shortCircuit: true };
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url === SERVER_ONLY_STUB) return { format: 'commonjs', source: '', shortCircuit: true };
    return nextLoad(url, context);
  },
});

function sanFangHasSiHua(chart: ZiweiChart, hua: SiHua): boolean {
  const m = chart.mingGongBranch;
  const branches = [m, (m + 4) % 12, (m + 8) % 12, (m + 6) % 12];
  return chart.palaces.some(p => branches.includes(p.branch) && p.stars.some(s => s.siHua === hua));
}

async function main() {
const { detectPatterns } = await import('../../lib/ziwei/patterns');

// 차트에 "X"라는 이름의 별이 없습니다.
const sample = generateChart({ year: 1988, month: 10, day: 8, hour: 7, gender: 'male' });
assert.ok(sample.palaces.every(p => p.stars.every(s => !/^化[禄权科忌]$/.test(s.name))), "별 이름에 \"X\"가 나타납니다.");

// 연도를 매일 스캔하여 오시를 수정하고 각 보너스 항목에 대해 "나타나야 하는" 게임 수와 "실제로 나타나는" 게임 수를 계산합니다.
const checks: { pattern: string; bonus: string; expect: (c: ZiweiChart) => boolean }[] = [
  {
    pattern: '府相朝垣', bonus: '命宫见禄',
    expect: c => c.palaces.some(p => p.branch === c.mingGongBranch && p.stars.some(s => s.name === '禄存' || s.siHua === '禄')),
  },
  { pattern: '杀破狼', bonus: "세 당사자는 화록 또는 화권을 가지고 있습니다 (강하게 움직입니다)", expect: c => sanFangHasSiHua(c, '禄') || sanFangHasSiHua(c, '权') },
  { pattern: '机月同梁', bonus: '再会化科', expect: c => sanFangHasSiHua(c, '科') },
  { pattern: '阳梁昌禄', bonus: '再会化科', expect: c => sanFangHasSiHua(c, '科') },
];
const hits = new Map<string, number>();
const start = Date.UTC(1990, 0, 1);
for (let d = 0; d < 366; d++) {
  const dt = new Date(start + d * 86_400_000);
  const chart = generateChart({
    year: dt.getUTCFullYear(), month: dt.getUTCMonth() + 1, day: dt.getUTCDate(), hour: 6, gender: 'male',
  });
  const found = detectPatterns(chart);
  for (const { pattern, bonus, expect } of checks) {
    const p = found.find(x => x.name === pattern);
    if (!p) continue;
    const want = expect(chart);
    const got = p.conditions?.bonus?.includes(bonus) ?? false;
    assert.equal(got, want, `${dt.toISOString().slice(0, 10)}오시${pattern}「${bonus}"이어야 한다${want}`);
    if (got) hits.set(pattern, (hits.get(pattern) ?? 0) + 1);
  }
}
for (const { pattern } of checks) {
  assert.ok((hits.get(pattern) ?? 0) > 0, `${pattern}사화 보너스 포인트가 한 번도 발동되지 않았거나, 샘플이 커버되지 않았거나, 여전히 별 이름으로 판단이 이루어졌던 것입니다.`);
}

console.log(`✓ 격국사화 보너스 포인트는 siHua에 따라 결정됩니다(트리거 수:${[...hits].map(([k, v]) => `${k} ${v}`).join('、')}）`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
