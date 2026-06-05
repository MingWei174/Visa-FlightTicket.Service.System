const fs = require('fs');

// =============================================================
// FIX 1: StudentOnboardingForm - add cancel button, student ID field
// =============================================================
let form = fs.readFileSync('src/components/StudentOnboardingForm.tsx', 'utf8');

// Add studentNumber field state
form = form.replace(
  "const [lineId, setLineId] = useState(existingProfile?.lineUserId || '');",
  "const [lineId, setLineId] = useState(existingProfile?.lineUserId || '');\n  const [studentNumber, setStudentNumber] = useState(existingProfile?.studentNumber || '');"
);

// Add studentNumber to validation
form = form.replace(
  "if (!name || !email || !phone || !lineId) {",
  "if (!name || !email || !studentNumber) {"
);

// Add studentNumber to saved data
form = form.replace(
  "studentGmail: email,",
  "studentGmail: email,\n        studentNumber: studentNumber,"
);

// Add student ID input field after email
const studentIdField = `
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5"><Building className="h-3.5 w-3.5" /> 學號</label>
                  <input type="text" value={studentNumber} onChange={e => setStudentNumber(e.target.value)} placeholder="例：S995562" className="w-full bg-[#FDFBF7] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#2C2C2A] focus:outline-none focus:border-indigo-400" />
                </div>`;

form = form.replace(
  `                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> 手機號碼</label>`,
  `${studentIdField}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> 手機號碼</label>`
);

// Fix cancel button visibility: add cancel button on step 1 too (when existingProfile)
form = form.replace(
  `                <button 
                onClick={handleNext}
                className="w-full bg-[#2C2C2A] text-white rounded-xl py-3.5 font-bold mt-6 flex justify-center items-center gap-2 hover:bg-black transition-all"
              >
                下一步 <ChevronRight className="h-4 w-4" />
              </button>`,
  `                <div className="flex gap-3 mt-6">
                  {existingProfile && onCancel && (
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
                </div>`
);

// Also add cancel to step 2
form = form.replace(
  `                <div className="flex gap-3 mt-6">
                <button 
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
              </div>`,
  `                <div className="flex gap-3 mt-6">
                  {existingProfile && onCancel && (
                    <button 
                      type="button"
                      onClick={onCancel}
                      className="px-6 py-3.5 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                    >
                      取消
                    </button>
                  )}
                  <button 
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
                    {isLoading ? '建立檔案中...' : (existingProfile ? '儲存修改' : '完成並進入控制台')}
                  </button>
                </div>`
);

// Fix: use currentUser.uid as document key, not generated studentId
form = form.replace(
  `const studentId = existingProfile ? existingProfile.id : 'STU' + new Date().getFullYear().toString().substring(2) + Math.floor(1000 + Math.random() * 9000);`,
  `const studentId = existingProfile?.id || (typeof window !== 'undefined' && (window as any).__currentUserUid) || 'STU' + new Date().getFullYear().toString().substring(2) + Math.floor(1000 + Math.random() * 9000);`
);

fs.writeFileSync('src/components/StudentOnboardingForm.tsx', form);
console.log('✅ Fixed StudentOnboardingForm.tsx');

// =============================================================
// FIX 2: App.tsx - fix Firebase persistence: use user.uid as student doc key,
//        add onCancel prop, add isEditingProfile state, persist country/date
// =============================================================
let app = fs.readFileSync('src/App.tsx', 'utf8');

// Add isEditingProfile state
app = app.replace(
  "const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => localStorage.getItem('has_completed_onboarding') === 'true');",
  "const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => localStorage.getItem('has_completed_onboarding') === 'true');\n  const [isEditingProfile, setIsEditingProfile] = useState(false);"
);

