/* *
 * 자미두수격국 식별(v2 엄격한 버전)
 *
 * 디자인 원칙:
 * 1. 고대 서적 조건에 우선 순위가 부여됩니다. 각 격국에는 "필수/추가 포인트/예외"의 3계층 구조가 나열되어 있으며 소스를 테스트할 수 있습니다.
 * 2. 니하이샤 선생 포지션 : 공간자화, 대한사화, 라이인궁 등 비성 공구는 사용하지 마세요.
 * 3. 묘왕 이점: 밝기 필드 사용(밝음=묘왕, 보통=평탄, 희미함=처짐)
 * 4. 삼방사정 회의: 명궁 + 재백 + 관록 + 천이
 * 5. 샌드위치 궁: 명궁 두 개의 궁 전후
 *
 *고대 서적의 주요 출처:
 * - "자미두수전집"(명나라에서 출판된 진투안 총대주교의 전기)
 * - "자미두수전서"(나홍 편집, 명나라 출판)
 * - "골수부", "여성 운명 골수부", "십이 집의 별이 지구를 얻는 자격 기술"
 * - 니하이샤 선생 "천기" 자미두수 유인물 */

import 'server-only';
import type { ZiweiChart, Palace, Star, SiHua } from './types';
import { detectDingGui } from './patterns-dinggui';
import { detectDingFu } from './patterns-dingfu';
import { detectDingPin } from './patterns-dingpin';

// ───────────────── 종류 ──────────────────
export interface PatternCondition {
  required: string[];   // 조건을 충족해야 합니다(통과).
  bonus?: string[];     // 보너스 포인트(발동)
  breaking?: string[];  // 예외 경고(트리거됨)
}

export interface Pattern {
  name: string;
  level: 'excellent' | 'good' | 'neutral' | 'caution';
  description: string;
  palaces: string[];                 // 궁을 포함
  conditions?: PatternCondition;     // 조건부 계층화 설정(v2의 새로운 기능)
  source?: string;                   // 고대 서적의 출처(v2의 새로운 기능)
}

// ────────────────── 상수 ──────────────────
const SHA_NAMES = ['擎羊', '陀罗', '火星', '铃星', '地空', '地劫'];
const SHA_HARD = ['擎羊', '陀罗', '火星', '铃星'];   // 네 명의 악령
const SHA_KONG = ['地空', '地劫'];                  // 항공 재해
const ZUO_YOU = ['左辅', '右弼'];
const CHANG_QU = ['文昌', '文曲'];
const KUI_YUE = ['天魁', '天钺'];

// ────────────────── 보조 기능 ─────────────────
function getMajorStarNames(palace: Palace): string[] {
  return palace.stars.filter(s => s.type === 'major').map(s => s.name);
}
function findStar(palace: Palace, name: string): Star | undefined {
  return palace.stars.find(s => s.name === name);
}
function hasStar(palace: Palace, name: string): boolean {
  return palace.stars.some(s => s.name === name);
}
function findStarPalace(chart: ZiweiChart, name: string): Palace | undefined {
  return chart.palaces.find(p => p.stars.some(s => s.name === name));
}
function getPalaceByBranch(chart: ZiweiChart, branch: number): Palace | undefined {
  return chart.palaces.find(p => p.branch === ((branch % 12) + 12) % 12);
}
function shaCountInPalace(palace: Palace, list: string[] = SHA_HARD): number {
  return palace.stars.filter(s => list.includes(s.name)).length;
}
function hasShaInPalace(palace: Palace, list: string[] = SHA_NAMES): boolean {
  return palace.stars.some(s => list.includes(s.name));
}
function getSanFangPalaces(chart: ZiweiChart): Palace[] {
  const m = chart.mingGongBranch;
  const branches = [m, (m + 4) % 12, (m + 8) % 12, (m + 6) % 12];
  return chart.palaces.filter(p => branches.includes(p.branch));
}
function isInSanFang(chart: ZiweiChart, branch: number): boolean {
  const m = chart.mingGongBranch;
  return [m, (m + 4) % 12, (m + 8) % 12, (m + 6) % 12].includes(branch);
}
function getDuiGong(chart: ZiweiChart, branch: number): Palace | undefined {
  return getPalaceByBranch(chart, (branch + 6) % 12);
}
function getJiaPalaces(chart: ZiweiChart, branch: number): { prev?: Palace; next?: Palace } {
  return {
    prev: getPalaceByBranch(chart, (branch + 11) % 12),
    next: getPalaceByBranch(chart, (branch + 1) % 12),
  };
}
function sanFangAllStars(chart: ZiweiChart): Set<string> {
  return new Set(getSanFangPalaces(chart).flatMap(p => p.stars.map(s => s.name)));
}
function sanFangShaCount(chart: ZiweiChart, list: string[] = SHA_HARD): number {
  return getSanFangPalaces(chart).reduce((sum, p) => sum + shaCountInPalace(p, list), 0);
}
function isBright(palace: Palace, starName: string): boolean {
  const s = findStar(palace, starName);
  return s?.brightness === 'bright';
}
function isDim(palace: Palace, starName: string): boolean {
  const s = findStar(palace, starName);
  return s?.brightness === 'dim';
}
function getStarSiHua(palace: Palace, starName: string): Star['siHua'] | undefined {
  return findStar(palace, starName)?.siHua;
}
// 사화는 성요의 siHua 필드에 걸려 있으며 독립적인 별 이름이 아닙니다. hasStar / sanFangAllStars를 사용하여 "화록"를 검색할 수 없습니다.
function palaceHasSiHua(palace: Palace, hua: SiHua): boolean {
  return palace.stars.some(s => s.siHua === hua);
}
function sanFangHasSiHua(chart: ZiweiChart, hua: SiHua): boolean {
  return getSanFangPalaces(chart).some(p => palaceHasSiHua(p, hua));
}
const BRANCH_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// ────────────────── 일반 프레임 인식기 ───────────────────

/* * 군주와 장관의 축하: 자미가 파티에 참여하고, 좌보우필가 파티에 참여합니다(동궁 또는 3개의 파티). */
function detectJunChenQingHui(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  if (!hasStar(ming, '紫微')) return;
  const sanFangSet = sanFangAllStars(chart);
  const hasZuo = sanFangSet.has('左辅');
  const hasYou = sanFangSet.has('右弼');
  if (!hasZuo || !hasYou) return;

  const required = ['紫微入命', "좌보우필는 삼방사정과 함께 있습니다."];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sanFangSet.has('文昌') || sanFangSet.has('文曲')) bonus.push('再会文昌或文曲');
  if (sanFangSet.has('天魁') || sanFangSet.has('天钺')) bonus.push('魁钺贵人加照');
  if (getStarSiHua(ming, '紫微') === '权') bonus.push('紫微化权');
  if (sanFangShaCount(chart, SHA_KONG) >= 2) breaking.push("지공지겁 이중 클립으로 사진 촬영 가능(자미는 항공 재해 방지)");

  patterns.push({
    name: '君臣庆会',
    level: breaking.length ? 'good' : 'excellent',
    description: "자미가 운명에 들어가고, 좌보우필가 모여서, 황제는 덕신의 보좌를 받고, 황제는 부와 권력을 갖고 통치하게 될 운명이다. 당신의 삶에는 고귀한 사람들이 많기 때문에 정치적, 사업적 고위직과 국경을 넘는 지도자의 길을 택해야 합니다.",
    palaces: ['命宫'],
    conditions: { required, bonus, breaking },
    source: "\"자미두수전서·준첸칭칭게\"",
  });
}

/* * 자부 동궁 : 명궁 내 자미+천부 (음궁, 심궁에 한함) */
function detectZiFu(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  const ziwei = findStarPalace(chart, '紫微');
  const tianfu = findStarPalace(chart, '天府');
  if (!ziwei || !tianfu || ziwei.branch !== tianfu.branch) return;

  const inMing = ziwei.branch === chart.mingGongBranch;
  const required = inMing
    ? ['紫微天府同入命宫']
    : ["자미천부동궁 (명궁이 아닌 경우 힘이 감소됩니다)"];
  const bonus: string[] = [];
  const breaking: string[] = [];
  const sanFangSet = sanFangAllStars(chart);
  if (sanFangSet.has('左辅') && sanFangSet.has('右弼')) bonus.push('左辅右弼同会');
  if (sanFangSet.has('文昌') || sanFangSet.has('文曲')) bonus.push('再会昌曲');
  if (hasShaInPalace(ziwei, SHA_KONG)) breaking.push("자부 궁이 비어 있습니다 (자부의 귀족을 깨뜨림)");
  if (shaCountInPalace(ziwei, SHA_HARD) >= 2) breaking.push('紫府宫见双煞同坐');

  patterns.push({
    name: '紫府同宫',
    level: inMing && !breaking.length ? 'excellent' : 'good',
    description: inMing
      ? "자미천부가 명궁에 함께 들어가고, 황제와 신하들이 함께 모여 고귀한 명령이 내려집니다. 주님은 행실이 좋으시고, 먹을 것과 입을 것을 걱정하지 않으시며, 지도자의 능력을 갖고 계십니다. 그는 중요한 직책을 맡는 데 적합합니다. 큰 그리드를 완성하려면 좌우 조력자의 조화가 필요하다."
      : "자미천부동궁 운명에 있어서는 아니지만 주님은 평생 고귀한 사람들의 지원을 받으시겠지만 반드시 부자는 아닐 수도 있습니다. 그것은 행운과 불운에 달려 있습니다.",
    palaces: [ziwei.name],
    conditions: { required, bonus, breaking },
    source: "\"자미두수전서·지푸 동궁 스타일\"",
  });
}

