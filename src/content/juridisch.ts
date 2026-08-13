/**
 * Juridische teksten (BOUWPROMPT §8.6 en §17.9).
 *
 * ⚠️ CONCEPT. Deze teksten zijn zorgvuldig opgesteld en benoemen de
 * subverwerkers die het platform daadwerkelijk gebruikt, maar ze zijn niet
 * juridisch getoetst. Laat ze nakijken door een jurist voordat de site live
 * gaat. De pagina's tonen die waarschuwing ook aan de bezoeker, tot Pieter hem
 * via de site-editor weghaalt.
 *
 * Net als de overige site-inhoud staan ze in `content_blocks` en zijn ze
 * bewerkbaar zonder nieuwe uitrol.
 */

export type JuridischeTekst = {
  pageKey: string;
  titel: string;
  omschrijving: string;
  inleiding: string;
  html: string;
};

const PRIVACY = `
<h2>1. Wie zijn wij</h2>
<p>YogaCompany is verantwoordelijk voor de verwerking van je persoonsgegevens zoals beschreven in deze verklaring. Je bereikt ons via info@yogacompanie.nl.</p>

<h2>2. Welke gegevens we verwerken</h2>
<p>We verwerken zo min mogelijk gegevens. Concreet gaat het om:</p>
<ul>
<li><strong>Bij een account:</strong> je voor- en achternaam, e-mailadres en — als je dat zelf invult — je telefoonnummer.</li>
<li><strong>Bij een inschrijving:</strong> welke opleiding je volgt, de betaalstatus en het bedrag. Betaalgegevens zelf komen nooit bij ons binnen; die verwerkt Stripe.</li>
<li><strong>Bij digitale content:</strong> waar je in een video of les gebleven bent, zodat je verder kunt waar je stopte.</li>
<li><strong>Bij berichten:</strong> de inhoud van wat je ons via je eigen omgeving of het contactformulier stuurt.</li>
<li><strong>Bij toestemming voor mailings:</strong> het moment waarop je die toestemming gaf.</li>
</ul>

<h2>3. Waarom we ze verwerken</h2>
<p>Om je opleiding te kunnen leveren en je vragen te beantwoorden (uitvoering van de overeenkomst), om aan onze administratieve en fiscale verplichtingen te voldoen (wettelijke plicht), en — alleen als je daar toestemming voor gaf — om je af en toe iets te mailen over ons aanbod.</p>

<h2>4. Hoe lang we ze bewaren</h2>
<ul>
<li>Contactberichten: 12 maanden.</li>
<li>Accountgegevens: zolang je account bestaat. Na verwijdering anonimiseren we je gegevens; inschrijvings- en omzetgegevens blijven geanonimiseerd staan voor de boekhouding, zoals de wet vereist.</li>
<li>Logboek van beheerhandelingen: 24 maanden.</li>
</ul>

<h2>5. Met wie we ze delen</h2>
<p>We verkopen je gegevens niet. We werken met de volgende dienstverleners, die uitsluitend in onze opdracht handelen en waarmee we een verwerkersovereenkomst hebben:</p>
<ul>
<li><strong>Supabase</strong> — database, inloggen en bestandsopslag (servers in Frankfurt, EU)</li>
<li><strong>Vercel</strong> — hosting van de website (regio Frankfurt, EU)</li>
<li><strong>Stripe</strong> — betalingen</li>
<li><strong>Resend</strong> — verzenden van e-mail</li>
<li><strong>Anthropic</strong> — hulp bij het opstellen van berichten voor sociale media; hier gaan geen klantgegevens naartoe</li>
<li><strong>Meta</strong> — alleen wanneer wij zelf iets plaatsen op Facebook of Instagram</li>
</ul>

<h2>6. Waar je gegevens staan</h2>
<p>Je gegevens staan op servers binnen de Europese Unie. Waar een dienstverlener gegevens buiten de EU zou verwerken, gebeurt dat op basis van de standaardcontractbepalingen van de Europese Commissie.</p>

<h2>7. Beveiliging</h2>
<p>Verkeer met onze website is versleuteld. Gegevens staan versleuteld opgeslagen. De scheiding tussen klanten is op databaseniveau afgedwongen: het is technisch niet mogelijk dat je de gegevens van een andere klant ziet. Beschermde video's en documenten zijn alleen bereikbaar via tijdelijke links die verlopen. Beheerders kunnen alleen inloggen met tweestapsverificatie.</p>

<h2>8. Cookies</h2>
<p>We gebruiken uitsluitend functionele cookies: die zijn nodig om ingelogd te blijven. We volgen je niet en gebruiken geen advertentie- of statistiekcookies. Daarom zie je bij ons geen cookiemelding.</p>

<h2>9. Je rechten</h2>
<p>Je mag je gegevens inzien, corrigeren, meenemen of laten verwijderen, en je toestemming voor mailings altijd intrekken. Heb je een account, dan doe je dat zelf onder <em>Profiel</em>: je downloadt daar je gegevens als bestand en kunt verwijdering aanvragen. Liever per e-mail? Stuur een bericht naar info@yogacompanie.nl.</p>
<p>Ben je het oneens met hoe wij met je gegevens omgaan, dan kun je een klacht indienen bij de Autoriteit Persoonsgegevens.</p>

<h2>10. Wijzigingen</h2>
<p>Verandert deze verklaring, dan passen we de datum bovenaan aan. Bij ingrijpende wijzigingen laten we het je weten.</p>
`;

