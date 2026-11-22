'use client';

import { ko, koNode } from '@/lib/i18n/ko';
/* *
 * 고대 도서 라이브러리 검색 프레임 — 클라이언트 구성 요소
 *
 * 입력 → 실시간 검색 → 점프 /library/search?q=xxx */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function LibrarySearch() {
  const [q, setQ] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const submit = () => {
    const query = q.trim();
    if (!query) return;
    startTransition(() => {
      router.push(`/library/search?q=${encodeURIComponent(query)}`);
    });
  };

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      padding: '6px',
      background: 'var(--bg-card)',
      border: '1px solid rgba(184,146,42,0.3)',
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(184,146,42,0.08)',
    }}>
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        placeholder={ko("검색 고대 서적의 원문: 칠살 Chao Dou / Shuang Lu Chao Yuan / 화기")}
        style={{
          flex: 1,
          padding: '10px 14px',
          border: 'none',
          outline: 'none',
          fontSize: '14px',
          color: 'var(--tx-0)',
          background: 'transparent',
        }}
      />
      <button
        onClick={submit}
        disabled={isPending || !q.trim()}
        style={{
          padding: '10px 22px',
          borderRadius: '8px',
          border: 'none',
          background: 'linear-gradient(135deg, #d4a948 0%, #b8922a 100%)',
          color: 'white',
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '0.15em',
          cursor: q.trim() ? 'pointer' : 'not-allowed',
          opacity: q.trim() ? 1 : 0.5,
        }}
      >
        {koNode(isPending ? '…' : '搜索')}
      </button>
    </div>
  );
}
