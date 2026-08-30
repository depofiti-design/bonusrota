const WEBAPP_URL = 'https://bonusrota.vercel.app';

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

  if (token && message && message.text === '/start') {
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
