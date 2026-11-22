'use client';
import { ko, koNode } from '@/lib/i18n/ko';
import { useState } from 'react';
import BirthForm from '@/components/BirthForm';
import ChartBoard from '@/components/ChartBoard';
import InsightPanel from '@/components/InsightPanel';
import { generateChart } from '@/lib/ziwei/algorithm';
import type { BirthInfo, ZiweiChart, Palace } from '@/lib/ziwei/types';

/* *
 * 명반 페이지 - 오픈 소스 버전 "배반 엔진 데모"
 *
 * 실행 가능한 최소 예시입니다. 기본 UI와 일치하도록 이 웨어하우스의 배반 엔진 generateChart()를 사용하세요.
 * 구성 요소는 완전한 자미두수 명반 + 기본 해석을 렌더링하고 본명 / 대한 / 유년 전환을 지원합니다.
 *
 * 설명: 온라인 비즈니스 버전의 완전한 대화형 인터페이스(재설계된 새로운 UI, AI 스트리밍 해석, 조합, 공유)
 * 카드 등)은 오픈소스의 범위에 속하지 않습니다. 하지만 배반 코어 - Anxing 알고리즘, 사화, 격국 인식, 고대 도서 라이브러리 -
 * 완전 개방형(lib/ziwei/* 참조)으로 자신만의 인터페이스를 자유롭게 개발할 수 있습니다. */
export default function ChartPage() {
  const [chart, setChart] = useState<ZiweiChart | null>(null);
  const [selectedPalace, setSelectedPalace] = useState<Palace | null>(null);

  // ── 아직 시작하지 않음: 출생 정보 양식 표시 ──
  if (!chart) {
    return (
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{koNode("자미두수 명반 만들기")}</h1>
        <p style={{ color: '#888', marginBottom: 32, fontSize: 14, lineHeight: 1.7 }}>{koNode("생년월일과 태어난 시각을 입력하면 명반을 생성합니다.")}<br />{koNode("(이 페이지는 엔진 데모입니다. 전체 상용 버전 인터페이스는 오픈 소스 범위 내에 있지 않습니다. 배반 커널은 완전히 열려 있습니다.)")}</p>
        <BirthForm onSubmit={(info: BirthInfo) => setChart(generateChart(info))} />
      </main>
    );
  }

  // ── 상장: 명반 + 해석 ──
  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px' }}>
      <button
        type="button"
        onClick={() => { setChart(null); setSelectedPalace(null); }}
        style={{
          marginBottom: 16, padding: '6px 14px', cursor: 'pointer',
          border: '1px solid #ccc', borderRadius: 8, background: 'transparent',
        }}
      >{koNode("← 다시 시작")}</button>

      <div
        className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]"
        style={{
          gap: 20, marginTop: 16, alignItems: 'start',
        }}
      >
        <ChartBoard chart={chart} onPalaceSelect={setSelectedPalace} />
        <InsightPanel chart={chart} selectedPalace={selectedPalace} />
      </div>
    </main>
  );
}
