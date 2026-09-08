-- ROLES ------------------------------------------------------------------
create type public.app_role as enum ('admin', 'delivery', 'customer');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_code text not null unique,
  full_name text not null default '',
  phone text unique,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "own profile read" on public.profiles for select to authenticated using (auth.uid() = id or public.has_role(auth.uid(), 'admin'));
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id or public.has_role(auth.uid(), 'admin'));
create policy "own roles read" on public.user_roles for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

-- new user -> profile + customer role
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare code text;
begin
  code := 'AB' || to_char(now(), 'YYMMDD') || lpad((floor(random()*10000))::int::text, 4, '0');
  insert into public.profiles (id, user_code, full_name, phone, email)
  values (new.id, code,
          coalesce(new.raw_user_meta_data->>'full_name', ''),
          nullif(coalesce(new.raw_user_meta_data->>'phone', new.phone), ''),
          new.email)
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'customer') on conflict do nothing;
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- MENU --------------------------------------------------------------------
create table public.categories (
  id text primary key,
  name text not null,
  icon text not null default '',
  sort_order int not null default 0,
  active boolean not null default true
);
grant select on public.categories to anon, authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "categories public read" on public.categories for select to anon, authenticated using (true);
create policy "categories admin write" on public.categories for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.menu_items (
  id text primary key,
  category_id text not null references public.categories(id) on delete cascade,
  name text not null,
  description text not null default '',
  image text not null default '',
  price numeric(10,2) not null default 0,
  half_price numeric(10,2),
  full_price numeric(10,2),
  rating numeric(3,2) not null default 4.5,
  is_veg boolean not null default true,
  best_seller boolean not null default false,
  is_new boolean not null default false,
  spicy boolean not null default false,
  available boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index menu_items_category_idx on public.menu_items(category_id);
create index menu_items_available_idx on public.menu_items(available);
grant select on public.menu_items to anon, authenticated;
grant all on public.menu_items to service_role;
alter table public.menu_items enable row level security;
create policy "menu public read" on public.menu_items for select to anon, authenticated using (true);
create policy "menu admin write" on public.menu_items for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- OFFERS ------------------------------------------------------------------
create table public.offers (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  emoji text not null default '🏷️',
  label text not null,
  description text not null default '',
  min_order numeric(10,2) not null default 0,
  discount_type text not null default 'flat',
  value numeric(10,2) not null default 0,
  max_discount numeric(10,2),
  badge text not null default 'OFFER',
  priority int not null default 1,
  tone text not null default 'orange',
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.offers to anon, authenticated;
grant all on public.offers to service_role;
alter table public.offers enable row level security;
create policy "offers public read" on public.offers for select to anon, authenticated using (true);
create policy "offers admin write" on public.offers for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- PARTNERS / BULK ---------------------------------------------------------
create table public.bulk_orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  company text not null default '',
  phone text not null,
  email text not null default '',
  items text not null default '',
  qty int not null default 0,
  delivery_at text not null default '',
  quoted numeric(10,2),
  status text not null default 'new',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert on public.bulk_orders to anon, authenticated;
grant all on public.bulk_orders to service_role;
alter table public.bulk_orders enable row level security;
create policy "bulk insert anyone" on public.bulk_orders for insert to anon, authenticated with check (true);
create policy "bulk admin read" on public.bulk_orders for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "bulk admin write" on public.bulk_orders for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ORDERS ------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  customer_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  phone text not null,
  address text not null default '',
  landmark text not null default '',
  notes text not null default '',
  lat double precision,
  lng double precision,
  mode text not null default 'delivery',
  payment_method text not null default 'cod',
  payment_status text not null default 'pending',
  status text not null default 'pending',
  subtotal numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  delivery_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  offer_id uuid references public.offers(id) on delete set null,
  delivery_partner_id uuid references auth.users(id) on delete set null,
  collected_mode text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_customer_idx on public.orders(customer_id);
create index orders_status_idx on public.orders(status);
create index orders_partner_idx on public.orders(delivery_partner_id);
grant select, insert, update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "orders own read" on public.orders for select to authenticated
  using (customer_id = auth.uid() or delivery_partner_id = auth.uid() or public.has_role(auth.uid(),'admin') or (delivery_partner_id is null and public.has_role(auth.uid(),'delivery')));
create policy "orders own insert" on public.orders for insert to authenticated with check (customer_id = auth.uid());
create policy "orders admin update" on public.orders for update to authenticated
  using (public.has_role(auth.uid(),'admin') or delivery_partner_id = auth.uid() or (delivery_partner_id is null and public.has_role(auth.uid(),'delivery')))
  with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'delivery'));

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  item_id text not null,
  name text not null,
  portion text not null default 'regular',
  qty int not null default 1,
  price numeric(10,2) not null default 0
);
create index order_items_order_idx on public.order_items(order_id);
grant select, insert on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create policy "order items read" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and (o.customer_id = auth.uid() or o.delivery_partner_id = auth.uid() or public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'delivery'))));
create policy "order items insert" on public.order_items for insert to authenticated
  with check (exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid()));

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  changed_by uuid references auth.users(id) on delete set null,
  changed_by_name text not null default '',
  note text not null default '',
  created_at timestamptz not null default now()
);
create index osh_order_idx on public.order_status_history(order_id);
grant select, insert on public.order_status_history to authenticated;
grant all on public.order_status_history to service_role;
alter table public.order_status_history enable row level security;
create policy "history read" on public.order_status_history for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and (o.customer_id = auth.uid() or o.delivery_partner_id = auth.uid() or public.has_role(auth.uid(),'admin'))));
create policy "history insert" on public.order_status_history for insert to authenticated
  with check (changed_by = auth.uid());

-- DELIVERY TRACKING -------------------------------------------------------
create table public.delivery_locations (
  order_id uuid primary key references public.orders(id) on delete cascade,
  partner_id uuid not null references auth.users(id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.delivery_locations to authenticated;
grant all on public.delivery_locations to service_role;
alter table public.delivery_locations enable row level security;
create policy "loc read" on public.delivery_locations for select to authenticated
  using (public.has_role(auth.uid(),'admin') or partner_id = auth.uid()
    or exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid()));
create policy "loc partner write" on public.delivery_locations for insert to authenticated with check (partner_id = auth.uid());
create policy "loc partner update" on public.delivery_locations for update to authenticated using (partner_id = auth.uid());

alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.delivery_locations;
alter publication supabase_realtime add table public.order_status_history;