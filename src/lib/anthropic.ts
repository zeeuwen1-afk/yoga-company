import "server-only";

import Anthropic from "@anthropic-ai/sdk";

/**
 * Koppeling met de Anthropic API (BOUWPROMPT §15).
 *
 * Net als bij Mollie en Resend: de sleutel wordt pas gelezen op het moment dat
 * hij nodig is. Zo start de applicatie ook zonder AI-koppeling en kun je alles
 * behalve het genereren van teksten gewoon gebruiken — de socialmediatool blijft
 * bruikbaar met zelfgeschreven captions.
 *
 * De sleutel blijft server-side. Er gaat nooit een verzoek rechtstreeks vanuit
 * de browser naar Anthropic (§17.1).
 */

let client: Anthropic | null = null;

export function aiIngericht(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function anthropic(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

/**
 * Het model. Sonnet is ruim voldoende voor het schrijven van een paar zinnen
 * social-tekst en kost een fractie van het zwaarste model; via de environment
 * is het te wisselen zonder de code aan te passen.
 */
export function aiModel(): string {
  return process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";
}
