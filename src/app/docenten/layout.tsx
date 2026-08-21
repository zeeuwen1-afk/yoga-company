import Link from "next/link";
import { redirect } from "next/navigation";

import { uitloggen } from "@/features/auth";
import { haalDocentschap } from "@/features/docenten";

/**
 * Shell van de docentenportal (§ docentenlaag).
 *
 * De middleware laat hier alleen ingelogde bezoekers toe. De controle
 * hieronder is het tweede slot en tegelijk de vraag die er werkelijk toe doet:
 * geeft deze persoon ergens les? Wie dat niet doet hoort hier niet, ook niet
 * als hij een geldig account heeft.
 *
 * Docent-zijn is geen rol maar een rij in `studio_teachers`. Een docent is
 * daarnaast gewoon klant — ze kopen elkaars kaarten — en houdt dus toegang tot
 * zijn eigen portaal.
 */
export default async function DocentenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { docentId, studios } = await haalDocentschap();

  if (!docentId) redirect("/inloggen?vervolg=/docenten");
  if (studios.length === 0) redirect("/portaal");

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-30 border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-baseline gap-3">
            <Link href="/" className="font-serif text-xl text-green-dark">
              YogaCompany
            </Link>
            <span className="text-sm text-muted">Docentenportal</span>
          </div>

          <nav aria-label="Docentenmenu" className="flex items-center gap-5">
            <Link href="/lessen" className="text-sm text-ink hover:text-green">
              Rooster
            </Link>
            <Link href="/portaal" className="text-sm text-ink hover:text-green">
              Mijn omgeving
            </Link>
            <form action={uitloggen}>
              <button
                type="submit"
                className="text-sm text-muted underline hover:text-green"
              >
                Uitloggen
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
