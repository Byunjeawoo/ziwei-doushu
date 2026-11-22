/* *
 * 반환: 중국 본토의 일광 절약 시간 결정은 매일 표준 구경과 일치해야 합니다.
 *
 * 방법은 이 창고의 "Oracle Difference"를 따릅니다. 표준 XLS_CN 일광 절약 시간표와 판단 기능은 독립적으로 기록됩니다**
 * 오라클로서 1930년 1월 1일부터 1995년 12월 31일까지 매일 철저한 비교를 실시했습니다. 최종 돌연변이 테스트에서는 이 비교가 오류를 포착할 수 있음이 입증되었습니다.
 * 필사 기준: 대중적인 표준에 따라 정리된 수년간 중국 본토의 일광 절약 시간의 시작과 종료에 대한 표입니다.
 *
 * 심각하게 생각해볼 가치가 있는 이유: 일광 절약 시간 차이는 1시간, 시진는 2시간 차이——
 * 출생시간이 시진 경계에 해당하는 사람의 경우 명궁/신궁/대한가 완전히 대체됩니다. */
import { isChinaDST, isChinaDSTYear, chinaDSTRange, chinaDSTYears } from '../../lib/ziwei/dst-cn';

/* ── oracle: 테스트된 구현을 언급하지 않고 대중적인 표준에 따라 독립적으로 구성되었습니다. ────────────────── */
const ORACLE_XLS_CN: number[][] = [[1935, 5, 1, 9, 30], [1936, 5, 1, 9, 30], [1937, 5, 1, 9, 30], [1938, 5, 1, 9, 30], [1939, 5, 1, 9, 30], [1940, 5, 1, 9, 30], [1941, 5, 1, 9, 30], [1942, 5, 1, 9, 30], [1943, 5, 1, 9, 30], [1944, 5, 1, 9, 30], [1945, 5, 1, 9, 30], [1946, 5, 1, 9, 30], [1947, 5, 1, 9, 30], [1948, 5, 1, 9, 30], [1949, 5, 1, 9, 30], [1950, 5, 1, 9, 30], [1951, 5, 1, 9, 30], [1952, 3, 1, 10, 31], [1953, 4, 1, 10, 31], [1954, 4, 1, 10, 31], [1955, 5, 1, 9, 30], [1956, 5, 1, 9, 30], [1957, 4, 1, 9, 30], [1958, 4, 1, 9, 30], [1959, 4, 1, 9, 30], [1960, 6, 1, 9, 30], [1961, 6, 1, 9, 30], [1974, 4, 1, 10, 31], [1975, 4, 1, 10, 31], [1979, 7, 1, 9, 30], [1986, 5, 4, 9, 14], [1987, 4, 12, 9, 13], [1988, 4, 10, 9, 11], [1989, 4, 16, 9, 17], [1990, 4, 15, 9, 16], [1991, 4, 14, 9, 15]];

/* * 복사 시 "부드러운 최적화"가 허용되지 않는 중요한 else if를 포함한 표준 원본 형식입니다. */
function oracleIsDST(year: number, month: number, day: number): boolean {
  let i = 0;
  while (i < ORACLE_XLS_CN.length) {
    if (year === ORACLE_XLS_CN[i][0]) {
      if (month > ORACLE_XLS_CN[i][1] && month < ORACLE_XLS_CN[i][3]) return true;
      if (month === ORACLE_XLS_CN[i][1]) {
        if (day >= ORACLE_XLS_CN[i][2]) return true;
      } else if (month === ORACLE_XLS_CN[i][3]) {
        if (day <= ORACLE_XLS_CN[i][4]) return true;
      }
    }
    i++;
  }
  return false;
}

let bad = 0;
const fail = (m: string) => { bad++; console.log(`  ❌ ${m}`); };

/* ── ① 날로 차이를 소진하다 ────────────────────────────────────────── */
{
  let checked = 0; let hits = 0; const mismatches: string[] = [];
  for (let y = 1930; y <= 1995; y++) {
    for (let m = 1; m <= 12; m++) {
      const dim = new Date(Date.UTC(y, m, 0)).getUTCDate();
      for (let d = 1; d <= dim; d++) {
        checked++;
        const got = isChinaDST(y, m, d);
        const want = oracleIsDST(y, m, d);
        if (got !== want) mismatches.push(`${y}-${m}-${d}당신이 얻는 것${got}되어야 한다${want}`);
        if (want) hits++;
      }
    }
  }
  if (mismatches.length) {
    fail(`일일 차이:${mismatches.length}하늘이 금본위제와 맞지 않아 상위 5위 →${mismatches.slice(0, 5).join('; ')}`);
  } else {
    console.log(`✅ 1930-1995년 일일 차이는 일정합니다(비교${checked}일들 중에${hits}일광 절약 시간제)`);
  }
}

