const fs = require('fs');
let lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');
const fixIdx = lines.findIndex((l, i) => i > 1100 && l.includes('className={`py-3 text-sm font-bold'));

if(fixIdx > 0) {
  const missing = `            {/* ==================== RENDER STUDENT VIEW ==================== */}
            {userRole === 'student' && (
              <div className="space-y-8">
                {/* Secondary Header Tab Bar visible on Desktop for fast swapping */}
                <div className="hidden lg:flex border-b border-[#E5E5E0] space-x-6 overflow-x-auto pb-0.5">
                  {[
                    { key: 'overview', label: '🏡 總覽儀表板' },
                    { key: 'visa', label: '📋 簽證倒向倒數時序條' },
                    { key: 'flight', label: '✈️ 機票比價與預算' },
                    { key: 'oshc_loan', label: '🏥 醫療保險 & 就學融資' },
                    { key: 'ai_agent', label: '🤖 AI 智慧留學顧問' },
                    { key: 'globe', label: '🌍 全球姊妹校地圖' },
                    { key: 'about', label: 'ℹ️ 關於本站' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setStudentTab(tab.key)}`;
  lines.splice(fixIdx - 1, 1, missing); // Replace the /* ======== RENDER STUDENT VIEW ====== */ that is sitting by itself
  fs.writeFileSync('src/App.tsx', lines.join('\n'));
  console.log('Spliced missing code');
}
