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

## Fase 1 — Database & auth 🟡 code klaar, wacht op Supabase-project

Migrations (§6) + RLS + RLS-tests, Supabase-clients, registratie/login/reset,
TOTP-2FA, rollen, middleware, profieltrigger, seed-admin.

- [ ] **Supabase-project aangemaakt in regio Frankfurt (eu-central-1)** — actie voor Pieter
- [x] Migration met het volledige schema uit §6 (`20260811190000_schema.sql`)
- [x] `enable row level security` + policies op **elke** tabel (`…190100_rls.sql`)
- [x] Helperfuncties `is_admin()`, `has_course_access()`, `course_id_for_lesson()`
- [x] Storage buckets: `public-media`, `protected-content` (privé), `avatars` (privé)
- [x] RLS-testsuite in `supabase/tests/rls/` (5 testbestanden) + runner
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

- [ ] **RLS-tests groen** — vereist een database; draai `pnpm test:rls`
- [ ] **Admin komt niet in `/admin` zonder 2FA** — te controleren na `pnpm db:seed-admin`
- [ ] **Klantregistratie werkt end-to-end** — vereist een database
- [x] Afgeschermde routes sturen een bezoeker zonder sessie weg (Playwright, 22 tests groen)
- [x] `pnpm verify` en `pnpm build` slagen

> De code is compleet. De drie openstaande punten zijn geen ontbrekend werk maar
> controles die een echte database nodig hebben. Zodra het Supabase-project er
> is: `pnpm db:migrate`, `pnpm test:rls`, `pnpm db:seed-admin`.

---

## Fase 2 — Publieke site + CMS ⬜ nog niet gestart

- [ ] Alle publieke pagina's uit §8, opgebouwd uit `content_blocks`
- [ ] Seed-content uit §19 (opleidingen, modules, trainingen, CMS-blokken)
- [ ] Juridische conceptpagina's (privacy, AV, cookies)
- [ ] Contactformulier → `contact_messages` + notificatiemail
- [ ] SEO: metadata, sitemap.xml, robots.txt, OG-afbeelding, JSON-LD `Course`
- [ ] Content-Security-Policy toevoegen aan `next.config.ts`

### Definition of Done

- [ ] Lighthouse ≥ 90 op de publieke pagina's
- [ ] Alle teksten komen uit de database
- [ ] Contactformulier landt in de admin-notificatiemail

---

## Fase 3 — Betalingen & e-mail ⬜ nog niet gestart

- [ ] Stripe Checkout (iDEAL + kaart) met enrollments
- [ ] Webhook `/api/v1/webhooks/stripe` met signature-verificatie, idempotent
- [ ] Succes- en annuleringspagina's
- [ ] Resend + React Email-templates (§10, nrs. 1 t/m 6)
- [ ] Admin: betaallink maken / handmatig op betaald zetten (met audit-log)

### Definition of Done

- [ ] Test-iDEAL-betaling zet de enrollment op betaald en verstuurt de juiste mail
- [ ] Webhook is idempotent
- [ ] Negatieve tests groen

---

## Fase 4 — Klantportaal & LMS ⬜ nog niet gestart

- [ ] Dashboard, Mijn opleidingen, contentspeler, voortgang
- [ ] Aanvragen, berichten (beveiligde dialoog), profiel
- [ ] 2FA aan/uit, marketingtoestemming, AVG-zelfservice (export en verwijdering)
- [ ] Mobiele bottom-navigatie met 4 items en tap-targets ≥ 44px

### Definition of Done

- [ ] Klant ziet uitsluitend eigen data (Playwright-negatieftests)
- [ ] Video hervat op de laatst opgeslagen positie
- [ ] Berichten werken twee kanten op

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

| Punt                 | Waarom                                                                          | Wat is er nodig                                                                              |
| -------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| CI nog niet gedraaid | Er is nog geen GitHub-repository, dus de workflow heeft nog niet gedraaid       | Repository op GitHub aanmaken en pushen; `.github/workflows/ci.yml` staat klaar              |
| Next.js-versie       | Het bouwdocument schrijft Next 15 voor; inmiddels is Next 16 uitgebracht        | Bewuste keuze: we volgen de specificatie. Een upgrade naar 16 kan later in één stap          |
| Node.js-locatie      | Node staat in `~/.local/node` (installatie zonder sudo), niet in een systeempad | Werkt via de `PATH`-regel in `~/.zshrc`. Open een nieuwe terminal voordat je `pnpm` gebruikt |
