/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task, FlightPoint, FlightRecommendation, OSHCProvider, LoanOption, StudentProgress } from './types';

export const universitiesByCountry: Record<string, {name: string, isSisterSchool: boolean, desc: string}[]> = {
  '日本': [
    { name: '東京大學 (The University of Tokyo)', isSisterSchool: false, desc: '日本最高學府，位於東京。' },
    { name: '早稻田大學 (Waseda University)', isSisterSchool: true, desc: '知名私立大學，中央大學重點姊妹校之一。' },
    { name: '慶應義塾大學 (Keio University)', isSisterSchool: true, desc: '日本歷史最悠久的高等教育機構。' },
    { name: '京都大學 (Kyoto University)', isSisterSchool: false, desc: '位於京都的頂尖國立大學。' }
  ],
  '美國': [
    { name: '哈佛大學 (Harvard University)', isSisterSchool: false, desc: '常春藤盟校之一，世界頂尖學府。' },
    { name: '史丹佛大學 (Stanford University)', isSisterSchool: false, desc: '位於加州矽谷核心地帶。' },
    { name: '普渡大學 (Purdue University)', isSisterSchool: true, desc: '工程領域著名，中央大學工學院合作校。' },
    { name: '加州大學柏克萊分校 (UC Berkeley)', isSisterSchool: false, desc: '世界頂尖的公立研究型大學。' }
  ],
  '加拿大': [
    { name: '多倫多大學 (University of Toronto)', isSisterSchool: false, desc: '加拿大最頂尖的綜合型大學。' },
    { name: '不列顛哥倫比亞大學 (UBC)', isSisterSchool: false, desc: '位於溫哥華，擁有極美的校園。' },
    { name: '滑鐵盧大學 (University of Waterloo)', isSisterSchool: true, desc: '以合作教育(Co-op)及電腦科學聞名，為合作姊妹校。' }
  ],
  '澳洲': [
    { name: '雪梨大學 (The University of Sydney)', isSisterSchool: false, desc: '澳洲最古老的大學。' },
    { name: '墨爾本大學 (The University of Melbourne)', isSisterSchool: false, desc: '位於文化之都的頂級研究型大學。' },
    { name: '新南威爾斯大學 (UNSW Sydney)', isSisterSchool: false, desc: '以工程、商學等聞名。' },
    { name: '昆士蘭大學 (The University of Queensland)', isSisterSchool: true, desc: '澳洲八大名校之一，為重點姊妹校。' }
  ]
};

// Australian Tasks
export const initialTasks: Task[] = [
  {
    id: 1,
    title: '取得正式入學許可確認書 COE',
    category: '簽證文件',
    daysBefore: 60,
    desc: '澳洲學校核發的正式入學確認書 (Confirmation of Enrolment)，是申請Subclass 500留學生簽證的唯一合法憑證。',
    completed: true,
    importance: '最高'
  },
  {
    id: 2,
    title: '投保海外留學健康保險 (OSHC)',
    category: '簽證文件',
    daysBefore: 50,
    desc: '澳洲政府規定：外籍學生在澳期間必須強制投保 OSHC，保險效期必須完全覆蓋學校核准逗留的全部時間，否則簽證將被秒退。',
    completed: false,
    importance: '最高',
    recommendOshc: true
  },
  {
    id: 3,
    title: '提交電子學生簽證申請 (Subclass 500)',
    category: '簽證文件',
    daysBefore: 45,
    desc: '註冊 ImmiAccount 線上填報表單、佐證文件及繳納澳洲官方簽證行政費 (目前約 AUD $1,600+)。建議越早遞交越有利。',
    completed: false,
    importance: '最高'
  },
  {
    id: 4,
    title: '完成澳洲留學體檢與生物辨識預約',
    category: '簽證文件',
    daysBefore: 35,
    desc: '接獲審查體檢信(HAP Letter)後，需預約指定健檢配合醫學單位，並安排在 VFS Global 完成機密生物辨識資訊(指紋與人臉採集)。',
    completed: false,
    importance: '高'
  },
  {
    id: 5,
    title: '一鍵比價並鎖定澳洲單程機票',
    category: '行前準備',
    daysBefore: 21,
    desc: '待簽證官方核批(Visa Grant Notice)下來後，立即上本平台比價模組鎖定 7/3 出發之黃金低價走勢，省下千元冤枉錢。',
    completed: false,
    importance: '高'
  },
  {
    id: 6,
    title: '海外留學生專案就學貸款申貸與撥貸',
    category: '行前準備',
    daysBefore: 14,
    desc: '如有政府或各家銀行之低利留學金信貸需求，需及早於此階段攜入正式COE辦理末期撥貸、匯出海外或預兌基本澳幣現鈔。',
    completed: false,
    importance: '中'
  },
  {
    id: 7,
    title: '海外住所確認及澳洲實體隨身帳戶在線開立',
    category: '行前準備',
    daysBefore: 10,
    desc: '在線取得寄宿家庭/學生公寓之合約與確切地址，並在線網點預約 Commonwealth Bank (CBA) 或 ANZ 在線帳戶，省去抵澳排隊時間。',
    completed: false,
    importance: '中'
  },
  {
    id: 8,
    title: '行李入關限重申報與動物檢疫自檢',
    category: '行前準備',
    daysBefore: 3,
    desc: '澳洲動植物入境檢疫法規堪稱世界最嚴苛！整理行李時務必逐項核對禁帶食材與藥品清單，若攜有合法中西藥等，皆須主動申報以免面臨最高萬枚澳幣重罰。',
    completed: false,
    importance: '高'
  }
];

