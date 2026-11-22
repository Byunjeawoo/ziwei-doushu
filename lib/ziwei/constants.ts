// 천간 천상의 줄기
export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 지지 지상 지점
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 시진은 지지에 해당합니다.
export const SHICHEN = [
  { branch: 0, name: '子时', range: '23:00-01:00' },
  { branch: 1, name: '丑时', range: '01:00-03:00' },
  { branch: 2, name: '寅时', range: '03:00-05:00' },
  { branch: 3, name: '卯时', range: '05:00-07:00' },
  { branch: 4, name: '辰时', range: '07:00-09:00' },
  { branch: 5, name: '巳时', range: '09:00-11:00' },
  { branch: 6, name: '午时', range: '11:00-13:00' },
  { branch: 7, name: '未时', range: '13:00-15:00' },
  { branch: 8, name: '申时', range: '15:00-17:00' },
  { branch: 9, name: '酉时', range: '17:00-19:00' },
  { branch: 10, name: '戌时', range: '19:00-21:00' },
  { branch: 11, name: '亥时', range: '21:00-23:00' },
];

// 12개 집 이름의 순서; 지지 지수는 명궁부터 시작하여 한 집을 전진할 때마다 1씩 감소합니다(배반 인터페이스는 시계 반대 방향입니다).
export const PALACE_NAMES_ORDER = [
  '命宫', '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫',
  '迁移宫', '交友宫', '官禄宫', '田宅宫', '福德宫', '父母宫'
];

// 납음오행 (줄기와 가지 30쌍의 오행)
export const NAYIN_ELEMENTS = [
  '金','火','木','土','金','火','水','土','金','木',
  '水','土','火','木','水','金','火','木','土','金',
  '火','水','土','金','木','水','土','火','木','水'
];

// 오행 → 라운드 수
export const ELEMENT_TO_JU: Record<string, number> = {
  '水': 2, '木': 3, '金': 4, '土': 5, '火': 6
};

// 게임 이름
export const JU_NAMES: Record<number, string> = {
  2: '水二局', 3: '木三局', 4: '金四局', 5: '土五局', 6: '火六局'
};

// 사화 테이블(연도 어간 → [화록, 화권, 화과, 화기])
export const SI_HUA_TABLE: Record<number, [string, string, string, string]> = {
  0: ['廉贞', '破军', '武曲', '太阳'],   // 에이
  1: ['天机', '天梁', '紫微', '太阴'],   // 비
  2: ['天同', '天机', '文昌', '廉贞'],   // C
  3: ['太阴', '天同', '天机', '巨门'],   // 딩
  4: ['贪狼', '太阴', '右弼', '天机'],   // E
  5: ['武曲', '贪狼', '天梁', '文曲'],   // 자기
  6: ['太阳', '武曲', '太阴', '天同'],   // 겡
  7: ['巨门', '太阳', '文曲', '文昌'],   // 신
  8: ['天梁', '紫微', '左辅', '武曲'],   // 렌
  9: ['破军', '巨门', '太阴', '贪狼'],   // 癸
};

// 천괴천월 테이블 (연도 어간 → [천괴branch, 천월branch])
export const TIANKUI_TABLE: Record<number, [number, number]> = {
  0: [1, 7],   // 답: 쿠이추웨웨이(Kui Chou Yue Wei)
  1: [0, 8],   // B: 쿠이지 위에셴(Kuizi Yueshen)
  2: [11, 9],  // C: 유귀하이유에
  3: [11, 9],  // 딩: 유귀하이유에
  4: [1, 7],   // E: 쿠이추웨웨이(Kui Chou Yue Wei)
  5: [0, 8],   // 지: 쿠이지 웨센(Kuizi Yueshen)
  6: [1, 7],   // 겐(Geng): 쿠이추웨웨이(Kui Chou Yue Wei)
  7: [6, 2],   // 신: Kui Wu Yue Yin
  8: [3, 5],   // 렌 : 쿠이마오 위에시
  9: [3, 5],   // 癸: 魁卯 钺巳
};

// 녹존 테이블(연도 어간 → 녹존분기)
export const LUCUN_TABLE: Record<number, number> = {
  0: 2,   // 답: 음
  1: 3,   // B: 마오
  2: 5,   // C: 시
  3: 6,   // 딩: 정오
  4: 5,   // E: 시
  5: 6,   // 지 : 정오
  6: 8,   // 겐 : 쉔
  7: 9,   // 신(Xin): 단일한
  8: 11,  // 렌: 하이
  9: 0,   // 癸: 子
};

// 천마 테이블 (연간분기 삼합 → 천마분기)
// Yinwuxu→Shen, Shen Zichen→Yin, Siyouchou→Hai, Haimaowei→Si
export const TIANMA_TABLE: Record<number, number> = {
  2: 8,   // 음년 → 쉔
  6: 8,   // 정오 → 쉔
  10: 8,  // Xu Nian → Shen
  8: 2,   // 센니안(Shen Nian) → 인(Yin)
  0: 2,   // 자년 → 음
  4: 2,   // Chen Nian → 음
  5: 11,  // 시년 → 하이
  9: 11,  // 당신 년 → 하이
  1: 11,  // 못생긴 해 → 하이
  11: 5,  // 해년 → 시
  3: 5,   // 마오니안 → 시
  7: 5,   // 未年 → 巳
};

// ★ 모든 별(주성 + 보조성)의 밝기가 Algorithm.ts → astro.config({밝기 })로 천이가 되었습니다.
// 덮어쓰기 범위: 9 주성 + 3 보조성 (문곡/영성/경양), 총 24개의 차이점이 수정되었습니다.
// 나머지 별(무곡/염정/탐랑/거문/파군/문창/화성/타라)에 대한 iztro의 기본값은 전체 책과 일치하므로 덮어쓸 필요가 없습니다.
// 이전 STAR_BRIGHTNESS는 데드 코드(참조되지 않음)이며 2026-05-08에 정리되었습니다.

// 주성 설명(니하이샤 선생 시스템)
export const STAR_DESCRIPTIONS: Record<string, { keywords: string; nature: string; element: string }> = {
  '紫微': { keywords: '帝王·尊贵·独立', nature: '中性偏吉', element: '土' },
  '天机': { keywords: '智慧·机变·谋略', nature: '吉星', element: '木' },
  '太阳': { keywords: '阳刚·官贵·慷慨', nature: '吉星', element: '火' },
  '武曲': { keywords: '财富·刚毅·果断', nature: '中性', element: '金' },
  '天同': { keywords: '温和·享福·随缘', nature: '吉星', element: '水' },
  '廉贞': { keywords: '才艺·刑囚·桃花', nature: '凶中带吉', element: '火' },
  '天府': { keywords: '财库·稳重·保守', nature: '吉星', element: '土' },
  '太阴': { keywords: '柔美·财富·阴柔', nature: '吉星', element: '水' },
  '贪狼': { keywords: '欲望·桃花·多才', nature: '中性', element: '木' },
  '巨门': { keywords: '口舌·是非·善辩', nature: '凶中带吉', element: '水' },
  '天相': { keywords: '辅佐·行政·印绶', nature: '吉星', element: '水' },
  '天梁': { keywords: '荫护·医药·长辈', nature: '吉星', element: '土' },
  '七杀': { keywords: '将星·果决·孤克', nature: '凶星', element: '金' },
  '破军': { keywords: '开创·变动·破坏', nature: '凶星', element: '水' },
};
