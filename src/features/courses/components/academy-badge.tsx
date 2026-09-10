import { useId } from "react";

import { type CertificaatNiveau, NIVEAU_INFO } from "@/content/niveaus";
import { cn } from "@/lib/utils";

/**
 * De certificaatbadge van de Yoga Company Academy.
 *
 * Een tekening in de code en geen foto, om drie redenen. De site-editor
 * accepteert geen SVG, dus als foto zou hij een png worden die op een groot
 * scherm rafelt. De tekst op de badge hoort niet per pagina aanpasbaar te
 * zijn: een certificaatmerk dat op de ene pagina anders heet dan op de andere
 * is geen merk meer. En zo gebruikt hij het lettertype en de kleuren van de
 * site zelf; als de huisstijl verandert, verandert de badge mee.
 *
 * De kleuren komen rechtstreeks uit het palet en niet uit de omgeving: de
 * badge heeft zijn eigen ondergrond en ziet er daardoor op een petrol vlak
 * hetzelfde uit als op een licht vlak.
 */

const LICHT = {
  rand: "var(--color-paper-warm)",
  lijn: "var(--color-petrol)",
  band: "var(--color-sand)",
  binnen: "var(--color-paper-warm)",
  ring: "var(--color-petrol)",
  tekst: "var(--color-petrol)",
  klein: "var(--color-muted-dark)",
};

/** Professional is de omgekeerde: donker met lichte letters. */
const DONKER = {
  rand: "var(--color-petrol-deep)",
  lijn: "var(--color-petrol-deep)",
  band: "var(--color-sand)",
  binnen: "var(--color-petrol)",
  ring: "var(--color-petrol-deep)",
  tekst: "var(--color-paper-warm)",
  klein: "var(--color-sand)",
};

export function AcademyBadge({
  niveau,
  className,
}: {
  niveau: CertificaatNiveau;
  /** Bepaalt de maat; de badge is altijd rond en schaalt mee. */
  className?: string;
}) {
  // Twee badges op één pagina hebben elk hun eigen boog nodig om de ringtekst
  // op te leggen; met één gedeeld id zou de tweede de boog van de eerste
  // pakken. React's id bevat tekens die in een ankerverwijzing niet mogen.
  const id = useId().replace(/[^a-zA-Z0-9-]/g, "");
  const boven = `badge-${id}-boven`;
  const onder = `badge-${id}-onder`;

  const info = NIVEAU_INFO[niveau];
  const kleur = niveau === "professional" ? DONKER : LICHT;
  const naam = info.naam.replace(/^Academy /, "");

  return (
    <svg
      viewBox="0 0 400 400"
      role="img"
      aria-label={`Yoga Company Academy ${naam}, ${info.uren} uur, ${info.onderregel.toLowerCase()}`}
      data-niveau={niveau}
      className={cn("h-auto", className)}
      style={{ fontFamily: "var(--font-serif)" }}
    >
      <defs>
        <path id={boven} d="M 44 200 A 156 156 0 0 1 356 200" />
        <path id={onder} d="M 44 200 A 156 156 0 0 0 356 200" />
      </defs>
      <circle
        cx="200"
        cy="200"
        r="192"
        fill={kleur.rand}
        stroke={kleur.lijn}
        strokeWidth="4"
      />
      <circle cx="200" cy="200" r="178" fill={kleur.band} />
      <circle
        cx="200"
        cy="200"
        r="134"
        fill={kleur.binnen}
        stroke={kleur.lijn}
        strokeWidth="1.5"
      />
      <circle
        cx="200"
        cy="200"
        r="126"
        fill="none"
        stroke={kleur.band}
        strokeWidth="1.5"
        strokeDasharray="3 5"
      />
      <text fontSize="20" fontWeight="700" letterSpacing="4" fill={kleur.ring}>
        <textPath href={`#${boven}`} startOffset="50%" textAnchor="middle">
          GECERTIFICEERDE OPLEIDING
        </textPath>
      </text>
      <text fontSize="20" fontWeight="700" letterSpacing="4" fill={kleur.ring}>
        <textPath href={`#${onder}`} startOffset="50%" textAnchor="middle">
          YOGA COMPANY ACADEMY
        </textPath>
      </text>
      <text
        x="200"
        y="196"
        textAnchor="middle"
        fontSize="80"
        fontWeight="700"
        letterSpacing="4"
        fill={kleur.tekst}
      >
        {info.letters}
      </text>
      <text
        x="200"
        y="234"
        textAnchor="middle"
        fontSize="26"
        fontWeight="600"
        letterSpacing="5"
        fill={kleur.tekst}
      >
        {info.uren} UUR
      </text>
      <text
        x="200"
        y="260"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        letterSpacing="0.8"
        fill={kleur.klein}
      >
        {info.naam.toUpperCase()}
      </text>
      <text
        x="200"
        y="280"
        textAnchor="middle"
        fontSize="11"
        letterSpacing="2"
        fill={kleur.klein}
      >
        {info.onderregel.toUpperCase()}
      </text>
      {/* Het yin-yangteken uit het logo, klein onderaan. */}
      <g transform="translate(200,308)">
        <circle r="10" fill="none" stroke={kleur.tekst} strokeWidth="2" />
        <path
          d="M 0 -10 A 5 5 0 0 1 0 0 A 5 5 0 0 0 0 10"
          fill="none"
          stroke={kleur.tekst}
          strokeWidth="2"
        />
        <circle cx="0" cy="-5" r="1.7" fill={kleur.tekst} />
        <circle cx="0" cy="5" r="1.7" fill="var(--color-accent)" />
      </g>
    </svg>
  );
}
