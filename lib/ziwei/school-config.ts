/* *
 * 배반 장르 구성 — 배반 장르 전환 9개 카테고리 + 기본값 + 지속성
 *
 * 데이터 출처: 대중적인 표준에 따라 구성됨(자세한 내용은 docs/school-alignment.md 참조)
 *
 * 사용자가 차트 페이지에서 설정 패널을 전환하고 즉시 배반를 다시 시작합니다. */

import type { BrightnessSchool } from './school-data';

// ─── 9가지 장르 구성 ─────────────────────────────────────────────────

/* * 1. 14개 주성 밝기 측정기 */
export type BrightnessSchoolOption = 'default' | BrightnessSchool;

/* * 2. 겐년 사화 (5개 변형) */
export type GengYearSihua =
  | 'GYWYT'   // Yang Wu Yin Tong(주류 기본 구경, iztro와 일치)
  | 'GYWTY'   // 양오(陽)와 오(吳)는 음과 같다(과기교류론)
  | 'GYWFT'   // 양우푸 통
  | 'GYWFX'   // 양우현 총리
  | 'GYWTX';  // 양우동상

/* * 3. 천마 */
export type TianmaSchool = 'year-branch' | 'month-branch';

/* * 4. 천공 */
export type TiankongSchool = 'normal' | 'shun-jia-shi';

/* * 5. 절공순공 */
export type JiekongSchool = 'single' | 'double' | 'zhanyan';

/* * 6. 안쿠이웨 */
export type KuiyueSchool = 'qs1' | 'qs2' | 'zhong-yiming' | 'network';

/* * 7. 천사천상 */
export type TianshiTianshangSchool = 'normal' | 'zhongzhou';

/* * 8. 안창성의 십이신 */
export type ChangshengSchool = 'yin-yang-shun-ni' | 'shui-tu' | 'huo-tu';

/* * 9. 야자시 처리 */
export type LateZishi =
  | 'next-day'           // 다음 날로 간주됩니다(주류 기본 구경 + 현재)
  | 'current-day'        // 같은 날로 간주됩니다(니하이샤 선생 세력).
  | 'all-current'        // 일별열 현재일시열 현재일(팔자)
  | 'day-cur-time-next'; // 일별 열 현재 날짜 시간 열 다음 날(팔자)

/* * 10. 윤달 처리(사용자 피드백: 윤달에게 다음 달로 돌아가도록 요청하기 위해 니하이샤 선생 전송) */
export type LeapMonth =
  | 'split'         // 반으로 나눕니다(처음 15일은 이전 달에 속하고 마지막 15일은 다음 달에 속함) - ★저희 기본값 = 주류 배반 기본 구경 "중간 경계"(2026-09-05 150세트의 골드 표준 디스크 비교: 9개의 윤달 후반 반월 디스크는 이 구경에서 모두 동일합니다)
  | 'next-month'    // 한 달 전체가 다음 달로 돌아갑니다. (니하이샤 선생 학교: 도약 4월이 5월이 됩니다)
  | 'prev-month'    // 전체 달은 일반 달로 간주됩니다(윤년 4월은 4월로 간주됨). 선택적인 구경은 "이번 달로 간주됩니다". 이전 26,000개의 디스크 검증은 또 다른 참조 엔진 세트에 대한 것이었고 이는 표준 디스크의 기본 구경과 일치하지 않습니다.
  | 'origin-month'; // 조정 없음(도약 4월은 여전히 윤달, iztro fixLeap=false로 표시됨)

// ─── 전체 구성 개체 ─────────────────────────────────────────────────

export interface SchoolConfig {
  brightnessSchool: BrightnessSchoolOption;
  gengYearSihua: GengYearSihua;
  tianmaSchool: TianmaSchool;
  tiankongSchool: TiankongSchool;
  jiekongSchool: JiekongSchool;
  kuiyueSchool: KuiyueSchool;
  tianshiTianshang: TianshiTianshangSchool;
  changshengSchool: ChangshengSchool;
  lateZishi: LateZishi;
  leapMonth: LeapMonth;
}

