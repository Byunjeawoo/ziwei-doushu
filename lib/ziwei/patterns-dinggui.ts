/* *
 * "자미두수전서" 1권 "Dinggui Bureau" 27개 사각형 · 엄격하게 구현됨
 *
 * 원본: 1권 "Dinggui Bureau"에는 각각 주석이 달린 27개의 기사가 포함되어 있습니다. 원본 책 자체에는 이 네 개의 테이블만 있습니다.
 * (딩부국 6 / 딩귀국 27 / 딩빈곤국 8 / 딩기타국 8), 총 49개 항목.
 *
 * 학문의 해석:
 * 1. 주석에 명시된 모든 조건은 원문에 없는 "삼방사정" 등의 단어를 완화하거나 추가하지 않고 문자 그대로 이행해야 합니다.
 * 2. 주석에 "이전 코멘트를 참조하세요"만 표시되어 있는 경우에는 "두슈 골수부"로 돌아가서 조건을 얻으세요. 여기서는 이를 토대로 문장을 `note`에 표기합니다.
 * 3. An Xing 방식으로 직역이 불가능한 경우에는 `unreachable`로 표시하고 기하학적인 이유를 기술한다.
 * "Always 돌아가기 false" 데드코드를 쓰지 마세요 - 왜 쓸 수 없는지 다음 사람이 한눈에 알 수 있도록 해주세요.
 * 4. 주석 자체가 모호하고 과거 왕조의 주석자들의 명확한 해석이 없는 경우에는 `disputed`로 표시하며, 가장 대중적인 해석을 사용하여 이를 실현하고 표시합니다.
 *
 * 별도의 파일이 필요한 이유: 원본 `patterns.ts`의 41개 인식기 중 10개만 4개의 그리드 테이블에 포함됩니다.
 * 그 중 4개는 완화된 내용이고, 1개는 불완전하며, 1개는 틀렸습니다. 27개 항목을 직접 넣으면 원래의 느슨한 기준과 혼합됩니다.
 * 별도로 측정할 수 없습니다. 이 모듈은 단 한 가지 작업만 수행합니다. 즉, 원본 텍스트에 따라 판단하고 별도로 계산할 수 있는 일련의 결과를 출력합니다.
 *
 * ⚠️ 디스크 개체 트랩: `ZiweiChart.palaces` 주석에는 "Sort by 지지 0-11"이라고 되어 있지만,
 * 실제로 순위는 Yin Palace(브랜치=2)부터 시작됩니다. **항상 지점별로 검색하세요. 아래 첨자는 금지됩니다. ** */

import type { ZiweiChart, Palace, Star } from './types';

// ────────────────── 상수 ──────────────────

/* *별을 파괴하세요. 각 진영마다 시작 방법이 다릅니다(순공/부순/Jielu/절공/Empty Death/부절). 여기 디스크에 별이 있습니다. */
const KONG_STARS = ['旬空', '副旬', '截路', '截空', '空亡', '副截'];

/* *
 * "길성" 구경: 좌보우필, 문창문곡, 천괴천월, 녹존 및 사화의 Luquaanke.
 *천마가 길성에 포함되는지 여부에 따라 의견이 다르므로(순전히 상서로운 것이 아닌 이마 소유자가 이사한 것임) 여기에는 관대하게 포함됩니다.
 * "Forty-Nine Box Control"의 실제 측정된 구경과 일치합니다. 정확도를 변경하려면 이 테이블에서 "천마"를 삭제하세요. */
const JI_STARS = ['左辅', '右弼', '文昌', '文曲', '天魁', '天钺', '禄存', '天马'];

/* * Hai어 태음의 별칭('Dinggui Bureau' 제3조의 주석에 포함된 동의어) */
export const YUE_LANG_TIAN_MEN = '月朗天门';

// ────────────────── 디스크 읽기 ──────────────────

const palaceAt = (c: ZiweiChart, branch: number): Palace =>
  c.palaces.find(p => p.branch === ((branch % 12) + 12) % 12)!;

const has = (c: ZiweiChart, branch: number, name: string): boolean =>
  palaceAt(c, branch).stars.some(s => s.name === name);

const hasAny = (c: ZiweiChart, branch: number, names: string[]): boolean =>
  names.some(n => has(c, branch, n));

