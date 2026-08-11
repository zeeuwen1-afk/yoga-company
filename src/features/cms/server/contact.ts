"use server";

import { headers } from "next/headers";

import { adminAdres, verstuurMail } from "@/lib/notificatie";
import { begrens, bezoekerSleutel } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

import { contactSchema } from "../schemas";

export type ContactResultaat =
  | { status: "idle" }
  | { status: "fout"; bericht: string; velden?: Record<string, string> }
  | { status: "gelukt"; bericht: string };

const BEVESTIGING =
  "Bedankt voor je bericht. We hebben het ontvangen en reageren meestal binnen twee werkdagen.";

export async function verstuurContactbericht(
  _vorige: ContactResultaat,
  formData: FormData,
): Promise<ContactResultaat> {
  const parsed = contactSchema.safeParse(
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
  const begrenzing = begrens(`contact:${bezoekerSleutel(kop)}`, {
    maximum: 5,
    vensterSeconden: 3600,
  });

  if (!begrenzing.toegestaan) {
    return {
      status: "fout",
      bericht:
        "Je hebt kort achter elkaar meerdere berichten gestuurd. Probeer het over een uur nog eens, of mail ons rechtstreeks.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    body: parsed.data.body,
  });

  if (error) {
    return {
      status: "fout",
      bericht:
        "Het bericht kon niet worden verstuurd. Probeer het later opnieuw of mail ons op info@yogacompanie.nl.",
    };
  }

  // De inhoud van het bericht gaat bewust niet mee in de notificatie; de admin
  // leest hem in de beheeromgeving (BOUWPROMPT §10.6, §17.11).
  await verstuurMail({
    aan: adminAdres(),
    onderwerp: "Nieuw contactbericht via de website",
    tekst:
      "Er is een nieuw contactbericht binnengekomen. Log in op de beheeromgeving om het te lezen.",
  });

  return { status: "gelukt", bericht: BEVESTIGING };
}
