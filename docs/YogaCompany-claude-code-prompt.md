# YogaCompany — Bouwprompt voor Claude Code

> **Gebruik:** zet dit bestand in de repo als `docs/YogaCompany-claude-code-prompt.md`. Start Claude Code in de repo en geef als opdracht: *"Lees docs/YogaCompany-claude-code-prompt.md volledig en voer Fase 0 uit."* Werk daarna fase voor fase. Dit document is de enige bron van waarheid; wijkt iets af, dan wint dit document.

---

## 1. Context en doel

Je bouwt het platform van **YogaCompany**, een Nederlands opleidingsinstituut voor yoga. Kernactiviteit 1: **yoga-onderwijs** (opleidingen, met als vlaggenschip de 200-uurs Yin Yoga Specialist Opleiding in 4 modules). Kernactiviteit 2: **yogalessen en workshops**. Later komt ook het online programma **Eerst Jij** (8 weken, burn-outpreventie) op dit platform.

De code staat in de bestaande repo `yoga-company`: lokaal op de MacBook (`~/Documents/yoga-companie`), remote `github.com/zeeuwen1-afk/yoga-company`. Claude Code werkt in deze lokale map; alle wijzigingen gaan via commits en push naar GitHub. Het eindresultaat is een volwaardige webapplicatie, niet alleen een website.

Het platform bestaat uit drie werelden in één applicatie:

1. **Publieke website** — landingspagina, opleidingenoverzicht met prijzen, over ons, contact, Eerst Jij-pagina.
2. **Klantportaal** (login verplicht, 2FA mogelijk) — eigen omgeving per klant: gekochte opleidingen, betaalde digitale content met voortgang, lesboekingen, aanvragen, berichten met YogaCompany, FAQ.
3. **Admin** (alleen beheerder) — CRM/klantenbeheer, opleidingen- en productbeheer, contentbeheer via een intuïtieve inhouds-editor (geen code), boekingen, berichten, AI-assistent voor socialmediaposts, instellingen.

De opdrachtgever is ondernemer, geen programmeur. Alles wat hij dagelijks moet doen, gebeurt via de admin — nooit via code of database.

---

## 2. Merk en huisstijl

- **Naam:** YogaCompany (aaneen, hoofdletter Y en C). Subtitel: *Opleidingen · Trainingen · Lessen*.
- **Kleuren (CSS-variabelen, verplicht gebruiken):**
  - `--groen: #2F4239` (nachtgroen, primair; koppen, knoppen, footer)
  - `--salie: #A9BCA1` (secundair, accenten)
  - `--zand: #DCCBA8` en `--zand-licht: #E7DCC2` (warme accenten)
  - `--paper: #F9F7F1` (achtergrond), `--inkt: #2F4239` (tekst), `--grijs: #6E7A70` (subtekst)
- **Typografie:** koppen **Cormorant Garamond** (500–600), lopende tekst en UI **Jost** (300–400), labels in kleinkapitaal-stijl met ruime letterafstand. Via `@fontsource` of self-hosted — geen Google Fonts-CDN (AVG).
- **Logo:** bestanden staan in `public/brand/` (gestapeld, horizontaal, donker, icoon, favicons). Header: horizontaal logo; favicon-set gebruiken.
- **Stijl en toon:** rustig, zakelijk, intuïtief, persoonlijk, uitnodigend zonder dwingend. Geen lappen tekst: korte, heldere teksten, veel witruimte, duidelijke propositie. Zachte contrasten met goed leesbare tekst (WCAG AA minimaal). Geen agressieve marketing-patronen (geen countdown-timers, geen pop-ups).
- **Taal:** volledig Nederlands, ook foutmeldingen en e-mails.

---

## 3. Stack en uitgangspunten

