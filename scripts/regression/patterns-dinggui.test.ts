/* *
 * 〈Dinggui Bureau〉 27개의 사각형에 회귀 테스트를 엄격하게 구현함
 *
 *3계층 어설션:
 * 1. 구조적 레이어 - 후발자가 조건을 완화하거나 비밀리에 항목을 삭제하는 것을 방지하기 위한 항목 수 및 상태 분포.
 * 2. 기하학적 레이어 - 도달할 수 없는 앤더스의 아이덴티티 3개, 실제 디스크 측정으로 확인
 * 3. 행동 레이어 - 실현 가능한 각 그리드는 포지티브 패턴을 가져야 합니다. 전체 테이블의 트리거 비율은 합리적인 범위 내에 있어야 합니다.
 *
 * 세 번째 항목은 이 테스트가 존재하는 실제 이유입니다. 격국 식별자가 손상되는 가장 일반적인 방법은 오류를 보고하지 않는 것입니다.
 * 대신, 그것은 조용히 영구적인 참(모든 사람의 참여에 여유가 있음) 또는 영구적인 거짓(안싱에 기록할 수 없는 조건)이 됩니다.
 * 전자는 '단일 발동률 상한'으로 차단되고, 후자는 '양성 사례 존재'로 차단됩니다. */
import assert from 'node:assert/strict';
import { generateChart } from '../../lib/ziwei/algorithm';
import type { ZiweiChart } from '../../lib/ziwei/types';
import {
  DING_GUI_GE,
  DING_GUI_JUDGEABLE,
  DING_GUI_UNREACHABLE,
  detectDingGui,
} from '../../lib/ziwei/patterns-dinggui';

const chartOf = (y: number, m: number, d: number, h: number): ZiweiChart => {
  // 존재하지 않는 날짜 건너뛰기(2월 30일 등)
  const dt = new Date(Date.UTC(y, m - 1, d));
  assert.equal(dt.getUTCMonth(), m - 1, `${y}-${m}-${d}법적 날짜가 아님`);
  return generateChart({ year: y, month: m, day: d, hour: h, gender: 'male' });
};

// ─────────────────── 1. 구조층 ───────────────────

assert.equal(DING_GUI_GE.length, 27, "\"방어국\"은 제27조로 되어야 합니다.");

// 일련번호는 1..27부터 연속되어야 하며, 셀 이름은 반복되어서는 안 됩니다.
assert.deepEqual(
  DING_GUI_GE.map(g => g.no),
  Array.from({ length: 27 }, (_, i) => i + 1),
  "일련번호는 연속적으로 1..27이어야 합니다.",
);
assert.equal(new Set(DING_GUI_GE.map(g => g.name)).size, 27, '格名不得重复');

// 각 기사는 주석과 함께 작성되어야 합니다. "보기 전에 주석을 달았다"면 해당 구절을 추가해야 합니다.
for (const g of DING_GUI_GE) {
  assert.ok(g.note.length > 0, `${g.name}누락된 텍스트`);
  assert.ok(!/^见前批注。?$/.test(g.note), `${g.name}"보기 전 주석"만 썼고, 해당 구절을 추가해야 했습니다.`);
}

// 상태 3점: 달성 가능 23, 미해결 4, 의심 2
assert.equal(DING_GUI_JUDGEABLE, 23, "23개의 결정 가능한 항목이 있어야 합니다(27~4개는 해결책 없음).");
assert.equal(DING_GUI_UNREACHABLE.length, 4, "An Xing Unsolved에 대한 항목이 4개 있어야 합니다.");
assert.deepEqual(
  DING_GUI_UNREACHABLE.map(g => g.name).sort(),
  ['财印夹禄', '文星暗拱', '金舆扶驾', '马头带剑'].sort(),
  "답변되지 않은 항목 목록에 대한 변경 사항은 문서 및 이유와 함께 동시에 업데이트되어야 합니다.",
);
for (const g of DING_GUI_UNREACHABLE) {
  assert.ok(g.why && g.why.length > 20, `${g.name}연결할 수 없다고 표시했지만 기하학적 이유를 작성하지 않았습니다.`);
  assert.equal(g.fn, undefined, `${g.name}Unreachable로 표시되면 판단기능이 없어야 함(데드코드)`);
}
for (const g of DING_GUI_GE.filter(x => x.status === 'disputed')) {
  assert.ok(g.why && g.why.length > 10, `${g.name}이의가 있음을 표시했지만 모호성을 기록하지 않았습니다.`);
  assert.ok(g.fn, `${g.name}이의가 있음이 표시된 경우에도 일반적인 해결책의 구현이 제공되어야 합니다.`);
}

// ──────────────────────────────────────────────────────────────────────── ────────────────────────────────────────────────────────────────────────

