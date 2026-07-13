import xlsx from 'xlsx';

async function main() {
  const xlsxPath = 'c:/Users/김성규/Desktop/HASTE-Company/products.xlsx';
  console.log('Reading products.xlsx...');
  
  const workbook = xlsx.readFile(xlsxPath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: any[] = xlsx.utils.sheet_to_json(worksheet);
  
  const targetNumbers = ['283', '295', '641', '642', '232', '566', '571', '572', '765', '767', '22', '23', '11'];
  
  console.log('\n--- Searching Suffix Matches in Excel ---');
  rows.forEach(r => {
    const code = String(r['상품코드'] || '');
    const name = String(r['상품명'] || '');
    
    // Check if the code ends with any of the target numbers (ignoring prefix and padding zeros)
    targetNumbers.forEach(num => {
      const padded = num.padStart(6, '0');
      if (code.endsWith(num) || code.endsWith(padded)) {
        console.log(`Matched Target: ${num} ➔ Excel Code: ${code} | Product Name: ${name} | Category: ${r['대분류']}`);
      }
    });
  });
}

main().catch(err => {
  console.error(err);
});
