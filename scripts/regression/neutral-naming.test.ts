/* *
 * 2026년 10월 20일부터: 타사 배반 소프트웨어의 이름이나 병음(상대방 프로그램 기호 포함)은 이 창고에 표시되지 않으며 중립적인 표현이 유지됩니다.
 * 추적된 모든 텍스트 파일을 스캔합니다. 키워드는 유니코드 이스케이프로 작성되며 파일 자체에는 원래 단어가 포함되어 있지 않습니다.
 * 허용: "자미두수전서" 및 현지어로 "기사 펜 및 잉크"를 의미하는 관용어(예: "...마스터", "마스터...", "순전히 의지...", "~에 떨어지다..."). */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const NAME = '\u6587\u58a8'; // 두 개의 한자로 된 브랜드 약어
const BANNED: RegExp[] = [
  new RegExp(NAME),
  /w\u0065nmo/i,
  /w\u0065n[\s_-]?mo[\s_-]?tian/i,
];
const IDIOMS = new RegExp(`${NAME}(마스터리|신|별)|마스터${NAME}|순전히 의지하다${NAME}|가을${NAME}`, 'g');

const TEXT_EXT = /\.(ts|tsx|js|mjs|cjs|json|css|md|txt|html|svg|xml|yml|yaml)$/i;

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter((f) => f && TEXT_EXT.test(f));
const hits: string[] = [];
for (const f of files) {
  if (BANNED.some((re) => re.test(f))) { hits.push(`${f}(파일 이름)`); continue; }
  const lines = readFileSync(f, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const cleaned = line.replace(IDIOMS, '');
    if (BANNED.some((re) => re.test(cleaned))) hits.push(`${f}:${i + 1}  ${line.trim().slice(0, 80)}`);
  });
}

if (hits.length) {
  console.error(`✗ 발견${hits.length}타사 배반 소프트웨어의 이름/병음(이 창고는 중립 표현을 유지합니다):`);
  for (const h of hits.slice(0, 40)) console.error('  ' + h);
  process.exit(1);
}
console.log(`[neutral-naming] ${files.length}파일 검사 통과: 타사 배반 소프트웨어 이름과 병음이 없습니다.`);
