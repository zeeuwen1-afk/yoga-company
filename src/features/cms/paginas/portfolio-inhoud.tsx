import Image from "next/image";

import { Alineas } from "@/components/ui/alineas";
import { CmsKnop } from "@/components/ui/cms-knop";
import { Richtext, Sectie, SectieKop } from "@/components/layout/sectie";
import type { Pagina } from "../server/queries";

/**
 * Het portfolio van wie het bedrijf draagt.
 *
 * Anders dan "Over ons": daar staat het verhaal van de studio, hier staat één
 * loopbaan. Dat is wat een opleider, een bedrijf of een samenwerkingspartner
 * wil lezen voordat ze iemand vragen — en het is een ander soort tekst dan een
 * wervende pagina.
 *
 * Alle drie de lijsten zijn in de site-editor uit te breiden; wie meer regels
 * heeft dan er nu staan, drukt op "Ervaring toevoegen".
 */

type Ervaring = { periode: string; titel: string; waar: string; tekst: string };
type Opleiding = { jaar: string; titel: string; instituut: string };
type Specialisatie = { titel: string; tekst: string };

export function PortfolioInhoud({ pagina }: { pagina: Pagina }) {
  const foto = pagina.beeld("foto");
  const ervaring = pagina.lijst<Ervaring>("ervaring");
  const opleidingen = pagina.lijst<Opleiding>("opleidingen");
  const specialisaties = pagina.lijst<Specialisatie>("specialisaties");

  return (
    <>
      <Sectie achtergrond="creme">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_18rem]">
          <div>
            <p className="label-klein">Portfolio</p>
            <h1 className="mt-3 text-4xl sm:text-5xl">
              {pagina.tekst("naam")}
            </h1>
            <p className="mt-3 text-lg text-muted">{pagina.tekst("rol")}</p>
            <Richtext html={pagina.html("intro")} className="mt-8 text-lg" />
          </div>

          {foto ? (
            <Image
              src={foto.url}
              alt={foto.alt}
              width={560}
              height={700}
              style={{ objectPosition: foto.focus }}
              className="aspect-[4/5] w-full rounded-[var(--radius-card)] border border-line object-cover"
            />
          ) : null}
        </div>
      </Sectie>

      {ervaring.length > 0 ? (
        <Sectie lijnBoven>
          <SectieKop titel={pagina.tekst("ervaring_titel")} />
          <ol className="mt-10 space-y-8">
            {ervaring.map((regel, index) => (
              <li
                key={index}
                className="grid gap-2 border-t border-line pt-5 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-8"
              >
                <p className="text-sm text-muted tabular-nums">
                  {regel.periode}
                </p>
                <div>
                  <h3 className="text-lg">{regel.titel}</h3>
                  {regel.waar ? (
                    <p className="mt-0.5 text-sm text-sand">{regel.waar}</p>
                  ) : null}
                  {regel.tekst ? (
                    <p className="mt-2 text-[0.975rem] text-muted">
                      {regel.tekst}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </Sectie>
      ) : null}

      {opleidingen.length > 0 ? (
        <Sectie achtergrond="creme" lijnBoven>
          <SectieKop titel={pagina.tekst("opleiding_titel")} />
          <ul className="mt-10 space-y-4">
            {opleidingen.map((regel, index) => (
              <li
                key={index}
                className="grid gap-1 border-b border-line pb-4 last:border-b-0 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-8"
              >
                <p className="text-sm text-muted tabular-nums">{regel.jaar}</p>
                <div>
                  <p className="font-semibold">{regel.titel}</p>
                  {regel.instituut ? (
                    <p className="text-sm text-muted">{regel.instituut}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </Sectie>
      ) : null}

      {specialisaties.length > 0 ? (
        <Sectie lijnBoven>
          <SectieKop titel={pagina.tekst("specialisaties_titel")} />
          <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {specialisaties.map((regel, index) => (
              <li key={index} className="border-t border-line pt-5">
                <h3 className="text-lg">{regel.titel}</h3>
                <p className="mt-1.5 text-[0.975rem] text-muted">
                  {regel.tekst}
                </p>
              </li>
            ))}
          </ul>
        </Sectie>
      ) : null}

      {pagina.tekst("cta_titel") ? (
        <Sectie achtergrond="zand" lijnBoven>
          <div className="max-w-2xl">
            <h2 className="text-3xl">{pagina.tekst("cta_titel")}</h2>
            <div className="mt-4">
              <Alineas
                tekst={pagina.tekst("cta_tekst")}
                className="text-lg text-muted"
              />
            </div>
            <CmsKnop
              tekst={pagina.tekst("cta_knop")}
              link={pagina.tekst("cta_link")}
              terugval="/contact"
              className="mt-8"
            />
          </div>
        </Sectie>
      ) : null}
    </>
  );
}
