/**
 * De 200-uurs Yogaopleiding: de overzichtspagina en de vier modulepagina's.
 *
 * De teksten hieronder zijn letterlijk overgenomen uit de aangeleverde
 * websiteteksten. Kort er niets in en herschrijf niets bij het bijwerken: dit is
 * de startinhoud die in `content_blocks` terechtkomt, en vanaf dat moment is de
 * site-editor de baas. Wat hier staat is dus de tekst waarmee een lege database
 * begint, niet noodzakelijk wat er op de site staat.
 *
 * Drie dingen die met opzet zo zijn:
 *
 * 1. **De blokken uit deel 3 staan hier één keer.** Prijzen, praktische
 *    informatie, de inschrijfstappen en de disclaimer komen op alle vijf de
 *    pagina's terug. Vijf kopieën zouden betekenen dat een prijswijziging op
 *    vijf plekken moet, en dat gaat een keer mis.
 * 2. **De lange stukken zijn richtext, geen losse veldjes.** Anders wordt het
 *    bewerkscherm honderd invoervelden diep en raakt niemand er wijs uit.
 * 3. **Module 3 en 4 zijn dezelfde modules als niveau 1 en 2 van de Yin Yoga
 *    Specialist Opleiding.** Ze worden hier beschreven vanuit de 200-uurs
 *    route, maar het is één product; zie `aanbod.ts`.
 */

export type Modulekaart = {
  nummer: string;
  titel: string;
  uren: string;
  tekst: string;
  knop: string;
  href: string;
};

export type Prijsregel = {
  variant: string;
  inhoud: string;
  prijs: string;
};

// -----------------------------------------------------------------------------
// Deel 1 — de overzichtspagina
// -----------------------------------------------------------------------------

export const OPLEIDING_TITEL = "200-uurs Yogaopleiding";

export const OPLEIDING_ZIN =
  "Eén opleiding, twee kanten van yoga: kracht én stilte.";

export const OPLEIDING_HERO =
  "Word yogadocent met een basis die verder gaat dan de flow. In deze opleiding leer je van het begin af aan zowel de dynamische kant van yoga — Hatha en Vinyasa — als de stille kant: Yin Yoga, het zenuwstelsel en de kunst van vertragen.";

export const OPLEIDING_KERNWOORDEN =
  "Bewegen. Begrijpen. Vertragen. Reguleren.";

export const OPLEIDING_OVER_TITEL = "Over de opleiding";

export const OPLEIDING_OVER = `<p>De 200-uurs Yogaopleiding van YogaCompany is een complete basisopleiding tot yogadocent. De meeste basisopleidingen behandelen alleen de actieve stijlen. Hier studeer je af als docent die een krachtige Vinyasa-flow kan geven én een verstilde Yin-les kan begeleiden. Precies de combinatie waar studio's en deelnemers steeds vaker om vragen.</p>
<p>De opleiding bestaat uit vier modules van 50 uur, opgebouwd als een doorlopende leerlijn. Iedere module is ook los te volgen en wordt afgerond met een eigen certificaat.</p>
<p><strong>Je ontwikkelt kennis en vaardigheden in:</strong></p>
<ul>
<li>Hatha Yoga en Vinyasa</li>
<li>Ademhaling en pranayama</li>
<li>Meditatie</li>
<li>Anatomie en fysiologie</li>
<li>Yogafilosofie en ethiek</li>
<li>Yin Yoga en de functionele benadering van houdingen</li>
<li>Het zenuwstelsel, stress en ontspanning</li>
<li>Basisprincipes van Chinese Geneeskunde en de meridianen</li>
<li>Sequencing, didactiek en lesgeven</li>
</ul>`;

export const OPLEIDING_MODULES_TITEL = "De vier modules";

