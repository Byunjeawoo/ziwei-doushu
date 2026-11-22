/* *
 * 〈빈곤열등국〉 8개 그리드에 대한 회귀 테스트를 엄격하게 시행
 *
 * 3단계 주장, 동반 기사 패턴-딩귀/패턴-딩푸와 동형:
 * 1. 구조 레이어 - 항목 수, 상태 분포(이 표에서는 연결할 수 없음), 분쟁 대상에는 이유와 구현이 포함되어야 합니다.
 * 2. 기하학적 레이어 - 3개의 Anxing ID는 실제 디스크 측정을 통해 검증됩니다(Wu Lian 상수 거리 4, Kong Jie 동궁 ⇔ Zi 오시,
 *양타상수 2) 그들은 부와 감옥의 '별도방어', 행운과 두살의 '희귀',
 * 신사는 야생에서 '극히 희귀하다'는 근거를 잘 읽어야 한다.
 * 3. 행동 레이어 - 각 라인은 긍정적인 패턴을 가져야 합니다. 트리거 속도가 희박한 범위에 속합니다.
 *
 * 빈곤과 하급을 결정하는 8가지 규칙에 대한 구조나 해결책은 없습니다. 빈곤과 하급의 조건은 대부분 "별 + 지위"이며 직위 조정 요구 사항이 없습니다.
 * 논쟁의 여지가 있는 세 가지 조항의 관대함과 엄격함에 대해서는 Why 모듈을 참조하세요. 이 테스트에서는 일반 디스크를 사용하여 선택한 판독값을 잠급니다. */
import assert from 'node:assert/strict';
import { generateChart } from '../../lib/ziwei/algorithm';
import type { ZiweiChart } from '../../lib/ziwei/types';
import {
  DING_PIN_GE,
  DING_PIN_JUDGEABLE,
  DING_PIN_UNREACHABLE,
  detectDingPin,
} from '../../lib/ziwei/patterns-dingpin';

const chartOf = (y: number, m: number, d: number, h: number): ZiweiChart => {
  const dt = new Date(Date.UTC(y, m - 1, d));
  assert.equal(dt.getUTCMonth(), m - 1, `${y}-${m}-${d}법적 날짜가 아님`);
  return generateChart({ year: y, month: m, day: d, hour: h, gender: 'male' });
};

// ─────────────────── 1. 구조층 ───────────────────

assert.equal(DING_PIN_GE.length, 8, "\"빈곤과 무의미 국\"에 8 개의 조항이 있어야합니다");
assert.deepEqual(DING_PIN_GE.map(g => g.no), [1, 2, 3, 4, 5, 6, 7, 8], "일련번호는 1..8이어야 합니다.");
assert.equal(new Set(DING_PIN_GE.map(g => g.name)).size, 8, '格名不得重复');
for (const g of DING_PIN_GE) {
  assert.ok(g.note.length > 0, `${g.name}누락된 텍스트`);
}

