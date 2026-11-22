'use client';
import { ko, koNode } from '@/lib/i18n/ko';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import StarField from '@/components/StarField';
import { useTheme, type Theme } from '@/components/ThemeProvider';
import AnnouncementModal from '@/components/AnnouncementModal';

// ─── 롤링 엔트리 래퍼 ───────────────────────────────────
function FadeIn({
  children, delay = 0, y = 28, className = '',
}: {
  children: React.ReactNode; delay?: number; y?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {koNode(children)}
    </motion.div>
  );
}

function WeakBoundary({ line }: { line: string }) {
  // 이전 버전에는 1px 실선 + 12px 그라데이션 그림자가 있어서 테마 전환 시 선명한 수평선을 형성하기 어려웠습니다.
  // 좀 더 부드러운 24px 그라데이션 + 낮은 불투명도로 변경하면 단면 연결이 더 자연스러워집니다.
  return (
    <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none"
      style={{ background: `linear-gradient(to bottom, ${line}, transparent)`, opacity: 0.45 }} />
  );
}

// ─── 테마 전환 버튼 ─────────────────────────────────────
function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.93 }}
      aria-label={ko(isDark ? '切换亮色主题' : '切换暗色主题')}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
      style={{
        borderColor: isDark ? 'rgba(212,168,67,0.3)' : 'rgba(140,100,20,0.35)',
        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,252,242,0.85)',
        transition: 'background 0.35s ease, border-color 0.35s ease',
      }}
    >
      <div className="relative w-10 h-5 rounded-full flex-shrink-0"
        style={{
          background: isDark ? 'rgba(12,24,64,0.95)' : 'rgba(230,195,80,0.55)',
          transition: 'background 0.35s ease',
        }}>
        <motion.div
          animate={{ x: isDark ? 2 : 22 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="absolute top-1 w-3.5 h-3.5 rounded-full"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #b8a050, #e8d090)'
              : 'linear-gradient(135deg, #e89010, #f8d050)',
          }}
        />
      </div>
      <span className="text-[11px] font-medium tracking-wide select-none"
        style={{
          color: isDark ? 'rgba(212,180,100,0.85)' : 'rgba(110,72,8,0.8)',
          transition: 'color 0.35s ease',
        }}>
        {koNode(isDark ? '暗色' : '亮色')}
      </span>
    </motion.button>
  );
}

// ─── 주성 데이터 ─────────────────────────────────────────
const STARS = [
  { name: '紫微' }, { name: '天机' }, { name: '太阳' }, { name: '武曲' },
  { name: '天同' }, { name: '廉贞' }, { name: '天府' }, { name: '太阴' },
  { name: '贪狼' }, { name: '巨门' }, { name: '天相' }, { name: '天梁' },
  { name: '七杀' }, { name: '破军' },
];

// ───기능 모듈 ─────────────────────────────────────────
const FEATURES = [
  {
    tag: '排盘体系',
    title: "니하이샤 정통\n자미두수",
    subtitle: "단순화되지 않은 버전은 교사 니하이샤의 상속을 엄격하게 따릅니다.",
    points: [
      "납음오행국가 시작되고 네트워크 단순화 알고리즘을 사용하지 않습니다.",
      "명궁이 역수로 생성되고 신궁이 정방향으로 생성되면 티칭 규칙이 엄격하게 정렬됩니다.",
      "14개의 주성 및 사화비성는 원래의 방법에 따라 추론되었으며 구조가 완성되어 검토할 수 있습니다.",
    ],
  },
  {
    tag: '命盘呈现',
    title: "14개의 주성을 완료하세요\n사화비성",
    subtitle: "구조가 명확하고 주축과 핵심 포인트를 한눈에 파악할 수 있습니다.",
    points: [
      "열네 번째 주성이 완전히 궁에 들어가고 주성의 관계가 명확하고 읽기 쉽습니다.",
      "보조성 및 살성은 주요 정보 누락을 방지하기 위해 동일한 화면에 표시됩니다.",
      "묘왕 선명한 밝기 등급, 신속하게 강도 식별",
      "주성을 클릭하면 니하이샤 선생님의 별에 대한 자세한 해석을 볼 수 있습니다.",
    ],
  },
  {
    tag: 'AI 解读',
    title: "심층 분석\n단순히 계산하는 것 이상",
    subtitle: "니하이샤 시스템 지식 베이스 × Claude AI",
    points: [
      "운명 분석: 명궁주성에서 시작하여 삼방사정과 결합하여 성격과 인생 격국에 대한 종합적인 판단을 제공합니다.",
      "6가지 주요 차원의 해석: 진로 방향, 관계 및 결혼, 금전운 모델, 건강 관심, 가족 관계, 자녀 운명",
      "대한유년 추적: 대한 현재 10년간의 핵심 포인트, 올해 유년 궁에 대한 구체적인 팁 및 조치 제안",
      "무료 질문: 명반에 직접 질문하세요. \"올해 직업을 바꿀 수 있나요?\" \"결혼하기 가장 좋은 시기는 언제인가요?\"",
    ],
  },
  {
    tag: '格局识别',
    title: "자동 감지\n명반격국",
    subtitle: "별들의 조합으로 당신의 운명을 찾아보세요",
    points: [
      "자부동궁·살파랑·기월동량·염상격·무곡칠살 등 주요 격국을 자동으로 살핍니다.",
      "보필협명·일월협명 등 특수한 격국을 확인하고 관련 해설을 제공합니다.",
      "사화 및 명궁천이궁의 특수 조건은 주의가 필요한 생활 문제를 알리기 위해 자동으로 표시됩니다.",
      "격국은 좋은 등급과 나쁜 등급에 따라 레이어로 표시되므로 명반의 장점과 과제를 한눈에 명확하게 이해할 수 있습니다.",
    ],
  },
];

// ─── 4개의 주요 학습 섹션(포스트 히어로 타임라인)──────────────────────────
const SECTIONS = [
  {
    key: 'ziwei',
    name: '紫微',
    en: '자미',
    desc: "14개 주성 · 13개 주제 · AI 해석",
    status: 'ready' as const,
    when: '5 月',
    icon: '◉',  // 실선 + 내부 점, 자미 스타 비전
    note: '',
  },
  {
    key: 'tianji',
    name: '天纪',
    en: '천기',
    desc: "자미두수 · 주역 · 기문둔갑",
    status: 'soon' as const,
    when: '6 月',
    icon: '⊙',  // 원 + 내부 점(고대 중국어 "日"), 문자 너비는 ◉와 동일
    note: '',
  },
  {
    key: 'diji',
    name: '地纪',
    en: '지기',
    desc: "니하이샤 선생 미완성 사업·미래 세대의 추가 메모",
    status: 'soon' as const,
    when: '6 月',
    icon: '⊞',  // 정사각형 + 우물(육지/필드 비전), 단어 폭과 동일 ⊙
    note: "사후 원고 연구",
  },
  {
    key: 'renji',
    name: '人纪',
    en: '인기',
    desc: "황제내경 · 상한론 · 금궤요략 · 침구",
    status: 'soon' as const,
    when: '7 月',
    icon: '⊕',  // 원+십자(의학도/음양화합), ⊙/⊞와 같은 글자폭
    note: '',
  },
];