/* * 별이 위치한 집의 지지 지수; 돌아가기 차트에 없으면 -1 */
const starBranch = (c: ZiweiChart, name: string): number =>
  c.palaces.find(p => p.stars.some(s => s.name === name))?.branch ?? -1;

/* * 궁 이름에 해당하는 지지 인덱스; 돌아가기 -1을 찾을 수 없습니다 */
const palaceBranch = (c: ZiweiChart, name: string): number =>
  c.palaces.find(p => p.name === name)?.branch ?? -1;

/* * 이 궁 + 삼합 + 대궁 (명궁삼방사정) */
const sanFang = (b: number): number[] => [b, (b + 4) % 12, (b + 8) % 12, (b + 6) % 12];

// "클램프" = 명궁은 분리되지 않은(±2) 전후(±1)의 인접한 두 궁입니다.
// 2026-11-03 정정: 첫 번째 버전에서는 (b+10)/(b+2)(분리된 위치)를 잘못 표기하여 해와 달이 섞이고 보조와 bi가 섞이는 현상이 발생했습니다.
// '별도의 궁'으로 판단되며, 루마페이인에서는 '여는 말 뒤에 있는 궁에 있다'라는 유일하게 얻을 수 있는 형태를 배제한다.
const prevBranch = (b: number) => (b + 11) % 12;
const nextBranch = (b: number) => (b + 1) % 12;
const oppositeBranch = (b: number) => (b + 6) % 12;

const isKong = (c: ZiweiChart, b: number) => hasAny(c, b, KONG_STARS);

const hasHua = (c: ZiweiChart, b: number, hua: '禄' | '权' | '科' | '忌') =>
  palaceAt(c, b).stars.some(s => s.siHua === hua);

const starOf = (c: ZiweiChart, b: number, name: string): Star | undefined =>
  palaceAt(c, b).stars.find(s => s.name === name);

/* * 묘왕: Temple과 Wang의 두 가지 레벨. 이득/이익/짝수/아님/유휴/트랩은 계산되지 않습니다. */
const isMiaoWang = (c: ZiweiChart, b: number, name: string): boolean => {
  const raw = starOf(c, b, name)?.brightnessRaw;
  return raw === '庙' || raw === '旺';
};

/* * 이 궁의 수 길성 (사화 Lu Quanke 포함) */
const jiCount = (c: ZiweiChart, b: number): number => {
  let n = palaceAt(c, b).stars.filter(s => JI_STARS.includes(s.name)).length;
  for (const h of ['禄', '权', '科'] as const) if (hasHua(c, b, h)) n++;
  return n;
};

const majorCount = (c: ZiweiChart, b: number): number =>
  palaceAt(c, b).stars.filter(s => s.type === 'major').length;

// ───────────────── 종류 ──────────────────

export type GeStatus =
  /* * 원문대로 구현 가능하며, 안씽(An Xing) 방식에도 긍정적인 사례가 있음 */
  | 'derivable'
  /* * An Xing Law에서는 직역이 불가능합니다. (드문 것은 아니지만 절대 불가능합니다.) */
  | 'unreachable'
  /* * 주석에 모호한 부분이 있으며, 과거 왕조의 주석자들도 뚜렷한 해결방안을 제시하지 못하고 있습니다. 실현은 가장 널리 사용되는 솔루션을 기반으로 합니다. */
  | 'disputed';

/* * 원본 Pattern.ts는 이미 동일한 품질을 구현했습니다. */
export type ProjectVerdict = 'ok' | 'loose' | 'partial' | 'wrong' | 'none';

export interface DingGuiGe {
  /* *원작 일련번호 1~27 */
  no: number;
  name: string;
  /* *원문 주석("이전 주석을 본" 사람은 이를 바탕으로 한 구절을 나타냄) */
  note: string;
  status: GeStatus;
  /* * 상태에 도달할 수 없거나 분쟁이 발생한 경우 지침 */
  why?: string;
  /* * 원본 프로젝트에 이미 해당 인식기와 품질이 있는지 여부 */
  inProject: ProjectVerdict;
  /* * 결정 기능; 상태에 도달할 수 없는 경우 기본값 */
  fn?: (c: ZiweiChart) => boolean;
}

// ───────────────── 27개의 정사각형 ──────────────────

