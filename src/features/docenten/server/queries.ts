import "server-only";

import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";

/**
 * De cijfers voor de docentenportal (§ docentenlaag).
 *
 * Alle queries hieronder draaien met de sessie van de docent zelf. Er staat
 * daarom nergens een filter op "mijn kaarten": RLS levert er per definitie
 * niets anders uit. Dat is bewust — een vergeten `where` in dit bestand mag
 * nooit het klantenbestand van een collega opleveren.
 */

export type Maandcijfers = {
  /** Wat er deze maand aan kaarten is verkocht, inclusief btw. */
  verkochtCenten: number;
  aantalVerkocht: number;
  /**
   * Wat er nog aan lessen tegenover het ontvangen geld staat. Geen omzet maar
   * een schuld aan je klanten: strippen die nog gegeven moeten worden.
   * Exclusief btw, want dat is het deel dat werkelijk van jou is.
   */
  verplichtingCenten: number;
  openStrippen: number;
  /** Lessen die jij gaf op de kaart van een collega: jij factureert. */
  teFacturerenCenten: number;
  teFacturerenLessen: number;
  /** Lessen die een collega gaf op jouw kaart: jij krijgt een factuur. */
  teOntvangenCenten: number;
  teOntvangenLessen: number;
};

export type Afboeking = {
  id: string;
  datum: string;
  klant: string;
  kaart: string;
  docent: string;
  isEigen: boolean;
  bedragCenten: number;
};

export type Collega = { profileId: string; naam: string };

/** Eerste en laatste dag van de maand waarin een datum valt, als ISO-tekst. */
export function maandgrenzen(peil: Date) {
  const start = new Date(
    Date.UTC(peil.getUTCFullYear(), peil.getUTCMonth(), 1),
  );
  const eind = new Date(
    Date.UTC(peil.getUTCFullYear(), peil.getUTCMonth() + 1, 1),
  );
  return { start: start.toISOString(), eind: eind.toISOString() };
}

/** Geeft de docent zijn eigen studio's, of een lege lijst als hij er geen is. */
export async function haalDocentschap() {
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);
  if (!gebruiker) return { docentId: null, studios: [] as string[] };

  const { data } = await supabase
    .from("studio_teachers")
    .select("studio_id")
    .eq("profile_id", gebruiker.id);

  return {
    docentId: gebruiker.id,
    studios: (data ?? []).map((rij) => rij.studio_id),
  };
}

export async function haalCollegas(): Promise<Map<string, string>> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("collega_namen");
  return new Map((data ?? []).map((rij) => [rij.profile_id, rij.naam]));
}

/**
 * Namen van de eigen klanten. Komt niet uit `profiles` maar uit een functie
 * die alleen de naam teruggeeft — een docent hoort geen telefoonnummers of
 * geboortedata van klanten te kunnen ophalen, ook niet van zijn eigen.
 */
export async function haalKlantnamen(): Promise<Map<string, string>> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("klant_namen");
  return new Map((data ?? []).map((rij) => [rij.profile_id, rij.naam]));
}

export async function haalMaandcijfers(peil: Date): Promise<Maandcijfers> {
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);
  const leeg: Maandcijfers = {
    verkochtCenten: 0,
    aantalVerkocht: 0,
    verplichtingCenten: 0,
    openStrippen: 0,
    teFacturerenCenten: 0,
    teFacturerenLessen: 0,
    teOntvangenCenten: 0,
    teOntvangenLessen: 0,
  };
  if (!gebruiker) return leeg;

  const { start, eind } = maandgrenzen(peil);

  const [verkocht, openstaand, gegeven, ontvangen] = await Promise.all([
    supabase
      .from("passes")
      .select("pass_products(prijs_centen)")
      .eq("uitgevende_docent_id", gebruiker.id)
      .gte("uitgegeven_op", start)
      .lt("uitgegeven_op", eind),
    supabase
      .from("passes")
      .select("saldo, pass_products(verrekenwaarde_centen)")
      .eq("uitgevende_docent_id", gebruiker.id)
      .eq("status", "actief"),
    // Lessen die ik gaf op andermans kaart.
    supabase
      .from("pass_usages")
      .select("verrekenwaarde_centen")
      .eq("docent_die_lesgaf_id", gebruiker.id)
      .eq("is_kruisgebruik", true)
      .eq("status", "open")
      .gte("afgeboekt_op", start)
      .lt("afgeboekt_op", eind),
    // Lessen op mijn kaarten die een ander gaf. RLS laat mij deze zien omdat
    // de kaart van mij is; de filter op de uitgever kan er daarom niet bij.
    supabase
      .from("pass_usages")
      .select("verrekenwaarde_centen, passes!inner(uitgevende_docent_id)")
      .eq("passes.uitgevende_docent_id", gebruiker.id)
      .eq("is_kruisgebruik", true)
      .eq("status", "open")
      .gte("afgeboekt_op", start)
      .lt("afgeboekt_op", eind),
  ]);

  const verkochtRijen = verkocht.data ?? [];
  const openstaandRijen = openstaand.data ?? [];
  const gegevenRijen = gegeven.data ?? [];
  const ontvangenRijen = ontvangen.data ?? [];

  return {
    verkochtCenten: verkochtRijen.reduce(
      (som, rij) => som + (rij.pass_products?.prijs_centen ?? 0),
      0,
    ),
    aantalVerkocht: verkochtRijen.length,
    verplichtingCenten: openstaandRijen.reduce(
      (som, rij) =>
        som +
        (rij.saldo ?? 0) * (rij.pass_products?.verrekenwaarde_centen ?? 0),
      0,
    ),
    openStrippen: openstaandRijen.reduce(
      (som, rij) => som + (rij.saldo ?? 0),
      0,
    ),
    teFacturerenCenten: gegevenRijen.reduce(
      (som, rij) => som + rij.verrekenwaarde_centen,
      0,
    ),
    teFacturerenLessen: gegevenRijen.length,
    teOntvangenCenten: ontvangenRijen.reduce(
      (som, rij) => som + rij.verrekenwaarde_centen,
      0,
    ),
    teOntvangenLessen: ontvangenRijen.length,
  };
}

