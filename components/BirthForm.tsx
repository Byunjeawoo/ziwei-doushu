'use client';
import { ko, koNode } from '@/lib/i18n/ko';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BirthInfo } from '@/lib/ziwei/types';
import { SHICHEN } from '@/lib/ziwei/constants';
import { useTheme } from '@/components/ThemeProvider';
import { PROVINCES } from '@/lib/ziwei/cities';
import { formToBirthInfo, formToTrueSolarTime } from '@/lib/ziwei/share';

export interface BirthFormState {
  name: string;
  year: string;
  month: string;
  day: string;
  clockHour: string;
  clockMinute: string;
  unknownTime: boolean;
  province: string;
  city: string;
  longitude: number;
  gender: 'male' | 'female';
}

interface BirthFormProps {
  onSubmit: (info: BirthInfo) => void;
  loading?: boolean;
  initialData?: Partial<BirthFormState>;
  onFormSave?: (data: BirthFormState) => void;
  /* * 내부 "지금 시작" 버튼 숨기기(마감 주문과 같은 장면은 상위에 의해 트리거됨) */
  hideSubmit?: boolean;
}

const SHICHEN_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/* * 날짜가 적법한지 확인하세요 */
function isValidDate(y: number, m: number, d: number): boolean {
  if (!y || !m || !d) return false;
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

export default function BirthForm({ onSubmit, loading, initialData, onFormSave, hideSubmit }: BirthFormProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [form, setForm] = useState<BirthFormState>({
    name: initialData?.name ?? '',
    year: initialData?.year ?? '',
    month: initialData?.month ?? '',
    day: initialData?.day ?? '',
    clockHour: initialData?.clockHour ?? '8',
    clockMinute: initialData?.clockMinute ?? '0',
    unknownTime: initialData?.unknownTime ?? false,
    province: initialData?.province ?? '',
    city: initialData?.city ?? '',
    longitude: initialData?.longitude ?? 120,
    gender: initialData?.gender ?? 'male',
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // 양식 상태가 변경되면 실시간으로 상위 항목과 동기화됩니다. (상위 항목은 주문 마감 등의 시나리오에서 양 당사자로부터 데이터를 수집하기 위해 이를 사용합니다.)
  useEffect(() => {
    onFormSave?.({ ...form });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const cityList = useMemo(() => {
    const prov = PROVINCES.find(p => p.name === form.province);
    return prov ? prov.cities : [];
  }, [form.province]);

  const solarTime = formToTrueSolarTime(form);
  const branch = form.unknownTime ? 0 : solarTime.branch;
  const offsetMin = Math.round(solarTime.totalCorrectionMinutes);
  const shichenInfo = SHICHEN[branch];

  // ─── 검증 로직 ────────────────────────────────────────
  const y = parseInt(form.year) || 0;
  const m = parseInt(form.month) || 0;
  const d = parseInt(form.day) || 0;

  const errors = {
    year: !form.year ? '请选择出生年份'
      : y < 1900 || y > 2026 ? "연도 범위: 1900~2026"
      : '',
    month: !form.month ? '请选择月份' : '',
    day: !form.day ? '请选择日期'
      : form.year && form.month && !isValidDate(y, m, d) ? `${m}월 없음${d}일`
      : '',
  };
  const hasError = Object.values(errors).some(Boolean);

  // ─── 완성도(진행률 표시줄) ───────────────────────────────
  const steps = [
    !!form.year && !!form.month && !!form.day && !errors.year && !errors.month && !errors.day,
    !!form.province && !!form.city,
    form.unknownTime || (!!form.clockHour && !!form.clockMinute),
    true, // 性别有默认值
  ];
  const completedSteps = steps.filter(Boolean).length;

  // ─── 요약 칩: 필수 항목을 모두 입력한 후 표시됩니다. ──────────────────
  const showSummary = steps[0] && steps[2] && !hasError;
  const summaryText = showSummary
    ? [
        `${y}년${m}월${d}일`,
        form.city || (form.province ? form.province : ''),
        form.unknownTime ? '时辰不详' : `${SHICHEN_NAMES[branch]}시`,
        form.gender === 'male' ? '男' : '女',
      ].filter(Boolean).join(' · ')
    : '';

  const handleProvince = (prov: string) => {
    const provData = PROVINCES.find(p => p.name === prov);
    const firstCity = provData?.cities[0];
    setForm({ ...form, province: prov, city: firstCity?.name || '', longitude: firstCity?.longitude ?? 120 });
  };

  const handleCity = (cityName: string) => {
    const prov = PROVINCES.find(p => p.name === form.province);
    const cityData = prov?.cities.find(c => c.name === cityName);
    setForm({ ...form, city: cityName, longitude: cityData?.longitude ?? 120 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setTouched({ year: true, month: true, day: true });
    if (hasError) return;
    onFormSave?.({ ...form });
    // 변환을 위해 lib/ziwei/share.ts를 통일적으로 사용합니다. 야자시 날짜 변경(다음 날 배반에 따라 23:00~23:59)을 담당합니다.
    // 여기서 BirthInfo의 철자를 수동으로 입력하면 이 규칙을 우회하여 /chart 및 /heming이 동일한 입력과 하루 차이가 나는 디스크를 출력하게 됩니다.
    onSubmit(formToBirthInfo(form));
  };

  // ─── 스타일 변수 ─────────────────────────────────────────
  const bg = isDark ? 'rgba(8,16,40,0.85)' : 'rgba(255,255,255,0.92)';
  const border = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(200,160,60,0.2)';
  // 다크 모드 라벨 밝기: rgba(74,112,144,1) → rgba(180,200,225,0.9)
  const labelClr = isDark ? 'rgba(180,200,225,0.9)' : 'rgba(120,80,10,0.55)';
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,252,240,0.8)';
  const inputBorder = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(200,160,60,0.25)';
  // 입력 텍스트 강조 표시: #c8d8f0 → #e8eef8
  const inputClr = isDark ? '#e8eef8' : '#2a1a00';
  const focusBorder = isDark ? 'rgba(212,168,67,0.5)' : 'rgba(180,120,20,0.5)';
  const errorClr = isDark ? '#f87171' : '#dc2626';
  const panelBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,250,235,0.7)';
  const panelBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(200,160,60,0.2)';
  const goldText = isDark ? '#d4a843' : '#7a5008';
  const summaryBg = isDark ? 'rgba(37,99,235,0.12)' : 'rgba(37,99,235,0.07)';
  const summaryBorder = isDark ? 'rgba(37,99,235,0.35)' : 'rgba(37,99,235,0.25)';
  const summaryClr = isDark ? 'rgba(147,197,253,0.9)' : 'rgba(37,99,235,0.85)';

  const inputStyle = {
    background: inputBg,
    border: `1px solid ${inputBorder}`,
    color: inputClr,
    borderRadius: '14px',
    padding: '10px 14px',
    fontSize: '13px',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s',
  } as React.CSSProperties;

  const errorInputStyle = { ...inputStyle, borderColor: errorClr };

  function FieldError({ msg }: { msg: string }) {
    return (
      <AnimatePresence>
        {koNode(msg && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.18 }}
            style={{ color: errorClr, fontSize: '11px', marginTop: '4px' }}
          >
            ✕ {koNode(msg)}
          </motion.p>
        ))}
      </AnimatePresence>
    );
  }

  const showErr = (field: string) => touched[field] || submitAttempted;

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ background: bg, border: `1px solid ${border}`, borderRadius: '24px', padding: '28px', backdropFilter: 'blur(20px)' }}
    >
      {/* 标题 */}
      <h3 style={{ color: goldText, fontSize: '12px', letterSpacing: '0.4em', textAlign: 'center', marginBottom: '20px', fontWeight: 500 }}>{koNode("── 생년월일을 입력하세요 팔자 ──")}</h3>

      {/* ── 进度条 ── */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
        {koNode(steps.map((done, i) => (
          <motion.div
            key={i}
            animate={{ background: done ? (isDark ? '#d4a843' : '#b07820') : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(200,160,60,0.15)') }}
            transition={{ duration: 0.3 }}
            style={{ flex: 1, height: '2px', borderRadius: '2px' }}
          />
        )))}
      </div>

      {/* ── 姓名 ── */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '11px', color: labelClr, marginBottom: '6px', letterSpacing: '0.05em' }}>{koNode("이름(옵션)")}</label>
        <input
          type="text"
          placeholder={ko("이름를 입력하세요")}
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          style={inputStyle}
          onFocus={e => { e.target.style.borderColor = focusBorder; }}
          onBlur={e => { e.target.style.borderColor = inputBorder; }}
        />
      </div>

      {/* ── 出生日期 ── */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '11px', color: labelClr, marginBottom: '6px', letterSpacing: '0.05em' }}>{koNode("생년월일 (양력)")}</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <div>
            <select
              value={form.year}
              onChange={e => { setForm({ ...form, year: e.target.value }); setTouched(t => ({ ...t, year: true })); }}
              style={showErr('year') && errors.year ? errorInputStyle : inputStyle}
              required
            >
              <option value="">{koNode("연도")}</option>
              {koNode(Array.from({ length: 127 }, (_, i) => 2026 - i).map(yr => (
                <option key={yr} value={String(yr)}>{koNode(yr)}</option>
              )))}
            </select>
            <FieldError msg={showErr('year') ? errors.year : ''} />
          </div>
          <div>
            <select
              value={form.month}
              onChange={e => { setForm({ ...form, month: e.target.value }); setTouched(t => ({ ...t, month: true })); }}
              style={showErr('month') && errors.month ? errorInputStyle : inputStyle}
              required
            >
              <option value="">{koNode("달")}</option>
              {koNode(Array.from({ length: 12 }, (_, i) => i + 1).map(mo => (
                <option key={mo} value={String(mo)}>{koNode(mo)}{koNode("달")}</option>
              )))}
            </select>
            <FieldError msg={showErr('month') ? errors.month : ''} />
          </div>
          <div>
            <select
              value={form.day}
              onChange={e => { setForm({ ...form, day: e.target.value }); setTouched(t => ({ ...t, day: true })); }}
              style={showErr('day') && errors.day ? errorInputStyle : inputStyle}
              required
            >
              <option value="">{koNode("날짜")}</option>
              {koNode(Array.from({ length: 31 }, (_, i) => i + 1).map(dy => (
                <option key={dy} value={String(dy)}>{koNode(dy)}{koNode("일")}</option>
              )))}
            </select>
            <FieldError msg={showErr('day') ? errors.day : ''} />
          </div>
        </div>
      </div>

      {/* ── 出生地点 ── */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '11px', color: labelClr, marginBottom: '6px', letterSpacing: '0.05em' }}>{koNode("출생지(진태양시 수정용)")}</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <select
            value={form.province}
            onChange={e => handleProvince(e.target.value)}
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = focusBorder; }}
            onBlur={e => { e.target.style.borderColor = inputBorder; }}
          >
            <option value="">{koNode("지방/지방자치단체")}</option>
            {koNode(PROVINCES.map(p => (
              <option key={p.name} value={p.name}>{koNode(p.name)}</option>
            )))}
          </select>
          <select
            value={form.city}
            onChange={e => handleCity(e.target.value)}
            disabled={!form.province}
            style={{ ...inputStyle, opacity: form.province ? 1 : 0.45 }}
            onFocus={e => { e.target.style.borderColor = focusBorder; }}
            onBlur={e => { e.target.style.borderColor = inputBorder; }}
          >
            <option value="">{koNode(form.province ? '城市' : '先选省份')}</option>
            {koNode(cityList.map(c => (
              <option key={c.name} value={c.name}>{koNode(c.name)}</option>
            )))}
          </select>
        </div>
        <AnimatePresence mode="wait">
          {koNode(form.province ? (
            <motion.p
              key="location-info"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ fontSize: '10px', color: isDark ? 'rgba(180,210,235,0.85)' : 'rgba(100,70,10,0.5)', marginTop: '5px' }}
            >
              {koNode(form.city || '（请选择城市）')}{koNode("· 경도")}{koNode(form.longitude.toFixed(1))}{koNode("°E·총 시차")}{koNode(offsetMin > 0 ? '+' : '')}{koNode(offsetMin)}{koNode("분")}{koNode(solarTime.dateValid ? '（含均时差）' : '')}
            </motion.p>
          ) : (
            <motion.p
              key="location-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ fontSize: '10px', color: isDark ? 'rgba(165,185,210,0.7)' : 'rgba(140,100,20,0.45)', marginTop: '5px' }}
            >{koNode("* 니하이샤는 진태양시로 지정됩니다. 시진을 자동으로 수정하려면 출생지를 입력하는 것이 좋습니다.")}</motion.p>
          ))}
        </AnimatePresence>
      </div>

      {/* ── 出生时间 ── */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '11px', color: labelClr, marginBottom: '6px', letterSpacing: '0.05em' }}>{koNode("태어난 시간 (베이징 시간)")}</label>
        <div style={{ borderRadius: '14px', padding: '12px', background: panelBg, border: `1px solid ${panelBorder}`, opacity: form.unknownTime ? 0.45 : 1, pointerEvents: form.unknownTime ? 'none' : 'auto', transition: 'opacity 0.2s' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <select
              value={form.clockHour}
              onChange={e => setForm({ ...form, clockHour: e.target.value })}
              style={inputStyle}
            >
              {koNode(Array.from({ length: 24 }, (_, i) => i).map(h => (
                <option key={h} value={String(h)}>{koNode(h.toString().padStart(2, '0'))}{koNode("시")}</option>
              )))}
            </select>
            <select
              value={form.clockMinute}
              onChange={e => setForm({ ...form, clockMinute: e.target.value })}
              style={inputStyle}
            >
              {koNode(Array.from({ length: 60 }, (_, i) => i).map(min => (
                <option key={min} value={String(min)}>{koNode(min.toString().padStart(2, '0'))}{koNode("포인트")}</option>
              )))}
            </select>
          </div>
          {/* 真太阳时结果 */}
          <div style={{ textAlign: 'center', padding: '4px 0' }}>
            <span style={{ fontSize: '10px', color: isDark ? 'rgba(170,195,220,0.75)' : 'rgba(140,100,20,0.5)' }}>{koNode("진태양시 →")}</span>
            <span style={{ fontSize: '15px', color: goldText, fontWeight: 600, letterSpacing: '0.08em' }}>
              {koNode(SHICHEN_NAMES[branch])}{koNode("시")}</span>
            {koNode(shichenInfo && (
              <span style={{ fontSize: '10px', color: isDark ? 'rgba(170,195,220,0.75)' : 'rgba(140,100,20,0.5)', marginLeft: '4px' }}>
                （{koNode(shichenInfo.range)}）
              </span>
            ))}
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '7px', marginTop: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={form.unknownTime}
            onChange={e => setForm({ ...form, unknownTime: e.target.checked })}
            style={{ width: '14px', height: '14px', borderRadius: '4px', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '10px', color: isDark ? 'rgba(165,185,210,0.7)' : 'rgba(140,100,20,0.45)' }}>{koNode("태어난 시간을 모릅니다. 자시로 시작합니다. (23:00–01:00)")}</span>
        </label>
      </div>

      {/* ── 性别 ── */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '11px', color: labelClr, marginBottom: '6px', letterSpacing: '0.05em' }}>{koNode("성별")}</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          {koNode((['male', 'female'] as const).map(g => {
            const active = form.gender === g;
            const isMale = g === 'male';
            const accent = isMale ? '37,99,235' : '225,29,72';
            return (
              <motion.button
                key={g}
                type="button"
                onClick={() => setForm({ ...form, gender: g })}
                whileTap={{ scale: 0.97 }}
                style={{
                  flex: 1,
                  padding: '11px',
                  borderRadius: '14px',
                  fontSize: '13px',
                  fontWeight: 500,
                  border: `1px solid ${active ? `rgba(${accent},0.6)` : inputBorder}`,
                  background: active ? `rgba(${accent},0.08)` : inputBg,
                  color: active ? `rgba(${accent},0.9)` : (isDark ? 'rgba(190,205,225,0.7)' : 'rgba(100,80,40,0.4)'),
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
              >
                {koNode(isMale ? '♂ 男' : '♀ 女')}
              </motion.button>
            );
          }))}
        </div>
      </div>

      {/* ── 确认信息 Summary Chip ── */}
      <AnimatePresence>
        {koNode(showSummary && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto', marginBottom: 12 }}
            exit={{ opacity: 0, y: -8, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div style={{
              background: summaryBg,
              border: `1px solid ${summaryBorder}`,
              borderRadius: '12px',
              padding: '9px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ fontSize: '12px', color: summaryClr }}>✓</span>
              <span style={{ fontSize: '11px', color: summaryClr, letterSpacing: '0.03em', flex: 1 }}>
                {koNode(summaryText)}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ── 提交按钮 ── */}
      {koNode(!hideSubmit && <motion.button
        type="submit"
        disabled={loading}
        whileHover={loading ? {} : { scale: 1.01 }}
        whileTap={loading ? {} : { scale: 0.98 }}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '16px',
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '0.15em',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          background: loading
            ? (isDark ? 'rgba(212,168,67,0.15)' : 'rgba(180,120,20,0.15)')
            : (isDark
              ? 'linear-gradient(135deg, rgba(180,130,40,0.9), rgba(240,200,80,0.9))'
              : 'linear-gradient(135deg, #9a6210, #c88020)'),
          color: loading ? (isDark ? 'rgba(212,168,67,0.4)' : 'rgba(120,80,10,0.4)') : (isDark ? '#08080a' : '#fff8e8'),
          boxShadow: loading ? 'none' : (isDark ? '0 4px 20px rgba(212,168,67,0.2)' : '0 4px 16px rgba(140,100,20,0.25)'),
          transition: 'all 0.2s',
        }}
      >
        {koNode(loading ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%' }}
            />{koNode("자미 거래 시작…")}</span>
        ) : "지금 거래를 시작하세요 · 운명의 코드를 잠금 해제하세요")}
      </motion.button>)}
    </motion.form>
  );
}
