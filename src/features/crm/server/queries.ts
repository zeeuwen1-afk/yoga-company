import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { EnrollmentStatus, UserRole } from "@/lib/supabase/types";

/**
 * Klantgegevens voor de beheeromgeving (BOUWPROMPT §13).
 *
 * Alleen bereikbaar voor beheerders; RLS weigert deze queries voor iedereen
 * anders. Er wordt hier dus niet nogmaals op rol gefilterd — dat zou de indruk
 * wekken dat de beveiliging hier zit, en dat is niet zo.
 */

export type KlantRij = {
  id: string;
  voornaam: string;
  achternaam: string;
  email: string;
  telefoon: string | null;
  rol: UserRole;
  actief: boolean;
  toestemmingOp: string | null;
  aangemaaktOp: string;
  aantalInschrijvingen: number;
  aantalBetaald: number;
};

export type KlantFilter = {
  zoek?: string;
  rol?: UserRole;
  status?: "actief" | "gedeactiveerd";
};

export async function haalKlanten(filter: KlantFilter = {}) {
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select(
      "id, first_name, last_name, email, phone, role, deleted_at, marketing_consent_at, created_at, enrollments (status)",
    )
    .order("created_at", { ascending: false });

  if (filter.rol) query = query.eq("role", filter.rol);
  if (filter.status === "actief") query = query.is("deleted_at", null);
  if (filter.status === "gedeactiveerd")
    query = query.not("deleted_at", "is", null);

  if (filter.zoek) {
    // Zoeken op naam of e-mail. Het patroon wordt door PostgREST als waarde
    // meegestuurd, niet als SQL, dus injectie is niet mogelijk.
    const term = `%${filter.zoek.trim()}%`;
    query = query.or(
      `first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term}`,
    );
  }

  const { data } = await query;

  return (data ?? []).map((rij): KlantRij => {
    const inschrijvingen = (rij.enrollments ?? []) as {
      status: EnrollmentStatus;
    }[];
    return {
      id: rij.id,
      voornaam: rij.first_name,
      achternaam: rij.last_name,
      email: rij.email,
      telefoon: rij.phone,
      rol: rij.role,
      actief: rij.deleted_at === null,
      toestemmingOp: rij.marketing_consent_at,
      aangemaaktOp: rij.created_at,
      aantalInschrijvingen: inschrijvingen.length,
      aantalBetaald: inschrijvingen.filter(
        (inschrijving) =>
          inschrijving.status === "betaald" ||
          inschrijving.status === "afgerond",
      ).length,
    };
  });
}

