# BonusRota

Deneme bonusu listeleme sitesi + Telegram Mini App botu (`@bonusrota_webbot`). Statik HTML, Vercel'de yayında, veri Firebase Firestore'da.

- Site: https://bonusrota.vercel.app
- Admin: `/admin/` (site ekle/düzenle/sil)
- İstatistik: `/admin/stats.html` (bot /start, site açılışı, kaynak dağılımı)
- Gizlilik/sorumlu oyun: `/privacy.html`
- Bot: https://t.me/bonusrota_webbot (Mini App: `t.me/bonusrota_webbot/appweb`)

## Mimari

- `index.html`, `admin/*.html`: Firebase compat SDK ile Firestore'a doğrudan bağlanır (`firebaseConfig`, proje `bonusrota`)
- `api/telegram-webhook.js`: Vercel serverless, Telegram webhook. `/start` gelince karşılama mesajı + "Siteye Gir" butonu gönderir, `events` koleksiyonuna `bot_start` yazar (Firestore REST)
- `firestore.rules`: açık kurallar (test modu), koruma sadece admin şifre ekranı

## Firestore koleksiyonları

- `sites`: `name, bonus, type, tag (trend|popular), link, logo, display_order, active`
- `events`: `event_type (bot_start|site_open), telegram_user_id, source, created_at`

## Vercel ortam değişkenleri

- `TELEGRAM_BOT_TOKEN`: BotFather token
- `TELEGRAM_WEBHOOK_SECRET`: webhook doğrulama gizli anahtarı

Değiştirince redeploy gerekir.

## Webhook kurulumu

```
curl "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://bonusrota.vercel.app/api/telegram-webhook" \
  -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

## Firestore kuralları deploy

```
npx firebase deploy --only firestore:rules --project bonusrota
```

## Kaynak takibi

Reklam/link başına `t.me/bonusrota_webbot?start=<kaynak>` kullan. `<kaynak>` stats sayfasında ayrı satır olarak görünür.

## Not

Site Firestore'a ulaşamazsa `index.html` içindeki yedek `SITES` listesini gösterir. Admin'den yapılan değişiklikler yedek listeye yansımaz.
