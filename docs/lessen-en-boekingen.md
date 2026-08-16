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

De annuleertermijn staat als constante in `annuleer_boeking` én in
`ANNULEERTERMIJN_UREN` in de servicelaag — die tweede alleen om de knop
vooraf uit te schakelen. De database heeft het laatste woord.

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
