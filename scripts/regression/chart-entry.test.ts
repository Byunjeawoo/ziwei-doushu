/* *
 * 진태양시배반 진입 회귀 테스트.
 *
 * 핵심 주장(PR #69 유지관리자가 요청함): 새 항목 `resolveTrueSolarBirthInfo`가 일치해야 함
 * 웹 양식 경로 `formToBirthInfo`는 동일한 출생 입력에서 동일한 경로를 사용합니다.
 * 배반 일과 시진 분기는 일관성이 있어야 합니다. 둘 다 내부적으로만 사용됩니다.
 *`calculateTrueSolarTime` + `resolveZiweiDayOffset` + `shiftGregorianDate`,
 * 야자시는 **진태양시**(#63구경)에 따라 판정됩니다.
 *
 * 적용 범위:
 * 1. 제로 복귀 - 클럭이 없을 때 비트 단위로 `generateChart` 직접 조정과 일치함
 * 2. 일관성 - 유지관리자가 제공하는 4가지 제어 세트(기대값 주장 포함)
 * 3. 일관성 - 동서 방향의 여러 경도에서 23점 / 0점 / 1점
 * 4. 일관성 - 윤년의 월말, 연말, 2월말 경계
 * 5. 해외 시간대 - utcOffsetMinutes는 시계/옵트를 통해 투명하게 전송됩니다.
 * 6. extractClock 및 잘못된 시간 오류 보고 */

import {
  generateTrueSolarChart,
  resolveTrueSolarBirthInfo,
  extractClock,
  type ClockBirthInput,
} from '../../lib/ziwei/chart-entry';
import { generateChart } from '../../lib/ziwei/algorithm';
import { formToBirthInfo } from '../../lib/ziwei/share';
import type { BirthFormState } from '../../components/BirthForm';
import type { BirthInfo } from '../../lib/ziwei/types';

let passed = 0;
let failed = 0;

