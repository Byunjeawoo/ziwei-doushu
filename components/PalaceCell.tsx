'use client';
import { ko, koNode } from '@/lib/i18n/ko';
import { motion } from 'framer-motion';
import type { Palace, Star } from '@/lib/ziwei/types';
import { STEMS, BRANCHES } from '@/lib/ziwei/constants';
import clsx from 'clsx';

interface ShierShenDisplay {
  boshi: string;
  jiangQian: string;
  suiQian: string;
}

interface PalaceCellProps {
  palace: Palace;
  shierShen?: ShierShenDisplay;
  onClick?: () => void;
  onStarClick?: (star: Star) => void;
  isSelected?: boolean;
  isSanFang?: boolean;
  delay?: number;
  /* * 오버레이 사화: 별 이름 → 사화 유형('Lu'/'Quan'/'Ke'/'Ji') */
  overlayStarSiHua?: Record<string, string>;
  /* * 오버레이 라벨: '연도'(유년) 또는 '한정'(대한) */
  overlayLabel?: string;
  /* * 사화 배지 콜백을 오버레이하려면 클릭하세요. */
  onSiHuaClick?: (starName: string, siHua: string) => void;
}

const SIHUA_STYLES: Record<string, string> = {
  '禄': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  '权': 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  '科': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  '忌': 'text-red-400 bg-red-500/10 border-red-500/30',
};

const SiHuaBadge = ({
  siHua,
  overlay,
  label,
  onClick,
}: {
  siHua: string;
  overlay?: boolean;
  label?: string;
  onClick?: (e: React.MouseEvent) => void;
}) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center text-[8px] px-1 rounded-full border leading-none py-px font-bold ml-1 flex-shrink-0',
        SIHUA_STYLES[siHua],
        overlay && 'border-dashed opacity-80',
        onClick && 'cursor-pointer hover:opacity-100',
      )}
      onClick={onClick}
    >
      {koNode(overlay && label && <span className="mr-px opacity-70">{koNode(label)}</span>)}
      {koNode(siHua)}
    </span>
  );
};

