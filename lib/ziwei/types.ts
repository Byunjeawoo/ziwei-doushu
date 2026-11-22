export interface BirthInfo {
  year: number;      // 그레고리오력(자시일 변경으로 수정된 "배반일")
  month: number;     // Gregorian month (1-12)
  day: number;       // Gregorian day
  hour: number;      // 시진 분기 인덱스(0=子, 1=Chou, ... 11=海)
  gender: 'male' | 'female';
  name?: string;
  province?: string;   // 출생 지역
  city?: string;       // 출생 도시
  longitude?: number;  // 출생지 경도(진태양시 보정용)
  /* *
   * 원래 입력(사용자가 실제로 양식을 작성한 시간)은 태어난 시간가 알려진 경우 항상 유지됩니다.
   *예: 사용자가 5/9 23:55를 입력하면 → 연/월/일이 5/10(익일 자시)로 변경되며,
   * 원본 {연도:Y, 월:5, 일:9, clockHour:23, clockMinute:55}은 여기에 저장됩니다.
   * 차트 페이지에서 "자시 날짜 변경 규칙에 따라 다음 날로 반환되었습니다."를 사용자에게 표시하는 데 사용됩니다. */
  origInput?: {
    year: number;
    month: number;
    day: number;
    clockHour: number;
    clockMinute: number;
  };
}

export interface LunarInfo {
  lunarYear: number;
  lunarMonth: number;    // positive = normal, negative = leap month
  lunarDay: number;
  yearStem: number;      // 0-9(A, B, C, D, Wu, Ji, Geng, Xin, Rengui)
  yearBranch: number;    // 0-11 (Zi Chou Yin Mao Chen Si Wu는 Youxuhai에 지원하지 않았습니다)
  isLeapMonth: boolean;
  /* * 절기 사주(년/월/일/시 열), 예: ["Renwu", "Renzi", "Renxu", "Gengxu"] */
  fourPillars?: [string, string, string, string];
  /* * 비태양성 사주 (음력 구경 : 음력 1월 1일 연도 변경 + 음력 월, 자미와 동일한 달력) - 절기 접합일의 달 기둥은 4기둥과 다릅니다. */
  fourPillarsLunar?: [string, string, string, string];
}

export type SiHua = '禄' | '权' | '科' | '忌';

/* * 별 밝기 8단계(자미두수 표준) - '지구'는 XD1의 추가 수준입니다(현대적으로 개정된 밝기 표, 초판). */
export type StarBrightness = '庙' | '旺' | '得' | '利' | '平' | '不' | '闲' | '陷' | '地';

export interface Star {
  name: string;
  type: 'major' | 'minor' | 'lucky' | 'sha';
  siHua?: SiHua;
  /* * 거친 밝기(하위 호환성 유지, 알고리즘 판단에 사용) */
  brightness?: 'bright' | 'normal' | 'dim';
  /* * 원래 7단계 밝기(사원/번영/드/이익/플랫/비/처짐) - 디스플레이 레이어에 사용됨 */
  brightnessRaw?: StarBrightness;
}

export interface SelfSihuaMark {
  siHua: SiHua;       // 루/콴/케/지
  starName: string;   // 자화 별
}

export interface Palace {
  branch: number;      // 0-11(지지 인덱스)
  stem: number;        // 0-9(천간 인덱스)
  name: string;        // 궁 이름
  stars: Star[];
  daXianAge?: [number, number];   // 대한 연령층
  isCurrentDaXian?: boolean;
  isMingGong?: boolean;
  isShenGong?: boolean;
  /* * Gongqian 자화(니하이샤 선생 시스템 코어) */
  selfSihua?: SelfSihuaMark[];
  /* * 대궁지지 지수 (항상 = (분기 + 6) % 12) */
  oppositeBranch?: number;
  /* * 공궁 여부(주성 없음) */
  isEmpty?: boolean;
  /* * 공궁인 경우 어느 궁의 지지 인덱스를 차용한 것인지 = 반대 지점 */
  borrowedFromBranch?: number;
  /* * 공궁라면 어떤 궁궐 이름을 따온 걸까요? */
  borrowedFromName?: string;
  /* * 공궁인 경우 차용한 대궁주성 이름 목록(구조화된 데이터, 카피라이팅 레이어는 더 이상 텍스트에서 다시 확인할 필요가 없음) */
  borrowedStars?: string[];
}

export interface DaXianSiHua {
  stemIndex: number;
  stemName: string;
  lu: string;    // 화록 별 이름
  quan: string;  // 화권 별 이름
  ke: string;    // 화과 별 이름
  ji: string;    // 화기 별 이름
}

export interface DaXian {
  startAge: number;
  endAge: number;
  palaceBranch: number;
  palaceName: string;
  stemIndex?: number;    // 대한 궁의 천간 인덱스(대한사화용)
  stemName?: string;
  siHua?: DaXianSiHua;   // 대한사화(공스템 기반)
}

export interface ZiweiChart {
  birthInfo: BirthInfo;
  lunarInfo: LunarInfo;
  mingGongBranch: number;    // 명궁지지
  shenGongBranch: number;    // 신궁지지
  wuxingJu: number;          // 오행국 (2,3,4,5,6)
  wuxingJuName: string;      // 예를 들어 '수이국'
  ziweiPos: number;          // 자미 별 위치
  palaces: Palace[];         // 지지0-11로 정렬된 12번째 하우스
  daXians: DaXian[];
  currentAge: number;
  currentDaXianIndex: number;
  /** Signed analysis-cache eligibility marker assigned by /api/generate. */
  analysisCacheProfile?: string;
  /* * 명주 별표 (표를 확인하려면 명궁지지를 누르세요) */
  mingZhu?: string;
  /* * 신주 별표 (표를 확인하려면 생년지지를 누르세요) */
  shenZhu?: string;
  /* * 음양 성별 (양남/음남/양녀/음녀) */
  yinYangGender?: string;
}
