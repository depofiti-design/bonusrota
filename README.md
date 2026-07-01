[README.md](https://github.com/user-attachments/files/29575845/README.md)
# BonusRota — Canlıya Alma Adımları

## 1. Supabase projesi oluştur
1. supabase.com → New Project → adı: `bonusrota` (Frankfurt/EU bölgesini seç, kipzone'da da o bölgeyi kullanmıştın)
2. Proje açılınca sol menü → **SQL Editor** → `schema.sql` dosyasının içeriğini yapıştır → Run
3. Sol menü → **Project Settings → API** → şunları not al:
   - `Project URL`
   - `anon public` key

## 2. Anahtarları dosyalara işle
Aşağıdaki iki dosyada `YOUR_PROJECT` ve `YOUR_ANON_KEY` yerlerini doldur:
- `index.html` (üstte `SUPABASE_URL` / `SUPABASE_ANON_KEY`)
- `admin/index.html` (aynı satırlar)

İstersen admin şifresini de değiştir: `admin/index.html` içinde `ADMIN_PASSWORD` satırı (şu an: `bonusrota2025`).

## 3. GitHub'a it (Claude Code'da)
```
cd bonusrota
git init
git add .
git commit -m "BonusRota ilk sürüm"
gh repo create depofiti-design/bonusrota --public --source=. --push
```
(GitHub CLI kurulu değilse: github.com üzerinden repo oluşturup `git remote add origin ...` ile bağlayabilirsin.)

## 4. Vercel'e deploy et
- vercel.com → Add New Project → GitHub reposunu seç → Deploy
- Framework: **Other** / **Static** (build komutu yok, direkt statik dosyalar)
- Deploy sonrası adres: `bonusrota.vercel.app` (Vercel otomatik verir, istersen Project Settings'ten değiştirilebilir)

## 5. Supabase'in uyumasını engelle
Free tier projeler 7 gün işlem görmeyince duraklıyor (kipzone'da yaşadığın sorun). UptimeRobot'a
`https://YOUR_PROJECT.supabase.co/rest/v1/` adresini her 5 dakikada bir ping atacak şekilde ekle.

## 6. Site ekleme / düzenleme
`bonusrota.vercel.app/admin/` adresine git, şifreyi gir, siteleri buradan yönet.
Değişiklikler anasayfada anında görünür (sayfa yenilendiğinde).

---
**Not:** `index.html` içinde Supabase'e bağlanılamazsa (internet sorunu, yanlış anahtar vb.)
sayfa otomatik olarak dosya içindeki yedek listeye düşer, site hiç boş görünmez.
