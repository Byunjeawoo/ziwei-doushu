/* *
 * 사화 도구 모듈 — Nianqian / 대한 Gongqian / 유년qian / 유월qian / Liuriqian / Liushiqian
 * + Palace 스템 자화 감지 + Laiyin Palace 추적성
 *
 *배반 구경(2026-07-21 철법: 배반는 금 표준 플레이트를 기반으로 함):
 * 본명사화 = 생년천간사화 (접시에 주홍색 도장이 항상 표시됨)
 * 배송 제한 : 사화 = 대한 공간 / 유년 건식 / 유월 건식 / 리우리간 / 리시간 → 적층형 컬러씰
 * 결론의 텍스트는 여전히 니하이샤 선생을 기반으로 합니다. 이 모듈은 배반 스태킹용입니다. */

import { Lunar } from 'lunar-javascript';
import type { ZiweiChart, Palace, SiHua } from './types';
import { SI_HUA_TABLE, STEMS } from './constants';
import { CHILDHOOD_DAXIAN_INDEX, getChildhoodDaXianPalace } from './yunxian-context';

// ─── 1) 천간 인덱스에서 별 4개 사화를 얻습니다. ──────────────────────────────────
/* * 천간 인덱스 0~9 → {Lu, Quan, Ke, Ji}는 별 이름에 해당 */
export function getSiHuaByStem(stemIndex: number): Record<SiHua, string> {
  const arr = SI_HUA_TABLE[stemIndex];
  if (!arr) return { 禄: '', 权: '', 科: '', 忌: '' };
  return { 禄: arr[0], 权: arr[1], 科: arr[2], 忌: arr[3] };
}

/* * 별 이름 → 사화 유형(특정 천간확인에서) */
export function buildStarSiHuaMap(stemIndex: number): Record<string, SiHua> {
  const arr = SI_HUA_TABLE[stemIndex];
  if (!arr) return {};
  return { [arr[0]]: '禄', [arr[1]]: '权', [arr[2]]: '科', [arr[3]]: '忌' };
}

// ─── 2) 양력 연도 → 연도 컬럼 천간 인덱스 ────────────────────────────────
/* * 양력 연도 → 연도 열 천간 인덱스 (0=A, ... 9=Gui) */
export function getYearStemIndex(year: number): number {
  return ((year - 4) % 10 + 10) % 10;
}

/* * 양력 연도 → 연도 열 지지 인덱스 (0=자식, ... 11=hai) */
export function getYearBranchIndex(year: number): number {
  return ((year - 4) % 12 + 12) % 12;
}

// ─── 3) 대한사화: 대한 궁의 궁 줄기를 가져옵니다 (본명 연도 줄기가 아님)───────────────
/* *
 * 대한 공간 사화
 * @param 차트 명반
 * @param dxIndex 대한 인덱스 (chart.daXians[dxIndex]); 동한가 CHILDHOOD_DAXIAN_INDEX를 통과했습니다.
 * @returns 대한 및 사화 별 4개를 반환합니다. */
export function getDaXianSiHua(
  chart: ZiweiChart,
  dxIndex: number,
  year?: number,
): { stemIndex: number; stemName: string; transforms: Record<SiHua, string> } | null {
  const dxPalace = dxIndex === CHILDHOOD_DAXIAN_INDEX
    ? getChildhoodDaXianPalace(chart, year)
    : (() => {
        const dx = chart.daXians[dxIndex];
        if (!dx) return null;
        return chart.palaces.find(p => p.branch === dx.palaceBranch) ?? null;
      })();
  if (!dxPalace) return null;
  const stemIndex = dxPalace.stem;
  return {
    stemIndex,
    stemName: STEMS[stemIndex] ?? '',
    transforms: getSiHuaByStem(stemIndex),
  };
}

// ─── 4) 유년사화 ─────────────────────────────────────────
export function getLiuNianSiHua(year: number): {
  stemIndex: number;
  stemName: string;
  transforms: Record<SiHua, string>;
} {
  const stemIndex = getYearStemIndex(year);
  return {
    stemIndex,
    stemName: STEMS[stemIndex] ?? '',
    transforms: getSiHuaByStem(stemIndex),
  };
}

