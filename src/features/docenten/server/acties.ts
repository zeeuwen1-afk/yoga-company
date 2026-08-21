"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";

/**
 * Handelingen in de docentenportal (§ docentenlaag).
 *
 * Twee dingen, en allebei zetten ze geld in beweging op papier:
 *
 *  - **Kaart uitgeven.** Zonder deze knop ontstaat een kaart nergens. Zolang
 *    er geen betaalkoppeling is, weet alleen de docent dát er betaald is — het
 *    geld staat op zijn eigen rekening. Hij legt hier vast wat hij verkocht.
 *  - **Maand afsluiten.** De bedragen liggen daarna vast en de factuurnummers
 *    zijn uitgedeeld. Het echte werk gebeurt in de database, want de
 *    nummerreeks moet doorlopen zonder gaten, ook als er twee mensen tegelijk
 *    op de knop drukken.
 */

export type DocentResultaat =
  | { status: "idle" }
  | { status: "fout"; bericht: string }
  | { status: "gelukt"; bericht: string };

const kaartSchema = z.object({
  // Geen keuzelijst met klanten: die zou het hele bestand van de studio
  // openzetten voor iedereen die er lesgeeft. De docent typt het adres van
  // degene die zojuist bij hem betaald heeft.
  email: z.email("Vul het e-mailadres van de klant in"),
  product_id: z.uuid("Kies een kaart"),
  opmerking: z.string().trim().max(500).optional().or(z.literal("")),
});

export async function geefKaartUit(
  _vorige: DocentResultaat,
  formData: FormData,
): Promise<DocentResultaat> {
  const parsed = kaartSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      status: "fout",
      bericht: parsed.error.issues[0]?.message ?? "Controleer de invoer.",
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

  const { data: gevonden } = await supabase.rpc("zoek_klant_op_email", {
    p_email: parsed.data.email,
  });
  const klant = gevonden?.[0];

  if (!klant) {
    return {
      status: "fout",
      bericht:
        "Er is geen account met dit adres. Vraag de klant eerst een account aan te maken; daarna kun je de kaart vastleggen.",
    };
  }

  const { data: product } = await supabase
    .from("pass_products")
    .select("naam, aantal_lessen, geldigheid_dagen, uitloop_dagen")
    .eq("id", parsed.data.product_id)
    .maybeSingle();

  if (!product) {
    return { status: "fout", bericht: "Deze kaart bestaat niet meer." };
  }

  // De geldigheid wordt hier uitgerekend en niet in de database, zodat de
  // uitloop die de studio hanteert zichtbaar in de code staat: drie maanden
  // met uitloop tot vier betekent 90 + 30 dagen.
  const dagen =
    product.geldigheid_dagen === null
      ? null
      : product.geldigheid_dagen + product.uitloop_dagen;

  const geldigTot = dagen
    ? new Date(Date.now() + dagen * 86_400_000).toISOString().slice(0, 10)
    : null;

  // `uitgevende_docent_id` moet de eigen id zijn; RLS weigert een andere. Dat
  // is geen dubbele controle maar de enige: hier staat wat we bedoelen, daar
  // staat wat er wordt afgedwongen.
  const { error } = await supabase.from("passes").insert({
    profile_id: klant.profile_id,
    product_id: parsed.data.product_id,
    uitgevende_docent_id: gebruiker.id,
    saldo: product.aantal_lessen,
    geldig_tot: geldigTot,
    opmerking: parsed.data.opmerking || null,
  });

  if (error) {
    return {
      status: "fout",
      bericht: "De kaart kon niet worden vastgelegd. Probeer het opnieuw.",
    };
  }

  revalidatePath("/docenten");
  revalidatePath("/portaal");

  return {
    status: "gelukt",
    bericht: `${product.naam} uitgegeven aan ${klant.naam}. Hij ziet hem meteen in zijn eigen omgeving.`,
  };
}

const maandSchema = z.object({
  periode: z.string().regex(/^\d{4}-\d{2}-01$/, "Kies een maand"),
});

export async function sluitMaandAf(
  _vorige: DocentResultaat,
  formData: FormData,
): Promise<DocentResultaat> {
  const parsed = maandSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { status: "fout", bericht: "Kies een maand die voorbij is." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("sluit_maand_af", {
    p_periode: parsed.data.periode,
  });

  if (error) {
    // De database geeft nette meldingen terug ("Vul eerst je factuurgegevens
    // in", "Deze maand is nog niet voorbij"); die zijn bedoeld om te tonen.
    return { status: "fout", bericht: error.message };
  }

  revalidatePath("/docenten");

  if (!data) {
    return {
      status: "gelukt",
      bericht: "Er viel niets te factureren over deze maand.",
    };
  }

  return {
    status: "gelukt",
    bericht:
      data === 1
        ? "Eén factuur klaargezet. De maand ligt nu vast."
        : `${data} facturen klaargezet. De maand ligt nu vast.`,
  };
}
