-- Crescendo seed data (demo authors, tags, articles, events, article_tags)
-- Rubrics already exist — referenced by slug (no hard-coded rubric UUIDs).
-- Profiles are created via auth.users insert → handle_new_user trigger, then enriched.
--
-- Demo login (after seed):
--   admin@crescendo.bg  / 123123
--   author1@crescendo.bg / 123123
--   author2@crescendo.bg / 123123
--
-- First admin is set by email below.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1) Auth users (+ auto profiles via trigger)
-- ---------------------------------------------------------------------------

with created_users as (
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  )
  select *
  from (
    values
      (
        '00000000-0000-0000-0000-000000000000'::uuid,
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'admin@crescendo.bg',
        crypt('123123', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"проф. д-р Мария Иванова"}'::jsonb,
        now(),
        now(),
        '',
        '',
        '',
        ''
      ),
      (
        '00000000-0000-0000-0000-000000000000'::uuid,
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'author1@crescendo.bg',
        crypt('123123', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"гл. ас. д-р Петър Петров"}'::jsonb,
        now(),
        now(),
        '',
        '',
        '',
        ''
      ),
      (
        '00000000-0000-0000-0000-000000000000'::uuid,
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'author2@crescendo.bg',
        crypt('123123', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"доц. д-р Елена Георгиева"}'::jsonb,
        now(),
        now(),
        '',
        '',
        '',
        ''
      )
  ) as v(
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  )
  where not exists (
    select 1 from auth.users u where u.email = v.email
  )
  returning id, email
),
identities as (
  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  select
    gen_random_uuid(),
    cu.id,
    jsonb_build_object('sub', cu.id::text, 'email', cu.email),
    'email',
    cu.id::text,
    now(),
    now(),
    now()
  from created_users cu
  returning user_id
)
select count(*) as users_created from created_users;

-- Enrich profiles (works whether users were just created or already existed)
update public.profiles p
set
  full_name = 'проф. д-р Мария Иванова',
  academic_title = 'проф. д-р',
  bio = 'Изследовател в областта на музикалната педагогика и когнитивните ползи от инструменталното обучение. Ръководител на академични проекти за достъп до музикално образование.',
  role = 'admin',
  avatar_url = null
from auth.users u
where p.id = u.id and u.email = 'admin@crescendo.bg';

update public.profiles p
set
  full_name = 'гл. ас. д-р Петър Петров',
  academic_title = 'гл. ас. д-р',
  bio = 'Специалист по солфеж, теория на музиката и иновативни методи в началното музикално обучение. Автор на практически ръководства за преподаватели.',
  role = 'author',
  avatar_url = null
from auth.users u
where p.id = u.id and u.email = 'author1@crescendo.bg';

update public.profiles p
set
  full_name = 'доц. д-р Елена Георгиева',
  academic_title = 'доц. д-р',
  bio = 'Изследовател на социалните музикални програми и методологиите на El Sistema. Работи върху груповото музициране в училищна среда.',
  role = 'author',
  avatar_url = null
from auth.users u
where p.id = u.id and u.email = 'author2@crescendo.bg';

-- ---------------------------------------------------------------------------
-- 2) Rubrics — ensure the five pillars exist (idempotent)
-- ---------------------------------------------------------------------------

insert into public.rubrics (title, slug, description)
values
  ('Ползи', 'benefits', 'Когнитивни, социални и академични ползи от музикалното образование.'),
  ('Политики', 'policies', 'Политики, управление и реформи в музикалното образование.'),
  ('Практики', 'practices', 'Педагогически методи, подходи и практически ръководства.'),
  ('El Sistema', 'el-sistema', 'Социални музикални програми и методологии на El Sistema.'),
  ('Резонанс', 'resonance', 'Актуални материали, отзиви и резонанс в общността.')
on conflict (slug) do update
set
  title = excluded.title,
  description = excluded.description;

-- ---------------------------------------------------------------------------
-- 3) Tags
-- ---------------------------------------------------------------------------

insert into public.tags (name, slug)
values
  ('Музикално образование', 'muzikalno-obrazovanie'),
  ('Цигулка', 'cigulka'),
  ('Оркестър', 'orkestar'),
  ('Хорово пеене', 'horovo-peene'),
  ('Джаз', 'dzhaz'),
  ('Концерт', 'koncert'),
  ('Методика', 'metodika'),
  ('Неврология и музика', 'nevrologiya-i-muzika'),
  ('Пиано', 'piano'),
  ('Солфеж', 'solfezh')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- 4–6) Articles, events, article_tags (CTE — no hardcoded FKs)
