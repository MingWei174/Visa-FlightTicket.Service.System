import React, { useState } from 'react';
import { Award, ShieldCheck, DollarSign, ChevronRight, BadgeCheck, Building, ExternalLink } from 'lucide-react';
import { loanOptions } from '../data';

interface LoanAndOshcProps {
  globalCountry?: string;
  onTriggerToast?: (msg: string) => void;
  onCompleteOshcTask: () => void;
  isOshcCompleted: boolean;
}

export default function LoanAndOshc({ globalCountry = 'Australia', onTriggerToast, onCompleteOshcTask, isOshcCompleted }: LoanAndOshcProps) {
  const rawCountry = globalCountry.split(' ')[0] || 'Australia';
  const [activeTab, setActiveTab] = useState<'insurance' | 'loan'>('insurance');
  const [selectedDuration, setSelectedDuration] = useState(12);

  const officialGateway = rawCountry + ' 政府認可「海外學生專屬醫療與健康保險」精準比價';

  const insuranceOptions = [
    {
      id: 'ewan',
      name: '易安網 einsure',
      tag: '官方推薦',
      description: '台灣最大留學保險比價平台，一站式搞定海外留學生醫療險、意外險、旅平險。',
      url: 'https://www.einsure.com.tw/product/travel/',
      features: [
        '多家保險公司即時比價',
        '符合各國簽證需求',
        '線上投保即時出單',
        '中文客服即時回應',
        '理賠協助服務'
      ],
      logoColor: 'text-[#8F9779]'
    },
    {
      id: 'fubon',
      name: '富邦產險 留學生專案',
      tag: '高保障',
      description: '針對海外留學生設計的全方位保障計畫，涵蓋醫療、意外、行李遺失等。',
      url: 'https://www.fubon.com/',
      features: [
        '海外突發疾病醫療',
        '海外緊急救援服務',
        '行李延誤/遺失理賠',
        '第三人責任險'
      ],
      logoColor: 'text-blue-600'
    }
  ];

  const handleGoToInsurance = (url: string, name: string) => {
    window.open(url, '_blank');
    if (onTriggerToast) {
      onTriggerToast('已為您開啟 ' + name + ' 保險平台頁面！');
    }
  };

  const insuranceTabClass = activeTab === 'insurance'
    ? 'bg-[#5C6551] text-white shadow-md'
    : 'bg-white text-[#A39D93] border border-[#EFECE6]';
  const loanTabClass = activeTab === 'loan'
    ? 'bg-[#5C6551] text-white shadow-md'
    : 'bg-white text-[#A39D93] border border-[#EFECE6]';

  return (
    <div className="bg-[#FAF9F6] min-h-full p-6 md:p-10 font-serif text-[#4A4A4A]">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#EFECE6] pb-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-wider text-[#5C6551]">Atlas. 留學保險與財務</h1>
            <p className="text-[#A39D93] tracking-widest text-sm">一站式辦理前往 {rawCountry} 的健康保險與留學貸款</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('insurance')}
              className={'px-6 py-2 rounded-xl text-sm font-bold tracking-widest transition-all ' + insuranceTabClass}
            >
              健康保險
            </button>
            <button
              onClick={() => setActiveTab('loan')}
              className={'px-6 py-2 rounded-xl text-sm font-bold tracking-widest transition-all ' + loanTabClass}
            >
              留學貸款
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'insurance' ? (
          <div className="space-y-8">
            {/* Banner */}
            <div className="bg-white rounded-3xl p-8 border border-[#EFECE6] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-[#F9F8F6] p-4 rounded-2xl">
                  <ShieldCheck className="h-8 w-8 text-[#8F9779]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#4A4A4A] mb-1">{officialGateway}</h2>
                  <p className="text-[#A39D93] text-sm">建議透過以下平台選擇最適合前往 {rawCountry} 的留學保險方案</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#A39D93]">預計留學</span>
                <select 
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(Number(e.target.value))}
                  className="bg-[#F9F8F6] border border-[#EFECE6] rounded-xl px-4 py-2 font-bold text-[#5C6551] focus:outline-none focus:ring-2 focus:ring-[#8F9779]"
                >
                  <option value={6}>6 個月</option>
                  <option value={12}>12 個月</option>
                  <option value={24}>24 個月</option>
                </select>
              </div>
            </div>

            {/* Insurance Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {insuranceOptions.map(function(ins) {
                return (
                  <div key={ins.id} className="bg-white rounded-3xl p-8 border border-[#EFECE6] hover:border-[#D6D2C4] hover:shadow-md transition-all relative">
                    <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-[#5C6551] text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest shadow-sm">
                      {ins.tag}
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[#EFECE6]">
                      <Building className={'h-10 w-10 ' + ins.logoColor} />
                      <div>
                        <h3 className="text-xl font-bold text-[#4A4A4A]">{ins.name}</h3>
                        <p className="text-[#A39D93] text-xs tracking-widest">適用於 {rawCountry} 留學保險</p>
                      </div>
                    </div>

                    <p className="text-[#6A6A6A] text-sm mb-6 leading-relaxed">{ins.description}</p>

                    <div className="space-y-3 mb-8">
                      {ins.features.map(function(f, i) {
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <BadgeCheck className="h-5 w-5 text-[#8F9779] shrink-0" />
                            <span className="text-[#6A6A6A] font-medium text-sm">{f}</span>
                          </div>
                        );
                      })}
                    </div>

                    <button 
                      onClick={function() { handleGoToInsurance(ins.url, ins.name); }}
                      className="w-full py-3 bg-[#8F9779] hover:bg-[#7A8270] text-white rounded-xl font-bold tracking-widest transition-colors flex items-center justify-center gap-2"
                    >
                      <span>前往 {ins.name} 官網投保</span>
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Completed Marker */}
            {isOshcCompleted && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                <p className="text-green-700 font-bold tracking-widest">✅ 您已完成保險投保步驟</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
             <div className="bg-white rounded-3xl p-8 border border-[#EFECE6] shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-[#F9F8F6] p-4 rounded-2xl">
                  <DollarSign className="h-8 w-8 text-[#8F9779]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#4A4A4A] mb-1">教育部青年留學免息貸款</h2>
                  <p className="text-[#A39D93] text-sm">提供給前往 {rawCountry} 攻讀碩博士之學生，前五年免息優惠。</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {loanOptions.map(function(l) {
                return (
                  <div key={l.id} className="bg-white rounded-3xl p-8 border border-[#EFECE6] hover:border-[#D6D2C4] hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#F3F0E9] p-3 rounded-xl">
                          <Award className="h-6 w-6 text-[#5C6551]" />
                        </div>
                        <h3 className="text-xl font-bold text-[#4A4A4A]">{l.bankName}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-[#5C6551]">{l.interestRate}</div>
                        <div className="text-[10px] text-[#A39D93] uppercase tracking-widest">目前利率</div>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-[#A39D93] text-sm">最高額度</span>
                        <span className="font-bold text-[#4A4A4A]">{l.maxAmount}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-[#A39D93] text-sm">寬限期</span>
                        <span className="font-bold text-[#4A4A4A]">{l.gracePeriod}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-[#A39D93] text-sm">申請條件</span>
                        <span className="font-bold text-[#4A4A4A] text-right max-w-[200px] truncate" title={l.eligibility}>{l.eligibility}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleGoToInsurance(l.url, l.bankName)}
                      className="w-full py-3 bg-[#F9F8F6] hover:bg-[#EFECE6] text-[#5C6551] rounded-xl font-bold tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>前往銀行官網申請</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
