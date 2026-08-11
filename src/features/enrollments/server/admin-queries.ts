import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { EnrollmentStatus } from "@/lib/supabase/types";

/** Inschrijvingen voor de beheeromgeving (BOUWPROMPT §13). */

export type InschrijvingRij = {
  id: string;
  status: EnrollmentStatus;
  bedragCenten: number | null;
  betaaldOp: string | null;
  aangemaaktOp: string;
  klantId: string;
  klantNaam: string;
  klantEmail: string;
  cursusTitel: string;
  cursusPrijsCenten: number;
};

export async function haalInschrijvingen(
  filter: {
    status?: EnrollmentStatus;
    cursusId?: string;
  } = {},
) {
  const supabase = await createClient();

  let query = supabase
    .from("enrollments")
    .select(
      `id, status, amount_cents, paid_at, created_at,
       profiles!inner (id, first_name, last_name, email),
       courses!inner (id, title, price_cents)`,
    )
    .order("created_at", { ascending: false });

  if (filter.status) query = query.eq("status", filter.status);
  if (filter.cursusId) query = query.eq("course_id", filter.cursusId);

  const { data } = await query;

  return (data ?? []).flatMap((rij): InschrijvingRij[] => {
    const klant = Array.isArray(rij.profiles) ? rij.profiles[0] : rij.profiles;
    const cursus = Array.isArray(rij.courses) ? rij.courses[0] : rij.courses;
    if (!klant || !cursus) return [];

    return [
      {
        id: rij.id,
        status: rij.status,
        bedragCenten: rij.amount_cents,
        betaaldOp: rij.paid_at,
        aangemaaktOp: rij.created_at,
        klantId: klant.id,
        klantNaam: `${klant.first_name} ${klant.last_name}`,
        klantEmail: klant.email,
        cursusTitel: cursus.title,
        cursusPrijsCenten: cursus.price_cents,
      },
    ];
  });
}

/**
 * Voortgangsmatrix per opleiding: deelnemers × lesonderdelen (§12).
 *
 * Beheerders zien via RLS alle voortgang; klanten alleen die van henzelf.
 */
export async function haalVoortgangsmatrix(cursusSlug: string) {
  const supabase = await createClient();

  const { data: cursus } = await supabase
    .from("courses")
    .select("id, title, slug")
    .eq("slug", cursusSlug)
    .maybeSingle();

  if (!cursus) return null;

  const [items, deelnemers, voortgang] = await Promise.all([
    supabase
      .from("content_items")
      .select(
        "id, title, sort, lessons!inner (sort, course_modules!inner (course_id, title, sort))",
      ),
    supabase
      .from("enrollments")
      .select(
        "profile_id, status, profiles!inner (first_name, last_name, email)",
      )
      .eq("course_id", cursus.id)
      .in("status", ["betaald", "afgerond"]),
    supabase
      .from("progress")
      .select("profile_id, content_item_id, completed_at, updated_at"),
  ]);

  const eenModule = (relatie: unknown) => {
    const les = Array.isArray(relatie) ? relatie[0] : relatie;
    const leermodule = (les as { course_modules?: unknown } | null)
      ?.course_modules;
    const rij = Array.isArray(leermodule) ? leermodule[0] : leermodule;
    return rij as { course_id: string; title: string; sort: number } | null;
  };

  // Alleen de items van deze opleiding, in de juiste volgorde.
  const kolommen = (items.data ?? [])
    .flatMap((item) => {
      const leermodule = eenModule(item.lessons);
      if (!leermodule || leermodule.course_id !== cursus.id) return [];
      return [
        {
          id: item.id,
          titel: item.title,
          moduleTitel: leermodule.title,
          moduleSort: leermodule.sort,
          sort: item.sort,
        },
      ];
    })
    .sort((a, b) => a.moduleSort - b.moduleSort || a.sort - b.sort);

  const voortgangKaart = new Map<
    string,
    { afgerond: boolean; bijgewerkt: string }
  >();
  for (const rij of voortgang.data ?? []) {
    voortgangKaart.set(`${rij.profile_id}:${rij.content_item_id}`, {
      afgerond: Boolean(rij.completed_at),
      bijgewerkt: rij.updated_at,
    });
  }

  const rijen = (deelnemers.data ?? []).flatMap((rij) => {
    const klant = Array.isArray(rij.profiles) ? rij.profiles[0] : rij.profiles;
    if (!klant) return [];

    const standen = kolommen.map((kolom) => {
      const stand = voortgangKaart.get(`${rij.profile_id}:${kolom.id}`);
      if (!stand) return "niet_gestart" as const;
      return stand.afgerond ? ("afgerond" as const) : ("bezig" as const);
    });

    const laatstActief = kolommen
      .map(
        (kolom) =>
          voortgangKaart.get(`${rij.profile_id}:${kolom.id}`)?.bijgewerkt,
      )
      .filter(Boolean)
      .sort()
      .at(-1) as string | undefined;

    return [
      {
        profileId: rij.profile_id,
        naam: `${klant.first_name} ${klant.last_name}`,
        email: klant.email,
        standen,
        afgerond: standen.filter((stand) => stand === "afgerond").length,
        laatstActiefOp: laatstActief ?? null,
      },
    ];
  });

  return { cursus, kolommen, rijen };
}

export type Voortgangsmatrix = NonNullable<
  Awaited<ReturnType<typeof haalVoortgangsmatrix>>
>;