-- ---------------------------------------------------------------------------

with
authors as (
  select
    p.id,
    u.email
  from public.profiles p
  join auth.users u on u.id = p.id
  where u.email in (
    'admin@crescendo.bg',
    'author1@crescendo.bg',
    'author2@crescendo.bg'
  )
),
rubrics as (
  select id, slug from public.rubrics
  where slug in ('benefits', 'policies', 'practices', 'el-sistema', 'resonance')
),
tags as (
  select id, slug from public.tags
),
inserted_articles as (
  insert into public.articles (
    title,
    slug,
    summary,
    content,
    cover_image_url,
    reading_time_min,
    status,
    author_id,
    rubric_id,
    published_at,
    created_at,
    updated_at
  )
  values
  -- Резонанс: анонс
  (
    'Предстоящо: Академичният симфоничен оркестър открива новия сезон с Брамс и Равел',
    'predstoyashto-akademichen-simfonichen-orkestar-brams-ravel',
    'Анонс за откриващия концерт на сезона: програма с Брамс и Равел, дата, място и покана към публиката.',
    $md$
## Откриване на сезона

Академичният симфоничен оркестър представя откриващия концерт на новия сезон с програма, посветена на късния романтизъм и френския колорит — Йоханес Брамс и Морис Равел.

## Програма

- **Брамс** — Концерт за цигулка и оркестър в ре мажор, оп. 77  
- **Равел** — *Daphnis et Chloé*, сюита № 2  

Солист и диригент ще бъдат обявени допълнително на страницата на събитието.

## За публиката

Концертът е отворен за студенти, преподаватели и гости на академичната общност. Препоръчваме предварителна регистрация поради ограничен капацитет на залата.

## Практическа информация

Подробности за часа, залата и билетите са публикувани в календара на платформата Crescendo.
$md$,
    null,
    4,
    'published',
    (select id from authors where email = 'admin@crescendo.bg'),
    (select id from rubrics where slug = 'resonance'),
    now() - interval '2 days',
    now() - interval '2 days',
    now() - interval '2 days'
  ),
  -- Резонанс: отзив
  (
    'Светлина и прецизност: Отзвук от клавирния рецитал на катедра „Пиано“',
    'svetlina-i-preciznost-otzvuk-klaviren-recital-piano',
    'Рецензия на клавирен рецитал: интерпретаторска яснота, драматургия на програмата и академичен контекст на събитието.',
    $md$
## Контекст

Клавирният рецитал на катедра „Пиано“ събра студенти, преподаватели и гости в камерна атмосфера, която позволи внимателно слушане и диалог след изпълненията.

## Интерпретация

Програмата бе изградена около контраста между класическа яснота и късноромантична експресия. Особено впечатление направи прецизната работа върху фразировката и динамичния баланс — качества, които свидетелстват за системна педагогическа подготовка.

## Академичен принос

Събитието потвърди ролята на публичните изпълнения като интегрална част от обучението: студентите представят не само техника, но и аргументирана музикална концепция.

## Заключение

Рециталът остави усещане за светлина и контрол — рядка комбинация, която заслужава да бъде чута и анализирана в по-широк академичен разговор.
$md$,
    null,
    6,
    'published',
    (select id from authors where email = 'author1@crescendo.bg'),
    (select id from rubrics where slug = 'resonance'),
    now() - interval '10 days',
    now() - interval '10 days',
    now() - interval '9 days'
  ),
  -- Ползи
  (
    'Как свиренето на инструмент подкрепя когнитивното развитие в детска възраст',
    'svirene-na-instrument-i-kognitivno-razvitie',
    'Преглед на изследвания за връзката между инструментално обучение, работна памет, внимание и езикови умения при деца.',
    $md$
## Въведение

Музикалното обучение все по-често се разглежда не само като естетическа практика, а като стимул за когнитивно развитие. Свиренето на инструмент ангажира едновременно слухови, моторни и изпълнителски процеси.

## Работна памет и внимание

Редица изследвания свързват редовната инструментална практика с подобрения във функциите на работната памет и устойчивото внимание. Четенето на нотен текст и едновременното изпълнение изискват координация на множество информационни потоци.

## Език и абстрактно мислене

Музикалната грамотност споделя общи механизми с езиковата обработка — сегментиране, ритъм и символно кодиране. Това прави ранното обучение потенциално полезно и извън тясната музикална сфера.

## Практически изводи

За образователните политики е важно да се осигури ранен и устойчив достъп до качествено инструментално обучение, а не спорадични еднократни занимания.
$md$,
    null,
    7,
    'published',
    (select id from authors where email = 'admin@crescendo.bg'),
    (select id from rubrics where slug = 'benefits'),
    now() - interval '20 days',
    now() - interval '20 days',
    now() - interval '18 days'
  ),
  -- Практики
  (
    'Иновативни подходи в преподаването на солфеж: от слухови игри до дигитални лаборатории',
    'inovativni-podhodi-v-prepodavaneto-na-solfezh',
    'Практически методи за солфеж: игрови слухови задачи, групови импровизации и смислено използване на дигитални инструменти.',
    $md$
## Предизвикателството

Солфежът често се възприема като формална дисциплина. Съвременната методика търси начини да го свърже с живото музициране и мотивацията на учениците.

## Слухови игри и групова работа

Кратки игрови задачи за интервали, ритъм и мелодична памет създават безопасна среда за грешки и обратна връзка. Груповото изпълнение намалява тревожността и усилва ангажираността.

## Дигитални лаборатории

Приложения за запис, визуализация на височина и интерактивни упражнения могат да допълнят присъствената работа — без да я заместват. Ключът е педагогическата цел, а не технологията сама по себе си.

## Препоръка за преподаватели

Започнете с една нова практика на седмица и измервайте ефекта върху участието и точността на слуховите отговори.
$md$,
    null,
    8,
    'published',
    (select id from authors where email = 'author1@crescendo.bg'),
    (select id from rubrics where slug = 'practices'),
    now() - interval '15 days',
    now() - interval '15 days',
    now() - interval '14 days'
  ),
  -- Политики
  (
    'Европейски рамки за подкрепа на младите музиканти: възможности и празнини',
    'evropeyski-ramki-za-podkrepa-na-mladite-muzikanti',
    'Анализ на европейски инструменти за мобилност, стипендии и институционална подкрепа на млади изпълнители и педагози.',
    $md$
## Контекст

Политиките за млади музиканти в Европа съчетават културни програми, образователна мобилност и социално включване. Разбирането на тези рамки е критично за институциите, които подготвят следващото поколение изпълнители.

## Възможности

Програми за обмен, майсторски класове и мрежи за ранна професионализация разширяват достъпа до международна сцена. Финансирането обаче често е проектно и изисква административен капацитет.

## Празнини

По-слабо покрити остават преходите след дипломиране, подкрепата за регионални училища и устойчивото финансиране на ансамбловото музициране извън големите центрове.

## Заключение

Ефективната национална политика трябва да преведе европейските инструменти в локални механизми — с ясни критерии, прозрачност и връзка с реалните нужди на студентите.
$md$,
    null,
    9,
    'published',
    (select id from authors where email = 'admin@crescendo.bg'),
    (select id from rubrics where slug = 'policies'),
    now() - interval '25 days',
    now() - interval '25 days',
    now() - interval '24 days'
  ),
  -- El Sistema
  (
    'Социалното въздействие на груповото музициране в училищата: уроци от El Sistema',
    'socialno-vazdeystvie-na-grupovoto-muzicirane-el-sistema',
    'Как оркестровата и ансамбловата практика изграждат принадлежност, дисциплина и социални умения в училищна среда.',
    $md$
## Идеята зад модела

El Sistema поставя колективното музициране в центъра на образователния процес. Оркестърът и ансамбълът са не само художествена форма, а социална структура.

## Училищният контекст

В училищна среда груповото свирене създава ритуал на съвместна работа: слушане на другия, споделена отговорност и видими резултати от редовна практика.

## Измерими ефекти

Наблюдават се подобрения в посещаемостта, самооценката и чувството за принадлежност. Важно е ефектите да се документират етично и с участието на общността.

## За българския контекст

Адаптацията изисква партньорство между училища, музикални педагози и местни институции — с реалистични цели и устойчиво финансиране.
$md$,
    null,
    8,
    'published',
    (select id from authors where email = 'author2@crescendo.bg'),
    (select id from rubrics where slug = 'el-sistema'),
    now() - interval '12 days',
    now() - interval '12 days',
    now() - interval '11 days'
  )
  on conflict (slug) do nothing
  returning id, slug
),
inserted_events as (
  insert into public.events (
    title,
    description,
    start_date,
    end_date,
    location,
    event_type,
    registration_link,
    organizer,
    author_id,
    created_at
  )
  select *
  from (
    values
      (
        'Откриващ концерт: Брамс и Равел',
        'Академичният симфоничен оркестър открива сезона с Концерт за цигулка от Брамс и сюита № 2 от *Daphnis et Chloé* на Равел.',
        (now() + interval '45 days')::timestamptz,
        (now() + interval '45 days' + interval '2 hours')::timestamptz,
        'Концертна зала, София',
        'onsite',
        'https://crescendo.example/tickets/brams-ravel',
        'Академичен симфоничен оркестър',
        (select id from authors where email = 'admin@crescendo.bg'),
        now()
      ),
      (
        'Клавирен рецитал на катедра „Пиано“',
        'Камерен рецитал с участието на студенти и преподаватели от катедра „Пиано“ — събитието вече е преминало; вижте отзива в рубрика „Резонанс“.',
        (now() - interval '12 days')::timestamptz,
        (now() - interval '12 days' + interval '90 minutes')::timestamptz,
        'Камерна зала',
        'onsite',
        'https://crescendo.example/events/piano-recital',
        'Катедра „Пиано“',
        (select id from authors where email = 'author1@crescendo.bg'),
        now() - interval '20 days'
      ),
      (
        'Онлайн семинар: Музика и когнитивно развитие',
        'Хибриден семинар за преподаватели и изследователи върху връзката между инструментално обучение и когнитивни умения.',
        (now() + interval '20 days')::timestamptz,
        (now() + interval '20 days' + interval '2 hours')::timestamptz,
        'Zoom + аудитория 214',
        'hybrid',
        'https://crescendo.example/register/cognition-seminar',
        'Crescendo Research Lab',
        (select id from authors where email = 'author2@crescendo.bg'),
        now()
      )
  ) as e(
    title, description, start_date, end_date, location, event_type,
    registration_link, organizer, author_id, created_at
  )
  where not exists (
    select 1 from public.events existing where existing.title = e.title
  )
  returning id, title
),
article_tag_links as (
  insert into public.article_tags (article_id, tag_id)
  select a.id, t.id
  from (
    values
      ('predstoyashto-akademichen-simfonichen-orkestar-brams-ravel', 'orkestar'),
      ('predstoyashto-akademichen-simfonichen-orkestar-brams-ravel', 'koncert'),
      ('predstoyashto-akademichen-simfonichen-orkestar-brams-ravel', 'cigulka'),
      ('svetlina-i-preciznost-otzvuk-klaviren-recital-piano', 'piano'),
      ('svetlina-i-preciznost-otzvuk-klaviren-recital-piano', 'koncert'),
      ('svetlina-i-preciznost-otzvuk-klaviren-recital-piano', 'muzikalno-obrazovanie'),
      ('svirene-na-instrument-i-kognitivno-razvitie', 'nevrologiya-i-muzika'),
      ('svirene-na-instrument-i-kognitivno-razvitie', 'muzikalno-obrazovanie'),
      ('svirene-na-instrument-i-kognitivno-razvitie', 'metodika'),
      ('inovativni-podhodi-v-prepodavaneto-na-solfezh', 'solfezh'),
      ('inovativni-podhodi-v-prepodavaneto-na-solfezh', 'metodika'),
      ('inovativni-podhodi-v-prepodavaneto-na-solfezh', 'muzikalno-obrazovanie'),
      ('evropeyski-ramki-za-podkrepa-na-mladite-muzikanti', 'muzikalno-obrazovanie'),
      ('evropeyski-ramki-za-podkrepa-na-mladite-muzikanti', 'metodika'),
      ('socialno-vazdeystvie-na-grupovoto-muzicirane-el-sistema', 'orkestar'),
      ('socialno-vazdeystvie-na-grupovoto-muzicirane-el-sistema', 'muzikalno-obrazovanie'),
      ('socialno-vazdeystvie-na-grupovoto-muzicirane-el-sistema', 'horovo-peene')
  ) as link(article_slug, tag_slug)
  join public.articles a on a.slug = link.article_slug
  join public.tags t on t.slug = link.tag_slug
  on conflict do nothing
  returning article_id
)
select
  (select count(*) from inserted_articles) as articles_inserted,
  (select count(*) from inserted_events) as events_inserted,
  (select count(*) from article_tag_links) as tag_links_inserted;
