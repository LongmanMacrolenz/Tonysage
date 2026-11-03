// 판정 엔진 테스트: node bokji/tests/engine.test.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const here = dirname(fileURLToPath(import.meta.url));
const ctx = { console };
ctx.globalThis = ctx;
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ['data-programs.js', 'data-contests.js', 'engine.js']) {
  vm.runInContext(readFileSync(join(here, '..', 'assets', f), 'utf8'), ctx, { filename: f });
}
const E = ctx.BokjiEngine;
const D = ctx.BOKJI_DATA;

const BLANK = {
  who: 'self', age: 40, region: 'do-si', spouse: false, spouseAge: 40, spouseEarns: false,
  c0: 0, c1: 0, c2: 0, c3: 0, c4: 0, c5: 0, c6: 0, c7: 0, others: 0, othersSenior: 0,
  pregnant: false, singleParent: false, householdDisabled: false, dis: 'none',
  work: 'employee', insured: false, earn: 0, otherInc: 0, annual: null,
  housing: 'monthly', deposit: 0, rent: 0, home: 0, land: 0, fin: 0, car: 0, carExempt: false, debt: 0,
  youthApart: false, crisis: [], today: '2026-11-02'
};
const hh = (over) => Object.assign({}, BLANK, over);
const status = (out, id) => {
  const r = out.results.find((x) => x.id === id);
  assert.ok(r, `결과에 ${id}가 없음`);
  return r.status;
};

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('ok  ', name); }
  catch (e) { console.error('FAIL', name); console.error(e); process.exitCode = 1; }
}

test('모든 제도에 규칙이 있다', () => {
  for (const p of D.programs) assert.ok(E.rules[p.id], `규칙 없음: ${p.id}`);
});

