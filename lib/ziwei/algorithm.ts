/* *
 * 자미두수 명반 만들기 알고리즘 — iztro 오픈 소스 라이브러리 기반
 * https://github.com/SylarLong/iztro */

import { astro } from 'iztro';
import { Solar, LunarMonth } from 'lunar-javascript';
import type { BirthInfo, LunarInfo, Star, Palace, DaXian, DaXianSiHua, ZiweiChart } from './types';
import { BRANCHES, STEMS } from './constants';
import { schoolStarBrightness, type BrightnessSchool } from './school-data';
import { SCHOOL_AX } from './school-tables.generated';
import { DEFAULT_LEAP_MONTH } from './school-config';
// 비성 파이 도구는 내보내기 전용이며 배반(니하이샤 선생 "천기 03": 사화 별이 영구적으로 고정됨)일 때 더 이상 호출되지 않습니다.
// import { detectSelfSihua, getSiHuaByStem } from './sihua';

// 자미두수 주류 학교(중저우 학교/천수 학교/주류 배반 소프트웨어)는 "음력 1월 1일 연도 변경" 규칙(음력 연도 구경)을 채택합니다.
// 예: 1999/2/11 입춘(입춘 = 2/4)이 지났지만 춘절(2/16)은 아직 도착하지 않았습니다 → 아직 지마오년이 아닌 무음년 음력 12월입니다.
// iztro 내의 오행국/명주/신주/사화/자미 위치 지정에 영향을 미칩니다. 이는 주류 배반 소프트웨어와 정렬하는 데 핵심입니다.
//
// ★ 수정내역(2026-05-12) :
// 원래 구성 yearDivide:'정확'(봄의 시작에 연도 변경) → '보통'(음력 1월 1일 연도 변경)으로 변경
// 이유: 사용자는 주류 배반 소프트웨어가 포함된 차트의 "궁 위치는 동일하지만 다른 위치는 완전히 다르다"고 보고했습니다.
// 진단(scripts/diff-chart-vs-other.ts) 결과, 근본 원인은 연도 변경 규칙이며, 본교에서는 항상 음력 연도를 사용하는 것으로 확인되었습니다.
//
// ★ 별 밝기 보정 (2026-05-08)
// iztro 기본 밝기 테이블과 "자미두수전서"(14개 주성 + 6 보조성) 사이에는 24가지 차이점이 있습니다.
// config.brightness 전체를 덮어써서 수정되었습니다.
// 배열 인덱스는 Yin에서 시작합니다: 0=Yin 1=Mao 2=Chen 3=Si 4=Noon 5=Wei 6=Shen 7=You 8=Xu 9=Hai 10=Zi 11=Chou
// 교차 검증 소스: Xiangpai 전집의 자미 해석, Lingdonglai 묘왕 테이블, iztro 공식 문서, 골드 표준 디스크
// ★ 명명된 상수 긁어내기(2026-06-11): "장르 전환 후 전역 밝기 누출"을 근절하기 위해 setBrightnessSchool('default')에 의해 명시적으로 복원됩니다.
// 14개 주성을 모두 완전히 포함해야 함 - 장르 테이블(schoolBrightnessTableToIztroFormat)이 14개 주성을 덮어씁니다.
// 여기서 주성 키가 누락되면 장르 전환 후 별이 오염되지만 키를 복원할 수 없습니다. (실제 측정: 무곡/염정/거문/파군이 누락되었습니다.)
const DEFAULT_BRIGHTNESS: Record<string, string[]> = {
    // 인마오첸시우웨이셴유 쉬하이즈추
    // ── 자미 시리즈 6개의 별 ───────────────────────────────────────
    // 자미: 음궁이 번영하다 → 사원 (전집: 음무주위에 사원이 있다)
    '紫微': ['庙','旺','得','旺','庙','庙','旺','旺','得','旺','平','庙'],
    // 천기: 진궁·술궁의 밝기를 리에서 묘로 보정한다. 통행 묘왕 총결을 따른 것으로 선본의 직접적인 궁별 인용은 아니다.
    '天机': ['得','旺','庙','平','庙','陷','得','旺','庙','平','庙','陷'],
    // 태양: 오공 번성 → 사원 (전권: 마오우 사원)
    '太阳': ['旺','庙','旺','旺','庙','得','得','陷','不','陷','陷','不'],
    // 무곡: iztro의 기본값은 전체 책과 동일합니다 ✓
    // 천동: 은궁은 이롭다 → 번영한다(전서:자은심에서 번영함), 대궁은 함정에 빠짐→아님(전서:나쁜 땅은 오주위에 있음)
    '天同': ['旺','平','平','庙','不','不','旺','平','平','庙','旺','不'],
    // 염정: iztro의 기본값은 전체 책과 동일합니다 ✓

    // ── 천부 시리즈 8성 ──────────────────────────────────────
    // 천부: Chen Gong Temple → Wang, Xu Gong Temple → Wang (전체 책: Wang Yu Chen Xu Wu You)
    '天府': ['庙','得','旺','得','旺','庙','得','旺','旺','得','庙','庙'],
    // 태음: 은궁은 번영 → 함정에 빠졌고 유궁은 → 번영하지 않았습니다 (전서 : 사원은 Haizi Chou에 있고 Youxu에 번영하고 Yinmao Chen Siwu에 갇혀 있습니다) ★ 주요 수정
    // ★ 2026-06-10 교리 검토(사용자의 메시지 "태양태음묘왕이 올바르지 않습니다"로 인해 트리거됨, 자세한 내용은 docs/audits/taiyin-brightness-review.md 참조):
    // 희귀한 책 "Quanshu·Zhuxing 질문 및 답변·태음" 축어(quanshu-juan1-source.ts): "Maochen과 Siwuwei를 가라앉는 땅으로 사용하고 Youxuhaizi Chou를 얻는 벽으로 사용합니다."
    // → 경락궁의 원래 가치는 '아님'인데, 이는 오름차순 자기소개서의 출처와 희귀서의 출처와 모두 상충됩니다. 지난 5월 개정판에서 누락돼 '함정'으로 개정됐다.
    // 의심스러운 예약: Wei Gong의 희귀한 책은 "떨어짐"을 언급하므로 이 테이블에서는 'bu'를 사용합니다(인기 있는 묘왕은 떨어지지 않는 사람이 많고 학교가 다르다는 것을 의미합니다). 은궁의 희서에는 이에 대한 언급이 없어 5월에 개정된 '낙하'를 사용한다.
    '太阴': ['陷','陷','陷','陷','陷','不','利','旺','旺','庙','庙','庙'],
    // 탐랑: iztro의 원래 테이블은 6비트 대칭 구조(Pingli Temple 및 Wangmiao의 복제)로, 이는 고대 서적과 크게 다릅니다. 인기있는 XD1 테이블에 따라 수정되었습니다.
    // ★ 2026-06-11 리뷰(2차):
    '贪狼': ['不','平','得','平','平','庙','不','平','得','利','平','庙'],
    // 거문: iztro는 기본적으로 책 전체와 동일함 ✓ (책 전체의 다양한 소스 간의 차이점을 검토했으며 iztro 값이 합리적임)
    // 천상: 모공 침하 → 평지, 유궁 침하 → 평지 ("천상은 모유에게 평지이다"에 따르면 묘왕의 일반 공식을 채택하고, 희귀서 "전서"에는 궁별 천상의 원문이 없으며, 4대 인기 학파의 밝기 표도 여기에 "핑"으로 표기되어 있으므로 "핑"이 설 수 있음)
    '天相': ['庙','平','得','得','庙','得','庙','平','得','得','庙','庙'],
    // 천량: 모공사→덕, 서공사→더(전체 책: 토지는 마오수에서 얻었습니다)
    '天梁': ['庙','得','庙','陷','庙','旺','陷','得','得','陷','庙','旺'],
    // 칠살: 유공사 → 번영(전집: 자무무유의 번영)
    '七杀': ['庙','旺','庙','平','旺','庙','庙','旺','庙','平','旺','庙'],
    // 파군: iztro의 기본값은 전체 책과 동일합니다 ✓

    // ──보조성 (여섯 가지 행운과 여섯 가지 악령)─────────────────────────────────
    // 문창: iztro의 기본값은 전체 책과 동일합니다 ✓
    // 문곡: Chen Gong은 → 사원을 얻고, 자궁은 → 사원을 얻습니다. (전체 책: 사원은 Siyou Chou Zichen에 있으며 총 5개의 사원이 있습니다)
    '文曲': ['平','旺','庙','庙','陷','旺','得','庙','陷','旺','庙','庙'],
    // 화성: iztro의 기본값은 전체 책과 동일합니다 ✓
    // 영성: iztro가 화성 밝기를 잘못 복사했습니다! 책 전체 영성가 화성와 다릅니다 ★ 주요 수정 사항
    // Chen Shen이 침몰 → 획득, Wei Li → 획득, Chou 획득 → 침몰, Hai Li → 침몰 (전체 도서: Miao Yin Wuxu, Di Chen Si Wei Shen, Zhen Chou Haizi)
    // You Palace: iztro/주류 배반 소프트웨어/Yuan Henryzhen은 모두 "get"이며 군중을 따라 수정됩니다.
    '铃星': ['庙','利','得','得','庙','得','得','得','庙','陷','陷','陷'],
    // 경양: 유궁·자궁의 밝기를 함에서 왕으로 보정한다.
    '擎羊': ['','陷','庙','','陷','庙','','旺','庙','','旺','庙'],
    // 타라: iztro의 기본값은 전체 책과 동일합니다 ✓

    // ── 무곡 / 염정 / 거문 / 파군 ─────────────────────────────
    // 이러한 4 주성 iztro의 원래 값은 "백과사전"과 일치하며 이전에 명시적으로 덮어쓰지 않았습니다(iztro의 내장 폴백에 의존).
    // ★ 2026-06-11 원래 값 채우기(프로브 스크립트의 실제 측정, Yinqi): DEFAULT 테이블에 14개 주성이 완전히 포함되도록 만들고,
    // 장르가 전환된 후 setBrightnessSchool('default')를 사용하여 기본값을 완전히 재정의하고 복원할 수 있습니다.
    '武曲': ['得','利','庙','平','旺','庙','得','利','庙','平','旺','庙'],
    '廉贞': ['庙','平','利','陷','平','利','庙','平','利','陷','平','利'],
    '巨门': ['庙','庙','陷','旺','旺','不','庙','庙','陷','旺','旺','不'],
    '破军': ['得','陷','旺','平','庙','旺','得','陷','旺','平','庙','旺'],
};

