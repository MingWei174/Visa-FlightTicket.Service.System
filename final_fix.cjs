const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');
const mangledBlock = fs.readFileSync('mangledBlock.txt', 'utf8');
const restoredContent = `globalCountry={globalCountry} 
                          setGlobalCountry={setGlobalCountry} 
                          onSetTarget={(country, uni) => {
                            setGlobalCountry(country);
                            setGlobalUniversity(uni);
                            setStudentTab('overview');
                            triggerToast(\`已將留學目標設為：\${uni}\`);
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
                      
                      {/* Interactive Countdown Hero Banner */}
                      <div className="minimal-glass-accent text-[#2C2C2A] rounded-3xl p-8 shadow-2xl relative overflow-hidden transition-all duration-300 minimal-border-transition">
                        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-12 translate-y-12 select-none pointer-events-none">
                          <Plane className="w-72 h-72 -rotate-45 text-[#2C2C2A]" />
                        </div>

                        <div className="relative z-10 space-y-6">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] bg-indigo-500/25 text-[#7A8B99] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-500/15">
                              Atlas. 智慧留學跨國排程導航系統
                            </span>
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-3 py-1 rounded-full border border-emerald-500/20 uppercase">
                              {selectedCountry} 項目
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div className="space-y-2">
                              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                距離正式飛抵目的地起航還有
                              </p>
                              <h2 className="text-6xl font-black tracking-tight text-[#2C2C2A] flex items-baseline gap-1">
                                {daysRemaining} <span className="text-2xl font-normal text-[#7A8B99]">天</span>
                              </h2>
                              <div className="flex items-center gap-2 text-xs text-gray-600 pt-1">
                                <Clock className="h-4 w-4 text-[#7A8B99] shrink-0 animate-pulse" />
                                <span>預定在 {departureDate} 正式起航起程</span>
                              </div>
                            </div>

                            {/* Circular progress container */}
                            <div className="bg-white/60 border border-[#E5E5E0] p-5 rounded-2xl flex flex-col items-center justify-center">
                              <span className="text-[10px] text-gray-500 font-semibold mb-2">當前國家文件備齊百分比</span>
                              
                              <div className="relative flex items-center justify-center h-24 w-24">
                                <svg className="w-24 h-24 transform -rotate-90">
                                  <circle cx="48" cy="48" r="40" className="stroke-current text-[#2C2C2A]/5" strokeWidth="6.5" fill="transparent" />
                                  <circle 
                                    cx="48" 
                                    cy="48" 
                                    r="40" 
                                    className="stroke-current text-[#8F9779] transition-all duration-700" 
                                    strokeWidth="7" 
                                    fill="transparent"
                                    strokeDasharray={2 * Math.PI * 40}
                                    strokeDashoffset={2 * Math.PI * 40 * (1 - progressPercentage / 100)}
                                  />
                                </svg>
                                <span className="absolute text-xl font-mono font-extrabold">{progressPercentage}%</span>
                              </div>

                              <span className="text-[11px] text-emerald-400 font-bold mt-2.5 flex items-center gap-1.5">
                                已攻克 {completedCount} / {currentTasks.length} 核心案件
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Flights recommendations */}
                      <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-[#E5E5E0] shadow-lg space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-[#E5E5E0]">
                          <div className="flex items-center gap-2">
                            <TrendingDown className="h-4.5 w-4.5 text-emerald-400" />
                            <h3 className="font-bold text-[#2C2C2A] text-sm">今日航線推薦行情</h3>
                          </div>
                          <button 
                            onClick={() => setStudentTab('flight')}
                            className="text-xs text-indigo-305 text-[#7A8B99] font-bold hover:underline flex items-center cursor-pointer"
                          >
                            點擊進智慧比價監控室 →
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-indigo-500/10 backdrop-blur-sm border border-indigo-500/20 p-4 rounded-2xl flex flex-col justify-between">
                            <div>
                              <span className="text-[9px] bg-indigo-500/20 text-[#7A8B99] font-black px-2 py-0.5 rounded">
                                特優低位推薦
                              </span>
                              <h4 className="text-xl font-black text-[#2C2C2A] mt-1.5">NT$ {dashboardFlightStats.basePrice}</h4>
                              <p className="text-[10.5px] text-slate-350 text-gray-600 mt-1 leading-relaxed">
                                新期出航航空行情處於 30 日低點。適合手刀購入。
                              </p>
                            </div>
                            <button
                              onClick={() => setStudentTab('flight')}
                              className="bg-indigo-500/20 hover:bg-[#8F9779]/30 text-[#7A8B99] border border-indigo-500/30 text-[11px] font-bold py-1.5 rounded-lg transition-all mt-4 w-full cursor-pointer"
                            >
                              立即查看
                            </button>
                          </div>

                          <div className="bg-white/60 p-4 rounded-2xl border border-[#E5E5E0] flex flex-col justify-between">
                            <div>
                              <span className="text-[9px] bg-white text-gray-600 font-bold px-2 py-0.5 rounded">
                                小資首選廉航
                              </span>
                              <h4 className="text-xl font-black text-[#2C2C2A] mt-1.5">NT$ {dashboardFlightStats.lowPrice}</h4>
                              <p className="text-[10.5px] text-gray-500 mt-1">
                                {dashboardFlightStats.lowDesc}
                              </p>
                            </div>
                            <button
                              onClick={() => setStudentTab('flight')}
                              className="bg-white hover:bg-white/15 text-[#2C2C2A] border border-[#E5E5E0] text-[11px] font-bold py-1.5 rounded-lg transition-all mt-4 w-full cursor-pointer"
                            >
                              比價航線
                            </button>
                          </div>

                          <div className="bg-white/60 p-4 rounded-2xl border border-[#E5E5E0] flex flex-col justify-between">
                            <div>
                              <span className="text-[9px] bg-indigo-550/10 text-[#7A8B99] font-bold px-2 py-0.5 rounded">
                                雙行李{dashboardFlightStats.premAirline}包裝
                              </span>
                              <h4 className="text-xl font-black text-[#2C2C2A] mt-1.5">NT$ {dashboardFlightStats.premiumPrice}</h4>
                              <p className="text-[10.5px] text-gray-500 mt-1">
                                {dashboardFlightStats.premDesc}
                              </p>
                            </div>
                            <button
                              onClick={() => setStudentTab('flight')}
                              className="bg-white/60 hover:bg-white text-gray-600 border border-[#E5E5E0] text-[11px] font-bold py-1.5 rounded-lg transition-all mt-4 w-full cursor-pointer"
                            >
                              比價機票
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>`;
if(app.includes(mangledBlock)){
  app = app.replace(mangledBlock, restoredContent);
  fs.writeFileSync('src/App.tsx', app);
  console.log('Success');
} else {
  console.log('Could not find mangled block');
}
