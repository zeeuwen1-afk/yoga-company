import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";

export const metadata: Metadata = {
  title: "Inschrijving ontvangen",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Landingspagina na het betalen (BOUWPROMPT §9).
 *
 * De pagina bevestigt niets op eigen houtje: de betaling geldt pas als betaald
 * wanneer de webhook dat heeft vastgesteld. Bij iDEAL kan dat enkele seconden
 * later zijn. Daarom twee teksten — één voor "rond" en één voor "onderweg" —
 * en nooit de suggestie dat er iets is misgegaan.
 */
export default async function InschrijvingGeluktPage() {
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);

  if (!gebruiker) redirect("/inloggen");

  const { data: recent } = await supabase
    .from("enrollments")
    .select("status, courses!inner (title)")
    .eq("profile_id", gebruiker.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const cursus = Array.isArray(recent?.courses)
    ? recent?.courses[0]
    : recent?.courses;
  const isBetaald = recent?.status === "betaald";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-line bg-cream">
          <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
            <h1 className="text-4xl sm:text-5xl">
              {isBetaald
                ? "Je bent ingeschreven"
                : "We hebben je betaling ontvangen"}
            </h1>

            {isBetaald ? (
              <>
                <p className="mt-5 text-lg text-muted">
                  Fijn dat je erbij bent
                  {cursus?.title ? ` bij ${cursus.title}` : null}. Je ontvangt
                  een bevestiging per e-mail met de praktische informatie.
                </p>
                <p className="mt-3 text-muted">
                  De lesdata sturen we je ruim van tevoren toe.
                </p>
              </>
            ) : (
              <>
                <p className="mt-5 text-lg text-muted">
                  Bedankt. Je betaling wordt verwerkt — bij iDEAL duurt dat soms
                  een paar seconden, soms iets langer.
                </p>
                <p className="mt-3 text-muted">
                  Zodra de betaling rond is, zie je je inschrijving in je eigen
                  omgeving staan en ontvang je een bevestiging per e-mail. Je
                  hoeft niets te doen; ververs deze pagina gerust over een
                  minuut.
                </p>
              </>
            )}

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/portaal"
                className="inline-flex h-12 items-center rounded-lg bg-green px-7 font-semibold text-cream transition-colors hover:bg-green-dark"
              >
                Naar mijn omgeving
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center rounded-lg border border-line px-7 font-semibold text-green-dark transition-colors hover:bg-sand-light"
              >
                Een vraag stellen
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
