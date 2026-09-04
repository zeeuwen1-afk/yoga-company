import Image from "next/image";
import Link from "next/link";

import { haalPagina, type Pagina } from "@/features/cms";

const legal = [
  { href: "/privacyverklaring", label: "Privacyverklaring" },
  { href: "/algemene-voorwaarden", label: "Algemene voorwaarden" },
  { href: "/cookies", label: "Cookies" },
  // Stond in de menubalk. Hier staat hij bij de andere pagina's waar iemand
  // bewust naartoe gaat om te lezen hoe er met zijn gegevens wordt omgegaan.
  { href: "/veiligheid", label: "Veiligheid" },
];

const navigatie = [
  { href: "/opleidingen", label: "Opleidingen" },
  { href: "/trainingen", label: "Trainingen" },
  { href: "/lessen", label: "Lessen" },
  { href: "/bedrijfsyoga", label: "Bedrijfsyoga" },
  { href: "/sportclubs", label: "Sportclubs" },
  { href: "/onderwijs", label: "Onderwijs" },
  { href: "/over-ons", label: "Over ons" },
  { href: "/contact", label: "Contact" },
];

type Gegeven = { label: string; waarde: string };
type Partner = { naam: string; logo: string; website: string };

/**
 * De paginavoet leest zijn inhoud normaal zelf op. De site-editor geeft hem
 * mee, zodat de voorvertoning ook de concepten van de voet laat zien (§14).
 */
export async function SiteFooter({
  pagina: gegeven,
}: { pagina?: Pagina } = {}) {
  const pagina = gegeven ?? (await haalPagina("footer"));
  const gegevens = pagina.lijst<Gegeven>("bedrijfsgegevens");
  // Half ingevulde regels tellen niet mee: een partner zonder naam én zonder
  // logo is niets om te tonen, en zou anders als lege doos in de voet staan.
  const partners = pagina
    .lijst<Partner>("partners")
    .filter((partner) => partner.naam?.trim() || partner.logo?.trim());

  return (
    // §2: het nachtgroen draagt de paginavoet; daarop staat de lichte variant
    // van het logo.
    <footer className="bg-petrol-deep text-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Image
            src="/brand/logo-horizontaal-donker.png"
            alt="YogaCompany"
            width={1200}
            height={326}
            className="h-10 w-auto"
          />
          <p className="mt-4 max-w-xs text-sm text-muted">
            {pagina.tekst("over")}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-cream">Aanbod</p>
          <ul className="mt-2 space-y-1 text-sm">
            {navigatie.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted transition-colors hover:text-sand-light"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-cream">Juridisch</p>
          <ul className="mt-2 space-y-1 text-sm">
            {legal.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted transition-colors hover:text-sand-light"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {gegevens.length > 0 ? (
            <dl className="mt-4 space-y-0.5 text-sm text-muted">
              {gegevens.map((gegeven) => (
                <div key={gegeven.label} className="flex gap-1">
                  <dt className="sr-only">{gegeven.label}</dt>
                  <dd>{gegeven.waarde}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </div>

      {/* Partners staan bewust onderaan en klein. Wie ze zoekt vindt ze op elke
          pagina; wie ze niet zoekt wordt er niet mee lastiggevallen. Vertrouwen
          bouw je met aanwezigheid, niet met formaat. */}
      {partners.length > 0 ? (
        <div className="border-t border-petrol-line">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            {pagina.tekst("partners_titel") ? (
              <h2 className="text-sm tracking-[0.12em] text-muted uppercase">
                {pagina.tekst("partners_titel")}
              </h2>
            ) : null}
            <ul className="mt-4 flex flex-wrap items-center gap-3">
              {partners.map((partner, index) => (
                <li key={`${partner.naam}-${index}`}>
                  <PartnerMerk partner={partner} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <div className="border-t border-petrol-line">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-muted sm:px-6">
          © {new Date().getFullYear()} YogaCompany. Alle rechten voorbehouden.
        </p>
      </div>
    </footer>
  );
}

/**
 * Eén partner: het logo als dat er is, anders de naam. Met een adres wordt het
 * een link, zonder adres blijft het gewoon staan.
 *
 * Een logo is een merk van iemand anders. Het staat er dus precies zoals de
 * partner het aanlevert: geen kleurfilter, geen bijsnijden, alleen kleiner.
 */
function PartnerMerk({ partner }: { partner: Partner }) {
  const merk = partner.logo?.trim() ? (
    <Image
      src={partner.logo}
      alt={partner.naam || "Partner"}
      width={320}
      height={160}
      className="h-8 w-auto object-contain"
    />
  ) : (
    <span className="text-sm text-cream">{partner.naam}</span>
  );

  const omhulsel =
    "flex h-14 items-center rounded-lg border border-petrol-line px-4 transition-colors hover:border-sand-light";

  if (!partner.website?.trim()) {
    return <span className={omhulsel}>{merk}</span>;
  }

  return (
    <a
      href={partner.website}
      className={omhulsel}
      // Een partner is een andere site. Openen in een nieuw tabblad houdt de
      // bezoeker op yogacompany.eu; rel voorkomt dat die site iets met dit
      // tabblad kan.
      target="_blank"
      rel="noopener noreferrer"
    >
      {merk}
      <span className="sr-only">{`Naar de website van ${partner.naam || "deze partner"}`}</span>
    </a>
  );
}
