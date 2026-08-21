# Lessen en boekingen

De wekelijkse yogalessen: het rooster op de site, boeken en annuleren in het
portaal, en het beheer met deelnemerslijst. Uitgevoerd volgens §6, §7.1, §7.3
en §7.4 van `YogaCompany-claude-code-prompt.md`.

---

## Let op: twee dingen die allebei "les" heten

| In de database   | Betekenis                                                                |
| ---------------- | ------------------------------------------------------------------------ |
| `lessons`        | **Lesmateriaal** binnen een opleiding — een blok video's, pdf's en tekst |
| `class_sessions` | Een **geroosterde yogales** op een datum en tijd                         |

Ze hebben niets met elkaar te maken. De bouwprompt noemt beide `lessons`; om ze
uit elkaar te houden heet het rooster hier `class_sessions`. In de Nederlandse
teksten op het scherm heet het gewoon "les", want daar is de context duidelijk.

## Datamodel

```
class_sessions ──< bookings >── profiles
```

- **`class_sessions`** — titel, omschrijving, begintijd, duur, locatie,
  capaciteit, wel/niet gepubliceerd, en of de les is afgelast.
- **`bookings`** — één rij per klant per les, met status `geboekt`,
  `wachtlijst`, `geannuleerd` of `niet_verschenen`. Annuleren wist de rij niet
  maar zet de status om, zodat opnieuw boeken dezelfde rij hergebruikt.
- **`class_sessions_public`** — de view die de site leest. Bevat het aantal
  vrije plekken, maar nooit wie er geboekt heeft.

Een afgelaste les wordt niet verwijderd. De deelnemers moeten kunnen zien dát
hij niet doorgaat, en de beheerder heeft de lijst nodig om ze te bereiken.

## Waarom boeken een databasefunctie is

Een plek vergeven is tellen en dan schrijven. Doen twee mensen dat tegelijk,
dan tellen ze allebei "nog één plek vrij" en zitten er daarna dertien mensen in
een les van twaalf.

`boek_les()` vergrendelt daarom eerst de lesregel (`select … for update`) en
telt pas daarna. Zolang die functie de enige weg naar binnen is, kan de
capaciteit niet worden overschreden — ook niet door een fout in de
applicatiecode. Klanten hebben om die reden **geen** insert- of update-policy
op `bookings`; ze mogen alleen hun eigen rijen lézen.

`annuleer_boeking()` doet het omgekeerde en schuift meteen de eerste
wachtlijster door, op volgorde van aanmelden.

## De regels

| Regel                                                   | Waar afgedwongen          |
| ------------------------------------------------------- | ------------------------- |
| Niet boeken in een volle les — je komt op de wachtlijst | `boek_les`                |
| Niet boeken in een les die al begonnen is               | `boek_les`                |
| Niet boeken in een afgelaste of niet-gepubliceerde les  | `boek_les`                |
| Niet twee keer dezelfde les boeken                      | `boek_les` + unieke index |
| Annuleren tot **vier uur** voor aanvang                 | `annuleer_boeking`        |
| Bij een afgelaste les mag altijd geannuleerd worden     | `annuleer_boeking`        |
| Strip terug bij afmelden tot **24 uur** voor aanvang    | `annuleer_boeking`        |

De annuleertermijn staat als constante in `annuleer_boeking` én in
`ANNULEERTERMIJN_UREN` in de servicelaag — die tweede alleen om de knop
vooraf uit te schakelen. De database heeft het laatste woord.

### Twee termijnen, en waarom dat er twee zijn

Vier uur en 24 uur lijken met elkaar in tegenspraak, maar ze gaan over
verschillende dingen:

- **Vier uur** — tot dan mag je de boeking weghalen. Daarna niet meer, want een
  wachtlijster kan op die termijn niet meer fatsoenlijk worden opgeroepen.
