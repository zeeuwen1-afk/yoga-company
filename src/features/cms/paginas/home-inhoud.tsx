import Image from "next/image";
import Link from "next/link";

import { Alineas } from "@/components/ui/alineas";
import { Sectie, SectieKop } from "@/components/layout/sectie";
import { Card, CardContent } from "@/components/ui/card";
import { formateerTijdvak, type Les } from "@/features/bookings";
import { CursusRooster, type Cursus } from "@/features/courses";
import type { Pagina } from "../server/queries";

/**
 * De landingspagina van YogaCompany.
 *
 * Anders opgebouwd dan een docentpagina, en met opzet. Een docent stelt zijn
 * pagina zelf samen uit blokken die hij mag verschuiven; hier ligt de volgorde
 * vast in code. De volgorde ís hier namelijk de boodschap: eerst wie we zijn,
 * dan de drie deuren met een prijs erbij, dan het bewijs, en pas onderaan de
 * twee inlogdeuren — wie hier al thuis is, hoeft niet overtuigd te worden.
 *
 * Losgemaakt van het ophalen van de inhoud, zodat de site-editor exact dezelfde
 * opmaak kan tonen met de concepten erin. De publieke pagina geeft de
 * gepubliceerde inhoud mee, de voorvertoning de concepten.
 */

type Reden = { titel: string; tekst: string };
type Ervaring = { citaat: string; naam: string; rol: string };
type Deur = {
  label: string;
  titel: string;
  tekst: string;
  prijs: string;
  knop: string;
  href: string;
};

/** De drie kleuren die de banner mag hebben. Alles daarbuiten wordt zand. */
const BANNERKLEUR: Record<string, string> = {
  zand: "bg-sand text-petrol-deep",
  abrikoos: "bg-accent text-accent-foreground",
  petrol: "op-donker bg-petrol-card text-cream",
};

