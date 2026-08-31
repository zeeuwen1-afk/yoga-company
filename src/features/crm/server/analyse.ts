import "server-only";

import { anthropic, aiIngericht, aiModel } from "@/lib/anthropic";
import type { KlantDossier } from "./queries";

/**
 * Het gespreksverslag (bouwprompt §7.4).
 *
 * Wat er wél en niet naar de AI gaat
 * ----------------------------------
 * Uitdrukkelijke keuze van de opdrachtgever: **NAW-gegevens gaan niet mee.**
 * Naam, e-mailadres, telefoonnummer en woonplaats blijven hier. Alles wat over
 * de inhoud gaat — leeftijd, doelen, ervaring, interesses, voortgang,
 * boekingen, notities, verslagen en de gezondheidsgegevens — gaat wel mee.
 *
 * Dat heet pseudonimiseren, en het is iets anders dan anonimiseren. Een
 * uitgebreid profiel met leeftijd, klachten en doelen kan indirect nog steeds
 * naar één persoon leiden. De AVG beschouwt dit dus nog steeds als
 * persoonsgegevens: er is een verwerkersovereenkomst met Anthropic nodig, en
 * de privacyverklaring moet het benoemen. Het verlaagt het risico flink, het
 * neemt het niet weg. Zie docs/klantdossier.md.
 *
 * De naam van de klant wordt ook uit de vrije tekst gehaald, want daar staat
 * hij vaak in ("Marieke gaf aan dat…"). Dat is een schoonmaakslag, geen
 * garantie: een notitie kan de naam van een partner of een werkgever bevatten.
 * De beheerder is de laatste controle en ziet het verslag voordat er iets mee
 * gebeurt.
 */

export type AnalyseInvoer = {
  dossier: KlantDossier;
  gezondheid: string | null;
};

/** Leeftijd in jaren; preciezer hoeft niet en zou herleidbaarder zijn. */
function leeftijdUit(geboortedatum: string | null): number | null {
  if (!geboortedatum) return null;
  const geboren = new Date(geboortedatum);
  if (Number.isNaN(geboren.getTime())) return null;
  const nu = new Date();
  let jaren = nu.getFullYear() - geboren.getFullYear();
  const maand = nu.getMonth() - geboren.getMonth();
  if (maand < 0 || (maand === 0 && nu.getDate() < geboren.getDate()))
    jaren -= 1;
  return jaren >= 0 && jaren < 130 ? jaren : null;
}

/**
 * Haalt de naam van de klant uit vrije tekst. Hele woorden en
 * hoofdletterongevoelig; korte namen (twee letters of minder) slaan we over,
 * anders sneuvelen gewone woorden.
 */
