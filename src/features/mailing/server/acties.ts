"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { MailingMail } from "@/emails/templates";
import { schrijfAudit } from "@/features/audit";
import { verstuurMail, mailIngericht } from "@/lib/notificatie";
import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";

import { afmeldUrl, afmeldsecretIngericht } from "./afmelden";

/**
 * Mailings opstellen en versturen (BOUWPROMPT §10.7).
 *
 * Twee regels die hier niet te omzeilen zijn:
 *
 *  - **Alleen naar toestemming.** De ontvangerslijst wordt op het moment van
 *    verzenden opgehaald uit `profiles` met `marketing_consent_at` gezet en
 *    zonder `deleted_at`. Er is geen veld waarin een beheerder een andere lijst
 *    kan opgeven.
 *  - **Altijd een afmeldlink.** Ontbreekt het ondertekeningsgeheim, dan gaat er
 *    niets uit. Een mailing zonder werkende afmeldlink is geen optie.
 */

export type MailingResultaat =
  | { status: "idle" }
  | { status: "fout"; bericht: string }
  | { status: "gelukt"; bericht: string };

async function vereisAdmin() {
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);
  if (!gebruiker) return null;

  const { data } = await supabase
    .from("profiles")
    .select("role, deleted_at")
    .eq("id", gebruiker.id)
    .maybeSingle();

  if (data?.role !== "admin" || data.deleted_at !== null) return null;
  return { supabase, adminId: gebruiker.id };
}

const GEEN_RECHTEN: MailingResultaat = {
  status: "fout",
  bericht: "Je hebt hier geen rechten voor.",
};

const bewaarSchema = z.object({
  id: z.uuid().optional(),
  onderwerp: z
    .string()
    .trim()
    .min(3, "Vul een onderwerp in")
    .max(200, "Houd het onderwerp korter"),
  inhoud: z
    .string()
    .trim()
    .min(10, "Schrijf eerst een bericht")
    .max(50_000, "Dit bericht is te lang"),
});

/** Bewaart een mailing als concept. */
export async function bewaarMailing(
  _vorige: MailingResultaat,
  formData: FormData,
): Promise<MailingResultaat> {
  const context = await vereisAdmin();
  if (!context) return GEEN_RECHTEN;

  const parsed = bewaarSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return {
      status: "fout",
      bericht: parsed.error.issues[0]?.message ?? "Controleer de invoer.",
    };
  }

  const { supabase, adminId } = context;
  const rij = {
    subject: parsed.data.onderwerp,
    body_html: parsed.data.inhoud,
    created_by: adminId,
  };

  const { data, error } = parsed.data.id
    ? await supabase
        .from("mailings")
        .update(rij)
        .eq("id", parsed.data.id)
        .is("sent_at", null)
        .select("id")
        .single()
    : await supabase.from("mailings").insert(rij).select("id").single();

  if (error || !data) {
    return { status: "fout", bericht: "De mailing kon niet worden bewaard." };
  }

  await schrijfAudit(supabase, {
    actorId: adminId,
    actie: "mailing_bewaard",
    entiteit: "mailings",
    entiteitId: data.id,
    meta: { nieuw: !parsed.data.id },
  });

  revalidatePath("/admin/mailings");
  return { status: "gelukt", bericht: "Mailing bewaard." };
}

/** Verwijdert een concept. Verstuurde mailings blijven staan als log (§17.6). */
export async function verwijderMailing(id: string): Promise<MailingResultaat> {
  const context = await vereisAdmin();
  if (!context) return GEEN_RECHTEN;

  const { supabase, adminId } = context;

  const { error } = await supabase
    .from("mailings")
    .delete()
    .eq("id", id)
    .is("sent_at", null);

  if (error) {
    return {
      status: "fout",
      bericht: "De mailing kon niet worden verwijderd.",
    };
  }

  await schrijfAudit(supabase, {
    actorId: adminId,
    actie: "mailing_verwijderd",
    entiteit: "mailings",
    entiteitId: id,
  });

  revalidatePath("/admin/mailings");
  return { status: "gelukt", bericht: "Mailing verwijderd." };
}

