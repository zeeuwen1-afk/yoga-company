"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { schrijfAudit } from "@/features/audit";
import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";

/** Roosterbeheer voor de beheerder (bouwprompt §7.4). */

export type BeheerResultaat =
  | { status: "idle" }
  | { status: "fout"; bericht: string }
  | { status: "gelukt"; bericht: string };

const lesSchema = z.object({
  titel: z.string().trim().min(2, "Geef de les een titel").max(120),
  omschrijving: z.string().trim().max(1000).optional().or(z.literal("")),
  // Uit een datetime-local-veld komt "2026-08-18T19:00" zonder tijdzone. Dat
  // lezen we als lokale tijd, want zo heeft de beheerder het ook ingetypt.
  begintOp: z.string().min(1, "Kies een datum en tijd"),
  duurMinuten: z.coerce
    .number()
    .int()
    .min(15, "Een les duurt minstens een kwartier")
    .max(480),
  locatie: z.string().trim().min(2, "Vul de locatie in").max(160),
  capaciteit: z.coerce
    .number()
    .int()
    .min(1, "Er moet minstens één plek zijn")
    .max(200),
  gepubliceerd: z.coerce.boolean(),
});

async function beheerder() {
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);
  return { supabase, gebruiker };
}

export async function bewaarLes(
  _vorige: BeheerResultaat,
  formData: FormData,
): Promise<BeheerResultaat> {
  const id = formData.get("id");
  const parsed = lesSchema.safeParse({
    titel: formData.get("titel"),
    omschrijving: formData.get("omschrijving"),
    begintOp: formData.get("begintOp"),
    duurMinuten: formData.get("duurMinuten"),
    locatie: formData.get("locatie"),
    capaciteit: formData.get("capaciteit"),
    gepubliceerd: formData.get("gepubliceerd") === "on",
  });

  if (!parsed.success) {
    return {
      status: "fout",
      bericht: parsed.error.issues[0]?.message ?? "Controleer de gegevens.",
    };
  }

  const begint = new Date(parsed.data.begintOp);
  if (Number.isNaN(begint.getTime())) {
    return { status: "fout", bericht: "Die datum kunnen we niet lezen." };
  }

  const { supabase, gebruiker } = await beheerder();
  if (!gebruiker) {
    return {
      status: "fout",
      bericht: "Je sessie is verlopen. Log opnieuw in.",
    };
  }

  const rij = {
    title: parsed.data.titel,
    description: parsed.data.omschrijving || null,
    starts_at: begint.toISOString(),
    duration_minutes: parsed.data.duurMinuten,
    location: parsed.data.locatie,
    capacity: parsed.data.capaciteit,
    is_published: parsed.data.gepubliceerd,
  };

  const bestaand = typeof id === "string" && id.length > 0 ? id : null;

  const { data, error } = bestaand
    ? await supabase
        .from("class_sessions")
        .update(rij)
        .eq("id", bestaand)
        .select("id")
        .single()
    : await supabase.from("class_sessions").insert(rij).select("id").single();

  if (error) {
    return {
      status: "fout",
      bericht: "De les kon niet worden opgeslagen. Probeer het opnieuw.",
    };
  }

  await schrijfAudit(supabase, {
    actorId: gebruiker.id,
    actie: bestaand ? "les_bijgewerkt" : "les_aangemaakt",
    entiteit: "class_sessions",
    entiteitId: data.id,
    meta: { titel: parsed.data.titel, begint_op: rij.starts_at },
  });

  revalidatePath("/admin/lessen");
  revalidatePath("/lessen");
  revalidatePath("/portaal/lessen");

  return {
    status: "gelukt",
    bericht: bestaand
      ? "De les is bijgewerkt."
      : "De les staat in het rooster.",
  };
}

const afgelastSchema = z.object({
  lesId: z.string().uuid(),
  reden: z.string().trim().max(300).optional().or(z.literal("")),
});

/**
 * Een les afgelasten. De les en de boekingen blijven staan: de deelnemers
 * moeten kunnen zien dát hij niet doorgaat, en de beheerder heeft de lijst
 * nodig om iedereen te bereiken.
 */
export async function gelastLesAf(
  _vorige: BeheerResultaat,
  formData: FormData,
): Promise<BeheerResultaat> {
  const parsed = afgelastSchema.safeParse({
    lesId: formData.get("lesId"),
    reden: formData.get("reden"),
  });

  if (!parsed.success) {
    return { status: "fout", bericht: "Deze les kennen we niet." };
  }

  const { supabase, gebruiker } = await beheerder();
  if (!gebruiker) {
    return {
      status: "fout",
      bericht: "Je sessie is verlopen. Log opnieuw in.",
    };
  }

  const { error } = await supabase
    .from("class_sessions")
    .update({
      cancelled_at: new Date().toISOString(),
      cancellation_reason: parsed.data.reden || null,
    })
    .eq("id", parsed.data.lesId);

  if (error) {
    return { status: "fout", bericht: "Afgelasten lukte niet." };
  }

  await schrijfAudit(supabase, {
    actorId: gebruiker.id,
    actie: "les_afgelast",
    entiteit: "class_sessions",
    entiteitId: parsed.data.lesId,
    meta: { reden: parsed.data.reden || null },
  });

  revalidatePath("/admin/lessen");
  revalidatePath("/lessen");
  revalidatePath("/portaal/lessen");

  return {
    status: "gelukt",
    bericht:
      "De les staat op afgelast. Laat de deelnemers het even weten via Berichten.",
  };
}

