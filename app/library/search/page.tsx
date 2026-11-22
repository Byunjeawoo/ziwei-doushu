import { ko, koNode } from '@/lib/i18n/ko';
/* *
 * /library/search?q=xxx — 검색 결과 페이지 */

import Link from 'next/link';
import { searchClassics, getParagraphById } from '@/lib/classics';

export const metadata = {
  title: "검색 · 고전 서재 · 한국어 번역",
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const sp = await searchParams;
  const q = sp.q?.trim() || '';
  const hits = q ? searchClassics(q, 50) : [];

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <div className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(184,146,42,0.15)', background: 'var(--bg-page)' }}>
        <Link href="/library" style={{ fontSize: '12px', color: 'var(--ac)', letterSpacing: '0.3em', textDecoration: 'none' }}>{koNode("← 고대 서적 데이터베이스")}</Link>
        <div style={{ fontSize: '12px', color: 'var(--tx-3)', letterSpacing: '0.2em' }}>{koNode("검색 결과")}</div>
        <Link href="/" style={{ fontSize: '12px', color: 'var(--ac)', letterSpacing: '0.2em', textDecoration: 'none' }}>{koNode("홈 →")}</Link>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div style={{ fontSize: '13px', color: 'var(--tx-3)', letterSpacing: '0.15em', marginBottom: '4px' }}>{koNode("검색 키워드")}</div>
          <h1 style={{ fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, color: 'var(--tx-0)', letterSpacing: '0.1em' }}>
            「{koNode(q || '（空）')}」
          </h1>
          <div style={{ fontSize: '12px', color: 'var(--tx-3)', marginTop: '8px' }}>{koNode("총 발견됨")}<strong style={{ color: 'var(--ac)' }}>{koNode(hits.length)}</strong>{koNode("개 문단이 검색되었습니다")}</div>
        </div>

        {koNode(hits.length === 0 ? (
          <div style={{
            background: 'var(--bg-card)',
            padding: '40px 20px',
            borderRadius: '12px',
            textAlign: 'center',
            color: 'var(--tx-2)',
            border: '1px solid rgba(184,146,42,0.15)',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.4 }}>📜</div>
            {koNode(q ? (
              <>
                <div style={{ fontSize: '14px', marginBottom: '6px' }}>{koNode("이 키워드는 수집된 고서에서는 발견되지 않습니다.")}</div>
                <div style={{ fontSize: '11px', color: 'var(--tx-3)', lineHeight: 1.7 }}>{koNode("계속해서 콘텐츠를 추가하고 있습니다. 검색를 시도해 볼 수 있습니다.")}<br />
                  <span style={{ color: 'var(--ac)' }}>{koNode("칠살 조두 / 쌍로 조원 / 화기 / 자미 / 명궁 / 지웨 통량")}</span>
                </div>
              </>
            ) : (
              <div style={{ fontSize: '13px' }}>{koNode("키워드 검색를 입력하세요")}</div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {koNode(hits.map((hit, i) => {
              const ctx = getParagraphById(hit.paragraphId);
              const chapterIdx = ctx?.chapterIdx ?? 0;
              return (
                <Link
                  key={i}
                  href={`/library/${hit.bookSlug}/${chapterIdx}#${hit.paragraphId}`}
                  style={{
                    display: 'block',
                    background: 'var(--bg-card)',
                    padding: '16px 20px',
                    borderRadius: '10px',
                    border: '1px solid rgba(184,146,42,0.18)',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'border-color 0.15s',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '11px',
                    color: 'var(--tx-3)',
                    marginBottom: '8px',
                    letterSpacing: '0.1em',
                  }}>
                    <span style={{ color: 'var(--ac)', fontWeight: 600 }}>《{koNode(hit.bookTitle)}》</span>
                    <span style={{ opacity: 0.5 }}>·</span>
                    <span>{koNode(hit.chapterTitle)}</span>
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      color: 'var(--tx-0)',
                      lineHeight: 1.9,
                      letterSpacing: '0.02em',
                    }}
                    dangerouslySetInnerHTML={{ __html: hit.snippet }}
                  />
                </Link>
              );
            }))}
          </div>
        ))}
      </div>

      <style>{koNode(`
        mark { background: rgba(184,146,42,0.3); color: #8b6a14; padding: 0 2px; border-radius: 2px; font-weight: 600; }
      `)}</style>
    </div>
  );
}
