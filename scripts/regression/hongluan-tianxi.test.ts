/** Regression coverage for Hongluan/Tianxi placement and palace labels. */
import assert from 'node:assert/strict';
import { generateChart } from '../../lib/ziwei/algorithm';
import { BRANCHES, STEMS } from '../../lib/ziwei/constants';

function placementsFor(year: number, month = 5, day = 15) {
  const chart = generateChart({ year, month, day, hour: 11, gender: 'male', longitude: 120 });
  return chart.palaces.flatMap((palace) =>
    palace.stars
      .filter((star) => star.name === '红鸾' || star.name === '天喜')
      .map((star) => ({
        name: star.name,
        branch: BRANCHES[palace.branch],
        palaceLabel: `${STEMS[palace.stem]}${BRANCHES[palace.branch]}`,
      })),
  );
}

const placements = placementsFor(1974, 1, 28);

assert.deepEqual(
  placements.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN')),
  [
    { name: '天喜', branch: '未', palaceLabel: '辛未' },
    { name: '红鸾', branch: '丑', palaceLabel: '丁丑' },
  ].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN')),
  "가음년을 모계자년으로 역산하여 홍란 주와 천희 위를 얻습니다. Ding Chou/Xin Wei는 그들이 위치한 궁전의 완전한 줄기와 가지입니다.",
);

const representativeYears = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2016, 2017, 2018, 2019];
for (let yearBranch = 0; yearBranch < 12; yearBranch += 1) {
  const year = representativeYears[yearBranch];
  const yearPlacements = placementsFor(year);
  const hongluan = yearPlacements.filter((item) => item.name === '红鸾');
  const tianxi = yearPlacements.filter((item) => item.name === '天喜');
  const expectedHongluan = (3 - yearBranch + 12) % 12;
  const expectedTianxi = (expectedHongluan + 6) % 12;

  assert.equal(hongluan.length, 1, `${BRANCHES[yearBranch]}해당 연도에는 홍란가 하나만 있어야 합니다.`);
  assert.equal(tianxi.length, 1, `${BRANCHES[yearBranch]}해당 연도에는 천희가 하나만 있어야 합니다.`);
  assert.equal(hongluan[0].branch, BRANCHES[expectedHongluan], `${BRANCHES[yearBranch]}홍란년에 잘못된 궁전 위치`);
  assert.equal(tianxi[0].branch, BRANCHES[expectedTianxi], `${BRANCHES[yearBranch]}천희년에 잘못된 궁전 위치`);
  assert.equal(
    (BRANCHES.indexOf(tianxi[0].branch) - BRANCHES.indexOf(hongluan[0].branch) + 12) % 12,
    6,
    `${BRANCHES[yearBranch]}연도 홍란 및 천희는 대궁여야 합니다.`,
  );
}

console.log("✓ Jiayin 사례와 12년 분기 홍란천희 매핑, 고유성 및 대궁 관계 회귀에 합격했습니다.");
