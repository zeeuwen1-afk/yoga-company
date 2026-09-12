import type { CourseType } from "@/lib/supabase/types";

/**
 * De soorten aanbod, en wat de site per soort moet weten.
 *
 * Dit bestond niet, en dat was te zien: op veertien plekken stond
 * `type === "opleiding" ? iets : iets anders`. Zolang er twee soorten waren
 * klopte dat. Bij een derde soort gaat elke plek stilzwijgend fout: een
 * workshop werd dan een training genoemd en wees naar /trainingen, zonder dat
 * iets faalt. Fouten die niets kapotmaken maar wel het verkeerde tonen zijn de
 * ergste soort, want niemand vindt ze.
 *
 * Daarom één tabel, en `Record<CourseType, …>` eronder. Komt er ooit een soort
 * bij in `CourseType`, dan weigert de typecontrole tot hij hier ook een pad en
 * een naam heeft.
 */

export type SoortInfo = {
  /** Het adres van het overzicht, en de map waar de detailpagina's onder staan. */
  pad: string;
  /** Hoe één ervan heet, op de kaart in het overzicht. */
  enkelvoud: string;
  /** Hoe ze samen heten, in de kruimel terug naar het overzicht. */
  meervoud: string;
  /**
   * Het blok met de kruimeltekst bij de vaste teksten van de cursuspagina's.
   * De beheerder kan het woord daar aanpassen; dit is welk veld dat is.
   */
  kruimelBlok: string;
  /** De paginasleutel van het overzicht in de site-editor. */
  overzichtSleutel: string;
};

export const SOORT_INFO: Record<CourseType, SoortInfo> = {
  opleiding: {
    pad: "/opleidingen",
    enkelvoud: "Opleiding",
    meervoud: "Opleidingen",
    kruimelBlok: "kop_kruimel_opleiding",
    overzichtSleutel: "opleidingen",
  },
  training: {
    pad: "/trainingen",
    enkelvoud: "Training",
    meervoud: "Trainingen",
    kruimelBlok: "kop_kruimel_training",
    overzichtSleutel: "trainingen",
  },
  workshop: {
    pad: "/workshops",
    enkelvoud: "Workshop",
    meervoud: "Workshops",
    kruimelBlok: "kop_kruimel_workshop",
    overzichtSleutel: "workshops",
  },
};

/**
 * De soorten in de volgorde waarin ze in het beheer te kiezen zijn.
 *
 * Een vaste lijst en geen `Object.keys`, omdat het invoerschema van het
 * beheerformulier een lijst nodig heeft die al tijdens het typen vaststaat.
 * Dat de lijst en de tabel hierboven gelijk blijven, bewaakt de test.
 */
export const SOORTEN = ["opleiding", "training", "workshop"] as const;

/** Het adres van het overzicht van deze soort. */
export function soortPad(type: CourseType): string {
  return SOORT_INFO[type].pad;
}

/** Het adres van de pagina van één cursus. */
export function cursusPad(type: CourseType, slug: string): string {
  return `${SOORT_INFO[type].pad}/${slug}`;
}

/**
 * Leest een opgeslagen waarde uit. Alles wat geen bekende soort is wordt null.
 * Een onbekende waarde in de database mag geen kapotte pagina opleveren.
 */
export function leesSoort(waarde: unknown): CourseType | null {
  if (typeof waarde !== "string") return null;
  const opgeschoond = waarde.trim().toLowerCase();
  return (SOORTEN as readonly string[]).includes(opgeschoond)
    ? (opgeschoond as CourseType)
    : null;
}