/** Verstuurt de mailing naar één adres, om hem eerst zelf te bekijken. */
export async function verstuurProef(id: string): Promise<MailingResultaat> {
  const context = await vereisAdmin();
  if (!context) return GEEN_RECHTEN;

  const { supabase, adminId } = context;

  const { data: mailing } = await supabase
    .from("mailings")
    .select("subject, body_html")
    .eq("id", id)
    .maybeSingle();

  const { data: profiel } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", adminId)
    .maybeSingle();

  if (!mailing || !profiel) {
    return { status: "fout", bericht: "Deze mailing bestaat niet." };
  }

  if (!afmeldsecretIngericht()) {
    return {
      status: "fout",
      bericht:
        "MAILING_UNSUBSCRIBE_SECRET ontbreekt; zonder afmeldlink gaat er niets uit.",
    };
  }

  const uitkomst = await verstuurMail({
    aan: profiel.email,
    onderwerp: `[Proef] ${mailing.subject}`,
    template: MailingMail({
      inhoudHtml: mailing.body_html,
      afmeldUrl: afmeldUrl(adminId),
    }),
  });

  return uitkomst.verstuurd
    ? {
        status: "gelukt",
        bericht: `Proefmail verstuurd naar ${profiel.email}.`,
      }
    : {
        status: "fout",
        bericht: `De proefmail ging niet weg: ${uitkomst.reden ?? "onbekende reden"}.`,
      };
}

/**
 * Verstuurt de mailing naar alle profielen met toestemming.
 *
 * In kleine groepjes tegelijk: Resend heeft een limiet per seconde, en één
 * mislukte mail mag de rest niet tegenhouden. Bij enkele duizenden ontvangers
 * hoort dit naar een achtergrondtaak te verhuizen; tot die omvang is dit
 * eenvoudiger en goed te volgen.
 */
export async function verstuurMailing(id: string): Promise<MailingResultaat> {
  const context = await vereisAdmin();
  if (!context) return GEEN_RECHTEN;

  const { supabase, adminId } = context;

  if (!mailIngericht()) {
    return {
      status: "fout",
      bericht:
        "De mailkoppeling is nog niet ingericht (zie docs/beheer.md §8).",
    };
  }

  if (!afmeldsecretIngericht()) {
    return {
      status: "fout",
      bericht:
        "MAILING_UNSUBSCRIBE_SECRET ontbreekt; zonder afmeldlink gaat er niets uit.",
    };
  }

  const { data: mailing } = await supabase
    .from("mailings")
    .select("id, subject, body_html, sent_at")
    .eq("id", id)
    .maybeSingle();

  if (!mailing) {
    return { status: "fout", bericht: "Deze mailing bestaat niet." };
  }

  if (mailing.sent_at) {
    // Twee keer versturen is niet terug te draaien; daarom hard tegenhouden.
    return { status: "fout", bericht: "Deze mailing is al verstuurd." };
  }

  // De lijst komt hier vandaan en nergens anders: toestemming én actief.
  const { data: ontvangers } = await supabase
    .from("profiles")
    .select("id, email")
    .not("marketing_consent_at", "is", null)
    .is("deleted_at", null);

  if (!ontvangers || ontvangers.length === 0) {
    return {
      status: "fout",
      bericht: "Er is niemand met toestemming voor mailings.",
    };
  }

  let gelukt = 0;
  let mislukt = 0;
  const GROEP = 5;

  for (let i = 0; i < ontvangers.length; i += GROEP) {
    const groep = ontvangers.slice(i, i + GROEP);
    const uitkomsten = await Promise.all(
      groep.map((ontvanger) =>
        verstuurMail({
          aan: ontvanger.email,
          onderwerp: mailing.subject,
          template: MailingMail({
            inhoudHtml: mailing.body_html,
            // Per ontvanger een eigen link: alleen zo meldt de klik de juiste
            // persoon af.
            afmeldUrl: afmeldUrl(ontvanger.id),
          }),
        }),
      ),
    );

    for (const uitkomst of uitkomsten) {
      if (uitkomst.verstuurd) gelukt += 1;
      else mislukt += 1;
    }
  }

  await supabase
    .from("mailings")
    .update({
      sent_at: new Date().toISOString(),
      recipient_count: gelukt,
      error:
        mislukt > 0
          ? `${mislukt} van de ${ontvangers.length} mails ging niet weg.`
          : null,
    })
    .eq("id", id);

  await schrijfAudit(supabase, {
    actorId: adminId,
    actie: "mailing_verstuurd",
    entiteit: "mailings",
    entiteitId: id,
    // Aantallen, geen adressen (§17.11).
    meta: { verstuurd: gelukt, mislukt },
  });

  revalidatePath("/admin/mailings");

  return {
    status: mislukt === 0 ? "gelukt" : "fout",
    bericht:
      mislukt === 0
        ? `Verstuurd naar ${gelukt} ${gelukt === 1 ? "ontvanger" : "ontvangers"}.`
        : `Verstuurd naar ${gelukt} ontvangers; ${mislukt} mails gingen niet weg.`,
  };
}
