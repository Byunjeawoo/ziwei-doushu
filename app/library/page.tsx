import { ko, koNode } from '@/lib/i18n/ko';
/* *
 * 고서 원본 데이터베이스 조회 · 홈페이지
 *
 * 포함된 모든 고대 서적 목록 + 글로벌 검색 입구 */

import Link from 'next/link';
import { ALL_BOOKS, TOTAL_PARAGRAPHS } from '@/lib/classics';
import LibrarySearch from './LibrarySearch';

export const metadata = {
  title: "자미두수 고전 서재 · 한국어 번역",
  description: "자미두수 권위 있는 고대 서적의 전체 텍스트 검색: \"자미두수전집\" \"자미두수전서\" \"골수부\" 니하이샤 \"천기\" 인용 출처",
};

export default function LibraryHomePage() {
  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* 顶栏 */}
      <div className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(184,146,42,0.15)', background: 'var(--bg-page)' }}>
        <Link href="/" style={{ fontSize: '12px', color: 'var(--ac)', letterSpacing: '0.3em', textDecoration: 'none' }}>{koNode("← 돌아가기홈페이지")}</Link>
        <div style={{ fontSize: '12px', color: 'var(--tx-3)', letterSpacing: '0.3em' }}>{koNode("고전 서재")}</div>
        <Link href="/chart" style={{ fontSize: '12px', color: 'var(--ac)', letterSpacing: '0.2em', textDecoration: 'none' }}>{koNode("출발 →")}</Link>
      </div>

      {/* Hero */}
      <div className="text-center px-6 py-16">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div style={{ height: '1px', width: '48px', background: 'linear-gradient(to right, transparent, rgba(184,146,42,0.4))' }} />
          <span style={{ fontSize: '11px', color: 'var(--ac)', letterSpacing: '0.4em' }}>자미두수 · 고전 서재</span>
          <div style={{ height: '1px', width: '48px', background: 'linear-gradient(to left, transparent, rgba(184,146,42,0.4))' }} />
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, color: 'var(--tx-0)', letterSpacing: '0.15em', marginBottom: '12px' }}>{koNode("자미두수 고전 서재")}</h1>
        <p style={{ fontSize: '14px', color: 'var(--tx-2)', letterSpacing: '0.1em', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>{koNode("자미두수 고전의 한국어 번역문 검색")}<br />{koNode("포함됨")}<strong style={{ color: 'var(--ac)' }}>{koNode(ALL_BOOKS.length)}</strong>{koNode("고서 · 전체")}<strong style={{ color: 'var(--ac)' }}>{koNode(TOTAL_PARAGRAPHS)}</strong>{koNode("개 문단")}</p>
      </div>

      {/* 搜索 */}
      <div className="max-w-2xl mx-auto px-6 mb-12">
        <LibrarySearch />
      </div>

      {/* 古籍列表 */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {koNode(ALL_BOOKS.map(book => (
            <Link
              key={book.slug}
              href={`/library/${book.slug}`}
              style={{
                display: 'block',
                background: 'var(--bg-card)',
                border: '1px solid rgba(184,146,42,0.2)',
                borderRadius: '14px',
                padding: '24px',
                textDecoration: 'none',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(184,146,42,0.06)',
              }}
              className="hover:shadow-lg"
            >
              <div style={{ fontSize: '11px', color: 'var(--tx-3)', letterSpacing: '0.2em', marginBottom: '6px' }}>
                {koNode(book.dynasty)} · {koNode(book.author.split(' ')[0])}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--tx-0)', marginBottom: '10px', letterSpacing: '0.1em' }}>
                《{koNode(book.title)}》
              </div>
              <div style={{ fontSize: '12px', color: 'var(--tx-2)', lineHeight: 1.7, marginBottom: '14px' }}>
                {koNode(book.intro)}
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--tx-3)' }}>
                <span>{koNode(book.chapters.length)}{koNode("장")}</span>
                <span style={{ color: 'rgba(184,146,42,0.4)' }}>·</span>
                <span>{koNode(book.chapters.reduce((s, c) => s + c.paragraphs.length, 0))}{koNode("개 문단")}</span>
              </div>
              <div style={{
                display: 'inline-flex',
                marginTop: '14px',
                fontSize: '11px',
                color: 'var(--ac)',
                letterSpacing: '0.15em',
                fontWeight: 500,
              }}>{koNode("읽기 →")}</div>
            </Link>
          )))}
        </div>

        {/* 底部说明 */}
        <div style={{ marginTop: '60px', padding: '24px', background: 'rgba(184,146,42,0.05)', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--ac-dim)', fontWeight: 600, letterSpacing: '0.15em', marginBottom: '8px' }}>{koNode("이 도서관에 대하여")}</div>
          <div style={{ fontSize: '12px', color: 'var(--tx-2)', lineHeight: 1.8, maxWidth: '600px', margin: '0 auto' }}>{koNode("포함된 고대 서적은 모두 공개판(명나라에서 출판됨)입니다.")}<br />{koNode("원본 저장소에 수록된 발췌문을 한국어로 옮겼습니다. 각 고전의 전체 판본은 아닙니다.")}<br />{koNode("오류를 발견하시면 저희에게 연락해주세요.")}</div>
        </div>
      </div>
    </div>
  );
}
