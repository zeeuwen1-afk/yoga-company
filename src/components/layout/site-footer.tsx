import Link from "next/link";

const legal = [
  { href: "/privacyverklaring", label: "Privacyverklaring" },
  { href: "/algemene-voorwaarden", label: "Algemene voorwaarden" },
  { href: "/cookies", label: "Cookies" },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-serif text-lg font-semibold text-green-dark">
            Yoga Companie
          </p>
          <p className="mt-2 text-sm text-muted">
            Opleidingsinstituut voor yoga. Opleidingen, trainingen en
            yogalessen.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink">Contact</p>
          <address className="mt-2 space-y-1 text-sm text-muted not-italic">
            {/* Contactgegevens komen vanaf Fase 2 uit het CMS. */}
            <p>info@yogacompanie.nl</p>
            <p>KvK — volgt</p>
          </address>
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
