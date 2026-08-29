# Huisstijl

Palet **Petrol en abrikoos**, vastgesteld op 29 augustus 2026. Vervangt
"Helder water", dat op zijn beurt het nachtgroen verving.

De vier merkkleuren komen uit het aangeleverde beeld en zijn daar pixel voor
pixel uit gelezen, niet op gevoel nagebouwd: petrol beslaat 86,9% van dat
beeld. De overige zes tinten zijn eruit afgeleid en nagerekend.

---

## De omkering

Dit palet draait de site om. Waar hij eerst licht was met donkere accenten, is
hij nu **donker met lichte accenten**. Dat is geen kwestie van andere waarden:
`text-muted` hoort op petrol een lichte tint te zijn en op een crèmevlak een
donkere — dezelfde klasse, twee betekenissen.

Daarom staan de semantische tokens in `globals.css` ingesteld op de **donkere**
ondergrond, en zetten twee regels ze per context terug:

| Regel           | Waar                                                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------------------------------------ |
| lichte eilanden | `.bg-cream`, `.bg-sand-light`, `.bg-sand`, `.bg-white` en `.op-licht` zetten de tokens terug naar hun lichte tegenhanger |
| `.op-donker`    | het omgekeerde: een donkere balk binnen een licht eiland, zoals de kop van de werkschermen                               |

Daardoor blijft elke bestaande `text-muted`, `border-line` en `text-green` in
de applicatie kloppen zonder dat er per plek een tweede klasse bij moet.

> **Let op bij doorzichtigheid.** Een klasse als `bg-cream/60` valt buiten die
> regel — de selector is dan `.bg-cream\/60` en niet `.bg-cream`. Gebruik op een
> donkere ondergrond `bg-hover` voor nadruk, of zet er `op-licht` bij.

## De publieke site is donker, de werkschermen zijn licht

De publieke pagina's dragen petrol. Beheer, portaal, docentenportal en de
inlogschermen houden een **licht werkvlak in een petrol kader**: de balk en de
zijkolom staan in petrol, het werk zelf op warm wit. Een maandstaat of een
klantendossier leest op een donkere ondergrond zwaarder, en dat zijn schermen
waar iemand een uur achter elkaar in zit.

Wil je ze alsnog volledig donker, dan is dat één wijziging: haal `bg-cream` van
de buitenste `div` van die layouts af.

---

## De kleuren

| Token                  | Waarde    | Waarvoor                                                  |
| ---------------------- | --------- | --------------------------------------------------------- |
| `--color-petrol`       | `#1F4D58` | **uit het beeld** — de hoofdachtergrond                   |
| `--color-paper-warm`   | `#FCFAF6` | **uit het beeld** — tekst op donker, en de lichte vlakken |
| `--color-sand`         | `#DECCAA` | **uit het beeld** — merkteken, banner, koppen op donker   |
| `--color-accent`       | `#EA976E` | **uit het beeld** — abrikoos: knoppen en nadruk           |
| `--color-petrol-deep`  | `#133B45` | voettekst en de waas over de herofoto                     |
| `--color-petrol-card`  | `#275965` | kaarten en panelen op een petrol vlak                     |
| `--color-petrol-line`  | `#3D7683` | decoratieve lijn op donker                                |
| `--color-accent-light` | `#F0A87F` | kleine tekst en links op donker                           |
| `--color-accent-deep`  | `#9E4E2B` | links en tekst op een licht eiland                        |
| `--color-sand-light`   | `#F3EBDC` | rustige lichte sectie                                     |
| `--color-ink-dark`     | `#16323A` | bodytekst op licht                                        |
| `--color-muted-dark`   | `#4E6970` | bijschrift op licht                                       |
| `--color-muted`        | `#B4C7CC` | bijschrift op petrol                                      |
| `--color-line-strong`  | `#8FA9AE` | randen van invoervelden op donker                         |
| `--color-hover`        | `#2F6674` | het vlak dat oplicht — op licht wordt dit zand licht      |

Ze staan in `src/app/globals.css`. De hele applicatie gebruikt die tokens, dus
een kleurwijziging is één plek.

## Contrast

Alle combinaties die daadwerkelijk in de applicatie voorkomen, nagerekend
tegen WCAG AA (4,5:1 voor tekst, 3:1 voor bedienbare elementen):

| Combinatie                          | Ratio   | Eis   |
| ----------------------------------- | ------- | ----- |
| Bodytekst — warm wit op petrol      | 8,91:1  | 4,5:1 |
| Bijschrift — zacht wit op petrol    | 5,30:1  | 4,5:1 |
| Kop — zand op petrol                | 5,89:1  | 4,5:1 |
| Label — abrikoos licht op petrol    | 4,69:1  | 4,5:1 |
| Knoptekst — diep petrol op abrikoos | 6,10:1  | 4,5:1 |
| Bodytekst — inkt op warm wit        | 12,98:1 | 4,5:1 |
| Bijschrift — gedempt op warm wit    | 5,63:1  | 4,5:1 |
| Link — abrikoos diep op warm wit    | 5,63:1  | 4,5:1 |
| Tekst op een zandvlak               | 8,59:1  | 4,5:1 |
| Rand van een invoerveld op petrol   | 3,74:1  | 3:1   |

De twee krapste zijn het label in abrikoos licht (4,69) en de rand van een
invoerveld (3,74). Wie daar iets aan verschuift, moet opnieuw narekenen.

