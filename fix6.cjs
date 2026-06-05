const fs = require('fs');
let c = fs.readFileSync('src/components/StudentOnboardingForm.tsx', 'utf8');

c = c.replace(/export default function StudentOnboardingForm\(\{\n  onComplete,\n  existingProfile\n\}: \{\n  onComplete: \(student: Student\) => void;\n  existingProfile\?: Student \| null;\n\}\) \{/g, `export default function StudentOnboardingForm({
  onComplete,
  onCancel,
  existingProfile
}: {
  onComplete: (student: Student) => void;
  onCancel?: () => void;
  existingProfile?: Student | null;
}) {`);

c = c.replace(/await setDoc\(doc\(db, "students", studentId\), newStudent\);/, `await setDoc(doc(db, "students", studentId), newStudent, { merge: true });`);

const cancelBtnHtml = `              <div className="flex gap-4 pt-6">
                {existingProfile && onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 bg-white border border-[#D6D2C4] text-[#7A8270] py-4 rounded-xl font-medium hover:bg-[#F9F8F6] transition-all shadow-[0_4px_14px_0_rgb(0,0,0,0.05)] hover:shadow-[0_6px_20px_rgb(0,0,0,0.1)] hover:-translate-y-0.5 tracking-wider"
                  >
                    取消修改
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-[2] bg-[#5C6551] text-white py-4 rounded-xl font-medium hover:bg-[#4A5241] transition-all shadow-[0_4px_14px_0_rgb(92,101,81,0.39)] hover:shadow-[0_6px_20px_rgba(92,101,81,0.23)] hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>{existingProfile ? '儲存修改' : '開始您的旅程'}</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>`;

c = c.replace(/<button[\s\S]*?\{existingProfile \? '儲存修改' : '開始您的旅程'\}[\s\S]*?<\/button>/, cancelBtnHtml);

fs.writeFileSync('src/components/StudentOnboardingForm.tsx', c);
