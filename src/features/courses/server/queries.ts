import "server-only";

import {
  AANBOD,
  type CurriculumModule,
  type CursusSeed,
} from "@/content/aanbod";
import { createPublicClient } from "@/lib/supabase/public";
import type { Course, CourseType } from "@/lib/supabase/types";

/**
 * Het aanbod voor de publieke site.
 *
 * Net als bij de CMS-blokken is de database leidend en is de inhoud uit
 * `src/content/aanbod.ts` de terugval. Zo staat de site er ook zonder database,
 * en toont hij bij een storing het aanbod in plaats van een lege pagina.
 */

export type Cursus = {
  id: string | null;
  type: CourseType;
  titel: string;
  slug: string;
  samenvatting: string;
  beschrijving: string;
  voorWie: string | null;
  toelatingseisen: string | null;
  curriculum: CurriculumModule[];
  studiebelasting: string | null;
  locatie: string | null;
  maxDeelnemers: number | null;
  certificaat: string | null;
  prijsCenten: number;
  digitaleContent: boolean;
};

function uitSeed(seed: CursusSeed): Cursus {
  return {
    id: null,
    type: seed.type,
    titel: seed.titel,
    slug: seed.slug,
    samenvatting: seed.samenvatting,
    beschrijving: seed.beschrijving,
    voorWie: seed.voorWie ?? null,
    toelatingseisen: seed.toelatingseisen ?? null,
    curriculum: seed.curriculum ?? [],
    studiebelasting: seed.studiebelasting ?? null,
    locatie: seed.locatie ?? null,
    maxDeelnemers: seed.maxDeelnemers ?? null,
    certificaat: seed.certificaat ?? null,
    prijsCenten: seed.prijsCenten,
    digitaleContent: seed.digitaleContent,
  };
}

function uitDatabase(rij: Course): Cursus {
  return {
    id: rij.id,
    type: rij.type,
    titel: rij.title,
    slug: rij.slug,
    samenvatting: rij.summary,
    beschrijving: rij.description,
    voorWie: rij.audience,
    toelatingseisen: rij.requirements,
    curriculum: Array.isArray(rij.curriculum)
      ? (rij.curriculum as unknown as CurriculumModule[])
      : [],
    studiebelasting: rij.study_load_text,
    locatie: rij.location,
    maxDeelnemers: rij.max_participants,
    certificaat: rij.certificate_text,
    prijsCenten: rij.price_cents,
    digitaleContent: rij.has_digital_content,
  };
}

async function haalUitDatabase(): Promise<Cursus[] | null> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("is_active", true)
      .order("sort", { ascending: true });

    if (error || !data || data.length === 0) return null;
    return data.map(uitDatabase);
  } catch {
    return null;
  }
}

const seedOpVolgorde = () =>
  [...AANBOD].sort((a, b) => a.sort - b.sort).map(uitSeed);

/** Het volledige actieve aanbod, op de ingestelde volgorde. */
export async function haalAanbod(type?: CourseType): Promise<Cursus[]> {
  const cursussen = (await haalUitDatabase()) ?? seedOpVolgorde();
  return type ? cursussen.filter((cursus) => cursus.type === type) : cursussen;
}

/** Eén cursus op slug, of null wanneer die niet bestaat of inactief is. */
export async function haalCursus(slug: string): Promise<Cursus | null> {
  const cursussen = await haalAanbod();
  return cursussen.find((cursus) => cursus.slug === slug) ?? null;
}

/** Alle slugs, voor het genereren van statische pagina's en de sitemap. */
export async function haalSlugs(type: CourseType): Promise<string[]> {
  const cursussen = await haalAanbod(type);
  return cursussen.map((cursus) => cursus.slug);
}
