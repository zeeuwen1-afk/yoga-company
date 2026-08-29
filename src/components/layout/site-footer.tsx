import Image from "next/image";
import Link from "next/link";

import { haalPagina, type Pagina } from "@/features/cms";

const legal = [
  { href: "/privacyverklaring", label: "Privacyverklaring" },
  { href: "/algemene-voorwaarden", label: "Algemene voorwaarden" },
  { href: "/cookies", label: "Cookies" },
];

const navigatie = [
  { href: "/opleidingen", label: "Opleidingen" },
  { href: "/trainingen", label: "Trainingen" },
  { href: "/lessen", label: "Lessen" },
  { href: "/bedrijfsyoga", label: "Bedrijfsyoga" },
  { href: "/over-ons", label: "Over ons" },
  { href: "/contact", label: "Contact" },
];

type Gegeven = { label: string; waarde: string };

/**
 * De paginavoet leest zijn inhoud normaal zelf op. De site-editor geeft hem
 * mee, zodat de voorvertoning ook de concepten van de voet laat zien (§14).
 */
export async function SiteFooter({
  pagina: gegeven,
}: { pagina?: Pagina } = {}) {
  const pagina = gegeven ?? (await haalPagina("footer"));
  const gegevens = pagina.lijst<Gegeven>("bedrijfsgegevens");

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

      <div className="border-t border-petrol-line">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-muted sm:px-6">
          © {new Date().getFullYear()} YogaCompany. Alle rechten voorbehouden.
        </p>
      </div>
    </footer>
  );
}
