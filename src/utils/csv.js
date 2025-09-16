// src/utils/csv.js
export function parseCSV(text) {
  const rows = []; let row = []; let cur = ''; let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], next = text[i+1];
    if (inQuotes) { if (ch==='"'&&next==='"'){cur+='"';i++} else if (ch==='"'){inQuotes=false} else {cur+=ch} }
    else { if (ch==='"'){inQuotes=true} else if (ch===','){row.push(cur);cur=''} else if (ch==='\n'||ch==='\r'){ if (cur!==''||row.length){row.push(cur);rows.push(row);row=[];cur=''} if (ch==='\r'&&next==='\n') i++ } else {cur+=ch} }
  }
  if (cur!==''||row.length){row.push(cur);rows.push(row)}
  if (!rows.length) return { headers: [], rows: [] }
  const headers = rows[0].map(h => h.trim())
  return { headers, rows: rows.slice(1) }
}
