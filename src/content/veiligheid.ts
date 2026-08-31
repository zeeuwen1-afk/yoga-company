/**
 * De pagina "Veiligheid en privacy".
 *
 * Bedoeld voor cursisten, niet voor techneuten. De privacyverklaring vertelt
 * juridisch wát we verwerken; deze pagina vertelt in gewone taal hóé we dat
 * beveiligen, en waarom je dat zou geloven.
 *
 * De opzet is gelaagd: bovenaan staat in vier punten wat vrijwel iedereen wil
 * weten, daaronder klapt open wie meer wil. Wie niets openklapt heeft de kern
 * toch gelezen — dat is precies de bedoeling.
 *
 * Twee regels bij het bijwerken:
 *
 * 1. **Geen belofte zonder mechanisme.** Elke claim hier is terug te voeren op
 *    iets dat werkelijk in de code of de database staat. "We nemen veiligheid
 *    serieus" hoort hier niet; "de database weigert de rij van iemand anders"
 *    wel, want dat is te controleren.
 * 2. **De laatste sectie is geen schaamte maar geloofwaardigheid.** Een pagina
 *    die alleen vertelt wat af is, leest als reclame. Houd die lijst actueel;
 *    zodra Mollie live gaat of de juridische toetsing rond is, hoort dat punt
 *    eruit.
 *
 * Net als de overige site-inhoud staan deze teksten in `content_blocks` en zijn
 * ze via de site-editor aan te passen zonder nieuwe uitrol (§14).
 */

export type VeiligheidSectie = {
  /** De vraag op de uitklapper, in de woorden van een bezoeker. */
  vraag: string;
  /** Het antwoord als HTML. */
  antwoord: string;
};

export const VEILIGHEID_TITEL = "Veiligheid en privacy";

export const VEILIGHEID_OMSCHRIJVING =
  "Waar je gegevens staan, wie ze kan zien, en hoe deze site is gebouwd om ze te beschermen. In gewone taal.";

export const VEILIGHEID_INLEIDING =
  "Je vertrouwt ons iets toe: je naam, je voortgang, soms iets over je gezondheid. Hieronder staat wat we daarmee doen, en wat we bewust niet doen.";

export const VEILIGHEID_KERN = `
<p>De korte versie, in vier punten.</p>
<ul>
<li><strong>Je gegevens staan in Frankfurt</strong>, op servers binnen de Europese Unie.</li>
<li><strong>Alleen jij ziet jouw dossier.</strong> Dat is geen belofte, maar een regel in de database zelf, die weigert de gegevens van iemand anders uit te leveren, ook wanneer de website een fout zou maken.</li>
<li><strong>Je wachtwoord kennen we niet.</strong> We kunnen het niet opzoeken en niet doorgeven; we kunnen je alleen helpen een nieuw in te stellen.</li>
<li><strong>We volgen je niet.</strong> Geen advertentiecookies, geen meekijkende partijen, geen profiel dat ergens verhandeld wordt.</li>
</ul>
<p>Wil je weten hoe dat werkt, of waarom je ons daarin zou geloven? Hieronder klapt het open.</p>
`;

