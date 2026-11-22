'use client';
import { ko, koNode } from '@/lib/i18n/ko';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ZiweiChart, Palace } from '@/lib/ziwei/types';
import type { TimeView } from './TimeNav';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  hidden?: boolean; // don't show user bubble for auto/topic messages
}

interface SelectedSiHua {
  starName: string;
  siHua: string;
  view: TimeView;
}

interface InsightPanelProps {
  chart: ZiweiChart;
  selectedPalace?: Palace | null;
  selectedSiHua?: SelectedSiHua | null;
}

const TOPICS = [
  { key: 'overview',     label: "운명" },
  { key: 'love',        label: "감정" },
  { key: 'career',      label: "경력" },
  { key: 'wealth',      label: "행운" },
  { key: 'health',      label: "건강" },
  { key: 'personality', label: "성격" },
] as const;

const TOPIC_PROMPTS: Record<string, string> = {
  overview: "라이프 차트 개요를 생성하고 다음 구조에 따라 출력하십시오.\n\n**【운명】**\n이 명반의 핵심 격국 및 명주 기질을 한 문장으로 요약합니다.\n\n**【주성 해석】**\n명궁주성의 핵심 특징은 니하이샤의 원래 말이나 의견을 인용한 것입니다.\n\n**【삼방사정】**\n부, 관료, 이주 3가구의 연계 분석 및 전반적인 격국.\n\n**【현재 대한】**\n대한의 현재 운세 방향과 가장 주목되는 사항입니다.\n\n**【장점 및 주의사항】**\n명반의 타고난 장점뿐만 아니라 주의해야 할 위험이나 숙제도 있습니다.",

  love: "당신의 연애운과 결혼운을 심층적으로 분석하여 다음의 구조에 따라 출력하시기 바랍니다.\n\n**【이모션 격국】**\n한 문장이 감정의 운명을 결정한다.\n\n**【부처궁 분석】**\n부처궁주성, 사화 및 니하이샤 시스템에 대한 자세한 해석.\n\n**【3자간 연계】**\n관련 주택이 관계에 미치는 영향.\n\n**【현재 대한 감성운】**\n최근 10년간의 감성트렌드와 핵심노드.\n\n**【실용적인 제안】**\n구체적이고 실행 가능한 관계 조언.",

  career: "귀하의 진로운을 심층적으로 분석하여 다음 구조에 따라 산출하시기 바랍니다.\n\n**【경력 격국】**\n한 문장이 취업에 적합한지 창업에 적합한지 진로의 운명을 결정짓는다.\n\n**【관록궁 분석】**\n관록궁주성, 사화 및 니하이샤 선생은 이 구성을 판단합니다.\n\n**【재백궁 연계】**\n부와 직업의 관계, 부의 원천 분석.\n\n**【현재 대한 경력 운세】**\n현재 10년간의 진로방향.\n\n**【실용적인 제안】**\n적합한 방향, 산업 및 전략.",

  wealth: "재물운을 심층적으로 분석하여 다음 구조에 따라 출력하시기 바랍니다.\n\n**【부 격국】**\n한 문장으로 당신의 재정적 행운 모델이 능동적 부인지, 소극적 부인지를 특징지을 수 있습니다.\n\n**【재백궁 분석】**\n재백궁주성, 사화, 부의 원천과 흐름 패턴.\n\n**[전택궁(재무부)]**\n저축능력과 부동산운세를 분석합니다.\n\n**【현재 대한 운세】**\n현재 금융 동향과 주의할 점.\n\n**[재정적 조언]**\n구체적인 재정 조언.",

  health: "자신의 건강운세를 분석하여 다음 구조에 따라 출력해 보세요.\n\n**【질액궁주성】**\n질액궁 별과 건강의 의미.\n\n**[주요 리스크]**\n니하이샤 자오선 흐름 이론과 결합하여 주요 건강 위험과 주의가 필요한 영역을 분석합니다.\n\n**【대한 건강 트렌드】**\n현재 건강 동향 및 주요 기간.\n\n**【예방 제안】**\n구체적인 예방 조치 및 건강 지침.",

  personality: "성격 특성을 심층적으로 분석하여 다음 구조에 따라 출력해 보세요.\n\n**【명궁주성캐릭터】**\n명궁주성의 핵심 캐릭터 특성은 니하이샤 선생의 원래 단어에서 인용되었습니다.\n\n**[삼자 성격 종합]**\n부, 관료, 재배치의 세 집이 성격에 미치는 영향을 전체적으로 보여줍니다.\n\n**【대인관계 모델】**\n다른 사람과 상호 작용하는 방식과 다른 사람을 대하는 방식.\n\n**【강점 및 생활 문제】**\n자연의 장점과 직면해야 할 인생 교훈.",
};

