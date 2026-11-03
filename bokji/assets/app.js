/* 복지 길잡이 — 화면 동작. 계산은 engine.js, 데이터는 data-*.js. */
(function () {
  'use strict';

  var DATA = window.BOKJI_DATA;
  var CONTESTS = window.BOKJI_CONTESTS;
  var Engine = window.BokjiEngine;
  var fmt = Engine.fmt;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ------------------------------------------------------------------ */
  /* 화면 전환                                                            */
  /* ------------------------------------------------------------------ */
  var VIEWS = ['find', 'contests'];
  function route() {
    var name = (location.hash || '').replace('#', '');
    if (VIEWS.indexOf(name) < 0) name = 'find';
    VIEWS.forEach(function (v) {
      var sec = document.getElementById('view-' + v);
      if (sec) sec.hidden = v !== name;
    });
    $$('.tabs a').forEach(function (a) {
      if (a.getAttribute('data-view') === name) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }
  window.addEventListener('hashchange', function () { route(); window.scrollTo(0, 0); });

  /* ------------------------------------------------------------------ */
  /* 입력 상태                                                            */
  /* ------------------------------------------------------------------ */
  var STEPPERS = ['c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'others', 'othersSenior'];
  var NUMBERS = ['age', 'spouseAge', 'earn', 'otherInc', 'annual', 'deposit', 'rent', 'home', 'land', 'fin', 'car', 'debt'];
  var CHECKS = ['spouse', 'spouseEarns', 'pregnant', 'singleParent', 'householdDisabled', 'insured', 'carExempt', 'youthApart'];
  var SELECTS = ['region', 'work', 'housing'];

  var steps = {};
  STEPPERS.forEach(function (k) { steps[k] = 0; });

  function num(id) {
    var el = document.getElementById(id);
    if (!el || el.value === '') return null;
    var v = Number(el.value);
    return isFinite(v) && v >= 0 ? v : null;
  }

  function readState() {
    var s = {};
    NUMBERS.forEach(function (id) { s[id] = num(id); });
    CHECKS.forEach(function (id) { s[id] = !!document.getElementById(id).checked; });
    SELECTS.forEach(function (id) { s[id] = document.getElementById(id).value; });
    STEPPERS.forEach(function (k) { s[k] = steps[k]; });
    s.who = ($('input[name="who"]:checked') || {}).value || 'self';
    s.dis = ($('input[name="dis"]:checked') || {}).value || 'none';
    s.crisis = $$('input[name="crisis"]:checked').map(function (el) { return el.value; });
    var d = new Date();
    s.today = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    return s;
  }

  function writeState(s) {
    NUMBERS.forEach(function (id) {
      var el = document.getElementById(id);
      el.value = s[id] == null ? '' : s[id];
    });
    CHECKS.forEach(function (id) { document.getElementById(id).checked = !!s[id]; });
    SELECTS.forEach(function (id) { if (s[id]) document.getElementById(id).value = s[id]; });
    STEPPERS.forEach(function (k) { steps[k] = s[k] || 0; });
    var who = document.getElementById(s.who === 'proxy' ? 'whoProxy' : 'whoSelf');
    who.checked = true;
    var dis = document.getElementById(s.dis === 'severe' ? 'disSevere' : s.dis === 'mild' ? 'disMild' : 'disNone');
    dis.checked = true;
    $$('input[name="crisis"]').forEach(function (el) { el.checked = (s.crisis || []).indexOf(el.value) >= 0; });
    syncSteppers();
  }

  var BLANK = {
    who: 'self', age: 40, region: 'do-si', spouse: false, spouseAge: 40, spouseEarns: false,
    c0: 0, c1: 0, c2: 0, c3: 0, c4: 0, c5: 0, c6: 0, c7: 0, others: 0, othersSenior: 0,
    pregnant: false, singleParent: false, householdDisabled: false, dis: 'none',
    work: 'employee', insured: false, earn: 0, otherInc: 0, annual: null,
    housing: 'monthly', deposit: 0, rent: 0, home: 0, land: 0, fin: 0, car: 0, carExempt: false, debt: 0,
    youthApart: false, crisis: []
  };

  function preset(over) {
    var s = {};
    Object.keys(BLANK).forEach(function (k) { s[k] = BLANK[k]; });
    Object.keys(over).forEach(function (k) { s[k] = over[k]; });
    return s;
  }

  var PRESETS = {
    senior: { name: '혼자 사는 74세 어르신(가족이 대신 확인)', state: preset({
      who: 'proxy', age: 74, region: 'do-si', work: 'none', earn: 0, otherInc: 32,
      housing: 'monthly', deposit: 500, rent: 25, fin: 400 }) },
    family: { name: '아이 둘 4인 가구', state: preset({
      age: 38, region: 'gyeonggi-si', spouse: true, spouseAge: 36, spouseEarns: true, c2: 1, c3: 1,
      work: 'employee', insured: true, earn: 520, annual: 6200,
      housing: 'jeonse', deposit: 18000, fin: 1200, car: 1800, debt: 9000 }) },
    closed: { name: '폐업한 50대 자영업자', state: preset({
      age: 54, region: 'metro', spouse: true, spouseAge: 52, c6: 1,
      work: 'closed', earn: 80, annual: 2300, housing: 'monthly', deposit: 2000, rent: 60,
      fin: 300, car: 600, carExempt: true, debt: 4000, crisis: ['income-loss'] }) },
    youth: { name: '월세 사는 27세 청년', state: preset({
      age: 27, region: 'seoul', work: 'employee', insured: true, earn: 150, annual: 1800,
      housing: 'monthly', deposit: 1000, rent: 50, fin: 300, youthApart: true }) }
  };

  /* ------------------------------------------------------------------ */
  /* 입력 보조: 스테퍼, 조건부 필드, 대상 문구                              */
  /* ------------------------------------------------------------------ */
  function syncSteppers() {
    if (steps.othersSenior > steps.others) steps.othersSenior = steps.others;
    $$('.stepper').forEach(function (row) {
      var k = row.getAttribute('data-key');
      $('output', row).textContent = steps[k];
    });
    var kids = ['c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'].reduce(function (a, k) { return a + steps[k]; }, 0);
    $('#kidsSum').textContent = kids + '명';
    if (kids > 0) $('#kidsBox').open = true;
  }

  function syncConditional() {
    var s = readState();
    $('#spouseRow').hidden = !s.spouse;
    $('#othersSeniorRow').hidden = steps.others === 0;
    var housing = s.housing;
    $('#rentRow').hidden = !(housing === 'jeonse' || housing === 'monthly');
    $('#rentField').hidden = housing !== 'monthly';
    $('#homeField').hidden = housing !== 'own';
    var age = s.age || 0;
    $('#youthApartRow').hidden = !(age >= 19 && age <= 34);
    var hh = Engine.householdSize(s);
    $('#hhSize').textContent = hh + '명';
    var proxy = s.who === 'proxy';
    $$('[data-who-text]').forEach(function (el) {
      var parts = el.getAttribute('data-who-text').split('|');
      el.textContent = proxy ? parts[1] : parts[0];
    });
    $('#whoHint').hidden = !proxy;
  }

  $$('.stepper').forEach(function (row) {
    var k = row.getAttribute('data-key');
    var btns = $$('button', row);
    btns[0].addEventListener('click', function () { steps[k] = Math.max(0, steps[k] - 1); changed(); });
    btns[1].addEventListener('click', function () {
      var max = k === 'othersSenior' ? steps.others : 9;
      steps[k] = Math.min(max, steps[k] + 1); changed();
    });
  });

  var currentPreset = null;
  function markPreset(key) {
    currentPreset = key;
    $$('[data-preset]').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-preset') === key ? 'true' : 'false');
    });
    var flag = $('#exampleFlag');
    if (key && PRESETS[key]) {
      flag.hidden = false;
      $('#exampleName').textContent = '예시: ' + PRESETS[key].name;
    } else {
      flag.hidden = true;
    }
  }

  $$('[data-preset]').forEach(function (b) {
    b.addEventListener('click', function () {
      var key = b.getAttribute('data-preset');
      if (key === 'clear') { writeState(preset({})); markPreset(null); }
      else { writeState(PRESETS[key].state); markPreset(key); }
      changed(true);
    });
  });

  var form = $('#form');
  form.addEventListener('input', function () { if (currentPreset) markPreset(null); changed(); });
  form.addEventListener('change', function () { if (currentPreset) markPreset(null); changed(); });
  form.addEventListener('submit', function (e) { e.preventDefault(); });

  /* ------------------------------------------------------------------ */
  /* 결과 그리기                                                          */
  /* ------------------------------------------------------------------ */
  var STATUS = {
    ok: { label: '받을 가능성이 높아요', pill: '가능성 높음', sub: '입력한 조건으로는 선정기준을 충족합니다. 신청 후 기관 조사로 확정됩니다.' },
    warn: { label: '조건을 더 확인해야 해요', pill: '확인 필요', sub: '대부분 맞지만 여기서 묻지 않은 조건이 남아 있습니다. 근거의 노란 항목을 확인하세요.' },
    no: { label: '지금 조건으로는 어려워요', pill: '해당 어려움', sub: '어떤 조건에 걸리는지 근거를 보면 상황이 바뀔 때 다시 확인할 수 있습니다.' }
  };

  var programById = {};
  DATA.programs.forEach(function (p) { programById[p.id] = p; });

  var showNo = false;

  function renderLedger(out, s) {
    var c = out.calc;
    var rows = c.lines.map(function (l) {
      return '<tr' + (l.total ? ' class="total"' : '') + '><td class="op">' + esc(l.op || '') + '</td><td>' + esc(l.label) +
        (l.note ? '<small>' + esc(l.note) + '</small>' : '') + '</td><td>' +
        (l.total ? '<span class="mark">' + esc(fmt.won(l.value)) + '</span>' : esc(fmt.won(l.value))) + '</td></tr>';
    }).join('');
    var counts = { ok: 0, warn: 0, no: 0 };
    out.results.forEach(function (r) { counts[r.status]++; });
    var who = s.who === 'proxy' ? '대상자 가구' : '우리 가구';
    return '<section class="ledger" aria-labelledby="ledgerTitle">' +
      '<div class="ledger-head"><h2 id="ledgerTitle">' + who + ' 판정 요약</h2>' +
      '<div class="counts"><span class="count ok">가능성 높음 ' + counts.ok + '</span>' +
      '<span class="count warn">확인 필요 ' + counts.warn + '</span>' +
      '<span class="count no">어려움 ' + counts.no + '</span></div></div>' +
      '<p class="howto" style="margin:0">기초생활보장 방식으로 계산한 <b>한 달 소득인정액 추정치</b>입니다. ' +
      out.hh.size + '인 가구 기준중위소득 <b class="num">' + esc(fmt.won(c.median)) + '</b>의 <span class="mark num">' +
      esc(c.ratio.toFixed(1)) + '%</span>에 해당합니다.</p>' +
      '<table class="calc"><tbody>' + rows + '</tbody></table>' +
      '<div class="gauge-box">' + gaugeSvg(out.gauge) + '</div>' +
      deadlineList(out) +
      '</section>';
  }

  function deadlineList(out) {
    var items = out.results.filter(function (r) { return r.status !== 'no' && r.deadline; });
    if (!items.length) return '';
    return '<div class="soon-box"><h3>마감이 다가오는 신청</h3><ul>' + items.map(function (r) {
      var p = programById[r.id];
      return '<li><a href="#card-' + esc(r.id) + '" data-open="card-' + esc(r.id) + '">' + esc(p ? p.name : r.id) + '</a> <span class="pill deadline">' + esc(r.deadline) + '</span></li>';
    }).join('') + '</ul></div>';
  }

  function gaugeSvg(g) {
    // 눈금은 세 줄로 엇갈려 놓아 가까운 기준(40·48·50%)끼리 겹치지 않게 한다.
    var W = 680, x0 = 16, x1 = W - 16;
    var max = Math.min(160, Math.max(110, Math.ceil((g.ratio + 12) / 10) * 10));
    var X = function (p) { return x0 + Math.min(p, max) / max * (x1 - x0); };
    var ticks = g.ticks.map(function (t, i) {
      var x = X(t.pct);
      var y = 62 + (i % 3) * 16;
      return '<line x1="' + x + '" x2="' + x + '" y1="42" y2="' + (y - 11) + '" stroke="var(--rule-strong)" stroke-width="1"/>' +
        '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-size="11" fill="var(--ink-3)">' + esc(t.label) + '</text>';
    }).join('');
    var mx = X(g.ratio);
    var over = g.ratio > max;
    var label = (over ? max + '% 초과' : g.ratio.toFixed(1) + '%');
    var anchor = mx > W - 90 ? 'end' : mx < 90 ? 'start' : 'middle';
    return '<svg class="gauge" viewBox="0 0 ' + W + ' 104" role="img" aria-label="소득인정액이 기준중위소득의 ' + esc(label) + '">' +
      '<rect x="' + x0 + '" y="30" width="' + (x1 - x0) + '" height="10" rx="5" fill="var(--no-bg)"/>' +
      '<rect x="' + x0 + '" y="30" width="' + Math.max(0, mx - x0) + '" height="10" rx="5" fill="var(--navy)"/>' +
      ticks +
      '<circle cx="' + mx + '" cy="35" r="8" fill="var(--hilite)" stroke="var(--ink)" stroke-width="1.5"/>' +
      '<text x="' + mx + '" y="18" text-anchor="' + anchor + '" font-size="13" font-weight="700" fill="var(--ink)">우리 가구 ' + esc(label) + '</text>' +
      '</svg>';
  }

  function reasonHtml(r) {
    var ic = r.state === 'pass' ? '✓' : r.state === 'fail' ? '✕' : '?';
    return '<li class="' + r.state + '"><span class="ic" aria-hidden="true">' + ic + '</span><span>' +
      '<span class="sr-only">' + (r.state === 'pass' ? '충족: ' : r.state === 'fail' ? '미충족: ' : '확인 필요: ') + '</span>' +
      esc(r.text) + '</span></li>';
  }

  function cardHtml(r, s) {
    var p = programById[r.id];
    if (!p) return '';
    var st = STATUS[r.status];
    var pills = '<span class="pill ' + r.status + '">' + st.pill + '</span>';
    if (p.auto) pills += '<span class="pill auto">' + esc(p.auto) + '</span>';
    if (r.deadline) pills += '<span class="pill deadline">' + esc(r.deadline) + '</span>';
    var amount = r.amount ? '<span class="amount">' + esc(r.amount.text) + (r.amount.sub ? '<small>' + esc(r.amount.sub) + '</small>' : '') + '</span>' : '<span></span>';
    var docs = (p.docs || []).map(function (d, i) {
      return '<li><label><input type="checkbox" id="doc-' + esc(p.id) + '-' + i + '">' + esc(d) + '</label></li>';
    }).join('');
    var applyLinks = (p.apply || []).map(function (a, i) {
      return '<a class="btn ' + (i === 0 ? 'primary' : 'secondary') + '" href="' + esc(a.url) + '" target="_blank" rel="noopener">' + esc(a.name) + '</a>';
    }).join('');
    var detail = p.detail ? '<a class="btn secondary" href="' + esc(p.detail) + '" target="_blank" rel="noopener">공식 안내 보기</a>' : '';
    var proxy = s.who === 'proxy' && p.proxyTip ? '<p class="proxy-tip"><b>가족이 대신할 때</b> ' + esc(p.proxyTip) + '</p>' : '';
    var src = (p.sources || []).map(function (x) {
      return '<a href="' + esc(x.url) + '" target="_blank" rel="noopener">' + esc(x.title) + '</a>';
    }).join(' · ');
    var notes = (r.notes || []).map(function (n) { return '<p class="howto">' + esc(n) + '</p>'; }).join('');
    return '<details class="card" id="card-' + esc(p.id) + '">' +
      '<summary><span class="card-name">' + esc(p.name) + '</span>' + amount +
      '<span class="card-meta">' + pills + '<span>' + esc(p.agency) + '</span></span>' +
      '<span class="card-line">' + esc(p.oneLine) + '</span></summary>' +
      '<div class="card-body">' +
      '<div><h4>판정 근거</h4><ul class="reasons">' + r.reasons.map(reasonHtml).join('') + '</ul>' + notes + '</div>' +
      '<div><h4>지원 내용</h4><p class="howto">' + esc(p.benefit) + '</p></div>' +
      '<div><h4>신청 방법</h4><p class="howto">' + esc(p.howTo) + (p.period ? ' 신청 기간: ' + esc(p.period) : '') + '</p>' + proxy + '</div>' +
      (docs ? '<div><h4>준비 서류</h4><ul class="docs">' + docs + '</ul></div>' : '') +
      '<div class="actions">' + applyLinks + detail + '</div>' +
      (src ? '<p class="sources">근거: ' + src + '</p>' : '') +
      '</div></details>';
  }

  function render() {
    var s = readState();
    var out = Engine.evaluate(s);
    var groups = { ok: [], warn: [], no: [] };
    out.results.forEach(function (r) { groups[r.status].push(r); });
    var html = renderLedger(out, s);
    ['ok', 'warn'].forEach(function (k) {
      if (!groups[k].length) return;
      html += '<h2 class="group-title ' + k + '"><span class="dot" aria-hidden="true"></span>' + STATUS[k].label +
        ' <span class="num" style="color:var(--ink-3);font-size:var(--step-0)">' + groups[k].length + '</span></h2>' +
        '<p class="group-sub">' + STATUS[k].sub + '</p>' +
        '<div class="cards">' + groups[k].map(function (r) { return cardHtml(r, s); }).join('') + '</div>';
    });
    if (!groups.ok.length && !groups.warn.length) {
      html += '<p class="empty">입력한 조건으로 맞는 제도를 찾지 못했습니다. 소득·재산 값을 다시 확인하거나, 보건복지상담센터 129에서 상담을 받아 보세요.</p>';
    }
    if (groups.no.length) {
      html += '<button type="button" class="btn secondary more-toggle" id="toggleNo" aria-expanded="' + showNo + '">' +
        (showNo ? '해당 어려운 제도 접기' : '해당 어려운 제도 ' + groups.no.length + '개도 보기') + '</button>';
      if (showNo) {
        html += '<h2 class="group-title no"><span class="dot" aria-hidden="true"></span>' + STATUS.no.label + '</h2>' +
          '<p class="group-sub">' + STATUS.no.sub + '</p>' +
          '<div class="cards">' + groups.no.map(function (r) { return cardHtml(r, s); }).join('') + '</div>';
      }
    }
    var open = $$('.card[open]').map(function (d) { return d.id; });
    var box = $('#results');
    box.innerHTML = html;
    open.forEach(function (id) { var d = document.getElementById(id); if (d) d.open = true; });
    var t = $('#toggleNo');
    if (t) t.addEventListener('click', function () { showNo = !showNo; render(); });
    $$('[data-open]', box).forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var d = document.getElementById(a.getAttribute('data-open'));
        if (d) { d.open = true; d.scrollIntoView({ behavior: 'smooth', block: 'start' }); d.querySelector('summary').focus(); }
      });
    });
  }

  var timer = null;
  function changed(now) {
    syncSteppers();
    syncConditional();
    clearTimeout(timer);
    if (now) render(); else timer = setTimeout(render, 120);
  }

  /* ------------------------------------------------------------------ */
  /* 정책 공모전                                                          */
  /* ------------------------------------------------------------------ */
  function today() {
    var d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  function parseDay(s) {
    if (!s) return null;
    var p = s.split('-').map(Number);
    return new Date(p[0], p[1] - 1, p[2]);
  }
  function dayText(s) {
    if (!s) return '';
    var p = s.split('-').map(Number);
    return p[0] + '. ' + p[1] + '. ' + p[2] + '.';
  }

  function contestState(c) {
    var t = today();
    var end = parseDay(c.end);
    var start = parseDay(c.start);
    if (!end) return { key: 'always', label: '상시', sub: '', open: true, sort: 99999 };
    var diff = Math.round((end - t) / 864e5);
    if (diff < 0) return { key: 'closed', label: '마감', sub: dayText(c.end) + ' 마감', open: false, sort: 100000 - diff };
    if (start && start > t) {
      var until = Math.round((start - t) / 864e5);
      return { key: 'upcoming', label: '예정', sub: dayText(c.start) + ' 시작', open: true, sort: diff + 0.5, until: until };
    }
    return { key: diff <= 7 ? 'soon' : 'open', label: diff === 0 ? 'D-day' : 'D-' + diff, sub: dayText(c.end) + ' 마감', open: true, sort: diff };
  }

  function contestHtml(c) {
    var st = contestState(c);
    var cls = st.key === 'soon' ? ' soon' : st.key === 'closed' ? ' closed' : '';
    var tags = (c.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('');
    var period = c.start && c.end ? dayText(c.start) + ' ~ ' + dayText(c.end) : c.end ? '~ ' + dayText(c.end) : '';
    var prize = c.prize && !/^(해당 없음|없음)/.test(c.prize) ? c.prize : '';
    var lines = [];
    if (c.who) lines.push('<p class="desc"><b>대상</b> ' + esc(c.who) + '</p>');
    if (prize) lines.push('<p class="desc"><b>시상·혜택</b> ' + esc(prize) + '</p>');
    if (c.how) lines.push('<p class="desc"><b>방법</b> ' + esc(c.how) + '</p>');
    if (!lines.length) lines.push('<p class="desc">응모 자격과 시상은 공식 공고에서 확인하세요.</p>');
    if (c.note) lines.push('<p class="desc">' + esc(c.note) + '</p>');
    if (c.unverified) lines.push('<p class="desc"><span class="pill warn">공식 공고 미확인</span> 기간과 시상은 언론·모음 사이트 정보입니다. 응모 전에 주최 기관 공고를 꼭 확인하세요.</p>');
    return '<article class="contest">' +
      '<div class="dday' + cls + '"><b>' + esc(st.label) + '</b><span>' + esc(st.sub) + '</span></div>' +
      '<h3>' + esc(c.title) + '</h3>' +
      '<div class="meta"><span>' + esc(c.org) + '</span><span>' + esc(c.kind) + '</span>' + (period ? '<span class="num">' + esc(period) + '</span>' : '') + '</div>' +
      lines.join('') +
      '<div class="foot">' + tags + '<a class="btn secondary" href="' + esc(c.url) + '" target="_blank" rel="noopener">' + (c.end ? '공식 공고 보기' : '창구 바로가기') + '</a></div>' +
      '</article>';
  }

  function renderContests() {
    var status = ($('input[name="cstatus"]:checked') || {}).value || 'open';
    var org = $('#orgFilter').value;
    var tag = $('#tagFilter').value;
    var list = CONTESTS.items.filter(function (c) {
      var st = contestState(c);
      if (status === 'open' && !st.open) return false;
      if (org && c.orgType !== org) return false;
      if (tag && (c.tags || []).indexOf(tag) < 0) return false;
      return true;
    }).sort(function (a, b) { return contestState(a).sort - contestState(b).sort; });
    $('#contestList').innerHTML = list.length ? list.map(contestHtml).join('') :
      '<p class="empty">조건에 맞는 공모전이 없습니다. 상태를 ‘전체’로 바꾸거나 아래 상시 창구를 이용해 보세요.</p>';
  }

  function initContests() {
    $('#contestAsOf').textContent = dayText(CONTESTS.asOf);
    var orgs = [], tags = [];
    CONTESTS.items.forEach(function (c) {
      if (orgs.indexOf(c.orgType) < 0) orgs.push(c.orgType);
      (c.tags || []).forEach(function (t) { if (tags.indexOf(t) < 0) tags.push(t); });
    });
    tags.sort();
    $('#orgFilter').insertAdjacentHTML('beforeend', orgs.map(function (o) { return '<option value="' + esc(o) + '">' + esc(o) + '</option>'; }).join(''));
    $('#tagFilter').insertAdjacentHTML('beforeend', tags.map(function (o) { return '<option value="' + esc(o) + '">' + esc(o) + '</option>'; }).join(''));
    ['csOpen', 'csAll', 'orgFilter', 'tagFilter'].forEach(function (id) {
      document.getElementById(id).addEventListener('change', renderContests);
    });
    $('#channelList').innerHTML = CONTESTS.channels.map(contestHtml).join('');
    $('#aggList').innerHTML = CONTESTS.aggregators.map(function (a) {
      return '<a href="' + esc(a.url) + '" target="_blank" rel="noopener"><b>' + esc(a.name) + '</b><span>' + esc(a.note) + '</span></a>';
    }).join('');
    renderContests();
  }

  /* ------------------------------------------------------------------ */
  /* 출처                                                                 */
  /* ------------------------------------------------------------------ */
  function initSources() {
    $('#dataAsOf').textContent = dayText(DATA.asOf);
    var seen = {}, items = [];
    (DATA.sources || []).concat.apply(DATA.sources || [], DATA.programs.map(function (p) { return p.sources || []; }))
      .forEach(function (x) { if (!seen[x.url]) { seen[x.url] = 1; items.push(x); } });
    var box = $('#sources');
    box.innerHTML = '<ul style="margin:0;padding-left:18px;display:grid;gap:4px">' + items.map(function (x) {
      return '<li><a href="' + esc(x.url) + '" target="_blank" rel="noopener">' + esc(x.title) + '</a></li>';
    }).join('') + '</ul>';
    $('#sourcesLink').addEventListener('click', function () {
      box.hidden = !box.hidden;
      this.setAttribute('aria-expanded', String(!box.hidden));
    });
  }

  /* ------------------------------------------------------------------ */
  route();
  initSources();
  initContests();
  writeState(PRESETS.senior.state);
  markPreset('senior');
  changed(true);
})();
