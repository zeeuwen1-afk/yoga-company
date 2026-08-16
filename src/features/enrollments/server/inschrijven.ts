"use server";

import { redirect } from "next/navigation";

import { InschrijfaanvraagMail } from "@/emails/templates";
import { maakBestellingEnBetaling } from "@/features/payments";
import { betalenIngericht } from "@/lib/mollie";
import { verstuurMail } from "@/lib/notificatie";
import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";

/**
 * Inschrijven op een opleiding of training (bouwprompt §7.1, §7.6).
 *
 * Twee wegen, afhankelijk van of de betaalkoppeling aanstaat:
 *
 *   aan  — bestelling aanmaken en doorsturen naar Mollie; de webhook zet de
 *          inschrijving daarna op betaald
 *   uit  — een aanvraag vastleggen en de klant een bevestiging sturen, zodat
 *          de eigenaar persoonlijk contact opneemt (§7.1)
 *
 * In beide gevallen ontstaat er eerst een inschrijving met status
 * `in_afwachting`. De klant kan die status niet zelf zetten — dat verhindert
 * RLS. Alleen de webhook, via de service-role, zet hem op betaald.
 */

export type InschrijfResultaat =
  | { status: "fout"; bericht: string }
  | { status: "aangevraagd"; bericht: string };

async function legAanvraagVast(
  supabase: Awaited<ReturnType<typeof createClient>>,
  invoer: { profileId: string; email: string; cursusTitel: string },
): Promise<void> {
  // De aanvraag komt in dezelfde lijst als de andere portaalaanvragen, zodat
  // de eigenaar één plek heeft om te kijken (§7.3).
  await supabase.from("requests").insert({
    profile_id: invoer.profileId,
    kind: "inschrijving",
    body: `Aanmelding via de website voor: ${invoer.cursusTitel}`,
  });

  const { data: profiel } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", invoer.profileId)
    .maybeSingle();

  // Een mislukte mail mag de aanvraag niet ongedaan maken: die staat er al.
  await verstuurMail({
    aan: invoer.email,
    onderwerp: `We hebben je aanmelding voor ${invoer.cursusTitel} ontvangen`,
    template: InschrijfaanvraagMail({
      voornaam: profiel?.first_name ?? "daar",
      cursusTitel: invoer.cursusTitel,
    }),
  }).catch((fout: unknown) => {
    console.error(
      `[inschrijven] bevestigingsmail mislukt: ${
        fout instanceof Error ? fout.message : "onbekende fout"
      }`,
    );
  });
}

export async function startInschrijving(
  _vorige: InschrijfResultaat | { status: "idle" },
  formData: FormData,
): Promise<InschrijfResultaat> {
  const slug = String(formData.get("slug") ?? "");
  if (!slug) {
    return {
      status: "fout",
      bericht: "Er ging iets mis. Probeer het opnieuw.",
    };
  }

  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);

  if (!gebruiker) {
    redirect(`/inloggen?vervolg=${encodeURIComponent(`/inschrijven/${slug}`)}`);
  }

  const { data: cursus } = await supabase
    .from("courses")
    .select("id, title, slug, price_cents, currency")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!cursus) {
    return {
      status: "fout",
      bericht: "Deze opleiding is niet meer beschikbaar.",
    };
  }

  // Bestaat er al een inschrijving? Dan hergebruiken we die in plaats van een
  // tweede aan te maken — de unieke sleutel op (profile_id, course_id) zou dat
  // toch weigeren.
  const { data: bestaand } = await supabase
    .from("enrollments")
    .select("id, status")
    .eq("profile_id", gebruiker.id)
    .eq("course_id", cursus.id)
    .maybeSingle();

  if (bestaand?.status === "betaald" || bestaand?.status === "afgerond") {
    redirect("/portaal");
  }

  if (!bestaand) {
    const { error } = await supabase.from("enrollments").insert({
      profile_id: gebruiker.id,
      course_id: cursus.id,
      status: "in_afwachting",
    });

    if (error) {
      return {
        status: "fout",
        bericht:
          "De inschrijving kon niet worden aangemaakt. Probeer het later opnieuw of neem contact met ons op.",
      };
    }
  }

  // --- Nog geen betaalkoppeling: aanvraag in plaats van afrekenen (§7.1) ----
  if (!betalenIngericht()) {
    await legAanvraagVast(supabase, {
      profileId: gebruiker.id,
      email: gebruiker.email ?? "",
      cursusTitel: cursus.title,
    });

    return {
      status: "aangevraagd",
      bericht:
        "Je aanmelding is binnen. We nemen binnen twee werkdagen contact met je op om de inschrijving af te ronden. Er is nog niets betaald.",
    };
  }

  // --- Wel een koppeling: afrekenen via Mollie -----------------------------
  let betaalUrl: string;
  try {
    const bestelling = await maakBestellingEnBetaling({
      profileId: gebruiker.id,
      omschrijving: cursus.title,
      valuta: cursus.currency,
      regels: [
        {
          courseId: cursus.id,
          omschrijving: cursus.title,
          bedragCenten: cursus.price_cents,
        },
      ],
      retourPad: `/inschrijven/gelukt?cursus=${encodeURIComponent(cursus.slug)}`,
    });
    betaalUrl = bestelling.betaalUrl;
  } catch (fout) {
    console.error(
      `[inschrijven] betaling starten mislukt: ${
        fout instanceof Error ? fout.message : "onbekende fout"
      }`,
    );
    return {
      status: "fout",
      bericht:
        "De betaalpagina kon niet worden geopend. Probeer het zo nog eens, of neem contact met ons op.",
    };
  }

  redirect(betaalUrl);
}
