const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
const target = '{/* ==================== MAIN BODY CONTAINER ==================== */}';
const injection = `
          {currentUser && userRole === 'student' && hasSeenAbout && !hasCompletedOnboarding && (
            <StudentOnboardingForm 
              onComplete={(student) => {
                setHasCompletedOnboarding(true);
                localStorage.setItem('has_completed_onboarding', 'true');
                setGlobalCountry(student.university.includes('日本') || student.university.includes('東京') || student.university.includes('早稻田') || student.university.includes('京都') ? '日本' : student.university.includes('美國') || student.university.includes('加州') || student.university.includes('哈佛') || student.university.includes('史丹佛') ? '美國' : student.university.includes('加拿大') || student.university.includes('多倫多') || student.university.includes('滑鐵盧') ? '加拿大' : '澳洲');
              }}
              initialCountry="日本"
            />
          )}
`;
content = content.replace(target, target + injection);
fs.writeFileSync('src/App.tsx', content);
