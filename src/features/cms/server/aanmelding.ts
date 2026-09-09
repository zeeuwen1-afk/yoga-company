"use server";

import { headers } from "next/headers";

import {
  ContactBevestigingMail,
  ContactNotificatieMail,
} from "@/emails/templates";
import { publicEnv } from "@/lib/env";
import { adminAdres, verstuurMail } from "@/lib/notificatie";
import { begrens, bezoekerSleutel } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

import { aanmeldingSchema } from "../schemas";

/**
 * Een aanmelding voor een opleiding, module of blok.
 *
 * Waarom dit naast het inschrijven in het portaal bestaat: dat vraagt eerst een
 * account en daarna een betaling. Een bezoeker die net besloten heeft dat hij
 * mee wil doen, krijgt dan een inlogscherm te zien — en dat is precies het
 * moment waarop mensen afhaken. Zolang de betaalkoppeling niet aanstaat is het
 * bovendien een doodlopende weg.
 *
 * Dit formulier stuurt een bericht. De plek en de betaling volgen in het
 * antwoord, en dat antwoord komt van een mens.
 *
 * De aanmelding landt in dezelfde tabel als de contactberichten en de
 * aanvragen, en dus in hetzelfde scherm in het beheer. Eén postbus is één plek
 * om te kijken. Komt er ooit een echt inschrijfproces dat erop rekent, dan is
 * dát het moment voor een eigen tabel — niet eerder.
 */

export type AanmeldingResultaat =
  | { status: "idle" }
  | { status: "fout"; bericht: string; velden?: Record<string, string> }
  | { status: "gelukt"; bericht: string };

const BEVESTIGING =
  "Bedankt voor je aanmelding. Je hoort binnen twee werkdagen van ons, met de lesdata en hoe je je plek definitief maakt.";

export async function verstuurAanmelding(
  _vorige: AanmeldingResultaat,
  formData: FormData,
): Promise<AanmeldingResultaat> {
  const parsed = aanmeldingSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!parsed.success) {
    const velden: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const sleutel = String(issue.path[0] ?? "");
      velden[sleutel] ??= issue.message;
    }
    return {
      status: "fout",
      bericht: "Controleer de gemarkeerde velden.",
      velden,
    };
  }

  // Honeypot gevuld: bot. We doen alsof het gelukt is en slaan niets op.
  if (parsed.data.website) {
    return { status: "gelukt", bericht: BEVESTIGING };
  }

  const kop = await headers();
  const begrenzing = begrens(`aanmelding:${bezoekerSleutel(kop)}`, {
    maximum: 5,
    vensterSeconden: 3600,
  });

  if (!begrenzing.toegestaan) {
    return {
      status: "fout",
      bericht:
        "Je hebt kort achter elkaar meerdere aanmeldingen gestuurd. Probeer het over een uur nog eens, of mail ons rechtstreeks.",
    };
  }

  // Waarvoor iemand zich aanmeldt staat bovenaan het bericht, niet in een eigen
  // kolom. Er is nog geen proces dat erop rekent; komt dat er, dan hoort het in
  // een eigen tabel te staan en niet half in deze.
  const bericht = [
    `Aanmelding: ${parsed.data.variant}`,
    `Via: ${parsed.data.onderwerp}`,
    parsed.data.body ? `\n${parsed.data.body}` : null,
  ]
    .filter((regel) => regel !== null)
    .join("\n");

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    body: bericht,
  });

  if (error) {
    return {
      status: "fout",
      bericht:
        "Je aanmelding kon niet worden opgeslagen. Probeer het nog eens, of mail ons op info@yogacompany.eu.",
    };
  }

  // Beide mails zijn niet blokkerend: de aanmelding staat al in de database,
  // dus een mail die niet weggaat mag de bezoeker geen foutmelding opleveren.
  const basis = publicEnv().NEXT_PUBLIC_SITE_URL;

  await Promise.all([
    verstuurMail({
      aan: parsed.data.email,
      onderwerp: "We hebben je aanmelding ontvangen",
      template: ContactBevestigingMail({ naam: parsed.data.name }),
    }),
    verstuurMail({
      aan: adminAdres(),
      onderwerp: `Aanmelding · ${parsed.data.variant}`,
      template: ContactNotificatieMail({
        beheerUrl: `${basis}/admin/contactberichten`,
      }),
    }),
  ]);

  return { status: "gelukt", bericht: BEVESTIGING };
}
