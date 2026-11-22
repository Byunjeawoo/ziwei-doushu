import { ko } from '../../lib/i18n/ko';
/* * Year Before/Jianqian/Doctor Twelve Gods의 공식 및 디스플레이 레이어 렌더링에 대한 회귀 범위입니다. */
import assert from 'node:assert/strict';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ChartBoard from '../../components/ChartBoard';
import PalaceCell from '../../components/PalaceCell';
import { generateChart } from '../../lib/ziwei/algorithm';
import { BRANCHES } from '../../lib/ziwei/constants';
import {
  SUI_QIAN_SHEN, JIANG_QIAN_SHEN, BOSHI_SHEN,
  suiQianShenByBranch, jiangQianShenByBranch, boshiShenByStem, jiangXingBranch,
  suiQianShenName, jiangQianShenName, boshiShenName,
} from '../../lib/ziwei/shier-shen';

// The repository preserves JSX for Next; tsx's standalone runner uses the
// classic JSX transform, which expects React as a global during SSR.
Object.assign(globalThis, { React });

// ──단위: 해 전의 십이신, 해의 시작점을 정하고 열두 집이 앞으로 향하는 곳──
const suiZi = suiQianShenByBranch(0); // 지 니안
assert.equal(SUI_QIAN_SHEN[suiZi[0]], '岁建', '子年子宫应为岁建');
assert.equal(SUI_QIAN_SHEN[suiZi[1]], '晦气', '子年丑宫应为晦气');
assert.equal(SUI_QIAN_SHEN[suiZi[6]], '岁破', '岁破必在岁建对宫');
assert.equal(SUI_QIAN_SHEN[suiZi[7]], '龙德', '子年未宫应为龙德');

// ──부대: 장군 이전의 12신, 삼합 황제의 자리에 별이 떠오른다──
// 심자진→쯔인우수→오시유초→유해마오위→마오
assert.equal(jiangXingBranch(0), 0, '子年将星在子');
assert.equal(jiangXingBranch(4), 0, '辰年将星在子');
assert.equal(jiangXingBranch(8), 0, '申年将星在子');
assert.equal(jiangXingBranch(2), 6, '寅年将星在午');
assert.equal(jiangXingBranch(5), 9, '巳年将星在酉');
assert.equal(jiangXingBranch(11), 3, '亥年将星在卯');
const jiangZi = jiangQianShenByBranch(0);
assert.equal(JIANG_QIAN_SHEN[jiangZi[0]], '将星', '子年子宫应为将星');
assert.equal(JIANG_QIAN_SHEN[jiangZi[1]], '攀鞍', '子年丑宫应为攀鞍');
assert.equal(JIANG_QIAN_SHEN[jiangZi[5]], '劫煞', '子年巳宫应为劫煞');
const jiangYin = jiangQianShenByBranch(2); // 음력(陰年)에는 정오에 별이 뜬다.
assert.equal(JIANG_QIAN_SHEN[jiangYin[6]], '将星', '寅年午宫应为将星');
assert.equal(JIANG_QIAN_SHEN[jiangYin[11]], '劫煞', '寅年亥宫应为劫煞');

// ──유닛: 십이신 박사, 생년녹존, 양남음녀 전진, 음남양녀 후진──
const boshiJiaMale = boshiShenByStem(0, 'male'); // A년 양남, 녹존는 음으로 앞으로 나아가고 있습니다.
assert.equal(BOSHI_SHEN[boshiJiaMale[2]], '博士', "A년 양남 Yin Gong은 의사가 되어야 합니다");
assert.equal(BOSHI_SHEN[boshiJiaMale[3]], '力士', "A년 양남 마오공은 강한 사람이어야 한다");
assert.equal(BOSHI_SHEN[boshiJiaMale[11]], '大耗', "A학년의 양남는 대모(박사과정 10위)여야 합니다.");
const boshiJiaFemale = boshiShenByStem(0, 'female'); // A년 양녀, 역행
assert.equal(BOSHI_SHEN[boshiJiaFemale[2]], '博士', "A년 양녀 Yin Gong은 의사가 되어야 합니다");
assert.equal(BOSHI_SHEN[boshiJiaFemale[1]], '力士', "A년 양녀의 추악한 궁전은 강한 궁전이어야 합니다(역행)");
const boshiYiMale = boshiShenByStem(1, 'male'); // B년 음남, 녹존는 마오쩌둥, 역행
assert.equal(BOSHI_SHEN[boshiYiMale[3]], '博士', "B학년 음남 마오공은 의사가 되어야 한다");
assert.equal(BOSHI_SHEN[boshiYiMale[2]], '力士', "B년 음남 음궁은 강자가 되어야 한다(역행)");

// ──디스플레이 레이어: 황도대 렌더링 완료, 순서는 의사, 장군, 세로 고정 ──
// 1990-05-15 오시 남: 號wu년(년 어간 Geng=6, 연도 Wu=6), 양남.
const chart = generateChart({ year: 1990, month: 5, day: 15, hour: 6, gender: 'male', longitude: 120 });
assert.equal(chart.lunarInfo.yearBranch, 6, "1990년은 정오의 해가 되어야 한다");
assert.equal(chart.lunarInfo.yearStem, 6, "1990년은 겅의 해가 되어야 한다");

