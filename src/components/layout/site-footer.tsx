import Link from "next/link";

import { haalPagina } from "@/features/cms";

const legal = [
  { href: "/privacyverklaring", label: "Privacyverklaring" },
  { href: "/algemene-voorwaarden", label: "Algemene voorwaarden" },
  { href: "/cookies", label: "Cookies" },
];

const navigatie = [
  { href: "/opleidingen", label: "Opleidingen" },
  { href: "/trainingen", label: "Trainingen" },
  { href: "/over-ons", label: "Over ons" },
  { href: "/contact", label: "Contact" },
];

type Gegeven = { label: string; waarde: string };

export async function SiteFooter() {
  const pagina = await haalPagina("footer");
  const gegevens = pagina.lijst<Gegeven>("bedrijfsgegevens");

  return (
    <footer className="mt-20 border-t border-line bg-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-serif text-lg font-semibold text-green-dark">
            Yoga Companie
          </p>
          <p className="mt-2 max-w-xs text-sm text-muted">
            {pagina.tekst("over")}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink">Aanbod</p>
          <ul className="mt-2 space-y-1 text-sm">
            {navigatie.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted transition-colors hover:text-green"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink">Juridisch</p>
          <ul className="mt-2 space-y-1 text-sm">
            {legal.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted transition-colors hover:text-green"
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

      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-muted sm:px-6">
          © {new Date().getFullYear()} Yoga Companie. Alle rechten voorbehouden.
        </p>
      </div>
    </footer>
  );
}
