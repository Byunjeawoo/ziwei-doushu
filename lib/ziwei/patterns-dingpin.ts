/* *
 * "자미두수전서" 1권 "빈곤열등국 판정" 8개 프레임 · 엄격하게 시행
 *
 * 원본: 제1권, "빈곤과 궁핍의 판단", 8편의 기사, 각각 주석 포함. 동반 기사 "Dinggui Bureau"및 "Dingfu Bureau"를 참조하십시오.
 * `patterns-dinggui.ts` / `patterns-dingfu.ts`; 해석 규칙은 동일합니다.
 *
 * 이 표의 8개 항목 중 구조적으로 해결 불가능한 항목은 없습니다** - 빈곤, 빈곤의 조건은 대부분 '스타+상태'(비어 있음,
 * 낙함, 살성동궁), 빔 위상 위치 조정이 필요하지 않습니다. 하지만 가장 엄격한 문자 그대로 읽어야 할 세 가지 기사가 있습니다.
 * 17,280 보드에서 0번(3개의 트랩은 상호 배타적이며 4개의 킬은 모두 생명을 구함), 베터는 이를 넓게 읽고 논쟁의 여지가 있는 것으로 표시했습니다.
 *
 * "빈 죽음" 구경: Dinggui Bureau와 동일하며 시장에서 순공/부순/Intercept/절공/Empty Death/부절 6개의 별을 가져옵니다.
 * 전체 테이블(`isKong`). 이 테이블의 빈 죽음은 배제조건이 아닌 **설립조건**이다. 구경이 너무 넓으면 방아쇠가 증폭됩니다.
 *실제 측정 비교는 3번에서 그 이유를 확인하세요(모든 궁궐 독서법은 49%의 넓은 구경을 가지고 있습니다). 따라서 보이드와 관련된 모든 물품은
 *명궁 시스템 내부 판단에 한합니다.
 *
 * ⚠️ 대상 함정: `ZiweiChart.palaces`는 실제로 음궁(분기=2)에서 시작하며,
 * 항상 지점별로 검색하세요. 아래첨자는 금지됩니다. 샘플 규율: 1년 작업, 12년 시진, 하루 종일. */

import type { ZiweiChart, Palace } from './types';
import type { GeStatus, ProjectVerdict } from './patterns-dinggui';

// ────────────────── 디스크 읽기 ──────────────────

const KONG_STARS = ['旬空', '副旬', '截路', '截空', '空亡', '副截'];
const KONGJIE = ['地空', '地劫'];
const SHA4 = ['擎羊', '陀罗', '火星', '铃星'];

const palaceAt = (c: ZiweiChart, branch: number): Palace =>
  c.palaces.find(p => p.branch === ((branch % 12) + 12) % 12)!;

const has = (c: ZiweiChart, branch: number, name: string): boolean =>
  palaceAt(c, branch).stars.some(s => s.name === name);

const hasAny = (c: ZiweiChart, branch: number, names: string[]): boolean =>
  names.some(n => has(c, branch, n));

const hasHua = (c: ZiweiChart, branch: number, hua: '禄' | '权' | '科' | '忌'): boolean =>
  palaceAt(c, branch).stars.some(s => s.siHua === hua);

const starBranch = (c: ZiweiChart, name: string): number =>
  c.palaces.find(p => p.stars.some(s => s.name === name))?.branch ?? -1;

const sanFang = (b: number): number[] => [b, (b + 4) % 12, (b + 8) % 12, (b + 6) % 12];

const isKong = (c: ZiweiChart, b: number): boolean => hasAny(c, b, KONG_STARS);

const starOf = (c: ZiweiChart, b: number, name: string) =>
  palaceAt(c, b).stars.find(s => s.name === name);

/* * 낙함: 한 레벨만 "트랩"됨 */
const isXian = (c: ZiweiChart, b: number, name: string): boolean =>
  starOf(c, b, name)?.brightnessRaw === '陷';

// ───────────────── 종류 ──────────────────