// Comprehensive Task Map by Country
export const initialTasksByCountry: Record<'AU' | 'JP' | 'CA' | 'US' | 'Global', Task[]> = {
  AU: initialTasks,
  Global: [
    {
      id: 901,
      title: '取得正式入學許可確認書 COE',
      category: '簽證文件',
      daysBefore: 60,
      desc: '依據該國簽證規定，您必須先取得海外學校核發的正式入學確認書或邀請函，這是申請學生簽證的必要文件。',
      completed: true,
      importance: '最高'
    },
    {
      id: 902,
      title: '海外留學健康保險投保',
      category: '簽證文件',
      daysBefore: 50,
      desc: '為確保海外就學期間的醫療保障，多數國家強制或強烈建議外籍學生投保留學生專屬保險。',
      completed: false,
      importance: '最高',
      recommendOshc: true
    },
    {
      id: 903,
      title: '向該國駐台辦事處遞交簽證申請',
      category: '簽證文件',
      daysBefore: 45,
      desc: '依據各國大使館或辦事處的流程，線上或實體遞交簽證申請表、護照、財力證明等文件，並繳納簽證費。',
      completed: false,
      importance: '最高'
    },
    {
      id: 904,
      title: '完成該國規定之體檢與生物辨識',
      category: '簽證文件',
      daysBefore: 35,
      desc: '若該國簽證要求，需前往指定醫院完成健康檢查，並預約辦理指紋與人臉等生物辨識。',
      completed: false,
      importance: '高'
    },
    {
      id: 905,
      title: '比價並訂購學生特惠機票',
      category: '行前準備',
      daysBefore: 21,
      desc: '確認簽證核發後，建議盡快比價鎖定單程機票，學生票通常享有更優厚的行李額度。',
      completed: false,
      importance: '高'
    },
    {
      id: 906,
      title: '海外住宿確認及生活準備',
      category: '行前準備',
      daysBefore: 10,
      desc: '完成寄宿家庭或學生公寓的簽約手續，並查詢當地生活、氣候資訊。',
      completed: false,
      importance: '中'
    }
  ],
  JP: [
    {
      id: 101,
      title: '取得在留資格認定證明書 COE',
      category: '簽證文件',
      daysBefore: 90,
      desc: '日本入国管理局核發的正式在留資格認定證明書 (Certificate of Eligibility)，是申請日本學生活動簽證的核心法源。',
      completed: true,
      importance: '最高'
    },
    {
      id: 102,
      title: '親臨日本台灣交流協會辦理學生簽證',
      category: '簽證文件',
      daysBefore: 45,
      desc: '備齊護照、在留資格(COE)正本與影本、身分證及特定白底相片，前往交流協會辦理入國貼簽。一般 2-3 工作日可核發。',
      completed: false,
      importance: '最高'
    },
    {
      id: 103,
      title: '比價並訂購飛日單線早鳥機票',
      category: '行前準備',
      daysBefore: 30,
      desc: '鎖定飛東京、大阪、福岡之淡季低價，學生票可享有高達 35-46kg 行李託運。',
      completed: false,
      importance: '高'
    },
    {
      id: 104,
      title: '預約學校保證人宿舍或民間不動產租約',
      category: '行前準備',
      daysBefore: 21,
      desc: '與學校國際學生處或民間代理商(如 Leopalace21)在線簽署「賃貸契約」，預付首期禮金及敷金並取得海外遷入證明。',
      completed: false,
      importance: '高'
    },
    {
      id: 105,
      title: '在線註冊 Visit Japan Web 申報登入',
      category: '行前準備',
      daysBefore: 10,
      desc: '赴日前務必上網填報 Visit Japan Web 入境審查、檢疫與海關申報，獲取通關二維碼(QR Code)以利落機快速通關。',
      completed: false,
      importance: '高'
    },
    {
      id: 106,
      title: '加入留學健康守護與海外醫療商業保險',
      category: '行前準備',
      daysBefore: 7,
      desc: '日本法規強制抵日後加入「國民健康保險」，但在抵日前的入境初期，強力推薦加保商業海外旅平暨突發傷病留學險防身。',
      completed: false,
      importance: '中'
    },
    {
      id: 107,
      title: '預兌日幣現金與日本 Yucho 郵局開戶流程研讀',
      category: '行前準備',
      daysBefore: 5,
      desc: '日本極多庶民餐飲仍採現金支付。建議攜帶約 15-30 萬日圓實體現鈔，並熟悉抵日後前往「ゆうちょ銀行」開立免手續費郵局帳戶流程。',
      completed: false,
      importance: '中'
    },
    {
      id: 108,
      title: '市役所地址登記住民登錄與國保申辦準備',
      category: '行前準備',
      daysBefore: 3,
      desc: '抵達日本起算 14 天內，強制攜帶護照、在留卡前往居住地「市區町村役所」辦理地址轉入登錄，並於現場直接加入國民健康保險。',
      completed: false,
      importance: '最高'
    }
  ],
  CA: [
    {
      id: 201,
      title: '取得錄取許可書 LOA 與省級准入認證信 PAL',
      category: '簽證文件',
      daysBefore: 90,
      desc: '學校核發的入學信 (Letter of Acceptance)，且自2024年起必須核准隨附之省級准入確認信 (Provincial Attestation Letter)。',
      completed: true,
      importance: '最高'
    },
    {
      id: 202,
      title: '在線購買加拿大保證投資憑證 GIC 擔保金',
      category: '簽證文件',
      daysBefore: 60,
      desc: '加拿大移民局 (IRCC) 受理簽證擔保關鍵：向 Scotiabank 或 CIBC 匯撥約 $20,635 加幣以上取得 GIC 憑證。',
      completed: false,
      importance: '最高'
    },
    {
      id: 203,
      title: '在線向 IRCC 提交學習許可 (Study Permit)',
      category: '簽證文件',
      daysBefore: 45,
      desc: '於 IRCC Portal 線上上傳 LOA, PAL, GIC, 財力證明、無犯罪紀錄(良民證)及在線繳納簽證審核規費。',
      completed: false,
      importance: '最高'
    },
    {
      id: 204,
      title: '接獲 BIL 預約完成生物特徵識別指紋與人臉採集',
      category: '簽證文件',
      daysBefore: 35,
      desc: '收到採集指引信 (BIL) 後，需於 30 日內預約親至 VFS Global 台北辦事處現場錄入安全生物辨識資訊。',
      completed: false,
      importance: '最高'
    },
    {
      id: 205,
      title: '前往移民局合約指定醫院完成留學體健檢',
      category: '簽證文件',
      daysBefore: 30,
      desc: '接獲移民局預先體檢指示，預約指定台北或高雄醫檢單位完成胸部X光、血液常規檢查等。',
      completed: false,
      importance: '高'
    },
    {
      id: 206,
      title: '一鍵對比並投保指定省份留學生醫療險',
      category: '行前準備',
      daysBefore: 15,
      desc: '加拿大各省（如安省 UHIP、BC 省 MSP）之學生醫療福利要求不同，請提早投保並下載保險卡正本以便登機。',
      completed: false,
      importance: '高'
    },
    {
      id: 207,
      title: '鎖定經港溫哥華/多倫多之單程低價航線機票',
      category: '行前準備',
      daysBefore: 14,
      desc: '加拿大航線長且轉機選項複雜，利用比價模組預定加航、長榮或國泰單程票，且留心行李通常為 23kg × 2 件之規章。',
      completed: false,
      importance: '中'
    },
    {
      id: 208,
      title: '確認 eTA 電子旅行授權狀態與加拿大海關自檢',
      category: '行前準備',
      daysBefore: 3,
      desc: '確保護照在線綁定的電子旅行授權(eTA)為有效。加國檢疫局對任何肉類、生鮮植物管控嚴苛，切入時務必如實申報。',
      completed: false,
      importance: '高'
    }
  ],
  US: [
    {
      id: 301,
      title: '獲取入學資格表 I-20 Form',
      category: '簽證文件',
      daysBefore: 100,
      desc: '代表學校已向 SEVIS 系統登入學生的就學資訊。此實體或電子 I-20 Form 是申請 F-1 美國留學護照簽證的必備核心原件。',
      completed: true,
      importance: '最高'
    },
    {
      id: 302,
      title: '預先在線付清 SEVIS I-901 全額系統維護規費',
      category: '簽證文件',
      daysBefore: 60,
      desc: '美國國土安全部強制徵收留學生監理費（約 USD $350）。付清後必須印出實體 I-901 收據以供面試及入關查驗。',
      completed: false,
      importance: '最高'
    },
    {
      id: 303,
      title: '線上詳實填報美簽 DS-160 電子調查申請表',
      category: '簽證文件',
      daysBefore: 50,
      desc: '最嚴格的安全調查表。填報所有學經歷、在台保證人等，確認無誤後產出專屬條碼確認信(DS-160 Confirmation)。',
      completed: false,
      importance: '最高'
    },
    {
      id: 304,
      title: '預約面呈並攜帶證件親赴 AIT 台北辦事處面試',
      category: '簽證文件',
      daysBefore: 40,
      desc: '線上刷卡美簽手續費後預約時段。面試當日需攜帶護照、I-20、I-901 收據、DS-160、大頭照及英文財力證明，親赴 AIT 與官員面談。',
      completed: false,
      importance: '最高'
    },
    {
      id: 305,
      title: '補件完成美國高校預防接種 Immunization 與 TB 篩檢',
      category: '簽證文件',
      daysBefore: 30,
      desc: '美國各州高校對預防針（麻疹、流腦、水痘等）要求嚴謹，須提供合格醫院簽發的國際英文黃卡。',
      completed: false,
      importance: '高'
    },
    {
      id: 306,
      title: '鎖定飛美單程早鳥特惠機票與大容量託運',
      category: '行前準備',
      daysBefore: 21,
      desc: '太平洋跨洋航線機票波段變化大，早鳥預定可享有較豐厚的行李配額與特選聯營票價。',
      completed: false,
      importance: '高'
    },
    {
      id: 307,
      title: '完成國際學生在線註冊與選課註冊登入',
      category: '行前準備',
      daysBefore: 14,
      desc: '提早登入學校門戶網站完成選課與在線新生培訓，避免熱門基礎課爆滿阻礙學術進程。',
      completed: false,
      importance: '高'
    },
    {
      id: 308,
      title: '熟悉抵美新生報到與住所入駐自檢流程',
      category: '行前準備',
      daysBefore: 7,
      desc: '完成學校國際處新生報到，攜帶所有手續文件與預算證明，並完成留宿點的生活功能和安全設施核對。',
      completed: false,
      importance: '中'
    }
  ]
};

