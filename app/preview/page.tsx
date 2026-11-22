'use client';
import { ko, koNode } from '@/lib/i18n/ko';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ScrollIntro from '@/components/ScrollIntro';

export default function PreviewPage() {
  const router = useRouter();
  // replayKey는 ScrollIntro를 강제로 재설정하는 데 사용됩니다(사용자가 "다시 재생"을 클릭한 경우).
  const [replayKey, setReplayKey] = useState(0);
  const [done, setDone] = useState(false);

  return (
    <>
      {/* 卷轴开场动画 */}
      <ScrollIntro key={replayKey} onComplete={() => setDone(true)} />

      {/* 动画结束后的「样片说明 + 操作按钮」面板 */}
      {koNode(done && (
        <main style={{
          minHeight: '100vh',
          background: '#0d0a08',
          color: '#e8dcc4',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '48px 24px',
          fontFamily: '"Batang", "AppleMyungjo", serif',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.4em', color: '#c89647', marginBottom: '16px' }}>
            두루마리 · 도입부 · 미리보기
          </div>
          <h1 style={{
            fontSize: 'clamp(28px, 3.5vw, 40px)',
            letterSpacing: '0.18em',
            color: '#e8dcc4',
            marginBottom: '16px',
            fontWeight: 600,
          }}>{koNode("자미 스크롤 · 오프닝 미리보기")}</h1>
          <p style={{
            fontSize: '14px', color: '#a89878',
            maxWidth: '500px', lineHeight: 1.9,
            letterSpacing: '0.1em',
            marginBottom: '40px',
            fontFamily: '"STKaiti", "Kaiti SC", serif',
          }}>{koNode("방금 보신 스크롤 효과는 홈페이지에 들어갈 때마다 천천히 펼쳐집니다.")}<br />{koNode("마음에 드시면 알려주시면 홈페이지/온라인에 추가하겠습니다.")}</p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '24px' }}>
            <button
              onClick={() => { setDone(false); setReplayKey(k => k + 1); }}
              style={{
                background: '#a8302a',
                color: '#f5ecd7',
                padding: '14px 28px',
                fontSize: '14px',
                fontFamily: '"STSong", serif',
                letterSpacing: '0.3em',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >{koNode("다시 재생해 보세요")}</button>
            <button
              onClick={() => router.push('/')}
              style={{
                background: 'transparent',
                color: '#e8dcc4',
                padding: '14px 28px',
                fontSize: '14px',
                fontFamily: '"STSong", serif',
                letterSpacing: '0.3em',
                border: '1px solid rgba(232,220,196,0.25)',
                cursor: 'pointer',
              }}
            >{koNode("원래 홈페이지를 입력하세요.")}</button>
          </div>

          <div style={{
            marginTop: '40px', fontSize: '12px', color: '#6e6048',
            letterSpacing: '0.15em',
            display: 'flex', gap: '20px',
          }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>{koNode("원본 ↗")}</Link>
            <span>·</span>
            <Link href="/chart" style={{ color: 'inherit', textDecoration: 'none' }}>{koNode("명반")}</Link>
            <span>·</span>
            <Link href="/heming" style={{ color: 'inherit', textDecoration: 'none' }}>{koNode("복합 디스크")}</Link>
          </div>

          {/* 时间轴说明 */}
          <div style={{
            marginTop: '64px',
            padding: '24px 32px',
            border: '1px solid rgba(232,220,196,0.12)',
            maxWidth: '500px',
            fontSize: '12px',
            color: '#a89878',
            lineHeight: 1.9,
            letterSpacing: '0.1em',
            fontFamily: '"STKaiti", serif',
            textAlign: 'left',
          }}>
            <div style={{ color: '#c89647', marginBottom: '12px', letterSpacing: '0.2em', fontSize: '11px' }}>{koNode("애니메이션 타임라인")}</div>
            <div>{koNode("· 0.0 ~ 1.7 s 스크롤이 중앙에서 양쪽으로 펼쳐집니다.")}</div>
            <div>{koNode("· 1.9 ~ 2.7 s 라이스페이퍼의 내용이 나타납니다(제목+부제+진사씰)")}</div>
            <div>{koNode("· 2.7~3.5초 머물면서 즐기세요")}</div>
            <div>{koNode("· 3.5 ~ 4.2 s 전체적으로 페이드 아웃하여 홈페이지 진입")}</div>
            <div style={{ marginTop: '12px', color: '#6e6048', fontSize: '11px' }}>{koNode("사용자는 언제든지 오른쪽 하단의 '건너뛰기'를 클릭하여 홈페이지로 직접 이동할 수 있습니다.")}</div>
          </div>
        </main>
      ))}
    </>
  );
}
