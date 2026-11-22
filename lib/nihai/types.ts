/* *
 * 니하이샤 천기 / 지기 / 인기 — 공유 유형 정의 */

/* * 3차 분류 */
export type SanJiCategory = 'tianji' | 'diji' | 'renji';

/* * 강좌/모듈 */
export interface NiModule {
  id: string;
  category: SanJiCategory;
  /* *중국 이름 */
  name: string;
  /* * 영어 이름 */
  nameEn: string;
  /* * 짧은 자막 */
  subtitle: string;
  /* *간단한 설명 */
  description: string;
  /* * 자세한 소개(여러 문단) */
  details: string[];
  /* *학교 소속 */
  school?: string;
  /* * 수업정보 */
  lessons?: string;
  /* *참고문헌 */
  references: string[];
  /* * 핵심 개념/키워드 */
  keywords: string[];
  /* *아이콘 캐릭터 */
  icon: string;
  /* * 상태 */
  status: 'active' | 'preview' | 'coming';
  /* * 무게 정렬 */
  order: number;
  /* * 라우팅 슬러그 */
  slug: string;
  /* * 하위 장 */
  chapters: NiChapter[];
}

/* * 장 */
export interface NiChapter {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  /* * 핵심 포인트 */
  keyPoints: string[];
  /* * 니하이샤 선생 인용문 */
  quotes?: string[];
  /* * 정렬 */
  order: number;
}

/* * 변화의 책의 64개 육각형 */
export interface Hexagram {
  number: number;
  name: string;
  /* * "Tian Ze Lu"와 같은 헥사그램 설명 */
  composition: string;
  /* * 샹과 */
  upper: string;
  /* *시아 구아 */
  lower: string;
  /* * 헥사그램의 핵심 포인트 */
  meaning: string;
  /* * 니하이샤 선생이 핵심 사항을 설명합니다. */
  niInterpretation: string;
  /* * 문제 해결을 위한 팁 */
  divination: string;
}

/* * 칸유 항목 */
export interface FengShuiEntry {
  id: string;
  title: string;
  category: 'yangzhai' | 'yinzhai' | 'theory';
  description: string;
  keyPoints: string[];
}

/* *인기 한의학 항목 */
export interface MedicalEntry {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  keyPoints: string[];
  relatedHerbs?: string[];
  relatedAcupoints?: string[];
}

/* * 침술 경험치 */
export interface AcuExperience {
  id: number;
  /* *징후/질병 */
  condition: string;
  /* * 경혈 조합 */
  acupoints: string;
  /* * 분류 */
  category: string;
  /* *추가 설명 */
  note?: string;
}

/* * 관통침 및 경혈법 */
export interface TransNeedling {
  id: number;
  /* * 경혈 조합: A~B */
  combo: string;
  /* *증상을 치료하세요 */
  indication: string;
  /* * 매칭 포인트 */
  supporting?: string;
  /* * 출처 */
  source: string;
}

/* * 한당 처방 */
export interface HantangFormula {
  id: number;
  /* * 처방명("백혈질정", "다유정" 등) */
  name: string;
  /* *질병을 치료하다 */
  indication: string;
  /* * 핵심이론(한문장) */
  theory?: string;
  /* * 주요성분(공개부분) */
  ingredients?: string;
}

/* * 고전 처방 */
export interface ClassicFormula {
  id: string;
  /* * 송곳니 이름 */
  name: string;
  /* * 출처 */
  source: string;
  /* * 성분의약품 */
  composition: string;
  /* * 표시 */
  indication: string;
  /* * 니하이샤 선생 사용 주요 포인트 */
  niUsage?: string;
}

/* * 천기 코스 세트 구조 */
export interface TianjiEpisode {
  /* *DVD 번호 1-24 */
  dvd: number;
  /* *전반의 주제 */
  firstHalf: string;
  /* * 주제 후반부 */
  secondHalf: string;
  /* * 주요 내용 */
  highlights: string[];
}
