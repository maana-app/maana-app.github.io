-- ma3na · initial schema (customer app)
-- Business rules enforced server-side, never trusted from the app:
--   * price comes from the campaign's current tier (rule #1: never below cost is set by admin per tier)
--   * delivery fee = 26 + 12 × (qty − 1)  (rule #3)
--   * campaign duration ≤ 48h (decision #14)
--   * prepaid only (rule #5): orders start as 'pending' with an authorised (not captured) payment

create extension if not exists pgcrypto;

create type order_status as enum ('pending', 'confirmed', 'shipped', 'delivered', 'refunded');
create type payment_method as enum ('apple_pay', 'mada', 'stc_pay', 'card');
create type campaign_status as enum ('draft', 'live', 'succeeded', 'failed', 'cancelled');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  phone text not null unique,
  full_name text,
  address_label text,
  national_address text,           -- rule #6: mandatory before checkout
  created_at timestamptz not null default now()
);

create table products (
  id text primary key,
  brand text not null,
  name text not null,
  short_name text not null,
  pack text not null,
  category text not null check (category in ('baby', 'cleaning', 'personal', 'home')),
  image_url text,
  contents text,                   -- mixed baskets: what is inside
  weight_kg numeric(5,2) not null check (weight_kg > 0 and weight_kg <= 10),  -- chargeable kg per carton (carrier cap 10 kg)
  units_per_carton int not null check (units_per_carton > 0),
  unit_label text not null,
  market_price numeric(10,2) not null check (market_price > 0)
);

create table campaigns (
  id text primary key,
  product_id text not null references products,
  status campaign_status not null default 'draft',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  -- [{ "minQty": 250, "price": 68 }, ...] ascending; tiers[0] is the success threshold
  tiers jsonb not null,
  unit_cost numeric(10,2) not null,            -- landed cost per carton (admin only)
  constraint max_48h check (ends_at <= starts_at + interval '48 hours'),
  constraint ends_after_start check (ends_at > starts_at)
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('MN-' || lpad((floor(random() * 1e6))::text, 6, '0')),
  user_id uuid not null references profiles on delete restrict,
  campaign_id text not null references campaigns,
  qty int not null check (qty between 1 and 9),
  unit_price numeric(10,2) not null,
  delivery_fee numeric(10,2) not null,
  total numeric(10,2) not null,
  payment_method payment_method not null,
  payment_ref text,                -- gateway authorisation id (set by payment webhook)
  status order_status not null default 'pending',
  created_at timestamptz not null default now()
);
create index on orders (campaign_id);
create index on orders (user_id, created_at desc);

-- Public feed: current joined quantity per live campaign (no customer data exposed).
create view campaign_feed with (security_invoker = false) as
select c.id, p.brand, p.name, p.short_name, p.pack, p.category, p.image_url, p.market_price,
       p.units_per_carton, p.unit_label, p.weight_kg, p.contents, c.tiers, c.ends_at,
       coalesce((select sum(o.qty) from orders o where o.campaign_id = c.id and o.status <> 'refunded'), 0)::int as joined_qty
from campaigns c join products p on p.id = c.product_id
where c.status = 'live' and now() between c.starts_at and c.ends_at;

-- Join a campaign: price and fee computed here, never sent by the client.
create or replace function join_campaign(p_campaign text, p_qty int, p_payment payment_method)
returns orders language plpgsql security definer set search_path = public as $$
declare
  c campaigns; joined int; price numeric; fee numeric; t jsonb; o orders;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if (select national_address from profiles where id = auth.uid()) is null then raise exception 'national address required'; end if;
  select * into c from campaigns where id = p_campaign and status = 'live' and now() between starts_at and ends_at for update;
  if not found then raise exception 'campaign not open'; end if;
  if p_qty < 1 or p_qty > 9 then raise exception 'qty out of range'; end if;
  -- carrier rule: one waybill, max 10 kg chargeable weight per order
  if p_qty * (select weight_kg from products where id = c.product_id) > 10 then raise exception 'order over 10 kg'; end if;

  select coalesce(sum(qty), 0) into joined from orders where campaign_id = c.id and status <> 'refunded';
  price := (c.tiers -> 0 ->> 'price')::numeric;
  for t in select * from jsonb_array_elements(c.tiers) loop
    if joined >= (t ->> 'minQty')::int then price := (t ->> 'price')::numeric; end if;
  end loop;
  if price <= c.unit_cost then raise exception 'price below cost'; end if;   -- rule #1
  fee := 26 + 12 * (p_qty - 1);                                            -- rule #3

  insert into orders (user_id, campaign_id, qty, unit_price, delivery_fee, total, payment_method)
  values (auth.uid(), c.id, p_qty, price, fee, price * p_qty + fee, p_payment)
  returning * into o;
  return o;
end $$;

-- Cancel while the campaign is running (authorisation is released by the payment worker on status change).
create or replace function cancel_order(p_code text)
returns void language plpgsql security definer set search_path = public as $$
begin
  update orders o set status = 'refunded'
  from campaigns c
  where o.code = p_code and o.user_id = auth.uid() and o.status = 'pending'
    and c.id = o.campaign_id and c.status = 'live' and now() < c.ends_at;
  if not found then raise exception 'cannot cancel'; end if;
end $$;
grant execute on function cancel_order(text) to authenticated;

-- Row-level security
alter table profiles enable row level security;
alter table orders enable row level security;
alter table products enable row level security;
alter table campaigns enable row level security;

create policy "own profile" on profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "own orders read" on orders for select using (user_id = auth.uid());
create policy "products readable" on products for select using (true);
-- campaigns table (with unit_cost) is admin-only; customers read campaign_feed.

grant select on campaign_feed to anon, authenticated;
grant execute on function join_campaign(text, int, payment_method) to authenticated;
