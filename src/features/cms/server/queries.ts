import "server-only";

import { BLOKKEN, blokkenVanPagina, type BlokWaarde } from "@/content/blokken";
import { focusStijl } from "@/lib/beeldfocus";
import {
  leesLayout,
  leesWaas,
  type BeeldLayout,
  type Waas,
} from "@/lib/beeldlayout";
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
  beeld(blockKey: string): {
    url: string;
    alt: string;
    focus: string;
    layout: BeeldLayout;
    waas: Waas;
  } | null;
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
      // `focusStijl` geeft altijd een geldige waarde terug, ook bij een blok
      // dat nog van vóór deze functie komt of dat handmatig is bewerkt.
      return {
        url: waarde.url,
        alt: waarde.alt,
        focus: focusStijl(waarde.focus),
        layout: leesLayout(waarde.layout),
        waas: leesWaas(waarde.waas),
      };
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
      .select("block_key, value, zichtbaar")
      .eq("page_key", pageKey);

    if (!error && data) {
      for (const rij of data) {
        if (!rij.zichtbaar) {
          // Verborgen betekent: ook de startinhoud niet tonen. Zonder deze
          // regel zou het blok terugkomen via de terugval hierboven.
          waarden.delete(rij.block_key);
          continue;
        }
        waarden.set(rij.block_key, rij.value as unknown as BlokWaarde);
      }
    }
  } catch {
    // Database niet bereikbaar: de startinhoud blijft staan.
  }

  return maakPagina(waarden);
}

/**
 * Dezelfde pagina, maar met de concepten erover heen (BOUWPROMPT §14).
 *
 * Alleen bereikbaar voor beheerders: `content_blocks` — waar `draft_value` in
 * staat — is door RLS afgeschermd. Deze functie leest daarom met de sessie van
 * de ingelogde beheerder in plaats van met de publieke client.
 *
 * Bewust een aparte functie en geen optie op `haalPagina`: de publieke pagina's
 * worden statisch gegenereerd, en zouden dat verliezen zodra ze een sessie
 * moeten lezen om te bepalen wat ze tonen.
 */
export async function haalConceptPagina(pageKey: string): Promise<Pagina> {
  const waarden = blokkenVanPagina(pageKey);

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data } = await supabase
    .from("content_blocks")
    .select("block_key, value, draft_value, zichtbaar, draft_zichtbaar")
    .eq("page_key", pageKey);

  for (const rij of data ?? []) {
    // Ook de schakelaar kent een concept: de voorvertoning laat zien wat er
    // ná publiceren staat, niet wat er nu online staat.
    if (!(rij.draft_zichtbaar ?? rij.zichtbaar)) {
      waarden.delete(rij.block_key);
      continue;
    }
    // Een concept wint van de gepubliceerde waarde; is er geen concept, dan
    // toont de voorvertoning wat er nu online staat.
    const waarde = rij.draft_value ?? rij.value;
    waarden.set(rij.block_key, waarde as unknown as BlokWaarde);
  }

  return maakPagina(waarden);
}

/** Alle pagina's waarvan blokken bestaan — voor de site-editor in Fase 6. */
export function bekendePaginas() {
  return [...new Set(BLOKKEN.map((blok) => blok.page_key))];
}
