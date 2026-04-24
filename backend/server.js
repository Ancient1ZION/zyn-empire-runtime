'use strict';
const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));

const PORT = process.env.PORT || 3000;
const SAM_KEY = process.env.SAM_API_KEY || '';
const GROQ_KEY = process.env.GROQ_API_KEY || '';
const DISCORD = process.env.DISCORD_WEBHOOK || '';
const GAS_EMAIL = process.env.GAS_EMAIL_URL || '';
const OLLAMA = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const MIROFISH = process.env.MIROFISH_API || 'http://localhost:5001';

async function discord(webhook, msg) {
  if (!webhook) return;
  try { await axios.post(webhook, { content: msg }, { timeout: 5000 }); } catch(e) {}
}

async function callGroq(prompt) {
  if (!GROQ_KEY) return null;
  try {
    const r = await axios.post('https://api.groq.com/openai/v1/chat/completions',
      { model: 'llama-3.1-70b-versatile', messages: [{ role:'user', content:prompt }], max_tokens:500 },
      { headers: { Authorization: 'Bearer ' + GROQ_KEY }, timeout: 30000 });
    return r.data.choices[0]?.message?.content || '';
  } catch(e) { return null; }
}

app.get('/ping', (req, res) => res.json({ status:'ZYN Backend Running', version:'v6.6', uptime:process.uptime(), ts:new Date().toISOString() }));

app.get('/api/health', async (req, res) => {
  const checks = {};
  try { await axios.get(OLLAMA+'/api/tags',{timeout:3000}); checks.ollama='UP'; } catch(e) { checks.ollama='DOWN'; }
  try { await axios.get(MIROFISH+'/',{timeout:3000}); checks.mirofish='UP'; } catch(e) { checks.mirofish='DOWN'; }
  res.json({ healthy:true, checks, ts:new Date().toISOString() });
});

app.get('/api/sam/scan', async (req, res) => {
  try {
    const params = { api_key:SAM_KEY, limit:req.query.limit||100, naics:req.query.naics||'541512,541519,541611,541614', typeOfSetAside:'SBA' };
    const r = await axios.get('https://api.sam.gov/opportunities/v2/search', { params, timeout:30000 });
    res.json({ success:true, count:(r.data.opportunitiesData||[]).length, opportunities:r.data.opportunitiesData||[], ts:new Date().toISOString() });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.post('/api/usaspending/search', async (req, res) => {
  try {
    const r = await axios.post('https://api.usaspending.gov/api/v2/search/spending_by_award/', req.body, { timeout:30000 });
    res.json({ success:true, data:r.data, ts:new Date().toISOString() });
  } catch(e) { res.status(500).json({ error:e.message }); }
});

app.post('/api/ai/generate', async (req, res) => {
  const r = await callGroq(req.body.prompt);
  res.json({ success:!!r, response:r, ts:new Date().toISOString() });
});

app.post('/api/discord/send', async (req, res) => {
  await discord(req.body.webhook||DISCORD, req.body.content);
  res.json({ success:true });
});

app.post('/api/agent/trigger', async (req, res) => {
  const { agent, job } = req.body;
  await discord(DISCORD, 'Agent ' + agent + ' triggered: ' + job + ' at ' + new Date().toISOString());
  res.json({ success:true, agent, job, ts:new Date().toISOString() });
});

cron.schedule('0 * * * *', async () => {
  await discord(DISCORD, 'Noah: ZYN Empire alive on GCP VM. Uptime: ' + Math.round(process.uptime()/60) + 'min. ' + new Date().toISOString());
});

cron.schedule('0 */4 * * *', async () => {
  try {
    const today=new Date(),ago=new Date(today.getTime()-30*24*60*60*1000),fmt=d=>d.toLocaleDateString('en-US');
    const r=await axios.get('https://api.sam.gov/opportunities/v2/search',{params:{api_key:SAM_KEY,limit:100,postedFrom:fmt(ago),postedTo:fmt(today),naics:'541512,541519,541611,541614',typeOfSetAside:'SBA'},timeout:30000});
    const c=(r.data.opportunitiesData||[]).length;
    await discord(DISCORD,'Adam: SAM.gov scan complete. '+c+' opportunities. '+new Date().toISOString());
  } catch(e) { await discord(DISCORD,'Adam SAM error: '+e.message); }
});

cron.schedule('0 */2 * * *', async () => {
  if(!GAS_EMAIL) return;
  try {
    const r=await axios.post('https://api.usaspending.gov/api/v2/search/spending_by_award/',{filters:{time_period:[{start_date:'2026-01-01',end_date:new Date().toISOString().split('T')[0]}],award_type_codes:['A','B','C','D'],naics_codes:['541512','541519','541611','541614']},fields:['Recipient Name','Award Amount','Awarding Agency'],sort:'Award Amount',order:'desc',limit:5,page:1},{timeout:20000});
    let sent=0;
    for(const p of(r.data.results||[]).slice(0,5)){
      const co=p['Recipient Name']||'Contractor',ag=p['Awarding Agency']||'Agency';
      const body=await callGroq('3-sentence professional email from ZYN Supply Logistics LLC (SDVOSB) to '+co+' (works with '+ag+'). AI supply chain offer.')||'ZYN Supply Logistics LLC (SDVOSB) offers AI supply chain solutions for federal contractors. We noted your work with '+ag+'. Let us connect.';
      try{await axios.post(GAS_EMAIL,{action:'send_outreach',company:co,agency:ag,subject:'Partnership - ZYN Supply Logistics LLC (SDVOSB)',body,source:'sara-gcp',ts:new Date().toISOString()},{timeout:10000});}catch(e){}
      sent++;
    }
    await discord(DISCORD,'Sara: '+sent+' AI emails sent via GAS. '+new Date().toISOString());
  } catch(e){await discord(DISCORD,'Sara error: '+e.message);}
});

cron.schedule('0 */6 * * *', async () => {
  try{const r=await axios.post('https://api.grants.gov/v1/api/search2',{keyword:'artificial intelligence supply chain veteran',oppStatuses:'posted',rows:25},{timeout:30000});
  const c=r.data.data?.oppHits?.hits?.length||0;await discord(DISCORD,'Enoch: '+c+' grants found. '+new Date().toISOString());}catch(e){}
});

app.listen(PORT, () => {
  console.log('[ZYN] Backend running on port ' + PORT);
  discord(DISCORD, 'ZYN Backend STARTED v6.6. Port: '+PORT+'. '+new Date().toISOString());
});

module.exports = app;
