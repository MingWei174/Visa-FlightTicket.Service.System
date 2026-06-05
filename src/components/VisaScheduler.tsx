/**
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, Check, Clock, AlertTriangle, ShieldCheck, HeartHandshake, Eye, RefreshCw, Layers, Sparkles, Award, Plane, CheckCircle } from 'lucide-react';
import { Task } from '../types';

interface VisaSchedulerProps {
  tasks: Task[];
  onToggleTask: (taskId: number) => void;
  departureDate: string;
  onDepartureDateChange: (date: string) => void;
  onSetTab: (tab: 'visa'|'flight'|'oshc_loan'|'map') => void;
  country: string;
  globalCountry?: string;
  onTriggerToast?: (msg: string) => void;
}

    const countryDetails = {
  AU: {
    title: '澳洲留學出國任務逆推列表 (Subclass 500)',
    sub: 'Confirmation of Enrolment (COE) / OSHC 醫療健保雙重逆推',
    insuranceBadge: '澳洲官方 OSHC 關聯對比',
    insuranceDesc: '澳洲移民局強制要求：取得合規 OSHC 保單方可申報 Subclass 500 指派簽證！',
    flag: '🇦🇺'
  },
  JP: {
    title: '日本留學在留資格申辦時序清單 (🌸 COE)',
    sub: '在留資格認定證明書 (COE) 與 市役所住所住民登錄逆向引領',
    insuranceBadge: '日本留學商業及國保準備',
    insuranceDesc: '日本入管法規：留學前加購突發醫療保障，抵日後 14 日內申辦「國民健康保險」！',
    flag: '🇯🇵'
  },
  CA: {
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
}: VisaSchedulerProps) {
  
  const simulationDate = new Date('2026-05-22');
  const details = countryDetails[country] || countryDetails.AU;

  // Calculates exact remaining days
  const getDaysRemaining = () => {
    const dep = new Date(departureDate);
    const diffTime = dep.getTime() - simulationDate.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const daysRemaining = getDaysRemaining();

  // Computes the deadline date string
  const calculateDeadlineDate = (daysBefore: number) => {
    const dep = new Date(departureDate);
    dep.setDate(dep.getDate() - daysBefore);
    return dep.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Inspects if task is overdue based on simulation date 2026-05-22
  const checkOverdue = (daysBefore: number, completed: boolean) => {
    if (completed) return false;
    const dep = new Date(departureDate);
    dep.setDate(dep.getDate() - daysBefore);
    return simulationDate > dep;
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercentage = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="space-y-8 animate-fade-in text-[#2C2C2A] w-full">
      
      {/* Dynamic Date Customizer Card */}
      <div className="bg-[#EAE8E3]/40 backdrop-blur-md rounded-none p-6 border border-gray-200 shadow-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          <div className="space-y-1">
            <span className="text-[10px] bg-indigo-500/20 text-[#7A8B99] font-extrabold px-2.5 py-1 rounded border border-indigo-500/20 uppercase tracking-widest">
              {details.flag} {country} Destination GPS
            </span>
            <h3 className="text-base font-bold text-[#2C2C2A] mt-2">出國日期規劃控制台</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              自訂起飛日前推日曆。系統即刻重塑針對 **{details.flag} {country}** 目標城市的八大時程限期！
            </p>
          </div>

          {/* Departure Date Picker */}
          <div className="bg-white/60 p-4 rounded-none border border-gray-200 flex flex-col justify-center">
            <label className="text-[11px] font-black text-gray-600 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#8F9779]" />
              <span>預定起飛出境日</span>
            </label>
            <div className="bg-[#FDFBF7] border border-[#E5E5E0] rounded-none py-1.5 px-3 mt-2 text-xs font-mono font-bold text-gray-600 flex items-center justify-between focus-within:border-indigo-300 focus-within:ring-1 focus-within:ring-indigo-300 transition-all">
              <input 
                type="date"
                value={departureDate}
                onChange={(e) => onDepartureDateChange(e.target.value)}
                className="bg-transparent outline-none w-full cursor-pointer text-gray-800"
              />
            </div>
          </div>

          {/* High visibility Countdown sign */}
          <div className="bg-indigo-950/40 border border-gray-200 text-white p-5 rounded-none flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-300">距離登機飛往當地領土</p>
              <h4 className="text-3xl font-black text-white mt-1">
                {daysRemaining} <span className="text-base font-normal text-gray-300">天</span>
              </h4>
            </div>
            <div className="text-right">
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${daysRemaining < 30 ? 'bg-rose-600 text-white animate-pulse' : 'bg-indigo-900 text-indigo-200'}`}>
                {daysRemaining < 30 ? '時程緊迫' : '進度從容'}
              </span>
              <p className="text-[10px] text-gray-400 mt-2">{departureDate} 出發</p>
            </div>
          </div>

        </div>
      </div>

      {/* Prominent Instant Completion Feedback Banner */}
      <div className="bg-gradient-to-r from-indigo-950/80 to-indigo-900/50 border border-indigo-500/20 rounded-none p-5 shadow-xl flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-xl" />
        
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="h-11 w-11 rounded-none bg-indigo-550/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 animate-pulse text-lg font-black">
            {progressPercentage}%
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <span>勾選即時反饋：現在備文完成度已經 <strong>{progressPercentage}%</strong> 囉！</span>
              {progressPercentage === 100 && (
                <span className="text-xs bg-emerald-500/25 text-emerald-300 font-extrabold px-2 py-0.5 rounded border border-emerald-500/20">
                  完美100%全備齊 🏆
                </span>
              )}
            </h4>
            <p className="text-[11px] text-indigo-200 mt-0.5 leading-relaxed">
              當前已完成的關鍵保障案件： <strong className="text-white font-mono font-bold">{completedCount} / {tasks.length}</strong> 項核心關閘。出發前確保 100% 完成率。
            </p>
          </div>
        </div>

        {/* Big Neon Progress bar wrapper */}
        <div className="w-full sm:w-1/3 space-y-1 relative z-10 shrink-0">
          <div className="flex justify-between text-[10px] font-bold text-gray-600">
            <span>REAL-TIME TRACKING</span>
            <span className="text-[#7A8B99] font-mono">{progressPercentage}%</span>
          </div>
          
          <div className="w-full bg-white/60 h-3.5 rounded-full overflow-hidden border border-gray-200 p-0.5">
            <div 
              className="bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 h-full rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(129,140,248,0.5)]"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Interactive task checklist and sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Tasks Loop (2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-xs font-black text-gray-500 tracking-wider uppercase flex items-center gap-2">
              <span>{details.title}</span>
              <span className="bg-indigo-500/10 text-[#7A8B99] text-[10px] lowercase px-2 py-0.5 rounded block">時序排列</span>
            </h3>
            <span className="text-[11px] text-slate-450 text-gray-500 hidden sm:inline">🌟 勾選任意排卡立即重算進度趴數</span>
          </div>

          <div className="space-y-4">
            {tasks.map((task) => {
              const overdue = checkOverdue(task.daysBefore, task.completed);
              
              return (
                <div
                  key={task.id}
                  onClick={() => onToggleTask(task.id)}
                  className={`bg-[#EAE8E3]/40 backdrop-blur-md rounded-none p-5 border transition-all cursor-pointer group relative overflow-hidden ${
                    task.completed
                      ? 'border-gray-100 bg-white/60 opacity-55'
                      : overdue
                        ? 'border-rose-500/45 shadow-sm bg-rose-500/5 hover:border-rose-500 hover:shadow-lg'
                        : 'border-gray-200 hover:border-indigo-400 hover:shadow-lg'
                  }`}
                >
                  {/* Overdue alert badge */}
                  {overdue && (
                    <div className="absolute right-0 top-0 bg-rose-600 text-[#2C2C2A] text-[9px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 animate-pulse">
                      <AlertTriangle className="h-3 w-3" /> 已逾期，請火速補辦！
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    {/* Checkbox circle button */}
                    <div className="mt-1 shrink-0">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                        task.completed
                          ? 'bg-emerald-500 border-emerald-500 text-[#2C2C2A]'
                          : overdue
                            ? 'border-rose-450 group-hover:border-rose-500'
                            : 'border-white/30 group-hover:border-indigo-400'
                      }`}>
                        {task.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Task description texts */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap text-[11px]">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          task.category === '簽證文件' 
                            ? 'bg-indigo-400/20 text-[#7A8B99] border border-indigo-500/10' 
                            : 'bg-white/80 text-slate-350 text-gray-600 border border-gray-100'
                        }`}>
                          {task.category}
                        </span>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          task.importance === '最高' 
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/10' 
                            : task.importance === '高' 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/10' 
                              : 'bg-white/80 text-gray-500 border border-gray-100'
                        }`}>
                          重要：{task.importance}
                        </span>

                        <span className="text-gray-500">• 出發前 {task.daysBefore} 天前備辦</span>
                      </div>

                      <h4 className={`text-base font-bold ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {task.title}
                      </h4>

                      <p className="text-xs text-gray-600 leading-relaxed pt-1">
                        {task.desc}
                      </p>

                      <div className="pt-3 flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-100 mt-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-gray-500" />
                          截止申報目標：
                          <strong className={overdue ? 'text-rose-400 font-bold' : 'text-[#7A8B99] font-medium'}>
                            {calculateDeadlineDate(task.daysBefore)}
                          </strong>
                        </span>

                        <span className="text-[10px] text-[#7A8B99] opacity-0 group-hover:opacity-100 transition-opacity">
                          {task.completed ? '點擊重設狀態' : '點擊標記辦妥'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side Info & Service details (1 column) */}
        <div className="space-y-6">
          
          {/* Completion summary box */}
          <div className="bg-[#EAE8E3]/40 backdrop-blur-md rounded-none p-6 border border-gray-200 shadow-lg space-y-4">
            <h3 className="font-bold text-sm text-[#7A8B99]">出國合規度進程儀表板</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              日本、加拿大、美國和澳洲政府對防偽、生物安全指紋和高額保證金有嚴格准入。請隨時確保辦理率達 100%！
            </p>

            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs">
                <span>任務完成率</span>
                <span className="font-extrabold text-[#8F9779] text-sm">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-white/60 h-3 rounded-full overflow-hidden border border-gray-100">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center pt-2">
              <div className="bg-white/60 p-2.5 rounded-none border border-gray-100">
                <p className="text-[10px] text-gray-500 text-center">已完成項目</p>
                <p className="text-base font-bold text-emerald-400 mt-1">{completedCount} 項</p>
              </div>
              <div className="bg-white/60 p-2.5 rounded-none border border-gray-100">
                <p className="text-[10px] text-gray-500 text-center">待突破項目</p>
                <p className="text-base font-bold text-[#7A8B99] mt-1">{tasks.length - completedCount} 項</p>
              </div>
            </div>
            
            <div className="bg-white/60 p-3 rounded-none border border-dashed border-gray-200 text-[10px] text-gray-500 leading-relaxed">
              <span className="text-indigo-305 text-[#7A8B99]">💡 系統監控：</span>
              您目前已解碼了 {completedCount} 個限期閘口，備文效率平均提升 3-5 倍，防止決策癱瘓。
            </div>
          </div>

          {/* Special country contextual insurance card */}
          <div className="bg-gradient-to-br from-indigo-550/10 to-emerald-550/5 backdrop-blur-md border border-indigo-500/20 rounded-none p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-500/20 text-[#7A8B99] rounded-none">
                <HeartHandshake className="h-4.5 w-4.5" />
              </div>
              <span className="text-xs font-black text-[#7A8B99]">{details.insuranceBadge}</span>
            </div>

            <h4 className="font-bold text-[#2C2C2A] text-sm">{details.insuranceBadge} 機制聲明</h4>
            <p className="text-xs text-slate-350 text-gray-600 leading-relaxed">
              {details.insuranceDesc}
            </p>

            <div className="bg-white/60 rounded-none p-4 border border-gray-200 shadow-sm space-y-2">
              <p className="text-[10.5px] text-gray-500 leading-relaxed">
                一鍵智慧對比國際最頂特選的學生保險與就學信專案，防止入境卡關。
              </p>
              
              <button
                onClick={() => onSetTab('oshc')}
                className="w-full bg-indigo-650 hover:bg-[#60707c] bg-[#7A8B99] text-[#2C2C2A] text-[11px] font-bold py-2 rounded-none transition-all shadow-md flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" /> 查看保險與就學融資
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
