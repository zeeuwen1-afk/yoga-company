import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Richtext, Sectie, SectieKop } from "@/components/layout/sectie";
import { Card, CardContent } from "@/components/ui/card";
import { haalPagina } from "@/features/cms";
import { haalAanbod } from "@/features/courses";
import { CursusRooster } from "@/features/courses/components/cursus-kaart";
import { cn } from "@/lib/utils";

// Publieke pagina's worden statisch geserveerd en periodiek ververst, zodat een
// contentwijziging zichtbaar wordt zonder nieuwe uitrol (BOUWPROMPT §14).
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Yoga Companie — opleidingsinstituut voor yoga",
  description:
    "Yogaopleidingen en trainingen in kleine groepen. De 200-uurs Yin Yoga Specialist Opleiding, losse modules en het herstelprogramma Eerst Jij.",
  alternates: { canonical: "/" },
};

type Reden = { titel: string; tekst: string };
type Ervaring = { citaat: string; naam: string; rol: string };

export default async function HomePage() {
  const [pagina, opleidingen] = await Promise.all([
    haalPagina("home"),
    haalAanbod("opleiding"),
  ]);

  const beeld = pagina.beeld("hero_beeld");
  const redenen = pagina.lijst<Reden>("waarom_punten");
  const ervaringen = pagina.lijst<Ervaring>("testimonials");

  return (
    <>
      {/* Hero -------------------------------------------------------------- */}
      <section className="border-b border-line bg-cream">
        {/* Zolang er geen hero-foto is gekozen, krijgt de tekst de volle
            breedte in plaats van de helft met een leeg vlak ernaast. */}
        <div
          className={cn(
            "mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 sm:py-28",
            beeld && "lg:grid-cols-2",
          )}
        >
          <div>
            <h1 className="max-w-3xl text-4xl sm:text-5xl">
              {pagina.tekst("hero_titel")}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted">
              {pagina.tekst("hero_subtitel")}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/opleidingen"
                className="inline-flex h-12 items-center rounded-lg bg-green px-7 font-semibold text-cream transition-colors hover:bg-green-dark"
              >
                {pagina.tekst("hero_knop")}
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center rounded-lg border border-line px-7 font-semibold text-green-dark transition-colors hover:bg-sand-light"
              >
                Stel je vraag
              </Link>
            </div>
          </div>

          {beeld ? (
            <Image
              src={beeld.url}
              alt={beeld.alt}
              width={720}
              height={540}
              priority
              className="rounded-[var(--radius-card)] border border-line object-cover"
            />
          ) : null}
        </div>
      </section>

      {/* Twee proposities: zakelijk en persoonlijk (§8.1) ------------------- */}
      <Sectie>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-transparent bg-sand-light">
            <CardContent className="p-7">
              <h2 className="text-2xl">{pagina.tekst("zakelijk_titel")}</h2>
              <Richtext
                html={pagina.html("zakelijk_tekst")}
                className="mt-4 text-[0.975rem]"
              />
            </CardContent>
          </Card>

          <Card className="border-transparent bg-sand-light">
            <CardContent className="p-7">
              <h2 className="text-2xl">{pagina.tekst("persoonlijk_titel")}</h2>
              <Richtext
                html={pagina.html("persoonlijk_tekst")}
                className="mt-4 text-[0.975rem]"
              />
            </CardContent>
          </Card>
        </div>
      </Sectie>

      {/* Drie ingangen ----------------------------------------------------- */}
      <Sectie achtergrond="creme" lijnBoven>
        <SectieKop
          titel="Waar wil je beginnen?"
          inleiding="Drie manieren om met ons te werken, elk met een eigen tempo."
        />
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              titel: "Opleidingen",
              tekst:
                "Meerdaagse opleidingen met certificaat per module. Voor wie het vak grondig wil leren.",
              href: "/opleidingen",
            },
            {
              titel: "Trainingen",
              tekst:
                "Kortere programma's rond één onderwerp. Online of in de studio.",
              href: "/trainingen",
            },
            {
              titel: "Yogalessen",
              tekst:
                "Wekelijkse lessen in kleine groepen. Neem contact op voor het actuele rooster.",
              href: "/contact",
            },
          ].map((ingang) => (
            <li key={ingang.titel} className="relative flex">
              <Card className="flex flex-1 flex-col bg-white transition-colors hover:border-green/40">
                <CardContent className="p-7">
                  <h3 className="text-xl">
                    <Link
                      href={ingang.href}
                      className="transition-colors hover:text-green"
                    >
                      <span className="absolute inset-0" aria-hidden />
                      {ingang.titel}
                    </Link>
                  </h3>
                  <p className="mt-3 text-sm">{ingang.tekst}</p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </Sectie>

      {/* Waarom Yoga Companie ---------------------------------------------- */}
      {redenen.length > 0 ? (
        <Sectie>
          <SectieKop titel={pagina.tekst("waarom_titel")} />
          <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {redenen.map((reden) => (
              <li key={reden.titel} className="border-t border-line pt-5">
                <h3 className="text-lg">{reden.titel}</h3>
                <p className="mt-1.5 text-[0.975rem] text-muted">
                  {reden.tekst}
                </p>
              </li>
            ))}
          </ul>
        </Sectie>
      ) : null}

      {/* Opleidingen in het kort ------------------------------------------- */}
      <Sectie achtergrond="creme" lijnBoven>
        <SectieKop
          titel="Onze opleidingen"
          inleiding="De volledige opleiding of losse modules — je kiest zelf het tempo."
        />
        <div className="mt-10">
          <CursusRooster cursussen={opleidingen.slice(0, 3)} />
        </div>
        <Link
          href="/opleidingen"
          className="mt-8 inline-flex font-semibold text-green underline"
        >
          Bekijk het volledige aanbod
        </Link>
      </Sectie>

      {/* Ervaringen --------------------------------------------------------- */}
      {ervaringen.length > 0 ? (
        <Sectie>
          <SectieKop titel="Wat deelnemers zeggen" />
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {ervaringen.map((ervaring, index) => (
              <li key={index}>
                <figure className="h-full rounded-[var(--radius-card)] border border-line p-6">
                  <blockquote className="font-serif text-lg text-green-dark">
                    “{ervaring.citaat}”
                  </blockquote>
                  <figcaption className="mt-4 text-sm text-muted">
                    {ervaring.naam}
                    {ervaring.rol ? ` · ${ervaring.rol}` : null}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </Sectie>
      ) : null}

      {/* Afsluitende oproep -------------------------------------------------- */}
      <Sectie achtergrond="zand" lijnBoven>
        <div className="max-w-2xl">
          <h2 className="text-3xl">{pagina.tekst("cta_titel")}</h2>
          <p className="mt-4 text-lg text-muted">{pagina.tekst("cta_tekst")}</p>
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
