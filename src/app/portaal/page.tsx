import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Inbox,
  MessageSquare,
  PlayCircle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  BOEKING_LABEL,
  formateerDag,
  formateerTijdvak,
  haalVolgendeBoeking,
} from "@/features/bookings";
import { haalMijnOpleidingen } from "@/features/content";
import { haalOngelezenAantal } from "@/features/messages";
import { haalLaatstBekeken } from "@/features/progress";
import { haalOpenAanvragen } from "@/features/requests";
import { createClient } from "@/lib/supabase/server";
import { huidigeGebruiker } from "@/lib/supabase/gebruiker";

export const metadata: Metadata = {
  title: "Mijn omgeving",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function minuten(seconden: number | null) {
  if (!seconden) return null;
  return `${Math.floor(seconden / 60)} min`;
}

export default async function PortaalDashboard() {
  const supabase = await createClient();
  const gebruiker = await huidigeGebruiker(supabase);

  const { data: profiel } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", gebruiker?.id ?? "")
    .maybeSingle();

  const [laatst, opleidingen, ongelezen, openAanvragen, volgendeLes] =
    await Promise.all([
      haalLaatstBekeken(),
      haalMijnOpleidingen(),
      haalOngelezenAantal(),
      haalOpenAanvragen(),
      haalVolgendeBoeking(),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl">
          Hallo {profiel?.first_name ?? "daar"}
        </h1>
        <p className="mt-2 text-muted">
          Fijn dat je er bent. Hier vind je alles wat bij je opleiding hoort.
        </p>
      </div>

      {/* De eerstvolgende les waarvoor je staat ingeschreven (§7.3) -------- */}
      {volgendeLes ? (
        <Card className="bg-white">
          <CardContent className="p-6">
            <p className="flex items-center gap-2 text-sm font-semibold text-muted">
              <CalendarDays className="size-4" aria-hidden />
              Je eerstvolgende les
            </p>
            <h2 className="mt-2 text-xl">{volgendeLes.les.titel}</h2>
            <p className="mt-1 text-sm text-muted first-letter:uppercase">
              {formateerDag(volgendeLes.les.begintOp)} ·{" "}
              {formateerTijdvak(
                volgendeLes.les.begintOp,
                volgendeLes.les.duurMinuten,
              )}{" "}
              · {volgendeLes.les.locatie}
            </p>
            <p className="mt-2 text-sm font-semibold text-green-dark">
              {volgendeLes.les.afgelastOp
                ? "Deze les gaat niet door"
                : BOEKING_LABEL[volgendeLes.status]}
            </p>
            <Link
              href="/portaal/lessen"
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg border border-line-strong px-5 font-semibold text-green-dark transition-colors hover:bg-hover"
            >
              Naar het rooster
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {/* Verder waar je gebleven was (§11) --------------------------------- */}
      {laatst ? (
        <Card className="bg-white">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-muted">
              Verder waar je gebleven was
            </p>
            <h2 className="mt-2 text-xl">{laatst.itemTitel}</h2>
            <p className="mt-1 text-sm text-muted">
              {laatst.cursusTitel}
              {laatst.positieSeconden > 0 && minuten(laatst.positieSeconden)
                ? ` · je stopte op ${minuten(laatst.positieSeconden)}`
                : null}
            </p>
            <Link
              href={`/portaal/opleidingen/${laatst.cursusSlug}/${laatst.itemId}`}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 font-semibold text-primary-foreground transition-colors hover:bg-accent-light"
            >
              <PlayCircle className="size-5" aria-hidden />
              Verder gaan
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {/* Mijn opleidingen -------------------------------------------------- */}
      <section>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-2xl">Mijn opleidingen</h2>
          {opleidingen.length > 0 ? (
            <Link
              href="/portaal/opleidingen"
              className="text-sm font-semibold text-green underline"
            >
              Alles bekijken
            </Link>
          ) : null}
        </div>

        {opleidingen.length === 0 ? (
          <Card className="mt-4 bg-white">
            <CardContent className="p-6">
              <p>Je hebt nog geen opleiding lopen.</p>
              <p className="mt-2 text-sm text-muted">
                Zodra je je hebt ingeschreven en de betaling rond is, vind je je
                lesmateriaal hier terug.
              </p>
              <Link
                href="/opleidingen"
                className="mt-4 inline-flex items-center gap-1.5 font-semibold text-green underline"
              >
                Bekijk het aanbod
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </CardContent>
          </Card>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {opleidingen.slice(0, 4).map((opleiding) => (
              <li key={opleiding.enrollmentId} className="relative flex">
                <Card className="flex-1 bg-white transition-colors hover:border-green/40">
                  <CardContent className="p-5">
                    <h3 className="text-lg">
                      <Link
                        href={`/portaal/opleidingen/${opleiding.slug}`}
                        className="transition-colors hover:text-green"
                      >
                        <span className="absolute inset-0" aria-hidden />
                        {opleiding.titel}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      {opleiding.heeftContent
                        ? "Lesmateriaal beschikbaar"
                        : "Fysieke opleiding"}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Berichten en aanvragen -------------------------------------------- */}
      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/portaal/berichten"
          className="flex items-center gap-4 rounded-[var(--radius-card)] border border-line bg-white p-5 transition-colors hover:border-green/40"
        >
          <MessageSquare className="size-6 shrink-0 text-green" aria-hidden />
          <span>
            <span className="block font-semibold">Berichten</span>
            <span className="block text-sm text-muted">
              {ongelezen > 0
                ? `${ongelezen} ongelezen ${ongelezen === 1 ? "bericht" : "berichten"}`
                : "Geen nieuwe berichten"}
            </span>
          </span>
        </Link>

        <Link
          href="/portaal/aanvragen"
          className="flex items-center gap-4 rounded-[var(--radius-card)] border border-line bg-white p-5 transition-colors hover:border-green/40"
        >
          <Inbox className="size-6 shrink-0 text-green" aria-hidden />
          <span>
            <span className="block font-semibold">Aanvragen</span>
            <span className="block text-sm text-muted">
              {openAanvragen > 0
                ? `${openAanvragen} loopt nog`
                : "Niets openstaand"}
            </span>
          </span>
        </Link>
      </section>
    </div>
  );
}
