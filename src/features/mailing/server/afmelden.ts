import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * De afmeldlink (BOUWPROMPT §10.7).
 *
 * Elke mailing bevat een link waarmee de ontvanger zich in één klik afmeldt.
 * Die link mag geen inlog vragen — wie zich wil afmelden moet dat kunnen zonder
 * eerst een wachtwoord op te zoeken — en mag tegelijk niet te raden zijn, want
 * anders kan iemand anders je toestemming intrekken.
 *
 * Daarom een ondertekende link: het profiel-id met een handtekening erachter,
 * gemaakt met een geheim dat alleen de server kent. Geen tabel met tokens, geen
 * extra kolom, niets extra's om op te ruimen — dat past bij dataminimalisatie
 * (§2.5). De handtekening verloopt niet: afmelden moet ook werken vanuit een
 * mail van een jaar oud, en het ergste dat iemand met een gelekte link kan doen
 * is een toestemming intrekken die de ontvanger toch al kon intrekken.
 */

function geheim(): string {
  const waarde = process.env.MAILING_UNSUBSCRIBE_SECRET;
  if (!waarde) {
    throw new Error(
      "MAILING_UNSUBSCRIBE_SECRET ontbreekt; zonder afmeldlink mag er geen mailing uit",
    );
  }
  return waarde;
}

export function afmeldsecretIngericht(): boolean {
  return Boolean(process.env.MAILING_UNSUBSCRIBE_SECRET);
}

function onderteken(profielId: string): string {
  return createHmac("sha256", geheim()).update(profielId).digest("base64url");
}

/** Het token dat in de afmeldlink staat: id en handtekening. */
export function maakAfmeldToken(profielId: string): string {
  return `${profielId}.${onderteken(profielId)}`;
}

/** Geeft het profiel-id terug, of null als de handtekening niet klopt. */
export function leesAfmeldToken(token: string): string | null {
  // Ontbreekt het geheim, dan kan geen enkele handtekening kloppen. Bij twijfel
  // niets doen: liever een nette melding op de afmeldpagina dan een foutscherm.
  // Ondertekenen gooit wél, want zonder werkende link mag er geen mailing uit.
  if (!afmeldsecretIngericht()) return null;

  const scheiding = token.lastIndexOf(".");
  if (scheiding <= 0) return null;

  const profielId = token.slice(0, scheiding);
  const handtekening = token.slice(scheiding + 1);
  const verwacht = onderteken(profielId);

  // Vergelijken in constante tijd, zodat de duur van het antwoord niets
  // verraadt over hoe ver een gok ernaast zat.
  const a = Buffer.from(handtekening);
  const b = Buffer.from(verwacht);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  return profielId;
}

/** De volledige afmeldlink voor in een mailing. */
export function afmeldUrl(profielId: string): string {
  const basis = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${basis}/afmelden/${maakAfmeldToken(profielId)}`;
}