export function schoonTekst(tekst: string, namen: string[]): string {
  let uit = tekst;
  for (const naam of namen) {
    const deel = naam.trim();
    if (deel.length < 3) continue;
    const patroon = new RegExp(
      `\\b${deel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "gi",
    );
    uit = uit.replace(patroon, "[de klant]");
  }
  return uit;
}

/** Bouwt het dossier om naar wat de AI te zien krijgt. */
export function pseudonimiseer({ dossier, gezondheid }: AnalyseInvoer) {
  const { profiel } = dossier;
  const namen = [profiel.voornaam, profiel.achternaam];
  const schoon = (tekst: string | null) =>
    tekst ? schoonTekst(tekst, namen) : null;

  return {
    // Geen naam, e-mail, telefoon of woonplaats.
    leeftijd: leeftijdUit(profiel.geboortedatum),
    klantSinds: profiel.aangemaaktOp?.slice(0, 10) ?? null,
    ervaring: profiel.ervaring,
    doelen: schoon(profiel.doelen),
    interesses: profiel.interesses,
    hoeGevonden: profiel.hoeGevonden,
    toestemmingMailings: profiel.toestemmingOp !== null,
    gezondheid: schoon(gezondheid),
    inschrijvingen: dossier.inschrijvingen.map((rij) => ({
      opleiding: rij.cursusTitel,
      status: rij.status,
      betaaldOp: rij.betaaldOp?.slice(0, 10) ?? null,
    })),
    voortgang: {
      onderdelenBekeken: dossier.voortgang.aantalItems,
      onderdelenAfgerond: dossier.voortgang.aantalAfgerond,
      laatstActiefOp: dossier.voortgang.laatstActiefOp?.slice(0, 10) ?? null,
    },
    boekingen: dossier.boekingen.map((rij) => ({
      les: rij.lesTitel,
      status: rij.status,
      wanneer: rij.begintOp.slice(0, 10),
    })),
    aanvragen: dossier.aanvragen.map((rij) => ({
      soort: rij.soort,
      status: rij.status,
      toelichting: schoon(rij.toelichting),
    })),
    notitiesEnVerslagen: dossier.notities.map((rij) => ({
      soort: rij.soort,
      titel: rij.titel,
      datum: rij.geschrevenOp.slice(0, 10),
      tekst: schoonTekst(rij.tekst, namen),
    })),
  };
}

const OPDRACHT = `Je schrijft voor YogaCompany, een Nederlands opleidingsinstituut voor yoga.

Je krijgt het dossier van één deelnemer, zonder naam of contactgegevens. Schrijf
een gespreksverslag dat de eigenaar samen met die deelnemer kan doornemen.

Toon: warm en persoonlijk, maar zakelijk genoeg om serieus genomen te worden.
Nederlands, je-vorm, korte zinnen. Geen marketingtaal, geen superlatieven, geen
therapeutentaal. Schrijf zoals een ervaren docent die de deelnemer echt kent.

Structuur, met deze kopjes:

## Waar je nu staat
Wat er is gedaan en hoe het loopt. Feitelijk, geen oordeel.

## Wat opvalt
Twee tot vier observaties uit het dossier. Alleen wat er staat; niets aanvullen
of aannemen. Benoem het als iets onduidelijk is.

## Aandachtspunten
Praktische punten voor de begeleiding. Staat er gezondheidsinformatie in, neem
die hier mee, feitelijk en zonder diagnose te stellen.

## Voorstel om te bespreken
Twee tot drie concrete suggesties voor de volgende stap, elk met een reden.

## Vragen om te stellen
Twee of drie open vragen die het gesprek verder helpen.

Regels:
- Verzin nooit iets dat niet in het dossier staat.
- Is er weinig informatie, zeg dat dan en houd het kort. Een dun verslag is
  beter dan een opgeblazen verslag.
- Geen medische diagnoses of behandeladviezen. Bij twijfel: doorverwijzen naar
  een arts of fysiotherapeut noemen.
- Je schrijft voor de eigenaar, niet voor de deelnemer. De eigenaar bepaalt wat
  hij ervan deelt.`;

export type AnalyseUitkomst =
  | { status: "gelukt"; tekst: string; model: string }
  | { status: "fout"; bericht: string };

export async function schrijfGespreksverslag(
  invoer: AnalyseInvoer,
): Promise<AnalyseUitkomst> {
  if (!aiIngericht()) {
    return {
      status: "fout",
      bericht:
        "De AI-koppeling is nog niet ingericht. Zet ANTHROPIC_API_KEY in de omgeving.",
    };
  }

  const client = anthropic();
  if (!client) {
    return { status: "fout", bericht: "De AI-koppeling is niet beschikbaar." };
  }

  const dossier = pseudonimiseer(invoer);
  const model = aiModel();

  try {
    const antwoord = await client.messages.create({
      model,
      max_tokens: 2000,
      system: OPDRACHT,
      messages: [
        {
          role: "user",
          content: `Hier is het dossier:\n\n${JSON.stringify(dossier, null, 2)}`,
        },
      ],
    });

    const tekst = antwoord.content
      .filter((deel) => deel.type === "text")
      .map((deel) => (deel.type === "text" ? deel.text : ""))
      .join("\n")
      .trim();

    if (!tekst) {
      return { status: "fout", bericht: "De AI gaf geen tekst terug." };
    }

    return { status: "gelukt", tekst, model };
  } catch (fout) {
    console.error(
      `[analyse] mislukt: ${fout instanceof Error ? fout.message : "onbekend"}`,
    );
    return {
      status: "fout",
      bericht: "Het verslag kon niet worden gemaakt. Probeer het zo nog eens.",
    };
  }
}
