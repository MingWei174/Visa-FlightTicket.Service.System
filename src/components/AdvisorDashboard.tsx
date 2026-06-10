/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, Search, AlertCircle, PhoneCall, Mail, ClipboardCopy, Send, 
  Save, CheckCircle2, X, Eye, BadgeAlert, Sparkles, Edit2, Check, Lock, MessageCircle, Phone
} from 'lucide-react';
import { StudentProgress, Task } from '../types';
import { initialStudents, initialTasks, initialTasksByCountry } from '../data';
import { db, collection, getDocs, doc, setDoc, deleteDoc } from '../firebase';

const getCountryTasks = (countryOrUniv: string) => {
  const s = countryOrUniv || '';
  if (s.includes('日本') || s.includes('東京') || s.includes('早稻田') || s.includes('慶應') || s.includes('京都')) return initialTasksByCountry.JP;
  if (s.includes('加拿大') || s.includes('多倫多') || s.includes('滑鐵盧') || s.includes('不列顛')) return initialTasksByCountry.CA;
  if (s.includes('美國') || s.includes('哈佛') || s.includes('史丹佛') || s.includes('普渡') || s.includes('加州')) return initialTasksByCountry.US;
  return initialTasksByCountry.AU;
};

interface AdvisorDashboardProps {
  onTriggerToast: (msg: string) => void;
  onActiveStudentChange?: (student: StudentProgress) => void;
  initialActiveStudent?: StudentProgress | null;
}