/* *기본 구성 = 주류 배반 기본 구경과 일치(보조성 Liusha Zayao + 사화 + Yunqi, 차이 없음; 윤달 구경 = 전체 달이 이번 달로 돌아옴) */
/* *
 * ★ 2026-09-05 기본 윤달 구경 이전 월 → 분할: 금표준 디스크 150 세트 비교, 별 순위 차이가 0인 무작위 100 디스크,
 * 유일한 체계적 차이점은 9개의 윤달 하반기 디스크 - 표준 디스크의 기본값은 "월 중간 분할"(분할)이고 Metis의 이전 기본 기본값은 전체 월을 이번 달로 반환한다는 것입니다. 분할 후 별은 동일합니다.
 * 웹마스터 2026-09-05 기본값을 변경하기로 결정했습니다. 알고리즘 / school-patches / yunxian-palace는 모두 기본적으로 이 상수를 참조하므로 각각 리터럴을 작성하지 마세요. */
export const DEFAULT_LEAP_MONTH: LeapMonth = 'split';

/* * 런타임 확인을 위한 4개의 합법적인 윤달 구경(엔진은 불법 정책에 대해 RangeError를 발생시키고 공유 링크 확인은 엔진에 도달하기 전에 기본값으로 돌아갑니다). */
const LEAP_MONTH_VALUES: readonly LeapMonth[] = ['split', 'prev-month', 'next-month', 'origin-month'];

export const SCHOOL_DEFAULT_CONFIG: SchoolConfig = {
  brightnessSchool: 'default',           // = "Doushu Quanshu"(algorithm.ts는 '기본값'을 QS로 사용하고 주류 배반 기본 구경과 일치하며 10-20 변경)
  gengYearSihua: 'GYWYT',                // 양우인통
  tianmaSchool: 'year-branch',           // 연간 지출에 따라
  tiankongSchool: 'normal',              // 일반
  jiekongSchool: 'double',               // 기본 및 보조 별
  kuiyueSchool: 'qs1',                   // 두서 전곡의 이해 1
  tianshiTianshang: 'normal',            // 일반
  changshengSchool: 'yin-yang-shun-ni',  // 음과 양을 구별하라
  lateZishi: 'next-day',                 // 다음날로 간주
  leapMonth: DEFAULT_LEAP_MONTH,         // 闰月分半（主流排盘默认口径「月中分界」，150 组金标准盘对照验证）
};

// ─── localStorage 지속성 키 ────────────────────────────────────────
export const SCHOOL_CONFIG_LS_KEY = 'ziwei-school-config-v1';
/* * 2026-09-05 윤달 기본 이전-월→일회성 천이 표시 분할(loadSchoolConfig 참조) */
export const SCHOOL_LEAP_MIGRATED_KEY = 'ziwei-school-leap-split-migrated';

/* *
 * ★ 2026-10-20 키 이름이 일관되게 이름이 변경되었습니다. `ziwei-<旧名>-config-v1` / `ziwei-<旧名>-leap-split-migrated`는 이전 버전에 존재합니다.
 * 새 키를 아직 사용할 수 없는 경우 장르 구성(brightnessSchool 필드 참조)과 이전 키의 윤달천이 표시를 이동하고 이전 키를 삭제합니다. 이 두 모양만 인식하고 다른 키는 건드리지 마세요. */
function migrateLegacyKeys(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k) keys.push(k); }
    if (localStorage.getItem(SCHOOL_CONFIG_LS_KEY) === null) {
      for (const k of keys) {
        if (k === SCHOOL_CONFIG_LS_KEY || !/^ziwei-[a-z]+-config-v1$/.test(k)) continue;
        const raw = localStorage.getItem(k);
        let parsed: unknown = null;
        try { parsed = raw ? JSON.parse(raw) : null; } catch { /* 不是流派配置 */ }
        if (!parsed || typeof parsed !== 'object' || !('brightnessSchool' in parsed)) continue;
        localStorage.setItem(SCHOOL_CONFIG_LS_KEY, raw as string);
        localStorage.removeItem(k);
        break;
      }
    }
    for (const k of keys) {
      if (k === SCHOOL_LEAP_MIGRATED_KEY || !/^ziwei-[a-z]+-leap-split-migrated$/.test(k)) continue;
      if (localStorage.getItem(SCHOOL_LEAP_MIGRATED_KEY) === null) localStorage.setItem(SCHOOL_LEAP_MIGRATED_KEY, localStorage.getItem(k) ?? '1');
      localStorage.removeItem(k);
    }
  } catch { /* localStorage 被禁：照旧走默认 */ }
}

/* *
 * localStorage 구성 읽기(기본값으로 안전하게 대체)
 * 브라우저 측에서 호출, 서버 측에서는 기본 돌아가기 */
