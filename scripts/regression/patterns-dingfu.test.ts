/* *
 * 〈Dingfu Bureau〉 회귀 테스트의 6프레임 엄격한 구현
 *
 * 3단계 주장(구조/기하학/행동), 동반 기사 패턴-dinggui.test.ts와 동형:
 * 1. 구조적 레이어 - 비열한 조건 완화 또는 항목 삭제를 방지하기 위한 항목 수 및 상태 분포
 * 2. 기하학적 레이어 - 도달할 수 없는 앤더스의 신원 2개, 실제 디스크 측정으로 확인됨
 * 또한 두 파생 항목의 "고유한 형식" 속성을 증명합니다(미래 세대가 영구적인 거짓에 대한 두 번째 판독을 추가하는 것을 방지하기 위해).
 * 3. 동작 레이어 - 실현 가능한 각 그리드에는 포지티브 디스크가 있어야 합니다. 트리거 속도는 희소 간격에 속해야 합니다.
 *
 * Dingfu Bureau의 6개 항목 중 2개 항목에는 해결책이 없습니다(채음 고정 인장, 음 인쇄 아치형 본체). 둘 다 "Liang Xiangjia/Gong" 계열에 속합니다.
 * 천량는 항상 천상 다음의 첫 번째 하우스에 상주합니다. 이 인접한 별 쌍은 첫 번째 하우스의 양쪽에서 서로 분리될 수 없으며 동시에 삼방사정에 들어갈 수도 없습니다. */
import assert from 'node:assert/strict';
import { generateChart } from '../../lib/ziwei/algorithm';
import type { ZiweiChart } from '../../lib/ziwei/types';
import {
  DING_FU_GE,
  DING_FU_JUDGEABLE,
  DING_FU_UNREACHABLE,
  detectDingFu,
} from '../../lib/ziwei/patterns-dingfu';

const chartOf = (y: number, m: number, d: number, h: number): ZiweiChart => {
  const dt = new Date(Date.UTC(y, m - 1, d));
  assert.equal(dt.getUTCMonth(), m - 1, `${y}-${m}-${d}법적 날짜가 아님`);
  return generateChart({ year: y, month: m, day: d, hour: h, gender: 'male' });
};

// ─────────────────── 1. 구조층 ───────────────────

assert.equal(DING_FU_GE.length, 6, "<재정국>은 6항으로 한다");
assert.deepEqual(
  DING_FU_GE.map(g => g.no),
  [1, 2, 3, 4, 5, 6],
  "시퀀스 번호는 1..6이어야 합니다.",
);
assert.equal(new Set(DING_FU_GE.map(g => g.name)).size, 6, '格名不得重复');
for (const g of DING_FU_GE) {
  assert.ok(g.note.length > 0, `${g.name}누락된 텍스트`);
}

// 상태는 두 가지로 나뉩니다: 달성 가능 4, 해결 방법 없음 2(Dingfu 사무국은 이의를 제기하지 않았습니다)
assert.equal(DING_FU_JUDGEABLE, 4, "4개의 결정 가능한 항목이 있어야 합니다(6~2개는 해결 방법 없음).");
assert.equal(DING_FU_UNREACHABLE.length, 2, "An Xing Unsolved에 대한 항목이 2개 있어야 합니다.");
assert.deepEqual(
  DING_FU_UNREACHABLE.map(g => g.name).sort(),
  ['财荫夹印', '荫印拱身'].sort(),
  "해결 불가능한 항목 목록의 변경 사항은 문서 및 기하학적 이유와 함께 동시에 업데이트되어야 합니다.",
);
for (const g of DING_FU_UNREACHABLE) {
  assert.ok(g.why && g.why.length > 20, `${g.name}연결할 수 없다고 표시했지만 기하학적 이유를 작성하지 않았습니다.`);
  assert.equal(g.fn, undefined, `${g.name}Unreachable로 표시되면 판단기능이 없어야 함(데드코드)`);
}