export const OPLEIDING_MODULES: Modulekaart[] = [
  {
    nummer: "Module 1",
    titel: "Bewegen · Hatha & Vinyasa",
    uren: "50 uur",
    tekst:
      "Het actieve fundament. Je verdiept je eigen praktijk, leert houdingen en uitlijning, bouwt vloeiende sequenties en geeft je eerste les.",
    knop: "Lees meer",
    href: "/opleidingen/200-uurs-yogaopleiding/module-1-hatha-vinyasa",
  },
  {
    nummer: "Module 2",
    titel: "Begrijpen · Anatomie, Filosofie & Meditatie",
    uren: "50 uur",
    tekst:
      "De kennis onder de praktijk. Hoe het lichaam werkt, waar yoga vandaan komt en hoe je meditatie en pranayama zelf beoefent en begeleidt.",
    knop: "Lees meer",
    href: "/opleidingen/200-uurs-yogaopleiding/module-2-anatomie-filosofie-meditatie",
  },
  {
    nummer: "Module 3",
    titel: "Vertragen · Yin Yoga & het lichaam",
    uren: "50 uur",
    tekst:
      "Van doen naar voelen. De filosofie en anatomie van Yin Yoga, de belangrijkste houdingen en het geven van een eigen Yin-les.",
    knop: "Lees meer",
    href: "/opleidingen/200-uurs-yogaopleiding/module-3-yin-yoga-het-lichaam",
  },
  {
    nummer: "Module 4",
    titel: "Reguleren · Zenuwstelsel & basis meridianen",
    uren: "50 uur",
    tekst:
      "Alles komt samen. Het zenuwstelsel, stress en ontspanning, de basis van Chinese Geneeskunde en de 12 meridianen — en het praktijkexamen.",
    knop: "Lees meer",
    href: "/opleidingen/200-uurs-yogaopleiding/module-4-zenuwstelsel-meridianen",
  },
];

export const OPLEIDING_MANIEREN_TITEL = "Drie manieren om te volgen";

export const OPLEIDING_MANIEREN = `<ul>
<li><strong>Per module</strong> — iedere module van 50 uur is los te boeken en wordt afgesloten met een certificaat.</li>
<li><strong>Per blok</strong> — Blok A (module 1 + 2, de actieve basis) en Blok B (module 3 + 4, de stille verdieping) zijn elk 100 uur en los van elkaar te volgen. Een blok levert naast de twee modulecertificaten het Advanced-certificaat van 100 uur op.</li>
<li><strong>De volledige opleiding</strong> — wie alle vier de modules, het praktijkexamen en de eindopdracht afrondt, ontvangt het diploma Yogadocent 200 uur.</li>
</ul>`;

export const OPLEIDING_VOORWIE_TITEL = "Voor wie";

export const OPLEIDING_VOORWIE = `<p>Voor toegewijde beoefenaars die docent willen worden (± 1 jaar regelmatige yoga-ervaring aanbevolen) en voor yogadocenten die hun basis willen verbreden met de stille kant van yoga. Een eerdere docentenopleiding is niet nodig.</p>
<p>Twijfel je of je instapniveau past? Neem contact op — we denken graag mee.</p>`;

export const OPLEIDING_DIPLOMA_TITEL = "Diploma & certificaten";

export const OPLEIDING_DIPLOMA = `<p>Je studeert af met het diploma <strong>Yogadocent 200 uur — YogaCompany</strong>. Per afgeronde module ontvang je een certificaat met de modulenaam en het aantal uren.</p>`;

export const OPLEIDING_DOORSTROOM_TITEL =
  "Na de opleiding: doorstroom naar Yin Yoga Specialist";

export const OPLEIDING_DOORSTROOM = `<p>Met module 3 en 4 heb je de eerste helft van de Yin Yoga-leerlijn al in huis. Wie verder wil, volgt daarna de twee verdiepingsmodules — Chinese Geneeskunde, elementen &amp; orgaanklok en Yin Yoga voor herstel &amp; revalidatie — en behaalt het diploma Yin Yoga Specialist.</p>`;

export const OPLEIDING_DOORSTROOM_KNOP =
  "Meer over de Yin Yoga Specialist Opleiding";

