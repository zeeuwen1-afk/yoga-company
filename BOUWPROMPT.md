# BOUWPROMPT — Yoga Companie Platform (Claude Code, VS Code)

**Voor Pieter — hoe gebruik je dit document:**

1. Zet dit bestand in de root van je lege repository als `BOUWPROMPT.md`.
2. Open Claude Code in de VS Code-terminal en geef als eerste opdracht:
   `Lees BOUWPROMPT.md volledig. Voer daarna Fase 0 uit. Werk fase voor fase; begin nooit aan een volgende fase zonder dat de Definition of Done van de huidige fase is afgevinkt in PROGRESS.md.`
3. Na elke fase test je zelf de opgeleverde functionaliteit en geef je: `Voer Fase X uit.`

---

## 0. WERKINSTRUCTIES VOOR CLAUDE CODE

- Lees eerst dit hele document. Maak vervolgens `PROGRESS.md` aan met alle fases en hun Definition of Done als checklist; werk die na elke stap bij.
- Werk **fase voor fase**, in kleine, logische commits met duidelijke Nederlandse commitberichten.
- Alle gebruikersgerichte teksten zijn **Nederlands**. Code, variabelen en comments in het Engels.
- Databasewijzigingen uitsluitend via **SQL-migrations** in `supabase/migrations/` (nooit handmatige wijzigingen beschrijven).
- **Nooit** secrets in code of commits. Alles via environment variables (zie §22). Maak `.env.example` aan.
- Na elke fase: `pnpm typecheck`, `pnpm lint`, `pnpm test` en de Playwright-smoketests moeten slagen.
- Bij twijfel over een productkeuze: stel maximaal 3 gerichte vragen en doe per vraag een voorstel; ga daarna verder.
- Verwijder nooit bestaande data of migrations zonder expliciete opdracht.

---

## 1. CONTEXT EN DOEL

**Yoga Companie** is een Nederlands opleidingsinstituut voor yoga. Kernactiviteit: **yoga-onderwijs** (opleidingen en trainingen, fysiek gegeven), secundair: yogalessen en workshops. Vlaggenschip: de **200-uurs Yin Yoga Specialist Opleiding** — 4 losse modules van 50 uur, elk afgesloten met een certificaat **Yin Yoga niveau 1 t/m 4**; wie alle vier de modules afrondt ontvangt het diploma **Yin Yoga Specialist**. Daarnaast trainingen zoals **"Eerst Jij"** (8-weeks online burn-outherstelprogramma) en een **Hormoonyoga-training**.

Het platform moet drie werelden bedienen:

1. **Publiek** — landingspagina met zakelijke én persoonlijke propositie, opleidingenoverzicht met prijzen, over ons, contact.
2. **Klanten (leden)** — beveiligde eigen omgeving: gevolgde opleidingen en voortgang, betaalde digitale content, aanvragen indienen, beveiligde één-op-één dialoog met Yoga Companie.
3. **Admin** — CRM en volledig beheer: klanten, inschrijvingen, content, voortgangsmonitoring, berichten, visuele site-editor, AI-socialmediatool.

**Merkstijl:** rustig, zakelijk, intuïtief, persoonlijk, uitnodigend zonder dwingend te zijn. Geen lappen tekst: korte, subtiele teksten, heldere uitleg, duidelijke propositie, eenvoudig te bedienen.

---

## 2. NIET-ONDERHANDELBARE UITGANGSPUNTEN

1. **Strikte klantscheiding.** Een klant kan onder geen enkele omstandigheid data van een andere klant zien of muteren. Afgedwongen op databaseniveau met Row Level Security (RLS) op **elke** tabel — nooit alleen in applicatiecode.
2. **AVG-conform by design.** EU-datalocatie (Supabase regio Frankfurt, Vercel regio `fra1`), dataminimalisatie, doelbinding, bewaartermijnen, recht op inzage/export en verwijdering ingebouwd (§17).
3. **Altijd inloggen** voor klant- en adminomgeving. **2FA (TOTP)**: verplicht voor admins, optioneel aan te zetten door klanten.
4. **Versleuteld en veilig.** TLS overal (HSTS), encryptie at rest (Supabase AES-256), signed URLs voor beschermde content, security headers (CSP, X-Frame-Options, Referrer-Policy), server-side validatie met Zod op elke input.
5. **Database zo klein mogelijk.** Alleen velden opslaan die aantoonbaar nodig zijn. Geen "handig voor later"-kolommen. Stripe is de bron van betaalgegevens; wij bewaren alleen referenties en status.
6. **Modulair en wijzigingsbestendig.** Feature-based architectuur met een service-laag; een aanpassing in één module mag geen impact hebben op de rest (§4). Alle site-teksten/beelden komen uit de database (CMS-blokken), zodat contentwijzigingen géén deploy vereisen.
7. **Mobile-first voor accounthouders.** Telefoon: zeer overzichtelijk en eenvoudig (bottom-navigatie, grote tap-targets, één taak per scherm). Tablet gebruikt de desktop-layout.
8. **Voorbereid op API-koppelingen.** Alle businesslogica achter een service-laag; publieke endpoints geversioneerd onder `/api/v1/` (§16).