const PALACE_ROLES: Record<string, string> = {
  '命宫':   "자아, 성격, 타고난성격국",
  '兄弟宫': '兄弟关系、合伙人',
  '夫妻宫': "관계, 결혼 여부",
  '子女宫': "자녀운명, 종속관계",
  '财帛宫': "부의 원천과 소득 방법",
  '疾厄宫': '身体健康、意外',
  '迁移宫': "외출의 기회와 인간관계 격국",
  '交友宫': "친구들, 고귀한 사람들, 악당들의 모임",
  '官禄宫': "경력, 사회적 지위",
  '田宅宫': '不动产、家庭环境',
  '福德宫': "영적인 즐거움, 내면의 행복",
  '父母宫': "부모 관계, 문서 계약",
};

/** Render AI markdown: **【Title】** → gold header, **bold** → strong */
function AiContent({ text, streaming }: { text: string; streaming?: boolean }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-0.5">
      {koNode(lines.map((line, i) => {
        const sectionMatch = line.match(/^\*\*【(.+?)】\*\*$/);
        if (sectionMatch) {
          return (
            <div key={i} className="pt-3 pb-0.5 first:pt-0">
              <span className="text-[11px] font-semibold tracking-wide" style={{ color: 'var(--t-gold)' }}>
                【{koNode(sectionMatch[1])}】
              </span>
            </div>
          );
        }
        if (line.trim() === '') return <div key={i} className="h-1" />;
        const parts = line.split(/\*\*(.+?)\*\*/);
        return (
          <div key={i} className="text-[11px] leading-relaxed" style={{ color: 'var(--t-text2)' }}>
            {koNode(parts.map((part, j) =>
              j % 2 === 0
                ? part
                : <strong key={j} className="font-medium" style={{ color: 'var(--t-text)' }}>{koNode(part)}</strong>
            ))}
          </div>
        );
      }))}
      {koNode(streaming && (
        <span
          className="inline-block w-1.5 h-3 ml-0.5 animate-pulse rounded-sm align-middle"
          style={{ background: 'var(--t-gold)', opacity: 0.6 }}
        />
      ))}
    </div>
  );
}

