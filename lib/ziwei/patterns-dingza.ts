/* *
 * "자미두수전서" 1권 "잡게임 정하기" 8프레임 · 엄격하게 구현
 *
 * 원문: 1권 "딩자주"에는 8개의 기사가 포함되어 있으며 각 기사에는 주석이 있습니다. 동행 장 "Ding Gui Bureau" "Ding Gui Bureau" "Ding Gui Bureau" "Ding Poverty Bureau"
 * 패턴-dinggui/dingfu/dingpin.ts를 참조하세요. 학문을 해석하다(문자 그대로, 편안하지 않고,
 * 본문에 모호한 부분이 있을 경우(논의의 여지가 있음을 표기하고 읽은 내용을 표시) 다른 곳과 동일합니다.
 *
 * ★ 이 테이블과 처음 4개 테이블의 근본적인 차이점: 히트 단위는 명반이 아니라 행운 제한입니다.
 * 주석에 있는 "두 개의 한계", "부족한계", "만나는한계"라는 단어는 "행운은 마흔 이후에 온다", "전자의 한계 뒤에는 나중의 한계가 올 것이다", "좋은 한 해"
 * 1년은 좋지 않습니다.", 8개 모두 대한 또는 유년 단위입니다. 따라서 이 모듈의 돌아가기 값은
 * "대한(또는 유년의 어느 섹션)이 참인 그리드는 무엇입니까?"는 "그리드가 있는지 여부"라는 부울이 아닙니다.
 * 소비 방식: `detectDingZa(chart)`가 전액을 가져갑니다. `detectDingZa(chart, { age })`
 * 세는나이를 덮는 부분을 가져옵니다(UI에 "현재 대한"를 표시하려면 Chart.currentAge를 사용하세요).
 * **이 테이블을 감지 패턴에 연결하지 마세요** - 패턴을 명반 패턴 목록에 삽입하세요.
 * 이는 『전서』의 원문 자체가 구분하는 두 가지 범주입니다.
 *
 * 공유 측정(8개의 주석은 "약함/상서로움/좋음"을 반복적으로 사용하며 하나의 구경에 따라 판단되어야 합니다.
 * 그렇지 않은 경우 각 항목은 별도로 심사되며 이는 암시적 완화와 동일합니다.)
 * - Palace 약함: 주성 또는 주성 없음 밝기Raw가 모두 "갇혀" 있습니다(7개 수준의 구경, 딩핀과 일치).
 * - Gongqiang(상서로운 장소): 주성 ≥1 및 최소 하나의 밝기Raw가 "사원" 또는 "왕"입니다.
 * - 제한된 선: 명궁만 강하고 수명 제한 삼방사정은 길성 ≥2이며 여섯 명의 악령은 ≤1입니다.
 * - 길성 구경: 좌보우필, Changqu, Kuiyue, 녹존, 천마, 주성사화(dinggui와 일치)
 * - 공수 구경: 순공/부순/Jumping/절공/Airborne/부절 6성 전체 목록(dinggui/dingpin과 일치)
 * - 유년명궁: 유년지지가 위치한 궁에 만족하세요(두슈는 정통적이고 안전합니다). 유년지지는 양력의 연대순으로 권장됩니다
 * ((생년 + 세는나이 − 5 중) mod 12), 음력/춘제 경계의 시작 디스크 위치 오차 ±1년
 * 경계연도에만 영향을 미칩니다. 이유는 6번에서 확인하세요. 유년사화가 설정되지 않았습니다(유년사화는 이 구현에 포함되지 않음).
 * 유년의 좋고 나쁨은 생년사화와 궁궐의 별에 의해서만 판단될 수 있습니다. 세분성이 거칠기 때문에 no.6은 논쟁의 여지가 있는 것으로 표시됩니다.
 *
 * ⚠️ 대상 함정: `ZiweiChart.palaces`는 실제로 음궁(분기=2)에서 시작하며,
 * 항상 지점별로 검색하세요. 아래첨자는 금지됩니다. 대한의 순서는 startAge순으로 정렬되어야 합니다.
 * daXians 배열 자체는 주문이 보장되지 않습니다(패턴딩귀 시대에 확인됨). */

import type { ZiweiChart, Star, DaXian } from './types';
import type { GeStatus } from './patterns-dinggui';

// ────────────────── 디스크 읽기 ──────────────────

