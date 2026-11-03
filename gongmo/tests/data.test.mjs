// 공모 데이터 형식 점검: node gongmo/tests/data.test.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(join(here, '..', 'contests.json'), 'utf8'));
const KEYS = ['id', 'title', 'org', 'orgType', 'kind', 'tags', 'start', 'end', 'endTime', 'who', 'team', 'limit', 'prize',
  'theme', 'submit', 'how', 'judging', 'announce', 'aiRule', 'contact', 'tip', 'url', 'verified', 'source', 'note', 'checkedAt'];
const ORG = ['중앙부처', '광역지자체', '기초지자체', '공공기관', '국회', '학회·민간'];
const PRIZE = ['cash', 'goods', 'none', 'unknown', 'reward'];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

let fail = 0, pass = 0;
function check(name, fn) {
  try { fn(); pass++; console.log('ok  ', name); }
  catch (e) { fail++; console.log('FAIL', name, '-', e.message); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }

check('기준일과 목록이 있다', () => {
  assert(DATE.test(data.asOf), 'asOf 형식');
  assert(Array.isArray(data.contests) && data.contests.length > 0, 'contests 비어 있음');
  assert(Array.isArray(data.finders) && data.finders.length > 0, 'finders 비어 있음');
});

check('모든 공모가 같은 항목을 가진다', () => {
  for (const c of data.contests) for (const k of KEYS) assert(k in c, c.id + ' 에 ' + k + ' 없음');
});

check('id는 주소창에 쓸 수 있고 겹치지 않는다', () => {
  const seen = new Set();
  for (const c of data.contests) {
    assert(/^[a-z0-9-]+$/.test(c.id), c.id);
    assert(!seen.has(c.id), '중복 ' + c.id);
    assert(!['settings', 'sidebar', 'customize', 'upgrade', 'downloads', 'home'].includes(c.id) && !c.id.startsWith('comment-') && !c.id.startsWith('my-'), '예약어 ' + c.id);
    seen.add(c.id);
  }
});

check('날짜와 상시 여부가 맞다', () => {
  for (const c of data.contests) {
    if (c.always) { assert(c.start === null && c.end === null, c.id + ' 상시 창구에 날짜'); continue; }
    assert(DATE.test(c.end), c.id + ' 마감일');
    if (c.start) assert(DATE.test(c.start) && c.start <= c.end, c.id + ' 시작일');
    if (c.annual) assert(c.season, c.id + ' 해마다 열리는 공모에 시기 설명 없음');
  }
});

check('주최 유형과 상금 종류가 정해진 값이다', () => {
  for (const c of data.contests) {
    assert(ORG.includes(c.orgType), c.id + ' orgType ' + c.orgType);
    assert(PRIZE.includes(c.prize.kind), c.id + ' prize.kind');
    assert(typeof c.prize.text === 'string' && c.prize.text.length > 0, c.id + ' prize.text');
    if (c.prize.top != null && c.prize.total != null) assert(c.prize.top <= c.prize.total, c.id + ' 최고 상금이 총액보다 큼');
  }
});

check('공식 링크와 확인 상태가 있다', () => {
  for (const c of data.contests) {
    assert(/^https?:\/\//.test(c.url), c.id + ' url');
    assert(typeof c.verified === 'boolean', c.id + ' verified');
    assert(DATE.test(c.checkedAt), c.id + ' checkedAt');
    if (!c.verified) assert(c.source && c.source.length > 0, c.id + ' 미확인인데 출처 설명 없음');
  }
});

check('Claude에게 넘길 핵심 항목이 비어 있지 않다', () => {
  for (const c of data.contests) for (const k of ['who', 'theme', 'how']) assert(c[k] && c[k].trim(), c.id + ' ' + k + ' 비어 있음');
});

check('참여 자격(elig)이 정해진 형식이다', () => {
  const SIDO = ['서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시', '대전광역시', '울산광역시', '세종특별자치시', '경기도', '강원특별자치도', '충청북도', '충청남도', '전북특별자치도', '전라남도', '경상북도', '경상남도', '제주특별자치도'];
  const OK = ['regions', 'workSchoolOk', 'soft', 'minAge', 'maxAge', 'statuses', 'extra', 'unknown', 'own', 'note'];
  for (const c of data.contests) {
    assert(c.elig && typeof c.elig === 'object', c.id + ' elig 없음');
    for (const k of Object.keys(c.elig)) assert(OK.includes(k), c.id + ' 모르는 elig 항목 ' + k);
    for (const r of c.elig.regions || []) assert(SIDO.includes(r.sido), c.id + ' 시·도 이름 ' + r.sido);
    if (c.elig.minAge && c.elig.maxAge) assert(c.elig.minAge <= c.elig.maxAge, c.id + ' 나이 범위');
  }
});

check('거주지 제한 공모가 빠지지 않았다', () => {
  const need = { 'yangcheon-idea-contest-2026': '양천구', 'daejeon-social-innovation-idea-2026': '대전광역시', 'gyeonggi-ordinance-initiative': '경기도' };
  for (const [id, place] of Object.entries(need)) {
    const c = data.contests.find(x => x.id === id);
    assert(c && JSON.stringify(c.elig.regions || []).includes(place), id + ' 거주지 제한 누락');
  }
});

console.log('\n' + pass + ' passed' + (fail ? ', ' + fail + ' failed' : ''));
process.exit(fail ? 1 : 0);