export const flightHistory: FlightPoint[] = [
  { date: '05/10', price: 29800, status: 'high' },
  { date: '05/15', price: 28500, status: 'high' },
  { date: '05/20', price: 27200, status: 'down' },
  { date: '05/22', price: 24800, status: 'down' },
  { date: '05/28', price: 23900, status: 'best' },
  { date: '06/05', price: 25200, status: 'up' },
  { date: '06/15', price: 26800, status: 'up' },
  { date: '06/25', price: 28000, status: 'high' },
  { date: '06/30', price: 29500, status: 'critical' }
];

export const flightRecommendations: FlightRecommendation[] = [
  {
    airline: '國泰航空 (Cathay Pacific)',
    flightNo: 'CX 138 / CX 111',
    departureTime: '12:45 (TPE)',
    arrivalTime: '20:30 (SYD)',
    stops: 1,
    baggage: '23kg × 2 件 (超爽大容量)',
    price: 24800,
    matchScore: 98,
    recommended: true,
    transitText: '於香港轉機 (停留約 1.5小時)，黃金中轉，準點率極高，留學生最推薦方案！'
  },
  {
    airline: '新加坡航空 (Singapore Airlines)',
    flightNo: 'SQ 877 / SQ 231',
    departureTime: '14:20 (TPE)',
    arrivalTime: '05:15 (SYD)',
    stops: 1,
    baggage: '30kg × 1 件 (標準學生件)',
    price: 26200,
    matchScore: 92,
    recommended: false,
    transitText: '於新加坡樟宜港轉機 (停留約 2小時)，五星新航貼心餐飲，旅途最舒適選擇。'
  },
  {
    airline: '中華航空 (China Airlines)',
    flightNo: 'CI 051',
    departureTime: '23:30 (TPE)',
    arrivalTime: '10:45 (SYD)',
    stops: 0,
    baggage: '23kg × 2 件 (行李增額)',
    price: 32500,
    matchScore: 89,
    recommended: false,
    transitText: '台北直飛雪梨 (無停靠)，省時省心力不折騰，適合想一覺睡到雪梨的學子。'
  }
];

