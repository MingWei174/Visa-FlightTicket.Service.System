const fs = require('fs');
const data = fs.readFileSync('C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\1f6be08a-b34e-418b-a09b-d6bbe494bbab\\.system_generated\\logs\\transcript.jsonl', 'utf8');
const matches = [...data.matchAll(/"ReplacementContent":"(.*?)"/g)];
let output = '';
matches.forEach(m => {
  let str = m[1];
  try { str = JSON.parse('"' + str + '"'); } catch(e) {}
  output += str + '\n\n===================\n\n';
});
fs.writeFileSync('extracted_replacements.txt', output);
console.log('Wrote ' + matches.length + ' replacements');
