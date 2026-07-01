-- BonusRota / Bonus Ufku ortak şeması
-- Supabase Dashboard > SQL Editor içine yapıştırıp çalıştır.

create table if not exists sites (
  id bigint generated always as identity primary key,
  name text not null,
  bonus text not null,
  type text not null default 'Deneme Bonusu',
  tag text not null default 'trend',      -- 'trend' | 'popular'
  link text default '#',
  logo text default '',                    -- boş bırakılırsa isim baş harfleri gösterilir
  display_order int default 0,
  active boolean default true,
  created_at timestamptz default now()
);

alter table sites enable row level security;

-- Herkes (anon key ile) sadece aktif siteleri okuyabilsin
create policy "Public read active sites"
  on sites for select
  using (active = true);

-- Admin panel şifre korumalı olduğu için anon key'e tam yazma izni veriyoruz.
-- NOT: Bu, tikobey/kipzone admin panellerindeki gibi "client-side şifre" modelidir.
-- Gerçek kullanıcı bazlı yetkilendirme değildir — admin URL'ini ve şifreni paylaşma.
create policy "Anon full access for admin panel"
  on sites for all
  using (true)
  with check (true);

-- Örnek veri (istersen sil / değiştir)
insert into sites (name, bonus, type, tag, link, logo, display_order, active) values
  ('NovaBet', '500', 'Deneme Bonusu', 'trend', '#', '', 1, true),
  ('KristalBet', '1.000', 'Deneme Bonusu', 'trend', '#', '', 2, true),
  ('ZirveBahis', '750', 'Hoş Geldin Bonusu', 'trend', '#', '', 3, true),
  ('AtlasCasino', '2.000', 'Deneme Bonusu', 'popular', '#', '', 4, true),
  ('VeloBet', '300', 'Freespin Bonusu', 'popular', '#', '', 5, true);