/**
 * Een les uit het rooster verwijderen.
 *
 * Afgelasten en verwijderen zijn twee verschillende dingen, en het verschil
 * zit in of er iemand op afkomt. Heeft iemand geboekt, dan is afgelasten het
 * juiste: de les blijft zichtbaar met de reden erbij, en de deelnemer ziet wat
 * er met zijn boeking is gebeurd. Verwijderen zou de les stilletjes laten
 * verdwijnen uit het overzicht van iemand die zich er wél op had verheugd.
 *
 * Voor een les die per ongeluk is aangemaakt of nooit heeft plaatsgevonden is
 * afgelasten juist onzin: dan blijft er een streep door een les staan die er
 * nooit was. Die mag weg.
 *
 * De grens is dus: geen boekingen en geen afgeschreven strippen, dan weg.
 * Anders afgelasten, met uitleg waarom.
 */
export async function verwijderLes(lesId: string): Promise<BeheerResultaat> {
  const { supabase, gebruiker } = await beheerder();
  if (!gebruiker) {
    return {
      status: "fout",
      bericht: "Je sessie is verlopen. Log opnieuw in.",
    };
  }

  const { data: les } = await supabase
    .from("class_sessions")
    .select("title, starts_at")
    .eq("id", lesId)
    .maybeSingle();

  if (!les) {
    return { status: "fout", bericht: "Deze les bestaat niet meer." };
  }

  const { count: boekingen } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("class_session_id", lesId);

  if (boekingen && boekingen > 0) {
    return {
      status: "fout",
      bericht: `Er ${boekingen === 1 ? "heeft zich 1 deelnemer" : `hebben zich ${boekingen} deelnemers`} op deze les ingeschreven. Gelast hem af in plaats van hem te verwijderen; dan zien zij wat er is gebeurd.`,
    };
  }

  const { error } = await supabase
    .from("class_sessions")
    .delete()
    .eq("id", lesId);

  if (error) {
    // De database weigert het als er een strip op is afgeschreven. Dat is een
    // administratie die moet kloppen, dus die weigering is terecht.
    return {
      status: "fout",
      bericht:
        "Deze les kon niet worden verwijderd, waarschijnlijk omdat er een strip op is afgeschreven. Gelast hem af.",
    };
  }

  await schrijfAudit(supabase, {
    actorId: gebruiker.id,
    actie: "les_verwijderd",
    entiteit: "class_sessions",
    entiteitId: lesId,
    meta: { titel: les.title, begint: les.starts_at },
  });

  revalidatePath("/admin/lessen");
  revalidatePath("/lessen");
  revalidatePath("/");

  return {
    status: "gelukt",
    bericht: `${les.title} is uit het rooster gehaald.`,
  };
}

const aanwezigheidSchema = z.object({
  boekingId: z.string().uuid(),
  lesId: z.string().uuid(),
  status: z.enum(["geboekt", "niet_verschenen"]),
});

/** Markeert een deelnemer als afwezig, of draait dat terug (§7.4). */
export async function zetAanwezigheid(
  _vorige: BeheerResultaat,
  formData: FormData,
): Promise<BeheerResultaat> {
  const parsed = aanwezigheidSchema.safeParse({
    boekingId: formData.get("boekingId"),
    lesId: formData.get("lesId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { status: "fout", bericht: "Deze boeking kennen we niet." };
  }

  const { supabase, gebruiker } = await beheerder();
  if (!gebruiker) {
    return {
      status: "fout",
      bericht: "Je sessie is verlopen. Log opnieuw in.",
    };
  }

  const { error } = await supabase
    .from("bookings")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.boekingId);

  if (error) {
    return { status: "fout", bericht: "Bijwerken lukte niet." };
  }

  await schrijfAudit(supabase, {
    actorId: gebruiker.id,
    actie: "aanwezigheid_gemarkeerd",
    entiteit: "bookings",
    entiteitId: parsed.data.boekingId,
    meta: { status: parsed.data.status },
  });

  revalidatePath(`/admin/lessen/${parsed.data.lesId}`);

  return {
    status: "gelukt",
    bericht:
      parsed.data.status === "niet_verschenen"
        ? "Genoteerd als niet verschenen."
        : "Weer op aanwezig gezet.",
  };
}
