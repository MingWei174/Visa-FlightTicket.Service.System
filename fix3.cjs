const fs = require('fs');
let lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');

const lineIndex = lines.findIndex(l => l.includes('country={selectedCountry}') && lines[lines.indexOf(l) + 1].includes('/>') && lines[lines.indexOf(l) + 2].includes('</motion.div>'));
if (lineIndex !== -1) {
  // We need to insert the closing brace for the visa tab and then flight and oshc_loan tabs
  const toInsert = `                )}

                {/* TAB CONTENT: Flight Price Tracker */}
                {studentTab === 'flight' && (
                  <motion.div key="flight" initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -20}} transition={{ duration: 0.3 }}>
                    <FlightPriceTracker globalCountry={globalCountry} onTriggerToast={triggerToast} />
                  </motion.div>
                )}

                {/* TAB CONTENT: OSHC & Loan Assistance */}
                {studentTab === 'oshc_loan' && (
                  <motion.div key="oshc_loan" initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -20}} transition={{ duration: 0.3 }}>`;

  // We find the <LoanAndOshc  and put it before it.
  const loanIndex = lines.findIndex(l => l.includes('<LoanAndOshc'));
  if (loanIndex !== -1) {
     lines.splice(lineIndex + 3, loanIndex - (lineIndex + 3), toInsert);
  }
}

fs.writeFileSync('src/App.tsx', lines.join('\n'));
