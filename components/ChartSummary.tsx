'use client';
import { ko, koNode } from '@/lib/i18n/ko';
import { motion } from 'framer-motion';
import type { ZiweiChart } from '@/lib/ziwei/types';
import { BRANCHES, STEMS } from '@/lib/ziwei/constants';
import { detectPatterns, getMingGongSummary } from '@/lib/ziwei/patterns';

interface ChartSummaryProps {
  chart: ZiweiChart;
}

const PatternLevelStyle = {
  excellent: { dot: 'bg-amber-400', label: 'text-amber-500', badge: 'text-amber-500 bg-amber-500/10 border-amber-500/25' },
  good: { dot: 'bg-sky-400', label: 'text-sky-500', badge: 'text-sky-500 bg-sky-500/10 border-sky-500/25' },
  neutral: { dot: 'bg-slate-400', label: 'text-slate-400', badge: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
  caution: { dot: 'bg-orange-500', label: 'text-orange-500', badge: 'text-orange-500 bg-orange-500/10 border-orange-500/25' },
};

export default function ChartSummary({ chart }: ChartSummaryProps) {
  const patterns = detectPatterns(chart);
  const { stars: mingStars, keywords, nature } = getMingGongSummary(chart);
  const currentDx = chart.daXians[chart.currentDaXianIndex];

  const siHuaSummary: { name: string; siHua: string; palaceName: string }[] = [];
  for (const palace of chart.palaces) {
    for (const star of palace.stars) {
      if (star.siHua) {
        siHuaSummary.push({ name: star.name, siHua: star.siHua, palaceName: palace.name });
      }
    }
  }
  const siHuaOrder = ['禄', '权', '科', '忌'];
  siHuaSummary.sort((a, b) => siHuaOrder.indexOf(a.siHua) - siHuaOrder.indexOf(b.siHua));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="space-y-4"
    >
      {/* ── 命格总览 ── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
      >
      <div className="card-glass rounded-xl p-5">
        <div className="text-[10px] tracking-widest mb-4 flex items-center gap-2" style={{ color: 'var(--t-faint)' }}>
          <span style={{ color: 'var(--t-gold)', opacity: 0.6 }}>✦</span>{koNode("운명의 개요")}</div>

        <div className="flex flex-wrap items-start gap-4">
          <div>
            <div className="text-[9px] mb-1.5" style={{ color: 'var(--t-faint)', opacity: 0.85 }}>{koNode("명궁주성")}</div>
            <div className="flex items-center gap-1">
              {koNode(mingStars.length > 0 ? (
                mingStars.map(s => (
                  <span key={s} className="font-bold text-lg" style={{ color: 'var(--t-gold)' }}>{koNode(s)}</span>
                ))
              ) : (
                <span className="text-sm" style={{ color: 'var(--t-faint)' }}>{koNode("공궁")}</span>
              ))}
            </div>
            {koNode(nature && (
              <div className="text-[10px] mt-1" style={{ color: 'var(--t-gold)', opacity: 0.5 }}>{koNode(nature)}</div>
            ))}
          </div>

          {koNode(keywords.length > 0 && (
            <div>
              <div className="text-[9px] mb-1.5" style={{ color: 'var(--t-faint)', opacity: 0.85 }}>{koNode("성격 특성")}</div>
              <div className="flex flex-wrap gap-1.5">
                {koNode(keywords.map(k => (
                  <span key={k} className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{
                      color: 'var(--t-gold)',
                      background: 'rgba(212,168,67,0.08)',
                      border: '1px solid rgba(212,168,67,0.15)',
                    }}>
                    {koNode(k)}
                  </span>
                )))}
              </div>
            </div>
          ))}

          <div className="ml-auto text-right">
            <div className="text-[9px] mb-1" style={{ color: 'var(--t-faint)', opacity: 0.85 }}>{koNode("오행국 · 현재 대한")}</div>
            <div className="text-[11px]" style={{ color: 'var(--t-text2)' }}>{koNode(chart.wuxingJuName)}</div>
            {koNode(currentDx && (
              <div className="text-[11px] text-purple-500 mt-0.5">
                {koNode(currentDx.startAge)}~{koNode(currentDx.endAge)}{koNode("년 ·")}{koNode(currentDx.palaceName)}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px]"
          style={{ borderTop: '1px solid var(--t-border)', color: 'var(--t-faint)' }}>
          <span>{koNode("양력")}{koNode(chart.birthInfo.year)}-{koNode(chart.birthInfo.month)}-{koNode(chart.birthInfo.day)}</span>
          <span>{koNode("음력")}{koNode(chart.lunarInfo.lunarYear)}{koNode("년")}{koNode(chart.lunarInfo.isLeapMonth ? '闰' : '')}
            {koNode(chart.lunarInfo.lunarMonth)}{koNode("월")}{koNode(chart.lunarInfo.lunarDay)}{koNode("일")}</span>
          <span>{koNode(STEMS[chart.lunarInfo.yearStem])}{koNode(BRANCHES[chart.lunarInfo.yearBranch])}{koNode("연도 ·")}{koNode(BRANCHES[chart.birthInfo.hour])}{koNode("시")}</span>
          <span>{koNode("명궁")}{koNode(BRANCHES[chart.mingGongBranch])}{koNode("·신궁")}{koNode(BRANCHES[chart.shenGongBranch])}</span>
        </div>
      </div>
      </motion.div>

      {/* ── 本命四化 ── */}
      {koNode(siHuaSummary.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
        <div className="card-glass rounded-xl p-4">
          <div className="text-[10px] tracking-widest mb-3 flex items-center gap-2" style={{ color: 'var(--t-faint)' }}>
            <span style={{ color: 'var(--t-gold)', opacity: 0.6 }}>◆</span>{koNode("본명사화")}</div>
          <div className="grid grid-cols-2 gap-2">
            {koNode(siHuaSummary.map(({ name, siHua, palaceName }) => {
              const colors: Record<string, { text: string; bg: string; border: string }> = {
                '禄': { text: '#4ade80', bg: 'rgba(74,222,128,0.06)', border: 'rgba(74,222,128,0.2)' },
                '权': { text: '#60a5fa', bg: 'rgba(96,165,250,0.06)', border: 'rgba(96,165,250,0.2)' },
                '科': { text: '#facc15', bg: 'rgba(250,204,21,0.06)', border: 'rgba(250,204,21,0.2)' },
                '忌': { text: '#f87171', bg: 'rgba(248,113,113,0.06)', border: 'rgba(248,113,113,0.2)' },
              };
              const c = colors[siHua] || colors['禄'];
              return (
                <div key={name + siHua}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-[10px]"
                  style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}
                >
                  <span className="font-medium">{koNode(name)}</span>
                  <div className="flex items-center gap-1.5 text-right">
                    <span style={{ opacity: 0.6 }} className="text-[9px]">{koNode(palaceName.replace('宫', ''))}</span>
                    <span className="font-bold">{koNode("화")}{koNode(siHua)}</span>
                  </div>
                </div>
              );
            }))}
          </div>
        </div>
        </motion.div>
      ))}

      {/* ── 格局识别 ── */}
      {koNode(patterns.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.72, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
        <div className="card-glass rounded-xl p-4">
          <div className="text-[10px] tracking-widest mb-3 flex items-center gap-2" style={{ color: 'var(--t-faint)' }}>
            <span style={{ color: 'var(--t-gold)', opacity: 0.6 }}>◉</span>{koNode("격국 식별")}<span className="text-[9px] ml-auto" style={{ color: 'var(--t-faint)', opacity: 0.75 }}>{koNode(patterns.length)}{koNode("격국")}</span>
          </div>
          <div className="space-y-2">
            {koNode(patterns.map((p, i) => {
              const st = PatternLevelStyle[p.level];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.08 }}
                  className="card-inner rounded-lg p-3"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${st.dot}`} />
                    <span className={`text-[11px] font-medium ${st.label}`}>{koNode(p.name)}</span>
                    <div className="flex gap-1 ml-auto">
                      {koNode(p.palaces.slice(0, 2).map(pa => (
                        <span key={pa} className={`text-[8px] px-1.5 py-px rounded-full border ${st.badge}`}>
                          {koNode(pa.replace('宫', ''))}
                        </span>
                      )))}
                    </div>
                  </div>
                  <p className="text-[10px] leading-relaxed pl-3.5" style={{ color: 'var(--t-text2)' }}>
                    {koNode(p.description)}
                  </p>

                  {koNode(p.conditions && (
                    <div className="mt-2 pl-3.5 space-y-0.5">
                      {koNode(p.conditions.required.length > 0 && (
                        <div className="text-[9px] leading-relaxed" style={{ color: 'var(--t-text2)', opacity: 0.85 }}>
                          <span className="font-medium" style={{ color: 'var(--t-gold)' }}>{koNode("필수")}</span>
                          <span style={{ opacity: 0.6 }}> · </span>
                          {koNode(p.conditions.required.join('、'))}
                        </div>
                      ))}
                      {koNode(p.conditions.bonus && p.conditions.bonus.length > 0 && (
                        <div className="text-[9px] leading-relaxed" style={{ color: 'var(--t-text2)', opacity: 0.85 }}>
                          <span className="font-medium text-emerald-500">{koNode("추가 포인트")}</span>
                          <span style={{ opacity: 0.6 }}> · </span>
                          {koNode(p.conditions.bonus.join('、'))}
                        </div>
                      ))}
                      {koNode(p.conditions.breaking && p.conditions.breaking.length > 0 && (
                        <div className="text-[9px] leading-relaxed" style={{ color: 'var(--t-text2)', opacity: 0.85 }}>
                          <span className="font-medium text-orange-500">{koNode("규칙을 어기다")}</span>
                          <span style={{ opacity: 0.6 }}> · </span>
                          {koNode(p.conditions.breaking.join('、'))}
                        </div>
                      ))}
                    </div>
                  ))}

                  {koNode(p.source && (
                    <div className="text-[9px] mt-1.5 pl-3.5" style={{ color: 'var(--t-faint)', opacity: 0.5 }}>{koNode("출처 ·")}{koNode(p.source)}
                    </div>
                  ))}
                </motion.div>
              );
            }))}
          </div>
        </div>
        </motion.div>
      ))}

      {/* ── 大限运程 ── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.88, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
      <div className="card-glass rounded-xl p-4">
        <div className="text-[10px] tracking-widest mb-3 flex items-center gap-2" style={{ color: 'var(--t-faint)' }}>
          <span className="text-purple-500/60">◎</span>{koNode("대한 행운")}</div>
        <div className="grid grid-cols-3 gap-2">
          {koNode(chart.daXians.slice(0, 9).map((dx, i) => {
            const isCurrent = i === chart.currentDaXianIndex;
            return (
              <div
                key={i}
                className="text-[10px] px-2 py-2 rounded-lg text-center transition-colors"
                style={{
                  border: isCurrent
                    ? '1px solid rgba(147,51,234,0.4)'
                    : '1px solid var(--t-border)',
                  background: isCurrent ? 'rgba(147,51,234,0.08)' : 'transparent',
                  color: isCurrent ? '#a78bfa' : 'var(--t-faint)',
                }}
              >
                <div className="font-mono tabular-nums">{koNode(dx.startAge)}~{koNode(dx.endAge)}</div>
                <div className="text-[9px] mt-0.5" style={{ opacity: 0.7 }}>{koNode(dx.palaceName.replace('宫', ''))}</div>
              </div>
            );
          }))}
        </div>
      </div>
      </motion.div>
    </motion.div>
  );
}
