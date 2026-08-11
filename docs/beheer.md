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

3. Pas het schema toe en controleer de beveiliging:

   ```bash
   pnpm db:migrate     # voert supabase/migrations uit
   pnpm test:rls       # controleert de klantscheiding
   ```

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
pnpm test:rls
```

Draait de suite uit `supabase/tests/rls/` en controleert onder meer dat:

- klant A geen profiel, inschrijving, voortgang, bericht of aanvraag van
  klant B kan lezen of wijzigen;
- een klant zichzelf geen beheerdersrol kan geven;
- betaalde content pas zichtbaar is na een betaalde inschrijving;
- een anonieme bezoeker alleen proeflessen en actief aanbod ziet;
- concepten uit de site-editor niet uitlekken naar het publiek;
- het audit log niet kan worden aangepast of gewist.

Alles draait in één transactie die daarna wordt teruggedraaid: er blijft nooit
testdata achter. **Draai deze suite na elke wijziging aan het datamodel.**

---

## 6. Alle commando's

| Commando                    | Wat het doet                         |
| --------------------------- | ------------------------------------ |
| `pnpm dev`                  | Ontwikkelserver                      |
| `pnpm build` / `pnpm start` | Productiebuild en -server            |
| `pnpm clean`                | Verwijdert `.next`                   |
| `pnpm verify`               | Typecheck, lint, opmaak en unittests |
| `pnpm test`                 | Unittests (Vitest)                   |
| `pnpm test:e2e`             | End-to-end-tests (Playwright)        |
| `pnpm test:rls`             | Beveiligingstests tegen de database  |
| `pnpm db:migrate`           | Migrations toepassen                 |
| `pnpm db:seed-admin`        | Eerste beheerder uitnodigen          |

Voor de e2e-tests eenmalig: `pnpm exec playwright install chromium webkit`.

---

## 7. Nog te documenteren

Wordt aangevuld zodra de betreffende fase is opgeleverd:

- Deploy naar Vercel (regio `fra1`) en de benodigde environment variables
- Stripe live zetten en de webhook koppelen
- Resend instellen als SMTP van Supabase Auth
- Back-ups en de herstelprocedure
- Bewaartermijnen en de opschoontaken (BOUWPROMPT §17.6)
