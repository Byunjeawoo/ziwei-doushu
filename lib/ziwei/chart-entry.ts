/* *
 * 진태양시배반 항목 - `generateChart`에 직접 전화하는 도서관 사용자용입니다.
 *
 * ##이 파일이 왜 필요한가요?
 *
 * `BirthInfo.longitude`는 `types.ts`에 "출생지 경도(진태양시 보정에 사용)"로 표시되어 있으며,
 * 단, `generateChart`(`lib/ziwei/algorithm.ts`)는 `{ year, month, day, hour, gender }`만 분해하고,
 * 절대로 `longitude`를 읽지 마세요. 결과: 라이브러리 사용자가 `generateChart`를 조정하고 경도를 입력하면
 * 시진은 **어떤 프롬프트도 없이** 자동으로 원래 시계 시간을 그대로 사용합니다.
 *
 * ## 키 제약 조건: hour는 시계 시간이 아닌 시진 분기 인덱스입니다.
 *
 * `BirthInfo.hour`는 시계 시간이 아닌 0~11(0=子, 1=Chou,…, 11=hai)의 **시진 분기 지수**입니다.
 * `generateChart` 따라서 원래 시간을 얻을 수 없으며 직접 진태양시를 계산할 수도 없습니다.
 * 원래 시계는 `BirthInfo.origInput`(선택적 필드)에만 저장되거나 호출자가 명시적으로 전달합니다.
 *
 * 이것이 바로 `generateChart`가 "쉽게" 복구될 수 없는 이유와 이 파일이 존재하는 이유입니다.
 * "원래 시간을 아는 것"의 책임을 발신자에게 맡기고 명시적인 항목을 사용하여 인수하십시오.
 * 이 문서는 `generateChart`의 기존 동작을 **수정하지 않습니다**(기본적으로 활성화된 수정은 파괴적인 변경입니다).
 *
 * ## 구경 : 웹폼 경로와 정확히 동일한 경로
 *
 * 이 항목의 변환 논리는 `share.ts`의 `formToBirthInfo` **라인 단위**와 동일하며 재사용만 가능합니다.
 * 추가 수식을 작성하지 않고도 `true-solar-time.ts`의 세 가지 기성 기능:
 *
 * 태양 = 계산TrueSolarTime(시계 + 경도 + 시간대 오프셋)
 * dayOffset =solveZiweiDayOffset(태양, lateZishi)
 * 배반 day = ShiftGregorianDate(생일, dayOffset) (dateValid인 경우)
 * 시진 분기 = Solar.branch
 *
 * 야자시(진태양시 23:00~23:59) 날짜 변경 여부는 `resolveZiweiDayOffset`에 따라 다릅니다.
 * **진태양시**는 시진 분기와 동일한 구경으로 판단됩니다. 이는 #63이 병합된 후의 엔진 사양입니다.
 * 온라인 배반의 기본 구경이기도 합니다. 참고: README 데이터 세트 장의 "23:00–23:59"는 다음 날을 기준으로 합니다.
 *배반"는 고정 경도 120°의 샘플 세트에만 적용 가능하며 보정이 없으며 엔진 사양으로 사용할 수 없습니다.
 *
 * 회귀 테스트 `chart-entry.test.ts`는 다음을 확인합니다: 동일한 출생 입력,
 * 이 항목은 `formToBirthInfo`의 배반 및 시진 분기와 일치해야 합니다.
 *
 * ## 해외 출생지: utcOffsetMinutes
 *
 * `BirthInfo`에는 시간대 필드가 없습니다. 해외 출생지의 시계 읽기 시간대,
 * `clock.utcOffsetMinutes` 또는 `opts.utcOffsetMinutes`를 통해 명시적이고 투명하게 전달
 * `calculateTrueSolarTime`; 전송되지 않은 경우 엔진은 East Eighth District(480)를 기반으로 계산하며 이는 기존 동작과 일치합니다.
 * 기존 엔진 구경과 일치: 여기서는 **표준 시간** 오프셋만 허용되며 일광 절약 시간은 처리되지 않습니다.
 * 일광 절약 시간제 시계를 읽고 있는 경우 `clock-adjust.ts`를 사용하여 이를 표준 시간으로 변환한 후 전달하세요. */

import { generateChart, type LunarMonthPolicy } from './algorithm';
import {
  calculateTrueSolarTime,
  resolveZiweiDayOffset,
  shiftGregorianDate,
  type LateZishiRule,
} from './true-solar-time';
import type { BirthInfo, ZiweiChart } from './types';

export interface TrueSolarChartOptions {
  /* *
   * 야자시의 요일변경 스타일은 `resolveZiweiDayOffset`로 전송됩니다.
   * - `next-day` (기본값): 다음날 배반에 따라 진태양시 23:00–23:59 (주류 구경, 양식 경로와 일치)
   * - `current-day`: 야자시는 여전히 당시의 배반를 기반으로 합니다.
   * 나머지 두 값은 팔자 구경으로, 자미 메인 디스크에서는 사용되지 않으며 팔자와 정렬해야 할 때만 전달됩니다. */
  lateZishi?: LateZishiRule;
  /* * 윤달 장르 구경은 `generateChart`로 직접 전송됩니다. */
  leapMonth?: LunarMonthPolicy;
  /* *
   * 시계가 읽는 시간대의 표준 오프셋(분 단위, 동쪽 + 서쪽 -)입니다. 뉴욕 표준시 -300.
   * `clock.utcOffsetMinutes`는 이보다 우선순위가 높습니다. 둘 다 전송되지 않으면 동8구(480)로 계산됩니다. */
  utcOffsetMinutes?: number;
}

