import "server-only";

import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";

/**
 * Voortgang van de ingelogde klant (BOUWPROMPT §11 en §12).
 *
 * Alle queries hieronder lezen zonder filter op `profile_id`: dat hoeft niet,
 * want RLS levert per definitie alleen de eigen rijen. Zou hier ooit een fout
 * in sluipen, dan blijft de klantscheiding overeind.
 */

export type ItemVoortgang = {
  contentItemId: string;
  positieSeconden: number;
  afgerondOp: string | null;
};

export type CursusVoortgang = {
  totaalItems: number;
  afgerondItems: number;
  percentage: number;
};

/** Voortgang per content-item, als kaart voor snelle opzoeking. */
export async function haalVoortgang(): Promise<Map<string, ItemVoortgang>> {
  const supabase = await createClient();
  const kaart = new Map<string, ItemVoortgang>();

  const { data } = await supabase
    .from("progress")
    .select("content_item_id, last_position_seconds, completed_at");

  for (const rij of data ?? []) {
    kaart.set(rij.content_item_id, {
      contentItemId: rij.content_item_id,
      positieSeconden: rij.last_position_seconds,
      afgerondOp: rij.completed_at,
    });
  }

  return kaart;
}

/**
 * Het laatst bekeken item, voor "verder waar je gebleven was" op het dashboard.
 * Afgeronde items tellen niet mee: daar wil niemand naar terug.
 */
export async function haalLaatstBekeken() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("progress")
    .select(
      `content_item_id, last_position_seconds, updated_at,
       content_items!inner (
         id, title, kind, duration_seconds,
         lessons!inner (
           id, title,
           course_modules!inner (
             id, title,
             courses!inner (id, title, slug)
           )
         )
       )`,
    )
    .is("completed_at", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  const item = Array.isArray(data.content_items)
    ? data.content_items[0]
    : data.content_items;
  if (!item) return null;

  const les = Array.isArray(item.lessons) ? item.lessons[0] : item.lessons;
  const leermodule = Array.isArray(les?.course_modules)
    ? les?.course_modules[0]
    : les?.course_modules;
  const cursus = Array.isArray(leermodule?.courses)
    ? leermodule?.courses[0]
    : leermodule?.courses;

  if (!cursus) return null;

  return {
    itemId: item.id,
    itemTitel: item.title,
    kind: item.kind,
    positieSeconden: data.last_position_seconds,
    duurSeconden: item.duration_seconds,
    cursusTitel: cursus.title,
    cursusSlug: cursus.slug,
  };
}

/**
 * Voortgang per opleiding: hoeveel van de items zijn afgerond.
 *
 * Let op: `content_items` levert door RLS alleen items waar de klant bij mag.
 * De teller klopt daarmee vanzelf — een opleiding die niet betaald is, levert
 * geen items en dus geen voortgang.
 */
export async function haalCursusVoortgang(): Promise<
  Map<string, CursusVoortgang>
> {
  const supabase = await createClient();
  const kaart = new Map<string, CursusVoortgang>();

  const { data: items } = await supabase.from("content_items").select(
    `id,
     lessons!inner (
       course_modules!inner (course_id)
     )`,
  );

  if (!items) return kaart;

  const voortgang = await haalVoortgang();

  for (const item of items) {
    const les = Array.isArray(item.lessons) ? item.lessons[0] : item.lessons;
    const leermodule = Array.isArray(les?.course_modules)
      ? les?.course_modules[0]
      : les?.course_modules;
    const cursusId = leermodule?.course_id;
    if (!cursusId) continue;

    const huidig = kaart.get(cursusId) ?? {
      totaalItems: 0,
      afgerondItems: 0,
      percentage: 0,
    };

    huidig.totaalItems += 1;
    if (voortgang.get(item.id)?.afgerondOp) huidig.afgerondItems += 1;
    huidig.percentage =
      huidig.totaalItems === 0
        ? 0
        : Math.round((huidig.afgerondItems / huidig.totaalItems) * 100);

    kaart.set(cursusId, huidig);
  }

  return kaart;
}

/** Aantal opleidingen waar de klant toegang toe heeft. */
export async function heeftToegangTotContent(): Promise<boolean> {
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);
  if (!gebruiker) return false;

  const { count } = await supabase
    .from("enrollments")
    .select("id", { count: "exact", head: true })
    .in("status", ["betaald", "afgerond"]);

  return (count ?? 0) > 0;
}
