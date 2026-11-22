'use client';
import { ko, koNode } from '@/lib/i18n/ko';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 공지사항 버전 번호 - 나중에 새로운 공지사항을 재생하려면 여기에서 변경하면 됩니다. (이전 버전 키는 유효하지 않으며 새 버전이 다시 재생됩니다.)
const ANNOUNCEMENT_VERSION = '2026-05-01';
const STORAGE_KEY = `announcement_seen_${ANNOUNCEMENT_VERSION}`;

export default function AnnouncementModal() {
  // 기본적으로 비활성화되어 있는 클라이언트 측 useEffect는 localStorage를 확인하고 즉시 팝업 여부를 결정합니다.
  // 아직 보지 못했다면 → 즉시 홈페이지를 덮으세요. 본 적이 있다면 → 다시 재생하지 마세요.
  const [open, setOpen] = useState(false);
  const [decided, setDecided] = useState(false); // 수분 공급 완료 플래그

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) setOpen(true);
    } catch { /* localStorage 可能被禁，忽略 */ }
    setDecided(true);
  }, []);

  // 공지사항이 열릴 때 본문 스크롤을 잠그면 공지사항 뒤의 홈 페이지가 스크롤되지 않도록 방지됩니다(의례적인 느낌이 더 강함).
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  const close = () => {
    setOpen(false);
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* skip */ }
  };

  if (!decided) return null;

  return (
    <AnimatePresence>
      {koNode(open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          // 외부 닫기를 클릭하지 않음 - 사용자가 홈페이지에 들어가려면 "I Got It" 버튼을 눌러야 함
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(20,12,2,0.88)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
          }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(180deg, #fefcf6 0%, #faf3e3 100%)',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '640px',
              maxHeight: 'min(85vh, 760px)',
              overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(60,30,10,0.4), 0 4px 16px rgba(60,30,10,0.2)',
              border: '1px solid rgba(184,146,42,0.25)',
              display: 'flex',
              flexDirection: 'column',
              fontFamily: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
            }}
          >
            {/* 顶部装饰 + 关闭按钮 */}
            <div style={{
              padding: '22px 28px 14px',
              borderBottom: '1px solid rgba(184,146,42,0.15)',
              background: 'linear-gradient(180deg, rgba(184,146,42,0.08) 0%, transparent 100%)',
              flexShrink: 0,
              position: 'relative',
            }}>
              <div style={{ fontSize: '10px', letterSpacing: '0.4em', color: '#b8922a', opacity: 0.7, marginBottom: '6px' }}>
                A LETTER TO USERS
              </div>
              <h2 style={{ fontSize: '19px', fontWeight: 700, color: '#3d2f10', letterSpacing: '0.08em', margin: 0 }}>{koNode("본 플랫폼을 이용하시는 여러분께")}</h2>
              <button
                onClick={close}
                aria-label={ko("닫기")}
                style={{
                  position: 'absolute', top: '14px', right: '16px',
                  width: '28px', height: '28px',
                  background: 'rgba(184,146,42,0.08)',
                  border: '1px solid rgba(184,146,42,0.2)',
                  borderRadius: '50%',
                  color: '#7a5e2a', fontSize: '14px',
                  cursor: 'pointer', lineHeight: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >×</button>
            </div>

            {/* 限时免费 banner（最关键信息，置顶强调）*/}
            <div style={{
              margin: '14px 22px 0',
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #fff5e3 0%, #ffe1c0 100%)',
              border: '1.5px dashed rgba(232,132,62,0.5)',
              borderRadius: '12px',
              flexShrink: 0,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '10px', letterSpacing: '0.3em', color: '#c45a2d', marginBottom: '4px', fontWeight: 600 }}>{koNode("제한된 시간 · 제한된 시간 피드백")}</div>
              <div style={{ fontSize: '14px', color: '#8b3a1a', fontWeight: 600, lineHeight: 1.6 }}>
                <span style={{ fontSize: '16px', color: '#c45a2d', fontWeight: 700 }}>{koNode("5월 1일 - 5월 8일")}</span>
                <br />{koNode("플랫폼의 모든 기능 + AI 질문은 모두 무료이며 대중에게 공개됩니다.")}</div>
            </div>

            {/* 正文（可滚动）*/}
            <div style={{
              padding: '18px 28px 24px',
              overflowY: 'auto',
              fontSize: '14px',
              lineHeight: 1.85,
              color: '#5a4a30',
              flex: 1,
            }}>
              <p style={{ margin: '0 0 12px' }}>{koNode("솔직히 말해서 이렇게 엄청난 트래픽이 발생할 줄은 정말 예상하지 못했습니다.")}</p>
              <p style={{ margin: '0 0 12px' }}>{koNode("처음 이 플랫폼을 구축하기 시작했을 때 원래 의도는 실제로 매우 간단했습니다. AI 시대에는 원래 복잡하고 임계값이 높은 시스템인 니하이샤 선생을 더 간단하고 효율적이며 이해하기 쉽게 만들려고 노력했습니다.")}</p>
              <p style={{ margin: '0 0 12px' }}>{koNode("모든 사람이 이러한 내용을 접하기 전에 오랫동안 공부하고 많은 책을 읽어야 하는 것은 아닙니다. 우리는 이 플랫폼을 통해 모든 사람이 자신과 인생 단계, 선택한 방향에 대한 참고와 영감을 더 쉽게 얻을 수 있기를 바랍니다.")}</p>
              <p style={{
                margin: '0 0 12px',
                padding: '10px 14px',
                background: 'rgba(184,146,42,0.07)',
                borderLeft: '3px solid rgba(184,146,42,0.45)',
                borderRadius: '0 8px 8px 0',
                fontStyle: 'italic',
                color: '#7a5e2a',
              }}>{koNode("니하이샤 선생은 한때 다음과 같이 말했습니다. 사람들이 완전히 쓸모없는 것을 어떻게 발명할 수 있습니까?")}</p>
              <p style={{ margin: '0 0 12px' }}>{koNode("나는 항상 역경이 이와 같고 자미두수도 마찬가지라고 느꼈습니다. 그것들의 진정한 가치는 사람들이 어떤 결과에 갇히는 것이 아니라 우리 자신의 성격 관성, 삶의 문제 및 선택 방향을 더 일찍 볼 수 있게 해준다는 것입니다. 당신이 그것을 본 후에야 당신은 조정할 기회를 가질 수 있습니다. 그것을 이해한 후에야 더 나아질 수 있는 기회를 얻을 수 있습니다.")}</p>
              <p style={{ margin: '0 0 12px' }}>{koNode("\"당신이 지금 보고 있는 것은 실제로 당신의 운명의 일부이다\"라고 말하는 사람들에 대해서는 나는 너무 많은 언급을 하지 않겠습니다.")}</p>
              <p style={{ margin: '0 0 12px' }}>{koNode("지난 며칠 동안 Xiaohongshu가 내 계정을 압수했습니다.")}<strong style={{ color: '#c45a2d' }}>{koNode("5월 3일부터 정상 업데이트가 재개됩니다.")}</strong>
              </p>
              <p style={{ margin: '0 0 16px', color: '#3d2f10', fontWeight: 500 }}>{koNode("마지막으로, 모든 분들이 자신을 더 잘 이해하고, 자신을 더욱 사랑하며, 주변 사람들도 더욱 사랑할 수 있기를 진심으로 바랍니다.")}</p>
              <p style={{ margin: 0, textAlign: 'right', fontSize: '13px', color: '#7a5e2a' }}>{koNode("——모두들 감사합니다 🙏")}</p>
            </div>

            {/* 底部按钮 */}
            <div style={{
              padding: '14px 22px',
              borderTop: '1px solid rgba(184,146,42,0.15)',
              background: 'rgba(184,146,42,0.04)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              flexShrink: 0,
            }}>
              <button
                onClick={close}
                style={{
                  padding: '10px 24px',
                  background: 'linear-gradient(135deg, #b8922a 0%, #9a7a20 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  letterSpacing: '0.1em',
                  fontWeight: 500,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(184,146,42,0.3)',
                }}
              >{koNode("알아요")}</button>
            </div>
          </motion.div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
