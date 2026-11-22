/* *
 * BirthForm → BirthInfo 변환 일관성 회귀
 *
 * 배경: `BirthFormState → BirthInfo`의 변환은 이 창고의 한 곳에서만 구현되어야 합니다——
 * "야자시 일 변경"을 담당하는 `lib/ziwei/share.ts`의 `formToBirthInfo()` :
 *진태양시 23:00–23:59 생년월일은 **다음날**배반입니다. 이 규칙은 세 가지 사양 확인에서 공유됩니다.
 * · `lib/ziwei/types.ts`는 `BirthInfo.year`가 "자시 날짜 변경으로 수정된 배반 날짜"임을 선언합니다.
 * · `README.md` 시진 비교표의 다음 줄: "23:00~23:59(야자시)에 태어났다면 다음날 배반 및 시진에 대해 0을 취합니다.";
 * · `scripts/regression/iztro-time-index-boundary.test.ts`는 이를 주장으로 확정했습니다.
 *
 * 하지만 `components/BirthForm.tsx`의 `handleSubmit`는 한번 BirthInfo를 스스로 조립하면,
 * `year/month/day`는 날짜 변경을 우회하고 양식의 원래 값을 직접 사용합니다. 따라서 동일한 출생 입력은 다음과 같습니다.
 * · `/chart` (`BirthForm.onSubmit` → `generateChart`)는 "채우는 날" 디스크를 방전합니다.
 * · `/heming`(`formToBirthInfo` → `generateChart`)는 "다음날" 디스크를 방전합니다.
 * 두 경로는 하루 전체가 다르며 전체 명반(Zodiac, Xingyao, 사화)가 다릅니다.
 *
 * 이 반환은 세 가지 사항을 결정합니다.
 * 1. BirthForm은 `formToBirthInfo`를 재사용해야 하며 BirthInfo를 직접 조립할 수 없습니다.
 * 2. BirthForm은 `formToTrueSolarTime`를 재사용해야 합니다(진태양시에는 구현이 하나만 있습니다).
 * 3. 야자시 / 조자시 `formToBirthInfo`의 경계 동작(월 및 연도 간 캐리 포함).
 *
 * 항목 1, 2는 소스코드 분석을 기반으로 작성되었습니다(컴포넌트는 .tsx이고, 웨어하우스에는 DOM 테스트 환경이 없습니다).
 *`famous-hour-consistency.test.ts`와 동일한 방법입니다. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { formToBirthInfo } from '../../lib/ziwei/share';
import type { BirthFormState } from '../../components/BirthForm';

const src = readFileSync(new URL('../../components/BirthForm.tsx', import.meta.url), 'utf8');

// ── 1) 변환 구현은 하나만 있습니다. BirthForm은 share.ts를 재사용해야 합니다. ───────────────
assert.match(
  src,
  /import\s*\{[^}]*\bformToBirthInfo\b[^}]*\}\s*from\s*'@\/lib\/ziwei\/share'/,
  "BirthForm은 @/lib/ziwei/share에서 formToBirthInfo를 가져와야 하며 BirthInfo의 철자를 직접 입력할 수 없습니다.",
);

assert.equal(
  /onSubmit\(\s*\{/.test(src),
  false,
  "BirthForm의 onSubmit은 수동으로 철자가 지정된 객체 리터럴을 수신해서는 안 됩니다. 날짜가 변경되면 야자시가 우회됩니다. 대신 formToBirthInfo를 사용하십시오.",
);

// ── 2) 진태양시시진에는 구현이 하나만 있습니다 ────────────────────────────────
assert.match(
  src,
  /import\s*\{[^}]*\bformToTrueSolarTime\b[^}]*\}\s*from\s*'@\/lib\/ziwei\/share'/,
  "BirthForm은 share.ts의 formToTrueSolarTime을 재사용해야 하며 전체 수정 사항을 미리 보고 제출하여 공유해야 합니다.",
);

// ── 3) formToBirthInfo의 경계 동작 ──────────────────────────────
function formAt(
  year: string,
  month: string,
  day: string,
  clockHour: string,
  clockMinute = '30',
  overrides: Partial<BirthFormState> = {},
): BirthFormState {
  return {
    name: '',
    year,
    month,
    day,
    clockHour,
    clockMinute,
    unknownTime: false,
    province: '',
    city: '',
    longitude: 120,
    gender: 'male',
    ...overrides,
  };
}

const pick = (b: ReturnType<typeof formToBirthInfo>) => ({
  year: b.year,
  month: b.month,
  day: b.day,
  hour: b.hour,
});

// 야자시: 다음날 배반 및 시진에 따라 0을 취합니다.
assert.deepEqual(
  pick(formToBirthInfo(formAt('2000', '1', '31', '23'))),
  { year: 2000, month: 2, day: 1, hour: 0 },
  "1/31 23:30 야자시는 2/1, 시진 분기 0에 대기열에 있어야 합니다.",
);
assert.deepEqual(
  pick(formToBirthInfo(formAt('2000', '12', '31', '23'))),
  { year: 2001, month: 1, day: 1, hour: 0 },
  "새해 전야: 12/31 23:30은 다음 해 1/1로 예정되어야 합니다.",
);
assert.deepEqual(
  pick(formToBirthInfo(formAt('2000', '2', '28', '23'))),
  { year: 2000, month: 2, day: 29, hour: 0 },
  "윤년: 2/28 23:30은 2/29로 예정되어야 합니다.",
);
assert.deepEqual(
  pick(formToBirthInfo(formAt('2001', '2', '28', '23'))),
  { year: 2001, month: 3, day: 1, hour: 0 },
  "평년: 2/28 23:30은 3/1로 예정되어야 합니다.",
);
assert.deepEqual(
  pick(formToBirthInfo(formAt('2000', '1', '31', '23', '0'))),
  { year: 2000, month: 2, day: 1, hour: 0 },
  "출생지를 기재하지 않으시면 수정이 되지 않습니다. 23:00 정시에 야자시를 입력하세요.",
);

// 조자시 및 22:xx: 요일 변경 없음
assert.deepEqual(
  pick(formToBirthInfo(formAt('2000', '1', '31', '0'))),
  { year: 2000, month: 1, day: 31, hour: 0 },
  "00:30 조자시는 오늘 그대로 유지되며 시진는 동일한 0을 지원합니다.",
);
assert.deepEqual(
  pick(formToBirthInfo(formAt('2000', '1', '31', '22', '59'))),
  { year: 2000, month: 1, day: 31, hour: 11 },
  "22:59는 해시이므로 날짜를 변경하면 안 됩니다.",
);

// 시진Unknown: 날짜 변경 없음, 출금 0
assert.deepEqual(
  pick(formToBirthInfo(formAt('2000', '1', '31', '23', '30', { unknownTime: true }))),
  { year: 2000, month: 1, day: 31, hour: 0 },
  "시진를 알 수 없는 경우 야자시를 사용하여 날짜를 변경하지 마세요.",
);

console.log("✅ BirthForm→BirthInfo 변환 일관성: 단일 구현 + 야자시 경계(월별/연도별)가 정확합니다.");
