# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

BonusRota is a Turkish-language "deneme bonusu" (betting/casino trial-bonus) affiliate listing site — the sister project to BonusUfku, sharing the same concept and layout with its own purple/gold theme. It is a static, no-build, no-framework project: self-contained HTML files (each with inline `<style>` and `<script>`) backed directly by Firebase Firestore via the `firebase-app-compat`/`firebase-firestore-compat` CDN clients. There is no package.json, no bundler, no build step, and no test suite.

**Backend history:** originally used Supabase/Postgres. On 2026-09-16/17 the Supabase project was found fully deleted (DNS for its subdomain returned NXDOMAIN, not just a "paused" error) — most likely because the account's Supabase org free-tier project limit was exceeded by a newer project, causing the oldest/least-active project to be purged. This is the exact same failure mode BonusUfku had already hit once (see its own CLAUDE.md). BonusRota was migrated to Firebase Firestore (Firebase project `bonusrota`) to avoid a repeat. `schema.sql` (Postgres) and `.github/workflows/supabase-keepalive.yml` were removed as part of this migration — Firestore has no equivalent free-tier auto-pause/delete behavior that needs a keepalive ping.

## Repository structure

- `index.html` — the public-facing site. Single page, mobile-first (max-width 460px container), dark purple/gold theme. Lists bonus sites in "Trend" / "Popüler" sections with filter pills, plus a gamified "wheel spin" and "treasure chest" modal that reveal a bonus site/amount. Also logs a `site_open` analytics event to Firestore on load (see Analytics below).
- `privacy.html` — static privacy policy / responsible-gaming / +18 notice page (TR + EN), used as the URL for the Telegram bot's BotFather Privacy Policy field.
- `admin/index.html` — password-gated admin panel (`ADMIN_PASSWORD` = `telegram202545`) for managing the `sites` Firestore collection (add/edit/delete docs, reorder, toggle active). No real auth: password check happens entirely client-side in JS.
- `admin/stats.html` — password-gated (same password) live analytics dashboard reading the `events` Firestore collection: total bot starts, site opens, unique users, per-source breakdown, live event feed. Polls every 5s.
- `api/telegram-webhook.js` — Vercel serverless function (no npm deps, uses global `fetch`) acting as the Telegram bot's (`@bonusrota_webbot`) webhook. On `/start`, sends a welcome message with an inline `web_app` button opening the site, and logs a `bot_start` event to Firestore via the REST API (no service account needed — Firestore rules are open, see below). Reads `TELEGRAM_BOT_TOKEN` and `TELEGRAM_WEBHOOK_SECRET` from Vercel environment variables (never hardcoded — repo is public). Validates the `X-Telegram-Bot-Api-Secret-Token` header against `TELEGRAM_WEBHOOK_SECRET`.
- `firestore.rules` / `firebase.json` / `.firebaserc` — Firestore config; rules are wide open (`allow read, write: if true`) — "test mode", same risk tolerance as before (client-side password gate is the only real protection).
- `README.md` — Turkish runbook for the Firebase setup (architecture, env vars, webhook, rules deploy, source tracking). Rewritten after the Supabase removal.

## Live state (as of 2026-09-19)

- Site `https://bonusrota.vercel.app`, bot `@bonusrota_webbot`, Mini App link `t.me/bonusrota_webbot/appweb`. Webhook is set to `/api/telegram-webhook` with a secret token; 0 pending updates at last check.
- Firestore `sites` holds 9 real sites, all tikobey affiliate links: Stake (`shr.pn/tikobeystake`), 1xBet (`tikobey1x`), Grand Pasha (`tikobeygrand`), Roma Bet (`tikobeyroma`), CasinoDior (`tikodior`), BayConti (`tikobayconti`), Gamdom (`tikobeygamdom`), GoneBET (`gonetikobey`), Bizbet (`tikobeybizbet`). The fallback `SITES` array in `index.html` mirrors this list.
- Sister project BonusUfku (`C:\Users\Pepe\Projects\bonusufku`, `@bonusufku_webbot`, Firebase project `bonusufku`) has the same architecture and the same 9 sites.
- Vercel team/project IDs and env-var/redeploy API calls are in the `project_bonus_sites_vercel_automation` memory. Tokens and bot tokens live only in Vercel env vars and memory, never in this public repo.

## Open items

- No custom domain yet (Spaceship was discussed). When bought: add it in Vercel, update `WEBAPP_URL` in `api/telegram-webhook.js`, and change the Web App URL in BotFather (`/myapps`).
- Telegram Ads research parked: the official platform prohibits gambling (and needs a €2000 minimum), so sponsored posts via marketplaces like Telega.io are the realistic route. Use `?start=<source>` links per placement to track results in `admin/stats.html`.
- Not yet verified in a real browser that the migrated `index.html` renders Firestore data (only HTTP 200 and a doc count were checked).

## Analytics

- `events` Firestore collection documents: `event_type ('bot_start'|'site_open'), telegram_user_id, source, created_at` (ISO string). `source` is parsed from a `/start <param>` deep-link payload for ad/referral tracking.
- Same open-access pattern as `sites`: anyone can read/write via the Firestore REST API or client SDK, protected only by the admin password gate in `admin/stats.html` — not a real authorization boundary.

## Architecture / data flow

- `index.html`, `admin/index.html`, and `admin/stats.html` each hardcode the same `firebaseConfig` (apiKey, projectId `bonusrota`, etc.) at the top of their `<script>` block and call `firebase.initializeApp(...)` directly in the browser. `api/telegram-webhook.js` talks to Firestore over its plain REST API instead (no SDK, no service account — relies on the open rules).
- `sites` Firestore collection documents: `name, bonus, type, tag ('trend'|'popular'), link, logo, display_order, active`. Document IDs are Firestore's auto-generated string IDs (no numeric `id` like the old Supabase schema).
- `index.html` fetches `sites` on load (`loadSites()`); if Firestore is unreachable or returns no rows, it silently falls back to a hardcoded `SITES` array in the JS (kept up to date with the real current site list) so the page is never empty.
- `admin/index.html` writes directly to Firestore on every field change (`updateField`, `addSite`, `deleteSite`) — changes are live immediately, no separate publish step.
- The wheel and treasure-chest features pick a random entry from the currently loaded `SITES`/`wheelData` array purely client-side (not tied to real odds or backend state).
- `index.html` and `admin/stats.html` load `https://telegram.org/js/telegram-web-app.js` so `window.Telegram.WebApp.initDataUnsafe` (user id, start_param) is available when opened as a Telegram Mini App — without this script the WebApp bridge does not reliably exist.

## Working in this repo

- There is no build, lint, or test command — edit the HTML files directly and open them in a browser (or run any static file server, e.g. `python3 -m http.server`) to preview.
- Deployment target is Vercel as a static site (`bonusrota.vercel.app`, no build command, "Other/Static" framework preset).
- Because Firebase config is embedded directly in the HTML `<script>` tags, any change to `firebaseConfig` must be made identically across `index.html`, `admin/index.html`, and `admin/stats.html`.
- Firestore rules changes must be applied via `npx firebase deploy --only firestore:rules --project bonusrota` (Firebase CLI is installed and already authenticated as depofiti@gmail.com on this machine) and kept in sync with `firestore.rules` in this repo.
- Vercel env vars/redeploys for this project can be managed via the Vercel REST API instead of the dashboard — see the `project_bonus_sites_vercel_automation` memory for the token and exact calls.
- All UI copy/strings are in Turkish; keep new UI text consistent with the existing tone and language.
