import Image from "next/image";

import { BeeldMetTekst } from "@/components/layout/beeld-met-tekst";
import { Richtext, Sectie, SectieKop } from "@/components/layout/sectie";
import { Alineas } from "@/components/ui/alineas";
import { CmsKnop } from "@/components/ui/cms-knop";
import { focusStijl } from "@/lib/beeldfocus";
import { leesLayout, leesWaas } from "@/lib/beeldlayout";

import type { VrijBlok } from "../server/vrije-blokken";

/**
 * De blokken die de beheerder zelf onder een pagina heeft gezet.
 *
 * Ze staan onder de vaste secties, in de volgorde die in de editor is gekozen.
 * Elk blok is een gewone sectie, dus ze passen tussen de rest zonder dat je
 * ziet waar het vaste deel ophoudt.
 *
 * De achtergronden wisselen af op basis van de plaats in de rij. Zonder dat
 * zouden twee tekstblokken achter elkaar één grijze vlakte worden, en dat is
 * precies waar een pagina die je zelf indeelt de mist in gaat.
 */
export function VrijeBlokken({ blokken }: { blokken: VrijBlok[] }) {
  if (blokken.length === 0) return null;

  return (
    <>
      {blokken.map((blok, index) => (
        <VrijBlokWeergave
          key={blok.id}
          blok={blok}
          achtergrond={index % 2 === 0 ? "wit" : "creme"}
        />
      ))}
    </>
  );
}

function tekst(inhoud: Record<string, unknown>, veld: string): string {
  const waarde = inhoud[veld];
  return typeof waarde === "string" ? waarde : "";
}

function beeld(inhoud: Record<string, unknown>, veld: string) {
  const waarde = inhoud[veld] as
    | {
        url?: string;
        alt?: string;
        focus?: string;
        layout?: string;
        waas?: string;
      }
    | undefined;

  if (!waarde?.url) return null;

  return {
    url: waarde.url,
    alt: waarde.alt ?? "",
    focus: focusStijl(waarde.focus),
    layout: leesLayout(waarde.layout),
    waas: leesWaas(waarde.waas),
  };
}

function VrijBlokWeergave({
  blok,
  achtergrond,
}: {
  blok: VrijBlok;
  achtergrond: "wit" | "creme";
}) {
  const { inhoud } = blok;

  switch (blok.type) {
    case "tekst": {
      const kop = tekst(inhoud, "kop");
      const html = tekst(inhoud, "tekst");
      if (!kop && !html) return null;

      return (
        <Sectie achtergrond={achtergrond} lijnBoven>
          {kop ? <SectieKop titel={kop} /> : null}
          <Richtext html={html} className="mt-6 max-w-2xl text-lg" />
        </Sectie>
      );
    }

    case "tekst_beeld": {
      const kop = tekst(inhoud, "kop");
      const html = tekst(inhoud, "tekst");
      const foto = beeld(inhoud, "beeld");
      if (!kop && !html && !foto) return null;

      return (
        <>
          {kop ? (
            <Sectie achtergrond={achtergrond} lijnBoven className="!pb-0">
              <SectieKop titel={kop} />
            </Sectie>
          ) : null}
          <BeeldMetTekst
            beeld={foto}
            html={html}
            achtergrond={achtergrond}
            lijnBoven={!kop}
          />
        </>
      );
    }

    case "beeld": {
      const foto = beeld(inhoud, "beeld");
      if (!foto) return null;

      return (
        <Sectie achtergrond={achtergrond} lijnBoven>
          <Image
            src={foto.url}
            alt={foto.alt}
            width={1600}
            height={700}
            style={{ objectPosition: foto.focus }}
            className="aspect-[16/7] w-full rounded-[var(--radius-card)] border border-line object-cover"
          />
          {tekst(inhoud, "bijschrift") ? (
            <p className="mt-3 text-sm text-muted">
              {tekst(inhoud, "bijschrift")}
            </p>
          ) : null}
        </Sectie>
      );
    }

    case "fotoreeks": {
      const fotos = ["beeld_een", "beeld_twee", "beeld_drie"]
        .map((veld) => beeld(inhoud, veld))
        .filter((foto) => foto !== null);

      if (fotos.length === 0) return null;

      return (
        <Sectie achtergrond={achtergrond} lijnBoven>
          {tekst(inhoud, "kop") ? (
            <SectieKop titel={tekst(inhoud, "kop")} />
          ) : null}
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {fotos.map((foto, index) => (
              <li key={index}>
                <Image
                  src={foto.url}
                  alt={foto.alt}
                  width={700}
                  height={875}
                  style={{ objectPosition: foto.focus }}
                  className="aspect-[4/5] w-full rounded-[var(--radius-card)] border border-line object-cover"
                />
              </li>
            ))}
          </ul>
        </Sectie>
      );
    }

    case "oproep": {
      const kop = tekst(inhoud, "kop");
      const zin = tekst(inhoud, "tekst");
      if (!kop && !zin) return null;

      return (
        <Sectie achtergrond={achtergrond} lijnBoven>
          <div className="max-w-2xl">
            {kop ? <h2 className="text-3xl">{kop}</h2> : null}
            <div className="mt-4">
              <Alineas tekst={zin} className="text-lg text-muted" />
            </div>
            <CmsKnop
              tekst={tekst(inhoud, "knop")}
              link={tekst(inhoud, "link")}
              terugval="/contact"
              className="mt-8"
            />
          </div>
        </Sectie>
      );
    }

    default:
      // Een type dat we niet kennen tonen we niet. Dat kan alleen gebeuren als
      // er ooit een blok uit de bibliotheek verdwijnt terwijl er nog een in de
      // database staat; dan is niets tonen beter dan een klapper.
      return null;
  }
}
