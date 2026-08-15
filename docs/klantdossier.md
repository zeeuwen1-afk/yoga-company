# Het klantdossier

Wat er per klant wordt vastgelegd, wie erbij kan, en wat er met de AI gebeurt.
Vastgesteld op 15 augustus 2026.

---

## De afweging vooraf

§8.1 van de bouwprompt zegt: dataminimalisatie, geen geboortedata, geen
tracking-profielen. De opdrachtgever wil klanten beter kunnen volgen en
bedienen, en heeft daarom gekozen voor een ruimer dossier — inclusief
gezondheidsgegevens.

Dat mag, maar niet vormvrij. "Zoveel mogelijk verzamelen" is precies wat de AVG
verbiedt: elk veld heeft een doel nodig. Daarom heeft elk veld hieronder er
één, en die staat ook in de migration bij de kolom. Wie er een veld bij wil,
schrijft het doel erbij of laat het weg.

## Twee soorten gegevens, twee plekken

### Gewoon — in `profiles`

| Veld              | Doel                                                                     |
| ----------------- | ------------------------------------------------------------------------ |
| Geboortedatum     | Verjaardagsattentie, en leeftijd als context bij een programma           |
| Woonplaats        | Inschatten of iemand in de buurt woont. **Alleen de plaats**, geen adres |
| Telefoonnummer    | Contact bij een afgelaste les of een praktische vraag                    |
| Hoe gevonden      | Weten wat werkt in de werving                                            |
| Ervaring met yoga | Een les of opleiding kiezen die past                                     |
| Doelen            | Het gesprek voeren over waar iemand naartoe wil                          |
| Interesses        | Mailings gericht versturen. Alleen bruikbaar mét toestemming             |

### Bijzonder — in het schema `sensitive`

Blessures, klachten en aandachtspunten zijn **bijzondere persoonsgegevens**
(AVG art. 9). Ze staan daarom apart, in `sensitive.client_health`:

- Het schema is **niet blootgesteld** aan de API. Er is geen REST-eindpunt.
- De tabel heeft RLS aan en **geen enkele policy** — ook een beheerder komt er
  niet via de gewone weg bij.
- De enige ingang zijn twee functies, `haal_gezondheid` en `bewaar_gezondheid`.
  Die controleren zelf of de aanroeper beheerder is en **schrijven elke inzage
  en wijziging in het audit log**. Dat is wat §8.3 bedoelt met "alleen via
  audit-gelogde views".
- Opslaan kan alleen met een vinkje dat de klant **uitdrukkelijk toestemming**
  heeft gegeven. Wissen mag altijd, zonder vinkje.
- Op het scherm staan ze achter een knop, niet zomaar op de pagina. Elke inzage
  wordt gelogd, en dan hoort er een bewuste handeling tegenover te staan.
- **Bewaartermijn: twee jaar** na de laatste wijziging. De maandelijkse
  opschoontaak ruimt ze op.

## Wie kan erbij

Alleen de beheerder. Dat wordt op drie plekken afgedwongen:

1. de serveractie controleert de rol;
2. RLS op `crm_notes` en `crm_analyses` laat alleen `is_admin()` door;
3. de databasefuncties controleren het zelf nog eens.

Eén laag zou genoeg moeten zijn. Bij bijzondere persoonsgegevens wil je er
drie. RLS-test 14 legt vast dat een klant zijn eigen dossier niet kan inzien —
ook niet zijn eigen gezondheidsgegevens of gespreksverslag. **De beheerder
bepaalt wat hij deelt.**

## Notities en verslagen

Eén tijdlijn met twee soorten: een korte **notitie** (losse observatie) en een
**verslag** (de neerslag van een gesprek of een les, met een titel). Ze zitten
in dezelfde tabel met een soort erbij, zodat de tijdlijn klopt zonder dat er
steeds twee lijsten samengevoegd moeten worden.

## Het gespreksverslag

Een knop op de klantenkaart die alles wat er bekend is omzet naar een verslag
om samen met de klant door te nemen: waar je nu staat, wat opvalt,
aandachtspunten, een voorstel, en vragen om te stellen.