/* * 총리의 황궁: 천부 및 천상은 각각 명궁의 삼방사정에 위치합니다. */
function detectFuXiangChaoYuan(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  const tianfu = findStarPalace(chart, '天府');
  const tianxiang = findStarPalace(chart, '天相');
  if (!tianfu || !tianxiang) return;
  if (!isInSanFang(chart, tianfu.branch) || !isInSanFang(chart, tianxiang.branch)) return;
  if (tianfu.branch === chart.mingGongBranch && tianxiang.branch === chart.mingGongBranch) return;
  if (tianfu.branch === tianxiang.branch) return;

  const required = ['天府坐命三方', '天相坐命三方', '两星不同宫'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (hasStar(ming, '禄存') || palaceHasSiHua(ming, '禄')) bonus.push('命宫见禄');
  if (sanFangAllStars(chart).has('左辅')) bonus.push('再会左辅');
  if (hasShaInPalace(ming, SHA_HARD)) breaking.push('命宫坐煞星');
  if (sanFangShaCount(chart, SHA_HARD) >= 3) breaking.push('三方四正煞星过多');

  patterns.push({
    name: '府相朝垣',
    level: breaking.length ? 'good' : 'excellent',
    description: "천부천상은 명궁삼방사정로 나뉘며, 민사 및 군사 기술, 권력 및 봉인을 모두 갖춘 영주는 평생 동안 식량과 의복이 풍부하며 높은 지위를 갖게 됩니다. 고서에는 \"관상이 궁궐에 조의를 표하고 식비와 월급으로 천벨을 바친다\"고 적혀 있는데, 이는 정치계나 기업가들에게서 흔히 볼 수 있는 일이다.",
    palaces: [tianfu.name, tianxiang.name],
    conditions: { required, bonus, breaking },
    source: "\"자미두수전서·저택 총리 조원거\"",
  });
}

/* * 양량 창루: 태양+천량+문창+녹존 4성 사회 명궁, 다 퀘이커 */
function detectYangLiangChangLu(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  if (!sanFangSet.has('太阳') || !sanFangSet.has('天梁') ||
      !sanFangSet.has('文昌') || !sanFangSet.has('禄存')) return;

  const sun = findStarPalace(chart, '太阳')!;
  const liang = findStarPalace(chart, '天梁')!;
  const required = [
    '太阳会命宫三方',
    '天梁会命宫三方',
    '文昌会命宫三方',
    '禄存会命宫三方',
  ];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (isBright(sun, '太阳')) bonus.push('太阳庙旺');
  if (isBright(liang, '天梁')) bonus.push('天梁庙旺');
  if (sanFangHasSiHua(chart, '科')) bonus.push('再会化科');
  if (isDim(sun, '太阳')) breaking.push("태양낙함 (Yangliang은 영광을 잃습니다)");
  if (sanFangShaCount(chart, SHA_HARD) >= 2) breaking.push('三方煞重');

  patterns.push({
    name: '阳梁昌禄',
    level: breaking.length ? 'good' : 'excellent',
    description: "4개의 별 태양, 천량, 문창 및 녹존은 \"제국 시험 별\"로 알려진 3개의 별 명궁과 결합됩니다. 그들은 고귀하고 탁월하며 시험운이 뛰어납니다. 그들은 학문, 문화 및 교육, 연구, 전문 자격의 길을 택하고 인생에서 쉽게 명성을 얻어야합니다.",
    palaces: [sun.name, liang.name],
    conditions: { required, bonus, breaking },
    source: "\"자미두수전서·양량창루게\"",
  });
}

/* * 화재 패턴/벨 패턴: 탐랑+화성 또는 탐랑+영성 동궁 또는 그에 따름 */
function detectHuoTanLingTan(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  const tan = findStarPalace(chart, '贪狼');
  if (!tan) return;
  const huo = findStarPalace(chart, '火星');
  const ling = findStarPalace(chart, '铃星');

  for (const [shaName, shaPalace] of [['火星', huo], ['铃星', ling]] as const) {
    if (!shaPalace) continue;
    const sameOrTrine =
      tan.branch === shaPalace.branch ||
      (tan.branch + 4) % 12 === shaPalace.branch ||
      (tan.branch + 8) % 12 === shaPalace.branch ||
      (tan.branch + 6) % 12 === shaPalace.branch;
    if (!sameOrTrine) continue;
    if (!isInSanFang(chart, tan.branch)) continue;

    const required = [`탐랑${tan.branch === shaPalace.branch ? '同宫' : '会照'}${shaName}`, '贪狼会照命宫三方'];
    const bonus: string[] = [];
    const breaking: string[] = [];
    if (isBright(tan, '贪狼')) bonus.push('贪狼庙旺');
    if (getStarSiHua(tan, '贪狼') === '禄' || getStarSiHua(tan, '贪狼') === '权') bonus.push('贪狼化禄/化权');
    if (hasShaInPalace(tan, ['擎羊', '陀罗'])) breaking.push("탐랑 궁에서 다시 양타를 만나다(가로머리를 부러뜨리는 힘)");
    if (hasShaInPalace(tan, SHA_KONG)) breaking.push("탐랑은 항공 재난을 겪습니다 (돈이 왔다 갔다 합니다)");

    patterns.push({
      name: shaName === '火星' ? '火贪格' : '铃贪格',
      level: breaking.length ? 'good' : 'excellent',
      description: `탐랑 만남${shaName}${tan.branch === shaPalace.branch ? '同宫' : '三方会照'}, 갑작스러운 횡재와 갑작스러운 기회를 나타냅니다. 고대서에는 "탐랑이 불의 종을 만나면 횡재를 얻게 될 것"이라고 적혀 있습니다. 하지만 오자마자, 오는 대로 빨리 갈 것이기 때문에, 좋으면 바로 포기하는 것이 좋습니다.${breaking.length ? "해당 마켓에 예외적인 조건이 발생하여 할인 혜택이 제공됩니다." : ''}`,
      palaces: [tan.name, shaPalace.name],
      conditions: { required, bonus, breaking },
      source: "\"자미두수골수부\"",
    });
  }
}

/* * 우잔 패턴: 무곡+탐랑 동궁 (추악, 아님) 또는 제어 */
function detectWuTan(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  const wu = findStarPalace(chart, '武曲');
  const tan = findStarPalace(chart, '贪狼');
  if (!wu || !tan) return;
  const sameOrOppose = wu.branch === tan.branch || (wu.branch + 6) % 12 === tan.branch;
  if (!sameOrOppose) return;
  if (!isInSanFang(chart, wu.branch) && !isInSanFang(chart, tan.branch)) return;

  const required = [
    wu.branch === tan.branch ? "무곡탐랑동궁 (추악한/un)" : '武曲贪狼对宫拱照',
    '会照命宫三方',
  ];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sanFangAllStars(chart).has('火星') || sanFangAllStars(chart).has('铃星'))
    bonus.push("화성/영성를 다시 만나보세요(파이어그리드/벨그리드 중첩)");
  if (getStarSiHua(wu, '武曲') === '禄') bonus.push('武曲化禄');
  if (hasShaInPalace(wu, ['擎羊', '陀罗'])) breaking.push('武贪宫见羊陀');
  if (hasShaInPalace(wu, SHA_KONG)) breaking.push('武贪宫遇空劫');

  patterns.push({
    name: '武贪格',
    level: breaking.length ? 'good' : 'excellent',
    description: "무곡탐랑 운세, 복성, 복숭아꽃 소원성이 함께 빛나는데, 고서에는 \"청년은 무술에 욕심이 많다\"고 적혀 있는데, 서른 살이 지나야 많은 부를 축적할 수 있다. 그 사람은 중년 이후에 부자가 될 것입니다. 부는 연결, 오락 및 욕망의 관리에서 비롯됩니다. 금융, 투기, 판매, 엔터테인먼트 산업에 적합합니다.",
    palaces: [wu.name, tan.name],
    conditions: { required, bonus, breaking },
    source: "\"자미두수골수부\"",
  });
}

/* * 샤포랑 : 칠살, 파군, 탐랑 모여서 */
function detectShaPoLang(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  const has = ['七杀', '破军', '贪狼'].filter(s => sanFangSet.has(s));
  if (has.length < 3) return;

  const required = ["칠살, 파군, 탐랑 삼성이 명궁삼방사정에 합류했습니다."];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sanFangHasSiHua(chart, '禄') || sanFangHasSiHua(chart, '权')) bonus.push("세 당사자는 화록 또는 화권을 가지고 있습니다 (강하게 움직입니다)");
  if (sanFangSet.has('左辅') && sanFangSet.has('右弼')) bonus.push("국무총리와 총리가 함께 하겠습니다(변화에 귀한 인재를 모십니다)");
  if (sanFangShaCount(chart, SHA_HARD) >= 3) breaking.push("살성이 너무 무거움(이동 실패)");
  if (hasShaInPalace(ming, SHA_KONG)) breaking.push("운명은 공중에 앉는 것 (움직이기 힘들다)");

  patterns.push({
    name: '杀破狼',
    level: breaking.length ? 'caution' : 'good',
    description: "칠살, 파군, 탐랑 세 개의 별이 운명을 만나 모험의 운명을 창조하게 됩니다. 삶에는 많은 변화가 있으며, 당신은 평범해지기를 꺼려합니다. 창업, 헌병, 사업, 영업에 적합한 당신입니다. 중년 이후에야 안정되고 보수적일 수 있으며, 젊을 때에는 충동성으로 인해 실패하기 쉽습니다.",
    palaces: getSanFangPalaces(chart).filter(p => has.includes(getMajorStarNames(p)[0])).map(p => p.name),
    conditions: { required, bonus, breaking },
    source: "\"자미두수전서·샤포랑\"",
  });
}

