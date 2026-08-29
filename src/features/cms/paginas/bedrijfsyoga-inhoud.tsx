import Image from "next/image";
import Link from "next/link";

import { Richtext, Sectie, SectieKop } from "@/components/layout/sectie";
import type { Pagina } from "../server/queries";

/**
 * Bedrijfsyoga.
 *
 * Een eigen pagina en geen vierde deur op de startpagina, omdat dit een andere
 * lezer is: een werkgever wil weten wat het oplevert, wat het kost en hoe het
 * praktisch gaat — niet wanneer de volgende les begint.
 *
 * De vormen en de praktische punten zijn lijsten, dus ze zijn in de
 * site-editor uit te breiden zonder dat er iemand aan de code hoeft te komen.
 */

type Vorm = { naam: string; duur: string; tekst: string; prijs: string };
type Punt = { titel: string; tekst: string };

export function BedrijfsyogaInhoud({ pagina }: { pagina: Pagina }) {
  const beeld = pagina.beeld("beeld");
  const vormen = pagina.lijst<Vorm>("vormen");
  const punten = pagina.lijst<Punt>("praktisch");

  return (
    <>
      <Sectie achtergrond="creme">
        <div className="max-w-2xl">
          <p className="label-klein">Voor werkgevers</p>
          <h1 className="mt-3 text-4xl sm:text-5xl">{pagina.tekst("titel")}</h1>
          <p className="mt-6 text-lg text-muted">{pagina.tekst("inleiding")}</p>
          <Link
            href="/contact"
            className="mt-8 inline-flex h-12 items-center rounded-lg bg-primary px-7 font-semibold text-primary-foreground transition-colors hover:bg-accent-light"
          >
            Vraag een proefles aan
          </Link>
        </div>
      </Sectie>

      {beeld ? (
        <Sectie className="!pt-0" achtergrond="creme">
          <Image
            src={beeld.url}
            alt={beeld.alt}
            width={1600}
            height={700}
            className="aspect-[16/7] w-full rounded-[var(--radius-card)] border border-line object-cover"
          />
        </Sectie>
      ) : null}

      <Sectie lijnBoven>
        <Richtext html={pagina.html("verhaal")} className="max-w-2xl text-lg" />
      </Sectie>

      {vormen.length > 0 ? (
        <Sectie achtergrond="creme" lijnBoven>
          <SectieKop titel={pagina.tekst("vormen_titel")} />
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {vormen.map((vorm, index) => (
              <li key={index}>
                <div className="flex h-full flex-col gap-3 rounded-[var(--radius-card)] border border-line bg-white p-7">
                  <h3 className="text-xl">{vorm.naam}</h3>
                  {vorm.duur ? (
                    <p className="text-sm text-muted">{vorm.duur}</p>
                  ) : null}
                  <p className="flex-1 text-[0.975rem] text-muted">
                    {vorm.tekst}
                  </p>
                  {vorm.prijs ? (
                    <p className="font-semibold text-green">{vorm.prijs}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </Sectie>
      ) : null}

      {punten.length > 0 ? (
        <Sectie lijnBoven>
          <SectieKop titel={pagina.tekst("praktisch_titel")} />
          <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {punten.map((punt, index) => (
              <li key={index} className="border-t border-line pt-5">
                <h3 className="text-lg">{punt.titel}</h3>
                <p className="mt-1.5 text-[0.975rem] text-muted">
                  {punt.tekst}
                </p>
              </li>
            ))}
          </ul>
        </Sectie>
      ) : null}

      <Sectie achtergrond="zand" lijnBoven>
        <div className="max-w-2xl">
          <h2 className="text-3xl">{pagina.tekst("cta_titel")}</h2>
          <p className="mt-4 text-lg text-muted">{pagina.tekst("cta_tekst")}</p>
          <Link
            href="/contact"
            className="mt-8 inline-flex h-12 items-center rounded-lg bg-primary px-7 font-semibold text-primary-foreground transition-colors hover:bg-accent-light"
          >
            Neem contact op
          </Link>
        </div>
      </Sectie>
    </>
  );
}