export const DING_GUI_GE: DingGuiGe[] = [
  {
    no: 1,
    name: '日月夹命',
    note: "우주에 앉아서 멸망하지 않고 이 궁에서 길성을 만나면 그걸로 끝이다",
    status: 'derivable',
    inProject: 'loose',
    // 이 프로젝트는 "해와 달 클립" + 밝기를 판단하여 "우주에 앉아 있지 않음"과 "이 궁에는 길성이 있습니다"라는 두 가지 기준이 누락되어 느슨합니다.
    fn: c => {
      const b = c.mingGongBranch;
      if (isKong(c, b)) return false;
      if (jiCount(c, b) === 0) return false;
      return (has(c, prevBranch(b), '太阳') && has(c, nextBranch(b), '太阴')) ||
             (has(c, prevBranch(b), '太阴') && has(c, nextBranch(b), '太阳'));
    },
  },
  {
    no: 2,
    name: '日出扶桑',
    note: "태양이 마오쩌둥에 있다는 것은 사실이며 관록궁의 태양과 동일합니다.",
    status: 'derivable',
    inProject: 'none',
    // Mao는 태양 사원 사이트입니다. 주석은 두 가지 배치 지점을 제공합니다. 명궁은 Mao에 있거나 관록궁은 Mao에 있습니다.
    fn: c =>
      starBranch(c, '太阳') === 3 &&
      (c.mingGongBranch === 3 || palaceBranch(c, '官禄') === 3),
  },
  {
    no: 3,
    name: '月落亥宫',
    note: "달은 하이(Hai)에 있으며 웨랑천문(Yue Lang Tianmen)이라고도 불립니다.",
    status: 'derivable',
    inProject: 'none',
    // 하이(Hai)는 절터이고, 천문(Tianmen)은 하이(Hai)이다.
    fn: c => starBranch(c, '太阴') === 11 && c.mingGongBranch === 11,
  },
  {
    no: 4,
    name: '月生沧海',
    note: "달은 전택를 자궁에 유지합니다.",
    status: 'derivable',
    inProject: 'none',
    // 자궁은 넓은 바다이다. 항목 3과 짝을 이루면 하나는 생명을 유지하고 다른 하나는 전택를 유지합니다.
    fn: c => starBranch(c, '太阴') === 0 && palaceBranch(c, '田宅') === 0,
  },
  {
    no: 5,
    name: '辅弼拱主',
    note: "자미 운명을 지켜라 두 별이 너를 응원하는 것도 마찬가지고 그들도 마찬가지다",
    status: 'derivable',
    inProject: 'loose',
    // 주석에는 두 가지 수준이 있습니다. 첫 번째는 "자미 keep your destiny"(전제)이고 그 다음은 "아치"(3방향) 또는 "클립"(앞뒤)입니다.
    // 이 프로젝트는 클립만 만들었고 "자미가 명령을 유지한다"는 전제가 없었기 때문에 느슨했습니다.
    fn: c => {
      const b = c.mingGongBranch;
      if (!has(c, b, '紫微')) return false;
      const gong = sanFang(b).some(x => has(c, x, '左辅')) &&
                   sanFang(b).some(x => has(c, x, '右弼'));
      const jia = (has(c, prevBranch(b), '左辅') && has(c, nextBranch(b), '右弼')) ||
                  (has(c, prevBranch(b), '右弼') && has(c, nextBranch(b), '左辅'));
      const tong = has(c, b, '左辅') && has(c, b, '右弼');
      return gong || jia || tong;
    },
  },
  {
    no: 6,
    name: '君臣庆会',
    note: "자미와 좌보·우필이 함께 명궁을 지키며 천상·무곡·태음까지 만나면 더욱 좋다는 뜻이다.",
    status: 'derivable',
    inProject: 'loose',
    // "shou Ming together"라는 세 단어가 핵심입니다. 삼방사정이 아니라 동궁입니다.
    // 프로젝트는 발동률 6.3%로 'Tonghui 삼방사정'로 변경되었는데, 이는 원문 '동궁'와 완전히 다릅니다.
    // 부록 조건 '오음과 더 친해지기'는 보너스 아이템이지만, 조건은 아니며 본심사에 포함되지 않습니다.
    fn: c => {
      const b = c.mingGongBranch;
      return has(c, b, '紫微') && has(c, b, '左辅') && has(c, b, '右弼');
    },
  },
  {
    no: 7,
    name: '财印夹禄',
    note: "재산을 지키려면 양재상이 와서 꼬집어도 마찬가지고, 돈을 벌 때도 마찬가지다.",
    status: 'unreachable',
    why:
      "천량 및 천상의 위상 대궁 위치는 일정합니다. 천량은 항상 천상에서 시계 방향으로 다음 궁에 있습니다(위상 → 양궁 거리는 항상 1," +
      "예외 없이 실제 테스트 2,400회). 두 개의 별은 명궁의 양면에서 분리될 수 없으며 명궁의 세 부분에 있을 수도 없습니다." +
      "\"Liang Xianglai Ji\"는 An Xing 방법에 대한 해결책이 없습니다. \"Dingfu Bureau\" Caiyin과 동일한 인장.",
    inProject: 'none',
  },
  {
    no: 8,
    name: '禄马佩印',
    note: "말 앞에 운세가 있고, 물개별 동궁도",
    status: 'derivable',
    inProject: 'none',
    // ⚠️ "말 앞에 행운이 있다"라는 주석은 문자 그대로 도달할 수 없습니다. 이는 구조적으로 변함없는 진실입니다. 천마는 Yinshensihai에만 있습니다.
    // 말 앞의 첫 번째 사람과 녹존 10 개의 궁 세트 (Jiayin Yimao Bingsi Ding Wu Wu Si Ji Wu Geng Shen Xin You Ren Hai Guizi)
    // 교차점도 없고 샘플과도 관련이 없습니다. 녹존과 천마의 실제 관계는 줄기와 가지의 조합에 따라 달라집니다.
    // '동궁'와 '말여왕 일궁' 2종 이상이 존재한다(초기 4,800개 샘플에서 '2종만' 검출됐다)
    // 연간 줄기 적용 범위가 충분하지 않은 허위 신원입니다.
    // 따라서 접근 가능한 읽기는 다음과 같습니다: 천마는 운명을 유지하고, 녹존(또는 화록) 동궁 또는 다음 집에 있고 별이 인쇄됩니다(천상) 동궁.
    fn: c => {
      const b = c.mingGongBranch;
      if (!has(c, b, '天马')) return false;
      const luAt = (x: number) => has(c, x, '禄存') || hasHua(c, x, '禄');
      // "다음 집" = 천마 집 +1(nextBranch). Lu는 Ma 앞의 첫 번째 집에서 문자 그대로 접근할 수 없습니다.
      // 위의 참고 사항을 참조하세요. 여기의 두 가지 형식(동궁/Horse 및 첫 번째 궁)은 모두 측정되고 판독 가능합니다.
      return (luAt(b) || luAt(nextBranch(b))) && has(c, b, '天相');
    },
  },
  {
    no: 9,
    name: '坐贵向贵',
    note: "Kuiyue는 평생 동안 나란히 앉아 있다고합니다.",
    status: 'derivable',
    inProject: 'loose',
    // "아치에 앉음" = 명궁(앉음)에 하나, 대궁(향함)에 하나. 이 프로젝트는 아치에 앉아 있는 것이 아니라 "잘라내기"와 "함께 연결"에 관한 것입니다.
    fn: c => {
      const b = c.mingGongBranch;
      const dui = oppositeBranch(b);
      return (has(c, b, '天魁') && has(c, dui, '天钺')) ||
             (has(c, b, '天钺') && has(c, dui, '天魁'));
    },
  },
  {
    no: 10,
    name: '马头带剑',
    note: "말에 우위가 있는 것이 아니라 거무가가 우위에 있다는 말이 사실이다.",
    status: 'unreachable',
    why:
      "\"말에는 가장자리가 있습니다\" = 천마 및 경양동궁. 천마는 Yinshensihai에만 거주하며 항상 녹존 이전 또는 녹존동궁과 함께 첫 번째 궁에 있습니다." +
      "경양는 항상 녹존의 마지막 하우스에 있습니다. 두 궁이 교차하지 않으면 동궁은 절대 불가능합니다(4,800개의 측정된 델타에는 0이 없습니다)." +
      "주석의 마지막 문장 \"is not Juwu\"는 \"운명은 Wu에 있다\"라는 읽기를 자동으로 배제했습니다. 원문에 대한 부정적인 읽기는 프로젝트의 유일한 조건으로 작성되었습니다." +
      "An Xing에는 원문에 대한 긍정적인 해석이 존재하지 않습니다. 이 메모를 읽는 것도 불가능합니다.",
    inProject: 'wrong',
  },
  {
    no: 11,
    name: '七杀朝斗',
    note: "이전 댓글을 참조하세요. 〈골수부〉: \"칠살은 법정에서 싸우고 명예와 부는 번영합니다\"",
    status: 'derivable',
    inProject: 'none',
    // Dou = 북두칠성(Ziwu), 북두칠성은 칠살을 가져가서 Yinshen Ziwu의 네 번째 궁에 보관합니다.
    fn: c => has(c, c.mingGongBranch, '七杀') && [0, 2, 6, 8].includes(c.mingGongBranch),
  },
  {
    no: 12,
    name: '日月并明',
    note: "이전 댓글을 참조하세요. 일반적인 설명: 태양은 Si에 있고, 태음은 You에 있으며, 황도대 별자리는 Si 또는 You입니다.",
    status: 'disputed',
    why:
      "주석은 \"보기 전 주석\"일 뿐이며 \"골수부\"에는 \"해와 달이 모두 밝다\"라는 네 단어가 없으며 각 가문에서 결정한 궁 위치가 다릅니다." +
      "(어떤 사람은 사해에서 태어나고, 어떤 사람은 사우에서 추악한 해와 달을 갖고 태어난다.) 여기에서는 가장 널리 유포된 태양 Si, 태음 You, 운명은 Si You입니다.",
    inProject: 'none',
    fn: c =>
      starBranch(c, '太阳') === 5 && starBranch(c, '太阴') === 9 &&
      (c.mingGongBranch === 5 || c.mingGongBranch === 9),
  },
  {
    no: 13,
    name: '明珠出海',
    note: "이전 댓글을 참조하세요. 운명은 공궁 대궁 추악한 해와 달이 동시에 빛난다",
    status: 'derivable',
    inProject: 'ok',
    // 운명은 미래에 있고, 이 궁에는 주성이 없습니다. 대궁 (추악한) 태양태음동궁. 프로젝트 조건은 이와 일치합니다.
    fn: c => {
      const b = c.mingGongBranch;
      if (b !== 7) return false;
      if (majorCount(c, b) > 0) return false;
      const dui = oppositeBranch(b);
      return has(c, dui, '太阳') && has(c, dui, '太阴');
    },
  },
  {
    no: 14,
    name: '日月同临',
    note: "이전 댓글을 참조하세요. 태양과 달 동궁 당신의 운명을 지켜주세요",
    status: 'derivable',
    inProject: 'ok',
    // 프로젝트 이름은 "Sun and Moon 동궁"이며 조건은 동일합니다.
    fn: c => {
      const b = c.mingGongBranch;
      return has(c, b, '太阳') && has(c, b, '太阴');
    },
  },
  {
    no: 15,
    name: '刑囚夹印',
    note: "천형염정은 용감한 사람들을 담당합니다",
    status: 'derivable',
    inProject: 'none',
    // "Clamp Seal"이라고 하는데, 주석에는 봉인별(천상)이 아닌 "몸과 운명을 함께"라고만 적혀 있습니다.
    // 주석에 따르면 천형 및 염정동궁이고 궁은 명궁 또는 신궁입니다. "클립 천상"를 추가하지 마십시오. 원본 텍스트에는 해당 내용이 없습니다.
    fn: c => {
      const shen = c.shenGongBranch;
      const ming = c.mingGongBranch;
      const hit = (b: number) => has(c, b, '天刑') && has(c, b, '廉贞');
      return hit(ming) || hit(shen);
    },
  },
  {
    no: 16,
    name: '科权禄拱',
    note: "이전 댓글을 참조하세요. Ke Quan Lu San Hua Hui Ming San Fang",
    status: 'derivable',
    inProject: 'partial',
    // 이 프로젝트는 과학기술의 이중 회의만을 위한 것이며 화록이 부족합니다.
    fn: c => {
      const s = sanFang(c.mingGongBranch);
      return (['禄', '权', '科'] as const).every(h => s.some(x => hasHua(c, x, h)));
    },
  },
  {
    no: 17,
    name: '贪火相逢',
    note: "두 스타가 운명을 이어가며 함께 산다고 한다 묘왕",
    status: 'derivable',
    inProject: 'none',
    // "함께 산다 묘왕" 문자 그대로: 두 별이 같은 사원에 있거나 번영해야 합니다. 측정된 트리거 비율은 0.08%로 전체 시계에서 가장 희귀합니다.
    fn: c => {
      const b = c.mingGongBranch;
      return has(c, b, '贪狼') && has(c, b, '火星') &&
             isMiaoWang(c, b, '贪狼') && isMiaoWang(c, b, '火星');
    },
  },
  {
    no: 18,
    name: '武曲守垣',
    note: "Wu Shou Ming Mao Gong은 그렇습니다. Yu는 그렇지 않습니다",
    status: 'derivable',
    inProject: 'none',
    // "나는 아니다"라는 세 단어가 휴식을 방해합니다. 오직 마오공만 인식합니다.
    fn: c => c.mingGongBranch === 3 && has(c, 3, '武曲'),
  },
  {
    no: 19,
    name: '府相朝垣',
    note: "이전 댓글을 참조하세요. Ming Yinshen, 총리 분리 재백, 관록 Chaoming",
    status: 'derivable',
    inProject: 'loose',
    // 두 가지 임계값: 명궁은 Yin Shen으로 제한됩니다. 천부천상은 재백와 관록라는 두 개의 궁을 차지합니다(원문에는 누가 어느 궁에 있는지 명시되어 있지 않습니다).
    // 이 프로젝트에서는 두 개의 별만 동시에 명궁삼방사정에 진입하면 되며, 트리거율은 24.3%이고 완화율은 약 17번입니다.
    fn: c => {
      const b = c.mingGongBranch;
      if (b !== 2 && b !== 8) return false;
      const cai = palaceBranch(c, '财帛');
      const guan = palaceBranch(c, '官禄');
      const tf = starBranch(c, '天府');
      const tx = starBranch(c, '天相');
      return (tf === cai && tx === guan) || (tf === guan && tx === cai);
    },
  },
  {
    no: 20,
    name: '紫府朝垣',
    note: "이전 댓글을 참조하세요. 순서는 Yinshen, 자부 동궁입니다.",
    status: 'derivable',
    inProject: 'none',
    // 자미천부는 Yinshen 동궁에만 존재하므로 "Mingzuo Yinshen"과 "자부 동궁"는 실제로 동일한 것의 양면입니다.
    fn: c => {
      const b = c.mingGongBranch;
      return (b === 2 || b === 8) && has(c, b, '紫微') && has(c, b, '天府');
    },
  },
  {
    no: 21,
    name: '文星暗拱',
    note: "이전 댓글을 참조하세요. 창취가 운명을 꼬집다(다크아치)",
    status: 'unreachable',
    why:
      "문창 및 문곡의 위상 대궁은 항상 짝수입니다(0/2/4/6/8/10, 12개의 시진 1,152개 디스크 모두에서 측정됨)." +
      "두 별은 인접한 두 집에서 거주지를 결코 바꾸지 않으며 양쪽에서 끼일 수 없습니다." +
      "주석은 \"골수부\"에서 나왔습니다. \"문학 스타는 어둠 속에서 아치를 그리며 몸과 운명이 그것을 만난다.\" 문장의 원래 의미는 삼면 아치형을 의미할 수 있지만 An Xing에서는 \"클립\"의 발음이 설명되지 않습니다.",
    inProject: 'ok',
  },
  {
    no: 22,
    name: '权禄生逢',
    note: "2성 생명을 구하는 묘왕은 그렇습니다. 함정은 아닙니다.",
    status: 'derivable',
    inProject: 'none',
    // 두 가지 조건: 화권 및 화록 모두 명궁을 보호합니다. 변형된 별은 낙함이 아닙니다.
    fn: c => {
      const b = c.mingGongBranch;
      if (!hasHua(c, b, '权') || !hasHua(c, b, '禄')) return false;
      const huaStars = palaceAt(c, b).stars.filter(s => s.siHua === '权' || s.siHua === '禄');
      return huaStars.every(s => s.brightnessRaw !== '陷');
    },
  },
  {
    no: 23,
    name: '羊刃入庙',
    note: "Chenxuchou는 자신의 운명을 지키지 못하고 행운을 만났습니다.",
    status: 'derivable',
    inProject: 'none',
    // 경양는 항상 사릉궁(Chou Chen Wei Xu)의 사원입니다. 이는 Anxing 테이블에 의해 결정되며 확률이 아닙니다.
    fn: c => {
      const b = c.mingGongBranch;
      if (![1, 4, 7, 10].includes(b)) return false;
      if (!has(c, b, '擎羊')) return false;
      return jiCount(c, b) > 0;
    },
  },
  {
    no: 24,
    name: '巨机居卯',
    note: "이전 댓글을 참조하세요. 거문천기동궁 마오수밍",
    status: 'derivable',
    inProject: 'none',
    // 기계 거인은 Maoyou 동궁에만 있으며 주석은 Mao(사원 부지)에서 가져왔습니다.
    fn: c => c.mingGongBranch === 3 && has(c, 3, '巨门') && has(c, 3, '天机'),
  },
  {
    no: 25,
    name: '明禄暗禄',
    note: "이전 댓글을 참조하세요. 녹존 Shou Ming(밝음), 대궁화록(어두움)",
    status: 'derivable',
    inProject: 'none',
    fn: c => {
      const b = c.mingGongBranch;
      return has(c, b, '禄存') && hasHua(c, oppositeBranch(b), '禄');
    },
  },
  {
    no: 26,
    name: '科明暗禄',
    note: "앞선 주석을 참고하세요 (참고하는 시가 불명확하고, 공통 주석가들에 따라 두 가지 해석이 있습니다)",
    status: 'disputed',
    why:
      "주석은 \"보기 전에 주석을 달았습니다\"만 있으며 참조가 불분명합니다. 여기의 판독값은 다음과 같습니다: 화과(Ming)에 앉아 있는 명궁," +
      "대궁에는 녹존(어두움)가 있습니다. 일부 주석자는 이를 \"화과 Shou Ming + Sanfang Youlu\"로 해석하는데, 둘은 비교할 수 없습니다.",
    inProject: 'none',
    fn: c => {
      const b = c.mingGongBranch;
      return hasHua(c, b, '科') && has(c, oppositeBranch(b), '禄存');
    },
  },
  {
    no: 27,
    name: '金舆扶驾',
    note: "자미 운명을 지키세요. 그러면 해와 달이 당신 앞과 뒤에 올 것입니다.",
    status: 'unreachable',
    why:
      "자미와 태양의 하우스 차이는 항상 9입니다(자미는 항상 b에 있고, 태양은 항상 b+9, 즉 자미의 마지막 세 하우스)." +
      "예외 없이 2,400번의 실제 테스트를 진행합니다. 자미가 운명을 지키면 명궁 전후의 두 집에서 해와 달이 결코 분리될 수 없습니다." +
      "안흥법(An Xing Dharma)에는 \"해와 달이 전후에 온다\"는 해결책이 없습니다.",
    inProject: 'none',
  },
];