export const VEILIGHEID_SECTIES: VeiligheidSectie[] = [
  {
    vraag:
      "Hoe weten jullie zo zeker dat niemand anders bij mijn gegevens kan?",
    antwoord: `
<p>Bij veel websites is de website zelf de portier: die bepaalt bij elke pagina wie wat te zien krijgt. Sluipt er ergens in die code een fout, dan ligt in één klap alles open. Dat is de manier waarop de meeste datalekken ontstaan.</p>
<p>Hier ligt de portier een laag dieper: in de database. Elke tabel heeft regels die zeggen <em>geef een rij alleen terug aan degene van wie hij is</em>. Zou de website per ongeluk álles opvragen, dan krijgt hij nog steeds alleen jouw rijen terug. De fout wordt dan een lege lijst in plaats van een lek. Op dit moment zijn dat 45 van zulke regels, verdeeld over alle 22 tabellen.</p>
<p>Gezondheidsgegevens gaan een stap verder. Die staan in een apart afgeschermd deel van de database waar geen enkele toegangsregel naartoe leidt: ook niet voor jou, ook niet voor een ingelogde beheerder via de gewone weg. Ze bestaan alleen als jij ze zelf hebt gedeeld, en ze zijn alleen te lezen langs de ene route die daar speciaal voor is.</p>
<p>Het beheergedeelte zit bovendien achter tweestapsverificatie: naast een wachtwoord is een code van zes cijfers nodig die elke dertig seconden verandert. Wie het wachtwoord van een beheerder zou raden, komt er zonder die code nog steeds niet in.</p>
`,
  },
  {
    vraag: "Waar staan mijn gegevens precies?",
    antwoord: `
<ul>
<li><strong>Je account, je inschrijvingen en je voortgang</strong>: bij Supabase, in Frankfurt. Dat is de database.</li>
<li><strong>De website zelf</strong>: bij Vercel, ook in Frankfurt. Daar wordt niets van jou bewaard; die zet alleen de pagina's in elkaar.</li>
<li><strong>Beeld en cursusmateriaal</strong>: eveneens Frankfurt, bij dezelfde partij als de database.</li>
<li><strong>Betalingen</strong>: bij Mollie in Amsterdam. Je kaart- of rekeningnummer komt nooit onze kant op; wij zien alleen dát er betaald is, het bedrag, en een verwijzing.</li>
<li><strong>E-mail</strong>: via Resend, dat de bevestigings- en herstelmails verstuurt.</li>
</ul>
<p>Eén uitzondering, en die noemen we liever zelf dan dat je hem ergens moet opzoeken. Maakt je begeleider een verslag ter voorbereiding van een gesprek, dan gaat een deel van je dossier naar Anthropic, in de Verenigde Staten. Je naam, e-mailadres, telefoonnummer, woonplaats en geboortedatum gaan daarbij <strong>niet</strong> mee. Wel je leeftijd, je doelen, je voortgang en de aantekeningen. Iets over je gezondheid gaat alleen mee als jij daar toestemming voor gaf én je begeleider het per keer aanvinkt.</p>
<p>Dat is geen anonimiteit, en we doen ook niet alsof: een uitgebreid profiel kan indirect nog steeds naar één persoon leiden. Daarom staat het hier, en in de privacyverklaring.</p>
`,
  },
  {
    vraag: "Wat gebeurt er met mijn wachtwoord?",
    antwoord: `
<p>Je wachtwoord wordt niet opgeslagen. Wat bewaard wordt is een onleesbare afdruk ervan, gemaakt met een berekening die niet terug te draaien is. Bij het inloggen wordt niet gekeken of je wachtwoord klopt, maar of de afdruk ervan klopt.</p>
<p>Het gevolg is misschien onhandig maar wel geruststellend: <strong>wij kunnen je wachtwoord niet opzoeken.</strong> Vraag je ernaar, dan is het eerlijke antwoord dat we het echt niet weten. We kunnen alleen een herstelmail sturen naar het adres dat bij je account hoort.</p>
<p>Je kunt zelf tweestapsverificatie aanzetten in je eigen omgeving. Voor beheerders is dat geen keuze maar een eis: zonder tweede stap komt niemand bij het beheer.</p>
`,
  },
  {
    vraag: "Waarmee is deze site gebouwd?",
    antwoord: `
<p>Van voor naar achter, zonder jargon:</p>
<ul>
<li><strong>De pagina's</strong> worden op de server in elkaar gezet en kant-en-klaar naar je browser gestuurd. Dat is snel, en het werkt ook wanneer er onderweg iets misgaat met de opmaak of de scripts.</li>
<li><strong>De opslag</strong> is een gewone database (PostgreSQL) met inloggen en bestandsopslag eromheen, geleverd door Supabase.</li>
<li><strong>De hosting</strong> loopt via Vercel, met de regio vastgezet op Frankfurt zodat er niets buiten de EU terechtkomt.</li>
<li><strong>Betalen en mailen</strong> besteden we uit aan partijen die daar goed in zijn, Mollie en Resend, in plaats van dat zelf te bouwen.</li>
</ul>
<p>De teksten en foto's die je hier leest staan niet vastgemetseld in de code. Ze staan in de database en zijn aan te passen via een eigen editor. Een wijziging is eerst een concept dat alleen de beheerder ziet; pas bij publiceren komt hij online, en elke publicatie belandt in een logboek dat niet te wissen is.</p>
<p>Verder krijgt je browser van ons een lijst mee van de plekken waar deze pagina iets vandaan mag halen. Staat een adres niet op die lijst, dan weigert je browser het, ook als iemand het er via een omweg tussen zou weten te krijgen.</p>
`,
  },
  {
    vraag: "Hoe weten jullie dat een wijziging niets stukmaakt?",
    antwoord: `
<p>Omdat er niets online gaat voordat een reeks controles automatisch is doorlopen. Die controles kijken niet of de site er mooi uitziet, maar of hij zich gedraagt:</p>
<ul>
<li><strong>84 controles op losse onderdelen</strong>: rekent de prijs goed, wordt een te late annulering geweigerd.</li>
<li><strong>271 controles die juist proberen wat niet mag:</strong> klant A die het dossier van klant B opvraagt, iemand die zichzelf beheerder maakt, betaalde content bekijken zonder betaling, een concepttekst die uitlekt voordat hij gepubliceerd is. Elk van die pogingen hóórt te mislukken, en de controle valt om zodra er ééntje slaagt.</li>
<li><strong>212 controles die de site in twee echte browsers doorlopen</strong>, op een laptop en op een telefoon, van begin tot eind: inschrijven, inloggen, boeken, annuleren.</li>
</ul>
<p>Samen zijn dat ruim vierhonderd controles, en ze draaien bij elke wijziging opnieuw. Springt er één op rood, dan gaat de wijziging niet door. Niet "we kijken er nog naar": hij komt er eenvoudigweg niet in.</p>
`,
  },
  {
    vraag: "Wat is er bewust nog niet af?",
    antwoord: `
<p>Liever eerlijk dan glad:</p>
<ul>
<li><strong>Online betalen kan nog niet.</strong> Schrijf je je in, dan wordt dat een aanvraag en nemen we zelf contact met je op over de betaling.</li>
<li><strong>De juridische teksten zijn concept.</strong> Ze zijn zorgvuldig opgesteld, maar nog niet door een jurist nagekeken. Dat staat er ook bij, op de pagina's zelf.</li>
<li><strong>Nieuwsbrieven versturen we nog niet.</strong> Eerst willen we de toestemmingsadministratie sluitend hebben; daarna pas de eerste mailing.</li>
</ul>
<p>Zodra hier iets in verandert, verandert deze pagina mee.</p>
`,
  },
];
