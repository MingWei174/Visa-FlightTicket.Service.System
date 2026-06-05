import xlsx from 'xlsx';
import fs from 'fs';

const workbook = xlsx.readFile('2026Partners.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const jsonData = xlsx.utils.sheet_to_json(worksheet);

fs.writeFileSync('src/data/partners.json', JSON.stringify(jsonData, null, 2));
console.log('Successfully converted 2026Partners.xlsx to src/data/partners.json');
