# Aannames

Zoals §11.1 van `YogaCompany-claude-code-prompt.md` vraagt: elke keuze die is
gemaakt waar het document niet eenduidig was, of waar het document botst met de
bestaande repo of met zichzelf. Elke aanname is los terug te draaien.

---

## A1 — Next.js blijft, in plaats van Vite + React 18

**Document:** §3 schrijft Vite + React 18 + React Router + TanStack Query voor.
**Werkelijkheid:** de repo draait op Next.js 15 met React 19; fase 0 t/m 7 zijn
af.
**Besloten op 13 augustus 2026, door de opdrachtgever:** Next.js behouden en de
bestaande applicatie aanpassen aan het nieuwe document.
**Waarom:** herbouwen kost weken en levert een publieke site zonder
server-rendering op — slechter vindbaar, en in strijd met de Lighthouse-eis van
≥ 90 die §4.7 zelf stelt. Alle overige stackkeuzes uit §3 (Supabase, RLS,
Tailwind, zod, Vercel, Resend, Vimeo) blijven ongewijzigd van kracht.
Zie `docs/verschilanalyse-bouwprompt.md`.

## A2 — Mollie vervangt Stripe

**Besloten op 13 augustus 2026, door de opdrachtgever:** overstappen naar
Mollie conform §3 en §7.6. **Uitgevoerd.** Stripe is volledig verwijderd. Zie
`docs/payments.md`.

Twee keuzes daarbinnen:

- **Geen SDK.** De client is handgeschreven op de REST-API van Mollie. We
  gebruiken drie eindpunten; dat weegt niet op tegen een extra afhankelijkheid
  (§11.4). De API-versie zit in de URL, dus hij kan niet onder ons vandaan
  veranderen.
- **De betaalvlag volgt uit de sleutel.** §4.6 wil feature-flags in een
  `settings`-tabel. Voor betalen levert dat een tweede knop op die je óók goed
  moet zetten, naast de sleutel die je toch al moet plakken. `MOLLIE_API_KEY`
  aanwezig = betalen aan, met `PAYMENTS_ENABLED=false` als noodrem. Eén
  handeling om te koppelen, en de test-/live-modus is af te lezen aan het
  voorvoegsel van de sleutel — dus niet verkeerd in te stellen.

## A3 — CSS-tokens houden Engelse namen

**Document:** §2 noemt de variabelen `--groen`, `--salie`, `--zand`, `--paper`,
`--inkt`, `--grijs`.
**Gekozen:** de **waarden** uit §2 zijn overgenomen, de **namen** blijven Engels
(`--color-green`, `--color-sage`, `--color-sand`, `--color-paper`,
`--color-ink`, `--color-muted`).
**Waarom:** deze tokens zijn Tailwind-themanamen. Ze bepalen de klassen die door
de hele applicatie staan — `bg-green`, `text-muted`, `border-line`, ruim 700
keer. Hernoemen levert `bg-groen` en een omvangrijke, puur cosmetische
verbouwing zonder functionele winst. §11.6 zegt: kies wat eenvoudig te beheren
is. De styleguide op `/dev/styleguide` toont welke naam bij welke kleur hoort.

## A4 — `--grijs` is verdiept van #6E7A70 naar #667268

