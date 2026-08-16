# Huisstijl

Palet **Helder water**, vastgesteld op 14 augustus 2026. Vervangt het
nachtgroen waarmee het platform begon.

---

## De kleuren

| Token                 | Waarde    | Waarvoor                                        |
| --------------------- | --------- | ----------------------------------------------- |
| `--color-green`       | `#1F5551` | Zeegroen, primair — knoppen, koppen, paginavoet |
| `--color-green-dark`  | `#163F3C` | Hover en diepere koppen                         |
| `--color-sage`        | `#A0CBC4` | Salie — tekst op groen, rustige vlakken         |
| `--color-sand`        | `#E6D9C0` | Zand — warme accentvlakken                      |
| `--color-sand-light`  | `#F1E9D9` | Zand licht                                      |
| `--color-paper`       | `#F6FAF9` | Paginaachtergrond                               |
| `--color-cream`       | `#EAF3F1` | Off-white: tintvlakken en tekst op groen        |
| `--color-ink`         | `#14332F` | Bodytekst                                       |
| `--color-muted`       | `#566E6A` | Bijschriften                                    |
| `--color-line`        | `#D3E2DF` | Decoratieve lijnen en kaders                    |
| `--color-line-strong` | `#748C88` | Randen van formuliervelden                      |

Ze staan in `src/app/globals.css`. De hele applicatie gebruikt die tokens, dus
een kleurwijziging is één plek.

## Contrast

Alle combinaties die daadwerkelijk in de applicatie voorkomen, nagerekend
tegen WCAG AA (4,5:1 voor tekst, 3:1 voor bedienbare elementen):

| Combinatie              | Ratio   | Eis   |
| ----------------------- | ------- | ----- |
| Bodytekst op de pagina  | 12,93:1 | 4,5:1 |
| Bijschrift op de pagina | 5,21:1  | 4,5:1 |
| Bodytekst op een kaart  | 13,60:1 | 4,5:1 |
| Bijschrift op een kaart | 5,48:1  | 4,5:1 |
| Tekst op de knop        | 7,51:1  | 4,5:1 |
| Tekst in de paginavoet  | 4,78:1  | 4,5:1 |
| Kop op een zandvlak     | 9,61:1  | 4,5:1 |
| Rand van een invoerveld | 3,59:1  | 3:1   |

De twee krapste zijn de paginavoet en de rand van een invoerveld. Wie `--color-sage`
lichter of `--color-line-strong` zachter maakt, moet opnieuw narekenen.

> Bij het ontwerpen haalde salie in eerste instantie 4,28:1 in de paginavoet —
> net te weinig. Vandaar `#A0CBC4` en niet de donkerdere tint waarmee het begon.

## Het logo

Het aangeleverde logo is getekend in nachtgroen (`#2F4239`) met salie
(`#A9BCA1`). `scripts/brand-assets.mjs` zet die bronkleuren om naar de
merkkleuren en snijdt daar alle varianten uit:

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