export interface DingPinGe {
  /* *원작 일련번호 1~8 */
  no: number;
  name: string;
  note: string;
  status: GeStatus;
  why?: string;
  inProject: ProjectVerdict;
  fn?: (c: ZiweiChart) => boolean;
}

// ───────────────── 사각형 8개 ──────────────────

export const DING_PIN_GE: DingPinGe[] = [
  {
    no: 1,
    name: '生不逢时',
    note: "헛되이 죽을 운명이라면 염정을 만나게 될 것이다.",
    status: 'derivable',
    inProject: 'none',
    fn: c => {
      const b = c.mingGongBranch;
      return isKong(c, b) && has(c, b, '廉贞');
    },
  },
  {
    no: 2,
    name: '禄逢两杀',
    note: "그것은 공중에 앉아 죽는 것과 같고, 공중에 있으면서 별을 죽이는 것과 같습니다.",
    status: 'derivable',
    inProject: 'none',
    // "두 번의 킬"의 엄격한 발음은 다음과 같습니다: 지공지겁 double to (동궁). An Xing에 대한 환난 동궁은 다음에만 나타납니다.
    // Zi와 Wu에는 두 개의 시진이 있습니다(지겁는 Hai에서 정방향으로 시간 분기를 계산하고, 지공는 Hai에서 역으로 계산하고, 동궁 ⇔ 2h ‚ 0).
    // 광독법(공재중 어느 하나)의 실제 측정치는 0.70%로 두 배인 0.156%이다.
    fn: c => {
      const b = c.mingGongBranch;
      const lu = has(c, b, '禄存') || hasHua(c, b, '禄');
      return lu && isKong(c, b) && KONGJIE.every(x => has(c, b, x));
    },
    why:
      "\"두 번의 킬\"은 \"공기 환란 및 복식\"으로 읽습니다(\"공기 환란이 별을 죽입니다\"라는 주석이 병치됨). 하늘강도 동궁은 시진의 구조적 조건이고," +
      "sub-오시에서만 나타나므로 이 패턴은 당연히 드물다(17,280플레이트에 27건, 0.156%).",
  },
  {
    no: 3,
    name: '马落空亡',
    note: "말이 죽었으니 운이 급히 모임에 달려도 소용이 없다. 가장 중요한 것은 뛰어 다니는 것입니다.",
    status: 'disputed',
    inProject: 'none',
    // Keep your life의 발음을 들어보세요: 천마가 life를 유지하고 명궁이 공중에 앉아 있습니다(4.10%).
    // 모든 궁 읽기 방법(천마가 위치한 궁은 생명 유지에 국한되지 않고 공허에서 죽습니다): 광구경(6개의 공허 별이 모두 계산됩니다)
    // 49.17%, 순공 구경만 32.99% - 순공 궁 위치와 천마 궁 위치는 모두 연도에 따라 결정됩니다.
    // 특정 연도의 지점 그룹은 지속적으로 중복되며 시장의 약 1/3은 생년 연도에 따라 트리거될 예정입니다.
    // 명반 형식은 판단 능력을 상실합니다. 따라서 명궁 시스템으로 수렴됩니다.
    fn: c => {
      const b = c.mingGongBranch;
      return has(c, b, '天马') && isKong(c, b);
    },
    why:
      "주석은 생명 유지를 제한하지 않습니다. 임의의 궁 판독 방법은 넓은 공극 구경에서 49.17%(순공만 32.99%)이며," +
      "그리고 순공 궁과 천마 궁은 모두 연도에 따라 결정되므로 트리거 연도 그룹은 일정합니다. 사람들의 1/3은 생년를 누를 운명이며," +
      "판단력 상실. Shouming 판독값(4.10%)을 취하고 희소성을 유지하고 장단점을 나타냅니다.",
  },
  {
    no: 4,
    name: '日月藏辉',
    note: "해와 달이 뒤쳐져 캄캄한 어둠이 깔려 있습니다.",
    status: 'disputed',
    inProject: 'none',
    // Yan Dufa(태양, 태음, 거문, 세 개 모두 낙함) 17,280회 0회 재생: 별 3개가 있는 "트랩" 파일
    // 별 기하학 측면에서 상호 배타적 - 궁에 갇힌 태양, 궁에 갇힌 거문은 궁의 자미로 연결됩니다(차이는 일정함).
    // 동시에 낙함의 자미 위치는 존재하지 않습니다. 주석가는 그것을 광범위하게 읽을 수 있습니다: 뒤로 = 태양과 달은 언제든지 빛을 잃습니다.
    // "거대한 어둠을 만나다" = 명궁삼방사정이 거문Z낙함을 만납니다.
    fn: c => {
      const b = c.mingGongBranch;
      const riB = starBranch(c, '太阳');
      const yueB = starBranch(c, '太阴');
      if (riB < 0 || yueB < 0) return false;
      const fanBei = isXian(c, riB, '太阳') || isXian(c, yueB, '太阴');
      if (!fanBei) return false;
      return sanFang(b).some(x => has(c, x, '巨门') && isXian(c, x, '巨门'));
    },
    why:
      "\"반전\"은 해와 달이 모두 떨어진다고 엄격하게 읽은 다음 거문낙함과 결합하여 총 3가지 조건인 17,280번, 0번을 결합합니다." +
      "세 가지 함정의 상호 배제는 Anding 기하학의 결과입니다. 태양 및 거문은 자미 시스템에 속합니다(궁 사이의 거리는 일정합니다)." +
      "태양 갇힌 궁과 거문 갇힌 궁은 동시에 등장할 수 없습니다. 폭넓게 읽어 보세요: 태양과 달의 어느 쪽(역방향) +" +
      "세 당사자 모두의 운명은 거문입니다. 과거 왕조의 주석가들은 \"역\"에 대한 명확한 이해가 없기 때문에 논쟁의 여지가 있습니다.",
  },
  {
    no: 5,
    name: '财与囚仇',
    note: "Wu Zhentong은 자신의 몸과 운명을 보호합니다.",
    status: 'derivable',
    inProject: 'none',
    // 무곡과 염정 궁 사이의 거리는 항상 4입니다(동궁은 아님). 『함께』는 육체와 삶이라는 두 개의 궁으로만 나눌 수 있다.
    fn: c => {
      const b = c.mingGongBranch;
      const s = c.shenGongBranch;
      return (has(c, b, '武曲') && has(c, s, '廉贞')) ||
             (has(c, b, '廉贞') && has(c, s, '武曲'));
    },
    why:
      "무곡과 염정 사이의 궁 거리는 항상 4입니다(실제 측정값은 2,304개, Wu Lian은 동궁이 아님). \"함께 우리의 생명을 보호합니다\"라는 문구가 새겨져 있음" +
      "독서를 관찰해야만 점수를 얻을 수 있습니다. 하나는 운명, 하나는 신체입니다. 신궁과 명궁의 차이는 항상 짝수입니다(본체 = 수명 + 2×시간 분기 시퀀스)." +
      "Wulian 일정 거리 4와 호환되며 실제 측정에서 달성할 수 있습니다(17,280개 플레이트, 457개 케이스, 2.65%).",
  },
  {
    no: 6,
    name: '一生孤贫',
    note: "생명을 유지하는 별은 소멸되어 땅에 떨어진다고 합니다.",
    status: 'derivable',
    inProject: 'none',
    fn: c => {
      const b = c.mingGongBranch;
      return has(c, b, '破军') && isXian(c, b, '破军');
    },
  },
  {
    no: 7,
    name: '君子在野',
    note: "4마리의 살인은 갇혀 있다는 점에서 자신의 몸과 생명을 보호한다고 한다.",
    status: 'disputed',
    inProject: 'none',
    // Yan Dufa(경양타라화성영성의 4개 별은 모두 신체와 생명의 두 집에 빠짐) 17,280회:
    // Yang Tuo는 항상 두 개의 궁으로 구분됩니다 (Yang은 Lu 앞에 있고 Tuo는 Lu 뒤에 있습니다). 몸과 생명이 분리된다면, 몸과 생명은 2하우스로 정확히 분리되어야 합니다.
    // (축시 또는 사시) 그리고 Fire Bell은 우연히 이 두 집에 동시에 있습니다. 가능하지만 항상 가능한 것은 아니지만 극히 드뭅니다.
    // 폭넓게 읽어보세요: 명궁은 ≥2개의 4중 킬을 기록했고 그 중 하나는 낙함(1.89%)입니다.
    fn: c => {
      const b = c.mingGongBranch;
      const sha = SHA4.filter(n => has(c, b, n));
      if (sha.length < 2) return false;
      return sha.some(n => isXian(c, b, n));
    },
    why:
      "『사살(十殺)』은 4개의 별이 모두 몸과 생명의 두 집에 떨어지는 것으로 엄격하게 읽혀진다. 양타는 몸과 생명의 두 집에서 따로 살 수 있다." +
      "(두 번째 집으로 신체와 생명이 정확히 분리된 경우) 그런데 17,280 차트에서 이 두 집이 함께 있는 경우 불종이 0번 떨어집니다. 비구조적" +
      "해결책(순수한 Anxing 증명 없음)이 없으므로 도달할 수 없는 것으로 표시되지 않으며 넓은 판독값은 다음과 같습니다. 명궁 ≥ 2 four-kill and" +
      "하나는 낙함입니다. '생사'라는 폭넓은 해석은 포함되지 않으며, 발동률도 높아집니다.",
  },
  {
    no: 8,
    name: '两重华盖',
    note: "녹존화록이 항공 재난을 겪고 있다고 합니다.",
    status: 'derivable',
    inProject: 'none',
    // "Double"은 엄밀히 읽어야 합니다. 녹존과 화록은 모두 같은 운명(0.60%)에 있다가 공허한 재난(0.064%)에 직면합니다.
    // 광역 판독 방식(산루가 하늘에 앉아 항공 재난을 겪을 때 녹존 또는 화록)의 실제 측정치는 1.9%입니다.
    fn: c => {
      const b = c.mingGongBranch;
      return has(c, b, '禄存') && hasHua(c, b, '禄') && hasAny(c, b, KONGJIE);
    },
    why:
      "\"Double\"은 함께 앉는 두 가지 운세에 따라 읽습니다. 녹존은 앉아 있고 명궁에는 화록이 있습니다(연도 어간에 특정 별 화록이 떨어지게 됩니다)." +
      "녹존 궁궐은 17,280판에 104건, 0.60%), 또 지공지겁는 11건(0.064%)이다." +
      "역대 주석가들은 산록안 독자(1.9%)를 선정했는데 이는 엄격하다.",
  },
];

// ───────────────── 입구 ──────────────────

export interface DingPinHit {
  no: number;
  name: string;
  note: string;
  status: GeStatus;
}

/* *
 * 접시의 "빈곤과 열등함 판단" 패턴을 결정합니다. 돌아가기 시퀀스는 원본 도서의 일련 번호입니다. */
export function detectDingPin(chart: ZiweiChart): DingPinHit[] {
  const out: DingPinHit[] = [];
  for (const g of DING_PIN_GE) {
    if (!g.fn) continue;
    if (g.fn(chart)) {
      out.push({ no: g.no, name: g.name, note: g.note, status: g.status });
    }
  }
  return out;
}

/* * 심사 가능한 항목 수 (8개 항목 모두 심사 가능하며, 이의제기도 시행) */
export const DING_PIN_JUDGEABLE = DING_PIN_GE.filter(g => !!g.fn).length;

/* * An Xing의 미해결 항목(이 테이블은 비어 있음) */
export const DING_PIN_UNREACHABLE = DING_PIN_GE.filter(g => g.status === 'unreachable');
