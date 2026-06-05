/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plane, 
  Calendar, 
  CheckCircle2, 
  Users, 
  TrendingDown, 
  Compass, 
  HeartHandshake, 
  Clock, 
  HelpCircle, 
  Sparkles, 
  Check, 
  Award, 
  BadgeAlert,
  ArrowRight,
  Menu,
  X,
  Bot,
  Settings,
  MapPin,
  ClipboardCheck,
  LogIn,
  LogOut,
  UserCheck,
  ShieldCheck,
  Loader2,
  Globe
} from 'lucide-react';
import { initialTasksByCountry } from './data';
import { Task, StudentProgress } from './types';
import VisaScheduler from './components/VisaScheduler';
import FlightPriceTracker from './components/FlightPriceTracker';
import LoanAndOshc from './components/LoanAndOshc';
import AdvisorDashboard from './components/AdvisorDashboard';
import AIAgent from './components/AIAgent';
import AboutPage from './components/AboutPage';
import GlobalUniversityMap from './components/GlobalUniversityMap';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  getDocs, 
  collection, 
  setDoc, 
  doc 
} from './firebase';

const AtlasLogo = ({ className = "h-8 w-8" }: { className?: string }) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

const ADMIN_EMAILS = [
  'vinceth.chang@gmail.com',
  'w45166148@gmail.com'
];

