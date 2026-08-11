"use server";

import { revalidatePath } from "next/cache";

import { schrijfAudit } from "@/features/audit";
import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";
import type { RequestStatus } from "@/lib/supabase/types";

/** Aanvragen behandelen (BOUWPROMPT §13). */
export async function zetAanvraagStatus(
  aanvraagId: string,
  status: RequestStatus,
) {
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);

  if (!gebruiker) {
    return { status: "fout" as const, bericht: "Je sessie is verlopen." };
  }

  const { error } = await supabase
    .from("requests")
    .update({
      status,
      handled_by: gebruiker.id,
      closed_at: status === "afgerond" ? new Date().toISOString() : null,
    })
    .eq("id", aanvraagId);

  if (error) {
    return {
      status: "fout" as const,
      bericht: "De status kon niet worden gewijzigd.",
    };
  }

  await schrijfAudit(supabase, {
    actorId: gebruiker.id,
    actie: "aanvraag_status_gewijzigd",
    entiteit: "requests",
    entiteitId: aanvraagId,
    meta: { nieuweStatus: status },
  });

  revalidatePath("/admin/aanvragen");
  revalidatePath("/portaal", "layout");
  return { status: "gelukt" as const, bericht: "Status bijgewerkt." };
}

/** Verwijdert een contactbericht (bewaartermijn 12 maanden, §17.6). */
export async function verwijderContactbericht(berichtId: string) {
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);

  if (!gebruiker) {
    return { status: "fout" as const, bericht: "Je sessie is verlopen." };
  }

  const { error } = await supabase
    .from("contact_messages")
    .delete()
    .eq("id", berichtId);

  if (error) {
    return {
      status: "fout" as const,
      bericht: "Het bericht kon niet worden verwijderd.",
    };
  }

  await schrijfAudit(supabase, {
    actorId: gebruiker.id,
    actie: "contactbericht_verwijderd",
    entiteit: "contact_messages",
    entiteitId: berichtId,
  });

  revalidatePath("/admin/contactberichten");
  return { status: "gelukt" as const, bericht: "Bericht verwijderd." };
}
