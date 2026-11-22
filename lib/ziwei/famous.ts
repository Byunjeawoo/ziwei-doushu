/* *
 *연예인 명반 데이터베이스
 * 공개 기록의 생년월일를 기준으로 시진은 추정치입니다(일부는 문서화되어 있음). */

import 'server-only';

export interface FamousPerson {
  id: string;
  name: string;
  nameEn: string;
  category: '商业' | '文艺' | '历史' | '体育' | '科技';
  description: string;           // 정체성에 대한 한 문장 소개
  descriptionEn: string;
  year: number;
  month: number;
  day: number;
  hour: number;                  // 시진지지 인덱스 0-11
  gender: 'male' | 'female';
  notable: string;               // 명반 하이라이트 팁(사용자 관심 유도)
  notableEn: string;
}

export const FAMOUS_PERSONS: FamousPerson[] = [
  // ───비즈니스 전설──────────────────────────────────────────
  {
    id: 'ma-yun',
    name: '马云',
    nameEn: 'Jack Ma',
    category: '商业',
    description: "알리바바 창업자",
    descriptionEn: 'Founder of Alibaba',
    year: 1964, month: 9, day: 10, hour: 5,  // 소개사시
    gender: 'male',
    notable: "명반은 규칙을 깨고 재구축하는 강력한 능력을 보여줍니다. 관록궁 성요는 인터넷 비즈니스 제국과 매우 일치합니다.",
    notableEn: 'The chart shows an exceptional ability to break established patterns and rebuild, while the Career Palace closely parallels the rise of an internet business empire.',
  },
  {
    id: 'li-jiacheng',
    name: '李嘉诚',
    nameEn: 'Li Ka-shing',
    category: '商业',
    description: "홍콩의 슈퍼 부자, CK 허치슨 창업자",
    descriptionEn: 'Hong Kong billionaire and founder of the CK Hutchison business empire',
    year: 1928, month: 7, day: 29, hour: 3,  // 소개묘시
    gender: 'male',
    notable: "재백궁사화는 동양 최고의 부자인 명반에 대한 훌륭한 사례 연구입니다. 녹존은 돈을 유지하고 더 많은 돈을 축적합니다.",
    notableEn: 'The Four Transformations in the Wealth Palace make this a compelling case study of extraordinary wealth; Lu Cun preserves assets and supports steady accumulation.',
  },
  {
    id: 'ren-zhengfei',
    name: '任正非',
    nameEn: 'Ren Zhengfei',
    category: '商业',
    description: "화웨이 창업자",
    descriptionEn: 'Founder of Huawei',
    year: 1944, month: 10, day: 25, hour: 3, // 묘시
    gender: 'male',
    notable: "칠살은 격국이 될 운명이며 평생 바람에 맞서고 있습니다. 억압받을수록 그는 더욱 강해진다. 니하이샤 선생칠살 이론의 살아있는 교과서.",
    notableEn: 'Qi Sha in the Life Palace points to a life strengthened by adversity—the greater the pressure, the stronger the response—making this a vivid case study of traditional Qi Sha theory.',
  },

  // ─── 문학계 유명인 ────────────────────────────────────────
  {
    id: 'zhang-ailing',
    name: '张爱玲',
    nameEn: 'Eileen Chang',
    category: '文艺',
    description: "중국 현대문학 석사",
    descriptionEn: 'A master of modern Chinese literature',
    year: 1920, month: 9, day: 30, hour: 1, // 축시
    gender: 'female',
    notable: "명반 Lone Star Yao 그룹은 전설적인 정서적 경험과 문학적 성취로 마법 같은 대조를 이룹니다.",
    notableEn: 'The chart’s combination of solitary stars forms a striking parallel with her celebrated romantic history and literary achievements.',
  },
  {
    id: 'jay-chou',
    name: '周杰伦',
    nameEn: 'Jay Chou',
    category: '文艺',
    description: "중국 대중음악의 왕",
    descriptionEn: 'Mandopop singer-songwriter and cultural icon',
    year: 1979, month: 1, day: 18, hour: 1,  // 축시 (밤에 태어난 것으로 알려짐)
    gender: 'male',
    notable: "스타 문곡와 재능을 타고난 탐랑의 조합, 명반이 모든 스타일의 음악을 포괄할 수 있는 이유를 설명합니다.",
    notableEn: 'The combination of Wen Qu and Tan Lang suggests natural artistic talent and helps explain his ability to move across musical styles.',
  },
  {
    id: 'wang-fei',
    name: '王菲',
    nameEn: 'Faye Wong',
    category: '文艺',
    description: "중국 가요계의 가장 전설적인 여성 가수",
    descriptionEn: 'One of the most iconic singers in Chinese pop',
    year: 1969, month: 8, day: 8, hour: 4,   // 진시
    gender: 'female',
    notable: "부처궁 성요는 전설적인 두 결혼과 매우 일치하며 격국 관계는 연구 가치가 높습니다.",
    notableEn: 'The stars in the Marriage Palace closely parallel her two high-profile marriages, making the relationship pattern especially valuable for study.',
  },
  {
    id: 'lin-zhiling',
    name: '林志玲',
    nameEn: 'Lin Chi-ling',
    category: '文艺',
    description: "대만 모델 겸 배우",
    descriptionEn: 'Taiwanese model and actress',
    year: 1974, month: 11, day: 29, hour: 5, // 사시
    gender: 'female',
    notable: "태음은 운명을 지키는 여성미의 모델이고, 명반은 \"운명을 지닌 여자가 가장 아름답다\"는 니하이샤 선생의 결론을 완벽하게 확인시켜준다.",
    notableEn: 'Tai Yin guarding the Life Palace is a classic symbol of feminine grace, closely echoing the traditional view that this placement bestows exceptional beauty.',
  },

  // ─── 기술 엘리트 ─────────────────────────────────────────
  {
    id: 'steve-jobs',
    name: '乔布斯',
    nameEn: 'Steve Jobs',
    category: '科技',
    description: "애플 주식회사의 공동 창업자",
    descriptionEn: 'Co-founder of Apple',
    year: 1955, month: 2, day: 24, hour: 6,  // 오시
    gender: 'male',
    notable: "파군은 격국이 되었고 그의 친아들 부모에 의해 버림받아 애플 제국을 세웠습니다.",
    notableEn: 'Po Jun in the Life Palace, adoption at birth, and the creation of the Apple empire make this an archetypal chart of renewal after disruption.',
  },
  {
    id: 'elon-musk',
    name: '马斯克',
    nameEn: 'Elon Musk',
    category: '科技',
    description: "Tesla와 SpaceX의 창립자",
    descriptionEn: 'Founder of SpaceX and CEO of Tesla',
    year: 1971, month: 6, day: 28, hour: 4,  // 진시 (오전 7시 30분에 기록됨)
    gender: 'male',
    notable: "명반 속 이마별, 샤포랑 격국의 궁극의 표현은 강렬하며, 일생 동안 인류 미래의 경계를 바꾸어 왔습니다.",
    notableEn: 'An intense expression of the 살파랑 pattern, with a powerful Travel Horse star and a life devoted to pushing the boundaries of humanity’s future.',
  },

  // ───스포츠 스타─────────────────────────────────────────
  {
    id: 'yao-ming',
    name: '姚明',
    nameEn: 'Yao Ming',
    category: '体育',
    description: "NBA 전설적인 센터, 중국 농구 대변인",
    descriptionEn: 'Legendary NBA center and ambassador for Chinese basketball',
    year: 1980, month: 9, day: 12, hour: 5,  // 사시
    gender: 'male',
    notable: "천량은 생명력이 있고 키가 크고 장엄합니다. 관록궁 점성술은 그의 경력 업적과 매우 일치합니다.",
    notableEn: 'Tian Liang guarding the Life Palace suggests stature and dignity, while the Career Palace closely aligns with his professional achievements.',
  },
  {
    id: 'li-na',
    name: '李娜',
    nameEn: 'Li Na',
    category: '体育',
    description: "중국 테니스 그랜드슬램 우승자",
    descriptionEn: 'Chinese Grand Slam tennis champion',
    year: 1982, month: 2, day: 26, hour: 2,  // 인시
    gender: 'female',
    notable: "칠살은 가스가 되어 다른 사람들과 경쟁할 운명, 대한유년은 French Open 우승 시간과 정확하게 일치합니다.",
    notableEn: 'Qi Sha channels a powerful competitive drive, while the major periods and annual cycles closely align with the timing of her French Open victory.',
  },
];

/* * 카테고리별로 유명인 찾기 */
export function getFamousByCategory(category: FamousPerson['category']): FamousPerson[] {
  return FAMOUS_PERSONS.filter(p => p.category === category);
}

/* * 모든 카테고리 가져오기 */
export const FAMOUS_CATEGORIES: FamousPerson['category'][] = [
  '商业', '文艺', '科技', '体育',
];
