# Beheerhandleiding — YogaCompany

Praktisch naslagwerk voor het opzetten, draaien en onderhouden van het
platform. Aangevuld per fase.

---

## 1. Ontwikkelomgeving

Vereist: Node.js 20.9 of hoger en pnpm.

Op deze Mac staat Node in `~/.local/node` (installatie zonder beheerrechten).
De regel die dat in je pad zet, staat in `~/.zshrc`. Open na een verse
installatie een nieuwe terminal.

### Waar het project staat

`~/Projecten/yoga-companie`. Op 16 augustus 2026 verhuisd vanuit
`~/Documents/yoga-companie`, en dat is geen smaakkwestie: **een projectmap hoort
niet in iCloud, OneDrive of Dropbox.**

Zo'n dienst ziet geen verschil tussen een tekstdocument en broncode. Van de
ruim 44.000 bestanden die hier stonden waren er 335 van ons; de rest was
`node_modules`, `.next` en `.git`, die voortdurend veranderen terwijl de server
draait. Bij een conflict laat iCloud een kopie achter met " 2" in de naam.
Vijftien van die kopieën zijn er op 16 augustus uit gehaald — twee ervan waren
migrations, en die draaiden dus twee keer. OneDrive doet hetzelfde, met
`-MACBOOKNAAM` in plaats van " 2".

En `.env.local` staat bewust niet in git, maar wél in zo'n map. De
service-role sleutel en het databasewachtwoord gingen dus mee de cloud in.

De back-up is GitHub, niet een synchronisatiemap: daar staat elke versie met
een verklaring erbij, en één `git clone` zet alles terug op een nieuwe machine.

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
| `pnpm mail:test <adres>`    | Verstuurt één proefmail via Resend              |

Voor de e2e-tests eenmalig: `pnpm exec playwright install chromium webkit`.

---

## 7. Betalingen (Mollie)

De volledige uitleg staat in **`docs/payments.md`** — inclusief waarom de
webhook geen handtekening controleert en hoe je hem in testmodus uitprobeert.
Hier de korte versie.

### Aanzetten

Eén omgevingsvariabele:

