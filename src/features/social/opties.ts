/**
 * Keuzes in de socialmediatool (BOUWPROMPT §15).
 *
 * Bewust zonder `server-only`: het beheerscherm is een client component en moet
 * dezelfde lijst tonen als de server verwacht. Zou dit in de promptmodule
 * staan, dan trok het formulier de systeeminstructie mee de browser in.
 */

export type SocialDoel = "informeren" | "inschrijvingen" | "inspiratie";
export type SocialPlatform = "instagram" | "facebook" | "beide";

export const DOELEN: { waarde: SocialDoel; label: string; uitleg: string }[] = [
  {
    waarde: "informeren",
    label: "Informeren",
    uitleg: "Vertellen wat er is, zonder aan te sporen.",
  },
  {
    waarde: "inschrijvingen",
    label: "Inschrijvingen",
    uitleg: "Uitnodigen om zich aan te melden.",
  },
  {
    waarde: "inspiratie",
    label: "Inspiratie",
    uitleg: "Een gedachte of beeld meegeven, zonder aanbod.",
  },
];

export const PLATFORMS: { waarde: SocialPlatform; label: string }[] = [
  { waarde: "instagram", label: "Instagram" },
  { waarde: "facebook", label: "Facebook" },
  { waarde: "beide", label: "Beide" },
];

export const DOEL_LABEL: Record<SocialDoel, string> = {
  informeren: "Informeren",
  inschrijvingen: "Inschrijvingen",
  inspiratie: "Inspiratie",
};

export const PLATFORM_LABEL: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  beide: "Instagram en Facebook",
};
