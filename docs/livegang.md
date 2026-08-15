# Livegang — het stappenplan

Van "draait op de ontwikkelmachine" naar "staat online en is getest".
Opgesteld op 15 augustus 2026.

De volgorde is niet vrijblijvend: elke stap maakt de volgende mogelijk. Achter
elke stap staat **hoe we controleren dat het werkt**. Een stap is pas klaar als
die controle groen is — niet als de wijziging is doorgevoerd.

Wie wat doet staat erbij: **[jij]** is iets in een dashboard van een externe
partij, **[ik]** is code en controles.

---

## Waar we nu staan

|                            |                                                                        |
| -------------------------- | ---------------------------------------------------------------------- |
| Alle 10 migrations         | staan op het echte Supabase-project                                    |
| `pnpm verify`              | groen (typecheck, lint, opmaak, 63 unittests, 206 RLS-controles, seed) |
| Inhoud in de live database | **leeg** — 0 opleidingen, 0 tekstblokken                               |
| Testpijplijn (CI)          | heeft nog nooit gedraaid                                               |
| Online                     | nergens                                                                |

Twee sleutels ontbreken, en die blokkeren bijna alles: zonder de service-role
sleutel kan er niets in de database worden gezet en werkt het beheer niet.

---

## Fase A — De basis op orde (lokaal)

### A1 · De twee ontbrekende sleutels **[jij, ± 5 minuten]**

In het Supabase-dashboard van project `hfsxncotxlenxrkycxsv`:

1. **Project Settings → API keys → `service_role`** — klik "Reveal", kopieer.
2. **Project Settings → Database → Connection string → URI** — kopieer, en
   vervang `[YOUR-PASSWORD]` door het databasewachtwoord.

Beide in `.env.local` achter `SUPABASE_SERVICE_ROLE_KEY=` en `SUPABASE_DB_URL=`.
Dat bestand staat in `.gitignore` en komt nooit in git.

> De service-role sleutel omzeilt alle beveiliging in de database. Hij hoort
> alleen in `.env.local` en straks in Vercel — nooit in een bericht, een
> screenshot of de broncode.

**Controle:** `pnpm db:seed` draait zonder foutmelding.

### A2 · De live database vullen **[ik]**

- `pnpm db:seed` — het aanbod, de modules en de 42 tekstblokken.
- `pnpm db:seed-admin` — jouw account als beheerder.

**Controle:** een telling in de database laat 7 opleidingen en 42 blokken zien,
en `pnpm dev` toont het aanbod op de homepage — met de echte database, niet
lokale voorbeelddata.

### A3 · Opruimen wat er niet meer hoort **[ik]**

Er staan nog resten van Stripe in de code van vóór de overstap naar Mollie:

- de Content-Security-Policy geeft `js.stripe.com`, `api.stripe.com` en
  `hooks.stripe.com` toestemming — die hoeven er niet meer in;
- `.env.local` bevat nog twee Stripe-testwaarden;
- **belangrijker:** `form-action 'self'` in diezelfde policy zou de doorverwijzing
  naar het betaalscherm van Mollie kunnen blokkeren als de bezoeker geen
  JavaScript heeft. Mollie moet daar dus bij.

**Controle:** `pnpm verify` blijft groen, en de site laadt zonder meldingen in
de foutconsole van de browser.

---

## Fase B — De testpijplijn voor het eerst laten draaien

De CI staat klaar in `.github/workflows/ci.yml` maar heeft nog nooit gedraaid.
Hij draait alles wat `pnpm verify` doet, plus de 170 browsertests op twee
browsers, plus een productiebuild. Dat is de vangrail voor alles wat hierna komt.

### B1 · Pull request openen **[jij, 1 minuut]**

Open in de browser:
`https://github.com/zeeuwen1-afk/yoga-company/compare/main...huisstijl-yogacompany`
en klik **Create pull request**.

### B2 · Groen krijgen **[ik]**

De kans is groot dat er iets omvalt dat lokaal net goed ging — een andere
tijdzone, een trager scherm, een browser die hier niet is getest. Dat is precies
waarom we hem laten draaien vóór de livegang, niet erna.

**Controle:** beide taken (`kwaliteit` en `e2e`) staan op groen in GitHub.

### B3 · Samenvoegen naar `main` **[jij]**

Pas als B2 groen is.

**Controle:** de CI draait nog een keer op `main` en is groen.

---

## Fase C — Online op een proefadres

Nog niet op je eigen domein. Eerst een adres van Vercel, zodat we alles kunnen
uitproberen zonder dat er iemand op `yogacompanie.nl` iets halfs ziet staan.

### C1 · Vercel koppelen **[jij, ± 10 minuten]**