// ─── 니하이샤 핵심 가르침 ───────────────────────────────────
const NI_TEACHINGS = [
  {
    title: "명궁을 바탕으로 삼방을 살핍니다",
    body: "명궁의 주성으로 기본 격국과 타고난 성격을 살피고, 삼방인 재백궁·관록궁·천이궁에서 능력이 발휘되는 영역을 봅니다. 네 궁의 관계를 함께 읽어 전체 흐름을 이해합니다.",
  },
  {
    title: "공궁에서는 대궁의 별을 함께 살핍니다",
    body: "대궁의 관계를 함께 살피는 것이 중요합니다. 궁 위치가 공궁인 경우 황도대 별자리 대궁로 판단해야 합니다. 명궁의 반대는 천이궁입니다. 두 사람은 서로 영향을 미칩니다. 이것은 많은 초보자들이 쉽게 간과하는 핵심입니다.",
  },
  {
    title: "사화로 변화의 방향을 살핍니다",
    body: "성요의 배치는 바탕이며, 사화(화록, 화권, 화과, 화기)는 운의 질을 결정하는 열쇠입니다. 같은 별인 화록 또는 화기는 완전히 다른 삶의 궤적을 가질 수 있습니다. 니하이샤 선생은 ​​반복해서 강조했습니다. 사화를 보지 않고 명반은 절반만 해결했습니다.",
  },
  {
    title: "10년 단위의 대한을 살핍니다",
    body: "니하이샤 선생은 인생을 12개의 대한로 나누고, 각 대한은 10년입니다. 그는 서로 다른 대한 궁에 있는 사람들이 완전히 다른 경험을 할 것이라고 믿습니다. 당신이 현재 어떤 대한에 살고 있는지, 그 집에 어떤 스타가 있는지 알아야만 현재의 운세를 진정으로 파악할 수 있습니다.",
  },
];

// ─── 테마 색상 도우미 ────────────────────────────────────
function useColors(theme: Theme) {
  const d = theme === 'dark';
  return {
    bgBase:       d ? '#020810'                                : '#f5efe0',
    // nav는 반투명 중첩으로 인한 색상 차이 밴드를 피하기 위해 bgBase와 정확히 동일한 불투명 색상을 사용합니다.
    navBg:        d ? '#020810'                                : '#f5efe0',
    navBorder:    d ? 'rgba(255,255,255,0.05)'                : 'rgba(160,120,30,0.15)',
    goldGrad:     d ? 'linear-gradient(160deg,#c8993a 0%,#f0d070 40%,#c8993a 70%,#f0c755 100%)'
                    : 'linear-gradient(160deg,#6a4206 0%,#9a6a10 40%,#6a4206 70%,#885010 100%)',
    goldSolid:    d ? '#d4a843'                               : '#8b6410',
    goldLine:     d ? 'rgba(212,168,67,0.4)'                  : 'rgba(140,100,20,0.4)',
    tagText:      d ? 'rgba(212,168,67,0.6)'                  : 'rgba(120,80,10,0.65)',
    // 밝은 텍스트에는 차가운 회색 사용(계획 A의 핵심): 따뜻한 배경 + 차가운 텍스트 → 시각적 피로
    textPrimary:  d ? '#e8eef6'                               : '#1a1d24',
    textSecond:   d ? '#b8c6df'                               : '#3a3f4a',
    textMuted:    d ? '#9db0d0'                               : '#5a6275',
    textFaint:    d ? 'rgba(240,246,255,0.56)'                : '#9da4b3',
    // 쿨 액센트(플랜 B의 핵심): 다크 콴 블루를 반영합니다. 장식용 글로우/링크/하이라이트에 사용됩니다.
    accent:       d ? '#3a78d4'                               : '#3a5a82',
    accentSoft:   d ? 'rgba(58,120,212,0.18)'                 : 'rgba(58,90,130,0.10)',
    cardBg:       d ? 'rgba(255,255,255,0.05)'                : 'rgba(255,255,255,0.88)',
    cardBorder:   d ? 'rgba(255,255,255,0.10)'                : 'rgba(200,160,60,0.25)',
    cardShadow:   d ? '0 4px 32px rgba(0,0,0,0.5)'           : '0 4px 24px rgba(140,100,20,0.12)',
    featureBg:    d ? 'rgba(255,255,255,0.04)'                : 'rgba(255,255,255,0.75)',
    featureBord:  d ? 'rgba(255,255,255,0.08)'                : 'rgba(200,160,60,0.2)',
    glowTint:     d ? 'rgba(212,168,67,0.07)'                 : 'rgba(180,140,40,0.06)',
    // 밝은 컬러 글로우는 블루/퍼플을 정말 많이 사용해서 전체적인 분위기에 시원한 컬러 장식을 더해줍니다
    glowBlue:     d ? 'rgba(40,80,160,0.12)'                  : 'rgba(58,90,130,0.06)',
    glowPurple:   d ? 'rgba(120,50,180,0.08)'                 : 'rgba(96,80,140,0.04)',
    niBg:         d ? 'rgba(255,255,255,0.04)'                : 'rgba(255,255,255,0.8)',
    niBorder:     d ? 'rgba(212,168,67,0.2)'                  : 'rgba(180,130,40,0.25)',
    niDivider:    d ? 'rgba(255,255,255,0.08)'                : 'rgba(180,130,40,0.12)',
    niCardBg:     d ? 'rgba(255,255,255,0.04)'                : 'rgba(255,255,255,0.9)',
    niCardBord:   d ? 'rgba(255,255,255,0.08)'                : 'rgba(200,160,60,0.2)',
    niCardShadow: d ? '0 2px 20px rgba(0,0,0,0.4)'           : '0 2px 16px rgba(140,100,20,0.1)',
    starBg:       d ? 'rgba(255,255,255,0.04)'                : 'rgba(255,255,255,0.7)',
    starBorder:   d ? 'rgba(212,168,67,0.22)'                 : 'rgba(160,120,30,0.3)',
    starText:     d ? 'rgba(212,168,67,0.7)'                  : 'rgba(120,80,10,0.7)',
    ctaBg:        d ? 'linear-gradient(135deg,#b8892a,#f0d070,#b8892a)'
                    : 'linear-gradient(135deg,#6a4206,#9a6810,#6a4206)',
    ctaText:      d ? '#08080a'                               : '#f8f3e8',
    footerText:   d ? 'rgba(255,255,255,0.08)'                : '#d0b878',
    scrollLine:   d ? 'rgba(212,168,67,0.3)'                  : 'rgba(140,100,20,0.3)',
    scrollText:   d ? 'rgba(255,255,255,0.12)'                : '#c0a870',
    altSection:   d ? 'rgba(255,255,255,0.02)'                : 'rgba(255,255,255,0.4)',
    quoteBg:      d ? 'rgba(212,168,67,0.04)'                 : 'rgba(255,255,255,0.9)',
  };
}

// ─── 사화 프로필 데이터 ─────────────────────────────────────
const SIHUA_BRIEF: Record<string, { attr: string; brief: string }> = {
  '化禄': { attr: '吉化·增益', brief: "행운의 별이 궁궐에 도착하면 행운과 행운이 더해집니다. 당신이 있는 집에서는 일이 순조롭게 진행되고, 당신의 능력도 향상됩니다. 명반에서 가장 인기있는 스타입니다." },
  '化权': { attr: '吉化·权威', brief: "파워 스타가 집에 오면 통제력과 리더십을 나타냅니다. 자신이 속한 집은 힘과 결단력이 지배하고, 관록궁과 명궁라면 경력상 실권이 지배하는 집이다." },
  '化科': { attr: '吉化·名誉', brief: "성별이 궁에 들어오면 명성과 인기를 상징한다. 그것이 위치한 궁은 문학적 이름과 시험 행운을 담당합니다. 고귀한 사람들의 지원을 받으며 학술 연구, 시험 및 공개 행사에 적합합니다." },
  '化忌': { attr: '凶化·阻碍', brief: "재앙의 별이 궁궐에 도착하면 집착과 장애물이 지배하고 있습니다. 그것이 위치한 집에는 특별한주의가 필요합니다. 이 집의 생활 문제는 중요한 시험이 될 것입니다." },
};