export default function InsightPanel({ chart, selectedPalace, selectedSiHua }: InsightPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTopic, setActiveTopic] = useState<string>('overview');
  const messagesRef = useRef<Message[]>([]); // always-current copy for closures
  const loadingRef = useRef(false);
  const autoLoaded = useRef(false);
  const lastPalaceBranch = useRef<number | undefined>(undefined);
  const lastSiHuaKey = useRef<string | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep refs in sync
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { loadingRef.current = loading; }, [loading]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 마운트 시 별자리 개요 자동 생성
  useEffect(() => {
    if (autoLoaded.current) return;
    autoLoaded.current = true;
    sendMessage(TOPIC_PROMPTS.overview, true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Inject palace analysis when palace selected
  useEffect(() => {
    if (!selectedPalace || selectedPalace.branch === lastPalaceBranch.current) return;
    lastPalaceBranch.current = selectedPalace.branch;

    const majorStars = selectedPalace.stars.filter(s => s.type === 'major');
    const starDesc = majorStars.length > 0
      ? majorStars.map(s => `${s.name}${s.siHua ? '化' + s.siHua : ''}`).join('、')
      : '空宫（借对宫）';
    const role = PALACE_ROLES[selectedPalace.name] ?? '';

    const prompt = `분석에 집중해주세요【${selectedPalace.name}](감독자:${role}), 궁 주성은${starDesc}, 다음 구조에 따라 출력됩니다.

**【질적인 궁궐의 지위】**${selectedPalace.name}명반의 의미와 이 별 구성에 대한 전반적인 판단입니다.

**【주성 해석】**
특정 견해를 인용하여 이 궁에 있는 주성의 니하이샤 시스템을 해석합니다.

**【삼방사정 연계】**
삼방사정 궁 위치가 이 궁에 미치는 영향.

**【실용적인 제안】**
이 집을 기반으로 한 특정 권장 사항.`;

    sendMessage(prompt, true);
  }, [selectedPalace]); // eslint-disable-line react-hooks/exhaustive-deps

  // 사화 비행 분석 주입
  useEffect(() => {
    if (!selectedSiHua) return;
    const key = `${selectedSiHua.starName}-${selectedSiHua.siHua}-${selectedSiHua.view}`;
    if (key === lastSiHuaKey.current) return;
    lastSiHuaKey.current = key;

    // 별이 있는 집을 찾아보세요
    const palaceOfStar = chart.palaces.find(p =>
      p.stars.some(s => s.name === selectedSiHua.starName)
    );
    const palaceName = palaceOfStar?.name ?? '未知宫位';
    const viewLabel = selectedSiHua.view === 'daxian' ? '大限' : '流年';

    const prompt = `분석해 주세요【${viewLabel}${selectedSiHua.starName}화${selectedSiHua.siHua}】비행 영향은 다음 구조에 따라 출력됩니다.

**【화${selectedSiHua.siHua}기본 의미】**
화${selectedSiHua.siHua}니하이샤 시스템의 핵심 의미와${selectedSiHua.starName}화${selectedSiHua.siHua}특별한 의미.

**【궁궐이 무너지는 영향】**${selectedSiHua.starName}화${selectedSiHua.siHua}에 떨어진다【${palaceName}], 이 궁을 담당하는 지역은 어떻게 영향을 받고 니하이샤 선생을 해석하는 방법에 대해 설명합니다.

**【삼방사정 비행 경로】**
화${selectedSiHua.siHua}들어가다${palaceName}이후 삼방사정(대궁, 2개의 삼합 궁)에 대한 연계 영향이 있습니다.

**【현재운세의 영향】**
안으로${viewLabel}시간 차원에서 이 변환은${selectedSiHua.siHua}명주의 최근 재산에 대한 구체적인 영향.

**【실용적인 제안】**
이 사화를 기반으로 한 구체적인 실행 가능한 제안입니다.`;

    sendMessage(prompt, true);
  }, [selectedSiHua]); // eslint-disable-line react-hooks/exhaustive-deps

  const streamResponse = async (apiMessages: { role: 'user' | 'assistant'; content: string }[]) => {
    try {
      const res = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chart, messages: apiMessages }),
      });
      if (res.status === 404) throw new Error('api-missing');
      if (!res.ok) throw new Error('请求失败');
      if (!res.body) throw new Error('无响应流');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const delta = JSON.parse(data).delta?.text ?? '';
            assistantText += delta;
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: 'assistant', content: assistantText };
              return updated;
            });
          } catch { /* skip */ }
        }
      }
    } catch (e) {
      const missing = e instanceof Error && e.message === 'api-missing';
      setMessages(prev => [...prev, { role: 'assistant', content: missing ? "오픈소스 버전에는 AI 해석 인터페이스(/api/interpret)가 포함되어 있지 않습니다. 사용하기 전에 직접 구현해야 합니다. 자세한 내용은 README \"빠른 시작\"을 참조하세요. 배반 자체에는 API 키가 필요하지 않습니다." : "해석하지 못했습니다. 나중에 다시 시도해 주세요." }]);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const sendMessage = (text: string, hidden = false) => {
    if (!text.trim() || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    const userMsg: Message = { role: 'user', content: text, hidden };
    // Capture current messages synchronously via ref (avoids stale closure)
    const apiMessages = [...messagesRef.current, userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }));

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    streamResponse(apiMessages);
  };

  const handleTopicClick = (topicKey: string) => {
    if (loadingRef.current) return;
    setActiveTopic(topicKey);
    sendMessage(TOPIC_PROMPTS[topicKey], true);
  };

  const handleSend = () => {
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-[min(44rem,80dvh)] min-h-0 min-w-0 rounded-xl overflow-hidden card-glass">

      {/* ── Topic buttons ── */}
      <div className="flex-shrink-0 px-2 pt-2.5 pb-2" style={{ borderBottom: '1px solid var(--t-border)' }}>
        <div className="grid grid-cols-6 gap-1">
          {koNode(TOPICS.map(t => {
            const isActive = activeTopic === t.key;
            return (
              <button
                key={t.key}
                onClick={() => handleTopicClick(t.key)}
                disabled={loading}
                className="py-1.5 text-[10px] font-medium rounded-lg transition-all duration-150 disabled:opacity-40"
                style={{
                  background: isActive ? 'rgba(212,168,67,0.12)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(212,168,67,0.3)' : 'var(--t-border)'}`,
                  color: isActive ? 'var(--t-gold)' : 'var(--t-faint)',
                }}
              >
                {koNode(t.label)}
              </button>
            );
          }))}
        </div>
      </div>

      {/* ── Messages ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 min-h-0">

        {/* Loading state before first message */}
        {koNode(messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-3" style={{ color: 'var(--t-gold)', opacity: 0.1 }}>✦</div>
            <p className="text-[10px] animate-pulse" style={{ color: 'var(--t-faint)' }}>{koNode("운명 해석이 생성되고 있습니다 ...")}</p>
          </div>
        ))}

        <AnimatePresence initial={false}>
          {koNode(messages.map((msg, i) => {
            if (msg.role === 'user' && msg.hidden) return null;

            if (msg.role === 'user') {
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end"
                >
                  <div
                    className="max-w-[85%] rounded-xl px-3 py-2 text-[11px]"
                    style={{
                      background: 'rgba(212,168,67,0.08)',
                      border: '1px solid rgba(212,168,67,0.18)',
                      color: 'var(--t-gold)',
                    }}
                  >
                    {koNode(msg.content)}
                  </div>
                </motion.div>
              );
            }

            // Assistant message
            const isLastMsg = i === messages.length - 1;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div
                  className="text-[9px] tracking-widest mb-2 flex items-center gap-1.5"
                  style={{ color: 'var(--t-faint)' }}
                >
                  <span style={{ color: 'var(--t-gold)', opacity: 0.4 }}>✦</span>{koNode("명리학 읽기")}</div>
                <AiContent text={msg.content} streaming={loading && isLastMsg} />
              </motion.div>
            );
          }))}
        </AnimatePresence>
      </div>

      {/* ── Input ── */}
      <div className="flex-shrink-0 px-3 pb-3 pt-2" style={{ borderTop: '1px solid var(--t-border)' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={ko("올해 이직하는 것이 적합한가? 등의 질문을 계속하십시오.")}
            disabled={loading}
            className="flex-1 rounded-lg px-3 py-2 text-[11px] focus:outline-none transition-colors"
            style={{
              background: 'var(--t-card)',
              border: '1px solid var(--t-border)',
              color: 'var(--t-text)',
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-3 py-2 rounded-lg text-[11px] font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(212,168,67,0.15)',
              border: '1px solid rgba(212,168,67,0.25)',
              color: 'var(--t-gold)',
            }}
          >
            {koNode(loading ? '…' : '追问')}
          </button>
        </div>
      </div>

    </div>
  );
}