// ───────────────── 입구 ──────────────────

export interface DingGuiHit {
  no: number;
  name: string;
  note: string;
  status: GeStatus;
}

/* *
 * 게임의 "고정 위치" 패턴을 결정합니다.
 *
 * - `unreachable` 항목은 직접 건너뜁니다(판정이나 돌아가기에는 관여하지 않음).
 * - `disputed`의 항목은 본 모듈에서 선택한 읽기 방식에 따라 판단되며, 판별을 위해 그 상태가 결과에 유지됩니다.
 * - 돌아가기 순서는 원본 도서의 일련 번호입니다. */
export function detectDingGui(chart: ZiweiChart): DingGuiHit[] {
  const out: DingGuiHit[] = [];
  for (const g of DING_GUI_GE) {
    if (!g.fn) continue;
    if (g.fn(chart)) {
      out.push({ no: g.no, name: g.name, note: g.note, status: g.status });
    }
  }
  return out;
}

/* * 결정할 수 있는 항목 수(도달할 수 없는 항목 제외) */
export const DING_GUI_JUDGEABLE = DING_GUI_GE.filter(g => !!g.fn).length;

/* *An Xing의 미해결 항목 */
export const DING_GUI_UNREACHABLE = DING_GUI_GE.filter(g => g.status === 'unreachable');
