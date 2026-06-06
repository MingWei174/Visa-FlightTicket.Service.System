import React, { useState } from 'react';
import { User, Phone, Mail, MessageCircle, MapPin, Building, ChevronRight, X, Sparkles } from 'lucide-react';
import { getMergedUniversities } from '../utils/universityUtils';
import { db, collection, setDoc, doc } from '../firebase';
import { StudentProgress } from '../types';

interface StudentOnboardingFormProps {
  onComplete: (student: StudentProgress) => void;
  onCancel?: () => void;
  initialCountry?: string;
  existingProfile?: any;
}

const StudentOnboardingForm: React.FC<StudentOnboardingFormProps> = ({ onComplete, onCancel, initialCountry, existingProfile }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(existingProfile?.studentName || '');
  const [email, setEmail] = useState(existingProfile?.studentGmail || '');
  const [phone, setPhone] = useState(existingProfile?.phone || '');
  const [lineId, setLineId] = useState(existingProfile?.lineUserId || '');
  const [studentNumber, setStudentNumber] = useState(existingProfile?.studentNumber || '');
  const [country, setCountry] = useState(existingProfile?.country || initialCountry || '澳洲');
  const [university, setUniversity] = useState(existingProfile?.university || '');
  const [departureDate, setDepartureDate] = useState(existingProfile?.intendedDeparture || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (existingProfile) {
      if (existingProfile.studentName) setName(existingProfile.studentName);
      if (existingProfile.studentGmail) setEmail(existingProfile.studentGmail);
      if (existingProfile.phone) setPhone(existingProfile.phone);
      if (existingProfile.lineUserId) setLineId(existingProfile.lineUserId);
      if (existingProfile.studentNumber) setStudentNumber(existingProfile.studentNumber);
      if (existingProfile.country) setCountry(existingProfile.country);
      if (existingProfile.university) setUniversity(existingProfile.university);
      if (existingProfile.intendedDeparture) setDepartureDate(existingProfile.intendedDeparture);
    }
  }, [existingProfile]);

  const universitiesByCountry = getMergedUniversities();
  const countries = Object.keys(universitiesByCountry);
  const universities = universitiesByCountry[country] || [];

  const handleNext = () => {
    if (step === 1) {
      if (!name || !email || !studentNumber) {
        setError('請完整填寫所有基本資料欄位');
        return;
      }
      setError('');
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!country || !university || !departureDate) {
      setError('請完整選擇留學目標與預計出發日');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const studentId = existingProfile?.id || (typeof window !== 'undefined' && (window as any).__currentUserUid) || 'STU' + new Date().getFullYear().toString().substring(2) + Math.floor(1000 + Math.random() * 9000);
      const newStudent: StudentProgress = {
        id: studentId,
        studentName: name,
        studentId: studentId,
        studentGmail: email,
        studentNumber: studentNumber,
        phone: phone,
        lineUserId: lineId,
        country: country,
        university: university,
        intendedDeparture: departureDate,
        progressPercentage: existingProfile?.progressPercentage ?? 5,
        riskStatus: existingProfile?.riskStatus ?? '正常',
        tasksProgress: existingProfile?.tasksProgress ?? [],
        advisorNotes: existingProfile?.advisorNotes ?? '新生報到，等待顧問初步建檔聯繫。',
        lastActive: new Date().toISOString().split('T')[0],
        tasksByCountry: existingProfile?.tasksByCountry
      };
      
      // clean up undefined fields
      Object.keys(newStudent).forEach(key => {
        if ((newStudent as any)[key] === undefined) {
          delete (newStudent as any)[key];
        }
      });

      await setDoc(doc(db, "students", studentId), newStudent, { merge: true });
      onComplete(newStudent);
    } catch (err: any) {
      console.error(err);
      setError('建檔失敗：' + (err.message || err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#EAE8E3]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#2C2C2A] p-6 text-white relative">
          {onCancel && (
            <button type="button" onClick={onCancel} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-1.5 rounded-full transition-colors" title="取消修改">
              <X className="h-5 w-5" />
            </button>
          )}
          <div className="flex items-center gap-2 mb-2 text-indigo-300">
            <Sparkles className="h-5 w-5" />
            <h2 className="text-sm font-bold tracking-widest uppercase">Atlas. 專屬留學護照</h2>
          </div>
          <h1 className="text-2xl font-black mb-1">{onCancel ? '修改您的留學檔案' : '建立您的留學檔案'}</h1>
          <p className="text-sm text-gray-400">{onCancel ? '更新資料以即時對齊全球導航計畫' : '填寫資料即可開始您的全球導航計畫'}</p>
          
          {/* Progress bar */}
          <div className="mt-6 flex gap-2">
            <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-indigo-400' : 'bg-white/10'}`} />
            <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-indigo-400' : 'bg-white/10'}`} />
          </div>
        </div>

        <div className="p-8 overflow-y-auto">
          {error && (
            <div className="mb-6 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-500 text-sm font-bold flex items-center gap-2">
              <X className="h-4 w-4" /> {error}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-4">
                <h3 className="font-extrabold text-[#2C2C2A] border-b border-gray-100 pb-2">1. 聯絡資訊</h3>
                
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> 姓名</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="請輸入全名" className="w-full bg-[#FDFBF7] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#2C2C2A] focus:outline-none focus:border-indigo-400" />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="通知與登入使用" className="w-full bg-[#FDFBF7] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#2C2C2A] focus:outline-none focus:border-indigo-400" />
                </div>
                

                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5"><Building className="h-3.5 w-3.5" /> 學號</label>
                  <input type="text" value={studentNumber} onChange={e => setStudentNumber(e.target.value)} placeholder="例：S995562" className="w-full bg-[#FDFBF7] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#2C2C2A] focus:outline-none focus:border-indigo-400" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> 手機號碼</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="接收簡訊通知" className="w-full bg-[#FDFBF7] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#2C2C2A] focus:outline-none focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5" /> LINE ID</label>
                    <input type="text" value={lineId} onChange={e => setLineId(e.target.value)} placeholder="綁定專屬客服" className="w-full bg-[#FDFBF7] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#2C2C2A] focus:outline-none focus:border-indigo-400" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                {onCancel && (
                  <button 
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3.5 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                  >
                    取消
                  </button>
                )}
                <button 
                  onClick={handleNext}
                  className="flex-1 bg-[#2C2C2A] text-white rounded-xl py-3.5 font-bold flex justify-center items-center gap-2 hover:bg-black transition-all"
                >
                  下一步 <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-4">
                <h3 className="font-extrabold text-[#2C2C2A] border-b border-gray-100 pb-2">2. 目標留學計畫</h3>
                
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> 目標國家</label>
                  <select
                    value={country}
                    onChange={(e) => { setCountry(e.target.value); setUniversity(''); }}
                    className="w-full bg-[#FDFBF7] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#2C2C2A] focus:outline-none focus:border-indigo-400"
                  >
                    <option value="" disabled>請選擇目標國家</option>
                    {countries.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5"><Building className="h-3.5 w-3.5" /> 預計就讀學府</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {universities.map(u => (
                      <button
                        key={u.name}
                        onClick={() => setUniversity(u.name)}
                        className={`w-full text-left p-3 rounded-xl border transition-all text-sm flex flex-col gap-1 ${university === u.name ? 'bg-indigo-50 border-indigo-300' : 'bg-[#FDFBF7] border-gray-200 hover:border-gray-300'}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className={`font-bold ${university === u.name ? 'text-indigo-900' : 'text-[#2C2C2A]'}`}>{u.name}</span>
                          {u.isSisterSchool && <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-black">姊妹校</span>}
                        </div>
                        <span className="text-xs text-gray-500">{u.desc}</span>
                      </button>
                    ))}
                    {/* Custom input fallback */}
                    <div className="relative mt-2">
                      <input 
                        type="text" 
                        value={universities.find(u => u.name === university) ? '' : university} 
                        onChange={e => setUniversity(e.target.value)} 
                        placeholder="...或手動輸入其他大學名稱" 
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#2C2C2A] focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5">預定出發日</label>
                  <input type="date" value={departureDate} onChange={e => setDepartureDate(e.target.value)} className="w-full bg-[#FDFBF7] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#2C2C2A] focus:outline-none focus:border-indigo-400" />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                {onCancel && (
                  <button 
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-3.5 rounded-xl font-bold bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all border border-rose-200"
                  >
                    取消
                  </button>
                )}
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3.5 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                >
                  返回
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 bg-indigo-500 text-white rounded-xl py-3.5 font-bold hover:bg-indigo-600 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {isLoading ? '建立檔案中...' : '完成並進入控制台'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentOnboardingForm;
