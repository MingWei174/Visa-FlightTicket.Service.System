/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, MessageSquare, Bot, User, RefreshCw, ChevronRight } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

interface AIAgentProps {
  country: string;
  globalCountry?: string;
  studentName?: string;
  remainingDays?: number;
  percentage?: number;
  role?: 'student' | 'advisor';
}

export default function AIAgent({
  country,
  globalCountry,
  studentName = '留學先鋒',
  remainingDays = 42,
  percentage = 25,
  role = 'student',
}: AIAgentProps) {
  // Use globalCountry if provided, else fallback to country code mapping
  const countryNameMap: Record<string, string> = {
    AU: '澳洲', JP: '日本', CA: '加拿大', US: '美國'
  };
  const displayCountry = globalCountry
    ? globalCountry.split(' ')[0]
    : (countryNameMap[country] || country);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate welcome message whenever displayCountry changes
  useEffect(() => {
    const isAdvisor = role === 'advisor';
    setMessages([
      {
        id: 'msg_welcome_' + Date.now(),
        sender: 'agent',
        content: isAdvisor 
          ? `👋 您好！我是您的顧問政策研究 A.I. 助手。\n我已經準備好為您即時解答協助 **${studentName}** 前往 **${displayCountry}** 的相關規定與行政事務囉！\n\n💡 根據目前的學生進度看板：\n*   **目標國家：** ${displayCountry}\n*   **出國倒數：** ${remainingDays} 天\n*   **文件備齊進度：** ${percentage}%\n\n您可以隨時詢問我關於各國最新的移民局政策、學生簽證申請細節，或請我幫忙草擬溝通信件等。您需要甚麼協助呢？`
          : `👋 您好！我是您的智慧留學規劃 A.I. 顧問。\n我已經準備好為您即時解答前往 **${displayCountry}** 的留學事務囉！\n\n💡 根據目前的進度看板：\n*   **目標國家：** ${displayCountry}\n*   **出國倒數：** ${remainingDays} 天\n*   **文件備齊進度：** ${percentage}%\n\n不論是 **簽證時效逆推、在留資格 (COE) 取得、體檢程序、GIC/海外開戶、或是出境海關嚴格申報規範**，我都非常清楚。您想先了解哪一部分呢？`,
        timestamp: new Date(),
      },
    ]);
  }, [displayCountry, role, studentName, remainingDays, percentage]);

  // General suggestions (not locked to 4 countries)
  const suggestions = role === 'advisor' ? [
    { text: `如何協助 ${studentName} 準備 ${displayCountry} 的簽證？`, icon: '📋' },
    { text: `查詢 ${displayCountry} 最新的國際學生政策`, icon: '🏛️' },
    { text: `幫我草擬一封信提醒同學繳交護照`, icon: '✍️' },
  ] : [
    { text: '前往 ' + displayCountry + ' 留學的簽證申辦流程與時程？', icon: '📋' },
    { text: displayCountry + ' 當地的醫療保險制度與留學生規定？', icon: '🏥' },
    { text: '入境 ' + displayCountry + ' 的行李與海關申報注意事項？', icon: '🎒' },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleResetChat = () => {
    setMessages([
      {
        id: 'msg_reset_' + Date.now(),
        sender: 'agent',
        content: '👋 您好！偵測到您已切換目標國家至 **' + displayCountry + '**！\n\n💡 根據當前逆推追蹤資訊：\n*   **目標國家：** ' + displayCountry + '\n*   **出國倒數：** ' + remainingDays + ' 天\n*   **備文進度率：** ' + percentage + '%\n\n關於 ' + displayCountry + ' 留學相關事宜，我有最新的移民局審查指引。您可以直接點擊下方建議問題，或在對話框內自由輸入您的任何困惑喔！',
        timestamp: new Date(),
      },
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    if (!textToSend) {
      setInputValue('');
    }

    const userMsg: Message = {
      id: 'user_' + Date.now(),
      sender: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: text }],
          country: displayCountry,
          studentName,
          remainingDays,
          percentage,
        }),
      });

      if (!response.ok) {
        throw new Error('API server returned error status');
      }

      const data = await response.json();
      
      const agentMsg: Message = {
        id: 'agent_' + Date.now(),
        sender: 'agent',
        content: data.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentMsg]);

    } catch (err) {
      console.warn("Backend API unavailable, attempting frontend Gemini API fallback...");
      // @ts-ignore
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      let replyGenerated = false;

      if (apiKey) {
        try {
          const systemInstruction = `你是一位專業的留學輔導與出國規劃 AI 顧問。\n當前使用者正在規劃前往「${displayCountry}」留學。\n學生成員/姓名為：${studentName}。\n距預定出發日還有：${remainingDays} 天。\n目前倒數文件的計畫完成率已達到：${percentage}%。\n你的使命是解答日本、加拿大、美國、澳洲的「簽證時效逆推、COE取得、OSHC健康保險、GIC與就學貸款申辦、行李動植物海關申報與檢疫規範、開戶與住宿安排」等細節。\n請根據使用者提問給出專業、簡潔、具體且富有人情味的建議。必要時可用繁體中文 (zh-TW) 回覆，結構清晰並使用 markdown 格式。`;

          const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemInstruction }] },
              contents: [{ parts: [{ text: text }] }],
              generationConfig: { temperature: 0.7 }
            })
          });

          if (geminiResponse.ok) {
            const geminiData = await geminiResponse.json();
            const replyText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (replyText) {
              const agentMsg: Message = {
                id: 'agent_' + Date.now(),
                sender: 'agent',
                content: replyText,
                timestamp: new Date(),
              };
              setMessages((prev) => [...prev, agentMsg]);
              replyGenerated = true;
            }
          }
        } catch (geminiErr) {
          console.warn("Frontend Gemini API fallback failed, using static simulation:", geminiErr);
        }
      }

      if (!replyGenerated) {
        setTimeout(() => {
          var simulatedReply = '';
          if (text.includes('簽證') || text.includes('時效') || text.includes('AIT') || text.includes('指紋')) {
            simulatedReply = '💡 **關於 ' + displayCountry + ' 的簽證申請重點答詢：**\n\n1.  **辦理時程：** 建議您在出發前 45-60 天內即刻申辦。\n2.  **文件查核：** 請務必在出發前取得正式的入學許可與相關簽證資格認定文件。\n3.  **體檢注意：** 多數需持專屬體檢指引信赴官方認可之指定合規健檢醫院（如台北馬偕、台安醫院）進行篩查。\n\n如果您的 API 金鑰已設定，我能為您讀取更詳實的移民局條例。';
          } else if (text.includes('保險') || text.includes('OSHC') || text.includes('健保')) {
            simulatedReply = '🏥 **關於 ' + displayCountry + ' 醫療保險：**\n\n*   **重要法規：** 對於留學生，保險是核批學生簽證的強制性先決要件。\n*   **推薦方式：** 建議透過易安網 (einsure.com.tw) 等平台進行保險比較。\n*   **直付服務：** 部分高端保險享有簽約門診「免代墊即時直付」服務。';
          } else if (text.includes('行李') || text.includes('申報') || text.includes('檢疫') || text.includes('海關')) {
            simulatedReply = '🎒 **入境 ' + displayCountry + ' 行前入境與海關申報提示：**\n\n*   **檢疫嚴格：** 攜帶含有任何中西藥、感冒成藥，皆必須於海關單如實填載。\n*   **違禁品警告：** 新鮮水果、蛋奶製品、生鮮肉類與肉乾一律嚴格限制攜入，未申報經查獲可面臨巨額罰款！';
          } else {
            simulatedReply = '🧐 **感謝您的提問！**\n\n我推薦您可以參考我們為 **' + displayCountry + '** 留學逆推設計的核心文件倒數里程碑。\n目前您的文件計畫完成度已達 **' + percentage + '%**，還有 **' + remainingDays + ' 天** 起飛出發。\n\n*(提示：配置 GEMINI_API_KEY 環境變數，即可啟用全真 A.I. 深度諮詢)*';
          }

          const agentMsg: Message = {
            id: 'agent_' + Date.now(),
            sender: 'agent',
            content: simulatedReply,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, agentMsg]);
        }, 950);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF9F6] backdrop-blur-xl rounded-3xl p-6 border border-[#EFECE6] shadow-xl flex flex-col h-[650px] relative text-[#4A4A4A] font-serif justify-between">
      
      {/* Top Advisory Profile Header */}
      <div className="flex items-center justify-between border-b border-[#EFECE6] pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="bg-[#8F9779] p-2.5 rounded-2xl shadow-md">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[#4A4A4A]">智慧留學 Planning AI Agent</h3>
              <span className="text-[10px] bg-[#8F9779]/20 text-[#5C6551] font-bold px-1.5 py-0.5 rounded">Gemini GPT</span>
            </div>
            <p className="text-[10px] text-[#A39D93] font-mono">
              當前對焦：{displayCountry} 倒數逆推專業知識庫
            </p>
          </div>
        </div>

        <button 
          onClick={handleResetChat}
          className="text-[#A39D93] hover:text-[#5C6551] p-1.5 rounded-xl hover:bg-white/60 transition-all text-xs flex items-center gap-1 cursor-pointer"
          title="重設對話情境"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">清除歷史</span>
        </button>
      </div>

      {/* Message Stream Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 py-4 px-1 max-h-[420px]"
      >
        {messages.map(function(msg) {
          var isUser = msg.sender === 'user';
          return (
            <div 
              key={msg.id} 
              className={'flex gap-3 max-w-[85%] ' + (isUser ? 'ml-auto flex-row-reverse' : '')}
            >
              {/* Avatar */}
              <div className={'h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ' + (isUser ? 'bg-[#8F9779] text-white' : 'bg-white border border-[#EFECE6] text-[#8F9779]')}>
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Bubble Content */}
              <div className={'p-4 rounded-2xl text-[13px] leading-relaxed border ' + (isUser ? 'bg-[#5C6551] border-[#5C6551] text-white' : 'bg-white border-[#EFECE6] text-[#2C2C2A] font-medium')}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <span className="text-[8px] opacity-50 block mt-1.5 text-right font-mono">
                  {msg.timestamp.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="h-8 w-8 rounded-xl bg-white text-[#8F9779] flex items-center justify-center animate-bounce border border-[#EFECE6]">
              <Bot className="h-4 w-4" />
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#EFECE6] text-xs text-[#A39D93] flex items-center gap-2">
              <span className="animate-pulse">A.I. 專屬顧問正在為您解碼相關規範...</span>
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8F9779] animate-ping" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#8F9779] animate-ping" style={{animationDelay: '0.2s'}} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Questions Quick Chips */}
      <div className="border-t border-[#EFECE6] pt-3 mb-1">
        <p className="text-[10px] text-[#5C6551] font-bold mb-2 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          <span>常見問題指引：</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map(function(sug, idx) {
            return (
              <button
                key={idx}
                onClick={function() { handleSendMessage(sug.text); }}
                disabled={isLoading}
                className="bg-white border border-[#EFECE6] hover:border-[#8F9779]/40 hover:bg-[#F9F8F6] text-[11px] text-[#6A6A6A] hover:text-[#4A4A4A] px-3 py-1.5 rounded-xl transition-all text-left flex items-center gap-1 w-full sm:w-auto cursor-pointer"
              >
                <span>{sug.icon}</span>
                <span className="truncate">{sug.text}</span>
                <ChevronRight className="h-3 w-3 ml-auto shrink-0 opacity-50" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Standard Input Form */}
      <form 
        onSubmit={function(e) {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex gap-2.5 items-center bg-white p-1 rounded-2xl border border-[#EFECE6] shadow-sm mt-2 shrink-0 mb-1"
      >
        <div className="flex items-center gap-2 pl-3 grow min-w-0">
          <MessageSquare className="h-4 w-4 text-[#A39D93] shrink-0" />
          <input
            type="text"
            value={inputValue}
            onChange={function(e) { setInputValue(e.target.value); }}
            disabled={isLoading}
            placeholder={role === 'advisor' ? '在此詢問關於協助同學的留學政策或請 AI 草擬信件...' : '在此詢問關於前往 ' + displayCountry + ' 的任何留學申辦問題...'}
            className="bg-transparent text-xs text-[#4A4A4A] border-none outline-none focus:ring-0 w-full font-serif py-2 placeholder-[#A39D93]"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="bg-[#8F9779] hover:bg-[#7A8270] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-all focus:outline-none flex items-center justify-center shadow-sm cursor-pointer shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
      
    </div>
  );
}
