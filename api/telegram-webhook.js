const WEBAPP_URL = 'https://bonusrota.vercel.app';
const SUPABASE_URL = 'https://sjcldekwdheskknxiwtb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqY2xkZWt3ZGhlc2trbnhpd3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MzkyMzEsImV4cCI6MjA5ODUxNTIzMX0.ti3vUkRgXiJwYr7__qU_ZxHBdh9e3zi-G7tX7ypUdeA';

async function logEvent(eventType, telegramUserId, source){
  try{
    await fetch(`${SUPABASE_URL}/rest/v1/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ event_type: eventType, telegram_user_id: telegramUserId ?? null, source: source ?? null }),
    });
  }catch(e){ /* analytics hatası bot akışını kesmesin */ }
}

const START_MESSAGE = [
  "👋 *BonusRota'ya hoş geldin!*",
  '',
  '🎁 Ödülleri ve fırsatları görebilmek için ilk adımın, aşağıdaki butona basıp siteye giriş yapmak ve hesap oluşturmak olmalı. Kayıt olduğunda:',
  '✅ Güncel deneme bonuslarına',
  '✅ Özel hediyelere ve kampanyalara',
  '✅ Sadece üyelere özel fırsatlara',
  'erişebilirsin.',
  '',
  '🔞 İçerik +18 yaş sınırlıdır. Lütfen sorumlu oyun ilkelerine uygun hareket et.',
  '',
  '👇 Hemen başlamak için butona bas:',
].join('\n');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(200).send('ok');
    return;
  }

  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (expectedSecret && req.headers['x-telegram-bot-api-secret-token'] !== expectedSecret) {
    res.status(401).send('unauthorized');
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const message = req.body && req.body.message;
  const text = message && message.text;

  if (token && message && text && text.split(' ')[0] === '/start') {
    const source = text.split(' ')[1] || null;
    await logEvent('bot_start', message.from && message.from.id, source);

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: message.chat.id,
        text: START_MESSAGE,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '🚀 Siteye Gir', web_app: { url: WEBAPP_URL } },
          ]],
        },
      }),
    });
  }

  res.status(200).send('ok');
};
