import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { AdminKop, LegeLijst, Paneel } from "@/features/admin/components/ui";
import { createClient } from "@/lib/supabase/server";
import { formateerPrijs } from "@/features/courses";

export const metadata: Metadata = {
  title: "Aanbod",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AanbodPage() {
  // Rechtstreeks bevraagd in plaats van via `haalAanbod()`: de beheerder moet
  // ook het inactieve aanbod zien, dat op de publieke site verborgen is.
  const supabase = await createClient();
  const { data: aanbod } = await supabase
    .from("courses")
    .select(
      "id, type, title, slug, price_cents, is_active, has_digital_content, sort",
    )
    .order("sort", { ascending: true });

  return (
    <>
      <AdminKop
        titel="Aanbod"
        toelichting="Opleidingen en trainingen zoals ze op de website staan."
        actie={
          <Link
            href="/admin/aanbod/nieuw"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-green px-5 font-semibold text-cream transition-colors hover:bg-green-dark"
          >
            <Plus className="size-4" aria-hidden />
            Nieuw aanbod
          </Link>
        }
      />

      <Paneel>
        {!aanbod || aanbod.length === 0 ? (
          <LegeLijst>Nog geen aanbod. Voeg je eerste opleiding toe.</LegeLijst>
        ) : (
          <ul className="divide-y divide-line">
            {aanbod.map((cursus) => (
              <li key={cursus.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/aanbod/${cursus.slug}`}
                      className="font-semibold hover:text-green"
                    >
                      {cursus.title}
                    </Link>
                    <p className="text-sm text-muted">
                      {cursus.type === "opleiding" ? "Opleiding" : "Training"} ·{" "}
                      {formateerPrijs(cursus.price_cents)}
                      {cursus.has_digital_content
                        ? " · met lesmateriaal"
                        : null}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {cursus.is_active ? (
                      <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                        Online
                      </span>
                    ) : (
                      <span className="rounded-full bg-sand-light px-3 py-1 text-xs font-semibold text-muted">
                        Verborgen
                      </span>
                    )}
                    <Link
                      href={`/admin/aanbod/${cursus.slug}/content`}
                      className="text-sm font-semibold text-green underline"
                    >
                      Lesmateriaal
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Paneel>
    </>
  );
}
