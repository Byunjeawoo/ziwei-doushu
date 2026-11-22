/* *
 * 장군 전의 열두 신 / 연전의 열두 신 – 지지부터 시작하는 열두 신의 두 그룹
 *
 * 이 문서가 필요한 이유(2026-08-12):
 * 주류 배반 소프트웨어 디스크의 각 궁에는 이 두 신의 이름이 있지만 우리 디스크는 항상 비어 있습니다.
 *
 *──한 가지 수정사항(중요, 기존 결론을 따르지 마세요)────────────────────────────
 * 이전 판결은 "세 배반 이전의 십이신의 주류가 정리되지 않아 LNSQX 테이블이 쓸모없다"는 것이었습니다. 시계는 정말 쓸모가 없습니다.
 * 하지만 결론은 틀렸습니다. 주류 배반 [순위]는 표를 조회하지 않고 공식을 따르지 않습니다.
 * 대한 / 유년 / 유월 / Flow Day / Flow Hour / 소한은 ​​각 레벨에 배치되며 기본적으로 완전 개방형입니다.
 *
 * 알고리즘 소스(대중적인 표준에 따라 구성되고 최적의 표준 디스크로 검증됨):
 *
 *12세 이전의 12신 - 수식, 테이블 조회 없음
 * 대궁 g = 1..12: 신성한 순서 = 13 - 시작점 + g, > 12이면 -12
 *즉, "연간 건물은 시작 지점이 위치한 하우스에 위치하며, 십이궁에서 전진합니다." 이는 LNSQX 테이블 상자별(일치 스크립트에서 선택됨)과 동일합니다.
 *
 * 최초의 12신 - LNJQX 테이블을 확인하세요
 * 신의 순서 s = 1..12: 신이 궁에 떨어진다 LNJQX[s][시작점 분기]
 * 즉, "신성 시퀀스 s는 궁에 속합니다. LNJQX [신성 시퀀스] [시작점 분기]"입니다.
 *
 * ★ 두 그룹의 시작점은 [지지]이며, 둘 다 [이 행운 한도의 지지]입니다:
 * 각 행운 한도(대한 / 유년 / 유월 / 당일 / 현재 시간)는 동일한 규칙을 따릅니다.
 * 행운 제한 스위치를 따라 열면 → 연도 전(이 레이어 지원), 그렇지 않으면 연도 전(생년 지원)
 * 작동 제한 스위치를 따라 열면 → 전면으로 이동(이 레이어는 지원), 그렇지 않으면 전면으로 이동(생년 지원)
 *두 스위치 모두 기본적으로 켜져 있습니다.
 * 즉, 기본적으로 행운의 한계를 따릅니다. 본명 상태(행운 제한이 선택되지 않음)는 생년에서 무조건 지원됩니다.
 *
 * 궁궐 코드: 테이블은 [Zi Qi Yi](1=Zi...12=Hai)를 사용합니다. 이 그룹은 다음을 독립적으로 테스트할 수 있습니다.
 * LNJQX의 일반 스타 시퀀스 = 삼합 Diwang (Shen Zichen→Zi, Yinwuxu→Wu, Siyouchou→You, Haimaowei→Mao) 12/12 모든 히트;
 * Suiyi 열은 셀 단위로 천마 테이블과 동일하고, 화개 열은 화개 테이블과 동일하며, 함지 열은 함지 테이블과 동일합니다. Yinqi에 따르면 모든 것이 잘못되었습니다.
 *
 * 이 문서에서는 외부 사용을 위해 항상 0-11 지지 인덱스(0=하위)를 사용합니다.
 *
 * 닥터 십이신(2026-08-14 골드 스탠다드 디스크 체크): 생년녹존부터 양남음녀는 정방향, 음남양녀는 역방향입니다. 운이 따르지 않습니다. */

import { LUCUN_TABLE } from './constants';

/* * 장군 이전의 12신은 장군별에서 전진하게 됩니다. 색인 0-11 = 신성한 질서. */
export const JIANG_QIAN_SHEN = [
  '将星', '攀鞍', '岁驿', '息神', '华盖', '劫煞',
  '灾煞', '天煞', '指背', '咸池', '月煞', '亡神',
] as const;