/* * 달과 달이 같은 광선에 있음: 천기, 태음, 천동, 천량 네 개의 별이 모두 생명과 부관에 들어갑니다. */
function detectJiYueTongLiang(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  const has = ['天机', '太阴', '天同', '天梁'].filter(s => sanFangSet.has(s));
  if (has.length < 4) return;

  const required = ["천기, 태음, 천동, 천량 명궁삼방사정에 별 4개가 추가됩니다."];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sanFangSet.has('文昌') || sanFangSet.has('文曲')) bonus.push('再会昌曲');
  if (sanFangHasSiHua(chart, '科')) bonus.push('再会化科');
  if (sanFangShaCount(chart, SHA_HARD) >= 3) breaking.push("살성이 너무 많습니다(Ji Yue와 Liang Ji는 사악함)");
  if (hasShaInPalace(ming, SHA_HARD)) breaking.push('命宫坐煞');

  patterns.push({
    name: '机月同梁',
    level: breaking.length ? 'good' : 'excellent',
    description: "천기태음천동천량의 별 4개는 재무 담당자가 될 운명입니다. 그들은 온화하고 지능적이며 수완이 뛰어납니다. 공공 서비스, 학계, 문학 및 예술, 의료, 서비스 등 안정적인 축적이 필요한 산업에 가장 적합하며 큰 위험과 투기에 적합하지 않습니다.",
    palaces: getSanFangPalaces(chart).filter(p => has.some(s => getMajorStarNames(p).includes(s))).map(p => p.name),
    conditions: { required, bonus, breaking },
    source: "\"자미두수전서·머신문과 량거\"",
  });
}

/* * 염정천상: 동궁 */
function detectLianXiang(chart: ZiweiChart, patterns: Pattern[]) {
  const lian = findStarPalace(chart, '廉贞');
  const xiang = findStarPalace(chart, '天相');
  if (!lian || !xiang || lian.branch !== xiang.branch) return;

  const inMing = lian.branch === chart.mingGongBranch;
  const required = ['廉贞天相同宫'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (hasStar(lian, '禄存') || getStarSiHua(lian, '廉贞') === '禄') bonus.push('见禄存或廉贞化禄');
  if (sanFangAllStars(chart).has('左辅')) bonus.push('左辅会照');
  if (hasShaInPalace(lian, ['擎羊'])) breaking.push("경양는 Lian 총리의 궁에 있습니다 (염상은 양을 죽이는 경향이 있습니다)");
  if (getStarSiHua(lian, '廉贞') === '忌') breaking.push('廉贞化忌');

  patterns.push({
    name: '廉贞天相格',
    level: breaking.length ? 'caution' : (inMing ? 'good' : 'neutral'),
    description: "염정천상동궁, 씰리본 격국은 공정함과 성실함의 이름으로 공직, 행정, 법무, 기획 등에 적합합니다. 경양화기를 보는 것이 두렵다면 공무원에게 등을 돌릴 것입니다.",
    palaces: [lian.name],
    conditions: { required, bonus, breaking },
    source: '《紫微斗数全书》',
  });
}

/* * 무곡칠살: 동궁, 별과 행운의 별을 일치시키세요 */
function detectWuQiSha(chart: ZiweiChart, patterns: Pattern[]) {
  const wu = findStarPalace(chart, '武曲');
  const qi = findStarPalace(chart, '七杀');
  if (!wu || !qi || wu.branch !== qi.branch) return;

  const inMing = wu.branch === chart.mingGongBranch;
  const required = ['武曲七杀同宫'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (getStarSiHua(wu, '武曲') === '权') bonus.push('武曲化权');
  if (getStarSiHua(wu, '武曲') === '禄') bonus.push('武曲化禄');
  if (getStarSiHua(wu, '武曲') === '忌') breaking.push("무곡화기 (무곡화기는 금융 재앙의 징조입니다)");
  if (hasShaInPalace(wu, ['擎羊', '陀罗', '火星', '铃星'])) breaking.push('武杀宫煞星过多');

  patterns.push({
    name: '武曲七杀',
    level: breaking.length ? 'caution' : (inMing ? 'excellent' : 'good'),
    description: "일반 별인 무곡칠살동궁은 부의 별과 일치하며 결단력과 인내, 강력한 재무 관리 능력을 나타내며 금융, 군대 및 경찰 및 기업가 정신에 적합합니다. 그러나 화기살성을 보지 마십시오. 그렇지 않으면 위험할 것입니다. 평생 고생하고 부를 축적하되 걱정하라.",
    palaces: [wu.name],
    conditions: { required, bonus, breaking },
    source: '《紫微斗数全书》',
  });
}

/* * 천동천량: 동궁 */
function detectTongLiang(chart: ZiweiChart, patterns: Pattern[]) {
  const tong = findStarPalace(chart, '天同');
  const liang = findStarPalace(chart, '天梁');
  if (!tong || !liang || tong.branch !== liang.branch) return;

  const required = ['天同天梁同宫'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sanFangAllStars(chart).has('文昌')) bonus.push('文昌会照');
  if (getStarSiHua(tong, '天同') === '禄') bonus.push('天同化禄');
  if (hasShaInPalace(tong, SHA_HARD)) breaking.push('煞星同坐');

  patterns.push({
    name: '天同天梁格',
    level: breaking.length ? 'neutral' : 'good',
    description: "천동천량동궁, 행운의 별과 부정적인 별이 함께 있어 관대함, 친절함, 다른 사람을 도우려는 의지를 나타냅니다. 의료, 교육, 종교, 사회복지에 적합합니다. 그러나 온건하고 보수적이어서 부자가 되고 권력을 잡는 것은 어렵습니다.",
    palaces: [tong.name],
    conditions: { required, bonus, breaking },
    source: '《紫微斗数全书》',
  });
}

/* * 태양과 달 동궁: 태양태음 Chou 또는 Wei Gong 동궁 */
function detectRiYueTongGong(chart: ZiweiChart, patterns: Pattern[]) {
  const sun = findStarPalace(chart, '太阳');
  const moon = findStarPalace(chart, '太阴');
  if (!sun || !moon || sun.branch !== moon.branch) return;
  if (sun.branch !== 1 && sun.branch !== 7) return;  // 못생겼을 수도 있고(1) 그렇지 않을 수도 있음(7)

  const inMing = sun.branch === chart.mingGongBranch;
  const required = [`태양태음 동일한 항목${BRANCH_NAMES[sun.branch]}궁`];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sun.branch === 7) bonus.push("웨이공의 해와 달은 함께 빛난다(고서에는 웨이공의 해와 달이 모두 아름답다고 전해진다)");
  if (sanFangAllStars(chart).has('文昌') && sanFangAllStars(chart).has('文曲')) bonus.push('昌曲会照');
  if (hasShaInPalace(sun, SHA_HARD)) breaking.push('日月宫煞星同坐');

  patterns.push({
    name: '日月同宫',
    level: breaking.length ? 'good' : (inMing ? 'excellent' : 'good'),
    description: `태양태음 에${BRANCH_NAMES[sun.branch]}Palace 동궁, 음과 양은 민간과 군사 모두에서 균형을 이루고 있습니다. 이성과의 행운, 순조로운 경력, 광범위한 평판을 의미합니다.${sun.branch === 7 ? "위궁의 해와 달의 아름다움이 특히 좋습니다." : "추악한 궁 동궁에서 태양과 달의 힘은 비교적 평균적입니다."}`,
    palaces: [sun.name],
    conditions: { required, bonus, breaking },
    source: '《紫微斗数全书》',
  });
}

/* * 태양과 달: 명궁 전후의 두 집에 있는 태양태음 */
function detectRiYueJiaMing(chart: ZiweiChart, patterns: Pattern[]) {
  const { prev, next } = getJiaPalaces(chart, chart.mingGongBranch);
  if (!prev || !next) return;
  const prevHasSun = hasStar(prev, '太阳');
  const prevHasMoon = hasStar(prev, '太阴');
  const nextHasSun = hasStar(next, '太阳');
  const nextHasMoon = hasStar(next, '太阴');
  const ok = (prevHasSun && nextHasMoon) || (prevHasMoon && nextHasSun);
  if (!ok) return;

  const sunPalace = prevHasSun ? prev : next;
  const moonPalace = prevHasMoon ? prev : next;
  const required = ["태양태음은 명궁 전후에 두 개의 궁으로 구분됩니다."];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (isBright(sunPalace, '太阳')) bonus.push('太阳庙旺');
  if (isBright(moonPalace, '太阴')) bonus.push('太阴庙旺');
  if (isDim(sunPalace, '太阳') || isDim(moonPalace, '太阴')) breaking.push("태양과 달 낙함 (생명에는 빛이 없다)");

  patterns.push({
    name: '日月夹命',
    level: breaking.length ? 'good' : 'excellent',
    description: "태양태음은 떨어져 살며 명궁의 양쪽에서 사진을 찍습니다. 그들은 꼿꼿하고 꼿꼿합니다. 그들은 평생 동안 고귀한 사람들의 도움을 받을 것이며 그들의 직업은 번영할 것입니다. 남자 주인공은 귀족 출신이고, 여자 주인공은 부유한 남편과 가족을 갖고 있다. 태양과 달이 진실로 간주되려면 낙함이 아니어야 합니다.",
    palaces: [sunPalace.name, moonPalace.name],
    conditions: { required, bonus, breaking },
    source: "\"자미두수전서·해와 달\"",
  });
}

/* * 주리 동궁 : 거문태양이 음에 합류하거나 적용됩니다. */
function detectJuRiTongGong(chart: ZiweiChart, patterns: Pattern[]) {
  const ju = findStarPalace(chart, '巨门');
  const sun = findStarPalace(chart, '太阳');
  if (!ju || !sun || ju.branch !== sun.branch) return;
  if (ju.branch !== 2 && ju.branch !== 8) return;  // 음(2) 또는 심(8)이어야 합니다.

  const inMing = ju.branch === chart.mingGongBranch;
  const required = [`거문태양 동일한 항목${BRANCH_NAMES[ju.branch]}궁`];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (ju.branch === 2) bonus.push("음궁 태양묘왕, 거문은 햇빛을 받아 분쟁을 해결합니다.");
  if (getStarSiHua(ju, '巨门') === '禄' || getStarSiHua(ju, '巨门') === '权') bonus.push("거문화록/화권 (웅변이 돈을 번다)");
  if (getStarSiHua(ju, '巨门') === '忌') breaking.push("거문화기 (혀와 혀)");
  if (ju.branch === 8) breaking.push("Shen Palace 태양은 서쪽에 있고 거문 흑요석은 더 분명합니다.");

  patterns.push({
    name: '巨日同宫',
    level: breaking.length ? 'caution' : (inMing && ju.branch === 2 ? 'excellent' : 'good'),
    description: `거문태양과 동일${BRANCH_NAMES[ju.branch]}Palace, 태양은 거문의 흑요석을 주로 웅변, 미디어, 외국어 및 직업 경력으로 해결합니다. Yin Palace는 더 좋지만 Shen Palace는 덜 강력합니다. 거문화기를 두려워하면 불법입니다.`,
    palaces: [ju.name],
    conditions: { required, bonus, breaking },
    source: "\"자미두수전서·쥬리 동궁\"",
  });
}

/* * 돌 속에 숨겨진 옥: 거문은 Ziwu Palace로 향합니다 */
function detectShiZhongYinYu(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  if (!hasStar(ming, '巨门')) return;
  if (ming.branch !== 0 && ming.branch !== 6) return;  // Zi(0) 또는 Wu(6)

  const required = [`거문은 다음과 같습니다.${BRANCH_NAMES[ming.branch]}궁`];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (getStarSiHua(ming, '巨门') === '禄' || getStarSiHua(ming, '巨门') === '权') bonus.push('巨门化禄/化权');
  if (sanFangAllStars(chart).has('文昌')) bonus.push("문창 만남(돌 속에 숨겨진 옥이 드러난다)");
  if (getStarSiHua(ming, '巨门') === '忌') breaking.push("거문화기 (깊은 진흙 속에 숨겨진 옥)");
  if (hasShaInPalace(ming, SHA_HARD)) breaking.push('命坐煞星');

  patterns.push({
    name: '石中隐玉',
    level: breaking.length ? 'caution' : 'excellent',
    description: "거문은 쯔우(Ziwu)에서 태어났습니다. 겉으로는 평범하지만 속으로는 재능과 학식이 있는 인물이다. 초기에는 무명이고 중년에만 고귀함을 나타내는 사람들은 직업, 연구, 웅변 및 언론에 적합합니다. Lu Quan 또는 문창의 도움이 있어야만 \"돌을 자르고 옥을 볼 수 있습니다\".",
    palaces: ['命宫'],
    conditions: { required, bonus, breaking },
    source: "\"자미두수골수부·돌 속에 숨겨진 옥\"",
  });
}

/* * 진주는 바다로 나간다 : 명궁은 미래의 공궁이고, 대궁의 추악한 궁은 태양태음이다 */
function detectMingZhuChuHai(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  if (ming.branch !== 7) return;   // 운명은 미래에 있다
  if (getMajorStarNames(ming).length > 0) return;   // 명궁은 공궁입니다.
  const dui = getDuiGong(chart, ming.branch);
  if (!dui) return;
  if (!hasStar(dui, '太阳') || !hasStar(dui, '太阴')) return;

  const required = ['命宫在未为空宫', "대궁 추악한 궁은 태양태음과 같은 등급입니다"];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sanFangAllStars(chart).has('文昌') || sanFangAllStars(chart).has('文曲')) bonus.push('再会昌曲');
  if (sanFangAllStars(chart).has('左辅') || sanFangAllStars(chart).has('右弼')) bonus.push('辅弼相助');
  if (sanFangShaCount(chart, SHA_HARD) >= 2) breaking.push("살성이 빛날 것입니다 (진주 빛이 희미합니다)");

  patterns.push({
    name: '明珠出海',
    level: breaking.length ? 'good' : 'excellent',
    description: "운명이 공궁, 대궁 이전에 Chou Palace는 태양과 달에 의해 조명되어 \"Pearl Going to the Sea\"라고 불립니다. 평범하게 태어났고 나중에 출세하려고 열심히 노력했다면 다른 곳으로 가서 학문 연구를 하거나 대기업의 높은 직책을 맡아야 합니다. 당신은 부자가 되고 강력해질 것입니다.",
    palaces: ['命宫', dui.name],
    conditions: { required, bonus, breaking },
    source: "\"자미두수전집·진주가 바다로 가다\"",
  });
}