test('모든 제도에 공식 링크와 출처가 있다', () => {
  for (const p of D.programs) {
    assert.ok((p.apply && p.apply.length) || p.detail, `링크 없음: ${p.id}`);
    assert.ok(p.sources && p.sources.length, `출처 없음: ${p.id}`);
    for (const a of (p.apply || [])) assert.match(a.url, /^https:\/\//, `https 아님: ${p.id}`);
  }
});

test('기준중위소득 2026 표와 8인 이상 계산', () => {
  assert.equal(E.median(1), 2564238);
  assert.equal(E.median(4), 6494738);
  assert.equal(E.median(7), 9515150);
  assert.equal(E.median(8), 9515150 + (9515150 - 8555952));
});

test('원 단위 표시', () => {
  assert.equal(E.fmt.won(820556), '82만 556원');
  assert.equal(E.fmt.won(99000000), '9,900만 원');
  assert.equal(E.fmt.won(135000000), '1억 3,500만 원');
  assert.equal(E.fmt.won(0), '0원');
});

test('소득·재산이 없는 1인 가구는 소득인정액 0, 생계급여 가능', () => {
  const out = E.evaluate(hh({ work: 'none' }));
  assert.equal(Math.round(out.calc.recognized), 0);
  assert.equal(status(out, 'livelihood'), 'ok');
  assert.equal(status(out, 'housing'), 'ok');
});

test('근로소득 공제: 40세 월 100만 원이면 소득평가액 70만 원', () => {
  const out = E.evaluate(hh({ earn: 100 }));
  assert.equal(Math.round(out.calc.incomeEval), 700000);
});

test('청년 공제: 27세 월 210만 원이면 60만 원 먼저 빼고 30% 공제', () => {
  const out = E.evaluate(hh({ age: 27, earn: 210 }));
  // 210 - (60 + 150×0.3) = 105만 원
  assert.equal(Math.round(out.calc.incomeEval), 1050000);
});

test('의료급여는 일반 30% 공제가 없다', () => {
  const out = E.evaluate(hh({ earn: 100 }));
  const r = out.results.find((x) => x.id === 'medical');
  assert.ok(r.reasons[0].text.includes('100만 원'), r.reasons[0].text);
});

test('재산: 그 외 지역 보증금 500만 원은 기본재산액 안이라 환산액 0', () => {
  const out = E.evaluate(hh({ deposit: 500, rent: 25 }));
  assert.equal(Math.round(out.calc.conv), 0);
});

test('재산: 서울 금융재산 1억 5천만 원, 기본재산액 9,900만·생활준비금 500만 차감 후 6.26%', () => {
  const out = E.evaluate(hh({ region: 'seoul', housing: 'other', fin: 15000 }));
  // (15000 - 500 - 9900) × 6.26% = 4600만 × 0.0626 = 2,879,600원
  assert.equal(Math.round(out.calc.conv), 2879600);
});

test('자동차는 일반재산 예외가 아니면 100% 환산되고 기본재산액을 빼지 않는다', () => {
  const out = E.evaluate(hh({ car: 1000 }));
  assert.equal(Math.round(out.calc.conv), 10000000);
  const out2 = E.evaluate(hh({ car: 1000, carExempt: true }));
  assert.equal(Math.round(out2.calc.conv), 0);
});

test('생계급여 선정기준을 넘으면 해당 어려움', () => {
  const out = E.evaluate(hh({ earn: 300 }));
  assert.equal(status(out, 'livelihood'), 'no');
});

test('혼자 사는 74세 어르신 예시: 기초연금·생계급여 가능', () => {
  const out = E.evaluate(hh({ who: 'proxy', age: 74, work: 'none', otherInc: 32, deposit: 500, rent: 25, fin: 400 }));
  assert.equal(status(out, 'basicPension'), 'ok');
  assert.equal(status(out, 'livelihood'), 'ok');
  // 생계급여 수급자는 노인 공익활동에 참여할 수 없다
  assert.equal(status(out, 'seniorJobs'), 'no');
  assert.notEqual(status(out, 'seniorCare'), 'no');
});

test('아이 둘 4인 가구 예시: 아동수당 대상, 생계급여는 어려움', () => {
  const out = E.evaluate(hh({ age: 38, region: 'gyeonggi-si', spouse: true, spouseAge: 36, spouseEarns: true, c2: 1, c3: 1,
    insured: true, earn: 520, annual: 6200, housing: 'jeonse', deposit: 18000, fin: 1200, car: 1800, debt: 9000 }));
  assert.equal(status(out, 'childAllowance'), 'ok');
  assert.equal(status(out, 'livelihood'), 'no');
});

test('폐업한 50대 예시: 긴급복지·희망리턴패키지가 보인다', () => {
  const out = E.evaluate(hh({ age: 54, region: 'metro', spouse: true, spouseAge: 52, c6: 1, work: 'closed', earn: 80, annual: 2300,
    deposit: 2000, rent: 60, fin: 300, car: 600, carExempt: true, debt: 4000, crisis: ['income-loss'] }));
  assert.notEqual(status(out, 'emergency'), 'no');
  assert.notEqual(status(out, 'hopeReturn'), 'no');
});

test('월세 사는 27세 청년 예시: 청년월세 확인 필요, 근로장려금 가능', () => {
  const out = E.evaluate(hh({ age: 27, region: 'seoul', insured: true, earn: 150, annual: 1800, deposit: 1000, rent: 50, fin: 300, youthApart: true }));
  assert.notEqual(status(out, 'youthRent'), 'no');
  assert.equal(status(out, 'eitc'), 'ok');
  // 월 210만 원이면 청년가구 기준(1인 중위 60%)을 넘는다
  const rich = E.evaluate(hh({ age: 27, region: 'seoul', earn: 210, deposit: 1000, rent: 55, youthApart: true }));
  assert.equal(status(rich, 'youthRent'), 'no');
  assert.equal(status(out, 'childAllowance'), 'no');
});

test('근로장려금 기한 후 신청 안내는 마감이 지나면 사라진다', () => {
  const a = E.evaluate(hh({ earn: 100, annual: 1200, today: '2026-11-02' })).results.find((x) => x.id === 'eitc');
  const b = E.evaluate(hh({ earn: 100, annual: 1200, today: '2027-01-15' })).results.find((x) => x.id === 'eitc');
  assert.ok(a.deadline);
  assert.equal(b.deadline, null);
});

test('공모전 데이터 형식', () => {
  const C = ctx.BOKJI_CONTESTS;
  assert.ok(C.asOf);
  for (const c of C.items.concat(C.channels)) {
    assert.ok(c.title && c.org && c.url, JSON.stringify(c));
    assert.match(c.url, /^https?:\/\//);
    if (c.end) assert.match(c.end, /^\d{4}-\d{2}-\d{2}$/);
    if (c.start) assert.match(c.start, /^\d{4}-\d{2}-\d{2}$/);
  }
});

console.log(`\n${passed} passed`);