// 모듈은 음력 1월 1일에 기본 밝기 테이블 + 음력 연도 변경 규칙을 로드하고 작성합니다(astro.config는 전역 부작용입니다).
astro.config({
  yearDivide: 'normal',
  brightness: DEFAULT_BRIGHTNESS,
});

// ───밝기 장르 전환(2026-05-12, 골드 스탠다드 디스크 확인 후 도입)─────────────────────────
// 기본값 = 현재 사용자 정의 테이블(전체 책 + 표준 디스크 교차 검증 기준)
// 스위치 = setBrightnessSchool('qs' | 'xd1' | 'zz' | 'xd2')를 호출하여 4개의 인기 학교 중 하나를 덮어씁니다.
//
// 참고: astro.config는 전역 부작용이며 각 호출은 모든 후속 generateChart에 영향을 미칩니다.
// 서버 측 다중 사용자 시나리오의 경쟁 조건에 주의하십시오(차트 생성은 동기식이며 영향이 거의 없음).

export type SchoolBrightnessKind = 'default' | BrightnessSchool;

// ★ 2026-06-20 성요 밝기의 전체 세트는 주류 배반 구경과 정렬됩니다. 전체 밝기가 어셈블리 레이어로 변경되어 SB_[학교] 테이블을 직접 확인합니다.
// (schoolStarBrightness: 주성+보조성+살성+테이블 집합/매핑 집합/인덱스 통합),
// 더 이상 iztro의 astro.config를 덮어쓰지 않습니다(이전 DEFAULT_BRIGHTNESS 희귀 도서 손 노크 테이블 + schoolBrightnessTableToIztroFormat
// 반대 방향의 매핑은 더 이상 사용되지 않습니다.
// ★ 2026-10-20 기본값 = "Doushu Quanshu" QS(웹마스터가 결정: 주류 배반의 기본 구경이 무엇인지, 우리는 그것을 기본값으로 설정합니다).
// 증거: 주류 배반 소프트웨어의 설정 페이지에서 "설정 재설정 → 시스템 기본값으로 재설정" 후 성요의 밝기가 에서 멈춥니다.
// "Dou Shu Quanshu 기반(기본값)"(스크린샷이 보관되었습니다); 회원님들이 보내주신 골드 스탠다드 플레이트
// 53개 별의 밝기는 QS 테이블 53/53과 일치하지만 XD2에서는 44/53에 불과합니다. 6-20에서 XD2로 변경된 "사용자 평가 27/27"을 직접 선택했습니다.
// 기본 구경이 아닌 기계에 대한 최신 수정된 밝기 차트(제2판)입니다. 장르를 전환할 때만 이 값을 변경하십시오(불일치를 피하기 위해 주 악과 보조 악을 동기화하십시오).
let currentBrightSchool: BrightnessSchool = 'QS';

