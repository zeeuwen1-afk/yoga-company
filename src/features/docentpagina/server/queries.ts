import "server-only";

import { bloktype } from "@/content/docent-blokken";
import { publicEnv } from "@/lib/env";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";

/**
 * De landingspagina van een docent (§ docentenpagina's).
 *
 * De publieke kant leest met de anonieme client: RLS levert dan uitsluitend
 * pagina's die gepubliceerd zijn én van een docent met een lopend abonnement
 * of respijt. Er staat hier daarom geen filter op status — die zou een tweede
 * waarheid worden naast de policy, en die twee lopen vroeg of laat uiteen.
 */

export type Blok = {
  id: string;
  type: string;
  volgorde: number | null;
  zichtbaar: boolean;
  inhoud: Record<string, unknown>;
  /** Alleen in de editor gevuld: wat er nog niet gepubliceerd is. */
  heeftConcept: boolean;
  verwijderdInConcept: boolean;
};

export type Docentpagina = {
  profileId: string;
  slug: string;
  naam: string;
  seoTitel: string | null;
  seoOmschrijving: string | null;
  status: "concept" | "gepubliceerd";
  blokken: Blok[];
};

function alsInhoud(waarde: unknown): Record<string, unknown> {
  return waarde && typeof waarde === "object" && !Array.isArray(waarde)
    ? (waarde as Record<string, unknown>)
    : {};
}

/**
 * De pagina zoals een bezoeker hem ziet.
 *
 * Geeft `null` wanneer de pagina niet bestaat, nog concept is, of de docent
 * geen lopend abonnement meer heeft — alle drie afgehandeld door RLS, dus van
 * buitenaf niet te onderscheiden. Dat is precies goed: een bezoeker hoeft niet
 * te weten of iemand zijn rekening niet betaald heeft.
 */
export async function haalPubliekePagina(
  slug: string,
): Promise<Docentpagina | null> {
  const supabase = createPublicClient();

  const { data: pagina } = await supabase
    .from("docent_paginas")
    .select("profile_id, slug, seo_titel, seo_omschrijving, status")
    .eq("slug", slug)
    .maybeSingle();

  if (!pagina) return null;

  const [{ data: blokken }, { data: namen }] = await Promise.all([
    supabase
      .from("docent_blokken")
      .select("id, type, volgorde, zichtbaar, inhoud")
      .eq("pagina_id", pagina.profile_id)
      .order("volgorde"),
    supabase.rpc("collega_namen"),
  ]);

  return {
    profileId: pagina.profile_id,
    slug: pagina.slug,
    // De naam van de docent staat niet in `profiles` voor een anonieme
    // bezoeker; hij komt uit de kop van de pagina zelf, en anders uit de slug.
    naam:
      (namen ?? []).find((n) => n.profile_id === pagina.profile_id)?.naam ??
      pagina.slug,
    seoTitel: pagina.seo_titel,
    seoOmschrijving: pagina.seo_omschrijving,
    status: pagina.status,
    blokken: (blokken ?? []).map((blok) => ({
      id: blok.id,
      type: blok.type,
      volgorde: blok.volgorde,
      zichtbaar: blok.zichtbaar,
      inhoud: alsInhoud(blok.inhoud),
      heeftConcept: false,
      verwijderdInConcept: false,
    })),
  };
}

/** Een oud adres dat naar een nieuwe slug wijst, of null. */
export async function haalOudeSlug(slug: string): Promise<string | null> {
  const supabase = createPublicClient();

  const { data } = await supabase
    .from("docent_slug_historie")
    .select("profile_id")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return null;

  const { data: nieuw } = await supabase
    .from("docent_paginas")
    .select("slug")
    .eq("profile_id", data.profile_id)
    .maybeSingle();

  return nieuw?.slug ?? null;
}

/**
 * De eigen pagina met de concepten erover heen — wat de editor en de
 * voorvertoning tonen.
 */
