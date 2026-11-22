/* *
 * 절기 사주 봄의 시작/절기 경계는 시간에 정확함 - 회귀 테스트
 *
 * 배경 (2026-09-01) : 회원 피드백 "Ziwei 배반에서 나를 위해 순위를 매긴 사주가 정확하지 않습니다. 연도 열은 Guiwei입니다. 봄의 시작은 19시입니다...나는 Jiashen 연도가 아닙니다."
 * 확인 : 음력2004 음력 14일 = 양력2004-02-04 2004년 봄의 시작 = 당일 19시 56분, 회원(축시)은 입춘 이전 오전 2시 40분에 태어났습니다.
 * 팔자 연도 열은 Guiwei(월 열 Yichou와 함께)여야 하지만 배반는 ​​Jiashen/Bingyin입니다.
 * 근본 원인: 절기 사주는 원래 lunar-javascript의 getYearGanByLiChun()/getMonthGan()을 사용했는데, 이는 "봄이 시작되는 날 하루 종일" 전환을 의미하며,
 * 시간에 관계없이(실제로 측정한 시간이 지나도 무효임), 초봄의 이른 아침에 태어난 사람을 새해로 간주합니다.
 * 수정: 대신 getEightChar()를 사용하고(봄/축제가 시작되는 시간에 맞춰 정확함), 시간은 시진 중간점(색인*2)으로 근사화됩니다.
 *
 * 본 테스트는 잠김: ① 회원 사례 수정, ② 비일일에 사고로 부상을 입지 않음, ③ 봄이 시작되는 날 "전/후" 분류 수정. */
import assert from 'node:assert/strict';
import { generateChart } from '../../lib/ziwei/algorithm';

let passed = 0;
const ok = (name: string, cond: boolean) => { assert.ok(cond, `❌ ${name}`); console.log(`  ✅ ${name}`); passed++; };
const sizhu = (y: number, mo: number, d: number, h: number) =>
  (generateChart({ year: y, month: mo, day: d, hour: h, gender: 'male' } as any) as any).lunarInfo;

// ① 회원사례 : 2004-02-04 축시 (입춘 19시 56분 전) → 절기는 해기둥인 귀위와 달기둥인 일초를 말한다.
const m = sizhu(2004, 2, 4, 1);
ok("회원 사례 태양 용어 사주 연도 기둥 = Guiwei(봄이 시작되기 전, Jiashen이 아님)", m.fourPillars?.[0] === '癸未');
ok("회원 사례 태양 용어 사주 Yuezhu = Yichou(공동 수정, 빙음 아님)", m.fourPillars?.[1] === '乙丑');
ok("회원 사례: 비태양년 사주 연도 열 = Jiashen(첫 번째 달의 첫 번째 달 음력, 변경되지 않음)", m.fourPillarsLunar?.[0] === '甲申');

// ② 봄이 시작되는 전날/다음날 : 국경 양쪽이 정확함
ok("2004-02-03 축시 (봄이 시작되기 전날) 절기 연도 열 = Guiwei", sizhu(2004, 2, 3, 1).fourPillars?.[0] === '癸未');
ok("2004-02-05 축시 (봄이 시작된 다음날) 태양주 = Jiashen", sizhu(2004, 2, 5, 1).fourPillars?.[0] === '甲申');

// ③ 봄이 시작되는 날에는 '시간 전 vs 후'가 정확하게 분류됩니다. (당일 시진가 다름)
// 봄의 시작=19:56(술시19-21). 축시(idx1=02포인트)가 전면에 있음 → Guiwei; 해시(idx11=22포인트)가 뒤쪽 → Jiashen에 있습니다.
ok("2004-02-04 축시 (봄이 시작되기 전) → Guiwei", sizhu(2004, 2, 4, 1).fourPillars?.[0] === '癸未');
ok("2004-02-04 해시 (봄이 시작된 후) → Jiashen", sizhu(2004, 2, 4, 11).fourPillars?.[0] === '甲申');

// ④ 비일요일 우발적 파손 방지 (기대값 고정, 반품방지시 소극적)
const c = sizhu(1990, 6, 15, 6);
ok("비태양일 1990-06-15 오시 절기 사주 안정 = Gengwu/Renwu/Xinhai/Jiawu",
   JSON.stringify(c.fourPillars) === JSON.stringify(['庚午', '壬午', '辛亥', '甲午']));

// ⑤ 일 열과 시간 열은 봄의 시작에 영향을 받지 않습니다. (회원 사례: 일 열은 귀추, 시간 열은 귀초)
ok("태양 기둥은 Spring 경계의 시작에 영향을 받지 않습니다(회원 사례 = Guichou).", m.fourPillars?.[2] === '癸丑');
ok("시간 열은 Spring 경계 시작(멤버 케이스 축시=Guichou)의 영향을 받지 않습니다.", m.fourPillars?.[3] === '癸丑');

console.log(`\n[sizhu-lichun-boundary] ${passed}모든 어설션이 통과됨`);
