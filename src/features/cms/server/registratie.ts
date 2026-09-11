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

import { registratieSchema } from "../schemas";

/**
 * Een opleider vraagt registratie van zijn opleiding aan bij de Academy.
 *
 * De voorwaarden noemen het klantportaal als route. Dat portaal kent alleen
 * deelnemers en docenten van YogaCompany, geen opleiders van buiten; een
 * opleider zou dus eerst een account moeten aanmaken om een vraag te stellen.
 * Dit formulier is de kortere weg: één bericht, en het antwoord komt van een
 * mens, met de factuur en het adres voor de documenten.
 *
 * Er worden geen bestanden geüpload. Een opleidingsplan, diploma's en een
 * verzekeringsbewijs zijn persoonsgegevens die niet in een tabel horen die ook
 * contactberichten bevat; per e-mail komen ze alleen bij Wietske terecht.
 *
 * Het bericht landt in dezelfde postbus als de contactberichten en de
 * aanmeldingen, met "Registratie opleiding" bovenaan zodat het er niet tussen
 * wegvalt. Een eigen tabel en scherm komen er pas als er echt aanvragen zijn.
 */
export type RegistratieResultaat =
  | { status: "idle" }
  | { status: "fout"; bericht: string; velden?: Record<string, string> }
  | { status: "gelukt"; bericht: string };

const BEVESTIGING =
  "Bedankt voor je aanvraag. Je hoort binnen twee werkdagen van ons, met het adres waar je de documenten heen stuurt en de factuur voor de registratiekosten.";

export async function verstuurRegistratie(
  _vorige: RegistratieResultaat,
  formData: FormData,
): Promise<RegistratieResultaat> {
  const parsed = registratieSchema.safeParse(
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
  const begrenzing = begrens(`registratie:${bezoekerSleutel(kop)}`, {
    maximum: 3,
    vensterSeconden: 3600,
  });

  if (!begrenzing.toegestaan) {
    return {
      status: "fout",
      bericht:
        "Je hebt kort achter elkaar meerdere aanvragen gestuurd. Probeer het over een uur nog eens, of mail ons rechtstreeks.",
    };
  }

  const bericht = [
    `Registratie opleiding: ${parsed.data.opleiding} (${parsed.data.niveau})`,
    `Opleider: ${parsed.data.organisatie}`,
    parsed.data.plaats ? `Plaats: ${parsed.data.plaats}` : null,
    parsed.data.webadres ? `Website: ${parsed.data.webadres}` : null,
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
        "Je aanvraag kon niet worden opgeslagen. Probeer het nog eens, of mail ons op info@yogacompany.eu.",
    };
  }

  // Beide mails zijn niet blokkerend: de aanvraag staat al in de database.
  const basis = publicEnv().NEXT_PUBLIC_SITE_URL;

  await Promise.all([
    verstuurMail({
      aan: parsed.data.email,
      onderwerp: "We hebben je registratieaanvraag ontvangen",
      template: ContactBevestigingMail({ naam: parsed.data.name }),
    }),
    verstuurMail({
      aan: adminAdres(),
      onderwerp: `Registratie opleiding · ${parsed.data.opleiding}`,
      template: ContactNotificatieMail({
        beheerUrl: `${basis}/admin/contactberichten`,
      }),
    }),
  ]);

  return { status: "gelukt", bericht: BEVESTIGING };
}
