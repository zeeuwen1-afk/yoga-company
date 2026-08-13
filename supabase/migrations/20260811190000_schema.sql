-- =============================================================================
-- YogaCompany — basisschema (BOUWPROMPT §6)
--
-- Dataminimalisatie is leidend: elk veld hieronder heeft een aantoonbaar doel.
-- Voeg geen kolommen toe zonder een noodzaak-notitie in de migration die ze
-- introduceert. Stripe is de bron van betaalgegevens; wij bewaren uitsluitend
-- referenties, bedrag en status. Kaart- of rekeninggegevens komen hier nooit.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type user_role as enum ('admin', 'klant');
create type course_type as enum ('opleiding', 'training');
create type enrollment_status as enum (
  'in_afwachting',
  'betaald',
  'geannuleerd',
  'afgerond'
);
create type request_kind as enum (
  'inschrijving',
  'vraag',
  'wijziging',
  'avg_export',
  'avg_verwijdering'
);
create type request_status as enum ('open', 'in_behandeling', 'afgerond');
create type block_kind as enum ('text', 'richtext', 'image', 'video');
create type content_kind as enum ('video', 'pdf', 'tekst');
create type post_status as enum (
  'concept',
  'gepland',
  'gepubliceerd',
  'mislukt'
);

-- -----------------------------------------------------------------------------
-- 1. Profielen — gekoppeld aan auth.users, minimale set
-- -----------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role user_role not null default 'klant',
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  -- Opt-in voor mailings; null betekent geen toestemming (BOUWPROMPT §10.7).
  marketing_consent_at timestamptz,
  created_at timestamptz not null default now(),
  -- Soft delete. AVG-verwijdering anonimiseert de rij en vult dit veld.
  deleted_at timestamptz
);

comment on table profiles is
  'Klant- en adminprofielen. Minimale persoonsgegevens (BOUWPROMPT §2.5).';

create index profiles_role_idx on profiles (role) where deleted_at is null;
create index profiles_email_idx on profiles (lower(email));

-- -----------------------------------------------------------------------------
-- 2. CRM-notities — uitsluitend zichtbaar voor admins
-- -----------------------------------------------------------------------------
create table crm_notes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  author_id uuid not null references profiles (id),
  body text not null,
  created_at timestamptz not null default now()
);

create index crm_notes_profile_idx on crm_notes (profile_id, created_at desc);

-- -----------------------------------------------------------------------------
-- 3. Aanbod — opleidingen en trainingen
-- -----------------------------------------------------------------------------
create table courses (
  id uuid primary key default gen_random_uuid(),
  type course_type not null,
  title text not null,
  slug text not null unique,
  summary text not null,      -- kaarttekst in het overzicht
  description text not null,  -- detailpagina, markdown
  audience text,
  requirements text,
  curriculum jsonb,           -- modules en blokken
  study_load_text text,
  location text,
  max_participants int,
  certificate_text text,
  price_cents int not null,
  currency text not null default 'eur',
  stripe_price_id text,
  has_digital_content boolean not null default false,
  is_active boolean not null default true,
  sort int not null default 0,
  constraint courses_price_niet_negatief check (price_cents >= 0),
  constraint courses_max_deelnemers_positief check (
    max_participants is null or max_participants > 0
  )
);

create index courses_actief_idx on courses (type, sort) where is_active;

-- -----------------------------------------------------------------------------
-- 4. Digitale content (LMS): course -> modules -> lessen -> items
-- -----------------------------------------------------------------------------
create table course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses (id) on delete cascade,
  title text not null,
  sort int not null default 0
);

create index course_modules_course_idx on course_modules (course_id, sort);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references course_modules (id) on delete cascade,
  title text not null,
  sort int not null default 0
);

create index lessons_module_idx on lessons (module_id, sort);

create table content_items (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons (id) on delete cascade,
  kind content_kind not null,
  title text not null,
  body text,            -- bij kind = 'tekst', markdown
  storage_path text,    -- bij video/pdf: pad in bucket 'protected-content'
  duration_seconds int,
  -- Preview-items zijn zonder betaling zichtbaar als proefles (§12).
  is_preview boolean not null default false,
  sort int not null default 0,
  constraint content_items_tekst_heeft_body check (
    kind <> 'tekst' or body is not null
  ),
  constraint content_items_bestand_heeft_pad check (
    kind = 'tekst' or storage_path is not null
  )
);