Nieuw project, gekoppeld aan de GitHub-repo. Regio staat al vast op Frankfurt
(`vercel.json`), zodat de gegevens de EU niet verlaten.

### C2 · Omgevingsvariabelen invullen **[jij, met een lijst van mij]**

Ik lever de exacte lijst met namen en welke waarde waar vandaan komt. Dezelfde
sleutels als lokaal, plus `CRON_SECRET` en `MAILING_UNSUBSCRIBE_SECRET` die ik
genereer.

### C3 · Eerste deploy **[ik]**

**Controle:** de proef-URL laadt, inloggen werkt, het beheer werkt, en de
securityheaders staan er (`curl -I`).

### C4 · Supabase weet van het nieuwe adres **[jij]**

Authentication → URL Configuration: Site URL en de redirect-URL's naar het
proefadres. Zonder dit komt iemand na het bevestigen van zijn e-mail op
`localhost` terecht.

**Controle:** een testaccount aanmaken, de bevestigingsmail volgen, en op de
juiste plek uitkomen.

---

## Fase D — Echte e-mail

Dit is de stap die het vaakst wordt overgeslagen en dan pijn doet. De
standaardmailer van Supabase stuurt **maximaal drie mails per uur** en is
uitdrukkelijk niet voor productie bedoeld. Zonder eigen mailserver kan de vierde
klant die dag zijn wachtwoord niet herstellen.

- **D1 [jij]** — Resend-account, `yogacompanie.nl` verifiëren (drie DNS-regels).
- **D2 [jij]** — die gegevens als SMTP in Supabase zetten.
- **D3 [ik]** — `RESEND_API_KEY` en `EMAIL_FROM` in Vercel.

**Controle:** "wachtwoord vergeten" levert binnen een minuut een mail op, van
`@yogacompanie.nl`, en die belandt niet in spam.

---

## Fase E — Beveiliging aan vóór de eerste echte klant

- **E1 [jij]** — Authentication → Passwords → **Leaked password protection** aan.
  Dit is de enige echte bevinding uit de beveiligingsscan van Supabase zelf, en
  het is één schakelaar.
- **E2 [jij]** — tweestapsverificatie op je eigen beheerdersaccount. De code
  eist het al; dit is het bevestigen dat het aanstaat.
- **E3 [jij]** — controleren dat de dagelijkse back-up aanstaat.
- **E4 [ik]** — de RLS-suite één keer tegen het echte project draaien in plaats
  van tegen een wegwerpdatabase.

**Controle:** de beveiligingsscan van Supabase komt schoon terug, op de twee
bewust gemaakte uitzonderingen na (die staan uitgelegd in `docs/beheer.md`).

---

## Fase F — Het eigen domein

- **F1 [jij]** — `yogacompanie.nl` bij Vercel toevoegen, DNS aanpassen bij je
  registrar.
- **F2 [ik]** — `NEXT_PUBLIC_SITE_URL` bijwerken, en de URL's in Supabase mee.
- **F3 [ik]** — controleren: https, de headers, `robots.txt`, `sitemap.xml`.

**Controle:** `https://yogacompanie.nl` laadt, `http://` stuurt door naar https,
en een deel van de e-mails komt aan met de juiste links erin.

---

## Fase G — De testronde

Samen doorlopen, elk scenario van begin tot eind:

1. Bezoeker leest over een opleiding en schrijft zich in → dat wordt een
   **aanvraag** (er is nog geen Mollie-account, dus geen betaling).
2. Klant maakt een account, bevestigt zijn e-mail, logt in met 2FA.
3. Klant boekt een les, ziet hem terug, annuleert hem.
4. Les zit vol → volgende gaat op de wachtlijst → iemand annuleert →
   wachtlijstplek schuift door.
5. Jij bewerkt een pagina in de site-editor en publiceert.
6. Jij opent een klantenkaart, schrijft een notitie, maakt een gespreksverslag.
7. Jij verwijdert een testklant volgens de AVG-knop.

Wat er misgaat, gaat op een lijst en wordt gefixt vóór de eerste echte klant.

---

## Wat bewust nog niet meegaat

|                              | Waarom                                                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mollie**                   | Nog geen account. De site werkt zonder: een inschrijving wordt een aanvraag en je neemt zelf contact op. Aanzetten is later één sleutel invullen. |
| **Mailings**                 | Vraagt eerst een schone toestemmingsadministratie.                                                                                                |
| **Meta-koppeling**           | Staat achter een schakelaar, uit.                                                                                                                 |
| **Verwerkersovereenkomsten** | Anthropic en Resend — juridisch, geen code. Moet wel rond zijn vóór de eerste echte klant.                                                        |