- **Frontend:** bestaande repo — Vite + React 18 + TypeScript + Tailwind. React Router voor routing, TanStack Query voor datafetching, react-hook-form + zod voor formulieren en validatie.
- **Backend:** **Supabase** (EU-regio): Postgres, Auth (e-mail/wachtwoord + TOTP-2FA), Row Level Security, Storage, Edge Functions (Deno) voor alles wat server-side moet (betalingen, e-mail, AI, webhooks).
- **Betalingen:** **Mollie** (iDEAL, creditcard) via Edge Functions + webhooks. Volledig bouwen maar achter feature-flag `PAYMENTS_ENABLED` — pas aan als het Mollie-account live is.
- **E-mail:** **Resend** (of SMTP-fallback) via Edge Function `send-email` met Nederlandse templates.
- **Video:** Vimeo (privé, domein-restricted embeds) voor betaalde content. Geen YouTube.
- **Hosting:** Vercel (frontend) + Supabase (backend). CI blijft GitHub Actions (lint, typecheck, build, tests).
- **Verboden:** geen extra frameworks naast bovenstaande, geen CSS-libraries naast Tailwind, geen betaalde diensten toevoegen zonder overleg, geen Amerikaanse analytics (alleen cookieloos, bv. Plausible EU, optioneel).

---

## 4. Architectuurprincipes (toekomstvast)

1. **Feature-mappenstructuur:** `src/features/<domein>/` (bv. `auth`, `courses`, `portal`, `admin`, `payments`, `messages`, `bookings`, `cms`). Gedeelde UI in `src/components/ui`, gedeelde logica in `src/lib`. Een wijziging in de ene feature raakt de andere niet.
2. **Content uit de database, niet uit de code.** Alle teksten, foto's en video's op publieke pagina's komen uit `content_blocks` en zijn via de admin te bewerken. Componenten renderen blokken; nieuwe pagina's zijn data, geen code.
3. **API-first:** alle mutaties via duidelijke, herbruikbare functies (RPC of Edge Functions) zodat latere API-koppelingen (boekhouding, Meta, agenda) aanhaken zonder verbouwing. Interne API-laag documenteren in `docs/api.md`.
4. **Database zo klein mogelijk:** alleen gegevens opslaan die een functie hebben (dataminimalisatie, zie §8). Geen "handig voor later"-velden.
5. **Migrations als enige waarheid:** alle schemawijzigingen in `supabase/migrations/`, nooit handmatig in de console. Seed-script voor lokale ontwikkeling.
6. **Feature-flags** in een `settings`-tabel (o.a. `PAYMENTS_ENABLED`, `EERSTJIJ_ENABLED`, `SOCIAL_PUBLISH_ENABLED`).
7. **Toegankelijk en snel:** Lighthouse ≥ 90 op performance en accessibility voor de publieke site; afbeeldingen geoptimaliseerd (webp, lazy).

---

## 5. Rollen en rechten

| Rol | Omschrijving |
|---|---|
| `admin` | De opdrachtgever (en later medewerkers). Volledige toegang tot de admin. |
| `klant` | Iedereen met een account. Ziet uitsluitend eigen gegevens, eigen aankopen, eigen content, eigen berichten. |
| anoniem | Publieke site, aanmeld- en contactformulieren. |

- Rol staat in `profiles.role`; standaard `klant`. Admin-rol alleen via migration/seed toe te kennen, nooit via de UI.
- **Strikte klantscheiding is de hoogste eis.** Elke tabel met klantdata heeft RLS-policies: klant leest/schrijft alleen rijen met eigen `user_id`; admin alles. Geen enkele query in de frontend omzeilt RLS (geen service-role key in de client, nooit).

---

## 6. Datamodel (kern)

Alle tabellen met `created_at`/`updated_at`. Namen in het Engels, UI in het Nederlands.