**Botsing binnen het document:** §2 noemt `--grijs: #6E7A70` voor subtekst én
eist "WCAG AA minimaal". Op de voorgeschreven achtergrond `--paper` (#F9F7F1)
haalt #6E7A70 een contrast van **4,22:1**; AA vraagt 4,5:1 voor gewone tekst.
**Gekozen:** dezelfde tint, iets verdiept naar **#667268** — contrast **4,73:1**,
ruim binnen AA. Het verschil is met het blote oog nauwelijks te zien.
**Terug te draaien in:** `src/app/globals.css`, token `--color-muted`.

## A5 — Extra tinten die het document niet noemt

§2 geeft zes kleuren; een applicatie met formulieren, tabellen en meldingen
heeft er meer nodig. Toegevoegd, afgeleid van de merkkleuren:

| Token                 | Waarde    | Waarvoor                                       |
| --------------------- | --------- | ---------------------------------------------- |
| `--color-green-dark`  | `#23322B` | hover op groene knoppen, diepere koppen        |
| `--color-cream`       | `#F2EEE4` | warme off-white: tintvlakken en tekst op groen |
| `--color-line`        | `#D8D3C4` | decoratieve lijnen en kaders                   |
| `--color-line-strong` | `#7C8579` | randen van formuliervelden                     |
| `--color-error`       | `#9C3D2E` | foutmeldingen                                  |
| `--color-success`     | `#3E6B4F` | bevestigingen                                  |

`--color-line-strong` bestaat omdat WCAG 1.4.11 voor bedienbare elementen
3:1 vraagt. De decoratieve lijnkleur haalt dat niet en hoeft dat ook niet; de
rand van een invoerveld wel (3,60:1).

`--color-background` blijft wit en betekent nu "vlak" — kaarten en panelen. De
paginaachtergrond is `--color-paper`, conform §2.

## A6 — Fonts via `next/font`, niet via `@fontsource`

**Document:** §2 vraagt "via `@fontsource` of self-hosted — geen Google
Fonts-CDN (AVG)".
**Gekozen:** `next/font/google`. Dat is ondanks de naam géén CDN-koppeling: de
fontbestanden worden tijdens de build opgehaald en vanaf ons eigen domein
geserveerd. Er gaat geen enkel bezoekersverzoek naar Google, dus aan de
AVG-eis is voldaan — zonder twee extra dependencies (§11.4).

## A7 — Mappen- en pakketnaam blijven `yoga-companie`

Het document noemt de repo `yoga-company` (zo heet hij op GitHub ook). Lokaal
heet de map `yoga-companie` en dat is ook de `name` in `package.json`. Beide
gelaten zoals ze zijn: hernoemen raakt paden, remotes en de Vercel-koppeling,
zonder dat iemand er iets van merkt. De **merknaam** in alle zichtbare teksten
is wél overal `YogaCompany`.

## A8 — `BOUWPROMPT.md` blijft ongewijzigd

Het oude specificatiedocument is niet bijgewerkt en niet verwijderd; het legt
vast waarom de code is zoals hij is. Leidend is vanaf nu
`docs/YogaCompany-claude-code-prompt.md`. Waar `PROGRESS.md` en de code naar
§-nummers verwijzen, gaat het nog om het oude document.

## A9 — De bundelkorting wordt berekend, niet ingetypt

§7.1 vraagt "€ 2.795, _bespaar € 385_". Dat bedrag staat nergens als tekst: het
wordt op de overzichtspagina afgeleid uit de prijzen in de database (vier losse
modules min de bundelprijs). Wijzigt de beheerder later een prijs in de admin,
dan klopt het getoonde voordeel meteen mee in plaats van stilletjes te gaan
liegen. Het voordeel wordt alleen getoond als élke module ook los te koop is.

## A10 — Het rooster heet `class_sessions`, niet `lessons`

§6 noemt de tabel voor het lesrooster `lessons`. Die naam is al bezet: in de
bestaande database is `lessons` het lesmateriaal bínnen een opleiding. Twee
totaal verschillende dingen die in het Nederlands allebei "les" heten.
Hernoemen van de bestaande tabel zou het hele lesmateriaal, de voortgang en de
contentspeler raken; het rooster heet daarom `class_sessions`. Op het scherm
staat gewoon "les". Zie `docs/lessen-en-boekingen.md`.

## A11 — Boeken en annuleren lopen via databasefuncties

§6 beschrijft `bookings` als een gewone tabel. Boeken is echter tellen en dan
schrijven; twee mensen tegelijk zetten er anders dertien in een les van twaalf.
`boek_les()` vergrendelt daarom eerst de lesregel. Klanten hebben bewust geen
insert- of update-recht op `bookings` — alleen leesrecht op hun eigen rijen.

## A12 — De annuleertermijn is vier uur

§7.3 zegt "annuleren binnen de regels" maar noemt geen termijn. Gekozen: tot
vier uur voor aanvang. Daarna is de plek al ingepland en kan een wachtlijster
niet meer fatsoenlijk worden opgeroepen. Aan te passen in
`annuleer_boeking` (`supabase/migrations/20260813130000_…`) en in
`ANNULEERTERMIJN_UREN` in de servicelaag.

## A13 — Het Supabase-project staat in Ierland, niet in Frankfurt

Er is een bestaand, leeg project hergebruikt in plaats van een nieuw project
aangemaakt: de organisatie zit op twee projecten en een derde kost $10 per
maand. Dat project staat in `eu-west-1` (Ierland). Beide regio's liggen in de
EU, dus §3 en `docs/avg.md` kloppen; de regio van een bestaand project is niet
te wijzigen. Zie `docs/supabase-project.md`.

## A14 — Bestellingen naast inschrijvingen

§6 vraagt om `orders` en `order_items`; die bestonden nog niet, de
betaalreferentie hing aan `enrollments`. Dat werkt zolang één betaling precies
één inschrijving is, maar §7.6 vraagt straks ook om een lesabonnement
(maandelijkse incasso, géén inschrijving) en om betalen in termijnen (drie
betalingen, één inschrijving). Beide passen niet op een inschrijving.

De inschrijving blijft het toegangsrecht op het lesmateriaal, de bestelling is
de financiële kant. Ze leven apart omdat een bestelling na een
AVG-verwijdering moet blijven staan terwijl het profiel wordt geanonimiseerd.

## A15 — De webhook van Mollie controleert geen handtekening

Niet uit nalatigheid: Mollie ondertekent zijn webhooks niet en stuurt alleen
een betaal-id. De status wordt daarom opgehaald bij Mollie zelf, met onze
geheime sleutel. Wie het webhookadres kent kan hooguit een verwerking uitlokken
van een betaling die toch al bestaat; een status verzinnen kan niet. Uitgelegd
in `docs/payments.md` §3.
