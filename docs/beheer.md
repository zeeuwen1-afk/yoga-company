# Beheerhandleiding — Yoga Companie

Praktisch naslagwerk voor het opzetten, draaien en onderhouden van het
platform. Aangevuld per fase.

---

## 1. Ontwikkelomgeving

Vereist: Node.js 20.9 of hoger en pnpm.

Op deze Mac staat Node in `~/.local/node` (installatie zonder beheerrechten).
De regel die dat in je pad zet, staat in `~/.zshrc`. Open na een verse
installatie een nieuwe terminal.

```bash
pnpm install
cp .env.example .env.local     # vul de waarden in
pnpm dev                       # http://localhost:3000
```

> **Let op:** `pnpm build` en `pnpm dev` delen de map `.next`. Draai je eerst
> een productiebuild en daarna de ontwikkelserver, dan kunnen er restanten
> blijven staan waardoor `/dev/styleguide` een 404 geeft. Oplossing:
> `pnpm clean`.

---

## 2. Supabase-project opzetten

1. Maak op [supabase.com](https://supabase.com) een project aan.
   - **Region: Central EU (Frankfurt)** — dit is een AVG-eis (BOUWPROMPT §2.2)
     en kan achteraf niet worden gewijzigd.
   - Bewaar het databasewachtwoord in een wachtwoordmanager.
2. Neem in `.env.local` over uit **Project Settings**:

   | Variabele                       | Waar te vinden                     |
   | ------------------------------- | ---------------------------------- |
   | `NEXT_PUBLIC_SUPABASE_URL`      | API → Project URL                  |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | API → `anon` `public`              |
   | `SUPABASE_SERVICE_ROLE_KEY`     | API → `service_role` (geheim)      |
   | `SUPABASE_DB_URL`               | Database → Connection string (URI) |

3. Pas het schema toe, laad de startinhoud en controleer de beveiliging:

   ```bash
   pnpm db:migrate     # voert supabase/migrations uit
   pnpm test:rls       # controleert de klantscheiding
   ```

   Laad daarna `supabase/seed.sql` in via de SQL-editor van Supabase, of met
   `psql "$SUPABASE_DB_URL" -f supabase/seed.sql`. Dat zet het aanbod en alle
   teksten van de site klaar. De seed is herhaalbaar, maar overschrijft
   wijzigingen die je later via de beheeromgeving maakt — draai hem dus alleen
   bij het opzetten.

De `service_role`-sleutel omzeilt alle beveiliging. Zet hem nooit in code, in
een `NEXT_PUBLIC_`-variabele of in een client component.

---

## 3. Eerste beheerder aanmaken

```bash
# zet SEED_ADMIN_EMAIL in .env.local
pnpm db:seed-admin
```

Het script stuurt een uitnodiging; er wordt nooit een wachtwoord ingesteld. De
ontvanger kiest er zelf een via de link in de mail. Bij de eerste keer inloggen
op `/admin` is tweestapsverificatie verplicht: het platform leidt automatisch
naar de instelpagina en laat niemand zonder door.

Het script is herhaalbaar. Bestaat het account al, dan krijgt het alleen de
beheerdersrol.

---

## 4. Migrations

Databasewijzigingen gaan uitsluitend via SQL-bestanden in
`supabase/migrations/`, met een oplopende tijdstempel in de naam. Nooit
handmatig klikken in het Supabase-dashboard: dan loopt de database uit de pas
met wat er in git staat.

```bash
pnpm db:migrate
```

Elke migration draait in een eigen transactie en wordt bijgehouden in de tabel
`schema_migrations`, dus tweemaal draaien kan geen kwaad. Mislukt een
migration, dan draait die ene terug en blijft de database in de vorige
toestand.

---

## 5. Beveiliging controleren

```bash
pnpm test:rls                       # lokale wegwerpdatabase, geen configuratie
SUPABASE_DB_URL=… pnpm test:rls     # tegen het echte Supabase-project
```

Zonder `SUPABASE_DB_URL` draait de suite tegen een Postgres die in het project
zelf opstart (PGlite, WebAssembly — geen Docker, geen installatie). Het bestand
`supabase/tests/bootstrap.sql` bootst daarbij na wat Supabase zelf meelevert:
de rollen `anon`, `authenticated` en `service_role`, het auth-schema met
`auth.uid()`, en het storage-schema. Daarna draaien de échte migrations
eroverheen. Zo draait deze suite ook in CI, bij elke wijziging.

> Dit bootst Supabase na, het **ís** Supabase niet. De tests bewijzen dat de
> policies doen wat ze horen te doen. Draai de suite daarnaast minstens één
> keer tegen het echte project voordat je live gaat.

De suite controleert onder meer dat:

- klant A geen profiel, inschrijving, voortgang, bericht of aanvraag van
  klant B kan lezen of wijzigen;
- een klant zichzelf geen beheerdersrol kan geven;
- betaalde content pas zichtbaar is na een betaalde inschrijving;
- een anonieme bezoeker alleen proeflessen en actief aanbod ziet;
- concepten uit de site-editor niet uitlekken naar het publiek;
- het audit log niet kan worden aangepast of gewist;
- registratie automatisch een profiel met de rol `klant` en één conversatie
  aanmaakt.

Alles draait in één transactie die daarna wordt teruggedraaid: er blijft nooit
testdata achter. **Draai deze suite na elke wijziging aan het datamodel.**

---

## 6. Alle commando's

| Commando                    | Wat het doet                                    |
| --------------------------- | ----------------------------------------------- |
| `pnpm dev`                  | Ontwikkelserver                                 |
| `pnpm build` / `pnpm start` | Productiebuild en -server                       |
| `pnpm clean`                | Verwijdert `.next`                              |
| `pnpm verify`               | Typecheck, lint, opmaak en unittests            |
| `pnpm test`                 | Unittests (Vitest)                              |
| `pnpm test:e2e`             | End-to-end-tests (Playwright)                   |
| `pnpm test:rls`             | Beveiligingstests tegen de database             |
| `pnpm db:migrate`           | Migrations toepassen                            |
| `pnpm db:generate-seed`     | Schrijft `supabase/seed.sql` uit `src/content/` |
| `pnpm db:check-seed`        | Controleert dat de seed draait en klopt         |
| `pnpm db:seed-admin`        | Eerste beheerder uitnodigen                     |

Voor de e2e-tests eenmalig: `pnpm exec playwright install chromium webkit`.

---

## 7. Betalingen (Stripe)

### Testmodus inrichten

1. Maak een account op [stripe.com](https://stripe.com) en blijf in
   **testmodus** (schakelaar rechtsboven).
2. Zet in `.env.local` uit **Developers → API keys**:
   - `STRIPE_SECRET_KEY` — de secret key, begint met `sk_test_`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — de publishable key
3. Zet **iDEAL** aan onder Settings → Payment methods.

### De webhook koppelen

De webhook is de enige manier waarop een inschrijving op betaald komt. Zonder
werkende webhook blijft elke betaling in afwachting staan.

Lokaal, met de Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/v1/webhooks/stripe
```

De CLI toont een `whsec_…`; zet die in `.env.local` als
`STRIPE_WEBHOOK_SECRET`. Een betaling naspelen kan met:

```bash
stripe trigger checkout.session.completed
```

In productie: **Developers → Webhooks → Add endpoint**, adres
`https://<jouw-domein>/api/v1/webhooks/stripe`, met deze gebeurtenissen:

| Gebeurtenis                                | Wat er gebeurt                                        |
| ------------------------------------------ | ----------------------------------------------------- |
| `checkout.session.completed`               | Inschrijving op betaald, bevestigingsmail             |
| `checkout.session.async_payment_succeeded` | iDEAL-betaling die later slaagt                       |
| `checkout.session.async_payment_failed`    | iDEAL-betaling die alsnog mislukt                     |
| `charge.refunded`                          | Inschrijving geannuleerd, vastgelegd in het audit log |

De verwerking is idempotent: dezelfde gebeurtenis tweemaal afleveren verandert
niets extra's. Faalt de verwerking, dan geeft de webhook een 500 zodat Stripe
het opnieuw probeert.

### Terugbetalen en termijnen

Terugbetalen doe je in het Stripe-dashboard; de webhook zet de inschrijving
daarna automatisch op geannuleerd en de toegang tot digitale content vervalt.

Voor betalen in termijnen zijn er twee mogelijkheden in de beheeromgeving: een
losse **betaallink** maken, of een inschrijving **handmatig op betaald** zetten.
Beide worden vastgelegd in het audit log, met de reden erbij.

### Live gaan

Zet de schakelaar in Stripe op live, vervang de sleutels door de `sk_live_`- en
`pk_live_`-varianten, en maak een nieuwe webhook aan voor het productieadres —
die heeft een eigen `whsec_`. Doe eerst één echte betaling van een klein bedrag
en betaal die daarna terug, om te zien dat beide kanten werken.

---

## 8. E-mail (Resend)

1. Maak een account op [resend.com](https://resend.com) en voeg het domein
   `yogacompanie.nl` toe.
2. Zet de DNS-records die Resend toont (SPF, DKIM en DMARC). Zonder die records
   komen mails in de spammap terecht.
3. Zet in `.env.local`:
   - `RESEND_API_KEY`
   - `EMAIL_FROM="Yoga Companie <info@yogacompanie.nl>"`

Ontbreekt de sleutel, dan wordt er niets verstuurd en gaat de rest gewoon door:
een mail die niet weggaat mag nooit een betaling of inschrijving laten
mislukken. In het logboek staat dan wat er niet verstuurd is.

### Welke mails het platform verstuurt

| Mail                 | Wanneer                                                    |
| -------------------- | ---------------------------------------------------------- |
| Accountverificatie   | Bij registratie — verstuurd door Supabase Auth             |
| Wachtwoordherstel    | Bij een herstelverzoek — verstuurd door Supabase Auth      |
| Inschrijfbevestiging | Na een geslaagde betaling                                  |
| Contactbevestiging   | Naar de afzender van het contactformulier                  |
| Contactnotificatie   | Naar jou, zonder de inhoud van het bericht                 |
| Nieuw bericht        | Bij een bericht in de beveiligde dialoog, zonder de inhoud |

De twee mails van Supabase Auth stel je in onder **Authentication → Emails** in
het Supabase-dashboard. Laat Supabase via Resend versturen door onder
**Project Settings → Authentication → SMTP Settings** de SMTP-gegevens van
Resend in te vullen; anders komen die mails van Supabase zelf en ogen ze
anders dan de rest.

Berichten met persoonsgegevens gaan nooit per mail mee: de notificatie meldt
alleen dát er iets klaarstaat, de inhoud staat achter de inlog (§17.11).

---

## 9. Teksten en beelden aanpassen (site-editor)

Ga naar **Beheer → Site-editor**. Je kiest een pagina en past de onderdelen aan
die daarop staan. De indeling van een pagina ligt vast; je wijzigt de inhoud,
niet de structuur. Dat houdt de site consistent.

**De werkwijze is altijd dezelfde:**

1. **Bewerken.** Je wijziging wordt bewaard als _concept_. De website
   verandert nog niet — bezoekers zien gewoon wat er stond.
2. **Bekijken.** Rechts staat een voorvertoning van de pagina zoals hij wordt.
   Sla een wijziging op om die te verversen.
3. **Publiceren.** Eén klik op **Publiceren** zet alle concepten van die pagina
   online. Binnen enkele seconden is het zichtbaar. Er hoeft niets uitgerold te
   worden.

Bevalt een concept toch niet, dan gooit **Concepten weggooien** ze weg. De
website is dan onveranderd gebleven.

### Wat je per onderdeel kunt aanpassen

| Soort      | Wat je krijgt                                                    |
| ---------- | ---------------------------------------------------------------- |
| Tekst      | Een invoerveld voor één regel of een kort stuk tekst             |
| Richtext   | Een editor met vet, cursief, een kop, een lijst en links         |
| Afbeelding | Uploaden, met een verplichte beschrijving                        |
| Lijst      | Vaste velden per item, bijvoorbeeld bij testimonials en docenten |

De opmaakknoppen zijn bewust beperkt. Wie lettertypes en kleuren kan kiezen,
maakt vroeg of laat een pagina die niet meer op de rest van de site lijkt; de
huisstijl hoort in de code te zitten.

### De beschrijving bij een afbeelding

Die is verplicht en dat is geen pesterij: mensen die slecht zien krijgen de
afbeelding voorgelezen, en zoekmachines gebruiken hem. Schrijf wat er te zien
is — "docente begeleidt een deelnemer in een yin-houding", niet "foto1".

### Elke publicatie staat in het logboek

Onder **Beheer → Logboek** zie je wie wat wanneer heeft gepubliceerd.

---

## 10. Nog te documenteren

Wordt aangevuld zodra de betreffende fase is opgeleverd:

- Deploy naar Vercel (regio `fra1`) en de benodigde environment variables
- Stripe live zetten en de webhook koppelen
- Resend instellen als SMTP van Supabase Auth
- Back-ups en de herstelprocedure
- Bewaartermijnen en de opschoontaken (BOUWPROMPT §17.6)