/* * 자미 혼자 앉아서 죽다 */
function detectZiWeiInMing(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  if (!hasStar(ming, '紫微') || hasStar(ming, '天府')) return;

  const required = ["자미는 혼자 앉아 있습니다. 명궁(천부는 함께 앉아 있지 않음)"];
  const bonus: string[] = [];
  const breaking: string[] = [];
  const sanFangSet = sanFangAllStars(chart);
  if (sanFangSet.has('左辅') && sanFangSet.has('右弼')) bonus.push('左辅右弼同会');
  if (sanFangSet.has('文昌') && sanFangSet.has('文曲')) bonus.push('文昌文曲同会');
  if (!sanFangSet.has('左辅') && !sanFangSet.has('右弼')) breaking.push("우푸비(吳富皇)(신하 없이 외로운 왕)");
  if (hasShaInPalace(ming, SHA_KONG)) breaking.push("자미는 공중 재해에 직면합니다(고대 서적에서 가장 금기시되는 내용)");

  patterns.push({
    name: '紫微入命',
    level: breaking.length ? 'caution' : (bonus.length ? 'excellent' : 'good'),
    description: "자미 혼자 앉아 있는 황제의 별 명궁은 강한 자존감과 리더십 카리스마를 가지고 있습니다. 그러나 자미가 가장 두려워하는 것은 \"외로운 군주\"입니다. 좌우 총리 간의 만남이 없으면 그는 냉담하고 오만하며 비방을 받기 쉽습니다.",
    palaces: ['命宫'],
    conditions: { required, bonus, breaking },
    source: '《紫微斗数全书》',
  });
}

/* * 총리의 운명 */
function detectFuBiJiaMing(chart: ZiweiChart, patterns: Pattern[]) {
  const { prev, next } = getJiaPalaces(chart, chart.mingGongBranch);
  if (!prev || !next) return;
  const prevHasZuo = hasStar(prev, '左辅');
  const prevHasYou = hasStar(prev, '右弼');
  const nextHasZuo = hasStar(next, '左辅');
  const nextHasYou = hasStar(next, '右弼');
  if (!((prevHasZuo && nextHasYou) || (prevHasYou && nextHasZuo))) return;

  const required = ["좌보우필는 명궁 전후에 두 개의 궁으로 구분됩니다."];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sanFangAllStars(chart).has('天魁') || sanFangAllStars(chart).has('天钺')) bonus.push('再会魁钺');

  patterns.push({
    name: '辅弼夹命',
    level: 'excellent',
    description: "좌보우필는 운명의 상징입니다. 전통적인 논의에서는 이 패턴이 고귀한 사람들의 도움과 축복을 상징한다고 믿습니다. 공식 경력, 대기업 경영 및 조직의 재능을 활용할 수 있는 기타 방향에 적합합니다. 고대 서적에는 \"좌보우필, 평생 축복\"이라고 적혀 있습니다. 이는 조직 조정에서 이러한 패턴의 장점을 강조합니다.",
    palaces: ['命宫', prev.name, next.name],
    conditions: { required, bonus, breaking },
    source: "\"자미두수전서·푸비의 운명\"",
  });
}