// ─── 5) 유월사화 (월 열 천간, 연도 어간 + 월 시퀀스에서 파생됨) ────────────────
/* *
 * 유월천간 (다섯 마리의 호랑이 탈주: 가계년 빙음, 이경년 무음, 빙신년 근음, 정인년 인음, 무귀년 가음)
 * 월: 음력 월 1~12 */
export function getLiuYueStemIndex(yearStem: number, month: number): number {
  // 오호탈출: 정월(음월) 천간
  const startStemOfYin: Record<number, number> = {
    0: 2, 5: 2,  // 지아지 → C
    1: 4, 6: 4,  // 이겡 → 우
    2: 6, 7: 6,  // 빙신 → 겅
    3: 8, 8: 8,  // 딩렌 → 렌
    4: 0, 9: 0,  // 戊癸 → 甲
  };
  const yinStem = startStemOfYin[yearStem] ?? 0;
  // 음(첫 번째 달)부터 목표 달(월은 1-12)까지
  return (yinStem + ((month - 1) % 12) + 10) % 10;
}

export interface LiuYueSiHuaOptions {
  /* * 윤달유월은 이번달/다음달의 구경인 실제 음력일 전후의 반달을 기준으로 합니다. */
  isLeapMonth?: boolean;
  liuriDay?: number;
  /* * 윤달의 후반인 12월이 다음 해의 첫 번째 달로 넘어갈 때 사용되는 연도입니다. */
  nextYearStem?: number;
}

export function getEffectiveLiuYueMonth(month: number, options: LiuYueSiHuaOptions = {}): number {
  const normalizedMonth = Math.max(1, Math.min(12, Math.trunc(month)));
  if (!options.isLeapMonth || (options.liuriDay ?? 1) <= 15) return normalizedMonth;
  return normalizedMonth >= 12 ? 1 : normalizedMonth + 1;
}

export function getLiuYueSiHua(yearStem: number, month: number, options: LiuYueSiHuaOptions = {}): {
  stemIndex: number;
  stemName: string;
  transforms: Record<SiHua, string>;
  month: number;
} {
  const effectiveMonth = getEffectiveLiuYueMonth(month, options);
  const sourceYearStem = options.isLeapMonth
    && effectiveMonth === 1
    && (options.liuriDay ?? 1) > 15
    ? (options.nextYearStem ?? yearStem)
    : yearStem;
  const stemIndex = getLiuYueStemIndex(sourceYearStem, effectiveMonth);
  return {
    stemIndex,
    stemName: STEMS[stemIndex] ?? '',
    transforms: getSiHuaByStem(stemIndex),
    month: effectiveMonth,
  };
}

// ─── 5b) 흐르는 태양 사화 (음력 태양 기둥 천간)─────────────────────────────
/* *
 * 현재 날짜 천간사화: 음력 연도, 월, 일을 사용하여 날짜 열 줄기를 가져옵니다(일반적인 구경은 "표시 날짜 줄기 사화"입니다).
 * 윤달는 isLeapMonth=true를 전달합니다(lunar-javascript는 음수 월의 윤달를 나타냅니다). */
export function getLiuRiSiHua(
  lunarYear: number,
  lunarMonth: number,
  lunarDay: number,
  isLeapMonth = false,
): { stemIndex: number; stemName: string; transforms: Record<SiHua, string> } | null {
  try {
    const monthKey = isLeapMonth ? -Math.abs(lunarMonth) : Math.abs(lunarMonth);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lunar = (Lunar as any).fromYmd(lunarYear, monthKey, lunarDay) as { getDayGan(): string };
    const stemIndex = STEMS.indexOf(lunar.getDayGan());
    if (stemIndex < 0) return null;
    return {
      stemIndex,
      stemName: STEMS[stemIndex] ?? '',
      transforms: getSiHuaByStem(stemIndex),
    };
  } catch {
    return null;
  }
}