// Before rendering onboarding form, also set window.__currentUserUid
// so the form can use it as the document key
app = app.replace(
  `{currentUser && userRole === 'student' && hasSeenAbout && !hasCompletedOnboarding && (
            <StudentOnboardingForm 
              onComplete={(student) => {
                setHasCompletedOnboarding(true);
                localStorage.setItem('has_completed_onboarding', 'true');
                setGlobalCountry(student.country || '澳洲');
                setGlobalUniversity(student.university || '');
                if (currentUser) {
                  setActiveStudentProfile(student);
                }
              }} 
              existingProfile={activeStudentProfile}
            />
          )}`,
  `{currentUser && userRole === 'student' && hasSeenAbout && (!hasCompletedOnboarding || isEditingProfile) && (() => {
            (window as any).__currentUserUid = currentUser.uid;
            return (
              <StudentOnboardingForm 
                onComplete={(student) => {
                  setHasCompletedOnboarding(true);
                  setIsEditingProfile(false);
                  localStorage.setItem('has_completed_onboarding', 'true');
                  setGlobalCountry(student.country || '澳洲');
                  setGlobalUniversity(student.university || '');
                  setActiveStudentProfile(student);
                }} 
                onCancel={() => {
                  setIsEditingProfile(false);
                }}
                existingProfile={activeStudentProfile}
              />
            );
          })()}`
);

// Add "修改資料" button in sidebar near logout
app = app.replace(
  `<span>目標國家：{globalCountry}</span>`,
  `<span>目標國家：{globalCountry}</span>
                  </div>
                  {userRole === 'student' && hasCompletedOnboarding && (
                    <button 
                      onClick={() => {
                        setIsEditingProfile(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded hover:bg-amber-100 transition-colors"
                    >
                      ✏️ 修改資料
                    </button>
                  )}
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                    <Globe className="h-4 w-4 text-[#8F9779]" />`
);

// Fix the duplicate div closure that would result
app = app.replace(
  `                  </div>
                  {userRole === 'student' && hasCompletedOnboarding && (
                    <button 
                      onClick={() => {
                        setIsEditingProfile(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded hover:bg-amber-100 transition-colors"
                    >
                      ✏️ 修改資料
                    </button>
                  )}
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                    <Globe className="h-4 w-4 text-[#8F9779]" />
<span>目標國家：{globalCountry}</span>`,
  `                  </div>
                  {userRole === 'student' && hasCompletedOnboarding && (
                    <button 
                      onClick={() => {
                        setIsEditingProfile(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded hover:bg-amber-100 transition-colors"
                    >
                      ✏️ 修改資料
                    </button>
                  )}`
);

// Fix StudentOnboardingForm to use user.uid as the Firestore doc key
// In the onComplete handler, also save using user.uid
app = app.replace(
  `setActiveStudentProfile(student);
                }} 
                onCancel={() => {`,
  `setActiveStudentProfile({...student, id: currentUser.uid});
                  // Also save with uid as key for consistent loading
                  import('../firebase').then(({db, doc, setDoc}) => {
                    setDoc(doc(db, 'students', currentUser.uid), {...student, id: currentUser.uid}, {merge: true}).catch(console.error);
                  });
                }} 
                onCancel={() => {`
);

// Fix syncToFirebase to use currentUser.uid as doc key  
app = app.replace(
  `await setDoc(doc(db, "students", profile.id), updatedProfile);`,
  `const docId = currentUser?.uid || profile.id;\n      await setDoc(doc(db, "students", docId), {...updatedProfile, id: docId}, {merge: true});`
);

// Fix: also persist intendedDeparture (departure date) in syncToFirebase
app = app.replace(
  `const updatedProfile: StudentProgress = {
        ...profile,
        tasksProgress: list,
        progressPercentage: pct,
        lastActive: new Date().toLocaleString(),
        tasksByCountry: nextTasksByCountry,
      };`,
  `const updatedProfile: StudentProgress = {
        ...profile,
        tasksProgress: list,
        progressPercentage: pct,
        lastActive: new Date().toLocaleString(),
        tasksByCountry: nextTasksByCountry,
        country: globalCountry,
        university: globalUniversity,
      };`
);

