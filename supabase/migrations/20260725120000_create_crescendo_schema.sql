-- Crescendo: initial schema (profiles, rubrics, articles, events, tags)
-- PostgreSQL / Supabase public schema

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables (before helper functions that reference them)
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'author' check (role in ('admin', 'author')),
  academic_title text,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.rubrics (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text,
  content text,
  cover_image_url text,
  reading_time_min integer check (reading_time_min is null or reading_time_min >= 0),
  status text not null default 'draft' check (status in ('draft', 'published')),
  author_id uuid not null references public.profiles (id),
  rubric_id uuid not null references public.rubrics (id),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index articles_status_idx on public.articles (status);
create index articles_rubric_id_idx on public.articles (rubric_id);
create index articles_author_id_idx on public.articles (author_id);
create index articles_published_at_idx on public.articles (published_at);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_date timestamptz not null,
  end_date timestamptz,
  location text,
  event_type text check (event_type in ('online', 'onsite', 'hybrid')),
  registration_link text,
  organizer text,
  author_id uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  constraint events_end_after_start check (end_date is null or end_date >= start_date)
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

create table public.article_tags (
  article_id uuid not null references public.articles (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (article_id, tag_id)
);

-- ---------------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

create or replace function public.is_author_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('author', 'admin')
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    'author'
  );
  return new;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only admins can change profiles.role';
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at
  before update on public.articles
  for each row
  execute function public.set_updated_at();

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
  before update on public.profiles
  for each row
  execute function public.protect_profile_role();

-- ---------------------------------------------------------------------------
-- Seed rubrics
-- ---------------------------------------------------------------------------

insert into public.rubrics (title, slug, description) values
  ('Ползи', 'benefits', 'Когнитивни, социални и академични ползи от музикалното образование.'),
  ('Политики', 'policies', 'Политики, управление и реформи в музикалното образование.'),
  ('Практики', 'practices', 'Педагогически методи, подходи и практически ръководства.'),
  ('El Sistema', 'el-sistema', 'Социални музикални програми и методологии на El Sistema.'),
  ('Резонанс', 'resonance', 'Актуални материали, отзиви и резонанс в общността.');

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.rubrics enable row level security;
alter table public.articles enable row level security;
alter table public.events enable row level security;
alter table public.tags enable row level security;
alter table public.article_tags enable row level security;

create policy profiles_select_all
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy profiles_update_own
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy profiles_admin_update
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy rubrics_select_all
  on public.rubrics for select
  to anon, authenticated
  using (true);

create policy rubrics_admin_insert
  on public.rubrics for insert
  to authenticated
  with check (public.is_admin());

create policy rubrics_admin_update
  on public.rubrics for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy rubrics_admin_delete
  on public.rubrics for delete
  to authenticated
  using (public.is_admin());

create policy articles_select_published
  on public.articles for select
  to anon, authenticated
  using (status = 'published');

create policy articles_select_own_or_admin
  on public.articles for select
  to authenticated
  using (author_id = auth.uid() or public.is_admin());

create policy articles_author_insert_draft
  on public.articles for insert
  to authenticated
  with check (
    public.is_author_or_admin()
    and author_id = auth.uid()
    and status = 'draft'
  );

create policy articles_admin_insert
  on public.articles for insert
  to authenticated
  with check (public.is_admin());

create policy articles_author_update_own_draft
  on public.articles for update
  to authenticated
  using (
    author_id = auth.uid()
    and status = 'draft'
    and not public.is_admin()
  )
  with check (
    author_id = auth.uid()
    and status = 'draft'
  );

create policy articles_admin_update
  on public.articles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy articles_admin_delete
  on public.articles for delete
  to authenticated
  using (public.is_admin());

create policy events_select_all
  on public.events for select
  to anon, authenticated
  using (true);

create policy events_author_insert
  on public.events for insert
  to authenticated
  with check (
    public.is_author_or_admin()
    and author_id = auth.uid()
  );

create policy events_admin_insert
  on public.events for insert
  to authenticated
  with check (public.is_admin());

create policy events_author_update_own
  on public.events for update
  to authenticated
  using (author_id = auth.uid() and public.is_author_or_admin())
  with check (author_id = auth.uid());

create policy events_admin_update
  on public.events for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy events_admin_delete
  on public.events for delete
  to authenticated
  using (public.is_admin());

create policy tags_select_all
  on public.tags for select
  to anon, authenticated
  using (true);

create policy tags_admin_insert
  on public.tags for insert
  to authenticated
  with check (public.is_admin());

create policy tags_admin_update
  on public.tags for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy tags_admin_delete
  on public.tags for delete
  to authenticated
  using (public.is_admin());

create policy article_tags_select_published
  on public.article_tags for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.articles a
      where a.id = article_id and a.status = 'published'
    )
  );

create policy article_tags_select_own_or_admin
  on public.article_tags for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.articles a
      where a.id = article_id and a.author_id = auth.uid()
    )
  );

create policy article_tags_author_insert_own_draft
  on public.article_tags for insert
  to authenticated
  with check (
    exists (
      select 1 from public.articles a
      where a.id = article_id
        and a.author_id = auth.uid()
        and a.status = 'draft'
    )
    or public.is_admin()
  );

create policy article_tags_author_delete_own_draft
  on public.article_tags for delete
  to authenticated
  using (
    exists (
      select 1 from public.articles a
      where a.id = article_id
        and a.author_id = auth.uid()
        and a.status = 'draft'
    )
    or public.is_admin()
  );

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;

grant select on table public.profiles to anon, authenticated;
grant update on table public.profiles to authenticated;

grant select on table public.rubrics to anon, authenticated;
grant insert, update, delete on table public.rubrics to authenticated;

grant select on table public.articles to anon, authenticated;
grant insert, update, delete on table public.articles to authenticated;

grant select on table public.events to anon, authenticated;
grant insert, update, delete on table public.events to authenticated;

grant select on table public.tags to anon, authenticated;
grant insert, update, delete on table public.tags to authenticated;

grant select on table public.article_tags to anon, authenticated;
grant insert, delete on table public.article_tags to authenticated;

-- First admin after Auth signup:
-- update public.profiles set role = 'admin' where id = '<user-uuid>';
