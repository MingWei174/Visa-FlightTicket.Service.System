const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(/console\.log\("New user document created in Firestore"\);/, `console.log("New user document created in Firestore");
            if (!ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
              setHasSeenAbout(false);
              localStorage.removeItem('has_seen_about');
            }`);

fs.writeFileSync('src/App.tsx', c);