const palaceAt = (c: ZiweiChart, branch: number) =>
  c.palaces.find(p => p.branch === ((branch % 12) + 12) % 12)!;

const starsAt = (c: ZiweiChart, branch: number): Star[] => palaceAt(c, branch).stars;

const has = (c: ZiweiChart, branch: number, name: string): boolean =>
  starsAt(c, branch).some(s => s.name === name);

const starOf = (c: ZiweiChart, branch: number, name: string): Star | undefined =>
  starsAt(c, branch).find(s => s.name === name);

const majorsAt = (c: ZiweiChart, branch: number): Star[] =>
  starsAt(c, branch).filter(s => s.type === 'major');

/* * 이 궁 + 삼합 + 대궁 */
const sanFang = (b: number): number[] => [b, (b + 4) % 12, (b + 8) % 12, (b + 6) % 12];

// ────────────────── 공유 지표 ──────────────────

const SHA_STARS = ['擎羊', '陀罗', '火星', '铃星', '地空', '地劫'];
const JI_STARS = ['左辅', '右弼', '文昌', '文曲', '天魁', '天钺', '禄存', '天马'];
const KONG_STARS = ['旬空', '副旬', '截路', '截空', '空亡', '副截'];
const MU_BRANCHES = [1, 4, 7, 10]; // 츄첸은 아직 여기 있어요, 무덤이 4개 있어요

const isXian = (s: Star): boolean => s.brightnessRaw === '陷';
const isMiaoWang = (s: Star): boolean => s.brightnessRaw === '庙' || s.brightnessRaw === '旺';

/* * 약한 궁: 주성 없음, 또는 모두 주성 */
const isWeakPalace = (c: ZiweiChart, b: number): boolean => {
  const majors = majorsAt(c, b);
  return majors.length === 0 || majors.every(isXian);
};

/* * 공강(길상) : 주성이 있고 적어도 하나의 묘왕이 있습니다. */
const isStrongPalace = (c: ZiweiChart, b: number): boolean =>
  majorsAt(c, b).some(isMiaoWang);

/* * Zhugonhui 길성 번호 (길성朜 + 주성사화 Luquanke) */
const jiCountIn = (c: ZiweiChart, branches: number[]): number =>
  branches.reduce((n, b) => n + starsAt(c, b).filter(
    s => JI_STARS.includes(s.name) || (s.type === 'major' && s.siHua && s.siHua !== '忌'),
  ).length, 0);

/* * 궁궐의 여섯 악수 */
const shaCountIn = (c: ZiweiChart, branches: number[]): number =>
  branches.reduce((n, b) => n + starsAt(c, b).filter(s => SHA_STARS.includes(s.name)).length, 0);

const isKongPalace = (c: ZiweiChart, b: number): boolean =>
  starsAt(c, b).some(s => KONG_STARS.includes(s.name));

/* *양품 한정 : 명궁 강함 + 삼방사정 휘지 ≥2 + 리우샤 ≤1 (구경은 머리 부분 참고) */
const isXianHao = (c: ZiweiChart, dx: DaXian): boolean => {
  const b = dx.palaceBranch;
  if (!isStrongPalace(c, b)) return false;
  const sf = sanFang(b);
  return jiCountIn(c, sf) >= 2 && shaCountIn(c, sf) <= 1;
};

/* * 별이 공허한 죽음의 궁에 앉아 있다(운세가 쇠퇴하고 말이 갇혔을 때 사용) : 별이 위치한 궁에는 공허한 죽음의 별이 있다. */
const starSitsKong = (c: ZiweiChart, name: string): boolean => {
  const b = c.palaces.find(p => p.stars.some(s => s.name === name))?.branch;
  return b === undefined ? false : isKongPalace(c, b);
};

/* * 유년지지 (양력 연도 순서는 대략적인 것입니다. 헤더 참고 참조): 세는나이 연령 → 지지 지수 */
const yearBranchOf = (c: ZiweiChart, age: number): number =>
  (((c.birthInfo.year + age - 1 - 4) % 12) + 12) % 12;

type Grade = 'ji' | 'xiong' | 'ping';

/* *
 * 유년 좋거나 나쁨(6번의 경우 구경에 대한 헤드 노트 참조):
 * - 불운: 유년명궁은 생년화기에 앉아 있거나 Liusha ≥2에 앉아 있습니다.
 * - Ji: 삼방사정은 행운이 있을 것입니다(녹존/화록) 또는 길성 ≥ 2이고 명궁은 불운이 아닙니다.
 * - 플랫: 나머지. */