export const OPLEIDING_DOORSTROOM_LINK =
  "/opleidingen/200-uurs-yin-yoga-specialist";

// -----------------------------------------------------------------------------
// Deel 2 — de vier modulepagina's
// -----------------------------------------------------------------------------

export type Modulepagina = {
  /** Het pad onder /opleidingen/200-uurs-yogaopleiding/. */
  segment: string;
  /** De sleutel van de CMS-pagina. */
  pageKey: string;
  titel: string;
  /** Het werkwoord dat de module draagt: Bewegen, Begrijpen, Vertragen, Reguleren. */
  woord: string;
  meta: string;
  /** Alleen bij module 3 en 4: de noot dat dit dezelfde module is. */
  identiek?: string;
  intro: string;
  watJeLeert: string;
  programma: string;
  lesdagen: string;
  naAfloop: string;
  voorWie: string;
  prijs: string;
  knop: string;
  /**
   * Het product in `aanbod.ts` dat bij deze module hoort.
   *
   * De inschrijfknop wijst naar het aanmeldformulier en niet hierheen: dat
   * vraagt een account en een betaling, en dat is een drempel op het verkeerde
   * moment. Deze koppeling blijft staan voor het moment dat betalen wél aanstaat.
   */
  product: string;
  combineer: string;
  seoTitel: string;
  seoOmschrijving: string;
};

