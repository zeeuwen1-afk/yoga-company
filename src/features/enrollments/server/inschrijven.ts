"use server";

import { redirect } from "next/navigation";

import { maakCheckoutSessie } from "@/features/payments";
import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";
import { stripeIngericht } from "@/lib/stripe";

/**
 * Inschrijven op een opleiding of training (BOUWPROMPT §9).
 *
 * De volgorde is bewust: eerst een inschrijving in onze database met status
 * `in_afwachting`, dan pas de betaallink. Zo bestaat er nooit een betaling
 * zonder inschrijving om aan te koppelen. Andersom kan wel: een inschrijving
 * zonder betaling blijft simpelweg in afwachting staan.
 *
 * De klant kan de status niet zelf zetten — dat verhindert RLS (§6). Alleen de
 * webhook, via de service-role, zet hem op betaald.
 */

export type InschrijfResultaat = {
  status: "fout";
  bericht: string;
};

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
    .select("id, title, slug, price_cents, currency, stripe_price_id")
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

  let enrollmentId = bestaand?.id;

  if (!enrollmentId) {
    const { data: nieuw, error } = await supabase
      .from("enrollments")
      .insert({
        profile_id: gebruiker.id,
        course_id: cursus.id,
        status: "in_afwachting",
      })
      .select("id")
      .single();

    if (error || !nieuw) {
      return {
        status: "fout",
        bericht:
          "De inschrijving kon niet worden aangemaakt. Probeer het later opnieuw of neem contact met ons op.",
      };
    }
    enrollmentId = nieuw.id;
  }

  if (!stripeIngericht()) {
    return {
      status: "fout",
      bericht:
        "Online betalen is nog niet ingericht. Neem contact met ons op, dan regelen we het persoonlijk.",
    };
  }

  let betaalUrl: string;
  try {
    const sessie = await maakCheckoutSessie({
      enrollmentId,
      cursusTitel: cursus.title,
      cursusSlug: cursus.slug,
      prijsCenten: cursus.price_cents,
      valuta: cursus.currency,
      emailKlant: gebruiker.email ?? "",
      stripePriceId: cursus.stripe_price_id,
    });
    betaalUrl = sessie.url;
  } catch (fout) {
    console.error(
      `[inschrijven] checkout mislukt: ${
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
