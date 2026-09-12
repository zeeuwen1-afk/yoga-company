import Image from "next/image";

import { BeeldAchtergrond } from "@/components/layout/beeld-achtergrond";
import { Sectie } from "@/components/layout/sectie";
import {
  type BeeldLayout,
  isAchtergrond,
  isNaastElkaar,
  type Maat,
  maatKlasse,
  type Waas,
} from "@/lib/beeldlayout";

export type SectieFoto = {
  url: string;
  alt: string;
  focus: string;
  layout: BeeldLayout;
  waas: Waas;
  maat: Maat;
};

/**
 * Een sectie die een eigen foto kan dragen.
 *
 * Tot nu toe kon een foto alleen bij een handvol vaste plekken (de kop van
 * een pagina, het verhaal) en verder als los blok ónder een sectie. Wat niet
 * kon: de tekst die er al staat op een foto zetten, of er een foto naast. Dat
 * is precies wat de beheerder wil bij de secties die de pagina dragen.
 *
 * Zonder foto is dit exact `Sectie`: dezelfde marges, dezelfde achtergrond,
 * dezelfde lijn. Een pagina zonder gekozen foto's ziet er dus niet anders uit
 * dan voorheen. Mét foto gelden de vijf plaatsingen uit de site-editor:
 * over de volle breedte erboven, links of rechts ernaast, eronder, of als
 * achtergrond met de tekst erop en de waas eroverheen.
 */
export function SectieBeeld({
  beeld,
  id,
  sectie,
  achtergrond = "wit",
  lijnBoven = false,
  className,
  children,
}: {
  /** De foto uit de site-editor, of null als er geen is gekozen. */
  beeld: SectieFoto | null;
  id?: string;
  sectie?: string;
  achtergrond?: "wit" | "creme" | "zand";
  lijnBoven?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  if (!beeld) {
    return (
      <Sectie
        id={id}
        sectie={sectie}
        achtergrond={achtergrond}
        lijnBoven={lijnBoven}
        className={className}
      >
        {children}
      </Sectie>
    );
  }

  if (isAchtergrond(beeld.layout)) {
    return (
      <BeeldAchtergrond beeld={beeld} sectie={sectie} id={id} volleBreedte>
        {children}
      </BeeldAchtergrond>
    );
  }

  const naast = isNaastElkaar(beeld.layout);
  const foto = (
    <Image
      src={beeld.url}
      alt={beeld.alt}
      width={naast ? 900 : 1600}
      height={naast ? 1100 : 700}
      style={{ objectPosition: beeld.focus }}
      className={[
        "w-full rounded-[var(--radius-card)] border border-line object-cover",
        naast ? "aspect-[4/5]" : "aspect-[16/7]",
        // De maat telt alleen over de breedte; naast de tekst bepaalt de kolom
        // hoe breed de foto is.
        naast ? "" : maatKlasse(beeld.maat),
      ].join(" ")}
    />
  );

  return (
    <Sectie
      id={id}
      sectie={sectie}
      achtergrond={achtergrond}
      lijnBoven={lijnBoven}
      className={className}
    >
      {naast ? (
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* De foto blijft in de opbouw vóór de tekst staan, ook bij
              "rechts": zo staat hij op een telefoon altijd boven en leest een
              schermlezer alles in dezelfde volgorde als iedereen. */}
          <div className={beeld.layout === "rechts" ? "lg:order-2" : undefined}>
            {foto}
          </div>
          <div>{children}</div>
        </div>
      ) : beeld.layout === "onder" ? (
        <>
          {children}
          <div className="mt-10">{foto}</div>
        </>
      ) : (
        <>
          <div className="mb-10">{foto}</div>
          {children}
        </>
      )}
    </Sectie>
  );
}