/** Volledig klantdossier voor de detailpagina. */
export async function haalKlantDossier(profileId: string) {
  const supabase = await createClient();

  const [
    profiel,
    inschrijvingen,
    notities,
    aanvragen,
    gesprek,
    voortgang,
    boekingen,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, first_name, last_name, email, phone, role, deleted_at, marketing_consent_at, created_at, birth_date, city, how_found, experience_level, goals, interests",
      )
      .eq("id", profileId)
      .maybeSingle(),
    supabase
      .from("enrollments")
      .select(
        "id, status, amount_cents, paid_at, created_at, courses!inner (id, title, slug)",
      )
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false }),
    supabase
      .from("crm_notes")
      .select(
        "id, body, kind, title, created_at, profiles!crm_notes_author_id_fkey (first_name, last_name)",
      )
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false }),
    supabase
      .from("requests")
      .select("id, kind, body, status, created_at, closed_at")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false }),
    supabase
      .from("conversations")
      .select("id, messages (id, body, sender_id, created_at, read_at)")
      .eq("profile_id", profileId)
      .maybeSingle(),
    supabase
      .from("progress")
      .select(
        "content_item_id, last_position_seconds, completed_at, updated_at",
      )
      .eq("profile_id", profileId),
    supabase
      .from("bookings")
      .select(
        "id, status, created_at, class_sessions!inner (id, title, starts_at, location)",
      )
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  if (!profiel.data) return null;

  const eenNaam = (relatie: unknown) => {
    const rij = Array.isArray(relatie) ? relatie[0] : relatie;
    const persoon = rij as { first_name?: string; last_name?: string } | null;
    return persoon ? `${persoon.first_name} ${persoon.last_name}` : null;
  };

  const eenCursus = (relatie: unknown) => {
    const rij = Array.isArray(relatie) ? relatie[0] : relatie;
    return rij as { id: string; title: string; slug: string } | null;
  };

  return {
    profiel: {
      id: profiel.data.id,
      voornaam: profiel.data.first_name,
      achternaam: profiel.data.last_name,
      email: profiel.data.email,
      telefoon: profiel.data.phone,
      geboortedatum: profiel.data.birth_date,
      woonplaats: profiel.data.city,
      hoeGevonden: profiel.data.how_found,
      ervaring: profiel.data.experience_level,
      doelen: profiel.data.goals,
      interesses: profiel.data.interests ?? [],
      rol: profiel.data.role,
      actief: profiel.data.deleted_at === null,
      gedeactiveerdOp: profiel.data.deleted_at,
      toestemmingOp: profiel.data.marketing_consent_at,
      aangemaaktOp: profiel.data.created_at,
    },
    inschrijvingen: (inschrijvingen.data ?? []).flatMap((rij) => {
      const cursus = eenCursus(rij.courses);
      if (!cursus) return [];
      return [
        {
          id: rij.id,
          status: rij.status,
          bedragCenten: rij.amount_cents,
          betaaldOp: rij.paid_at,
          aangemaaktOp: rij.created_at,
          cursusId: cursus.id,
          cursusTitel: cursus.title,
          cursusSlug: cursus.slug,
        },
      ];
    }),
    notities: (notities.data ?? []).map((rij) => ({
      id: rij.id,
      soort: rij.kind,
      titel: rij.title,
      tekst: rij.body,
      geschrevenOp: rij.created_at,
      auteur: eenNaam(rij.profiles),
    })),
    aanvragen: (aanvragen.data ?? []).map((rij) => ({
      id: rij.id,
      soort: rij.kind,
      toelichting: rij.body,
      status: rij.status,
      ingediendOp: rij.created_at,
      afgerondOp: rij.closed_at,
    })),
    gesprek: gesprek.data
      ? {
          id: gesprek.data.id,
          berichten: [...(gesprek.data.messages ?? [])]
            .sort((a, b) => a.created_at.localeCompare(b.created_at))
            .map((bericht) => ({
              id: bericht.id,
              tekst: bericht.body,
              vanKlant: bericht.sender_id === profileId,
              verstuurdOp: bericht.created_at,
              gelezenOp: bericht.read_at,
            })),
        }
      : null,
    boekingen: (boekingen.data ?? []).flatMap((rij) => {
      const les = Array.isArray(rij.class_sessions)
        ? rij.class_sessions[0]
        : rij.class_sessions;
      if (!les) return [];
      return [
        {
          id: rij.id,
          status: rij.status,
          geboektOp: rij.created_at,
          lesId: les.id,
          lesTitel: les.title,
          begintOp: les.starts_at,
          locatie: les.location,
        },
      ];
    }),
    voortgang: {
      aantalItems: (voortgang.data ?? []).length,
      aantalAfgerond: (voortgang.data ?? []).filter((rij) => rij.completed_at)
        .length,
      laatstActiefOp:
        (voortgang.data ?? [])
          .map((rij) => rij.updated_at)
          .sort()
          .at(-1) ?? null,
    },
  };
}

export type KlantDossier = NonNullable<
  Awaited<ReturnType<typeof haalKlantDossier>>
>;

/**
 * Heeft deze klant een authenticator-app gekoppeld?
 *
 * De factoren staan in het `auth`-schema en zijn niet via RLS te lezen; dit
 * loopt daarom via de Admin-API. Ontbreekt de service-role sleutel, dan geven
 * we `null` terug — "onbekend" — zodat de klantenkaart gewoon rendert en de
 * knop niet ten onrechte meldt dat er niets ingesteld staat.
 */
export async function heeftTweestapsverificatie(
  profileId: string,
): Promise<boolean | null> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.mfa.listFactors({
      userId: profileId,
    });
    if (error) return null;
    return (data?.factors ?? []).length > 0;
  } catch {
    return null;
  }
}

/**
 * De gezondheidsgegevens van een klant.
 *
 * Loopt via `haal_gezondheid`, want het schema `sensitive` is niet via de API
 * bereikbaar. Die functie controleert zelf of de aanroeper beheerder is en
 * schrijft de inzage in het audit log (§8.3).
 */
export async function haalGezondheid(profileId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("haal_gezondheid", {
    p_profile_id: profileId,
  });

  if (error || !data || data.length === 0) return null;

  const rij = data[0];
  return {
    tekst: rij.body,
    toestemmingOp: rij.consent_at,
    toestemmingNotitie: rij.consent_note,
    bijgewerktOp: rij.updated_at,
  };
}

/** De eerder gemaakte gespreksverslagen, nieuwste eerst. */
export async function haalAnalyses(profileId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("crm_analyses")
    .select("id, body, model, bevat_gezondheid, created_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(10);

  return (data ?? []).map((rij) => ({
    id: rij.id,
    tekst: rij.body,
    model: rij.model,
    bevatGezondheid: rij.bevat_gezondheid,
    gemaaktOp: rij.created_at,
  }));
}