export const MODULEPAGINAS: Modulepagina[] = [
  {
    segment: "module-1-hatha-vinyasa",
    pageKey: "yogaopleiding-module-1",
    titel: "Module 1 — Hatha & Vinyasa",
    woord: "Bewegen.",
    meta: "50 uur · Blok A · de actieve basis · los te volgen",
    intro:
      "Module 1 is het actieve fundament van de opleiding — en een complete training op zichzelf voor wie de dynamische stijlen echt wil begrijpen. Je verdiept je eigen praktijk, leert de belangrijkste houdingen en uitlijningsprincipes van Hatha Yoga, bouwt vloeiende Vinyasa-sequenties en zet je eerste stappen als docent.",
    watJeLeert: `<ul>
<li>Je beheerst de belangrijkste houdingsfamilies van Hatha Yoga en weet waarom uitlijning werkt zoals het werkt.</li>
<li>Je verbindt adem en beweging tot een logische, vloeiende flow.</li>
<li>Je bouwt een actieve les op van aankomen tot eindontspanning.</li>
<li>Je geeft instructie met een heldere stem en een veilig oog voor de groep.</li>
</ul>`,
    programma: `<ol>
<li><strong>Hatha Yoga — de houdingen.</strong> Staande houdingen en balans, zit- en liggende houdingen, voorwaartse en achterwaartse buigingen, twists en omkeringen op basisniveau. Per houdingsfamilie: uitlijning, functie, veelvoorkomende fouten, opbouw en afbouw, variaties en props.</li>
<li><strong>Vinyasa — adem en beweging.</strong> Zonnegroet A en B, overgangen en transities, ritme en tempo, en het logisch opbouwen van een flow.</li>
<li><strong>Ademhaling &amp; pranayama (basis).</strong> Adembewustzijn, ujjayi en de verhouding tussen adem en beweging: de adem als rode draad van de les.</li>
<li><strong>Sequencing van een actieve les.</strong> De lesboog — aankomen, opwarmen, opbouwen, piek, afbouwen, eindontspanning. Thema's, timing en aanpassen aan verschillende niveaus.</li>
<li><strong>Didactiek &amp; stem.</strong> Heldere instructietaal, demonstreren en spiegelen, observeren, ruimtegebruik, veiligheid en het begeleiden van verschillende lichamen in één groep.</li>
<li><strong>Practicum.</strong> Micro-teaching in kleine groepen: zelf lesgeven, feedback ontvangen en feedback geven.</li>
</ol>`,
    lesdagen: `<p>Dag 1 fundament &amp; staande houdingen · Dag 2 Hatha verdiept (balans, buigingen, twists) &amp; ujjayi · Dag 3 Vinyasa &amp; transities · Dag 4 sequencing &amp; didactiek · Dag 5 practicum &amp; afronding.</p>
<p>Avondsessies (live online): lesanalyse &amp; vragen · sequencing-clinic met feedback op je eerste lesplan.</p>`,
    naAfloop: `<p>Je beoefent Hatha en Vinyasa met begrip van uitlijning en geeft zelfstandig een eenvoudige actieve les van 60 minuten. Je ontvangt het certificaat <em>Hatha &amp; Vinyasa — 50 uur</em>.</p>`,
    voorWie:
      "Open voor iedereen met regelmatige yoga-ervaring; een vooropleiding is niet nodig. Ook geschikt voor docenten die hun actieve praktijk willen aanscherpen.",
    prijs: "€ 795",
    knop: "Schrijf je in voor module 1",
    product: "yogaopleiding-module-1-hatha-vinyasa",
    combineer: "Combineer met module 2 als Blok A (100 uur) voor € 1.495.",
    seoTitel: "Module Hatha & Vinyasa (50 uur) | YogaCompany",
    seoOmschrijving:
      "Leer de houdingen en uitlijning van Hatha, bouw vloeiende Vinyasa-sequenties en geef je eerste les. Los te volgen, met eigen certificaat. € 795.",
  },
  {
    segment: "module-2-anatomie-filosofie-meditatie",
    pageKey: "yogaopleiding-module-2",
    titel: "Module 2 — Anatomie, Filosofie & Meditatie",
    woord: "Begrijpen.",
    meta: "50 uur · Blok A · het fundament onder de praktijk · los te volgen",
    intro:
      "Module 2 legt de kennis onder de praktijk: hoe het lichaam werkt, waar yoga vandaan komt en hoe je de stille technieken — meditatie en pranayama — zelf beoefent en begeleidt. Een module voor wie yoga niet alleen wil doen, maar ook wil begrijpen.",
    watJeLeert: `<ul>
<li>Je kent de anatomie die je nodig hebt om veilig les te geven en blessures te voorkomen.</li>
<li>Je weet waar yoga vandaan komt en vertaalt de filosofie naar een toegankelijke, hedendaagse les.</li>
<li>Je begeleidt een korte meditatie en zet ademtechnieken bewust in.</li>
<li>Je kent je rol en verantwoordelijkheid als docent: integriteit, grenzen, aanraking en toestemming.</li>
</ul>`,
    programma: `<ol>
<li><strong>Anatomie &amp; fysiologie.</strong> Skelet, gewrichten en spieren · fascia en bindweefsel · bewegingsleer en biomechanica · mobiliteit en stabiliteit · ademfysiologie · toegepaste anatomie per houdingsfamilie · blessurepreventie · anatomische verschillen tussen mensen.</li>
<li><strong>Filosofie.</strong> Ontstaan en geschiedenis van yoga, Patanjali en het achtvoudige pad, de yama's en niyama's, en de vertaalslag van traditie naar de lespraktijk van nu.</li>
<li><strong>Ethiek &amp; de docent als professional.</strong> Integriteit, grenzen, aanraking en toestemming, en de rol en verantwoordelijkheid van de yogadocent.</li>
<li><strong>Meditatie.</strong> Aandacht en concentratie, bodyscan, zitmeditatie — eerst zelf ervaren, daarna leren begeleiden.</li>
<li><strong>Pranayama (verdieping).</strong> Verdiepende ademtechnieken: werking, opbouw en wanneer je ze wel en niet inzet.</li>
<li><strong>Integratie &amp; kennistoets.</strong> De theorie terug naar de mat, meditatie begeleiden in tweetallen en de afsluitende kennistoets anatomie &amp; filosofie.</li>
</ol>`,
    lesdagen: `<p>Dag 1 anatomie I (skelet, gewrichten, spieren, bewegingsleer) · Dag 2 anatomie II (fascia, ademfysiologie, toegepaste anatomie) · Dag 3 filosofie &amp; ethiek · Dag 4 meditatie &amp; pranayama · Dag 5 integratie &amp; kennistoets.</p>
<p>Avondsessies (live online): leeskring filosofie · anatomie-vragenuur &amp; toetsvoorbereiding.</p>`,
    naAfloop: `<p>Je kent de anatomie die je nodig hebt om veilig les te geven, je verweeft filosofie op een toegankelijke manier in je les en je begeleidt een korte meditatie. Je ontvangt het certificaat <em>Anatomie, Filosofie &amp; Meditatie — 50 uur</em>.</p>`,
    voorWie:
      "Open voor iedereen met regelmatige yoga-ervaring; een vooropleiding is niet nodig. Waardevol voor docenten die hun anatomische en filosofische basis willen versterken.",
    prijs: "€ 795",
    knop: "Schrijf je in voor module 2",
    product: "yogaopleiding-module-2-anatomie-filosofie-meditatie",
    combineer: "Combineer met module 1 als Blok A (100 uur) voor € 1.495.",
    seoTitel: "Module Anatomie, Filosofie & Meditatie (50 uur) | YogaCompany",
    seoOmschrijving:
      "Anatomie om veilig les te geven, de filosofie van yoga en het begeleiden van meditatie en pranayama. Los te volgen, met eigen certificaat. € 795.",
  },
  {
    segment: "module-3-yin-yoga-het-lichaam",
    pageKey: "yogaopleiding-module-3",
    titel: "Module 3 — Yin Yoga & het lichaam",
    woord: "Vertragen.",
    meta: "50 uur · Blok B · van doen naar voelen · los te volgen",
    identiek:
      "Deze module is identiek aan module 1 van de Yin Yoga Specialist Opleiding.",
    intro:
      "Module 3 opent de stille kant van yoga. Je leert wat Yin Yoga is, hoe het lichaam in Yin werkt en hoe houdingen veilig en functioneel worden ingezet. Waar de actieve stijlen vragen om doen, vraagt Yin om voelen — en dat is een vak apart.",
    watJeLeert: `<ul>
<li>Je begrijpt de filosofie en basisprincipes van Yin Yoga: tijd, stilte, sensatie en functionaliteit boven vorm.</li>
<li>Je kent de anatomie achter Yin en ziet waarom dezelfde houding er bij iedereen anders uitziet.</li>
<li>Je beheerst de belangrijkste Yin-houdingen en past ze aan met props aan ieder lichaam.</li>
<li>Je structureert en begeleidt zelfstandig een eigen Yin-les.</li>
</ul>`,
    programma: `<ol>
<li><strong>Filosofie van Yin Yoga.</strong> Ontstaan en ontwikkeling · Yin en Yang · taoïstische filosofie · de basisprincipes van Yin · tijd en stilte · sensatie en ontspanning · grenzen herkennen en respecteren · functionaliteit boven vorm.</li>
<li><strong>Anatomie voor Yin Yoga.</strong> Botten, gewrichten en spieren · pezen en ligamenten · fascia en bindweefsel · bewegingsrichtingen · mobiliteit en stabiliteit · compressie en spanning · anatomische verschillen tussen mensen.</li>
<li><strong>Yin-houdingen.</strong> De belangrijkste Yin-houdingen, waaronder Butterfly, Half Butterfly, Caterpillar, Dragon, Square, Shoelace, Swan, Sleeping Swan, Saddle, Sphinx, Seal, Melting Heart, Child's Pose, Twists, Bananasana en Legs up the Wall. Per houding: anatomie, doel, sensatie, beperkingen, contra-indicaties, variaties en props.</li>
<li><strong>Props &amp; aanpassingen.</strong> Bolster, blokken, dekens, riemen, kussens, muur en stoel — en het bouwen van ondersteunende variaties, zodat iedere houding voor ieder lichaam toegankelijk wordt.</li>
<li><strong>Basis van lesgeven in Yin.</strong> Een Yin-les structureren · houdingen logisch opbouwen · timing · counterposes · thema's ontwikkelen · eindontspanning · veilig begeleiden.</li>
</ol>`,
    lesdagen: `<p>Dag 1 van doen naar voelen — filosofie &amp; principes van Yin · Dag 2 anatomie voor Yin &amp; de functionele benadering · Dag 3 houdingenlab I · Dag 4 houdingenlab II &amp; props · Dag 5 de Yin-les &amp; practicum.</p>
<p>Avondsessies (live online): Yin-lesanalyse · props, aanpassingen &amp; casuïstiek.</p>`,
    naAfloop: `<p>Je begrijpt de basis van Yin Yoga, kent de belangrijkste Yin-houdingen, kunt houdingen aanpassen aan verschillende lichamen en verzorgt zelfstandig een eenvoudige Yin-les. Je ontvangt het certificaat <em>Yin Yoga &amp; het lichaam — 50 uur</em>, dat tevens telt als module 1 van de Yin Yoga Specialist Opleiding.</p>`,
    voorWie:
      "Na module 1 + 2, óf rechtstreeks voor ervaren beoefenaars en yogadocenten (na intake). Bij uitstek geschikt voor docenten die Yin aan hun aanbod willen toevoegen.",
    prijs: "€ 795",
    knop: "Schrijf je in voor module 3",
    // Dezelfde module als niveau 1 van de Yin Yoga Specialist Opleiding, dus
    // hetzelfde product. Twee producten voor één module zou de administratie
    // laten liegen over wat er verkocht is.
    product: "yin-niveau-1-basis",
    combineer: "Combineer met module 4 als Blok B (100 uur) voor € 1.495.",
    seoTitel: "Module Yin Yoga & het lichaam (50 uur) | YogaCompany",
    seoOmschrijving:
      "De basis van Yin Yoga: filosofie, anatomie, de belangrijkste houdingen en het geven van een eigen Yin-les. Telt mee voor de Yin Yoga Specialist Opleiding. € 795.",
  },
  {
    segment: "module-4-zenuwstelsel-meridianen",
    pageKey: "yogaopleiding-module-4",
    titel: "Module 4 — Zenuwstelsel & basis meridianen",
    woord: "Reguleren.",
    meta: "50 uur · Blok B · van fysiek naar neurologisch en energetisch · los te volgen",
    identiek:
      "Deze module is identiek aan module 2 van de Yin Yoga Specialist Opleiding.",
    intro:
      "In module 4 komt alles samen: het zenuwstelsel, de basisprincipes van Chinese Geneeskunde en de 12 meridianen. Je leert waarom ontspannen soms moeilijk is, hoe je als docent regulatie in je les brengt en hoe lichaam, zenuwstelsel en energie in Yin met elkaar samenhangen. Voor de 200-uurs route is dit tevens de module van het praktijkexamen.",
    watJeLeert: `<ul>
<li>Je begrijpt het autonome zenuwstelsel, de vaguszenuw en de stress- en herstelrespons.</li>
<li>Je herkent hoe stress, overbelasting en prikkelverwerking doorwerken in het lichaam — en in je les.</li>
<li>Je zet adem, tempo, stilte, stem en keuzevrijheid bewust in om een veilige, regulerende lesomgeving te creëren.</li>
<li>Je kent de basis van Chinese Geneeskunde en de 12 hoofdmeridianen, en welke Yin-houdingen daarbij horen.</li>
<li>Je ontwerpt een practice vanuit lichaam, zenuwstelsel en meridianen.</li>
</ul>`,
    programma: `<ol>
<li><strong>Het zenuwstelsel.</strong> Centraal en perifeer zenuwstelsel · autonoom zenuwstelsel · sympathisch en parasympathisch · de vaguszenuw · stressrespons en herstelrespons.</li>
<li><strong>Stress &amp; ontspanning.</strong> Acute en langdurige stress · overbelasting · prikkelverwerking · fight, flight en freeze · rust en herstel · slaap · belastbaarheid.</li>
<li><strong>Yoga &amp; het zenuwstelsel.</strong> Waarom ontspannen soms moeilijk is · veiligheid en ontspanning · ademhaling en regulatie · tempo en timing · stilte · stemgebruik · keuzevrijheid · een veilige lesomgeving creëren — in Yin én in de actieve les.</li>
<li><strong>Introductie Chinese Geneeskunde.</strong> Qi · Yin en Yang · balans · energie · de basisprincipes van de Traditionele Chinese Geneeskunde.</li>
<li><strong>Introductie meridianen.</strong> De 12 hoofdmeridianen: Long, Dikke Darm, Maag, Milt, Hart, Dunne Darm, Blaas, Nier, Pericard, Drievoudige Verwarmer, Galblaas en Lever. Waar loopt de meridiaan en welke Yin-houdingen horen erbij?</li>
<li><strong>Integratie.</strong> Je ontwerpt een practice vanuit lichaam + zenuwstelsel + meridianen — ook toepasbaar in je actieve lessen.</li>
<li><strong>Afronding.</strong> Volg je de volledige opleiding, dan sluit je af met het praktijkexamen: een integrale eindles van 75–90 minuten van actief naar Yin naar eindontspanning, met schriftelijke onderbouwing. Volg je module 4 los, dan rond je af met het ontwerpen en geven van een Yin-practice vanuit lichaam, zenuwstelsel en meridianen.</li>
</ol>`,
    lesdagen: `<p>Dag 1 het zenuwstelsel · Dag 2 stress &amp; ontspanning · Dag 3 regulatie in de les · Dag 4 Chinese Geneeskunde &amp; de 12 meridianen · Dag 5 integratie, practicum &amp; praktijkexamen.</p>
<p>Avondsessies (live online): zenuwstelsel &amp; regulatie vragenuur · intervisie eindopdracht &amp; examenvoorbereiding.</p>`,
    naAfloop: `<p>Je begrijpt het zenuwstelsel en de relatie tussen stress en ontspanning, je kent de basis van Chinese Geneeskunde en de 12 hoofdmeridianen en je geeft een regulerende Yin-practice. Je ontvangt het certificaat <em>Zenuwstelsel &amp; basis meridianen — 50 uur</em>, dat tevens telt als module 2 van de Yin Yoga Specialist Opleiding. Wie de volledige 200-uurs route heeft doorlopen en het praktijkexamen behaalt, ontvangt het diploma Yogadocent 200 uur.</p>`,
    voorWie:
      "Na module 3, of met een vergelijkbare Yin-basis (na intake). Ook geschikt voor yogadocenten die het zenuwstelsel en de meridianen willen leren inzetten in hun lessen.",
    prijs: "€ 795",
    knop: "Schrijf je in voor module 4",
    product: "yin-niveau-2-zenuwstelsel-meridiaanleer",
    combineer: "Combineer met module 3 als Blok B (100 uur) voor € 1.495.",
    seoTitel: "Module Zenuwstelsel & basis meridianen (50 uur) | YogaCompany",
    seoOmschrijving:
      "Het zenuwstelsel, stress en ontspanning, Chinese Geneeskunde en de 12 meridianen in Yin Yoga. Telt mee voor de Yin Yoga Specialist Opleiding. € 795.",
  },
];

