# Livegang — het stappenplan

Van "draait op de ontwikkelmachine" naar "staat online". Herschreven op
29 augustus 2026, na de huisstijlwissel en de nieuwe landingspagina.

Het doel is nu **zo snel mogelijk zichtbaar zijn**: mensen moeten de site en het
aanbod kunnen bekijken. Betalen en mailen komen daarna. De volgorde hieronder is
daarop gebouwd.

Wie wat doet staat erbij: **[jij]** is iets in een dashboard van een externe
partij, **[ik]** is code en controles.

---

## Waar we nu staan

| Wat                        | Stand                                                               |
| -------------------------- | ------------------------------------------------------------------- |
| Alle 12 migrations         | staan op het echte Supabase-project                                 |
| `pnpm verify`              | groen — 84 unittests, 271 RLS-controles, seedcontrole               |
| Browsertests               | 212 groen op twee browsers                                          |
| Inhoud in de live database | gevuld — 7 opleidingen, 85 tekstblokken                             |
| Huisstijl                  | palet "Petrol en abrikoos", nieuwe landingspagina                   |
| Code                       | tak `huisstijl-petrol`, gepusht, **nog niet samengevoegd met main** |
| Online                     | **nergens**                                                         |

---

## Sessie 1 — Online op een proefadres

**Ongeveer een uur, en dan staat het ergens.** Nog niet op je eigen domein:
eerst een adres van Vercel, zodat je alles kunt bekijken zonder dat iemand op
`yogacompany.eu` iets halfs ziet.

> **De site blijft vanzelf uit Google zolang hij niet op het eigen domein
> staat.** Dat is geen instelling die je kunt vergeten: de blokkade hangt aan
> `NEXT_PUBLIC_SITE_URL` en gaat vanzelf uit zodra dat het echte domein wordt.

### 1 · Pull request openen en samenvoegen **[jij, 2 minuten]**

De testpijplijn luistert alleen op `main` en op een pull request. Open er dus
één, laat hem groen worden, en voeg samen:

https://github.com/zeeuwen1-afk/yoga-company/pull/new/huisstijl-petrol

**Controle:** beide taken (`kwaliteit` en `e2e`) staan op groen.

### 2 · Vercel koppelen **[jij, ± 10 minuten]**

Nieuw project, gekoppeld aan de GitHub-repository. De regio staat al vast op
Frankfurt (`vercel.json`), zodat de gegevens de EU niet verlaten.

### 3 · De zes waarden invullen **[jij, ± 5 minuten]**

In Vercel: Settings → Environment Variables, op **alle drie** de omgevingen.
Zonder deze zes draait de site niet.

| Naam                            | Waarde                                                        |
| ------------------------------- | ------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://hfsxncotxlenxrkycxsv.supabase.co`                    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | uit `.env.local` (openbaar, mag iedereen zien)                |
| `SUPABASE_SERVICE_ROLE_KEY`     | uit `.env.local` — **geheim**                                 |
| `NEXT_PUBLIC_SITE_URL`          | het adres dat Vercel je geeft, mét `https://` en zonder slash |
| `CRON_SECRET`                   | uit `.env.local`                                              |
| `MAILING_UNSUBSCRIBE_SECRET`    | uit `.env.local`                                              |

> **`SUPABASE_DB_URL` hoort hier niet.** Die wordt alleen gelezen door de
> scripts op de ontwikkelmachine — migrations, de seed, de RLS-tests — en nooit
> door de draaiende site. Je databasewachtwoord verlaat je eigen computer dus
> niet. Zet hem er niet "voor de zekerheid" bij.

> **`NEXT_PUBLIC_SITE_URL` moet met `https://` beginnen.** Daar hangt de
> beveiligingsheader `upgrade-insecure-requests` aan.

### 4 · Supabase weet van het nieuwe adres **[jij, 2 minuten]**

Authentication → URL Configuration: Site URL en de redirect-URL's naar het
proefadres. Zonder dit komt iemand na het bevestigen van zijn e-mail op
`localhost` terecht.

### 5 · Nalopen **[ik]**

De proef-URL laadt, de securityheaders staan erop, inloggen werkt, het beheer
werkt, en de site staat aantoonbaar op `noindex`.

---

## Sessie 2 — Opschonen vóór de eerste echte bezoeker

**Dit is de belangrijkste sessie.** Er staat testmateriaal in de database dat
straks gewoon meegaat naar het proefadres. Niets daarvan is een storing; het is
alleen niet wat je wilt laten zien.