---

## 3. TECHSTACK

| Laag                  | Keuze                                                  | Reden                                                 |
| --------------------- | ------------------------------------------------------ | ----------------------------------------------------- |
| Framework             | Next.js 15 (App Router) + TypeScript (strict)          | SSR/ISR, server actions, ecosysteem                   |
| Styling               | Tailwind CSS 4 + shadcn/ui (aangepast op designtokens) | Snel, consistent, toegankelijk                        |
| Database/Auth/Storage | Supabase (cloud, regio **Frankfurt eu-central-1**)     | Postgres + RLS, Auth met native TOTP-MFA, Storage, EU |
| Betalingen            | Stripe (Checkout) met **iDEAL** + creditcard           | Standaard in NL, veilig, geen kaartdata bij ons       |
| E-mail                | Resend + React Email; Supabase Auth SMTP via Resend    | Transactioneel + eenvoudige mailings                  |
| Rich text (editor)    | TipTap                                                 | Voor de visuele site-editor en berichten              |
| AI                    | Anthropic API (server-side, model `claude-sonnet-4-6`) | Social-mediatool                                      |
| Social publicatie     | Meta Graph API (Facebook-pagina + Instagram Business)  | §15; achter feature flag                              |
| Validatie             | Zod (gedeelde schema's client/server)                  | Eén waarheid voor validatie                           |
| Tests                 | Vitest (unit) + Playwright (e2e) + SQL RLS-tests       | Kwaliteitsborging                                     |
| Hosting               | Vercel (regio fra1)                                    | Eenvoudig, snel, previews                             |
| Package manager       | pnpm                                                   |                                                       |

---

## 4. PROJECTSTRUCTUUR (feature-based, wijzigingsbestendig)

```
src/
  app/
    (public)/            # landing, opleidingen, over-ons, contact, juridisch
    (auth)/              # login, registreren, wachtwoord-reset, 2fa
    portaal/             # klantomgeving (alleen ingelogd, rol: klant)
    admin/               # adminomgeving (alleen ingelogd, rol: admin, aal2)
    api/v1/              # geversioneerde API-routes + webhooks
  features/
    auth/  crm/  courses/  content/  enrollments/  payments/
    messages/  requests/  progress/  cms/  social/  mailing/  audit/
      # per feature: components/  server/ (services + queries)  schemas.ts
  components/ui/         # shadcn-basis + eigen bouwstenen
  lib/                   # supabase clients, stripe, resend, anthropic, utils
  emails/                # React Email templates (NL)
supabase/
  migrations/  seed.sql  tests/rls/
e2e/                     # Playwright
```

**Regels:** features importeren nooit uit elkaars `server/`-map, alleen via de eigen publieke `index.ts`. UI-componenten kennen geen database. Alle datatoegang via de service-laag in `features/*/server/`.

---

## 5. DESIGN SYSTEM

**Sfeer:** zacht en rustig, duidelijke contrasten (WCAG AA), veel witruimte. Warm en professioneel — géén standaard SaaS-look, geen paarse gradients.

```css
--color-green: #2e4a3b; /* primair — koppen, knoppen */
--color-green-dark: #22382c; /* hover, koppen donker */
--color-sand: #eae1ce; /* secundaire vlakken */
--color-sand-light: #f4eedf; /* zachte kaders */
--color-cream: #faf6ec; /* paginaachtergrond secties */
--color-ink: #2b2a26; /* bodytekst */
--color-muted: #6e6a5c; /* bijschriften */
--color-line: #d9d0bc; /* lijnen, borders */
--color-error: #9c3d2e;
--color-success: #3e6b4f;
```

- **Typografie:** koppen **EB Garamond** (600), body **Source Sans 3** (400/600), via `next/font` (Google Fonts, self-hosted door Next). Basis 16px, leading ruim (1.6).
- **Componenten:** rustige kaarten met 1px `--color-line` border en zachte radius (12px); primaire knop groen met crème tekst; secundaire knop outline; focus-states duidelijk zichtbaar.
- **Toon van teksten:** kort, warm, direct, "je"-vorm. Elke pagina één duidelijke call-to-action.
- Vermijd: schaduw-overdaad, meer dan twee accentkleuren, animaties die afleiden.

---

## 6. DATAMODEL (Supabase / Postgres)

Maak onderstaand schema aan als eerste migration. **Dataminimalisatie is leidend.**

```sql
-- rollen
create type user_role as enum ('admin','klant');
create type course_type as enum ('opleiding','training');
create type enrollment_status as enum ('in_afwachting','betaald','geannuleerd','afgerond');
create type request_kind as enum ('inschrijving','vraag','wijziging','avg_export','avg_verwijdering');
create type request_status as enum ('open','in_behandeling','afgerond');
create type block_kind as enum ('text','richtext','image','video');
create type content_kind as enum ('video','pdf','tekst');
create type post_status as enum ('concept','gepland','gepubliceerd','mislukt');

-- 1. profielen (gekoppeld aan auth.users; minimale set)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'klant',
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,                       -- optioneel
  marketing_consent_at timestamptz, -- opt-in mailings; null = geen consent
  created_at timestamptz not null default now(),
  deleted_at timestamptz            -- soft delete; AVG-verwijdering anonimiseert
);

-- 2. CRM-notities (alleen admin)
create table crm_notes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  author_id uuid not null references profiles(id),
  body text not null,
  created_at timestamptz not null default now()
);

-- 3. aanbod
create table courses (
  id uuid primary key default gen_random_uuid(),
  type course_type not null,
  title text not null,
  slug text not null unique,
  summary text not null,            -- kaarttekst
  description text not null,        -- detailpagina (markdown)
  audience text, requirements text, curriculum jsonb,   -- modules/blokken
  study_load_text text, location text, max_participants int,
  certificate_text text,
  price_cents int not null, currency text not null default 'eur',
  stripe_price_id text,
  has_digital_content boolean not null default false,
  is_active boolean not null default true,
  sort int not null default 0
);

-- 4. digitale content (LMS): course -> modules -> lessen -> items
create table course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null, sort int not null default 0
);
create table lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references course_modules(id) on delete cascade,
  title text not null, sort int not null default 0
);
create table content_items (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  kind content_kind not null,
  title text not null,
  body text,               -- bij kind='tekst' (markdown)
  storage_path text,       -- bij video/pdf: pad in bucket 'protected-content'
  duration_seconds int,
  is_preview boolean not null default false,
  sort int not null default 0
);

-- 5. inschrijvingen = toegangsrechten (entitlements)
create table enrollments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  course_id uuid not null references courses(id),
  status enrollment_status not null default 'in_afwachting',
  stripe_checkout_session_id text,
  amount_cents int, paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique (profile_id, course_id)
);

-- 6. voortgang ("waar ben ik gebleven")
create table progress (
  profile_id uuid not null references profiles(id) on delete cascade,
  content_item_id uuid not null references content_items(id) on delete cascade,
  last_position_seconds int not null default 0,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (profile_id, content_item_id)
);

-- 7. aanvragen vanuit het portaal
create table requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  kind request_kind not null,
  body text,
  status request_status not null default 'open',
  handled_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

-- 8. beveiligde dialoog (1 conversatie per klant)
create table conversations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references profiles(id),
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

-- 9. CMS-blokken voor de visuele editor
create table content_blocks (
  page_key text not null,      -- 'home' | 'over-ons' | 'contact' | ...
  block_key text not null,     -- 'hero_titel' | 'hero_beeld' | ...
  kind block_kind not null,
  value jsonb not null,        -- gepubliceerde inhoud
  draft_value jsonb,           -- concept; 'publiceren' kopieert draft -> value
  updated_by uuid references profiles(id),
  updated_at timestamptz not null default now(),
  primary key (page_key, block_key)
);

-- 10. contact & mailing
create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null, email text not null, phone text, body text not null,
  created_at timestamptz not null default now()
);
create table mailings (
  id uuid primary key default gen_random_uuid(),
  subject text not null, body_html text not null,
  segment text not null default 'marketing_consent',
  scheduled_at timestamptz, sent_at timestamptz,
  created_by uuid references profiles(id)
);

-- 11. social posts (AI-tool)
create table social_posts (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('instagram','facebook','beide')),
  caption text not null, image_path text,
  status post_status not null default 'concept',
  scheduled_at timestamptz, published_at timestamptz, error text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- 12. audit log (AVG-verantwoording; alleen admin-acties)
create table audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references profiles(id),
  action text not null, entity text not null, entity_id text,
  meta jsonb, created_at timestamptz not null default now()
);
```

### RLS-policies (verplicht; op ELKE tabel `enable row level security`)

```sql
create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from profiles
                  where id = auth.uid() and role = 'admin' and deleted_at is null) $$;
```

| Tabel                             | Klant (auth.uid)                                                                            | Admin                               | Anoniem                 |
| --------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------- | ----------------------- |
| profiles                          | select/update **eigen rij** (niet `role`, niet `deleted_at`)                                | alles                               | —                       |
| crm_notes                         | —                                                                                           | alles                               | —                       |
| courses (+modules/lessons)        | select waar `is_active`                                                                     | alles                               | select waar `is_active` |
| content_items                     | select alleen bij **betaalde enrollment** op de bijbehorende course, of `is_preview`        | alles                               | select `is_preview`     |
| enrollments                       | select eigen rijen; insert eigen rij (status altijd `in_afwachting`)                        | alles                               | —                       |
| progress                          | select/insert/update eigen rijen                                                            | select (monitoring)                 | —                       |
| requests                          | select/insert eigen rijen                                                                   | alles                               | —                       |
| conversations/messages            | select op eigen conversatie; insert message in eigen conversatie (`sender_id = auth.uid()`) | alles                               | —                       |
| content_blocks                    | select `value`                                                                              | alles                               | select `value`          |
| contact_messages                  | —                                                                                           | select/delete                       | insert                  |
| mailings, social_posts, audit_log | —                                                                                           | alles (audit: alleen select/insert) | —                       |

Schrijf voor elke policy een **RLS-test** in `supabase/tests/rls/` (pgTAP of SQL-scripts): o.a. "klant A kan enrollment/progress/messages van klant B niet lezen of schrijven", "anoniem kan geen content_items zonder preview lezen", "klant kan eigen rol niet wijzigen".

### Storage buckets

- `public-media` — publiek leesbaar; beelden voor de site (upload alleen admin).
- `protected-content` — **privé**; video's en pdf's van digitale content. Toegang uitsluitend via een server-route die de entitlement controleert en een **signed URL (60 min)** afgeeft.
- `avatars` — privé; alleen eigenaar + admin.

---

## 7. AUTH & 2FA

- Supabase Auth, e-mail + wachtwoord (minimaal 12 tekens; zxcvbn-sterkte-indicator). Registratie met e-mailverificatie. Wachtwoord-reset via e-mail (Resend als SMTP van Supabase Auth).
- **Klantaccounts** ontstaan op twee manieren: (a) zelf registreren, (b) admin nodigt uit vanuit CRM (invite-mail met activatielink). Bij registratie wordt automatisch een `profiles`-rij en een `conversations`-rij aangemaakt (trigger).
- **2FA = TOTP** via Supabase MFA (authenticator-app, met QR-code en herstelcodes):
  - Admin: **verplicht** — `/admin/*` vereist sessie-assurance **aal2**; zonder 2FA wordt de admin naar de 2FA-setup geleid en komt er niet in.
  - Klant: optioneel aan/uit te zetten in Profiel → Beveiliging.
- **Middleware** (`src/middleware.ts`): `/portaal/*` vereist ingelogd + rol klant of admin; `/admin/*` vereist rol admin + aal2; publieke routes vrij. Sessieverloop na 12 uur inactiviteit.
- Rate limiting op login/registratie/reset/contact (Supabase Auth-limits + eigen sliding-window per IP op de contact- en registratieroutes) en een honeypot-veld op publieke formulieren.

---

## 8. PUBLIEKE SITE

Pagina's (alle content uit `content_blocks`, bewerkbaar via de site-editor §14):

1. **`/` Landing** — hero met rustige fotografie, propositie in één zin ("Opleidingsinstituut voor yoga — opleidingen, trainingen en yogalessen"), daarná twee proposities naast elkaar: **zakelijk** (voor docenten/professionals en werkgevers: specialiseren, bijscholen, duurzame inzetbaarheid) en **persoonlijk** (voor jezelf: herstel, balans, verdieping). Drie kaarten: Opleidingen / Trainingen / Yogalessen. Blok "Waarom Yoga Companie" (ervaren docenten, kleine groepen ≤12, praktijkgericht, certificaat). Testimonials (3, uit CMS). Afsluitende CTA.
2. **`/opleidingen`** + **`/opleidingen/[slug]`** — overzicht met kaarten (titel, samenvatting, **prijs**, startinfo); detailpagina met: voor wie, toelatingseisen, curriculum (accordeon per module/blok), studiebelasting, lesdata/locatie, groepsgrootte, certificering, prijs (incl. "Betalen in termijnen mogelijk") en knop **Inschrijven** → account/inlog → Stripe Checkout.
3. **`/trainingen`** + detail — zelfde patroon; "Eerst Jij" en "Hormoonyoga".
4. **`/over-ons`** — verhaal en filosofie, blok "Onze docenten" (foto + korte bio uit CMS).
5. **`/contact`** — kort formulier (naam, e-mail, telefoon optioneel, bericht) → `contact_messages` + notificatiemail naar admin + nette bevestiging.
6. **Juridisch** — `/privacyverklaring`, `/algemene-voorwaarden`, `/cookies` (nette NL-concepttekst, in CMS bewerkbaar). Cookiebanner alleen indien niet-functionele cookies worden gebruikt; standaard **géén** tracking-cookies.
7. **SEO** — per pagina unieke title/description, OG-afbeelding, sitemap.xml, robots.txt, nette NL-slugs; JSON-LD `Course` op opleidingsdetailpagina's. Termen: "yogaopleiding", "yin yoga opleiding", "yoga opleidingsinstituut".

---

## 9. BETALINGEN (Stripe)

- **Stripe Checkout**, betaalmethoden **iDEAL + kaart**, eenmalige betaling voor opleidingen, trainingen en digitale content. (Abonnementen voor lessen: pas in optionele Fase 8.)
- Flow: klant (ingelogd) klikt Inschrijven → server action maakt `enrollments`-rij (`in_afwachting`) + Checkout Session (metadata: `enrollment_id`) → redirect naar Stripe → succes-/annuleringspagina.
- **Webhook** `/api/v1/webhooks/stripe` (signature-verificatie verplicht): `checkout.session.completed` → enrollment op `betaald`, `paid_at`, `amount_cents` → bevestigingsmail. Idempotent verwerken.
- Terugbetalingen doet Pieter in het Stripe-dashboard; webhook `charge.refunded` zet status op `geannuleerd` en logt in audit_log.
- "Betalen in termijnen in overleg": adminfunctie **"Betaallink maken"** (Stripe Payment Link of handmatige regeling) + enrollment handmatig op `betaald` zetten (met audit-log-registratie).
- Bewaar **geen** kaart- of rekeninggegevens; alleen Stripe-ID's, bedrag en status.

---

## 10. E-MAIL (Resend)

React Email-templates (NL, rustige huisstijl, tekstversie meesturen):

1. Accountverificatie & uitnodiging (via Supabase Auth SMTP → Resend)
2. Wachtwoord-reset
3. Inschrijfbevestiging (na betaling; met praktische info)
4. Betaalbevestiging/kwitantie-verwijzing
5. Contactformulier: bevestiging naar afzender + notificatie naar admin
6. Nieuw bericht in je portaal-dialoog ("Je hebt een bericht van Yoga Companie — log in om het te lezen"; **nooit** de inhoud in de mail)
7. **Automatische mailings**: admin stelt in `/admin/mailings` een mail op → verzending uitsluitend naar profielen met `marketing_consent_at` gezet; elke mailing bevat een afmeldlink (zet consent op null). Verzenden via een Supabase Edge Function met batching.

---

## 11. KLANTPORTAAL (`/portaal`)

Eigen omgeving met **beperkte rechten** (alles via RLS afgedwongen):

- **Dashboard** — begroeting, "verder waar je gebleven was" (laatste content-item), openstaande aanvragen, ongelezen berichten.
- **Mijn opleidingen** — betaalde inschrijvingen; per opleiding voortgangsbalk (x van y items afgerond) en knop "Verder gaan".
- **Contentspeler** — modules → lessen → items; video (signed URL, positie elke 10 s opslaan in `progress`), pdf (viewer + download via signed URL), tekst. Knop "Markeer als afgerond". Vorige/volgende-navigatie.
- **Aanvragen** — nieuw verzoek (soort + toelichting): inschrijving, vraag, wijziging, AVG-export, AVG-verwijdering; overzicht met status.
- **Berichten** — de beveiligde dialoog met Yoga Companie: chat-achtige weergave, alleen eigen conversatie zichtbaar, versleuteld in transit en at rest.
- **Profiel** — naam/telefoon wijzigen, wachtwoord wijzigen, **2FA aan/uit**, marketing-toestemming aan/uit, "Download mijn gegevens" (JSON-export), "Verwijder mijn account" (maakt AVG-verwijderaanvraag aan).
- **Mobiel:** bottom-navigatie met 4 items (Home, Opleidingen, Berichten, Profiel), grote tap-targets (≥44px), één taak per scherm, geen zijbalken. Tablet/desktop: rustige zijbalk.

---

## 12. DIGITALE CONTENT & MONITORING

- Structuur en toegang: zie §6 (content_items + enrollments + signed URLs). Alleen `is_preview`-items zijn zonder betaling zichtbaar (als proefles op de detailpagina).
- Upload van video/pdf door admin naar `protected-content` (max 2 GB; toon uploadvoortgang). Video afspelen als progressive MP4 via signed URL; document in §16 hoe later een videoplatform (Mux/Vimeo) kan worden ingehangen zonder de datastructuur te wijzigen.
- **Monitoring (admin):** per opleiding een voortgangsmatrix (deelnemers × items: niet gestart / bezig / afgerond, laatst actief), per klant een voortgangskaart in het CRM. Exporteerbaar als CSV.

---

## 13. ADMIN (`/admin`) — CRM & BEHEER

- **Dashboard** — nieuwe inschrijvingen, openstaande aanvragen, ongelezen berichten, omzet deze maand (uit enrollments), laatste contactberichten.
- **Klanten (CRM)** — lijst met zoeken/filteren; klant **aanmaken** (uitnodigen), **bewerken**, **deactiveren (soft delete)** en **AVG-verwijderen** (anonimiseren: naam → "Verwijderde klant", e-mail/telefoon leeg, auth-user verwijderen; enrollments/omzet blijven geanonimiseerd staan voor de boekhouding). Klantdetail: gegevens, inschrijvingen + betaalstatus, voortgang, aanvragen, notities (crm_notes), dialoog, consentstatus, knop "Exporteer gegevens (JSON)".
- **Inschrijvingen** — overzicht + filters; handmatig aanmaken/markeren als betaald (met reden → audit_log).
- **Aanbod** — opleidingen/trainingen CRUD incl. curriculum-editor (modules/blokken), prijzen, activeren/deactiveren; digitale content beheren (modules → lessen → items, upload, volgorde slepen).
- **Aanvragen** — behandelen, status wijzigen, koppelen aan acties (bijv. AVG-export genereren).
- **Berichten** — inbox over alle klantconversaties, beantwoorden.
- **Contactberichten**, **Mailings** (§10), **Social** (§15), **Site-editor** (§14).
- **Instellingen** — teamleden (extra admins uitnodigen; 2FA verplicht), bedrijfsgegevens.
- **Audit log** — elke admin-mutatie op klanten, enrollments, content en instellingen wordt gelogd (`audit_log`); inzien met filters.

---

## 14. VISUELE SITE-EDITOR (admin)

> Onderzoeksvraag uit de opdracht: kan er een grafische editor komen voor visuele aanpassingen (tekst, foto, video), zonder applicatie-aanpassingen? **Ja — bouw het als blok-CMS:** de layout van elke publieke pagina staat vast in code; alle inhoud (teksten, beelden, video-URL's) komt uit `content_blocks`. De admin bewerkt de inhoud van de blokken, nooit de structuur. Dat is precies "visueel aanpassen zonder de applicatie te raken".

- `/admin/site-editor`: kies pagina → lijst van secties met live-preview ernaast (iframe van de pagina in draft-modus).
- Per blok: tekst (input), richtext (TipTap: vet/cursief/kop/lijst/link — meer niet), afbeelding (upload naar `public-media`, met bijsnijden en verplicht alt-tekstveld), video (YouTube/Vimeo-URL).
- Werkwijze **concept → publiceren**: wijzigingen gaan naar `draft_value`; "Bekijk concept" toont de pagina met drafts; "Publiceer" kopieert draft → value (met audit-log). "Herstel" gooit het concept weg.
- Publieke pagina's lezen uitsluitend `value` (met ISR-revalidatie na publiceren).

---

## 15. AI-SOCIALMEDIATOOL + META-KOPPELING (admin)

- `/admin/social`: kies onderwerp (vrije tekst of selecteer een opleiding/training) + doel (informeren / inschrijvingen / inspiratie) + platform → server-route roept de **Anthropic API** aan (system prompt met merkstijl uit §5, altijd NL, geen medische claims, geen genezingsbeloften) → **3 caption-varianten** met passende hashtags → admin kiest, bewerkt en koppelt een afbeelding uit `public-media`.
- **Publiceren:**
  - Stap 1 (direct bruikbaar): "Kopieer naar klembord" + "Download afbeelding" — handmatig plaatsen.
  - Stap 2 (achter feature flag `META_PUBLISHING_ENABLED`): koppeling met **Meta Graph API** — OAuth-koppeling van de Facebook-pagina en het Instagram Business-account, tokens **server-side versleuteld** opgeslagen; direct publiceren of inplannen (`scheduled_at` + cron Edge Function). Let op: hiervoor is een Meta-developer-app met app-review op de publish-permissies nodig; bouw de integratie zó dat de tool zonder de koppeling volledig werkt.
- Alle posts en statussen in `social_posts`.

---

## 16. API-LAAG & TOEKOMSTIGE KOPPELINGEN

- Alle externe endpoints onder `/api/v1/` met consistente JSON-envelop `{ data, error }`; interne pagina's gebruiken server actions die dezelfde services aanroepen.
- Nu al aanwezig: Stripe-webhook, content-signed-URL-route, mailing-cron, social-cron.
- Voorbereid (documenteer in `docs/api.md`, nog niet activeren): API-keys-tabel + Bearer-auth voor toekomstige koppelingen (boekhouding, roostertool, videoplatform). Service-laag is de enige plek met businesslogica, zodat een koppeling later alleen een dun endpoint toevoegt.

---

## 17. BEVEILIGING & AVG — CONCRETE MAATREGELEN

1. RLS op elke tabel + RLS-testsuite (§6). Service-role-key uitsluitend server-side.
2. Security headers via `next.config`: CSP (default-src 'self' + expliciete allowlist), HSTS, X-Content-Type-Options, Referrer-Policy `strict-origin-when-cross-origin`, X-Frame-Options DENY (behalve de preview-iframe van de site-editor, met eigen route + zelfde origin).
3. Zod-validatie server-side op élke mutatie; nooit vertrouwen op client-validatie.
4. Signed URLs (60 min) voor alle beschermde bestanden; geen publieke paden naar `protected-content`.
5. **Dataminimalisatie:** het schema in §6 is de volledige set; voeg geen velden toe zonder noodzaak-notitie in de migration.
6. **Bewaartermijnen** (documenteer in `docs/avg.md` en bouw een maandelijkse opschoon-cron): contact_messages 12 maanden; audit_log 24 maanden; soft-deleted profielen na 6 maanden definitief anonimiseren; mailinglogs 12 maanden.
7. **Rechten van betrokkenen:** export (JSON met alle rijen van de klant) en verwijdering (anonimisering) als ingebouwde functies — zowel door de klant zelf (portaal) als door admin (CRM).
8. Verwerkersovereenkomsten afsluiten met: Supabase, Vercel, Stripe, Resend, Anthropic, Meta (checklist in `docs/avg.md`; Pieter tekent deze in de dashboards).
9. Privacyverklaring en AV: nette Nederlandse concepttekst genereren (met de subverwerkers hierboven benoemd), duidelijk gemarkeerd als **concept — juridisch laten toetsen**.
10. Back-ups: Supabase daily backups aan; documenteer restore-procedure in `docs/beheer.md`.
11. Logging zonder persoonsgegevens in platte logs; foutmeldingen naar gebruiker altijd generiek.

---

## 18. MOBIEL & TOEGANKELIJKHEID

- Mobile-first bouwen; breakpoints: telefoon < 768px (portaal met bottom-nav, §11), tablet ≥ 768px = desktop-layout.
- WCAG 2.1 AA: contrast, focus-states, labels, `aria`-attributen, toetsenbordnavigatie, `prefers-reduced-motion` respecteren.
- Core Web Vitals: beelden via `next/image`, fonts self-hosted, geen layout-shift; Lighthouse ≥ 90 op de publieke pagina's.

---

## 19. SEED DATA (echte content — gebruik letterlijk)

`supabase/seed.sql` + CMS-blokken vullen met:

**Opleiding (type `opleiding`, has_digital_content = false):**

- **200-uurs Yin Yoga Specialist Opleiding** — slug `200-uurs-yin-yoga-specialist`; prijs € 2.995; samenvatting: "Vier modules van 50 uur — van de basis van Yin Yoga naar specialist in herstel en revalidatie. Per module een certificaat Yin Yoga niveau 1 t/m 4; na alle vier de modules het diploma Yin Yoga Specialist."; curriculum (jsonb) met de vier modules: 1. De basis van Yin Yoga (fundamenten yin & yang, ontstaan en visie, basisprincipes, houdingen en de werking op het lichaam) · 2. Het zenuwstelsel & de basis van de meridiaanleer · 3. Chinese geneeskunde en Yin Yoga (werken met meridianen, de elementen en de orgaanklok) · 4. Herstel & revalidatie (alle kennis integreren, inzetten voor herstel en revalidatie, persoonlijke lessen maken) — elk 50 uur, met de blokindeling uit de opleidingsgids; locatie "Studio van Yoga Companie" (adres volgt — geen plaatsnaam opnemen); max 12; certificaat: "Certificaat Yin Yoga niveau 1 t/m 4 per module; diploma Yin Yoga Specialist na alle vier de modules — modules zijn ook los te volgen"; studiebelasting: "Per module: 5 lesdagen (± 32 contacturen) + ± 18 uur zelfstudie en eindopdracht".
- Vier losse modules als aparte courses (€ 845 elk) met slugs `yin-niveau-1-basis`, `yin-niveau-2-zenuwstelsel-meridiaanleer`, `yin-niveau-3-chinese-geneeskunde`, `yin-niveau-4-herstel-revalidatie` — met bovenstaande titels en per module de certificaatnaam "Yin Yoga niveau X".

**Trainingen (type `training`):**

- **Eerst Jij — 8-weeks online herstelprogramma** — € 797 (variant Begeleid), `has_digital_content = true`; seed de LMS-structuur: 8 modules (Week 1 t/m 8) met per week 1 les en 3 placeholder-items (weekvideo, yogavideo, schrijfopdracht-pdf).
- **Hormoonyoga-training** — € 295, korte omschrijving.

**CMS-blokken:** hero-titel "Yoga Companie — opleidingsinstituut voor yoga", subtitel "Opleidingen, trainingen en yogalessen. Deskundig en betrouwbaar, warm en persoonlijk.", propositieblokken zakelijk/persoonlijk, 3 testimonial-placeholders, over-ons-tekst, 2 docent-bio-placeholders, contactgegevens-placeholders, footer (KvK-placeholder, links naar juridische pagina's).

**Admin-seed:** één admin-account op basis van env `SEED_ADMIN_EMAIL` (invite-flow; nooit een wachtwoord in seed).

---

## 20. TESTEN & KWALITEIT

- **RLS-tests** (§6) — verplicht groen vóór Fase 2.
- **Playwright-smoketests:** publieke pagina's renderen; registreren + inloggen + 2FA-setup; inschrijf-flow t/m Stripe-testcheckout (test mode) en webhook-simulatie; klant ziet content pas na betaling; klant A ziet niets van klant B (negatieve test via API); admin-CRM CRUD; site-editor concept → publiceer.
- **Vitest** voor services (prijsberekening, entitlement-check, consent-logica).
- **CI (GitHub Actions):** lint + typecheck + unit + e2e (tegen lokale Supabase) op elke PR.
- `docs/beheer.md`: runbook voor Pieter (deploy, env vars, backup/restore, nieuwe admin, Stripe live zetten).

---

## 21. FASERING & DEFINITION OF DONE

**Fase 0 — Fundament.** Next.js 15 + TS strict + Tailwind + shadcn, designtokens (§5), layout-shell (header/footer), fonts, pnpm scripts, ESLint/Prettier, CI-skeleton, PROGRESS.md.
_DoD:_ project draait lokaal, CI groen, tokens zichtbaar op een styleguide-pagina `/dev/styleguide`.

**Fase 1 — Database & auth.** Volledige migrations (§6) + RLS + RLS-tests, Supabase-clients, registratie/login/reset, TOTP-2FA, rollen, middleware, profieltrigger, seed-admin.
_DoD:_ RLS-tests groen; admin kan niet zonder 2FA in `/admin`; klant-registratie werkt e2e.

**Fase 2 — Publieke site + CMS.** Alle publieke pagina's (§8) op basis van `content_blocks` + seed-content (§19), juridische conceptpagina's, SEO, contactformulier.
_DoD:_ Lighthouse ≥ 90; alle teksten komen uit de database; contactformulier landt in admin-notificatiemail.

**Fase 3 — Betalingen & e-mail.** Stripe Checkout + webhook + enrollments, bevestigingsmails, succes-/annuleringspagina's, admin "betaallink/handmatig betaald".
_DoD:_ test-iDEAL-betaling zet enrollment op betaald en verstuurt de juiste mail; webhook idempotent; negatieve tests groen.

**Fase 4 — Klantportaal & LMS.** Portaal (§11) incl. contentspeler, voortgang, aanvragen, berichten, profiel + 2FA + AVG-zelfservice; mobiele bottom-nav.
_DoD:_ klant ziet alleen eigen data (Playwright-negatieftests); video hervat op laatste positie; berichten werken twee kanten op.

**Fase 5 — Admin: CRM & beheer.** Alles uit §13 incl. monitoringmatrix, audit log, AVG-export/verwijderen, aanbod- en contentbeheer met upload.
_DoD:_ volledige klantlevenscyclus (uitnodigen → inschrijven → monitoren → exporteren → verwijderen) werkt en is gelogd.

**Fase 6 — Visuele site-editor.** §14 volledig, met preview en concept/publiceer.
_DoD:_ admin wijzigt hero-tekst en -beeld zonder deploy; publiek ziet wijziging na publiceren; audit-log-regel aanwezig.

**Fase 7 — AI-social & mailings.** §15 stap 1 (+ stap 2 achter feature flag), mailings met consent en afmeldlink, opschoon-crons (§17.6).
_DoD:_ AI genereert 3 NL-varianten; mailing gaat alleen naar consent-profielen; afmelden werkt.

**Fase 8 — Optioneel/later.** Wekelijks lesrooster + lesabonnementen (Stripe subscriptions), publieke API-keys, Mux/Vimeo-integratie.

---

## 22. ENVIRONMENT VARIABLES (`.env.example`)

```
NEXT_PUBLIC_SUPABASE_URL=            SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=       SUPABASE_DB_URL=            # alleen CI/migrations
STRIPE_SECRET_KEY=                   STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
RESEND_API_KEY=                      EMAIL_FROM="Yoga Companie <info@yogacompanie.nl>"
ANTHROPIC_API_KEY=
META_PUBLISHING_ENABLED=false        META_APP_ID=   META_APP_SECRET=
NEXT_PUBLIC_SITE_URL=https://yogacompanie.nl
SEED_ADMIN_EMAIL=
```

---

## 23. TRACEERBAARHEID — EIS → OPLOSSING

| Eis van Pieter                                                               | Waar gerealiseerd                   |
| ---------------------------------------------------------------------------- | ----------------------------------- |
| Klantenbestand/CRM, admin-only                                               | §13 + RLS §6                        |
| Beheer algemeen, admin-only                                                  | §13                                 |
| Eigen omgeving met beperkte rechten bij klantaccount                         | §11 + RLS §6                        |
| Klanten bewerken, beheren, verwijderen                                       | §13 (soft delete + AVG-verwijderen) |
| Betaalde digitale content, gemonitord door admin, wachtwoord + 2FA           | §12 + §7 + §9                       |
| Landingspagina met zakelijke én persoonlijke propositie                      | §8.1                                |
| Over mij/ons                                                                 | §8.4                                |
| Overzicht opleidingen met prijzen                                            | §8.2 + §19                          |
| Zacht/rustig kleurgebruik, contrast, rustig lettertype                       | §5                                  |
| Strikte klantscheiding                                                       | §2.1 + §6 RLS + §20 negatieve tests |
| AVG-conform                                                                  | §17                                 |
| Altijd inloggen, 2FA-mogelijkheid                                            | §7                                  |
| Veilig en versleuteld                                                        | §2.4 + §17                          |
| Wijzigen zonder impact op de hele applicatie                                 | §4 + §14 (content zonder deploy)    |
| Grafische editor voor tekst/foto/video                                       | §14 (onderzocht: ja, als blok-CMS)  |
| Database zo klein mogelijk                                                   | §2.5 + §6                           |
| E-mailfunctie (reset, account, mailings, inschrijving)                       | §10                                 |
| Betaalfunctie                                                                | §9                                  |
| Toekomstige API-koppelingen                                                  | §16                                 |
| Mobiel zeer eenvoudig voor accounthouders; tablet = laptop                   | §11 + §18                           |
| AI-tool voor Meta-posts + Instagram/Facebook-koppeling                       | §15                                 |
| Klantportaal: aanvragen, gevolgde opleidingen, voortgang, beveiligde dialoog | §11 + §12                           |
