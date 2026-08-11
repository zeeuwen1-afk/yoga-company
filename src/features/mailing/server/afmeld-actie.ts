"use server";

import { schrijfAudit } from "@/features/audit";
import { createAdminClient } from "@/lib/supabase/admin";

import { leesAfmeldToken } from "./afmelden";

/**
 * Afmelden voor mailings (BOUWPROMPT §10.7).
 *
 * Deze handeling gebeurt zonder inlog: de ontvanger klikt in een mail. Daarom
 * de service-role — een bezoeker zonder sessie mag terecht niets in `profiles`
 * wijzigen, en de rechtencontrole zit hier in de handtekening van het token.
 *
 * Bewust géén afmelden bij het openen van de pagina: mailprogramma's en
 * scanners volgen links vooruit, en dan zou iemand afgemeld raken die alleen
 * de mail ontving. De pagina vraagt om één bevestiging.
 */

export type AfmeldResultaat =
  | { status: "idle" }
  | { status: "fout"; bericht: string }
  | { status: "gelukt"; bericht: string };

export async function meldAf(
  _vorige: AfmeldResultaat,
  formData: FormData,
): Promise<AfmeldResultaat> {
  const token = String(formData.get("token") ?? "");
  const profielId = leesAfmeldToken(token);

  if (!profielId) {
    // Eén melding voor "ongeldig" en "verlopen": meer prijsgeven helpt alleen
    // wie zit te gokken.
    return {
      status: "fout",
      bericht:
        "Deze afmeldlink klopt niet. Stuur ons een bericht, dan doen we het handmatig.",
    };
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("profiles")
    .update({ marketing_consent_at: null })
    .eq("id", profielId);

  if (error) {
    return {
      status: "fout",
      bericht: "Het afmelden lukte niet. Probeer het over een minuut opnieuw.",
    };
  }

  // Zonder actor: de afmelding komt van de ontvanger zelf, niet van een
  // beheerder. Het profiel-id staat er wel bij, want dit is de verantwoording
  // dat de toestemming daadwerkelijk is ingetrokken.
  await schrijfAudit(supabase, {
    actorId: null,
    actie: "mailing_afmelding",
    entiteit: "profiles",
    entiteitId: profielId,
  });

  return {
    status: "gelukt",
    bericht: "Je bent afgemeld. Je ontvangt geen mailings meer van ons.",
  };
}
