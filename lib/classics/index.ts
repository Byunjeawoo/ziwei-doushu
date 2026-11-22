/* *
 * 고서 원본 쿼리 데이터베이스 - 입구
 *
 * 모든 고서 데이터 로드 + 쿼리/검색 API 제공
 * 데이터는 DB 종속성과 네트워크 요청이 전혀 없는 JSON으로 정적으로 패키지됩니다. */

import type { Book, Paragraph, SearchHit } from './types';
import { guSuiFu } from './data/gusuifu';
import { ziWeiQuanJi } from './data/quanji';
import { ziWeiQuanShu } from './data/quanshu';

/* * 수집된 모든 고대 서적 */
export const ALL_BOOKS: Book[] = [
  guSuiFu,
  ziWeiQuanJi,
  ziWeiQuanShu,
];

/* * 총 문단수(홈페이지 통계자료로 활용) */
export const TOTAL_PARAGRAPHS = ALL_BOOKS.reduce(
  (sum, b) => sum + b.chapters.reduce((s, c) => s + c.paragraphs.length, 0),
  0,
);

/* * 슬러그를 누르면 책을 얻을 수 있습니다 */
export function getBookBySlug(slug: string): Book | null {
  return ALL_BOOKS.find(b => b.slug === slug) ?? null;
}

/* * 장 번호로 장 가져오기 */
export function getChapter(bookSlug: string, chapterIdx: number) {
  const book = getBookBySlug(bookSlug);
  if (!book) return null;
  const chapter = book.chapters[chapterIdx];
  if (!chapter) return null;
  return { book, chapter, chapterIdx };
}

/* * 단락 ID별로 단락 가져오기(도서 및 장 정보 포함) */
export function getParagraphById(id: string) {
  for (const book of ALL_BOOKS) {
    for (let i = 0; i < book.chapters.length; i++) {
      const ch = book.chapters[i];
      const p = ch.paragraphs.find(p => p.id === id);
      if (p) {
        return { book, chapter: ch, chapterIdx: i, paragraph: p };
      }
    }
  }
  return null;
}

/* *
 * 전문 검색
 *
 * 단순 하위 문자열 일치(단어 분할 없음, 중국어의 경우 OK)
 *대소문자 구분 안 함, 전통 및 간체 변환은 아직 지원되지 않습니다. */
export function searchClassics(query: string, limit = 30): SearchHit[] {
  const q = query.trim();
  if (q.length < 1) return [];

  const hits: SearchHit[] = [];
  for (const book of ALL_BOOKS) {
    for (const chapter of book.chapters) {
      for (const p of chapter.paragraphs) {
        const idx = p.text.indexOf(q);
        if (idx < 0) continue;

        // 문맥 추출(앞뒤 40단어)
        const start = Math.max(0, idx - 40);
        const end = Math.min(p.text.length, idx + q.length + 40);
        const before = p.text.slice(start, idx);
        const matched = p.text.slice(idx, idx + q.length);
        const after = p.text.slice(idx + q.length, end);

        const snippet = (start > 0 ? '…' : '')
          + escapeHtml(before)
          + `<mark>${escapeHtml(matched)}</mark>`
          + escapeHtml(after)
          + (end < p.text.length ? '…' : '');

        hits.push({
          bookSlug: book.slug,
          bookTitle: book.title,
          chapterTitle: chapter.title,
          paragraphId: p.id,
          snippet,
          text: p.text,
        });

        if (hits.length >= limit) return hits;
      }
    }
  }
  return hits;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export type { Book, Chapter, Paragraph, SearchHit } from './types';