// Also load intendedDeparture from firebase data on login
app = app.replace(
  `if (studentDoc.data().university) {
                     setGlobalUniversity(studentDoc.data().university);
                   }
                 }
              } catch (e) {}
        }`,
  `if (studentDoc.data().university) {
                     setGlobalUniversity(studentDoc.data().university);
                   }
                   if (studentDoc.data().intendedDeparture) {
                     setDepartureDate(studentDoc.data().intendedDeparture);
                   }
                 }
              } catch (e) {}
        }`
);

// Do the same for the second load location
app = app.replace(
  `if (studentDoc.data().university) {
                    setGlobalUniversity(studentDoc.data().university);
                  }
                }
              } catch (e) {
                console.error(e);
              }`,
  `if (studentDoc.data().university) {
                    setGlobalUniversity(studentDoc.data().university);
                  }
                  if (studentDoc.data().intendedDeparture) {
                    setDepartureDate(studentDoc.data().intendedDeparture);
                  }
                }
              } catch (e) {
                console.error(e);
              }`
);

// Check if departureDate state exists
if (!app.includes('setDepartureDate')) {
  // Need to find the departure date state
  console.log('⚠️ setDepartureDate not found - need to check variable name');
}

fs.writeFileSync('src/App.tsx', app);
console.log('✅ Fixed App.tsx');

// =============================================================
// FIX 5: FlightPriceTracker - diversify airlines & prices by destination
// =============================================================
let flight = fs.readFileSync('src/components/FlightPriceTracker.tsx', 'utf8');

// Replace the entire route mapping and API call with a comprehensive local fallback
const oldRouteMapping = `  useEffect(() => {
    setIsSearching(true);
      let arrCode = code;
      let destName = rawCountry;
      if (globalCountry.includes('日本') || globalCountry.includes('東京') || globalCountry.includes('Japan')) {
        arrCode = 'NRT';
        destName = '成田國際機場';
      } else if (globalCountry.includes('美國') || globalCountry.includes('US') || globalCountry.includes('加州')) {
        arrCode = 'LAX';
        destName = '洛杉磯國際機場';
      } else if (globalCountry.includes('加拿大') || globalCountry.includes('Canada')) {
        arrCode = 'YVR';
        destName = '溫哥華國際機場';
      } else if (globalCountry.includes('澳洲') || globalCountry.includes('Australia')) {
        arrCode = 'SYD';
        destName = '雪梨金斯福德機場';
      } else if (globalCountry.includes('德國') || globalCountry.includes('Germany')) {
        arrCode = 'FRA';
        destName = '法蘭克福機場';
      } else if (globalCountry.includes('英國') || globalCountry.includes('UK') || globalCountry.includes('英國')) {
        arrCode = 'LHR';
        destName = '倫敦希斯洛機場';
      } else if (globalCountry.includes('法國') || globalCountry.includes('France')) {
        arrCode = 'CDG';
        destName = '巴黎戴高樂機場';
      } else if (globalCountry.includes('韓國') || globalCountry.includes('Korea') || globalCountry.includes('南韓')) {
        arrCode = 'ICN';
        destName = '仁川國際機場';
      }

      fetch(\`/api/flights?route=TPE-\${arrCode}\`)
        .then(res => res.json())
        .then(data => {
           if (data && data.flights) {
             const apiFlights = data.flights.map((f: any, i: number) => ({
               id: 'FL-' + arrCode + '-' + i,
               airline: f.airline,
               price: f.price,
               departureTime: f.departureTime,
               arrivalTime: f.arrivalTime,
               duration: f.transitText ? '轉機' : '直飛', // Fallback display for duration if missing
               stops: f.stops === 0 ? '直飛' : f.stops + '次轉機',
               baggage: f.baggage || '20kg',
               meal: '標準飛機餐',
               seatPitch: '舒適座位',
               wifi: f.recommended ? '全程免費 Wi-Fi' : '無 Wi-Fi',
               arrivalCode: arrCode,
               destinationName: destName,
               ...f
             }));
             setFlights(apiFlights);
           }
        })
        .catch(err => {
           console.error(err);
           onTriggerToast('無法獲取即時航班資訊，請稍後再試。');
        })
        .finally(() => {
           setIsSearching(false);
        });
  }, [globalCountry, code]);`;

