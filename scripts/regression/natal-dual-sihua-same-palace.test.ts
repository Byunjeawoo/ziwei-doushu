/* *
 * 재발방지 : 동궁 2개 본명사화 별 ≠ 버그.
 * 오오(기본 사화 테이블): 탐랑 Lu, 태음 Quan, 우필 Ke, 천기 Ji - 같은 궁전에 떨어질 수 있습니다.
 * 골드 표준 케이스: 1988-10-08 미시 남성 → 명궁 천기 Ji+태음 Quan; 부모 탐랑 Lu+우필 Ke. */
import assert from 'node:assert/strict';
import { generateChart } from '../../lib/ziwei/algorithm';
import { SCHOOL_SIHUA_DEFAULT, SCHOOL_STAR_ID_TO_NAME } from '../../lib/ziwei/school-data';

// 五 = SCHOOL_SIHUA_DEFAULT 행의 인덱스 5(row0 패드, A..Gui = 1..10)
const wu = SCHOOL_SIHUA_DEFAULT[5];
assert.deepEqual(wu, [0, 9, 8, 18, 2], "5년차의 기본 사화 테이블이 변경되었습니다.");
assert.equal(SCHOOL_STAR_ID_TO_NAME[9], '贪狼');
assert.equal(SCHOOL_STAR_ID_TO_NAME[8], '太阴');
assert.equal(SCHOOL_STAR_ID_TO_NAME[18], '右弼');
assert.equal(SCHOOL_STAR_ID_TO_NAME[2], '天机');

const chart = generateChart({ year: 1988, month: 10, day: 8, hour: 7, gender: 'male' });
const byPalace = new Map<string, string[]>();
for (const p of chart.palaces) {
  const hits = p.stars.filter(s => s.siHua).map(s => `${s.name}:${s.siHua}`);
  if (hits.length) byPalace.set(p.name, hits);
}

assert.deepEqual(byPalace.get('命宫')?.sort(), ['天机:忌', '太阴:权'].sort());
assert.deepEqual(byPalace.get('父母')?.sort(), ['贪狼:禄', '右弼:科'].sort());
assert.equal(
  [...byPalace.values()].filter(v => v.length >= 2).length,
  2,
  "오의 해에 이 차트에는 각각 두 개의 본명사화 별이 포함된 두 개의 하우스가 있어야 합니다.",
);

console.log("✓ 나탈 듀얼시화동궁(오년·기본 사화 테이블)이 유효하며, 표시 버그가 아닙니다.");