/** De afboekingen op de eigen uitgegeven kaarten, nieuwste eerst. */
export async function haalAfboekingen(peil: Date): Promise<Afboeking[]> {
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);
  if (!gebruiker) return [];

  const { start, eind } = maandgrenzen(peil);
  const [collegas, klanten] = await Promise.all([
    haalCollegas(),
    haalKlantnamen(),
  ]);

  const { data } = await supabase
    .from("pass_usages")
    .select(
      `id, afgeboekt_op, verrekenwaarde_centen, is_kruisgebruik,
       docent_die_lesgaf_id,
       passes!inner(uitgevende_docent_id, profile_id, pass_products(naam))`,
    )
    .eq("passes.uitgevende_docent_id", gebruiker.id)
    .gte("afgeboekt_op", start)
    .lt("afgeboekt_op", eind)
    .order("afgeboekt_op", { ascending: false });

  return (data ?? []).map((rij) => {
    const isEigen = rij.docent_die_lesgaf_id === gebruiker.id;
    return {
      id: rij.id,
      datum: rij.afgeboekt_op,
      klant: klanten.get(rij.passes?.profile_id ?? "") ?? "Onbekend",
      kaart: rij.passes?.pass_products?.naam ?? "Kaart",
      docent: isEigen
        ? "jij"
        : (collegas.get(rij.docent_die_lesgaf_id) ?? "een collega"),
      isEigen,
      // Bij een les die je zelf gaf valt er niets te verrekenen.
      bedragCenten: rij.is_kruisgebruik ? rij.verrekenwaarde_centen : 0,
    };
  });
}

/**
 * Wat er per collega te factureren valt over een maand — de conceptfactuur.
 * Alleen lessen die ík gaf op hún kaart; dat is de kant die ik verstuur.
 */
export async function haalConceptfacturen(peil: Date) {
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);
  if (!gebruiker) return [];

  const { start, eind } = maandgrenzen(peil);
  const collegas = await haalCollegas();

  const { data } = await supabase
    .from("pass_usages")
    .select(
      `verrekenwaarde_centen,
       passes!inner(uitgevende_docent_id, pass_products(naam))`,
    )
    .eq("docent_die_lesgaf_id", gebruiker.id)
    .eq("is_kruisgebruik", true)
    .eq("status", "open")
    .gte("afgeboekt_op", start)
    .lt("afgeboekt_op", eind);

  const perCollega = new Map<
    string,
    { naam: string; regels: Map<string, { aantal: number; centen: number }> }
  >();

  for (const rij of data ?? []) {
    const schuldenaar = rij.passes?.uitgevende_docent_id;
    if (!schuldenaar) continue;

    const kaart = rij.passes?.pass_products?.naam ?? "Kaart";
    const bestaand = perCollega.get(schuldenaar) ?? {
      naam: collegas.get(schuldenaar) ?? "Collega",
      regels: new Map(),
    };
    const regel = bestaand.regels.get(kaart) ?? { aantal: 0, centen: 0 };
    regel.aantal += 1;
    regel.centen += rij.verrekenwaarde_centen;
    bestaand.regels.set(kaart, regel);
    perCollega.set(schuldenaar, bestaand);
  }

  return [...perCollega.entries()].map(([id, waarde]) => ({
    collegaId: id,
    naam: waarde.naam,
    regels: [...waarde.regels.entries()].map(([kaart, r]) => ({
      kaart,
      aantal: r.aantal,
      centen: r.centen,
    })),
    subtotaalCenten: [...waarde.regels.values()].reduce(
      (som, r) => som + r.centen,
      0,
    ),
  }));
}

/** De verstuurde facturen, beide kanten op. */
export async function haalFacturen() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("invoices")
    .select("id, factuurnummer, factuurdatum, totaal_centen, docent_id")
    .order("factuurdatum", { ascending: false })
    .limit(50);
  return data ?? [];
}

export async function haalProducten() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pass_products")
    .select(
      "id, naam, aantal_lessen, prijs_centen, geldigheid_dagen, uitloop_dagen",
    )
    .eq("actief", true)
    .order("volgorde");
  return data ?? [];
}
