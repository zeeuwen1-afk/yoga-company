import "server-only";

import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";
import type { ContentKind } from "@/lib/supabase/types";

/**
 * Digitale content van een opleiding (BOUWPROMPT §12).
 *
 * De structuur is course → modules → lessen → items. RLS levert uitsluitend
 * items waar de klant recht op heeft: proeflessen voor iedereen, de rest
 * alleen na een betaalde inschrijving. Er hoeft hier dus niets op toegang te
 * worden gefilterd — en dat is precies de bedoeling, want een vergeten filter
 * zou anders content lekken.
 */

export type ContentItem = {
  id: string;
  titel: string;
  kind: ContentKind;
  body: string | null;
  storagePad: string | null;
  duurSeconden: number | null;
  isPreview: boolean;
};

export type Les = { id: string; titel: string; items: ContentItem[] };
export type Module = { id: string; titel: string; lessen: Les[] };

export type Lesmateriaal = {
  cursusId: string;
  cursusTitel: string;
  cursusSlug: string;
  modules: Module[];
  /** Alle items achter elkaar, voor vorige/volgende-navigatie. */
  volgorde: ContentItem[];
};

export async function haalLesmateriaal(
  cursusSlug: string,
): Promise<Lesmateriaal | null> {
  const supabase = await createClient();

  const { data: cursus } = await supabase
    .from("courses")
    .select("id, title, slug")
    .eq("slug", cursusSlug)
    .maybeSingle();

  if (!cursus) return null;

  const { data: modules } = await supabase
    .from("course_modules")
    .select(
      `id, title, sort,
       lessons (
         id, title, sort,
         content_items (
           id, title, kind, body, storage_path, duration_seconds, is_preview, sort
         )
       )`,
    )
    .eq("course_id", cursus.id)
    .order("sort", { ascending: true });

  const opgebouwd: Module[] = (modules ?? [])
    .map((module) => ({
      id: module.id,
      titel: module.title,
      lessen: [...(module.lessons ?? [])]
        .sort((a, b) => a.sort - b.sort)
        .map((les) => ({
          id: les.id,
          titel: les.title,
          items: [...(les.content_items ?? [])]
            .sort((a, b) => a.sort - b.sort)
            .map((item) => ({
              id: item.id,
              titel: item.title,
              kind: item.kind,
              body: item.body,
              storagePad: item.storage_path,
              duurSeconden: item.duration_seconds,
              isPreview: item.is_preview,
            })),
        }))
        // Lessen zonder zichtbare items tonen we niet: dat zijn lessen
        // waarvoor de klant (nog) geen toegang heeft.
        .filter((les) => les.items.length > 0),
    }))
    .filter((module) => module.lessen.length > 0);

  return {
    cursusId: cursus.id,
    cursusTitel: cursus.title,
    cursusSlug: cursus.slug,
    modules: opgebouwd,
    volgorde: opgebouwd.flatMap((module) =>
      module.lessen.flatMap((les) => les.items),
    ),
  };
}

/** Eén item met zijn buren, voor de contentspeler. */
export async function haalItemMetBuren(cursusSlug: string, itemId: string) {
  const materiaal = await haalLesmateriaal(cursusSlug);
  if (!materiaal) return null;

  const index = materiaal.volgorde.findIndex((item) => item.id === itemId);
  if (index === -1) return null;

  return {
    materiaal,
    item: materiaal.volgorde[index]!,
    vorige: index > 0 ? materiaal.volgorde[index - 1]! : null,
    volgende:
      index < materiaal.volgorde.length - 1
        ? materiaal.volgorde[index + 1]!
        : null,
    positie: index + 1,
    totaal: materiaal.volgorde.length,
  };
}

/** De opleidingen waar de klant lesmateriaal van heeft. */
export async function haalMijnOpleidingen() {
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);
  if (!gebruiker) return [];

  const { data } = await supabase
    .from("enrollments")
    .select(
      `id, status, created_at, paid_at,
       courses!inner (id, title, slug, summary, type, has_digital_content)`,
    )
    .eq("profile_id", gebruiker.id)
    .in("status", ["betaald", "afgerond"])
    .order("created_at", { ascending: false });

  return (data ?? []).flatMap((rij) => {
    const cursus = Array.isArray(rij.courses) ? rij.courses[0] : rij.courses;
    if (!cursus) return [];

    return [
      {
        enrollmentId: rij.id,
        status: rij.status,
        cursusId: cursus.id,
        titel: cursus.title,
        slug: cursus.slug,
        samenvatting: cursus.summary,
        type: cursus.type,
        heeftContent: cursus.has_digital_content,
      },
    ];
  });
}
