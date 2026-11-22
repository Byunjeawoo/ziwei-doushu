/* *
 * 고대 서적 원본 쿼리 데이터베이스 - 유형 정의
 *
 * 디자인: 모든 고대 서적은 JSON 정적 데이터가 포함된 코드로 패키징됩니다(공개 버전에서는 저작권 위험 없음).
 * Next.js는 시작 시 DB 종속성 없이 한 번 메모리에 로드됩니다. */

export interface Paragraph {
  /* * 단락 고유 ID(앵커 점프용) */
  id: string;
  /* * 단락 번호(장 내) */
  idx: number;
  /* *단락의 원문(고대 중국어) */
  text: string;
  /* * 현대 번역(선택사항, 향후 작성 예정) */
  translation?: string;
  /* * 니하이샤 선생 주석(선택 사항, 소스 표시) */
  niNote?: string;
}

export interface Chapter {
  /* * 장 제목(예: "1권", "일반 장") */
  title: string;
  /* * 장 부제/소개(선택) */
  subtitle?: string;
  paragraphs: Paragraph[];
}

export interface Book {
  /* * 책 제목 */
  title: string;
  /* * 도서 슬러그('guisuifu'와 같은 URL용) */
  slug: string;
  /* * 왕조 */
  dynasty: string;
  /* *저자(여러 명 또는 알 수 없는 경우에는 "알 수 없음" 또는 여러 명으로 기재해 주세요) */
  author: string;
  /* * 소개 */
  intro: string;
  /* *총 단어 수(대략) */
  wordCount: number;
  chapters: Chapter[];
}

export interface SearchHit {
  bookSlug: string;
  bookTitle: string;
  chapterTitle: string;
  paragraphId: string;
  /* * 하이라이트 세그먼트(<mark> 태그 포함) */
  snippet: string;
  /* *원문 */
  text: string;
}
