-- Public Storage bucket for article cover images + RLS policies
-- Path convention: {user_id}/{timestamp}-{random}.{ext}

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'article-covers',
  'article-covers',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read (bucket is public; policy still required for Storage API)
drop policy if exists "Public read article covers" on storage.objects;
create policy "Public read article covers"
on storage.objects
for select
to public
using (bucket_id = 'article-covers');

-- Authors & admins: upload only into their own folder
drop policy if exists "Authors upload article covers" on storage.objects;
create policy "Authors upload article covers"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'article-covers'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'author')
  )
);

-- Owners can update their files; admins can update any
drop policy if exists "Authors update own article covers" on storage.objects;
create policy "Authors update own article covers"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'article-covers'
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
)
with check (
  bucket_id = 'article-covers'
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
);

-- Owners can delete their files; admins can delete any
drop policy if exists "Authors delete own article covers" on storage.objects;
create policy "Authors delete own article covers"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'article-covers'
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
);