function Banner({ pagina }: { pagina: Pagina }) {
  const tekst = pagina.tekst("banner_tekst").trim();

  // Geen tekst betekent: geen banner. Er blijft dan ook geen lege strook staan.
  if (!tekst) return null;

  const knop = pagina.tekst("banner_knop").trim();
  const link = pagina.tekst("banner_link").trim();
  const kleur =
    BANNERKLEUR[pagina.tekst("banner_kleur").trim().toLowerCase()] ??
    BANNERKLEUR.zand;

  return (
    <div className={kleur}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-5 gap-y-1 px-4 py-3 text-center sm:px-6">
        <p className="text-[0.95rem]">{tekst}</p>
        {knop && link ? (
          <Link
            href={link}
            className="text-[0.95rem] font-semibold underline underline-offset-4"
          >
            {knop} &rarr;
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function Hero({ pagina }: { pagina: Pagina }) {
  const achtergrond = pagina.beeld("hero_achtergrond");
  const bovenkop = pagina.tekst("hero_bovenkop");
  const kenmerken = pagina.tekst("hero_kenmerken");
  const knopTwee = pagina.tekst("hero_knop_twee");

  return (
    <section className="relative isolate overflow-hidden bg-petrol-deep">
      {achtergrond ? (
        <>
          <Image
            src={achtergrond.url}
            alt={achtergrond.alt}
            fill
            priority
            sizes="100vw"
            style={{ objectPosition: achtergrond.focus }}
            className="object-cover"
          />
          {/* Houdt de kop leesbaar, wélke foto de beheerder ook kiest. */}
          <div className="absolute inset-0 hero-waas" aria-hidden />
        </>
      ) : null}

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
        <div className="max-w-2xl">
          {bovenkop ? (
            <p className="text-xs font-medium tracking-[0.16em] text-accent-light uppercase">
              {bovenkop}
            </p>
          ) : null}
          <div className="mt-5 h-0.5 w-16 bg-accent" aria-hidden />
          <h1 className="mt-7 text-4xl text-cream sm:text-5xl lg:text-6xl">
            {pagina.tekst("hero_titel")}
          </h1>
          <div className="mt-6 max-w-xl">
            <Alineas
              tekst={pagina.tekst("hero_subtitel")}
              className="text-lg text-muted"
            />
          </div>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/lessen"
              className="inline-flex h-12 items-center rounded-lg bg-primary px-7 font-semibold text-primary-foreground transition-colors hover:bg-accent-light"
            >
              {pagina.tekst("hero_knop")}
            </Link>
            {knopTwee ? (
              <Link
                href="/opleidingen"
                className="inline-flex h-12 items-center rounded-lg border border-line-strong px-7 font-semibold text-cream transition-colors hover:bg-hover"
              >
                {knopTwee}
              </Link>
            ) : null}
          </div>
          {kenmerken ? (
            <p className="mt-8 text-sm text-muted">{kenmerken}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Deuren({ pagina }: { pagina: Pagina }) {
  const deuren = pagina.lijst<Deur>("deuren");
  if (deuren.length === 0) return null;

  return (
    <Sectie>
      <SectieKop
        titel={pagina.tekst("deuren_titel")}
        inleiding={pagina.tekst("deuren_inleiding")}
      />
      <ul className="mt-10 grid gap-6 md:grid-cols-3">
        {deuren.map((deur) => (
          <li key={deur.titel} className="relative flex">
            <Card className="flex flex-1 flex-col transition-colors hover:border-accent/60">
              <CardContent className="flex flex-1 flex-col gap-3 p-7">
                <p className="label-klein text-accent-light">{deur.label}</p>
                <h3 className="text-2xl">
                  <Link href={deur.href}>
                    <span className="absolute inset-0" aria-hidden />
                    {deur.titel}
                  </Link>
                </h3>
                <p className="flex-1 text-[0.975rem] text-muted">
                  {deur.tekst}
                </p>
                {deur.prijs ? (
                  <p className="text-[0.975rem] text-sand">{deur.prijs}</p>
                ) : null}
                <p className="font-semibold text-accent-light">
                  {deur.knop} &rarr;
                </p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </Sectie>
  );
}

/**
 * De eerstvolgende lessen, met het kaartenbalkje ernaast.
 *
 * Staat er niets in het rooster, dan verdwijnt de hele sectie. Een kop met
 * "geen lessen gevonden" eronder verkoopt niets en roept alleen de vraag op of
 * de studio nog bestaat.
 */
function Rooster({ pagina, lessen }: { pagina: Pagina; lessen: Les[] }) {
  if (lessen.length === 0) return null;

  return (
    <Sectie achtergrond="creme" lijnBoven>
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectieKop
            titel={pagina.tekst("rooster_titel")}
            inleiding={pagina.tekst("rooster_inleiding")}
          />

          <ul className="mt-8 overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
            {lessen.map((les) => (
              <li
                key={les.id}
                className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-line p-5 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="label-klein">
                    {formateerTijdvak(les.begintOp, les.duurMinuten)}
                  </p>
                  <h3 className="mt-1 text-xl">{les.titel}</h3>
                  <p className="mt-0.5 text-sm text-muted">{les.locatie}</p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <p className="text-sm text-muted">
                    {les.vrijePlekken > 0
                      ? `${les.vrijePlekken} ${les.vrijePlekken === 1 ? "plek" : "plekken"} vrij`
                      : "Vol, wachtlijst"}
                  </p>
                  <Link
                    href="/lessen"
                    className="inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent-light"
                  >
                    {les.vrijePlekken > 0 ? "Boek" : "Wachtlijst"}
                  </Link>
                </div>
              </li>
            ))}
          </ul>

          <Link
            href="/lessen"
            className="mt-6 inline-flex font-semibold text-green underline"
          >
            Bekijk het volledige weekrooster
          </Link>
        </div>
      </div>
    </Sectie>
  );
}

/**
 * De ingang voor organisaties.
 *
 * Eén blok met drie kaarten, en geen drie extra deuren bovenaan: bij de deuren
 * daar kiest iemand voor zichzelf, hier regelt iemand het vóór een groep die er
 * zelf niet om vroeg. Die twee door elkaar zetten maakt ze allebei onduidelijk.
 */
function Organisaties({ pagina }: { pagina: Pagina }) {
  const ingangen = pagina.lijst<Deur>("organisaties");
  if (ingangen.length === 0) return null;

  return (
    <Sectie achtergrond="creme" lijnBoven>
      <SectieKop
        titel={pagina.tekst("organisaties_titel")}
        inleiding={pagina.tekst("organisaties_inleiding")}
      />
      <ul className="mt-10 grid gap-6 md:grid-cols-3">
        {ingangen.map((ingang) => (
          <li key={ingang.titel} className="relative flex">
            <Card className="flex flex-1 flex-col transition-colors hover:border-accent/60">
              <CardContent className="flex flex-1 flex-col gap-3 p-7">
                <p className="label-klein">{ingang.label}</p>
                <h3 className="text-2xl">
                  <Link href={ingang.href}>
                    <span className="absolute inset-0" aria-hidden />
                    {ingang.titel}
                  </Link>
                </h3>
                <p className="flex-1 text-[0.975rem] text-muted">
                  {ingang.tekst}
                </p>
                {ingang.prijs ? (
                  <p className="text-[0.975rem] text-green">{ingang.prijs}</p>
                ) : null}
                <p className="font-semibold text-green">{ingang.knop} &rarr;</p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </Sectie>
  );
}

function Inlogdeuren({ pagina }: { pagina: Pagina }) {
  const deuren = pagina.lijst<Deur>("inlog_deuren");
  if (deuren.length === 0) return null;

  return (
    <section className="border-t border-line bg-petrol-deep px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <SectieKop
          titel={pagina.tekst("inlog_titel")}
          inleiding={pagina.tekst("inlog_inleiding")}
        />
        <ul className="mt-10 grid gap-6 md:grid-cols-2">
          {deuren.map((deur, index) => (
            <li key={deur.titel}>
              <div className="flex h-full flex-col gap-3 rounded-[var(--radius-card)] border border-line bg-petrol p-8">
                <p className="label-klein text-accent-light">{deur.label}</p>
                <h3 className="text-2xl">{deur.titel}</h3>
                <p className="flex-1 text-[0.975rem] text-muted">
                  {deur.tekst}
                </p>
                <Link
                  href={deur.href}
                  className={
                    index === 0
                      ? "mt-2 inline-flex h-12 w-fit items-center rounded-lg bg-primary px-7 font-semibold text-primary-foreground transition-colors hover:bg-accent-light"
                      : "mt-2 inline-flex h-12 w-fit items-center rounded-lg border border-line-strong px-7 font-semibold text-cream transition-colors hover:bg-hover"
                  }
                >
                  {deur.knop}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function HomeInhoud({
  pagina,
  opleidingen,
  lessen,
}: {
  pagina: Pagina;
  opleidingen: Cursus[];
  lessen: Les[];
}) {
  const redenen = pagina.lijst<Reden>("waarom_punten");
  const ervaringen = pagina.lijst<Ervaring>("testimonials");

  return (
    <>
      <Banner pagina={pagina} />
      <Hero pagina={pagina} />
      <Deuren pagina={pagina} />
      <Rooster pagina={pagina} lessen={lessen} />

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

      <Sectie achtergrond="creme" lijnBoven>
        <SectieKop
          titel={pagina.tekst("aanbod_titel")}
          inleiding={pagina.tekst("aanbod_inleiding")}
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

      {ervaringen.length > 0 ? (
        <Sectie>
          <SectieKop titel="Wat deelnemers zeggen" />
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {ervaringen.map((ervaring, index) => (
              <li key={index}>
                <figure className="h-full rounded-[var(--radius-card)] border-l-2 border-accent bg-petrol-card p-6">
                  <blockquote className="font-serif text-lg text-cream">
                    &ldquo;{ervaring.citaat}&rdquo;
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

      <Organisaties pagina={pagina} />

      <Inlogdeuren pagina={pagina} />

      <Sectie achtergrond="zand" lijnBoven>
        <div className="max-w-2xl">
          <h2 className="text-3xl">{pagina.tekst("cta_titel")}</h2>
          <div className="mt-4">
            <Alineas
              tekst={pagina.tekst("cta_tekst")}
              className="text-lg text-muted"
            />
          </div>
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
