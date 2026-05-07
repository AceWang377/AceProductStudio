create table if not exists growth_monitor_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  store_id uuid references stores(id) on delete set null,
  run_type text not null,
  status text not null default 'completed',
  target_url text,
  input jsonb default '{}',
  output jsonb default '{}',
  error text,
  created_at timestamptz default now()
);

create index if not exists growth_monitor_runs_user_created_idx
on growth_monitor_runs (user_id, created_at desc);

create index if not exists growth_monitor_runs_type_created_idx
on growth_monitor_runs (run_type, created_at desc);

alter table growth_monitor_runs enable row level security;

drop policy if exists "Users can view own growth monitor runs" on growth_monitor_runs;
create policy "Users can view own growth monitor runs"
on growth_monitor_runs for select
using (auth.uid() = user_id);