// ─── 주성 프로필 데이터 ─────────────────────────────────────
const STAR_BRIEF: Record<string, { attr: string; brief: string }> = {
  '紫微': { attr: '土·帝王星', brief: "황제의 고귀한 별이 모든 별을 다스린다. 별자리에 앉은 사람은 냉담하고 오만하며 탁월한 권위와 타고난 리더십 기질을 갖추고 있으며 독립적인 리더십 위치에 적합합니다." },
  '天机': { attr: '木·智慧星', brief: "장수별은 지혜와 변화를 담당하는 별이다. 그들은 똑똑하고 계획을 잘 세우며 섬세한 마음을 가지고 있습니다. 기획, 컨설팅, 기술업무에 적합합니다." },
  '太阳': { attr: '火·官禄主', brief: "관록주성은 주로 평판과 명성입니다. 관대하고 관대하며 공공 이미지를 중시하고 공직과 공직에 이익을 주며 남성 활력이 강하고 입묘에 있어서는 우월합니다." },
  '武曲': { attr: '金·财帛主', brief: "재백주성, 주로 재무 및 의사 결정. 그들은 확고한 의지와 단호한 행동을 보이며 금융, 금융, 군대 및 경찰 직업에 적합합니다. 외로운 별이고, 늦은 결혼에도 좋다." },
  '天同': { attr: '水·福星', brief: "복덕주성, 주요 즐거움과 인기. 그는 성격이 온화하고 인기가 많으며 삶의 질을 중시하고 감정이 섬세하며 노년에 행운이 따릅니다." },
  '廉贞': { attr: '火·才艺星', brief: "두 번째 복숭아꽃 별은 재능과 정욕을 상징합니다. 뛰어난 재능과 풍부한 감성으로 예술과 정치에 적합합니다. 다재다능하지만 낭만적인 논쟁을 방지해야 합니다." },
  '天府': { attr: '土·财库星', brief: "Nandou 주성, 주요 재무 및 저축. 꾸준하고 보수적이며 강력한 재무 관리 능력을 갖춘 이들은 명반의 안정세력이며 재무 및 행정 관리에 적합합니다." },
  '太阴': { attr: '水·田宅主', brief: "전택주성, 주요 부와 여성 성. 섬세하고 부드러우며 강한 감성을 지니고 있어 여성에게 특히 좋습니다. 부동산과 저축에 유익하며 문학예술이나 서비스업에 적합합니다." },
  '贪狼': { attr: '木水·桃花', brief: "복숭아꽃 별은 욕망과 재능을 상징합니다. 다재다능하고 의욕이 강하며 활발한 사회생활을 하며 예술, 홍보, 비즈니스에 적합하며 인기가 매우 높습니다." },
  '巨门': { attr: '水·是非星', brief: "어두운 별, 주된 웅변과 옳고 그름. 뛰어난 언변과 탄탄한 비판적 사고 능력으로 변호사, 교육계, 언론계에 적합한 인재입니다. 말은 옳고 그름을 중시하고 웅변으로 자기를 확립하라." },
  '天相': { attr: '水·印星', brief: "메인 어시스턴트이자 Yin Shou 인 Yin Xing. 조화를 잘하고 예의를 중요시하며 정직하고 법을 준수하며 직원, 행정, ​​법률 업무에 적합하며 귀한 사람은 행운을 빕니다." },
  '天梁': { attr: '土·荫星', brief: "성숙과 그늘의 주요 상징인 음별. 성실함과 안정감, 강한 자비심, 하나님의 축복을 받을 것입니다. 의료, 사회 사업, 종교 분야에 적합합니다." },
  '七杀': { attr: '金火·将星', brief: "확고함과 개척의 군주, 별 장군. 결단력 있는 성격과 강한 행동력, 도전하는 용기를 갖고 있다. 그는 기업가 정신, 군대와 경찰, 경쟁이 치열한 산업에 적합하며 위험을 행운으로 바꿀 수 있습니다." },
  '破军': { attr: '水·耗星', brief: "소비 별, 주요 변화 및 개발. 변화를 두려워하지 않고 돌파하는 용기를 갖고, 삶에 많은 변화가 있지만 선구적인 일에 적합한 용기를 갖고, 남들이 가지 않은 길을 가십시오." },
};

