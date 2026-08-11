import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Richtext, Sectie, SectieKop } from "@/components/layout/sectie";
import { haalPagina } from "@/features/cms";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Over ons",
  description:
    "Yoga Companie is een opleidingsinstituut voor yoga. Kleine groepen, praktijkgericht, en een manier van kijken waarin yoga geen prestatie is.",
  alternates: { canonical: "/over-ons" },
};

type Docent = { naam: string; rol: string; bio: string; foto: string };

export default async function OverOnsPage() {
  const pagina = await haalPagina("over-ons");
  const docenten = pagina.lijst<Docent>("docenten");

  return (
    <>
      <Sectie achtergrond="creme">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl">{pagina.tekst("titel")}</h1>
          <Richtext html={pagina.html("verhaal")} className="mt-8 text-lg" />
        </div>
      </Sectie>

      {docenten.length > 0 ? (
        <Sectie lijnBoven>
          <SectieKop titel="Onze docenten" />
          <ul className="mt-10 grid gap-8 sm:grid-cols-2">
            {docenten.map((docent, index) => (
              <li key={index} className="flex gap-5">
                {docent.foto ? (
                  <Image
                    src={docent.foto}
                    alt={`Portret van ${docent.naam}`}
                    width={96}
                    height={96}
                    className="size-24 shrink-0 rounded-full border border-line object-cover"
                  />
                ) : (
                  <div
                    aria-hidden
                    className="size-24 shrink-0 rounded-full border border-line bg-sand"
                  />
                )}
                <div>
                  <h3 className="text-lg">{docent.naam}</h3>
                  <p className="text-sm text-muted">{docent.rol}</p>
                  <p className="mt-2 text-[0.975rem]">{docent.bio}</p>
                </div>
              </li>
            ))}
          </ul>
        </Sectie>
      ) : null}

      <Sectie achtergrond="zand" lijnBoven>
        <div className="max-w-2xl">
          <h2 className="text-3xl">Benieuwd of het klikt?</h2>
          <p className="mt-4 text-lg text-muted">
            De beste manier om erachter te komen is het gesprek. Stel je vraag —
            we reageren meestal binnen twee werkdagen.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex h-12 items-center rounded-lg bg-green px-7 font-semibold text-cream transition-colors hover:bg-green-dark"
          >
            Neem contact op
          </Link>
        </div>
      </Sectie>
    </>
  );
}
