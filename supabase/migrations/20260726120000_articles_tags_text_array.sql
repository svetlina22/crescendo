-- Move article tags from M2M (tags / article_tags) to articles.tags TEXT[]

alter table public.articles
  add column if not exists tags text[];

-- Migrate existing tag names into the array (preserve display names)
update public.articles a
set tags = sub.names
from (
  select
    at.article_id,
    array_agg(t.name order by t.name) as names
  from public.article_tags at
  join public.tags t on t.id = at.tag_id
  group by at.article_id
) as sub
where a.id = sub.article_id
  and (a.tags is null or cardinality(a.tags) = 0);

-- Normalize null → empty array for simpler client code
update public.articles
set tags = '{}'::text[]
where tags is null;

alter table public.articles
  alter column tags set default '{}'::text[];

create index if not exists articles_tags_gin_idx
  on public.articles using gin (tags);

-- Drop M2M (policies cascade with table drop on article_tags/tags)
drop table if exists public.article_tags;
drop table if exists public.tags;
