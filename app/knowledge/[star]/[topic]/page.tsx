import { ko, koNode } from '@/lib/i18n/ko';
/* *
 * /knowledge/[별]/[주제] — SEO 랜딩 페이지
 *
 * 14개 주성 × 13 주제 = 182개의 독립적인 URL
 * 각 페이지에는 완전한 STAR_DB 4문단 인수가 포함되어 있습니다(한 문장은 톤/핵심 인수/명반 기반/클래식 소스를 설정합니다).
 *
 * SEO 포인트:
 * - 제목에 주요 키워드가 포함되어 있습니다(예: "자미가 명궁·니하이샤 시스템 세부 설명을 입력합니다.")
 * - 설명에서는 dingdiao를 사용합니다(한 문장으로 분위기를 설정합니다).
 * - JSON-LD 기사 구조 데이터
 * - 내부링크 : 주성 외 12개 궁 + 동궁 외 13개 주성과 동일
 * - generateStaticParams는 정적으로 생성되며 런타임 오버헤드는 0입니다. */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { TopicKey } from '@/lib/ziwei/db-analysis';
import {
  ALL_STARS,
  ALL_TOPICS,
  getKnowledge,
  getAllKnowledgeRoutes,
  STAR_BRIEF_SEO,
  STAR_TO_SLUG,
  SLUG_TO_STAR,
} from '@/lib/seo/knowledge';
import { SITE_URL } from '@/lib/site';

// 동적 매개변수 허용: 별표/주제 조합이 generateStaticParams 목록에 없는 경우
// 또한 중국어 URL 인코딩 문제로 인해 발생하는 404를 방지하기 위해 런타임 시 주문형 렌더링을 허용합니다.
export const dynamicParams = false;

export async function generateStaticParams() {
  const routes = getAllKnowledgeRoutes();
  // URL은 Vercel/CDN 중국어 라우팅 경계 문제를 피하기 위해 중국어 대신 병음 슬러그를 사용합니다.
  return routes.map(r => ({ star: r.slug, topic: r.topic }));
}

export async function generateMetadata({ params }: { params: Promise<{ star: string; topic: string }> }) {
  const { star: slug, topic } = await params;
  const star = SLUG_TO_STAR[slug];
  if (!star) return {};
  const data = getKnowledge(star, topic as TopicKey);
  if (!data.exists) return {};

  const title = `${star}들어가다${data.palaceName}궁 ·${data.topicLabel}· 니하이샤 시스템에 대한 자세한 설명`;
  const description = data.parsed.dingdiao
    || `${star}들어가다${data.palaceName}Palace의 자미두수 해석 - 니하이샤 "천기" 시스템과 고대 서적 "자미두수전집" 및 "골수부"를 기반으로 합니다.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${SITE_URL}/knowledge/${slug}/${topic}`,
    },
    alternates: {
      canonical: `${SITE_URL}/knowledge/${slug}/${topic}`,
    },
    keywords: [
      '紫微斗数', '倪海厦', star, data.palaceName, data.topicLabel,
      `${star}${data.palaceName}`, `${star}들어가다${data.palaceName}`,
      `자미두수${star}`, '倪海厦紫微斗数', '紫微斗数全集',
    ],
  };
}