function check(name: string, cond: boolean, detail?: string) {
  if (cond) {
    passed++;
    console.log(`✓ ${name}`);
  } else {
    failed++;
    console.log(`✗ ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

function eq(name: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  check(name, a === e, a === e ? '' : `got ${a}, expected ${e}`);
}

/* * 디스크의 "디스크 지문"을 가져옵니다 - 황금 일관성 어설션에 사용됩니다. */
function fingerprint(chart: any) {
  return {
    mingGong: chart.mingGongBranch,
    shenGong: chart.shenGongBranch,
    wuxingJu: chart.wuxingJu,
    palaces: chart.palaces
      .map((p: any) => `${p.name}:${p.branch}:${p.stars.map((s: any) => s.name).join('')}`)
      .sort(),
    siHua: chart.palaces
      .flatMap((p: any) => p.stars.filter((s: any) => s.siHua).map((s: any) => `${p.name}:${s.name}:${s.siHua}`))
      .sort(),
  };
}

const pick = (b: BirthInfo) => [b.year, b.month, b.day, b.hour];

interface ConsistencyCase {
  name: string;
  year: number;
  month: number;
  day: number;
  clockHour: number;
  clockMinute: number;
  longitude: number;
  /* * 비교 테이블 [년, 월, 일, 시진 분기 인덱스]에 대한 관리자의 기대, 4 세트의 비교만 가능합니다. */
  expect?: [number, number, number, number];
}

/* * 동일한 출생 입력이 각각 새로운 입구와 formToBirthInfo를 통과하여 배반 + 시진가 일관성이 있다고 주장합니다. */
function assertConsistent(c: ConsistencyCase) {
  const bi: BirthInfo = {
    year: c.year, month: c.month, day: c.day, hour: 0,
    gender: 'male', province: '测试省', longitude: c.longitude,
  };
  const clock: ClockBirthInput = {
    year: c.year, month: c.month, day: c.day,
    clockHour: c.clockHour, clockMinute: c.clockMinute,
  };
  const viaEntry = pick(resolveTrueSolarBirthInfo(bi, clock));

  const form: BirthFormState = {
    name: '',
    year: String(c.year), month: String(c.month), day: String(c.day),
    clockHour: String(c.clockHour), clockMinute: String(c.clockMinute),
    unknownTime: false,
    province: '测试省', city: '', longitude: c.longitude,
    gender: 'male',
  };
  const viaForm = pick(formToBirthInfo(form));

  eq(`일관성:${c.name}`, viaEntry, viaForm);
  if (c.expect) {
    eq(`예상 값:${c.name}`, viaEntry, c.expect);
  }
}

// ─────────────────────────────────────────────────────────────
// 1. 영점 복귀: 경도 및 시계 없음 → generateChart와 정확히 동일
// ─────────────────────────────────────────────────────────────
{
  const bi: BirthInfo = { year: 1985, month: 8, day: 8, hour: 4, gender: 'male' };
  const direct = fingerprint(generateChart(bi));
  const viaEntry = fingerprint(generateTrueSolarChart(bi));
  eq("0 반환: 경도 및 시간 없음 → 디스크가 generateChart와 일치함", viaEntry, direct);
}

// ─────────────────────────────────────────────────────────────
// 2. 관리자는 4세트의 비교(모두 UTC+8)를 수행하고 동시에 예상 값이 두 경로 모두와 일치한다고 주장합니다.
// 이 PR의 이전 구현 결과는 다음과 같습니다. 06-15 Hai / 2026-01-01 Zi / 06-15 Zi / 06-15 Zi
// ─────────────────────────────────────────────────────────────
assertConsistent({
  name: "경도 80°, 2025-06-15 01:30 → 06-14 하이 (진태양시는 전날로 교차)",
  year: 2025, month: 6, day: 15, clockHour: 1, clockMinute: 30, longitude: 80,
  expect: [2025, 6, 14, 11],
});
assertConsistent({
  name: "홍콩(114.17°), 2025-12-31 23:00 → 12-31 하이(진태양시 22:34, 요일변경 없음)",
  year: 2025, month: 12, day: 31, clockHour: 23, clockMinute: 0, longitude: 114.17,
  expect: [2025, 12, 31, 11],
});
assertConsistent({
  name: "우루무치(87.6°), 2025-06-15 00:30 → 06-14 하이(진태양시는 전날 밤)",
  year: 2025, month: 6, day: 15, clockHour: 0, clockMinute: 30, longitude: 87.6,
  expect: [2025, 6, 14, 11],
});
assertConsistent({
  name: "경도 135°, 2025-06-15 22:30 → 06-16 (진태양시가 23:00을 지났고, 야자시가 날짜를 변경했습니다)",
  year: 2025, month: 6, day: 15, clockHour: 22, clockMinute: 30, longitude: 135,
  expect: [2025, 6, 16, 0],
});

// ─────────────────────────────────────────────────────────────
// 3. 동서 방향의 다중 경도 × 23점 / 0점 / 1점
// ─────────────────────────────────────────────────────────────
for (const longitude of [135, 120, 100, 80]) {
  for (const [clockHour, clockMinute] of [[23, 30], [0, 30], [1, 30]] as const) {
    assertConsistent({
      name: `경도${longitude}°，2025-06-15 ${String(clockHour).padStart(2, '0')}:${clockMinute}`,
      year: 2025, month: 6, day: 15, clockHour, clockMinute, longitude,
    });
  }
}

// ─────────────────────────────────────────────────────────────
// 4. 월말/연말/윤년 경계(교차 방향에 대해 하나)
// ─────────────────────────────────────────────────────────────
assertConsistent({
  name: "월말로 이동: 2025-01-31 01:30, 동경 80°",
  year: 2025, month: 1, day: 31, clockHour: 1, clockMinute: 30, longitude: 80,
});
assertConsistent({
  name: "월말에서 역방향 교차일: 2025-03-31 22:30, 동경 135°",
  year: 2025, month: 3, day: 31, clockHour: 22, clockMinute: 30, longitude: 135,
});
assertConsistent({
  name: "연말 앞날 : 2025-12-31 01:30, 동경 80°",
  year: 2025, month: 12, day: 31, clockHour: 1, clockMinute: 30, longitude: 80,
});
assertConsistent({
  name: "연초부터 : 2026-01-01 01:30, 동경 80°",
  year: 2026, month: 1, day: 1, clockHour: 1, clockMinute: 30, longitude: 80,
});
assertConsistent({
  name: "윤년의 2월 말은 하루를 거꾸로 지나갑니다: 2024-02-29 22:30, 동경 135°",
  year: 2024, month: 2, day: 29, clockHour: 22, clockMinute: 30, longitude: 135,
});
assertConsistent({
  name: "평년 2월말 기준 : 2025-02-28 22:30, 동경 135°",
  year: 2025, month: 2, day: 28, clockHour: 22, clockMinute: 30, longitude: 135,
});

// ─────────────────────────────────────────────────────────────
// 5. 해외 시간대: utcOffsetMinutes 투명 전송
// 뉴욕(경도 -74°, 표준시 UTC-5) 2025-06-15 01:30:
// -300을 전달 → 현지 시간대에 따라 계산하고 날짜를 변경하지 마세요. 전송하지 않음 → 동8구를 기준으로 계산하면 전날로 점프됩니다.
// ─────────────────────────────────────────────────────────────
{
  const bi: BirthInfo = { year: 2025, month: 6, day: 15, hour: 5, gender: 'male', longitude: -74.0 };
  const clock: ClockBirthInput = { year: 2025, month: 6, day: 15, clockHour: 1, clockMinute: 30 };

  const viaOpts = resolveTrueSolarBirthInfo(bi, clock, { utcOffsetMinutes: -300 });
  eq("opts를 통해 전달된 utcOffsetMinutes: New York 01:30은 요일을 변경하지 않습니다.", pick(viaOpts), [2025, 6, 15, 1]);

  const viaClock = resolveTrueSolarBirthInfo(bi, { ...clock, utcOffsetMinutes: -300 });
  eq("utcOffsetMinutes는 시계를 통해 투명하게 전송됩니다. 결과는 opts와 동일합니다.", pick(viaClock), pick(viaOpts));

  const clockWins = resolveTrueSolarBirthInfo(
    bi, { ...clock, utcOffsetMinutes: -300 }, { utcOffsetMinutes: 480 });
  eq("utcOffsetMinutes 우선순위: 시계가 opts보다 높습니다.", pick(clockWins), pick(viaOpts));

  const noOffset = resolveTrueSolarBirthInfo(bi, clock);
  check("utcOffsetMinutes를 전달하지 않음 → 여전히 East Eighth District를 누르십시오(기존 동작과 일치하며 매개변수 전달 결과와 다름).",
    JSON.stringify(pick(noOffset)) !== JSON.stringify(pick(viaOpts)),
    `noOffset=${JSON.stringify(pick(noOffset))}`);
}

// ─────────────────────────────────────────────────────────────
// 6. lateZishi 장르 투명 전송: 현재 시간 야자시는 요일을 변경하지 않습니다.
// ─────────────────────────────────────────────────────────────
{
  const bi: BirthInfo = { year: 2025, month: 6, day: 15, hour: 0, gender: 'male', longitude: 120 };
  const clock: ClockBirthInput = { year: 2025, month: 6, day: 15, clockHour: 23, clockMinute: 30 };
  eq("lateZishi 기본 익일 : 진태양시 23:30 일 변경",
    pick(resolveTrueSolarBirthInfo(bi, clock)), [2025, 6, 16, 0]);
  eq("lateZishi 현재일：야자시는 날짜를 변경하지 않습니다.",
    pick(resolveTrueSolarBirthInfo(bi, clock, { lateZishi: 'current-day' })), [2025, 6, 15, 0]);
}

// ─────────────────────────────────────────────────────────────
// 7. extractClock: origInput에서 시계를 가져옵니다.
// ─────────────────────────────────────────────────────────────
{
  const c = extractClock({
    year: 1985, month: 8, day: 8, hour: 4, gender: 'male',
    origInput: { year: 1985, month: 8, day: 8, clockHour: 7, clockMinute: 40 },
  });
  eq("extractClock: origInput에서 시계를 추출합니다.", c && [c.clockHour, c.clockMinute], [7, 40]);

  const none = extractClock({ year: 1985, month: 8, day: 8, hour: 4, gender: 'male' });
  check("extractClock: 없음 origInput → null", none === null);
}

// ─────────────────────────────────────────────────────────────
// 8. 불법 시계는 자동으로 디스크 오류를 생성하는 대신 오류로 보고되어야 합니다.
// ─────────────────────────────────────────────────────────────
{
  let threw = false;
  try {
    resolveTrueSolarBirthInfo(
      { year: 1985, month: 8, day: 8, hour: 4, gender: 'male', longitude: 120 },
      { year: 1985, month: 8, day: 8, clockHour: 25, clockMinute: 0 },
    );
  } catch (e) {
    threw = true;
  }
  check("잘못된 시간(25시) → 오류 발생, 조용히 오류를 발생시키지 않는 디스크", threw);
}

console.log(`\n${failed === 0 ? '✓' : '✗'}진태양시 입구 반환:${passed}/를 통해${failed}실패했다`);
if (failed > 0) process.exit(1);
