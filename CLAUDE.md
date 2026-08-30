# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

BonusRota is a Turkish-language "deneme bonusu" (betting/casino trial-bonus) affiliate listing site. It is a static, no-build, no-framework project: two self-contained HTML files (each with inline `<style>` and `<script>`) backed directly by Supabase (Postgres) via the `@supabase/supabase-js` CDN client. There is no package.json, no bundler, no build step, and no test suite.

## Repository structure

- `index.html` — the public-facing site. Single page, mobile-first (max-width 460px container), dark purple/gold theme. Lists bonus sites in "Trend" / "Popüler" sections with filter pills, plus a gamified "wheel spin" and "treasure chest" modal that reveal a bonus site/amount. Also logs a `site_open` analytics event to Supabase on load (see Analytics below).
- `privacy.html` — static privacy policy / responsible-gaming / +18 notice page (TR + EN), used as the URL for the Telegram bot's BotFather Privacy Policy field.
- `admin/index.html` — password-gated admin panel for managing the `sites` table (add/edit/delete rows, reorder, toggle active). No real auth: password check (`ADMIN_PASSWORD` constant) happens entirely client-side in JS.
- `admin/stats.html` — password-gated (same `ADMIN_PASSWORD` pattern) live analytics dashboard reading the `events` table: total bot starts, site opens, unique users, per-source breakdown, live event feed. Polls every 5s (no Supabase Realtime subscription).
- `api/telegram-webhook.js` — Vercel serverless function (no npm deps, uses global `fetch`) acting as the Telegram bot webhook. On `/start`, sends a welcome message with an inline `web_app` button opening the site, and logs a `bot_start` event to Supabase. Reads `TELEGRAM_BOT_TOKEN` and `TELEGRAM_WEBHOOK_SECRET` from Vercel environment variables (never hardcoded — repo is public). Validates the `X-Telegram-Bot-Api-Secret-Token` header against `TELEGRAM_WEBHOOK_SECRET`.
- `schema.sql` — Supabase/Postgres schema for the `sites` and `events` tables, RLS policies, and seed data. Paste directly into the Supabase SQL Editor to (re)provision the DB.
- `.github/workflows/supabase-keepalive.yml` — cron GitHub Action (every 3 days) that curls the Supabase REST endpoint so the free-tier project doesn't auto-pause after 7 days of inactivity.
- `README.md` — Turkish deployment runbook (Supabase project setup → fill in keys → push to GitHub → deploy to Vercel → keepalive → using the admin panel).

## Analytics

- `events` table (`id, event_type, telegram_user_id, source, created_at`) captures two event types: `bot_start` (from the Telegram webhook, on every `/start`, with `source` parsed from a `/start <param>` deep-link payload for ad/referral tracking) and `site_open` (from `index.html` on every page load, capturing the Telegram user id and `start_param` when opened as a Telegram Mini App via `window.Telegram.WebApp`).
- Same RLS pattern as `sites`: anon key has full insert/select access, protected only by the fact that reading it requires the admin password gate in `admin/stats.html` — not a real authorization boundary.

## Architecture / data flow

- Both `index.html` and `admin/index.html` hardcode `SUPABASE_URL` and `SUPABASE_ANON_KEY` at the top of their `<script>` block and call `supabase.createClient(...)` directly in the browser. There is no server/API layer.
- `sites` table columns: `id, name, bonus, type, tag ('trend'|'popular'), link, logo, display_order, active, created_at`.
- RLS: anon key has full read access to active rows (`Public read active sites`) AND full insert/update/delete access (`Anon full access for admin panel`) — the admin panel's "auth" is only the client-side password gate in `admin/index.html`, not a real authorization boundary. Treat the anon key/admin URL as sensitive even though it's technically public in the page source.
- `index.html` fetches `sites` on load (`loadSites()`); if Supabase is unreachable or returns no rows, it silently falls back to a hardcoded `SITES` array in the JS so the page is never empty.
- `admin/index.html` writes directly to Supabase on every field change (`updateField`, `addSite`, `deleteSite`) — changes are live immediately, no separate publish step.
- The wheel and treasure-chest features pick a random entry from the currently loaded `SITES`/`wheelData` array purely client-side (not tied to real odds or backend state).

## Working in this repo

- There is no build, lint, or test command — edit the HTML files directly and open them in a browser (or run any static file server, e.g. `python3 -m http.server`) to preview.
- Deployment target is Vercel as a static site (no build command, "Other/Static" framework preset per README).
- Because Supabase credentials are embedded directly in the HTML `<script>` tags, any change to `SUPABASE_URL`/`SUPABASE_ANON_KEY` must be made identically in both `index.html` and `admin/index.html`. The keepalive workflow also hardcodes the same anon key.
- Schema changes must be applied manually in the Supabase SQL Editor (there is no migration tooling) and kept in sync with `schema.sql` in this repo.
- All UI copy/strings are in Turkish; keep new UI text consistent with the existing tone and language.