const liuNianGrade = (c: ZiweiChart, age: number): Grade => {
  const b = yearBranchOf(c, age);
  const shaInMing = starsAt(c, b).filter(s => SHA_STARS.includes(s.name)).length;
  const jiInMing = starsAt(c, b).some(s => s.siHua === '忌');
  if (jiInMing || shaInMing >= 2) return 'xiong';
  const sf = sanFang(b);
  const hasLu = sf.some(x => starsAt(c, x).some(s => s.name === '禄存' || s.siHua === '禄'));
  if (hasLu || jiCountIn(c, sf) >= 2) return 'ji';
  return 'ping';
};

// ───────────────── 종류 ──────────────────

export interface DingZaGe {
  /* *원작 일련번호 1~8 */
  no: number;
  name: string;
  /* * 원본 텍스트 주석 */
  note: string;
  status: GeStatus;
  /* * 상태에 대해 이의가 있을 때의 설명; 파생어는 발음을 설명해야 할 때도 사용됩니다. */
  why?: string;
  /* * 타격 유닛 : 대한 / 유년 / 명반 */
  unit: '大限' | '流年';
  /* *
   * 판단 기능: 돌아가기가 적중한 행운 한계 목록입니다.
   * - 단위 === '대한': 돌아가기가 대한을 공격합니다(dxs는 시작 연령을 기준으로 정렬됨).
   * - 단위 === '유년': 돌아가기는 "유년 창"입니다 - startAge/endAge로 표현됩니다.
   * 2년 연속 번갈아 발생하며, PalaceBranch/palaceName은 1년 후의 유년명궁을 나타냅니다. */
  judge?: (c: ZiweiChart, dxs: DaXian[]) => Array<{
    dx?: DaXian;
    startAge?: number;
    endAge?: number;
    detail?: string;
  }>;
}

// ───────────────── 사각형 8개 ──────────────────