const VOORWAARDEN = `
<h2>1. Waar deze voorwaarden over gaan</h2>
<p>Deze voorwaarden gelden voor alle opleidingen, trainingen, lessen en digitale content van YogaCompany.</p>

<h2>2. Inschrijven</h2>
<p>Je schrijft je in via de website. De inschrijving is definitief zodra we je betaling hebben ontvangen en je van ons een bevestiging per e-mail hebt gekregen. Plaatsing gebeurt op volgorde van betaling; onze groepen zijn klein, dus vol is vol.</p>

<h2>3. Prijzen en betalen</h2>
<p>Alle genoemde prijzen zijn in euro's. Betalen kan met iDEAL of creditcard. Betalen in termijnen is in overleg mogelijk — neem daarvoor contact met ons op vóór je inschrijving.</p>

<h2>4. Bedenktijd</h2>
<p>Schrijf je je als consument online in, dan heb je veertien dagen bedenktijd waarin je zonder opgaaf van reden kunt annuleren. Begint de opleiding binnen die veertien dagen en heb je gevraagd om eerder te starten, dan vervalt de bedenktijd zodra je toegang hebt gekregen tot het lesmateriaal.</p>

<h2>5. Annuleren</h2>
<ul>
<li>Meer dan 30 dagen voor aanvang: je krijgt het volledige bedrag terug, minus € 50 administratiekosten.</li>
<li>Tussen 30 en 14 dagen voor aanvang: je krijgt de helft terug.</li>
<li>Binnen 14 dagen voor aanvang: geen restitutie. In overleg kun je je plek overdragen aan iemand anders, of doorschuiven naar een volgende groep.</li>
</ul>
<p>Word je ziek of overkomt je iets waardoor deelname echt niet gaat, neem dan contact met ons op. We zoeken dan samen naar een oplossing.</p>

<h2>6. Annulering door ons</h2>
<p>Gaat een opleiding niet door door te weinig aanmeldingen of overmacht, dan krijg je het volledige bedrag terug. Moeten we een lesdag verplaatsen, dan plannen we een vervangende datum.</p>

<h2>7. Digitale content</h2>
<p>Video's, documenten en teksten in je eigen omgeving zijn persoonlijk. Je mag ze bekijken en gebruiken voor je eigen leerproces, maar niet delen, doorverkopen of openbaar maken. Je toegang loopt zolang de opleiding loopt en daarna nog een redelijke periode; wij laten het weten als daar iets aan verandert.</p>

<h2>8. Certificaten</h2>
<p>Je ontvangt een certificaat als je de module hebt afgerond: aanwezig bij de lesdagen en de eindopdracht voldoende afgesloten. Rond je alle vier de modules van de Yin Yoga Specialist Opleiding af, dan ontvang je het diploma.</p>

<h2>9. Wat wij van je vragen</h2>
<p>Yoga is geen medische behandeling. Heb je klachten, een blessure of ben je zwanger, laat het ons dan vóór aanvang weten en overleg zo nodig met je arts. Je blijft zelf verantwoordelijk voor wat je tijdens een les wel en niet doet — luister naar je lichaam en forceer niets.</p>

<h2>10. Aansprakelijkheid</h2>
<p>We doen ons werk zorgvuldig. Onze aansprakelijkheid is beperkt tot het bedrag dat je voor de betreffende opleiding hebt betaald, behalve bij opzet of grove nalatigheid van onze kant.</p>

<h2>11. Klachten</h2>
<p>Ben je ergens niet tevreden over, laat het ons weten via info@yogacompanie.nl. We reageren binnen veertien dagen en zoeken samen naar een oplossing.</p>

<h2>12. Toepasselijk recht</h2>
<p>Op deze voorwaarden is Nederlands recht van toepassing.</p>
`;

