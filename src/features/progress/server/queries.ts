import "server-only";

import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";

/**
 * Voortgang van de ingelogde gebruiker (BOUWPROMPT §11 en §12).
 *
 * Waarom hier wél op `profile_id` wordt gefilterd
 * ------------------------------------------------
 * Eerder stond hier dat dat niet hoefde, omdat RLS per definitie alleen de
 * eigen rijen levert. Dat klopt voor een klant, maar niet voor een beheerder:
 * die mág de voortgang van klanten inzien voor de monitoring, en zag daardoor
 * in zijn éigen portaal de gegevens van anderen staan alsof het de zijne
 * waren. De beheerder is immers ook gewoon portaalgebruiker.
 *
 * RLS bewaakt wat mág; de query hoort te zeggen wat we wíllen. Dat zijn twee
 * verschillende dingen, en alleen het eerste is geen vervanging voor het
 * tweede.
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
  const gebruiker = await huidigeGebruiker(supabase);
  const kaart = new Map<string, ItemVoortgang>();
  if (!gebruiker) return kaart;

  // Naast RLS, want een beheerder mag de voortgang van klanten inzien voor de
  // monitoring — die hoort niet in zijn eigen portaal op te duiken.
  const { data } = await supabase
    .from("progress")
    .select("content_item_id, last_position_seconds, completed_at")
    .eq("profile_id", gebruiker.id);

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
  const gebruiker = await huidigeGebruiker(supabase);
  if (!gebruiker) return null;

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
    .eq("profile_id", gebruiker.id)
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
 * `content_items` levert door RLS alleen items waar de klant bij mag, dus de
 * teller klopt vanzelf: een opleiding die niet betaald is, levert geen items
 * en dus geen voortgang.
 *
 * Voor een beheerder levert diezelfde query álle items op. Dat valt hier niet
 * op omdat het portaal de voortgang alleen toont bij de opleidingen uit
 * `haalMijnOpleidingen`, en die is wél op de eigen inschrijvingen gefilterd.
 * Wie deze functie ooit ergens anders gebruikt, moet daar rekening mee houden.
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
    .eq("profile_id", gebruiker.id)
    .in("status", ["betaald", "afgerond"]);

  return (count ?? 0) > 0;
}