// ────────────────── 2. 기하학적 레이어 ──────────────────

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

// 연도, 월, 일, 시의 네 가지 변수는 dinggui 테스트와 동일한 이유로 이동해야 합니다. 변수가 누락되면 ID가 잘못 테스트됩니다.
const sample: ZiweiChart[] = [];
for (let y = 1990; y <= 1993; y++) {
  for (let m = 1; m <= 12; m++) {
    for (const d of [5, 20]) {
      for (let h = 0; h < 12; h++) sample.push(chartOf(y, m, d, h));
    }
  }
}

// 항등식 1: 천량는 항상 천상에서 시계 방향으로 다음 집에 있습니다(델타는 항상 1입니다). Cai Yin과 Yin Yin 사이에는 두 개의 인장이 있습니다.
// "해가 없음"은 한 쌍의 별이 결코 서로 분리되지 않는다는 사실에 근거합니다.
assert.deepEqual(
  [...deltas('天相', '天梁', sample)].sort((x, y) => x - y),
  [1],
  "천량와 천상 사이의 궁전 거리는 항상 1이어야 합니다(천량는 항상 천상의 다음 궁전에 상주합니다). 실패할 경우 부 인장/음 인장을 재평가해야 합니다.",
);

// 정체성 2: 무곡와 천상 사이의 거리는 짝수여야 합니다. 무곡는 천상의 인접한 하우스에 있을 수 없습니다.
// 따라서 "Wuliang 샌드위치 씰"(무곡 측면)의 절반은 명궁인지 전택궁인지 솔루션이 없습니다.
const wuXiang = [...deltas('武曲', '天相', sample)];
assert.ok(
  wuXiang.every(d => d % 2 === 0),
  `무곡천상 궁전 거리는 항상 짝수여야 하지만 실제 측정에서는 홀수가 나타납니다.${wuXiang.filter(d => d % 2 !== 0).join('、')}`,
);
assert.ok(
  !wuXiang.includes(1) && !wuXiang.includes(11),
  "무곡는 천상 옆에 절대 존재하지 않습니다. Caiyin 봉인에 대한 해결책은 없습니다.",
);

// 항등식 3: 태양는 항상 무곡(델타 상수 1) 다음의 첫 번째 하우스에 있습니다. 이는 태양과 달 사이에서 얻을 수 있는 유일한 부의 형태입니다.
// (태음는 앞쪽에, 태양는 뒤쪽에 있습니다.) 이것은 잠겨 있습니다. "그제 전날과 다음 달"을 읽는 것은 결코 불가능합니다.
assert.deepEqual(
  [...deltas('武曲', '太阳', sample)].sort((x, y) => x - y),
  [1],
  "태양와 무곡 사이의 거리는 항상 1이어야 합니다(태양는 항상 무곡 다음 집에 상주합니다). 이는 일월 부 패턴의 고유성의 기초입니다.",
);

// 정체성 4: 녹존는 천마 이전의 첫 번째 하우스에 결코 있지 않습니다. 이는 얻을 수 있는 유일한 형태의 부와 부의 기초입니다(달의 부는 뒤에 있고 무술은 앞에 있습니다).
// 참고: 이는 구조적 정체성입니다(천마는 Yinshensihai, Maqianqian {Haimaoweixu...} 및 녹존 Gongji에만 있습니다.
// {Jia Yin Yi Mao Bing Si Ding Wu Wu Si Ji Wu Geng Shen Xin You Ren Hai Guizi} 교차점 없음), 표본 통계가 아님.
// 녹존와 천마 사이의 전체 차이점 세트는 줄기와 가지의 조합에 따라 달라집니다(샘플 {0,1,4,7,9}).
// {0,1}만 있다고 주장할 수 없습니다. 이는 연간 줄기 적용 범위가 불충분하여 생성된 잘못된 ID입니다.
assert.ok(
  !deltas('天马', '禄存', sample).has(11),
  "녹존는 천마 이전의 첫 번째 하우스에 나타나서는 안 됩니다. 만약 그렇다면 부와 부의 \"루가 앞에 있습니다\"의 발음을 재평가해야 합니다.",
);