> **Abrikoos `#EA976E` op warm wit haalt maar 2,20:1.** Als kleine tekst op een
> licht vlak is die kleur onbruikbaar; daar hoort `--color-accent-deep`. Op
> abrikoos als vlak, met diep petrol erop, is hij ruim in orde. Dat is precies
> waarom er twee varianten van abrikoos bestaan.

## Het logo

Het aangeleverde logo is getekend in nachtgroen (`#2F4239`) met salie
(`#A9BCA1`). `scripts/brand-assets.mjs` zet die bronkleuren om naar de
merkkleuren — nu petrol met zand — en snijdt daar alle varianten uit:

```
public/brand/logo-gestapeld.png          het volledige logo
public/brand/logo-horizontaal.png        merkteken + woordmerk + ondertitel
public/brand/logo-compact.png            merkteken + woordmerk (header)
public/brand/*-donker.png                lichte varianten voor het nachtgroen
public/brand/icoon.png                   het merkteken los
src/app/icon.png, apple-icon.png         favicons
```

Wijzigt de huisstijl opnieuw, pas dan `MERK_GROEN`, `MERK_SALIE` en
`MERK_ONDERTITEL` bovenin dat script aan en draai `pnpm brand:assets`. De
bron-PDF blijft ongemoeid.

De balk is sinds dit palet petrol, dus in de header staat de **lichte**
variant (`logo-compact-donker.png`); de donkere varianten zijn voor lichte
ondergronden.

**In de header staat de compacte variant**, zonder ondertitel: in een balk van
veertig pixels hoog zou "OPLEIDINGEN · TRAININGEN · LESSEN" op ongeveer vier
pixels uitkomen. Onleesbaar klein is erger dan weglaten. De volledige variant
staat in de paginavoet.

## Typografie

Koppen in **Cormorant Garamond** (600), tekst en UI in **Jost** (300/400/600).
Via `next/font`, dat de bestanden bij het bouwen ophaalt en vanaf ons eigen
domein serveert — er gaat dus geen bezoekersverzoek naar Google.

---

# Beeld

Vier foto's op de hele site. Bewust weinig: ze horen een pagina te openen, niet
te overstemmen.

| Waar                             | Bestand                | Blok in de site-editor           |
| -------------------------------- | ---------------------- | -------------------------------- |
| Startpagina, naast de hero       | `hero-vloer.jpg`       | Startpagina → Foto naast de hero |
| Opleidingen, boven het overzicht | `opleidingen-zaal.jpg` | Opleidingen → Sfeerbeeld         |
| Lessen, boven het rooster        | `lessen-studio.jpg`    | Lessen → Sfeerbeeld              |
| Trainingen, boven het overzicht  | `trainingen-blad.jpg`  | Trainingen → Sfeerbeeld          |

Ze staan als CMS-blok in de site-editor, dus ze zijn te vervangen zonder mij en
zonder uitrol.

## Geen mensen, en geen portret op Over ons

Geposeerde yogamodellen zijn direct herkenbaar als stock en beloven een studio
die er niet zo uitziet. Deze vier tonen ruimte en materiaal: zonlicht op een
houten vloer, een zaal met matten en blokken klaargelegd, een stille hoek, en
bladschaduw. Warm en tastbaar, zonder gezichten die niet van jullie zijn.

De zaal op **Opleidingen** is bewust wél een yogazaal: die pagina verkoopt de
opleiding, en dan helpt het als je ziet waar je terechtkomt. De andere drie
blijven abstracter, zodat ze niet met elkaar concurreren.

Op **Over ons** staat bewust geen foto. Die pagina moet persoonlijk zijn en een
gekochte portretfoto werkt daar averechts.

## Herkomst en licentie

Alle vier van [Unsplash](https://unsplash.com), onder de Unsplash-licentie:
vrij te gebruiken, ook commercieel, zonder naamsvermelding. Beelden onder
Unsplash+ zijn bewust niet gebruikt — die vragen een betaald abonnement.

| Bestand                | Fotograaf        | Bron                                    |
| ---------------------- | ---------------- | --------------------------------------- |
| `hero-vloer.jpg`       | Leyla M          | https://unsplash.com/photos/PIeJKS6-h0E |
| `opleidingen-zaal.jpg` | Olga Pukhalskaya | https://unsplash.com/photos/dwka5DDrnY0 |
| `lessen-studio.jpg`    | Daniel Chen      | https://unsplash.com/photos/SoNaNOFT974 |
| `trainingen-blad.jpg`  | Milad Fakurian   | https://unsplash.com/photos/UqP7U400AZs |

De fotograaf staat erbij omdat dat hoort, ook al hoeft het niet.

## Waarom ze in de repo staan

Een beeld dat je vanaf een externe server laadt, betekent dat de browser van je
bezoeker contact maakt met die partij — inclusief IP-adres. Dat is precies wat
§3 en `docs/avg.md` willen voorkomen. Daarom staan ze in `public/beeld/` en
worden ze vanaf ons eigen domein geserveerd. Unsplash snijdt en verkleint bij
het ophalen, dus er komt nooit een bestand van tien megabyte binnen.

Opnieuw ophalen: `pnpm beeld:ophalen`.

## Tijdelijk

Deze vier zijn een tussenoplossing tot er eigen beeld is. Zodra er foto's van
de eigen studio zijn, gaan ze er één voor één uit — via de site-editor, dus dat
kan zonder ontwikkelaar.
