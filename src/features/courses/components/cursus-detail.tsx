import Link from "next/link";

import { Sectie } from "@/components/layout/sectie";
import { SectieBeeld } from "@/components/layout/sectie-beeld";
import { CmsKnop } from "@/components/ui/cms-knop";
import { Alineas } from "@/components/ui/alineas";
import { NIVEAU_INFO } from "@/content/niveaus";
import { SOORT_INFO } from "@/content/soorten";
import { cursusSleutel } from "@/content/vrije-blokken";
import { AanmeldFormulier, VrijeZone, type Pagina } from "@/features/cms";
import { veiligeLink } from "@/lib/knoplink";

import { formateerPrijs } from "../prijs";
import { AcademyBadge } from "./academy-badge";
import type { Cursus } from "../server/queries";

/**
 * De sterretjes weg waarmee ooit vet werd bedoeld.
 *
 * In de beschrijvingen van de opleidingen staat markdown: `**Yin Yoga niveau
 * 1**`. De pagina toont geen markdown, dus zonder dit staan de sterretjes
 * letterlijk op het scherm. Ze uit de database halen is inhoud van de
 * beheerder aanpassen; ze hier verbergen is dat niet.
 */
function zonderSterretjes(tekst: string): string {
  return tekst.replaceAll("**", "");
}

function Feit({ label, waarde }: { label: string; waarde: string }) {
  if (!label.trim() || !waarde.trim()) return null;

  return (
    <div className="border-b border-line py-3 last:border-0">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-0.5">{waarde}</dd>
    </div>
  );
}

/**
 * De pagina van één opleiding of training.
 *
 * Wat er staat komt uit het aanbod: titel, verhaal, prijs, curriculum, de
 * praktische gegevens. De woorden eromheen — "Voor wie", "Praktisch", "Twijfel
 * je of dit past?" — stonden in de code en waren daarmee het enige stuk van de
 * site dat de beheerder niet kon aanraken. Ze komen nu uit één set blokken
 * onder de sleutel `cursus`, die op alle cursuspagina's tegelijk geldt. Per
 * pagina zou betekenen dat het woord "Curriculum" op negen plekken bijgewerkt
 * moet, en dan staat er na een half jaar op drie pagina's iets anders.
 *
 * Wat wél per cursus verschilt — een foto, een extra stuk tekst, een foto met
 * de tekst eroverheen — staat in de eigen blokken van die ene cursus. Die
 * hangen aan `cursus--<slug>` en zijn te vinden in de site-editor onder de
 * naam van de opleiding of training zelf.
 *
 * Een label dat de beheerder leegmaakt laat de regel eromheen verdwijnen in
 * plaats van een lege plek achter te laten; dat is hoe je hier iets weghaalt.
 */