```
MOLLIE_API_KEY=test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Test- of live-modus volgt uit het voorvoegsel van de sleutel (`test_` of
`live_`), dus daar valt niets verkeerd in te stellen. In het beheer onder
**Instellingen → Koppelingen** zie je welke van de twee actief is.

Aan de kant van Mollie hoef je geen webhook in te stellen: het adres gaat mee
met elke betaling die we aanmaken. Wat wél moet kloppen is
`NEXT_PUBLIC_SITE_URL`.

### Zolang er geen sleutel is

De site blijft werken. Een inschrijving wordt dan een **aanvraag**: hij komt in
het beheer bij Aanvragen te staan en de klant krijgt een mail dat je binnen
twee werkdagen contact opneemt. De knop heet in die stand "Aanmelden".

### Terugbetalen en termijnen

Terugbetalen doe je in het Mollie-dashboard; de webhook zet de bestelling
daarna op terugbetaald, trekt de inschrijving in en schrijft een regel in het
logboek.

Voor betalen in termijnen zijn er twee mogelijkheden in de beheeromgeving: een
losse **betaallink** maken, of een inschrijving **handmatig op betaald** zetten.
Beide worden vastgelegd in het audit log, met de reden erbij.

### Live gaan

Vervang de `test_`-sleutel door de `live_`-sleutel en deploy opnieuw. Doe daarna
één echte betaling van een klein bedrag en betaal die terug, om te zien dat
beide kanten werken.

---

## 8. E-mail (Resend)

1. Maak een account op [resend.com](https://resend.com) en voeg het domein
   `yogacompany.eu` toe.
2. Zet de DNS-records die Resend toont (SPF, DKIM en DMARC) bij je registrar.
   Zonder die records komen mails in de spammap terecht. Doorvoeren duurt
   meestal minuten, soms tot 24 uur.
3. Maak onder **API Keys** een sleutel met rechten "Sending access".
4. Zet hem op **twee** plekken — dat wordt het vaakst vergeten:
   - in `.env.local`, voor de scripts en de ontwikkelmachine;
   - in Vercel onder **Settings → Environment Variables**, voor de site zelf.

   ```
   RESEND_API_KEY=re_...
   EMAIL_FROM="YogaCompany <info@yogacompany.eu>"
   ```

Ontbreekt de sleutel, dan wordt er niets verstuurd en gaat de rest gewoon door:
een mail die niet weggaat mag nooit een betaling of inschrijving laten
mislukken. In het logboek staat dan wat er niet verstuurd is. Let op wat dat
betekent zolang het zo staat: een aanvraag komt wél bij jou binnen, maar de
klant krijgt geen bevestiging en denkt dat er niets gebeurd is.

### Controleren dat het werkt

```bash
pnpm mail:test jouw@adres.nl
```

Dit verstuurt één echte proefmail. Het script kijkt eerst of de sleutel klopt
en of het afzenderdomein bij Resend geverifieerd is, en vertaalt daarna de
melding van Resend naar wat je eraan kunt doen.

Gebruik een adres bij Gmail of Outlook: die filteren streng, dus komt hij dáár
in het postvak IN, dan zit het goed. Belandt hij in de spammap, dan zijn de
DNS-records nog niet in orde.

> Dit test alleen de mail die de site zelf verstuurt. De verificatie- en
> herstelmails komen van Supabase; die test je apart, via "wachtwoord vergeten"
> op de inlogpagina. Zie de SMTP-stap hieronder.

### Welke mails het platform verstuurt

| Mail                 | Wanneer                                                    | Wie verstuurt |
| -------------------- | ---------------------------------------------------------- | ------------- |
| Accountverificatie   | Bij registratie                                            | Supabase Auth |
| Wachtwoordherstel    | Bij een herstelverzoek                                     | Supabase Auth |
| Inschrijfaanvraag    | Na aanmelding voor een opleiding, zolang Mollie uit staat  | de site       |
| Inschrijfbevestiging | Na een geslaagde betaling                                  | de site       |
| Kaartaanvraag        | Na het aanvragen van een strippenkaart of abonnement       | de site       |
| Contactbevestiging   | Naar de afzender van het contactformulier                  | de site       |
| Contactnotificatie   | Naar jou, zonder de inhoud van het bericht                 | de site       |
| Nieuw bericht        | Bij een bericht in de beveiligde dialoog, zonder de inhoud | de site       |
| Mailing              | Bij het versturen van een mailing                          | de site       |

`pnpm mail:test` dekt de regels met "de site". De twee bovenste komen van
Supabase en gaan een andere weg.

### Supabase zijn eigen mails laten versturen via Resend

Doe dit ook als je denkt dat het wel meevalt: de standaardmailer van Supabase
stuurt **maximaal drie mails per uur** en is uitdrukkelijk niet voor productie
bedoeld. Zonder deze stap kan de vierde klant die dag zijn wachtwoord niet
herstellen.

In het Supabase-dashboard onder **Project Settings → Authentication → SMTP
Settings**:

| Veld         | Waarde                |
| ------------ | --------------------- |
| Host         | `smtp.resend.com`     |
| Port         | `465`                 |
| Username     | `resend`              |
| Password     | je `RESEND_API_KEY`   |
| Sender email | `info@yogacompany.eu` |
| Sender name  | `YogaCompany`         |

De teksten van die twee mails pas je aan onder **Authentication → Emails**.

**Controle:** klik op de inlogpagina op "wachtwoord vergeten", vul je eigen
adres in, en kijk of de mail binnen een minuut binnenkomt — van
`@yogacompany.eu`, en niet in de spammap.

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

## 10. Berichten voor sociale media (AI)

Onder **Website → Social** stel je een bericht voor Instagram of Facebook op.
Het werkt in drie stappen.

### 1. Zeg waar het over gaat

Beschrijf in je eigen woorden wat je wilt vertellen — bijvoorbeeld "de 200-uurs
opleiding start in september, er zijn nog plekken". Kies daarbij een doel
(informeren, inschrijvingen of inspiratie) en het platform. Dat doel bepaalt de
toon: bij _inspiratie_ komt er geen uitnodiging onder, bij _inschrijvingen_
juist wel.

### 2. Kies uit drie varianten

De AI schrijft drie berichten met verschillende invalshoeken. Boven elke variant
staat in één zin waar hij op inzet, zodat je snel kunt kiezen. Klik op **Deze
gebruiken** en de tekst komt in het bewerkveld te staan.

### 3. Bijschaven, beeld erbij, plaatsen

Lees de tekst na en pas hem aan. Kies eventueel een afbeelding; die komt in de
`public-media`-opslag te staan.

Daarna:

- **Kopieer naar klembord** — plak de tekst in de app van Instagram of Facebook.
- **Download afbeelding** — opent het beeld in een nieuw tabblad, zodat je het
  kunt opslaan.
- **Bewaar als concept** — het bericht verschijnt in het overzicht eronder.

> **Jij bent verantwoordelijk voor wat er online komt te staan, niet de AI.**
> Lees elk bericht na voordat je het plaatst.

### Wat de AI niet mag schrijven

De instructie ligt vast in code en is niet via het beheer aan te passen. Daarin
staat onder meer: altijd Nederlands, de toon uit de huisstijl, en géén
uitspraken over gezondheid, genezing of behandeling. YogaCompany is een
opleidingsinstituut, geen zorgverlener; "helpt tegen burn-out" is een belofte
die we niet kunnen waarmaken en juridisch riskant is. Wat wél kan: beschrijven
wat je in een les dóét en wat deelnemers leren.

Weigert de AI een onderwerp, dan zegt het scherm dat. Formuleer het onderwerp
dan anders.

### Wat er naar Anthropic gaat

Alleen het onderwerp dat jij intypt, plus de vaste instructie. Geen namen, geen
e-mailadressen, geen inschrijvingen. Zet dus nooit klantgegevens in het
onderwerpveld.

### De koppeling inrichten

Zet `ANTHROPIC_API_KEY` in de environment. Zonder die sleutel werkt het scherm
gewoon — je schrijft de tekst dan zelf en gebruikt de rest van de tool.

Optioneel kun je de tekst voor het model wisselen met `ANTHROPIC_MODEL`;
standaard is dat `claude-sonnet-5`.

### Rechtstreeks publiceren via Meta (optioneel)

Achter de vlag `META_PUBLISHING_ENABLED=true` verschijnt bij elk bewaard bericht
een knop **Publiceren**. Daarvoor is nodig:

| Variabele                   | Wat                            |
| --------------------------- | ------------------------------ |
| `META_PUBLISHING_ENABLED`   | `true`                         |
| `META_ACCESS_TOKEN`         | Long-lived page token          |
| `META_PAGE_ID`              | De Facebook-pagina             |
| `META_INSTAGRAM_ACCOUNT_ID` | Het Instagram Business-account |

Meta vraagt hiervoor om een developer-app met app-review op de
publish-permissies — een traject van weken. Tot die tijd werkt de tool volledig
via kopiëren en handmatig plaatsen. Instagram publiceert niet zonder beeld, dus
een afbeelding is bij deze route verplicht.

---

## 11. Mailings

Onder **Website → Mailings** stuur je een bericht aan klanten.

### Wie hem krijgt

Uitsluitend klanten die daar toestemming voor gaven — in het scherm staat het
aantal. Wie geen toestemming gaf, krijgt hem niet; daar is geen instelling voor.
Klanten zetten hun toestemming zelf aan of uit in hun profiel.

### Zo gaat het

1. Schrijf onderwerp en bericht en klik **Bewaar als concept**.
2. Klik bij het concept op **Proefmail naar mijzelf** en lees hem na in je eigen
   mailprogramma.
3. Klik op **Versturen**. Er volgt een bevestiging met het aantal ontvangers,
   want versturen kan niet ongedaan worden gemaakt.

De afmeldlink wordt automatisch onderaan toegevoegd — die hoef je er niet zelf
bij te zetten. Elke ontvanger krijgt zijn eigen link.

### Wat er wordt bewaard

Het onderwerp, de inhoud, de verzenddatum en het _aantal_ ontvangers. Nooit wíé
hem ontving: dat zou een tweede kopie van het klantenbestand zijn. Na twaalf
maanden wordt de mailing automatisch opgeruimd (zie §12).

### Inrichten

| Variabele                    | Wat                       |
| ---------------------------- | ------------------------- |
| `RESEND_API_KEY`             | Zie §8                    |
| `MAILING_UNSUBSCRIBE_SECRET` | Ondertekent de afmeldlink |

Genereer het geheim met `openssl rand -base64 32`. Ontbreekt het, dan gaat er
geen mailing uit: een mailing zonder werkende afmeldlink is geen optie.

Verander dit geheim niet zomaar — afmeldlinks in eerder verstuurde mails werken
dan niet meer. Moet het toch, laat klanten dan weten dat ze zich via hun profiel
kunnen afmelden.

---

## 12. Bewaartermijnen opruimen

Persoonsgegevens die hun doel hebben gediend, worden automatisch opgeruimd. Dit
gebeurt op de eerste dag van elke maand om 03:00 via Vercel Cron.

| Gegeven                | Termijn    |
| ---------------------- | ---------- |
| Contactberichten       | 12 maanden |
| Mailings               | 12 maanden |
| Audit log              | 24 maanden |
| Soft-deleted profielen | 6 maanden  |

Inschrijvingen en betaalreferenties blijven staan — die vallen onder de fiscale
bewaarplicht van zeven jaar.

Zet `CRON_SECRET` in de environment; Vercel stuurt hem automatisch mee. Zonder
dat geheim antwoordt de route `404`, zodat hij voor de buitenwereld niet
bestaat.

Zelf een ronde draaien:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://yogacompany.eu/api/v1/cron/opschonen
```

