import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminKop, Paneel } from "@/features/admin/components/ui";
import { AanbodVerwijderen } from "@/features/courses/components/aanbod-verwijderen";
import { CursusFormulier } from "@/features/courses/components/cursus-formulier";
import { haalCursus } from "@/features/courses";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Aanbod bewerken",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AanbodBewerkenPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Ook verborgen aanbod moet bewerkbaar zijn, dus de id en actief-status
  // komen rechtstreeks uit de database.
  const supabase = await createClient();
  const { data: rij } = await supabase
    .from("courses")
    .select("id, is_active")
    .eq("slug", slug)
    .maybeSingle();

  const cursus = await haalCursus(slug);

  if (!rij || !cursus) notFound();

  const publiekPad =
    cursus.type === "opleiding" ? "/opleidingen" : "/trainingen";

  return (
    <>
      <AdminKop
        kruimel={{ href: "/admin/aanbod", label: "Aanbod" }}
        titel={cursus.titel}
        actie={
          <div className="flex gap-3">
            <Link
              href={`${publiekPad}/${cursus.slug}`}
              className="inline-flex h-11 items-center rounded-lg border border-line px-5 font-semibold text-green-dark transition-colors hover:bg-hover"
            >
              Bekijk op de site
            </Link>
            <Link
              href={`/admin/aanbod/${cursus.slug}/content`}
              className="inline-flex h-11 items-center rounded-lg bg-primary px-5 font-semibold text-primary-foreground transition-colors hover:bg-accent-light"
            >
              Lesmateriaal
            </Link>
          </div>
        }
      />

      <Paneel>
        <div className="p-5">
          <CursusFormulier
            cursus={cursus}
            cursusId={rij.id}
            isActief={rij.is_active}
          />
        </div>
      </Paneel>

      {/* Onderaan en apart, want dit is geen bewerking maar een eindpunt.
          Verbergen staat bewust als eerste genoemd: dat is in de meeste
          gevallen wat iemand eigenlijk bedoelt. */}
      <Paneel titel="Verwijderen">
        <div className="space-y-3 p-5">
          <p className="text-sm text-muted">
            Wil je dit alleen van de website halen, haal dan het vinkje
            &ldquo;Zichtbaar op de website&rdquo; hierboven weg. Dan blijft de
            administratie kloppen en kun je het later weer aanzetten.
          </p>
          <AanbodVerwijderen cursusId={rij.id} titel={cursus.titel} />
        </div>
      </Paneel>
    </>
  );
}
