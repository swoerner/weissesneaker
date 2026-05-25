-- Run this in Supabase Dashboard → SQL Editor

-- Sneakers table
create table if not exists sneakers (
  id           uuid        default gen_random_uuid() primary key,
  name         text        not null,
  brand        text        not null,
  slug         text        not null unique,
  description  text        not null,
  price_min    integer     not null,  -- in Cent
  image_url    text,
  affiliate_url text       not null,
  badge        text        check (badge in ('Bestseller', 'Neu', 'Trend', 'Luxus')),
  style        text        not null check (style in ('lifestyle', 'sport', 'luxus')),
  source       text        not null default 'manual',
  active       boolean     not null default true,
  created_at   timestamptz default now()
);

-- Row Level Security
alter table sneakers enable row level security;

-- Anon users: read active sneakers only
create policy "Public read active sneakers"
  on sneakers for select
  using (active = true);

-- Authenticated users (admin): full access
create policy "Authenticated full access"
  on sneakers for all
  to authenticated
  using (true)
  with check (true);