/* ── ② 경계일 : 양쪽 끝에서 "전날/오늘"을 측정─────────────────────── */
{
  let edgeBad = 0;
  for (const [y, m1, d1, m2, d2] of ORACLE_XLS_CN) {
    // 시작일에 맞춰야 함
    if (!isChinaDST(y, m1, d1)) { edgeBad++; fail(`${y}-${m1}-${d1}시작일에 목표를 달성해야 함`); }
    // 시작일 전날에 해당하지 않아야 합니다. (같은 달 내에만 건설 가능하며, d1>1인 경우에만 측정 가능)
    if (d1 > 1 && isChinaDST(y, m1, d1 - 1)) { edgeBad++; fail(`${y}-${m1}-${d1 - 1}시작일 전날은 해당되지 않아야 합니다.`); }
    // 종료 날짜는 같은 날에 이루어져야 합니다(최적 기준에서는 전체 변환일을 일광 절약 시간으로 계산합니다).
    if (!isChinaDST(y, m2, d2)) { edgeBad++; fail(`${y}-${m2}-${d2}마지막 날 목표를 달성해야 함`); }
    // 종료일 다음 날을 놓쳐야 함
    const dim = new Date(Date.UTC(y, m2, 0)).getUTCDate();
    const [nm, nd] = d2 < dim ? [m2, d2 + 1] : [m2 + 1, 1];
    if (nm <= 12 && isChinaDST(y, nm, nd)) { edgeBad++; fail(`${y}-${nm}-${nd}종료일이 다음 날에 도달하면 안 됩니다.`); }
  }
  if (!edgeBad) console.log(`  ✅ ${ORACLE_XLS_CN.length}그룹 간격의 4개 경계일이 모두 정확합니다.`);
}

/* ── ③ 표 밖의 모든 연도는 반드시 누락되어야 합니다. (일광 절약 시간이 적용되지 않는 연도를 오판하는 것을 방지하기 위해)────────────── */
{
  const inTable = new Set(ORACLE_XLS_CN.map(r => r[0]));
  const outside = [1934, 1962, 1970, 1973, 1976, 1980, 1985, 1992, 1993, 2000, 2026];
  let outBad = 0;
  for (const y of outside) {
    if (inTable.has(y)) continue;
    for (const [m, d] of [[1, 1], [5, 15], [7, 1], [9, 1], [12, 31]]) {
      if (isChinaDST(y, m, d)) { outBad++; fail(`${y}-${m}-${d}목록에는 없지만 누르세요.`); }
    }
  }
  if (!outBad) console.log("✅ 테이블 밖의 연도(사용자가 요청한 1992년 포함)는 적중되지 않습니다.");
}

/* ── ④ 보조 기능은 표의 내용과 일치합니다. ────────────────────────────────── */
{
  const years = chinaDSTYears();
  if (years.length !== ORACLE_XLS_CN.length) fail(`연도${years.length}≠ 골드 스탠다드${ORACLE_XLS_CN.length}`);
  if (!years.every((y, i) => y === ORACLE_XLS_CN[i][0])) fail("연도 순서가 금본위제와 일치하지 않습니다.");
  if (!isChinaDSTYear(1988) || isChinaDSTYear(1992)) fail("isChinaDSTYear 판정 오류");
  const r = chinaDSTRange(1990);
  if (!r || !r.start.includes('4월 15일') || !r.end.includes('9월 16일')) fail(`중국DSTRange(1990) 예외 →${JSON.stringify(r)}`);
  if (chinaDSTRange(1992) !== null) fail("chinaDSTRange(1992)는 null이어야 합니다.");
  console.log("✅ 보조 기능(연도표/간격 카피라이팅)은 표준표와 일치합니다.");
}

/* ── ⑤ 사용자의 원래 질문에 대한 직접적인 답변이 테스트에 박혀 있습니다. ──────────────────────── */
{
  // 사용자가 "1986년부터 1992년까지"라고 물었지만 실제로는 1991년부터 1992년까지가 중단되었습니다. 히트작이 아닐 것입니다.
  const cases: [number, number, number, boolean, string][] = [
    [1986, 5, 3, false, "1986년 서머타임 전날"],
    [1986, 5, 4, true, "1986년 일광 절약 시간제의 첫날"],
    [1988, 4, 10, true, "★1988년 시작일 : 금본위제 4/10 (IANA는 4/17을 기록하고 금본위제는 철법에 따라 결정됨)"],
    [1988, 4, 16, true, "1988 분기 간격 내(IANA에 따라 아직 시작되지 않음)"],
    [1991, 9, 15, true, "1991년 서머타임의 마지막 날"],
    [1991, 9, 16, false, "1991년 서머타임이 끝난 다음 날"],
    [1992, 7, 1, false, "★1992년에는 서머타임이 없습니다(사용자가 요청한 간격의 상한은 실제로 1991년에 끝납니다)"],
  ];
  for (const [y, m, d, want, name] of cases) {
    const got = isChinaDST(y, m, d);
    if (got !== want) fail(`${name}→ 집으로 가져가세요${got}되어야 한다${want}`);
    else console.log(`  ✅ ${name}`);
  }
}

if (bad) {
  console.error(`\n❌ ${bad}항목 불일치 - 일광 절약 시간제 결정은 표준과 일치하지 않으므로 시진 오판 및 명궁신궁대한 모든 오류가 발생합니다.`);
  process.exit(1);
}
console.log("✅ 모두 통과됨: 올바른 경계와 테이블 외 연도를 통해 매일 최적 기준을 준수합니다.");
