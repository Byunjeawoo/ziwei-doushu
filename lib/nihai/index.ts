/* *
 * 니하이샤 천기 / 지기 / 인기 — 통합 내보내기
 *
 * 니하이샤(1954-2012), 미국 한탕대학 설립자,
 * '점, 운세, 점, 등산, 의술'의 5가지 기술을 보유한 현대 세계에서 보기 드문 독특한 인물입니다.
 *
 *세 가지 시대 시스템:
 * 천기 ——Shangzhi 천문학(자미두수, Yi Jing, Kan Yu, 운세, 관상학, 인성 측정)
 * 지기——Xia Zhi 지리학(국립 지리학, 풍수 및 국가 운명)
 * 인기 —— Zhongzhi Human Affairs (침술, 황제내경, 신농의 약, 열병에 관한 논문, 금회의 개요) */

export * from './types';
export { TIANJI_MODULES, HEXAGRAMS, FENGSHUI_ENTRIES, TIANJI_EPISODES, TIANJI_QUOTES, TIANJI_STATS } from './tianji';
export { RENJI_MODULES, ACU_EXPERIENCES, TRANS_NEEDLING, HANTANG_FORMULAS, CLASSIC_FORMULAS, RENJI_STATS } from './renji';
export { DIJI_MODULES, DIJI_STATS } from './diji';

