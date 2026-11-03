/* 복지 길잡이 — 제도 기준값과 안내 데이터.
   기준일 2026-11-02. 값마다 출처는 programs[].sources 와 README 를 보세요.
   금액 단위는 모두 원. 비율은 기준중위소득 대비 %. */
window.BOKJI_DATA = {
  asOf: '2026-11-02',

  params: {
    year: 2026,

    // 보건복지부 고시 제2025-135호(2026년), 제2026-157호(2027년)
    median: {
      2026: [2564238, 4199292, 5359036, 6494738, 7556719, 8555952, 9515150],
      2027: [2736042, 4480645, 5718091, 6929885, 8063019, 9129201, 10152665]
    },

    // 2026년 국민기초생활보장 사업안내(2026-03-24 게시)
    bls: {
      ratio: { livelihood: 32, medical: 40, housing: 48, education: 50, chasangwi: 50 },
      earnRate: 0.3,              // 근로·사업소득 기본 공제율(의료급여는 일반 공제 없음)
      youthAgeMax: 34,            // 청년 추가공제 대상
      youthFlat: 600000,          // 60만 원 먼저 빼고 나머지 30%
      seniorAgeMin: 65,
      seniorFlat: 200000,         // 노인·등록장애인 20만 원 먼저 빼고 나머지 30%
      basicProperty: { seoul: 99000000, gyeonggi: 80000000, metro: 77000000, other: 53000000 },
      housingCap: { seoul: 172000000, gyeonggi: 151000000, metro: 146000000, other: 112000000 },
      rate: { housing: 0.0104, general: 0.0417, financial: 0.0626, car: 1 },
      finReserve: 5000000,        // 금융재산 생활준비금
      deductOrder: ['housing', 'general', 'financial'],
      supporterIncomeLimit: 130000000,   // 생계급여 부양의무자 예외 연소득
      supporterAssetLimit: 1200000000,   // 생계급여 부양의무자 예외 일반재산
      housingSelfBurden: 0.3
    },

    // 주거급여 기준임대료(원/월), 1~6인. 7인은 6인, 8~9인은 6인의 110%
    housingRent: {
      g1: [369000, 414000, 492000, 571000, 591000, 699000],
      g2: [300000, 335000, 401000, 463000, 479000, 568000],
      g3: [247000, 275000, 327000, 381000, 394000, 463000],
      g4: [212000, 238000, 283000, 329000, 340000, 402000]
    },
    housingDepositRate: 0.04 / 12,   // 보증금의 월차임 환산(연 4%)

    educationAid: { elem: 502000, mid: 699000, high: 860000 },

    // 보건복지부고시 제2026-156호, 2026년 기초연금 사업안내
    basicPension: {
      limitSingle: 2470000,
      limitCouple: 3952000,
      maxAmount: 349700,
      coupleCut: 0.2,
      earnFlat: 1160000,
      earnRate: 0.3,
      basicProperty: { big: 135000000, mid: 85000000, rural: 72500000 },
      finDeduct: 20000000,
      propertyRate: 0.04,
      luxuryCarValue: 40000000
    },

    // 복지로 장애인연금 상세(2026), 보건복지부 2025-12 보도자료
    disabilityPension: {
      limitSingle: 1400000,
      limitCouple: 2240000,
      earnFlat: 950000,
      basic: 349700,
      extra: { recipient: 90000, chasangwi: 80000, above: 30000 }
    },

    disabilityAllowance: { amount: 60000 },
    seniorJobs: { monthly: 290000 },

    // 보건복지부고시 제2025-210호(2026 생계지원 금액), 긴급지원 재산 기준
    emergency: {
      ratio: 75,
      livelihood: [783000, 1286600, 1644000, 1994600, 2324400, 2636700],
      livelihoodExtra: 301000,          // 7인부터 1명당
      property: { big: 241000000, mid: 152000000, rural: 130000000 },
      finAdd: 6000000                   // 금융재산 상한 = 기준중위소득 100% + 600만 원
    },

    // 한국에너지공단 2026년도 에너지바우처(하절기+동절기 합계, 1~4인 이상)
    energyVoucher: {
      amount: [295200, 407500, 532700, 701300],
      deadline: { until: '2026-12-31', text: '2026년 신청 12월 31일까지' }
    },

    // 과학기술정보통신부 취약계층 통신요금감면(이동전화 월 한도)
    telecom: { recipient: 33500, nearPoor: 21500, pension: 11000 },

    // 문화누리카드 2026(6세 이상 기초·차상위, 1인 연 15만 원)
    culturePass: { amount: 150000, deadline: { until: '2026-11-30', text: '2026년 발급 11월 30일까지' } },

    // 보건복지부 아동수당(2026.4.23 보도자료): 9세 미만, 2017년생 특례
    childAllowance: {
      ageLimit: 9, kidKeys: ['c0', 'c1', 'c2', 'c3'],
      amountCapital: 100000, amountOther: 105000,
      notes: ['2026년에는 2017년 1월 이후 태어난 아동이 모두 대상입니다(2017년생은 13세 전까지 특례).', '인구감소지역은 월 11만~13만 원입니다. 2027년 1월 21일 이후 태어난 아동은 신청 없이 지급될 예정입니다.']
    },
    parentBenefit: { age0: 1000000, age1: 500000, daycare0: 416000 },
    firstMeet: { first: 2000000, second: 3000000 },
    pregnancyCare: { single: 1000000, perFetus: 1000000, ruralAdd: 200000 },
    childcare: { supportRatio: 250 },
    // 성평등가족부 한부모가족 아동양육비(2026): 기준중위소득 65% 이하
    singleParent: { ratio: 65, amount: 230000, extra: 100000, teenUnder2: 400000, teen2plus: 370000 },
    // 국세청 자녀장려금(2025년 귀속)
    childTax: {
      incomeLimit: 70000000, maxPerChild: 1000000, minPerChild: 500000,
      assetLimit: 240000000, assetCut: 170000000,
      deadline: { until: '2026-12-01', text: '2025년 소득분 기한 후 신청 12월 1일까지(95% 지급)' }
    },

    // 국세청 근로장려금(2025년 귀속, 2026년 신청). 재산은 부채를 빼지 않은 합계
    eitc: {
      incomeLimit: { alone: 22000000, single: 32000000, dual: 44000000 },
      max: { alone: 1650000, single: 2850000, dual: 3300000 },
      assetLimit: 240000000,
      assetCut: 170000000,
      deadline: { until: '2026-12-01', text: '2025년 소득분 기한 후 신청 12월 1일까지(95% 지급)' }
    },

    // 고용24 국민취업지원제도(2026)
    nationalEmployment: {
      ageMin: 15, ageMax: 69, youthMin: 15, youthMax: 34,
      ratio: 60, youthRatio: 120, midRatio: 100,
      asset: 400000000, youthAsset: 500000000,
      allowance: 600000, months: 6, dependentAdd: 100000, dependentMax: 400000
    },

    // 보건복지부 2026 청년내일저축계좌(수급·차상위 청년)
    youthSaving: {
      ageMin: 15, ageMax: 39, earnMin: 100000, ratio: 50, match: 300000,
      periodNote: '2026년 모집(5월 4일~20일)은 끝남. 2027년 모집 일정은 아직 발표되지 않음'
    },

    // 국토교통부 2026 청년월세 지원(상시 사업, 연 1회 모집)
    youthRent: {
      ageMin: 19, ageMax: 34, youthRatio: 60, parentRatio: 100,
      youthAsset: 122000000, parentAsset: 470000000, max: 200000, months: 24,
      periodNote: '2026년 신청(3월 30일~5월 29일)은 끝남. 매년 모집하는 사업이라 2027년 공고를 기다려야 함'
    },

    // 금융위원회 청년미래적금(2026)
    youthFuture: {
      ageMin: 19, ageMax: 34,
      normal: { pay: 60000000, ratio: 200, rate: 0.06 },
      plus: { pay: 36000000, ratio: 150, rate: 0.12 },
      monthlyMax: 500000,
      periodNote: '2026년 1·2차 모집은 끝남. 3차 모집은 2027년 예산 확정 뒤 진행 예정'
    },

    // 소상공인시장진흥공단 희망리턴패키지(2026)
    hopeReturn: {
      demolitionMax: 6000000, perPyeong: 200000, trainingAllowance: 350000,
      transitionMax: 1000000, linkMonthly: 200000, linkMonths: 6,
      condition: '본인 소유 건물이거나 폐업 없이 이전만 하면 철거비 대상이 아님. 예산이 떨어지면 조기 마감'
    },

    // 새출발기금(소상공인·자영업자 채무조정)
    freshStart: {
      condition: '2020년 4월~2025년 6월에 사업을 했고, 대출을 90일 이상 연체했거나 곧 연체할 위험이 커야 함',
      deadline: { until: '2026-12-31', text: '신청 2026년 말까지' }
    },

    // 중소벤처기업부 공고 제2026-37호 소상공인 경영안정 바우처
    bizVoucher: {
      salesMax: 104000000, amount: 250000,
      deadline: { until: '2026-12-18', text: '잠정 12월 18일까지(예산 소진 시 조기 마감)' }
    },

    // 고용보험 구직급여(2026)
    unemployment: { dailyMin: 66048, dailyMax: 68100 },

    // 저소득층 기저귀·조제분유(국민행복카드 포인트, 만 2세 미만)
    diaper: { diaper: 90000, formula: 110000, ratioDisabledMulti: 100 },

    gaugeTicks: [
      { pct: 32, label: '생계 32%' },
      { pct: 40, label: '의료 40%' },
      { pct: 48, label: '주거 48%' },
      { pct: 50, label: '교육·차상위 50%' },
      { pct: 60, label: '국민취업 60%' },
      { pct: 75, label: '긴급 75%' },
      { pct: 100, label: '중위 100%' }
    ]
  },

  sources: [
    { title: '보건복지부, 2026년 국민기초생활보장 사업안내(2026-03-24)', url: 'https://www.mohw.go.kr/board.es?mid=a10402000000&bid=0009&act=view&list_no=1489764' },
    { title: '보건복지부 고시 제2025-135호, 2026년 기준 중위소득', url: 'https://www.mohw.go.kr/board.es?mid=a10409020000&bid=0026&act=view&list_no=1487112' },
    { title: '보건복지부 고시 제2026-157호, 2027년 기준 중위소득', url: 'https://www.mohw.go.kr/board.es?mid=a10409020000&bid=0026&act=view&list_no=1491489' }
  ],

  programs: [
    {
      id: 'livelihood', name: '생계급여', agency: '보건복지부 · 주민센터', category: '소득·생계',
      oneLine: '소득인정액이 기준중위소득 32% 이하인 가구에 부족한 생계비를 매달 현금으로 줍니다.',
      benefit: '생계급여 선정기준액에서 가구 소득인정액을 뺀 금액을 매달 받습니다. 2026년 선정기준액은 1인 82만 556원, 2인 134만 3,773원, 4인 207만 8,316원입니다.',
      howTo: '주민등록 주소지 읍·면·동 주민센터에 방문해 신청합니다. 배우자·친족 등 대리인도 신청할 수 있습니다. 소득·재산 조사를 거쳐 결정됩니다.',
      period: '연중 언제든',
      docs: ['신분증', '사회보장급여 신청서(주민센터 비치)', '금융정보 등 제공 동의서(가구원 모두)', '임대차계약서(세입자)', '통장 사본'],
      apply: [{ name: '복지로 상세 안내', url: 'https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00001132&wlfareInfoReldBztpCd=01' }],
      detail: null,
      proxyTip: '가족이 주민센터에서 대신 신청할 수 있습니다. 본인과 가구원의 금융정보 제공 동의서는 각자 서명해야 하니 미리 받아 두세요.',
      sources: [
        { title: '보건복지부 고시 제2025-135호', url: 'https://www.mohw.go.kr/boardDownload.es?bid=0026&list_no=1487112&seq=2' },
        { title: '복지로 생계급여', url: 'https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00001132&wlfareInfoReldBztpCd=01' }
      ]
    },
    {
      id: 'medical', name: '의료급여', agency: '보건복지부 · 주민센터', category: '의료',
      oneLine: '소득인정액이 기준중위소득 40% 이하이면 병원비 대부분을 국가가 부담합니다.',
      benefit: '건강보험이 적용되는 진료비를 지원합니다. 근로능력이 없는 가구 등은 1종, 그 밖의 수급자는 2종으로 본인부담이 다릅니다. 2026년부터 외래 진료가 연 365회를 넘으면 넘는 부분은 30%를 냅니다(중증장애인·아동·임산부 등 제외).',
      howTo: '생계급여와 같은 신청서로 주민센터에서 함께 신청합니다. 의료급여에는 부양의무자 기준이 남아 있어 부모·자녀의 소득·재산도 조사합니다. 2026년 1월부터 간주 부양비는 폐지됐습니다.',
      period: '연중 언제든',
      docs: ['신분증', '사회보장급여 신청서', '금융정보 등 제공 동의서(가구원·부양의무자)'],
      apply: [{ name: '복지로 상세 안내', url: 'https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00000102&wlfareInfoReldBztpCd=01' }],
      detail: null,
      proxyTip: '부양의무자(부모·자녀)의 금융정보 제공 동의서도 필요할 수 있습니다. 가족이 함께 준비하면 처리가 빨라집니다.',
      sources: [
        { title: '보건복지부, 26년 만에 의료급여 부양비 폐지(2025-12-09)', url: 'https://www.mohw.go.kr/board.es?mid=a10503010100&bid=0027&act=view&list_no=1488173' },
        { title: '복지로 의료급여', url: 'https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00000102&wlfareInfoReldBztpCd=01' }
      ]
    },
    {
      id: 'housing', name: '주거급여', agency: '국토교통부·보건복지부 · 주민센터', category: '주거',
      oneLine: '소득인정액이 기준중위소득 48% 이하이면 월세를 지원하거나 집 수리를 해 줍니다.',
      benefit: '세입자는 지역(급지)과 가구원 수로 정한 기준임대료 안에서 실제 임차료(월세+보증금×연 4%÷12)를 받습니다. 2026년 서울 1인 기준임대료는 36만 9,000원입니다. 소득인정액이 생계급여 기준을 넘으면 넘는 금액의 30%를 빼고 줍니다. 자가 가구는 노후도에 따라 590만~1,601만 원 규모로 집을 고쳐 줍니다.',
      howTo: '주민센터에 방문하거나 복지로에서 온라인으로 신청합니다. 부양의무자 기준이 없습니다. 19~29세 미혼 자녀가 따로 살면 청년 분리지급을 신청할 수 있습니다.',
      period: '연중 언제든',
      docs: ['신분증', '사회보장급여 신청서', '금융정보 등 제공 동의서', '임대차계약서(세입자)'],
      apply: [
        { name: '복지로에서 신청', url: 'https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00003201&wlfareInfoReldBztpCd=01' }
      ],
      detail: null,
      proxyTip: '복지로 온라인 신청은 본인 인증이 필요합니다. 부모님 대신 신청하려면 주민센터 방문이 쉽습니다.',
      sources: [
        { title: '보건복지부, 2026년도 기준 중위소득 보도자료(기준임대료 포함)', url: 'https://www.mohw.go.kr/board.es?mid=a10503010100&bid=0027&act=view&list_no=1487098' },
        { title: '복지로 주거급여', url: 'https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00003201&wlfareInfoReldBztpCd=01' }
      ]
    },
    {
      id: 'education', name: '교육급여', agency: '교육부·보건복지부 · 주민센터', category: '교육',
      oneLine: '소득인정액이 기준중위소득 50% 이하인 가구의 초·중·고등학생에게 교육활동지원비를 줍니다.',
      benefit: '2026년 교육활동지원비는 연 1회 초등학생 50만 2,000원, 중학생 69만 9,000원, 고등학생 86만 원이며 바우처로 받습니다. 무상교육이 아닌 고등학교에 다니면 입학금·수업료도, 고등학생은 교과서비도 지원합니다.',
      howTo: '주민센터에 방문하거나 복지로 또는 교육비원클릭신청시스템에서 온라인으로 신청합니다. 부양의무자 기준이 없습니다. 교육활동지원비 바우처는 선정 후 따로 신청합니다(2026년분은 2027년 2월 28일까지).',
      period: '연중 언제든',
      docs: ['신분증', '사회보장급여 신청서', '금융정보 등 제공 동의서'],
      apply: [{ name: '복지로에서 신청', url: 'https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00001089&wlfareInfoReldBztpCd=01' }],
      detail: null,
      proxyTip: '학생 본인이 아니라 보호자가 신청합니다.',
      sources: [
        { title: '보건복지부, 2026년도 기준 중위소득 보도자료', url: 'https://www.mohw.go.kr/board.es?mid=a10503010100&bid=0027&act=view&list_no=1487098' },
        { title: '복지로 교육급여', url: 'https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00001089&wlfareInfoReldBztpCd=01' }
      ]
    },
    {
      id: 'chasangwi', name: '차상위계층 확인', agency: '보건복지부 · 주민센터', category: '소득·생계',
      oneLine: '기초생활수급자는 아니지만 소득인정액이 기준중위소득 50% 이하이면 차상위로 인정돼 각종 감면을 받습니다.',
      benefit: '차상위계층 확인서로 휴대폰 요금 감면(월 최대 3만 원), 정부양곡 60% 할인, 문화누리카드, 도시가스 요금 감면 등을 받습니다. 질환이 있거나 18세 미만이면 차상위 본인부담경감으로 병원비가 크게 줄고, 일할 수 있으면 자활근로에 참여할 수 있습니다.',
      howTo: '주민센터에 방문하거나 복지로에서 온라인으로 신청합니다. 차상위계층 확인에는 부양의무자 기준이 없습니다. 본인부담경감은 부양의무자 기준과 질환 요건이 따로 있습니다.',
      period: '연중 언제든',
      docs: ['신분증', '사회보장급여 신청서', '금융정보 등 제공 동의서'],
      apply: [{ name: '복지로', url: 'https://www.bokjiro.go.kr/ssis-tbu/index.do' }],
      detail: 'https://www.gov.kr/portal/service/serviceInfo/WLU000000020',
      proxyTip: '가족이 주민센터에서 대신 신청할 수 있습니다.',
      sources: [
        { title: '보건복지부, 2026년 국민기초생활보장 사업안내', url: 'https://www.mohw.go.kr/board.es?mid=a10402000000&bid=0009&act=view&list_no=1489764' },
        { title: '정부24 차상위 본인부담경감', url: 'https://www.gov.kr/portal/service/serviceInfo/WLU000000020' }
      ]
    },
    {
      id: 'basicPension', name: '기초연금', agency: '보건복지부 · 주민센터·국민연금공단', category: '노인',
      oneLine: '만 65세 이상 중 소득인정액이 단독 247만 원, 부부 395만 2,000원 이하이면 매달 받습니다.',
      benefit: '2026년 1인 최대 월 34만 9,700원입니다. 부부가 둘 다 받으면 각각 20%를 줄여 부부 합계 최대 55만 9,520원입니다. 국민연금을 많이 받거나 소득인정액이 기준에 가까우면 줄어듭니다. 매월 25일에 지급합니다.',
      howTo: '전국 어느 주민센터나 국민연금공단 지사에 방문하거나 복지로에서 온라인으로 신청합니다. 거동이 불편하면 국민연금공단(1355)의 찾아뵙는 서비스를 요청할 수 있습니다. 만 65세 생일이 속한 달의 1개월 전부터 미리 신청할 수 있습니다.',
      period: '언제든. 만 65세 되는 달 1개월 전부터',
      docs: ['신분증', '사회보장급여 신청서', '소득·재산 신고서', '금융정보 등 제공 동의서(본인·배우자)', '통장 사본'],
      apply: [{ name: '복지로 상세·온라인 신청', url: 'https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00001164' }],
      detail: 'https://basicpension.mohw.go.kr/',
      auto: null,
      proxyTip: '배우자·자녀 등 가족이 대신 신청할 수 있습니다. 2026년 10월 30일부터 복지로 온라인 신청에서 배우자 금융정보 동의를 문자 링크로 받고, 서류는 나중에 낼 수 있습니다.',
      sources: [
        { title: '보건복지부, 2026년 기초연금 선정기준액 보도자료', url: 'https://www.mohw.go.kr/board.es?act=view&bid=0027&list_no=1488478&mid=a10503000000' },
        { title: '보건복지부고시 제2026-156호(소득인정액 산정 세부기준)', url: 'https://www.law.go.kr/LSW/admRulLsInfoP.do?admRulId=56797&efYd=0' },
        { title: '보건복지부, 기초연금 온라인 신청 간소화(2026-10-29)', url: 'https://www.mohw.go.kr/board.es?mid=a10503000000&bid=0027&list_no=1492349&act=view' }
      ]
    },
    {
      id: 'disabilityPension', name: '장애인연금', agency: '보건복지부 · 주민센터', category: '장애',
      oneLine: '만 18세 이상 중증장애인 중 소득인정액이 단독 140만 원, 부부 224만 원 이하이면 받습니다.',
      benefit: '기초급여 월 최대 34만 9,700원에 부가급여(기초생활수급자 9만 원, 차상위 8만 원, 그 밖에 3만 원)를 더해 2026년 최대 월 43만 9,700원입니다. 만 65세가 되면 기초급여 대신 기초연금으로 바뀝니다.',
      howTo: '전국 어느 주민센터에서나 신청하거나 복지로에서 온라인으로 신청합니다. 배우자·친족이 대신 신청할 수 있습니다.',
      period: '연중 언제든',
      docs: ['신분증', '사회보장급여 신청서', '금융정보 등 제공 동의서'],
      apply: [{ name: '복지로 상세·온라인 신청', url: 'https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00003249' }],
      detail: null,
      auto: null,
      proxyTip: '2027년 1월 21일부터는 장애인연금을 받던 분이 65세가 되면 기초연금을 신청한 것으로 봅니다.',
      sources: [
        { title: '보건복지부, 2026년 장애인연금 월 최대 43만 9,700원', url: 'https://mohw.go.kr/board.es?act=view&bid=0027&list_no=1488505&mid=a10503010100&nPage=1&tag=' },
        { title: '복지로 장애인연금', url: 'https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00003249' }
      ]
    },
    {
      id: 'disabilityAllowance', name: '장애수당', agency: '보건복지부 · 주민센터', category: '장애',
      oneLine: '만 18세 이상 경증 장애인 중 기초생활수급자나 차상위계층이면 매달 받습니다.',
      benefit: '재가 기초수급자와 차상위계층은 월 6만 원, 보장시설 수급자는 월 3만 원입니다.',
      howTo: '주민센터에 방문하거나 복지로에서 온라인으로 신청합니다. 18~20세 초·중·고 재학생은 장애아동수당으로 따로 신청합니다.',
      period: '연중 언제든',
      docs: ['신분증', '사회보장급여 신청서', '금융정보 등 제공 동의서'],
      apply: [{ name: '복지로 상세·온라인 신청', url: 'https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00003265' }],
      detail: null,
      proxyTip: '배우자·친족이 대신 신청할 수 있습니다.',
      sources: [{ title: '복지로 장애수당', url: 'https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00003265' }]
    },
    {
      id: 'seniorCare', name: '노인맞춤돌봄서비스', agency: '보건복지부 · 주민센터', category: '노인',
      oneLine: '돌봄이 필요한 만 65세 이상 기초연금·기초생활·차상위 어르신에게 안부 확인과 생활 지원을 해 줍니다.',
      benefit: '생활지원사가 방문하거나 전화로 안부를 확인하고, 외출 동행, 가사 지원, 사회참여 프로그램을 제공합니다. 서비스 양은 돌봄 필요도에 따라 정합니다. 현금이 아닌 서비스입니다.',
      howTo: '주소지 주민센터에서 신청합니다. 본인, 가족(8촌 이내 혈족 등), 이웃도 신청할 수 있습니다. 장기요양 등급이 있거나 장애인 활동지원을 받으면 대상이 아닙니다.',
      period: '연중 언제든',
      docs: ['신분증'],
      apply: [{ name: '복지로 상세 안내', url: 'https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00003191' }],
      detail: null,
      proxyTip: '자녀나 이웃이 주민센터에 대신 신청할 수 있습니다. 혼자 사는 부모님께 가장 먼저 권할 만한 서비스입니다.',
      sources: [{ title: '복지로 노인맞춤돌봄서비스', url: 'https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00003191' }]
    },
    {
      id: 'seniorJobs', name: '노인일자리(공익활동)', agency: '보건복지부·한국노인인력개발원', category: '노인',
      oneLine: '만 65세 이상 기초연금 수급자가 월 30시간 공익활동을 하면 활동비를 받습니다.',
      benefit: '취약노인 돌봄, 공공시설 봉사 같은 활동에 월 30시간 이상 참여하면 월 29만 원을 받습니다.',
      howTo: '주민센터, 노인복지관·시니어클럽 같은 수행기관, 노인일자리 여기(seniorro.or.kr), 복지로에서 신청합니다. 보통 연말~연초에 다음 해 참여자를 모집하고 수시로 충원합니다. 생계급여 수급자와 건강보험 직장가입자는 참여할 수 없습니다.',
      period: '주로 연말~연초 모집(수행기관 공고 확인)',
      docs: ['신분증', '참여 신청서'],
      apply: [{ name: '노인일자리 여기', url: 'https://www.seniorro.or.kr/' }],
      detail: 'https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00001155',
      proxyTip: '신청은 본인이 해야 하지만 가족이 모집 공고와 가까운 수행기관을 미리 찾아 드리면 도움이 됩니다.',
      sources: [{ title: '복지로 노인일자리 및 사회활동 지원사업', url: 'https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00001155' }]
    }
  ,
    {
      id: 'childAllowance', name: '아동수당', agency: '보건복지부 · 주민센터', category: '아동·가족',
      oneLine: '9세 미만 아동에게 소득과 관계없이 매달 10만 원 이상을 줍니다. 비수도권과 인구감소지역은 더 받습니다.',
      benefit: '아동 1명당 수도권 월 10만 원, 비수도권 월 10만 5천 원, 인구감소지역 월 11만~13만 원입니다. 매월 25일에 지급합니다. 지급 연령은 2027년 10세 미만부터 해마다 1세씩 오릅니다.',
      howTo: '출생신고 때 주민센터나 정부24 행복출산 원스톱 서비스로 함께 신청하거나, 복지로에서 온라인으로 신청합니다. 출생일 포함 60일 안에 신청하면 출생한 달부터 받습니다. 조부모 등 부모가 아닌 보호자는 주민센터를 방문합니다.',
      period: '언제든(출생 후 60일 안에 신청하면 소급)',
      docs: ['신분증(방문 시)', '아동 명의 또는 보호자 명의 통장'],
      apply: [{ name: '복지로 상세 안내', url: 'https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00001171' }],
      detail: 'https://www.mohw.go.kr/menu.es?mid=a10711030100',
      auto: '2027.1.21 출생아부터 신청 없이 지급',
      proxyTip: '조부모가 손주를 키우면 주민센터에 방문해 신청합니다.',
      sources: [
        { title: '보건복지부, 아동수당 대상·금액 확대(2026-04)', url: 'https://mohw.go.kr/board.es?act=view&bid=0027&list_no=1490257&mid=a10503010100&nPage=1&tag=' },
        { title: '정책브리핑, 월 최대 13만 원 아동수당', url: 'https://www.korea.kr/news/customizedNewsView.do?newsId=148963801' }
      ]
    },
    {
      id: 'parentBenefit', name: '부모급여', agency: '보건복지부 · 주민센터', category: '아동·가족',
      oneLine: '만 2세 미만 아이를 키우는 가정에 0세는 월 100만 원, 1세는 월 50만 원을 줍니다.',
      benefit: '0세(0~11개월) 월 100만 원, 1세(12~23개월) 월 50만 원입니다. 어린이집을 다니면 보육료를 뺀 차액을 받아 0세는 월 41만 6천 원, 1세는 차액이 없습니다.',
      howTo: '출생신고 때 주민센터에서 함께 신청하거나 복지로·정부24에서 온라인으로 신청합니다. 출생일로부터 60일 안에 신청해야 출생한 달부터 받습니다.',
      period: '언제든(출생 후 60일 안에 신청하면 소급)',
      docs: ['신분증(방문 시)', '통장 사본'],
      apply: [{ name: '복지로 2026 부모급여 안내', url: 'https://m.bokjiro.go.kr/ssis-tem/cms/mob/customer/notice/1309189_1155.html' }],
      detail: 'https://www.mohw.go.kr/menu.es?mid=a10711030600',
      auto: '2027.1.21 출생아부터 신청 없이 지급',
      proxyTip: '출생신고를 하러 갈 때 부모급여·아동수당·첫만남이용권을 한 번에 신청하세요.',
      sources: [{ title: '복지로, 2026년 부모급여 지원 안내', url: 'https://m.bokjiro.go.kr/ssis-tem/cms/mob/customer/notice/1309189_1155.html' }]
    },
    {
      id: 'firstMeet', name: '첫만남이용권', agency: '보건복지부 · 주민센터', category: '아동·가족',
      oneLine: '아이가 태어나면 첫째 200만 원, 둘째 이상 300만 원을 국민행복카드 포인트로 줍니다.',
      benefit: '첫째 200만 원, 둘째 이상 300만 원을 국민행복카드 바우처로 받아 유흥·사행업종을 뺀 대부분의 가게에서 씁니다. 출생일부터 2년 안에 신청하고 써야 합니다.',
      howTo: '출생신고 때 주민센터나 정부24에서 함께 신청하거나 복지로에서 온라인으로 신청합니다. 위임장을 갖추면 대리 신청도 됩니다.',
      period: '출생 후 2년 안',
      docs: ['신분증(방문 시)', '(대리 신청) 위임장, 보호자 신분증 사본, 대리인 신분증'],
      apply: [{ name: '정부24에서 신청', url: 'https://www.gov.kr/portal/service/serviceInfo/135200005015' }],
      detail: null,
      auto: '2027.1.21부터 신청 없이 지급',
      proxyTip: '위임장이 있으면 가족이 대신 신청할 수 있습니다.',
      sources: [{ title: '정부24 첫만남이용권 지원', url: 'https://www.gov.kr/portal/service/serviceInfo/135200005015' }]
    },
    {
      id: 'pregnancyCare', name: '임신·출산 진료비 지원', agency: '국민건강보험공단', category: '아동·가족',
      oneLine: '임신이 확인되면 진료비에 쓰는 100만 원(다태아는 태아마다 100만 원)을 국민행복카드로 줍니다.',
      benefit: '단태아 100만 원, 다태아는 태아 1명당 100만 원입니다. 분만취약지에 살면 20만 원을 더 받습니다. 임산부 진료비와 2세 미만 아기 진료비·약값에 씁니다.',
      howTo: '산부인과에서 임신 확인을 받은 뒤 건강보험공단 지사, 공단 홈페이지·앱, 국민행복카드 카드사에서 신청합니다. 본인이 못 하면 가족이 대리 신청할 수 있습니다.',
      period: '임신 확인 후 언제든(분만예정일부터 2년까지 사용)',
      docs: ['임신·출산 진료비 지급 신청서(병원 확인)', '(대리 신청) 가족관계 증명서류'],
      apply: [{ name: '정부24 안내', url: 'https://www.gov.kr/portal/service/serviceInfo/SD0000007672' }],
      detail: null,
      proxyTip: '고위험 임신 등으로 본인이 움직이기 어려우면 가족이 신청할 수 있습니다.',
      sources: [{ title: '정부24 건강보험 임신·출산 진료비 지원', url: 'https://www.gov.kr/portal/service/serviceInfo/SD0000007672' }]
    },
    {
      id: 'childcareService', name: '아이돌봄서비스', agency: '성평등가족부 · 주민센터', category: '아동·가족',
      oneLine: '맞벌이·한부모 등 양육 공백이 있는 12세 이하 아동 가정에 돌보미를 보내고 이용요금 일부를 지원합니다.',
      benefit: '2026년 시간제 이용요금은 시간당 1만 2,790원이고, 소득에 따라 정부가 15~85%를 지원합니다(취학 전 아동 기준). 정부 지원은 연 960시간(한부모 등은 1,080시간)까지입니다. 2026년부터 기준중위소득 250% 이하로 넓어졌습니다.',
      howTo: '주민센터에서 정부지원을 신청해 소득유형을 받은 뒤 아이돌봄 누리집에서 서비스를 신청합니다. 소득 판정은 건강보험료로 합니다. 문의는 1577-2514입니다.',
      period: '연중 언제든',
      docs: ['신청인 명의 국민행복카드', '(해당 시) 양육공백 확인 서류'],
      apply: [{ name: '성평등가족부 안내', url: 'https://www.mogef.go.kr/sp/fam/sp_fam_f005.do' }],
      detail: 'https://www.idolbom.go.kr',
      proxyTip: '조부모가 손주를 돌보는 조손가정도 양육 공백 가정으로 봅니다.',
      sources: [
        { title: '성평등가족부 아이돌봄서비스 안내', url: 'https://www.mogef.go.kr/sp/fam/sp_fam_f005.do' },
        { title: '인천광역시 2026 아이돌봄서비스 안내', url: 'https://www.incheon.go.kr/earlychild/EC040201' }
      ]
    },
    {
      id: 'singleParent', name: '한부모가족 아동양육비', agency: '성평등가족부 · 주민센터', category: '아동·가족',
      oneLine: '18세 미만 자녀를 혼자 키우는 가구에 소득인정액이 기준중위소득 65% 이하이면 자녀 1명당 월 23만 원을 줍니다.',
      benefit: '자녀 1명당 월 23만 원입니다. 25~34세 청년 한부모와 조손·35세 이상 미혼 한부모(5세 이하 자녀)는 월 10만 원을 더 받습니다. 24세 이하 청소년한부모는 0~1세 자녀 월 40만 원, 2세 이상 월 37만 원입니다. 초·중·고 자녀 학용품비 연 10만 원도 있습니다.',
      howTo: '주민센터에 방문하거나 복지로에서 온라인으로 신청합니다. 소득·재산 조사를 거쳐 결정합니다. 상담은 한부모상담전화 1644-6621입니다.',
      period: '연중 언제든',
      docs: ['신청서', '소득·재산 신고서', '금융정보 등 제공 동의서', '(해당 시) 임대차계약서, 부채 증명서류'],
      apply: [{ name: '정부24 안내', url: 'https://www.gov.kr/portal/service/serviceInfo/SSI000000020' }],
      detail: 'https://www.mogef.go.kr/sp/fam/sp_fam_f007.do',
      proxyTip: '조부모가 손주를 키우는 조손가족도 신청할 수 있습니다.',
      sources: [
        { title: '정부24 한부모가족 아동양육비 지원', url: 'https://www.gov.kr/portal/service/serviceInfo/SSI000000020' },
        { title: '성평등가족부 청소년 한부모 아동양육 지원(2026)', url: 'https://www.mogef.go.kr/sp/fam/sp_fam_f007.do' }
      ]
    },
    {
      id: 'childTax', name: '자녀장려금', agency: '국세청', category: '아동·가족',
      oneLine: '18세 미만 자녀가 있고 부부 합산 총소득이 7,000만 원 미만인 일하는 가구에 자녀 1명당 최대 100만 원을 줍니다.',
      benefit: '2025년 소득분은 자녀 1명당 50만~100만 원입니다. 홑벌이는 총급여 2,100만 원, 맞벌이는 2,500만 원 미만일 때 최대액을 받고 그 위로는 줄어듭니다. 재산이 1억 7천만 원 이상이면 50%, 기한 후 신청이면 95%만 받습니다.',
      howTo: '근로장려금과 같이 홈택스·손택스, ARS 1544-9944로 신청합니다. 장려금 상담센터(1566-3636)에 전화하면 동의를 받아 대신 신청해 줍니다.',
      period: '정기 5월. 2025년 소득분 기한 후 신청은 2026년 12월 1일까지',
      docs: ['안내문을 받았으면 서류 없이 신청 가능'],
      apply: [{ name: '홈택스에서 신청', url: 'https://www.hometax.go.kr/' }],
      detail: 'https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7782&mi=2451',
      proxyTip: '장려금 상담센터 1566-3636에 전화하면 상담원이 본인 동의를 받아 신청해 줍니다.',
      sources: [
        { title: '국세청 자녀장려금 소개', url: 'https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7782&mi=2451' },
        { title: '국세청 근로·자녀장려금 신청기간 및 방법', url: 'https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=40397&cntntsId=238977' }
      ]
    },
    {
      id: 'emergency', name: '긴급복지지원', agency: '보건복지부 · 시군구·주민센터', category: '위기',
      oneLine: '실직·폐업·질병·사망 같은 위기로 생계가 어려워지면 먼저 지원하고 나중에 조사합니다.',
      benefit: '2026년 생계지원은 1인 월 78만 3,000원, 2인 128만 6,600원, 4인 199만 4,600원이며 위기가 이어지면 최대 6개월까지 연장합니다. 의료비는 1회 300만 원까지(최대 2회), 주거비는 최대 12개월 지원합니다. 동절기 연료비, 해산비, 장제비, 전기요금도 있습니다.',
      howTo: '시·군·구청이나 주민센터에 방문하거나 전화로 요청합니다. 보건복지상담센터 129에서도 받아 연결해 줍니다. 본인뿐 아니라 가족, 이웃, 교사, 의료인 누구나 요청할 수 있습니다. 담당 공무원이 현장을 확인한 뒤 빠르게 지원을 결정합니다.',
      period: '위기가 생겼을 때 언제든',
      docs: ['신분증', '위기 사유 증빙(진단서, 폐업·실직 확인 등)', '통장 사본', '금융정보 등 제공 동의서(나중에 내도 됨)'],
      apply: [{ name: '복지로 상세 안내', url: 'https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00003180&wlfareInfoReldBztpCd=01' }],
      detail: 'https://www.129.go.kr/',
      proxyTip: '가족이나 이웃이 129 또는 주민센터에 바로 요청할 수 있습니다. 서류는 지원 뒤에 내도 됩니다.',
      sources: [
        { title: '보건복지부고시 제2025-210호(긴급지원 지원금액)', url: 'https://mohw.go.kr/board.es?act=view&bid=0026&list_no=1488261&mid=a10409020000' },
        { title: '서울주거포털 긴급복지 2026 소득·재산 기준', url: 'https://housing.seoul.go.kr/site/main/content/sh01_074' },
        { title: '인천광역시 긴급복지지원 안내', url: 'https://www.incheon.go.kr/welfare/WE010103' }
      ]
    },
    {
      id: 'energyVoucher', name: '에너지바우처', agency: '한국에너지공단 · 주민센터', category: '에너지·생활',
      oneLine: '기초생활보장 수급 가구 중 노인·영유아·장애인 등이 있으면 냉난방비를 바우처로 줍니다.',
      benefit: '2026년도 세대원수별 연간 총액은 1인 29만 5,200원, 2인 40만 7,500원, 3인 53만 2,700원, 4인 이상 70만 1,300원입니다. 전기·가스 요금 차감이나 국민행복카드로 2027년 5월 31일까지 씁니다.',
      howTo: '주민등록 주소지 주민센터에 방문해 신청합니다. 거동이 불편하면 가족이 대리 신청할 수 있고, 담당 공무원이 동의를 받아 직권 신청할 수도 있습니다. 문의는 1600-3190입니다.',
      period: '2026년 6월 15일 ~ 12월 31일',
      docs: ['신분증', '신청서(주민센터 비치)'],
      apply: [{ name: '에너지바우처 안내', url: 'https://www.energyv.or.kr/info/support_info.do' }],
      detail: 'https://www.energyv.or.kr/',
      proxyTip: '가족이 주민센터에서 대리 신청할 수 있습니다. 쓰지 않은 금액은 사라지니 잔액을 함께 확인해 주세요.',
      sources: [{ title: '한국에너지공단 에너지바우처 2026년도 대상·금액', url: 'https://www.energyv.or.kr/info/support_info.do' }]
    },
    {
      id: 'telecom', name: '통신요금 감면', agency: '과학기술정보통신부 · 통신사', category: '에너지·생활',
      oneLine: '기초생활수급자, 차상위, 기초연금 수급자, 장애인은 휴대폰 요금을 깎아 줍니다.',
      benefit: '휴대폰 요금을 생계·의료급여 수급자는 월 최대 3만 3,500원, 주거·교육급여 수급자와 차상위는 월 최대 2만 1,500원, 기초연금 수급자는 월 최대 1만 1,000원 감면합니다. 장애인은 기본료·통화료 35%를 깎습니다.',
      howTo: '휴대폰에서 ARS 1523으로 대상인지 확인하고 바로 신청할 수 있습니다. 정부24·복지로, 통신사 대리점이나 고객센터(114), 주민센터에서도 신청합니다. 대상이어도 신청하지 않으면 감면되지 않습니다.',
      period: '연중 언제든',
      docs: ['신분증(대리점 방문 시)'],
      apply: [{ name: '정부24에서 신청', url: 'https://www.gov.kr/portal/rcvfvrSvc/dtlEx/172100000012' }],
      detail: 'https://www.bokjiro.go.kr/ssis-tbu/cms/pc/news/promotion/1305828_1118.html',
      proxyTip: '부모님 휴대폰으로 1523에 전화하면 몇 분 안에 신청됩니다.',
      sources: [{ title: '정부24 취약계층 통신요금감면', url: 'https://www.gov.kr/portal/rcvfvrSvc/dtlEx/172100000012' }]
    },
    {
      id: 'culturePass', name: '문화누리카드', agency: '문화체육관광부 · 주민센터', category: '에너지·생활',
      oneLine: '6세 이상 기초생활수급자와 차상위계층에게 문화·여행·체육에 쓰는 카드를 줍니다.',
      benefit: '2026년 1인당 연 15만 원입니다. 2008~2013년생과 1962~1966년생은 1만 원을 더 받습니다. 2026년 12월 31일까지 쓰고 남은 금액은 이월되지 않습니다.',
      howTo: '문화누리카드 누리집에서 온라인으로 발급하거나 주민센터를 방문해 신청합니다. 전년도에 3만 원 이상 썼고 자격이 유지되면 자동 재충전됩니다. 문의는 1544-3412입니다.',
      period: '2026년 2월 2일 ~ 11월 30일 발급',
      docs: ['신분증(방문 시)'],
      apply: [{ name: '문화누리카드 누리집', url: 'https://www.mnuri.kr/main/main.do' }],
      detail: null,
      proxyTip: '발급은 11월 30일, 사용은 12월 31일까지라 연말에는 서둘러야 합니다.',
      sources: [{ title: '문화누리카드 누리집(2026 대상·금액·기간)', url: 'https://www.mnuri.kr/main/main.do' }]
    },
    {
      id: 'diaper', name: '기저귀·조제분유 지원', agency: '보건복지부 · 보건소·주민센터', category: '아동·가족',
      oneLine: '만 2세 미만 아이를 키우는 기초·차상위·한부모 가구와 소득 기준 안의 장애인·다자녀 가구에 기저귀값을 줍니다.',
      benefit: '기저귀는 아이 1명당 월 9만 원, 모유수유가 어려운 경우 등 조건을 갖추면 조제분유 월 11만 원을 국민행복카드 포인트로 줍니다. 만 2세 전날까지 최대 24개월입니다. 장애인·다자녀 가구 소득 기준은 2026년 7월부터 기준중위소득 100% 이하로 넓어졌습니다.',
      howTo: '아이 주소지 보건소나 주민센터에 방문하거나 복지로에서 온라인으로 신청합니다. 출생일을 포함해 60일 안에 신청해야 24개월을 다 받습니다. 그 뒤에 신청하면 지난 기간은 소급되지 않습니다.',
      period: '출생 후 60일 안에 신청 권장',
      docs: ['신청서', '주민등록등본(공동이용 동의 시 생략)', '(장애인·다자녀) 부모 건강보험료 납부확인서', '(분유) 진단서 등 모유수유 불가 증빙'],
      apply: [{ name: '정부24 안내', url: 'https://www.gov.kr/portal/service/serviceInfo/WII000000500' }],
      detail: null,
      proxyTip: '조부모나 위탁부모도 관계 증명서류를 내면 신청할 수 있습니다.',
      sources: [
        { title: '정부24 저소득층 기저귀·조제분유 지원', url: 'https://www.gov.kr/portal/service/serviceInfo/WII000000500' },
        { title: '정책브리핑 2026 보건복지부 예산안(소득기준 100% 완화)', url: 'https://www.korea.kr/multi/visualNewsView.do?newsId=148954117' }
      ]
    }
  ,
    {
      id: 'eitc', name: '근로장려금', agency: '국세청', category: '고용·창업',
      oneLine: '일하지만 소득이 적은 가구에 연 최대 330만 원을 줍니다. 2025년 소득분은 12월 1일까지 늦게라도 신청할 수 있습니다.',
      benefit: '2025년 소득분 최대 지급액은 단독가구 165만 원, 홑벌이가구 285만 원, 맞벌이가구 330만 원입니다. 실제 금액은 총급여 구간에 따라 계산됩니다. 재산이 1억 7천만 원 이상이면 50%, 기한 후 신청이면 95%만 받습니다.',
      howTo: '홈택스·손택스(근로·자녀장려금 메뉴), ARS 1544-9944로 신청합니다. 안내문을 받았다면 QR코드나 모바일 안내문으로 바로 신청할 수 있습니다. 장려금 상담센터(1566-3636)에 전화하면 동의를 받아 대신 신청해 줍니다. 정기신청 때 자동신청에 동의하면 2년간 자동으로 신청됩니다.',
      period: '정기 5월, 반기 3월·9월. 2025년 소득분 기한 후 신청은 2026년 12월 1일까지',
      docs: ['안내문을 받았으면 서류 없이 신청 가능', '안내문이 없으면 소득·가구 증빙(홈택스 첨부)'],
      apply: [{ name: '홈택스에서 신청', url: 'https://www.hometax.go.kr/' }],
      detail: 'https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=40397&cntntsId=238977',
      proxyTip: '부모님 대신 장려금 상담센터 1566-3636에 전화하면 상담원이 본인 동의를 받아 신청해 줍니다.',
      sources: [
        { title: '국세청 근로장려금 신청기간 및 방법', url: 'https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=40397&cntntsId=238977' },
        { title: '정책브리핑, 근로장려금 최대 330만 원(2026-04-30)', url: 'https://www.korea.kr/news/policyNewsView.do?newsId=148963769' },
        { title: '국세청, 장려금 기한 후 신청 안내(2026-11-02)', url: 'https://www.korea.kr/briefing/pressReleaseView.do?newsId=156787551' }
      ]
    },
    {
      id: 'nationalEmployment', name: '국민취업지원제도', agency: '고용노동부 · 고용센터', category: '고용·창업',
      oneLine: '일자리를 찾는 저소득 구직자와 청년에게 취업 지원과 함께 6개월간 구직촉진수당을 줍니다.',
      benefit: 'Ⅰ유형은 구직촉진수당 월 60만 원을 6개월 받습니다. 18세 이하·70세 이상·중증장애인 부양가족이 있으면 1명당 월 10만 원(최대 40만 원)을 더 받습니다. 취업 후 오래 일하면 취업성공수당 최대 150만 원을 받습니다. Ⅱ유형은 취업지원 서비스와 참여수당을 받습니다.',
      howTo: '고용24에서 안내 동영상을 보고 구직 등록을 한 뒤 온라인으로 신청하거나 고용센터를 방문합니다. 1개월 안에 결과를 알려 줍니다. 주 30시간 이상 일하거나 실업급여·생계급여를 받는 중이면 참여할 수 없습니다. 예산 범위에서 선정합니다.',
      period: '연중(예산 범위 안에서)',
      docs: ['참여 신청서', '개인정보 수집·이용 동의서', '행정정보 공동이용 동의서'],
      apply: [{ name: '고용24에서 신청', url: 'https://www.work24.go.kr/ua/z/z/1300/selectEmssRqutIntro.do' }],
      detail: 'https://m.work24.go.kr/cm/c/f/1100/selecSystInfo.do?systId=SI00000316&systClId=SC00000206',
      proxyTip: '신청은 본인이 해야 합니다. 고용센터 상담 예약을 함께 잡아 주면 도움이 됩니다.',
      sources: [
        { title: '고용24 국민취업지원제도 안내', url: 'https://m.work24.go.kr/cm/c/f/1100/selecSystInfo.do?systId=SI00000316&systClId=SC00000206' },
        { title: '고용노동부, 청년 3만 명 국민취업지원제도 추가 참여', url: 'https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=19309' }
      ]
    },
    {
      id: 'youthSaving', name: '청년내일저축계좌', agency: '보건복지부 · 주민센터', category: '청년',
      oneLine: '일하는 15~39세 수급·차상위 청년이 매달 10만 원 이상 저축하면 정부가 월 30만 원을 보태 줍니다.',
      benefit: '3년 동안 본인이 월 10만~50만 원을 저축하면 정부가 월 30만 원을 지원합니다. 월 10만 원씩 저축하면 만기에 1,440만 원과 이자를 받습니다. 일을 계속하고 자립역량교육 10시간을 마쳐야 합니다. 2026년부터 대상이 소득인정액 기준중위소득 50% 이하 청년으로 바뀌었습니다.',
      howTo: '모집 기간에 복지로에서 온라인으로 신청하거나 주민센터를 방문합니다. 서류와 선정 결과는 자산형성포털에서 확인합니다.',
      period: '연 1회 모집(2026년은 5월 4일~20일, 마감)',
      docs: ['근로·사업소득 확인 서류', '가구특성 증빙 서류', '저축 지속 가능성 증빙 서류'],
      apply: [{ name: '자산형성포털', url: 'https://hope.welfareinfo.or.kr/' }],
      detail: 'https://m.bokjiro.go.kr/ssis-tem/cms/mob/customer/notice/1309680_1155.html',
      proxyTip: '청년 본인이 신청합니다. 모집 공고가 뜨면 알려 주세요.',
      sources: [{ title: '보건복지부, 2026 청년내일저축계좌 신규 모집', url: 'https://www.mohw.go.kr/board.es?mid=a10503010100&bid=0027&act=view&list_no=1490402&tag=&nPage=1' }]
    },
    {
      id: 'youthRent', name: '청년월세 지원', agency: '국토교통부 · 주민센터', category: '청년',
      oneLine: '부모와 따로 사는 19~34세 무주택 청년에게 월세를 월 최대 20만 원씩 24개월 지원합니다.',
      benefit: '실제 낸 월세 안에서 월 최대 20만 원을 최장 24개월(생애 1회) 받습니다. 보증금과 관리비는 지원하지 않습니다. 2026년부터 매년 모집하는 상시 사업이 됐습니다.',
      howTo: '모집 기간에 복지로에서 온라인으로 신청하거나 주민센터를 방문합니다. 복지로와 마이홈포털에서 자가진단을 할 수 있습니다. 문의는 1599-0001입니다.',
      period: '연 1회 모집(2026년은 3월 30일~5월 29일, 마감)',
      docs: ['임대차계약서', '월세 이체 내역', '청년·부모 가구 소득·재산 조사 동의서'],
      apply: [{ name: '복지로 상세 안내', url: 'https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00004661' }],
      detail: 'https://blog.bokjiro.go.kr/1828',
      proxyTip: '청년 본인이 신청합니다. 부모 가구 소득·재산 조사 동의가 필요하니 미리 이야기해 두세요.',
      sources: [
        { title: '정책브리핑, 청년 월세 최대 20만 원 지원(2026-03)', url: 'https://www.korea.kr/news/policyNewsView.do?newsId=148961039' },
        { title: '복지로 블로그, 2026년 청년월세 지원 신청 안내', url: 'https://blog.bokjiro.go.kr/1828' }
      ]
    },
    {
      id: 'youthFuture', name: '청년미래적금', agency: '금융위원회 · 서민금융진흥원', category: '청년',
      oneLine: '19~34세 청년이 3년 동안 월 50만 원까지 넣으면 정부가 납입액의 6~12%를 보태고 이자 세금을 면제합니다.',
      benefit: '일반형(총급여 6,000만 원 이하, 가구 기준중위소득 200% 이하)은 정부기여금 6%, 우대형(중소기업 재직 총급여 3,600만 원 이하 등, 가구 150% 이하)은 12%입니다. 월 50만 원을 넣으면 3년간 기여금이 일반형 최대 108만 원, 우대형 최대 216만 원입니다. 청년도약계좌는 신규 가입이 끝났습니다.',
      howTo: '모집 기간에 은행 앱(기업·농협·신한·우리·하나·국민·카카오뱅크 등)에서 비대면으로 신청합니다. 소득 심사는 서류 없이 진행합니다. 문의는 서민금융진흥원 1397입니다.',
      period: '정기 모집(2026년 1·2차 마감, 3차는 2027년)',
      docs: ['본인 명의 휴대전화', '(소상공인) 소상공인확인서'],
      apply: [{ name: '서민금융진흥원 안내', url: 'https://www.kinfa.or.kr/financialProduct/youthFutureSavings.do' }],
      detail: 'https://www.korea.kr/news/policyNewsView.do?newsId=148972819',
      proxyTip: '청년 본인이 은행 앱에서 신청합니다.',
      sources: [
        { title: '금융위원회, 청년미래적금 출시', url: 'https://www.fsc.go.kr/no010101/87158' },
        { title: '정책브리핑, 2차 청년미래적금 가입 신청', url: 'https://www.korea.kr/news/policyNewsView.do?newsId=148972819' }
      ]
    },
    {
      id: 'unemploymentBenefit', name: '구직급여(실업급여)', agency: '고용노동부 · 고용센터', category: '고용·창업',
      oneLine: '고용보험에 180일 이상 가입했다가 회사 사정 등으로 일자리를 잃으면 재취업 활동 기간에 받습니다.',
      benefit: '이전 평균임금의 60%를 하루 6만 6,048원~6만 8,100원(2026년) 범위에서 받습니다. 받는 날수는 퇴사 당시 나이와 가입기간에 따라 120~270일입니다.',
      howTo: '고용24에서 구직 등록과 온라인 사전교육을 마친 뒤 신분증을 들고 거주지 고용센터에서 수급자격을 신청합니다. 이후 1~4주마다 실업인정을 받습니다. 마지막 근무일 다음 날부터 12개월이 지나면 받을 수 없으니 바로 신청하세요.',
      period: '퇴직 후 바로(12개월 안)',
      docs: ['신분증', '수급자격 인정신청서', '회사가 처리한 이직확인서'],
      apply: [{ name: '고용24 실업급여 안내', url: 'https://ei.work24.go.kr/ei/eih/eg/pb/pbPersonBnef/retrievePb0201Info.do' }],
      detail: 'https://ei.work24.go.kr/ei/eih/eg/pb/pbPersonBnef/retrievePb0203Info.do',
      proxyTip: '실업인정은 반드시 본인이 해야 합니다. 대신 쓰면 부정수급이 됩니다.',
      sources: [
        { title: '고용24 실업급여 수급요건', url: 'https://ei.work24.go.kr/ei/eih/eg/pb/pbPersonBnef/retrievePb0201Info.do' },
        { title: '정책브리핑, 2026년 구직급여 상한액 인상', url: 'https://www.korea.kr/news/policyNewsView.do?newsId=148956574' }
      ]
    }
  ,
    {
      id: 'hopeReturn', name: '희망리턴패키지(폐업 지원)', agency: '중소벤처기업부 · 소상공인시장진흥공단', category: '소상공인',
      oneLine: '폐업했거나 폐업할 소상공인에게 점포 철거비, 사업정리 컨설팅, 법률·채무 상담, 재취업 교육과 수당을 지원합니다.',
      benefit: '점포 철거·원상복구 비용을 전용면적 1평당 20만 원, 최대 600만 원(2025년 7월 11일 이후 폐업자)까지 지원합니다. 세무·부동산·재기전략 컨설팅, 변호사 법률자문, 파산·회생 절차 지원을 받을 수 있습니다. 재취업 교육을 마치면 교육참여수당 35만 원, 전직장려수당 최대 100만 원, 국민취업지원제도 연계수당 월 20만 원(최대 6개월)을 받습니다.',
      howTo: '점포철거비와 재취업 교육은 소상공인24, 컨설팅·법률자문·채무조정은 희망리턴패키지 누리집에서 신청합니다. 철거 전에 먼저 신청해 적격 심사를 받아야 합니다. 문의는 1533-0100입니다.',
      period: '2026년 예산 소진 시까지',
      docs: ['사업자등록 정보', '임대차계약서', '(업종이 2개 이상이면) 부가가치세 확정신고서', '(철거 후) 정산 서류'],
      apply: [{ name: '소상공인24', url: 'https://www.sbiz24.kr/' }],
      detail: 'https://www.semas.or.kr/web/SUP01/SUP0117/SUP011702.kmdc',
      proxyTip: '철거 공사를 시작하기 전에 먼저 신청해야 지원받을 수 있습니다.',
      sources: [
        { title: '소상공인시장진흥공단 원스톱폐업지원', url: 'https://www.semas.or.kr/web/SUP01/SUP0117/SUP011702.kmdc' },
        { title: '정책브리핑, 점포철거비 최대 600만 원', url: 'https://www.korea.kr/news/policyNewsView.do?newsId=148947208' },
        { title: '소상공인시장진흥공단 특화취업지원·전직장려수당', url: 'https://www.semas.or.kr/web/SUP01/SUP0117/SUP011701.kmdc' }
      ]
    },
    {
      id: 'freshStart', name: '새출발기금(채무조정)', agency: '금융위원회 · 한국자산관리공사', category: '소상공인',
      oneLine: '대출을 갚기 어려운 소상공인·자영업자(폐업 포함)의 상환 기간을 늘리고 이자와 원금을 줄여 줍니다.',
      benefit: '최대 3년 거치, 최장 20년 분할상환으로 바꾸고, 신청 다음 날부터 추심과 강제집행이 멈춥니다. 90일 이상 연체한 부실차주는 재산에 따라 원금을 0~80%, 기초생활수급자 같은 취약계층은 최대 90%까지 줄입니다. 사업 관련 대출을 최대 15억 원까지 조정합니다.',
      howTo: '새출발기금 누리집에서 본인 인증 후 신청하거나 캠코·서민금융통합지원센터 창구에서 신청합니다. 콜센터는 1660-1378이며 다른 번호로 오는 연락은 사칭일 수 있습니다.',
      period: '2026년 말까지',
      docs: ['본인 인증', '(법인) 소상공인 확인서', '(대상 조회가 안 되면) 사업 영위 증빙'],
      apply: [{ name: '새출발기금 누리집', url: 'https://www.newstartfund.or.kr/Index.do' }],
      detail: 'https://www.newstartfund.or.kr/Contents/Prod.do',
      proxyTip: '채무조정은 한 번만 신청할 수 있으니 상담센터에서 먼저 상담받는 것이 좋습니다.',
      sources: [
        { title: '새출발기금 절차 안내', url: 'https://www.newstartfund.or.kr/Contents/Prod.do' },
        { title: '정책브리핑, 새출발기금 원금 감면 최대 90%', url: 'https://www.korea.kr/news/policyNewsView.do?newsId=148949556' }
      ]
    },
    {
      id: 'bizVoucher', name: '소상공인 경영안정 바우처', agency: '중소벤처기업부 · 소상공인시장진흥공단', category: '소상공인',
      oneLine: '2025년 매출 1억 400만 원 미만인 영업 중 소상공인에게 공과금·보험료에 쓰는 25만 원 바우처를 줍니다.',
      benefit: '사업주 카드에 25만 원 한도 바우처를 넣어 주고 전기·가스·수도 요금, 4대 보험료, 사업용 차량 연료비를 결제하면 먼저 차감합니다. 2026년 12월 31일까지 씁니다.',
      howTo: '소상공인24나 전용 사이트에서 본인 인증 후 온라인으로 신청합니다. 국세청 자료로 확인해 서류가 필요 없습니다. 문의는 1533-0600입니다.',
      period: '2026년 2월 9일 ~ 잠정 12월 18일(예산 소진 시 조기 마감)',
      docs: ['없음(국세청 자료로 확인)'],
      apply: [{ name: '바우처 신청 사이트', url: 'https://voucher.sbiz24.kr/' }],
      detail: 'https://credit.sbiz24.kr/pdf/notice.pdf',
      proxyTip: '사업주 본인 명의로 신청합니다.',
      sources: [{ title: '중소벤처기업부 공고 제2026-37호', url: 'https://credit.sbiz24.kr/pdf/notice.pdf' }]
    }
  ]
};
