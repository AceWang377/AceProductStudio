create extension if not exists "pgcrypto";

create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  shop_domain text not null,
  shop_name text,
  access_token text,
  admin_access_token text,
  client_id text,
  client_secret text,
  is_active boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  store_id uuid references stores(id) on delete set null,
  name text,
  category text,
  style text,
  target_market text,
  tone text default 'clear and trustworthy',
  seo_keywords text[] default '{}',
  language text default 'English',
  brand_voice text,
  image_style_preset text,
  status text not null default 'DRAFT',
  original_image_url text,
  background_removed_image_url text,
  title text,
  description text,
  description_html text,
  bullet_points text[] default '{}',
  bullets jsonb default '[]',
  tags text[] default '{}',
  faq jsonb default '[]',
  price text,
  compare_at_price text,
  price_cents integer default 0,
  currency text default 'USD',
  sku text,
  inventory_quantity integer default 0,
  track_inventory boolean default false,
  shopify_status text not null default 'NOT_CONNECTED',
  shopify_product_id text,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  image_type text not null,
  url text not null,
  storage_key text,
  prompt text,
  is_selected boolean default false,
  sort_order integer default 0,
  shopify_media_id text,
  created_at timestamptz default now()
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  type text not null,
  status text default 'QUEUED',
  progress integer default 0,
  input jsonb default '{}',
  output jsonb default '{}',
  result jsonb default '{}',
  error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists credit_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  amount integer not null,
  reason text not null,
  product_id uuid references products(id) on delete set null,
  stripe_payment_id text,
  created_at timestamptz default now()
);

create table if not exists rate_limits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  action_key text not null,
  window_start timestamptz not null,
  count integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, action_key, window_start)
);

alter table stores add column if not exists admin_access_token text;
alter table stores add column if not exists client_id text;
alter table stores add column if not exists client_secret text;
alter table stores add column if not exists is_active boolean not null default false;

alter table products add column if not exists name text;
alter table products add column if not exists style text;
alter table products add column if not exists target_market text;
alter table products add column if not exists tone text default 'clear and trustworthy';
alter table products add column if not exists seo_keywords text[] default '{}';
alter table products add column if not exists language text default 'English';
alter table products add column if not exists brand_voice text;
alter table products add column if not exists image_style_preset text;
alter table products add column if not exists original_image_url text;
alter table products add column if not exists background_removed_image_url text;
alter table products add column if not exists description text;
alter table products add column if not exists bullet_points text[] default '{}';
alter table products add column if not exists compare_at_price text;
alter table products add column if not exists price text;
alter table products add column if not exists sku text;
alter table products add column if not exists track_inventory boolean default false;
alter table products add column if not exists shopify_status text not null default 'NOT_CONNECTED';

alter table product_images add column if not exists storage_key text;
alter table product_images add column if not exists prompt text;
alter table product_images add column if not exists is_selected boolean default false;

alter table jobs add column if not exists input jsonb default '{}';
alter table jobs add column if not exists output jsonb default '{}';

alter table credit_ledger add column if not exists stripe_payment_id text;

create index if not exists products_created_at_idx on products (created_at desc);
create index if not exists products_user_created_idx on products (user_id, created_at desc);
create index if not exists product_images_product_sort_idx on product_images (product_id, sort_order);
create index if not exists jobs_product_created_idx on jobs (product_id, created_at desc);
create index if not exists stores_user_active_idx on stores (user_id, is_active);
create unique index if not exists credit_ledger_stripe_payment_id_idx
on credit_ledger (stripe_payment_id)
where stripe_payment_id is not null;
create index if not exists rate_limits_user_action_window_idx
on rate_limits (user_id, action_key, window_start desc);

alter table stores enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table jobs enable row level security;
alter table credit_accounts enable row level security;
alter table credit_ledger enable row level security;
alter table rate_limits enable row level security;

drop policy if exists "Users can manage own stores" on stores;
create policy "Users can manage own stores"
on stores for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage own products" on products;
create policy "Users can manage own products"
on products for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage own product images" on product_images;
create policy "Users can manage own product images"
on product_images for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can view own jobs" on jobs;
create policy "Users can view own jobs"
on jobs for select
using (auth.uid() = user_id);

drop policy if exists "Users can view own credit account" on credit_accounts;
create policy "Users can view own credit account"
on credit_accounts for select
using (auth.uid() = user_id);

drop policy if exists "Users can view own credit ledger" on credit_ledger;
create policy "Users can view own credit ledger"
on credit_ledger for select
using (auth.uid() = user_id);

drop policy if exists "Users can view own rate limits" on rate_limits;
create policy "Users can view own rate limits"
on rate_limits for select
using (auth.uid() = user_id);