// -----------------------------------------------------------------------------
// Deel 3 — de blokken die op alle vijf de pagina's terugkomen
// -----------------------------------------------------------------------------

export const GEDEELD_PRIJZEN_TITEL = "Prijzen";

export const GEDEELD_PRIJZEN: Prijsregel[] = [
  {
    variant: "Module 1 — Hatha & Vinyasa",
    inhoud: "50 uur · de actieve basis",
    prijs: "€ 795",
  },
  {
    variant: "Module 2 — Anatomie, Filosofie & Meditatie",
    inhoud: "50 uur · het fundament",
    prijs: "€ 795",
  },
  {
    variant: "Blok A — De actieve basis",
    inhoud: "100 uur · module 1 + 2",
    prijs: "€ 1.495",
  },
  {
    variant: "Module 3 — Yin Yoga & het lichaam",
    inhoud: "50 uur · van doen naar voelen",
    prijs: "€ 795",
  },
  {
    variant: "Module 4 — Zenuwstelsel & basis meridianen",
    inhoud: "50 uur · verdieping & integratie",
    prijs: "€ 795",
  },
  {
    variant: "Blok B — De stille verdieping",
    inhoud: "100 uur · module 3 + 4",
    prijs: "€ 1.495",
  },
  {
    variant: "Volledige opleiding",
    inhoud: "200 uur · incl. examen en diploma",
    prijs: "€ 2.795",
  },
];