export function setBrightnessSchool(school: SchoolBrightnessKind): void {
  currentBrightSchool = school === 'default' ? 'QS' : school;
}

export type LunarMonthPolicy = 'split' | 'next-month' | 'prev-month' | 'origin-month';

export interface EffectiveLunarDate {
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  isLeapMonth: boolean;
  rawLunarMonth: number;
  rawLunarDay: number;
}

/**
 * Resolve the lunar month used by the chart and all month-based patches.
 * The raw lunar date remains available so callers can keep split behavior on
 * the real leap month while non-split policies use the same effective date.
 */
export function resolveEffectiveLunarDate(
  year: number,
  month: number,
  day: number,
  policy: LunarMonthPolicy = 'prev-month',
): EffectiveLunarDate {
  // 윤달는 리터럴 공용체 유형이지만 이 함수는 런타임 JavaScript/JSON API에서 직접 호출할 수 있습니다.
  // 유형은 이름에만 있습니다. 철자가 틀린 정책은 아래 if/else 체인의 끝에 속하게 됩니다. 자동으로 "이달로 돌아가기"를 클릭하세요.
  // 배반 및 Chart.birthInfo.leapMonthPolicy 직렬화를 사용하여 오류 값을 전파합니다 - 시간, 양력 날짜 포함
  // 기존 체크섬은 동일한 구경입니다. 즉, 구경을 알 수 없는 디스크를 생성하는 대신 유효하지 않은 입력을 그 자리에서 거부합니다.
  if (policy !== 'split' && policy !== 'next-month' && policy !== 'prev-month' && policy !== 'origin-month') {
    throw new RangeError(
      `leapMonth policy must be one of 'split' | 'next-month' | 'prev-month' | 'origin-month'; received ${String(policy)}`,
    );
  }
  const lunar = Solar.fromYmd(year, month, day).getLunar();
  const rawLunarMonth = Number(lunar.getMonth());
  const rawLunarDay = Number(lunar.getDay());
  const isRawLeapMonth = rawLunarMonth < 0;
  const absoluteMonth = Math.abs(rawLunarMonth);

  if (!isRawLeapMonth) {
    return {
      lunarYear: Number(lunar.getYear()),
      lunarMonth: absoluteMonth,
      lunarDay: rawLunarDay,
      isLeapMonth: false,
      rawLunarMonth,
      rawLunarDay,
    };
  }

  let lunarYear = Number(lunar.getYear());
  let lunarMonth = absoluteMonth;
  let isLeapMonth = false;

  if (policy === 'split') {
    // Keep iztro's established split rule: days 1-15 use the prior month,
    // and the second half uses the following month.
    if (rawLunarDay > 15) lunarMonth = absoluteMonth + 1;
  } else if (policy === 'next-month') {
    lunarMonth = absoluteMonth + 1;
  } else if (policy === 'origin-month') {
    isLeapMonth = true;
  }

  if (lunarMonth > 12) {
    lunarMonth = 1;
    lunarYear += 1;
  }

  let lunarDay = rawLunarDay;
  try {
    const monthKey = isLeapMonth ? -lunarMonth : lunarMonth;
    const dayCount = LunarMonth.fromYm(lunarYear, monthKey)?.getDayCount?.();
    if (typeof dayCount === 'number' && dayCount > 0 && lunarDay > dayCount) lunarDay = dayCount;
  } catch { /* 查不到月信息则保留原日，维持下游既有容错 */ }

  return {
    lunarYear,
    lunarMonth,
    lunarDay,
    isLeapMonth,
    rawLunarMonth,
    rawLunarDay,
  };
}