export function loadSchoolConfig(): SchoolConfig {
  if (typeof window === 'undefined') return SCHOOL_DEFAULT_CONFIG;
  migrateLegacyKeys();
  try {
    const raw = localStorage.getItem(SCHOOL_CONFIG_LS_KEY);
    if (!raw) return SCHOOL_DEFAULT_CONFIG;
    const parsed = JSON.parse(raw) as Partial<SchoolConfig>;
    // ★ 2026-09-05 일회성 천이: 이전 기본 이전 월은 전체적으로 localStorage에 저장되며(드로어는 전체 구성을 저장함) "기본"인지 "수동 선택"인지 확실하지 않습니다.
    // 이전 옵션 자체는 "기본값"으로 표시되어 있으며 그것을 선택하는 사람도 기본 구경을 정렬하고 싶어 → 새로운 기본 분할로 균일하게 마이그레이션하고 한 번만 마이그레이션 (천이 표시) 한 다음 이전-월을 수동으로 선택하여 준수합니다.
    if (parsed.leapMonth === 'prev-month' && !localStorage.getItem(SCHOOL_LEAP_MIGRATED_KEY)) {
      parsed.leapMonth = DEFAULT_LEAP_MONTH;
      try { localStorage.setItem(SCHOOL_LEAP_MIGRATED_KEY, '1'); localStorage.setItem(SCHOOL_CONFIG_LS_KEY, JSON.stringify({ ...SCHOOL_DEFAULT_CONFIG, ...parsed })); } catch { /* noop */ }
    }
    return normalizeBrightness({ ...SCHOOL_DEFAULT_CONFIG, ...parsed });
  } catch {
    return SCHOOL_DEFAULT_CONFIG;
  }
}

/* *
 * ★ 2026-10-18 기본 항목과 기본 테이블 사이에 항목이 하나만 남습니다. (웹마스터: 두 항목을 동일하게 배열해야 하며 나란히 배치하지 마십시오.)
 * ★ 2026-10-20 기본값은 "Doushu Quanshu"(주류 배반 기본 구경, Algorithm.ts setBrightnessSchool 참조)로 변경되고 그에 따라 병합 방향이 변경됩니다.
 * 직접 선택한 QS(로컬에 저장됨, 공유 링크 bs=QS)는 항상 기본값으로 사용해야 하며 확인 표시는 "Doushu Quanshu" 학교(기본값)에 있습니다.
 * XD2는 더 이상 병합되지 않습니다. 이제 별도의 "Modern Modifier v2"가 되며 직접 선택한 경우에도 적용됩니다.
 * 10-18과 10-20 사이에서 '기본'으로 분류된 이전 XD2 선택 항목은 구별할 수 없으며 기본과 함께 전체 책이 됩니다(웹마스터가 결정: 기본 구경을 따릅니다). */
function normalizeBrightness(cfg: SchoolConfig): SchoolConfig {
  return cfg.brightnessSchool === 'QS' ? { ...cfg, brightnessSchool: 'default' } : cfg;
}

/* * localStorage에 구성 저장 */
export function saveSchoolConfig(cfg: SchoolConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SCHOOL_CONFIG_LS_KEY, JSON.stringify(cfg));
  } catch { /* localStorage 满或被禁 */ }
}

/* * 기본값으로 재설정 */
export function resetSchoolConfig(): void {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(SCHOOL_CONFIG_LS_KEY); } catch { /* noop */ }
}

// ───구성 → URL 쿼리 양방향 변환(장르 명반의 공유용)────────────────────

/* *
 * 장르 URL 매개변수 키의 전체 세트 - configToParams 출력과 일대일 대응, 10개 카테고리가 10개 키를 구성합니다.
 *
 * ★ 2026-06-12 "공유 링크가 윤달 구경을 잃음" 수정: 차트 페이지의 처음 두 위치에 손으로 쓴 키 배열 판단
 * "URL에 장르 매개변수가 포함되어 있는지 여부", 'lm'(윤달가 속한)이 누락됨 - 사용자가 다음 달 공유로 변경한 후,
 * 상대방이 ?lm=next-month를 열면 무시되고 기본 윤달 구경에 따라 다른 디스크가 배출됩니다.
 * 이 상수는 향후 판단에 재사용됩니다. configToParams에 필드를 추가할 때 여기에 동기식으로 추가해야 합니다. */
export const SCHOOL_PARAM_KEYS = ['bs', 'gys', 'tm', 'tk', 'jk', 'ky', 'tst', 'cs', 'lz', 'lm'] as const;

