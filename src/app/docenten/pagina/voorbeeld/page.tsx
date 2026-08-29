import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { formateerPrijs } from "@/features/courses";
import { DocentBlokken } from "@/features/docentpagina/components/blokken";
import { haalEigenPagina } from "@/features/docentpagina/server/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Voorvertoning",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * De eigen pagina met de concepten erin (§ docentenpagina's).
 *
 * Toont wat er ná publiceren zou staan, inclusief verplaatsingen en verborgen
 * blokken. Blokken die als verwijderd zijn gemarkeerd staan er niet meer in —
 * dat is immers wat publiceren zou doen.
 */
export default async function VoorbeeldPage() {
  const pagina = await haalEigenPagina();
  if (!pagina) notFound();

  const supabase = await createClient();

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

  const tonen = pagina.blokken.filter((blok) => !blok.verwijderdInConcept);

  return (
    <div className="-mx-4 -my-10 sm:-mx-6">
      <div className="sticky top-16 z-20 border-y border-sand bg-sand-light px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <p className="text-sm">
            <strong>Voorvertoning.</strong> Zo ziet je pagina eruit ná
            publiceren — bezoekers zien dit nog niet.
          </p>
          <Link
            href="/docenten/pagina"
            className="inline-flex h-9 items-center rounded-lg border border-green px-4 text-sm font-semibold text-green transition-colors hover:bg-hover"
          >
            Terug naar bewerken
          </Link>
        </div>
      </div>

      <div className="bg-paper">
        <DocentBlokken
          blokken={tonen}
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
      </div>
    </div>
  );
}
