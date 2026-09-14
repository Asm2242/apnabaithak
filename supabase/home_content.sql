-- Home page editable content (single row id='main').
-- Run this ONCE in Supabase Dashboard > SQL Editor > New query > Run.
-- After this, /admin/home editor will save, and homepage will update live everywhere.

create table if not exists public.home_content (
  id text primary key default 'main',
  hero_badge text not null default '100% Pure Vegetarian',
  hero_title1 text not null default 'Ghar jaisa',
  hero_title2 text not null default 'swaad, roz taaza',
  hero_description text not null default 'Apna Baithak serves freshly cooked thalis, tandoori chaap, momos and Indo-Chinese from our kitchen in Eldeco City, Lucknow.',
  order_now_label text not null default 'Order Now',
  whatsapp_label text not null default 'WhatsApp Order',
  call_label text not null default 'Call',
  phone text not null default '9454999442',
  phone_display text not null default '+91 9454999442',
  whatsapp text not null default '919454999442',
  area text not null default 'Eldeco City, Lucknow',
  address text not null default 'Apna Baithak Vegetarian Restaurant, Eldeco City, Lucknow, Uttar Pradesh',
  hours text not null default '7:30 AM – 10:00 PM',
  days text not null default 'All Days',
  rating numeric not null default 4.6,
  free_delivery_at numeric not null default 399,
  open_text text not null default 'Open all days',
  nearby_text text not null default 'Nearby areas',
  dinein_text text not null default 'Dine-in & takeaway',
  craving_title text not null default 'What are you craving?',
  craving_subtitle text not null default 'Ten categories, all pure veg',
  offers_title text not null default 'Today''s offers',
  offers_subtitle text not null default 'Save more on bigger orders',
  combos_title text not null default 'Value combos',
  combos_subtitle text not null default 'Full meals for one, family or party',
  best_title text not null default 'Best sellers',
  best_subtitle text not null default 'Most loved by our regulars',
  visit_title text not null default 'Visit our baithak',
  visit_desc text not null default 'Dine in, pick up, or get it delivered. Our kitchen is fully vegetarian — no eggs, no exceptions.',
  updated_at timestamptz not null default now()
);

insert into public.home_content (id)
values ('main')
on conflict (id) do nothing;

-- Public can read (homepage), only admins can write.
alter table public.home_content enable row level security;

drop policy if exists "home_content public read" on public.home_content;
create policy "home_content public read"
  on public.home_content for select
  using (true);

drop policy if exists "home_content admin write" on public.home_content;
create policy "home_content admin write"
  on public.home_content for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