// ─── 기능성 시각적 장식 ─────────────────────────────────────
function FeatureVisual({ index, colors: c }: { index: number; colors: ReturnType<typeof useColors> }) {
  if (index === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-5">
        <div className="grid grid-cols-4 gap-1.5 w-72 mx-auto">
          {koNode(Array.from({ length: 16 }).map((_, i) => {
            const isCenter = [5, 6, 9, 10].includes(i);
            const isActive = [0, 3, 12, 15].includes(i);
            return (
              <motion.div key={i}
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="h-14 rounded-sm flex items-center justify-center text-xs transition-all duration-300"
                style={{
                  border: `1px solid ${isActive ? c.goldLine : c.cardBorder}`,
                  background: isCenter ? 'transparent' : isActive ? c.starBg : c.featureBg,
                  color: isActive ? c.goldSolid : c.textFaint,
                  opacity: isCenter ? 0 : 1,
                }}>
                {koNode(isActive ? '★' : '')}
              </motion.div>
            );
          }))}
        </div>
        <p className="text-[10px] tracking-widest transition-colors duration-300"
          style={{ color: c.textFaint }}>{koNode("니하이샤배반 방법")}</p>
      </div>
    );
  }

  if (index === 1) {
    const [sel, setSel] = useState<string | null>(null);
    const selInfo = sel ? (STAR_BRIEF[sel] ?? SIHUA_BRIEF[sel] ?? null) : null;
    return (
      <div className="flex flex-col gap-4 h-full justify-center">
        {koNode([
          { group: '紫微系', stars: ['紫微', '天机', '太阳', '武曲', '天同', '廉贞'] },
          { group: '天府系', stars: ['天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军'] },
        ].map(group => (
          <div key={group.group}>
            <div className="text-[11px] tracking-widest mb-2 transition-colors duration-300"
              style={{ color: c.textFaint }}>{koNode(group.group)}</div>
            <div className="flex flex-wrap gap-1.5">
              {koNode(group.stars.map(s => (
                <motion.button key={s}
                  onClick={() => setSel(sel === s ? null : s)}
                  whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className="text-xs px-2 py-1 rounded-md cursor-pointer"
                  style={{
                    border: `1px solid ${sel === s ? c.goldSolid : c.goldLine}`,
                    color: c.goldSolid,
                    background: sel === s ? `${c.goldLine}30` : 'transparent',
                    fontWeight: sel === s ? 600 : 400,
                  }}>
                  {koNode(s)}
                </motion.button>
              )))}
            </div>
          </div>
        )))}
        <div>
          <div className="text-[11px] tracking-widest mb-2 transition-colors duration-300"
            style={{ color: c.textFaint }}>{koNode("사화비성")}</div>
          <div className="flex gap-2 flex-wrap">
            {koNode([['化禄', 'rgba(52,211,153,0.7)'], ['化权', 'rgba(96,165,250,0.7)'], ['化科', 'rgba(250,204,21,0.7)'], ['化忌', 'rgba(248,113,113,0.7)']].map(([label, color]) => (
              <motion.button key={label}
                onClick={() => setSel(sel === label ? null : label)}
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="text-xs px-2.5 py-1 rounded-md cursor-pointer"
                style={{
                  border: `1px solid ${color}`,
                  color,
                  background: sel === label ? `${color.replace('0.7', '0.15')}` : 'transparent',
                  fontWeight: sel === label ? 600 : 400,
                }}>
                {koNode(label)}
              </motion.button>
            )))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          {koNode(selInfo && (
            <motion.div key={sel}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl p-4 mt-1.5"
              style={{ border: `1px solid ${c.goldLine}`, background: c.featureBg }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm font-semibold" style={{ color: c.goldSolid }}>{koNode(sel)}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ color: c.tagText, border: `1px solid ${c.goldLine}` }}>{koNode(selInfo.attr)}</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: c.textSecond }}>{koNode(selInfo.brief)}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  if (index === 2) {
    const msgs = [
      { role: 'user', text: "올해 내 직업운세는?" },
      { role: 'ai', text: "명궁천기화록, 올해 대한은 관록궁로 이동하고 세 당사자는 좌보를 도와주고 경력은 고귀한 사람들의 지원을 받으며 적극적인 확장에 적합합니다..." },
      { role: 'user', text: "사랑하기 가장 좋은 때는 언제인가요?" },
    ];
    return (
      <div className="flex flex-col gap-2 h-full justify-center">
        {koNode(msgs.map((m, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%] text-[11px] px-3 py-2 rounded-lg leading-relaxed"
              style={{
                border: `1px solid ${m.role === 'user' ? c.goldLine : c.cardBorder}`,
                background: m.role === 'user' ? c.starBg : c.featureBg,
                color: m.role === 'user' ? c.goldSolid : c.textSecond,
              }}>
              {koNode(m.text)}
            </div>
          </motion.div>
        )))}
      </div>
    );
  }

  if (index === 3) {
    const patterns = [
      { name: '杀破狼格', desc: "진취적인 운명을 창조하라", ok: true },
      { name: '廉相格',   desc: "행정 도장 패턴", ok: true },
      { name: '化忌入命', desc: "심리적 문제는 주의가 필요하다", ok: false },
    ];
    return (
      <div className="flex flex-col gap-3 h-full justify-center">
        {koNode(patterns.map((p, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
            style={{
              border: `1px solid ${p.ok ? 'rgba(96,165,250,0.25)' : 'rgba(251,146,60,0.25)'}`,
              background: p.ok ? 'rgba(96,165,250,0.05)' : 'rgba(251,146,60,0.05)',
            }}>
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: p.ok ? 'rgba(96,165,250,0.6)' : 'rgba(251,146,60,0.6)' }} />
            <div>
              <div className="text-[11px] font-medium"
                style={{ color: p.ok ? 'rgba(147,197,253,0.8)' : 'rgba(253,186,116,0.8)' }}>{koNode(p.name)}</div>
              <div className="text-[10px]" style={{ color: c.textMuted }}>{koNode(p.desc)}</div>
            </div>
          </motion.div>
        )))}
        <div className="text-[9px] mt-2 tracking-wider text-center" style={{ color: c.textFaint }}>{koNode("11개의 클래식 격국을 자동으로 식별합니다.")}</div>
      </div>
    );
  }

  return null;
}

// ───홈 ────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = useColors(theme);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '28%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  // 반투명 탐색의 색상 차이를 없애기 위해 본문/html 배경을 홈 테마 색상과 동기화합니다. #fafaf9
  // useLayoutEffect는 루트 div의 전환과 동기화되지 않는 것을 방지하기 위해 브라우저가 그리기 전에 동기적으로 업데이트되도록 보장합니다.
  useLayoutEffect(() => {
    document.documentElement.style.background = c.bgBase;
    document.body.style.background = c.bgBase;
    return () => {
      document.documentElement.style.background = '';
      document.body.style.background = '';
    };
  }, [c.bgBase]);

  return (
    <div style={{ background: c.bgBase, transition: 'background 0.35s ease' }} className="overflow-x-hidden">
      {/* 致用户公告——首次访问全屏覆盖，关闭后才进入首页 */}
      <AnnouncementModal />

      <StarField />

      {/* 全局光晕 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full"
          style={{ background: `radial-gradient(ellipse, ${c.glowTint} 0%, transparent 70%)` }} />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full"
          style={{ background: `radial-gradient(ellipse, ${c.glowBlue} 0%, transparent 70%)` }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full"
          style={{ background: `radial-gradient(ellipse, ${c.glowPurple} 0%, transparent 70%)` }} />
      </div>

      {/* ── 顶部导航 ── nav 与 hero 同色（c.bgBase），无 blur 无 border，彻底无色差带 */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 gap-2"
        style={{
          background: c.navBg,
        }}>
        <div className="text-[11px] sm:text-xs tracking-[0.3em] sm:tracking-[0.4em] font-medium transition-colors duration-300 flex-shrink-0"
          style={{ color: c.goldSolid }}>{koNode("자미두수 명반")}</div>
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <ThemeToggle />
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/heming')}
            className="text-[11px] sm:text-xs px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full transition-all duration-300"
            style={{ border: `1px solid ${c.navBorder}`, color: c.textMuted }}>{koNode("복합 디스크")}</motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/chart')}
            className="text-[11px] sm:text-xs px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full transition-all duration-300"
            style={{ border: `1px solid ${c.goldLine}`, color: c.goldSolid }}>{koNode("즉시 거래 시작")}</motion.button>
        </div>
      </nav>

      {/* ══ HERO ══════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-[82svh] lg:min-h-[92vh] flex flex-col items-center justify-center px-6 z-10 pb-24 pt-10">
        <motion.div style={{ y: heroY, opacity: heroOpacity, maxWidth: '960px' }} className="text-center w-full mx-auto mt-10">
          {/* 标签行 */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${c.goldLine})` }} />
            <span className="text-[11px] tracking-[0.45em] transition-colors duration-300" style={{ color: c.tagText }}>{koNode("자미두수 · 니하이샤 시스템")}</span>
            <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${c.goldLine})` }} />
          </motion.div>

          {/* 主标题 */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ position: 'relative', display: 'inline-block' }}>
            <h1
              className={`grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'} font-bold leading-none mb-5`}
              style={{
                fontSize: 'clamp(56px, 10vw, 124px)',
                letterSpacing: '0.07em',
              }}>{koNode("자미두수 명반")}</h1>
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="text-base md:text-lg tracking-[0.18em] mb-2"
            style={{ color: c.textSecond, fontWeight: 500 }}>{koNode("자미는 문 · 하늘과 땅은 사람이 만든 길 · 니하이샤는 선생님")}</motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="text-xs md:text-sm tracking-[0.3em] mb-6"
            style={{ color: c.textMuted, opacity: 0.85 }}>{koNode("AI 질의응답·지식과 행동의 통일성")}</motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.65 }}
            className="text-sm max-w-xl mx-auto leading-relaxed mb-10"
            style={{ color: c.textMuted }}>{koNode("생년의 월과 일을 입력하면 전용 자미두수명반이 생성됩니다. 후속 천기, 지기 및 인기 학습 모듈이 차례로 열립니다.")}</motion.p>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            className="flex flex-col items-center gap-4">
            <motion.button
              whileHover={{ y: -2, filter: 'brightness(1.06)' }} whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/chart')}
              className="px-12 py-4 font-semibold text-base tracking-widest rounded-full"
              style={{ background: c.ctaBg, color: c.ctaText }}>{koNode("즉시 거래 시작")}</motion.button>
          </motion.div>

          {/* 十四主星 */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1.05, duration: 0.8 }}
            className="mt-12 grid grid-cols-7 gap-1.5 max-w-[540px] mx-auto">
            {koNode(STARS.map((star, i) => (
              <motion.div key={star.name}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.05 + i * 0.03, duration: 0.35 }}
                className="flex items-center justify-center px-2 py-1 rounded-full"
                style={{ background: c.starBg, border: `1px solid ${c.starBorder}` }}>
                <span className="text-[11px] tracking-wide" style={{ color: c.starText }}>{koNode(star.name)}</span>
              </motion.div>
            )))}
          </motion.div>
        </motion.div>

        {/* 上线公告便利贴 — 桌面端绝对定位右侧 */}
        <motion.div
          initial={{ opacity: 0, x: 30, rotate: 0 }}
          animate={{ opacity: 1, x: 0, rotate: -4 }}
          transition={{ delay: 1.4, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute hidden lg:block pointer-events-none"
          style={{
            right: 'clamp(2%, 6vw, 8%)',
            top: '54%',
            maxWidth: '240px',
          }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #fff5e3 0%, #ffe1c0 100%)',
            border: '2px dashed rgba(232,132,62,0.45)',
            borderRadius: '16px',
            padding: '14px 18px',
            boxShadow: '0 8px 24px rgba(196,90,45,0.18), 0 2px 6px rgba(196,90,45,0.1)',
            fontFamily: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
          }}>
            <div style={{ fontSize: '20px', marginBottom: '6px', lineHeight: 1 }}>🎁</div>
            <div style={{ fontSize: '13px', lineHeight: 1.7, color: '#8b3a1a', fontWeight: 500 }}>
              <span style={{ color: '#c45a2d', fontWeight: 700, fontSize: '14px' }}>5/1 — 5/8</span>
              <span>{koNode("제한된 시간 피드백")}</span>
            </div>
            <div style={{ fontSize: '13px', lineHeight: 1.7, color: '#8b3a1a', fontWeight: 500 }}>{koNode("모든 기능 + AI 질문")}<strong style={{ color: '#c45a2d' }}>{koNode("모두 무료")}</strong>
            </div>
          </div>
        </motion.div>

        {/* 上线公告便利贴 — 手机端正常流式显示（hero 内容下方居中） */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, rotate: -2 }}
          transition={{ delay: 1.4, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="lg:hidden mx-auto mt-8 mb-2 pointer-events-none"
          style={{
            maxWidth: 'min(280px, 84vw)',
          }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #fff5e3 0%, #ffe1c0 100%)',
            border: '2px dashed rgba(232,132,62,0.45)',
            borderRadius: '14px',
            padding: '12px 16px',
            boxShadow: '0 6px 18px rgba(196,90,45,0.16), 0 2px 4px rgba(196,90,45,0.08)',
            fontFamily: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '18px', marginBottom: '4px', lineHeight: 1 }}>🎁</div>
            <div style={{ fontSize: '12px', lineHeight: 1.7, color: '#8b3a1a', fontWeight: 500 }}>
              <span style={{ color: '#c45a2d', fontWeight: 700, fontSize: '13px' }}>5/1 — 5/8</span>
              <span>{koNode("제한된 시간 피드백")}</span>
            </div>
            <div style={{ fontSize: '12px', lineHeight: 1.7, color: '#8b3a1a', fontWeight: 500 }}>{koNode("모든 기능 + AI")}<strong style={{ color: '#c45a2d' }}>{koNode("모두 무료")}</strong>
            </div>
          </div>
        </motion.div>

        {/* 滚动提示（绝对定位，不影响 hero opacity 计算） */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none">
          <span className="text-[9px] tracking-[0.4em] uppercase" style={{ color: c.scrollText }}>{koNode("더 알아보기")}</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="w-px h-8" style={{ background: `linear-gradient(to bottom, ${c.scrollLine}, transparent)` }} />
        </motion.div>
      </section>

      {/* ══ 哲学引言 ══════════════════════════════════════ */}
      <section className="relative z-10 overflow-hidden min-h-[82svh] lg:min-h-[92vh] flex items-center" style={{ padding: '72px 24px' }}>
        <WeakBoundary line={c.navBorder} />
        <div className="absolute inset-0"
          style={{
            background: theme === 'dark'
              ? 'linear-gradient(to bottom, #020810 0%, #020810 6%, #030a18 22%, #0d0820 40%, #0a0618 68%, #030a18 86%, #020810 100%)'
              : 'linear-gradient(to bottom, #f5efe0 0%, #f5efe0 6%, #c08055 18%, #6a2810 32%, #1e0a02 50%, #1e0a02 70%, #6a2810 84%, #f5efe0 100%)',
            transition: 'background 0.4s ease',
          }} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="font-bold" style={{ fontSize: 'clamp(220px, 38vw, 460px)', color: 'rgba(212,168,67,0.012)', lineHeight: 1, fontFamily: 'serif' }}>{koNode("운명")}</span>
        </div>
        <FadeIn className="relative mx-auto text-center w-full" y={20}>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16" style={{ background: 'linear-gradient(to right, transparent, rgba(212,168,67,0.45))' }} />
            <span className="text-[10px] tracking-[0.55em] uppercase" style={{ color: 'rgba(212,168,67,0.5)' }}>{koNode("운명 · 행운 · 전망")}</span>
            <div className="h-px w-16" style={{ background: 'linear-gradient(to left, transparent, rgba(212,168,67,0.45))' }} />
          </div>
          <div className="space-y-3" style={{ maxWidth: '840px', margin: '0 auto' }}>
            {koNode([
              { text: "운명의 의미를 미리 들여다보세요", size: 'clamp(17px, 2.2vw, 28px)', color: 'rgba(215,228,252,0.72)', delay: 0.1 },
              { text: "미래를 예측하는 것이 아니다", size: 'clamp(21px, 2.6vw, 32px)', color: 'rgba(220,232,250,0.74)', delay: 0.25 },
              { text: "끊임없이 자신을 알아가는 것입니다", size: 'clamp(24px, 3vw, 40px)', color: 'rgba(218,230,248,0.8)', delay: 0.34 },
            ].map((line, i) => (
              <motion.p key={i}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: line.delay }}
                className="tracking-wider" style={{ fontSize: line.size, color: line.color, fontWeight: 400 }}>
                {koNode(line.text)}
              </motion.p>
            )))}
            <motion.p
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className={`grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'} font-bold`}
              style={{ fontSize: 'clamp(24px, 3.4vw, 48px)', letterSpacing: '0.05em', lineHeight: 1.35 }}>{koNode("마지막으로 자신의 인생 대본을 작성하세요")}</motion.p>
          </div>
        </FadeIn>
      </section>

      {/* ══ 4 大学习板块时间轴 ════════════════════════════ */}
      <section className="relative z-10 py-20 lg:py-24 px-6"
        style={{
          background: theme === 'dark'
            ? 'linear-gradient(to bottom, transparent 0%, rgba(184,146,42,0.03) 50%, transparent 100%)'
            : 'linear-gradient(to bottom, transparent 0%, rgba(184,146,42,0.04) 50%, transparent 100%)',
        }}>
        <FadeIn className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${c.goldLine})` }} />
            <span className="text-[10px] tracking-[0.4em] uppercase" style={{ color: c.goldSolid, opacity: 0.7 }}>학습 과정</span>
            <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${c.goldLine})` }} />
          </div>
          <div className="text-2xl lg:text-3xl font-bold mb-2 tracking-[0.15em]" style={{ color: c.textPrimary }}>{koNode("니하이샤 선생 방법론 · 점진적으로 확장")}</div>
          <div className="text-xs lg:text-sm tracking-[0.1em]" style={{ color: c.textMuted }}>{koNode("자미부터 시작하여 점차적으로 천기 / 지기 / 인기 학습 모듈을 엽니다.")}</div>
        </FadeIn>

        <div className="max-w-sm lg:max-w-5xl mx-auto relative">
          {/* 横向连接线（仅桌面）*/}
          <div className="hidden lg:block absolute top-7 left-[12.5%] right-[12.5%] h-0.5"
            style={{
              background: `linear-gradient(90deg, ${c.goldSolid} 0%, ${c.goldSolid} 25%, ${c.goldLine} 25%)`,
              opacity: 0.6,
            }} />

          {/* 纵向连接线（仅手机）—— 圆点贴在线上，做"地铁线路图"风格 */}
          <div className="lg:hidden absolute left-7 top-7 bottom-7 w-px -translate-x-1/2"
            style={{
              background: `linear-gradient(180deg, ${c.goldSolid} 0%, ${c.goldSolid} 22%, ${c.goldLine} 22%)`,
              opacity: 0.6,
            }} />

          <div className="flex flex-col gap-5 lg:grid lg:grid-cols-4 lg:gap-4">
            {koNode(SECTIONS.map((s, i) => {
              const ready = s.status === 'ready';
              return (
                <motion.div key={s.key}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="relative flex flex-row lg:flex-col items-center lg:items-center text-left lg:text-center gap-4 lg:gap-0">
                  {/* 节点圆 */}
                  <div className="relative w-14 h-14 shrink-0 rounded-full flex items-center justify-center lg:mb-3"
                    style={{
                      background: ready
                        ? `linear-gradient(135deg, ${c.goldSolid} 0%, ${c.goldSolid}cc 100%)`
                        : (theme === 'dark' ? 'rgba(184,146,42,0.05)' : '#fdf8ee'),
                      border: ready ? 'none' : `2px dashed ${c.goldLine}`,
                      color: ready ? '#fff' : c.textMuted,
                      boxShadow: ready ? `0 4px 16px ${c.goldSolid}55` : 'none',
                    }}>
                    <span className="text-2xl">{koNode(s.icon)}</span>
                    {koNode(ready && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white"
                        style={{ background: '#10b981', boxShadow: '0 2px 6px rgba(16,185,129,0.4)' }}>
                        ✓
                      </div>
                    ))}
                  </div>
                  {/* 文字组：手机端右排单列；桌面端居中堆叠 */}
                  <div className="flex-1 lg:flex-none flex flex-col items-start lg:items-center min-w-0">
                    {/* 顶行：时间标签 + 板块名 + note（手机端 inline；桌面端依然分行） */}
                    <div className="flex items-baseline gap-2 lg:flex-col lg:gap-0 lg:mb-1">
                      <div className="text-[10px] tracking-[0.25em] lg:mb-1.5"
                        style={{ color: ready ? '#10b981' : c.textMuted, fontWeight: 500 }}>
                        {koNode(s.when)}
                      </div>
                      <div className="text-base lg:text-xl font-semibold tracking-[0.15em]"
                        style={{ color: c.textPrimary }}>
                        {koNode(s.name)}
                      </div>
                      {koNode(s.note && (
                        <div className="text-[9px] tracking-[0.15em] px-2 py-0.5 rounded-full lg:hidden"
                          style={{
                            color: c.goldSolid,
                            background: theme === 'dark' ? 'rgba(184,146,42,0.1)' : 'rgba(184,146,42,0.08)',
                            border: `1px solid ${c.goldLine}`,
                            opacity: 0.85,
                          }}>
                          {koNode(s.note)}
                        </div>
                      ))}
                    </div>
                    {/* 桌面专属 note（手机已在顶行 inline 展示）*/}
                    {koNode(s.note && (
                      <div className="hidden lg:block text-[9px] tracking-[0.15em] mb-1.5 px-2 py-0.5 rounded-full"
                        style={{
                          color: c.goldSolid,
                          background: theme === 'dark' ? 'rgba(184,146,42,0.1)' : 'rgba(184,146,42,0.08)',
                          border: `1px solid ${c.goldLine}`,
                          opacity: 0.85,
                        }}>
                        {koNode(s.note)}
                      </div>
                    ))}
                    {/* 简介 */}
                    <div className="text-[11px] lg:text-xs leading-relaxed lg:max-w-[200px] mt-0.5 lg:mt-0"
                      style={{ color: c.textSecond }}>
                      {koNode(s.desc)}
                    </div>
                  </div>
                </motion.div>
              );
            }))}
          </div>
        </div>
      </section>

      {/* ══ 功能详解 ══════════════════════════════════════ */}
      <section className="relative z-10">
        {koNode(FEATURES.map((feature, i) => (
          <div key={i}
            className={`flex items-center px-6 md:px-10 lg:px-14 py-20 md:py-24 ${i <= 2 ? 'min-h-[82svh] lg:min-h-[92vh]' : ''}`}
            style={{ background: i % 2 === 1 ? c.altSection : 'transparent' }}>
            <div className="mx-auto w-full" style={{ maxWidth: '1280px' }}>
              <div className={`grid grid-cols-1 ${i % 2 === 0 ? 'lg:grid-cols-[0.45fr_0.55fr]' : 'lg:grid-cols-[0.55fr_0.45fr]'} gap-10 lg:gap-16 items-start ${i % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>
                {/* 文字区 */}
                <div className={i % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <FadeIn delay={0}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-px w-8" style={{ background: c.goldLine }} />
                      <span className="text-[10px] tracking-[0.5em] uppercase" style={{ color: c.tagText }}>{koNode(feature.tag)}</span>
                    </div>
                  </FadeIn>
                  <FadeIn delay={0.1}>
                    <h2 className={`grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'} font-bold leading-tight mb-5 tracking-tight`}
                      style={{
                        fontSize: i < 2 ? 'clamp(36px, 4vw, 56px)' : 'clamp(30px, 3.5vw, 48px)',
                        whiteSpace: 'pre-line',
                      }}>
                      {koNode(feature.title)}
                    </h2>
                  </FadeIn>
                  <FadeIn delay={0.2}>
                    <p className="text-base mb-8 leading-relaxed" style={{ color: c.textSecond }}>{koNode(feature.subtitle)}</p>
                  </FadeIn>
                  <div className="space-y-4">
                    {koNode(feature.points.map((point, j) => (
                      <FadeIn key={j} delay={0.25 + j * 0.08}>
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 mt-2 w-1 h-1 rounded-full" style={{ background: c.goldSolid, opacity: 0.6 }} />
                          <p className="text-sm leading-relaxed" style={{ color: c.textMuted }}>{koNode(point)}</p>
                        </div>
                      </FadeIn>
                    )))}
                  </div>
                </div>
                {/* 视觉装饰区 */}
                <div className={i % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                  <FadeIn delay={0.15}>
                    <div className="relative rounded-2xl overflow-hidden p-8 md:p-12"
                      style={{
                        border: `1px solid ${c.featureBord}`,
                        background: c.featureBg,
                        minHeight: i <= 1 ? '540px' : i === 2 ? '460px' : '320px',
                        boxShadow: c.cardShadow,
                      }}>
                      <FeatureVisual index={i} colors={c} />
                    </div>
                  </FadeIn>
                </div>
              </div>
            </div>
          </div>
        )))}
      </section>

      {/* ══ 天·地·人 三分理论 ════════════════════════════ */}
      <section className="relative z-10 flex items-center px-6 md:px-10 lg:px-14 py-20"
        style={{ background: c.altSection, minHeight: '82svh' }}>
        <WeakBoundary line={c.navBorder} />
        <div className="mx-auto w-full" style={{ maxWidth: '1280px' }}>
          <FadeIn>
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${c.goldLine})` }} />
                <span className="text-[10px] tracking-[0.5em] uppercase" style={{ color: c.tagText }}>니하이샤 · 관점</span>
                <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${c.goldLine})` }} />
              </div>
              <h2 className={`grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'} font-bold mb-5 tracking-tight`}
                style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}>{koNode("하늘·땅·사람")}</h2>
              <p className="max-w-2xl mx-auto text-sm leading-relaxed" style={{ color: c.textSecond }}>{koNode("니하이샤 선생님의 운명에 대한 핵심관: 운명은 결코 인생의 전부가 아닙니다.")}<br />{koNode("그는 삶에 영향을 미치는 힘을 똑같이 중요한 세 가지 차원으로 나누었습니다.")}</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {koNode([
              { glyph: '天', label: "타고난 운명", pct: '⅓', color: c.goldSolid, borderColor: c.goldLine, desc: "자미두수가 드러내는 것은 사람의 타고난 명반격국, 즉 별자리 레이아웃, 오행국 수, 태어난 시간에 의해 결정되는 명궁주성입니다. 이것은 전체 그림이 아닌 운명의 3분의 1, 삶의 배경일 뿐입니다.", sub: "명반 · 싱야오 · 오행" },
              { glyph: '地', label: "지리적 환경", pct: '⅓', color: 'rgba(96,165,250,0.9)', borderColor: 'rgba(96,165,250,0.3)', desc: "당신의 지리적 환경, 도시, 국가, 풍수, 심지어 가족 배경과 사회 구조까지 함께 모여 운명의 2차원을 구성합니다. 같은 사람이라도 다른 곳에서 태어났다면 상황은 매우 다를 수 있습니다.", sub: "지역 · 풍수 · 환경" },
              { glyph: '人', label: "사람들의 생각", pct: '⅓', color: 'rgba(100,216,139,0.9)', borderColor: 'rgba(100,216,139,0.3)', desc: "개인의 의지, 사고방식, 선택 및 행동은 운명을 바꾸는 데 가장 적극적인 힘입니다. 니하이샤 선생은 다음과 같이 강조합니다. 명반을 이해하는 것은 운명을 기다리는 것이 아니라 더 나은 사람이 되는 것입니다. 자신을 개선하는 것이 상황을 깨는 가장 강력한 방법입니다.", sub: "의지·선택·행동" },
            ].map((item, i) => (
              <FadeIn key={item.glyph} delay={0.1 + i * 0.12}>
                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.1 }}
                  className="rounded-2xl p-7 h-full flex flex-col"
                  style={{ background: c.cardBg, border: `1px solid ${item.borderColor}`, boxShadow: c.cardShadow }}>
                  <div className="flex items-start justify-between mb-5">
                    <div className="text-5xl font-bold leading-none" style={{ color: item.color }}>{koNode(item.glyph)}</div>
                    <div className="text-right">
                      <div className="text-2xl font-bold" style={{ color: item.color }}>{koNode(item.pct)}</div>
                      <div className="text-[9px] mt-0.5 tracking-widest" style={{ color: c.textMuted }}>삶의 흐름</div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="text-sm font-medium mb-0.5" style={{ color: item.color }}>{koNode(item.label)}</div>
                    <div className="text-[10px] tracking-wider" style={{ color: c.textMuted }}>{koNode(item.sub)}</div>
                  </div>
                  <div className="h-px mb-4" style={{ background: item.borderColor }} />
                  <p className="text-xs leading-relaxed flex-1" style={{ color: c.textSecond }}>{koNode(item.desc)}</p>
                </motion.div>
              </FadeIn>
            )))}
          </div>
          <FadeIn delay={0.3}>
            <div className="mt-10 text-center">
              <p className="text-sm leading-relaxed" style={{ color: c.textSecond }}>{koNode("\"운명이 인생의 전부는 아니지만, 지리적 위치와 사람의 생각이 전부다.\"")}</p>
              <p className="mt-2 text-[10px] tracking-widest" style={{ color: c.tagText }}>{koNode("— 니하이샤")}</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ 倪海厦介绍 ════════════════════════════════════ */}
      <section className="relative z-10 flex items-center px-6 md:px-10 lg:px-14 py-20" style={{ minHeight: '82svh' }}>
        <WeakBoundary line={c.navBorder} />
        <div className="mx-auto w-full" style={{ maxWidth: '1280px' }}>
          <FadeIn>
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${c.goldLine})` }} />
                <span className="text-[10px] tracking-[0.5em] uppercase" style={{ color: c.tagText }}>니하이샤 · 1953 – 2012</span>
                <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${c.goldLine})` }} />
              </div>
              <h2 className={`grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'} font-bold mb-6 tracking-tight`}
                style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}>{koNode("선생님 니하이샤")}</h2>
              <p className="max-w-2xl mx-auto leading-relaxed text-sm" style={{ color: c.textSecond }}>{koNode("현대 중국계에서 한의학 및 산술 분야의 가장 영향력 있는 대가 중 한 명")}<br />{koNode("미국 한당중의과대학 설립자·\"인기\"와 \"천기\"의 두 가지 주요 교육 시스템이 대대로 이어집니다.")}</p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="rounded-2xl p-8 md:p-10 mb-8"
              style={{ border: `1px solid ${c.niBorder}`, background: c.niBg, boxShadow: c.cardShadow }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {koNode([
                  { label: "출생", value: '1954年', sub: '台湾' },
                  { label: "세상을 떠나다", value: '2012年', sub: "1월 31일, 58세" },
                  { label: "상속", value: '紫微斗数', sub: "경방 한의학 · 역경" },
                ].map(item => (
                  <div key={item.label} className="text-center rounded-xl px-4 py-3"
                    style={{ border: `1px solid ${c.niDivider}`, background: 'rgba(255,255,255,0.02)' }}>
                    <div className="text-[10px] tracking-[0.3em] mb-1" style={{ color: c.textFaint }}>{koNode(item.label)}</div>
                    <div className="text-2xl font-semibold mb-0.5" style={{ color: c.goldSolid }}>{koNode(item.value)}</div>
                    <div className="text-[11px]" style={{ color: c.textMuted }}>{koNode(item.sub)}</div>
                  </div>
                )))}
              </div>
              <div className="h-px mb-8" style={{ background: c.niDivider }} />
              <div className="space-y-4 text-sm leading-relaxed max-w-3xl mx-auto" style={{ color: c.textSecond }}>
                <p>
                  <strong style={{ color: c.goldSolid }}>{koNode("인생 이야기")}</strong>{koNode(":\r\n                  니하이샤(1954~2012)씨는 대만에서 태어났습니다. 초기에 그는 많은 유명한 한의사 밑에서 공부했으며 경방학파(\"열병에 관한 논문\"의 계승)을 전문으로 했습니다.\r\n                  중년에 그는 미국으로 건너가 의학을 실천했고,")}<strong>{koNode("한탕중의과대학")}</strong>{koNode(", 는 20년 이상 한의학과 전통기술을 체계적으로 가르쳐 왔습니다.\r\n                  2012년 1월 31일 대만에서 간암으로 58세의 나이로 사망했습니다.")}</p>
                <p>
                  <strong style={{ color: c.goldSolid }}>{koNode("교육 시스템")}</strong>{koNode(":\r\n                  니하이샤 선생은 평생 동안 배운 내용을 두 가지 주요 공개 교육 시리즈로 구성합니다.")}<strong>{koNode("\"인기\"")}</strong>{koNode("\"침대성\", \"신농본경\", \"황제내경\", \"열병논문\", \"금방개요\" 등을 취재 -\r\n                  이것은 한의학 학습의 완전한 길을 마련한 \"인의 기록\"입니다.")}<strong>{koNode("\"천기\"")}</strong>{koNode("자미두수와 \"변화의 책\"을 다루는 것은 \"천국의 연대기\"이자 산술 연구의 체계적인 결과입니다.\r\n                  이 둘의 조합은 니하이샤 선생이 미래 세대에게 남긴 가장 완전한 유산입니다.")}</p>
                <p>
                  <strong style={{ color: c.goldSolid }}>{koNode("자미 위치")}</strong>{koNode(":\r\n                  니하이샤 선생은 분명히 자미두수에 속합니다.")}<strong>{koNode("난파이 삼합파")}</strong>{koNode(", \"명궁을 기반으로, 삼방사정을 목적으로, 사화를 핵심 링크로\"주장합니다.\r\n                  그는 \"천기\" 과정에서 다음과 같이 분명히 밝혔습니다.")}<em>{koNode("비성(사화)는 날아다니기에는 너무 복잡해서 하지 않겠습니다. 결국 단순함이 가장 중요합니다.")}</em>{koNode("\"——\r\n                  이 위치는 번거로운 비성 세력과 명확하게 구별됩니다.")}</p>
                <p>
                  <strong style={{ color: c.goldSolid }}>{koNode("학문적 태도")}</strong>{koNode(":\r\n                  니하이샤 선생은 공식의 암기식 암기에 반대하며 \"원리를 이해하는 것이 암기하는 것보다 낫다\", \"복습할 수 있는 논리가 신비보다 낫다\"고 강조합니다.\r\n                  이러한 태도를 통해 자미두수는 스승에서 제자로 비밀을 전달하는 폐쇄형 시스템에서 체계적이고 검증 가능하며 학습 가능한 현대 지식 시스템으로 이동할 수 있습니다.")}</p>
                <p>
                  <strong style={{ color: c.goldSolid }}>{koNode("현대의 영향")}</strong>{koNode(":\r\n                  니하이샤 선생의 강의 영상은 Bilibili, YouTube 및 주요 플랫폼에서 널리 유포되며, 신세대 명리학 및 한의학 애호가들의 필수 동영상으로 인식되고 있습니다.\r\n                  그는 자미두수의 후계자일 뿐만 아니라 전통 명리학과 한의학을 현대 지식 체계에 도입한 핵심 인물 중 한 사람입니다.")}</p>
                <p style={{ fontSize: '11px', color: c.textMuted, fontStyle: 'italic', marginTop: '12px' }}>{koNode("이 플랫폼의 모든 해석은 니하이샤 선생의 \"천기\" 공개 교육 유인물, \"자미두수전서\" 명나라 판본 및 전통적인 삼합파 고대 서적을 기반으로 편집되었습니다.\r\n                  문화적, 개인적 성장 참고용으로만 사용하세요. 니하이샤 선생 자신은 이 플랫폼과 상업적 관계가 없습니다.")}</p>
              </div>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {koNode(NI_TEACHINGS.map((teaching, i) => (
              <FadeIn key={i} delay={0.1 + i * 0.08}>
                <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.1 }}
                  className="rounded-xl p-6 h-full"
                  style={{ border: `1px solid ${c.niCardBord}`, background: c.niCardBg, boxShadow: c.niCardShadow }}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center mt-0.5"
                      style={{ borderColor: c.goldLine }}>
                      <span className="text-[9px]" style={{ color: c.goldSolid }}>{koNode(i + 1)}</span>
                    </div>
                    <h3 className="text-sm font-medium leading-relaxed" style={{ color: c.goldSolid }}>{koNode(teaching.title)}</h3>
                  </div>
                  <p className="text-xs leading-relaxed pl-8" style={{ color: c.textSecond }}>{koNode(teaching.body)}</p>
                </motion.div>
              </FadeIn>
            )))}
          </div>
        </div>
      </section>

      {/* ══ 合盘入口 ══════════════════════════════════════ */}
      <section className="relative z-10 px-6 md:px-10 lg:px-14 py-20">
        <div className="mx-auto" style={{ maxWidth: '1280px' }}>
          <div className="rounded-2xl p-10 md:p-14 text-center"
            style={{
              background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
              border: `1px solid ${c.cardBorder}`,
              boxShadow: c.cardShadow,
            }}>
            <FadeIn>
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-8" style={{ background: c.goldLine }} />
                <span className="text-[10px] tracking-[0.5em] uppercase" style={{ color: c.tagText }}>합반 · 관계 분석</span>
                <div className="h-px w-8" style={{ background: c.goldLine }} />
              </div>
              <h2 className={`grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'} font-bold mb-4 tracking-tight`}
                style={{ fontSize: 'clamp(26px, 3.5vw, 40px)' }}>{koNode("자미 조합")}</h2>
              <p className="text-sm leading-relaxed mb-8 max-w-lg mx-auto" style={{ color: c.textSecond }}>{koNode("두 사람의 출생 정보를 입력하면 AI가 니하이샤 시스템을 기반으로 부처궁 상호 참조, 명궁 호환성 및 삼방사정 상호 작용을 분석합니다.")}<br className="hidden md:block" />{koNode("관계 호환성, 파트너십 타당성 및 최선의 관계 유지 방법에 대한 제안을 제공합니다.")}</p>
              <div className="flex justify-center gap-3 flex-wrap mb-6">
                {koNode(['感情匹配度分析', '合伙创业评估', '亲子缘分解读', '婚前相性评估'].map(item => (
                  <span key={item} style={{
                    fontSize: '12px', padding: '5px 14px', borderRadius: '20px',
                    background: theme === 'dark' ? 'rgba(212,168,67,0.08)' : 'rgba(212,168,67,0.12)',
                    border: `1px solid ${c.goldLine}`,
                    color: c.goldSolid,
                  }}>
                    {koNode(item)}
                  </span>
                )))}
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/heming')}
                className="px-10 py-3 font-medium text-sm tracking-widest rounded-full"
                style={{
                  background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(140,100,20,0.1)',
                  border: `1px solid ${c.goldLine}`,
                  color: c.goldSolid,
                  cursor: 'pointer',
                }}>{koNode("시장 분석 시작")}</motion.button>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══ 最终 CTA ══════════════════════════════════════ */}
      <section className="relative z-10 py-40 px-6 text-center" style={{ background: c.altSection }}>
        <FadeIn>
          <p className="text-[10px] tracking-[0.6em] uppercase mb-6" style={{ color: c.tagText }}>{koNode("명반 여행을 시작하세요")}</p>
          <h2 className={`grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'} font-bold mb-8 tracking-tight leading-tight`}
            style={{ fontSize: 'clamp(32px, 5vw, 60px)' }}>{koNode("당신의자미두수 명반")}<br />{koNode("당신의 해석을 기다리고 있습니다")}</h2>
          <p className="text-sm mb-10 max-w-md mx-auto leading-relaxed" style={{ color: c.textSecond }}>{koNode("월과 일 생년를 입력하면 몇 초 내에 독점 명반이 생성됩니다.")}<br />{koNode("그런 다음 AI가 니하이샤 시스템에 따라 심층적인 해석을 제공합니다.")}</p>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/chart')}
            className="px-14 py-4 font-semibold text-base tracking-widest rounded-full"
            style={{ background: c.ctaBg, color: c.ctaText }}>{koNode("무료 시작")}</motion.button>
          <div className="mt-4 flex flex-wrap gap-3 justify-center">
            <motion.a
              href="/knowledge"
              whileHover={{ scale: 1.02 }}
              className="text-xs tracking-[0.2em] inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                color: c.goldSolid,
                border: `1px solid ${c.goldLine}`,
                background: 'transparent',
                textDecoration: 'none',
              }}>{koNode("✦ 자미두수 지식 베이스 →")}</motion.a>
            <motion.a
              href="/library"
              whileHover={{ scale: 1.02 }}
              className="text-xs tracking-[0.2em] inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                color: c.goldSolid,
                border: `1px solid ${c.goldLine}`,
                background: 'transparent',
                textDecoration: 'none',
              }}>{koNode("📜 고대 서적 원본 데이터베이스 →")}</motion.a>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-10 px-6"
        style={{ borderTop: `1px solid ${c.niCardBord}` }}>

        {/* 4 板块导航占位（已上线 + 即将开放）*/}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="text-[9px] tracking-[0.3em] text-center mb-4 uppercase"
            style={{ color: c.textMuted, opacity: 0.6 }}>{koNode("니하이샤 선생 방법론 · 학술 시스템")}</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {koNode(SECTIONS.map(s => {
              const ready = s.status === 'ready';
              return (
                <a
                  key={s.key}
                  href={ready ? '/chart' : undefined}
                  onClick={ready ? undefined : (e) => e.preventDefault()}
                  className="rounded-lg px-3 py-3 text-center transition-all"
                  style={{
                    background: ready ? c.starBg : 'transparent',
                    border: `1px ${ready ? 'solid' : 'dashed'} ${ready ? c.goldLine : c.navBorder}`,
                    cursor: ready ? 'pointer' : 'not-allowed',
                    opacity: ready ? 1 : 0.5,
                    textDecoration: 'none',
                  }}
                >
                  <div className="text-base font-semibold mb-0.5 tracking-[0.1em]"
                    style={{ color: ready ? c.goldSolid : c.textMuted }}>
                    {koNode(s.name)}
                  </div>
                  <div className="text-[9px] tracking-wider"
                    style={{ color: ready ? '#10b981' : c.textMuted }}>
                    {koNode(ready ? '✓ 已上线' : `${s.when}열다`)}
                  </div>
                </a>
              );
            }))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-[10px] tracking-wider mb-3" style={{ color: c.footerText }}>{koNode("자미두수 명반 · 정통 니하이샤 시스템 기반 · 참고용으로, 당신의 운명은 당신의 손에 달려 있습니다")}</p>
          <p className="text-[10px] tracking-wider mb-3 max-w-2xl mx-auto leading-relaxed"
            style={{ color: c.footerText, opacity: 0.85 }}>{koNode("이 플랫폼은 중국 전통 문화 연구를 기반으로 하며 학습 참고 자료만 제공합니다.")}<br className="sm:hidden" />{koNode("이는 의료, 투자, 법적 또는 주요 의사 결정 조언을 구성하지 않습니다.")}</p>
          <p className="text-[10px] tracking-wider" style={{ color: c.footerText }}>
            <a href="/terms" style={{ color: c.footerText, textDecoration: 'underline' }}>{koNode("이용약관")}</a>
            {koNode(' · ')}
            <a href="/privacy" style={{ color: c.footerText, textDecoration: 'underline' }}>{koNode("개인정보 처리방침")}</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
