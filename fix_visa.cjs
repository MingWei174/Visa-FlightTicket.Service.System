const fs = require('fs');
let lines = fs.readFileSync('src/components/VisaScheduler.tsx', 'utf8').split('\n');

const replacement = `  CA: {
    title: '加拿大留學時序工作台 (🍁 Letter of Acceptance / PAL)',
    sub: '省級確認信 (PAL)、保證投資憑證 (GIC) 與 體指紋採集限時追溯',
    insuranceBadge: '省級指定留學生健保',
    insuranceDesc: '加拿大 IRCC 簽證政策：投保省級指定健保並備妥 GIC 資金存儲憑據以避秒退！',
    flag: '🇨🇦'
  },
  US: {
    title: '美國留學 F-1 學生電子倒數履歷 (🇺🇸 I-20 Form)',
    sub: 'SEVIS I-901 維護服務規費、DS-160 電子調查表與 AIT 實體面談指引',
    insuranceBadge: '美國高校 Immunization 疫苗醫療保險',
    insuranceDesc: '美國大學入學規範：強制申報黃卡預防針註冊與校方特定團體健保免除流程！',
    flag: '🇺🇸'
  },
  Global: {
    title: '全球留學出國任務逆推列表',
    sub: '入學許可確認書 / 醫療健保雙重逆推',
    insuranceBadge: '全球通用海外留學生保險',
    insuranceDesc: '各國移民局或學校規範：務必取得合規之留學健康醫療保險保單以確保個人安全！',
    flag: '🌍'
  }
};

export default function VisaScheduler({
  tasks,
  onToggleTask,
  departureDate,
  onDepartureDateChange,
  onSetTab,
  country
}: VisaSchedulerProps) {`;

const newLines = [...lines.slice(0, 36), replacement, ...lines.slice(42)];
fs.writeFileSync('src/components/VisaScheduler.tsx', newLines.join('\n'));
console.log('Fixed VisaScheduler.tsx');
