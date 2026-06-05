const fs = require('fs');
let c = fs.readFileSync('src/data.ts', 'utf8');

const search = `  {
    id: 'bot',
    bankName: '臺灣銀行',
  {`;

const replacement = `  {
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
  {`;

c = c.replace(search, replacement);

c = c.replace(
  "url: 'https://www.tcb-bank.com.tw/personal-banking/loan/overseas-study',",
  "url: 'https://www.tcb-bank.com.tw/personal-banking/loan/youth-loan/policy-loan-07',"
);

fs.writeFileSync('src/data.ts', c);
