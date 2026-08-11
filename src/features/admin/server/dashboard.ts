import "server-only";

import { createClient } from "@/lib/supabase/server";

/** Kerncijfers voor het beheerdashboard (BOUWPROMPT §13). */
export async function haalDashboard() {
  const supabase = await createClient();

  const beginVanDeMaand = new Date();
  beginVanDeMaand.setDate(1);
  beginVanDeMaand.setHours(0, 0, 0, 0);

  const [
    nieuweInschrijvingen,
    openAanvragen,
    ongelezenBerichten,
    omzetRijen,
    contactberichten,
    klanten,
  ] = await Promise.all([
    supabase
      .from("enrollments")
      .select(
        "id, status, created_at, profiles!inner (id, first_name, last_name), courses!inner (title)",
      )
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("requests")
      .select("id", { count: "exact", head: true })
      .neq("status", "afgerond"),
    supabase
      .from("messages")
      .select("id, conversation_id", { count: "exact", head: true })
      .is("read_at", null),
    supabase
      .from("enrollments")
      .select("amount_cents")
      .eq("status", "betaald")
      .gte("paid_at", beginVanDeMaand.toISOString()),
    supabase
      .from("contact_messages")
      .select("id, name, email, body, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("role", "klant"),
  ]);

  const eenNaam = (relatie: unknown) => {
    const rij = Array.isArray(relatie) ? relatie[0] : relatie;
    const persoon = rij as {
      id?: string;
      first_name?: string;
      last_name?: string;
    } | null;
    return persoon
      ? {
          id: persoon.id ?? "",
          naam: `${persoon.first_name} ${persoon.last_name}`,
        }
      : null;
  };

  const eenTitel = (relatie: unknown) => {
    const rij = Array.isArray(relatie) ? relatie[0] : relatie;
    return (rij as { title?: string } | null)?.title ?? "";
  };

  return {
    aantalKlanten: klanten.count ?? 0,
    openAanvragen: openAanvragen.count ?? 0,
    ongelezenBerichten: ongelezenBerichten.count ?? 0,
    omzetDezeMaandCenten: (omzetRijen.data ?? []).reduce(
      (totaal, rij) => totaal + (rij.amount_cents ?? 0),
      0,
    ),
    nieuweInschrijvingen: (nieuweInschrijvingen.data ?? []).flatMap((rij) => {
      const klant = eenNaam(rij.profiles);
      if (!klant) return [];
      return [
        {
          id: rij.id,
          status: rij.status,
          aangemaaktOp: rij.created_at,
          klantId: klant.id,
          klantNaam: klant.naam,
          cursusTitel: eenTitel(rij.courses),
        },
      ];
    }),
    contactberichten: (contactberichten.data ?? []).map((rij) => ({
      id: rij.id,
      naam: rij.name,
      email: rij.email,
      bericht: rij.body,
      ontvangenOp: rij.created_at,
    })),
  };
}