- `profiles` — 1-op-1 met `auth.users`: naam, telefoon (optioneel), rol, marketing-opt-in, notitieveld (alleen admin zichtbaar).
- `products` — verkoopbare items: type (`module`, `bundle`, `program`, `lesson_card`, `subscription`), titel, slug, korte en lange omschrijving, prijs, btw-tarief, actief, volgorde. Seed: module 1 t/m 4 (€ 795) + volledige opleiding (€ 2.795, gekoppeld aan de 4 modules). Later: lesabonnement (maandelijks, wekelijkse lessen) en de Eerst Jij-varianten.
- `orders` + `order_items` — status (`concept`, `open`, `paid`, `canceled`, `refunded`), Mollie-payment-id, bedrag, klantkoppeling.
- `enrollments` — koppeling klant ↔ product/opleiding, status (`actief`, `afgerond`), bron (online betaald of door admin handmatig toegekend — voor fysieke inschrijvingen). Certificaatvelden: behaald niveau (certificaat Yin Yoga niveau 1–4 of diploma Yin Yoga Specialist) en uitgiftedatum — zichtbaar in het portaal en op de klantenkaart.
- `content_items` — betaalde digitale content: titel, type (video/audio/tekst/pdf), Vimeo-id of storage-pad, hoort bij product, volgorde, gepubliceerd.
- `progress` — klant ↔ content_item: gezien/afgerond + tijdstip. Voedt de voortgang in portaal en admin.
- `lessons` + `bookings` — lesrooster (titel, datum/tijd, locatie, capaciteit) en boekingen per klant (status, wachtlijst).
- `message_threads` + `messages` — één thread per klant met YogaCompany; berichten met afzender, gelezen-status. Strikt gescheiden via RLS.
- `requests` — aanvragen vanuit het portaal (type, omschrijving, status) — bv. "inschrijven module 3", "vraag over factuur".
- `faq_items` — vraag/antwoord, categorie, gepubliceerd; beheerd in de admin, getoond in portaal.
- `content_blocks` — CMS: pagina-slug, bloktype (`hero`, `tekst`, `tekst_met_beeld`, `prijzen`, `cta`, `faq`, `foto`, `video`), inhoud (jsonb), volgorde, gepubliceerd.
- `media` — geüploade beelden (Storage-pad, alt-tekst).
- `settings` — sleutel/waarde (feature-flags, contactgegevens, socials).
- `audit_log` — wie deed wat wanneer in de admin (klant gewijzigd, order aangepast, content gepubliceerd). Alleen admin-leesbaar.
- Eerst Jij (fase 7): `intake_submissions` én `measurements` (wekelijkse energiemeting: energie, slaap, stemming, grenzen op 1–10; BAT-scores week 0 en 8) in **apart schema `sensitive`** met eigen, strengere policies (zie §8).

Lever bij Fase 1 een ERD op in `docs/datamodel.md` (mermaid).

---

## 7. Functionele specificatie

### 7.1 Publieke website
- **Landingspagina:** hero met propositie (zakelijk én persoonlijk), de drie pijlers (Opleidingen · Trainingen · Lessen), uitgelichte opleiding, rustige CTA's ("Bekijk de opleiding", "Maak een account").
- **Opleidingen:** overzichtspagina met de 4 modules + de volledige opleiding, duidelijk en intuïtief: per module hoofdthema, 50 uur, prijs; bundel prominent met korting (€ 2.795, *bespaar € 385*). Detailpagina per module (inhoud uit `content_blocks`, gevoed door de opleidingsgids). Downloadknop voor de PDF-opleidingsgids. Geen plaatsnaam of exacte locatie in de publieke opleidingsmaterialen — praktische informatie en de locatie volgen in de bevestigingsmail. Koop-/inschrijfknop → account + (t.z.t.) betaling; zolang `PAYMENTS_ENABLED=false`: aanvraagformulier dat een `request` + e-mail aanmaakt.
- **Lessen:** publiek zichtbaar weekrooster van de wekelijkse yogalessen (door de eigenaar zelf gegeven), met "Boek een les" (account vereist) en het lesabonnement als product.
- **Over ons:** persoonlijke pagina (tekst/foto via CMS).
- **Eerst Jij:** één pagina met korte omschrijving + wachtlijstformulier (naam + e-mail, dubbele opt-in).
- **Contact**, **AV**, **Privacyverklaring**, cookiemelding alleen indien nodig (streef naar cookieloos).