/* * 소년 이전의 열두 신은 소년부터 직진하게 됩니다. 색인 0-11 = 신성한 질서.
 * 7대 주류 배반에는 "Sui Po"(Sui Jian 대궁)가 적혀 있습니다. "대모"라고 쓰지 마십시오. 상단 열의 대모는 또 다른 별표입니다. */
export const SUI_QIAN_SHEN = [
  '岁建', '晦气', '丧门', '贯索', '官符', '小耗',
  '岁破', '龙德', '白虎', '天德', '吊客', '病符',
] as const;

/* *
 * 닥터 12신. 금표준판(Gold Standard Plate): 궁 바닥의 첫 번째 줄에 나열된 12명의 의사와 신.
 * 생년녹존부터 시작; 양남Z음녀 전진, 음남양녀 후진. 행운을 따르지 마십시오(유년은 선택된 후에도 여전히 생년녹존 궁에 속합니다). */
export const BOSHI_SHEN = [
  '博士', '力士', '青龙', '小耗', '将军', '奏书',
  '飞廉', '喜神', '病符', '大耗', '伏兵', '官符',
] as const;

/* *
 * 일반 별은 궁에 떨어집니다(0-11 지지 지수) - 삼합 게임에서 황제의 위치입니다.
 * Shen Zichen → Zi, Yin Wu Xu → Wu, Si You Chou → You, Hai Mao Wei → Mao, 즉 삼합 그룹과 일반적인 별궁을 공유합니다.
 *anchorBranch는 이 제한의 지지(본명 상태 전송 생년)의 분기입니다. */
export function jiangXingBranch(anchorBranch: number): number {
  const b = ((anchorBranch % 12) + 12) % 12;
  // Zi(0)/Chen(4)/Shen(8) → Zi(0); Chou(1)/Si(5)/You(9) → You(9);
  // Yin(2)/Wu(6)/Xu(10) → Wu(6); 마오(3)/웨이(7)/하이(11) → 마오(3)
  return [0, 9, 6, 3][b % 4];
}

/* *
 * 처음 12신: 돌아가기는 길이 12의 배열, 아래 첨자 = 궁 지지(0~11), 값 = 신성한 질서(0~11, 0 = 일반 별)입니다.
 * 삼합 황제 위치에서 장군별이 떠오른 후, 열한신이 전진합니다. */
export function jiangQianShenByBranch(anchorBranch: number): number[] {
  const start = jiangXingBranch(anchorBranch);
  const out = new Array<number>(12);
  for (let shen = 0; shen < 12; shen++) out[(start + shen) % 12] = shen;
  return out;
}

/* *
 * 나이 이전의 12신: 돌아가기는 길이 12의 배열, 아래첨자 = 궁 지지(0~11), 값 = 신순(0~11, 0=수지안).
 * 1년 된 건물이 앵분궁에 위치하고 있으며, 그 후 11신이 전진합니다. */
export function suiQianShenByBranch(anchorBranch: number): number[] {
  const a = ((anchorBranch % 12) + 12) % 12;
  const out = new Array<number>(12);
  for (let shen = 0; shen < 12; shen++) out[(a + shen) % 12] = shen;
  return out;
}

/* * 편의기능 : 특정 궁궐의 첫 번째 12신의 이름. */
export function jiangQianShenName(anchorBranch: number, palaceBranch: number): string {
  return JIANG_QIAN_SHEN[jiangQianShenByBranch(anchorBranch)[((palaceBranch % 12) + 12) % 12]];
}

/* * 편의기능 : 특정 궁궐의 해를 앞에 둔 열두 신의 이름. */
export function suiQianShenName(anchorBranch: number, palaceBranch: number): string {
  return SUI_QIAN_SHEN[suiQianShenByBranch(anchorBranch)[((palaceBranch % 12) + 12) % 12]];
}

/* * 양남음녀는 정방향, 음남양녀는 역방향입니다. Niangan Yin Yang은 calcYinYangGender와 동일합니다. */
export function boshiReverse(yearStem: number, gender: 'male' | 'female'): boolean {
  const yangStem = ((yearStem % 10) + 10) % 10 % 2 === 0;
  return yangStem !== (gender === 'male');
}

