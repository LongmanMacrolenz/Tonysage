/* 복지 길잡이 — 판정 엔진.
   입력(만 원 단위)을 받아 소득인정액을 추정하고 제도별로 근거와 함께 판정한다.
   모든 기준값은 data-programs.js 의 BOKJI_DATA.params 에서 읽는다. 숫자를 여기에 직접 쓰지 않는다. */
(function (root) {
  'use strict';

  var MAN = 10000;

  /* ------------------------------------------------------------------ */
  /* 표시 형식                                                            */
  /* ------------------------------------------------------------------ */
  function comma(n) { return Math.round(n).toLocaleString('ko-KR'); }
  function won(n) {
    n = Math.round(n || 0);
    var neg = n < 0; n = Math.abs(n);
    var eok = Math.floor(n / 1e8), man = Math.floor((n % 1e8) / MAN), rest = n % MAN;
    var parts = [];
    if (eok) parts.push(comma(eok) + '억');
    if (man) parts.push(comma(man) + '만');
    if (rest || !parts.length) parts.push(comma(rest));
    var s = parts.join(' ');
    s = /[억만]$/.test(s) ? s + ' 원' : s + '원';
    return (neg ? '−' : '') + s;
  }
  function manwon(n) { // 원 → '82만 원' (만 원 아래 반올림)
    var m = Math.round((n || 0) / MAN);
    if (m >= 10000) return won(m * MAN);
    return comma(m) + '만 원';
  }
  var fmt = { won: won, manwon: manwon, comma: comma };

  /* ------------------------------------------------------------------ */
  /* 가구 정리                                                            */
  /* ------------------------------------------------------------------ */
  var KID_KEYS = ['c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'];

  function n0(v) { return typeof v === 'number' && isFinite(v) && v > 0 ? v : 0; }

  function householdSize(s) {
    var kids = KID_KEYS.reduce(function (a, k) { return a + n0(s[k]); }, 0);
    return 1 + (s.spouse ? 1 : 0) + kids + n0(s.others);
  }

  function regionKeys(region) {
    // 기초생활보장 기본재산액 지역 구분 / 기초연금 지역 구분 / 주거급여 급지
    var map = {
      'seoul': { bls: 'seoul', bp: 'big', grade: 1 },
      'gyeonggi-si': { bls: 'gyeonggi', bp: 'mid', grade: 2 },
      'gyeonggi-gun': { bls: 'gyeonggi', bp: 'rural', grade: 2 },
      'incheon': { bls: 'metro', bp: 'big', grade: 2 },
      'metro': { bls: 'metro', bp: 'big', grade: 3 },
      'sejong': { bls: 'metro', bp: 'mid', grade: 3 },
      'changwon': { bls: 'metro', bp: 'big', grade: 3 },
      'do-si': { bls: 'other', bp: 'mid', grade: 4 },
      'do-gun': { bls: 'other', bp: 'rural', grade: 4 }
    };
    return map[region] || map['do-si'];
  }

  function normalize(s) {
    var h = {};
    h.today = s.today || null;
    h.who = s.who || 'self';
    h.age = n0(s.age);
    h.spouse = !!s.spouse;
    h.spouseAge = h.spouse ? n0(s.spouseAge) : 0;
    h.spouseEarns = h.spouse && !!s.spouseEarns;
    h.kids = {};
    KID_KEYS.forEach(function (k) { h.kids[k] = n0(s[k]); });
    h.kidsTotal = KID_KEYS.reduce(function (a, k) { return a + h.kids[k]; }, 0);
    h.kidsUnder18 = h.kidsTotal - h.kids.c7;
    h.schoolKids = { elem: h.kids.c3 + h.kids.c4, mid: h.kids.c5, high: h.kids.c6 };
    h.others = n0(s.others);
    h.othersSenior = Math.min(n0(s.othersSenior), h.others);
    h.size = householdSize(s);
    h.seniors = (h.age >= 65 ? 1 : 0) + (h.spouse && h.spouseAge >= 65 ? 1 : 0) + h.othersSenior;
    h.pregnant = !!s.pregnant;
    h.singleParent = !!s.singleParent && !h.spouse;
    h.dis = s.dis || 'none';
    h.disabledInHousehold = !!s.householdDisabled || h.dis !== 'none';
    h.region = s.region || 'do-si';
    h.rk = regionKeys(h.region);
    h.work = s.work || 'employee';
    h.insured = !!s.insured;
    h.earn = n0(s.earn) * MAN;           // 월 근로·사업소득(원)
    h.other = n0(s.otherInc) * MAN;      // 월 기타소득(원)
    h.annual = (s.annual == null ? (n0(s.earn) + n0(s.otherInc)) * 12 : n0(s.annual)) * MAN;
    h.annualGiven = s.annual != null;
    h.housing = s.housing || 'monthly';
    h.deposit = (h.housing === 'jeonse' || h.housing === 'monthly') ? n0(s.deposit) * MAN : 0;
    h.rent = h.housing === 'monthly' ? n0(s.rent) * MAN : 0;
    h.home = h.housing === 'own' ? n0(s.home) * MAN : 0;
    h.land = n0(s.land) * MAN;
    h.fin = n0(s.fin) * MAN;
    h.car = n0(s.car) * MAN;
    h.carExempt = !!s.carExempt;
    h.debt = n0(s.debt) * MAN;
    h.youthApart = !!s.youthApart;
    h.crisis = s.crisis || [];
    h.assetsTotal = h.home + h.deposit + h.land + h.fin + h.car;
    h.netAssets = Math.max(0, h.assetsTotal - h.debt);
    return h;
  }

  /* ------------------------------------------------------------------ */
  /* 기준값 조회                                                          */
  /* ------------------------------------------------------------------ */
  function P() { return root.BOKJI_DATA.params; }

  function median(size, year) {
    var t = P().median[year || P().year];
    if (size <= t.length) return t[size - 1];
    // 8인 이상: 7인 기준에서 6인과 7인의 차이만큼 1인당 더한다(보건복지부 고시 방식)
    var d = t[6] - t[5];
    return t[6] + d * (size - 7);
  }

  /* ------------------------------------------------------------------ */
  /* 소득인정액(기초생활보장 방식) 추정                                      */
  /* ------------------------------------------------------------------ */
  function blsCalc(h, benefit) {
    var p = P().bls;
    var lines = [];
    var earnDed = 0, notes = [];
    var e = h.earn;
    // 근로·사업소득 공제
    if (e > 0) {
      // 버는 사람이 신청인 한 명이라고 보고 신청인 나이·장애로 특례를 고른다.
      var youth = h.age <= p.youthAgeMax && h.age >= 15 && !h.spouseEarns;
      var senior = h.age >= p.seniorAgeMin || h.dis !== 'none';
      var flat = youth ? p.youthFlat : senior ? p.seniorFlat : 0;
      // 의료급여는 일반 30% 공제가 없고 청년·노인·장애인 특례만 있다.
      var rate = (benefit === 'medical' && !youth && !senior) ? 0 : p.earnRate;
      var afterFlat = Math.max(0, e - flat);
      earnDed = Math.min(e, flat) + afterFlat * rate;
      lines.push({ label: '근로·사업소득', value: e });
      lines.push({
        op: '−', label: '근로소득 공제', value: -earnDed,
        note: rate === 0 ? '의료급여는 일반 근로소득 공제가 없음' :
          (flat ? won(flat) + ' 먼저 빼고 ' : '') + '나머지의 ' + Math.round(rate * 100) + '%' + (youth ? ' (34세 이하 청년 공제)' : senior ? ' (노인·장애인 공제)' : '')
      });
    }
    if (h.other > 0) lines.push({ op: e > 0 ? '+' : '', label: '연금·기타 소득', value: h.other });
    var incomeEval = Math.max(0, e - earnDed + h.other);

    // 재산의 소득환산
    var rk = h.rk.bls;
    // 기본재산액·주거용재산 한도는 생계·의료·주거·교육급여가 같다.
    var basic = p.basicProperty[rk];
    var cap = p.housingCap[rk];
    var housingAsset = h.home + h.deposit;
    var housing = Math.min(housingAsset, cap);
    var general = h.land + Math.max(0, housingAsset - cap);
    var car = h.car;
    var carGeneral = h.carExempt ? car : 0;
    var carFull = h.carExempt ? 0 : car;
    general += carGeneral;
    var finAfter = Math.max(0, h.fin - p.finReserve);

    // 기본재산액과 부채를 정해진 순서로 뺀다
    var remainDed = basic + h.debt;
    var pools = { general: general, financial: finAfter, housing: housing };
    p.deductOrder.forEach(function (k) {
      var take = Math.min(pools[k], remainDed);
      pools[k] -= take; remainDed -= take;
    });
    var conv = pools.housing * p.rate.housing + pools.general * p.rate.general + pools.financial * p.rate.financial + carFull * p.rate.car;
    conv = Math.max(0, conv);

    lines.push({ op: '=', label: '소득평가액', value: incomeEval });
    var parts = [];
    if (pools.housing > 0) parts.push('주거용 ' + won(pools.housing) + '×' + pct(p.rate.housing));
    if (pools.general > 0) parts.push('일반 ' + won(pools.general) + '×' + pct(p.rate.general));
    if (pools.financial > 0) parts.push('금융 ' + won(pools.financial) + '×' + pct(p.rate.financial));
    if (carFull > 0) parts.push('자동차 ' + won(carFull) + '×' + pct(p.rate.car));
    lines.push({
      op: '+', label: '재산의 소득환산액', value: conv,
      note: '기본재산액 ' + won(basic) + (h.debt ? '과 부채 ' + won(h.debt) : '') + '을 뺀 뒤 ' + (parts.length ? parts.join(', ') : '남는 재산 없음') +
        (carFull > 0 ? '. 자동차는 공제 없이 가액 전체가 한 달 소득으로 잡힘' : '')
    });
    var recognized = incomeEval + conv;
    lines.push({ label: '한 달 소득인정액(추정)', value: recognized, total: true });
    var med = median(h.size);
    return { lines: lines, incomeEval: incomeEval, conv: conv, recognized: recognized, median: med, ratio: med ? recognized / med * 100 : 0, carFull: carFull, notes: notes };
  }

  function pct(r) {
    var v = r * 100;
    return (Math.round(v * 100) / 100) + '%';
  }

  /* ------------------------------------------------------------------ */
  /* 소득인정액(기초연금·장애인연금 방식) 추정                               */
  /* ------------------------------------------------------------------ */
  function pensionCalc(h, earnFlat) {
    var p = P().basicPension;
    var e = h.earn;
    // 근로소득 공제는 본인·배우자 각각. 배우자도 벌면 공제를 두 번 적용한다.
    var flat = earnFlat * (h.spouseEarns ? 2 : 1);
    var earnEval = Math.max(0, e - flat) * (1 - p.earnRate);
    var incomeEval = earnEval + h.other;
    var basic = p.basicProperty[h.rk.bp];
    var car = h.car;
    var carLux = !h.carExempt && car >= p.luxuryCarValue ? car : 0;
    var general = h.home + h.deposit + h.land + (car - carLux);
    var finAfter = Math.max(0, h.fin - p.finDeduct);
    // {(일반재산 − 기본재산액) + (금융재산 − 2,000만 원) − 부채} × 연 4% ÷ 12 + 고급자동차
    var propertyBase = Math.max(0, Math.max(0, general - basic) + finAfter - h.debt);
    var conv = propertyBase * p.propertyRate / 12 + carLux;
    var recognized = incomeEval + conv;
    return { recognized: recognized, incomeEval: incomeEval, conv: conv, basic: basic, carLux: carLux };
  }

  /* ------------------------------------------------------------------ */
  /* 판정 도우미                                                          */
  /* ------------------------------------------------------------------ */
  function R(state, text) { return { state: state, text: text }; }
  function pass(t) { return R('pass', t); }
  function fail(t) { return R('fail', t); }
  function ask(t) { return R('ask', t); }

  function verdict(id, reasons, extra) {
    var st = 'ok';
    reasons.forEach(function (r) {
      if (r.state === 'fail') st = 'no';
      else if (r.state === 'ask' && st !== 'no') st = 'warn';
    });
    var out = { id: id, status: st, reasons: reasons };
    if (extra) Object.keys(extra).forEach(function (k) { out[k] = extra[k]; });
    if (st === 'no' && out.amount) delete out.amount;
    return out;
  }

  // 30세 미만 미혼 자녀는 따로 살아도 부모 가구로 묶일 수 있다(기초생활보장 가구 범위).
  function youngAdult(h, r) {
    if (h.age >= 19 && h.age < 30 && !h.spouse && h.size === 1) {
      r.push(ask('30세 미만 미혼이면 따로 살아도 부모 가구원으로 보아 부모 소득·재산을 함께 볼 수 있음'));
    }
  }

  function ratioCheck(calc, limitPct, label) {
    var line = '소득인정액 ' + won(calc.recognized) + ' (기준중위소득의 ' + calc.ratio.toFixed(1) + '%)';
    var lim = median(calcSize(calc)) * limitPct / 100;
    return calc.ratio <= limitPct
      ? pass(line + '이 ' + label + ' ' + won(lim) + ' 이하')
      : fail(line + '이 ' + label + ' ' + won(lim) + '을 넘음');
  }
  function calcSize(calc) { return calc._size; }

  function deadlineText(h, d) {
    if (!d) return null;
    if (h.today && d.until && h.today > d.until) return null;
    return d.text;
  }

  /* ------------------------------------------------------------------ */
  /* 제도별 규칙                                                          */
  /* ------------------------------------------------------------------ */
  var RULES = {};

  RULES.livelihood = function (h, ctx) {
    var c = ctx.bls.livelihood, p = P().bls;
    var limit = median(h.size) * p.ratio.livelihood / 100;
    var r = [ratioCheck(c, p.ratio.livelihood, '생계급여 선정기준')];
    r.push(pass('부양의무자 기준은 원칙적으로 없음. 부양의무자가 연 소득 ' + won(p.supporterIncomeLimit) + ' 또는 일반재산 ' + won(p.supporterAssetLimit) + '을 넘는 경우만 제외'));
    youngAdult(h, r);
    var amt = Math.max(0, limit - c.recognized);
    return verdict('livelihood', r, { amount: { text: '월 ' + manwon(amt), sub: '선정기준액−소득인정액' } });
  };

  RULES.medical = function (h, ctx) {
    var c = ctx.bls.medical, p = P().bls;
    var r = [ratioCheck(c, p.ratio.medical, '의료급여 선정기준')];
    r.push(ask('부양의무자(부모·자녀 등 1촌 직계혈족과 그 배우자)의 소득·재산 기준이 남아 있어 조사 대상'));
    youngAdult(h, r);
    return verdict('medical', r, { amount: { text: '진료비 대부분', sub: '1종·2종에 따라 본인부담 차등' } });
  };

  RULES.housing = function (h, ctx) {
    var c = ctx.bls.housing, p = P().bls;
    var r = [ratioCheck(c, p.ratio.housing, '주거급여 선정기준')];
    var amount = null;
    if (h.housing === 'monthly' || h.housing === 'jeonse') {
      var table = P().housingRent['g' + h.rk.grade];
      var base = table[Math.min(h.size, table.length) - 1] * (h.size >= 8 ? 1.1 : 1);
      var rentEq = h.rent + h.deposit * P().housingDepositRate;
      var pay = Math.min(rentEq, base);
      var limit = median(h.size) * p.ratio.livelihood / 100;
      if (c.recognized > limit) pay = Math.max(0, pay - (c.recognized - limit) * p.housingSelfBurden);
      r.push(pass('임차가구: ' + h.rk.grade + '급지 ' + Math.min(h.size, table.length) + (h.size > table.length ? '인 이상' : '인') + ' 기준임대료 ' + won(base) + ' 안에서 실제 임차료를 지원'));
      amount = { text: '월 ' + manwon(pay), sub: '임차급여 추정' };
    } else if (h.housing === 'own') {
      r.push(pass('자가가구: 주택 노후도에 따라 수선유지급여(보수 공사) 지원'));
      amount = { text: '집 수리', sub: '수선유지급여' };
    } else {
      r.push(ask('무상 거주는 임차료가 없어 지원 방식이 달라질 수 있음'));
    }
    if (h.age >= 19 && h.age < 30 && !h.spouse && h.size === 1) {
      r.push(ask('30세 미만 미혼 자녀는 부모 가구로 판정. 부모 가구가 주거급여를 받으면 청년 분리지급으로 따로 받을 수 있음'));
    }
    return verdict('housing', r, { amount: amount });
  };

  RULES.education = function (h, ctx) {
    var c = ctx.bls.education, p = P().bls, e = P().educationAid;
    var r = [ratioCheck(c, p.ratio.education, '교육급여 선정기준')];
    var k = h.schoolKids;
    var n = k.elem + k.mid + k.high;
    if (!n) r.push(fail('초·중·고등학생 자녀가 없음'));
    else r.push(pass('초 ' + k.elem + '명, 중 ' + k.mid + '명, 고 ' + k.high + '명'));
    var total = k.elem * e.elem + k.mid * e.mid + k.high * e.high;
    return verdict('education', r, { amount: n ? { text: '연 ' + manwon(total), sub: '교육활동지원비' } : null });
  };

  RULES.chasangwi = function (h, ctx) {
    var c = ctx.bls.livelihood, p = P().bls;
    var r = [];
    if (c.ratio <= p.ratio.medical) {
      r.push(fail('소득인정액이 생계·의료급여 기준 안이라 차상위 대신 기초생활보장을 신청하는 것이 맞음'));
    } else {
      r.push(ratioCheck(c, p.ratio.chasangwi, '차상위 기준'));
      if (c.ratio <= p.ratio.housing) r.push(ask('주거·교육급여를 받게 되면 그 자격으로 대부분의 감면을 받음'));
    }
    youngAdult(h, r);
    return verdict('chasangwi', r, { amount: { text: '감면·우선 지원', sub: '본인부담경감·자활 등' } });
  };

  RULES.basicPension = function (h, ctx) {
    var bp = P().basicPension, c = ctx.pension;
    var r = [];
    var couple = h.spouse;
    var elig65 = h.age >= 65 || (couple && h.spouseAge >= 65);
    var near = !elig65 && h.age === 64;
    if (elig65) r.push(pass('만 65세 이상'));
    else if (near) r.push(ask('만 65세가 되는 달의 1개월 전부터 신청 가능'));
    else r.push(fail('만 65세 미만'));
    var limit = couple ? bp.limitCouple : bp.limitSingle;
    var line = '기초연금 방식 소득인정액 ' + won(c.recognized);
    r.push(c.recognized <= limit
      ? pass(line + '이 ' + (couple ? '부부' : '단독') + ' 선정기준액 ' + won(limit) + ' 이하')
      : fail(line + '이 ' + (couple ? '부부' : '단독') + ' 선정기준액 ' + won(limit) + '을 넘음'));
    if (h.region === 'gyeonggi-si') r.push(ask('수원·용인·고양·화성 같은 특례시는 기본재산액이 대도시 기준(' + manwon(bp.basicProperty.big) + ')이라 더 유리함. 여기서는 중소도시 기준으로 계산'));
    if (h.kidsTotal + h.others > 0 && h.earn > 0) r.push(ask('기초연금은 본인과 배우자 소득만 봄. 입력한 가구 소득에 자녀 소득이 섞여 있으면 실제보다 불리하게 계산됨'));
    var both = couple && h.age >= 65 && h.spouseAge >= 65;
    var full = bp.maxAmount;
    var amt = both ? full * 2 * (1 - bp.coupleCut) : full;
    return verdict('basicPension', r, {
      amount: { text: '월 최대 ' + manwon(amt), sub: both ? '부부 각각 ' + Math.round(bp.coupleCut * 100) + '% 감액' : '1인 기준' },
      notes: ['공무원·군인·사립학교교직원·별정우체국 연금을 받는 분과 그 배우자는 원칙적으로 제외됩니다.', '국민연금을 오래 받는 분은 기초연금액이 줄 수 있습니다.']
    });
  };

  RULES.disabilityPension = function (h, ctx) {
    var dp = P().disabilityPension, c = ctx.disPension, b = ctx.bls.livelihood, br = P().bls.ratio;
    var r = [];
    r.push(h.age >= 18 ? pass('만 18세 이상') : fail('만 18세 미만'));
    r.push(h.dis === 'severe' ? pass('심한 장애(중증)') : fail('장애인연금은 심한 장애(중증) 대상'));
    var limit = h.spouse ? dp.limitCouple : dp.limitSingle;
    r.push(c.recognized <= limit
      ? pass('장애인연금 방식 소득인정액 ' + won(c.recognized) + '이 ' + (h.spouse ? '부부' : '단독') + ' 선정기준액 ' + won(limit) + ' 이하')
      : fail('장애인연금 방식 소득인정액 ' + won(c.recognized) + '이 ' + (h.spouse ? '부부' : '단독') + ' 선정기준액 ' + won(limit) + '을 넘음'));
    if (h.age >= 65) r.push(ask('65세부터는 기초급여 대신 기초연금을 받고 부가급여만 계속 받음'));
    var extra = b.ratio <= br.medical ? dp.extra.recipient : b.ratio <= br.chasangwi ? dp.extra.chasangwi : dp.extra.above;
    var basic = h.age >= 65 ? 0 : dp.basic;
    return verdict('disabilityPension', r, { amount: { text: '월 최대 ' + manwon(basic + extra), sub: (basic ? '기초급여 ' + manwon(basic) + ' + ' : '') + '부가급여 ' + manwon(extra) } });
  };

  RULES.disabilityAllowance = function (h, ctx) {
    var c = ctx.bls.livelihood, p = P().bls, da = P().disabilityAllowance;
    var r = [];
    r.push(h.age >= 18 ? pass('만 18세 이상') : ask('18세 미만은 장애아동수당으로 따로 판정'));
    r.push(h.dis === 'mild' ? pass('심하지 않은 장애(경증)') : fail(h.dis === 'severe' ? '중증은 장애인연금 대상' : '등록 장애가 없음'));
    r.push(c.ratio <= p.ratio.chasangwi ? pass('기초생활보장 수급자 또는 차상위 기준(중위 ' + p.ratio.chasangwi + '%) 이내') : fail('기초생활보장·차상위 기준(중위 ' + p.ratio.chasangwi + '%)을 넘음'));
    return verdict('disabilityAllowance', r, { amount: { text: '월 ' + manwon(da.amount), sub: '경증 장애인' } });
  };

  RULES.seniorCare = function (h, ctx) {
    var r = [];
    r.push(h.age >= 65 ? pass('만 65세 이상') : fail('만 65세 미만'));
    var ok = ctx.flags.basicPension || ctx.bls.livelihood.ratio <= P().bls.ratio.chasangwi;
    r.push(ok ? pass('기초연금·기초생활보장·차상위 대상 범위') : fail('기초연금·기초생활보장·차상위 대상이 아님'));
    r.push(ask('혼자 생활하기 어려운 정도(돌봄 필요도)를 방문해 판정. 장기요양 등급자는 제외'));
    return verdict('seniorCare', r, { amount: { text: '안부·가사·외출 지원', sub: '방문 돌봄' } });
  };

  RULES.seniorJobs = function (h, ctx) {
    var sj = P().seniorJobs;
    var r = [];
    r.push(h.age >= 65 ? pass('만 65세 이상') : fail('만 65세 미만(공익활동형 기준)'));
    r.push(ctx.flags.basicPension ? pass('기초연금 받을 가능성 있음') : fail('공익활동형은 기초연금 수급자 대상'));
    if (ctx.bls.livelihood.ratio <= P().bls.ratio.livelihood) r.push(fail('생계급여를 받을 수 있는 소득 수준. 생계급여 수급자는 공익활동에 참여할 수 없음'));
    if (h.work === 'employee') r.push(ask('건강보험 직장가입자는 참여할 수 없음'));
    r.push(ask('주로 연말~연초에 수행기관이 모집하고, 인원이 차면 대기'));
    return verdict('seniorJobs', r, { amount: { text: '월 ' + manwon(sj.monthly), sub: '공익활동 활동비' } });
  };

  RULES.childAllowance = function (h, ctx) {
    var ca = P().childAllowance;
    var n = 0;
    ca.kidKeys.forEach(function (k) { n += h.kids[k]; });
    var capital = h.region === 'seoul' || h.region === 'incheon' || h.region.indexOf('gyeonggi') === 0;
    var per = capital ? ca.amountCapital : ca.amountOther;
    var r = [n ? pass('2026년 대상 나이(2017년 이후 출생) 자녀 ' + n + '명') : fail('2017년 이후 태어난 자녀가 없음')];
    r.push(pass('소득·재산 기준 없음'));
    return verdict('childAllowance', r, {
      amount: n ? { text: '월 ' + won(n * per), sub: (capital ? '수도권' : '비수도권') + ' 1명당 ' + won(per) } : null,
      notes: ca.notes
    });
  };

  RULES.parentBenefit = function (h) {
    var pb = P().parentBenefit;
    var a = h.kids.c0 * pb.age0 + h.kids.c1 * pb.age1;
    var r = [];
    if (h.kids.c0 || h.kids.c1) r.push(pass('0세 ' + h.kids.c0 + '명, 1세 ' + h.kids.c1 + '명'));
    else r.push(fail('만 2세 미만 자녀가 없음'));
    r.push(pass('소득·재산 기준 없음'));
    return verdict('parentBenefit', r, { amount: a ? { text: '월 ' + manwon(a), sub: '어린이집 이용 시 보육료만큼 차감' } : null });
  };

  RULES.firstMeet = function (h) {
    var fm = P().firstMeet;
    var r = [];
    var older = h.kidsTotal - h.kids.c0;
    if (h.kids.c0) r.push(pass('태어난 지 1년이 안 된 아이가 있음(출생 후 2년 안에 신청·사용)'));
    else if (h.kids.c1) r.push(ask('출생 후 2년이 지나지 않았다면 아직 신청할 수 있음'));
    else if (h.pregnant) r.push(ask('출산하면 출생신고 때 함께 신청'));
    else r.push(fail('출생 2년 이내 아이나 임신 중인 사람이 없음'));
    var amt = older > 0 || h.kids.c0 > 1 ? fm.second : fm.first;
    return verdict('firstMeet', r, { amount: { text: manwon(amt), sub: older > 0 ? '둘째 이상' : '첫째, 둘째부터 ' + manwon(fm.second) } });
  };

  RULES.pregnancyCare = function (h) {
    var pc = P().pregnancyCare;
    var r = [h.pregnant ? pass('임신 중') : fail('임신 중인 가구원이 없음')];
    return verdict('pregnancyCare', r, { amount: { text: manwon(pc.single), sub: '다태아는 태아 1명당 ' + manwon(pc.perFetus) } });
  };

  RULES.childcareService = function (h, ctx) {
    var ac = P().childcare;
    var n = h.kids.c0 + h.kids.c1 + h.kids.c2 + h.kids.c3 + h.kids.c4;
    var r = [n ? pass('만 12세 이하 자녀 ' + n + '명') : fail('만 12세 이하 자녀가 없음')];
    var gap = h.spouseEarns || h.singleParent || h.disabledInHousehold || n >= 2;
    r.push(gap ? pass('양육 공백 가정(맞벌이·한부모·장애·다자녀 등)') : ask('맞벌이·한부모·다자녀처럼 양육 공백이 있어야 정부 지원. 없으면 전액 본인 부담으로 이용'));
    var ratio = (h.earn + h.other) / median(h.size) * 100;
    r.push(ratio <= ac.supportRatio ? pass('가구 소득이 기준중위소득 ' + ac.supportRatio + '% 이하로 보임(실제 판정은 건강보험료)') : fail('가구 소득이 기준중위소득 ' + ac.supportRatio + '%를 넘으면 정부 지원 없음'));
    return verdict('childcareService', r, { amount: n ? { text: '이용요금 15~85%', sub: '소득유형에 따라 정부 지원' } : null });
  };

  RULES.singleParent = function (h, ctx) {
    var sp = P().singleParent, c = ctx.bls.livelihood;
    var n = h.kidsUnder18;
    var r = [];
    r.push(h.singleParent ? pass('한부모 가구') : fail('한부모 가구가 아님'));
    r.push(n ? pass('18세 미만 자녀 ' + n + '명') : fail('18세 미만 자녀가 없음'));
    var lim = median(h.size) * sp.ratio / 100;
    r.push(c.ratio <= sp.ratio ? pass('소득인정액 추정 ' + won(c.recognized) + '이 기준중위소득 ' + sp.ratio + '%(' + won(lim) + ') 이하') : fail('소득인정액 추정 ' + won(c.recognized) + '이 기준중위소득 ' + sp.ratio + '%(' + won(lim) + ')를 넘음'));
    var teen = h.age <= 24;
    var amt, sub;
    if (teen) {
      var u2 = h.kids.c0 + h.kids.c1;
      amt = u2 * sp.teenUnder2 + (n - u2) * sp.teen2plus;
      sub = '청소년한부모(24세 이하)';
    } else {
      amt = n * sp.amount + (h.age >= 25 && h.age <= 34 ? n * sp.extra : 0);
      sub = h.age >= 25 && h.age <= 34 ? '청년 한부모 추가 포함' : '자녀 1명당 ' + manwon(sp.amount);
    }
    return verdict('singleParent', r, { amount: n ? { text: '월 ' + manwon(amt), sub: sub } : null });
  };

  RULES.childTax = function (h) {
    var ct = P().childTax;
    var n = h.kidsUnder18;
    var r = [];
    r.push(n ? pass('18세 미만 자녀 ' + n + '명') : fail('18세 미만 자녀가 없음'));
    var works = h.earn > 0 || h.work === 'employee' || h.work === 'self' || h.work === 'closed';
    r.push(works ? pass('2025년에 근로·사업소득이 있음') : fail('2025년 근로·사업소득이 있어야 함'));
    r.push(h.annual < ct.incomeLimit ? pass('2025년 부부 합산 총소득 ' + manwon(h.annual) + '이 ' + manwon(ct.incomeLimit) + ' 미만') : fail('2025년 부부 합산 총소득 ' + manwon(h.annual) + '이 ' + manwon(ct.incomeLimit) + ' 이상'));
    r.push(assetCheck(h, ct.assetLimit, ct.assetCut));
    if (!h.annualGiven) r.push(ask('한 해 총소득을 비워 두어 한 달 소득×12로 계산함'));
    return verdict('childTax', r, {
      amount: n ? { text: '최대 ' + manwon(n * ct.maxPerChild), sub: '자녀 1명당 ' + manwon(ct.minPerChild) + '~' + manwon(ct.maxPerChild) } : null,
      deadline: deadlineText(h, ct.deadline)
    });
  };

  function assetCheck(h, limit, cut) {
    var a = h.assetsTotal; // 근로·자녀장려금 재산은 부채를 빼지 않는다
    if (a >= limit) return fail('가구 재산 합계 ' + manwon(a) + '(부채 빼지 않음)이 ' + manwon(limit) + ' 이상');
    if (cut && a >= cut) return ask('가구 재산 ' + manwon(a) + '이 ' + manwon(cut) + ' 이상이라 50% 감액');
    return pass('가구 재산 합계 ' + manwon(a) + '이 ' + manwon(limit) + ' 미만');
  }

  RULES.eitc = function (h) {
    var et = P().eitc;
    var type = h.spouseEarns ? 'dual' : (h.spouse || h.kidsUnder18 > 0 || h.othersSenior > 0) ? 'single' : 'alone';
    var names = { alone: '단독가구', single: '홑벌이가구', dual: '맞벌이가구' };
    var lim = et.incomeLimit[type];
    var r = [];
    r.push(h.earn > 0 || h.work === 'employee' || h.work === 'self' || h.work === 'closed' ? pass('근로·사업소득이 있음') : fail('근로·사업소득이 없음'));
    r.push(h.annual < lim ? pass(names[type] + ' 총소득 ' + manwon(h.annual) + '이 기준 ' + manwon(lim) + ' 미만') : fail(names[type] + ' 총소득 ' + manwon(h.annual) + '이 기준 ' + manwon(lim) + ' 이상'));
    r.push(assetCheck(h, et.assetLimit, et.assetCut));
    if (type !== 'dual' && h.spouse) r.push(ask('배우자 총소득이 연 300만 원 미만이면 홑벌이로 봄'));
    if (!h.annualGiven) r.push(ask('한 해 총소득을 비워 두어 한 달 소득×12로 계산함'));
    return verdict('eitc', r, {
      amount: { text: '최대 ' + manwon(et.max[type]), sub: names[type] + ' 기준' },
      deadline: deadlineText(h, et.deadline)
    });
  };

  RULES.nationalEmployment = function (h, ctx) {
    var ne = P().nationalEmployment, c = ctx.bls.livelihood;
    var youth = h.age >= ne.youthMin && h.age <= ne.youthMax;
    var r = [];
    r.push(h.age >= ne.ageMin && h.age <= ne.ageMax ? pass('만 ' + ne.ageMin + '~' + ne.ageMax + '세') : fail('만 ' + ne.ageMin + '~' + ne.ageMax + '세가 아님'));
    var looking = h.work === 'seeking' || h.work === 'closed' || h.work === 'none' || h.work === 'student';
    r.push(looking ? pass('일자리를 찾는 중') : ask('주 30시간 이상 일하거나 월 250만 원 이상 사업소득이 있으면 참여할 수 없음'));
    if (c.ratio <= P().bls.ratio.livelihood) r.push(ask('생계급여를 받게 되면 원칙적으로 참여할 수 없음(조건부 수급자는 가능)'));
    var limitPct = youth ? ne.youthRatio : ne.ratio;
    var inc = h.earn + h.other;
    var lim = median(h.size) * limitPct / 100;
    var assetLim = youth ? ne.youthAsset : ne.asset;
    var typeOne = inc <= lim && h.netAssets <= assetLim;
    r.push(inc <= lim ? pass('가구 소득 ' + won(inc) + '이 기준중위소득 ' + limitPct + '%(' + won(lim) + ') 이하' + (youth ? ', 청년 특례' : ''))
      : ask('가구 소득이 Ⅰ유형 기준(중위 ' + limitPct + '%)을 넘음. ' + (youth ? '청년은 Ⅱ유형으로 소득과 관계없이 참여 가능' : '중위 ' + ne.midRatio + '% 이하면 Ⅱ유형 참여 가능')));
    r.push(h.netAssets <= assetLim ? pass('재산 ' + manwon(h.netAssets) + '이 ' + manwon(assetLim) + ' 이하') : ask('재산이 ' + manwon(assetLim) + '을 넘어 Ⅰ유형은 어렵고 Ⅱ유형만 가능'));
    if (!youth) r.push(ask('최근 2년 안에 100일 또는 800시간 이상 일한 경험이 있어야 Ⅰ유형(청년은 경험 없이도 선발 가능)'));
    var deps = h.kidsUnder18 + h.othersSenior;
    var add = Math.min(ne.dependentMax, deps * ne.dependentAdd);
    return verdict('nationalEmployment', r, { amount: typeOne ? { text: '월 ' + manwon(ne.allowance + add) + ' × ' + ne.months + '개월', sub: '구직촉진수당' + (add ? '(부양가족 추가 포함)' : '') } : { text: '취업지원 서비스', sub: 'Ⅱ유형 참여수당' } });
  };

  RULES.youthSaving = function (h, ctx) {
    var ys = P().youthSaving, c = ctx.bls.livelihood;
    var r = [];
    r.push(h.age >= ys.ageMin && h.age <= ys.ageMax ? pass('만 ' + ys.ageMin + '~' + ys.ageMax + '세') : fail('만 ' + ys.ageMin + '~' + ys.ageMax + '세가 아님'));
    var working = (h.work === 'employee' || h.work === 'self') && h.earn >= ys.earnMin;
    r.push(working ? pass('월 ' + manwon(ys.earnMin) + ' 이상 근로·사업소득이 있음') : fail('월 ' + manwon(ys.earnMin) + ' 이상 일해서 버는 소득이 있어야 함'));
    r.push(c.ratio <= ys.ratio ? pass('가구 소득인정액이 기준중위소득 ' + ys.ratio + '% 이하(수급·차상위)') : fail('가구 소득인정액이 기준중위소득 ' + ys.ratio + '%를 넘음. 이 소득대는 청년미래적금 대상'));
    r.push(ask(ys.periodNote));
    youngAdult(h, r);
    return verdict('youthSaving', r, { amount: { text: '월 ' + manwon(ys.match) + ' 지원', sub: '3년, 본인 저축에 매칭' } });
  };

  RULES.youthRent = function (h, ctx) {
    var yr = P().youthRent;
    var r = [];
    r.push(h.age >= yr.ageMin && h.age <= yr.ageMax ? pass('만 ' + yr.ageMin + '~' + yr.ageMax + '세') : fail('만 ' + yr.ageMin + '~' + yr.ageMax + '세가 아님'));
    r.push(h.youthApart ? pass('부모와 따로 사는 청년') : fail('부모와 따로 사는 무주택 청년이어야 함'));
    r.push(h.housing === 'monthly' ? pass('월세로 거주') : fail('월세 거주가 아님'));
    var inc = h.earn + h.other;
    var lim = median(h.size) * yr.youthRatio / 100;
    r.push(inc <= lim ? pass('청년 가구 소득 ' + won(inc) + '이 기준중위소득 ' + yr.youthRatio + '%(' + won(lim) + ') 이하') : fail('청년 가구 소득 ' + won(inc) + '이 기준중위소득 ' + yr.youthRatio + '%(' + won(lim) + ')를 넘음'));
    r.push(h.assetsTotal <= yr.youthAsset ? pass('청년 가구 재산 ' + manwon(h.assetsTotal) + '이 ' + manwon(yr.youthAsset) + ' 이하') : fail('청년 가구 재산이 ' + manwon(yr.youthAsset) + '을 넘음'));
    r.push(ask('부모 가구(원가구) 소득이 기준중위소득 ' + yr.parentRatio + '% 이하, 재산 ' + manwon(yr.parentAsset) + ' 이하여야 함'));
    r.push(ask(yr.periodNote));
    return verdict('youthRent', r, { amount: { text: '월 최대 ' + manwon(yr.max), sub: '최장 ' + yr.months + '개월' } });
  };

  RULES.youthFuture = function (h, ctx) {
    var yf = P().youthFuture;
    var r = [];
    r.push(h.age >= yf.ageMin && h.age <= yf.ageMax ? pass('만 ' + yf.ageMin + '~' + yf.ageMax + '세(병역 기간은 최대 6년 빼고 계산)') : fail('만 ' + yf.ageMin + '~' + yf.ageMax + '세가 아님'));
    var working = h.work === 'employee' || h.work === 'self';
    r.push(working ? pass('일하고 있음(2025년 소득이 확인돼야 함)') : fail('2025년 근로·사업소득이 있어야 함'));
    var ratio = (h.earn + h.other) / median(h.size) * 100;
    var pay = h.spouseEarns ? h.annual / 2 : h.annual;
    var plus = pay <= yf.plus.pay && ratio <= yf.plus.ratio;
    var normal = pay <= yf.normal.pay && ratio <= yf.normal.ratio;
    if (plus) r.push(pass('2025년 총급여 ' + manwon(pay) + ', 가구 소득 중위 ' + ratio.toFixed(0) + '%로 우대형 범위(중소기업 재직·소상공인이면 정부기여금 12%)'));
    else if (normal) r.push(pass('2025년 총급여 ' + manwon(pay) + ', 가구 소득 중위 ' + ratio.toFixed(0) + '%로 일반형 범위(정부기여금 6%)'));
    else r.push(fail('총급여 ' + manwon(yf.normal.pay) + ' 이하, 가구 소득 기준중위소득 ' + yf.normal.ratio + '% 이하여야 정부기여금 대상'));
    r.push(ask(yf.periodNote));
    var rate = plus ? yf.plus.rate : yf.normal.rate;
    return verdict('youthFuture', r, { amount: { text: '3년 최대 ' + manwon(yf.monthlyMax * rate * 36), sub: '정부기여금 ' + Math.round(rate * 100) + '%, 월 50만 원 납입 시' } });
  };

  RULES.unemploymentBenefit = function (h) {
    var ub = P().unemployment;
    var r = [];
    var lost = h.work === 'seeking' || h.work === 'closed';
    r.push(lost ? pass('일자리를 잃고 구직 중') : fail('지금 일하고 있거나 구직 중이 아님'));
    if (h.work === 'closed') r.push(ask('자영업자는 폐업 전 24개월 중 1년 이상 자영업자 고용보험에 가입했고, 6개월 연속 적자나 매출 20% 이상 감소 같은 부득이한 사유로 폐업해야 함'));
    else r.push(h.insured ? pass('이직 전 18개월 중 고용보험 가입 180일 이상') : fail('이직 전 18개월 중 고용보험 가입 180일 이상이어야 함'));
    r.push(ask('회사 사정 등 비자발적 이직이어야 함. 자발적 퇴사는 원칙적으로 제외'));
    return verdict('unemploymentBenefit', r, { amount: { text: '하루 ' + won(ub.dailyMin) + '~' + won(ub.dailyMax), sub: '이전 평균임금의 60%' } });
  };

  RULES.emergency = function (h, ctx) {
    var em = P().emergency;
    var r = [];
    var crisisNames = { 'income-loss': '주소득자 실직·휴폐업', 'breadwinner': '주소득자 사망·가출·구금', 'illness': '중한 질병·부상', 'abuse': '가정폭력·학대', 'disaster': '화재 등으로 거주 곤란', 'arrears': '단전 등 공과금 체납' };
    if (h.crisis.length) r.push(pass('위기 사유: ' + h.crisis.map(function (c) { return crisisNames[c] || c; }).join(', ')));
    else r.push(fail('입력한 위기 사유가 없음'));
    var inc = h.earn + h.other;
    var med = median(h.size);
    var lim = med * em.ratio / 100;
    r.push(inc <= lim ? pass('월 소득 ' + won(inc) + '이 기준중위소득 ' + em.ratio + '%(' + won(lim) + ') 이하') : fail('월 소득 ' + won(inc) + '이 기준중위소득 ' + em.ratio + '%(' + won(lim) + ')를 넘음'));
    var propLim = em.property[h.rk.bp];
    var prop = h.home + h.deposit + h.land + h.car;
    r.push(prop <= propLim ? pass('재산 합계 ' + manwon(prop) + '이 ' + manwon(propLim) + ' 이하') : ask('재산 합계 ' + manwon(prop) + '이 ' + manwon(propLim) + '을 넘음. 사는 집은 일부 공제돼 기준이 올라갈 수 있음'));
    var finLim = Math.floor((med + em.finAdd) / 1000) * 1000;
    r.push(h.fin <= finLim ? pass('금융재산 ' + manwon(h.fin) + '이 ' + won(finLim) + ' 이하') : fail('금융재산 ' + manwon(h.fin) + '이 ' + won(finLim) + '을 넘음'));
    var t = em.livelihood;
    var amt = h.size <= t.length ? t[h.size - 1] : t[t.length - 1] + em.livelihoodExtra * (h.size - t.length);
    return verdict('emergency', r, {
      amount: { text: '월 ' + manwon(amt), sub: '생계지원, 위기가 이어지면 연장' },
      notes: ['급하면 먼저 지원하고 소득·재산은 나중에 조사합니다. 보건복지상담센터 129나 시군구·주민센터에 바로 연락하세요. 누구나 대신 요청할 수 있습니다.']
    });
  };

  RULES.energyVoucher = function (h, ctx) {
    var ev = P().energyVoucher, c = ctx.bls, br = P().bls.ratio;
    var r = [];
    var school = h.schoolKids.elem + h.schoolKids.mid + h.schoolKids.high;
    var inBls = c.livelihood.ratio <= br.housing || c.medical.ratio <= br.medical || (school > 0 && c.livelihood.ratio <= br.education);
    r.push(inBls ? pass('생계·의료·주거·교육급여 중 하나를 받을 수 있는 소득 수준') : fail('생계·의료·주거·교육급여 수급 가구만 대상(차상위만으로는 안 됨)'));
    var traits = [];
    if (h.seniors > 0) traits.push('65세 이상');
    if (h.kids.c0 + h.kids.c1 + h.kids.c2 > 0) traits.push('취학 전 아동');
    if (h.disabledInHousehold) traits.push('장애인');
    if (h.pregnant) traits.push('임산부');
    if (h.singleParent) traits.push('한부모');
    if (h.kidsUnder18 + h.kids.c7 >= 2 && (h.spouse || h.singleParent || h.kidsTotal > 0)) traits.push('자녀 2명 이상');
    r.push(traits.length ? pass('세대원 특성: ' + traits.join(', ')) : ask('노인·영유아·장애인·임산부·중증질환자·한부모·소년소녀가정·다자녀 중 하나가 있어야 함'));
    var t = ev.amount;
    var amt = t[Math.min(h.size, t.length) - 1];
    return verdict('energyVoucher', r, { amount: { text: '연 ' + manwon(amt), sub: '여름+겨울, ' + Math.min(h.size, t.length) + (h.size >= t.length ? '인 이상' : '인') + ' 세대' }, deadline: deadlineText(h, ev.deadline) });
  };

  RULES.telecom = function (h, ctx) {
    var tc = P().telecom, c = ctx.bls, br = P().bls.ratio;
    var r = [];
    var lim = 0, who = '';
    if (c.livelihood.ratio <= br.livelihood || c.medical.ratio <= br.medical) { lim = tc.recipient; who = '생계·의료급여 수급자'; }
    else if (c.livelihood.ratio <= br.chasangwi) { lim = tc.nearPoor; who = '주거·교육급여 수급자·차상위'; }
    else if (ctx.flags.basicPension) { lim = tc.pension; who = '기초연금 수급자'; }
    if (who) r.push(pass(who + '로 감면 가능'));
    else if (h.disabledInHousehold) r.push(pass('등록 장애인은 기본료·통화료 35% 감면'));
    else r.push(fail('기초생활보장·차상위·기초연금 수급자나 등록 장애인이 대상'));
    return verdict('telecom', r, { amount: lim ? { text: '월 최대 ' + won(lim), sub: '휴대폰 1회선 기준' } : { text: '35% 감면', sub: '장애인' } });
  };

  RULES.culturePass = function (h, ctx) {
    var cp = P().culturePass, c = ctx.bls.livelihood;
    var r = [c.ratio <= P().bls.ratio.chasangwi ? pass('기초생활보장 수급자 또는 차상위 기준 이내') : fail('기초생활보장 수급자·차상위계층이 대상')];
    var n = h.size - h.kids.c0 - h.kids.c1 - h.kids.c2;
    return verdict('culturePass', r, { amount: { text: '1인당 연 ' + manwon(cp.amount), sub: '6세 이상 ' + n + '명' }, deadline: deadlineText(h, cp.deadline) });
  };

  RULES.diaper = function (h, ctx) {
    var dp = P().diaper, c = ctx.bls.livelihood;
    var n = h.kids.c0 + h.kids.c1;
    var r = [n ? pass('만 2세 미만 아이 ' + n + '명') : fail('만 2세 미만 아이가 없음')];
    if (c.ratio <= P().bls.ratio.chasangwi || h.singleParent) r.push(pass('기초생활보장·차상위·한부모 가구는 소득 기준 없이 대상'));
    else if (h.disabledInHousehold || h.kidsTotal >= 2) {
      r.push(c.ratio <= dp.ratioDisabledMulti ? pass('장애인·다자녀 가구는 기준중위소득 ' + dp.ratioDisabledMulti + '% 이하') : fail('장애인·다자녀 가구는 기준중위소득 ' + dp.ratioDisabledMulti + '% 이하'));
      r.push(ask('장애인·다자녀 가구 소득은 부모 건강보험료로 판정'));
    } else r.push(fail('기초·차상위·한부모·장애인·다자녀 가구가 대상'));
    return verdict('diaper', r, { amount: n ? { text: '월 ' + manwon(dp.diaper * n), sub: '기저귀, 조건에 따라 분유 ' + manwon(dp.formula) + ' 추가' } : null });
  };

  RULES.hopeReturn = function (h) {
    var hr = P().hopeReturn;
    var r = [];
    r.push(h.work === 'closed' ? pass('폐업했거나 폐업할 소상공인') : h.work === 'self' ? ask('폐업을 고민 중이라면 폐업 전에 신청할 수 있음') : fail('소상공인(자영업자) 대상'));
    r.push(ask(hr.condition));
    return verdict('hopeReturn', r, { amount: { text: '철거비 최대 ' + manwon(hr.demolitionMax), sub: '재취업 시 수당 최대 ' + manwon(hr.trainingAllowance + hr.transitionMax + hr.linkMonthly * hr.linkMonths) } });
  };

  RULES.freshStart = function (h) {
    var fs = P().freshStart;
    var r = [];
    r.push(h.work === 'closed' || h.work === 'self' ? pass('개인사업자·소상공인(폐업 포함)') : fail('개인사업자·소상공인이 대상'));
    r.push(h.debt > 0 ? pass('갚아야 할 대출이 있음') : fail('입력한 대출이 없음'));
    r.push(ask(fs.condition));
    return verdict('freshStart', r, { amount: { text: '채무 조정', sub: '상환 연장·이자 감면·원금 조정' }, deadline: deadlineText(h, fs.deadline) });
  };

  RULES.bizVoucher = function (h) {
    var bv = P().bizVoucher;
    var r = [];
    r.push(h.work === 'self' ? pass('지금 영업 중인 소상공인') : h.work === 'closed' ? fail('신청일에 휴업·폐업 상태면 받을 수 없음') : fail('영업 중인 소상공인이 대상'));
    r.push(ask('2025년 매출이 0원 초과 ' + manwon(bv.salesMax) + ' 미만이고 2025년 말까지 개업했어야 함'));
    r.push(ask('예산이 소진되면 조기 마감. 신청 가능 여부를 사이트에서 확인'));
    return verdict('bizVoucher', r, { amount: { text: manwon(bv.amount), sub: '공과금·보험료·연료비' }, deadline: deadlineText(h, bv.deadline) });
  };

  /* ------------------------------------------------------------------ */
  function evaluate(s) {
    var h = normalize(s);
    var bls = {};
    ['livelihood', 'medical', 'housing', 'education'].forEach(function (b) {
      bls[b] = blsCalc(h, b);
      bls[b]._size = h.size;
    });
    var pension = pensionCalc(h, P().basicPension.earnFlat);
    var disPension = pensionCalc(h, P().disabilityPension.earnFlat);
    var ctx = { bls: bls, pension: pension, disPension: disPension, flags: {} };
    var bp = P().basicPension;
    ctx.flags.basicPension = (h.age >= 65 || (h.spouse && h.spouseAge >= 65)) && pension.recognized <= (h.spouse ? bp.limitCouple : bp.limitSingle);

    var order = root.BOKJI_DATA.programs.map(function (p) { return p.id; });
    var results = order.map(function (id) {
      var fn = RULES[id];
      return fn ? fn(h, ctx) : null;
    }).filter(Boolean);

    var main = bls.livelihood;
    var gauge = { ratio: main.ratio, max: 150, ticks: P().gaugeTicks };
    return { hh: { size: h.size }, calc: main, gauge: gauge, results: results, h: h, pension: pension };
  }

  var api = { evaluate: evaluate, householdSize: householdSize, normalize: normalize, median: median, fmt: fmt, rules: RULES };
  root.BokjiEngine = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