### 7.2 Accounts en 2FA
- Registreren met e-mail + wachtwoord, e-mailverificatie verplicht. Wachtwoord-reset. TOTP-2FA instelbaar in het portaal ("Beveiliging"), verplicht voor admin-accounts. Sessiebeheer via Supabase. Nette Nederlandse schermen voor alle flows.

### 7.3 Klantportaal (eigen omgeving, beperkte rechten)
- **Dashboard:** welkom, mijn opleidingen met voortgang, eerstvolgende les/boeking, laatste bericht.
- **Mijn opleidingen:** gekochte producten; per opleiding de contentlijst met "verder waar je gebleven was".
- **Contentspeler:** video (Vimeo privé-embed), audio, tekst, downloads; markeert voortgang in `progress`. Alleen toegankelijk met geldige `enrollment` (RLS + signed URLs voor bestanden).
- **Lessen:** rooster bekijken, boeken en annuleren binnen de regels; eigen boekingen en abonnementstatus zichtbaar (actief/verloopt); boeken op abonnement of losse betaling (t.z.t.).
- **Aanvragen:** formulier + statusoverzicht van eigen aanvragen.
- **Berichten:** beveiligde dialoog met YogaCompany (geen groepschat, strikt eigen thread).
- **FAQ:** relevante vragen, gevuld vanuit de admin; met "staat je vraag er niet bij? Stuur een bericht".
- **Mijn gegevens:** naam, e-mail, wachtwoord, 2FA, opt-ins; knop "verwijder mijn account" (zie §8).

### 7.4 Admin
- **CRM/klanten:** lijst met zoeken/filteren; **klantenkaart** met alles van deze klant in één relevant overzicht: gegevens, aankopen en orders, inschrijvingen en voortgang, boekingen, aanvragen, berichten, notities, audit-regels. Klant **bewerken**, handmatig inschrijven (fysieke opleidingen!), deactiveren en **verwijderen/anonimiseren**.
- **Opleidingen & producten:** producten en prijzen beheren, content_items per product ordenen, PDF-gids koppelen.
- **Inhouds-editor (CMS):** per pagina de blokken zien, bewerken (tekst, foto, video), toevoegen, verslepen en publiceren — met live voorbeeld. Intuïtief, zonder code: dit is de "grafische editor". Foto-upload met automatische verkleining en alt-tekst.
- **Lessen & boekingen:** rooster beheren, deelnemerslijsten, no-show markeren.
- **Berichten:** inbox over alle klanten, beantwoorden vanuit de klantenkaart of de inbox.
- **AI-social-assistent:** invoer (onderwerp, doel, ton), knop "Genereer concepten" → Edge Function roept de Claude-API aan (`claude-sonnet-4-6`, API-key als secret) en levert 3 conceptposts voor Instagram/Facebook in de merkstijl; bewerken en opslaan als `social_drafts`. **Publiceren naar Meta pas in fase 6** achter `SOCIAL_PUBLISH_ENABLED` (Meta-app + review vereist); tot die tijd: kopieerknop.
- **Instellingen:** contactgegevens, feature-flags, e-mailafzender, socials.

### 7.5 E-mailflows (allemaal Nederlands, huisstijl-template)
1. Account bevestigen · 2. Wachtwoord-reset · 3. Welkom na registratie · 4. Orderbevestiging/betaalbevestiging · 5. Inschrijfbevestiging opleiding (met praktische info) · 6. Boekingsbevestiging en -herinnering les · 7. Nieuw bericht in je portaal · 8. Aanvraag ontvangen/afgehandeld · 9. Eerst Jij-wachtlijstbevestiging (dubbele opt-in). Mailings/nieuwsbrief: alleen aan opt-ins; afmeldlink verplicht.

