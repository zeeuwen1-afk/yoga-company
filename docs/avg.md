# AVG — bewaartermijnen en persoonsgegevens

Dit document beschrijft welke persoonsgegevens YogaCompany bewaart, waarom, en
hoe lang. Het hoort bij BOUWPROMPT §17 en is de bron waar de privacyverklaring
naar verwijst.

> **Let op:** dit is een technisch document, geschreven door de bouwer. Het
> vervangt geen juridisch advies. Laat de privacyverklaring en de verwerkers­
> overeenkomsten nakijken door een jurist voordat de site live gaat.

---

## 1. Waar de gegevens staan

| Waar                | Regio                     | Wat                                                                                     |
| ------------------- | ------------------------- | --------------------------------------------------------------------------------------- |
| Supabase (Postgres) | Frankfurt, `eu-central-1` | Alle klantgegevens                                                                      |
| Supabase Storage    | Frankfurt, `eu-central-1` | Beeldmateriaal en cursusmateriaal                                                       |
| Vercel              | `fra1` (Frankfurt)        | De applicatie; geen opslag van gegevens                                                 |
| Mollie              | Amsterdam, EU             | Betaalgegevens (wij bewaren alleen een referentie)                                      |
| Resend              | EU/VS                     | Verzending van e-mail                                                                   |
| Anthropic           | VS                        | Socialmediateksten, en gepseudonimiseerde klantdossiers voor het gespreksverslag (§7.4) |
| Meta                | VS                        | Alleen wat de beheerder zelf publiceert                                                 |

Kaart- en rekeninggegevens komen nooit in onze database. Mollie is daarvan de
enige bron; wij bewaren de referentie, het bedrag en de status.

---

## 2. Bewaartermijnen (§17.6)

Deze termijnen worden **automatisch uitgevoerd**, niet handmatig bewaakt. De
databasefunctie `opruimen_bewaartermijnen()` doet het werk; de route
`/api/v1/cron/opschonen` is de trekker en draait via Vercel Cron op de eerste
dag van elke maand om 03:00.

| Gegeven                 | Termijn    | Wat er gebeurt            |
| ----------------------- | ---------- | ------------------------- |
| Contactberichten        | 12 maanden | Verwijderd                |
| Mailinglog (`mailings`) | 12 maanden | Verwijderd                |
| Audit log               | 24 maanden | Verwijderd                |
| Soft-deleted profielen  | 6 maanden  | Definitief geanonimiseerd |

**Waarom deze termijnen.** Een contactvraag van meer dan een jaar geleden is
afgehandeld en heeft geen doel meer. Het audit log dient de verantwoording over
beheerhandelingen en houdt daarvoor twee jaar aan. De zes maanden voor
soft-deleted profielen zijn er zodat een per ongeluk gedeactiveerd account nog
terug kan; daarna vervalt die reden.

**Wat níét wordt opgeruimd.** Inschrijvingen en betaalreferenties blijven staan:
de fiscale bewaarplicht is zeven jaar. Bij anonimisering worden ze losgekoppeld
van de naam, zodat de administratie klopt zonder dat er nog een persoon aan
hangt.

De taak is idempotent: nog een keer draaien vindt simpelweg niets meer om op te
ruimen. Elke ronde schrijft een regel in het audit log met de aantallen — dat is
het bewijs dat de termijnen daadwerkelijk worden uitgevoerd.