Elke ronde schrijft een regel in het logboek met de aantallen. Zie `docs/avg.md`
voor de onderbouwing van de termijnen.

---

## 13. Nog te documenteren

Wordt aangevuld zodra de betreffende fase is opgeleverd:

- Deploy naar Vercel (regio `fra1`) en de benodigde environment variables
- Mollie live zetten (de `live_`-sleutel plaatsen)
- Resend instellen als SMTP van Supabase Auth
- Back-ups en de herstelprocedure

---

## 14. Facturatie tussen docenten

Geven er meerdere docenten les bij dezelfde studio en gelden jullie kaarten bij
elkaar, dan ontstaat er elke maand een rekening over en weer. De volledige
uitleg staat in **`docs/lessen-en-boekingen.md`** onder "De docentenlaag"; hier
staat wat je als docent maandelijks doet.

### Eenmalig instellen

Vul je factuurgegevens in via de docentenportal: bedrijfsnaam, adres,
KvK-nummer, btw-nummer, en de nummerreeks die je zelf gebruikt.

> **De nummerreeks is het punt waar het misgaat.** Elke factuur moet een uniek
> en doorlopend nummer hebben; gaten of dubbelingen zijn een rode vlag bij de
> Belastingdienst. Heb je al een eigen reeks voor je andere werk, kies dan hier
> een ander voorvoegsel — bijvoorbeeld `YC` — zodat de twee reeksen elkaar niet
> in de weg zitten.