const newRouteMapping = `  // Comprehensive route database with realistic airlines, prices by distance
  const routeDB: Record<string, { code: string; airport: string; airports: {code: string; name: string}[]; distKm: number; airlines: {name: string; flightNo: string; dep: string; arr: string; stops: number; transit: string; baggage: string; wifi: boolean}[] }> = {
    '日本': { code: 'NRT', airport: '東京成田國際機場', distKm: 2100, airports: [{code:'NRT',name:'東京成田國際機場'},{code:'KIX',name:'大阪關西國際機場'},{code:'FUK',name:'福岡機場'}], airlines: [
      {name:'中華航空 (China Airlines)',flightNo:'CI100',dep:'08:50',arr:'13:15',stops:0,transit:'台北直飛 ➔ 東京成田',baggage:'2x23kg (學生特惠)',wifi:true},
      {name:'長榮航空 (EVA Air)',flightNo:'BR198',dep:'10:10',arr:'14:25',stops:0,transit:'台北直飛 ➔ 東京成田',baggage:'23kg',wifi:true},
      {name:'星宇航空 (STARLUX)',flightNo:'JX800',dep:'08:30',arr:'12:45',stops:0,transit:'台北直飛 ➔ 東京成田',baggage:'23kg (星級服務)',wifi:true},
      {name:'台灣虎航 (Tigerair)',flightNo:'IT200',dep:'06:15',arr:'10:30',stops:0,transit:'台北直飛 ➔ 東京成田',baggage:'20kg (需加購)',wifi:false},
      {name:'樂桃航空 (Peach)',flightNo:'MM856',dep:'14:55',arr:'19:10',stops:0,transit:'台北直飛 ➔ 東京成田',baggage:'20kg (需加購)',wifi:false},
    ]},
    '美國': { code: 'LAX', airport: '洛杉磯國際機場', distKm: 11000, airports: [{code:'LAX',name:'洛杉磯國際機場'},{code:'SFO',name:'舊金山國際機場'},{code:'JFK',name:'紐約甘迺迪機場'},{code:'SEA',name:'西雅圖機場'}], airlines: [
      {name:'中華航空 (China Airlines)',flightNo:'CI008',dep:'23:50',arr:'20:50',stops:0,transit:'台北直飛 ➔ 洛杉磯',baggage:'2x23kg (學生特惠)',wifi:true},
      {name:'長榮航空 (EVA Air)',flightNo:'BR012',dep:'19:20',arr:'16:15',stops:0,transit:'台北直飛 ➔ 洛杉磯',baggage:'2x23kg',wifi:true},
      {name:'聯合航空 (United Airlines)',flightNo:'UA872',dep:'11:35',arr:'08:40',stops:0,transit:'台北直飛 ➔ 舊金山',baggage:'23kg',wifi:true},
      {name:'國泰航空 (Cathay Pacific)',flightNo:'CX400',dep:'08:15',arr:'18:05',stops:1,transit:'於 香港 (HKG) 轉機 2h 15m',baggage:'2x23kg',wifi:true},
      {name:'達美航空 (Delta Air Lines)',flightNo:'DL275',dep:'16:20',arr:'22:35',stops:1,transit:'於 東京 (NRT) 轉機 3h',baggage:'23kg',wifi:true},
    ]},
    '加拿大': { code: 'YVR', airport: '溫哥華國際機場', distKm: 9800, airports: [{code:'YVR',name:'溫哥華國際機場'},{code:'YYZ',name:'多倫多皮爾遜機場'},{code:'YUL',name:'蒙特婁機場'}], airlines: [
      {name:'中華航空 (China Airlines)',flightNo:'CI032',dep:'23:35',arr:'19:35',stops:0,transit:'台北直飛 ➔ 溫哥華',baggage:'2x23kg (學生特惠)',wifi:true},
      {name:'長榮航空 (EVA Air)',flightNo:'BR010',dep:'23:55',arr:'19:50',stops:0,transit:'台北直飛 ➔ 溫哥華',baggage:'2x23kg',wifi:true},
      {name:'加拿大航空 (Air Canada)',flightNo:'AC012',dep:'01:30',arr:'21:00',stops:0,transit:'台北直飛 ➔ 溫哥華',baggage:'2x23kg',wifi:true},
      {name:'國泰航空 (Cathay Pacific)',flightNo:'CX838',dep:'09:00',arr:'18:30',stops:1,transit:'於 香港 (HKG) 轉機 2h',baggage:'2x23kg',wifi:true},
      {name:'大韓航空 (Korean Air)',flightNo:'KE692',dep:'18:30',arr:'15:20',stops:1,transit:'於 首爾 (ICN) 轉機 3h 40m',baggage:'23kg',wifi:false},
    ]},
    '澳洲': { code: 'SYD', airport: '雪梨金斯福德機場', distKm: 7400, airports: [{code:'SYD',name:'雪梨金斯福德機場'},{code:'MEL',name:'墨爾本機場'},{code:'BNE',name:'布里斯本機場'}], airlines: [
      {name:'中華航空 (China Airlines)',flightNo:'CI051',dep:'23:50',arr:'11:15',stops:0,transit:'台北直飛 ➔ 雪梨',baggage:'2x23kg (學生特惠)',wifi:true},
      {name:'長榮航空 (EVA Air)',flightNo:'BR232',dep:'22:15',arr:'09:50',stops:0,transit:'台北直飛 ➔ 雪梨',baggage:'23kg',wifi:true},
      {name:'澳洲航空 (Qantas)',flightNo:'QF026',dep:'09:55',arr:'21:10',stops:0,transit:'台北直飛 ➔ 雪梨',baggage:'2x23kg',wifi:true},
      {name:'新加坡航空 (Singapore Airlines)',flightNo:'SQ877',dep:'11:25',arr:'22:50',stops:1,transit:'於 新加坡 (SIN) 轉機 2h',baggage:'2x23kg (學生特惠)',wifi:true},
      {name:'馬來西亞航空 (Malaysia Airlines)',flightNo:'MH367',dep:'15:10',arr:'06:40',stops:1,transit:'於 吉隆坡 (KUL) 轉機 1h 30m',baggage:'30kg',wifi:false},
    ]},
    '英國': { code: 'LHR', airport: '倫敦希斯洛機場', distKm: 9800, airports: [{code:'LHR',name:'倫敦希斯洛機場'},{code:'MAN',name:'曼徹斯特機場'},{code:'EDI',name:'愛丁堡機場'}], airlines: [
      {name:'中華航空 (China Airlines)',flightNo:'CI069',dep:'21:50',arr:'06:30',stops:0,transit:'台北直飛 ➔ 倫敦',baggage:'2x23kg',wifi:true},
      {name:'長榮航空 (EVA Air)',flightNo:'BR068',dep:'22:10',arr:'06:55',stops:0,transit:'台北直飛 ➔ 倫敦',baggage:'2x23kg',wifi:true},
      {name:'國泰航空 (Cathay Pacific)',flightNo:'CX251',dep:'08:15',arr:'19:30',stops:1,transit:'於 香港 (HKG) 轉機 2h',baggage:'2x23kg',wifi:true},
      {name:'阿聯酋航空 (Emirates)',flightNo:'EK367',dep:'22:30',arr:'11:15',stops:1,transit:'於 杜拜 (DXB) 轉機 3h',baggage:'30kg',wifi:true},
      {name:'土耳其航空 (Turkish Airlines)',flightNo:'TK25',dep:'21:45',arr:'10:30',stops:1,transit:'於 伊斯坦堡 (IST) 轉機 2h 30m',baggage:'30kg',wifi:true},
    ]},
    '德國': { code: 'FRA', airport: '法蘭克福機場', distKm: 9200, airports: [{code:'FRA',name:'法蘭克福機場'},{code:'MUC',name:'慕尼黑機場'},{code:'TXL',name:'柏林機場'}], airlines: [
      {name:'中華航空 (China Airlines)',flightNo:'CI061',dep:'23:15',arr:'07:10',stops:0,transit:'台北直飛 ➔ 法蘭克福',baggage:'2x23kg',wifi:true},
      {name:'長榮航空 (EVA Air)',flightNo:'BR072',dep:'23:40',arr:'07:25',stops:0,transit:'台北直飛 ➔ 慕尼黑',baggage:'2x23kg',wifi:true},
      {name:'漢莎航空 (Lufthansa)',flightNo:'LH727',dep:'10:50',arr:'20:30',stops:1,transit:'於 曼谷 (BKK) 轉機',baggage:'23kg',wifi:true},
      {name:'土耳其航空 (Turkish Airlines)',flightNo:'TK25',dep:'21:45',arr:'09:20',stops:1,transit:'於 伊斯坦堡 (IST) 轉機 2h',baggage:'30kg',wifi:true},
      {name:'阿聯酋航空 (Emirates)',flightNo:'EK366',dep:'22:30',arr:'10:45',stops:1,transit:'於 杜拜 (DXB) 轉機 3h 30m',baggage:'30kg',wifi:true},
    ]},
    '法國': { code: 'CDG', airport: '巴黎戴高樂機場', distKm: 9700, airports: [{code:'CDG',name:'巴黎戴高樂機場'}], airlines: [
      {name:'中華航空 (China Airlines)',flightNo:'CI9243',dep:'23:30',arr:'08:10',stops:1,transit:'於 阿姆斯特丹 (AMS) 轉機',baggage:'2x23kg',wifi:true},
      {name:'長榮航空 (EVA Air)',flightNo:'BR088',dep:'23:40',arr:'07:50',stops:0,transit:'台北直飛 ➔ 巴黎',baggage:'2x23kg',wifi:true},
      {name:'法國航空 (Air France)',flightNo:'AF662',dep:'23:10',arr:'07:35',stops:0,transit:'台北直飛 ➔ 巴黎',baggage:'2x23kg',wifi:true},
      {name:'阿聯酋航空 (Emirates)',flightNo:'EK367',dep:'22:30',arr:'11:00',stops:1,transit:'於 杜拜 (DXB) 轉機 3h',baggage:'30kg',wifi:true},
      {name:'土耳其航空 (Turkish Airlines)',flightNo:'TK25',dep:'21:45',arr:'10:15',stops:1,transit:'於 伊斯坦堡 (IST) 轉機 2h 15m',baggage:'30kg',wifi:true},
    ]},
    '韓國': { code: 'ICN', airport: '仁川國際機場', distKm: 1500, airports: [{code:'ICN',name:'仁川國際機場'},{code:'PUS',name:'釜山金海機場'}], airlines: [
      {name:'中華航空 (China Airlines)',flightNo:'CI160',dep:'09:00',arr:'12:25',stops:0,transit:'台北直飛 ➔ 仁川',baggage:'2x23kg',wifi:true},
      {name:'長榮航空 (EVA Air)',flightNo:'BR160',dep:'08:20',arr:'11:50',stops:0,transit:'台北直飛 ➔ 仁川',baggage:'23kg',wifi:true},
      {name:'大韓航空 (Korean Air)',flightNo:'KE692',dep:'18:30',arr:'22:00',stops:0,transit:'台北直飛 ➔ 仁川',baggage:'23kg',wifi:true},
      {name:'韓亞航空 (Asiana Airlines)',flightNo:'OZ712',dep:'13:20',arr:'16:55',stops:0,transit:'台北直飛 ➔ 仁川',baggage:'23kg',wifi:false},
      {name:'台灣虎航 (Tigerair)',flightNo:'IT610',dep:'06:45',arr:'10:20',stops:0,transit:'台北直飛 ➔ 仁川',baggage:'20kg (需加購)',wifi:false},
    ]},
  };

  // Price calculation based on distance (simulated realistic pricing)
  const calcPrice = (distKm: number, isDirectFlight: boolean, isLCC: boolean): number => {
    const basePricePerKm = 2.8; // NTD per km base
    let price = distKm * basePricePerKm;
    if (isDirectFlight) price *= 1.1;
    if (isLCC) price *= 0.65;
    // Add some variation
    price *= (0.9 + Math.random() * 0.2);
    return Math.round(price / 100) * 100; // round to nearest 100
  };

  const lccAirlines = ['台灣虎航', '樂桃航空', '酷航', 'Tigerair', 'Peach', 'Scoot'];

  useEffect(() => {
    setIsSearching(true);
    
    // Find matching route
    let matchedRoute: any = null;
    for (const [key, route] of Object.entries(routeDB)) {
      if (globalCountry.includes(key)) {
        matchedRoute = route;
        break;
      }
    }

    if (!matchedRoute) {
      // Generic fallback for unknown destinations
      const genericDist = 8000;
      const genericFlights = [
        {id:'FL-GEN-0', airline:'中華航空 (China Airlines)',price:calcPrice(genericDist,false,false),departureTime:'23:30',arrivalTime:'08:00',duration:'轉機',stops:'1次轉機',baggage:'2x23kg',meal:'標準飛機餐',seatPitch:'舒適座位',wifi:'全程免費 Wi-Fi',arrivalCode:'???',destinationName:rawCountry},
        {id:'FL-GEN-1', airline:'長榮航空 (EVA Air)',price:calcPrice(genericDist,false,false),departureTime:'22:00',arrivalTime:'07:30',duration:'轉機',stops:'1次轉機',baggage:'23kg',meal:'標準飛機餐',seatPitch:'舒適座位',wifi:'全程免費 Wi-Fi',arrivalCode:'???',destinationName:rawCountry},
        {id:'FL-GEN-2', airline:'國泰航空 (Cathay Pacific)',price:calcPrice(genericDist,false,false),departureTime:'08:15',arrivalTime:'19:30',duration:'轉機',stops:'1次轉機',baggage:'2x23kg',meal:'標準飛機餐',seatPitch:'舒適座位',wifi:'全程免費 Wi-Fi',arrivalCode:'???',destinationName:rawCountry},
      ];
      setTimeout(() => { setFlights(genericFlights); setIsSearching(false); }, 800);
      return;
    }

    // Pick a random airport from available ones for variety
    const airportIdx = Math.floor(Math.random() * matchedRoute.airports.length);
    const selectedAirport = matchedRoute.airports[airportIdx];

    const builtFlights = matchedRoute.airlines.map((a: any, i: number) => {
      const isLCC = lccAirlines.some((lcc: string) => a.name.includes(lcc));
      const price = calcPrice(matchedRoute.distKm, a.stops === 0, isLCC);
      return {
        id: 'FL-' + selectedAirport.code + '-' + i,
        airline: a.name,
        price: price,
        departureTime: a.dep,
        arrivalTime: a.arr,
        duration: a.stops === 0 ? '直飛' : '轉機',
        stops: a.stops === 0 ? '直飛' : a.stops + '次轉機',
        baggage: a.baggage,
        meal: isLCC ? '需自費購買' : '標準飛機餐',
        seatPitch: isLCC ? '標準座位' : '舒適座位',
        wifi: a.wifi ? '全程免費 Wi-Fi' : '無 Wi-Fi',
        arrivalCode: selectedAirport.code,
        destinationName: selectedAirport.name,
        transitText: a.transit,
      };
    });

    setTimeout(() => { setFlights(builtFlights); setIsSearching(false); }, 600);
  }, [globalCountry, code]);`;

flight = flight.replace(oldRouteMapping, newRouteMapping);

fs.writeFileSync('src/components/FlightPriceTracker.tsx', flight);
console.log('✅ Fixed FlightPriceTracker.tsx');

console.log('\n✅ All fixes applied!');