// ─── 음력 정보(호환 예약)──────────────────────────────────────
export function getLunarInfo(
  year: number,
  month: number,
  day: number,
  hour?: number,
  policy: LunarMonthPolicy = 'prev-month',
): LunarInfo {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  const effective = resolveEffectiveLunarDate(year, month, day, policy);
  // lunar-javascript에는 .d.ts가 없습니다. 봄의 시작부터 새해까지 연도를 변경하는 방법은 런타임에서만 사용할 수 있습니다. 이를 우회하려면 아무거나 사용하세요.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lu = lunar as any;
  // 자미두수 명반 만들기 연도(연도는 음력 1월 1일에 변경되며 위의 astro.config:yearDivide='normal' 과 동일)
  // 참고: 절기 사주(아래)는 봄/축제가 시작되는 시간을 정확하게 표시하기 위해 getEightChar()를 사용합니다. 팔자Z사주는 항상 봄을 시작하고 새해로 변경됩니다. 이는 자미의 "음력 연도"와 동일합니다.
  const yearStem = STEMS.indexOf(lu.getYearGan());
  const yearBranch = BRANCHES.indexOf(lu.getYearZhi());
  // ★ 절기 사주(년주/월주/일주/시주) + 비절기 사주(음력 구경 월주)
  let fourPillars: [string, string, string, string] | undefined;
  let fourPillarsLunar: [string, string, string, string] | undefined;
  try {
    // ★ 2026-09-01 춘기/절기 경계 수정: 절기 사주의 연주, 월주를 getEightChar()를 사용하도록 변경합니다(춘기/절기 기준으로 정확함).
    // getYearGanByLiChun()/getMonthGan() 의 원래 사용은 시간을 보지 않고 "봄이 시작되는 날 하루 종일"을 전환하는 것입니다. - 봄이 시작되는 날 이른 아침에 태어났습니다.
    // 새해로 계산되며 연도/월 열은 한 자리씩 벗어납니다(회원의 실제 치수: 2004-02-04 축시는 Guiwei/Yichou여야 하지만 Jia Shen/Bing Yin으로 정렬됩니다).
    // 봄의 시작 = 2004-02-04 19:56. 이 사람은 새벽 2시 40분에 태어났는데, 전년도 귀웨이로 추정됩니다. lunar-javascript의 getYearGanByLiChun
    // 시간이 지나도 날짜별로 전환되어(실제 측정값은 무효), getEightChar는 분 단위까지 정확합니다.
    // 시간은 배반의 기존 진태양시시진과 동일한 구경인 "시진 중간점"(인덱스*2 포인트)으로 근사화됩니다. 일별/시간별 열은 봄의 시작에 영향을 받지 않으며 원래 알고리즘을 유지합니다.
    // 태양력이 없는 날에는 구식과 신식은 동일합니다(입춘/십이절 당일과 명절 전후에 해당하는 것만 변경됩니다). 검증을 위해 12개 사례를 샘플링하여 하나씩 비교했습니다.
    const effHour = (hour !== undefined && hour >= 0 && hour <= 11) ? hour * 2 : 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ec = (Solar as any).fromYmdHms(year, month, day, effHour, 0, 0).getLunar().getEightChar();
    const yearGZ = ec.getYear() as string;    // 절기 사주 연도 열: 봄이 시작될 때 정확한 연도 변경
    const monthGZ = ec.getMonth() as string;  // 절기 사주 월기둥 : 절기를 달로 정확하게 변경 + 봄초에 수정된 연도를 사용하여 오호 탈출
    const dayGZ = `${lu.getDayGan()}${lu.getDayZhi()}`;
    // 시간 열: 날짜 줄기 + 시간 분기가 공동으로 결정됩니다. 시간 줄기는 일 줄기 + 시간에 의해 밀려납니다.
    // 규칙: Jiaji 일 자시 → Jiazi; Yigeng 일 자시 → Bingzi; 빙신 → 우; Dingren → Geng; 우구이 → 렌
    const dayStem = STEMS.indexOf(lu.getDayGan());
    const branchIdx = hour !== undefined && hour >= 0 && hour <= 11 ? hour : 0;
    const timeStemBase = (dayStem % 5) * 2; // 자시에서 시작하는 천간
    const timeStemIdx = (timeStemBase + branchIdx) % 10;
    const timeGZ = `${STEMS[timeStemIdx]}${BRANCHES[branchIdx]}`;
    fourPillars = [yearGZ, monthGZ, dayGZ, timeGZ];

    // ★ 비태양광 사주(주류 배반 소프트웨어 "비태양광 사주"와 정렬됨): 연도 열은 음력 연도를 사용합니다(연도는 음력 1월 1일에 변경되며 자미와 동일한 구경).
    // 달 기둥은 음력 월(음력 1일이 월로 변경됨)에 따라 다시 계산됩니다. 절기 접합일(샤오슈 이후 수십 분 뒤에 태어난 경우) 절기 버전은 다음 달에 들어가고 음력 버전은 여전히 이번 달에 있으며 달 기둥은 한 자리 차이입니다.
    // 일/시간 열은 연도 및 월 구경의 영향을 받지 않으며 위에서 재사용됩니다. lunar-javascript에는 음력 구경 달 기둥 방법이 없으므로 Five Tigers를 사용하여 직접 계산합니다.
    const absM = effective.lunarMonth;
    const yearGZLunar = `${STEMS[yearStem]}${BRANCHES[yearBranch]}`;        // 음력 연줄기 및 가지(음력 1월 1일 연도 변경)
    const monthBranchIdx = (absM + 1) % 12;                                 // 음력 월 → 월간 분기(첫 번째 달 = 음)
    const monthStemBase = ((yearStem % 5) * 2 + 2) % 10;                    // 오호탈출: 음력년 전정 정월(음) 천간
    const monthStemIdx = (monthStemBase + (absM - 1)) % 10;
    const monthGZLunar = `${STEMS[monthStemIdx]}${BRANCHES[monthBranchIdx]}`;
    fourPillarsLunar = [yearGZLunar, monthGZLunar, dayGZ, timeGZ];
  } catch { /* lunar-javascript 接口异常时跳过 */ }

  return {
    lunarYear: effective.lunarYear,
    lunarMonth: effective.lunarMonth,
    lunarDay: effective.lunarDay,
    yearStem: yearStem >= 0 ? yearStem : 0,
    yearBranch: yearBranch >= 0 ? yearBranch : 0,
    isLeapMonth: effective.isLeapMonth,
    fourPillars,
    fourPillarsLunar,
  };
}

