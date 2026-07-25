# Промпт: SQL схема за Crescendo (Supabase / PostgreSQL)

Използвай този промпт като единствена спецификация при генериране на миграционен SQL за академичната платформа **Crescendo**. Не смесвай с quiz/exam-preparation схеми. Не въвеждай React/TypeScript. Резултатът трябва да е **един чист, добре коментиран SQL скрипт**, готов за Supabase SQL Editor и/или файл в `supabase/migrations/`.

---

## Роля

Ти си senior PostgreSQL / Supabase инженер. Генерирай production-ready DDL + RLS + triggers за `public` schema.

## Цел

Създай пълна SQL схема за Crescendo: академична платформа за музикално образование с 5 рубрики, статии, събития, тагове, профили и роли `admin` | `author`.

## Именоване (заключено)

Използвай точно тези имена (не `categories`/`posts`):

| Таблица | Предназначение |
|--------|----------------|
| `profiles` | Разширение на `auth.users` |
| `rubrics` | 5-те стълба на платформата |
| `articles` | Статии към рубрика |
| `events` | Календарни събития |
| `tags` | Тагове |
| `article_tags` | M:N junction |

## Таблици и колони

### `profiles`
- `id` UUID PK → `auth.users(id)` ON DELETE CASCADE
- `full_name` text
- `role` text NOT NULL DEFAULT `'author'` CHECK (`role` IN (`'admin'`, `'author'`))
- `academic_title` text (напр. „гл. ас. д-р“)
- `bio` text
- `avatar_url` text
- `created_at` timestamptz NOT NULL DEFAULT `now()`

### `rubrics`
- `id` UUID PK DEFAULT `gen_random_uuid()`
- `title` text NOT NULL
- `slug` text NOT NULL UNIQUE
- `description` text
- Seed (insert) петте рубрики:
  1. Ползи / `benefits`
  2. Политики / `policies`
  3. Практики / `practices`
  4. Ел Система / `el-sistema`
  5. Резонанс / `resonance`

### `articles`
- `id` UUID PK DEFAULT `gen_random_uuid()`
- `title` text NOT NULL
- `slug` text NOT NULL UNIQUE
- `summary` text
- `content` text
- `cover_image_url` text
- `reading_time_min` integer CHECK (`reading_time_min` IS NULL OR `reading_time_min` >= 0)
- `status` text NOT NULL DEFAULT `'draft'` CHECK (`status` IN (`'draft'`, `'published'`))
- `author_id` UUID NOT NULL → `profiles(id)`
- `rubric_id` UUID NOT NULL → `rubrics(id)`
- `published_at` timestamptz
- `created_at` timestamptz NOT NULL DEFAULT `now()`
- `updated_at` timestamptz NOT NULL DEFAULT `now()`
- Индекси: `status`, `rubric_id`, `author_id`, `published_at`

### `events`
- `id` UUID PK DEFAULT `gen_random_uuid()`
- `title` text NOT NULL
- `description` text
- `start_date` timestamptz NOT NULL
- `end_date` timestamptz
- `location` text
- `event_type` text CHECK (`event_type` IN (`'online'`, `'onsite'`, `'hybrid'`))
- `registration_link` text
- `organizer` text
- `author_id` UUID → `profiles(id)`
- `created_at` timestamptz NOT NULL DEFAULT `now()`
- CHECK: ако `end_date` е зададен, `end_date` >= `start_date`

### `tags`
- `id` UUID PK DEFAULT `gen_random_uuid()`
- `name` text NOT NULL
- `slug` text NOT NULL UNIQUE

### `article_tags`
- `article_id` UUID NOT NULL → `articles(id)` ON DELETE CASCADE
- `tag_id` UUID NOT NULL → `tags(id)` ON DELETE CASCADE
- PRIMARY KEY (`article_id`, `tag_id`)

## Помощни функции (SECURITY DEFINER, стабилен search_path)

- `public.is_admin()` → boolean (текущият `auth.uid()` има `profiles.role = 'admin'`)
- `public.is_author_or_admin()` → boolean (`role` IN (`'author'`, `'admin'`))
- `public.handle_new_user()` — insert в `profiles` при signup
- `public.set_updated_at()` — задава `NEW.updated_at = now()`

## Triggers

1. След INSERT в `auth.users` → `handle_new_user()` създава `profiles` ред (`id`, `full_name` от metadata ако има, `role = 'author'`).
2. BEFORE UPDATE на `articles` → `set_updated_at()`.

## RLS (задължително — по-строго от „всички автори могат всичко“)

Активирай RLS на **всички** горни таблици.

### Guests (`anon` + authenticated без специални права за чуждо съдържание)
- `rubrics`, `tags`: SELECT за всички
- `articles`: SELECT само където `status = 'published'`
- `events`: SELECT за всички (публичен календар) **или** ако добавиш `status` по-късно — само публични; за v1: SELECT на всички events
- `article_tags`: SELECT когато свързаната статия е `published`
- `profiles`: SELECT на публични полета за всички (нужно за авторско име към статия)

### Author
- `profiles`: UPDATE само собствения ред (`id = auth.uid()`); **не** може да променя `role`
- `articles`: INSERT със `author_id = auth.uid()` и `status = 'draft'`
- `articles`: UPDATE само собствени редове **и** без да задава `status = 'published'` (остава `draft` или админ публикува)
- `articles`: **без DELETE**
- `events`: INSERT/UPDATE собствени (`author_id = auth.uid()`); без DELETE (или само admin — избери admin-only DELETE за сигурност)
- `article_tags`: INSERT/DELETE само за собствени draft статии

### Admin
- Пълен CRUD върху `articles`, `events`, `rubrics`, `tags`, `article_tags`
- Може да задава `status = 'published'` и `published_at`
- Може да UPDATE всеки `profiles.role` (опционална отделна policy)

### Забрани изрично
- Author **не** може да публикува
- Author **не** може да трие статии
- Author **не** може да редактира чужди статии
- Няма връзки към exam-preparation / quiz таблици

## Технически изисквания към SQL изхода

1. Включи `create extension if not exists "pgcrypto";` (за `gen_random_uuid()`), ако е нужно.
2. Коментари на български или английски — кратки, секция по секция.
3. Използвай `create policy` с ясни имена (`articles_select_published`, `articles_author_insert_draft`, …).
4. Grants: подходящи права за `anon` / `authenticated` (SELECT/INSERT/UPDATE/DELETE според RLS).
5. Идемпотентност където е разумно (`drop policy if exists`, `create or replace function`).
6. **Не** хардкодвай реални user UUID-та освен в отделен optional seed блок, маркиран като коментар.
7. В края: кратък коментар „как се назначава първи admin“ (UPDATE `profiles.role` в SQL Editor).

## Изход

Само SQL в един блок. Без обяснителен markdown около него, освен ако не е поискано. Без TypeScript types.

---

## Acceptance checklist (провери преди да приключиш)

- [ ] 6 таблици: profiles, rubrics, articles, events, tags, article_tags
- [ ] Seed на 5 рубрики с дадените slug-ове
- [ ] Trigger за нов auth user → profile
- [ ] Trigger за `articles.updated_at`
- [ ] RLS включен навсякъде
- [ ] Guest чете само published articles
- [ ] Author: draft-only create/update на собствени; без publish; без delete
- [ ] Admin: пълен контрол + publish
- [ ] Няма зависимости от външни/legacy схеми