/* *
 * 의사십이신 : 돌아가기는 길이 12의 배열, 아래첨자 = 궁 지지(0~11), 값 = 신성한 질서(0~11, 0=의사).
 * 시작점 = 생년녹존. */
export function boshiShenByStem(yearStem: number, gender: 'male' | 'female'): number[] {
  const start = LUCUN_TABLE[((yearStem % 10) + 10) % 10];
  const reverse = boshiReverse(yearStem, gender);
  const out = new Array<number>(12);
  for (let shen = 0; shen < 12; shen++) {
    const branch = reverse ? (start - shen + 12) % 12 : (start + shen) % 12;
    out[branch] = shen;
  }
  return out;
}

export function boshiShenName(
  yearStem: number, gender: 'male' | 'female', palaceBranch: number,
): string {
  return BOSHI_SHEN[boshiShenByStem(yearStem, gender)[((palaceBranch % 12) + 12) % 12]];
}

/* *
 * 열두 신의 영문 이름 - 스페셜 테이블
 *
 * 공유 구문 사전 t()를 직접 사용하는 대신 별도의 테이블을 사용하는 이유:
 *사전은 일대일 "입력→번역"이며, 같은 중국어 단어라도 문맥에 따라 다르게 번역되어야 합니다——
 * "Jiang Xing"은 최초의 12신 중 하나로 병음이 필요하지만(나머지 23과 일치) 산문에서는 [칠살]의 다른 이름입니다.
 * ("죄수별은 장군별과 일치" = 염정은 칠살과 일치), 장군별으로 번역되어야만 읽을 수 있습니다. 테이블을 공유하면 조만간 싸움으로 이어질 것입니다.
 *
 * 2026-08-12 사전의 독립 항목 대모/Jiangxing/팔좌가 병음으로 통합되었습니다(원래 무료 번역인 25 Zayaoli).
 *이상치 3개), 현재 양측의 결과는 일관됩니다. 이 테이블의 의미는 디스크의 별 이름 레이블을 산문 사전에서 분리하는 것입니다.
 * 앞으로 사전에 손을 대는 사람은 이 칼럼을 왜곡하지 않을 것입니다.
 *
 * 구경: 명리학 고유 명사는 병음을 사용합니다(/api/interpret 영어 명령 "명리학 고유 명사를 병음+영어로 유지" 참조). */
export const SHIER_SHEN_EN: Record<string, string> = {
  // 12신(수이포 = 보드에 사용되는 주류 배반 단어; 대모는 상단 열의 연도 별을 위해 예약되어 있음 / 의사의 12번째 신)
  岁建: 'Sui Jian', 晦气: 'Hui Qi', 丧门: 'Sang Men', 贯索: 'Guan Suo',
  官符: 'Guan Fu', 小耗: 'Xiao Hao', 岁破: 'Sui Po', 大耗: 'Da Hao', 龙德: 'Long De',
  白虎: 'Bai Hu', 天德: 'Tian De', 吊客: 'Diao Ke', 病符: 'Bing Fu',
  // 장군 앞의 열두 신
  将星: 'Jiang Xing', 攀鞍: 'Pan An', 岁驿: 'Sui Yi', 息神: 'Xi Shen',
  华盖: 'Hua Gai', 劫煞: 'Jie Sha', 灾煞: 'Zai Sha', 天煞: 'Tian Sha',
  指背: 'Zhi Bei', 咸池: 'Xian Chi', 月煞: 'Yue Sha', 亡神: 'Wang Shen',
  // 의사와 십이신 (해 앞에 같은 이름을 가진 단어로 병음 공유)
  博士: 'Bo Shi', 力士: 'Li Shi', 青龙: 'Qing Long', 将军: 'Jiang Jun',
  奏书: 'Zou Shu', 飞廉: 'Fei Lian', 喜神: 'Xi Shen', 伏兵: 'Fu Bing',
};

/* * 언어에 따라 열두 신의 표시 이름을 선택하십시오. 포함되지 않은 경우 돌아가기 중국어로 유지되며 정의되지 않은 상태로 표시되지 않습니다. */
export function shierShenLabel(name: string, lang: string): string {
  return lang === 'en' ? (SHIER_SHEN_EN[name] ?? name) : name;
}
