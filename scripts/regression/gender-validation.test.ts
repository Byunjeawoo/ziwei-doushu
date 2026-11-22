import assert from 'node:assert/strict';
import { generateChart } from '../../lib/ziwei/algorithm';
import type { BirthInfo } from '../../lib/ziwei/types';

const base: BirthInfo = { year: 1925, month: 3, day: 1, hour: 6, gender: 'male' };

// 런타임 시 잘못된 성별은 배반 이전에 RangeError를 발생시켜야 하며 자동으로 "여성"으로 간주될 수 없습니다.
for (const gender of ['typo', '', 'MALE', 'Male', '男', 'female ', 'm', null, undefined, 0, 1, {}] as never[]) {
  assert.throws(
    () => generateChart({ ...base, gender }),
    RangeError,
    `${String(gender)} should be rejected`,
  );
}

// 법적 가치 행위는 변경되지 않습니다.
const male = generateChart({ ...base, gender: 'male' });
assert.equal(male.birthInfo.gender, 'male');
assert.ok(male.yinYangGender?.includes('男'), "남성 차트는 양남/음남여야 합니다.");

const female = generateChart({ ...base, gender: 'female' });
assert.equal(female.birthInfo.gender, 'female');
assert.ok(female.yinYangGender?.includes('女'), "여성 차트는 양녀/음녀여야 합니다.");

console.log('gender validation regression passed');