export const GEDEELD_PRIJZEN_VOET = `<ul>
<li>Volledige opleiding: € 2.795 in plaats van 4 × € 795 — je bespaart € 385.</li>
<li>Per blok: € 1.495 in plaats van € 1.590 — je bespaart € 95 per blok.</li>
<li>Inclusief syllabus, toegang tot de online leeromgeving, beoordeling van opdrachten en het certificaat per module. Bij een blok ontvang je daarbovenop het Advanced-certificaat van 100 uur.</li>
<li>Gespreid betalen is in overleg mogelijk.</li>
</ul>`;

export const GEDEELD_PRAKTISCH_TITEL = "Praktisch";

export const GEDEELD_PRAKTISCH = `<ul>
<li><strong>Locatie &amp; groep</strong> — fysiek, in een bewust kleine groep van maximaal 14 deelnemers.</li>
<li><strong>Per module</strong> — 5 lesdagen op locatie (09:30–17:30) · 2 live online avondsessies · online leeromgeving met videolessen en opdrachten. Samen 50 begeleide opleidingsuren.</li>
<li><strong>Ritme</strong> — 5 lesdagen verspreid over ± 6 weken, zodat er ruimte is voor eigen beoefening tussen de lesdagen (reken op ± 5 uur per module).</li>
<li><strong>Lesmateriaal</strong> — per module een uitgebreide syllabus en toegang tot de online leeromgeving.</li>
<li><strong>Data</strong> — de actuele lesdata vind je hieronder / op de inschrijfpagina. Praktische informatie en de locatie ontvang je bij inschrijving.</li>
</ul>`;

