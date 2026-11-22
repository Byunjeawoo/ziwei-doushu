import assert from 'node:assert/strict';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ko, koNode } from '../../lib/i18n/ko';
import { generateChart } from '../../lib/ziwei/algorithm';
import { ALL_BOOKS, searchClassics, TOTAL_PARAGRAPHS } from '../../lib/classics';
import ChartBoard from '../../components/ChartBoard';
import ShareCardCanvas from '../../components/ShareCardCanvas';

Object.assign(globalThis, { React });
assert.equal(ko('紫微'), '자미');
assert.equal(ko('命宫'), '명궁');
assert.equal(ko('甲子'), '갑자');
assert.equal(ko('水二局'), '수이국');
assert.equal(ko('飞廉'), '비렴');
assert.equal(ko('七杀朝斗'), '칠살조두');
assert.equal(ko('김민수'), '김민수');
assert.equal(koNode(42), 42);
assert.equal(koNode(null), null);

const chart = generateChart({ year: 1990, month: 6, day: 15, hour: 4, gender: 'male' });
const before = JSON.stringify(chart);
assert.ok(chart.palaces.some(p => p.name === '命宫'), '계산용 궁명 키를 보존해야 합니다.');
const html = renderToStaticMarkup(React.createElement(ChartBoard, { chart }));
const share = renderToStaticMarkup(React.createElement(ShareCardCanvas, {
  chart, birth: { year: '1990', month: '6', day: '15', hour: '8', minute: '0', gender: 'male' },
}));
for (const output of [html, share]) {
  const visible = output.replace(/<[^>]*>/g, '');
  assert.doesNotMatch(visible, /[\u3400-\u9fff]/, '명반과 공유 카드의 표시 문구는 한국어여야 합니다.');
}
assert.equal(JSON.stringify(chart), before, '한국어 표시는 계산 데이터를 변경하면 안 됩니다.');
assert.equal(TOTAL_PARAGRAPHS, 75);
assert.ok(searchClassics('명궁').length > 0, '한국어로 고전을 검색할 수 있어야 합니다.');
assert.ok(searchClassics('쌍록조원').length > 0);
assert.ok(searchClassics('<script>').length === 0);
for (const book of ALL_BOOKS) {
  assert.doesNotMatch(book.title, /[\u3400-\u9fff]/);
  for (const chapter of book.chapters) {
    assert.doesNotMatch(chapter.title, /[\u3400-\u9fff]/);
    for (const paragraph of chapter.paragraphs) {
      assert.match(paragraph.text, /[가-힣]/);
      assert.doesNotMatch(paragraph.text, /ZXQ|QXZ|ZXID|[\u3400-\u9fff]/);
    }
  }
}
console.log('한국어 명반·공유 카드·고전 75문단·검색 및 계산 데이터 보존 검증 통과');
