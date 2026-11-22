/* *
 * lib/ziwei/db-analytic - 오픈소스 플레이스홀더 버전(컨텐츠 라이브러리가 오픈소스 범위에 속하지 않는 것으로 결론지음)
 *
 * 온라인 풀버전에는 주성 14개 × 13개의 궁궐 상황에 대한 상세한 명리학 판단이 포함되어 있습니다(한 문장으로 톤 설정/핵심 판단/
 * 명반 기반 / 클래식 소스), 핵심 콘텐츠이며 배반 엔진을 사용한 오픈 소스가 아닙니다. 이 파일은 SEO 전용으로 예약되어 있습니다.
 * 지식 페이지 프레임워크에 필요한 "유형 + 궁/주제 태그"(고유 콘텐츠가 아닌 자미두수 일반 용어),
 * 어설션 콘텐츠 라이브러리 STAR_DB는 비어 있습니다. 따라서 기술 자료 세부 정보 페이지에서는 0개의 정적 경로를 생성합니다.
 *
 * 배반 코어(Anxing 알고리즘, 사화, 격국 인식, 고서 원문)가 완전 개방되어 있으며,
 * lib/ziwei 아래의 Algorithm.ts / Pattern.ts / sihua.ts 등을 참조하세요. */

export type TopicKey =
  | 'overview' | 'personality' | 'love' | 'career' | 'wealth' | 'health'
  | 'family' | 'children' | 'move' | 'friends' | 'home' | 'spirit' | 'parents';

// iztro zh-CN 궁 이름: 명궁에는 "palace"라는 단어가 유지되고 나머지에는 "palace"라는 단어가 없습니다. "교우"는 iztro에서는 "노복"로 불립니다.
export const TOPIC_PALACE_NAME: Record<TopicKey, string> = {
  overview:    '命宫',
  personality: '命宫',
  love:        '夫妻',
  career:      '官禄',
  wealth:      '财帛',
  health:      '疾厄',
  family:      '兄弟',
  children:    '子女',
  move:        '迁移',
  friends:     '仆役',
  home:        '田宅',
  spirit:      '福德',
  parents:     '父母',
};

export const TOPIC_LABEL: Record<TopicKey, string> = {
  overview:    '命格总览',
  personality: '性格特质',
  love:        '感情婚姻',
  career:      '事业职业',
  wealth:      '财富运势',
  health:      '健康状况',
  family:      '兄弟合伙',
  children:    '子女缘分',
  move:        '迁移外出',
  friends:     '人际贵人',
  home:        '田宅不动产',
  spirit:      '精神福德',
  parents:     '父母长辈',
};

/* *
 * 심판 콘텐츠 라이브러리(14개 주성 × 각 궁의 맥락에서 자세한 주장) - 핵심 콘텐츠이며 오픈 소스 범위에 속하지 않습니다.
 * 이 핸들은 비어 있습니다. 지식 기반 SEO 페이지는 `exists=false`로 인해 0개의 정적 세부 경로를 생성하지만 목록 프레임은 여전히 ​​작동합니다. */
export const STAR_DB: Record<string, unknown> = {};