export function CursusDetail({
  cursus,
  pagina,
  concept = false,
}: {
  cursus: Cursus;
  /** De vaste teksten; alle cursuspagina's delen ze. */
  pagina: Pagina;
  /** In de voorvertoning tellen ook de nog niet gepubliceerde blokken mee. */
  concept?: boolean;
}) {
  const vrijeSleutel = cursusSleutel(cursus.slug);
  // Waar deze cursus hoort, en hoe de weg terug heet. Dit stond als
  // `opleiding of anders training` in de code; bij een derde soort wees dat
  // een workshop naar de trainingen zonder dat iets faalde.
  const soort = SOORT_INFO[cursus.type];
  const overzichtPad = soort.pad;
  const kruimel = pagina.tekst(soort.kruimelBlok) || soort.meervoud;

  const totaalUren = cursus.curriculum.reduce(
    (totaal, module) => totaal + module.uren,
    0,
  );

  const slotTitel = pagina.tekst("slot_titel");

  return (
    <>
      {/* Kop met prijs en inschrijfknop ------------------------------------- */}
      <section data-sectie="kop" className="border-b border-line bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <nav aria-label="Kruimelpad" className="text-sm text-muted">
            <Link href={overzichtPad} className="underline hover:text-green">
              {kruimel}
            </Link>
          </nav>

          <div className="mt-4 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-4xl sm:text-5xl">{cursus.titel}</h1>
              <div className="mt-5 max-w-2xl">
                <Alineas
                  tekst={zonderSterretjes(cursus.samenvatting)}
                  className="text-lg text-muted"
                />
              </div>
            </div>

            <div className="rounded-[var(--radius-card)] border border-sand bg-sand-light p-6 lg:w-72">
              <p className="font-serif text-3xl font-semibold text-green-dark">
                {formateerPrijs(cursus.prijsCenten)}
              </p>
              {pagina.tekst("kop_prijs_toelichting") ? (
                <p className="mt-1 text-sm whitespace-pre-line text-muted">
                  {pagina.tekst("kop_prijs_toelichting")}
                </p>
              ) : null}
              {/* Naar het aanmeldformulier onderaan deze pagina, en niet
                  naar /inschrijven. Die route vraagt eerst een account en
                  daarna een betaling; wie net besloten heeft dat hij mee wil
                  doen krijgt dan een inlogscherm te zien, en dat is het moment
                  waarop mensen afhaken. De opleidingspagina's gingen hier al
                  om; de cursus- en workshoppagina's waren achtergebleven. De
                  bestemming staat in de editor, dus de route via het portaal
                  is terug te zetten zonder code. */}
              <Link
                href={veiligeLink(
                  pagina.tekst("kop_inschrijf_link"),
                  "#aanmelden",
                )}
                className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary font-semibold text-primary-foreground transition-colors hover:bg-accent-light"
              >
                {pagina.tekst("kop_inschrijf_knop") || "Inschrijven"}
              </Link>
              {pagina.tekst("kop_vraag_knop") ? (
                <Link
                  href={veiligeLink(pagina.tekst("kop_vraag_link"), "/contact")}
                  className="mt-3 inline-flex w-full justify-center text-sm text-muted underline hover:text-green"
                >
                  {pagina.tekst("kop_vraag_knop")}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <VrijeZone pageKey={vrijeSleutel} sectie="kop" concept={concept} />

      <Sectie sectie="verhaal">
        <div className="grid gap-12 lg:grid-cols-[1fr_20rem]">
          {/* Hoofdtekst --------------------------------------------------- */}
          <div className="max-w-2xl">
            <Alineas tekst={zonderSterretjes(cursus.beschrijving)} />

            {cursus.voorWie && pagina.tekst("verhaal_voorwie_titel") ? (
              <>
                <h2 className="mt-12 text-2xl">
                  {pagina.tekst("verhaal_voorwie_titel")}
                </h2>
                <p className="mt-4">{cursus.voorWie}</p>
              </>
            ) : null}

            {cursus.toelatingseisen &&
            pagina.tekst("verhaal_toelating_titel") ? (
              <>
                <h2 className="mt-12 text-2xl">
                  {pagina.tekst("verhaal_toelating_titel")}
                </h2>
                <p className="mt-4">{cursus.toelatingseisen}</p>
              </>
            ) : null}

            <VerwantePaginas slug={cursus.slug} />

            {cursus.curriculum.length > 0 ? (
              <>
                {pagina.tekst("verhaal_curriculum_titel") ? (
                  <h2 className="mt-12 text-2xl">
                    {pagina.tekst("verhaal_curriculum_titel")}
                  </h2>
                ) : null}
                <div className="mt-5 space-y-3">
                  {cursus.curriculum.map((module) => (
                    <details
                      key={module.nummer}
                      className="group rounded-[var(--radius-card)] border border-line"
                      // De eerste module staat open, zodat meteen zichtbaar is
                      // wat er in een module gebeurt.
                      open={module.nummer === cursus.curriculum[0]?.nummer}
                    >
                      <summary className="flex cursor-pointer items-baseline justify-between gap-4 p-5">
                        <span className="font-serif text-lg font-semibold text-green-dark">
                          {cursus.curriculum.length > 1
                            ? `Module ${module.nummer}: `
                            : null}
                          {module.titel}
                        </span>
                        <span className="shrink-0 text-sm text-muted">
                          {module.uren} uur
                        </span>
                      </summary>

                      <div className="border-t border-line p-5">
                        <Alineas
                          tekst={zonderSterretjes(module.samenvatting)}
                          className="text-muted"
                        />
                        <ul className="mt-5 space-y-4">
                          {module.blokken.map((blok, plek) => (
                            // Een opsomming zonder kopje erboven mag; dan blijft
                            // de regel weg in plaats van dat er een lege staat.
                            <li key={`${blok.titel}-${plek}`}>
                              {blok.titel ? (
                                <p className="font-semibold">{blok.titel}</p>
                              ) : null}
                              <ul className="mt-1.5 space-y-1 text-[0.975rem] text-muted">
                                {blok.onderdelen.map((onderdeel) => (
                                  <li
                                    key={onderdeel}
                                    className="ml-5 list-disc"
                                  >
                                    {onderdeel}
                                  </li>
                                ))}
                              </ul>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </details>
                  ))}
                </div>
              </>
            ) : null}
          </div>

          {/* Praktische gegevens ------------------------------------------ */}
          <aside
            data-sectie="praktisch"
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <div className="rounded-[var(--radius-card)] border border-line p-6">
              <h2 className="text-xl">{pagina.tekst("praktisch_titel")}</h2>
              {cursus.certificaatNiveau ? (
                <div className="mt-5 flex items-center gap-4">
                  <AcademyBadge
                    niveau={cursus.certificaatNiveau}
                    className="w-24 shrink-0"
                  />
                  <div className="text-sm">
                    <p className="font-semibold">
                      {NIVEAU_INFO[cursus.certificaatNiveau].label}
                    </p>
                    {pagina.tekst("praktisch_certificaat_naam") ? (
                      <p className="text-muted">
                        {pagina.tekst("praktisch_certificaat_naam")}
                      </p>
                    ) : null}
                    {pagina.tekst("praktisch_certificaat_knop") ? (
                      <Link
                        href={veiligeLink(
                          pagina.tekst("praktisch_certificaat_link"),
                          "/opleidingen/academy",
                        )}
                        className="mt-1 inline-block underline underline-offset-4 hover:text-green"
                      >
                        {pagina.tekst("praktisch_certificaat_knop")}
                      </Link>
                    ) : null}
                  </div>
                </div>
              ) : null}
              {cursus.certificaatNiveau &&
              pagina.tekst("praktisch_certificaat_voorwaarde") ? (
                <p className="mt-4 text-sm whitespace-pre-line text-muted">
                  {pagina.tekst("praktisch_certificaat_voorwaarde")}
                </p>
              ) : null}
              <dl className="mt-4">
                {totaalUren > 0 ? (
                  <Feit
                    label={pagina.tekst("praktisch_omvang")}
                    waarde={`${totaalUren} uur`}
                  />
                ) : null}
                <Feit
                  label={pagina.tekst("praktisch_studiebelasting")}
                  waarde={cursus.studiebelasting ?? ""}
                />
                <Feit
                  label={pagina.tekst("praktisch_locatie")}
                  waarde={cursus.locatie ?? ""}
                />
                <Feit
                  label={pagina.tekst("praktisch_groepsgrootte")}
                  waarde={
                    cursus.maxDeelnemers
                      ? `maximaal ${cursus.maxDeelnemers} deelnemers`
                      : ""
                  }
                />
                <Feit
                  label={pagina.tekst("praktisch_certificaat")}
                  waarde={cursus.certificaat ?? ""}
                />
                {/* De data van deze ene cursus, en anders de algemene regel
                    die voor alle cursussen geldt. Andersom zou één workshop
                    met een datum diezelfde datum onder elke opleiding zetten,
                    want die tekst is gedeeld. */}
                <Feit
                  label={pagina.tekst("praktisch_lesdata")}
                  waarde={
                    cursus.lesdata || pagina.tekst("praktisch_lesdata_tekst")
                  }
                />
              </dl>
            </div>
          </aside>
        </div>
      </Sectie>

      <VrijeZone pageKey={vrijeSleutel} sectie="verhaal" concept={concept} />

      {/* Aanmelden ------------------------------------------------------- */}
      <SectieBeeld
        beeld={pagina.beeld("aanmelden_beeld")}
        sectie="aanmelden"
        achtergrond="creme"
        lijnBoven
      >
        {pagina.tekst("aanmelden_titel") ? (
          <div className="max-w-2xl">
            <h2 className="text-3xl">{pagina.tekst("aanmelden_titel")}</h2>
            {pagina.tekst("aanmelden_tekst") ? (
              <p className="mt-4 text-lg whitespace-pre-line text-muted">
                {pagina.tekst("aanmelden_tekst")}
              </p>
            ) : null}
          </div>
        ) : null}

        {/* Het anker waar de knop bovenaan naartoe springt. */}
        <div id="aanmelden" className="mt-10 max-w-2xl scroll-mt-24">
          {/* Eén keuze in de lijst: je meldt je aan voor deze cursus. Het veld
              blijft staan omdat het de onderwerpregel van de mail vult, zodat
              een aanmelding in het beheer meteen te plaatsen is. De titel wordt
              afgekapt op de lengte die de controle toelaat. */}
          <AanmeldFormulier
            onderwerp={cursus.titel.slice(0, 60)}
            varianten={[cursus.titel.slice(0, 120)]}
          />
        </div>
      </SectieBeeld>

      {slotTitel ? (
        <Sectie sectie="slot" achtergrond="zand" lijnBoven>
          <div className="max-w-2xl">
            <h2 className="text-3xl">{slotTitel}</h2>
            {pagina.tekst("slot_tekst") ? (
              <p className="mt-4 text-lg whitespace-pre-line text-muted">
                {pagina.tekst("slot_tekst")}
              </p>
            ) : null}
            <CmsKnop
              tekst={pagina.tekst("slot_knop")}
              link={pagina.tekst("slot_link")}
              terugval="/contact"
              className="mt-8"
            />
          </div>
        </Sectie>
      ) : null}

      {/* Wat de beheerder zelf onder deze ene cursus heeft gezet. */}
      <VrijeZone pageKey={vrijeSleutel} concept={concept} />
    </>
  );
}

/**
 * Verwijzingen naar pagina's die dezelfde stof beschrijven.
 *
 * Module 3 en 4 van de 200-uurs Yogaopleiding zijn dezelfde modules als niveau
 * 1 en 2 van de Yin Yoga Specialist Opleiding. Die tekst hier nog een keer
 * neerzetten zou betekenen dat hij op twee plekken moet worden bijgewerkt, en
 * dan lopen ze na de eerste wijziging uit elkaar. Dus een link.
 *
 * Dit is structuur, geen inhoud: welke pagina's bij elkaar horen ligt vast in
 * code, net als de opbouw van de rest van de site.
 */
const VERWANT: Record<
  string,
  {
    titel: string;
    regels: { href: string; label: string; toelichting: string }[];
  }
> = {
  "200-uurs-yin-yoga-specialist": {
    titel: "Ook onderdeel van de 200-uurs Yogaopleiding",
    regels: [
      {
        href: "/opleidingen/200-uurs-yogaopleiding/module-3-yin-yoga-het-lichaam",
        label: "Module 3 — Yin Yoga & het lichaam",
        toelichting: "Dezelfde module als niveau 1 hierboven",
      },
      {
        href: "/opleidingen/200-uurs-yogaopleiding/module-4-zenuwstelsel-meridianen",
        label: "Module 4 — Zenuwstelsel & basis meridianen",
        toelichting: "Dezelfde module als niveau 2 hierboven",
      },
    ],
  },
};

function VerwantePaginas({ slug }: { slug: string }) {
  const verwant = VERWANT[slug];
  if (!verwant) return null;

  return (
    <div className="mt-12 rounded-[var(--radius-card)] border border-line bg-cream p-5">
      <h2 className="text-lg">{verwant.titel}</h2>
      <ul className="mt-3 space-y-2">
        {verwant.regels.map((regel) => (
          <li key={regel.href}>
            <Link
              href={regel.href}
              className="font-semibold underline underline-offset-4 hover:no-underline"
            >
              {regel.label}
            </Link>
            <span className="block text-sm whitespace-pre-line text-muted">
              {regel.toelichting}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
