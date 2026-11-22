import { ko, koNode } from '@/lib/i18n/ko';
export const metadata = { title: "개인정보 처리방침 · 자미두수 명반", description: "자미두수 명반개인정보 처리방침" };

export default function PrivacyPage() {
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
        <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>{koNode("개인정보 처리방침")}</h1>
        <p style={{ fontSize: 12, color: 'var(--tx-3)', marginBottom: 32 }}>{koNode("최종 업데이트 날짜: 2026년 4월")}</p>

      <h2 style={{ fontSize: 18, marginTop: 32, marginBottom: 12 }}>{koNode("1. 당사가 수집하는 정보")}</h2>
      <p>{koNode("자미두수 명반배반 및 통역 서비스를 제공하기 위해 당사는 다음 정보를 수집할 수 있습니다.")}</p>
      <ul style={{ paddingLeft: 24 }}>
        <li><strong>{koNode("명반 필수 정보")}</strong>{koNode(": 이름 (선택), 출생 양력 년, 월, 일, 출생 시진, 성별, 출생지 경도")}</li>
        <li><strong>{koNode("계정 정보(등록 후)")}</strong>{koNode(":휴대전화번호(SMS인증 및 회원서비스에 사용)")}</li>
        <li><strong>{koNode("대화형 정보")}</strong>{koNode(": 사이트의 클릭, 탐색 및 명반 기록")}</li>
        <li><strong>{koNode("피드백 정보")}</strong>{koNode(": 통역 내용에 대한 귀하의 \"정확/부정확\" 평가 및 텍스트 피드백")}</li>
        <li><strong>{koNode("결제정보")}</strong>{koNode(": 멤버십 구매 또는 개별 서비스 구매 시 제3자 결제(Alipay/WeChat Pay)를 통해 처리됩니다. 이 플랫폼은 전체 카드 번호나 비밀번호를 저장하지 않습니다.")}</li>
      </ul>

      <h2 style={{ fontSize: 18, marginTop: 32, marginBottom: 12 }}>{koNode("2. 당사가 정보를 사용하는 방법")}</h2>
      <ul style={{ paddingLeft: 24 }}>
        <li>{koNode("명반 정보는 이 해석과 귀하의 계정에 있는 과거 명반 레코드에만 사용됩니다.")}</li>
        <li>{koNode("휴대폰번호는 회원가입, 로그인, 주문알림 등에 사용됩니다.")}</li>
        <li>{koNode("피드백 정보는 명리학 콘텐츠의 품질을 지속적으로 개선하는 데 사용됩니다(감감도 감소 후 집계 분석).")}</li>
        <li>{koNode("집계된 데이터는 산업 연구 및 플랫폼 최적화에 사용될 수 있습니다.")}</li>
      </ul>

      <h2 style={{ fontSize: 18, marginTop: 32, marginBottom: 12 }}>{koNode("3. 제3자와의 정보 공유")}</h2>
      <p>{koNode("당사는 다음과 같은 경우를 제외하고 귀하의 개인정보를 제3자와 공유하지 않습니다.")}</p>
      <ul style={{ paddingLeft: 24 }}>
        <li>{koNode("결제 서비스 제공업체(Alipay/WeChat Pay): 주문 정산 처리")}</li>
        <li>{koNode("SMS 서비스 제공업체(예: Alibaba Cloud SMS): 인증 코드 전송")}</li>
        <li>{koNode("클라우드 서비스 제공자(예: Vercel/Cloudflare/Alibaba Cloud): 기술 사업자")}</li>
        <li>{koNode("AI 통역 서비스(예: Anthropic Claude): \"무료 질문\" 대화를 처리합니다(익명화)")}</li>
        <li>{koNode("법률 및 규정에 따른 사법 당국 또는 정부 부서의 법적 요구 사항")}</li>
      </ul>

      <h2 style={{ fontSize: 18, marginTop: 32, marginBottom: 12 }}>{koNode("4. 정보보안")}</h2>
      <p>{koNode("당사는 귀하의 정보를 보호하기 위해 업계에서 공통적인 기술 및 관리 방법(HTTPS 전송 암호화, 데이터베이스 암호화 저장, 접근 권한 제어 등)을 채택합니다. 그러나 인터넷을 통한 전송은 100% 안전하다고 보장할 수 없습니다.")}</p>

      <h2 style={{ fontSize: 18, marginTop: 32, marginBottom: 12 }}>{koNode("5. 귀하의 권리")}</h2>
      <ul style={{ paddingLeft: 24 }}>
        <li><strong>{koNode("쿼리")}</strong>{koNode(": 계정 센터를 통해 모든 과거 명반 및 주문을 볼 수 있습니다.")}</li>
        <li><strong>{koNode("삭제")}</strong>{koNode(": 계정에서 지정된 명반을 삭제하려면 고객 서비스에 문의하십시오. / 계정을 취소하십시오.")}</li>
        <li><strong>{koNode("수출")}</strong>{koNode(": 모든 개인정보 내보내기를 신청할 수 있습니다.")}</li>
      </ul>

      <h2 style={{ fontSize: 18, marginTop: 32, marginBottom: 12 }}>{koNode("6. 쿠키 및 로컬 저장소")}</h2>
      <p>{koNode("이 사이트는 쿠키/localStorage를 사용하여 어두운/밝은 테마 기본 설정, 최근 명반 기록 및 회원 로그인 상태를 저장합니다. 브라우저 설정에서 닫기를 사용할 수 있지만 일부 기능이 영향을 받을 수 있습니다.")}</p>

      <h2 style={{ fontSize: 18, marginTop: 32, marginBottom: 12 }}>{koNode("7. 미성년자")}</h2>
      <p>{koNode("본 플랫폼의 명리학 콘텐츠는 18세 이상의 성인 사용자를 대상으로 합니다. 미성년자는 보호자의 동의 하에 사용하시기 바라며, 인생의 중요한 결정에 해석을 사용할 수 없습니다.")}</p>

      <h2 style={{ fontSize: 18, marginTop: 32, marginBottom: 12 }}>{koNode("8. 정책 변경")}</h2>
      <p>{koNode("본 정책은 수시로 업데이트될 수 있습니다. 주요 변경사항은 눈에 띄게 공지됩니다. 계속 사용하면 업데이트된 버전에 동의하는 것으로 간주됩니다.")}</p>

        <p style={{ marginTop: 48, fontSize: 12, color: 'var(--tx-3)' }}>
          <a href="/terms" style={{ color: 'var(--ac)' }}>{koNode("이용약관")}</a> · <a href="/" style={{ color: 'var(--ac)' }}>{koNode("돌아가기홈 페이지")}</a>
        </p>
      </main>
    </>
  );
}