/* * 창취의 운명 */
function detectChangQuJiaMing(chart: ZiweiChart, patterns: Pattern[]) {
  const { prev, next } = getJiaPalaces(chart, chart.mingGongBranch);
  if (!prev || !next) return;
  const prevHasChang = hasStar(prev, '文昌');
  const prevHasQu = hasStar(prev, '文曲');
  const nextHasChang = hasStar(next, '文昌');
  const nextHasQu = hasStar(next, '文曲');
  if (!((prevHasChang && nextHasQu) || (prevHasQu && nextHasChang))) return;

  patterns.push({
    name: '昌曲夹命',
    level: 'excellent',
    description: "명궁 사이에 끼인 문창문곡는 지성, 미모, 뛰어난 문학적 재능을 나타냅니다. 문학, 교육, 학계, 예술, 글쓰기에 적합합니다. 고대 서적에는 \"Changqujia 명주 Kejia\"가 시험 행운에 가장 좋다고 말합니다.",
    palaces: ['命宫', prev.name, next.name],
    conditions: { required: ["문창문곡는 명궁 전후에 두 개의 궁으로 구분됩니다."] },
    source: '《紫微斗数全书》',
  });
}

/* * Kuiyue의 운명 */
function detectKuiYueJiaMing(chart: ZiweiChart, patterns: Pattern[]) {
  const { prev, next } = getJiaPalaces(chart, chart.mingGongBranch);
  if (!prev || !next) return;
  const okA = hasStar(prev, '天魁') && hasStar(next, '天钺');
  const okB = hasStar(prev, '天钺') && hasStar(next, '天魁');
  if (!okA && !okB) return;

  patterns.push({
    name: '魁钺夹命',
    level: 'good',
    description: "천괴천월 운명, 남자의 이름은 Tianyi, 여자의 이름은 Yutang이며 평생 고귀한 사람들의 지원을 받게 될 것입니다. 시험이나 취업, 중요한 순간에는 예상치 못한 조력자가 등장하는 경우가 많습니다.",
    palaces: ['命宫', prev.name, next.name],
    conditions: { required: ["천괴천월는 명궁 전후에 두 개의 궁으로 구분됩니다."] },
    source: '《紫微斗数全书》',
  });
}

/* * Shuanglu Chaoyuan: 세 당사자와 함께 화록 + 녹존 */
function detectShuangLuChaoYuan(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  const sanFang = getSanFangPalaces(chart);
  let huaLuFound = false;
  let luCunFound = false;
  for (const p of sanFang) {
    if (p.stars.some(s => s.siHua === '禄')) huaLuFound = true;
    if (hasStar(p, '禄存')) luCunFound = true;
  }
  if (!huaLuFound || !luCunFound) return;

  patterns.push({
    name: '双禄朝垣',
    level: 'excellent',
    description: "화록, 녹존 및 명궁삼방사정은 풍부한 재정 자원과 풍부한 음식과 의복을 갖게 될 것입니다. 고대 책에는 \"두 여조원, 도주보다 부자\"라고 적혀 있는데, 주님은 일생 동안 재물을 걱정하지 않으시며 행운과 바람이 함께 하게 될 것입니다.",
    palaces: sanFang.map(p => p.name),
    conditions: {
      required: ['化禄会照三方四正', '禄存会照三方四正'],
      breaking: hasShaInPalace(ming, SHA_KONG) ? ["운은 하늘에 있다(두 운이 하늘에서 만나 재물이 왔다 갔다 한다)"] : undefined,
    },
    source: "\"자미두수전서·솽로 조원\"",
  });
}

/* * Sanqi가 회의에 합류: 화록 화권 화과가 세 당사자에 합류 */
function detectSanQiJiaHui(chart: ZiweiChart, patterns: Pattern[]) {
  const sanFangPalaces = getSanFangPalaces(chart);
  let lu = false, quan = false, ke = false;
  for (const p of sanFangPalaces) {
    for (const s of p.stars) {
      if (s.siHua === '禄') lu = true;
      if (s.siHua === '权') quan = true;
      if (s.siHua === '科') ke = true;
    }
  }
  if (!(lu && quan && ke)) return;

  patterns.push({
    name: '三奇加会',
    level: 'excellent',
    description: "화록, 화권, 화과 Sanji Hua Hui 명궁삼방사정은 \"Three Qi Hua Hui\"로 알려져 있습니다. 자미두수의 가장 높은 상서로운 표시 중 하나입니다.",
    palaces: sanFangPalaces.map(p => p.name),
    conditions: { required: ["화록, 화권, 화과 산지화 치후이 명궁삼방사정"] },
    source: "\"자미두수전서·삼치 지아후이\"",
  });
}

/* * 화록은 운명/공무원/부로 들어갑니다. */
function detectHuaLuRuMing(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  const huaLuStar = ming.stars.find(s => s.siHua === '禄' && s.type === 'major');
  if (!huaLuStar) return;

  patterns.push({
    name: `${huaLuStar.name}화록은 운명이다`,
    level: 'good',
    description: `${huaLuStar.name}화록이 별자리에 있으면 행운, 좋은 인기, 많은 기회를 의미합니다.${huaLuStar.name === '武曲' ? "무곡화록은 긍정적인 부에 속하며 산업 및 금융에 적합합니다." : huaLuStar.name === '太阴' ? "태음화록은 그늘진 부와 부동산에 속합니다." : huaLuStar.name === '贪狼' ? "탐랑화록은 풍부한 인연과 복숭아꽃에 속합니다." : ''}`,
    palaces: ['命宫'],
    conditions: { required: [`${huaLuStar.name}화록은 명궁에 위치합니다.`] },
    source: '《紫微斗数全书》',
  });
}

// ────────────────── 잘못된 패턴 인식기 ───────────────────

/* * 화기가 들어가거나 이동합니다 */
function detectHuaJiRuMingQian(chart: ZiweiChart, patterns: Pattern[]) {
  const qianBranch = (chart.mingGongBranch + 6) % 12;
  for (const palace of chart.palaces) {
    if (palace.branch !== chart.mingGongBranch && palace.branch !== qianBranch) continue;
    const jiStar = palace.stars.find(s => s.siHua === '忌' && s.type === 'major');
    if (!jiStar) continue;

    const inMing = palace.branch === chart.mingGongBranch;
    patterns.push({
      name: `${jiStar.name}화기 입력${inMing ? '命' : '迁'}`,
      level: 'caution',
      description: inMing
        ? `${jiStar.name}화기가 명궁에 앉으면 자신의 완고함, 정신 장애 또는 건강 위험에주의를 기울이고 모든 것에 대해 한발 물러나 생각해야합니다. 화기가 반드시 나쁜 것은 아니며, 이 별의 에너지에 특별한 주의가 필요하다는 의미입니다.`
        : `${jiStar.name}화기가 천이궁에 있으면 외출이나 장거리 여행, 대인관계 등에서 우여곡절이 생기기 쉬우므로 움직이는 것보다 침착한 자세를 유지하는 것이 좋습니다.`,
      palaces: [palace.name],
      conditions: { required: [`${jiStar.name}화기 앉아${inMing ? '命' : '迁'}궁`] },
      source: '《紫微斗数全书》',
    });
  }
}

/* * 양타에 대한 금기 : 화기가 궁궐에 앉아 있고, 경양타라에 의해 좌우로 꼬집어지고 있습니다. */
function detectYangTuoJiaJi(chart: ZiweiChart, patterns: Pattern[]) {
  for (const palace of chart.palaces) {
    const jiStar = palace.stars.find(s => s.siHua === '忌');
    if (!jiStar) continue;
    if (palace.branch !== chart.mingGongBranch) continue;   // 명궁이 고정되는 모습을 지켜보세요.

    const { prev, next } = getJiaPalaces(chart, palace.branch);
    if (!prev || !next) continue;
    const aPrev = hasStar(prev, '擎羊') && hasStar(next, '陀罗');
    const aNext = hasStar(prev, '陀罗') && hasStar(next, '擎羊');
    if (!aPrev && !aNext) continue;

    patterns.push({
      name: '羊陀夹忌',
      level: 'caution',
      description: "화기는 별자리에 앉아 있고, 경양타라는 좌우로 별자리를 잡고 있습니다. 고대서에는 \"양타가 금기를 품는 것은 패배를 의미한다\"고 적혀 있는데, 이는 그 사람이 열심히 일하고 기복이 심하며 육체적, 정신적으로 지친 삶을 살고 있음을 나타냅니다. 도덕수양과 적극적인 활동으로 해결해야 하며, 모든 일에는 주의가 가장 중요합니다.",
      palaces: ['命宫', prev.name, next.name],
      conditions: { required: ['化忌坐命', "경양타라는 명궁 전후에 두 개의 궁으로 구분됩니다."] },
      source: "\"자미두수골수부·양퉈가보\"",
    });
    return;
  }
}

/* * 불종의 운명 : 화성영성는 명궁 전후로 분리됨 */
function detectHuoLingJiaMing(chart: ZiweiChart, patterns: Pattern[]) {
  const { prev, next } = getJiaPalaces(chart, chart.mingGongBranch);
  if (!prev || !next) return;
  const okA = hasStar(prev, '火星') && hasStar(next, '铃星');
  const okB = hasStar(prev, '铃星') && hasStar(next, '火星');
  if (!okA && !okB) return;

  patterns.push({
    name: '火铃夹命',
    level: 'caution',
    description: "화성영성는 명궁로 구분됩니다. 두 집은 명궁 전후에 끼어 있으며 조바심, 충동, 갑작스러운 사고 또는 분쟁을 나타냅니다. 인내심을 기르고 충동적인 결정을 피해야 합니다.",
    palaces: ['命宫', prev.name, next.name],
    conditions: { required: ["화성영성는 명궁 전후에 두 개의 궁으로 구분됩니다."] },
    source: '《紫微斗数全书》',
  });
}

