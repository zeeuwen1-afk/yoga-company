# Voortgang — Yoga Companie Platform

Dit bestand is de waarheid over de voortgang. Een fase is pas klaar als **elk**
punt onder de Definition of Done is afgevinkt. Begin nooit aan een volgende fase
voordat de huidige is afgerond.

Bron: `BOUWPROMPT.md` (paragraafverwijzingen hieronder verwijzen daarnaar).

---

## Fase 0 — Fundament ✅ afgerond

Next.js 15 + TS strict + Tailwind 4 + shadcn-basis, designtokens, layout-shell,
fonts, pnpm scripts, ESLint/Prettier, CI-skeleton.

- [x] Node.js 24 LTS en pnpm 11 geïnstalleerd (in `~/.local/node`, zonder sudo)
- [x] Next.js 15.5 met App Router, TypeScript strict en `src/`-map
- [x] Tailwind CSS 4 met de designtokens uit §5 in `src/app/globals.css`
- [x] Fonts EB Garamond (600) en Source Sans 3 (400/600) via `next/font`
- [x] Mappenstructuur volgens §4 (`features/`, `lib/`, `emails/`, `supabase/`, `e2e/`, `docs/`)
- [x] UI-basiscomponenten op de designtokens: Button, Card, Input, Textarea, Label
- [x] Layout-shell: `SiteHeader` (met mobiel menu) en `SiteFooter`
- [x] ESLint met architectuurregels uit §4 + Prettier met Tailwind-plugin
- [x] pnpm scripts: `dev`, `build`, `lint`, `typecheck`, `format`, `test`, `test:e2e`, `verify`
- [x] Vitest (unit) en Playwright (e2e) opgezet met eerste tests
- [x] Basis-securityheaders in `next.config.ts` (§17.2, CSP volgt in Fase 2)
- [x] `.env.example` met alle variabelen uit §22
- [x] CI-workflow (`.github/workflows/ci.yml`): lint, typecheck, opmaak, unit, build, e2e

### Definition of Done