export const DING_ZA_GE: DingZaGe[] = [
  {
    no: 1,
    name: '风云际会',
    note: "신궁과 명궁이 약하더라도 두 운한에서 녹존과 천마를 만나는 경우이다.",
    status: 'derivable',
    unit: '大限',
    // "두 개의 한계"에 대한 일반적인 설명은 대한 및 유년의 이중 레이어입니다. 유년 레이어는 형상에 따라 거의 유휴 상태입니다. 유년명궁 10년 후
    // 열 번째 집에서 삼방사정은 10×4 궁을 덮고 있으며 거의 전체 지역을 덮고 있습니다. 세 파티 대한이 Luma를 만나는 한,
    // 창에 유년이 거의 확실하게 있을 것입니다(프로브에 의해 측정된 이중층 및 단일층 개수는 동일합니다). 그러므로 대한 레이어를 취하고,
    // 결론은 1번 이유에 명시되어 있으며 완화된 것으로 간주되지 않습니다.
    // "몸도 생명도 약하지만": 명궁, 신궁 모두 약하다(머리 부분에 약한 구경이 보인다).
    // "펑루마": 수명 제한은 삼방사정이고 행운이 있을 것이며(녹존/화록) 천마가 될 것입니다.
    why:
      "\"두 번째 한계\" 이중 레이어 읽기 방법 유년 레이어는 거의 유휴 상태입니다. 유년명궁은 10년 만에 10하우스를 통과하고 삼방사정 적용 범위는 다음과 같습니다." +
      "≒ 전체적으로 대한 레이어가 성립되면 유년 레이어가 거의 확실하게 성립되므로(측정 개수는 동일) 대한 레이어가 결정됩니다.",
    judge: (c, dxs) => {
      if (!isWeakPalace(c, c.mingGongBranch)) return [];
      if (!isWeakPalace(c, c.shenGongBranch)) return [];
      return dxs.filter(dx => {
        const sf = sanFang(dx.palaceBranch);
        const hasLu = sf.some(b =>
          starsAt(c, b).some(s => s.name === '禄存' || s.siHua === '禄'));
        const hasMa = sf.some(b => has(c, b, '天马'));
        return hasLu && hasMa;
      }).map(dx => ({ dx }));
    },
  },
  {
    no: 2,
    name: '锦上添花',
    note: "운한의 흉성이 깨지고 길한 자리로 나아가는 경우이다.",
    status: 'derivable',
    unit: '大限',
    // "사악한 별을 부수는 제한"은 사악한 별을 데리고 한계를 유지합니다 (명궁 자신의 집으로 제한됨). "경서 여행"은 완전 한정 좋은 자질을 취합니다
    // (명궁 강자 + 삼자 길조 ≥ 2 + 육사악 ≤ 1로 한정) - 한계를 지키는 사악은 삼자 모두 중에서 유일한 악입니다.
    // 깨지지 않고 깨지는 것은 "케이크 위의 장식"입니다. 첫 번째 버전은 Gong Qiang만 사용합니다(행운/불운에 대한 기준 없음). 실제 측정값은 22%/한도입니다.
    // 디스크의 96%가 아무런 판단 없이 조여져 있습니다.
    judge: (c, dxs) => dxs.filter(dx =>
      starsAt(c, dx.palaceBranch).some(s => SHA_STARS.includes(s.name)) &&
      isXianHao(c, dx),
    ).map(dx => ({ dx })),
  },
  {
    no: 3,
    name: '禄衰马困',
    note: "운한에서 칠살·녹존·천마·공망을 만나는 경우이다.",
    status: 'derivable',
    unit: '大限',
    // "칠살로 제한됨": 삼방사정 및 칠살로 제한됩니다("Feng"은 회의를 의미하며 이 표의 다른 "Fun"과 일치함).
    // "Lu Ma is dead in the air": 이름이 "Lu Sheng"(녹존이 공중에서 사망) + "말이 갇혔습니다"(천마가 공중에서 사망)로 변경됩니다.
    // 둘 다 같이 가져가고 **를 선택하면 공허 속에서 죽는다(6개의 빈 데스스타의 구경, 운명 상태는 궁에만 국한되지 않는다).
    // 'Either Sit in the Air'의 첫 번째 버전은 실제로 22%/제한 및 66%의 시장 점유율을 측정했으며 아무런 판단도 없으며 엄격해졌습니다.
    judge: (c, dxs) => dxs.filter(dx => {
      const sf = sanFang(dx.palaceBranch);
      const sha7 = sf.some(b => has(c, b, '七杀'));
      const luMaKong = starSitsKong(c, '禄存') && starSitsKong(c, '天马');
      return sha7 && luMaKong;
    }).map(dx => ({ dx })),
  },
  {
    no: 4,
    name: '衣锦还乡',
    note: "소년기에 뜻을 이루지 못하고 마흔 이후 묘운으로 들어가는 경우이다.",
    status: 'disputed',
    unit: '大限',
    // "청소년 무능력"은 이력서 진술입니다. 이사회에서는 어떠한 판단도 내리지 않습니다. 이 모듈은 판단의 후반부만 판단합니다.
    // 대한의 시작 연령은 ≥ 40이며, 명궁은 4개의 무덤(Chou Chen Wei Xu, 묘행 구경)으로 제한됩니다.
    why:
      "\"청소년 마비\"는 이력서 진술이며 명반은 판단할 수 없으며 \"40 이후 무덤에서의 행운\"이라는 문장의 절반만 충족됩니다." +
      "Chou Chen Wei Xu의 대한 시작 연령은 ≥ 40이고 제한은 명궁입니다. 문장의 전반부는 사용자 자신의 증거 또는 정황 증거에 맡깁니다.",
    judge: (c, dxs) => dxs.filter(dx =>
      dx.startAge >= 40 && MU_BRANCHES.includes(dx.palaceBranch),
    ).map(dx => ({ dx })),
  },
  {
    no: 5,
    name: '步数无依',
    note: "앞 운한과 뒤 운한이 끊김 없이 이어지는 경우이다.",
    status: 'disputed',
    unit: '大限',
    // "연속적이고 구별할 수 없는" 주석가들은 명확한 설명을 갖고 있지 않습니다. 읽는 방법: 인접한 두 대한의 한계 명궁은 모두 약합니다 (공약 구경)
    // ——두 개의 연속 한도, 즉 "지원 없음"에 의존할 주성이 없습니다. 히트는 후자 한계에 기록되고 왜 전자 한계의 궁이 포함되어 있는지.
    why:
      "\"연속 및 불가분\"이라는 해설자는 명확한 설명이 없으므로 읽는 방법은 \"두 개의 인접한 극한 명궁이 모두 약합니다(의존할 주성이 없습니다)\"," +
      "히트는 백 리미트에 기록됩니다. 약한 궁 = 주성 또는 주성이 모두 갇혀 있지 않습니다.",
    judge: (c, dxs) => {
      const out: Array<{ dx: DaXian; detail?: string }> = [];
      for (let i = 1; i < dxs.length; i++) {
        const prev = dxs[i - 1], cur = dxs[i];
        if (isWeakPalace(c, prev.palaceBranch) && isWeakPalace(c, cur.palaceBranch)) {
          out.push({
            dx: cur,
            detail: `예비${prev.startAge}-${prev.endAge}년 (${palaceAt(c, prev.palaceBranch).name}) 이 한계조차 약하다`,
          });
        }
      }
      return out;
    },
  },
  {
    no: 6,
    name: '水上驾星',
    note: "한 해는 좋고 다음 해는 좋지 않은 경우이다.",
    status: 'disputed',
    unit: '流年',
    // 유일한 그리드는 유년입니다. "좋음"과 "나쁨"의 원문은 기준이 없으며 자체적으로 구축한 척도입니다(liuNianGrade,
    // 구경(머리에 있는 참고 사항 참조): 불운 = 유년명궁이 생년화기에 앉아 있거나 Liusha ≥2에 앉아 있음; 길조 = 세 사람이 행운을 누릴 것입니다
    // 아니면 상서로운 일이 될 것입니다. ≥2이고 명궁은 운이 좋지 않습니다. 심지어 = 나머지. "한 해는 좋고 다른 해는 나쁘다" = 2년 연속 존재
    // 행운과 불운은 서로 뒤따릅니다(그 사이에 평범한 해가 없습니다). 히트는 교대로 발생하는 한 쌍의 연도에 기록됩니다.
    why:
      "\"좋음\"과 \"나쁨\"의 원문에는 기준이 없으며 자체 구성 기준입니다 (사나움 = 유년명궁, 생년화기 또는 여섯 악령 ≥ 2;" +
      "Ji = 세 당사자가 운이 좋거나 운이 좋을 것입니다. ≥ 2이고 명궁은 나쁘지 않습니다. 유년사화를 제외하면 세분화가 거칠어집니다." +
      "유년지지는 양력의 연도 순서에 따라 계산되며, 음력/봄 경계 연도의 시작은 ±1년의 오차를 갖습니다. 교대 = 2년 연속 행운과 불운.",
    judge: (c, dxs) => {
      const lastAge = dxs.length ? dxs[dxs.length - 1].endAge : 100;
      const out: Array<{ startAge: number; endAge: number; detail: string }> = [];
      for (let a = 1; a < lastAge; a++) {
        const g1 = liuNianGrade(c, a), g2 = liuNianGrade(c, a + 1);
        const alt = (g1 === 'ji' && g2 === 'xiong') || (g1 === 'xiong' && g2 === 'ji');
        if (alt) {
          const b2 = yearBranchOf(c, a + 1);
          out.push({
            startAge: a,
            endAge: a + 1,
            detail: `아니요.${a}-${a + 1}연도(세는나이)는 좋은 시기와 나쁜 시기가 번갈아 나타나고 다음 해 유년명궁${palaceAt(c, b2).name}`,
          });
        }
      }
      return out;
    },
  },
  {
    no: 7,
    name: '吉凶相伴',
    note: "명궁에 주성이 있고 운한이 앞서면 발복하지만 운한이 쇠하면 발복하지 않는 경우이다.",
    status: 'disputed',
    unit: '大限',
    // 문장 모호성 : "운명은 주성 / 제한되면 일어난다 / 제한되면 일어나지 않을 것이다" - "Limited"는 "제한된 만남"을 의미하며,
    // 하나는 "제한된 힘"입니다. 측정 가능한 판독: 명궁에는 주성이 있습니다(전제). 이 한도는 양호합니다(좋은 구경으로 제한됨).
    // 머리 참조), 한계는 "머리카락" 한계입니다. 한도가 좋지 않으면 전송되지 않습니다. hit = 라이프는 주성 이고 리미트는 좋습니다.
    why:
      "문장 분할의 모호함(\"보내기 전에 제한되어 있으면\", 한 단어는 충족으로 제한되고, 다른 단어는 강함으로 제한됨), \"명궁에는 주성이 있고 이 제한은 좋습니다.\"" +
      "(명궁qiang + 삼자 길조 ≥ 2 + 여섯 악령 ≤ 1에 한함), \"법 한계\"의 읽기 방법입니다.",
    judge: (c, dxs) => {
      if (majorsAt(c, c.mingGongBranch).length === 0) return [];
      return dxs.filter(dx => isXianHao(c, dx)).map(dx => ({ dx }));
    },
  },
  {
    no: 8,
    name: '枯木逢春',
    note: "본명은 쇠하나 운한이 좋은 경우이다.",
    status: 'derivable',
    unit: '大限',
    // "약한 생명" = 명궁 약함(약한 궁 구경); "한정 상품" = 제한된 좋은 구경(한정 명궁 강함 + 3인이 행운을 누림)
    // ≥2 + 리우샤 ≤1). no.7과의 차이점은 전제에만 있습니다. 이 명궁은 약하고 명궁에는 주성이 있습니다.
    judge: (c, dxs) => {
      if (!isWeakPalace(c, c.mingGongBranch)) return [];
      return dxs.filter(dx => isXianHao(c, dx)).map(dx => ({ dx }));
    },
  },
];

