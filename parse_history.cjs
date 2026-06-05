const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream('C:\\\\Users\\\\USER\\\\.gemini\\\\antigravity-ide\\\\brain\\\\1f6be08a-b34e-418b-a09b-d6bbe494bbab\\\\.system_generated\\\\logs\\\\transcript.jsonl');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let allEdits = [];

  for await (const line of rl) {
    try {
      const obj = JSON.parse(line);
      if (obj.tool_calls) {
        obj.tool_calls.forEach(tc => {
          if (tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content' || tc.name === 'write_to_file') {
            let args = tc.args;
            if (typeof args === 'string') {
              try { args = JSON.parse(args); } catch(e) {}
            }
            if (args && args.TargetFile && args.TargetFile.includes('App.tsx')) {
              allEdits.push(args);
            }
          }
        });
      }
    } catch(e) {}
  }

  fs.writeFileSync('app_tsx_history.json', JSON.stringify(allEdits, null, 2));
  console.log('Saved', allEdits.length, 'edits');
}

processLineByLine();
