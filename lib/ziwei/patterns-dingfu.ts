/* *
 * "자미두수전서" 1권 "Ding Wealth Bureau" 6개 프레임 · 엄격하게 구현
 *
 * 원본: 1권, "Dingfu Bureau", 6개 기사, 각 항목에 주석 포함. 동반자 장 "Dinggui Bureau" 27개 장
 * `patterns-dinggui.ts`; 해석 규칙(문자 그대로 받아들이고 긴장을 풀지 말고 설명 없이 데드 코드를 작성하지 마십시오)은 거기와 동일합니다.
 *
 * 이 표의 6개 항목 중 2개 항목에는 Anxing(채음 샌드위치 및 음 Gongshen)에 대한 솔루션이 없습니다. 둘 다 "Liang Xiangji/Gong" 계열에 속합니다.
 * 천량은 항상 천상의 마지막 하우스에 상주합니다(델타 상수 1). 이 인접한 별 쌍은 첫 번째 집의 양쪽에서 결코 분리될 수 없습니다.
 * 또한 같은 하우스의 삼방사정과 결합할 수 없습니다(트라인 세트 {+4,+8}와 어포지션 세트 {+6} 간의 최소 차이 2).
 *
 * 접근 가능한 다른 두 격자는 각각 ID에 의해 고유한 형태로 잠겨 있습니다.
 * - 태양과 달은 부를 결합합니다. 태양은 항상 무곡 다음의 첫 번째 하우스에 있습니다(델타는 항상 시장에서 측정하면 1, 2,304입니다).
 * 따라서 "Sun and Moon Arms"의 유일한 형태는 전면의 태음, 후면의 태양입니다.
 * - Cai Lu와 말: 녹존은 천마 이전의 것이 아닙니다. (천마는 Yinshensihai에만 있고, 말 이전의 것은 녹존에 없습니다.
 * 10개의 궁 세트 내에서 구조는 항상 참입니다.) 따라서 "오루와 말"의 유일한 형태는 루가 뒤에 있고 오가 앞에 있다는 것입니다.
 *
 * ⚠️ 대상 트랩: `ZiweiChart.palaces`는 실제로 음궁(분기=2)에서 시작하며,
 * 항상 지점별로 검색하세요. 아래첨자는 금지됩니다. 도우미 "클립" = 인접 ±1, ±2로 분리되지 않음. */

import type { ZiweiChart, Palace } from './types';
import type { GeStatus, ProjectVerdict } from './patterns-dinggui';

// ────────────────── 디스크 읽기 ──────────────────

const palaceAt = (c: ZiweiChart, branch: number): Palace =>
  c.palaces.find(p => p.branch === ((branch % 12) + 12) % 12)!;

const has = (c: ZiweiChart, branch: number, name: string): boolean =>
  palaceAt(c, branch).stars.some(s => s.name === name);

const starBranch = (c: ZiweiChart, name: string): number =>
  c.palaces.find(p => p.stars.some(s => s.name === name))?.branch ?? -1;

const palaceBranch = (c: ZiweiChart, name: string): number =>
  c.palaces.find(p => p.name === name)?.branch ?? -1;

/* * 이전 집/마지막 집에 인접해 있습니다. "클램프"는 ±2 분리가 아닌 이 두 하우스를 의미합니다. */
const prevBranch = (b: number) => (b + 11) % 12;
const nextBranch = (b: number) => (b + 1) % 12;

const majorCount = (c: ZiweiChart, b: number): number =>
  palaceAt(c, b).stars.filter(s => s.type === 'major').length;

// ───────────────── 종류 ──────────────────

export interface DingFuGe {
  /* *원작 일련번호 1~6 */
  no: number;
  name: string;
  /* * 원본 주석("전택궁도 true입니다"와 같은 확장 조건 포함) */
  note: string;
  status: GeStatus;
  /* * 상태에 도달할 수 없는 기하학적 이유; 파생 가능하지만 고유한 형태인 경우 표시 */
  why?: string;
  /* * 원본 프로젝트에 이미 해당 식별자가 있는지 여부(Dingfu Bureau의 6개 프로젝트 모두 해당 식별자가 없음) */
  inProject: ProjectVerdict;
  /* * 결정 기능; 상태에 도달할 수 없는 경우 기본값 */
  fn?: (c: ZiweiChart) => boolean;
}

