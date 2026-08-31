import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import { formateerPrijs } from "@/features/courses";
import { DocentBlokken } from "@/features/docentpagina/components/blokken";
import {
  haalOudeSlug,
  haalPubliekePagina,
} from "@/features/docentpagina/server/queries";
import { createPublicClient } from "@/lib/supabase/public";

// De pagina verandert zodra een docent publiceert; het rooster erop verandert
// bij elke boeking. Een minuut is kort genoeg om te blijven kloppen en lang
// genoeg om niet bij elk bezoek de database te raken.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pagina = await haalPubliekePagina(slug);

  if (!pagina) return { title: "Pagina niet gevonden" };

  return {
    title: pagina.seoTitel ?? `${pagina.naam} · yogadocent`,
    description:
      pagina.seoOmschrijving ??
      `Lessen, tarieven en achtergrond van ${pagina.naam} bij YogaCompany.`,
    alternates: { canonical: `/docent/${pagina.slug}` },
  };
}

/**
 * De landingspagina van één docent (§ docentenpagina's).
 *
 * Wat hier níét staat is een filter op status of abonnement. RLS levert
 * uitsluitend pagina's die gepubliceerd zijn én van een docent met een lopend
 * abonnement of respijt; een tweede controle hier zou een tweede waarheid
 * worden, en die twee lopen vroeg of laat uiteen.
 */
export default async function DocentPagina({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pagina = await haalPubliekePagina(slug);

  if (!pagina) {
    // Misschien is dit een oud adres. Iemand die de link op zijn Instagram
    // heeft staan hoort niet in het niets te belanden omdat de docent zijn
    // adres heeft gewijzigd.
    const nieuw = await haalOudeSlug(slug);
    if (nieuw) permanentRedirect(`/docent/${nieuw}`);
    notFound();
  }

  const supabase = createPublicClient();

  const [{ data: lessen }, { data: producten }] = await Promise.all([
    supabase
      .from("class_sessions_public")
      .select("id, title, starts_at, free_spots")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at")
      .limit(9),
    supabase
      .from("pass_products")
      .select("naam, prijs_centen, volgorde")
      .eq("actief", true)
      .order("volgorde")
      .limit(5),
  ]);

  return (
    <>
      {/* Klein en zonder kader: voor iemand die een yogales zoekt is een
          inlogknop voor docenten ruis, en hij concurreert met de enige knop die
          er werkelijk toe doet. Wie hem zoekt vindt hem. */}
      <div className="border-b border-line bg-cream">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 text-sm sm:px-6">
          <span className="text-muted">
            Yogadocent bij{" "}
            <Link href="/lessen" className="underline hover:text-green">
              YogaCompany
            </Link>
          </span>
          <Link
            href="/docenten"
            className="text-muted underline hover:text-green"
          >
            Inloggen docenten
          </Link>
        </div>
      </div>

      <DocentBlokken
        blokken={pagina.blokken}
        lessen={(lessen ?? []).map((les) => ({
          id: les.id,
          titel: les.title,
          start: les.starts_at,
          vrijePlekken: les.free_spots ?? 0,
        }))}
        producten={(producten ?? []).map((product) => ({
          naam: product.naam,
          prijs: formateerPrijs(product.prijs_centen),
        }))}
      />

      <div className="border-t border-line bg-cream">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm sm:px-6">
          <span className="text-muted">
            Deze pagina wordt bijgehouden door de docent zelf.
          </span>
          <Link
            href="/docenten"
            className="text-muted underline hover:text-green"
          >
            Inloggen docenten
          </Link>
        </div>
      </div>
    </>
  );
}