create index content_items_lesson_idx on content_items (lesson_id, sort);

-- -----------------------------------------------------------------------------
-- 5. Inschrijvingen — tevens het toegangsrecht (entitlement) op content
-- -----------------------------------------------------------------------------
create table enrollments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  course_id uuid not null references courses (id),
  status enrollment_status not null default 'in_afwachting',
  stripe_checkout_session_id text,
  amount_cents int,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique (profile_id, course_id)
);

create index enrollments_profile_idx on enrollments (profile_id);
create index enrollments_course_status_idx on enrollments (course_id, status);
-- Idempotente webhookverwerking leunt op deze unieke sessieverwijzing (§9).
create unique index enrollments_stripe_session_idx
  on enrollments (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

-- -----------------------------------------------------------------------------
-- 6. Voortgang — "waar ben ik gebleven"
-- -----------------------------------------------------------------------------
create table progress (
  profile_id uuid not null references profiles (id) on delete cascade,
  content_item_id uuid not null references content_items (id) on delete cascade,
  last_position_seconds int not null default 0,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (profile_id, content_item_id),
  constraint progress_positie_niet_negatief check (last_position_seconds >= 0)
);

create index progress_item_idx on progress (content_item_id);

-- -----------------------------------------------------------------------------
-- 7. Aanvragen vanuit het klantportaal
-- -----------------------------------------------------------------------------
create table requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  kind request_kind not null,
  body text,
  status request_status not null default 'open',
  handled_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

create index requests_profile_idx on requests (profile_id, created_at desc);
create index requests_open_idx on requests (status, created_at desc)
  where status <> 'afgerond';

-- -----------------------------------------------------------------------------
-- 8. Beveiligde dialoog — precies één conversatie per klant
-- -----------------------------------------------------------------------------
create table conversations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations (id) on delete cascade,
  sender_id uuid not null references profiles (id),
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index messages_conversation_idx
  on messages (conversation_id, created_at desc);
create index messages_ongelezen_idx on messages (conversation_id)
  where read_at is null;

-- -----------------------------------------------------------------------------
-- 9. CMS-blokken voor de visuele site-editor (§14)
-- -----------------------------------------------------------------------------
create table content_blocks (
  page_key text not null,   -- 'home', 'over-ons', 'contact', ...
  block_key text not null,  -- 'hero_titel', 'hero_beeld', ...
  kind block_kind not null,
  value jsonb not null,     -- gepubliceerde inhoud; publiek leest alleen dit
  draft_value jsonb,        -- concept; publiceren kopieert draft naar value
  updated_by uuid references profiles (id),
  updated_at timestamptz not null default now(),
  primary key (page_key, block_key)
);

-- -----------------------------------------------------------------------------
-- 10. Contactberichten en mailings
-- -----------------------------------------------------------------------------
create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  body text not null,
  created_at timestamptz not null default now()
);

create index contact_messages_created_idx
  on contact_messages (created_at desc);

create table mailings (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body_html text not null,
  segment text not null default 'marketing_consent',
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_by uuid references profiles (id)
);

-- -----------------------------------------------------------------------------
-- 11. Social posts (AI-tool, §15)
-- -----------------------------------------------------------------------------
create table social_posts (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (
    platform in ('instagram', 'facebook', 'beide')
  ),
  caption text not null,
  image_path text,
  status post_status not null default 'concept',
  scheduled_at timestamptz,
  published_at timestamptz,
  error text,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 12. Audit log — AVG-verantwoording over admin-acties (§17)
-- -----------------------------------------------------------------------------
create table audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references profiles (id),
  action text not null,
  entity text not null,
  entity_id text,
  meta jsonb,
  created_at timestamptz not null default now()
);

create index audit_log_created_idx on audit_log (created_at desc);
create index audit_log_entity_idx on audit_log (entity, entity_id);

comment on table audit_log is
  'Onveranderlijk logboek van admin-mutaties. Bewaartermijn 24 maanden (§17.6).';
