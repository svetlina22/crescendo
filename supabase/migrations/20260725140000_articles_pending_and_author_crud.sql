-- Crescendo: pending status + author CRUD policies
-- Allows draft | pending | published workflow

alter table public.articles
  drop constraint if exists articles_status_check;

alter table public.articles
  add constraint articles_status_check
  check (status in ('draft', 'pending', 'published'));

drop policy if exists articles_author_insert_draft on public.articles;
create policy articles_author_insert_own
  on public.articles for insert
  to authenticated
  with check (
    public.is_author_or_admin()
    and author_id = auth.uid()
    and status in ('draft', 'pending')
  );

drop policy if exists articles_author_update_own_draft on public.articles;
create policy articles_author_update_own
  on public.articles for update
  to authenticated
  using (
    author_id = auth.uid()
    and status in ('draft', 'pending')
    and not public.is_admin()
  )
  with check (
    author_id = auth.uid()
    and status in ('draft', 'pending')
  );

drop policy if exists articles_author_delete_own on public.articles;
create policy articles_author_delete_own
  on public.articles for delete
  to authenticated
  using (
    author_id = auth.uid()
    and status in ('draft', 'pending')
    and not public.is_admin()
  );

drop policy if exists article_tags_author_insert_own_draft on public.article_tags;
create policy article_tags_author_insert_own
  on public.article_tags for insert
  to authenticated
  with check (
    public.is_admin()
    or exists (
      select 1 from public.articles a
      where a.id = article_id
        and a.author_id = auth.uid()
        and a.status in ('draft', 'pending')
    )
  );

drop policy if exists article_tags_author_delete_own_draft on public.article_tags;
create policy article_tags_author_delete_own
  on public.article_tags for delete
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.articles a
      where a.id = article_id
        and a.author_id = auth.uid()
        and a.status in ('draft', 'pending')
    )
  );