export const oshcProviders: OSHCProvider[] = [
  {
    name: 'Allianz Care Australia (安聯保險)',
    pricePerYear: 549,
    rating: 4.9,
    badge: '留學生首選 & 各大學校園直設據點',
    desc: '全球排名前兩大本土健康保險商，於溫哥華、雪梨、墨爾本、東京多處學生區設有「實體專屬諮詢部」，在學期間處理保險問題最省心。',
    benefits: [
      '各大校園及留學城市網點密集，專人線下一對二手把手免費答疑',
      '贈送 24 小時遠程智慧門診及心理支持'
    ]
  },
  {
    name: 'Medibank Student Protection Plan',
    pricePerYear: 572,
    rating: 4.7,
    badge: '全方位生活適應關懷專案',
    desc: '最受國際學生家長好評。除了基礎的生病住院和處方藥補助外，全額包含高質量的 24 小時專業雙語心理熱線與學務、法律適應諮商，支持出國不卡關。',
    benefits: [
      '專設「24H 留學生海外輔助關顧熱線」防範治安與生活危機',
      '包含處方藥、緊急直升機醫療運送與創傷應急理賠',
      '提供專屬健康應用，累積健康運動步數可兌換各類免稅店購物金'
    ]
  }
];

export const loanOptions: LoanOption[] = [
  {
    id: 'bot',
    bankName: '臺灣銀行',
    programName: '教育部留學生就學貸款',
    maxAmount: '碩士 NT$ 1,000,000 / 博士 NT$ 2,000,000',
    interestRate: '約 2.15% - 2.44% (政府利息補貼計畫)',
    repaymentPeriod: '最長 10 年 (含寬限期 3 年)',
    gracePeriod: '3 年',
    url: 'https://www.bot.com.tw/tw/personal-banking/loan/Personal-Policy-Loan/Edu-Foreign-Stu-Loan',
    eligibility: '中華民國國民，出國攻讀學位並符合家戶所得限制條件(低於120萬台幣全額補貼，120-200萬半額)。',
    features: [
      '國家最有力後盾，低免擔保壓力',
      '碩士學程享寬限期最長 3 年，期間政府直接補貼全額或半額利息',
      '不限特定設籍縣市皆可臨櫃或在線預先收件'
    ]
  },
  {
    id: 'fubon',
    bankName: '台北富邦銀行',
    programName: '台北市青年留學生就學貸款',
    maxAmount: '碩士 NT$ 1,000,000 / 博士 NT$ 2,000,000',
    interestRate: '北市府全額負擔前 10 年利息 (免付利息神卡)',
    repaymentPeriod: '最長 10 年 (碩士) / 最長 12 年 (博士)',
    gracePeriod: '3 年 (碩士) / 5 年 (博士)',
    url: 'https://www.fubon.com/banking/personal/loan/study_abroad/study_abroad.htm',
    eligibility: '設籍台北市滿一年以上，年齡 20-40 歲，家戶所得申報符合財政部免收利息規定者。',
    features: [
      '台北市政府黃金預算專案補貼，全台灣最殺利息優惠！',
      '就學期間利息由台北市政府直接替學員支付 (實質 0 利率)',
      '融資快速審理，適合設籍台北市的留學新星'
    ]
  },
  {
    id: 'tcb',
    bankName: '合作金庫銀行',
    programName: '海外自費留學/遊學/渡假打工貸款',
    maxAmount: '最高 NT$ 1,500,000',
    interestRate: '2.82% - 3.15% 起機動計息',
    repaymentPeriod: '最長 7 年 (享 1 年本金寬限期)',
    gracePeriod: '1 年',
    url: 'https://www.tcb-bank.com.tw/personal-banking/loan/youth-loan/policy-loan-07',
    eligibility: '中華民國國民，無任何家庭所得總數上限限制。全台渡假打工或語言留學、交換計畫亦可支持。',
    features: [
      '免家庭所得審核！手續極簡不求人',
      '除碩博士學位外，亦完美覆蓋交換生、語言短期進修與黃金海外 Working Holiday 計畫',
      '撥款進程高速靈活，最快 5 個工作天直接連網匯撥'
    ]
  }
];

