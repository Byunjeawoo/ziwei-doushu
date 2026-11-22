import { ko, koNode } from '@/lib/i18n/ko';
/* *
 * /knowledge — 지식 베이스 홈페이지
 * 목록 14개 주성, 각 별은 13개 주제 해석에서 볼 수 있습니다. */

import Link from 'next/link';
import { ALL_STARS, ALL_TOPICS, getKnowledge, STAR_BRIEF_SEO, STAR_TO_SLUG } from '@/lib/seo/knowledge';
import { TOPIC_LABEL } from '@/lib/ziwei/db-analysis';

export const metadata = {
  title: "자미두수 지식 베이스 · 14개 주성 × 13 궁 · 니하이샤 정통 시스템",
  description: "자미두수 지식 베이스는 니하이샤 \"천기\" 시스템과 고대 서적 \"자미두수전집\" 및 \"골수부\"를 기반으로 컴파일되었습니다. 톤을 정하는 한 문장, 핵심 결론, 명반 기초, 클래식 소스 등 13집 14개의 주성 결론을 완결합니다.",
  keywords: ['紫微斗数', '倪海厦', '倪海厦紫微斗数', '紫微斗数全集', '紫微斗数全书', '14 主星', '12 宫位'],
};

export default function KnowledgeHomePage() {
  const STAR_DESCRIPTIONS_QUICK = STAR_BRIEF_SEO;

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* 顶栏 */}
      <div className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(184,146,42,0.15)', background: 'var(--bg-page)' }}>
        <Link href="/" style={{ fontSize: '12px', color: 'var(--ac)', letterSpacing: '0.3em', textDecoration: 'none' }}>{koNode("← 홈")}</Link>
        <div style={{ fontSize: '12px', color: 'var(--tx-3)', letterSpacing: '0.2em' }}>{koNode("니하이샤 선생 방법론 · 기술 자료")}</div>
        <Link href="/library" style={{ fontSize: '12px', color: 'var(--ac)', letterSpacing: '0.2em', textDecoration: 'none' }}>{koNode("고대 서적 →")}</Link>
      </div>

      {/* Hero */}
      <div className="text-center px-6 py-14">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div style={{ height: '1px', width: '48px', background: 'linear-gradient(to right, transparent, rgba(184,146,42,0.4))' }} />
          <span style={{ fontSize: '11px', color: 'var(--ac)', letterSpacing: '0.4em' }}>명리 지식</span>
          <div style={{ height: '1px', width: '48px', background: 'linear-gradient(to left, transparent, rgba(184,146,42,0.4))' }} />
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, color: 'var(--tx-0)', letterSpacing: '0.15em', marginBottom: '12px' }}>{koNode("자미두수 명리 지식")}</h1>
        <p style={{ fontSize: '14px', color: 'var(--tx-2)', letterSpacing: '0.08em', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>{koNode("주성 14개 × 해석 주제 13개 =")}<strong style={{ color: 'var(--ac)' }}>{koNode(ALL_STARS.length * ALL_TOPICS.length)}</strong>{koNode("주제")}<br />{koNode("니하이샤 \"천기\" 시스템을 기반으로 컴파일됨 · 고대 서적의 인용 포함")}</p>
      </div>

      {/* 14 主星卡片 */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div style={{ fontSize: '11px', color: 'var(--tx-3)', letterSpacing: '0.3em', textAlign: 'center', marginBottom: '24px' }}>{koNode("포틴주성")}</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {koNode(ALL_STARS.map(star => (
            <Link
              key={star}
              href={`/knowledge/${STAR_TO_SLUG[star]}/overview`}
              style={{
                display: 'block',
                padding: '14px 10px',
                background: 'var(--bg-card)',
                border: '1px solid rgba(184,146,42,0.2)',
                borderRadius: '10px',
                textDecoration: 'none',
                textAlign: 'center',
                transition: 'all 0.2s',
              }}
              className="hover:shadow-md hover:border-amber-400"
            >
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--tx-0)', letterSpacing: '0.15em' }}>
                {koNode(star)}
              </div>
            </Link>
          )))}
        </div>

        {/* 详细列表（每个主星 + 简介 + 进入按钮） */}
        <div className="mt-14 space-y-4">
          {koNode(ALL_STARS.map(star => (
            <div key={star} style={{
              background: 'var(--bg-card)',
              border: '1px solid rgba(184,146,42,0.18)',
              borderRadius: '12px',
              padding: '18px 22px',
            }}>
              <div className="flex items-baseline gap-3 mb-2">
                <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--tx-0)', letterSpacing: '0.1em' }}>
                  {koNode(star)}{koNode("별")}</span>
                <span style={{ fontSize: '11px', color: 'var(--tx-3)', letterSpacing: '0.15em' }}>
                  자미두수 · 십사주성
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--tx-2)', lineHeight: 1.7, marginBottom: '12px' }}>
                {koNode(STAR_DESCRIPTIONS_QUICK[star] || '')}
              </p>
              <div className="flex flex-wrap gap-2">
                {koNode(ALL_TOPICS.map(t => {
                  const k = getKnowledge(star, t);
                  if (!k.exists) return null;
                  return (
                    <Link
                      key={t}
                      href={`/knowledge/${STAR_TO_SLUG[star]}/${t}`}
                      style={{
                        fontSize: '11px',
                        padding: '4px 10px',
                        background: 'rgba(184,146,42,0.06)',
                        border: '1px solid rgba(184,146,42,0.15)',
                        borderRadius: '999px',
                        color: 'var(--tx-2)',
                        textDecoration: 'none',
                      }}
                    >{koNode("들어가다")}{koNode(k.palaceName)} · {koNode(TOPIC_LABEL[t])}
                    </Link>
                  );
                }))}
              </div>
            </div>
          )))}
        </div>
      </div>
    </div>
  );
}
