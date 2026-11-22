'use client';

import { ko, koNode } from '@/lib/i18n/ko';
/* *
 * 명반공유 카드 — 실제 십이궁 명반 썸네일
 *
 * 디자인 : 왼쪽 12자궁수축 명반 + 오른쪽 핵심정보
 * 브라우저 기본 중국어 글꼴은 SSR에 의존하지 않습니다. */

import type { ZiweiChart } from '@/lib/ziwei/types';
import { SITE_HOST } from '@/lib/site';

const BRANCH_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 자미두수 12 궁 지지 레이아웃("지지 플레이트" 표준에 따라 배열, 고정)
// 인마오첸시 → 상향
// 슈 정오
// 아들은 아직 아니야
// Haixu Youshen → 하향
const ZHIWEI_LAYOUT: Array<{ branch: number; row: number; col: number }> = [
  { branch: 2,  row: 0, col: 0 }, // 음
  { branch: 3,  row: 0, col: 1 }, // 마오
  { branch: 4,  row: 0, col: 2 }, // 첸
  { branch: 5,  row: 0, col: 3 }, // 시
  { branch: 1,  row: 1, col: 0 }, // 못생긴
  { branch: 6,  row: 1, col: 3 }, // 정오
  { branch: 0,  row: 2, col: 0 }, // 아들
  { branch: 7,  row: 2, col: 3 }, // 아직은 아님
  { branch: 11, row: 3, col: 0 }, // 하이
  { branch: 10, row: 3, col: 1 }, // 쑤
  { branch: 9,  row: 3, col: 2 }, // 단일한
  { branch: 8,  row: 3, col: 3 }, // 申
];

interface ShareCardProps {
  chart: ZiweiChart;
  birth: { year: string; month: string; day: string; hour: string; minute: string; gender: 'male' | 'female'; city?: string };
  highlight?: string;
}