/* * SchoolConfig → URL 매개변수(간단한 형식: ?bs=qs&sh=GYWTY...) */
export function configToParams(cfg: SchoolConfig): Record<string, string> {
  const out: Record<string, string> = {};
  if (cfg.brightnessSchool !== 'default') out.bs = cfg.brightnessSchool;
  if (cfg.gengYearSihua !== 'GYWYT') out.gys = cfg.gengYearSihua;
  if (cfg.tianmaSchool !== 'year-branch') out.tm = cfg.tianmaSchool;
  if (cfg.tiankongSchool !== 'normal') out.tk = cfg.tiankongSchool;
  if (cfg.jiekongSchool !== 'double') out.jk = cfg.jiekongSchool;
  if (cfg.kuiyueSchool !== 'qs1') out.ky = cfg.kuiyueSchool;
  if (cfg.tianshiTianshang !== 'normal') out.tst = cfg.tianshiTianshang;
  if (cfg.changshengSchool !== 'yin-yang-shun-ni') out.cs = cfg.changshengSchool;
  if (cfg.lateZishi !== 'next-day') out.lz = cfg.lateZishi;
  if (cfg.leapMonth !== DEFAULT_LEAP_MONTH) out.lm = cfg.leapMonth;   // lm이 없는 이전 공유 링크는 이제 새로운 기본 분할에 따라 구문 분석됩니다(주류 배반 기본 구경과 동일).
  return out;
}

/* * URLSearchParams → SchoolConfig(기본 필드는 기본값으로 채워짐) */
export function paramsToConfig(params: URLSearchParams): SchoolConfig {
  return normalizeBrightness({
    brightnessSchool: (params.get('bs') as BrightnessSchoolOption) || SCHOOL_DEFAULT_CONFIG.brightnessSchool,
    gengYearSihua: (params.get('gys') as GengYearSihua) || SCHOOL_DEFAULT_CONFIG.gengYearSihua,
    tianmaSchool: (params.get('tm') as TianmaSchool) || SCHOOL_DEFAULT_CONFIG.tianmaSchool,
    tiankongSchool: (params.get('tk') as TiankongSchool) || SCHOOL_DEFAULT_CONFIG.tiankongSchool,
    jiekongSchool: (params.get('jk') as JiekongSchool) || SCHOOL_DEFAULT_CONFIG.jiekongSchool,
    kuiyueSchool: (params.get('ky') as KuiyueSchool) || SCHOOL_DEFAULT_CONFIG.kuiyueSchool,
    tianshiTianshang: (params.get('tst') as TianshiTianshangSchool) || SCHOOL_DEFAULT_CONFIG.tianshiTianshang,
    changshengSchool: (params.get('cs') as ChangshengSchool) || SCHOOL_DEFAULT_CONFIG.changshengSchool,
    lateZishi: (params.get('lz') as LateZishi) || SCHOOL_DEFAULT_CONFIG.lateZishi,
    // 공유 링크의 lm은 임의의 문자열(이전 링크/수동으로 변경된 URL)일 수 있습니다. 이제 엔진이 불법적인 정책을 던집니다.
    // RangeError, 먼저 여기를 확인하세요. 잘못된 값은 기본 구경으로 대체됩니다. 잘못된 링크로 인해 전체 페이지가 접히지 않도록 하세요.
    leapMonth: LEAP_MONTH_VALUES.includes(params.get('lm') as LeapMonth)
      ? (params.get('lm') as LeapMonth)
      : SCHOOL_DEFAULT_CONFIG.leapMonth,
  });
}

// ─── UI 표시: 각 스위치의 모든 옵션 + 중국어 라벨 ──────────────────────────

