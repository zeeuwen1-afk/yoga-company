"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";

/**
 * Zelfservice op het eigen profiel (BOUWPROMPT §11).
 *
 * De klant beheert hier wat van hemzelf is. Rol en verwijderstatus staan er
 * bewust niet tussen: die zijn afgeschermd door de trigger op `profiles`, en
 * een poging ze mee te sturen wordt door de database geweigerd.
 */

const profielSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(1, "Vul je voornaam in")
    .max(80, "Je voornaam mag maximaal 80 tekens bevatten"),
  last_name: z
    .string()
    .trim()
    .min(1, "Vul je achternaam in")
    .max(80, "Je achternaam mag maximaal 80 tekens bevatten"),
  phone: z
    .string()
    .trim()
    .max(30, "Dit telefoonnummer lijkt te lang")
    .optional()
    .or(z.literal("")),
});

export type ProfielResultaat =
  | { status: "idle" }
  | { status: "fout"; bericht: string; velden?: Record<string, string> }
  | { status: "gelukt"; bericht: string };

function veldFouten(error: z.ZodError): Record<string, string> {
  const velden: Record<string, string> = {};
  for (const issue of error.issues) {
    const sleutel = String(issue.path[0] ?? "");
    velden[sleutel] ??= issue.message;
  }
  return velden;
}

export async function werkProfielBij(
  _vorige: ProfielResultaat,
  formData: FormData,
): Promise<ProfielResultaat> {
  const parsed = profielSchema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return {
      status: "fout",
      bericht: "Controleer de gemarkeerde velden.",
      velden: veldFouten(parsed.error),
    };
  }

  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);

  if (!gebruiker) {
    return {
      status: "fout",
      bericht: "Je sessie is verlopen. Log opnieuw in.",
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      phone: parsed.data.phone || null,
    })
    .eq("id", gebruiker.id);

  if (error) {
    return {
      status: "fout",
      bericht: "Je gegevens konden niet worden opgeslagen.",
    };
  }

  revalidatePath("/portaal", "layout");
  return { status: "gelukt", bericht: "Je gegevens zijn bijgewerkt." };
}

/**
 * Toestemming voor mailings aan- of uitzetten (BOUWPROMPT §10.7).
 *
 * We bewaren het moment van toestemming, niet een ja/nee-vlag: bij een
 * controle moet aantoonbaar zijn wanneer die is gegeven. Intrekken wist het
 * tijdstip, en daarmee de grondslag.
 */
export async function wisselMarketingToestemming(aan: boolean) {
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);

  if (!gebruiker) return { gelukt: false };

  const { error } = await supabase
    .from("profiles")
    .update({ marketing_consent_at: aan ? new Date().toISOString() : null })
    .eq("id", gebruiker.id);

  if (!error) revalidatePath("/portaal/profiel");
  return { gelukt: !error };
}

const wachtwoordSchema = z
  .object({
    password: z
      .string()
      .min(12, "Kies een wachtwoord van minstens 12 tekens")
      .max(72, "Een wachtwoord mag maximaal 72 tekens lang zijn"),
    password_confirm: z.string(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "De twee wachtwoorden zijn niet gelijk",
    path: ["password_confirm"],
  });

export async function wijzigWachtwoord(
  _vorige: ProfielResultaat,
  formData: FormData,
): Promise<ProfielResultaat> {
  const parsed = wachtwoordSchema.safeParse({
    password: formData.get("password"),
    password_confirm: formData.get("password_confirm"),
  });

  if (!parsed.success) {
    return {
      status: "fout",
      bericht: "Controleer de gemarkeerde velden.",
      velden: veldFouten(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return {
      status: "fout",
      bericht:
        "Het wachtwoord kon niet worden gewijzigd. Log opnieuw in en probeer het nog eens.",
    };
  }

  return { status: "gelukt", bericht: "Je wachtwoord is gewijzigd." };
}