// 상태: 달성 가능 5. 의문 3. 미해결 0
assert.equal(DING_PIN_JUDGEABLE, 8, "8개 항목 모두 심사 가능(의심스러운 공통 해결방안 포함)");
assert.equal(DING_PIN_UNREACHABLE.length, 0, "가난하고 낮은 지위에 있는 상황에서 안전하고 해결 불가능한 구조적 항목은 없습니다. 발견된 경우 순수한 안전하고 방음적인 증거가 먼저 제공되어야 합니다.");
const disputed = DING_PIN_GE.filter(g => g.status === 'disputed');
assert.deepEqual(
  disputed.map(g => g.name).sort(),
  ['日月藏辉', '马落空亡', '君子在野'].sort(),
  "의심스러운 항목 목록에 대한 변경 사항은 문서 및 관대함이나 심각도를 선택하는 이유와 동시에 업데이트되어야 합니다.",
);
for (const g of disputed) {
  assert.ok(g.why && g.why.length > 20, `${g.name}논쟁의 여지가 있는 것으로 표시되었지만 관대함이나 엄격함을 선택하는 이유를 기록하지 않았습니다.`);
  assert.ok(g.fn, `${g.name}이의가 있음이 표시된 경우에도 일반적인 해결책의 구현이 제공되어야 합니다.`);
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

// 연, 월, 일, 시의 4개 변수를 이동해야 합니다(이유는 딩귀 테스트와 동일).
const sample: ZiweiChart[] = [];
for (let y = 1990; y <= 1993; y++) {
  for (let m = 1; m <= 12; m++) {
    for (const d of [5, 20]) {
      for (let h = 0; h < 12; h++) sample.push(chartOf(y, m, d, h));
    }
  }
}

// 정체성 1: 궁전 무곡와 염정 사이의 거리는 일정하며 절대 동궁가 아닙니다. "오진은 몸과 생명을 함께 보호합니다"는 신체와 생명의 두 집만 별도로 보호할 수 있습니다.
// (deltas(a,b)는 "a에 대한 b"를 취합니다. 무곡는 염정에 대해 항상 +4이고 그 반대는 8입니다. 역방향을 쓰지 마십시오)
assert.deepEqual(
  [...deltas('廉贞', '武曲', sample)].sort((x, y) => x - y),
  [4],
  "무곡와 염정 사이의 궁 거리는 항상 4가 되어야 합니다. (오연용은 동궁입니다.) - 부와 증오는 \"함께 있어야\" 하며 읽는 방법에 따라 읽어야 합니다.",
);

// 신원 2: 지공지겁동궁는 Zi와 정오에 두 개의 시진에만 나타납니다.
// (지겁는 Hai에서 앞으로 카운트하고, 지공는 Hai에서 뒤로 카운트하고, 동궁 ⇔ 2h ‚ 0 mod 12)
{
  let tongGong = 0;
  const hours = new Set<number>();
  for (let y = 1990; y <= 1991; y++) {
    for (let m = 1; m <= 12; m++) {
      for (const h of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) {
        const c = chartOf(y, m, 10, h);
        const kong = c.palaces.find(p => p.stars.some(s => s.name === '地空'))?.branch ?? -1;
        const jie = c.palaces.find(p => p.stars.some(s => s.name === '地劫'))?.branch ?? -1;
        if (kong >= 0 && kong === jie) { tongGong++; hours.add(h); }
      }
    }
  }
  assert.ok(tongGong > 0, "샘플에는 번호가 동궁인 디스크가 있어야 합니다.");
  assert.deepEqual(
    [...hours].sort((x, y) => x - y),
    [0, 6],
    "Kong Jie 동궁는 자시(h=0) 및 오시(h=6)에만 나타나야 합니다. 이는 Lu Feng의 2킬 \"2킬\"에 대한 자연스럽고 드문 읽기의 기초입니다.",
  );
}

// 신분 3: Yangtuo 궁전 거리는 일정하며 결코 동궁가 아닙니다. 4명의 처치가 모두 동궁일 수는 없습니다.
// 군자는 야생에서 책을 엄격히 읽는다(몸과 생명을 보호하기 위해 네 마리를 죽인다). 따라서 두 번째 집으로 신체와 생명이 정확히 분리되어야 하며 동시에 불종이 떨어지는 경우는 극히 드물다.
// (델타는 "a에 대한 b"를 취합니다. 타라에 대한 경양는 항상 +2입니다. 역방향은 10입니다. 역방향을 쓰지 마십시오)
assert.deepEqual(
  [...deltas('陀罗', '擎羊', sample)].sort((x, y) => x - y),
  [2],
  "경양와 타라 사이의 궁전 거리는 항상 2여야 합니다(양은 Lu 앞에 있고 tuo는 Lu 뒤에 있음). 4회 처치는 야생에서 신사의 엄격한 읽기를 위한 기하학적 기초인 동궁가 될 수 없습니다.",
);

// 정체성 4 : 파군는 낙함 궁전에 존재합니다. (평생 외롭고 가난하기 위한 전제 조건)
{
  let poXian = 0;
  for (const c of sample) {
    const p = c.palaces.find(p => p.stars.some(s => s.name === '破军'));
    if (p?.stars.find(s => s.name === '破军')?.brightnessRaw === '陷') poXian++;
  }
  assert.ok(poXian > 0, "샘플에는 파군낙함 디스크가 있어야 합니다. 이는 평생 가난하게 살기 위한 전제 조건입니다.");
}

// ────────────────── 3. 행동 레이어: 긍정적 예시 및 트리거 비율 ──────────────────

/* *
 *골드 일반 디스크, 5,760개 디스크에서 `_probe/verify_dingpin.ts`로 검색됨(첫 번째 히트 디스크 가져옴)
 * 더 이상 적중하지 않도록 디스크 알고리즘이 변경되면 테스트가 실패하고 완화되어서는 안 됩니다. */
const GOLDEN: Array<[number, number, number, number, string]> = [
  [1990, 1, 4, 2, '生不逢时'],
  [1990, 11, 25, 0, '禄逢两杀'],
  [1990, 1, 1, 2, '马落空亡'],
  [1990, 1, 1, 1, '日月藏辉'],
  [1990, 1, 4, 2, '财与囚仇'],
  [1990, 1, 28, 11, '一生孤贫'],
  [1990, 2, 25, 6, '君子在野'],
  [1990, 12, 7, 3, '两重华盖'],
];

assert.deepEqual(
  GOLDEN.map(g => g[4]).sort(),
  DING_PIN_GE.filter(g => g.fn).map(g => g.name).sort(),
  "주요 예시 목록이 달성 가능한 항목 목록과 일치하지 않습니다. 새 항목을 수정해야 합니다.",
);

for (const [y, m, d, h, name] of GOLDEN) {
  const hits = detectDingPin(chartOf(y, m, d, h));
  assert.ok(
    hits.some(x => x.name === name),
    `${y}-${m}-${d}시간${h}딱 맞춰서 "${name}", 실제 히트:${hits.map(x => x.name).join('、') || '无'}`,
  );
}

// 전체 테이블의 발동률: 5,760 플레이트, 측정된 평균 0.177/플레이트, 제로 히트 84.0%, 최대 3.
// 단일 라인의 상한은 8%입니다. 말 실패 및 생명 방어의 판독 방법에 대한 실제 측정값은 4.10%(17,280장)입니다. 발동률에 주의하세요.
// 연간 가지 구성은 일정하지만 표본의 연간 가지 구성에 따라 크게 변동합니다(1990-93년 표본의 경우 6.15%).
// 본 조항만으로도 한도를 초과하는 경우에는 연차지부 구성을 먼저 확인한 후 완화 여부를 결정하시기 바랍니다. 임계값은 직접 변경할 수 없습니다.
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
  const hits = detectDingPin(c);
  total += hits.length;
  for (const h of hits) counts.set(h.name, (counts.get(h.name) ?? 0) + 1);
}
const avg = total / RATE_SAMPLE.length;
assert.ok(
  avg > 0.05 && avg < 0.4,
  `〈빈곤과 열등함을 옹호하는 게임〉 평균 히트수${avg.toFixed(3)}예상 범위인 0.05~0.4를 초과하는 단위/디스크`,
);
for (const [name, v] of counts) {
  const rate = v / RATE_SAMPLE.length;
  assert.ok(
    rate < 0.08,
    `「${name}"발동률${(rate * 100).toFixed(1)}%가 8% 상한선을 초과 - 완화된 것으로 의심됨(예외는 Ma Luokongsheng의 연간 지출 변동이므로 먼저 표본 구성을 확인하십시오)`,
  );
}

console.log(
  `패턴-딩핀: 8(실현 가능 5 / 의심 3 / 해결 불가능 0), 측정된 평균${avg.toFixed(2)}조각/접시,` +
  `가장 높은 단일 라인${(Math.max(...counts.values()) / RATE_SAMPLE.length * 100).toFixed(1)}%`,
);
