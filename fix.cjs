const fs = require('fs');
let lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');
const badIdx = lines.findIndex(l => l.includes('{t.title}'));
if (badIdx !== -1) {
  lines.splice(badIdx + 2, 0, `                                     {isOverdue && (
                                       <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-black whitespace-nowrap animate-pulse">
                                         逾期！
                                       </span>
                                     )}
                                   </div>
                                  <p className="text-[10px] text-gray-500 mt-1">
                                    倒推截止期：{dep.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <button
                          onClick={() => setStudentTab('visa')}
                          className="w-full text-center text-xs text-[#7A8B99] font-extrabold hover:underline block pt-2 cursor-pointer"
                        >
                          展開全部倒數工作項目 →
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB CONTENT: Visa Scheduler Checklist */}
                {studentTab === 'visa' && (
                  <motion.div key="visa" initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -20}} transition={{ duration: 0.3 }}>
                    <VisaScheduler
                    key={selectedCountry}
                    tasks={currentTasks || []}
                    onToggleTask={handleToggleTask}
                    departureDate={departureDate}
                    onDepartureDateChange={(date) => {
                      setDepartureDate(date);
                      triggerToast(\`出航日期重塑為 \${date}！所有文件的截止逆推已重算。\`);
                    }}
                    onSetTab={(tab) => {
                      if (tab === 'oshc') {
                        setStudentTab('oshc_loan');
                      }
                    }}
                    country={selectedCountry}
                  />
                  </motion.div>`);
  fs.writeFileSync('src/App.tsx', lines.join('\n'));
}
