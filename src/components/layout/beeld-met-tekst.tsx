import Image from "next/image";

import {
  isAchtergrond,
  isNaastElkaar,
  type BeeldLayout,
  type Waas,
} from "@/lib/beeldlayout";

import { BeeldAchtergrond } from "./beeld-achtergrond";

import { Richtext, Sectie } from "./sectie";

/**
 * Een foto met een stuk tekst, in de indeling die de beheerder heeft gekozen.
 *
 * Deze twee waren altijd twee losse secties: een brede band met de foto, en
 * daaronder het verhaal. Dat is prima voor een openingsbeeld en ongelukkig voor
 * een portret, dat dan over de volle breedte wordt uitgesmeerd en van boven en
 * onder wordt afgesneden.
 *
 * Staat de foto naast de tekst, dan worden het samen één sectie: anders zou er
 * een streep en een lap ruimte tussen twee dingen komen die bij elkaar horen.
 * Bij "breed" en "onder" blijft alles zoals het was, en dat is ook wat elk
 * bestaand blok doet zolang er niets is gekozen.
 *
 * Op een smal scherm staat de foto altijd boven de tekst, wat er ook is
 * gekozen. Een foto van vier centimeter breed naast drie woorden is geen
 * indeling maar een ongeluk.
 */
export function BeeldMetTekst({
  beeld,
  html,
  achtergrond = "wit",
  lijnBoven = false,
  sectie,
}: {
  beeld: {
    url: string;
    alt: string;
    focus: string;
    layout: BeeldLayout;
    waas: Waas;
  } | null;
  /** De tekst ernaast, als html uit de richtext-editor. */
  html: string;
  achtergrond?: "wit" | "creme" | "zand";
  lijnBoven?: boolean;
  sectie?: string;
}) {
  if (!beeld && !html) return null;

  const layout = beeld?.layout ?? "breed";
  const naast = Boolean(beeld) && Boolean(html) && isNaastElkaar(layout);

  // Tekst op de foto. Zonder tekst zou het een foto met een waas erover zijn,
  // en dat is een donker vlak zonder reden; dan valt hij terug op volle breedte.
  if (beeld && html && isAchtergrond(layout)) {
    return (
      <BeeldAchtergrond beeld={beeld} sectie={sectie}>
        <Richtext html={html} className="max-w-2xl text-lg" />
      </BeeldAchtergrond>
    );
  }

  const foto = beeld ? (
    <Image
      src={beeld.url}
      alt={beeld.alt}
      width={naast ? 900 : 1600}
      height={naast ? 1100 : 700}
      style={{ objectPosition: beeld.focus }}
      className={[
        "w-full rounded-[var(--radius-card)] border border-line object-cover",
        naast ? "aspect-[4/5]" : "aspect-[16/7]",
      ].join(" ")}
    />
  ) : null;

  const tekst = html ? (
    <Richtext html={html} className={naast ? "text-lg" : "max-w-2xl text-lg"} />
  ) : null;

  if (naast) {
    return (
      <Sectie sectie={sectie} achtergrond={achtergrond} lijnBoven={lijnBoven}>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* De volgorde in de opbouw blijft foto-dan-tekst, ook bij "rechts".
              Zo staat de foto op een telefoon altijd boven, en leest een
              schermlezer ze in dezelfde volgorde als iedereen. */}
          <div className={layout === "rechts" ? "lg:order-2" : undefined}>
            {foto}
          </div>
          <div>{tekst}</div>
        </div>
      </Sectie>
    );
  }

  return (
    <>
      {beeld && layout !== "onder" ? (
        <Sectie sectie={sectie} achtergrond={achtergrond} className="!pt-0">
          {foto}
        </Sectie>
      ) : null}

      {tekst ? (
        <Sectie sectie={beeld ? undefined : sectie} lijnBoven={lijnBoven}>
          {tekst}
        </Sectie>
      ) : null}

      {beeld && layout === "onder" ? (
        <Sectie sectie={sectie} achtergrond={achtergrond} className="!pt-0">
          {foto}
        </Sectie>
      ) : null}
    </>
  );
}