// ───────────────── 6개의 그리드 ──────────────────

export const DING_FU_GE: DingFuGe[] = [
  {
    no: 1,
    name: '财荫夹印',
    note: "서로의 생명을 함께 유지하면서 Wu Liang이 공격하러 온 것은 사실이며 전택궁도 마찬가지입니다.",
    status: 'unreachable',
    inProject: 'none',
    why:
      "주석을 사용하려면 무곡 및 천량이 천상의 양쪽에서 분리되어야 합니다. 천량은 항상 천상의 마지막 하우스에 있습니다(위상 → Liang Delta 상수 1," +
      "측정된 디스크는 예외 없이 2,304개), 이 절반은 만족될 수 있습니다. 하지만 무곡과 천상 사이의 거리는 짝수만 취합니다." +
      "(델타 ∈ {0,2,4,6,8,10}, 실제 측정), 무곡은 천상의 인접한 궁에 있을 수 없습니다. - \"클립\"의 절반" +
      "해결책이 없습니다. \"전택궁도 마찬가지입니다.\" 명궁을 전택궁로 바꾸면 기하학적 제약 조건이 변경되지 않고 해결 방법도 없습니다." +
      "부 = 무곡(부성), 음 = 천량(음성), 인장 = 천상.",
  },
  {
    no: 2,
    name: '日月夹财',
    note: "Wu가 생명을 유지하면 해와 달이 그를 꼬집고 재백궁도 마찬가지입니다.",
    status: 'derivable',
    inProject: 'none',
    // 유일한 형식: 태양→무곡 델타 상수 1(태양은 항상 무곡 다음의 첫 번째 하우스에 있음), "전일 및 다음 달"
    // 읽는 방법은 절대 불가능합니다. '지난달 및 다음날'의 실제 측정이 가능합니다(일중 2,304건 32건, 1.39%).
    fn: c => {
      const wu = starBranch(c, '武曲');
      if (wu < 0) return false;
      const jia = (palace: number): boolean =>
        has(c, prevBranch(palace), '太阴') && has(c, nextBranch(palace), '太阳');
      // 주요 형태: 생명을 보호하는 무곡; 확장형: 재백궁을 보호하기 위한 무곡
      const mingFu = c.mingGongBranch === wu && jia(wu);
      const caiFu = palaceBranch(c, '财帛') === wu && jia(wu);
      return mingFu || caiFu;
    },
    why:
      "도달 가능하지만 형식은 고유합니다. 태양은 항상 무곡(델타 상수 1) 다음의 첫 번째 하우스에 있으며 \"태양과 달이 샌드위치되어 있습니다\"라는 주석이 별에 있습니다." +
      "\"태음은 첫 번째 하우스에 있고, 태양은 마지막 하우스에 있습니다.\"만 가능합니다. \"재백궁에도 동일하게 적용됩니다\"는 주석과 함께 제공되며 함께 구현되는 확장 읽기 방법입니다.",
  },
  {
    no: 3,
    name: '财禄夹马',
    note: "말은 운명을 지키고, 우루는 말을 꼬집으러 온다. 특히 인생에서 번영을 누리는 것은 놀라운 일입니다.",
    status: 'derivable',
    inProject: 'none',
    // 유일한 형식: 녹존은 결코 천마 앞에 오지 않습니다(구조적 상수 진실: 천마는 Yinshensihai에만 있고,
    // 앞에 있는 말은 10번째 하우스 세트인 녹존과 교차하지 않으므로 이를 결합하는 유일한 방법은 뒤쪽에 있는 Lu(b+1)와 앞쪽에 있는 무곡(b-1)입니다.
    fn: c => {
      const b = c.mingGongBranch;
      if (!has(c, b, '天马')) return false;
      return has(c, prevBranch(b), '武曲') && has(c, nextBranch(b), '禄存');
    },
    why:
      "도달 가능하지만 극히 드물고(12,900개 플레이트 중 26개 케이스, 0.20%) 형태가 독특합니다. 녹존은 천마 이전의 첫 번째 하우스에 결코 있지 않습니다." +
      "\"Wulu Laijia\"는 뒤쪽에 녹존, 앞쪽에 무곡만 있을 수 있습니다. \"당신이 살아 있고 번영하면 모든 것이 훌륭합니다\"라는 주석은 보너스 포인트입니다. 조건은 아니며 본심판에 포함되지 않습니다.",
  },
  {
    no: 4,
    name: '荫印拱身',
    note: "전택에 있을 때 광선과 광선이 서로 충돌합니다. 가만히 앉아서 멸망하지 마십시오.",
    status: 'unreachable',
    inProject: 'none',
    why:
      "천량은 항상 천상의 마지막 하우스(인접 별 쌍)에 있습니다. \"아치\" 위치는 전택궁 +4/+8이고 \"반대\" 위치는 +6입니다." +
      "세 위치는 서로 최소 2하우스 이상 떨어져 있으며 인접한 두 별이 동시에 서로 떨어지는 것은 불가능합니다. - \"아치\" 읽기(동시에 세 방향으로)," +
      "\"총\" 판독(아치 1개와 러시 1개) 및 관용 판독(삼방사정과 동일)은 모두 An Xing에서 해결 불가능합니다." +
      "\"Dinggui Bureau\" Caiyin Jialu 및 \"Dingfu Bureau\" Caiyin Jialu와 동일한 \"Liang Xiangjia/Gong\" 제품군에 속하며 모두 접근할 수 없습니다.",
  },
  {
    no: 5,
    name: '日月照璧',
    note: "해와 달이 여기 있으니 나는 무덤에 사는 것을 좋아하노라.",
    status: 'derivable',
    inProject: 'none',
    // 해와 달 동궁은 Chou와 Wei(무덤)에만 있으며 "Xiju 무덤"이라는 주석은 An Xing 방법에 의해 자동으로 충족됩니다.
    fn: c => {
      const tz = palaceBranch(c, '田宅');
      if (tz < 0) return false;
      return has(c, tz, '太阳') && has(c, tz, '太阴');
    },
    why:
      "해와 달 동궁은 주(周)와 위(魏)의 두 궁궐에만 나타나는데, 이는 바로 '무덤'이다. \"무덤에 거주함\"이라는 주석은 안싱의 정체성과 일치합니다." +
      "완전히 일관성이 있으며 추가 판단이 필요하지 않습니다.",
  },
  {
    no: 6,
    name: '金灿光辉',
    note: "태양 혼자 있으세요. 당신의 운명은 자오선 궁에 있습니다",
    status: 'derivable',
    inProject: 'none',
    fn: c => c.mingGongBranch === 6 && has(c, 6, '太阳') && majorCount(c, 6) === 1,
  },
];

// ───────────────── 입구 ──────────────────

export interface DingFuHit {
  no: number;
  name: string;
  note: string;
  status: GeStatus;
}

/* *
 * 게임의 "Ding Wealth Game" 패턴을 결정합니다. 연결할 수 없는 항목은 건너뜁니다. 돌아가기 시퀀스는 원본 도서의 일련 번호입니다. */
export function detectDingFu(chart: ZiweiChart): DingFuHit[] {
  const out: DingFuHit[] = [];
  for (const g of DING_FU_GE) {
    if (!g.fn) continue;
    if (g.fn(chart)) {
      out.push({ no: g.no, name: g.name, note: g.note, status: g.status });
    }
  }
  return out;
}

/* * 결정할 수 있는 항목 수(도달할 수 없는 항목 제외) */
export const DING_FU_JUDGEABLE = DING_FU_GE.filter(g => !!g.fn).length;

/* *An Xing의 미해결 항목 */
export const DING_FU_UNREACHABLE = DING_FU_GE.filter(g => g.status === 'unreachable');