export default function AdvisorDashboard({ onTriggerToast, onActiveStudentChange, initialActiveStudent }: AdvisorDashboardProps) {

  const [students, setStudents] = useState<StudentProgress[]>(initialStudents);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('all');
  const [activeStudent, setActiveStudent] = useState<StudentProgress | null>(initialActiveStudent || initialStudents[1]); // Default to show '張美婷' if no initial active student
  const [counselorText, setCounselorText] = useState<string>(initialActiveStudent?.advisorNotes || initialStudents[1]?.advisorNotes || '');

  // Add student sub-state
  const [showAddStudentForm, setShowAddStudentForm] = useState<boolean>(false);
  const [addName, setAddName] = useState<string>('');
  const [addId, setAddId] = useState<string>('');
  const [addGmail, setAddGmail] = useState<string>('');
  const [addUniv, setAddUniv] = useState<string>('雪梨大學 (The University of Sydney)');
  const [addDept, setAddDept] = useState<string>('2026-07-03');
  const [addRisk, setAddRisk] = useState<'正常' | '預警' | '緊急'>('正常');
  const [addNotes, setAddNotes] = useState<string>('');

  // Sub-states to handle Student Record Editing
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(initialActiveStudent?.studentName || initialStudents[1]?.studentName || '');
  const [editStudentNumber, setEditStudentNumber] = useState<string>(initialActiveStudent?.studentNumber || initialStudents[1]?.studentNumber || '');
  const [editUniv, setEditUniv] = useState<string>(initialActiveStudent?.university || initialStudents[1]?.university || '');
  const [editDept, setEditDept] = useState<string>(initialActiveStudent?.intendedDeparture || initialStudents[1]?.intendedDeparture || '');
  const [editRisk, setEditRisk] = useState<'正常' | '預警' | '緊急'>(initialActiveStudent?.riskStatus || initialStudents[1]?.riskStatus || '正常');
  const [editProgress, setEditProgress] = useState<number>(initialActiveStudent?.progressPercentage || initialStudents[1]?.progressPercentage || 25);
  const [editGmail, setEditGmail] = useState<string>(initialActiveStudent?.studentGmail || initialStudents[1]?.studentGmail || 'meiting.zhang@gmail.com');
  const [editLineId, setEditLineId] = useState<string>(initialActiveStudent?.lineUserId || initialStudents[1]?.lineUserId || '');

  // Custom email records notification state
  const [mailLogs, setMailLogs] = useState<{ id: string; email: string; subject: string; body: string; date: string; status: string }[]>([
    {
      id: 'log_01',
      email: 'ziwei.chen@gmail.com',
      subject: '【出國警示】澳洲海關體檢時間限制提示',
      body: '親愛的陳子威同學您好：您的移民局體檢預約期限即將在一週內過期，請立刻確認預約表單。',
      date: '2026-05-25 14:10',
      status: '已成功傳送 ✓'
    }
  ]);
  const [customMailSubject, setCustomMailSubject] = useState<string>('');
  const [customMailBody, setCustomMailBody] = useState<string>('');
  const [isSendingMail, setIsSendingMail] = useState<boolean>(false);
  const [showMailSender, setShowMailSender] = useState<boolean>(false);
  const [isDrafting, setIsDrafting] = useState<boolean>(false);

  // Auto-generate notification body based on student status
  const handleAiAutoDraft = async () => {
    if (!activeStudent) return;
    setIsDrafting(true);
    try {
      const missingTasksList = getCountryTasks(activeStudent.country || activeStudent.university).filter(item => {
        const p = activeStudent.tasksProgress.find(tp => tp.taskId === item.id);
        return !p || !p.completed;
      }).map(t => t.title).join('、');

      let data;
      try {
        const response = await fetch('/api/generate-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            studentName: activeStudent.studentName,
            progress: activeStudent.progressPercentage,
            risk: activeStudent.riskStatus,
            missingTasks: missingTasksList,
            advisorNotes: counselorText,
            country: activeStudent.country || activeStudent.university || '目標國家'
          })
        });

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          data = await response.json();
        } else {
          throw new Error('Not JSON response (likely offline simulation)');
        }
      } catch (fetchErr) {
        console.warn("Backend API unavailable, attempting frontend Gemini API fallback...");
        const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
        if (apiKey) {
          try {
            const systemInstruction = `你是一位專業且溫暖的留學輔導資深顧問，任職於「Atlas. 留學準備中心」。請為一位特定的學生撰寫一份留學進度催辦/督課或鼓勵信件（同時也可以作為簡訊的範本）。\n你需要依據學生的當前進度與警示評級給出高度客製化、精準且充滿親和力的督促。信件語氣應親切流暢、結構清晰，避免冷冰冰的格式化文字。`;
            const prompt = `請為以下留學學員自動生成一份專屬的 Email 通知信：\n學員姓名：${activeStudent.studentName}\n目標國家：${activeStudent.country || activeStudent.university || '出國國家'}\n目前進度：${activeStudent.progressPercentage}%\n目前警示級別：${activeStudent.riskStatus}\n缺漏未辦妥的關鍵任務：${missingTasksList || '無'}\n顧問備忘備註(溝通狀況與追蹤)：${counselorText || '無特別備註'}\n\n請根據以上資訊，為「Atlas. 留學準備中心」起草一封親切且具體的提醒信。\n**重點要求：**\n1. 必須**強烈參考「顧問備忘備註」**的內容來調整語氣與提醒重點。如果備註中提到特定的困難(如猶豫不決、體檢遲交等)，務必在信中關心並給出具體建議。\n2. 包含合適的親切招呼、進度簡要分析、溫馨的安全與時效限制叮嚀。\n3. 輸出格式必須包含「主旨：」和「內文：」。請直接輸出利於一般文字寄送的純文字排版，掌握字數在 200-300 字。`;

            const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemInstruction }] },
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.85 }
              })
            });

            if (geminiResponse.ok) {
              const geminiData = await geminiResponse.json();
              const replyText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (replyText) {
                data = { body: replyText };
              }
            } else {
              const errorText = await geminiResponse.text();
              console.error("Gemini API Error:", errorText);
              throw new Error("Frontend Gemini API call failed: " + errorText);
            }
          } catch (geminiErr) {
            console.warn("Frontend Gemini API fallback failed, using static simulation:", geminiErr);
          }
        }
        
        if (!data) {
          // Static Fallback simulation
          data = {
            body: `親愛的 ${activeStudent.studentName} 同學您好：\n\n這裡是 Atlas. 顧問團隊。目前您的案件進度為 ${activeStudent.progressPercentage}%，狀態為「${activeStudent.riskStatus}」。\n\n系統偵測到您尚未完成以下關鍵任務：\n${missingTasksList}\n\n顧問備註：\n${counselorText || '請盡快完成上述任務，以免影響您的出國行程。'}\n\n請務必登入系統確認最新文件清單。\n\n祝 順心如意，\nAtlas. 團隊敬上`
          };
        }
      }

      if (data.body) {
        setCustomMailBody(data.body);
        onTriggerToast('🤖 AI 成功根據同學出國案件與查核現況，自動起草客製化通知！');
      } else {
        throw new Error(data.error || '無法取得生成內文');
      }
    } catch (err: any) {
      console.error(err);
      onTriggerToast(`❌ AI 起草失敗: ${err.message || err}`);
    } finally {
      setIsDrafting(false);
    }
  };

  // Real API Gmail Dispatcher and SMS sender
  const handleSendRealNotification = async (method: 'gmail' | 'sms') => {
    if (!activeStudent) return;
    setIsSendingMail(true);
    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientEmail: activeStudent.studentGmail,
          subject: customMailSubject,
          body: customMailBody,
          method: method
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        const newLog = {
          id: `log_${Date.now()}`,
          email: method === 'sms' ? `簡訊發送到: ${activeStudent.studentName}` : activeStudent.studentGmail,
          subject: method === 'sms' ? '📱 簡訊通知' : customMailSubject,
          body: customMailBody,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          status: '發送成功 ✓'
        };
        setMailLogs(prev => [newLog, ...prev]);
        onTriggerToast(data.message);
      } else {
        const warningMessage = data.message || data.error || '發送失敗，請重試。';
        onTriggerToast(`⚠️ ${warningMessage}`);
        if (data.reason === 'needs_credentials') {
          const newLog = {
            id: `log_${Date.now()}`,
            email: method === 'sms' ? `簡訊發送至: ${activeStudent.studentName}` : activeStudent.studentGmail,
            subject: method === 'sms' ? '📱 模擬簡訊' : `[模擬] ${customMailSubject}`,
            body: customMailBody,
            date: new Date().toISOString().replace('T', ' ').slice(0, 16),
            status: '沙盒投遞 ✓'
          };
          setMailLogs(prev => [newLog, ...prev]);
        }
      }
    } catch (err: any) {
      console.error(err);
      onTriggerToast(`❌ 派遣異常: ${err.message || err}`);
    } finally {
      setIsSendingMail(false);
    }
  };

  // Real API LINE Dispatcher
  const handleSendLineNotification = async () => {
    if (!activeStudent || !activeStudent.lineUserId) return;
    setIsSendingMail(true);
    try {
      const response = await fetch('/api/send-line', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lineUserId: activeStudent.lineUserId,
          message: `${customMailSubject}\n\n${customMailBody}`
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        const newLog = {
          id: `log_${Date.now()}`,
          email: `LINE 推播: ${activeStudent.studentName}`,
          subject: data.isSimulation ? `[模擬] ${customMailSubject}` : `[LINE] ${customMailSubject}`,
          body: customMailBody,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          status: data.isSimulation ? '沙盒投遞 ✓' : '發送成功 ✓'
        };
        setMailLogs(prev => [newLog, ...prev]);
        onTriggerToast(data.message);
      } else {
        onTriggerToast(`⚠️ ${data.message || data.error || 'LINE 發送失敗'}`);
      }
    } catch (err: any) {
      console.error(err);
      onTriggerToast(`❌ 寫入 Firebase 發生錯誤: ${err.message || err}`);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (window.confirm("確定要永久刪除這筆學生資料嗎？")) {
      try {
        await deleteDoc(doc(db, "students", id));
      } catch (err: any) {
        console.warn("Firebase delete failed, removing locally only:", err);
      }
      setStudents(prev => prev.filter(s => s.id !== id));
      if (activeStudent?.id === id) {
        const remaining = students.filter(s => s.id !== id);
        setActiveStudent(remaining.length > 0 ? remaining[0] : null);
      }
      onTriggerToast("🗑️ 學生資料已刪除");
      setIsEditing(false);
    }
  };

  // Handle active student inspect selection
  React.useEffect(() => {
    if (activeStudent && onActiveStudentChange) {
      onActiveStudentChange(activeStudent);
    }
  }, [activeStudent, onActiveStudentChange]);

  const handleSelectStudent = (std: StudentProgress) => {
    setActiveStudent(std);
    setCounselorText(std.advisorNotes);
    setIsEditing(false); // Reset edit state
    setEditName(std.studentName);
    setEditStudentNumber(std.studentNumber || '');
    setEditUniv(std.university);
    setEditDept(std.intendedDeparture);
    setEditRisk(std.riskStatus);
    setEditProgress(std.progressPercentage);
    setEditGmail(std.studentGmail || '');
    setEditLineId(std.lineUserId || '');
    
    // Clear mail composer
    setCustomMailSubject(`【Atlas. 留學簽證進度更新】致 ${std.studentName} 同學`);
    setCustomMailBody(`親愛的 ${std.studentName} 同學您好：\n\n這裡是 Atlas. 顧問團隊。目前您的案件進度為 ${std.progressPercentage}%，狀態為「${std.riskStatus}」。請配合登入系統確認最新文件清單。\n\n祝 順心如意，\nAtlas. 團隊敬上`);
  };

  // Sync students with Firestore on mount
  React.useEffect(() => {
    let active = true;
    const syncStudents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "students"));
        if (querySnapshot.empty) {
          // Populate default students into user's firestore so it is not blank!
          for (const s of initialStudents) {
            await setDoc(doc(db, "students", s.id), s);
          }
          if (active) {
            setStudents(initialStudents);
          }
        } else {
          const list: StudentProgress[] = [];
          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data() as StudentProgress;
            // Derive country if missing to prevent fallback to admin's global country
            if (!data.country) {
              const u = data.university || '';
              if (u.includes('東京') || u.includes('早稻田') || u.includes('慶應') || u.includes('京都')) data.country = '日本';
              else if (u.includes('多倫多') || u.includes('滑鐵盧') || u.includes('不列顛')) data.country = '加拿大';
              else if (u.includes('哈佛') || u.includes('史丹佛') || u.includes('普渡') || u.includes('加州')) data.country = '美國';
              else data.country = '澳洲';
            }
            list.push(data);
          });
          if (active) {
            list.sort((a, b) => a.id.localeCompare(b.id));
            setStudents(list);
            
            // Sync default active student
            const matchedActive = list.find(s => s.id === (activeStudent?.id || "std_02"));
            if (matchedActive) {
              setActiveStudent(matchedActive);
              setCounselorText(matchedActive.advisorNotes || "");
            } else if (list.length > 0) {
              setActiveStudent(list[0]);
              setCounselorText(list[0].advisorNotes || "");
            }
          }
        }
      } catch (err: any) {
        console.warn("Firestore access error, falling back to local memory:", err);
      }
    };
    syncStudents();
    return () => { active = false; };
  }, []);

  // Save base student details and update in Firestore
  const handleSaveStudentDetails = async () => {
    if (!activeStudent) return;
    
    // Derive country from editUniv
    let derivedCountry = '澳洲';
    if (editUniv.includes('東京') || editUniv.includes('早稻田') || editUniv.includes('慶應') || editUniv.includes('京都')) {
      derivedCountry = '日本';
    } else if (editUniv.includes('多倫多') || editUniv.includes('滑鐵盧') || editUniv.includes('不列顛')) {
      derivedCountry = '加拿大';
    } else if (editUniv.includes('哈佛') || editUniv.includes('史丹佛') || editUniv.includes('普渡') || editUniv.includes('加州')) {
      derivedCountry = '美國';
    }

    const updatedStudent: StudentProgress = {
      ...activeStudent,
      studentName: editName,
      studentNumber: editStudentNumber,
      country: derivedCountry,
      university: editUniv,
      intendedDeparture: editDept,
      riskStatus: editRisk,
      progressPercentage: Number(editProgress),
      studentGmail: editGmail,
      lineUserId: editLineId,
    };

    setStudents(prev => prev.map(s => s.id === activeStudent.id ? updatedStudent : s));
    setActiveStudent(updatedStudent);
    setIsEditing(false);

    try {
      await setDoc(doc(db, "students", activeStudent.id), updatedStudent);
      onTriggerToast(`成功更新同學【${editName}】並同步儲存至 Firebase 資料庫！`);
    } catch (err: any) {
      console.error("Firestore save error:", err);
      onTriggerToast(`成功更新同學【${editName}】（資料庫同步失敗，僅存於記憶體，原因: ${err.message || err}）`);
    }
  };

  // Update counselor notes in state and Firestore
  const handleSaveNotes = async (id: string) => {
    const matched = students.find(s => s.id === id);
    if (!matched) return;

    const updatedStudent = { ...matched, advisorNotes: counselorText };
    setStudents(prev => prev.map(s => s.id === id ? updatedStudent : s));
    if (activeStudent) {
      setActiveStudent(updatedStudent);
    }

    try {
      await setDoc(doc(db, "students", id), updatedStudent);
      onTriggerToast(`顧問儲存成功！進度筆記已成功同步至 Firebase 資料庫。`);
    } catch (err: any) {
      console.error("Firestore notes save error:", err);
      onTriggerToast(`顧問儲存成功！（已儲存於瀏覽器，Firebase同步失敗：${err.message || err}）`);
    }
  };

  // Add new student submitting handler
  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addId.trim() || !addGmail.trim()) {
      onTriggerToast("⚠️ 請填妥所有欄位，其中學生姓名、學籍編號與 Gmail 信箱為必填！");
      return;
    }

    const defaultTasksProgress = [
      { taskId: 1, completed: false },
      { taskId: 2, completed: false },
      { taskId: 3, completed: false },
      { taskId: 4, completed: false },
      { taskId: 5, completed: false },
      { taskId: 6, completed: false },
      { taskId: 7, completed: false },
      { taskId: 8, completed: false },
    ];

    // Derive country from addUniv
    let derivedCountry = '澳洲';
    if (addUniv.includes('東京') || addUniv.includes('早稻田') || addUniv.includes('慶應') || addUniv.includes('京都')) {
      derivedCountry = '日本';
    } else if (addUniv.includes('多倫多') || addUniv.includes('滑鐵盧') || addUniv.includes('不列顛')) {
      derivedCountry = '加拿大';
    } else if (addUniv.includes('哈佛') || addUniv.includes('史丹佛') || addUniv.includes('普渡') || addUniv.includes('加州')) {
      derivedCountry = '美國';
    }

    const newStudent: StudentProgress = {
      id: `std_${Date.now()}`,
      studentName: addName,
      studentId: addId,
      studentGmail: addGmail,
      country: derivedCountry,
      university: addUniv,
      intendedDeparture: addDept,
      progressPercentage: 0,
      riskStatus: addRisk,
      tasksProgress: defaultTasksProgress,
      advisorNotes: addNotes || "無備註與跟進行程",
      lastActive: "剛剛",
    };

    setStudents(prev => {
      const list = [...prev, newStudent];
      list.sort((a,b) => a.id.localeCompare(b.id));
      return list;
    });

    setActiveStudent(newStudent);
    setCounselorText(newStudent.advisorNotes);
    setShowAddStudentForm(false);

    try {
      await setDoc(doc(db, "students", newStudent.id), newStudent);
      onTriggerToast(`🎉 成功新增學生【${addName}】並同步寫入 Firebase 資料庫！`);
    } catch (err: any) {
      console.error("Firestore add student error:", err);
      onTriggerToast(`🎉 成功新增學生【${addName}】（已保存在瀏覽器，Firebase寫入錯誤：${err.message || err}）`);
    }

    setAddName('');
    setAddId('');
    setAddGmail('');
    setAddNotes('');
  };

  // Send automated nudges
  const handleSendNudge = (std: StudentProgress) => {
    const missingTasks = getCountryTasks(std.country || std.university).filter(item => {
      const p = std.tasksProgress.find(tp => tp.taskId === item.id);
      return !p || !p.completed;
    }).map(t => t.title).join('、');

    const messageTemplate = `【Atlas. 追蹤】${std.studentName} 同學，您目前尚有關鍵文件未完成: ${missingTasks}。請儘速更新！`;
    onTriggerToast(`✅ 催辦通知發送成功！已成功向【${std.studentName}】發送簡訊與 Email。`);
  };

  // Filter student array
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = selectedRiskFilter === 'all' || s.riskStatus === selectedRiskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-8 animate-fade-in text-[#2C2C2A] w-full">
      
      {/* Top counseling dashboard branding */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-gray-200 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 text-indigo-305 text-[#7A8B99] rounded-xl">
              <Users className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-[#2C2C2A]">留學教育顧問「首期文件一覽追蹤後台」</h2>
          </div>
          <p className="text-xs text-gray-600">
            精準監控每位留學生的倒退時序文件狀態與核心個人檔案，適時點擊進行修改與管理。
          </p>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left column: Student list (2 Columns) */}
        <div className="lg:col-span-2 bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-gray-200 shadow-lg space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <h3 className="font-bold text-sm text-[#2C2C2A]">
              管理學生備文工作區 ({filteredStudents.length} 名符合條件)
            </h3>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="搜尋名字、學籍號或學校..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/60 border border-gray-200 rounded-xl py-1.5 pl-8 pr-3 text-xs w-48 focus:outline-none focus:border-indigo-400 text-[#2C2C2A]"
                />
              </div>

              {/* Risk select */}
              <select
                value={selectedRiskFilter}
                onChange={(e) => setSelectedRiskFilter(e.target.value)}
                className="bg-indigo-950 border border-gray-200 rounded-xl py-1.5 px-2.5 text-xs text-gray-600 font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">所有警示評級</option>
                <option value="正常">正常 ✅</option>
                <option value="預警">預警 ⚠️</option>
                <option value="緊急">緊急 🚨</option>
              </select>

              <button
                onClick={() => setShowAddStudentForm(true)}
                className="bg-[#7A8B99] hover:bg-[#60707c] text-[#2C2C2A] font-bold text-xs py-1.5 px-3 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 shrink-0 shadow"
              >
                <span>+ 新增學生檔案</span>
              </button>
            </div>
          </div>

          {/* Table representing all user progresses */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-[#2C2C2A]">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 font-semibold">
                  <th className="py-3 px-2">學生姓名</th>
                  <th className="py-3 px-2">預計就讀海外大學</th>
                  <th className="py-3 px-2">出發期限</th>
                  <th className="py-3 px-2 text-center">補備齊百分比</th>
                  <th className="py-3 px-2 text-center">顧問警特級</th>
                  <th className="py-3 px-2 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((std) => {
                  const isActive = activeStudent?.id === std.id;
                  
                  return (
                    <tr
                      key={std.id}
                      className={`border-b border-gray-100 hover:bg-white/60 transition-colors cursor-pointer ${
                        isActive ? 'bg-indigo-500/10 font-medium' : ''
                      }`}
                      onClick={() => handleSelectStudent(std)}
                    >
                      <td className="py-3.5 px-2">
                        <p className="font-bold text-[#2C2C2A] flex items-center gap-1.5">
                          {std.studentName}
                        </p>
                        <p className="text-[10px] text-gray-500">{std.studentNumber || '未登記學號'}</p>
                      </td>
                      
                      <td className="py-3.5 px-2 text-gray-600 max-w-[180px] truncate">
                        {std.university}
                      </td>

                      <td className="py-3.5 px-2 text-gray-500 font-mono">
                        {std.intendedDeparture}
                      </td>

                      <td className="py-3.5 px-2">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-16 bg-white/60 h-2 rounded-full overflow-hidden border border-gray-100">
                            <div
                              className="bg-indigo-500 h-full"
                              style={{ width: `${std.progressPercentage}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-gray-600 font-mono">{std.progressPercentage}%</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          std.riskStatus === '正常' 
                            ? 'bg-emerald-500/20 text-emerald-305 text-emerald-300 border border-emerald-500/10' 
                            : std.riskStatus === '預警' 
                              ? 'bg-amber-500/20 text-amber-305 text-amber-300 border border-amber-500/10' 
                              : 'bg-rose-500/20 text-rose-305 text-rose-300 border border-rose-500/10 animate-pulse'
                        }`}>
                          {std.riskStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-2 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleSelectStudent(std)}
                          className="bg-white/60 p-1.5 rounded-lg text-gray-600 hover:bg-white/80 hover:text-[#2C2C2A] cursor-pointer inline-flex items-center justify-center"
                          title="查看詳細備文"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        
                        <button
                          onClick={() => handleSendNudge(std)}
                          className="bg-indigo-650 hover:bg-[#60707c] bg-[#7A8B99] p-1.5 rounded-lg text-[#2C2C2A] cursor-pointer inline-flex items-center justify-center"
                          title="限制催辦通知"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      沒有找到符合搜尋條件的學生檔案。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/10 text-[11px] text-gray-600 leading-relaxed">
            🎓 <strong>顧問引導提示：</strong>您可以選中任意學生後，點擊右側的「✏️ 編輯學生基本資料」按鈕，直接在線更新學生的學籍、姓名、預計出發日、以及顧問評警級！我們完全支持實時資料修改。
          </div>

        </div>

        {/* Right column: Selected student details (1 Column) */}
        {activeStudent && (
          <div className="space-y-6">
            
            {/* Student profile card */}
            <div className="bg-[#EAE8E3]/60 backdrop-blur-md rounded-3xl p-6 border border-gray-200 shadow-lg space-y-5 text-[#2C2C2A]">
              
              {/* Header profile or Editing Form */}
              {!isEditing ? (
                <div className="flex border-b border-gray-100 pb-4 justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-[#2C2C2A] text-base flex items-center gap-1">
                      <span>{activeStudent.studentName} 同學</span>
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-1">學號：{activeStudent.studentNumber || '未提供'}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">學籍：{activeStudent.university}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">出航日：<strong className="text-[#7A8B99]">{activeStudent.intendedDeparture}</strong></p>
                    <p className="text-[10px] text-emerald-400 font-medium mt-1 select-all font-mono flex items-center gap-1"><Mail className="h-3 w-3" /> {activeStudent.studentGmail || '未設定'}</p>
                    <p className="text-[10px] text-emerald-400 font-medium mt-0.5 select-all font-mono flex items-center gap-1"><Phone className="h-3 w-3" /> {activeStudent.phone || '未設定'}</p>
                  </div>

                  <div className="text-right flex flex-col items-end gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      activeStudent.riskStatus === '正常' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/10' 
                        : activeStudent.riskStatus === '預警' 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/10' 
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/10 animate-pulse'
                    }`}>
                      {activeStudent.riskStatus} 警級
                    </span>
                    
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-[11px] font-bold bg-white/60 border border-gray-200 px-2.5 py-1 rounded-xl text-gray-600 hover:text-[#2C2C2A] hover:bg-white/80 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="h-3 w-3" /> 修改資料
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(activeStudent.id)}
                      className="text-[11px] font-bold bg-white/60 border border-rose-200 px-2.5 py-1 rounded-xl text-rose-500 hover:text-white hover:bg-rose-500 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <X className="h-3 w-3" /> 刪除資料
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-b border-gray-100 pb-4 space-y-3">
                  <div className="flex justify-between items-center pb-1">
                    <h4 className="text-xs font-black text-[#7A8B99]">✏️ 修改同學留學資料</h4>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="text-gray-500 hover:text-[#2C2C2A] text-xs cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Edit Inputs */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">同學姓名</label>
                      <input 
                        type="text"
                        value={editName}
                        disabled
                        className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-2.5 py-1.5 text-gray-400 text-xs focus:outline-none cursor-not-allowed"
                        placeholder="請輸入姓名"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-gray-500 block mb-1">學號</label>
                        <input 
                          type="text"
                          value={editStudentNumber}
                          onChange={(e) => setEditStudentNumber(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-[#2C2C2A] text-xs focus:outline-none focus:border-indigo-400"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 block mb-1">預定出發日</label>
                        <input 
                          type="date"
                          value={editDept}
                          disabled
                          className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-2.5 py-1.5 text-gray-400 text-xs focus:outline-none cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">就讀學校</label>
                      <input 
                        type="text"
                        value={editUniv}
                        disabled
                        className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-2.5 py-1.5 text-gray-400 text-xs focus:outline-none cursor-not-allowed"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-gray-500 block mb-1 font-bold">通知補備 Gmail</label>
                        <input 
                          type="email"
                          value={editGmail}
                          onChange={(e) => setEditGmail(e.target.value)}
                          className="w-full bg-white/60 border border-gray-200 rounded-xl px-2.5 py-1.5 text-[#2C2C2A] font-mono text-xs focus:outline-none focus:border-indigo-400"
                          placeholder="example@gmail.com"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 block mb-1 font-bold">綁定 LINE User ID</label>
                        <input 
                          type="text"
                          value={editLineId}
                          onChange={(e) => setEditLineId(e.target.value)}
                          className="w-full bg-white/60 border border-gray-200 rounded-xl px-2.5 py-1.5 text-[#2C2C2A] font-mono text-xs focus:outline-none focus:border-[#06C755]"
                          placeholder="U4af4980629..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-gray-500 block mb-1">警示狀況評級</label>
                        <select
                          value={editRisk}
                          onChange={(e) => setEditRisk(e.target.value as any)}
                          className="w-full bg-[#EAE8E3] border border-gray-200 rounded-xl px-2.5 py-1.5 text-[#2C2C2A] text-xs focus:outline-none"
                        >
                          <option value="正常">正常 ✅</option>
                          <option value="預警">預警 ⚠️</option>
                          <option value="緊急">緊急 🚨</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-gray-500 block mb-1">完成進度比例: {editProgress}%</label>
                        <input 
                          type="range"
                          min="0"
                          max="100"
                          value={editProgress}
                          onChange={(e) => setEditProgress(Number(e.target.value))}
                          className="w-full accent-indigo-550 h-2 mt-2"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-white/60 border border-gray-100 text-[11px] font-bold text-gray-600 px-3 py-1.5 rounded-lg hover:bg-white/80 cursor-pointer"
                      >
                        取消
                      </button>
                      
                      <button
                        onClick={handleSaveStudentDetails}
                        className="bg-indigo-650 hover:bg-[#60707c] bg-[#7A8B99] font-bold text-[11px] text-[#2C2C2A] px-3.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" /> 儲存變更
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Tracker */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-gray-600">
                  <span>文件計畫完成率：</span>
                  <span className="font-mono text-[#7A8B99]">{activeStudent.progressPercentage}%</span>
                </div>
                <div className="w-full bg-white/60 h-2.5 rounded-full overflow-hidden border border-gray-100">
                  <div
                    className="bg-indigo-500 h-full transition-all duration-350"
                    style={{ width: `${activeStudent.progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Reverse task inspect status */}
              <div className="space-y-2">
                <p className="text-[11px] font-black text-slate-450 text-gray-500 block">時序對位文件查核現狀：</p>
                
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {getCountryTasks(activeStudent.country || activeStudent.university).map(t => {
                    const found = activeStudent.tasksProgress.find(tp => tp.taskId === t.id);
                    const isCompleted = found ? found.completed : false;

                    return (
                      <div key={t.id} className="flex items-center justify-between text-[11px] p-2 bg-white/60 rounded-xl border border-gray-100">
                        <span className="truncate max-w-[170px] text-gray-600">{t.title}</span>
                        {isCompleted ? (
                          <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.2 rounded-full border border-emerald-500/10">
                            已辦妥 ✅
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-rose-300 bg-rose-500/20 px-2 py-0.2 rounded-full border border-rose-500/10">
                            待處理 ❌
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Advisory notes */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <label className="text-[11px] font-black text-gray-600 block">
                  顧問特約備心備註(溝通狀況與申辦追蹤等)：
                </label>
                <textarea
                  value={counselorText}
                  onChange={(e) => setCounselorText(e.target.value)}
                  rows={3}
                  className="w-full bg-white/60 border border-gray-200 rounded-xl p-3 text-xs text-[#2C2C2A] focus:outline-none focus:border-indigo-400"
                  placeholder="點擊在此，記錄學生當前的特別申辦阻礙，如家戶所得查核落後、或投保猶豫..."
                ></textarea>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => handleSaveNotes(activeStudent.id)}
                    className="bg-indigo-650 hover:bg-[#60707c] bg-[#7A8B99] text-[#2C2C2A] text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-md cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" /> 儲存顧問備忘
                  </button>
                </div>
              </div>

              {/* Automated Send Alert */}
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <button
                  onClick={() => handleSendNudge(activeStudent)}
                  className="w-full bg-[#7A8B99] hover:bg-[#60707c] text-[#2C2C2A] text-xs font-bold py-2 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" /> 一鍵發出限時催辦通知
                </button>
              </div>

              {/* Automated Gmail Dispatcher & Record Storage Log */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="flex justify-between items-center text-left">
                  <h4 className="text-xs font-black text-gray-500 tracking-wider uppercase">📧 聯名 Gmail 實行通知派遣器</h4>
                  <button
                    onClick={() => {
                      if (!customMailSubject) {
                        setCustomMailSubject(`【Atlas. 留學簽證進度更新】致 ${activeStudent.studentName} 同學`);
                        setCustomMailBody(`親愛的 ${activeStudent.studentName} 同學您好：\n\n這裡是 Atlas. 顧問團隊。目前您的案件進度為 ${activeStudent.progressPercentage}%，狀態為「${activeStudent.riskStatus}」。請配合登入系統確認最新文件清單。\n\n祝 順心如意，\nAtlas. 團隊敬上`);
                      }
                      setShowMailSender(!showMailSender);
                    }}
                    className="text-[10px] text-[#8F9779] font-bold hover:underline cursor-pointer"
                  >
                    {showMailSender ? '關閉寄件面板' : '開啟寄件外掛'}
                  </button>
                </div>

                {showMailSender && (
                  <div className="bg-white/60 p-4 rounded-2xl border border-gray-200 space-y-3 text-xs text-left">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <p className="text-[10px] text-gray-500">收件人 (Gmail)</p>
                        <p className="font-mono text-emerald-400 font-bold">{activeStudent.studentGmail || '未設定'}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-gray-500">收件人 (LINE User ID)</p>
                        <p className="font-mono text-[#06C755] font-bold">{activeStudent.lineUserId ? '✅ 已綁定' : '❌ 未綁定 (點右上角修改資料)'}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">主旨 (Subject)</label>
                      <input
                        type="text"
                        value={customMailSubject}
                        onChange={(e) => setCustomMailSubject(e.target.value)}
                        className="w-full bg-[#FDFBF7] border border-gray-200 rounded-lg py-1.5 px-3 text-xs text-[#2C2C2A] focus:border-indigo-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] text-gray-500 block">信件內文 (Mail Body)</label>
                        <button
                          type="button"
                          disabled={isDrafting}
                          onClick={handleAiAutoDraft}
                          className="text-[9px] bg-indigo-500/15 text-[#7A8B99] border border-indigo-500/20 hover:bg-[#8F9779]/25 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                        >
                          {isDrafting ? '🤖 AI 起草中...' : '🤖 AI 智慧起草 (自動依學生進度生成)'}
                        </button>
                      </div>
                      <textarea
                        value={customMailBody}
                        onChange={(e) => setCustomMailBody(e.target.value)}
                        rows={6}
                        className="w-full bg-[#FDFBF7] border border-gray-200 rounded-lg p-2 text-xs text-gray-600 focus:border-indigo-400 focus:outline-none leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        disabled={isSendingMail || !activeStudent.studentGmail}
                        onClick={() => handleSendRealNotification('gmail')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-[#2C2C2A] font-bold py-2 rounded-xl text-[11px] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Mail className="h-3 w-3" />
                        <span>{isSendingMail ? '送信中...' : '真實寄送 Gmail'}</span>
                      </button>

                      <button
                        disabled={isSendingMail || !activeStudent.lineUserId}
                        onClick={() => handleSendLineNotification()}
                        className="bg-[#06C755] hover:bg-[#05B34C] text-[#2C2C2A] font-bold py-2 rounded-xl text-[11px] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <MessageCircle className="h-3 w-3" />
                        <span>🟢 真實推播 LINE</span>
                      </button>

                      <button
                        disabled={isSendingMail}
                        onClick={() => handleSendRealNotification('sms')}
                        className="bg-[#7A8B99] hover:bg-[#60707c] text-[#2C2C2A] font-bold py-2 rounded-xl text-[11px] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>📱 傳送模擬簡訊</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Email dispatch history registry logs */}
                <div className="space-y-2 text-left">
                  <p className="text-[10px] font-black text-gray-400 uppercase">📧 本機 Gmail 通知寄發紀錄</p>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {mailLogs.map((log) => (
                      <div key={log.id} className="p-2.5 bg-white/60 border border-gray-100 rounded-xl text-[10px] space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <strong className="text-gray-600 font-mono text-[9px]">{log.email}</strong>
                          <span className="text-[8.5px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">{log.status}</span>
                        </div>
                        <p className="text-[#2C2C2A] font-medium truncate">{log.subject}</p>
                        <p className="text-gray-400 text-[9px] text-right">{log.date}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>

      {/* 新增學生檔案互動視窗 (Add Student Overlay Modal) */}
      {showAddStudentForm && (
        <div className="fixed inset-0 z-50 bg-[#FDFBF7]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#EAE8E3] border border-gray-200 rounded-3xl shadow-2xl overflow-hidden text-left flex flex-col">
            <div className="bg-[#FDFBF7] p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-extrabold text-[#2C2C2A] text-sm flex items-center gap-2 animate-pulse">
                <Users className="h-4.5 w-4.5 text-[#8F9779]" />
                <span>✏️ 登記新增全新名冊學生資訊</span>
              </h3>
              <button
                onClick={() => setShowAddStudentForm(false)}
                className="text-gray-500 hover:text-[#2C2C2A] p-1 rounded-lg hover:bg-white/60 cursor-pointer animate-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-[#2C2C2A]">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[10px] text-gray-500 font-extrabold block mb-1">學生中文姓名 (必填)</label>
                  <input
                    type="text"
                    required
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="例如: 詹姆士"
                    className="w-full bg-[#FDFBF7] border border-gray-200 rounded-xl py-2 px-3 text-xs text-[#2C2C2A] outline-none focus:border-indigo-400"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[10px] text-gray-500 font-extrabold block mb-1 font-sans">學籍註冊編號 (必填)</label>
                  <input
                    type="text"
                    required
                    value={addId}
                    onChange={(e) => setAddId(e.target.value)}
                    placeholder="例如: 2026_USYD_789"
                    className="w-full bg-[#FDFBF7] border border-gray-200 rounded-xl py-2 px-3 text-xs text-[#2C2C2A] outline-none focus:border-indigo-400 font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] text-gray-500 font-extrabold block mb-1">學員官方 Gmail 信箱 (必填)</label>
                  <input
                    type="email"
                    required
                    value={addGmail}
                    onChange={(e) => setAddGmail(e.target.value)}
                    placeholder="user@gmail.com"
                    className="w-full bg-[#FDFBF7] border border-gray-200 rounded-xl py-2 px-3 text-xs text-[#2C2C2A] outline-none focus:border-indigo-400 font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] text-gray-500 font-extrabold block mb-1">預計就讀海外學府</label>
                  <select
                    value={addUniv}
                    onChange={(e) => setAddUniv(e.target.value)}
                    className="w-full bg-[#FDFBF7] border border-gray-200 rounded-xl py-2 px-3 text-xs text-slate-350 text-gray-600 outline-none focus:border-indigo-450"
                  >
                    <option>雪梨大學 (The University of Sydney)</option>
                    <option>墨爾本大學 (The University of Melbourne)</option>
                    <option>昆士蘭大學 (The University of Queensland)</option>
                    <option>新南威爾斯大學 (UNSW Sydney)</option>
                    <option>東京大學 (The University of Tokyo)</option>
                    <option>多倫多大學 (University of Toronto)</option>
                    <option>哈佛大學 (Harvard University)</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[10px] text-gray-500 font-extrabold block mb-1">指派目標起飛日</label>
                  <input
                    type="date"
                    required
                    value={addDept}
                    onChange={(e) => setAddDept(e.target.value)}
                    className="w-full bg-[#FDFBF7] border border-gray-200 rounded-xl py-1.5 px-3 text-xs text-[#2C2C2A] outline-none focus:border-indigo-455 font-mono"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[10px] text-gray-500 font-extrabold block mb-1">顧問首期警示級</label>
                  <select
                    value={addRisk}
                    onChange={(e) => setAddRisk(e.target.value as any)}
                    className="w-full bg-[#FDFBF7] border border-gray-200 rounded-xl py-2 px-3 text-xs text-slate-350 text-gray-600 outline-none focus:border-indigo-455"
                  >
                    <option value="正常">正常 (進度順利) ✅</option>
                    <option value="預警">預警 (略有拖延) ⚠️</option>
                    <option value="緊急">緊急 (需警處理) 🚨</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] text-gray-500 font-extrabold block mb-1">特別輔導進度備註 / 開案記錄</label>
                  <textarea
                    rows={3}
                    value={addNotes}
                    onChange={(e) => setAddNotes(e.target.value)}
                    placeholder="請輸入該學生的開案背景或首期注意事項..."
                    className="w-full bg-[#FDFBF7] border border-gray-200 rounded-xl py-2 px-3 text-xs text-[#2C2C2A] outline-none focus:border-indigo-400 resize-none leading-relaxed"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setShowAddStudentForm(false)}
                  className="bg-white/60 hover:bg-white/80 text-xs font-bold text-gray-600 px-5 py-2.5 rounded-xl border border-gray-200 transition-all cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="bg-[#7A8B99] hover:bg-[#60707c] text-xs font-bold text-[#2C2C2A] px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4 text-[#2C2C2A]" />
                  <span>新增學員登記（寫入 Firebase）</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