export default async function KnowledgePage({ params }: { params: Promise<{ star: string; topic: string }> }) {
  const { star: slug, topic } = await params;
  const star = SLUG_TO_STAR[slug];
  if (!star) notFound();
  const data = getKnowledge(star, topic as TopicKey);
  if (!data.exists) notFound();

  // 주성 다른 주제와 동일
  const otherTopicsForStar = ALL_TOPICS.filter(t => t !== topic && getKnowledge(star, t).exists);
  // 같은 주제 other주성
  const otherStarsForTopic = ALL_STARS.filter(s => s !== star && getKnowledge(s, topic as TopicKey).exists);

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${star}들어가다${data.palaceName}궁 ·${data.topicLabel}`,
    description: data.parsed.dingdiao,
    author: { '@type': 'Organization', name: "자미 연구 · 니하이샤 정품" },
    publisher: {
      '@type': 'Organization',
      name: '紫微研究',
      url: SITE_URL,
    },
    datePublished: '2026-04-28',
    dateModified: '2026-04-28',
    mainEntityOfPage: `${SITE_URL}/knowledge/${slug}/${topic}`,
    articleSection: "자미두수 · 니하이샤 시스템",
    keywords: [`紫微斗数`, star, data.palaceName, data.topicLabel].join(', '),
  };

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* 顶栏 */}
      <div className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(184,146,42,0.15)', background: 'var(--bg-page)' }}>
        <Link href="/" style={{ fontSize: '12px', color: 'var(--ac)', letterSpacing: '0.3em', textDecoration: 'none' }}>{koNode("← 홈")}</Link>
        <div style={{ fontSize: '12px', color: 'var(--tx-3)', letterSpacing: '0.2em' }}>{koNode("니하이샤 선생 방법론 · 기술 자료")}</div>
        <Link href="/chart" style={{ fontSize: '12px', color: 'var(--ac)', letterSpacing: '0.2em', textDecoration: 'none' }}>{koNode("출발 →")}</Link>
      </div>

      <article className="max-w-3xl mx-auto px-6 py-12">
        {/* 面包屑 */}
        <nav style={{ fontSize: '11px', color: 'var(--tx-3)', letterSpacing: '0.1em', marginBottom: '16px' }}>
          <Link href="/" style={{ color: 'var(--tx-3)', textDecoration: 'none' }}>{koNode("홈페이지")}</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <Link href="/knowledge" style={{ color: 'var(--tx-3)', textDecoration: 'none' }}>{koNode("지식 기반")}</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span>{koNode(star)}</span>
          <span style={{ margin: '0 8px' }}>·</span>
          <span style={{ color: 'var(--ac)' }}>{koNode(data.palaceName)}{koNode("궁")}</span>
        </nav>

        {/* 标题区 */}
        <header style={{ marginBottom: '36px' }}>
          <div style={{ fontSize: '11px', color: 'var(--tx-3)', letterSpacing: '0.25em', marginBottom: '8px' }}>
            {koNode(data.topicLabel)}{koNode("· 니하이샤 시스템에 대한 자세한 설명")}</div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 700, color: 'var(--tx-0)', letterSpacing: '0.1em', lineHeight: 1.2 }}>
            {koNode(star)}{koNode("들어가다")}{koNode(data.palaceName)}{koNode("궁")}</h1>
          {koNode(STAR_BRIEF_SEO[star] && (
            <p style={{ fontSize: '13px', color: 'var(--tx-2)', marginTop: '14px', lineHeight: 1.8 }}>
              {koNode(STAR_BRIEF_SEO[star])}
            </p>
          ))}
        </header>

        {/* 内容 4 段 */}
        {koNode(data.parsed.dingdiao && (
          <Section title={ko("한 문장이 분위기를 결정한다")} gradient>
            <p style={{ fontSize: '17px', color: 'var(--tx-0)', lineHeight: 1.9, fontWeight: 500, letterSpacing: '0.04em' }}>
              {koNode(data.parsed.dingdiao)}
            </p>
          </Section>
        ))}

        {koNode(data.parsed.lundian && (
          <Section title={ko("핵심 주장")}>
            <div style={{ fontSize: '15px', color: 'var(--tx-0)', lineHeight: 2, letterSpacing: '0.02em', whiteSpace: 'pre-wrap' }}>
              {koNode(data.parsed.lundian)}
            </div>
          </Section>
        ))}

        {koNode(data.parsed.yiju && (
          <Section title={ko("명반 기준")}>
            <div style={{ fontSize: '14px', color: 'var(--tx-0)', lineHeight: 2, letterSpacing: '0.02em', whiteSpace: 'pre-wrap' }}>
              {koNode(data.parsed.yiju)}
            </div>
          </Section>
        ))}

        {koNode(data.parsed.chuchu && (
          <Section title={ko("클래식 소스")} minimal>
            <div style={{ fontSize: '13px', color: 'var(--tx-2)', lineHeight: 2, letterSpacing: '0.02em', whiteSpace: 'pre-wrap' }}>
              {koNode(data.parsed.chuchu)}
            </div>
          </Section>
        ))}

        {/* CTA */}
        <div style={{
          margin: '40px 0 30px',
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(212,169,72,0.15) 0%, rgba(184,146,42,0.06) 100%)',
          borderRadius: '14px',
          border: '1px solid rgba(184,146,42,0.3)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '14px', color: 'var(--tx-0)', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '6px' }}>{koNode("당신의 명반을 보고 싶다")}{koNode(data.topicLabel)}？
          </div>
          <div style={{ fontSize: '12px', color: 'var(--tx-2)', marginBottom: '16px' }}>{koNode("생년월일 입력 · 니하이샤 선생 정통통역 · AI 질의응답 동행자")}</div>
          <Link href="/chart" style={{
            display: 'inline-block',
            padding: '12px 28px',
            background: 'linear-gradient(135deg, #d4a948 0%, #b8922a 100%)',
            color: 'white',
            borderRadius: '999px',
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '0.15em',
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(184,146,42,0.3)',
          }}>{koNode("지금 거래 시작 →")}</Link>
        </div>

        {/* 内链：同主星其他 topic */}
        <Section title={ko(`${star}다른 별의 집에 대한 해석`)} minimal>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {koNode(otherTopicsForStar.map(t => {
              const d = getKnowledge(star, t);
              return (
                <Link
                  key={t}
                  href={`/knowledge/${slug}/${t}`}
                  style={{
                    fontSize: '12px',
                    padding: '6px 12px',
                    background: 'var(--bg-card)',
                    border: '1px solid rgba(184,146,42,0.25)',
                    borderRadius: '999px',
                    color: 'var(--tx-2)',
                    textDecoration: 'none',
                  }}
                >
                  {koNode(star)}{koNode("들어가다")}{koNode(d.palaceName)}
                </Link>
              );
            }))}
          </div>
        </Section>

        {/* 内链：同 topic 其他主星 */}
        <Section title={ko(`기타 주성 입력${data.palaceName}궁궐의 해석`)} minimal>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {koNode(otherStarsForTopic.slice(0, 13).map(s => (
              <Link
                key={s}
                href={`/knowledge/${STAR_TO_SLUG[s]}/${topic}`}
                style={{
                  fontSize: '12px',
                  padding: '6px 12px',
                  background: 'var(--bg-card)',
                  border: '1px solid rgba(184,146,42,0.25)',
                  borderRadius: '999px',
                  color: 'var(--tx-2)',
                  textDecoration: 'none',
                }}
              >
                {koNode(s)}{koNode("들어가다")}{koNode(data.palaceName)}
              </Link>
            )))}
          </div>
        </Section>

        {/* 古籍库链接 */}
        <div style={{
          marginTop: '40px',
          padding: '16px 20px',
          background: 'rgba(184,146,42,0.04)',
          border: '1px dashed rgba(184,146,42,0.25)',
          borderRadius: '10px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '11px', color: 'var(--ac-dim)', letterSpacing: '0.15em', marginBottom: '6px' }}>{koNode("원본 텍스트를 읽고 싶으십니까?")}</div>
          <Link href="/library" style={{ fontSize: '13px', color: 'var(--ac)', fontWeight: 500, letterSpacing: '0.1em', textDecoration: 'none' }}>{koNode("📜 고대 서적 원본 데이터베이스 확인 — 자미두수전집 / 전체 도서 / 골수부 →")}</Link>
        </div>
      </article>

      {/* 页脚 */}
      <footer style={{ borderTop: '1px solid rgba(184,146,42,0.15)', padding: '20px 24px', textAlign: 'center', fontSize: '11px', color: 'var(--tx-3)', letterSpacing: '0.1em' }}>
        <div style={{ marginBottom: '6px' }}>{koNode("자미 연구 · 니하이샤 정통 시스템 기반 · 학습 참고용으로만 사용")}</div>
        <div style={{ opacity: 0.85 }}>{koNode("이 플랫폼은 의료, 투자, 법적 또는 주요 의사 결정 조언을 구성하지 않습니다.")}</div>
      </footer>
    </div>
  );
}

function Section({ title, children, gradient, minimal }: { title: string; children: React.ReactNode; gradient?: boolean; minimal?: boolean }) {
  return (
    <section style={{ marginBottom: minimal ? '24px' : '32px' }}>
      <h2 style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        color: 'var(--ac)',
        fontWeight: 600,
        letterSpacing: '0.2em',
        marginBottom: '12px',
      }}>
        <span style={{ width: '4px', height: '14px', background: 'var(--ac)', borderRadius: '2px' }} />
        {koNode(title)}
      </h2>
      <div style={{
        background: gradient
          ? 'linear-gradient(135deg, rgba(212,169,72,0.12) 0%, rgba(184,146,42,0.04) 100%)'
          : 'white',
        border: '1px solid rgba(184,146,42,0.15)',
        borderRadius: '10px',
        padding: minimal ? '14px 18px' : '20px 22px',
      }}>
        {koNode(children)}
      </div>
    </section>
  );
}