// ───명주 별 / 신주 별 (지지를 눌러 표를 확인하세요)──────────────────────────
const MING_ZHU_TABLE: Record<number, string> = {
  0: '贪狼', 1: '巨门', 2: '禄存', 3: '文曲', 4: '廉贞', 5: '武曲',
  6: '破军', 7: '武曲', 8: '廉贞', 9: '文曲', 10: '禄存', 11: '巨门',
};
const SHEN_ZHU_TABLE: Record<number, string> = {
  0: '火星', 6: '火星', 1: '天相', 7: '天相',
  2: '天梁', 8: '天梁', 3: '天同', 9: '天同',
  4: '文昌', 10: '文昌', 5: '天机', 11: '天机',
};
export function calcMingZhu(branch: number): string { return MING_ZHU_TABLE[branch] ?? ''; }
export function calcShenZhu(branch: number): string { return SHEN_ZHU_TABLE[branch] ?? ''; }
export function calcYinYangGender(yearStem: number, gender: 'male' | 'female'): string {
  return `${yearStem % 2 === 0 ? '阳' : '阴'}${gender === 'male' ? '男' : '女'}`;
}

// ─── 휘도 매핑 ───────────────────────────────────────────────
function mapBrightness(b?: string): 'bright' | 'normal' | 'dim' {
  if (!b) return 'normal';
  if (b === '庙' || b === '旺') return 'bright';
  if (b === '陷' || b === '不' || b === '闲') return 'dim';
  return 'normal';
}

/* * iztro 원시 밝기 텍스트에서 표준 7단계 중 하나를 추출합니다. */
function extractRawBrightness(b?: string): import('./types').StarBrightness | undefined {
  if (!b) return undefined;
  const valid: import('./types').StarBrightness[] = ['庙', '旺', '得', '利', '平', '不', '闲', '陷', '地'];
  for (const x of valid) {
    if (b.includes(x)) return x;
  }
  return undefined;
}

// ─── 별 유형 매핑 ────────────────────────────────────────────
const SHA_STARS = new Set(['擎羊', '陀罗', '火星', '铃星', '地空', '地劫',
  '天空', '旬空', '副旬', '截路', '截空', '副截', '大耗', '天使', '天伤',
  // ★ 확장 (기존에는 주악만 심판하였고, 세미파이어와 잡야오는 심판하지 않았습니다)
  '天刑', '天哭', '天虚', '天月', '阴煞', '蜚廉', '空亡',
  '孤辰', '寡宿']);
const LUCKY_STARS = new Set(['文昌', '文曲', '左辅', '右弼', '天魁', '天钺',
  '禄存', '天马', '天官', '天福', '天才', '天寿', '三台', '八座', '恩光',
  '天贵', '台辅', '龙池', '凤阁', '红鸾', '天喜',
  // ★ 확장: 지자야오
  '解神', '天德', '月德', '年解', '天巫', '华盖', '封诰']);

function mapStarType(starName: string, iztroType: string): Star['type'] {
  if (SHA_STARS.has(starName)) return 'sha';
  if (LUCKY_STARS.has(starName)) return 'lucky';
  const t = (iztroType ?? '').toLowerCase();
  if (t === '主星' || t === 'major') return 'major';
  if (t === '煞星' || t === 'tough') return 'sha';
  if (t === '吉星' || t === 'soft' || t === '禄存' || t === '天马') return 'lucky';
  return 'minor';
}

// ─── 오행국 이름 → 번호 ───────────────────────────────────────
function parseWuxingJu(name: string): number {
  if (name.includes('二')) return 2;
  if (name.includes('三')) return 3;
  if (name.includes('四')) return 4;
  if (name.includes('五')) return 5;
  if (name.includes('六')) return 6;
  return 3;
}

// ─── 주요 기능: 명반 생성 ──────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────
// 천괴천월 · 기본 세력(KY1) 수정
//
// 사용자 결정(2026-05-30): 배반는 주류 배반 기본 구경과 일치합니다(골드 표준 디스크 비교 증거, docs/school-parity-report.md 참조).
// 실제 측정 10 천간은 [Xinnian]일 뿐이며 iztro의 현재 상황은 다릅니다.
// Xin Nian 기본 구경 = 천괴 Zaiyin / 천월 Zaiwu; iztro (주류) = 천괴 Zaiwu / 천월 Zaiyin.
// ⚠️ 기본 세력은 신년의 주류 공식인 "신마후 = 귀무월음"(귀월은 반대)과 반대입니다. 이것은 주류 배반 소프트웨어입니다
// 설정된 배열은 사용자의 "정렬 기본 구경"에 따라 결정됩니다. 나머지 9개 천간 연도의 기본 구경은 iztro와 일치합니다.
// 폴백: generateChart에서 applySchoolKuiyue(...) 호출을 삭제하여 iztro 주류 학교를 복원하세요.
// ─────────────────────────────────────────────────────────────────────────
function relocateStar(palaces: Palace[], name: string, targetBranch: number): void {
  let moved: Star | undefined;
  for (const p of palaces) {
    const i = p.stars.findIndex((s) => s.name === name);
    if (i >= 0) {
      if (p.branch === targetBranch) return; // 이미 대상 궁에 있으므로 이동할 필요가 없습니다.
      moved = p.stars[i];
      p.stars.splice(i, 1);
      break;
    }
  }
  if (!moved) return;
  const target = palaces.find((p) => p.branch === targetBranch);
  if (target) {
    target.stars.push(moved);
    // ★ 2026-06-20 천괴천월 전치(기본값은 KY1로 전송) 후에도 밝기는 여전히 이전 iztro Palace 위치(전위)에서 계산됩니다. 새로운 궁 지지에 따라 밝기를 다시 계산합니다.
    const rb = schoolStarBrightness(moved.name, targetBranch, currentBrightSchool);
    moved.brightnessRaw = extractRawBrightness(rb);
    moved.brightness = rb ? mapBrightness(rb) : undefined;
  }
}

function applySchoolKuiyue(palaces: Palace[], yearStemCn: string): void {
  const gan = STEMS.indexOf(yearStemCn); // A=0…Gui=9
  if (gan < 0) return;
  const row = SCHOOL_AX.KY_ARR1[gan + 1]; // KY 테이블 "A=1"이 시작됩니다. 하위는 하나의 코드로 시작합니다
  if (!row) return;
  relocateStar(palaces, '天魁', row[0] - 1); // 하위 인덱스(sub=1) → BRANCHES 인덱스(sub=0)
  relocateStar(palaces, '天钺', row[1] - 1);
}

