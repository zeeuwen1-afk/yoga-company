"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { verstuurInschrijfbevestiging } from "@/features/payments";
import { maakBestellingEnBetaling } from "@/features/payments";
import { betalenIngericht } from "@/lib/mollie";
import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";

/**
 * Adminfuncties rond betalingen (bouwprompt §7.6).
 *
 * "Betalen in termijnen in overleg" vraagt om twee handmatige mogelijkheden:
 * een betaallink sturen, en een inschrijving met de hand op betaald zetten.
 * Beide zijn gevoelig — ze kennen toegang toe die niet uit een betaling volgt —
 * en worden daarom altijd vastgelegd in het audit log (§13, §17).
 *
 * De rechten worden niet hier gecontroleerd maar door RLS: alleen een admin
 * mag `enrollments` en `audit_log` muteren. De controle hieronder is een extra
 * laag zodat de fout begrijpelijk is, geen vervanging.
 */

const handmatigBetaaldSchema = z.object({
  enrollment_id: z.uuid("Ongeldige inschrijving"),
  reden: z
    .string()
    .trim()
    .min(5, "Noteer kort waarom je dit handmatig doet")
    .max(500, "Houd de reden onder de 500 tekens"),
  bedrag_centen: z.coerce
    .number()
    .int()
    .min(0, "Een bedrag kan niet negatief zijn"),
});

export type AdminResultaat =
  | { status: "idle" }
  | { status: "fout"; bericht: string }
  | { status: "gelukt"; bericht: string; betaalUrl?: string };

async function vereisAdmin() {
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);

  if (!gebruiker) return null;

  const { data: profiel } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", gebruiker.id)
    .maybeSingle();

  if (profiel?.role !== "admin") return null;

  return { supabase, adminId: gebruiker.id };
}

/**
 * Zet een inschrijving met de hand op betaald, bijvoorbeeld bij een
 * bankoverschrijving of een termijnregeling buiten Mollie om.
 */
export async function markeerHandmatigBetaald(
  _vorige: AdminResultaat,
  formData: FormData,
): Promise<AdminResultaat> {
  const context = await vereisAdmin();
  if (!context) {
    return { status: "fout", bericht: "Je hebt hier geen rechten voor." };
  }

  const parsed = handmatigBetaaldSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!parsed.success) {
    return {
      status: "fout",
      bericht: parsed.error.issues[0]?.message ?? "Controleer de invoer.",
    };
  }

  const { supabase, adminId } = context;

  const { data, error } = await supabase
    .from("enrollments")
    .update({
      status: "betaald",
      paid_at: new Date().toISOString(),
      amount_cents: parsed.data.bedrag_centen,
    })
    .eq("id", parsed.data.enrollment_id)
    .neq("status", "betaald")
    .select("id")
    .maybeSingle();

  if (error) {
    return {
      status: "fout",
      bericht: "De inschrijving kon niet worden bijgewerkt.",
    };
  }

  if (!data) {
    return {
      status: "fout",
      bericht: "Deze inschrijving stond al op betaald.",
    };
  }

  await supabase.from("audit_log").insert({
    actor_id: adminId,
    action: "enrollment_handmatig_betaald",
    entity: "enrollments",
    entity_id: parsed.data.enrollment_id,
    meta: {
      reden: parsed.data.reden,
      bedrag_centen: parsed.data.bedrag_centen,
    },
  });

  await verstuurInschrijfbevestiging(parsed.data.enrollment_id).catch(
    (fout: unknown) => {
      console.error(
        `[admin] bevestigingsmail mislukt: ${
          fout instanceof Error ? fout.message : "onbekende fout"
        }`,
      );
    },
  );

  revalidatePath("/admin/inschrijvingen");
  return {
    status: "gelukt",
    bericht:
      "De inschrijving staat op betaald en de klant heeft bericht gekregen.",
  };
}

const betaallinkSchema = z.object({
  enrollment_id: z.uuid("Ongeldige inschrijving"),
  bedrag_centen: z.coerce
    .number()
    .int()
    .min(100, "Een betaallink moet minstens € 1 zijn"),
  omschrijving: z
    .string()
    .trim()
    .min(3, "Geef een omschrijving mee")
    .max(200, "Houd de omschrijving kort"),
});

/**
 * Maakt een losse betaallink, bijvoorbeeld voor een termijnbedrag. De link is
 * eenmalig te gebruiken en gekoppeld aan de inschrijving, zodat de webhook hem
 * op dezelfde manier verwerkt als een gewone betaling.
 */
export async function maakBetaallink(
  _vorige: AdminResultaat,
  formData: FormData,
): Promise<AdminResultaat> {
  const context = await vereisAdmin();
  if (!context) {
    return { status: "fout", bericht: "Je hebt hier geen rechten voor." };
  }

  if (!betalenIngericht()) {
    return {
      status: "fout",
      bericht: "De betaalkoppeling is nog niet ingericht.",
    };
  }

  const parsed = betaallinkSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!parsed.success) {
    return {
      status: "fout",
      bericht: parsed.error.issues[0]?.message ?? "Controleer de invoer.",
    };
  }

  const { supabase, adminId } = context;

  // De betaallink is een gewone bestelling zonder opleidingsregel: hij hoort
  // bij een inschrijving die de beheerder handmatig beheert (een termijn, een
  // correctie). De webhook zet de bestelling straks op betaald; de toegang
  // regelt de beheerder zelf met "handmatig op betaald zetten".
  const { data: inschrijving } = await supabase
    .from("enrollments")
    .select("profile_id")
    .eq("id", parsed.data.enrollment_id)
    .maybeSingle();

  if (!inschrijving) {
    return { status: "fout", bericht: "Deze inschrijving bestaat niet." };
  }

  try {
    const bestelling = await maakBestellingEnBetaling({
      profileId: inschrijving.profile_id,
      omschrijving: parsed.data.omschrijving,
      valuta: "eur",
      regels: [
        {
          courseId: null,
          omschrijving: parsed.data.omschrijving,
          bedragCenten: parsed.data.bedrag_centen,
        },
      ],
      retourPad: "/portaal",
    });

    await supabase.from("audit_log").insert({
      actor_id: adminId,
      action: "betaallink_gemaakt",
      entity: "orders",
      entity_id: bestelling.orderId,
      meta: {
        enrollment_id: parsed.data.enrollment_id,
        bedrag_centen: parsed.data.bedrag_centen,
        omschrijving: parsed.data.omschrijving,
      },
    });

    return {
      status: "gelukt",
      bericht: "De betaallink staat klaar. Stuur hem naar de klant.",
      betaalUrl: bestelling.betaalUrl,
    };
  } catch (fout) {
    console.error(
      `[admin] betaallink mislukt: ${
        fout instanceof Error ? fout.message : "onbekende fout"
      }`,
    );
    return {
      status: "fout",
      bericht: "De betaallink kon niet worden gemaakt.",
    };
  }
}