/* * 하늘 환난의 운명 : 명궁 전후로 분리된 지공지겁 */
function detectKongJieJiaMing(chart: ZiweiChart, patterns: Pattern[]) {
  const { prev, next } = getJiaPalaces(chart, chart.mingGongBranch);
  if (!prev || !next) return;
  const okA = hasStar(prev, '地空') && hasStar(next, '地劫');
  const okB = hasStar(prev, '地劫') && hasStar(next, '地空');
  if (!okA && !okB) return;

  patterns.push({
    name: '空劫夹命',
    level: 'caution',
    description: "지공지겁는 당신의 삶에 있어 재물의 오고 가는 것을 나타내며, 생각이 세련되고 종교 철학에 쉽게 빠질 수 있습니다. 옛 책에는 \"하늘에 재앙이 일어나 네 생명이 망하고 네 재물이 모이지 못하리라\"고 했습니다. 예술, 종교, 연구 및 기타 비물질적 사업에 적합합니다.",
    palaces: ['命宫', prev.name, next.name],
    conditions: { required: ["지공지겁는 명궁 전후에 두 개의 궁으로 구분됩니다."] },
    source: '《紫微斗数全书》',
  });
}

/* * 저렴한 양 죽이기 : 염정, 칠살, 경양 별 3개 사진 (유년대한이 가장 악랄함) */
function detectLianShaYang(chart: ZiweiChart, patterns: Pattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  if (!(sanFangSet.has('廉贞') && sanFangSet.has('七杀') && sanFangSet.has('擎羊'))) return;

  patterns.push({
    name: '廉杀羊',
    level: 'caution',
    description: "염정, 칠살 및 경양 삼성은 전통적인 논의에서 특별한 주의가 필요한 조합으로 표시된 명궁을 따를 것입니다. 이 그리드는 대한유년이 트리거될 때 주의해야 함을 상기시켜 줍니다. 운전 안전, 대인 관계 평화 및 의학적 의사 결정은 합리적이어야 하며 수동적 운명보다는 적극적인 관리를 강조합니다.",
    palaces: ['命宫'],
    conditions: { required: ["염정, 칠살, 경양 삼성은 삼방사정의 사진을 찍을 것입니다"] },
    source: "\"자미두수전서·리안이 양을 죽인다\"",
  });
}

/* * 거대 불양: 거문, 화성, 경양가 사진을 찍습니다. */
function detectJuHuoYang(chart: ZiweiChart, patterns: Pattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  if (!(sanFangSet.has('巨门') && sanFangSet.has('火星') && sanFangSet.has('擎羊'))) return;

  patterns.push({
    name: '巨火羊',
    level: 'caution',
    description: "거문, 화성, 경양 3성 조합, 전통적인 고대 서적에서는 이 패턴이 경계가 필요한 조합이라고 기록합니다(고대 텍스트인 \"매달려 죽다\"는 숙명론적 표현으로 오늘날 더 이상 적용되지 않습니다). 현대인의 이해는 다음과 같습니다. 이 조합은 공개적으로 말하면 쉽게 갈등을 유발할 수 있으며 감정이 격렬할 때 자기 인식이 필요하다는 것을 상징합니다. 수양방향은 온화한 표현을 실천하고, 갈등을 적극적으로 해결하며, 감정관리를 함양하는 것입니다.",
    palaces: ['命宫'],
    conditions: { required: ["거문, 화성, 경양 삼성은 삼방사정의 사진을 찍을 것입니다"] },
    source: "\"자미두수골수부·거대불양\"",
  });
}

/* * Lingchang Tuowu : 영성, 문창, 타라, 무곡 (강 건너기에 한함) */
function detectLingChangTuoWu(chart: ZiweiChart, patterns: Pattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  if (!(sanFangSet.has('铃星') && sanFangSet.has('文昌') && sanFangSet.has('陀罗') && sanFangSet.has('武曲'))) return;

  patterns.push({
    name: '铃昌陀武',
    level: 'caution',
    description: "네 개의 별 영성, 문창, 타라, 무곡이 모입니다. 전통적인 고서에는 이것이 특별한 주의가 필요한 조합이라고 기록되어 있다. 현대적인 제안은 다음과 같습니다. 이 조합이 대한유년에 의해 촉발되면 중요한 결정을 합리적으로 처리하고, 감정적 변동에 주의를 기울이고, 삶의 안정성을 유지하도록 상기시켜 줍니다. 즉, 수동적 대기보다는 적극적인 관리를 강조합니다.",
    palaces: ['命宫'],
    conditions: { required: ["영성, 문창, 타라, 무곡 4성 회의 삼방사정"] },
    source: "\"자미두수골수부·링창 투오우\"",
  });
}

/* * 화살이 달린 말 머리: 경양는 자오선 궁에 앉아 있습니다. */
function detectMaTouDaiJian(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  if (ming.branch !== 6) return;   // 정오가 되어야 합니다
  if (!hasStar(ming, '擎羊')) return;

  const required = ['擎羊于午宫坐命'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sanFangAllStars(chart).has('七杀') || sanFangAllStars(chart).has('破军')) bonus.push("안녕 칠살 또는 파군 (군 장교)");
  if (sanFangAllStars(chart).has('天魁') || sanFangAllStars(chart).has('天钺')) bonus.push('魁钺加照');

  patterns.push({
    name: '马头带箭',
    level: bonus.length ? 'good' : 'caution',
    description: "경양는 Wu Palace에 앉아 \"화살이 달린 말 머리\"로 명명되었습니다. 고대 서적에는 \"Weizhen Frontier\"라고 적혀 있습니다. 결단력 있는 행동과 경쟁심을 상징하며, 실행력과 과감한 의사결정이 필요한 진로방향에 적합합니다. 전통적인 논의에서는 최적의 성능을 얻으려면 이 패턴이 상서로운 별 Yao와 결합되어야 한다는 점을 상기시켜 줍니다. 이는 단일 별보다 조합의 영향력을 강조하는 것입니다.",
    palaces: ['命宫'],
    conditions: { required, bonus },
    source: "\"자미두수골수부·화살이 달린 말 머리\"",
  });
}

// ────────────────── 기본 격국 (인식 범위 개선) ──────────────────
// 디자인: 일치하지 않는 30개 이상의 엄격한 고대 서적 격국 대신 일반 명반이 1-3개의 공통 격국도 인식하도록 합니다.
// 이는 단일 조건에 의해 트리거되는 경량 인식이며 수준은 대부분 중립/양호입니다.

/* * 녹존 Shou Shen: 녹존을 신궁로(또는 명궁 및 신궁동궁) */
function detectLuCunShouShen(chart: ZiweiChart, patterns: Pattern[]) {
  const luCunPalace = findStarPalace(chart, '禄存');
  if (!luCunPalace) return;
  const inMing = luCunPalace.branch === chart.mingGongBranch;
  const inShen = luCunPalace.branch === chart.shenGongBranch;
  if (!inMing && !inShen) return;
  patterns.push({
    name: inMing ? '禄存守命' : '禄存守身',
    level: 'good',
    description: inMing
      ? "녹존을 별자리에 넣으면 그 사람은 평생 동안 음식과 의복과 안정된 부를 갖게 될 것입니다. 보수적인 성격으로 돈을 잘 모으는 편이지만, 악당을 조심해야 하는 인물이다. 큰 그리드의 경우 화록과 좌보우필를 일치시키는 것이 가장 좋습니다."
      : "녹존은 신궁에 들어가며 중년 이후 안정적인 재정 자원과 자기 즐거움을 나타냅니다. 니하이샤 선생은 \"녹존이 몸에 들어가면 부가 당신에게 가깝습니다\"라고 말했습니다. 배우자나 직업 방향은 안정적인 부를 가져올 수 있습니다.",
    palaces: [inMing ? '命宫' : '身宫'],
    conditions: { required: [inMing ? '禄存入命宫' : '禄存入身宫'] },
    source: "\"자미두수전서·녹존 스타\"",
  });
}

/* * 천마는 운명/이동에 들어갑니다: Yima 별 이동 */
function detectTianMaRuMing(chart: ZiweiChart, patterns: Pattern[]) {
  const tianMaPalace = findStarPalace(chart, '天马');
  if (!tianMaPalace) return;
  const inMing = tianMaPalace.branch === chart.mingGongBranch;
  const inQian = tianMaPalace.branch === ((chart.mingGongBranch + 6) % 12);
  if (!inMing && !inQian) return;
  patterns.push({
    name: inMing ? '天马入命' : '天马在迁',
    level: 'neutral',
    description: inMing
      ? "별자리의 천마는 평생 뛰어다니며 행동으로 돈을 버는 것을 의미하므로 출장, 현장 작업, 국경 간 개발에 적합합니다. 니하이샤 선생은 \"천마는 운명에 처해 있으며 급여가 없으면 보상이 없습니다\"라고 말했습니다. - 녹존나 화록을 다시 만난다면 '경마'의 풍부한 캐릭터가 될 것입니다."
      : "천마가 천이궁에 있으면 장거리 여행으로 나가서 부를 얻는 데 유리하며 외국 개발에 적합합니다. 화록과 짝을 이루면 먼 곳에서 돈을 벌 수 있다는 뜻이고, 살성과 짝을 이루면 여행은 우여곡절로 가득 차게 될 것입니다.",
    palaces: [tianMaPalace.name],
    conditions: { required: [inMing ? '天马入命宫' : '天马入迁移宫'] },
    source: "\"자미두수전서·천마 스타\"",
  });
}

