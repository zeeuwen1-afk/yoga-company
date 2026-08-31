"use server";

import { z } from "zod";

import { KaartaanvraagMail } from "@/emails/templates";
import { haalPagina } from "@/features/cms";
import type { Tarief } from "@/content/tarieven";
import { verstuurMail } from "@/lib/notificatie";
import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";

/**
 * Een strippenkaart of abonnement aanvragen (§7.1, §11).
 *
 * Zolang er geen Mollie-sleutel is, gaat dit dezelfde weg als een inschrijving
 * op een opleiding: er komt een aanvraag in dezelfde lijst waar de eigenaar al
 * kijkt, en de klant krijgt een bevestiging. Bewust géén bestelling met een
 * betaling eraan: er is nog geen strippenadministratie, dus een afgeronde
 * betaling zou nergens vastleggen wat iemand tegoed heeft. Zie docs/beheer.md.
 *
 * De prijs komt níét uit het formulier. Het formulier stuurt alleen de plaats
 * in de lijst mee; welke kaart dat is en wat die kost, leest de server zelf uit
 * dezelfde inhoud die de bezoeker te zien kreeg. Een bezoeker kan zichzelf dus
 * geen kaart van één euro toesturen.
 */

const aanvraagSchema = z.object({
  kaart: z.coerce.number().int().min(0).max(99),
});

export type KaartResultaat =
  | { status: "idle" }
  | { status: "fout"; bericht: string }
  | { status: "aangevraagd"; bericht: string };

/** De prijslijst zoals hij nu online staat. */
export async function haalTarieven(): Promise<Tarief[]> {
  const pagina = await haalPagina("tarieven");
  return pagina.lijst<Tarief>("tarieven");
}

/** Eén tarief op zijn plaats in de lijst, of null wanneer die niet bestaat. */
export async function haalTarief(index: number): Promise<Tarief | null> {
  const tarieven = await haalTarieven();
  return tarieven[index] ?? null;
}

export async function vraagKaartAan(
  _vorige: KaartResultaat,
  formData: FormData,
): Promise<KaartResultaat> {
  const parsed = aanvraagSchema.safeParse({ kaart: formData.get("kaart") });

  if (!parsed.success) {
    return {
      status: "fout",
      bericht: "Er ging iets mis. Probeer het opnieuw.",
    };
  }

  const tarief = await haalTarief(parsed.data.kaart);
  if (!tarief) {
    return {
      status: "fout",
      bericht:
        "Deze kaart bestaat niet meer. Ververs de pagina en kies opnieuw.",
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

  const { error } = await supabase.from("requests").insert({
    profile_id: gebruiker.id,
    // Er is geen aparte soort voor een kaart; dit valt onder hetzelfde kopje
    // als een aanmelding voor een opleiding, zodat de eigenaar één lijst heeft.
    // Wat het precies is, staat in de tekst eronder.
    kind: "inschrijving",
    body: `Aanvraag via de website: ${tarief.naam} · ${tarief.prijs}`,
  });

  if (error) {
    return {
      status: "fout",
      bericht: "De aanvraag kon niet worden opgeslagen. Probeer het opnieuw.",
    };
  }

  const { data: profiel } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", gebruiker.id)
    .maybeSingle();

  // Een mislukte mail mag de aanvraag niet ongedaan maken: die staat er al.
  await verstuurMail({
    aan: gebruiker.email ?? "",
    onderwerp: `We hebben je aanvraag voor de ${tarief.naam} ontvangen`,
    template: KaartaanvraagMail({
      voornaam: profiel?.first_name ?? "daar",
      kaart: tarief.naam,
      prijs: tarief.prijs,
    }),
  }).catch((fout: unknown) => {
    console.error(
      `[strippenkaart] bevestigingsmail mislukt: ${
        fout instanceof Error ? fout.message : "onbekende fout"
      }`,
    );
  });

  return {
    status: "aangevraagd",
    bericht: `Je aanvraag voor de ${tarief.naam} is binnen. We nemen binnen twee werkdagen contact met je op over de betaling.`,
  };
}
