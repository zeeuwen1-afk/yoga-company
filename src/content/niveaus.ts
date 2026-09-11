/**
 * De drie niveaus van de Yoga Company Academy.
 *
 * Elke opleiding bestaat uit modules van 50 uur. Wie er één afrondt staat op
 * Foundation, wie er twee samen doet (Blok A, Blok B, of twee losse modules
 * tegelijk) op Advanced, en wie een hele opleiding van 200 uur afrondt op
 * Professional. De badge op de site laat dat zien; welk niveau bij een cursus
 * hoort staat in beheer bij de cursus zelf.
 *
 * Bewust niet uit de uren afgeleid: vijf opleidingen hebben geen curriculum
 * met uren in de database, en een badge is een belofte die iemand met de hand
 * hoort te zetten, niet een rekensom.
 */

export const NIVEAUS = ["foundation", "advanced", "professional"] as const;

export type CertificaatNiveau = (typeof NIVEAUS)[number];

export type NiveauInfo = {
  niveau: CertificaatNiveau;
  /** De drie letters in het midden van de badge. */
  letters: string;
  uren: number;
  /** De regel onder de uren op de badge. */
  naam: string;
  /** Wat je krijgt: een certificaat, of bij Professional een diploma. */
  onderregel: string;
  /** Hoe het niveau heet in beheer en naast de badge. */
  label: string;
};

export const NIVEAU_INFO: Record<CertificaatNiveau, NiveauInfo> = {
  foundation: {
    niveau: "foundation",
    letters: "YAF",
    uren: 50,
    naam: "Academy Foundation",
    onderregel: "Certificaat",
    label: "Foundation · 50 uur",
  },
  advanced: {
    niveau: "advanced",
    letters: "YAA",
    uren: 100,
    naam: "Academy Advanced",
    onderregel: "Certificaat",
    label: "Advanced · 100 uur",
  },
  professional: {
    niveau: "professional",
    letters: "YAP",
    uren: 200,
    naam: "Academy Professional",
    onderregel: "Diploma",
    label: "Professional · 200 uur",
  },
};

/** De drie keurmerken zoals een opleider ze in het aanvraagformulier kiest. */
export const NIVEAU_KEUZES = NIVEAUS.map((niveau) => ({
  code: NIVEAU_INFO[niveau].letters,
  label: `${NIVEAU_INFO[niveau].letters} · ${NIVEAU_INFO[niveau].uren} uur`,
}));

/**
 * Leest een opgeslagen waarde uit. Alles wat geen niveau is wordt null, en
 * null betekent: geen badge. Een tikfout in de database mag nooit een kapotte
 * pagina opleveren.
 */
export function leesNiveau(waarde: unknown): CertificaatNiveau | null {
  if (typeof waarde !== "string") return null;
  const opgeschoond = waarde.trim().toLowerCase();
  return (NIVEAUS as readonly string[]).includes(opgeschoond)
    ? (opgeschoond as CertificaatNiveau)
    : null;
}