### 7.6 Betalingen (fase 5, achter feature-flag)
- Mollie Orders/Payments via Edge Function `create-payment` + webhook `mollie-webhook` (idempotent, status-machine op `orders`).
- Bundelkorting op productniveau (vaste bundelprijs), geen kortingscodes in v1.
- Bij `paid`: automatisch `enrollments` aanmaken + bevestigingsmail. Terugbetalingen alleen via admin-actie met audit-regel.
- Abonnementen: Mollie Recurring (eerste betaling + mandaat, daarna maandelijkse incasso); opzeggen kan de klant zelf in het portaal.
- Termijnbetaling (Eerst Jij Begeleid): 3 termijnen van € 279 via Mollie.
- Consumentenrecht: 14 dagen bedenktijd; bij directe toegang tot digitale content de afstandsverklaring van het herroepingsrecht correct in het bestelproces opnemen.
- Testmodus-scenario's documenteren in `docs/payments.md`.

### 7.7 Eerst Jij op het platform (fase 7, achter `EERSTJIJ_ENABLED`)
- Intakeformulier volgens het aangeleverde screeningsdocument (35 vragen, groen/oranje/rood-logica, crisisteksten letterlijk overnemen, formulier stopt bij rood op de veiligheidsvraag). Antwoorden in schema `sensitive`; alleen de uitkomst + datum op de klantenkaart.
- Programmalevering via de bestaande content- en voortgangsmodule: week 0 t/m 8, dagopdracht in het portaal én per e-mail (dagmailserie via de e-mailmodule).
- Wekelijkse energiemeting (energie, slaap, stemming, grenzen op 1–10) met eigen grafiek in het portaal; automatische signalering naar de admin bij een stemmingsscore onder 4 of een dalende trend → taak "persoonlijk contact binnen 24 uur".
- BAT-voor- en nameting in week 0 en week 8; geanonimiseerde groepsrapportage voor B2B (nooit herleidbaar tot personen).
- Borgen: maandelijkse borgingsmails gedurende 6 maanden, uitnodiging voor de terugkomcall op dag 90, en de brief-aan-jezelf automatisch verstuurd op dag 180.
- Prijsvarianten als products: Zelfstandig € 297 · Begeleid € 797 (of 3× € 279) · Persoonlijk € 1.795 · Werkgever € 2.850 excl. btw · pilot € 197.

---

## 8. AVG en beveiliging (harde eisen)

1. **Dataminimalisatie:** alleen velden uit §6. Geen geboortedata, geen adressen (tenzij later nodig voor facturatie — dan alleen bij orders), geen tracking-profielen.
2. **RLS overal aan**, ook op storage-buckets. Automatische tests die per tabel bewijzen dat klant A niets van klant B kan lezen of schrijven (fase 1-acceptatie).
3. **Bijzondere persoonsgegevens** (Eerst Jij-intake): apart schema, aparte policies (alleen admin, alleen via audit-gelogde views), versleuteling at rest via Supabase, bewaartermijn 2 jaar met geautomatiseerde opschoning, uitdrukkelijke-toestemmingsvinkjes conform het intakedocument.
4. **Rechten van betrokkenen:** in het portaal een export van eigen gegevens (JSON) en een verwijderknop → anonimiseert profiel en berichten, verwijdert intake, bewaart alleen wat fiscaal moet (orders) losgekoppeld van persoon.
5. **Beveiliging:** overal https, security-headers, rate-limiting op auth- en formulier-endpoints, geen secrets in de repo (`.env.example` wel), wachtwoordbeleid, 2FA verplicht voor admin, sessieverloop, audit_log op alle admin-mutaties.
6. **Verwerkers documenteren** in `docs/avg.md`: Supabase, Vercel, Mollie, Resend, Vimeo, Anthropic (AI-assistent) — met vestiging/regio, zodat de privacyverklaring en verwerkersovereenkomsten kloppen.
7. **E-mail:** SPF/DKIM/DMARC-instructies opleveren bij fase 2.

---

## 9. Mobiel

- Publieke site volledig responsive.
- **Klantportaal mobile-first:** op telefoon een eigen, zeer eenvoudige navigatie (onderbalk met maximaal 5 items: Home, Opleidingen, Lessen, Berichten, Profiel), grote tikdoelen, geen tabellen maar kaarten. **Tablet gebruikt de desktop-lay-out.**
- Contentspeler moet prettig werken op een telefoon (video fullscreen, voortgang synchroon).

