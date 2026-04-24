'use strict';
const axios = require('axios');
// Sara -- AI Email Outreach via GAS relay
async function runSaraOutreach(prospects, groqKey, gasEmailUrl) {
  if (!gasEmailUrl) { console.warn('[Sara] GAS_EMAIL_URL not set'); return { sent:0 }; }
  let sent = 0;
  for (const p of prospects.slice(0,10)) {
    const co = p['Recipient Name'] || p.company || 'Federal Contractor';
    const ag = p['Awarding Agency'] || p.agency || 'Federal Agency';
    let body = 'Dear ' + co + ' Team, ZYN Supply Logistics LLC (SDVOSB) offers AI supply chain optimization for contractors working with ' + ag + '. Let us connect.';
    if (groqKey) {
      try {
        const r = await axios.post('https://api.groq.com/openai/v1/chat/completions',
          { model: 'llama-3.1-70b-versatile', messages: [{ role:'user', content:'Write 3-sentence cold email from ZYN Supply Logistics LLC (SDVOSB veteran) to ' + co + ' who works with ' + ag + '. Professional, concise.' }], max_tokens:200 },
          { headers: { Authorization: 'Bearer ' + groqKey }, timeout:20000 });
        if (r.data.choices[0]?.message?.content) body = r.data.choices[0].message.content;
      } catch(e) {}
    }
    try {
      await axios.post(gasEmailUrl, { action:'send_outreach', company:co, agency:ag, subject:'Partnership -- ZYN Supply Logistics LLC (SDVOSB)', body, source:'sara-gcp', ts:new Date().toISOString() }, { timeout:10000 });
    } catch(e) {}
    sent++;
  }
  return { sent, total: prospects.length };
}
module.exports = { runSaraOutreach };
