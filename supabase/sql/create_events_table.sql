-- Standalone CREATE for public.events (reference / SQL Editor).
-- On an existing Crescendo project prefer migration
-- 20260725160000_events_schema_update.sql instead.

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date timestamptz not null,
  location text not null,
  description text not null,
  image_url text,
  status text not null default 'upcoming'
    check (status in ('upcoming', 'past', 'call_for_papers')),
  created_at timestamptz not null default now()
);

create index if not exists events_date_idx on public.events (date);
create index if not exists events_status_idx on public.events (status);

alter table public.events enable row level security;