export default function App() {
  const [tasksByCountry, setTasksByCountry] = useState<Record<'AU' | 'JP' | 'CA' | 'US', Task[]>>({
    AU: [...initialTasksByCountry['AU']],
    JP: [...initialTasksByCountry['JP']],
    CA: [...initialTasksByCountry['CA']],
    US: [...initialTasksByCountry['US']]
  });

  const [selectedCountry, setSelectedCountry] = useState<'AU' | 'JP' | 'CA' | 'US'>('AU');
  const [globalCountry, setGlobalCountry] = useState<string>('Australia 澳洲');
  const [globalUniversity, setGlobalUniversity] = useState<string>('');

  const dashboardFlightStats = React.useMemo(() => {
    const c = globalCountry || '';
    if (c.includes('日') || c.includes('韓')) {
      return { basePrice: '12,500', lowPrice: '8,900', premiumPrice: '16,800', lowAirline: '樂桃', premAirline: '星宇', lowDesc: '樂桃航空方案，不含託運行李額度。', premDesc: '星宇直飛專案，提供高質感空中體驗。' };
    } else if (c.includes('美') || c.includes('加')) {
      return { basePrice: '35,800', lowPrice: '29,900', premiumPrice: '42,500', lowAirline: '聯合', premAirline: '長榮', lowDesc: '聯合航空中轉方案，經濟實惠首選。', premDesc: '長榮直飛專案，2件23kg行李，旅途舒適。' };
    } else if (c.includes('英') || c.includes('歐') || c.includes('法') || c.includes('德') || c.includes('捷')) {
      return { basePrice: '32,800', lowPrice: '26,500', premiumPrice: '38,900', lowAirline: '阿聯酋', premAirline: '卡達', lowDesc: '阿聯酋中轉特惠，需留意轉機時間。', premDesc: '卡達航空優質服務，行李額度充足。' };
    }
    return { basePrice: '24,800', lowPrice: '18,900', premiumPrice: '27,400', lowAirline: '酷航', premAirline: '國泰', lowDesc: '酷航中轉方案，託運行李定額 20kg 需加購 NT$1,400 起。', premDesc: '支持 2 件 23kg 重行李額，完全備妥學生行裝。' };
  }, [globalCountry]);

  useEffect(() => {
    if (globalCountry === '澳洲' || globalCountry === 'Australia 澳洲') setSelectedCountry('AU');
    else if (globalCountry === '日本' || globalCountry === 'Japan 日本') setSelectedCountry('JP');
    else if (globalCountry === '加拿大' || globalCountry === 'Canada 加拿大') setSelectedCountry('CA');
    else if (globalCountry === '美國' || globalCountry === 'USA 美國') setSelectedCountry('US');
    else setSelectedCountry('AU');
  }, [globalCountry]);

  const [departureDate, setDepartureDate] = useState<string>('2026-07-03');
  const [userRole, setUserRole] = useState<'student' | 'advisor'>('student');
  
  const [hasSeenAbout, setHasSeenAbout] = useState<boolean>(() => {
    return localStorage.getItem('has_seen_about') === 'true';
  });

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('has_completed_onboarding') === 'true';
  });

  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [studentTab, setStudentTab] = useState<'overview' | 'visa' | 'flight' | 'oshc_loan' | 'ai_agent' | 'about' | 'globe'>('overview');
  const [advisorTab, setAdvisorTab] = useState<'dashboard' | 'ai_agent'>('dashboard');

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState<boolean>(false);

  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);

  const [simulationDate, setSimulationDate] = useState<Date>(new Date());
  
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [activeStudentProfile, setActiveStudentProfile] = useState<StudentProgress | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setIsAuthLoading(false);
      if (user) {
        setCurrentUser(user);
        
        if (ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
          setUserRole('advisor');
        } else {
          setUserRole('student');
          
          // Fetch student profile
          try {
            const snap = await getDocs(collection(db, 'students'));
            const students = snap.docs.map(d => ({ id: d.id, ...d.data() } as StudentProgress));
            const myProfile = students.find(s => s.id === user.uid || s.email === user.email);
            if (myProfile) {
              setActiveStudentProfile(myProfile);
              setGlobalCountry(myProfile.targetCountry || 'Australia 澳洲');
              setGlobalUniversity(myProfile.targetUniversity || '');
              setDepartureDate(myProfile.departureDate || '2026-07-03');
            } else {
              // Create new profile if none exists
              const newProfile: StudentProgress = {
                id: user.uid,
                name: user.displayName || '新同學',
                email: user.email || '',
                targetCountry: 'Australia 澳洲',
                targetUniversity: '',
                departureDate: '2026-07-03',
                tasks: []
              };
              await setDoc(doc(db, "students", user.uid), newProfile);
              setActiveStudentProfile(newProfile);
            }
          } catch (e) {
            console.error('Failed to load profile', e);
          }

          if (!hasSeenAbout) {
             setStudentTab('about');
          }
        }
      } else {
        setCurrentUser(null);
        setActiveStudentProfile(null);
      }
    });
    return () => unsub();
  }, [hasSeenAbout]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/unauthorized-domain') {
        setUnauthorizedDomain(window.location.hostname);
      } else {
        console.error(error);
        triggerToast('登入發生錯誤：' + error.message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      triggerToast('已成功登出系統');
    } catch (error: any) {
      triggerToast('登出發生錯誤：' + error.message);
    }
  };

  const calculateProgress = () => {
    const total = tasksByCountry[selectedCountry].length;
    const completed = tasksByCountry[selectedCountry].filter(t => t.completed).length;
    return Math.round((completed / total) * 100);
  };

  const progressPercentage = calculateProgress();
  const currentTasks = tasksByCountry[selectedCountry];
  const completedCount = currentTasks.filter(t => t.completed).length;

  const daysRemaining = Math.max(0, Math.ceil((new Date(departureDate).getTime() - simulationDate.getTime()) / (1000 * 60 * 60 * 24)));

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center flex-col gap-4">
        <AtlasLogo className="w-16 h-16 text-[#2C2C2A] animate-pulse" />
        <p className="text-[#7A8B99] font-medium tracking-widest text-sm uppercase">正在初始化系統核心模組...</p>
      </div>
    );
  }

  // Handle editing profile
  const handleSaveProfile = async () => {
    setIsEditingProfile(false);
    
    if (currentUser && activeStudentProfile) {
      try {
        const updatedProfile = {
          ...activeStudentProfile,
          targetCountry: globalCountry,
          targetUniversity: globalUniversity,
          departureDate: departureDate
        };
        
        await setDoc(doc(db, "students", activeStudentProfile.id || currentUser.uid), updatedProfile);
        setActiveStudentProfile(updatedProfile);
        triggerToast('個人資料已更新並同步至雲端！');
      } catch (err: any) {
        console.error(err);
        triggerToast('儲存失敗：' + err.message);
      }
    } else {
      triggerToast('個人資料已暫時更新 (未登入無法同步)');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2C2A] font-sans overflow-x-hidden selection:bg-[#8F9779] selection:text-white relative">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#FDFBF7]/80 backdrop-blur-xl border-b border-[#E5E5E0]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            <div className="flex items-center gap-3">
              <div className="bg-[#2C2C2A] text-[#FDFBF7] p-2 rounded-xl">
                <AtlasLogo className="w-5 h-5" />
              </div>
              <span className="font-black text-xl tracking-tight hidden sm:block font-serif text-[#2C2C2A]">
                Atlas. <span className="font-normal text-[#8F9779] text-sm tracking-widest uppercase ml-2 font-sans">全球留學導航</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              {currentUser ? (
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-3 bg-white/50 px-3 py-1.5 rounded-full border border-[#E5E5E0]">
                    <img src={currentUser.photoURL || 'https://via.placeholder.com/32'} alt="Avatar" className="w-7 h-7 rounded-full object-cover" />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold leading-tight">{currentUser.displayName || '使用者'}</span>
                      <span className="text-[9px] text-gray-500">{userRole === 'advisor' ? '管理員權限' : '學生帳戶'}</span>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-red-500 transition-colors">
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">登出</span>
                  </button>
                </div>
              ) : (
                <button onClick={handleLogin} className="flex items-center gap-2 bg-[#2C2C2A] hover:bg-[#4A4A4A] text-white px-5 py-2 rounded-full text-xs font-bold tracking-widest transition-all shadow-md">
                  <LogIn className="w-4 h-4" />
                  <span>Google 快速登入</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* Main Content Padding */}
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
        {!currentUser ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 text-center">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E5E5E0] inline-block mb-4">
              <Globe className="w-24 h-24 text-[#8F9779] mb-4 mx-auto" />
              <h1 className="text-4xl font-black font-serif text-[#2C2C2A] mb-4 tracking-tight">全球簽證與機票智慧導航</h1>
              <p className="text-gray-500 max-w-md mx-auto leading-relaxed">請使用 Google 帳號登入系統，解鎖專屬您的留學行前準備自動化體驗。</p>
              <button onClick={handleLogin} className="mt-8 bg-[#8F9779] hover:bg-[#7A8270] text-white px-8 py-3 rounded-xl text-sm font-bold tracking-widest transition-all shadow-lg flex items-center justify-center w-full gap-2 cursor-pointer">
                <LogIn className="w-5 h-5" />
                立即登入系統
              </button>
            </div>
          </div>
        ) : (
          <>
            {userRole === 'student' && (
              <div className="space-y-8">
                {/* Desktop Tabs */}
                <div className="hidden lg:flex border-b border-[#E5E5E0] space-x-6 overflow-x-auto pb-0.5">
                  {[
                    { id: 'overview', icon: Compass, label: '樞紐首頁' },
                    { id: 'globe', icon: Globe, label: '3D 地球' },
                    { id: 'visa', icon: ClipboardCheck, label: '簽證代辦' },
                    { id: 'flight', icon: Plane, label: '航班比價' },
                    { id: 'oshc_loan', icon: ShieldCheck, label: '保險與貸款' },
                    { id: 'ai_agent', icon: Bot, label: 'AI 客服' },
                    { id: 'about', icon: HelpCircle, label: '關於本站' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setStudentTab(tab.id as any)}
                      className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors ${studentTab === tab.id ? 'border-[#8F9779] text-[#2C2C2A] font-bold' : 'border-transparent text-gray-500 hover:text-[#2C2C2A] hover:border-gray-300 font-medium'}`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="text-sm tracking-wider">{tab.label}</span>
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {studentTab === 'globe' && (
                    <motion.div key="globe" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                      <GlobalUniversityMap 
                        globalCountry={globalCountry} 
                        setGlobalCountry={setGlobalCountry} 
                        onSetTarget={(country, uni) => {
                          setGlobalCountry(country);
                          setGlobalUniversity(uni);
                          setStudentTab('overview');
                          triggerToast(`已將留學目標設為：${uni}`);
                        }}
                      />
                    </motion.div>
                  )}

                  {studentTab === 'about' && (
                    <motion.div key="about" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                      <AboutPage isFirstTime={!hasSeenAbout} onStart={() => {
                        setHasSeenAbout(true);
                        localStorage.setItem('has_seen_about', 'true');
                        setStudentTab('overview');
                      }} />
                    </motion.div>
                  )}

                  {studentTab === 'visa' && (
                    <motion.div key="visa" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                      <VisaScheduler onTriggerToast={triggerToast} selectedCountry={selectedCountry} />
                    </motion.div>
                  )}

                  {studentTab === 'flight' && (
                    <motion.div key="flight" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                      <FlightPriceTracker globalCountry={globalCountry} onTriggerToast={triggerToast} />
                    </motion.div>
                  )}

                  {studentTab === 'oshc_loan' && (
                    <motion.div key="oshc_loan" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                      <LoanAndOshc globalCountry={globalCountry} globalUniversity={globalUniversity} />
                    </motion.div>
                  )}

                  {studentTab === 'ai_agent' && (
                    <motion.div key="ai_agent" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                      <AIAgent />
                    </motion.div>
                  )}

                  {studentTab === 'overview' && (
                    <motion.div key="overview" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Dashboard Content - Left Column */}
                      <div className="lg:col-span-2 space-y-8">
                        {/* Countdown Hero */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E5E5E0] relative overflow-hidden">
                          <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-12 translate-y-12">
                            <Plane className="w-72 h-72 -rotate-45" />
                          </div>
                          <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] bg-gray-100 text-gray-600 font-extrabold px-3 py-1 rounded-full uppercase tracking-widest border border-gray-200">
                                Atlas. 智慧留學跨國排程導航系統
                              </span>
                              <span className="text-[10px] bg-[#8F9779]/10 text-[#8F9779] font-extrabold px-3 py-1 rounded-full border border-[#8F9779]/20 uppercase">
                                {selectedCountry} 項目
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                              <div className="space-y-2">
                                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">距離正式飛抵目的地起航還有</p>
                                <h2 className="text-6xl font-black tracking-tight text-[#2C2C2A] flex items-baseline gap-1">
                                  {daysRemaining} <span className="text-2xl font-normal text-gray-400">天</span>
                                </h2>
                                <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
                                  <Clock className="h-4 w-4" />
                                  <span>預定在 {departureDate} 正式起航起程</span>
                                </div>
                              </div>
                              <div className="bg-[#FDFBF7] border border-[#E5E5E0] p-5 rounded-2xl flex flex-col items-center justify-center">
                                <span className="text-[10px] text-gray-500 font-semibold mb-2">當前國家文件備齊百分比</span>
                                <div className="relative flex items-center justify-center h-24 w-24">
                                  <svg className="w-24 h-24 transform -rotate-90">
                                    <circle cx="48" cy="48" r="40" className="stroke-current text-gray-200" strokeWidth="6.5" fill="transparent" />
                                    <circle cx="48" cy="48" r="40" className="stroke-current text-[#8F9779] transition-all duration-700" strokeWidth="7" fill="transparent" strokeDasharray={2 * Math.PI * 40} strokeDashoffset={2 * Math.PI * 40 * (1 - progressPercentage / 100)} />
                                  </svg>
                                  <span className="absolute text-xl font-mono font-extrabold">{progressPercentage}%</span>
                                </div>
                                <span className="text-[11px] text-[#8F9779] font-bold mt-2.5 flex items-center gap-1.5">
                                  已攻克 {completedCount} / {currentTasks.length} 核心案件
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Flights recommendations */}
                        <div className="bg-white rounded-3xl p-6 border border-[#E5E5E0] shadow-sm space-y-4">
                          <div className="flex justify-between items-center pb-2 border-b border-[#E5E5E0]">
                            <div className="flex items-center gap-2">
                              <TrendingDown className="h-4.5 w-4.5 text-[#8F9779]" />
                              <h3 className="font-bold text-[#2C2C2A] text-sm">今日航線推薦行情</h3>
                            </div>
                            <button onClick={() => setStudentTab('flight')} className="text-xs text-[#8F9779] font-bold hover:underline flex items-center cursor-pointer">
                              點擊進智慧比價監控室 →
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-[#FDFBF7] border border-[#E5E5E0] p-4 rounded-2xl flex flex-col justify-between">
                              <div>
                                <span className="text-[9px] bg-gray-200 text-gray-600 font-black px-2 py-0.5 rounded">特優低位推薦</span>
                                <h4 className="text-xl font-black text-[#2C2C2A] mt-1.5">NT$ {dashboardFlightStats.basePrice}</h4>
                                <p className="text-[10.5px] text-gray-500 mt-1 leading-relaxed">新期出航航空行情處於 30 日低點。適合手刀購入。</p>
                              </div>
                              <button onClick={() => setStudentTab('flight')} className="bg-white hover:bg-gray-50 text-gray-700 border border-[#E5E5E0] text-[11px] font-bold py-1.5 rounded-lg transition-all mt-4 w-full cursor-pointer">立即查看</button>
                            </div>
                            <div className="bg-[#FDFBF7] border border-[#E5E5E0] p-4 rounded-2xl flex flex-col justify-between">
                              <div>
                                <span className="text-[9px] bg-white text-gray-600 font-bold px-2 py-0.5 rounded border border-gray-200">小資首選廉航</span>
                                <h4 className="text-xl font-black text-[#2C2C2A] mt-1.5">NT$ {dashboardFlightStats.lowPrice}</h4>
                                <p className="text-[10.5px] text-gray-500 mt-1">{dashboardFlightStats.lowDesc}</p>
                              </div>
                              <button onClick={() => setStudentTab('flight')} className="bg-white hover:bg-gray-50 text-[#2C2C2A] border border-[#E5E5E0] text-[11px] font-bold py-1.5 rounded-lg transition-all mt-4 w-full cursor-pointer">比價航線</button>
                            </div>
                            <div className="bg-[#FDFBF7] border border-[#E5E5E0] p-4 rounded-2xl flex flex-col justify-between">
                              <div>
                                <span className="text-[9px] bg-[#8F9779]/10 text-[#8F9779] font-bold px-2 py-0.5 rounded border border-[#8F9779]/20">雙行李{dashboardFlightStats.premAirline}包裝</span>
                                <h4 className="text-xl font-black text-[#2C2C2A] mt-1.5">NT$ {dashboardFlightStats.premiumPrice}</h4>
                                <p className="text-[10.5px] text-gray-500 mt-1">{dashboardFlightStats.premDesc}</p>
                              </div>
                              <button onClick={() => setStudentTab('flight')} className="bg-white hover:bg-gray-50 text-gray-600 border border-[#E5E5E0] text-[11px] font-bold py-1.5 rounded-lg transition-all mt-4 w-full cursor-pointer">比價機票</button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Sidebar */}
                      <div className="space-y-6">
                        {/* Profile Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E5E0]">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-sm tracking-wider flex items-center gap-2">
                              <UserCheck className="w-4 h-4 text-[#8F9779]" /> 個人檔案
                            </h3>
                            <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="text-xs text-[#8F9779] hover:underline font-bold">
                              {isEditingProfile ? '取消' : '編輯'}
                            </button>
                          </div>
                          
                          <div className="space-y-4">
                            {isEditingProfile ? (
                              <div className="space-y-3">
                                <div>
                                  <label className="text-[10px] text-gray-500 font-bold uppercase">目的地國家</label>
                                  <select 
                                    className="w-full text-sm mt-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8F9779] bg-white"
                                    value={globalCountry}
                                    onChange={(e) => setGlobalCountry(e.target.value)}
                                  >
                                    <option value="Australia 澳洲">Australia 澳洲</option>
                                    <option value="Japan 日本">Japan 日本</option>
                                    <option value="Canada 加拿大">Canada 加拿大</option>
                                    <option value="USA 美國">USA 美國</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[10px] text-gray-500 font-bold uppercase">目標大學</label>
                                  <input type="text" className="w-full text-sm mt-1 p-2 border border-gray-200 rounded-lg" value={globalUniversity} onChange={(e) => setGlobalUniversity(e.target.value)} placeholder="例如：中央大學" />
                                </div>
                                <div>
                                  <label className="text-[10px] text-gray-500 font-bold uppercase">出航日期</label>
                                  <input type="date" className="w-full text-sm mt-1 p-2 border border-gray-200 rounded-lg" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} />
                                </div>
                                <button onClick={handleSaveProfile} className="w-full bg-[#8F9779] text-white text-xs font-bold py-2 rounded-lg mt-2 hover:bg-[#7A8270] transition-colors cursor-pointer">
                                  儲存變更
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                  <span className="text-xs text-gray-500">目的地</span>
                                  <span className="text-sm font-bold">{globalCountry}</span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                  <span className="text-xs text-gray-500">目標大學</span>
                                  <span className="text-sm font-bold text-right">{globalUniversity || '尚未指定'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-500">預計出發</span>
                                  <span className="text-sm font-bold text-[#8F9779]">{departureDate}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Recent Tasks Widget */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E5E0]">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-sm tracking-wider flex items-center gap-2">
                              <ClipboardCheck className="w-4 h-4 text-[#8F9779]" /> 近期待辦任務
                            </h3>
                          </div>
                          <div className="space-y-3">
                            {currentTasks.slice(0, 3).map((task) => (
                              <div key={task.id} className="flex gap-3 items-start p-3 rounded-xl bg-gray-50 border border-gray-100">
                                <div className={`mt-0.5 ${task.completed ? 'text-green-500' : 'text-gray-300'}`}>
                                  <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className={`text-xs font-bold ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.title}</p>
                                  <p className="text-[10px] text-gray-500 mt-1">{task.category}</p>
                                </div>
                              </div>
                            ))}
                            <button onClick={() => setStudentTab('visa')} className="w-full text-center text-xs text-[#8F9779] font-bold hover:underline pt-2 cursor-pointer">
                              查看完整清單與進度 →
                            </button>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {userRole === 'advisor' && (
              <AdvisorDashboard />
            )}
          </>
        )}
      </div>

      {/* Global Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#2C2C2A] text-white px-6 py-3.5 rounded-full shadow-2xl border border-white/10"
          >
            <div className="bg-[#8F9779] rounded-full p-1">
              <Check className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-wider">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Setup Modal */}
      {unauthorizedDomain && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#FDFBF7] max-w-lg w-full rounded-3xl shadow-2xl border border-[#E5E5E0] overflow-hidden">
            <div className="p-6 sm:p-8 space-y-6">
              <h3 className="text-xl font-bold font-serif text-[#2C2C2A] flex items-center gap-2">
                <BadgeAlert className="text-amber-500 h-6 w-6" /> Firebase 網域未授權
              </h3>
              <p className="text-sm text-gray-600">您目前的網域 <strong>{unauthorizedDomain}</strong> 尚未加入 Firebase 的授權清單中。</p>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setUnauthorizedDomain(null)} className="bg-white/60 hover:bg-white text-gray-600 font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-all border border-gray-200">
                  關閉
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
