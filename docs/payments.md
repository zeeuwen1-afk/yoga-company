# Betalingen met Mollie

Alles is gebouwd en getest. Er is nog **geen Mollie-account**; zodra dat er is,
kost aanzetten één handeling. Deze pagina beschrijft die handeling, hoe het
werkt, en hoe je het in testmodus uitprobeert.

---

## 1. Aanzetten als je een account hebt

Eén omgevingsvariabele. Meer niet.

```
MOLLIE_API_KEY=test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Lokaal zet je hem in `.env.local`; op Vercel onder **Settings →
Environment Variables**, waarna je opnieuw deployt.

Test- of live-modus volgt uit de sleutel zelf: Mollie geeft ze uit met het
voorvoegsel `test_` of `live_`. Er valt dus niets verkeerd in te stellen. In het
beheer onder **Instellingen → Koppelingen** staat welke van de twee actief is.

Wil je de sleutel er wél in hebben maar betalen nog dicht houden, zet er dan
`PAYMENTS_ENABLED=false` bij. Elke andere waarde (of helemaal weglaten) laat
betalen aan.

### De webhook aanmelden

In het Mollie-dashboard hoef je niets in te stellen: het webhookadres gaat mee
met elke betaling die we aanmaken. Wat wél moet kloppen is
`NEXT_PUBLIC_SITE_URL` — daar wordt het adres uit opgebouwd:

```
https://<jouw-domein>/api/v1/webhooks/mollie
```

Draai je lokaal, dan kan Mollie `localhost` niet bereiken. Gebruik dan een
tunnel (`ngrok http 3000`) en zet dat adres tijdelijk in `NEXT_PUBLIC_SITE_URL`.

## 2. Wat er gebeurt zolang er géén sleutel is

De site blijft gewoon werken. Een klant die op **Inschrijven** klikt:

1. krijgt een inschrijving met status `in_afwachting`;
2. levert een **aanvraag** op in het beheer, bij Aanvragen;
3. krijgt een bevestigingsmail dat je binnen twee werkdagen contact opneemt.

Dat is precies wat §7.1 van de bouwprompt voorschrijft. De knop heet in die
stand "Aanmelden" in plaats van "Doorgaan naar betalen", en eronder staat dat
er nog niets betaald is.

## 3. Hoe de betaalflow werkt

```
klant klikt Inschrijven
   ↓
bestelling aangemaakt (status concept)          orders + order_items
   ↓
betaling aangemaakt bij Mollie                  metadata: order_id
   ↓
bestelling op open, betaal-id vastgelegd
   ↓
klant betaalt op de pagina van Mollie
   ↓
Mollie roept onze webhook aan met alleen: id=tr_xxx
   ↓
wij halen de betaling op bij Mollie             ← hier komt de waarheid vandaan
   ↓
status paid?  → bestelling op paid, inschrijving op betaald, bevestigingsmail
status failed/expired/canceled? → bestelling op canceled
terugbetaald? → bestelling op refunded, toegang ingetrokken
```

### Waarom de webhook geen handtekening controleert

Dit is het grootste verschil met Stripe, en het is opzet.

Stripe stuurt de hele gebeurtenis mee en ondertekent die; je controleert de
handtekening en gelooft daarna de inhoud. **Mollie stuurt alleen `id=tr_xxx`
en ondertekent niets.** Er ís geen handtekening om te controleren.

De beveiliging zit daarom ergens anders: we nemen niets aan van het verzoek,
maar halen de betaling zélf op bij Mollie met onze geheime sleutel. Wie ons
webhookadres kent kan hooguit een verwerking uitlokken van een betaling die
toch al bestaat en toch al die status heeft. Een status verzinnen kan niet.

Dat is geen zwakkere variant van een handtekeningcontrole maar een sterkere:
de status komt rechtstreeks van de bron in plaats van uit een bericht.

### Idempotentie

Mollie levert dezelfde webhook meer dan eens af, en probeert het opnieuw bij
een storing. Elke bewerking is daarom voorwaardelijk:

- `neq('status', 'paid')` — een tweede melding raakt geen rij en overschrijft
  dus geen betaaldatum
- de unieke index op `orders.mollie_payment_id` maakt twee bestellingen voor
  één betaling onmogelijk
- een late `expired` na een geslaagde betaling laat een betaalde bestelling met
  rust (`in ('concept','open')`)

Bij een fout geven we bewust **500** terug, zodat Mollie het opnieuw aanbiedt.

## 4. Testen in testmodus

Met een `test_`-sleutel rekent Mollie niets af en kies je zelf de uitkomst.

| Scenario            | Hoe                                            | Wat je moet zien                                                                                |
| ------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Geslaagde betaling  | Kies **Paid** op de testpagina                 | Bestelling `paid`, inschrijving `betaald`, bevestigingsmail, opleiding zichtbaar in het portaal |
| Mislukte betaling   | Kies **Failed**                                | Bestelling `canceled`, inschrijving blijft `in_afwachting`, geen toegang                        |
| Afgebroken betaling | Kies **Canceled**                              | Zelfde als mislukt; de klant komt terug op de inschrijfpagina                                   |
| Verlopen betaling   | Kies **Expired**                               | Zelfde als mislukt                                                                              |
| Dubbele webhook     | Roep de webhook twee keer aan met hetzelfde id | De tweede keer verandert er niets; `paid_at` blijft gelijk                                      |
| Terugbetaling       | Terugbetalen in het Mollie-dashboard           | Bestelling `refunded`, inschrijving `geannuleerd`, regel in het logboek                         |

De webhook handmatig nabootsen:

```bash
curl -X POST https://<jouw-domein>/api/v1/webhooks/mollie \
  -d "id=tr_xxxxxxxxxxxx"
