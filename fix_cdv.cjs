const fs = require('fs');
let cdv = fs.readFileSync('src/components/CountryDetailView.tsx', 'utf8');

// Replace import to use new partnerData.json
cdv = cdv.replace(
  "import partnersData from '../data/partners.json';",
  "import partnersDataRaw from '../partnerData.json';"
);

// Replace ncuPartners computation to use aggregated data
cdv = cdv.replace(
  `const ncuPartners = partnersData.filter((p: any) => 
    countryName.includes(p['國別']) || p['國別'].includes(countryName.split(' ')[1] || countryName.split(' ')[0]) || (countryName.includes('Korea') && p['國別'].includes('韓'))
  );`,
  `// All NCU partners (not filtered by country - we show all and group by country)
  const allNcuPartners = partnersDataRaw as any[];
  const ncuPartnersForThisCountry = allNcuPartners.filter((p: any) => 
    countryName.includes(p.country?.split(' ')[0]) || 
    p.country?.includes(countryName.split(' ')[1] || countryName.split(' ')[0]) || 
    (countryName.includes('Korea') && p.country?.includes('韓'))
  );
  // For the tab count, show all partners  
  const ncuPartners = allNcuPartners;`
);

// Replace the old NCU render - now show aggregated partner info with levels/agreements
// First let me update the filtered NCU logic
cdv = cdv.replace(
  `const filteredNcu = ncuPartners.filter((u: any) => 
    u['合作學校(中文名)']?.includes(searchTerm) || 
    u['合作學校(英文名)']?.toLowerCase().includes(searchTerm.toLowerCase())
  );`,
  `const filteredNcu = ncuPartners.filter((u: any) => {
    if (!searchTerm) return true;
    const st = searchTerm.toLowerCase();
    return u.nameCn?.includes(searchTerm) || 
           u.name?.toLowerCase().includes(st) ||
           u.country?.toLowerCase().includes(st) ||
           u.country?.includes(searchTerm);
  });

  // Group by country for listing
  const ncuByCountry = filteredNcu.reduce((acc: Record<string, any[]>, u: any) => {
    const c = u.country || '其他';
    if (!acc[c]) acc[c] = [];
    acc[c].push(u);
    return acc;
  }, {} as Record<string, any[]>);
  const sortedCountries = Object.entries(ncuByCountry).sort((a: any, b: any) => b[1].length - a[1].length);
  const [selectedNcuCountry, setSelectedNcuCountry] = useState<string | null>(null);`
);

// Fix handleSelectUniversity to use new data format
cdv = cdv.replace(
  "const uniName = isNcu ? (uni['合作學校(英文名)'] || uni['合作學校(中文名)']) : uni.name;",
  "const uniName = isNcu ? (uni.name || uni.nameCn) : uni.name;"
);

// Replace NCU partner count text
cdv = cdv.replace(
  "中央姊妹校 ({ncuPartners.length})",
  "中央姊妹校 ({allNcuPartners.length})"
);

// Replace sister school count 
cdv = cdv.replace(
  "`${ncuPartners.length} Sister Schools`",
  "`${ncuPartnersForThisCountry.length} Sister Schools`"
);

// Fix the NCU rendering section - show country groups with partner details
// Find and replace the NCU tab content
const oldNcuSection = cdv.indexOf("filteredNcu.length > 0 ? (");
if (oldNcuSection === -1) {
  // Try alternate format from earlier fix
  const altStart = cdv.indexOf("!selectedNcuCountry ? (");
  if (altStart !== -1) {
    console.log("Found alternate NCU format at position", altStart);
  }
}

// Since the NCU rendering varies, let's do a targeted replacement
// Find the NCU tab content between the tab check and the end
const ncuRenderStart = cdv.indexOf(") : (", cdv.indexOf("查無相符的大學"));
if (ncuRenderStart !== -1) {
  const endMarker = cdv.indexOf("</div>\n\n", ncuRenderStart);
}

