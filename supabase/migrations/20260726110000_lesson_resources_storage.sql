-- Articles: optional lesson resource file URL
-- Storage: public bucket for PDF / ZIP teaching materials

alter table public.articles
  add column if not exists file_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lesson-resources',
  'lesson-resources',
  true,
  20971520, -- 20 MB
  array[
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'application/octet-stream'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read
drop policy if exists "Public read lesson resources" on storage.objects;
create policy "Public read lesson resources"
on storage.objects
for select
to public
using (bucket_id = 'lesson-resources');

-- Authors & admins: upload only into their own folder
drop policy if exists "Authors upload lesson resources" on storage.objects;
create policy "Authors upload lesson resources"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'lesson-resources'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'author')
  )
);

drop policy if exists "Authors update own lesson resources" on storage.objects;
create policy "Authors update own lesson resources"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'lesson-resources'
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
)
with check (
  bucket_id = 'lesson-resources'
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
);

drop policy if exists "Authors delete own lesson resources" on storage.objects;
create policy "Authors delete own lesson resources"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'lesson-resources'
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
);
