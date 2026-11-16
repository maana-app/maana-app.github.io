-- ma3na · waitlist CRM schema (web landing page + WhatsApp bot + ads attribution)
-- Business rules: phone normalized to +9665XXXXXXXX; consent required for web signups;
-- staff access by role (super_admin / operations / cs).

create extension if not exists pgcrypto;

create type lead_status as enum ('new','contacted','interested','joined','not_interested','unsubscribed');
create type staff_role as enum ('super_admin','operations','cs');

create table public.staff (
  email text primary key check (email = lower(email)),
  role staff_role not null default 'cs',
  title text,
  created_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique check (phone ~ '^\+9665[0-9]{8}$'),
  name text, city text, product text, frequency text,
  lang text not null default 'ar' check (lang in ('ar','en')),
  sources text[] not null default '{}',
  first_source text not null check (first_source in ('web','whatsapp','manual','import')),
  consent boolean not null default false,
  consent_text text, consent_at timestamptz,
  status lead_status not null default 'new',
  tags text[] not null default '{}',
  notes text,
  utm_source text, utm_medium text, utm_campaign text, referrer text,
  last_contact_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.leads (created_at desc);
create index on public.leads (city);
create index on public.leads (product);
create index on public.leads (status);

create table public.lead_events (
  id bigint generated always as identity primary key,
  lead_id uuid not null references public.leads on delete cascade,
  type text not null, source text,
  payload jsonb not null default '{}',
  actor text,
  created_at timestamptz not null default now()
);
create index on public.lead_events (lead_id, created_at desc);

create or replace function public.normalize_sa_phone(p text) returns text
language plpgsql immutable set search_path = public as $$
declare d text;
begin
  d := translate(coalesce(p,''), '٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹', '01234567890123456789');
  d := regexp_replace(d, '[^0-9]', '', 'g');
  if d like '00966%' then d := substr(d, 6);
  elsif d like '966%' then d := substr(d, 4);
  elsif d like '0%' then d := substr(d, 2);
  end if;
  if d ~ '^5[0-9]{8}$' then return '+966' || d; end if;
  return null;
end $$;

create or replace function public.current_staff_role() returns staff_role
language sql stable security definer set search_path = public as $$
  select role from public.staff where email = lower(coalesce(auth.jwt() ->> 'email',''));
$$;

create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = public as $$
begin new.updated_at := now(); return new; end $$;
create trigger leads_touch before update on public.leads for each row execute function public.touch_updated_at();

create or replace function public.log_lead_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare who text := auth.jwt() ->> 'email';
begin
  if new.status is distinct from old.status and new.status = 'unsubscribed' then new.consent := false; end if;
  if new.consent is distinct from old.consent then new.consent_at := now(); end if;
  if who is null then return new; end if;
  if new.status is distinct from old.status then
    insert into public.lead_events(lead_id, type, source, payload, actor)
    values (new.id, 'status_changed', 'crm', jsonb_build_object('from', old.status, 'to', new.status), lower(who));
  end if;
  if new.consent is distinct from old.consent then
    insert into public.lead_events(lead_id, type, source, payload, actor)
    values (new.id, 'consent_changed', 'crm', jsonb_build_object('consent', new.consent), lower(who));
  end if;
  return new;
end $$;
create trigger leads_log before update on public.leads for each row execute function public.log_lead_change();

create or replace function public.upsert_lead(
  p_phone text, p_name text, p_city text, p_product text, p_frequency text,
  p_consent boolean, p_consent_text text, p_lang text, p_source text,
  p_utm_source text default null, p_utm_medium text default null, p_utm_campaign text default null,
  p_referrer text default null, p_raw jsonb default '{}'
) returns uuid
language plpgsql security definer set search_path = public as $$
declare ph text := normalize_sa_phone(p_phone); lid uuid; existed boolean;
begin
  if ph is null then raise exception 'invalid_phone' using errcode = '22023'; end if;
  if p_source not in ('web','whatsapp','manual','import') then raise exception 'invalid_source'; end if;
  select id into lid from leads where phone = ph;
  existed := lid is not null;
  if not existed then
    insert into leads(phone, name, city, product, frequency, lang, sources, first_source, consent, consent_text, consent_at,
                      utm_source, utm_medium, utm_campaign, referrer)
    values (ph, nullif(trim(left(p_name,80)),''), nullif(left(p_city,60),''), nullif(left(p_product,60),''), nullif(left(p_frequency,40),''),
            case when p_lang = 'en' then 'en' else 'ar' end, array[p_source], p_source,
            coalesce(p_consent,false), left(p_consent_text,500), case when p_consent then now() end,
            left(p_utm_source,80), left(p_utm_medium,80), left(p_utm_campaign,120), left(p_referrer,300))
    returning id into lid;
  else
    update leads set
      name = coalesce(nullif(trim(left(p_name,80)),''), name),
      city = coalesce(nullif(left(p_city,60),''), city),
      product = coalesce(nullif(left(p_product,60),''), product),
      frequency = coalesce(nullif(left(p_frequency,40),''), frequency),
      sources = case when p_source = any(sources) then sources else sources || p_source end,
      consent = case when p_consent is null then consent else p_consent end,
      consent_text = case when p_consent is null then consent_text else left(p_consent_text,500) end,
      consent_at = case when p_consent is not null and p_consent is distinct from consent then now() else consent_at end
    where id = lid;
  end if;
  insert into lead_events(lead_id, type, source, payload, actor)
  values (lid, case when existed then 'signup_again' else 'signup' end, p_source, coalesce(p_raw,'{}'), 'system');
  return lid;
end $$;
revoke all on function public.upsert_lead from public, anon, authenticated;

create or replace function public.submit_waitlist(
  p_phone text, p_name text, p_city text, p_product text, p_frequency text,
  p_consent boolean, p_consent_text text, p_lang text default 'ar',
  p_utm_source text default null, p_utm_medium text default null, p_utm_campaign text default null,
  p_referrer text default null, p_hp text default null
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare ph text := normalize_sa_phone(p_phone); recent int;
begin
  if coalesce(p_hp,'') <> '' then return jsonb_build_object('ok', true); end if;
  if ph is null then return jsonb_build_object('ok', false, 'error', 'invalid_phone'); end if;
  if p_consent is not true then return jsonb_build_object('ok', false, 'error', 'consent_required'); end if;
  select count(*) into recent from lead_events where source = 'web' and created_at > now() - interval '1 minute';
  if recent > 30 then return jsonb_build_object('ok', false, 'error', 'busy'); end if;
  perform upsert_lead(p_phone, p_name, p_city, p_product, p_frequency, true, p_consent_text, p_lang, 'web',
                      p_utm_source, p_utm_medium, p_utm_campaign, p_referrer, '{}'::jsonb);
  return jsonb_build_object('ok', true);
end $$;
revoke all on function public.submit_waitlist from public;
grant execute on function public.submit_waitlist to anon, authenticated;

create or replace function public.set_lead_consent(p_phone text, p_consent boolean, p_source text, p_raw jsonb default '{}')
returns uuid language plpgsql security definer set search_path = public as $$
declare ph text := normalize_sa_phone(p_phone); lid uuid;
begin
  select id into lid from leads where phone = ph;
  if lid is null then return null; end if;
  update leads set consent = p_consent, consent_at = now(),
    status = case when not p_consent then 'unsubscribed'::lead_status
                  when p_consent and status = 'unsubscribed' then 'new'::lead_status else status end
  where id = lid;
  insert into lead_events(lead_id, type, source, payload, actor) values (lid, 'consent_changed', p_source, p_raw || jsonb_build_object('consent', p_consent), 'system');
  return lid;
end $$;
revoke all on function public.set_lead_consent from public, anon, authenticated;

create or replace function public.import_leads(rows jsonb) returns int
language plpgsql security definer set search_path = public as $$
declare r jsonb; n int := 0;
begin
  if current_staff_role() not in ('super_admin','operations') then raise exception 'forbidden'; end if;
  for r in select * from jsonb_array_elements(rows) loop
    begin
      perform upsert_lead(r->>'phone', r->>'name', r->>'city', r->>'product', r->>'frequency',
        case when r->>'consent' in ('true','1','yes','نعم') then true when r->>'consent' in ('false','0','no','لا') then false else null end,
        r->>'consent_text', coalesce(r->>'lang','ar'), coalesce(nullif(r->>'source',''),'import'),
        null, null, null, null, jsonb_build_object('imported_by', auth.jwt() ->> 'email'));
      n := n + 1;
    exception when others then null;
    end;
  end loop;
  return n;
end $$;
revoke all on function public.import_leads from public, anon;
grant execute on function public.import_leads to authenticated;

create or replace function public.claim_first_admin() returns staff_role
language plpgsql security definer set search_path = public as $$
declare em text := lower(coalesce(auth.jwt() ->> 'email',''));
begin
  if em = '' then raise exception 'not_signed_in'; end if;
  if not exists (select 1 from staff) then
    insert into staff(email, role, title) values (em, 'super_admin', 'الرئيس التنفيذي');
  end if;
  return current_staff_role();
end $$;
revoke all on function public.claim_first_admin from public, anon;
grant execute on function public.claim_first_admin to authenticated;

alter table public.staff enable row level security;
alter table public.leads enable row level security;
alter table public.lead_events enable row level security;
create policy staff_read on public.staff for select to authenticated using (current_staff_role() is not null);
create policy staff_write on public.staff for all to authenticated using (current_staff_role() = 'super_admin') with check (current_staff_role() = 'super_admin');
create policy leads_read on public.leads for select to authenticated using (current_staff_role() is not null);
create policy leads_update on public.leads for update to authenticated using (current_staff_role() is not null) with check (current_staff_role() is not null);
create policy leads_delete on public.leads for delete to authenticated using (current_staff_role() = 'super_admin');
create policy events_read on public.lead_events for select to authenticated using (current_staff_role() is not null);
create policy events_insert on public.lead_events for insert to authenticated
  with check (current_staff_role() is not null and type in ('note','contacted') and actor = lower(auth.jwt() ->> 'email'));
revoke all on public.leads, public.lead_events, public.staff from anon;

-- WhatsApp webhook (Kapso) guarded by a shared key
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table private.settings (key text primary key, value text not null);
insert into private.settings values ('kapso_webhook_key', encode(gen_random_bytes(24), 'hex'));

create or replace function public.ingest_whatsapp(p_key text, p_event text, p_data jsonb) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare k text; lid uuid;
begin
  select value into k from private.settings where key = 'kapso_webhook_key';
  if p_key is null or p_key <> k then return jsonb_build_object('ok', false, 'error', 'unauthorized'); end if;
  if p_event = 'consent.changed' then
    lid := set_lead_consent(p_data->>'phone', (p_data->>'consent')::boolean, 'whatsapp', p_data);
    if lid is null then
      lid := upsert_lead(p_data->>'phone', p_data->>'name', null, null, null, (p_data->>'consent')::boolean,
                         p_data->>'consent_text', coalesce(p_data->>'lang','ar'), 'whatsapp', null,null,null,null, p_data);
    end if;
  else
    lid := upsert_lead(p_data->>'phone', p_data->>'name', p_data->>'city', p_data->>'product', p_data->>'frequency',
             case when p_data ? 'consent' then (p_data->>'consent')::boolean end,
             p_data->>'consent_text', coalesce(p_data->>'lang','ar'), 'whatsapp', null,null,null,null, p_data);
  end if;
  return jsonb_build_object('ok', true, 'lead_id', lid);
exception when others then
  return jsonb_build_object('ok', false, 'error', sqlerrm);
end $$;
revoke all on function public.ingest_whatsapp from public;
grant execute on function public.ingest_whatsapp to anon;

-- Ads attribution
create table public.visits (
  id bigint generated always as identity primary key,
  day date not null default (now() at time zone 'Asia/Riyadh')::date,
  utm_source text, utm_medium text, utm_campaign text,
  referrer_host text, device text, lang text,
  created_at timestamptz not null default now()
);
create index on public.visits (day);
create index on public.visits (utm_source, utm_campaign);
alter table public.visits enable row level security;
create policy visits_read on public.visits for select to authenticated using (current_staff_role() is not null);

create or replace function public.log_visit(p_utm_source text, p_utm_medium text, p_utm_campaign text, p_referrer text, p_device text, p_lang text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from visits where created_at > now() - interval '1 minute') > 600 then return; end if;
  insert into visits(utm_source, utm_medium, utm_campaign, referrer_host, device, lang)
  values (lower(left(nullif(p_utm_source,''),60)), lower(left(nullif(p_utm_medium,''),60)), left(nullif(p_utm_campaign,''),120),
          left(nullif(substring(coalesce(p_referrer,'') from '^https?://([^/]+)'),''),120),
          case when p_device in ('mobile','desktop','tablet') then p_device end,
          case when p_lang = 'en' then 'en' else 'ar' end);
end $$;
revoke all on function public.log_visit from public;
grant execute on function public.log_visit to anon, authenticated;

create table public.ad_spend (
  id bigint generated always as identity primary key,
  day date not null,
  platform text not null check (platform in ('tiktok','snapchat','instagram','facebook','x','google','youtube','whatsapp','influencer','other')),
  campaign text not null,
  amount_sar numeric(12,2) not null check (amount_sar >= 0),
  impressions int, clicks int, notes text,
  created_by text not null default lower(coalesce(auth.jwt() ->> 'email','system')),
  created_at timestamptz not null default now()
);
alter table public.ad_spend enable row level security;
create policy spend_read on public.ad_spend for select to authenticated using (current_staff_role() is not null);
create policy spend_write on public.ad_spend for insert to authenticated with check (current_staff_role() in ('super_admin','operations'));
create policy spend_del on public.ad_spend for delete to authenticated using (current_staff_role() in ('super_admin','operations'));

alter publication supabase_realtime add table public.leads;

-- Super Admin can issue a temporary password to a staff member (no email needed)
create or replace function public.staff_set_temp_password(p_email text, p_password text) returns boolean
language plpgsql security definer set search_path = public, auth, extensions as $$
declare n int;
begin
  if current_staff_role() is distinct from 'super_admin' then raise exception 'forbidden'; end if;
  if length(coalesce(p_password,'')) < 10 then raise exception 'weak_password'; end if;
  if not exists (select 1 from public.staff where email = lower(p_email)) then raise exception 'not_staff'; end if;
  update auth.users set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')),
         email_confirmed_at = coalesce(email_confirmed_at, now()), updated_at = now()
   where lower(email) = lower(p_email);
  get diagnostics n = row_count;
  return n > 0;
end $$;
revoke all on function public.staff_set_temp_password from public, anon;
grant execute on function public.staff_set_temp_password to authenticated;

-- Hardening: internal functions are not callable from the API
revoke execute on function public.log_lead_change() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;
revoke execute on function public.current_staff_role() from public, anon;
grant execute on function public.current_staff_role() to authenticated;
revoke execute on function public.normalize_sa_phone(text) from anon;
