import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Plane, ShieldCheck, GraduationCap, BookOpen, Users } from 'lucide-react';

interface AboutPageProps {
  onStart: () => void;
  isFirstTime?: boolean;
}

export default function AboutPage({ onStart, isFirstTime = true }: AboutPageProps) {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  var containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 }
    }
  };

  var textVariants = {
    hidden: { y: 30, opacity: 0, filter: 'blur(10px)' },
    visible: { y: 0, opacity: 1, filter: 'blur(0px)', transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }
  };

  var lineVariants = {
    hidden: { height: 0 },
    visible: { height: 64, transition: { duration: 1.5, delay: 2, ease: "easeInOut" } }
  };

  var bgClass = isFirstTime
    ? 'fixed inset-0 z-50 bg-[#FDFBF7] overflow-y-auto pt-24'
    : 'min-h-[80vh] bg-transparent';

  var features = [
    {
      icon: Globe,
      title: 'Global University Explorer',
      subtitle: '全球大學探索',
      desc: '透過 3D 互動地球儀，探索世界 40+ 個國家的頂尖大學。點擊任一國家即可深入查看當地名校資訊、維基百科簡介與校園照片，不再受四國限制。'
    },
    {
      icon: Plane,
      title: 'Smart Flight Tracker',
      subtitle: '智慧航班追蹤',
      desc: '即時比價六大航空公司的跨國航班，提供座位寬度、行李額度、機上餐飲等完整細節。設定票價提醒，在最佳時機購入您的留學機票。'
    },
    {
      icon: ShieldCheck,
      title: 'Insurance & Finance',
      subtitle: '保險與就學融資',
      desc: '整合易安網等官方保險比價平台，依據您的目的地國家自動推薦最適保險方案。同時提供教育部青年留學貸款資訊，減輕財務壓力。'
    },
    {
      icon: GraduationCap,
      title: 'Visa Countdown Engine',
      subtitle: '簽證倒數引擎',
      desc: '精準計算從入學許可到出發日的每一個關鍵里程碑：體檢、財力證明、簽證申請、機票購買，逆推時程確保您不錯過任何截止日期。'
    },
    {
      icon: BookOpen,
      title: 'AI Study Advisor',
      subtitle: 'AI 智慧留學顧問',
      desc: '搭載 Gemini GPT 的智慧留學顧問，可即時解答簽證法規、海關申報、醫療保險等專業問題，並根據您的進度提供客製化建議。'
    },
    {
      icon: Users,
      title: 'Advisor Dashboard',
      subtitle: '顧問管理後台',
      desc: '專為教育顧問設計的學生管理後台，可追蹤每位學生的文件進度、發送 Gmail 通知、AI 智慧起草信件，全方位掌控留學申辦流程。'
    }
  ];

  return (
    <div className={'w-full flex flex-col items-center justify-start p-6 ' + bgClass}>
      <motion.div
        className="max-w-5xl w-full mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <div className="text-center mb-24 space-y-8">
          <motion.div variants={textVariants} className="font-serif italic text-[#A39D93] text-lg tracking-[0.3em] uppercase">
            Atlas. Manifesto
          </motion.div>

          <motion.h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-[#2C2C2A] leading-[1.2] tracking-tight max-w-4xl mx-auto">
            <motion.span variants={textVariants} className="block">
              一站式留學規劃平台，
            </motion.span>
            <motion.span variants={textVariants} className="block italic text-[#A39D93] font-light mt-3 text-3xl md:text-5xl lg:text-6xl">
              從選校到起飛，
            </motion.span>
            <motion.span variants={textVariants} className="block mt-3">
              為您打理每一個細節。
            </motion.span>
          </motion.h1>

          <motion.p variants={textVariants} className="text-base text-[#6A6A6A] max-w-2xl mx-auto leading-loose tracking-wide mt-12 font-serif">
            Atlas. 致力於打造透明且零死角的海外求學準備平台。我們整合了全球大學資料庫、即時航班比價系統、留學保險比較、簽證時程逆推引擎，以及搭載 AI 的智慧留學顧問。打破資訊不對稱，讓每一位學生都能從容且自信地踏上留學之旅。
          </motion.p>
        </div>

        {/* Philosophy Pillars */}
        <div className="grid md:grid-cols-2 gap-16 mb-24 max-w-4xl mx-auto">
          <motion.div variants={textVariants}>
            <div className="h-full border-l-[1.5px] border-[#2C2C2A] pl-8 py-4">
              <h3 className="text-2xl font-serif text-[#2C2C2A] mb-4 tracking-wide">Precision in process.</h3>
              <p className="text-sm text-[#6A6A6A] leading-loose font-serif">
                從取得海外學校入學許可到提交簽證，Atlas 精準倒數每個時程節點。體檢預約、財力證明、保險投保、機票購買——我們將數十個繁瑣環節梳理成清晰的里程碑時間軸，確保您的出國進度完美無瑕。我們相信，每個細節都值得被嚴格對待。
              </p>
            </div>
          </motion.div>

          <motion.div variants={textVariants}>
            <div className="h-full border-l-[1.5px] border-[#2C2C2A] pl-8 py-4">
              <h3 className="text-2xl font-serif text-[#2C2C2A] mb-4 tracking-wide">Unbounded horizons.</h3>
              <p className="text-sm text-[#6A6A6A] leading-loose font-serif">
                不侷限於特定國家，您將透過互動式 3D 地球模型探索世界各大名校與中央大學合作姊妹校。系統會即時抓取各國大學的維基百科簡介與圖片，並動態計算對應的航班、保險與簽證需求。您的未來不該受到任何疆域限制。
              </p>
            </div>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <motion.div variants={textVariants} className="mb-24">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl text-[#2C2C2A] tracking-wide mb-3">Core Features</h2>
            <p className="text-[#A39D93] text-sm tracking-widest uppercase font-serif">六大核心功能一覽</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(function (feat, idx) {
              var IconComp = feat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx + 1.5 }}
                  className="bg-white border border-[#EFECE6] rounded-2xl p-8 hover:shadow-lg hover:border-[#D6D2C4] transition-all group"
                >
                  <div className="bg-[#F9F8F6] p-3 rounded-xl w-fit mb-5 group-hover:bg-[#8F9779]/10 transition-colors">
                    <IconComp className="h-6 w-6 text-[#8F9779]" />
                  </div>
                  <h4 className="font-serif text-lg text-[#2C2C2A] mb-1 tracking-wide">{feat.title}</h4>
                  <p className="text-xs text-[#A39D93] tracking-widest uppercase mb-4 font-serif">{feat.subtitle}</p>
                  <p className="text-sm text-[#6A6A6A] leading-relaxed font-serif">{feat.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Team & Credits */}
        <motion.div variants={textVariants} className="text-center mb-16">
          <div className="border-t border-[#EFECE6] pt-12 max-w-2xl mx-auto">
            <p className="text-[#A39D93] text-xs tracking-[0.3em] uppercase mb-4 font-serif">Crafted by</p>
            <h3 className="font-serif text-xl text-[#2C2C2A] mb-2">中央大學資管系 期末專題</h3>
            <p className="text-sm text-[#6A6A6A] font-serif">張茗崴 (113403547) & 張子衡 (113403062)</p>
            <p className="text-xs text-[#A39D93] mt-2 font-serif">Atlas. — Study Abroad Ticket & Student Visa Service System</p>
          </div>
        </motion.div>

        {/* CTA Button */}
        <div className="text-center pb-24 flex flex-col items-center">
          <motion.p variants={textVariants} className="font-serif italic text-[#A39D93] mb-8 tracking-widest">Begin Your Journey</motion.p>
          <motion.div variants={lineVariants} className="w-[1.5px] bg-[#2C2C2A]/20 mb-12"></motion.div>

          <AnimatePresence>
            {showButton && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                onClick={onStart}
                className="group relative inline-flex items-center gap-4 text-[#2C2C2A] font-serif tracking-[0.2em] text-sm px-12 py-4 border border-[#2C2C2A] hover:bg-[#2C2C2A] hover:text-white transition-colors duration-500"
              >
                <span className="uppercase">{isFirstTime ? 'Start Planning Journey' : 'Return to Hub'}</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
