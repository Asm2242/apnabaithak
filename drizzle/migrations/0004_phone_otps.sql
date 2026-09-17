-- OTP verification for Indian phone numbers ---------------------------------
-- 6-digit OTP, 5-minute expiry, hashed storage, rate-limited via server functions.
-- Only service_role can read/write; all access goes through server functions.
create table public.phone_otps (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  otp_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index phone_otps_phone_idx on public.phone_otps(phone);
create index phone_otps_expires_idx on public.phone_otps(expires_at);
grant all on public.phone_otps to service_role;
alter table public.phone_otps enable row level security;
-- No policies for anon/authenticated: server functions use service_role only.

-- Mark customer's phone as verified on their profile.
alter table public.profiles add column if not exists phone_verified boolean not null default false;