// Let's just replace the entire NCU rendering block
const ncuBlockStart = cdv.indexOf("                ) : (", cdv.indexOf("查無相符的大學"));
if (ncuBlockStart !== -1) {
  // Find where the NCU block ends (matching closing brace)
  let depth = 0;
  let ncuBlockEnd = ncuBlockStart;
  const lines = cdv.substring(ncuBlockStart).split('\n');
  let foundEnd = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const ch of line) {
      if (ch === '(') depth++;
      if (ch === ')') depth--;
    }
    ncuBlockEnd += line.length + 1;
    // When we get back to depth 0 and have consumed the ternary
    if (depth <= -1 && i > 2) {
      foundEnd = true;
      break;
    }
  }
  
  if (foundEnd) {
    const before = cdv.substring(0, ncuBlockStart);
    const after = cdv.substring(ncuBlockEnd);
    
    const newNcuRender = `                ) : (
                  <div className="space-y-3">
                    {!selectedNcuCountry ? (
                      /* Country list view */
                      sortedCountries.length > 0 ? (
                        sortedCountries.map(([countryKey, unis]: [string, any]) => (
                          <motion.button
                            key={countryKey}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => setSelectedNcuCountry(countryKey)}
                            className="w-full text-left bg-white border border-[#EFECE6] p-4 rounded-2xl hover:shadow-md hover:border-[#D6D2C4] transition-all group flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="bg-[#F9F8F6] p-2.5 rounded-xl group-hover:bg-[#8F9779]/10 transition-colors">
                                <Globe2 className="h-5 w-5 text-[#A39D93] group-hover:text-[#8F9779] transition-colors" />
                              </div>
                              <div>
                                <h3 className="font-serif text-[#4A4A4A] text-base font-medium group-hover:text-[#5C6551] transition-colors">{countryKey}</h3>
                                <span className="text-xs text-[#A39D93]">{unis.length} 間姊妹校</span>
                              </div>
                            </div>
                            <span className="bg-[#F3F0E9] text-[#5C6551] px-3 py-1 rounded-full text-sm font-bold">{unis.length}</span>
                          </motion.button>
                        ))
                      ) : (
                        <div className="text-center py-12 text-[#A39D93] font-serif tracking-wider">查無相符的姊妹校</div>
                      )
                    ) : (
                      /* University list for selected country */
                      <div>
                        <button 
                          onClick={() => setSelectedNcuCountry(null)}
                          className="mb-4 flex items-center gap-2 text-sm text-[#8F9779] hover:text-[#5C6551] transition-colors font-bold"
                        >
                          <ArrowLeft className="h-4 w-4" /> 返回國家列表
                        </button>
                        <h3 className="text-lg font-serif font-bold text-[#5C6551] mb-3">{selectedNcuCountry} 姊妹校</h3>
                        {(ncuByCountry[selectedNcuCountry] || []).map((u: any, idx: number) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className="mb-3 bg-white border border-[#EFECE6] p-5 rounded-2xl hover:shadow-md hover:border-[#D6D2C4] transition-all"
                          >
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex-1">
                                <h4 className="font-serif text-[#4A4A4A] text-base font-bold">{u.name}</h4>
                                <p className="text-sm text-[#8F9779] font-medium">{u.nameCn}</p>
                              </div>
                              {onSetTarget && (
                                <button
                                  onClick={() => onSetTarget(countryName, u.name)}
                                  className="shrink-0 text-xs bg-[#5C6551] text-white px-3 py-1.5 rounded-lg hover:bg-[#4A5241] transition-colors font-bold"
                                >
                                  設為目標
                                </button>
                              )}
                            </div>
                            <div className="space-y-1.5 text-xs text-[#6A6A6A]">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-3 w-3 text-[#A39D93]" />
                                <span>簽約單位：<strong className="text-[#4A4A4A]">{u.levels?.join('、') || '校級'}</strong></span>
                              </div>
                              {u.agreements && u.agreements.length > 0 && (
                                <div className="flex items-start gap-2">
                                  <BookOpen className="h-3 w-3 text-[#A39D93] mt-0.5" />
                                  <div>
                                    <span className="font-bold text-[#4A4A4A]">合約類別：</span>
                                    {[...new Set(u.agreements.map((a: any) => a.type))].slice(0, 3).map((t: any, i: number) => (
                                      <span key={i} className="inline-block bg-[#F3F0E9] text-[#5C6551] px-1.5 py-0.5 rounded text-[10px] font-bold mr-1 mt-0.5">{t}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )
`;
    
    cdv = before + newNcuRender + after;
  }
}

// Also fix the filteredLocal search to use startsWith
cdv = cdv.replace(
  "const filteredLocal = localUniversities.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));",
  "const filteredLocal = localUniversities.filter(u => { const st = searchTerm.toLowerCase(); const n = u.name.toLowerCase(); return !searchTerm || n.startsWith(st) || n.includes(' ' + st); });"
);

// Reset selectedNcuCountry when tab changes - add to tab click handlers
cdv = cdv.replace(
  "onClick={() => setActiveTab('ncu')}",
  "onClick={() => { setActiveTab('ncu'); setSelectedNcuCountry(null); }}"
);

fs.writeFileSync('src/components/CountryDetailView.tsx', cdv);
console.log('✅ Fixed CountryDetailView.tsx');