export default function ShareCardCanvas({ chart, birth, highlight }: ShareCardProps) {
  const mingPalace = chart.palaces.find(p => p.branch === chart.mingGongBranch);
  const mingMajorStars = mingPalace?.stars.filter(s => s.type === 'major').map(s => s.name) ?? [];
  const mingStarStr = mingMajorStars.length > 0 ? mingMajorStars.join('·') : '空宫';
  const mingBranchName = BRANCH_NAMES[chart.mingGongBranch] || '';
  const shenBranchName = BRANCH_NAMES[chart.shenGongBranch] || '';
  const dx = chart.daXians?.[chart.currentDaXianIndex];

  // 각 궁을 12개의 그리드로 구성하고 레이아웃에 따라 그려보세요.
  const cells = ZHIWEI_LAYOUT.map(slot => {
    const palace = chart.palaces.find(p => p.branch === slot.branch);
    const majors = palace?.stars.filter(s => s.type === 'major') ?? [];
    const isMing = palace?.branch === chart.mingGongBranch;
    const isShen = palace?.branch === chart.shenGongBranch;
    return { ...slot, palace, majors, isMing, isShen };
  });

  // 카드 크기: 680x420(WeChat 썸네일 + Moments에 적합)
  return (
    <div id="share-card" style={{
      width: '680px',
      height: '420px',
      background: 'linear-gradient(135deg, #fef9eb 0%, #f7e8c4 60%, #efd8a0 100%)',
      padding: '20px 28px',
      fontFamily: '"Malgun Gothic", "Apple SD Gothic Neo", sans-serif',
      position: 'relative',
      boxSizing: 'border-box',
      borderRadius: '14px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* 装饰光晕 */}
      <div style={{
        position: 'absolute', top: '-60px', left: '-60px',
        width: '180px', height: '180px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(184,146,42,0.18) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-50px', right: '-50px',
        width: '160px', height: '160px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(196,90,45,0.12) 0%, transparent 70%)',
      }} />

      {/* 顶部 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #d4a948 0%, #b8922a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '15px', fontWeight: 700,
          }}>{koNode("보라색")}</div>
          <div>
            <div style={{ fontSize: '15px', color: '#3d2f10', fontWeight: 600, letterSpacing: '0.12em', lineHeight: 1.2 }}>{koNode("자미두수 명반")}</div>
            <div style={{ fontSize: '9px', color: '#a89b7c', letterSpacing: '0.18em', marginTop: '2px' }}>{koNode("니하이샤 정통 · ZI WEI")}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ fontSize: '10px', color: '#6b5d3f', letterSpacing: '0.05em' }}>
            {koNode(birth.year)}{koNode("년")}{koNode(birth.month)}{koNode("월")}{koNode(birth.day)}{koNode("일 ·")}{koNode(birth.hour.padStart(2,'0'))}:{koNode(birth.minute.padStart(2,'0'))}
            <span style={{ margin: '0 4px', color: '#b8922a' }}>·</span>
            {koNode(birth.gender === 'male' ? '男命' : '女命')}
            {koNode(birth.city && <><span style={{ margin: '0 4px', color: '#b8922a' }}>·</span>{koNode(birth.city)}</>)}
          </div>
          <div style={{ fontSize: '8px', color: '#b8922a', letterSpacing: '0.08em', marginTop: '2px' }}>
            {koNode(SITE_HOST)}
          </div>
        </div>
      </div>

      {/* 主体：左 12 宫格子 + 右关键信息 */}
      <div style={{ display: 'flex', gap: '16px', flex: 1, position: 'relative', zIndex: 1, minHeight: 0 }}>
        {/* 左：12 宫缩略命盘 */}
        <div style={{
          width: '300px',
          height: '288px',
          background: 'rgba(255,255,255,0.5)',
          border: '1px solid rgba(184,146,42,0.3)',
          borderRadius: '8px',
          padding: '6px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'repeat(4, 1fr)',
          gap: '3px',
          position: 'relative',
        }}>
          {koNode(cells.map((cell, i) => {
            // 4개의 중앙 그리드(1-2행, 1-2열)가 중앙 설명 영역으로 병합됩니다.
            if ((cell.row === 1 || cell.row === 2) && (cell.col === 1 || cell.col === 2)) return null;
            return (
              <div key={i} style={{
                gridRow: cell.row + 1,
                gridColumn: cell.col + 1,
                background: cell.isMing ? 'rgba(184,146,42,0.18)' : 'rgba(255,255,255,0.6)',
                border: cell.isMing
                  ? '1.5px solid #b8922a'
                  : '0.5px solid rgba(184,146,42,0.2)',
                borderRadius: '4px',
                padding: '4px 5px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* 宫名 + 地支 */}
                <div style={{
                  fontSize: '8px',
                  color: cell.isMing ? '#8b6a14' : '#a89b7c',
                  letterSpacing: '0.05em',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ fontWeight: cell.isMing ? 700 : 400 }}>
                    {koNode(cell.palace?.name || '')}
                    {koNode(cell.isShen ? '·身' : '')}
                  </span>
                  <span style={{ fontSize: '7px', opacity: 0.7 }}>{koNode(BRANCH_NAMES[cell.branch])}</span>
                </div>
                {/* 主星 */}
                <div style={{
                  marginTop: '2px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1px',
                  flex: 1,
                  justifyContent: 'center',
                }}>
                  {koNode(cell.majors.length > 0 ? cell.majors.slice(0, 2).map((s, j) => (
                    <div key={j} style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: cell.isMing ? '#8b6a14' : '#3d2f10',
                      letterSpacing: '0.02em',
                      lineHeight: 1.1,
                    }}>
                      {koNode(s.name)}{koNode(s.siHua ? <span style={{ fontSize: '8px', color: '#c45a2d', marginLeft: '1px' }}>{koNode(s.siHua)}</span> : '')}
                    </div>
                  )) : (
                    <div style={{ fontSize: '9px', color: '#a89b7c', fontStyle: 'italic' }}>{koNode("공궁")}</div>
                  ))}
                </div>
              </div>
            );
          }))}

          {/* 中央说明区（占据 4 个格子）*/}
          <div style={{
            gridRow: '2 / 4',
            gridColumn: '2 / 4',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(184,146,42,0.06)',
            border: '0.5px dashed rgba(184,146,42,0.3)',
            borderRadius: '4px',
          }}>
            <div style={{ fontSize: '8px', color: '#a89b7c', letterSpacing: '0.2em', marginBottom: '4px' }}>ZI WEI</div>
            <div style={{ fontSize: '14px', color: '#3d2f10', fontWeight: 600, letterSpacing: '0.1em' }}>{koNode("자미두수")}</div>
            <div style={{ fontSize: '10px', color: '#6b5d3f', marginTop: '6px' }}>{koNode("명궁 ·")}{koNode(mingBranchName)}</div>
            <div style={{ fontSize: '10px', color: '#6b5d3f' }}>{koNode("신궁 ·")}{koNode(shenBranchName)}</div>
            <div style={{ fontSize: '10px', color: '#6b5d3f', marginTop: '4px', fontWeight: 600 }}>{koNode(chart.wuxingJuName)}</div>
          </div>
        </div>

        {/* 右：关键信息 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {/* 命宫主星 */}
          <div>
            <div style={{ fontSize: '10px', color: '#a89b7c', letterSpacing: '0.25em', marginBottom: '2px' }}>{koNode("명나라 궁 ·")}{koNode(mingBranchName)}</div>
            <div style={{
              fontSize: '52px',
              fontWeight: 800,
              color: '#8b6a14',
              letterSpacing: '0.03em',
              lineHeight: 1,
              marginBottom: '12px',
            }}>{koNode(mingStarStr)}</div>

            {/* 高亮 */}
            {koNode(highlight && (
              <div style={{
                fontSize: '12px',
                color: '#5b4c2e',
                fontWeight: 500,
                padding: '8px 10px',
                background: 'rgba(255,255,255,0.5)',
                borderLeft: '3px solid #b8922a',
                borderRadius: '4px',
                letterSpacing: '0.04em',
                marginBottom: '12px',
              }}>{koNode(highlight)}</div>
            ))}
          </div>

          {/* 当前大限 + slogan */}
          <div>
            {koNode(dx && (
              <div style={{
                fontSize: '11px',
                color: '#3d2f10',
                marginBottom: '10px',
                letterSpacing: '0.05em',
              }}>
                <span style={{ color: '#a89b7c' }}>{koNode("현재대한")}</span>
                <span style={{ fontWeight: 600 }}>{koNode(dx.startAge)}–{koNode(dx.endAge)}{koNode("년 ·")}{koNode(dx.palaceName)}</span>
              </div>
            ))}
            <div style={{
              padding: '10px 12px',
              background: 'linear-gradient(135deg, rgba(212,169,72,0.18) 0%, rgba(184,146,42,0.08) 100%)',
              border: '1px solid rgba(184,146,42,0.3)',
              borderRadius: '6px',
            }}>
              <div style={{ fontSize: '11px', color: '#3d2f10', fontWeight: 600, letterSpacing: '0.08em', lineHeight: 1.4 }}>{koNode("자미는 문이다 · 하늘과 땅과 사람은 길이다")}</div>
              <div style={{ fontSize: '10px', color: '#8b6a14', fontWeight: 600, letterSpacing: '0.08em', lineHeight: 1.4, marginTop: '2px' }}>{koNode("니하이샤는 선생님 · AI 질의응답 동반자입니다")}</div>
              <div style={{ fontSize: '8px', color: '#a89b7c', letterSpacing: '0.15em', marginTop: '4px' }}>{koNode("코드를 스캔하여 명반을 받으세요 →")}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* * 캡처 도구: 위 div를 PNG 데이터URL로 변환 */
export async function captureShareCard(): Promise<string | null> {
  try {
    const html2canvas = (await import('html2canvas')).default;
    const node = document.getElementById('share-card');
    if (!node) return null;
    const canvas = await html2canvas(node, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
      logging: false,
    });
    return canvas.toDataURL('image/png');
  } catch (e) {
    console.error('captureShareCard failed', e);
    return null;
  }
}

export function downloadDataURL(dataURL: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
