-- Crescendo events: align with public event form schema
-- Adds image_url + status; renames start_date → date; requires location & description

alter table public.events drop constraint if exists events_end_after_start;

update public.events
set location = coalesce(nullif(btrim(location), ''), 'Онлайн')
where location is null or btrim(location) = '';

update public.events
set description = coalesce(nullif(btrim(description), ''), title)
where description is null or btrim(description) = '';

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'events'
      and column_name = 'start_date'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'events'
      and column_name = 'date'
  ) then
    alter table public.events rename column start_date to date;
  end if;
end $$;

alter table public.events
  add column if not exists image_url text;

alter table public.events
  add column if not exists status text;

update public.events
set status = case
  when date < now() then 'past'
  else 'upcoming'
end
where status is null or btrim(status) = '';

alter table public.events
  alter column status set default 'upcoming';

alter table public.events
  alter column status set not null;

alter table public.events
  drop constraint if exists events_status_check;

alter table public.events
  add constraint events_status_check
  check (status in ('upcoming', 'past', 'call_for_papers'));

alter table public.events
  alter column location set not null;

alter table public.events
  alter column description set not null;

alter table public.events
  drop constraint if exists events_end_after_start;

alter table public.events
  add constraint events_end_after_start
  check (end_date is null or end_date >= date);

create index if not exists events_date_idx on public.events (date);
create index if not exists events_status_idx on public.events (status);
