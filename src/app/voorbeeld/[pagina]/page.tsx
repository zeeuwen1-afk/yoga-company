import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Aanwijzen } from "@/features/cms/components/aanwijzen";
import { vindJuridischeTekst } from "@/content/juridisch";
import { haalConceptPagina } from "@/features/cms";
import { haalRooster, Rooster } from "@/features/bookings";
import { HomeInhoud } from "@/features/cms/paginas/home-inhoud";
import { OrganisatieInhoud } from "@/features/cms/paginas/organisatie-inhoud";
import { PortfolioInhoud } from "@/features/cms/paginas/portfolio-inhoud";
import {
  ContactInhoud,
  JuridischeInhoud,
  OverOnsInhoud,
  OverzichtInhoud,
} from "@/features/cms/paginas/eenvoudige-paginas";
import { CursusRooster, haalAanbod } from "@/features/courses";

export const metadata: Metadata = {
  title: "Voorvertoning",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const PAGINAS = [
  "home",
  "footer",
  "opleidingen",
  "trainingen",
  "lessen",
  "over-ons",
  "contact",
];

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

  if (!PAGINAS.includes(pageKey) && !vindJuridischeTekst(pageKey)) {
    notFound();
  }

  // De paginavoet staat op elke pagina; bewerk je die, dan tonen we hem in de
  // context van de startpagina.
  const inhoudKey = pageKey === "footer" ? "home" : pageKey;

  const [pagina, voetPagina] = await Promise.all([
    haalConceptPagina(inhoudKey),
    haalConceptPagina("footer"),
  ]);

  async function inhoud() {
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
      case "opleidingen":
        return (
          <OverzichtInhoud pagina={pagina}>
            <CursusRooster cursussen={await haalAanbod("opleiding")} />
          </OverzichtInhoud>
        );
      case "trainingen":
        return (
          <OverzichtInhoud pagina={pagina}>
            <CursusRooster cursussen={await haalAanbod("training")} />
          </OverzichtInhoud>
        );
      case "lessen":
        return (
          <OverzichtInhoud pagina={pagina}>
            <Rooster lessen={await haalRooster()} />
          </OverzichtInhoud>
        );
      case "over-ons":
        return <OverOnsInhoud pagina={pagina} />;
      case "contact":
        return <ContactInhoud pagina={pagina} />;
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
      <main className="flex-1">{await inhoud()}</main>
      <SiteFooter pagina={voetPagina} />
    </div>
  );
}
