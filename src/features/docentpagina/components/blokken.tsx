import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { Richtext, Sectie } from "@/components/layout/sectie";
import { videoAdres } from "../video";
import type { Blok } from "../server/queries";

/**
 * De blokken van een docentenpagina (§ docentenpagina's).
 *
 * Eén component per bloktype, en een schakelaar ervoor. De volgorde komt uit
 * de database; wat een blok kán zijn staat vast in `src/content/docent-blokken.ts`.
 * Er wordt hier nergens onbekende HTML uitgevoerd: richtext loopt door dezelfde
 * `Richtext` als de rest van de site, en een videoadres wordt eerst omgezet naar
 * de privacyvriendelijke variant die de CSP toelaat.
 */

type Les = {
  id: string;
  titel: string;
  start: string;
  vrijePlekken: number;
};

type Product = {
  naam: string;
  prijs: string;
};

function tekst(inhoud: Record<string, unknown>, veld: string): string {
  const waarde = inhoud[veld];
  return typeof waarde === "string" ? waarde : "";
}

function beeld(inhoud: Record<string, unknown>, veld: string) {
  const waarde = inhoud[veld] as { url?: string; alt?: string } | undefined;
  return waarde?.url ? { url: waarde.url, alt: waarde.alt ?? "" } : null;
}