export const SCHOOL_OPTIONS = {
  // ★ 2026-06-17 통합 형식(사용자 요구 사항): [기본 항목]의 각 그룹은 고정적으로 첫 번째 순위가 지정되고, 설명은 균일하게 "기본 · xxx"로 시작됩니다.
  brightnessSchool: [
    // ★ 10-20 기본 항목 = "Dou Shu Quanshu"(주류 배반 기본 구경 "성요 밝기는 Dou Shu Quanshu"), 하단 레이어는 QS 테이블이므로 QS를 별도로 나열할 필요가 없습니다.
    { value: 'default', label: "\"Dou Shu Quanshu\" 학교", desc: "기본값 · 주류 배반 소프트웨어의 기본값과 일치" },
    { value: 'XD2', label: "최신 수정 v2", desc: "현대 개정 광도표(제2판)" },
    { value: 'XD1', label: "최신 수정 v1", desc: "현대 개정 광도표(1판)" },
    { value: 'ZZ', label: "중저우 학교", desc: "중주학파론" },
  ],
  gengYearSihua: [
    { value: 'GYWYT', label: "양우인통", desc: "기본값 · iztro/mainstream과 일치" },
    { value: 'GYWTY', label: "양우와 인", desc: "코지교류론" },
    { value: 'GYWFT', label: "양우푸 통" },
    { value: 'GYWFX', label: "양우현 총리" },
    { value: 'GYWTX', label: "양우동상" },
  ],
  tianmaSchool: [
    { value: 'year-branch', label: "연간 지출에 따라", desc: "기본 · 연간 지원 천마" },
    { value: 'month-branch', label: "월별 지원액에 따라" },
  ],
  tiankongSchool: [
    { value: 'normal', label: "기존 배열", desc: "기본값 · 천공부터 정상 시작" },
    { value: 'shun-jia-shi', label: "슌가가 태어났을 때" },
  ],
  jiekongSchool: [
    { value: 'double', label: "기본 및 보조 별", desc: "기본값 · 기본 별과 보조 별을 모두 사용" },
    { value: 'single', label: "기존의 단일 별" },
    { value: 'zhanyan', label: "잔우종" },
  ],
  kuiyueSchool: [
    { value: 'qs1', label: "『도서전서』의 이해 1", desc: "기본·노래집 전체의 이해 1" },
    { value: 'qs2', label: "『두술전서』의 이해 2", desc: "차이점은 Geng, Xinren 및 Gui 년에 태어난 사람들에게만 있습니다." },
    { value: 'zhong-yiming', label: "정예밍 선생님의 도서 정리" },
    { value: 'network', label: "네트워크 확산 배치" },
  ],
  tianshiTianshang: [
    { value: 'normal', label: "기존 배열", desc: "기본값 · 신궁 ±5자리" },
    { value: 'zhongzhou', label: "중주 스타일 배열 방법", desc: "태어난 달 홀짝 × 성별 교환" },
  ],
  changshengSchool: [
    { value: 'yin-yang-shun-ni', label: "음과 양을 구별하라", desc: "태만·음양은 불멸로 이어진다" },
    { value: 'shui-tu', label: "물과 흙은 영원히 공존한다", desc: "토오국 시작점 = 수이국 시작점(응용프로그램)" },
    { value: 'huo-tu', label: "불과 땅은 영원히 함께 산다", desc: "토오국 시작점 = 화육국 시작점(음)" },
  ],
  lateZishi: [
    { value: 'next-day', label: "다음날로 간주", desc: "기본 · 주류 실습" },
    { value: 'current-day', label: "같은 날로 간주", desc: "니하이샤 선생 세력" },
    { value: 'all-current', label: "일별 열 일/시간 열 일(팔자)" },
    { value: 'day-cur-time-next', label: "다음 날의 일/시간 컬럼의 일별 컬럼(팔자)" },
  ],
  // ★ 2026-06-17 사이트 전체 합의: 각 기본 옵션 세트가 첫 번째 순위가 됩니다. "천기"라는 단어를 제거하십시오(상표권 침해를 방지하기 위해).
  // ★ 2026-09-05 기본값은 절반으로 변경됩니다. 주류 배반 기본 구경 "월중 경계", 150세트의 금 표준 디스크는 비교용으로만 동일한 구경입니다.
  leapMonth: [
    { value: 'split', label: "절반으로 간주", desc: "기본값 · \"월중 경계\", 주류 배반 소프트웨어의 기본값과 일치합니다(처음 15일은 이번 달에 속함/마지막 15일은 다음 달에 속함, 비교 디스크 검증 150세트)" },
    { value: 'prev-month', label: "이번 달로 간주", desc: "4월의 윤달 전체가 4월의 일반적인 달이다." },
    { value: 'next-month', label: "다음 달로 간주", desc: "니하이샤 선생 진영 (4월 전체 기간은 5월로 정하겠습니다)" },
    { value: 'origin-month', label: "윤달 유지", desc: "조정하지 않으면 윤월은 여전히 윤달로 표시됩니다." },
  ],
} as const;

/* * 10가지 구성 범주에 대한 중국어 라벨(UI 제목용) */
export const SCHOOL_LABELS: Record<keyof SchoolConfig, string> = {
  brightnessSchool: '星曜亮度表',
  gengYearSihua: '庚年四化',
  tianmaSchool: '安天马',
  tiankongSchool: '安天空',
  jiekongSchool: '安截空旬空',
  kuiyueSchool: '安魁钺',
  tianshiTianshang: '安天使天伤',
  changshengSchool: '长生十二神',
  lateZishi: '晚子时',
  leapMonth: '闰月归属',
};
