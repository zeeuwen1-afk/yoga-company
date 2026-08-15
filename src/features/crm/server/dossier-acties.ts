"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { schrijfAudit } from "@/features/audit";
import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";
import { schrijfGespreksverslag } from "./analyse";
import { haalGezondheid, haalKlantDossier } from "./queries";

/**
 * Gezondheidsgegevens en het gespreksverslag (bouwprompt §7.4, §8.3).
 *
 * Alles hier is uitsluitend voor beheerders. Dat wordt op drie plekken
 * afgedwongen: hier in de code, door RLS op de tabellen, en door de
 * databasefuncties die zelf op `is_admin()` controleren. Eén laag zou genoeg
 * moeten zijn; drie lagen is wat je wilt bij bijzondere persoonsgegevens.
 */

export type DossierResultaat =
  | { status: "idle" }
  | { status: "fout"; bericht: string }
  | { status: "gelukt"; bericht: string };

const GEEN_RECHTEN: DossierResultaat = {
  status: "fout",
  bericht: "Je hebt hier geen rechten voor.",
};

async function vereisAdmin() {
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);
  if (!gebruiker) return null;

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", gebruiker.id)
    .maybeSingle();

  if (data?.role !== "admin") return null;
  return { supabase, adminId: gebruiker.id };
}

// --- Gezondheidsgegevens -----------------------------------------------------

const gezondheidSchema = z.object({
  profile_id: z.uuid(),
  body: z.string().trim().max(4000),
  consent_note: z.string().trim().max(300).optional().or(z.literal("")),
  // De beheerder bevestigt dat de klant hier uitdrukkelijk toestemming voor
  // heeft gegeven. Zonder dat vinkje slaan we niets op: bijzondere
  // persoonsgegevens mogen alleen met uitdrukkelijke toestemming (AVG art. 9).
  toestemming: z.literal("on", {
    message: "Bevestig eerst dat de klant hier toestemming voor heeft gegeven",
  }),
});

export async function bewaarGezondheid(
  _vorige: DossierResultaat,
  formData: FormData,
): Promise<DossierResultaat> {
  const context = await vereisAdmin();
  if (!context) return GEEN_RECHTEN;

  const invoer = Object.fromEntries(formData.entries());
  const leegmaken = String(invoer.body ?? "").trim() === "";

  // Wissen mag zonder het toestemmingsvinkje: iets weghalen is altijd goed.
  const parsed = leegmaken
    ? gezondheidSchema
        .omit({ toestemming: true })
        .safeParse({ ...invoer, body: "" })
    : gezondheidSchema.safeParse(invoer);

  if (!parsed.success) {
    return {
      status: "fout",
      bericht: parsed.error.issues[0]?.message ?? "Controleer de invoer.",
    };
  }

  const { supabase } = context;

  const { error } = await supabase.rpc("bewaar_gezondheid", {
    p_profile_id: parsed.data.profile_id,
    p_body: parsed.data.body,
    p_consent_note: parsed.data.consent_note || null,
  });

  if (error) {
    return {
      status: "fout",
      bericht: "De gegevens konden niet worden opgeslagen.",
    };
  }

  // De databasefunctie schrijft zelf de auditregel, zonder de inhoud erin.
  revalidatePath(`/admin/klanten/${parsed.data.profile_id}`);

  return {
    status: "gelukt",
    bericht: leegmaken
      ? "De gezondheidsgegevens zijn verwijderd."
      : "Opgeslagen. Alleen jij kunt dit inzien.",
  };
}

// --- Het gespreksverslag -----------------------------------------------------

const analyseSchema = z.object({
  profile_id: z.uuid(),
  /** Of de gezondheidsgegevens mee mogen in deze analyse. */
  met_gezondheid: z.string().optional(),
});

export async function maakGespreksverslag(
  _vorige: DossierResultaat,
  formData: FormData,
): Promise<DossierResultaat> {
  const context = await vereisAdmin();
  if (!context) return GEEN_RECHTEN;

  const parsed = analyseSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) {
    return { status: "fout", bericht: "Deze klant kennen we niet." };
  }

  const { supabase, adminId } = context;
  const metGezondheid = parsed.data.met_gezondheid === "on";

  const dossier = await haalKlantDossier(parsed.data.profile_id);
  if (!dossier) {
    return { status: "fout", bericht: "Deze klant bestaat niet." };
  }

  // Alleen ophalen als hij ook echt meegaat: het opvragen wordt gelogd, en een
  // inzage zonder reden hoort niet in dat log te staan.
  const gezondheid = metGezondheid
    ? ((await haalGezondheid(parsed.data.profile_id))?.tekst ?? null)
    : null;

  const uitkomst = await schrijfGespreksverslag({ dossier, gezondheid });

  if (uitkomst.status === "fout") {
    return { status: "fout", bericht: uitkomst.bericht };
  }

  const { error } = await supabase.from("crm_analyses").insert({
    profile_id: parsed.data.profile_id,
    body: uitkomst.tekst,
    model: uitkomst.model,
    bevat_gezondheid: gezondheid !== null,
    created_by: adminId,
  });

  if (error) {
    return {
      status: "fout",
      bericht: "Het verslag is gemaakt maar kon niet worden bewaard.",
    };
  }

  await schrijfAudit(supabase, {
    actorId: adminId,
    actie: "gespreksverslag_gemaakt",
    entiteit: "crm_analyses",
    entiteitId: parsed.data.profile_id,
    meta: { model: uitkomst.model, met_gezondheid: gezondheid !== null },
  });

  revalidatePath(`/admin/klanten/${parsed.data.profile_id}`);
  return { status: "gelukt", bericht: "Het verslag staat klaar." };
}

export async function verwijderGespreksverslag(analyseId: string) {
  const context = await vereisAdmin();
  if (!context) return GEEN_RECHTEN;

  const { supabase, adminId } = context;

  const { data, error } = await supabase
    .from("crm_analyses")
    .delete()
    .eq("id", analyseId)
    .select("profile_id")
    .maybeSingle();

  if (error || !data) {
    return { status: "fout" as const, bericht: "Verwijderen lukte niet." };
  }

  await schrijfAudit(supabase, {
    actorId: adminId,
    actie: "gespreksverslag_verwijderd",
    entiteit: "crm_analyses",
    entiteitId: data.profile_id,
  });

  revalidatePath(`/admin/klanten/${data.profile_id}`);
  return { status: "gelukt" as const, bericht: "Het verslag is verwijderd." };
}
