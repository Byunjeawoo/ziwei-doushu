/* *
 * SEO 지식 페이지 — 데이터 도우미
 *
 * 14개 주성 × 13개 주제 = 182개의 고유 SEO URL
 * 각 페이지는 STAR_DB의 해당 필드에 대한 4세그먼트 마커입니다. (한 문장은 톤/핵심 주장/명반 기반/클래식 소스를 설정합니다) */

import { STAR_DB } from '@/lib/ziwei/db-analysis';
import type { TopicKey } from '@/lib/ziwei/db-analysis';
import { TOPIC_PALACE_NAME, TOPIC_LABEL } from '@/lib/ziwei/db-analysis';

export const ALL_STARS = [
  '紫微', '天机', '太阳', '武曲', '天同', '廉贞', '天府',
  '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军',
];

// 주성 이름 ← 병음 슬러그 매핑(Vercel/CDN에서 중국어 URL의 경계 문제를 피하기 위해 URL은 슬러그를 사용함)
export const STAR_TO_SLUG: Record<string, string> = {
  '紫微': 'ziwei',
  '天机': 'tianji',
  '太阳': 'taiyang',
  '武曲': 'wuqu',
  '天同': 'tiantong',
  '廉贞': 'lianzhen',
  '天府': 'tianfu',
  '太阴': 'taiyin',
  '贪狼': 'tanlang',
  '巨门': 'jumen',
  '天相': 'tianxiang',
  '天梁': 'tianliang',
  '七杀': 'qisha',
  '破军': 'pojun',
};

export const SLUG_TO_STAR: Record<string, string> = Object.fromEntries(
  Object.entries(STAR_TO_SLUG).map(([k, v]) => [v, k])
);

export const ALL_TOPICS: TopicKey[] = [
  'overview', 'personality', 'love', 'career', 'wealth', 'health',
  'family', 'children', 'move', 'friends', 'home', 'spirit', 'parents',
];

interface StarContent {
  mingGong: string;
  personality: string;
  xiongDi?: string;
  fuQi: string;
  ziNv?: string;
  caiBo: string;
  jiE: string;
  qianYi?: string;
  jiaoYou?: string;
  guanLu: string;
  tianZhai?: string;
  fuDe?: string;
  fuMu?: string;
}

const TOPIC_TO_FIELD: Record<TopicKey, keyof StarContent> = {
  overview:    'mingGong',
  personality: 'personality',
  love:        'fuQi',
  career:      'guanLu',
  wealth:      'caiBo',
  health:      'jiE',
  family:      'xiongDi' as keyof StarContent,
  children:    'ziNv' as keyof StarContent,
  move:        'qianYi' as keyof StarContent,
  friends:     'jiaoYou' as keyof StarContent,
  home:        'tianZhai' as keyof StarContent,
  spirit:      'fuDe' as keyof StarContent,
  parents:     'fuMu' as keyof StarContent,
};

interface ParsedContent {
  dingdiao: string;
  lundian: string;
  yiju: string;
  chuchu: string;
  raw: string;
  hasMarkers: boolean;
}

function parseStarContent(content: string): ParsedContent {
  const out: ParsedContent = { dingdiao: '', lundian: '', yiju: '', chuchu: '', raw: content, hasMarkers: false };
  if (!content) return out;
  if (!content.includes("**【한 문장으로 분위기가 결정됩니다.】**") && !content.includes("**[핵심 결론]**")) {
    out.lundian = content;
    return out;
  }
  out.hasMarkers = true;
  const re = /\*\*【([^】]+)】\*\*/g;
  const parts: { name: string; markerEnd: number; start: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    parts.push({ name: m[1], start: m.index, markerEnd: m.index + m[0].length });
  }
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    const end = i + 1 < parts.length ? parts[i + 1].start : content.length;
    const text = content.slice(p.markerEnd, end).trim();
    if (p.name === '一句话定调') out.dingdiao = text;
    else if (p.name === '核心论断') out.lundian = text;
    else if (p.name === '命盘依据') out.yiju = text;
    else if (p.name === '经典出处') out.chuchu = text;
  }
  return out;
}