const COOKIES = `
<h2>Kort gezegd</h2>
<p>We volgen je niet. YogaCompany gebruikt geen advertentiecookies, geen statistiekcookies en geen trackers van derden. Daarom krijg je bij ons geen cookiemelding: die is alleen verplicht voor cookies die wij niet gebruiken.</p>

<h2>Welke cookies dan wel</h2>
<p>Alleen cookies die nodig zijn om de site te laten werken:</p>
<ul>
<li><strong>Inlogcookies.</strong> Zodra je inlogt, onthouden we dat je ingelogd bent. Zonder deze cookie zou je bij elke pagina opnieuw moeten inloggen. Hij verdwijnt als je uitlogt.</li>
<li><strong>Beveiligingscookies.</strong> Deze beschermen formulieren tegen misbruik.</li>
</ul>
<p>Voor functionele cookies is geen toestemming vereist. Je kunt ze in je browser blokkeren, maar dan kun je niet inloggen.</p>

<h2>Cookies van anderen</h2>
<p>Betaal je via Stripe, dan gebeurt dat op de omgeving van Stripe zelf, dat daar eigen cookies plaatst. Sluiten we ooit een video van YouTube of Vimeo in, dan doen we dat in de privacyvriendelijke modus.</p>

<h2>Vragen</h2>
<p>Stuur gerust een bericht naar info@yogacompanie.nl.</p>
`;

export const JURIDISCHE_TEKSTEN: JuridischeTekst[] = [
  {
    pageKey: "privacyverklaring",
    titel: "Privacyverklaring",
    omschrijving:
      "Welke persoonsgegevens YogaCompany verwerkt, waarom, hoe lang en met wie ze worden gedeeld.",
    inleiding:
      "We verwerken zo min mogelijk gegevens, en alleen wat nodig is om je opleiding te kunnen geven. Hieronder lees je precies wat, waarom en hoe lang.",
    html: PRIVACY,
  },
  {
    pageKey: "algemene-voorwaarden",
    titel: "Algemene voorwaarden",
    omschrijving:
      "De voorwaarden voor opleidingen, trainingen, lessen en digitale content van YogaCompany.",
    inleiding:
      "Deze voorwaarden gelden voor alles wat we aanbieden. We hebben ze zo kort en leesbaar mogelijk gehouden.",
    html: VOORWAARDEN,
  },
  {
    pageKey: "cookies",
    titel: "Cookies",
    omschrijving:
      "YogaCompany gebruikt uitsluitend functionele cookies en volgt bezoekers niet.",
    inleiding:
      "Een korte pagina, want er valt weinig te melden: we gebruiken alleen cookies die nodig zijn om de site te laten werken.",
    html: COOKIES,
  },
];

export function vindJuridischeTekst(pageKey: string) {
  return JURIDISCHE_TEKSTEN.find((tekst) => tekst.pageKey === pageKey);
}