/* * 화록은 돈을 벌다: 재백궁주성화록 */
function detectHuaLuRuCai(chart: ZiweiChart, patterns: Pattern[]) {
  const cai = chart.palaces.find(p => p.name === '财帛');
  if (!cai) return;
  const luStar = cai.stars.find(s => s.type === 'major' && s.siHua === '禄');
  if (!luStar) return;
  patterns.push({
    name: '化禄入财',
    level: 'good',
    description: `${luStar.name}화록은 재백궁에 들어가며, 이는 원활한 재정 자원과 안정적인 수입을 나타냅니다. 니하이샤 선생은 화록을 "긍정적인 부"의 상징으로 이야기합니다. 이 화록 별(${luStar.name}핵심특성)은 돈을 버는 주축입니다. 녹존 또는 천마를 사용하면 재정 자원이 더 넓어집니다.`,
    palaces: ['财帛'],
    conditions: { required: [`${luStar.name}화록을 재백궁로 변환`] },
    source: "\"자미두수전서·사화에\"",
  });
}

/* * 화권이 정식화됨: 관록궁주성화권 */
function detectHuaQuanRuGuan(chart: ZiweiChart, patterns: Pattern[]) {
  const guan = chart.palaces.find(p => p.name === '官禄');
  if (!guan) return;
  const quanStar = guan.stars.find(s => s.type === 'major' && s.siHua === '权');
  if (!quanStar) return;
  patterns.push({
    name: '化权入官',
    level: 'good',
    description: `${quanStar.name}화권이 관록궁에 합류합니다. 그는 자신의 주요 경력을 통제하고 책임 있는 위치를 맡을 수 있습니다. 화권은 힘과 실행을 나타냅니다.${quanStar.name}화권은 귀하가 경력에서 의사 결정자 또는 핵심 실행자가 될 수 있으며 관리 또는 기술 권한 경로를 선택해야 함을 나타냅니다.`,
    palaces: ['官禄'],
    conditions: { required: [`${quanStar.name}화권을 관록궁로 변환`] },
    source: "\"자미두수전서·사화에\"",
  });
}

/* * 화과는 생명/신체를 입력합니다. 성은 신체를 추가합니다. */
function detectHuaKeRuMingShen(chart: ZiweiChart, patterns: Pattern[]) {
  const ming = chart.palaces.find(p => p.branch === chart.mingGongBranch);
  const shen = chart.palaces.find(p => p.branch === chart.shenGongBranch);
  const target = [ming, shen].filter((p): p is Palace => Boolean(p));
  for (const p of target) {
    const keStar = p.stars.find(s => s.type === 'major' && s.siHua === '科');
    if (!keStar) continue;
    const isMing = p.branch === chart.mingGongBranch;
    patterns.push({
      name: isMing ? '化科入命' : '化科入身',
      level: 'good',
      description: `${keStar.name}화과 입력${isMing ? '命' : '身'}궁은 평판, 서류 작업, 학업 재산을 관리합니다. 니하이샤 선생은 화과가 "고귀한 별"이라고 말했습니다.${keStar.name}화과는 남들이 높이 평가하는 자질을 가져오며 사무, 교육, 연구, 컨설팅, 문화 창조 등 '명예' 방향에 종사하는 데 적합합니다.`,
      palaces: [isMing ? '命宫' : '身宫'],
      conditions: { required: [`${keStar.name}화과 입력${isMing ? '命' : '身'}궁`] },
      source: "\"자미두수전서·사화에\"",
    });
    return; // 생명과 육체는 반복될 때 한 번만 인식된다.
  }
}

/* * Jiyue Liang Sanxing Club (별 3개는 불완전하며 별 4개는 아님): 천기/태음/천동/천량 별 3개 중 어느 것이라도 삼방사정에 입장할 수 있습니다. */
function detectJiYueTongLiangPartial(chart: ZiweiChart, ming: Palace, patterns: Pattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  const has = ['天机', '太阴', '天同', '天梁'].filter(s => sanFangSet.has(s));
  if (has.length !== 3) return; // 별 4개는 detectorJiYueTongLiang에 의해 처리됩니다.
  // 위의 detectorJiYueTongLiang으로 중복을 피하세요. (별 4개를 모두 가진 항목은 여기에 포함되지 않습니다.)
  const missing = ['天机', '太阴', '天同', '天梁'].filter(s => !sanFangSet.has(s));
  patterns.push({
    name: '机月同梁三星会',
    level: 'neutral',
    description: `달과 달이 삼방사정을 만나려면 천기, 태음, 천동, 천량라는 네 개의 별이 있어야 합니다. 이 디스크에는 그 중 3개만 포함됩니다(${has.join('、')}), 누락됨${missing.join('、')}아니요, 완전히 사실은 아니며 힘이 한 단계 감소합니다. 문학적 질은 기획으로 이어지며 공공 서비스, 교육 및 연구, 의료, 축적과 안정성에 의존하는 서비스 산업에 적합합니다. 그 열쇠는 부재하는 별과 사화의 협력에 달려 있다.`,
    palaces: getSanFangPalaces(chart).filter(p => has.some(s => getMajorStarNames(p).includes(s))).map(p => p.name),
    conditions: { required: [`삼방사정은${has.join('、')}(지위에와 량퀘${missing.join('、')}）`] },
    source: "\"자미두수전서·머신문과 량거\"",
  });
  void ming;
}

/* * Changqu 동료: 문창+문곡는 모두 삼방사정로 향합니다. */
function detectChangQuTongHui(chart: ZiweiChart, patterns: Pattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  if (!sanFangSet.has('文昌') || !sanFangSet.has('文曲')) return;
  const ming = chart.palaces.find(p => p.branch === chart.mingGongBranch);
  if (!ming) return;
  const inMing = hasStar(ming, '文昌') && hasStar(ming, '文曲');
  patterns.push({
    name: inMing ? '昌曲坐命' : '昌曲同会',
    level: 'good',
    description: inMing
      ? "문창문곡는 명궁과 동일합니다. 그들은 똑똑하고 잘생겼으며 문학에 재능이 있습니다. 문학, 교육, 글쓰기, 컨설팅에 적합합니다. 가장 금기시되는 것은 화기 - Changqu 화기가며, 주요 문서 계약이 비밀리에 손실됩니다."
      : "문창문곡 및 삼방사정은 재능이 있고 웅변적이며 잘 쓰여졌습니다. 표현력과 문학적 재능이 요구되는 업계에 진출하는 것이 좋으며, 화과의 축복으로 귀하의 명성이 더욱 두드러질 것입니다.",
    palaces: ['命宫'],
    conditions: { required: ["문창, 문곡 및 명궁삼방사정"] },
    source: "\"자미두수전서·문학별론\"",
  });
}

/* * 총리, 총리 : 좌보+우필는 모두 삼방사정로 향합니다. */
function detectFuBiTongHui(chart: ZiweiChart, patterns: Pattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  if (!sanFangSet.has('左辅') || !sanFangSet.has('右弼')) return;
  patterns.push({
    name: '辅弼同会',
    level: 'good',
    description: "좌보우필가 명궁삼방사정과 동의한다면 그 사람은 평생 동안 많은 고귀한 사람들을 갖게 될 것이며 큰 인기를 얻게 될 것입니다. 리더십 위치 및 팀 작업에 가장 적합합니다. 니하이샤 선생은 \"총리와 총리의 삶에는 고귀한 사람들이 많다\"고 말했다. - 당신은 혼자 싸울 운명이 아닙니다. 네트워크를 잘 활용해야 합니다.",
    palaces: ['命宫'],
    conditions: { required: ["좌보, 우필 및 명궁삼방사정"] },
    source: "\"자미두수전서·푸비룬\"",
  });
}

/* * Kuiyue 동료: 천괴+천월는 모두 삼방사정로 향합니다. */
function detectKuiYueTongHui(chart: ZiweiChart, patterns: Pattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  if (!sanFangSet.has('天魁') || !sanFangSet.has('天钺')) return;
  patterns.push({
    name: '魁钺同会',
    level: 'good',
    description: "천괴천월는 명궁삼방사정과 모여 \"노블레스 티아니\"의 축복을 받습니다. 중요한 순간에 항상 당신을 지원해 주는 귀족들이 있을 것입니다. 니하이샤 선생은 \"Kuiyue가 어려움에 처해 있다면 그는 고귀한 사람임에 틀림없다\"고 말했습니다. 어려움에 직면했을 때 주변에 도움을 줄 수 있는 사람이 있을 것이므로 솔선하여 연결을 유지해야 합니다.",
    palaces: ['命宫'],
    conditions: { required: ["천괴, 천월 및 명궁삼방사정"] },
    source: "\"자미두수전서·귀월론\"",
  });
}