- **24 uur** — tot dan komt je strip terug. Meld je je later af, dan mag dat
  nog steeds, maar de strip blijft eraf. Dat is de regel die de studio
  publiceert: _"wij vragen om 24 uur voor de les af te melden, anders zijn wij
  genoodzaakt een strip te berekenen"._

Gaat de les niet door, dan komt de strip altijd terug. Dat is nooit de schuld
van de klant.

## Schermen

| Waar                 | Wat                                                                           |
| -------------------- | ----------------------------------------------------------------------------- |
| `/lessen`            | Openbaar weekrooster, vier weken vooruit. Zonder account: knop naar inloggen. |
| `/portaal/lessen`    | Rooster met boeken en annuleren, en bovenaan "Jouw lessen".                   |
| `/portaal`           | Kaart met de eerstvolgende les waarvoor je staat ingeschreven.                |
| `/admin/lessen`      | Rooster beheren, nieuwe les toevoegen, bezetting per les.                     |
| `/admin/lessen/[id]` | Deelnemerslijst, wachtlijst, niet-verschenen markeren, les afgelasten.        |

De kop- en inleidingstekst van `/lessen` staat in het CMS onder paginasleutel
`lessen` en is dus via de site-editor aan te passen.

## Demo in vijf stappen

1. Log in als beheerder en ga naar **Lesrooster → Nieuwe les**. Vul een titel
   in, zet de datum een paar dagen vooruit en de capaciteit op **1**.
2. Open `/lessen` in een privévenster. De les staat er, met "Nog 1 plek".
3. Log in als klant en boek de les via **Lessen**. De knop wordt
   "Boeking annuleren".
4. Boek met een tweede klantaccount. Die krijgt "Op de wachtlijst".
5. Annuleer met de eerste klant. Ververs de admin: de tweede klant is
   doorgeschoven naar de deelnemerslijst.

## Wat er nog niet is

- **Boekingsmails** (flow 6 uit §7.5): bevestiging bij boeken, herinnering voor
  aanvang, en bericht als je van de wachtlijst doorschuift. De e-mailmodule
  bestaat al; deze drie sjablonen moeten er nog in.
- **Betalen per les**: het lesabonnement en de losse leskaart uit §6 wachten op
  de overstap naar Mollie. Boeken is nu gratis.
- Bij het afgelasten van een les krijgen deelnemers **geen** automatisch
  bericht. Dat staat er ook zo bij in het scherm, met de vraag ze zelf even te
  berichten.

## Tests

- `supabase/tests/rls/12_lessen_en_boekingen.sql` — klantscheiding, de
  capaciteitsgrens, het doorschuiven van de wachtlijst, de annuleertermijn, en
  de pogingen om de regels via de tabel te omzeilen.
- `src/features/bookings/datum.test.ts` — tijdzone en groepering per dag.
- `e2e/lessen.spec.ts` — openbare pagina, navigatie, afscherming van portaal en
  beheer.

---

## De docentenlaag

Strippenkaarten die bij meerdere docenten van dezelfde studio geldig zijn, met
registratie van het gebruik en maandelijkse facturatie tussen docenten
onderling. Toegevoegd op 20 augustus 2026.

### Het model in één alinea

Een docent verkoopt een kaart en int dat geld zelf, op zijn eigen rekening.
Volgt de klant daarmee een les bij een collega, dan stuurt die collega aan het
eind van de maand een factuur. **Er loopt geen geld via dit platform**: het
registreert, rekent en maakt de factuur klaar. Dat is niet alleen een keuze
maar ook een grens — een platform dat klantgeld doorsluist heeft een vergunning
van De Nederlandsche Bank nodig.

### De tabellen

