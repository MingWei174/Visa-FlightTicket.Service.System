const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(/onClick=\{\(\) \=\> setStudentTab\(tab\.key\)\}\n\s+studentTab === tab\.key/, 
`onClick={() => setStudentTab(tab.key)}
                      className={\`py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-1 px-1 whitespace-nowrap cursor-pointer \${
                        studentTab === tab.key`);

c = c.replace(/<GlobalUniversityMap globalCountry=\{globalCountry\} setGlobalCountry=\{setGlobalCountry\} \/>/, 
`<GlobalUniversityMap 
                          globalCountry={globalCountry} 
                          setGlobalCountry={setGlobalCountry} 
                          onSetTarget={(country, uni) => {
                            setGlobalCountry(country);
                            setGlobalUniversity(uni);
                            setStudentTab('overview');
                            triggerToast(\`已將留學目標設為：\${uni}\`);
                          }}
                        />`);

fs.writeFileSync('src/App.tsx', c);
