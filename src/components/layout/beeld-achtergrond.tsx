import Image from "next/image";

import type { Waas } from "@/lib/beeldlayout";

/**
 * Een blok met de foto als achtergrond en de tekst eroverheen.
 *
 * Dezelfde vorm als de hero op de startpagina, met één verschil dat er toe
 * doet: de waas is hier overal even donker. De waas van de hero loopt van
 * donker links naar bijna doorzichtig rechts, omdat daar nooit tekst staat. In
 * een gewoon blok loopt de tekst wél door tot rechts, en dan zou de helft van
 * een zin onleesbaar worden.
 *
 * De minimumhoogte is er om iets anders te voorkomen: een korte tekst zonder
 * die hoogte levert een strook van vier centimeter op met een foto erin, en dat
 * is geen achtergrond maar een ongeluk.
 *
 * De kleuren hoeven hier niet omgezet te worden. De tokens van deze site staan
 * standaard op donker; alleen lichte vlakken zoals `bg-cream` zetten ze om. Dit
 * blok is er geen, dus de tekst, de knoppen en de lijnen zijn vanzelf de lichte
 * variant.
 */
export function BeeldAchtergrond({
  beeld,
  sectie,
  id,
  volleBreedte = false,
  children,
}: {
  beeld: { url: string; alt: string; focus: string; waas: Waas };
  sectie?: string;
  /** Anker voor knoppen die naar deze sectie springen. */
  id?: string;
  /**
   * Een sectie met een raster van kaarten heeft de hele breedte nodig; de
   * kop van een pagina juist niet, die leest het best op leesbreedte.
   */
  volleBreedte?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      data-sectie={sectie}
      className={
        id
          ? "relative isolate scroll-mt-24 overflow-hidden bg-petrol-deep"
          : "relative isolate overflow-hidden bg-petrol-deep"
      }
    >
      <Image
        src={beeld.url}
        alt={beeld.alt}
        fill
        sizes="100vw"
        style={{ objectPosition: beeld.focus }}
        className="object-cover"
      />
      <div
        aria-hidden
        className={
          beeld.waas === "donkerder"
            ? "absolute inset-0 beeld-waas-donkerder"
            : "absolute inset-0 beeld-waas"
        }
      />

      <div className="relative mx-auto flex min-h-[22rem] max-w-6xl items-center px-4 py-16 sm:min-h-[26rem] sm:px-6 sm:py-20">
        {volleBreedte ? (
          <div className="w-full">{children}</div>
        ) : (
          <div className="max-w-2xl">{children}</div>
        )}
      </div>
    </section>
  );
}
