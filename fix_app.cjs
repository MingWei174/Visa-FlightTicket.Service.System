const fs = require('fs');
let lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');

const startIdx = lines.findIndex(l => l.includes('<span>目標國家：{globalCountry}</span>'));
const endIdx = lines.findIndex(l => l.includes('Interactive Countdown Hero Banner'));

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `                    <span>目標國家：{globalCountry}</span>
                  </div>
                  <button 
                    onClick={() => {
                      setStudentTab('globe');
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded"
                  >
                    重選
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ==================== MAIN BODY CONTAINER ==================== */}
          {currentUser && userRole === 'student' && hasSeenAbout && !hasCompletedOnboarding && (
            <StudentOnboardingForm 
              onComplete={(student) => {
                setHasCompletedOnboarding(true);
                localStorage.setItem('has_completed_onboarding', 'true');
                setGlobalCountry(student.university.includes('日本') || student.university.includes('東京') || student.university.includes('早稻田') || student.university.includes('京都') ? '日本' : student.university.includes('美國') || student.university.includes('加州') || student.university.includes('哈佛') || student.university.includes('史丹佛') ? '美國' : student.university.includes('加拿大') || student.university.includes('多倫多') || student.university.includes('滑鐵盧') ? '加拿大' : '澳洲');
              }}
              initialCountry="日本"
            />
          )}

          {currentUser && !hasSeenAbout && (
            <AboutPage 
              isFirstTime={true}
              onStart={() => {
                setHasSeenAbout(true);
                localStorage.setItem('has_seen_about', 'true');
              }}
            />
          )}

          <main className="flex-grow p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto overflow-hidden">
            
            {/* Global parameters monitoring panel (Clock, Departure Date, simulated UTC) */}
            <div className="minimal-glass rounded-2xl p-4.5 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 minimal-border-transition">
              <div className="flex flex-wrap items-center gap-3.5 text-xs text-gray-600">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  系統時間：<strong className="text-[#2C2C2A] drop-shadow-sm font-serif font-bold">{simulationDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })} {simulationDate.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</strong>
                </span>
                <span className="text-slate-650 text-gray-400">|</span>
                <span className="flex items-center gap-1">
                  <Bot className="h-3.5 w-3.5 text-[#8F9779]" />
                  當前國家：<strong className="text-indigo-350 text-[#7A8B99]">{globalCountry}</strong>
                </span>
                <span className="text-slate-650 text-gray-400 hidden sm:inline">|</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                  調整出航班期：
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => {
                      setDepartureDate(e.target.value);
                      triggerToast(\`📅 出航日已被您成功調整為 \${e.target.value}，各時效與機票監控組件已動態對齊對應！\`);
                    }}
                    className="bg-[#FDFBF7] border border-[#E5E5E0] rounded-lg px-2 py-0.5 text-[11px] text-indigo-200 outline-none focus:border-indigo-405 font-mono cursor-pointer font-bold inline-block"
                  />
                </span>
              </div>

              <div className="text-[10.5px] text-gray-500 bg-white/60 px-3.5 py-1.5 rounded-xl border border-[#E5E5E0] flex items-center gap-1">
                <span>專案組員驗收：</span>
                <strong className="text-[#2C2C2A]">張茗崴 (113403547) & 張子衡 (113403062)</strong>
              </div>
            </div>

            {/* ==================== RENDER STUDENT VIEW ==================== */}
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
                      onClick={() => setStudentTab(tab.key)}
                      className={\`py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-1 px-1 whitespace-nowrap cursor-pointer \${
                        studentTab === tab.key
                          ? 'border-indigo-400 text-[#7A8B99] drop-shadow-[0_0_8px_rgba(129,140,248,0.55)]'
                          : 'border-transparent text-gray-500 hover:text-slate-205'
                      }\`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <AnimatePresence mode="wait">
                    {/* TAB CONTENT: Global University Map */}
                    {studentTab === 'globe' && (
                      <motion.div key="globe" initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: 20}} transition={{ duration: 0.3 }}>
                        <GlobalUniversityMap 
                          globalCountry={globalCountry} 
                          setGlobalCountry={setGlobalCountry} 
                          onSetTarget={(country, uni) => {
                            setGlobalCountry(country);
                            if (activeStudentProfile) {
                              setActiveStudentProfile({
                                ...activeStudentProfile,
                                university: uni
                              });
                            }
                            setStudentTab('overview');
                            triggerToast(\`🎯 已成功將您的留學目標變更為 \${country} 的 \${uni}，各項簽證與機票進度已重置對齊！\`);
                          }}
                        />
                      </motion.div>
                    )}

                    {/* TAB CONTENT: About Page */}
                    {studentTab === 'about' && (
                      <motion.div key="about" initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.95}} transition={{ duration: 0.3 }}>
                        <AboutPage 
                          isFirstTime={false}
                          onStart={() => setStudentTab('overview')}
                        />
                      </motion.div>
                    )}

                    {/* TAB CONTENT: Overview Dashboard */}
                    {studentTab === 'overview' && (
                      <motion.div key="overview" initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -20}} transition={{ duration: 0.3 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Hero (2 Columns) */}
                    <div className="lg:col-span-2 space-y-8">
                      
                      {/* Interactive Countdown Hero Banner`;
  const newLines = [...lines.slice(0, startIdx), replacement.trim(), ...lines.slice(endIdx + 1)];
  fs.writeFileSync('src/App.tsx', newLines.join('\n'));
  console.log('Fixed App.tsx successfully');
} else {
  console.log('Could not find start or end index', startIdx, endIdx);
}
