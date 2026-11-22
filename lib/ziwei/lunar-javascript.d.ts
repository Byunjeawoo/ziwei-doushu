declare module 'lunar-javascript' {
  class Lunar {
    /* * 월이 음수인 경우 윤달를 의미합니다(예: -5 = 5월 도약). */
    static fromYmd(year: number, month: number, day: number): Lunar;
    getYear(): number;
    getMonth(): number;  // negative = leap month
    getDay(): number;
    getYearGan(): string;
    getYearZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    /* * 양력로 변환됨(2026-08-05 추가문: lib/ziwei/share.ts는 오랫동안 사용되었으나 과거에는 모두 우회하여 사용함) */
    getSolar(): Solar;
  }

  class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    getLunar(): Lunar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
  }

  /* * 음력 월 정보 (2026-06-10 보충 : 윤달 크고 작은 월 경계 클램프 사용) */
  class LunarMonth {
    /* * 월이 음수이면 윤달(예: -5 = 5월 윤년)를 의미합니다. 해당 월이 없으면 돌아가기는 null입니다. */
    static fromYm(year: number, month: number): LunarMonth | null;
    getDayCount(): number;
  }
}