/* * 샘플에 나타난 두 점성술 단계 대궁(a에 대한 b) 간의 모든 차이를 계산합니다. */
function deltas(a: string, b: string, charts: ZiweiChart[]): Set<number> {
  const out = new Set<number>();
  for (const c of charts) {
    const pa = c.palaces.find(p => p.stars.some(s => s.name === a))?.branch ?? -1;
    const pb = c.palaces.find(p => p.stars.some(s => s.name === b))?.branch ?? -1;
    if (pa < 0 || pb < 0) continue;
    out.add(((pb - pa) + 12) % 12);
  }
  return out;
}

// 8년 × 12개월 × 2일 × 12 시진. 연도, 월, 일, 시간의 네 가지 변수를 이동해야 합니다.
// 연도 어간은 녹존/경양/천마/Kuiyue/사화에 의해 결정됩니다. 월간 분기는 좌보우필/천형에 의해 결정됩니다. 요일은 오행국(따라서 천량천상염정)에 의해 결정됩니다.
// 시간 지원은 문창문곡/지공지겁/화성영성입니다.
// 하나라도 덜 취하면 특정 별 쌍의 위상 대궁는 단일 값으로 판단됩니다(창취의 동궁는 첸 술시에만 있고 자오선만 취하면 절대 측정되지 않습니다).
const sample: ZiweiChart[] = [];
for (let y = 1990; y <= 1993; y++) {
  for (let m = 1; m <= 12; m++) {
    for (const d of [5, 20]) {
      for (let h = 0; h < 12; h++) sample.push(chartOf(y, m, d, h));
    }
  }
}

// 부인과 재물: 천량는 항상 천상에서 시계 방향으로 다음 집에 있으며 양쪽에서 분리될 수 없습니다.
assert.deepEqual(
  [...deltas('天相', '天梁', sample)].sort((x, y) => x - y),
  [1],
  "천량와 천상 사이의 거리는 항상 1이어야 합니다(천량는 항상 천상의 다음 집에 상주합니다). 이 어설션이 실패하면 별표가 변경되었으며 금융 인감과 재산을 재평가해야 함을 의미합니다.",
);

// Wen Xing의 어두운 아치: Changqu Palace 사이의 거리는 항상 짝수이며 두 별은 인접한 두 궁전을 차지하도록 변경되지 않습니다.
const changQu = [...deltas('文昌', '文曲', sample)];
assert.ok(
  changQu.every(d => d % 2 === 0),
  `문창문곡 궁전 거리는 항상 짝수여야 하지만 실제 측정에서는 홀수가 나타납니다.${changQu.filter(d => d % 2 !== 0).join('、')}`,
);
assert.ok(
  !changQu.includes(1) && !changQu.includes(11),
  "창취는 결코 서로 인접하지 않습니다. 창취는 서로 얽혀 있으므로(원싱은 비밀리에 아치형을 하고 있습니다) 해결책이 없습니다.",
);

// Jin Yu는 다음을 지원합니다: 자미 및 태양는 일정하며 태양과 달은 자미를 결코 꼬집을 수 없습니다.
assert.deepEqual(
  [...deltas('紫微', '太阳', sample)].sort((x, y) => x - y),
  [9],
  "태양와 자미 사이의 궁전 거리는 항상 9여야 합니다. 태양은 자미 전후에 같은 궁전에 있을 수 없으므로 황금 신의 지원에 대한 해결책은 없습니다.",
);

// 칼이 달린 말 머리: 천마 및 경양 절대로 동궁
assert.ok(
  !deltas('天马', '擎羊', sample).has(0),
  "천마 및 경양는 동궁가 나타나서는 안 됩니다. 만약 그렇다면 칼을 든 말 머리의 \"해결 불가\" 판단을 재평가해야 합니다.",
);

// ────────────────── 3. 행동 레이어: 긍정적 예시 및 트리거 비율 ──────────────────

/* *
 * 달성 가능한 각 그리드의 골든 정규 차트(출생 정보 → 히트 그리드 이름)입니다.
 * 12,900개의 디스크(1990~1995 × 12월 × 15일 × 12시진)에서 `_probe/verify_dinggui2.ts`로 검색하여 첫 번째 히트 디스크를 얻습니다.
 * 디스크 알고리즘이 변경되어 더 이상 히트하지 않으면 판단 수준이 통과되었음을 의미합니다. 테스트는 실패해야 하며 완화되어서는 안 됩니다.
 *
 * ⚠️ 샘플링 규율: 12개의 시진를 포함해야 합니다. 천형, 좌보우필, 지공지겁, 화성영성, 문창문곡는 모두 다음으로 구성됩니다.
 * 월간 분기 또는 시진가 결정되며 명궁**와의 상대 위치는 시진**에만 의존합니다. 몇 가지 시진 샘플을 수정하면 변경됩니다.
 * "Junchen Qinghui"및 "Prisoner's Seal"과 같은 달과 별 × 명궁 그리드는 체계적으로 0 트리거로 판단됩니다(이 실제 측정:
 * 3개의 시진 샘플에서는 이 2개 항목이 모두 0입니다. 12개의 시진 샘플을 채운 후 각각 16건, 189건이 있습니다. */