```

Meer meesturen heeft geen zin — er wordt niets van overgenomen.

## 5. Wat wij bewaren

Alleen het betaal-id, het bedrag, de valuta en de status. **Kaart- en
rekeninggegevens komen nooit bij ons binnen**: de klant betaalt op de pagina
van Mollie. Zie ook `docs/avg.md`.

Bestellingen blijven na een AVG-verwijdering staan — de fiscus vraagt zeven
jaar bewaring — maar losgekoppeld van de persoon: de omschrijving wordt
vervangen door "Verwijderde klant", het bedrag en de datum blijven.

## 6. Consumentenrecht

Nog te doen vóór livegang, uit §7.6:

- **14 dagen bedenktijd** bij een aankoop op afstand.
- Bij directe toegang tot digitale content: de klant moet uitdrukkelijk
  afstand doen van het herroepingsrecht, en dat moet in het bestelproces
  worden vastgelegd. Nu is er nog geen opleiding met `has_digital_content`
  die online te koop is, dus dit is nog niet aan de orde — maar het moet er
  zijn vóórdat Eerst Jij online verkocht wordt.

## 7. Nog niet gebouwd

- **Abonnementen** (lesabonnement, §7.6): Mollie Recurring met een mandaat.
  Het datamodel is er klaar voor — `orders` draagt de betaling, niet de
  inschrijving — maar de eerste betaling met mandaat en de maandelijkse
  incasso moeten nog.
- **Termijnbetaling** (Eerst Jij Begeleid, 3 × € 279): drie bestellingen aan
  één inschrijving. De betaallink in het beheer doet nu al een losse betaling;
  het automatisch plannen van de tweede en derde termijn nog niet.
- **Kortingscodes**: niet in v1, zo staat het in §7.6. De bundelkorting zit in
  de prijs van het product zelf.

## 8. Waar het staat

| Bestand                                                   | Wat                                                                    |
| --------------------------------------------------------- | ---------------------------------------------------------------------- |
| `src/lib/mollie.ts`                                       | De client op de REST-API, plus `betalenIngericht()` en `betaalModus()` |
| `src/features/payments/server/bestelling.ts`              | Bestelling aanmaken en betaling starten                                |
| `src/features/payments/server/webhook.ts`                 | Statusverwerking, idempotent                                           |
| `src/app/api/v1/webhooks/mollie/route.ts`                 | Het webhookadres                                                       |
| `src/features/enrollments/server/inschrijven.ts`          | De twee wegen: betalen of aanvragen                                    |
| `supabase/migrations/20260813140000_mollie_en_orders.sql` | `orders`, `order_items`, RLS                                           |

Er is bewust **geen** `@mollie/api-client` toegevoegd: we gebruiken drie
eindpunten, en dat weegt niet op tegen een afhankelijkheid met een eigen
upgradepad (§11.4). De API-versie zit in de URL, dus hij kan niet onder ons
vandaan veranderen.

## 9. Tests

- `src/lib/mollie.test.ts` — bedragen heen en weer, en de koppelingsstatus.
- `src/features/payments/server/webhook.test.ts` — dat de status van Mollie
  komt en niet uit het verzoek, dat twee keer verwerken één keer is, en dat een
  late mislukking een betaalde bestelling niet omgooit.
- `supabase/tests/rls/13_bestellingen.sql` — klantscheiding, en dat een klant
  het bedrag of de status van een bestelling niet kan aanraken.
- `e2e/betalen.spec.ts` — dat de webhook niets aanneemt van wie hem aanroept.
