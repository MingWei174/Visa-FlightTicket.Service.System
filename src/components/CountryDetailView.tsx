import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, MapPin, Building2, Globe2, GraduationCap, ArrowLeft, Image as ImageIcon, BookOpen } from 'lucide-react';
import partnersDataRaw from '../partnerData.json';
import { UniversityService, University, UniversityDetails } from '../services/UniversityService';

interface CountryDetailViewProps {
  countryName: string;
  onClose: () => void;
  onSetTarget?: (country: string, uni: string) => void;
}

export default function CountryDetailView({ countryName, onClose, onSetTarget }: CountryDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'local' | 'ncu'>('local');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);
  const [localUniversities, setLocalUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedUni, setSelectedUni] = useState<any | null>(null);
  const [uniDetails, setUniDetails] = useState<UniversityDetails | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  // All NCU partners (not filtered by country - we show all and group by country)
  const allNcuPartners = partnersDataRaw as any[];
  const ncuPartnersForThisCountry = allNcuPartners.filter((p: any) => 
    countryName.includes(p.country?.split(' ')[0]) || 
    p.country?.includes(countryName.split(' ')[1] || countryName.split(' ')[0]) || 
    (countryName.includes('Korea') && p.country?.includes('韓'))
  );
  // For the tab count, show all partners  
  const ncuPartners = allNcuPartners;

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const fetchData = async () => {
      const bgImage = await UniversityService.getCountryBackgroundImage(countryName);
      if (!isMounted) return;
      setBgImageUrl(bgImage);

      const unis = await UniversityService.getUniversitiesByCountry(countryName);
      if (!isMounted) return;
      setLocalUniversities(unis);
      setIsLoading(false);
    };
    
    fetchData();

    return () => { isMounted = false; };
  }, [countryName]);

  const handleSelectUniversity = async (uni: any, isNcu: boolean) => {
    setSelectedUni({ ...uni, isNcu });
    setUniDetails(null);
    setIsFetchingDetails(true);
    
    const uniName = isNcu ? (uni.name || uni.nameCn) : uni.name;
    const details = await UniversityService.getUniversityDetails(uniName);
    setUniDetails(details);
    setIsFetchingDetails(false);
  };

  const filteredLocal = localUniversities.filter(u => { const st = searchTerm.toLowerCase(); const n = u.name.toLowerCase(); return !searchTerm || n.startsWith(st) || n.includes(' ' + st); });
  const filteredNcu = ncuPartners.filter((u: any) => {
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
  const [selectedNcuCountry, setSelectedNcuCountry] = useState<string | null>(null);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0 z-40 bg-[#FAF9F6] rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col md:flex-row"
    >
      {/* Left side: Immersive Photo Background */}
      <div className="relative w-full md:w-5/12 h-64 md:h-full bg-[#EFECE6] shrink-0">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: bgImageUrl ? `url(${bgImageUrl})` : 'none' }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10"></div>
        </motion.div>
        
        <div className="absolute inset-0 p-8 flex flex-col justify-between">
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all self-start shadow-sm"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="space-y-4">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white/90 text-xs tracking-[0.2em] uppercase font-light border border-white/30 shadow-sm inline-block">
              Destination
            </span>
            <h1 className="text-5xl md:text-7xl font-serif text-white tracking-wide drop-shadow-lg leading-tight">
              {countryName}
            </h1>
            <p className="text-white/80 font-serif text-sm tracking-widest uppercase font-light pl-1">
              {ncuPartners.length > 0 ? `${ncuPartnersForThisCountry.length} Sister Schools` : 'Global Exploration'}
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Content Area (Minimalist/Literature Style) */}
      <div className="flex-1 h-full flex flex-col relative overflow-hidden bg-[#FAF9F6]">
        
        <AnimatePresence mode="wait">
          {!selectedUni ? (
            <motion.div 
              key="list-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="h-full flex flex-col p-8 md:p-12"
            >
              {/* Header & Tabs */}
              <div className="space-y-8 mb-8">
                <div className="flex items-center gap-6 border-b border-[#E5E0D8] pb-4">
                  <button
                    onClick={() => { setActiveTab('local'); setSelectedNcuCountry(null); }}
                    className={`text-lg font-serif tracking-widest transition-all \${
                      activeTab === 'local' 
                        ? 'text-[#5C6551] border-b-2 border-[#5C6551] pb-2' 
                        : 'text-[#A39D93] hover:text-[#7A8270] pb-2'
                    }`}
                  >
                    全球名校探索
                  </button>
                  <button
                    onClick={() => { setActiveTab('ncu'); setSelectedNcuCountry(null); }}
                    className={`text-lg font-serif tracking-widest transition-all \${
                      activeTab === 'ncu' 
                        ? 'text-[#5C6551] border-b-2 border-[#5C6551] pb-2' 
                        : 'text-[#A39D93] hover:text-[#7A8270] pb-2'
                    }`}
                  >
                    中央姊妹校 ({allNcuPartners.length})
                  </button>
                </div>

                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A39D93] transition-colors group-hover:text-[#5C6551]" />
                  <input
                    type="text"
                    placeholder="輸入大學名稱搜尋..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#F3F0E9] border-none rounded-xl py-4 pl-12 pr-4 text-sm text-[#4A4A4A] placeholder-[#A39D93] focus:outline-none focus:ring-1 focus:ring-[#8F9779] transition-all font-serif"
                  />
                </div>
              </div>

              {/* University List */}
              <div className="flex-1 overflow-y-auto pr-4 space-y-4 custom-scrollbar">
                {activeTab === 'local' ? (
                  isLoading ? (
                    <div className="flex flex-col items-center justify-center h-40 space-y-4 text-[#A39D93]">
                      <div className="w-8 h-8 border-2 border-[#8F9779] border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-serif tracking-widest text-sm">正在尋找當地名校...</span>
                    </div>
                  ) : filteredLocal.length > 0 ? (
                    filteredLocal.map((u, idx) => (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => handleSelectUniversity(u, false)}
                        className="w-full text-left bg-white border border-[#EFECE6] p-5 rounded-2xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-[#D6D2C4] transition-all group flex items-start gap-4"
                      >
                        <div className="bg-[#F9F8F6] p-3 rounded-xl group-hover:bg-[#8F9779]/10 transition-colors">
                          <Building2 className="h-6 w-6 text-[#A39D93] group-hover:text-[#8F9779] transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-[#4A4A4A] text-lg font-medium truncate mb-1 group-hover:text-[#5C6551] transition-colors">{u.name}</h3>
                          <div className="flex items-center gap-2 text-xs text-[#A39D93] font-sans">
                            <Globe2 className="h-3 w-3" />
                            <span className="truncate">{u.web_pages?.[0] || '無網站資訊'}</span>
                          </div>
                        </div>
                      </motion.button>
                    ))
                  ) : (
                    <div className="text-center py-12 text-[#A39D93] font-serif tracking-wider">
                      查無相符的大學
                    </div>
                  )
                ) : (
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
                          <motion.button
                            key={idx}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            onClick={() => handleSelectUniversity(u, true)}
                            className="w-full text-left mb-3 bg-white border border-[#EFECE6] p-5 rounded-2xl hover:shadow-md hover:border-[#D6D2C4] transition-all"
                          >
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex-1">
                                <h4 className="font-serif text-[#4A4A4A] text-base font-bold">{u.name}</h4>
                                <p className="text-sm text-[#8F9779] font-medium">{u.nameCn}</p>
                              </div>
                              {onSetTarget && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); onSetTarget(countryName, u.name); }}
                                  className="shrink-0 text-xs bg-[#5C6551] text-white px-3 py-1.5 rounded-lg hover:bg-[#4A5241] transition-colors font-bold cursor-pointer"
                                >
                                  設為目標
                                </button>
                              )}
                            </div>
                            <div className="space-y-1.5 text-xs text-[#6A6A6A] mt-3 bg-[#F9F8F6] p-3 rounded-xl">
                              <div className="flex flex-wrap gap-x-4 gap-y-2">
                                <div className="flex items-center gap-1.5">
                                  <Building2 className="h-3.5 w-3.5 text-[#8F9779]" />
                                  <span>單位：<strong className="text-[#4A4A4A]">{u.department || '未提供'}</strong></span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <BookOpen className="h-3.5 w-3.5 text-[#8F9779]" />
                                  <span>層級：<strong className="text-[#4A4A4A]">{u.level || '校級'}</strong></span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <span className="inline-block bg-[#EFECE6] text-[#5C6551] px-2 py-0.5 rounded text-[10px] font-bold">{u.type || '合約'}</span>
                                {u.term && <span className="text-[#A39D93] truncate">{u.term}</span>}
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="detail-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="h-full flex flex-col"
            >
              <div className="p-8 md:p-12 pb-6 border-b border-[#EFECE6] bg-white sticky top-0 z-10">
                <button 
                  onClick={() => setSelectedUni(null)}
                  className="flex items-center gap-2 text-[#A39D93] hover:text-[#5C6551] transition-colors text-sm font-serif tracking-wider mb-6 group"
                >
                  <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
                  返回列表
                </button>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-serif text-[#4A4A4A] leading-tight mb-3">
                      {selectedUni.isNcu ? (selectedUni['合作學校(中文名)'] || selectedUni['合作學校(英文名)']) : selectedUni.name}
                    </h2>
                    {selectedUni.isNcu && selectedUni['合作學校(英文名)'] && (
                      <p className="text-[#A39D93] font-serif text-lg">{selectedUni['合作學校(英文名)']}</p>
                    )}
                  </div>
                  {onSetTarget && (
                    <button
                      onClick={() => onSetTarget(countryName, selectedUni.isNcu ? (selectedUni['合作學校(中文名)'] || selectedUni.name) : selectedUni.name)}
                      className="shrink-0 bg-[#8F9779] text-white px-5 py-2.5 rounded-full font-serif text-sm tracking-widest hover:bg-[#7A8266] transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                      🎯 設為留學目標
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-8 bg-[#FAF9F6] custom-scrollbar">
                
                {/* Dynamic Image */}
                <div className="w-full h-64 bg-[#EFECE6] rounded-2xl overflow-hidden relative shadow-sm border border-[#E5E0D8]">
                  {isFetchingDetails ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-[#D6D2C4] animate-pulse" />
                    </div>
                  ) : uniDetails?.thumbnailUrl ? (
                    <img src={uniDetails.thumbnailUrl} alt="University" className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-[#A39D93]">
                      <Building2 className="h-12 w-12 mb-3 opacity-20" />
                      <span className="font-serif tracking-widest text-sm">尚無影像資料</span>
                    </div>
                  )}
                </div>

                {/* Content Details */}
                <div className="prose prose-stone prose-p:font-serif prose-p:leading-relaxed prose-p:text-[#6A6A6A] max-w-none">
                  {isFetchingDetails ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-4 bg-[#EFECE6] rounded w-3/4"></div>
                      <div className="h-4 bg-[#EFECE6] rounded w-full"></div>
                      <div className="h-4 bg-[#EFECE6] rounded w-5/6"></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 mb-6">
                        <BookOpen className="h-5 w-5 text-[#8F9779]" />
                        <h3 className="text-xl font-serif text-[#4A4A4A] m-0">學術簡介</h3>
                      </div>
                      <p className="whitespace-pre-line text-[15px] leading-8 text-[#5C5C5C] text-justify tracking-wide">
                        {uniDetails?.extract || '目前尚未收錄該校的詳細維基百科簡介。'}
                      </p>
                    </>
                  )}
                </div>

                {/* Additional Info Cards (NCU specific) */}
                {selectedUni.isNcu && (
                  <div className="grid grid-cols-2 gap-4 pt-8 border-t border-[#EFECE6]">
                    <div className="bg-white p-5 rounded-2xl border border-[#E5E0D8]">
                      <div className="text-[10px] text-[#A39D93] uppercase tracking-widest font-sans mb-1">PROGRAM</div>
                      <div className="font-serif text-[#4A4A4A]">{selectedUni['簽證名稱'] || 'N/A'}</div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-[#E5E0D8]">
                      <div className="text-[10px] text-[#A39D93] uppercase tracking-widest font-sans mb-1">LANGUAGE</div>
                      <div className="font-serif text-[#4A4A4A]">{selectedUni['語言門檻'] || '依該校規定'}</div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
}
