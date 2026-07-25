-- Allow authors (and admins) to create tags when writing articles
drop policy if exists tags_admin_insert on public.tags;
create policy tags_author_or_admin_insert
  on public.tags for insert
  to authenticated
  with check (public.is_author_or_admin());
