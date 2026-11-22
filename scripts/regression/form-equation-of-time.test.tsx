import { ko } from '../../lib/i18n/ko';
/* * 웹 양식은 평균 시차를 고려해야 합니다. 고정된 샘플은 true-solar-time.ts의 NOAA 표준을 따릅니다. */
import assert from 'node:assert/strict';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import BirthForm, { type BirthFormState } from '../../components/BirthForm';
import { formToBirthInfo, formToSearchParams, searchParamsToForm } from '../../lib/ziwei/share';

// Palace-minor-stars.test.tsx와 일치하며 tsx 독립 실행형 런타임의 클래식 JSX 변환과 호환됩니다.
Object.assign(globalThis, { React });

function formAt(overrides: Partial<BirthFormState> = {}): BirthFormState {
  return {
    name: '', year: '2000', month: '11', day: '3',
    clockHour: '10', clockMinute: '50', unknownTime: false,
    province: '测试', city: '测试', longitude: 120, gender: 'male',
    ...overrides,
  };
}

const pick = (birth: ReturnType<typeof formToBirthInfo>) => ({
  year: birth.year, month: birth.month, day: birth.day, hour: birth.hour,
});
const render = (form: BirthFormState) => renderToStaticMarkup(
  React.createElement(BirthForm, { initialData: form, onSubmit: () => {} }),
);
const cases = [
  {
    label: "양의 평균 시차는 약 +16.36분입니다: 10:50 → 11:06, 사시가 오시로 교차합니다.",
    form: formAt(), expected: { year: 2000, month: 11, day: 3, hour: 6 }, branch: '午', correction: '+16',
  },
  {
    label: "음의 평균 시차는 약 -14.19분입니다: 11:10 → 10:55, 오시는 사시로 돌아갑니다.",
    form: formAt({ month: '2', day: '11', clockHour: '11', clockMinute: '10' }),
    expected: { year: 2000, month: 2, day: 11, hour: 5 }, branch: '巳', correction: '-14',
  },
  {
    label: "양의 평균 시차가 야자시로 교차하므로 기존 익일 규칙에 따라 요일이 변경되어야 합니다.",
    form: formAt({ clockHour: '22' }),
    expected: { year: 2000, month: 11, day: 4, hour: 0 }, branch: '子', correction: '+16',
  },
  {
    label: "음의 평균 시차는 해시로 돌아가고 23시 방향에서는 날짜를 변경할 수 없습니다.",
    form: formAt({ month: '2', day: '11', clockHour: '23', clockMinute: '10' }),
    expected: { year: 2000, month: 2, day: 11, hour: 11 }, branch: '亥', correction: '-14',
  },
  {
    label: "양의 평균 시차는 자정을 지나 하루만 전달됩니다.",
    form: formAt({ clockHour: '23' }),
    expected: { year: 2000, month: 11, day: 4, hour: 0 }, branch: '子', correction: '+16',
  },
  {
    label: "음의 평균 시차가 전날 23포인트로 돌아왔고, 야자시 규칙이 후퇴를 상쇄했다.",
    form: formAt({ month: '2', day: '11', clockHour: '0', clockMinute: '10' }),
    expected: { year: 2000, month: 2, day: 11, hour: 0 }, branch: '子', correction: '-14',
  },
  {
    label: "경도보정 -80분 평균시차 중첩 : 12:10 → 11:06",
    form: formAt({ longitude: 100, clockHour: '12', clockMinute: '10' }),
    expected: { year: 2000, month: 11, day: 3, hour: 6 }, branch: '午', correction: '-64',
  },
];

for (const { label, form, expected, branch, correction } of cases) {
  assert.deepEqual(pick(formToBirthInfo(form)), expected, label);
  const html = render(form);
  assert.ok(html.includes(`>${ko(branch)}시<`), `양식 미리보기는 제출물과 일치해야 합니다.${label}`);
  assert.ok(html.includes(`총 시차${correction}분`), `총 수정량 표시:${label}`);
  const restored = searchParamsToForm(formToSearchParams(form));
  assert.ok(restored);
  assert.deepEqual(formToBirthInfo({ ...formAt(), ...restored }), formToBirthInfo(form), `공유 링크 재생:${label}`);
}

// 동일한 시계 시간과 경도에 대해 날짜만 변경하면 평균 시차도 시진로 변경됩니다.
const winter = formAt({ month: '2', day: '11' });
assert.equal(formToBirthInfo(winter).hour, 5);
assert.ok(render(winter).includes('>사시<'));
assert.ok(render(formAt()).includes('>오시<'));

const control = formAt({ clockMinute: '20' });
assert.equal(formToBirthInfo(control).hour, 5, "경계에서 멀리 떨어진 예는 여전히 사시입니다.");

const noLocation = formAt({ province: '', city: '' });
assert.equal(formToBirthInfo(noLocation).hour, 5, "출생지를 기재하지 않은 경우에는 평균 시차가 적용되지 않습니다.");
assert.equal(formToBirthInfo(noLocation).longitude, undefined);
assert.ok(render(noLocation).includes('>사시<'));

const unknown = formAt({ clockHour: '22', unknownTime: true });
assert.deepEqual(pick(formToBirthInfo(unknown)), { year: 2000, month: 11, day: 3, hour: 0 }, "시진 알 수 없음 자시로 원래 날짜 유지");
assert.ok(render(unknown).includes('>자시<'));

const incomplete = formAt({ year: '', month: '', day: '', longitude: 100, clockHour: '12', clockMinute: '10' });
assert.deepEqual(pick(formToBirthInfo(incomplete)), { year: 0, month: 0, day: 0, hour: 5 }, "날짜를 입력하지 않으면 경도 보정이 적용되어 잘못된 날짜가 생성되지 않습니다.");
assert.ok(!render(incomplete).includes('NaN'), "날짜가 없는 미리보기에는 NaN이 포함되어서는 안 됩니다.");

console.log('Web form equation-of-time regression passed: preview, submission, rollover and sharing');