const suiNames = new Set<string>();
const jiangNames = new Set<string>();
const boshiNames = new Set<string>();
for (const palace of chart.palaces) {
  const shierShen = {
    boshi: boshiShenName(chart.lunarInfo.yearStem, chart.birthInfo.gender, palace.branch),
    jiangQian: jiangQianShenName(chart.lunarInfo.yearBranch, palace.branch),
    suiQian: suiQianShenName(chart.lunarInfo.yearBranch, palace.branch),
  };
  const html = renderToStaticMarkup(React.createElement(PalaceCell, { palace, shierShen }));
  assert.match(html, new RegExp(
    `data-shier-shen="boshi"[^>]*>${ko(shierShen.boshi)}</span>` +
    `<span data-shier-shen="jiangQian">${ko(shierShen.jiangQian)}</span>` +
    `<span data-shier-shen="suiQian">${ko(shierShen.suiQian)}</span>`,
  ), `${BRANCHES[palace.branch]}궁은 의사, 장군, 세세에 따라 수직으로 렌더링되어야 합니다.`);
  suiNames.add(shierShen.suiQian);
  jiangNames.add(shierShen.jiangQian);
  boshiNames.add(shierShen.boshi);
}
assert.equal(suiNames.size, 12, "한 살 이전의 열두 신은 열두 집에서 반복되어서는 안 됩니다.");
assert.equal(jiangNames.size, 12, "처음 열두 신은 열두 하우스에서 반복되어서는 안 됩니다.");
assert.equal(boshiNames.size, 12, "닥터와 십이신은 열두 집에서 반복되어서는 안 됩니다.");

const palaceAt = (branch: number) => chart.palaces.find((p) => p.branch === branch)!;
assert.equal(suiQianShenName(chart.lunarInfo.yearBranch, 6), '岁建', '午年午宫应为岁建');
assert.equal(suiQianShenName(chart.lunarInfo.yearBranch, 0), '岁破', "정오(대궁)에 자궁이 터져야 한다");
assert.equal(jiangQianShenName(chart.lunarInfo.yearBranch, 6), '将星', "오(吳)년의 별은 정오에 뜬다.");
assert.equal(boshiShenName(chart.lunarInfo.yearStem, 'male', 8), '博士', "Geng 연도 녹존는 Shen에 있고 양남 Shen Gong은 의사가되어야합니다");
assert.equal(boshiShenName(chart.lunarInfo.yearStem, 'male', 9), '力士', "경년에는 양남가 직행하므로 유궁은 강자가 되어야 한다.");
assert.equal(boshiShenName(chart.lunarInfo.yearStem, 'male', 6), '伏兵', "Geng Year 양남 Meridian Palace는 매복해야합니다");

// ChartBoard는 Palace의 새로운 필드에 의존하는 대신 프레젠테이션 계층에서 동일한 본명 데이터 세트를 PalaceCell에 전달해야 합니다.
const boardHtml = renderToStaticMarkup(React.createElement(ChartBoard, { chart }));
assert.match(boardHtml, /data-shier-shen="boshi"[^>]*>복병<\/span><span data-shier-shen="jiangQian">장성<\/span><span data-shier-shen="suiQian">세건<\/span>/,
  "ChartBoard는 Meridian Palace에서 매복, 일반 별 및 연도 건물을 순서대로 렌더링해야 합니다.");

// 음녀 직동: 1991-05-15 오시 암컷, 신위년(년 어간 Xin=7, 연도 위=7), 녹존는 당신 안에 있습니다.
const chartF = generateChart({ year: 1991, month: 5, day: 15, hour: 6, gender: 'female', longitude: 120 });
assert.equal(chartF.lunarInfo.yearStem, 7, "1991년은 신의 해가 되어야 한다");
const palaceF = chartF.palaces.find((p) => p.branch === 9)!;
const shierShenF = {
  boshi: boshiShenName(chartF.lunarInfo.yearStem, chartF.birthInfo.gender, 9),
  jiangQian: jiangQianShenName(chartF.lunarInfo.yearBranch, 9),
  suiQian: suiQianShenName(chartF.lunarInfo.yearBranch, 9),
};
assert.equal(shierShenF.boshi, '博士', "신년 녹존는 당신 안에 있고 음녀 당신 궁전은 의사가되어야합니다");
assert.equal(boshiShenName(chartF.lunarInfo.yearStem, 'female', 10), '力士', "신년에는 음녀가 직진하고 서공은 강자가 되어야 합니다.");
assert.equal(suiQianShenName(chartF.lunarInfo.yearBranch, 7), '岁建', '未年未宫应为岁建');
const htmlF = renderToStaticMarkup(React.createElement(PalaceCell, { palace: palaceF, shierShen: shierShenF }));
assert.match(htmlF, /data-shier-shen="boshi"[^>]*>박사<\/span>/, "음녀명반 유공 잉그렌더 박사");

console.log("✓ 시대/Jiangqian/Doctor Twelve God 수식 단위 + 디스플레이 레이어 렌더링 회귀가 통과되기 전");