const GOLDEN: Array<[number, number, number, number, string]> = [
  [1990, 1, 5, 0, '日月夹命'],
  [1990, 1, 27, 3, '日出扶桑'],
  [1990, 1, 27, 3, '月落亥宫'],
  [1990, 1, 15, 4, '月生沧海'],
  [1990, 1, 9, 2, '辅弼拱主'],
  [1990, 11, 21, 10, '君臣庆会'],
  // 의도적으로 "천마 이후 두 번째 궁전의 녹존" 형식을 취한 첫 번째 사례(1993-2-7 at 3, _probe/_lu_ma.ts에서 발견)——
  // 이 형태의 예전 버전(말 앞에서 루를 오해한 것)은 절대 타격할 수 없으므로 폴백을 방지하기 위해 보관하세요.
  [1993, 2, 7, 3, '禄马佩印'],
  [1990, 1, 27, 1, '坐贵向贵'],
  [1990, 1, 3, 5, '七杀朝斗'],
  [1990, 1, 9, 8, '日月并明'],
  [1990, 1, 11, 6, '明珠出海'],
  [1990, 1, 3, 0, '日月同临'],
  [1990, 1, 11, 5, '刑囚夹印'],
  [1991, 2, 17, 3, '科权禄拱'],
  [1990, 7, 15, 9, '贪火相逢'],
  [1990, 2, 1, 11, '武曲守垣'],
  [1990, 1, 3, 11, '府相朝垣'],
  [1990, 1, 7, 11, '紫府朝垣'],
  [1990, 1, 5, 0, '权禄生逢'],
  [1990, 1, 1, 6, '羊刃入庙'],
  [1990, 1, 19, 10, '巨机居卯'],
  [1990, 1, 11, 7, '明禄暗禄'],
  [1990, 1, 13, 1, '科明暗禄'],
];

// 골든 테이블은 달성 가능한 모든 항목을 포함해야 하며 그 이상도 그 이하도 아닙니다.
assert.deepEqual(
  GOLDEN.map(g => g[4]).sort(),
  DING_GUI_GE.filter(g => g.fn).map(g => g.name).sort(),
  "주요 예시 목록이 달성 가능한 항목 목록과 일치하지 않습니다. 새 항목을 수정해야 합니다.",
);

for (const [y, m, d, h, name] of GOLDEN) {
  const hits = detectDingGui(chartOf(y, m, d, h));
  assert.ok(
    hits.some(x => x.name === name),
    `${y}-${m}-${d}시간${h}딱 맞춰서 "${name}", 실제 히트:${hits.map(x => x.name).join('、') || '无'}`,
  );
}

// 전체 테이블 트리거 비율: 8%를 초과하는 단일 라인은 너무 완화된 것으로 간주됩니다.
// 근거: 원문의 49개 항목 중 가장 높은 항목(높게 앉기, 높은 쪽 보기)이 실제로 5.6%로 측정되며, 6%를 넘은 사람은 없다.
const RATE_SAMPLE: ZiweiChart[] = [];
for (let y = 1990; y <= 1993; y++) {
  for (let m = 1; m <= 12; m++) {
    for (const d of [1, 10, 20]) {
      for (const h of [0, 6]) RATE_SAMPLE.push(chartOf(y, m, d, h));
    }
  }
}

const counts = new Map<string, number>();
let total = 0;
for (const c of RATE_SAMPLE) {
  for (const g of detectDingGui(c)) {
    counts.set(g.name, (counts.get(g.name) ?? 0) + 1);
    total++;
  }
}

for (const g of DING_GUI_GE) {
  if (!g.fn) continue;
  const rate = (counts.get(g.name) ?? 0) / RATE_SAMPLE.length;
  assert.ok(
    rate <= 0.08,
    `「${g.name}"발동률${(rate * 100).toFixed(1)}%가 8%를 초과합니다. 그리드는 사람을 검사하는 데 사용됩니다. 모두가 공유할 수 있을 정도로 완화되면 더 이상 그리드가 아닙니다.`,
  );
}

// 평균 간격: 엄밀히 말하면 원본 텍스트에 따르면 0.3–1.2/디스크여야 합니다. 현재 프로젝트의 41개 인식기는 4.47/디스크입니다.
const avg = total / RATE_SAMPLE.length;
assert.ok(
  avg > 0.2 && avg < 1.5,
  `〈딩귀게임〉 평균 히트수${avg.toFixed(2)}예상 범위인 0.2~1.5를 초과하는 단위/디스크`,
);

const maxRate = counts.size
  ? Math.max(...[...counts.values()].map(v => v / RATE_SAMPLE.length)) * 100
  : 0;

console.log(
  `패턴-딩구이: 27 (달성 가능${DING_GUI_JUDGEABLE}/ 해결책 없음${DING_GUI_UNREACHABLE.length}/ 의심스럽다 2),` +
  `측정된 평균${avg.toFixed(2)}조각/디스크, 가장 높은 단일 라인${maxRate.toFixed(1)}%`,
);