### Zelf een ronde draaien

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://yogacompany.eu/api/v1/cron/opschonen
```

Zonder of met een verkeerd geheim antwoordt de route `404` — dan bestaat hij
voor de buitenwereld niet.

---

## 3. Verwijderen op verzoek (§17.7)

Een klant vraagt verwijdering aan via het portaal; een beheerder voert hem uit
in `/admin/klanten/[id]`. Achter de knop zit de databasefunctie
`anonimiseer_profiel()`, die in één transactie:

- alle vrije tekst verwijdert (berichten, aanvragen, interne notities);
- de voortgang verwijdert (herleidbaar gedrag zonder doel na verwijdering);
- naam, e-mailadres, telefoonnummer en mailingtoestemming vervangt;
- de inschrijvingen laat staan, zonder naam eraan.

Dit staat in de database en niet in applicatiecode, zodat half werk onmogelijk
is en de rechtencontrole niet kan worden overgeslagen. De RLS-tests
(`supabase/tests/rls/09_avg_verwijdering.sql`) controleren beide kanten: dat de
persoonsgegevens weg zijn én dat de administratie blijft.

---

## 4. Mailings en toestemming (§10.7)

- Een mailing gaat **uitsluitend** naar profielen met `marketing_consent_at`
  gezet en zonder `deleted_at`. De ontvangerslijst wordt op het moment van
  verzenden opgehaald; er is geen scherm waarin een beheerder een andere lijst
  kan opgeven.
- Elke mailing bevat een **afmeldlink**. Ontbreekt het ondertekeningsgeheim
  (`MAILING_UNSUBSCRIBE_SECRET`), dan gaat er niets uit.
- De afmeldlink werkt **zonder inlog** — wie zich wil afmelden moet dat kunnen
  zonder eerst een wachtwoord op te zoeken. Het token is ondertekend, dus alleen
  wie de mail ontving kan iets intrekken.
- De afmeldpagina vraagt om één bevestiging. Mailprogramma's en scanners volgen
  links vooruit; zonder die bevestiging zou iemand afgemeld raken die de mail
  alleen ontving.
- Een klant kan de toestemming ook zelf aan- en uitzetten in `/portaal/profiel`.

**Wat we van een mailing bewaren:** het onderwerp, de inhoud, de verzenddatum en
het _aantal_ ontvangers. Nooit wíé hem ontving — dat zou een tweede kopie van het
klantenbestand zijn.

---

## 5. Wat er naar Anthropic gaat

### De socialmediatool (§15)

Uitsluitend wat de beheerder zelf intypt als onderwerp van een bericht, plus de
vaste instructie. Geen klantgegevens. Neem in het onderwerpveld dus nooit
persoonsgegevens op; het scherm vraagt om een omschrijving van het bericht, niet
om klantinformatie.

### Het gespreksverslag (§7.4) — sinds 15 augustus 2026

Hier gaan **wél** klantgegevens naartoe, gepseudonimiseerd. Niet mee: naam,
e-mailadres, telefoonnummer, woonplaats en geboortedatum. Wel mee: leeftijd,
ervaring, doelen, interesses, inschrijvingen, voortgang, boekingen, en de
notities en verslagen. Gezondheidsgegevens alleen wanneer de beheerder dat per
keer aanvinkt.

**Pseudonimiseren is geen anonimiseren.** Een uitgebreid profiel kan indirect
nog steeds naar één persoon leiden, dus dit blijft een verwerking van
persoonsgegevens door een derde partij. Er is een verwerkersovereenkomst met
Anthropic voor nodig, en de privacyverklaring benoemt het.

`src/features/crm/server/analyse.test.ts` legt vast wat er níét uit mag; de
volledige uitleg staat in `docs/klantdossier.md`.

---

## 6. Logging (§17.11)

- Geen persoonsgegevens in gewone applicatielogs. Wat er wél in gaat: het soort
  handeling, of het gelukt is, en aantallen.
- Notificatiemails bevatten nooit de inhoud van een bericht — alleen dat er een
  bericht klaarstaat, met een link naar het portaal.
- Het audit log legt vast wát een beheerder deed en waarop, niet de volledige
  inhoud van wat er veranderde. Het log is onveranderlijk: RLS staat alleen
  lezen en toevoegen toe, ook voor beheerders.

---

## 7. Rechten van betrokkenen

| Recht           | Waar                                                     |
| --------------- | -------------------------------------------------------- |
| Inzage / export | `/portaal/profiel` → gegevens downloaden (JSON)          |
| Rectificatie    | `/portaal/profiel`, of via een aanvraag aan de beheerder |
| Verwijdering    | `/portaal/aanvragen` → verwijderverzoek                  |
| Bezwaar mailing | Afmeldlink in elke mailing, of `/portaal/profiel`        |

---

## 8. Nog te doen

- [ ] Privacyverklaring, algemene voorwaarden en cookieverklaring juridisch
      laten toetsen (staan nu als concept in `src/content/juridisch.ts`).
- [ ] Verwerkersovereenkomsten afsluiten met Supabase, Vercel, Mollie, Resend,
      Anthropic en (bij gebruik) Meta.
- [ ] Verwerkingsregister opstellen — dit document is er de basis voor.
