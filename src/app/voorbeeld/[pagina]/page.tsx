import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Aanwijzen } from "@/features/cms/components/aanwijzen";
import { VrijeZone } from "@/features/cms/paginas/vrije-zone";
import { haalConceptPagina, kanVoorvertonen } from "@/features/cms";
import { AcademyInhoud } from "@/features/cms/paginas/academy-inhoud";
import { NiveausOverzicht } from "@/features/courses/components/niveaus-overzicht";
import { haalRooster, Rooster } from "@/features/bookings";
import { HomeInhoud } from "@/features/cms/paginas/home-inhoud";
import { OrganisatieInhoud } from "@/features/cms/paginas/organisatie-inhoud";
import { PortfolioInhoud } from "@/features/cms/paginas/portfolio-inhoud";
import { TarievenInhoud } from "@/features/cms/paginas/tarieven-inhoud";
import { YogaopleidingInhoud } from "@/features/cms/paginas/yogaopleiding-inhoud";
import { ModuleInhoud } from "@/features/cms/paginas/module-inhoud";
import {
  ContactInhoud,
  JuridischeInhoud,
  OverOnsInhoud,
  OverzichtInhoud,
  VeiligheidInhoud,
  VoorYogadocentenInhoud,
} from "@/features/cms/paginas/eenvoudige-paginas";
import { CursusRooster, haalAanbod, haalCursus } from "@/features/courses";
import { CursusDetail } from "@/features/courses/components/cursus-detail";
import { cursusSlug } from "@/content/vrije-blokken";

export const metadata: Metadata = {
  title: "Voorvertoning",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * De publieke pagina met de concepten erin (BOUWPROMPT §14).
 *
 * Dezelfde componenten als de echte site, alleen gevoed met `draft_value` in
 * plaats van `value`. Wat je hier ziet is letterlijk wat er na publiceren
 * online komt te staan.
 *
 * Deze route staat bewust buiten `/admin`: anders zou de voorvertoning de
 * zijbalk van de beheeromgeving meekrijgen. De middleware schermt hem
 * afzonderlijk af met dezelfde eisen — beheerder én tweestapsverificatie.
 */
export default async function VoorbeeldPagina({
  params,
}: {
  params: Promise<{ pagina: string }>;
}) {
  const { pagina: pageKey } = await params;

  if (!kanVoorvertonen(pageKey)) notFound();

  // Een cursuspagina heeft geen eigen blokken: zijn teksten staan onder
  // `cursus` en gelden voor alle opleidingen en trainingen. De eigen blokken
  // van déze cursus hangen wél aan de sleutel zelf.
  const slug = cursusSlug(pageKey);

  // De paginavoet staat op elke pagina; bewerk je die, dan tonen we hem in de
  // context van de startpagina.
  const inhoudKey =
    pageKey === "footer" ? "home" : slug !== null ? "cursus" : pageKey;
  const vrijeKey = pageKey === "footer" ? "home" : pageKey;

  const [pagina, voetPagina] = await Promise.all([
    haalConceptPagina(inhoudKey),
    haalConceptPagina("footer"),
  ]);

  // De vaste teksten bewerk je zonder een cursus in gedachten; dan tonen we ze
  // op de eerste cursus die er is, want zonder pagina eromheen valt er niets
  // te zien.
  const cursus =
    slug !== null
      ? await haalCursus(slug)
      : inhoudKey === "cursus"
        ? ((await haalAanbod())[0] ?? null)
        : null;

  if (inhoudKey === "cursus" && !cursus) notFound();

  async function inhoud() {
    if (cursus) {
      return <CursusDetail cursus={cursus} pagina={pagina} concept />;
    }

    switch (inhoudKey) {
      case "home":
        return (
          <HomeInhoud
            pagina={pagina}
            opleidingen={await haalAanbod("opleiding")}
            lessen={(await haalRooster(7))
              .filter((les) => !les.afgelastOp)
              .slice(0, 4)}
          />
        );
      case "portfolio":
        return <PortfolioInhoud pagina={pagina} />;
      case "bedrijfsyoga":
      case "sportclubs":
      case "onderwijs":
        return <OrganisatieInhoud pagina={pagina} pageKey={inhoudKey} />;
      case "academy":
        return <AcademyInhoud pagina={pagina} />;
      case "opleidingen":
        return (
          <OverzichtInhoud pagina={pagina} pageKey="opleidingen">
            <NiveausOverzicht pagina={pagina} />
            <CursusRooster cursussen={await haalAanbod("opleiding")} />
          </OverzichtInhoud>
        );
      case "trainingen":
        return (
          <OverzichtInhoud pagina={pagina} pageKey="trainingen">
            <CursusRooster cursussen={await haalAanbod("training")} />
          </OverzichtInhoud>
        );
      case "workshops":
        return (
          <OverzichtInhoud pagina={pagina} pageKey="workshops">
            <CursusRooster cursussen={await haalAanbod("workshop")} />
          </OverzichtInhoud>
        );
      case "lessen":
        return (
          <OverzichtInhoud pagina={pagina} pageKey="lessen">
            <Rooster lessen={await haalRooster()} />
          </OverzichtInhoud>
        );
      case "over-ons":
        return <OverOnsInhoud pagina={pagina} />;
      case "contact":
        return <ContactInhoud pagina={pagina} />;
      case "tarieven":
        return <TarievenInhoud pagina={pagina} />;
      case "veiligheid":
        return <VeiligheidInhoud pagina={pagina} />;
      case "voor-yogadocenten":
        return <VoorYogadocentenInhoud pagina={pagina} />;
      case "yogaopleiding":
        return (
          <YogaopleidingInhoud
            pagina={pagina}
            gedeeld={await haalConceptPagina("yogaopleiding-gedeeld")}
          />
        );
      // De gedeelde blokken hebben geen eigen pagina; je bewerkt ze en ziet ze
      // in de context van de opleiding waar ze op staan.
      case "yogaopleiding-gedeeld":
        return (
          <YogaopleidingInhoud
            pagina={await haalConceptPagina("yogaopleiding")}
            gedeeld={pagina}
          />
        );
      case "yogaopleiding-module-1":
      case "yogaopleiding-module-2":
      case "yogaopleiding-module-3":
      case "yogaopleiding-module-4":
        return (
          <ModuleInhoud
            pagina={pagina}
            gedeeld={await haalConceptPagina("yogaopleiding-gedeeld")}
          />
        );
      default:
        return <JuridischeInhoud pagina={pagina} />;
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Vangt klikken op en stuurt de sectie naar het bewerkscherm ernaast.
          Staat deze pagina los in een tabblad, dan doet het niets. */}
      <Aanwijzen />
      <SiteHeader />
      <main className="flex-1">
        {await inhoud()}
        {/* In de voorvertoning tellen ook de blokken mee die nog niet zijn
            gepubliceerd; dat is juist wat je hier wilt zien. De cursuspagina
            toont zijn eigen zone al; die hier nog eens tonen zou elk blok
            dubbel op het scherm zetten. */}
        {cursus ? null : <VrijeZone pageKey={vrijeKey} concept />}
      </main>
      <SiteFooter pagina={voetPagina} />
    </div>
  );
}
