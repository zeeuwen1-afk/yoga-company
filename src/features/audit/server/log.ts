import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/lib/supabase/types";

/**
 * Het audit log (BOUWPROMPT §13, §17).
 *
 * Elke mutatie die een beheerder op klantgegevens, inschrijvingen, content of
 * instellingen doet, hoort hier terecht te komen. Het log is onveranderlijk:
 * RLS staat alleen lezen en toevoegen toe, ook voor beheerders zelf.
 *
 * In `meta` gaat de reden en de context, nooit de volledige inhoud van wat er
 * veranderde: dat zou het log tot een tweede kopie van de persoonsgegevens
 * maken (§17.11).
 */

export type AuditActie =
  | "klant_uitgenodigd"
  | "klant_bijgewerkt"
  | "klant_gedeactiveerd"
  | "klant_geactiveerd"
  | "klant_geanonimiseerd"
  | "klant_geexporteerd"
  | "rol_gewijzigd"
  | "notitie_toegevoegd"
  | "notitie_verwijderd"
  | "enrollment_aangemaakt"
  | "enrollment_handmatig_betaald"
  | "enrollment_geannuleerd"
  | "betaallink_gemaakt"
  | "terugbetaling_verwerkt"
  | "aanbod_aangemaakt"
  | "aanbod_bijgewerkt"
  | "aanbod_gedeactiveerd"
  | "aanbod_verwijderd"
  | "les_verwijderd"
  | "content_toegevoegd"
  | "content_verwijderd"
  | "bestand_geupload"
  | "aanvraag_status_gewijzigd"
  | "bericht_verstuurd"
  | "contactbericht_verwijderd"
  | "blok_gepubliceerd"
  | "social_gegenereerd"
  | "social_bewaard"
  | "social_gepubliceerd"
  | "social_verwijderd"
  | "mailing_bewaard"
  | "mailing_verstuurd"
  | "mailing_verwijderd"
  | "mailing_afmelding"
  | "les_aangemaakt"
  | "les_bijgewerkt"
  | "les_afgelast"
  | "aanwezigheid_gemarkeerd"
  | "wachtwoordherstel_verstuurd"
  | "tweestaps_hersteld"
  | "gezondheid_ingezien"
  | "gezondheid_bijgewerkt"
  | "gezondheid_gewist"
  | "gespreksverslag_gemaakt"
  | "gespreksverslag_verwijderd"
  | "bewaartermijnen_opgeschoond";

export async function schrijfAudit(
  supabase: SupabaseClient<Database>,
  invoer: {
    actorId: string | null;
    actie: AuditActie;
    entiteit: string;
    entiteitId?: string | null;
    meta?: Record<string, Json>;
  },
) {
  const { error } = await supabase.from("audit_log").insert({
    actor_id: invoer.actorId,
    action: invoer.actie,
    entity: invoer.entiteit,
    entity_id: invoer.entiteitId ?? null,
    meta: (invoer.meta ?? null) as Json,
  });

  if (error) {
    // Een mislukte logregel mag de handeling niet terugdraaien — die is al
    // gebeurd. Wel luid melden, want een gat in het log is een probleem.
    console.error(
      `[audit] regel niet weggeschreven (${invoer.actie}): ${error.message}`,
    );
  }
}
