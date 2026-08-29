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

import { aanvraagSchema } from "../schemas";

/**
 * Een aanvraag vanaf een organisatiepagina (bedrijven, sportclubs, onderwijs).
 *
 * Landt in dezelfde tabel als de contactberichten, en dus in hetzelfde scherm
 * in het beheer. Dat is met opzet: wie namens een school of een club schrijft
 * heeft geen account, en hoort dus niet in de aanvragenlijst van het portaal —
 * die is voor ingelogde klanten. Eén postbus is bovendien één plek om te
 * kijken.
 *
 * De vier extra vragen komen vóór het bericht te staan in plaats van in eigen
 * kolommen. Er is nog geen offerteproces dat erop rekent; komt dat er, dan is
 * dát het moment voor een eigen tabel — niet eerder.
 */

export type AanvraagResultaat =
  | { status: "idle" }
  | { status: "fout"; bericht: string; velden?: Record<string, string> }
  | { status: "gelukt"; bericht: string };

const BEVESTIGING =
  "Bedankt voor je aanvraag. We sturen binnen twee werkdagen een voorstel.";

const ONDERWERP_LABEL: Record<string, string> = {
  bedrijfsyoga: "Bedrijfsyoga",
  sportclubs: "Sportclub",
  onderwijs: "Onderwijs",
};

export async function verstuurAanvraag(
  _vorige: AanvraagResultaat,
  formData: FormData,
): Promise<AanvraagResultaat> {
  const parsed = aanvraagSchema.safeParse(
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
  const begrenzing = begrens(`aanvraag:${bezoekerSleutel(kop)}`, {
    maximum: 5,
    vensterSeconden: 3600,
  });

  if (!begrenzing.toegestaan) {
    return {
      status: "fout",
      bericht:
        "Je hebt kort achter elkaar meerdere aanvragen gestuurd. Probeer het over een uur nog eens, of mail ons rechtstreeks.",
    };
  }

  const soort = ONDERWERP_LABEL[parsed.data.onderwerp] ?? parsed.data.onderwerp;

  const bericht = [
    `Aanvraag via de pagina ${soort}`,
    "",
    `Organisatie: ${parsed.data.organisatie}`,
    parsed.data.omvang ? `Omvang: ${parsed.data.omvang}` : null,
    parsed.data.periode ? `Periode: ${parsed.data.periode}` : null,
    parsed.data.locatie ? `Locatie: ${parsed.data.locatie}` : null,
    "",
    parsed.data.body,
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
        "Je aanvraag kon niet worden opgeslagen. Probeer het nog eens, of mail ons rechtstreeks.",
    };
  }

  // Beide mails zijn niet blokkerend: de aanvraag staat al in de database, dus
  // een mail die niet weggaat mag de bezoeker geen foutmelding opleveren.
  const basis = publicEnv().NEXT_PUBLIC_SITE_URL;

  await Promise.all([
    verstuurMail({
      aan: parsed.data.email,
      onderwerp: "We hebben je aanvraag ontvangen",
      template: ContactBevestigingMail({ naam: parsed.data.name }),
    }),
    verstuurMail({
      aan: adminAdres(),
      onderwerp: `Aanvraag ${soort} — ${parsed.data.organisatie}`,
      template: ContactNotificatieMail({
        beheerUrl: `${basis}/admin/contactberichten`,
      }),
    }),
  ]);

  return { status: "gelukt", bericht: BEVESTIGING };
}
