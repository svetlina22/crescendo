# Seed prompt — Crescendo demo data

Use [`../migrations/20260725123000_seed_crescendo_demo_data.sql`](../migrations/20260725123000_seed_crescendo_demo_data.sql).

## Adaptations vs original brief

1. **Rubrics** — `INSERT … ON CONFLICT (slug) DO UPDATE` (already seeded; safe to re-run).
2. **Profiles** — cannot invent orphan UUIDs (`profiles.id` → `auth.users`). Script inserts into `auth.users` (+ `auth.identities`), lets `handle_new_user` create profiles, then `UPDATE`s titles/bios/roles by email.
3. **FKs** — resolved with `WITH` CTEs / subselects by `email` and `slug` (no hand-pasted UUIDs).
4. **Idempotent-ish** — skips existing auth emails; `ON CONFLICT` on tag/article slugs and article_tags.

## Demo accounts (after running the SQL)

| Email | Password | Role |
|-------|----------|------|
| `admin@crescendo.bg` | `CrescendoDemo1!` | admin |
| `author1@crescendo.bg` | `CrescendoDemo1!` | author |
| `author2@crescendo.bg` | `CrescendoDemo1!` | author |
