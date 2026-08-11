import "server-only";

import { BLOKKEN, blokkenVanPagina, type BlokWaarde } from "@/content/blokken";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Leest de inhoud van een publieke pagina uit `content_blocks` (BOUWPROMPT §14).
 *
 * De database is leidend. Staat een blok er nog niet in — of is de database
 * even niet bereikbaar — dan valt de pagina terug op de startinhoud uit
 * `src/content/blokken.ts`. De site blijft daarmee altijd overeind, ook bij een
 * storing, en toont dan de laatst bekende goede tekst in plaats van een gat.
 */

export type Pagina = {
  /** Platte tekst uit een blok. Leeg wanneer het blok niet bestaat. */
  tekst(blockKey: string): string;
  /** Richtext als HTML-string, bedoeld voor `dangerouslySetInnerHTML`. */
  html(blockKey: string): string;
  /** Een lijst met gestructureerde items (testimonials, docenten, …). */
  lijst<T extends Record<string, string>>(blockKey: string): T[];
  /** Een afbeelding, of null wanneer er nog geen beeld is gekozen. */
  beeld(blockKey: string): { url: string; alt: string } | null;
};

function maakPagina(waarden: Map<string, BlokWaarde>): Pagina {
  return {
    tekst(blockKey) {
      const waarde = waarden.get(blockKey);
      return waarde && "text" in waarde ? waarde.text : "";
    },
    html(blockKey) {
      const waarde = waarden.get(blockKey);
      return waarde && "html" in waarde ? waarde.html : "";
    },
    lijst<T extends Record<string, string>>(blockKey: string) {
      const waarde = waarden.get(blockKey);
      return waarde && "items" in waarde ? (waarde.items as T[]) : [];
    },
    beeld(blockKey) {
      const waarde = waarden.get(blockKey);
      if (!waarde || !("url" in waarde) || !waarde.url) return null;
      return { url: waarde.url, alt: waarde.alt };
    },
  };
}

export async function haalPagina(pageKey: string): Promise<Pagina> {
  // Begin bij de startinhoud, zodat elk blok altijd een waarde heeft.
  const waarden = blokkenVanPagina(pageKey);

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("content_blocks_public")
      .select("block_key, value")
      .eq("page_key", pageKey);

    if (!error && data) {
      for (const rij of data) {
        waarden.set(rij.block_key, rij.value as unknown as BlokWaarde);
      }
    }
  } catch {
    // Database niet bereikbaar: de startinhoud blijft staan.
  }

  return maakPagina(waarden);
}

/** Alle pagina's waarvan blokken bestaan — voor de site-editor in Fase 6. */
export function bekendePaginas() {
  return [...new Set(BLOKKEN.map((blok) => blok.page_key))];
}
