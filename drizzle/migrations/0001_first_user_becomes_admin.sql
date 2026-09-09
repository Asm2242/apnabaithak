CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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

  -- Bootstrap: the very first registered account also becomes the admin.
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;

  return new;
end; $function$;