/* *
 *본명상단 열은 "대모"(연도 별, 궁 아래 열두 신이 아님)입니다.
 * 2026-08-14 금본위판의 12년 가지를 확인하세요. 양 가지는 매년 +1, 음 가지는 매년 -1을 부러뜨립니다.
 *Zi=0, 0부터 시작하는 짝수는 양 가지(Zi Yin Chen Wu Shen Xu)입니다. */
export function schoolDahaoBranch(yearBranch: number): number {
  const suiPo = (yearBranch + 6) % 12;
  return yearBranch % 2 === 0 ? (suiPo + 1) % 12 : (suiPo + 11) % 12;
}

function pushNatalStar(palaces: Palace[], branch: number, name: string): void {
  const target = palaces.find((p) => p.branch === branch);
  if (!target || target.stars.some((s) => s.name === name)) return;
  const rb = schoolStarBrightness(name, branch, currentBrightSchool);
  target.stars.push({
    name,
    type: mapStarType(name, ''),
    brightness: rb ? mapBrightness(rb) : undefined,
    brightnessRaw: extractRawBrightness(rb),
  });
}

function applySchoolDahao(palaces: Palace[], yearBranch: number): void {
  pushNatalStar(palaces, schoolDahaoBranch(yearBranch), '大耗');
}

/* *
 * 본명 상단 바 절공/부절.
 * 쌍은 여전히 ​​Jiaji Shenyou, Yigengwuwei, Bingxinchensi, Dingrenyinmao 및 Wugui Zichou입니다(iztro가 올바르게 정렬했습니다).
 * 양줄기 절공는 양궁에 빠지고, 부절는 음궁에 빠집니다. 음줄기가 거꾸로 되어있습니다. 이즈트로는 항상 길을 끊을 것이다=양궁, 공허=음궁, 음줄기는 궁궐을 바꿔야 한다.
 * 2026-08-14 골드 표준 플레이트: Xinchousi 절공/chen 부절, Jihaiyou 절공/shen 부절, Yisiwei 절공/noon 부절. */
function applySchoolJiekong(palaces: Palace[], yearStem: number): void {
  for (const p of palaces) {
    for (const s of p.stars) {
      if (s.name === '截路') s.name = '截空';
      else if (s.name === '空亡') s.name = '副截';
      else continue;
      // ★ 2026-10-20 이름 변경 후 새 이름에 맞게 밝기 입력: iztro 원래 이름은 밝기를 찾을 수 없음, 양건년(궁 변경 없음, 바로 아래로 돌아가기)
      // 절공 / 부절는 항상 공백으로 남아 있습니다. 주류 배반의 기본 구경은 밝습니다(실제 디스크: Bingyin Chen 절공=fall, Si 부절=temple). 그늘에 있는 궁궐을 변경한 후, 다음 계산은 새로운 궁궐을 기준으로 하게 됩니다.
      const rb = schoolStarBrightness(s.name, p.branch, currentBrightSchool);
      s.brightness = rb ? mapBrightness(rb) : undefined;
      s.brightnessRaw = extractRawBrightness(rb);
    }
  }
  if (yearStem % 2 === 0) return;
  const jie = palaces.find((p) => p.stars.some((s) => s.name === '截空'));
  const fu = palaces.find((p) => p.stars.some((s) => s.name === '副截'));
  if (!jie || !fu || jie === fu) return;
  const jieStar = jie.stars.find((s) => s.name === '截空');
  const fuStar = fu.stars.find((s) => s.name === '副截');
  if (!jieStar || !fuStar) return;
  jie.stars = jie.stars.filter((s) => s !== jieStar);
  fu.stars = fu.stars.filter((s) => s !== fuStar);
  const rbJ = schoolStarBrightness('截空', fu.branch, currentBrightSchool);
  const rbF = schoolStarBrightness('副截', jie.branch, currentBrightSchool);
  jieStar.brightness = rbJ ? mapBrightness(rbJ) : undefined;
  jieStar.brightnessRaw = extractRawBrightness(rbJ);
  fuStar.brightness = rbF ? mapBrightness(rbF) : undefined;
  fuStar.brightnessRaw = extractRawBrightness(rbF);
  fu.stars.push(jieStar);
  jie.stars.push(fuStar);
}

/* * 순공 쌍(Zichou/Yinmao/Chensi/Wuwei/Shenyou/Xuhai). 부순는 다른 가지에 속합니다: 순공 양 가지 +1, 음 가지 −1. */
function applySchoolFuxun(palaces: Palace[]): void {
  const xun = palaces.find((p) => p.stars.some((s) => s.name === '旬空'));
  if (!xun) return;
  const fu = xun.branch % 2 === 0 ? (xun.branch + 1) % 12 : (xun.branch + 11) % 12;
  pushNatalStar(palaces, fu, '副旬');
}