function KopPortret({ inhoud }: { inhoud: Record<string, unknown> }) {
  const portret = beeld(inhoud, "portret");

  return (
    <Sectie className="!py-0">
      <div className="grid items-center gap-10 py-12 lg:grid-cols-[1.15fr_1fr] lg:py-16">
        <div>
          {tekst(inhoud, "bovenkop") ? (
            <p className="text-sm tracking-[0.14em] text-muted uppercase">
              {tekst(inhoud, "bovenkop")}
            </p>
          ) : null}
          <h1 className="mt-3 text-4xl sm:text-5xl">
            {tekst(inhoud, "titel")}
          </h1>
          {tekst(inhoud, "zin") ? (
            <p className="mt-5 max-w-lg text-lg text-muted">
              {tekst(inhoud, "zin")}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            {tekst(inhoud, "knop_een") ? (
              <Link
                href="/lessen"
                className="inline-flex h-12 items-center rounded-lg bg-primary px-7 font-semibold text-primary-foreground transition-colors hover:bg-accent-light"
              >
                {tekst(inhoud, "knop_een")}
              </Link>
            ) : null}
            {tekst(inhoud, "knop_twee") ? (
              <Link
                href="/lessen/tarieven"
                className="inline-flex h-12 items-center rounded-lg border border-green px-7 font-semibold text-green transition-colors hover:bg-hover"
              >
                {tekst(inhoud, "knop_twee")}
              </Link>
            ) : null}
          </div>
        </div>

        {portret ? (
          <Image
            src={portret.url}
            alt={portret.alt}
            width={720}
            height={860}
            priority
            className="aspect-[4/5] w-full rounded-[var(--radius-card)] border border-line object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="aspect-[4/5] w-full rounded-[var(--radius-card)] border border-line bg-sand-light"
          />
        )}
      </div>
    </Sectie>
  );
}

function MijnLessen({
  inhoud,
  lessen,
}: {
  inhoud: Record<string, unknown>;
  lessen: Les[];
}) {
  return (
    <Sectie achtergrond="creme" lijnBoven>
      <h2 className="text-3xl">{tekst(inhoud, "kop") || "Mijn lessen"}</h2>

      {lessen.length === 0 ? (
        <p className="mt-4 text-muted">
          Er staan op dit moment geen lessen in het rooster.{" "}
          <Link href="/lessen" className="underline hover:text-green">
            Bekijk het volledige rooster
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lessen.map((les) => (
            <li
              key={les.id}
              className="rounded-[var(--radius-card)] border border-line bg-background p-5"
            >
              <p className="text-sm text-muted">
                {new Date(les.start).toLocaleString("nl-NL", {
                  weekday: "long",
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <h3 className="mt-1 text-lg">{les.titel}</h3>
              <p className="mt-2 text-sm text-muted">
                {les.vrijePlekken > 0
                  ? `nog ${les.vrijePlekken} ${les.vrijePlekken === 1 ? "plek" : "plekken"}`
                  : "vol — wachtlijst"}
              </p>
              <Link
                href="/lessen"
                className="mt-4 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent-light"
              >
                Boeken
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Sectie>
  );
}

function WatHetKost({
  inhoud,
  producten,
}: {
  inhoud: Record<string, unknown>;
  producten: Product[];
}) {
  return (
    <Sectie achtergrond="zand" lijnBoven>
      <div className="max-w-3xl">
        <h2 className="text-3xl">{tekst(inhoud, "kop") || "Wat het kost"}</h2>
        {tekst(inhoud, "toelichting") ? (
          <p className="mt-3 text-muted">{tekst(inhoud, "toelichting")}</p>
        ) : null}

        <dl className="mt-8 grid gap-x-10 gap-y-3 sm:grid-cols-2">
          {producten.map((product) => (
            <div
              key={product.naam}
              className="flex items-baseline justify-between gap-4 border-b border-line pb-2"
            >
              <dt>{product.naam}</dt>
              <dd className="font-semibold tabular-nums">{product.prijs}</dd>
            </div>
          ))}
        </dl>

        <Link
          href="/lessen/tarieven"
          className="mt-8 inline-flex h-11 items-center rounded-lg border border-green px-5 font-semibold text-green transition-colors hover:bg-hover"
        >
          Alle tarieven en voorwaarden
        </Link>
      </div>
    </Sectie>
  );
}

function OverMij({ inhoud }: { inhoud: Record<string, unknown> }) {
  const foto = beeld(inhoud, "foto");

  return (
    <Sectie lijnBoven>
      <div className="grid gap-10 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
        {foto ? (
          <Image
            src={foto.url}
            alt={foto.alt}
            width={560}
            height={560}
            className="aspect-square w-full rounded-[var(--radius-card)] border border-line object-cover"
          />
        ) : null}
        <div className="max-w-2xl">
          <h2 className="text-3xl">{tekst(inhoud, "kop") || "Over mij"}</h2>
          <Richtext html={tekst(inhoud, "verhaal")} className="mt-5 text-lg" />
        </div>
      </div>
    </Sectie>
  );
}

function Tekstblok({ inhoud }: { inhoud: Record<string, unknown> }) {
  return (
    <Sectie lijnBoven>
      <div className="max-w-2xl">
        <h2 className="text-3xl">{tekst(inhoud, "kop")}</h2>
        <Richtext html={tekst(inhoud, "tekst")} className="mt-5 text-lg" />
      </div>
    </Sectie>
  );
}

function Beeldblok({ inhoud }: { inhoud: Record<string, unknown> }) {
  const foto = beeld(inhoud, "foto");
  if (!foto) return null;

  return (
    <Sectie lijnBoven>
      <figure>
        <Image
          src={foto.url}
          alt={foto.alt}
          width={1600}
          height={700}
          className="aspect-[16/7] w-full rounded-[var(--radius-card)] border border-line object-cover"
        />
        {tekst(inhoud, "bijschrift") ? (
          <figcaption className="mt-3 text-sm text-muted">
            {tekst(inhoud, "bijschrift")}
          </figcaption>
        ) : null}
      </figure>
    </Sectie>
  );
}

/**
 * Een reeks foto's naast elkaar.
 *
 * Lege plekken vallen weg: kiest een docent een foto en haalt hij hem later uit
 * zijn beeldbank, dan blijft er een gat achter in plaats van een kapot beeld.
 * Blijft er niets over, dan verdwijnt het hele blok.
 */
function Fotoreeks({ inhoud }: { inhoud: Record<string, unknown> }) {
  const ruw = Array.isArray(inhoud.fotos)
    ? (inhoud.fotos as { url?: string; alt?: string }[])
    : [];
  const fotos = ruw
    .filter((foto) => typeof foto?.url === "string" && foto.url.length > 0)
    .map((foto) => ({ url: foto.url as string, alt: foto.alt ?? "" }));

  if (fotos.length === 0) return null;

  return (
    <Sectie lijnBoven>
      {tekst(inhoud, "kop") ? (
        <h2 className="mb-8 text-3xl">{tekst(inhoud, "kop")}</h2>
      ) : null}

      <ul
        className={
          fotos.length === 2
            ? "grid gap-4 sm:grid-cols-2"
            : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {fotos.map((foto, index) => (
          <li key={`${foto.url}-${index}`}>
            <Image
              src={foto.url}
              alt={foto.alt}
              width={800}
              height={600}
              className="aspect-[4/3] w-full rounded-[var(--radius-card)] border border-line object-cover"
            />
          </li>
        ))}
      </ul>

      {tekst(inhoud, "bijschrift") ? (
        <p className="mt-4 text-sm text-muted">{tekst(inhoud, "bijschrift")}</p>
      ) : null}
    </Sectie>
  );
}

function Citaatblok({ inhoud }: { inhoud: Record<string, unknown> }) {
  return (
    <Sectie achtergrond="creme" lijnBoven>
      <figure className="mx-auto max-w-2xl text-center">
        <blockquote className="font-serif text-2xl sm:text-3xl">
          “{tekst(inhoud, "citaat")}”
        </blockquote>
        {tekst(inhoud, "wie") ? (
          <figcaption className="mt-4 text-sm text-muted">
            {tekst(inhoud, "wie")}
          </figcaption>
        ) : null}
      </figure>
    </Sectie>
  );
}

function Videoblok({ inhoud }: { inhoud: Record<string, unknown> }) {
  const adres = videoAdres(tekst(inhoud, "url"));
  if (!adres) return null;

  return (
    <Sectie lijnBoven>
      <div className="mx-auto max-w-3xl">
        {tekst(inhoud, "kop") ? (
          <h2 className="mb-5 text-3xl">{tekst(inhoud, "kop")}</h2>
        ) : null}
        <div className="aspect-video overflow-hidden rounded-[var(--radius-card)] border border-line">
          <iframe
            src={adres}
            title={tekst(inhoud, "kop") || "Video"}
            allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </div>
    </Sectie>
  );
}

function VraagAntwoord({ inhoud }: { inhoud: Record<string, unknown> }) {
  const vragen = Array.isArray(inhoud.vragen)
    ? (inhoud.vragen as { vraag?: string; antwoord?: string }[])
    : [];

  if (vragen.length === 0) return null;

  return (
    <Sectie lijnBoven>
      <div className="max-w-2xl">
        <h2 className="text-3xl">
          {tekst(inhoud, "kop") || "Veelgestelde vragen"}
        </h2>
        <div className="mt-8 divide-y divide-line border-y border-line">
          {vragen.map((item, index) => (
            <details key={index} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold marker:content-none hover:text-green [&::-webkit-details-marker]:hidden">
                {item.vraag}
                <ChevronDown
                  aria-hidden
                  className="size-5 shrink-0 text-green transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="pb-6 text-muted">{item.antwoord}</p>
            </details>
          ))}
        </div>
      </div>
    </Sectie>
  );
}

function Contactblok({ inhoud }: { inhoud: Record<string, unknown> }) {
  const email = tekst(inhoud, "email");
  const telefoon = tekst(inhoud, "telefoon");
  const instagram = tekst(inhoud, "instagram");

  if (!email && !telefoon && !instagram) return null;

  return (
    <Sectie achtergrond="creme" lijnBoven>
      <div className="max-w-2xl">
        <h2 className="text-3xl">{tekst(inhoud, "kop") || "Even contact?"}</h2>
        <ul className="mt-6 space-y-2">
          {email ? (
            <li>
              <a
                href={`mailto:${email}`}
                className="underline hover:text-green"
              >
                {email}
              </a>
            </li>
          ) : null}
          {telefoon ? (
            <li>
              <a
                href={`tel:${telefoon.replace(/\s/g, "")}`}
                className="underline hover:text-green"
              >
                {telefoon}
              </a>
            </li>
          ) : null}
          {instagram ? (
            <li>
              <a
                href={`https://www.instagram.com/${instagram}`}
                rel="noopener noreferrer me"
                className="underline hover:text-green"
              >
                @{instagram}
              </a>
            </li>
          ) : null}
        </ul>
      </div>
    </Sectie>
  );
}

export function DocentBlokken({
  blokken,
  lessen,
  producten,
}: {
  blokken: Blok[];
  lessen: Les[];
  producten: Product[];
}) {
  return (
    <>
      {blokken.map((blok) => {
        if (!blok.zichtbaar) return null;

        switch (blok.type) {
          case "kop_portret":
            return <KopPortret key={blok.id} inhoud={blok.inhoud} />;
          case "mijn_lessen":
            return (
              <MijnLessen key={blok.id} inhoud={blok.inhoud} lessen={lessen} />
            );
          case "wat_het_kost":
            return (
              <WatHetKost
                key={blok.id}
                inhoud={blok.inhoud}
                producten={producten}
              />
            );
          case "over_mij":
            return <OverMij key={blok.id} inhoud={blok.inhoud} />;
          case "tekst":
            return <Tekstblok key={blok.id} inhoud={blok.inhoud} />;
          case "beeld":
            return <Beeldblok key={blok.id} inhoud={blok.inhoud} />;
          case "fotoreeks":
            return <Fotoreeks key={blok.id} inhoud={blok.inhoud} />;
          case "citaat":
            return <Citaatblok key={blok.id} inhoud={blok.inhoud} />;
          case "video":
            return <Videoblok key={blok.id} inhoud={blok.inhoud} />;
          case "vraag_antwoord":
            return <VraagAntwoord key={blok.id} inhoud={blok.inhoud} />;
          case "contact":
            return <Contactblok key={blok.id} inhoud={blok.inhoud} />;
          default:
            // Een bloktype dat de pagina niet kent hoort niet te bestaan — de
            // database laat alleen bekende types toe. Mocht er ooit een blok
            // achterblijven van een type dat is weggehaald, dan tonen we niets
            // in plaats van een foutmelding aan de bezoeker.
            return null;
        }
      })}
    </>
  );
}
