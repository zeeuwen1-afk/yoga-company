import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Download } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  GegevensFormulier,
  ToestemmingSchakelaar,
  TweestapsSchakelaar,
  WachtwoordFormulier,
} from "@/features/portaal/components/profiel-secties";
import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";

export const metadata: Metadata = {
  title: "Profiel",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function Sectie({
  titel,
  toelichting,
  children,
}: {
  titel: string;
  toelichting?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl">{titel}</h2>
      {toelichting ? (
        <p className="mt-1 text-sm text-muted">{toelichting}</p>
      ) : null}
      <Card className="mt-3 bg-white">
        <CardContent className="p-6">{children}</CardContent>
      </Card>
    </section>
  );
}

export default async function ProfielPage() {
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);

  if (!gebruiker) redirect("/inloggen?vervolg=/portaal/profiel");

  const { data: profiel } = await supabase
    .from("profiles")
    .select("first_name, last_name, email, phone, marketing_consent_at")
    .eq("id", gebruiker.id)
    .maybeSingle();

  // Staat er al een authenticator gekoppeld?
  const { data: factoren } = await supabase.auth.mfa.listFactors();
  const totp = factoren?.totp?.find((factor) => factor.status === "verified");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl">Profiel</h1>
        <p className="mt-2 text-muted">
          Je gegevens, je beveiliging en wat er met je gegevens gebeurt.
        </p>
      </div>

      <Sectie titel="Je gegevens">
        <GegevensFormulier
          voornaam={profiel?.first_name ?? ""}
          achternaam={profiel?.last_name ?? ""}
          email={profiel?.email ?? gebruiker.email ?? ""}
          telefoon={profiel?.phone ?? null}
        />
      </Sectie>

      <Sectie titel="Wachtwoord">
        <WachtwoordFormulier />
      </Sectie>

      <Sectie
        titel="Beveiliging"
        toelichting="Een extra slot op je account, naast je wachtwoord."
      >
        <TweestapsSchakelaar
          isIngeschakeld={Boolean(totp)}
          factorId={totp?.id ?? null}
        />
      </Sectie>

      <Sectie titel="E-mail van ons">
        <ToestemmingSchakelaar
          gegevenOp={profiel?.marketing_consent_at ?? null}
        />
      </Sectie>

      {/* AVG-zelfservice (§11, §17.7) -------------------------------------- */}
      <Sectie
        titel="Je gegevens en je rechten"
        toelichting="Je mag altijd inzien wat we van je bewaren, en vragen om verwijdering."
      >
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold">Download je gegevens</h3>
            <p className="mt-1 text-sm text-muted">
              Alles wat we van je bewaren, in één bestand. Je betaalgegevens
              staan bij Stripe en niet bij ons.
            </p>
            <a
              href="/api/v1/mijn-gegevens"
              download
              className="mt-3 inline-flex h-11 items-center gap-2 rounded-lg border border-line px-5 font-semibold text-green-dark transition-colors hover:bg-cream"
            >
              <Download className="size-4" aria-hidden />
              Download mijn gegevens
            </a>
          </div>

          <div className="border-t border-line pt-6">
            <h3 className="font-semibold">Je account verwijderen</h3>
            <p className="mt-1 text-sm text-muted">
              We anonimiseren je gegevens binnen een maand. Je inschrijvingen
              blijven geanonimiseerd staan voor onze boekhouding, omdat de wet
              dat vereist. Je verliest de toegang tot je lesmateriaal en je
              voortgang.
            </p>
            <Link
              href="/portaal/aanvragen?soort=avg_verwijdering"
              className="mt-3 inline-flex h-11 items-center rounded-lg border border-error/40 px-5 font-semibold text-error transition-colors hover:bg-error/5"
            >
              Verwijdering aanvragen
            </Link>
          </div>

          <p className="border-t border-line pt-6 text-sm text-muted">
            Lees in onze{" "}
            <Link href="/privacyverklaring" className="underline">
              privacyverklaring
            </Link>{" "}
            precies welke gegevens we verwerken en hoe lang we ze bewaren.
          </p>
        </div>
      </Sectie>
    </div>
  );
}