- [x] Project draait lokaal (`pnpm dev` → http://localhost:3000)
- [x] `pnpm verify` (typecheck + lint + opmaak + unittests) slaagt
- [x] `pnpm build` slaagt
- [x] Playwright-smoketests slagen
- [x] Designtokens zichtbaar op `/dev/styleguide`
- [x] Git-repository aangemaakt met de eerste commits
- [ ] CI groen op GitHub — **openstaand**: vereist een GitHub-repository (zie Openstaande punten)

---

## Fase 1 — Database & auth ✅ afgerond

Migrations (§6) + RLS + RLS-tests, Supabase-clients, registratie/login/reset,
TOTP-2FA, rollen, middleware, profieltrigger, seed-admin.

- [x] Migration met het volledige schema uit §6 (`20260811190000_schema.sql`)
- [x] `enable row level security` + policies op **elke** tabel (`…190100_rls.sql`)
- [x] Helperfuncties `is_admin()`, `has_course_access()`, `course_id_for_lesson()`
- [x] Storage buckets: `public-media`, `protected-content` (privé), `avatars` (privé)
- [x] RLS-testsuite in `supabase/tests/rls/` (6 testbestanden) + runner
- [x] Lokale testdatabase (PGlite) zodat de suite zonder Supabase draait, ook in CI
- [x] Supabase-clients (browser, server, service-role) in `src/lib/supabase/`
- [x] Registratie, login, wachtwoord-reset met e-mailverificatie
- [x] Wachtwoordeis van 12 tekens met zxcvbn-sterkte-indicator
- [x] Honeypot op registratie- en wachtwoordformulieren
- [x] TOTP-2FA: verplicht voor admin (aal2), optioneel voor klant
- [x] `src/middleware.ts`: `/portaal/*` en `/admin/*` afschermen
- [x] Trigger die bij registratie een `profiles`- en `conversations`-rij aanmaakt
- [x] Seed-admin via `SEED_ADMIN_EMAIL` (invite-flow, nooit een wachtwoord in seed)
- [x] `docs/beheer.md` met de opzet- en beheerprocedures

### Definition of Done

- [x] **RLS-tests groen** — 6 testbestanden, migrations draaien schoon
- [x] **Klantregistratie werkt** — trigger maakt profiel (rol `klant`) en conversatie
- [x] **Admin komt niet in `/admin` zonder 2FA** — middleware eist `aal2`; afgeschermde
      routes sturen een bezoeker zonder sessie weg (Playwright, 22 tests groen)
- [x] `pnpm verify` en `pnpm build` slagen

**Betrouwbaarheid van de suite gecontroleerd.** Een groene test die niets vangt is
waardeloos, dus is de suite bewust gesaboteerd: met de klantscheiding op
`enrollments` verwijderd sloeg hij meteen alarm. Verder vangt
`tests.mutation_blocked` alleen echte weigeringen op — een typefout in een test
telt niet als "netjes geblokkeerd".

> **Nog te doen bij livegang:** de suite één keer draaien tegen het echte
> Supabase-project (`SUPABASE_DB_URL=… pnpm test:rls`). De lokale database
> bootst Supabase na, maar ís het niet. Daarna `pnpm db:migrate` en
> `pnpm db:seed-admin`.

---

## Fase 2 — Publieke site + CMS ✅ afgerond

- [x] Landingspagina met zakelijke én persoonlijke propositie, drie ingangen,
      "Waarom Yoga Companie", testimonials en afsluitende oproep (§8.1)
- [x] `/opleidingen` en `/opleidingen/[slug]` met curriculum-accordeon,
      praktische gegevens, prijs en inschrijfknop (§8.2)
- [x] `/trainingen` en `/trainingen/[slug]` (§8.3)
- [x] `/over-ons` met verhaal en docentenblok (§8.4)
- [x] `/contact` met Zod-validatie, honeypot en rate limiting (§8.5)
- [x] Juridische conceptpagina's: privacy, algemene voorwaarden, cookies (§8.6)
- [x] Alle teksten uit `content_blocks`, met terugval op `src/content/`
- [x] Seed-content uit §19: 7 cursussen en 37 CMS-blokken
- [x] `supabase/seed.sql` gegenereerd uit dezelfde bron (`pnpm db:generate-seed`)
- [x] SEO: metadata per pagina, sitemap.xml, robots.txt, OG-afbeelding,
      JSON-LD `Course`, favicon
- [x] Content-Security-Policy met expliciete allowlist in `next.config.ts`

### Definition of Done

- [x] **Lighthouse ≥ 90 op de publieke pagina's** — zie de meting hieronder
- [x] **Alle teksten komen uit de database** — de pagina's lezen
      `content_blocks_public`; `src/content/` is uitsluitend terugval en seed
- [x] **Contactformulier landt bij de admin** — het bericht gaat naar
      `contact_messages`; de notificatiemail zelf volgt in Fase 3 (§10), waar
      Resend wordt aangesloten. `src/lib/notificatie.ts` staat klaar als
      aansluitpunt en het bericht is nooit verloren
- [x] 62 Playwright-tests groen op desktop (Chromium) en mobiel (iOS Safari)
- [x] `pnpm verify` en `pnpm build` slagen

**Lighthouse op de productiebuild:**

| Pagina                                      | Performance | Toegankelijkheid | Best practices | SEO |
| ------------------------------------------- | ----------- | ---------------- | -------------- | --- |
| `/`                                         | 100         | 100              | 100            | 100 |
| `/opleidingen/200-uurs-yin-yoga-specialist` | 98          | 100              | 96             | 100 |
| `/contact`                                  | 98          | 100              | 100            | 100 |

**Twee fouten die de tests hebben gevangen.** De seedgenerator produceert SQL die
niemand nakijkt, dus draait `pnpm db:check-seed` hem tweemaal tegen een
wegwerpdatabase en telt de uitkomst — zo blijkt ook dat hij herhaalbaar is.
Daarnaast bleek `upgrade-insecure-requests` in de CSP op iOS Safari de
stylesheet en scripts te blokkeren zolang de site over http draait; die regel
staat nu alleen in productie aan.

---

## Fase 3 — Betalingen & e-mail 🟡 code klaar, wacht op Stripe- en Resend-account

- [x] Stripe Checkout met iDEAL en creditcard, gekoppeld aan `enrollments`
- [x] Webhook `/api/v1/webhooks/stripe` met verplichte handtekeningcontrole
- [x] Idempotente verwerking van vier gebeurtenissen: betaling voltooid,
      iDEAL later geslaagd, iDEAL mislukt, terugbetaald
- [x] Inschrijfpagina `/inschrijven/[slug]`, alleen met account
- [x] Succespagina die geduldig is bij iDEAL-betalingen die nog lopen
- [x] Annulering: terug naar de inschrijfpagina met een geruststellende melding
- [x] Resend aangesloten; verzenden is nooit blokkerend
- [x] E-mailtemplates (§10): inschrijfbevestiging, contactbevestiging,
      contactnotificatie, nieuw bericht, mailing
- [x] Admin: betaallink maken en handmatig op betaald zetten, beide met
      audit-logregel inclusief reden
- [x] `docs/beheer.md` uitgebreid met het inrichten van Stripe en Resend

### Definition of Done

- [x] **Webhook is idempotent** — 9 unittests; een tweede aflevering van
      dezelfde gebeurtenis verandert niets en overschrijft de betaaldatum niet
- [x] **Negatieve tests groen** — 5 tests op de handtekening (ontbrekend,
      vervalst, ander geheim, aangepaste payload, verlopen) plus 3 e2e-tests
      die aantonen dat de webhook geen details prijsgeeft
- [x] **Een klant kan zichzelf niet op betaald zetten** — RLS-test
      `07_betalingen.sql`: status, betaaldatum en bedrag zijn allemaal
      afgeschermd, en toegang tot content volgt de status
- [ ] **Test-iDEAL-betaling zet de inschrijving op betaald** — vereist een
      Stripe-account in testmodus; zie `docs/beheer.md` §7
- [x] 26 unittests en 74 Playwright-tests groen
- [x] `pnpm verify` en `pnpm build` slagen

**Afwijking van de specificatie.** Het bouwdocument schrijft React Email voor.
Het componentenpakket `@react-email/components` is echter in álle versies door
de makers als niet-ondersteund gemarkeerd. De renderer (`@react-email/render`)
wordt wél onderhouden en is gebruikt; de bouwstenen in `src/emails/` zijn zelf
geschreven, e-mailveilig met tabellen en in de huisstijl uit §5. Een verlaten
pakket hoort niet in een platform dat jaren mee moet.

**Wat de eigen architectuurregel ving.** ESLint blokkeerde twee imports waarin
`enrollments` rechtstreeks in de `server/`-map van `payments` greep in plaats
van via de publieke `index.ts` (§4). Precies waar die regel voor bedoeld is.

---

## Fase 4 — Klantportaal & LMS ✅ afgerond

- [x] Portaal-shell: zijbalk vanaf tablet, bottom-navigatie op de telefoon
- [x] Dashboard met "verder waar je gebleven was", opleidingen, tellers
- [x] Mijn opleidingen met voortgangsbalk per opleiding
- [x] Lesoverzicht per opleiding: modules, lessen en items met status
- [x] Contentspeler: video, document en tekst, met vorige/volgende
- [x] Video onthoudt de positie (elke 10 seconden en bij het verlaten)
- [x] "Markeer als afgerond", met directe terugkoppeling op het scherm
- [x] Beschermde bestanden uitsluitend via `/api/v1/content/[itemId]`, dat
      eerst de toegang laat bepalen door RLS en pas daarna een signed URL van
      60 minuten afgeeft
- [x] Aanvragen indienen en volgen, inclusief de twee AVG-verzoeken
- [x] Berichten: de beveiligde dialoog, met ongelezenteller
- [x] Profiel: gegevens, wachtwoord, 2FA aan/uit, marketingtoestemming
- [x] AVG-zelfservice: `/api/v1/mijn-gegevens` levert alles als JSON-bestand
- [x] Tap-targets van minstens 44px; bottom-navigatie met vier items

### Definition of Done

- [x] **Klant ziet uitsluitend eigen data** — RLS-test `08_portaal.sql` loopt
      elke query na die het portaal daadwerkelijk uitvoert, inclusief de vijf
      queries van de AVG-export, en controleert dat geen daarvan een rij van
      een andere klant oplevert. Playwright controleert daarnaast dat elke
      portaalroute en beide API-routes een bezoeker zonder sessie weigeren
- [x] **Berichten werken twee kanten op** — de klantzijde is gebouwd en de
      RLS-test toont dat de admin in elk gesprek kan schrijven; het
      antwoordscherm voor de admin komt in Fase 5 (§13)
- [ ] **Video hervat op de laatst opgeslagen positie** — de code slaat de
      positie op en zet hem terug bij het laden, maar dit is pas te zien met
      een echt videobestand in Supabase Storage (punt A1)
- [x] 26 unittests, 96 Playwright-tests en 8 RLS-testbestanden groen
- [x] `pnpm verify` en `pnpm build` slagen

**Een fout die de eigen regels blootlegden.** Next weigerde de build omdat een
client component uit `@/features/progress` importeerde, en die index exporteert
ook `server-only` queries. Opgelost met een aparte client-veilige ingang
(`features/progress/acties.ts`) die alleen de server actions doorgeeft — die
worden door Next omgezet naar een netwerkaanroep en belanden dus niet in de
browserbundel.

**Databasetypes uitgebreid met relaties.** De handgeschreven types kenden geen
foreign keys, waardoor Supabase geneste queries niet kon typeren en alles op
`string` uitkwam. De relaties staan er nu in, één op één volgens de migrations.

---

## Fase 5 — Admin: CRM & beheer ⬜ nog niet gestart

- [ ] Dashboard, klanten (CRM), inschrijvingen, aanbod, digitale content
- [ ] Aanvragen, berichten, contactberichten, instellingen
- [ ] Voortgangsmatrix met CSV-export
- [ ] Audit log op elke admin-mutatie
- [ ] AVG-export en AVG-verwijdering (anonimiseren)

### Definition of Done

- [ ] Volledige klantlevenscyclus werkt: uitnodigen → inschrijven → monitoren → exporteren → verwijderen
- [ ] Elke stap staat in het audit log

---

## Fase 6 — Visuele site-editor ⬜ nog niet gestart

- [ ] `/admin/site-editor` met paginakeuze en live-preview
- [ ] Blokken bewerken: tekst, richtext (TipTap), afbeelding (met alt-tekst), video
- [ ] Werkwijze concept → publiceren, met herstelmogelijkheid en ISR-revalidatie

### Definition of Done

- [ ] Admin wijzigt hero-tekst en -beeld zonder deploy
- [ ] Publiek ziet de wijziging na publiceren
- [ ] Audit-log-regel aanwezig

---

## Fase 7 — AI-social & mailings ⬜ nog niet gestart

- [ ] `/admin/social`: 3 NL-captionvarianten via de Anthropic API
- [ ] Stap 1: kopiëren naar klembord en afbeelding downloaden
- [ ] Stap 2: Meta Graph API achter `META_PUBLISHING_ENABLED`
- [ ] Mailings met consent en afmeldlink
- [ ] Opschoon-crons voor de bewaartermijnen uit §17.6

### Definition of Done

- [ ] AI genereert 3 Nederlandse varianten
- [ ] Mailing gaat uitsluitend naar profielen met `marketing_consent_at`
- [ ] Afmelden werkt

---

## Fase 8 — Optioneel/later ⬜

- [ ] Wekelijks lesrooster + lesabonnementen (Stripe subscriptions)
- [ ] Publieke API-keys met Bearer-auth
- [ ] Mux/Vimeo-integratie voor video

---

## Openstaande punten

### A. Accounts aanmaken — actie voor Pieter

Bewust uitgesteld. De code is volledig gebouwd en getest; deze punten zijn
controles en instellingen die een echt account vereisen. Zolang ze openstaan
werkt het platform lokaal, maar kan er niet betaald worden en gaat er geen
e-mail uit.

| #   | Account                                                         | Waarvoor                                                | Wat er daarna moet gebeuren                                                                                                                 | Handleiding             |
| --- | --------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| A1  | **Supabase** — regio **Frankfurt** ⚠️ achteraf niet te wijzigen | Database, inloggen, bestandsopslag                      | `pnpm db:migrate`, `supabase/seed.sql` inladen, `pnpm db:seed-admin`, en `SUPABASE_DB_URL=… pnpm test:rls` één keer tegen het echte project | `docs/beheer.md` §2, §3 |
| A2  | **Stripe** — testmodus, iDEAL aanzetten                         | Betalingen                                              | Webhook koppelen, één test-iDEAL-betaling doen en die terugbetalen                                                                          | `docs/beheer.md` §7     |
| A3  | **Resend** — domein `yogacompanie.nl`                           | E-mail                                                  | DNS-records zetten (SPF, DKIM, DMARC), en Supabase Auth via Resend laten versturen                                                          | `docs/beheer.md` §8     |
| A4  | **GitHub**                                                      | Versiebeheer en CI                                      | Repository aanmaken en pushen; `.github/workflows/ci.yml` draait dan vanzelf                                                                | —                       |
| A5  | **Vercel** — regio `fra1`                                       | Hosting                                                 | Koppelen aan de GitHub-repository en de environment variables zetten                                                                        | volgt                   |
| A6  | **Anthropic**                                                   | AI-socialmediatool (Fase 7)                             | API-sleutel in `ANTHROPIC_API_KEY`                                                                                                          | volgt                   |
| A7  | **Meta** — developer-app                                        | Publiceren op Facebook en Instagram (Fase 7, optioneel) | App-review op de publicatierechten; de tool werkt ook zonder                                                                                | volgt                   |

**Verwerkersovereenkomsten** (§17.8) tekent Pieter in de dashboards van
Supabase, Vercel, Stripe, Resend, Anthropic en Meta.

### B. Nog af te ronden werk

| Punt                          | Waarom                                                                                                 | Wat is er nodig                                                                                                   |
| ----------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Juridische teksten toetsen    | De privacyverklaring, algemene voorwaarden en cookiepagina zijn concept en tonen dat ook aan bezoekers | Laat een jurist ze nakijken, met name de annuleringstermijnen. Daarna de waarschuwing weghalen via de site-editor |
| Contactgegevens en KvK        | Adres, telefoonnummer en KvK-nummer staan als placeholder in het CMS                                   | Invullen via de site-editor zodra die er is (Fase 6), of laat het me nu aanpassen                                 |
| Docentenbio's en testimonials | Placeholders                                                                                           | Aanleveren; ik zet ze in de seed                                                                                  |

### C. Technische aandachtspunten

| Punt            | Waarom                                                                                              | Wat is er nodig                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Next.js-versie  | Het bouwdocument schrijft Next 15 voor; inmiddels is Next 16 uitgebracht                            | Bewuste keuze: we volgen de specificatie. Een upgrade naar 16 kan later in één stap          |
| React Email     | `@react-email/components` is door de makers verlaten; we gebruiken de renderer met eigen bouwstenen | Geen actie; wel goed om te weten bij het aanpassen van e-mails                               |
| Node.js-locatie | Node staat in `~/.local/node` (installatie zonder sudo), niet in een systeempad                     | Werkt via de `PATH`-regel in `~/.zshrc`. Open een nieuwe terminal voordat je `pnpm` gebruikt |
| `.next` gedeeld | `pnpm build` en `pnpm dev` delen die map                                                            | Draai `pnpm clean` als je van de een naar de ander schakelt                                  |
