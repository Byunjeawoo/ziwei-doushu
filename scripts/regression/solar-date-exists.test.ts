import assert from 'node:assert/strict';
import { generateChart } from '../../lib/ziwei/algorithm';
import type { BirthInfo } from '../../lib/ziwei/types';

const base: BirthInfo = { year: 1925, month: 3, day: 1, hour: 6, gender: 'male' };

// 존재하지 않는 양력 날짜는 배반 이전에 거부되어야 하며 다음 달 주문으로 연기될 수 없습니다.
for (const [year, month, day] of [
  [1925, 2, 29], // 윤년이 아닌 해
  [1925, 2, 30],
  [1980, 2, 30], // 윤년에는 2월 30일이 없다.
  [1925, 4, 31],
  [1925, 13, 1],
  [1925, 0, 10],
  [1925, 6, 0],
]) {
  assert.throws(
    () => generateChart({ ...base, year, month, day }),
    RangeError,
    `${year}-${month}-${day} should be rejected`,
  );
}

// 실제 경계 날짜는 평소와 같이 배반입니다.
for (const [year, month, day] of [
  [1924, 2, 29], // 윤년
  [1980, 2, 29],
  [1925, 2, 28],
  [1925, 1, 31],
  [1925, 12, 31],
]) {
  const chart = generateChart({ ...base, year, month, day });
  assert.equal(chart.birthInfo.day, day, `${year}-${month}-${day} should be accepted`);
}

console.log('solar date existence regression passed');
