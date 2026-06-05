const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

const search = `               setUserRole('student');
               // Optionally correct the DB here if it was wrong
               await setDoc(userDocRef, { role: 'student' }, { merge: true });`;

const replacement = `               setUserRole('student');
               // Load student profile
               try {
                 const studentDoc = await getDoc(doc(db, 'students', user.uid));
                 if (studentDoc.exists()) {
                   setActiveStudentProfile(studentDoc.data() as any);
                   setHasCompletedOnboarding(true);
                   localStorage.setItem('has_completed_onboarding', 'true');
                   if (studentDoc.data().tasksByCountry) {
                     setTasksByCountry(studentDoc.data().tasksByCountry);
                   }
                   if (studentDoc.data().country) {
                     setGlobalCountry(studentDoc.data().country);
                   }
                   if (studentDoc.data().university) {
                     setGlobalUniversity(studentDoc.data().university);
                   }
                 }
               } catch (e) {
                 console.error(e);
               }
               // Optionally correct the DB here if it was wrong
               await setDoc(userDocRef, { role: 'student' }, { merge: true });`;

c = c.replace(search, replacement);

const search2 = `        if (ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
          setUserRole('advisor');
        } else {
          setUserRole('student');
        }`;

const replacement2 = `        if (ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
          setUserRole('advisor');
        } else {
          setUserRole('student');
          try {
             const studentDoc = await getDoc(doc(db, 'students', user.uid));
             if (studentDoc.exists()) {
               setActiveStudentProfile(studentDoc.data() as any);
               setHasCompletedOnboarding(true);
               localStorage.setItem('has_completed_onboarding', 'true');
               if (studentDoc.data().tasksByCountry) {
                 setTasksByCountry(studentDoc.data().tasksByCountry);
               }
               if (studentDoc.data().country) {
                 setGlobalCountry(studentDoc.data().country);
               }
               if (studentDoc.data().university) {
                 setGlobalUniversity(studentDoc.data().university);
               }
             }
          } catch (e) {}
        }`;

c = c.replace(search2, replacement2);
fs.writeFileSync('src/App.tsx', c);
