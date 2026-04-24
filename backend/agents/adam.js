'use strict';
const axios = require('axios');
// Adam -- Government Contracts Scout
async function scanSAMGov(samKey) {
  const today = new Date(), ago = new Date(today.getTime()-30*24*60*60*1000);
  const fmt = d => d.toLocaleDateString('en-US');
  try {
    const r = await axios.get('https://api.sam.gov/opportunities/v2/search', {
      params: { api_key: samKey, limit: 100, postedFrom: fmt(ago), postedTo: fmt(today), naics: process.env.ZYN_NAICS || '541512,541519,541611,541614', typeOfSetAside: 'SBA' },
      timeout: 30000
    });
    return r.data.opportunitiesData || [];
  } catch(e) { console.error('[Adam] SAM error:', e.message); return []; }
}
async function scanUSASpending() {
  const today = new Date(), ago = new Date(today.getTime()-30*24*60*60*1000);
  const fmt = d => d.toISOString().split('T')[0];
  try {
    const r = await axios.post('https://api.usaspending.gov/api/v2/search/spending_by_award/', {
      filters: { time_period: [{start_date:fmt(ago),end_date:fmt(today)}], award_type_codes:['A','B','C','D'], naics_codes:['541512','541519','541611','541614'] },
      fields: ['Award ID','Recipient Name','Award Amount','Awarding Agency'],
      sort:'Award Amount', order:'desc', limit:50, page:1
    }, { timeout: 30000 });
    return r.data.results || [];
  } catch(e) { console.error('[Adam] USASpending error:', e.message); return []; }
}
module.exports = { scanSAMGov, scanUSASpending };