/* *
 * 출생 시간을 알 때 배반를 입력합니다.
 *`clockHour/clockMinute`는 **시계 판독**(0–23 / 0–59)이며 시진 분기 인덱스와 관련이 없습니다. */
export interface ClockBirthInput {
  year: number;
  month: number;
  day: number;
  clockHour: number;
  clockMinute: number;
  /* * 시계 판독값이 위치한 시간대의 표준 오프셋(분, 동서 마이너스) 통과되지 않은 경우 opts 값이 사용되며, 그렇지 않으면 동쪽 8개 영역이 사용됩니다. */
  utcOffsetMinutes?: number;
}

function isValidClock(hour: number, minute: number): boolean {
  return Number.isInteger(hour) && Number.isInteger(minute)
    && hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

/* *
 * `BirthInfo`에서 원래 영업시간을 검색합니다.
 *
 * 데이터 소스: `birthInfo.origInput` (양식 경로는 자동으로 채워집니다.)
 * 돌아가기 null이 없는 경우 - 지금은 진태양시 수정을 수행할 수 없으며 호출자는 수정되지 않은 디스크를 받게 됩니다. */
export function extractClock(birthInfo: BirthInfo): ClockBirthInput | null {
  const oi = birthInfo.origInput;
  if (oi && isValidClock(oi.clockHour, oi.clockMinute)) {
    return {
      year: oi.year,
      month: oi.month,
      day: oi.day,
      clockHour: oi.clockHour,
      clockMinute: oi.clockMinute,
    };
  }
  return null;
}

/* *
 * "원시 출생 입력 + 경도"를 "진태양시로 수정된 출생 정보"로 변환합니다.
 *
 * 돌아가기의 `BirthInfo`는 `generateChart`에 직접 공급될 수 있습니다.
 * 변환 경로는 `formToBirthInfo`와 정확히 동일합니다(파일 헤더 설명 참조):
 *진태양시 크로스데이(`dayOffset`, 야자시 일일스왑 포함)은 배반데이에 반영되며, 시진은 진태양시로 출금됩니다.
 *
 * @parambirthInfo 원본 입력. `year/month/day`는 사용자가 입력한 **양력**의 생일로 간주됩니다(날짜는 변경되지 않았습니다).
 * @param clock 시계가 알려졌을 때 읽는 원래 시계입니다. 통과하지 못한 경우 `birthInfo.origInput`에서 가져오세요.
 * @param opts.lateZishi 야자시 날짜 변경 장르, 기본 `next-day`(양식 경로와 일치).
 * @param opts.utcOffsetMinutes 시계 판독값이 있는 시간대의 표준 오프셋입니다. `clock`에서 동일한 이름을 가진 필드가 우선적으로 적용됩니다.
 *
 * `clock`가 전달되었지만 잘못된 경우 @throw가 발생합니다(시간은 0~23이 아니고 분은 0~59가 아님). */
export function resolveTrueSolarBirthInfo(
  birthInfo: BirthInfo,
  clock?: ClockBirthInput,
  opts: TrueSolarChartOptions = {},
): BirthInfo {
  const src = clock ?? extractClock(birthInfo);

  // 시 없음 → 수정 불가 → 돌아가기 그대로 경도를 가져와,
  // 다운스트림(진태양시를 직접 호출하는 경우)에는 여전히 처리할 기회가 있습니다.
  if (!src) {
    return birthInfo;
  }
  if (!isValidClock(src.clockHour, src.clockMinute)) {
    throw new RangeError(
      `clock must be valid clock time; received ${src.clockHour}:${src.clockMinute}`,
    );
  }

  const longitude = birthInfo.longitude;
  const hasLongitude = longitude !== undefined && Number.isFinite(longitude);

  // formToBirthInfo와 동일한 경로: 진태양시 → 시진 분기 + 요일 변경 오프셋 → 배반 요일.
  const solar = calculateTrueSolarTime({
    year: src.year,
    month: src.month,
    day: src.day,
    clockHour: src.clockHour,
    clockMinute: src.clockMinute,
    longitude: hasLongitude ? longitude : undefined,
    utcOffsetMinutes: src.utcOffsetMinutes ?? opts.utcOffsetMinutes,
  });

  const dayOffset = resolveZiweiDayOffset(solar, opts.lateZishi ?? 'next-day');
  const chartDate = dayOffset !== 0 && solar.dateValid
    ? shiftGregorianDate({ year: src.year, month: src.month, day: src.day }, dayOffset)
    : { year: src.year, month: src.month, day: src.day };

  return {
    ...birthInfo,
    year: chartDate.year,
    month: chartDate.month,
    day: chartDate.day,
    hour: solar.branch,
  };
}

/* *
 * 진태양시배반 항목 - 출생 시간을 알 때 사용됩니다.
 *
 * @parambirthInfo 원본 입력. `year/month/day`는 사용자가 날짜를 변경하지 않고 입력한 양력의 생일로 간주됩니다.
 * @param clock 시계가 알려졌을 때 읽는 원래 시계입니다. 통과하지 못한 경우 `birthInfo.origInput`에서 가져오세요.
 * @param opts.lateZishi 야자시 날마다 바뀌는 장르, 기본 `next-day`.
 *
 * 행동:
 * - 경도 및 시간 없음 → 직접 조정 `generateChart`(영점 복귀)와 정확히 동일합니다.
 * - 경도와 시가 있습니다 → 진태양시에 따라 배반 요일과 시진 분기를 수정하여 양식 경로 결과와 일치합니다. */
export function generateTrueSolarChart(
  birthInfo: BirthInfo,
  clock?: ClockBirthInput,
  opts: TrueSolarChartOptions = {},
): ZiweiChart {
  const resolved = resolveTrueSolarBirthInfo(birthInfo, clock, opts);
  return generateChart(resolved, { leapMonth: opts.leapMonth });
}
