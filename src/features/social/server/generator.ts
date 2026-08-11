import "server-only";

import { anthropic, aiModel } from "@/lib/anthropic";

import {
  SYSTEEM_PROMPT,
  bouwGebruikersPrompt,
  type SocialDoel,
  type SocialPlatform,
} from "./prompt";

/**
 * Het genereren van captions (BOUWPROMPT §15).
 *
 * De vorm van het antwoord ligt vast met een JSON-schema in plaats van met een
 * instructie als "geef JSON terug". Het model kan er dan niet naast zitten en
 * wij hoeven geen tekst te repareren die net iets anders is opgemaakt.
 *
 * Deze functie gooit niet. Gaat er iets mis met de koppeling, dan komt dat als
 * nette Nederlandse melding terug en blijft de tool bruikbaar: een beheerder
 * kan altijd zelf een tekst schrijven.
 */

export type CaptionVariant = {
  /** Waarin deze variant verschilt van de andere twee. */
  invalshoek: string;
  tekst: string;
  hashtags: string[];
};

export type GenereerResultaat =
  | { status: "gelukt"; varianten: CaptionVariant[] }
  | { status: "fout"; bericht: string };

const ANTWOORD_SCHEMA = {
  type: "object",
  properties: {
    varianten: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        properties: {
          invalshoek: {
            type: "string",
            description:
              "In één korte zin: wat is de invalshoek van deze variant?",
          },
          tekst: {
            type: "string",
            description:
              "De caption zelf, in het Nederlands, zonder hashtags en zonder links.",
          },
          hashtags: {
            type: "array",
            items: { type: "string" },
            description: "Hashtags zonder het #-teken.",
          },
        },
        required: ["invalshoek", "tekst", "hashtags"],
        additionalProperties: false,
      },
    },
  },
  required: ["varianten"],
  additionalProperties: false,
} as const;

/** Haalt de #-tekens weg zodat de weergave er zelf één voor kan zetten. */
function schoonHashtag(waarde: string): string {
  return waarde.trim().replace(/^#+/, "");
}

export async function genereerCaptions(invoer: {
  onderwerp: string;
  doel: SocialDoel;
  platform: SocialPlatform;
}): Promise<GenereerResultaat> {
  const client = anthropic();

  if (!client) {
    return {
      status: "fout",
      bericht:
        "De AI-koppeling is nog niet ingericht. Je kunt wel zelf een tekst schrijven.",
    };
  }

  try {
    const antwoord = await client.messages.create({
      model: aiModel(),
      max_tokens: 2000,
      system: SYSTEEM_PROMPT,
      // Drie korte teksten schrijven vraagt geen diep nadenken; een lage
      // inspanning houdt het snel en goedkoop.
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: ANTWOORD_SCHEMA },
      },
      messages: [{ role: "user", content: bouwGebruikersPrompt(invoer) }],
    });

    if (antwoord.stop_reason === "refusal") {
      // Het model heeft geweigerd. Dat is geen storing; de beheerder moet het
      // onderwerp anders formuleren.
      return {
        status: "fout",
        bericht:
          "Over dit onderwerp wil de AI geen bericht schrijven. Probeer het anders te formuleren.",
      };
    }

    const tekstblok = antwoord.content.find((blok) => blok.type === "text");
    if (!tekstblok) {
      return { status: "fout", bericht: "De AI gaf geen tekst terug." };
    }

    const data = JSON.parse(tekstblok.text) as { varianten: CaptionVariant[] };

    const varianten = data.varianten.map((variant) => ({
      invalshoek: variant.invalshoek.trim(),
      tekst: variant.tekst.trim(),
      hashtags: variant.hashtags.map(schoonHashtag).filter(Boolean),
    }));

    if (varianten.length === 0) {
      return { status: "fout", bericht: "De AI gaf geen varianten terug." };
    }

    return { status: "gelukt", varianten };
  } catch (fout) {
    // Geen onderwerp of foutdetails in het log: die kunnen door de beheerder
    // ingetypte tekst bevatten (§17.11).
    console.error(
      `[social] genereren mislukt: ${
        fout instanceof Error ? fout.name : "onbekende fout"
      }`,
    );
    return {
      status: "fout",
      bericht:
        "Het genereren is niet gelukt. Probeer het over een minuut opnieuw.",
    };
  }
}