export const GEDEELD_INSCHRIJVEN_TITEL = "Zo schrijf je je in";

export const GEDEELD_INSCHRIJVEN = `<ol>
<li>Kies je module, je blok of de volledige opleiding en meld je aan.</li>
<li>Je ontvangt een bevestiging met de lesdata, de locatie en praktische informatie.</li>
<li>Na betaling is je plek definitief. Een week voor de start ontvang je de syllabus en toegang tot de online leeromgeving.</li>
</ol>
<p>Vragen over je instapniveau of de opbouw? Mail naar info@yogacompany.eu.</p>`;

export const GEDEELD_DISCLAIMER =
  "Prijzen zijn vrijgesteld van btw dan wel inclusief btw, afhankelijk van de btw-status van het opleidingsaanbod. Het diploma Yogadocent 200 uur is een eigen diploma van YogaCompany. Aan deze informatie kunnen geen rechten worden ontleend.";

// -----------------------------------------------------------------------------
// SEO
// -----------------------------------------------------------------------------

export const OPLEIDING_SEO_TITEL =
  "200-uurs Yogaopleiding | Hatha, Vinyasa & Yin | YogaCompany";

export const OPLEIDING_SEO_OMSCHRIJVING =
  "Word yogadocent met een basis in kracht én stilte. Vier modules van 50 uur, los of als geheel te volgen. Diploma Yogadocent 200 uur, certificaat per module.";