export interface KnowledgeData {
  star: string;
  topic: TopicKey;
  topicLabel: string;
  palaceName: string;
  parsed: ParsedContent;
  exists: boolean;
}

export function getKnowledge(star: string, topic: TopicKey): KnowledgeData {
  const profile = STAR_DB[star] as StarContent | undefined;
  const field = TOPIC_TO_FIELD[topic];
  const content = profile && field ? (profile[field] as string | undefined) ?? '' : '';
  return {
    star,
    topic,
    topicLabel: TOPIC_LABEL[topic],
    palaceName: TOPIC_PALACE_NAME[topic],
    parsed: parseStarContent(content),
    exists: Boolean(content),
  };
}

/* * 모든 14×13 조합 생성(generateStaticParams의 경우) */
export function getAllKnowledgeRoutes() {
  const routes: { star: string; slug: string; topic: TopicKey }[] = [];
  for (const star of ALL_STARS) {
    for (const topic of ALL_TOPICS) {
      const data = getKnowledge(star, topic);
      if (data.exists) routes.push({ star, slug: STAR_TO_SLUG[star], topic });
    }
  }
  return routes;
}

/* * 주성 속성 소개(SEO 페이지의 "XX 별 이해" 섹션에서 사용됨) */
export const STAR_BRIEF_SEO: Record<string, string> = {
  '紫微': '자미는 존귀함을 상징하는 제왕의 별입니다. 명궁에 있으면 지도력과 위엄, 높은 지위를 추구하는 성향으로 해석합니다.',
  '天机': '천기는 지혜와 기민함, 변화를 상징하는 별입니다. 명궁에 있으면 총명하고 적응력이 높으며 기획과 상담에 알맞다고 봅니다.',
  '太阳': '태양은 명예와 공적인 활동, 남성의 귀함을 상징합니다. 명궁에 있으면 사회적 평판과 공직에 관련된 역량을 살핍니다.',
  '武曲': '무곡은 재물과 굳센 결단력을 상징합니다. 명궁에 있으면 재무 관리와 경영에 능하며 금융과 실업에 적합하다고 봅니다.',
  '天同': '천동은 복과 온화함, 삶의 즐거움을 상징합니다. 명궁에 있으면 부드러운 성품과 편안한 생활을 추구한다고 해석합니다.',
  '廉贞': '염정은 문무의 재능과 감정, 구속을 상징하는 차도화성입니다. 명궁에 있으면 다양한 재능과 풍부한 감정을 살핍니다.',
  '天府': '천부는 남두의 재물 창고를 맡는 별로 신중함과 보수성을 상징합니다. 명궁에 있으면 단정한 품행과 재산을 지키는 능력을 살핍니다.',
  '太阴': '태음은 달과 재물, 전택을 상징합니다. 명궁에 있으면 섬세한 감정과 재산 관리 성향을 살피며 전통적으로 여명에서 좋게 봅니다.',
  '贪狼': '탐랑은 도화와 욕망, 다재다능함과 사교성을 상징합니다. 명궁에 있으면 다양한 재능과 폭넓은 인간관계를 살핍니다.',
  '巨门': '거문은 말솜씨와 구설, 시비를 상징하며 화기는 어둠입니다. 명궁에 있으면 언어 능력이 뛰어나 법률과 교육 분야에 적합하다고 봅니다.',
  '天相': '천상은 인장과 보좌를 상징하는 별입니다. 명궁에 있으면 충후하고 단정한 품성을 살피며 행정과 법무에 적합하다고 봅니다.',
  '天梁': '천량은 노인과 보호, 어려움의 해소를 상징합니다. 명궁에 있으면 자비로운 성품과 법률·의학 분야의 적성을 살핍니다.',
  '七杀': '칠살은 장수의 별로 독립적인 도전과 결단력을 상징합니다. 명궁에 있으면 굳센 기질과 군경·창업 분야의 적성을 살핍니다.',
  '破军': '파군은 파괴와 혁신, 변화와 소모를 상징합니다. 명궁에 있으면 개척 정신과 기술 전문성을 살피며 육친과의 인연이 약하다고 해석하기도 합니다.',
};
