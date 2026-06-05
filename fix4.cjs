const fs = require('fs');
let c = fs.readFileSync('src/components/CountryDetailView.tsx', 'utf8');

// 1. Add state
c = c.replace(/const \[activeTab, setActiveTab\] = useState\('local'\);/, "const [activeTab, setActiveTab] = useState('local');\n  const [selectedNcuCountry, setSelectedNcuCountry] = useState<string | null>(null);");

// 2. Reset state on tab click
c = c.replace(/onClick=\{\(\) => setActiveTab\('ncu'\)\}/g, "onClick={() => { setActiveTab('ncu'); setSelectedNcuCountry(null); }}");
c = c.replace(/onClick=\{\(\) => setActiveTab\('local'\)\}/g, "onClick={() => { setActiveTab('local'); setSelectedNcuCountry(null); }}");

// 3. Search term match (issue 3)
c = c.replace(/return u\.name\.toLowerCase\(\)\.includes\(searchTerm\.toLowerCase\(\)\);/g, "const st = searchTerm.toLowerCase(); const n = u.name.toLowerCase(); return n.startsWith(st) || n.includes(' ' + st);");

// 4. Update the ncu render logic
const oldNcuRender = `                  filteredNcu.length > 0 ? (
                    filteredNcu.map((u: any, idx: number) => (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => handleSelectUniversity(u, true)}
                        className="w-full text-left bg-white border border-[#EFECE6] p-5 rounded-2xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-[#D6D2C4] transition-all group flex items-start gap-4"
                      >
                        <div className="bg-[#F9F8F6] p-3 rounded-xl group-hover:bg-[#8F9779]/10 transition-colors">
                          <GraduationCap className="h-6 w-6 text-[#A39D93] group-hover:text-[#8F9779] transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-[#4A4A4A] text-lg font-medium truncate mb-1 group-hover:text-[#5C6551] transition-colors">{u.name}</h3>
                          <div className="flex items-center justify-between text-xs text-[#A39D93] font-sans">
                            <span className="flex items-center gap-1">
                              <Globe2 className="h-3 w-3" />
                              {u.country}姊妹校
                            </span>
                            {u.web_pages?.[0] && (
                              <span className="truncate max-w-[150px]">{u.web_pages[0]}</span>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    ))
                  ) : (
                    <div className="text-center py-12 text-[#A39D93] font-serif tracking-wider">
                      查無相符的姊妹校
                    </div>
                  )`;

const newNcuRender = `                  !selectedNcuCountry ? (
                    // Show countries list
                    Object.entries(
                      filteredNcu.reduce((acc: any, u: any) => {
                        acc[u.country] = (acc[u.country] || 0) + 1;
                        return acc;
                      }, {})
                    )
                    .sort((a: any, b: any) => b[1] - a[1]) // sort by count descending
                    .map(([countryName, count], idx) => (
                      <motion.button
                        key={countryName as string}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => setSelectedNcuCountry(countryName as string)}
                        className="w-full text-left bg-white border border-[#EFECE6] p-5 rounded-2xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-[#D6D2C4] transition-all group flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-[#F9F8F6] p-3 rounded-xl group-hover:bg-[#8F9779]/10 transition-colors">
                            <Globe2 className="h-6 w-6 text-[#A39D93] group-hover:text-[#8F9779] transition-colors" />
                          </div>
                          <h3 className="font-serif text-[#4A4A4A] text-lg font-medium group-hover:text-[#5C6551] transition-colors">{countryName}</h3>
                        </div>
                        <div className="bg-[#F3F0E9] text-[#5C6551] px-3 py-1 rounded-full text-sm font-bold">
                          {count as number} 間
                        </div>
                      </motion.button>
                    ))
                  ) : (
                    // Show universities for selected country
                    <div>
                      <button 
                        onClick={() => setSelectedNcuCountry(null)}
                        className="mb-4 flex items-center gap-2 text-sm text-[#A39D93] hover:text-[#5C6551] transition-colors"
                      >
                        ← 返回國家列表
                      </button>
                      {filteredNcu.filter((u: any) => u.country === selectedNcuCountry).map((u: any, idx: number) => (
                        <motion.button
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => handleSelectUniversity(u, true)}
                          className="w-full mb-4 text-left bg-white border border-[#EFECE6] p-5 rounded-2xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-[#D6D2C4] transition-all group flex items-start gap-4"
                        >
                          <div className="bg-[#F9F8F6] p-3 rounded-xl group-hover:bg-[#8F9779]/10 transition-colors">
                            <GraduationCap className="h-6 w-6 text-[#A39D93] group-hover:text-[#8F9779] transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-serif text-[#4A4A4A] text-lg font-medium truncate mb-1 group-hover:text-[#5C6551] transition-colors">{u.name}</h3>
                            <div className="flex items-center justify-between text-xs text-[#A39D93] font-sans">
                              <span className="flex items-center gap-1">
                                <Globe2 className="h-3 w-3" />
                                {u.country}姊妹校
                              </span>
                              {u.web_pages?.[0] && (
                                <span className="truncate max-w-[150px]">{u.web_pages[0]}</span>
                              )}
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )`;

c = c.replace(oldNcuRender, newNcuRender);
fs.writeFileSync('src/components/CountryDetailView.tsx', c);
