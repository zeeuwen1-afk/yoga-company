import Link from "next/link";

import { isExtern, veiligeLink } from "@/lib/knoplink";
import { cn } from "@/lib/utils";

/**
 * Een knop waarvan zowel de tekst als de bestemming uit de site-editor komt.
 *
 * Tot nu toe was alleen de tekst bewerkbaar en stond het adres vast in de code.
 * Dat betekende dat een knop "Bekijk de workshops" kon gaan heten terwijl hij
 * nog steeds naar het rooster wees, zonder dat iemand dat merkte tot een
 * bezoeker verkeerd uitkwam.
 *
 * De `terugval` is het adres dat er altijd al stond. Laat de beheerder het veld
 * leeg, of vult hij iets in dat geen adres is, dan doet de knop precies wat hij
 * eerst deed. Een lege of foute invoer mag een pagina nooit onbruikbaar maken.
 *
 * Zonder tekst verdwijnt de knop. Dat is de manier om er een weg te halen:
 * het tekstveld leegmaken.
 */
export function CmsKnop({
  tekst,
  link,
  terugval,
  variant = "vol",
  className,
}: {
  tekst: string;
  /** Wat er in de editor is ingevuld. Leeg betekent: gebruik de terugval. */
  link: string;
  /** Waar de knop heen ging voordat hij bewerkbaar werd. */
  terugval: string;
  variant?: "vol" | "omlijnd";
  className?: string;
}) {
  if (!tekst.trim()) return null;

  const bestemming = veiligeLink(link, terugval);
  const naarBuiten = isExtern(bestemming);

  const opmaak = cn(
    "inline-flex h-12 items-center rounded-lg px-7 font-semibold transition-colors",
    variant === "vol"
      ? "bg-primary text-primary-foreground hover:bg-accent-light"
      : "border border-line hover:bg-hover",
    className,
  );

  // Een adres buiten de site gaat niet door de router van Next: dat is een
  // gewone link, en hij opent in een nieuw tabblad zodat de bezoeker onze site
  // niet kwijtraakt.
  if (naarBuiten) {
    return (
      <a
        href={bestemming}
        className={opmaak}
        target="_blank"
        rel="noopener noreferrer"
      >
        {tekst}
      </a>
    );
  }

  return (
    <Link href={bestemming} className={opmaak}>
      {tekst}
    </Link>
  );
}

/**
 * Dezelfde bewerkbare bestemming, maar dan als tekstlink in plaats van een
 * knop. Voor de "bekijk alles"-verwijzingen onder een lijstje: die horen geen
 * tweede volle knop naast de echte oproep te zijn.
 */
export function CmsTekstLink({
  tekst,
  link,
  terugval,
  className,
}: {
  tekst: string;
  link: string;
  terugval: string;
  className?: string;
}) {
  if (!tekst.trim()) return null;

  const bestemming = veiligeLink(link, terugval);
  const opmaak = cn(
    "inline-flex font-semibold underline underline-offset-4 hover:no-underline",
    className,
  );

  if (isExtern(bestemming)) {
    return (
      <a
        href={bestemming}
        className={opmaak}
        target="_blank"
        rel="noopener noreferrer"
      >
        {tekst}
      </a>
    );
  }

  return (
    <Link href={bestemming} className={opmaak}>
      {tekst}
    </Link>
  );
}