export async function haalEigenPagina(): Promise<Docentpagina | null> {
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);
  if (!gebruiker) return null;

  const { data: pagina } = await supabase
    .from("docent_paginas")
    .select("profile_id, slug, seo_titel, seo_omschrijving, status")
    .eq("profile_id", gebruiker.id)
    .maybeSingle();

  if (!pagina) return null;

  const [{ data: blokken }, { data: profiel }] = await Promise.all([
    supabase
      .from("docent_blokken")
      .select(
        `id, type, volgorde, zichtbaar, inhoud,
         concept_inhoud, concept_volgorde, concept_zichtbaar, concept_verwijderd,
         created_at`,
      )
      .eq("pagina_id", gebruiker.id),
    supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", gebruiker.id)
      .maybeSingle(),
  ]);

  const samengevoegd = (blokken ?? [])
    .map((blok) => ({
      id: blok.id,
      type: blok.type,
      volgorde: blok.concept_volgorde ?? blok.volgorde,
      zichtbaar: blok.concept_zichtbaar ?? blok.zichtbaar,
      inhoud: alsInhoud(blok.concept_inhoud ?? blok.inhoud),
      heeftConcept:
        blok.concept_inhoud !== null ||
        blok.concept_volgorde !== null ||
        blok.concept_zichtbaar !== null ||
        blok.concept_verwijderd,
      verwijderdInConcept: blok.concept_verwijderd,
      // De kop staat altijd voorop; daarna op volgorde, en blokken zonder
      // volgorde (nieuw in concept) achteraan tot ze gepubliceerd zijn.
      sorteer:
        blok.type === "kop_portret"
          ? -1
          : (blok.concept_volgorde ?? blok.volgorde ?? 9999),
    }))
    .sort((a, b) => a.sorteer - b.sorteer)
    .map(({ sorteer: _sorteer, ...rest }) => rest);

  return {
    profileId: pagina.profile_id,
    slug: pagina.slug,
    naam: profiel ? `${profiel.first_name} ${profiel.last_name}` : pagina.slug,
    seoTitel: pagina.seo_titel,
    seoOmschrijving: pagina.seo_omschrijving,
    status: pagina.status,
    blokken: samengevoegd,
  };
}

/** Wat er van het abonnement bekend is, voor de kaart in de portal. */
export async function haalAbonnement() {
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);
  if (!gebruiker) return null;

  const [{ data: abo }, { data: mag }, { data: instelling }] =
    await Promise.all([
      supabase
        .from("teacher_subscriptions")
        .select("bedrag_centen, ingangsdatum, opzegdatum, actief, respijt_tot")
        .eq("profile_id", gebruiker.id)
        .order("ingangsdatum", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.rpc("heeft_abonnement", { p_profile_id: gebruiker.id }),
      supabase
        .from("platform_instellingen")
        .select("waarde")
        .eq("sleutel", "docentabonnement_centen")
        .maybeSingle(),
    ]);

  return {
    abonnement: abo,
    loopt: mag === true,
    standaardCenten: Number(instelling?.waarde ?? 2500),
  };
}

/** De publieke lijst met docenten die een pagina hebben. */
export async function haalDocentenlijst() {
  const supabase = createPublicClient();

  const { data } = await supabase
    .from("docent_paginas")
    .select("slug, profile_id, seo_omschrijving")
    .order("slug");

  if (!data || data.length === 0) return [];

  // De koppen leveren naam en portret; die staan al in een blok dat publiek
  // leesbaar is, dus daar is geen extra doorkijk voor nodig.
  const { data: koppen } = await supabase
    .from("docent_blokken")
    .select("pagina_id, inhoud")
    .eq("type", "kop_portret");

  return data.map((pagina) => {
    const kop = alsInhoud(
      koppen?.find((k) => k.pagina_id === pagina.profile_id)?.inhoud,
    );
    const portret = kop.portret as { url?: string; alt?: string } | undefined;

    return {
      slug: pagina.slug,
      titel: (kop.titel as string) || pagina.slug,
      bovenkop: (kop.bovenkop as string) || "",
      zin: (kop.zin as string) || pagina.seo_omschrijving || "",
      portret: portret?.url ?? null,
      portretAlt: portret?.alt ?? "",
    };
  });
}

/**
 * Het openbare webadres van een bestand in de bucket `public-media`.
 *
 * In de database staat het pad, niet de hele URL — dat scheelt een verhuizing
 * wanneer het Supabase-project ooit een ander adres krijgt.
 */
export function beeldUrl(pad: string): string {
  return `${publicEnv().NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${pad}`;
}

/** De eigen foto's, voor de kiezer in de editor. */
export async function haalEigenMedia() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("docent_media")
    .select("id, pad, bestandsnaam, alt")
    .order("geupload_op", { ascending: false })
    .limit(60);

  return (data ?? []).map((rij) => ({
    ...rij,
    // De kiezer zet de volledige URL in het blok, zodat de publieke pagina
    // niets hoeft om te rekenen.
    url: beeldUrl(rij.pad),
  }));
}

/** Of een bloktype zijn inhoud uit de database haalt. */
export function isVastBlok(type: string): boolean {
  return bloktype(type)?.vast ?? false;
}
