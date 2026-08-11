import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

export type AuditRegel = {
  id: number;
  actie: string;
  entiteit: string;
  entiteitId: string | null;
  meta: Json | null;
  tijdstip: string;
  actorNaam: string | null;
};

/** Leest het audit log, nieuwste eerst. Alleen zichtbaar voor beheerders. */
export async function haalAuditLog(filters?: {
  entiteit?: string;
  entiteitId?: string;
  actie?: string;
  limiet?: number;
}): Promise<AuditRegel[]> {
  const supabase = await createClient();

  let query = supabase
    .from("audit_log")
    .select(
      "id, action, entity, entity_id, meta, created_at, profiles (first_name, last_name)",
    )
    .order("created_at", { ascending: false })
    .limit(filters?.limiet ?? 100);

  if (filters?.entiteit) query = query.eq("entity", filters.entiteit);
  if (filters?.entiteitId) query = query.eq("entity_id", filters.entiteitId);
  if (filters?.actie) query = query.eq("action", filters.actie);

  const { data } = await query;

  return (data ?? []).map((rij) => {
    const actor = Array.isArray(rij.profiles) ? rij.profiles[0] : rij.profiles;
    return {
      id: rij.id,
      actie: rij.action,
      entiteit: rij.entity,
      entiteitId: rij.entity_id,
      meta: rij.meta,
      tijdstip: rij.created_at,
      actorNaam: actor ? `${actor.first_name} ${actor.last_name}` : null,
    };
  });
}

/** Leesbare omschrijving van een actie, voor het scherm. */
export const ACTIE_LABEL: Record<string, string> = {
  klant_uitgenodigd: "Klant uitgenodigd",
  klant_bijgewerkt: "Klantgegevens gewijzigd",
  klant_gedeactiveerd: "Account gedeactiveerd",
  klant_geactiveerd: "Account weer geactiveerd",
  klant_geanonimiseerd: "Gegevens geanonimiseerd (AVG)",
  klant_geexporteerd: "Gegevens geëxporteerd",
  rol_gewijzigd: "Rol gewijzigd",
  notitie_toegevoegd: "Notitie toegevoegd",
  notitie_verwijderd: "Notitie verwijderd",
  enrollment_aangemaakt: "Inschrijving aangemaakt",
  enrollment_handmatig_betaald: "Handmatig op betaald gezet",
  enrollment_geannuleerd: "Inschrijving geannuleerd",
  betaallink_gemaakt: "Betaallink gemaakt",
  terugbetaling_verwerkt: "Terugbetaling verwerkt",
  aanbod_aangemaakt: "Aanbod toegevoegd",
  aanbod_bijgewerkt: "Aanbod gewijzigd",
  aanbod_gedeactiveerd: "Aanbod gedeactiveerd",
  content_toegevoegd: "Lesmateriaal toegevoegd",
  content_verwijderd: "Lesmateriaal verwijderd",
  bestand_geupload: "Bestand geüpload",
  aanvraag_status_gewijzigd: "Aanvraagstatus gewijzigd",
  bericht_verstuurd: "Bericht verstuurd",
  contactbericht_verwijderd: "Contactbericht verwijderd",
  blok_gepubliceerd: "Sitewijziging gepubliceerd",
};