/* * 니하이샤 전체 전기 */
export const NI_HAIXIA_BIO = {
  name: "니하이샤",
  nameVariant: "니 하이시아",
  alias: "판위 드래곤",
  birth: "1954년 1월 1일",
  death: "2012년 1월 31일",
  birthPlace: "타이베이시",
  ancestry: "저장 루이안",
  family: "7명의 형제 자매, 5위",
  education: "소주대학교 정치학과",
  title: "미국 한탕중의과대학 설립자",
  titles: [
    "점술, 점술, 점술, 등산, 의술의 다섯 가지 능력을 지닌 남자.",
    "미국 한탕중의과대학 총장",
    "미국 캘리포니아중의과대학 박사 지도교수",
    "플로리다주 보건부 한의학 위원회 최고위원(2000-2003)",
    "플로리다 침술위원회 회원 및 부회장",
    "Jingfang 학교의 현대 후계자",
    "천기, 인기 교육 시스템 창립자",
    "해외 우수 중국인상 수상",
  ],
  /* *교사-강사 관계 */
  teachers: [
    { name: "저우 주오유", background: "베이징에서 4대째 가문을 이어온 유명 의사로 1949년 이후 대만으로 이주했다.", subject: "침술", period: '1977-1981' },
    { name: "쉬지민", background: "장쑤성 상하이 출신의 유명 의사", subject: "침술", period: '1970s' },
    { name: "장쭤징(Jiang Zuojing) 상속", background: "조영복(曹永富) 밑에서 공부한 정방(景坊) 가문", subject: "징팡", period: "지룽한의학상점 견습" },
  ],
  /* *핵심 개념 */
  corePhilosophy: [
    "단순성을 위한 가장 좋은 방법 - 비성는 날아다니기에는 너무 복잡하므로 이 작업을 수행하지 마십시오.",
    "명궁이 기본이고, 3자가 사용하게 됩니다.",
    "인력노력 + 지리적 조정 > 타고난 운명 (2/3 > 1/3)",
    "한의학은 인체를 신체적 관점에서 분석하는 물리의학이다.",
    "증후군을 구별하지만 질병은 아님 - 전통 한의학에서는 질병 이름보다는 증후군 유형을 살펴봅니다.",
    "1회 처방 후에는 2차 복용으로도 충분하다는 것을 알게 될 것입니다.",
    "나는 중국 문화가 사라지는 것을 원하지 않기 때문에 많은 학생들을 가르치고 있습니다.",
    "운세는 결과를 논하는 철학이다",
    "말은 배일 뿐이고, 진실은 반대편이다",
  ],
  /* * 생활사건 */
  timeline: [
    { year: '1954', event: "타이베이시 출생, 본가는 저장성 루이안시" },
    { year: '1970s', event: "고등학교 때 \"이종진지안\"으로 둘째 누나의 생리통을 치료하고 의학 공부를 결심했습니다." },
    { year: '1977-1981', event: "Zhou Zuoyu 박사에게 침술을 배우세요" },
    { year: '1978', event: "그는 군 내 마쓰 군의과에서 복무했으며 24세에 '마쓰 기적의 의사'라는 칭호를 받았다." },
    { year: '1979', event: "군 제대 후 '판위롱'이라는 가명으로 점술 사업을 시작했다." },
    { year: '1980', event: "미국으로 이민" },
    { year: '1988', event: "자미두수와 Yangzhai Feng Shui를 가르치기 위해 타이페이 Jinshan South Road에서 \"천문학 및 지리 수업\"을 개설" },
    { year: '1991', event: "미국 플로리다에 등록된 침술사 되기" },
    { year: '1993', event: "플로리다주 메리트아일랜드 한탕중의과대학 부동산 선정" },
    { year: '1994', event: "총 24화 '천기' 시리즈 녹화 완료" },
    { year: '1995', event: "한당중의과대학 설립" },
    { year: '2000-2003', event: "플로리다 보건부 산하 한의학 위원회 최고 위원 역임" },
    { year: '2004', event: "\"인기\" 한의학 교육 강좌가 타이페이에서 개설되었습니다" },
    { year: '2005', event: "\"인기\" 시리즈 교육용 DVD 출시" },
    { year: '2007', event: "\"지기\" 쓰기 시작" },
    { year: '2010', event: "타이페이 한탕 징팡 한의학 클리닉 설립 제3회 푸양포럼에 전일연설 초청" },
    { year: '2011', event: "Shenzhen Han and Tang Jingfang 한의학 클리닉 설립" },
    { year: '2012', event: "1월 31일 타이베이에서 심폐부전으로 59세의 나이로 사망했습니다." },
  ],
  /* * 글쓰기 시스템 */
  publications: {
    originalBooks8: ["황 디 네이 징 수 웬", "황제내경", "신농본초경", "침술", "상한론", "황금의 방", "인간 세계", "천기 다오·디인다오"],
    totalBooks: "26~44권(주석이 있는 교과서, 진료기록부, 경혈에 대한 자세한 설명 등 포함)",
    hantangFormulas: "한과 당 100평방미터",
    classicFormulas: "259가지 클래식 레시피",
    medicalCases: "7개의 완전한 의료 기록 컬렉션",
    totalVideoHours: "200시간 이상",
  },
  /* *3세대 시스템 */
  sanJi: {
    tianji: {
      name: "천기",
      meaning: "상지 천문학",
      content: "자미두수, 변경서, 칸유학, 명리학, 관상학 및 서예의 64개 육각형",
      recordYear: 1994,
      episodes: 24,
      hdEpisodes: 83,
      hoursPerEpisode: 2,
      totalHours: 48,
      books: ["천기 도로", "인간 세계", "디인 로드", "64 헥사그램 이 다이어그램"],
      schools: ["삼합파 (자미두수)", "Xiangshu School (변화의 책)", "구성파(칸유)", "Heluo 수학 학교 (예측)"],
      structure: "첫 시간은 명리학에 관한 것이고, 다음 시간은 주역에 관한 것입니다.",
    },
    renji: {
      name: "인기",
      meaning: "중지 HR",
      content: "침대성(44화), 황제내경(20화), 신농본약(46화), 열병논문, 금실개요(20화)",
      completionYear: '2004-2005',
      totalLessons: "150개 이상의 에피소드",
      learningOrder: "침술→황제내경→신농본초→열병논문→금실개요",
      acuExperience: 215,
      transNeedling: 31,
      hantangFormulas: 100,
    },
    diji: {
      name: "지기",
      meaning: "지리 이해",
      content: "내셔널 지오그래픽(미완성)",
      status: "니하이샤 선생 끝나지 않은 사업",
      note: "원래는 60세 이후에 글을 쓰려고 했으나 2012년에 세상을 떠났습니다.",
      startYear: 2007,
      existingContent: "천기 과정의 Kanyuology 부분 + 후세에 의해 편집된 사후 원고",
    },
  },
  /* * 성격 특성 */
  personality: {
    算命风格: "철구가 일직선으로 절단되어 공간이 남지 않습니다.",
    音乐爱好: "가장 좋아하는 이글스의 '호텔 캘리포니아'",
    生活技能: "그는 요리와 세탁에 능숙하며, 그의 페이스트리 솜씨는 모두에게 칭찬을 받고 있다.",
    工作态度: "나는 일 년 내내 머리맡에 펜과 종이를 놓아두고, 힘들거나 복잡한 병에 걸리면 스승님께 기도합니다.",
    睡眠: "수년 동안 밤에 3시간도 채 자지 못함",
    患者评价: "미국 환자들은 종종 \"마지막 희망\"이라고 부릅니다.",
  },
  /* * 후임자 선정기준 */
  discipleStandards: [
    "좋은 성격",
    "강한 개성",
    "강한 의견",
    "예리한 관찰",
    "잘못된 이론을 비판하는 용기",
  ],
};

/* * 산지 내비게이션 */
export const SANJI_CATEGORIES = [
  { key: 'tianji' as const, name: "천기", nameEn: 'Tian Ji', icon: '⊙', meaning: "상지 천문학", color: '#d4a843', href: '/tianji' },
  { key: 'diji' as const, name: "지기", nameEn: 'Di Ji', icon: '⊞', meaning: "지리 이해", color: '#6b8a5e', href: '/diji' },
  { key: 'renji' as const, name: "인기", nameEn: 'Ren Ji', icon: '⊕', meaning: "중지 HR", color: '#8b6b9e', href: '/renji' },
] as const;