| Tabel                    | Wat erin staat                                          |
| ------------------------ | ------------------------------------------------------- |
| `studios`                | locatie, met `max_deelnemers` als vangrail              |
| `studio_teachers`        | wie geeft waar les — tevens het antwoord op "is docent" |
| `teacher_billing`        | factuurgegevens en de eigen nummerreeks per docent      |
| `room_slots`             | de vaste wekelijkse plek en wat die per maand kost      |
| `pass_products`          | de acht producten, met de verrekenwaarde                |
| `passes`                 | een verkochte kaart: klant, uitgever, saldo, geldigheid |
| `pass_usages`            | de afboeking — het scharnier van het hele model         |
| `settlements` + `_lines` | wat één docent een ander over één maand verschuldigd is |
| `invoices`               | de verstuurde factuur, onwijzigbaar                     |
| `teacher_subscriptions`  | het abonnement dat een docent bij YogaCompany afneemt   |

### Drie regels die het ontwerp dragen

**De verrekenwaarde wordt bevroren op de afboeking.** Zou de maandstaat het
bedrag uit `pass_products` lezen, dan is een prijs aanpassen hetzelfde als de
boekhouding van vorige maand herschrijven. `pass_usages.verrekenwaarde_centen`
is daarom een kopie, gemaakt op het moment van afboeken.

**De verrekenwaarde is exclusief btw.** De klant betaalt inclusief 9% — het
tarief voor yogalessen — en die btw draagt de uitgever af. Bij een
10-strippenkaart van € 145 blijft er € 13,30 per les over, en dat is wat de
collega factureert. Zou hij € 14,50 factureren, dan betaalt de uitgever meer
terug dan hij overhield.

**Een kaart geldt bij precies één studio.** Afgedwongen in `boek_les`, niet
alleen in de interface. Dat is de regel die voorkomt dat iemand met een kaart
van Rinske een privéles boekt.

### Wie ziet wat

- Een docent ziet de kaarten die **hij** heeft uitgegeven en élke afboeking
  daarop, ook die bij een collega plaatsvond — daar factureert hij op.
- Een docent ziet afboekingen waarbij **hij** de les gaf, ook op andermans
  kaart. Anders weet hij niet wat hij mag factureren.
- Een docent ziet de deelnemerslijst van zijn **eigen** lessen.
- Een docent ziet **nooit** de kaarten, klanten of maandstaten van een collega
  waar hij zelf niet in zit.

Namen van collega's en klanten komen niet uit `profiles` — die tabel geeft
alleen de eigen rij vrij, en dat hoort zo te blijven. Er zijn drie smalle
doorkijkjes die uitsluitend een naam teruggeven: `collega_namen()`,
`klant_namen()` en `zoek_klant_op_email()`. Die laatste geeft nooit een lijst:
een docent kan het klantenbestand van de studio dus niet doorbladeren.

### Een maand afsluiten

`sluit_maand_af(periode)` wordt aangeroepen door de docent die factureert. Voor
elke collega van wie hij dat tijdvak kaarten heeft afgeboekt ontstaat één
maandstaat en één factuur. Het factuurnummer komt uit `teacher_billing` onder
een vergrendeling: de reeks moet doorlopen zonder gaten, ook wanneer twee
docenten tegelijk op de knop drukken.

Een maand die nog loopt kan niet worden afgesloten — er kunnen nog lessen bij
komen. Tweemaal afsluiten levert geen tweede factuur op.

### Schermen

| Pad                  | Voor wie                                           |
| -------------------- | -------------------------------------------------- |
| `/voor-yogadocenten` | openbaar; uitleg plus de knop in de balk           |
| `/docenten`          | docenten; de vier getallen, afboekingen, facturen  |
| `/portaal/kaarten`   | klanten; saldo, geldigheid, en waar de kaart geldt |

### Wat er nog niet is

- Geen tweede studio en geen marktplaats voor ruimteverhuur.
- Geen Mollie-koppeling voor kaarten. Een kaart ontstaat doordat de docent hem
  vastlegt in de portal, nadat er bij hem is betaald.
- Geen pdf van de factuur; de gegevens staan wel volledig in `invoices`.
- Geen creditfacturen. Een correctie na afsluiten is nu nog handwerk.
- Het maandplafond op abonnementen blokkeert niet: boven het plafond gaat de
  les door en betaalt de uitgever ook. Het is een signaal, geen deur.