### Wat er wél en niet naar Anthropic gaat

Uitdrukkelijke keuze van de opdrachtgever: **NAW-gegevens gaan niet mee.**

| Gaat niet mee  | Gaat wel mee                                     |
| -------------- | ------------------------------------------------ |
| Naam           | Leeftijd (afgeleid uit de geboortedatum)         |
| E-mailadres    | Ervaring, doelen, interesses, hoe gevonden       |
| Telefoonnummer | Inschrijvingen, voortgang, boekingen, aanvragen  |
| Woonplaats     | Notities en verslagen                            |
| Geboortedatum  | Gezondheidsgegevens — alleen als je dat aanvinkt |

De naam wordt ook uit de vrije tekst gehaald, want daar staat hij vaak in
("Marieke gaf aan dat…"). Dat is een schoonmaakslag, geen garantie: een notitie
kan de naam van een partner of een werkgever bevatten. **De beheerder ziet het
verslag voordat er iets mee gebeurt** en is daarmee de laatste controle.

`src/features/crm/server/analyse.test.ts` legt dit vast: tien tests die falen
zodra er een naam, e-mailadres, telefoonnummer of woonplaats naar buiten lekt.

### Pseudonimiseren is niet anonimiseren

Dit is belangrijk om te weten. Een uitgebreid profiel met leeftijd, klachten en
doelen kan indirect nog steeds naar één persoon leiden. De AVG beschouwt dit
dus **nog steeds als persoonsgegevens**. Concreet betekent dat:

- Er is een **verwerkersovereenkomst met Anthropic** nodig.
- De **privacyverklaring** moet benoemen dat er gegevens naar Anthropic gaan.
  Die stond eerder op "hier gaan geen klantgegevens naartoe"; dat klopt niet
  meer en is aangepast.
- Gaan er gezondheidsgegevens mee, dan is dat een verwerking van bijzondere
  persoonsgegevens door een derde partij. Doe dat alleen als de toestemming van
  de klant daarop ziet.

Het vinkje "gezondheidsgegevens meesturen" staat daarom standaard **uit** en
moet per keer bewust worden aangezet. Bij elk bewaard verslag staat of ze zijn
meegegaan.

### Wat het verslag níét doet

Geen diagnoses, geen behandeladviezen. De opdracht aan het model zegt
uitdrukkelijk: verzin niets dat niet in het dossier staat, en verwijs bij
twijfel door naar een arts of fysiotherapeut. Is er weinig informatie, dan hoort
het verslag kort te zijn — een dun verslag is beter dan een opgeblazen verslag.

## Verwijderen

Bij een AVG-verwijdering gaan **gezondheidsgegevens en gespreksverslagen er
volledig uit** — niet geanonimiseerd, maar weg. Ook de uitgebreide velden
worden leeggemaakt. Alleen de bestellingen blijven staan voor de fiscale
bewaarplicht, losgekoppeld van de persoon.

## Toegang herstellen

Op dezelfde kaart zitten twee knoppen voor als een klant er niet meer in komt:

- **Wachtwoord laten herstellen** — de klant krijgt dezelfde mail als bij
  "wachtwoord vergeten". Er wordt bewust géén wachtwoord ingesteld en
  doorgegeven: dan zou de beheerder het wachtwoord van een klant kennen.
- **Tweestapsverificatie loskoppelen** — voor wie zijn telefoon kwijt is. Bij
  de volgende keer inloggen stelt de klant hem opnieuw in.

Beide gaan het logboek in.

## Nog te doen vóór livegang

- [ ] Verwerkersovereenkomst met Anthropic tekenen.
- [ ] De privacyverklaring juridisch laten toetsen; de tekst is aangepast maar
      staat nog als concept.
- [ ] Bepalen hoe je de toestemming voor gezondheidsgegevens vastlegt bij de
      klant zelf. Nu bevestigt de beheerder dat hij die heeft; een vinkje in
      het portaal van de klant zou sterker zijn.