export default function PalaceCell({
  palace, onClick, onStarClick, isSelected, isSanFang, delay = 0,
  overlayStarSiHua, overlayLabel, onSiHuaClick, shierShen,
}: PalaceCellProps) {
  const { branch, stem, name, stars, daXianAge, isCurrentDaXian, isMingGong, isShenGong } = palace;
  const ganzhi = `${STEMS[stem]}${BRANCHES[branch]}`;

  const majorStars = stars.filter(s => s.type === 'major');
  const luckyStars = stars.filter(s => s.type === 'lucky');
  const shaStars = stars.filter(s => s.type === 'sha');
  const minorStars = stars.filter(s => s.type === 'minor');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      onClick={onClick}
      className="relative flex flex-col p-1.5 cursor-pointer transition-all duration-200 h-full"
      style={{
        minHeight: '90px',
        background: isCurrentDaXian
          ? 'rgba(147,51,234,0.08)'
          : isSelected
          ? 'rgba(37,99,235,0.18)'
          : isSanFang
          ? 'rgba(37,99,235,0.09)'
          : isMingGong
          ? 'rgba(212,168,67,0.04)'
          : 'var(--t-bg)',
        boxShadow: isCurrentDaXian
          ? 'inset 3px 0 0 rgba(147,51,234,0.5)'
          : isSelected
          ? 'inset 0 0 0 1.5px rgba(37,99,235,0.7)'
          : isSanFang
          ? 'inset 0 0 0 1px rgba(37,99,235,0.4)'
          : 'none',
      }}
    >
      {/* 大限年龄 */}
      {koNode(daXianAge && (
        <div className={clsx(
          'absolute top-1 right-1 text-[9px] font-mono tabular-nums',
          isCurrentDaXian ? 'text-purple-400' : ''
        )}
          style={!isCurrentDaXian ? { color: 'var(--t-faint)', opacity: 0.75 } : undefined}
        >
          {koNode(daXianAge[0])}–{koNode(daXianAge[1])}
        </div>
      ))}

      {/* 宫名行 */}
      <div className="flex items-center gap-1 mb-0.5 pr-8">
        <span className={clsx('text-[10px] font-medium tracking-wide',
          isMingGong ? 'text-amber-500' : isShenGong ? 'text-sky-500' : ''
        )}
          style={!isMingGong && !isShenGong ? { color: 'var(--t-faint)' } : undefined}
        >
          {koNode(name)}
        </span>
        {koNode(isMingGong && (
          <span className="text-[7px] text-amber-500/80 border border-amber-500/30 px-0.5 rounded leading-tight">{koNode("운명")}</span>
        ))}
        {koNode(isShenGong && (
          <span className="text-[7px] text-sky-500/80 border border-sky-500/30 px-0.5 rounded leading-tight">{koNode("몸")}</span>
        ))}
      </div>

      {/* 干支 */}
      <div className="text-[9px] font-mono mb-1" style={{ color: 'var(--t-faint)', opacity: 0.75 }}>{koNode(ganzhi)}</div>

      {/* 主星 */}
      <div className="flex flex-col gap-0.5 flex-1">
        {koNode(majorStars.length === 0 && (
          <span className="text-[10px] italic" style={{ color: 'var(--t-faint)', opacity: 0.6 }}>{koNode("공궁")}</span>
        ))}
        {koNode(majorStars.map((star) => {
          const overlaySiHua = overlayStarSiHua?.[star.name];
          return (
            <div
              key={star.name}
              className="flex items-center"
              onClick={e => { e.stopPropagation(); onStarClick?.(star); }}
            >
              <span className={clsx(
                'text-[13px] leading-tight font-bold tracking-tight cursor-pointer hover:brightness-125 transition-all',
                star.brightness === 'bright' ? 'text-amber-300' : star.brightness === 'dim' ? 'text-amber-700/80' : 'text-amber-500',
              )}>
                {koNode(star.name)}
              </span>
              {koNode(star.siHua && <SiHuaBadge siHua={star.siHua} />)}
              {koNode(overlaySiHua && (
                <SiHuaBadge
                  siHua={overlaySiHua}
                  overlay
                  label={overlayLabel}
                  onClick={e => {
                    e.stopPropagation();
                    onSiHuaClick?.(star.name, overlaySiHua);
                  }}
                />
              ))}
            </div>
          );
        }))}
      </div>

      {/* 吉星 */}
      {koNode(luckyStars.length > 0 && (
        <div className="flex flex-wrap gap-x-1 mt-0.5">
          {koNode(luckyStars.map(s => {
            const overlaySiHua = overlayStarSiHua?.[s.name];
            return (
              <span key={s.name} className="inline-flex items-center text-[9px] text-sky-500/70 leading-tight">
                {koNode(s.name)}
                {koNode(s.siHua && <SiHuaBadge siHua={s.siHua} />)}
                {koNode(overlaySiHua && (
                  <SiHuaBadge
                    siHua={overlaySiHua}
                    overlay
                    label={overlayLabel}
                    onClick={e => {
                      e.stopPropagation();
                      onSiHuaClick?.(s.name, overlaySiHua);
                    }}
                  />
                ))}
              </span>
            );
          }))}
        </div>
      ))}

      {/* 煞星 */}
      {koNode(shaStars.length > 0 && (
        <div className="flex flex-wrap gap-x-1">
          {koNode(shaStars.map(s => (
            <span key={s.name} className="text-[9px] text-red-500/60 leading-tight">
              {koNode(s.name)}{koNode(s.siHua && <SiHuaBadge siHua={s.siHua} />)}
            </span>
          )))}
        </div>
      ))}

      {/* 杂曜 */}
      {koNode(minorStars.length > 0 && (
        <div className="flex flex-wrap gap-x-1">
          {koNode(minorStars.map(s => (
            <span key={s.name} className="text-[9px] leading-tight" style={{ color: 'var(--t-faint)', opacity: 0.75 }}>
              {koNode(s.name)}{koNode(s.brightnessRaw ? `[${s.brightnessRaw}]` : '')}{koNode(s.siHua && <SiHuaBadge siHua={s.siHua} />)}
            </span>
          )))}
        </div>
      ))}

      {/* 宫底左下角竖排：博士、将前、岁前；三组数据均由 ChartBoard 按当前视图计算。 */}
      {koNode(shierShen && (
        <div
          className="flex flex-col items-start mt-1 pt-0.5 text-[8px] leading-tight"
          style={{ borderTop: '1px dashed var(--t-border)', color: 'var(--t-faint)' }}
        >
          <span data-shier-shen="boshi" className="text-violet-500/70">{koNode(shierShen.boshi)}</span>
          <span data-shier-shen="jiangQian">{koNode(shierShen.jiangQian)}</span>
          <span data-shier-shen="suiQian">{koNode(shierShen.suiQian)}</span>
        </div>
      ))}

    </motion.div>
  );
}