| Wat staat er nu                                                     | Wie      |
| ------------------------------------------------------------------- | -------- |
| Eén testles in het rooster, locatie "Rafa Yoga Almere"              | ik + jij |
| Docentpagina `/docent/pieter` staat gepubliceerd, met sjabloontekst | jij      |
| Zes accounts, waarvan vier test                                     | ik       |
| Drie ervaringen met "Deelnemer — naam volgt"                        | jij      |
| Adres, telefoon en KvK als plaatshouder in de voettekst             | jij      |
| Privacyverklaring en voorwaarden met een zichtbare conceptmelding   | jij      |

**Het echte rooster** is het enige dat werk kost: die lessen moeten erin voordat
de pagina "Lessen" iets waard is. Dat kan via **Beheer → Lesrooster**.

**De ervaringen** kun je nu ook gewoon verbergen tot je echte namen hebt —
Site-editor → Startpagina → **Van de pagina halen**. Beter een pagina zonder
ervaringen dan een pagina met "naam volgt".

**De juridische teksten** zijn concept en zeggen dat ook tegen bezoekers. Voor
een etalage is dat te verdedigen; vóór je de eerste betaling aanneemt niet.

---

## Sessie 3 — Het eigen domein en de mail

### Domein **[jij, ± 15 minuten]**

`yogacompany.eu` bij Vercel toevoegen en de DNS aanpassen bij je registrar.
Daarna zet ik `NEXT_PUBLIC_SITE_URL` om — en daarmee gaat de zoekmachine
vanzelf aan.

**Controle:** `https://yogacompany.eu` laadt, `http://` stuurt door naar https,
en `X-Robots-Tag` is verdwenen.

### E-mail **[jij, ± 20 minuten]**

De standaardmailer van Supabase stuurt **maximaal drie mails per uur** en is
uitdrukkelijk niet voor productie bedoeld. Zolang Resend niet staat, kan de
vierde bezoeker die dag zijn wachtwoord niet herstellen.

Voor een etalage waar niemand een account maakt, kun je hiermee wachten. Maar
op de startpagina staan twee inlogdeuren, dus iemand gáát het proberen.

1. Resend-account, `yogacompany.eu` verifiëren (drie DNS-regels).
2. Die gegevens als SMTP in Supabase zetten.
3. `RESEND_API_KEY` en `EMAIL_FROM` in Vercel — dat doe ik.

**Controle:** "wachtwoord vergeten" levert binnen een minuut een mail op van
`@yogacompany.eu`, en die belandt niet in spam.

### Beveiliging aanzetten **[jij, 5 minuten]**

- Authentication → Passwords → **Leaked password protection** aan. Dit is de
  enige echte bevinding uit de beveiligingsscan van Supabase zelf.
- Tweestapsverificatie op je beheerdersaccount (`wietskevis@hotmail.com`). De
  code eist het al; dit is het bevestigen dat het aanstaat.
- Controleren dat de dagelijkse back-up loopt.

---

## Wat bewust nog niet meegaat

|                              | Waarom                                                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mollie**                   | Nog geen account. De site werkt zonder: een inschrijving wordt een aanvraag en je neemt zelf contact op. Aanzetten is later één sleutel invullen. |
| **Kaarten online verkopen**  | Bestaat nog niet. Kaarten worden met de hand door de docent uitgegeven.                                                                           |
| **Mailings**                 | Vraagt eerst een schone toestemmingsadministratie.                                                                                                |
| **Meta-koppeling**           | Staat achter een schakelaar, uit.                                                                                                                 |
| **Verwerkersovereenkomsten** | Anthropic en Resend — juridisch, geen code. Moet rond zijn vóór de eerste echte klant.                                                            |
| **Meerdere studio's**        | Zie de verkenning over landelijk gebruik. Het model draagt het al; de rechtenlaag moet er nog bij.                                                |

---

## De beveiliging is al tegen productie nagelopen

Gedaan op 15 augustus 2026, alleen lezend, tegen het echte project:

| Controle                                           | Uitkomst                                                                         |
| -------------------------------------------------- | -------------------------------------------------------------------------------- |
| RLS op elke publieke tabel                         | 22 van 22, met 45 policies                                                       |
| `anon` mag admin-functies uitvoeren                | nee — het gat van 13 augustus is dicht                                           |
| Admin-functies controleren zelf de rol             | alle zeven doen dat                                                              |
| `search_path` vastgezet op elke `security definer` | ja                                                                               |
| `sensitive.client_health`                          | RLS aan, nul policies, schema onbereikbaar voor `anon` en voor ingelogde klanten |

De gedragstests (`pnpm test:rls`) draaien tegen een wegwerpdatabase, bij elke
wijziging. Wil je ze ooit tegen een échte Supabase draaien, dan hoort daar een
apart, leeg project of een preview-branch bij — niet productie.