### Een kaart uitgeven

Iemand heeft bij je betaald? Ga naar **Docentenportal → Kaart uitgeven**, vul
het e-mailadres van de klant in en kies de kaart. Vanaf dat moment kan hij
boeken en telt zijn saldo af.

Er is bewust geen keuzelijst met klanten: die zou het hele klantenbestand van
de studio openzetten voor iedereen die er lesgeeft. Heeft de klant nog geen
account, dan maakt hij dat eerst zelf aan.

### Elke maand afsluiten

Zodra een maand voorbij is staat er onderaan de portal een knop. Die doet drie
dingen tegelijk: de bedragen liggen vast, er komt per collega één maandstaat,
en de factuurnummers worden uitgedeeld.

- Een maand die nog loopt kan niet worden afgesloten — er kunnen nog lessen
  bij komen.
- Tweemaal afsluiten levert geen tweede factuur op.
- **Na afsluiten kan er niets meer worden gewijzigd.** Klopt er iets niet, dan
  hoort daar een creditfactuur bij; die is nog niet gebouwd, dus overleg dat
  voorlopig even met elkaar.

### Twee facturen, één betaling

Zijn jullie elkaar allebei iets schuldig, dan krijgt ieder een eigen factuur.
Die mogen niet worden samengevoegd tot één factuur van het verschil — dat mag
de Belastingdienst niet. Het bedrag dat overblijft mag je wél in één keer
overmaken.

### Wat je van een collega ziet

Alleen zijn naam, en de afboekingen die jullie samen aangaan. Zijn klanten,
zijn andere kaarten en zijn afrekeningen met derden blijven dicht. Dat is een
regel in de database, geen instelling in een scherm.