export const initialStudents: StudentProgress[] = [
  {
    id: 'std_01',
    studentName: '林宥嘉',
    studentId: '2026_USYD_352',
    studentGmail: 'yujia.lin@gmail.com',
    country: '澳洲',
    university: '雪梨大學 (The University of Sydney)',
    intendedDeparture: '2026-07-03',
    progressPercentage: 88,
    riskStatus: '正常',
    advisorNotes: '這名學生的準備非常主動，COE及OSHC皆在兩天內取得，體檢與生物辨識已在5/18完成。其表示已訂閱平台的降價機票，預計在一兩天內取得 Visa Grant 隨即安排搶票。',
    lastActive: '10 分鐘前',
    tasksProgress: [
      { taskId: 1, completed: true },
      { taskId: 2, completed: true },
      { taskId: 3, completed: true },
      { taskId: 4, completed: true },
      { taskId: 5, completed: false },
      { taskId: 6, completed: true },
      { taskId: 7, completed: true },
      { taskId: 8, completed: false }
    ]
  },
  {
    id: 'std_02',
    studentName: '張美婷',
    studentId: '2026_UNIMELB_105',
    studentGmail: 'meiting.zhang@gmail.com',
    country: '澳洲',
    university: '墨爾本大學 (The University of Melbourne)',
    intendedDeparture: '2026-07-03',
    progressPercentage: 25,
    riskStatus: '緊急',
    advisorNotes: '該學員目前存在決策癱瘓情況，雖然已繳交學費取得 COE，但對於 OSHC 保險方案挑選因資訊繁雜感到無所適從，導致簽證遲未遞交！已由平台警急引導至 OSHC 特優對比模組，請顧問儘快確認是否已跟進直接一鍵申辦，以防來不及在 7/3 順利出境。',
    lastActive: '3 小時前',
    tasksProgress: [
      { taskId: 1, completed: true },
      { taskId: 2, completed: false },
      { taskId: 3, completed: false },
      { taskId: 4, completed: false },
      { taskId: 5, completed: false },
      { taskId: 6, completed: false },
      { taskId: 7, completed: false },
      { taskId: 8, completed: false }
    ]
  },
  {
    id: 'std_03',
    studentName: '陳子威',
    studentId: '2026_UQ_772',
    studentGmail: 'ziwei.chen@gmail.com',
    country: '澳洲',
    university: '昆士蘭大學 (The University of Queensland)',
    intendedDeparture: '2026-07-03',
    progressPercentage: 50,
    riskStatus: '預警',
    advisorNotes: 'OSHC 已投保完成。其於 5/15 遞交 Subclass 500 學生簽證，昨日剛收到移民局 HAP 體檢和指紋採集要求。已由系統主動提醒體檢期限和生物辨識預約，有稍微落後進度，建議顧問電話跟進督促。',
    lastActive: '1 天前',
    tasksProgress: [
      { taskId: 1, completed: true },
      { taskId: 2, completed: true },
      { taskId: 3, completed: true },
      { taskId: 4, completed: false },
      { taskId: 5, completed: false },
      { taskId: 6, completed: false },
      { taskId: 7, completed: false },
      { taskId: 8, completed: false }
    ]
  },
  {
    id: 'std_04',
    studentName: '趙凱文',
    studentId: '2026_UNSW_812',
    studentGmail: 'kevin.zhao@gmail.com',
    country: '澳洲',
    university: '新南威爾斯大學 (UNSW Sydney)',
    intendedDeparture: '2026-07-15',
    progressPercentage: 100,
    riskStatus: '正常',
    advisorNotes: '恭喜！該學生的全部倒退任務已100%突破。簽證於上週由內政部火速核發，今日利用平台最低機票時機購買了國泰航空單程特惠機票 (NT$ 27,400)，且在線開戶、落腳住宅及行李自檢全數備齊。無任何潛在隱患，可順利迎接澳洲出國！',
    lastActive: '5 小時前',
    tasksProgress: [
      { taskId: 1, completed: true },
      { taskId: 2, completed: true },
      { taskId: 3, completed: true },
      { taskId: 4, completed: true },
      { taskId: 5, completed: true },
      { taskId: 6, completed: true },
      { taskId: 7, completed: true },
      { taskId: 8, completed: true }
    ]
  }
];