---

## 10. Fasering en acceptatiecriteria

Werk strikt in deze volgorde. Rond een fase af met een werkende demo, groene CI en de checklist hieronder; wacht op akkoord voor de volgende fase.

**Fase 0 — Fundament.** Feature-mappenstructuur, Tailwind-thema met huisstijl-tokens, fonts self-hosted, basislay-outs (publiek/portaal/admin), router, `.env.example`, CI uitgebreid met typecheck en tests, `docs/`-map aangemaakt. ✔ App draait lokaal met huisstijl-styleguidepagina.

**Fase 1 — Data en auth.** Alle migrations + seed, RLS-policies, RLS-testsuite, registratie/login/reset/2FA-flows, rollen. ✔ Twee testklanten kunnen elkaars data aantoonbaar niet zien; admin wel; ERD in docs.

**Fase 2 — Publieke site + CMS.** `content_blocks`-rendering, alle publieke pagina's gevuld (opleidingsteksten uit de gids), opleidingenoverzicht met 4 modules + bundel en aanvraagflow, Eerst Jij-wachtlijst, e-mailmodule met flows 1–3 en 9. ✔ Site is publiceerbaar en volledig via de admin-editor aan te passen (editor mag in deze fase nog een eenvoudige versie zijn, afgemaakt in fase 4).

**Fase 3 — Klantportaal.** Dashboard, mijn opleidingen, contentspeler + voortgang, lessen en boekingen, aanvragen, berichten, FAQ, mijn gegevens, mobiele onderbalk. ✔ Klantreis van registratie tot content volgen werkt end-to-end (enrollment handmatig toegekend).

**Fase 4 — Admin.** CRM + klantenkaart, opleidingen-/productbeheer, volwaardige inhouds-editor met live voorbeeld, lessenbeheer, berichteninbox, instellingen, audit_log, AI-social-concepten. ✔ Opdrachtgever kan zonder code klanten beheren, content wijzigen en een socialpost-concept maken.

**Fase 5 — Betalingen.** Mollie-integratie achter flag, orderflow, webhooks, automatische enrollment, mails 4–5, docs/payments.md. ✔ Volledige testmodus-aankoop van module én bundel slaagt, inclusief mislukte-betaling-pad, plus een abonnement met mandaat en een termijnbetaling in testmodus.

**Fase 6 — Koppelingen.** Meta-publicatie (na app-review), export/boekhoudkoppeling voorbereid, API-documentatie bijgewerkt. ✔ Flags aantoonbaar veilig uit te zetten.

**Fase 7 — Eerst Jij.** Intake met beslislogica en apart schema, programmalevering, dagmails. ✔ Testintake doorloopt groen/oranje/rood correct, met juiste teksten en opslag.

---

## 11. Werkwijze voor Claude Code

1. Lees vóór elke fase dit document en de relevante docs opnieuw; stel maximaal 5 gerichte vragen als iets echt ontbreekt, ga anders bouwen met de best passende aanname en noteer die in `docs/aannames.md`.
2. Kleine, logische commits met Nederlandse commit-berichten; nooit direct naar `main` force-pushen.
3. Elke fase: migrations + code + tests + korte demo-instructie in `docs/fase-N.md`.
4. Geen nieuwe dependencies zonder motivering in de PR-beschrijving.
5. Secrets alleen via omgevingsvariabelen; controleer bij elke fase dat er niets is gelekt.
6. Bij twijfel tussen "mooi" en "eenvoudig te beheren": kies eenvoudig te beheren.

## 12. Definition of done (per onderdeel)

Werkt op telefoon én desktop · voldoet aan de huisstijl · alle teksten Nederlands · RLS-getest · foutpaden afgehandeld met nette meldingen · toegankelijk (toetsenbord, labels, contrast) · gedocumenteerd in `docs/` · demo-stappen beschreven.