/* * 과학기술 더블 컨퍼런스: 화과 + 화권 동일 컨퍼런스 삼방사정 */
function detectKeQuanShuangHui(chart: ZiweiChart, patterns: Pattern[]) {
  const sfPalaces = getSanFangPalaces(chart);
  let hasKe = false, hasQuan = false;
  for (const p of sfPalaces) {
    for (const s of p.stars) {
      if (s.type === 'major' && s.siHua === '科') hasKe = true;
      if (s.type === 'major' && s.siHua === '权') hasQuan = true;
    }
  }
  if (!hasKe || !hasQuan) return;
  patterns.push({
    name: '科权双会',
    level: 'good',
    description: "화과 + 화권은 삼방사정과 함께 명성과 권력을 모두 가지고 있습니다. 그들은 지식/평판(규율)과 통제(힘)를 모두 가지고 있습니다. 그들은 '전문적 권위' 경로(예: 의사, 변호사, 교수, 기술 중추)를 택하고 명성과 부를 모두 얻고 탄탄한 기반을 갖추어야 합니다.",
    palaces: ['命宫'],
    conditions: { required: ["화과, 화권 및 명궁삼방사정"] },
    source: "\"자미두수전서·사화 사진\"",
  });
}

// ────────────────── "전집"의 4개 테이블 · 접근권한을 엄격하게 결정 ──────────────────
//
// 1권 "딩귀국" 27 / "딩부국" 6 / "딩빈곤국" 8 총 41개의 명반을 확정할 수 있습니다
// ("Defined Miscellaneous Bureau"의 8개 항목은 대한 형식으로 개별 구성되어 포함되지 않습니다.) 엄격한 구현 보기
// Patterns-dinggui/dingfu/dingpin.ts: 원문에 따른 판단, 완화 없음; 안싱에게는 해결책이 없다
// 해당 항목은 소스 테이블에 연결할 수 없는 것으로 표시되어 결정에 참여하지 않습니다. 인식기 분업:
// - 이 문서에는 원래 41개의 인식자가 있습니다: 느슨한 기준, 보너스 포인트/예외 경고가 포함된 UI 사본;
// - 엄격한 버전: 설명은 원본 도서의 주석이며, 출처에는 추적 가능한 원본 도서 항목 일련 번호가 포함되어 있습니다.
// 동일한 이름이 사용되는 경우 엄격한 버전이 느슨한 버전을 대체합니다(4개 항목: 군주와 신하들의 축하/재상의 궁/해와 달의 운명/바다로 나가는 진주).
// 보너스/브레이킹의 완화된 버전은 그대로 유지됩니다. 엄격한 조건은 완화된 조건의 하위 집합입니다.
// 느슨한 버전이 실행될 수 있는 경우에도 보너스 포인트 판단은 여전히 유효합니다.
// 칼이 달린 말 머리는 대체에 참여하지 않습니다. 엄격한 버전은 도달할 수 없는 것으로 입증되었습니다("Juwu 패턴이 아님"이라는 주석은 이를 거부함).
// 프로젝트에서 채택한 읽기 방법(patterns-dinggui.ts 10조 참조)은 히트작을 생성하지 않습니다.
// "화살이 달린 말 머리"의 루즈 버전은 그대로 유지되며, 검증 보고서에서 품질 기준이 잘못 표시되었습니다.

interface QuanshuHit {
  no: number;
  name: string;
  note: string;
  status: string;
}

function detectQuanshuStrict(chart: ZiweiChart): Pattern[] {
  const out: Pattern[] = [];
  const push = (hits: QuanshuHit[], table: string, level: Pattern['level']) => {
    for (const h of hits) {
      const tag = h.status === 'disputed' ? "[의심스러운 형식: 주석이 모호합니다. 가장 많이 읽는 방식으로 판단합니다.]" : '';
      out.push({
        name: h.name,
        level,
        description: `원본 도서 번호${h.no}기사: "${h.note}」${tag}`,
        palaces: ['命宫'],
        conditions: { required: [`"완전한 책"${table}아니요.${h.no}기사:${h.note}`] },
        source: `"자미두수전서·제1권·${table}》아니요.${h.no}기사`,
      });
    }
  };
  push(detectDingGui(chart), '定贵局', 'excellent');
  push(detectDingFu(chart), '定富局', 'good');
  push(detectDingPin(chart), '定贫贱局', 'caution');
  return out;
}

// ───────────────── 정문 ──────────────────
export function detectPatterns(chart: ZiweiChart): Pattern[] {
  const patterns: Pattern[] = [];
  const ming = chart.palaces.find(p => p.branch === chart.mingGongBranch);
  if (!ming) return patterns;

  // 상단 그리드
  detectJunChenQingHui(chart, ming, patterns);
  detectZiFu(chart, ming, patterns);
  detectFuXiangChaoYuan(chart, ming, patterns);
  detectYangLiangChangLu(chart, ming, patterns);
  detectHuoTanLingTan(chart, ming, patterns);
  detectWuTan(chart, ming, patterns);
  detectShaPoLang(chart, ming, patterns);
  detectJiYueTongLiang(chart, ming, patterns);

  // 중간 그리드
  detectLianXiang(chart, patterns);
  detectWuQiSha(chart, patterns);
  detectTongLiang(chart, patterns);
  detectRiYueTongGong(chart, patterns);
  detectRiYueJiaMing(chart, patterns);
  detectJuRiTongGong(chart, patterns);
  detectShiZhongYinYu(chart, ming, patterns);
  detectMingZhuChuHai(chart, ming, patterns);
  detectZiWeiInMing(chart, ming, patterns);

  // 도움말 그리드
  detectFuBiJiaMing(chart, patterns);
  detectChangQuJiaMing(chart, patterns);
  detectKuiYueJiaMing(chart, patterns);
  detectShuangLuChaoYuan(chart, ming, patterns);
  detectSanQiJiaHui(chart, patterns);
  detectHuaLuRuMing(chart, ming, patterns);

  // 나쁜 성격
  detectHuaJiRuMingQian(chart, patterns);
  detectYangTuoJiaJi(chart, patterns);
  detectHuoLingJiaMing(chart, patterns);
  detectKongJieJiaMing(chart, patterns);
  detectLianShaYang(chart, patterns);
  detectJuHuoYang(chart, patterns);
  detectLingChangTuoWu(chart, patterns);
  detectMaTouDaiJian(chart, ming, patterns);

  // 기본 격국 (일반 명반도 1~3까지 인식할 수 있도록 인식범위를 늘려주세요)
  detectLuCunShouShen(chart, patterns);
  detectTianMaRuMing(chart, patterns);
  detectHuaLuRuCai(chart, patterns);
  detectHuaQuanRuGuan(chart, patterns);
  detectHuaKeRuMingShen(chart, patterns);
  detectJiYueTongLiangPartial(chart, ming, patterns);
  detectChangQuTongHui(chart, patterns);
  detectFuBiTongHui(chart, patterns);
  detectKuiYueTongHui(chart, patterns);
  detectKeQuanShuangHui(chart, patterns);

  // "전체 책"에 있는 네 개의 테이블은 액세스에 대해 엄격하게 판단됩니다(동일한 이름의 엄격한 버전이 느슨한 버전을 대체합니다. 위의 참고 사항을 참조하세요).
  const strict = detectQuanshuStrict(chart);
  const looseByName = new Map(patterns.map(p => [p.name, p]));
  const out = patterns.slice();
  for (const s of strict) {
    const loose = looseByName.get(s.name);
    if (loose) {
      const idx = out.indexOf(loose);
      out[idx] = {
        ...s,
        conditions: {
          required: s.conditions!.required,
          bonus: loose.conditions?.bonus,
          breaking: loose.conditions?.breaking,
        },
      };
    } else {
      out.push(s);
    }
  }
  return out;
}

// ────────────────── 명궁 요약 (하위 호환성 유지) ──────────────────
export function getMingGongSummary(chart: ZiweiChart): {
  stars: string[];
  keywords: string[];
  nature: string;
} {
  const mingPalace = chart.palaces.find(p => p.branch === chart.mingGongBranch);
  if (!mingPalace) return { stars: [], keywords: [], nature: '' };

  const majorStars = mingPalace.stars.filter(s => s.type === 'major');
  const starNames = majorStars.map(s => s.name);

  const keywordMap: Record<string, string[]> = {
    '紫微': ['尊贵', '独立', '领导'],
    '天机': ['智慧', '机变', '善谋'],
    '太阳': ['阳刚', '官贵', '慷慨'],
    '武曲': ['财富', '刚毅', '果断'],
    '天同': ['温和', '享福', '随缘'],
    '廉贞': ['才艺', '桃花', '多变'],
    '天府': ['财库', '稳重', '保守'],
    '太阴': ['柔美', '财富', '细腻'],
    '贪狼': ['欲望', '桃花', '多才'],
    '巨门': ['善辩', '多思', '口才'],
    '天相': ['辅佐', '行政', '稳健'],
    '天梁': ['荫护', '医药', '长辈'],
    '七杀': ['将星', '果决', '孤克'],
    '破军': ['开创', '变动', '破旧'],
  };

  const natureMap: Record<string, string> = {
    '紫微': '帝王星', '天机': '智慧星', '太阳': '贵人星',
    '武曲': '财帛星', '天同': '福德星', '廉贞': '桃花星',
    '天府': '财库星', '太阴': '财富星', '贪狼': '桃花星',
    '巨门': '是非星', '天相': '印绶星', '天梁': '荫庇星',
    '七杀': '将帅星', '破军': '变动星',
  };

  const keywords = starNames.flatMap(n => keywordMap[n] ?? []).slice(0, 5);
  const nature = starNames.length > 0 ? (natureMap[starNames[0]] ?? '') : '空宫';

  return { stars: starNames, keywords, nature };
}