// ─── 5c) 흐름 시간 사화 (다섯 마리 쥐 탈출: 일출 자시천간)───────────────────
/* * 시간 분기 0=Zi...11=Hai; 낮 줄기를 밀고 시 줄기를 밀면 사화로 간주됩니다. */
export function getLiuShiSiHua(dayStemIndex: number, hourBranch: number): {
  stemIndex: number;
  stemName: string;
  transforms: Record<SiHua, string>;
} {
  // Jiaji→Jiazi, Yigeng→Bingzi, Bingxin→Wuzi, Dingren→Gengzi, Wugui→Renzi
  const ziStemByDayStem: Record<number, number> = {
    0: 0, 5: 0,
    1: 2, 6: 2,
    2: 4, 7: 4,
    3: 6, 8: 6,
    4: 8, 9: 8,
  };
  const branch = ((Math.trunc(hourBranch) % 12) + 12) % 12;
  const stemIndex = ((ziStemByDayStem[dayStemIndex] ?? 0) + branch) % 10;
  return {
    stemIndex,
    stemName: STEMS[stemIndex] ?? '',
    transforms: getSiHuaByStem(stemIndex),
  };
}

// ─── 6) 자궁간대 자화 시험 ───────────────────────────────────────
/* *
 * 자화 : 사화 궁궐 줄기로 인해 변형된 별이 우연히 이 집에 있음
 * 예: 궁 줄기는 Jia (Lian Po Wu Yang)입니다. 이 궁의 주성에 "염정"가 포함되어 있으면 궁에는 "자화 Lu"가 있습니다. */
export interface SelfSihua {
  siHua: SiHua;        // 루/콴/케/지
  starName: string;    // 변신한 별
}

export function detectSelfSihua(palace: Palace): SelfSihua[] {
  const transforms = getSiHuaByStem(palace.stem);
  const found: SelfSihua[] = [];
  const palaceStarNames = new Set(palace.stars.map(s => s.name));
  (['禄', '权', '科', '忌'] as SiHua[]).forEach(sh => {
    const starName = transforms[sh];
    if (starName && palaceStarNames.has(starName)) {
      found.push({ siHua: sh, starName });
    }
  });
  return found;
}

// ─── 7) 원인궁을 추적하다 ────────────────────────────────────────
/* *
 * 원인 궁: 특정 별을 무언가로 변형하려면 그것이 "날아간" 궁의 줄기를 추적하세요.
 *
 * 니하이샤 선생 시스템이 일반적으로 사용됩니다. 화기의 원래 궁 - 화기는 어느 궁의 "공 줄기"에 의해 발생하며, 그 궁이 문제의 루트 궁입니다.
 *
 * @param 차트 명반
 * @param starName 변환된 별 이름(예: "태음")
 * @param sihua 사화 유형(예: "bogey")
 * @returns 변환을 촉발한 궁의 배열(보통 하나만 있지만 여러 궁의 줄기가 동일한 경우 여러 개가 있을 수 있음) */
export function findIncomingPalaces(
  chart: ZiweiChart,
  starName: string,
  sihua: SiHua,
): Palace[] {
  const result: Palace[] = [];
  chart.palaces.forEach(p => {
    const transforms = getSiHuaByStem(p.stem);
    if (transforms[sihua] === starName) {
      result.push(p);
    }
  });
  return result;
}

/* *
 * 디스크에 있는 모든 궁의 자화 목록 일괄 계산 */
export function buildAllSelfSihua(chart: ZiweiChart): Record<number, SelfSihua[]> {
  const result: Record<number, SelfSihua[]> = {};
  chart.palaces.forEach(p => {
    const list = detectSelfSihua(p);
    if (list.length > 0) result[p.branch] = list;
  });
  return result;
}

// ─── 8) 오버레이: 여러 개의 사화 레이어를 중첩한 효과 ──────────
/* *
 * 특정 별 이름 생성 → 다층 사화의 합성보기
 * 궁 위치에서 동시에 표시하는데 사용 : 본명ization / 대한ization / 유년ization
 * 우선순위: 본명 < 대한 < 유년 (단, 모두 표시됨) */
export interface SiHuaOverlay {
  native?: SiHua;    // 본명(연도 어간)
  daXian?: SiHua;    // 대한
  liuNian?: SiHua;   // 유년
  liuYue?: SiHua;    // 유월
}

export function buildOverlayForStar(
  starName: string,
  nativeMap: Record<string, SiHua>,
  daXianMap?: Record<string, SiHua>,
  liuNianMap?: Record<string, SiHua>,
  liuYueMap?: Record<string, SiHua>,
): SiHuaOverlay {
  return {
    native: nativeMap[starName],
    daXian: daXianMap?.[starName],
    liuNian: liuNianMap?.[starName],
    liuYue: liuYueMap?.[starName],
  };
}