// Yin Yin Gong Shen의 공 반대를 읽는 방법: 삼방사정 인접한 두 별이 같은 집에 들어갈 수 없는 경우 디스크를 직접 사용하여 확인하십시오.
{
  const pos = (c: ZiweiChart, n: string) =>
    c.palaces.find(p => p.stars.some(s => s.name === n))?.branch ?? -1;
  let coFang = 0;
  for (const c of sample) {
    const tz = c.palaces.find(p => p.name === '田宅')?.branch ?? -1;
    if (tz < 0) continue;
    const fang = [tz, (tz + 4) % 12, (tz + 8) % 12, (tz + 6) % 12];
    if (fang.includes(pos(c, '天梁')) && fang.includes(pos(c, '天相'))) coFang++;
  }
  assert.equal(coFang, 0, "천량천상는 전택삼방사정와 동의어가 되어서는 안 됩니다. ——음음공심에서 \"Gong Chong\"의 설명할 수 없는 발음 재확인");
}

// ────────────────── 3. 행동 레이어: 긍정적 예시 및 트리거 비율 ──────────────────

/* *
 *골드 일반 디스크, 12,900개 디스크에서 `_probe/verify_dingfu.ts`로 검색됨(첫 번째 히트 디스크 가져옴)
 * 더 이상 적중하지 않도록 디스크 알고리즘이 변경되면 테스트가 실패하고 완화되어서는 안 됩니다. */
const GOLDEN: Array<[number, number, number, number, string]> = [
  [1990, 1, 5, 0, '日月夹财'],
  [1993, 1, 25, 3, '财禄夹马'],
  [1990, 1, 15, 9, '日月照璧'],
  [1990, 2, 11, 8, '金灿光辉'],
];

assert.deepEqual(
  GOLDEN.map(g => g[4]).sort(),
  DING_FU_GE.filter(g => g.fn).map(g => g.name).sort(),
  "주요 예시 목록이 달성 가능한 항목 목록과 일치하지 않습니다. 새 항목을 수정해야 합니다.",
);

for (const [y, m, d, h, name] of GOLDEN) {
  const hits = detectDingFu(chartOf(y, m, d, h));
  assert.ok(
    hits.some(x => x.name === name),
    `${y}-${m}-${d}시간${h}딱 맞춰서 "${name}", 실제 히트:${hits.map(x => x.name).join('、') || '无'}`,
  );
}

// 전체 테이블 트리거 속도: Dingfu 국은 드물어야 합니다. 12,900개 플레이트의 측정된 평균은 0.048개/플레이트, 영 적중률은 95.2%,
// 가장 높은 단일 라인은 2.68%(재백궁 확장을 포함한 해와 달 부)입니다. 범위를 벗어나면 수정된 것으로 판단합니다.
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
  const hits = detectDingFu(c);
  total += hits.length;
  for (const h of hits) counts.set(h.name, (counts.get(h.name) ?? 0) + 1);
}
const avg = total / RATE_SAMPLE.length;
assert.ok(
  avg > 0.01 && avg < 0.12,
  `〈딩푸국〉평균 조회수${avg.toFixed(3)}예상 범위인 0.01~0.12를 초과하는 단위/디스크`,
);
for (const [name, v] of counts) {
  const rate = v / RATE_SAMPLE.length;
  assert.ok(
    rate < 0.08,
    `「${name}"발동률${(rate * 100).toFixed(1)}%가 8% 상한을 초과함 - 이완이 의심됨`,
  );
}

console.log(
  `패턴-딩푸: 6개 항목(4개 달성 가능 / 2개 미해결), 측정된 평균${avg.toFixed(2)}조각/접시,` +
  `가장 높은 단일 라인${(Math.max(...counts.values()) / RATE_SAMPLE.length * 100).toFixed(1)}%`,
);
