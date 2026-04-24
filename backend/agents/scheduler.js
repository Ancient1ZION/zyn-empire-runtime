'use strict';
const cron = require('node-cron');
const { scanSAMGov, scanUSASpending } = require('./adam');
const { runSaraOutreach } = require('./sara');
// ZYN 24/7 Autonomous Scheduler
function startScheduler({ samKey, groqKey, discordWebhook, gasEmailUrl, discord }) {
  console.log('[ZYN] 24/7 Scheduler starting...');
  cron.schedule('0 * * * *', async () => { await discord(discordWebhook, 'Noah: ZYN alive ' + new Date().toISOString()); });
  cron.schedule('0 */4 * * *', async () => {
    const [o,u] = await Promise.all([scanSAMGov(samKey), scanUSASpending()]);
    await discord(discordWebhook, 'Adam: ' + (o.length+u.length) + ' opportunities ' + new Date().toISOString());
  });
  cron.schedule('0 */2 * * *', async () => {
    const p = await scanUSASpending();
    const r = await runSaraOutreach(p, groqKey, gasEmailUrl);
    await discord(discordWebhook, 'Sara: ' + r.sent + ' emails sent ' + new Date().toISOString());
  });
  console.log('[ZYN] All schedules active');
}
module.exports = { startScheduler };