export function generateChart(
  birthInfo: BirthInfo,
  opts?: { leapMonth?: LunarMonthPolicy },
): ZiweiChart {
  const { year, month, day, hour, gender } = birthInfo;
  if (!Number.isInteger(hour) || hour < 0 || hour > 11) {
    throw new RangeError(`hour must be an integer branch index from 0 to 11; received ${hour}`);
  }
  // 런타임(JS/JSON 인터페이스)에서 가져올 때 성별 유형은 제한되지 않으며 배반 이전에는 잘못된 값을 거부해야 합니다.
  // 그렇지 않으면 'male' 이외의 모든 값은 자동으로 'female'로 처리되고 잘못된 디스크가 배출됩니다.
  if (gender !== 'male' && gender !== 'female') {
    throw new RangeError(`gender must be 'male' or 'female'; received ${String(gender)}`);
  }
  // 양력 날짜는 실제로 존재해야 합니다. 즉, 2월 30일, 윤년이 아닌 해의 2월 29일, 4월 31일 및 기타 날짜입니다.
  // iztro는 오류를 보고하지 않고 다음 달 배반의 처음 며칠로 연기합니다. 결과는 실제 날짜와 동일합니다.
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (
    !Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day) ||
    probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day
  ) {
    throw new RangeError(`solar date does not exist: ${year}-${month}-${day}`);
  }
  const iztroGender = gender === 'male' ? '男' : '女';

  // 윤달 처리(장르별: 이번달로 돌아가기/다음달로 돌아가기/전후 30분)
  // 기본값 = DEFAULT_LEAP_MONTH(2026-09-05부터 분할: 주류 배반 기본 구경 "월중 경계", 150세트의 금본위 디스크 비교 검증, 다음 달에 할당된 니하이샤 선생은 다음 달 장르 서랍을 통해 잘라낼 수 있음)
  // 분할되지 않으면 음력가 먼저 계산된 다음 윤달가 byLunar로 잘립니다. 윤달가 아닌 경우 bySolar가 계속 사용되며 이는 분할 동작과 완전히 일치합니다.
  const leapMode = opts?.leapMonth ?? DEFAULT_LEAP_MONTH;
  const effectiveLunar = resolveEffectiveLunarDate(year, month, day, leapMode);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let astrolabe: any;

  if (leapMode !== 'split' && effectiveLunar.rawLunarMonth < 0) {
      // 윤달 낯선 사람 → 사용자 옵션에 따라 월 소유권 전환
      const lunarDateStr = `${effectiveLunar.lunarYear}-${effectiveLunar.lunarMonth}-${effectiveLunar.lunarDay}`;
      astrolabe = astro.byLunar(
        lunarDateStr,
        hour,
        iztroGender,
        effectiveLunar.isLeapMonth,
        false,
        'zh-CN',
      );
  } else {
    // 비 윤달 또는 분할 모드: Solar에 의해 직접, iztro의 기존 동작 유지
    astrolabe = astro.bySolar(`${year}-${month}-${day}`, hour, iztroGender, true, 'zh-CN');
  }

  // 직렬화된 Chart.birthInfo가 클라이언트가 도우미를 사용하여 본명 디스크를 다시 빌드할 수 있도록 동일한 윤달 정책을 계속 전달하도록 합니다.
  const chartBirthInfo = {
    ...birthInfo,
    leapMonthPolicy: leapMode,
  } as BirthInfo & { leapMonthPolicy: LunarMonthPolicy };

  // ── 조디악 조립 ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const palaces: Palace[] = astrolabe.palaces.map((p: any) => {
    const branch = BRANCHES.indexOf(p.earthlyBranch as string);
    const stem   = STEMS.indexOf(p.heavenlyStem as string);

    // 모든 별 병합: 주성 + 보조 별 + 길 잃은 별
    const allStars: Star[] = [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(p.majorStars ?? []).map((s: any) => {
        // ★ 2026-06-20 정렬된 주류 배반 구경의 전체 세트: 균일한 밝기 쿼리 SB_[currentBrightSchool] 테이블(모든 학교에 대한 기본값), 더 이상 iztro/희귀 도서 테이블을 사용하지 않음
        const rb = schoolStarBrightness(s.name as string, branch, currentBrightSchool);
        return {
          name:          s.name as string,
          type:          'major' as const,
          brightness:    rb ? mapBrightness(rb) : undefined,
          brightnessRaw: extractRawBrightness(rb),
          siHua:         s.mutagen as Star['siHua'],
        };
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(p.minorStars ?? []).map((s: any) => {
        // ★ 2026-06-20 동일한 SB 테이블의 보조성(좌보우필천괴천월녹존천마) + 살성(Fire Bell Sheep Tuo Kong Jie) (동일한 매핑/인덱스 세트)
        const rb = schoolStarBrightness(s.name as string, branch, currentBrightSchool);
        return {
          name:          s.name as string,
          type:          mapStarType(s.name as string, s.type as string),
          brightness:    rb ? mapBrightness(rb) : undefined,
          brightnessRaw: extractRawBrightness(rb),
          siHua:         s.mutagen as Star['siHua'],
        };
      }),
      // ★ 이전에는 모든 adjectiveStars가 mapStarType을 우회하여 type='minor'로 강제되었습니다.
      // 이로 인해 홍란/천희(행운), 천형/천곡(샤) 등이 오분류됩니다. 매핑 기능으로 변경하고,
      // 모든 별을 성격에 따라 행운/샤/소의 세 가지 범주로 올바르게 분류하고 UI를 일반 파티션에서도 표시할 수 있습니다.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(p.adjectiveStars ?? []).map((s: any) => {
        // ★ 2026-06-20 떠돌이 밝기는 주류 배반 구경과 일치합니다: 행 번호 = SB 밝기 테이블 ID(SCHOOL_STAR_ID_TO_NAME 역방향 확인),
        // 가을 궁은 여전히 iztro(금본위판과 일치)를 사용하고 있으며 금본위판은 24/24 검증됩니다. 이름에 이름이 없습니다 → 정의되지 않음 (공백, 현재 상황과 동일)
        const rb = schoolStarBrightness(s.name as string, branch, currentBrightSchool);
        return {
          name:          s.name as string,
          type:          mapStarType(s.name as string, (s.type as string) ?? ''),
          brightness:    rb ? mapBrightness(rb) : undefined,
          brightnessRaw: extractRawBrightness(rb),
          siHua:         s.mutagen as Star['siHua'],
        };
      }),
    ];

    // ★ 2026-06-20 주류 배반 구경에 맞춰 : 기본 구경은 "년전 12신/장군전 12신"의 특정 신을 본명 별표로 표시합니다.
    // (Jie Sha @ Jiang Qian, 용덕 @ Suiqian), iztro는 이 두 세트를 jiangqian12/suiqian12의 별도 필드에 배치합니다.
    // 원래 어셈블리에는 메이저/마이너/형용사의 세 가지 범주만 사용됩니다. → 전체 세트가 누락되었습니다. 여기서 보충하겠습니다. (두 개의 골드 스탠다드 디스크도 밝기가 표시되지 않고 공백으로 남아 있습니다.)
    // 연간 분기 대모는 12세 이전에 가지 않습니다(대모 이전의 iztro = 해당 연도, 기본 구경은 아님). applySchoolDahao를 참조하세요.
    for (const sname of [p.suiqian12, p.jiangqian12] as (string | undefined)[]) {
      if (sname === '劫煞' || sname === '龙德') {
        allStars.push({ name: sname, type: mapStarType(sname, '') });
      }
    }

    const range = p.decadal?.range;
    return {
      branch:        branch >= 0 ? branch : 0,
      stem:          stem >= 0 ? stem : 0,
      name:          p.name as string,
      stars:         allStars,
      daXianAge:     range ? [range[0], range[1]] as [number, number] : undefined,
      isMingGong:    p.name === '命宫',
      isShenGong:    p.isBodyPalace ?? false,
      isCurrentDaXian: false,
    };
  });

  // ★ 천괴천월 정렬 기본 파이(KY1) - 사용자 결정 2026-05-30, 실제 측정은 현재 상황과 다를 뿐입니다(위 기능 설명 참조).
  const yearStemCn = (astrolabe.rawDates?.chineseDate?.yearly?.[0]) as string | undefined;
  if (yearStemCn) applySchoolKuiyue(palaces, yearStemCn);

  // ── 현재 나이 & 대한 ──
  // ★ iztro horscope.age.nominalAge 사용(중국 세는나이 구경, daXianAge 범위와 일치)
  // 이전 구현 `currentYear - year`는 연도 차이(1 미만)이므로 대한 경계 연도 불일치 → 사용자 느낌이 발생합니다.
  // "대한이 제대로 가고 있지 않고 대한로 가는 것 같습니다." 이즈트로 자체 구경을 균일하게 사용하여 수리합니다.
  let currentAge: number;
  try {
    const horo = (astrolabe as unknown as { horoscope: () => { age: { nominalAge: number } } }).horoscope();
    currentAge = horo.age.nominalAge;
  } catch {
    // fallback: iztro 인터페이스가 비정상인 경우 세는나이 파생으로 대체
    currentAge = new Date().getFullYear() - year + 1;
  }

  palaces.forEach(p => {
    if (p.daXianAge && currentAge >= p.daXianAge[0] && currentAge <= p.daXianAge[1]) {
      p.isCurrentDaXian = true;
    }
  });

  // ── 대궁 구조화된 필드 차용(코덱스 P0: 카피라이팅 레이어가 자연어에서 차용 정보를 검색하는 것을 방지하기 위함)──
  palaces.forEach(p => {
    p.oppositeBranch = (p.branch + 6) % 12;
    const mainStars = p.stars.filter(s => s.type === 'major');
    p.isEmpty = mainStars.length === 0;
    if (p.isEmpty) {
      const oppPalace = palaces.find(q => q.branch === p.oppositeBranch);
      if (oppPalace) {
        p.borrowedFromBranch = oppPalace.branch;
        p.borrowedFromName = oppPalace.name;
        p.borrowedStars = oppPalace.stars.filter(s => s.type === 'major').map(s => s.name);
      }
    }
  });

  // ──주요 자궁가지──
  const mingGongBranch = BRANCHES.indexOf(astrolabe.earthlyBranchOfSoulPalace as string);
  const shenGongBranch = BRANCHES.indexOf(astrolabe.earthlyBranchOfBodyPalace as string);
  const wuxingJuName   = astrolabe.fiveElementsClass as string;
  const wuxingJu       = parseWuxingJu(wuxingJuName);

  // ──자미 별 위치──
  const ziweiPalace = palaces.find(p => p.stars.some(s => s.name === '紫微' && s.type === 'major'));
  const ziweiPos    = ziweiPalace?.branch ?? 0;

  // ── 대한 배열 (니하이샤 선생 "천기" 정통: 사화는 항상 고정되고, 대한은 궁 움직임에만 의존합니다)──
  // daXians[].siHua/stemIndex/stemName이 더 이상 생성되지 않습니다(비성 필드가 오프라인임).
  const daXians: DaXian[] = palaces
    .filter(p => p.daXianAge)
    .sort((a, b) => a.daXianAge![0] - b.daXianAge![0])
    .map(p => ({
      startAge:    p.daXianAge![0],
      endAge:      p.daXianAge![1],
      palaceBranch: p.branch,
      palaceName:   p.name,
    }));

  // Gonggan 자화는 오프라인 상태입니다. (니하이샤 선생은 비성가 Gonggan 자화를 보내는 것을 옹호하지 않습니다.)

  const currentDaXianIndex = daXians.findIndex(
    dx => currentAge >= dx.startAge && currentAge <= dx.endAge,
  );

  // ── 음력 정보(절기 사주 포함)──
  const lunarInfo = getLunarInfo(year, month, day, hour, leapMode);

  // ★ 2026-08-14 골드 스탠다드 디스크 검증 : 절공/부절 그늘 건조 스왑 + 연간 분기 대모 + 순공 쌍 부순
  applySchoolJiekong(palaces, lunarInfo.yearStem);
  applySchoolDahao(palaces, lunarInfo.yearBranch);
  applySchoolFuxun(palaces);

  // ── 명주 / 신주 / 음양 성별 ──
  const mingZhu = calcMingZhu(mingGongBranch >= 0 ? mingGongBranch : 0);
  const shenZhu = calcShenZhu(lunarInfo.yearBranch);
  const yinYangGender = calcYinYangGender(lunarInfo.yearStem, gender);

  return {
    birthInfo: chartBirthInfo,
    lunarInfo,
    mingGongBranch: mingGongBranch >= 0 ? mingGongBranch : 0,
    shenGongBranch: shenGongBranch >= 0 ? shenGongBranch : 0,
    wuxingJu,
    wuxingJuName,
    ziweiPos,
    palaces,
    daXians,
    currentAge,
    currentDaXianIndex,
    mingZhu,
    shenZhu,
    yinYangGender,
  };
}
