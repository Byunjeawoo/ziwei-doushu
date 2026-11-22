/* *
 * 샘플 시진 일관성 회귀(문제 #26에 해당)
 *
 * FAMOUS_PERSONS의 `hour`는 **시진지지 인덱스 0–11**(0=子…11=해)입니다.
 * 0~23시간의 숫자는 아닙니다. 역사적으로 주석과 색인은 일관성이 없었습니다(오류 11개 중 7개:
 *"오시"로 쓰여진 5시는 실제로 사시이고, "인시"로 쓰여진 3은 실제로 묘시이며, "묘시"로 쓰여진 4는 실제로 진시입니다.
 *
 * 이 회귀 분석에서는 두 가지 사항이 결정됩니다.
 * 1. 각 샘플의 시간은 0~11 범위 내에 있어야 합니다.
 * 2. "X 시간" 주석이 있는 샘플의 경우 주석은 인덱스에 해당하는 지지와 일치해야 합니다.
 *
 * 런타임 가져오기 대신 소스 코드 구문 분석을 사용합니다 - `server-only`가 포함된 famous.ts,
 * 직접 실행에는 추가 노드 조건 매개변수가 필요하며 소스 코드를 구문 분석하는 것이 더 쉽고 크로스 플랫폼입니다. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const BRANCH_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const src = readFileSync(new URL('../../lib/ziwei/famous.ts', import.meta.url), 'utf8');

const rows = [...src.matchAll(/hour:\s*(\d+),?[ \t]*(?:\/\/[ \t]*(.*))?/g)];
assert.ok(rows.length > 0, "famous.ts에서는 시간 필드가 구문 분석되지 않았으며 일반 패턴 또는 파일 구조가 변경되었습니다.");

let annotated = 0;
for (const [, raw, comment] of rows) {
  const hour = Number(raw);
  assert.ok(
    Number.isInteger(hour) && hour >= 0 && hour <= 11,
    `hour는 실제 시진지지 인덱스 0-11이어야 합니다.${raw}`,
  );
  if (!comment) continue;
  const named = BRANCH_NAMES.find((b) => comment.includes(`${b}시`));
  if (!named) continue;
  annotated++;
  assert.equal(
    named,
    BRANCH_NAMES[hour],
    `hour: ${hour}메모에는 "${named}시간"이지만 인덱스${hour}사실은 "${BRANCH_NAMES[hour]}시간`,
  );
}

console.log(`✅ 샘플 시진 일관성:${rows.length}샘플 시간은 모두 0~11입니다.${annotated}스트립 시진 주석 및 색인과 일치`);