// ───────────────── 입구 ──────────────────

export interface DingZaHit {
  no: number;
  name: string;
  note: string;
  status: GeStatus;
  /* * 타격 유닛 : 대한 / 유년 */
  unit: '大限' | '流年';
  /* * 대한 시작 연령(대한 그리드) 또는 대체 시작 연령(유년 그리드) */
  startAge?: number;
  endAge?: number;
  /* *다음 연도에는 명궁(대한 그리드) 또는 유년명궁(유년 그리드)로 제한됩니다. */
  palaceBranch?: number;
  palaceName?: string;
  detail?: string;
  why?: string;
}

/* *
 * 게임의 패턴을 결정합니다. 돌아가기는 전체 히트를 기록합니다(각 대한/유년 창에 대해 하나씩).
 *
 * - `opts.age`가 주어지면 돌아가기만이 세는나이의 히트를 커버합니다.
 * 유년 창: startAge 또는 endAge는 연령과 같습니다).
 * - 돌아가기 순서: 먼저 그리드 번호를 누른 다음 시작 연령을 누릅니다. */
export function detectDingZa(
  chart: ZiweiChart,
  opts?: { age?: number },
): DingZaHit[] {
  const dxs = [...chart.daXians].sort((a, b) => a.startAge - b.startAge);
  const out: DingZaHit[] = [];
  for (const g of DING_ZA_GE) {
    if (!g.judge) continue;
    const geWhy = g.why;
    for (const u of g.judge(chart, dxs)) {
      const dx = u.dx;
      const startAge = dx?.startAge ?? u.startAge;
      const endAge = dx?.endAge ?? u.endAge;
      const b = dx?.palaceBranch ?? (u.startAge !== undefined
        ? yearBranchOf(chart, u.endAge ?? u.startAge) : undefined);
      if (opts?.age !== undefined) {
        if (startAge === undefined || endAge === undefined) continue;
        if (g.unit === '大限' ? (opts.age < startAge || opts.age > endAge)
                              : (opts.age !== startAge && opts.age !== endAge)) continue;
      }
      out.push({
        no: g.no,
        name: g.name,
        note: g.note,
        status: g.status,
        unit: g.unit,
        startAge,
        endAge,
        palaceBranch: b,
        palaceName: b === undefined ? undefined : palaceAt(chart, b).name,
        detail: u.detail,
        why: geWhy,
      });
    }
  }
  out.sort((a, b) => a.no - b.no || (a.startAge ?? 0) - (b.startAge ?? 0));
  return out;
}

/* * 판정 가능한 항목 수(8개 항목 모두 구현, 쟁점 항목도 포함) */
export const DING_ZA_JUDGEABLE = DING_ZA_GE.filter(g => !!g.judge).length;

/* * "현재 세는나이"를 누르면 현재 행운 한도의 잡다한 히트를 얻을 수 있습니다(UI 편리 입장) */
export function getCurrentDingZa(chart: ZiweiChart): DingZaHit[] {
  return detectDingZa(chart, { age: chart.currentAge });
}
