import { ko, koNode } from '@/lib/i18n/ko';
export const metadata = { title: "이용약관 · 자미두수 명반", description: "자미두수 명반이용약관 및 사용자 계약" };

export default function TermsPage() {
  return (
    <>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--bg-0)', borderBottom: '1px solid var(--bdr)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--tx-3)', textDecoration: 'none' }}>
          <span style={{ fontSize: '16px' }}>‹</span>
          <span>{koNode("돌아가기홈 페이지")}</span>
        </a>
        <div style={{ width: '1px', height: '20px', background: 'var(--bdr-med)' }} />
        <span style={{ fontSize: '12px', color: 'var(--ac)', letterSpacing: '0.2em' }}>{koNode("자미두수 명반")}</span>
      </header>
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px 80px', color: 'var(--tx-1)', lineHeight: 1.8 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>{koNode("이용약관")}</h1>
        <p style={{ fontSize: 12, color: 'var(--tx-3)', marginBottom: 32 }}>{koNode("최종 업데이트 날짜: 2026년 4월")}</p>

      <h2 style={{ fontSize: 18, marginTop: 32, marginBottom: 12 }}>{koNode("1. 서비스 개요")}</h2>
      <p>{koNode("자미두수 명반(이하 \"본 플랫폼\")은 니하이샤 \"천기\" 자미두수 시스템을 기반으로 명반배반 및 통역 서비스를 제공합니다. 이 플랫폼의 모든 명리학 내용은 참고용입니다.")}<strong>{koNode("이는 의료, 투자, 법률, 심리 상담 또는 주요 인생 의사 결정 조언을 구성하지 않습니다.")}</strong>。</p>

      <h2 style={{ fontSize: 18, marginTop: 32, marginBottom: 12 }}>{koNode("2. 사용자 행동강령")}</h2>
      <p>{koNode("이 플랫폼을 사용함으로써 귀하는 다음에 동의합니다.")}</p>
      <ul style={{ paddingLeft: 24 }}>
        <li>{koNode("이 플랫폼은 합법적이고 개인적인 참조 목적으로만 사용하십시오.")}</li>
        <li>{koNode("상업적 판매, 재인쇄 또는 공개 출시를 위해 이 플랫폼의 콘텐츠를 배포하지 마십시오.")}</li>
        <li>{koNode("플랫폼의 정상적인 운영을 방해하는 행위를 하지 마십시오.")}</li>
        <li>{koNode("제출된 출생 정보는 사실이고 유효합니다. 본 플랫폼은 잘못된 정보로 인한 해석 편차에 대해 책임을 지지 않습니다.")}</li>
      </ul>

      <h2 style={{ fontSize: 18, marginTop: 32, marginBottom: 12 }}>{koNode("3. 지적 재산권 및 금지 조항 · 크롤링 방지 및 훈련 방지")}</h2>
      <p style={{ background: 'rgba(168,50,40,0.06)', border: '1px solid rgba(168,50,40,0.2)', padding: 16, borderRadius: 8 }}>
        <strong>{koNode("본 플랫폼의 모든 명리학 콘텐츠, 지식 기반(14개 주성 × 12 주택 × 남성 및 여성 × 사화 × 대한유년의 모든 해석 텍스트 포함), UI 디자인, 알고리즘 통합 솔루션 및 사례 라이브러리는 본 플랫폼에서 원본이거나 합법적으로 편집되었습니다.")}</strong><br/><br/>{koNode("다음 행위는 엄격히 금지되며, 위반자는 민사배상 및 형사책임을 추궁할 권리가 있습니다.")}<br/>{koNode("① 크롤러, 자동화된 스크립트, 배치 API 호출 등 기술적 수단을 통해 본 플랫폼의 콘텐츠를 캡처합니다.")}<br/>{koNode("② 이 플랫폼에서 생성된 명반 해석, 텍스트 및 API 응답 데이터**를 사용하여 기계 학습 모델**(대규모 언어 모델, 명리학 생성 모델, 텍스트 생성 모델 등을 포함하되 이에 국한되지 않음)을 훈련합니다.")}<br/>{koNode("③ 본 플랫폼에서 생성된 콘텐츠를 다른 웹사이트, APP, 셀프 미디어 계정에 재판매 및 게시합니다.")}<br/>{koNode("④ 본 플랫폼의 프런트엔드 또는 백엔드 코드를 디컴파일, 복사, 수정하고 유사한 서비스를 \"자체 운영\" 방식으로 제공합니다.")}<br/><br/>{koNode("본 플랫폼의 출력 텍스트에는 지문 추적 워터마크가 내장되어 있으며, 불법 복제/훈련으로 생성된 출력을 탐지 및 추적할 수 있습니다. 위반 사항이 발견되면 이 플랫폼은 다음을 요청할 권리가 있습니다.")}<strong>{koNode("건당 100만 위안의 청산 손해배상")}</strong>{koNode(", 법원에 소송을 제기하고 공안 기관의 조사에 협조할 권리가 있습니다.")}</p>

      <h2 style={{ fontSize: 18, marginTop: 32, marginBottom: 12 }}>{koNode("4. 면책 안내")}</h2>
      <p>{koNode("이 플랫폼의 명리학 내용은 전통적인 자미두수 및 니하이샤 시스템에 대한 지식을 기반으로 합니다.")}<strong>{koNode("100% 정확하다고 보장되지는 않습니다.")}</strong>{koNode(". 운명은 하늘과 땅과 사람이 함께 영향을 받습니다. 이 플랫폼의 출력은 자기 이해를 위한 참조로만 사용됩니다. 사용자는 합리적으로 처리해야 하며 단일 명리학 판단에 너무 많이 의존해서는 안 됩니다.")}</p>
      <p>{koNode("본 플랫폼은 본 플랫폼의 콘텐츠 사용으로 인해 발생하는 모든 결과(의사 결정 오류, 심리적 영향, 관계 변화 등을 포함하되 이에 국한되지 않음)에 대해 법적 책임을 지지 않습니다.")}</p>

      <h2 style={{ fontSize: 18, marginTop: 32, marginBottom: 12 }}>{koNode("5. 서비스 변경 및 종료")}</h2>
      <p>{koNode("본 플랫폼은 언제든지 일부 또는 모든 서비스를 조정, 일시 중지 또는 종료할 수 있는 권리를 보유합니다. 주요 변경사항은 홈페이지 공지사항이나 이메일을 통해 이용자에게 공지됩니다.")}</p>

      <h2 style={{ fontSize: 18, marginTop: 32, marginBottom: 12 }}>{koNode("6. 준거법 및 분쟁해결")}</h2>
      <p>{koNode("본 약관은 중화인민공화국 법률의 적용을 받습니다. 분쟁이 발생하면 양 당사자는 우호적으로 협상해야 합니다. 협상이 실패할 경우 플랫폼 운영자 소재지를 관할하는 인민법원에 제출하여 해결해야 합니다.")}</p>

      <h2 style={{ fontSize: 18, marginTop: 32, marginBottom: 12 }}>{koNode("7. 연락처 정보")}</h2>
      <p>{koNode("질문이 있는 경우 본 플랫폼에 게시된 WeChat/이메일 고객 서비스에 문의하세요.")}</p>

        <p style={{ marginTop: 48, fontSize: 12, color: 'var(--tx-3)' }}>
          <a href="/privacy" style={{ color: 'var(--ac)' }}>{koNode("개인정보 처리방침")}</a> · <a href="/" style={{ color: 'var(--ac)' }}>{koNode("돌아가기홈 페이지")}</a>
        </p>
      </main>
    </>
  );
}
