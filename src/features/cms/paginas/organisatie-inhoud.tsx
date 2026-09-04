import Image from "next/image";

import { Alineas } from "@/components/ui/alineas";
import { Richtext, Sectie, SectieKop } from "@/components/layout/sectie";
import { AanvraagFormulier } from "../components/aanvraag-formulier";
import type { Pagina } from "../server/queries";

/**
 * De pagina's voor organisaties: bedrijven, sportclubs en het onderwijs.
 *
 * Eén opmaak voor alle drie, gevoed door dezelfde blokken. Dat is met opzet:
 * het zijn drie varianten van hetzelfde gesprek — wat het is, voor wie, hoe het
 * praktisch gaat, wat het kost — en drie keer bijna dezelfde code onderhouden
 * loopt binnen een jaar uit elkaar.
 *
 * Elk blok verdwijnt als het leeg is. Zo kan een pagina die geen doelgroepen
 * heeft toch dezelfde opmaak gebruiken, zonder een gat achter te laten.
 */

type Kaart = { titel: string; tekst: string; uitgelicht?: string };
type Regel = { titel: string; tekst: string };
type Vorm = {
  naam: string;
  duur: string;
  tekst: string;
  prijs: string;
  uitgelicht?: string;
};

/** Waar of een veld met "ja" is aangezet. Alles daarbuiten telt als nee. */
function aan(waarde: string | undefined) {
  return waarde?.trim().toLowerCase() === "ja";
}

export function OrganisatieInhoud({
  pagina,
  pageKey,
}: {
  pagina: Pagina;
  /** Waarvoor de aanvraag binnenkomt; staat in het bericht aan de beheerder. */
  pageKey: string;
}) {
  const beeld = pagina.beeld("beeld");
  const verhaal = pagina.html("verhaal");
  const kaarten = pagina.lijst<Kaart>("doelgroepen");
  const regels = pagina.lijst<Regel>("praktisch");
  const vormen = pagina.lijst<Vorm>("vormen");

  return (
    <>
      <Sectie achtergrond="creme" className="!pb-10">
        <div className="max-w-2xl">
          {pagina.tekst("label") ? (
            <p className="label-klein">{pagina.tekst("label")}</p>
          ) : null}
          <h1 className="mt-3 text-4xl sm:text-5xl">{pagina.tekst("titel")}</h1>
          <div className="mt-6">
            <Alineas
              tekst={pagina.tekst("inleiding")}
              className="text-lg text-muted"
            />
          </div>
          {pagina.tekst("knop") ? (
            <a
              href="#aanvraag"
              className="mt-8 inline-flex h-12 items-center rounded-lg bg-primary px-7 font-semibold text-primary-foreground transition-colors hover:bg-accent-light"
            >
              {pagina.tekst("knop")}
            </a>
          ) : null}
        </div>
      </Sectie>

      {beeld ? (
        <Sectie achtergrond="creme" className="!pt-0">
          <Image
            src={beeld.url}
            alt={beeld.alt}
            width={1600}
            height={700}
            style={{ objectPosition: beeld.focus }}
            className="aspect-[16/7] w-full rounded-[var(--radius-card)] border border-line object-cover"
          />
        </Sectie>
      ) : null}

      {verhaal ? (
        <Sectie lijnBoven>
          <Richtext html={verhaal} className="max-w-2xl text-lg" />
        </Sectie>
      ) : null}

      {kaarten.length > 0 ? (
        <Sectie achtergrond={verhaal ? "creme" : "wit"} lijnBoven>
          <SectieKop titel={pagina.tekst("doelgroepen_titel")} />
          <ul className="mt-10 grid gap-6 md:grid-cols-2">
            {kaarten.map((kaart, index) => (
              <li key={index}>
                <div
                  className={
                    aan(kaart.uitgelicht)
                      ? "flex h-full flex-col gap-3 rounded-[var(--radius-card)] border border-accent bg-hover p-7"
                      : "flex h-full flex-col gap-3 rounded-[var(--radius-card)] border border-line bg-background p-7"
                  }
                >
                  {aan(kaart.uitgelicht) ? (
                    <p className="label-klein text-ink">Vaak de eerste stap</p>
                  ) : null}
                  <h3 className="text-xl">{kaart.titel}</h3>
                  <p className="text-[0.975rem] text-muted">{kaart.tekst}</p>
                </div>
              </li>
            ))}
          </ul>
        </Sectie>
      ) : null}

      {regels.length > 0 ? (
        <Sectie achtergrond="zand" lijnBoven>
          <SectieKop titel={pagina.tekst("praktisch_titel")} />
          <dl className="mt-8">
            {regels.map((regel, index) => (
              <div
                key={index}
                className="grid gap-1 border-t border-sand py-4 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-8"
              >
                <dt className="text-[0.975rem] text-muted">{regel.titel}</dt>
                <dd className="text-[0.975rem]">{regel.tekst}</dd>
              </div>
            ))}
          </dl>
        </Sectie>
      ) : null}

      {vormen.length > 0 ? (
        <Sectie lijnBoven>
          <SectieKop
            titel={pagina.tekst("vormen_titel")}
            inleiding={pagina.tekst("vormen_inleiding")}
          />
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {vormen.map((vorm, index) => (
              <li key={index}>
                <div
                  className={
                    aan(vorm.uitgelicht)
                      ? "flex h-full flex-col gap-3 rounded-[var(--radius-card)] border border-accent bg-hover p-7"
                      : "flex h-full flex-col gap-3 rounded-[var(--radius-card)] border border-line bg-background p-7"
                  }
                >
                  {aan(vorm.uitgelicht) ? (
                    <p className="label-klein text-ink">Meest gekozen</p>
                  ) : null}
                  <h3 className="text-xl">{vorm.naam}</h3>
                  {vorm.duur ? (
                    <p className="text-sm text-muted">{vorm.duur}</p>
                  ) : null}
                  <p className="flex-1 text-[0.975rem] text-muted">
                    {vorm.tekst}
                  </p>
                  {vorm.prijs ? (
                    <p className="font-serif text-2xl text-green-dark">
                      {vorm.prijs}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
          {pagina.tekst("vormen_voetnoot") ? (
            <p className="mt-8 max-w-3xl text-sm text-muted">
              {pagina.tekst("vormen_voetnoot")}
            </p>
          ) : null}

          {/* Het fiscale kader. Staat bewust ná de prijzen: wie de bedragen
              nog niet heeft gezien, heeft er niets aan. */}
          {pagina.html("fiscaal") ? (
            <div className="mt-10 max-w-3xl rounded-[var(--radius-card)] border border-line bg-background p-6">
              <p className="mb-3 label-klein">Wat dit fiscaal betekent</p>
              <Richtext
                html={pagina.html("fiscaal")}
                className="text-[0.975rem] text-muted"
              />
            </div>
          ) : null}
        </Sectie>
      ) : null}

      <Sectie achtergrond="creme" lijnBoven>
        <div id="aanvraag" className="grid gap-10 lg:grid-cols-2">
          <div className="max-w-xl">
            <h2 className="text-3xl">{pagina.tekst("cta_titel")}</h2>
            <p className="mt-4 text-lg text-muted">
              {pagina.tekst("cta_tekst")}
            </p>
          </div>
          <AanvraagFormulier pageKey={pageKey} />
        </div>
      </Sectie>
    </>
  );
}
