import "server-only";

/**
 * Eenvoudige schuivende-venster-begrenzing per sleutel (BOUWPROMPT §7).
 *
 * Bewust in het geheugen van de server: dat is genoeg om geautomatiseerd
 * misbruik van de publieke formulieren af te remmen, zonder afhankelijkheid van
 * een externe dienst. Draait de applicatie op meerdere instanties, dan telt
 * elke instantie apart — voor dit doel acceptabel. Wordt dit ooit een echte
 * beveiligingsmaatregel in plaats van een rem, dan hoort er gedeelde opslag
 * onder (bijvoorbeeld Upstash Redis).
 *
 * Er worden geen IP-adressen bewaard: de sleutel is gehasht en verdwijnt zodra
 * het venster verloopt (§17.11).
 */

type Venster = { tijden: number[] };

const vensters = new Map<string, Venster>();
const MAX_SLEUTELS = 10_000;

function hash(waarde: string): string {
  // Geen cryptografische hash nodig; dit voorkomt alleen dat er leesbare
  // IP-adressen in het geheugen rondslingeren.
  let getal = 0;
  for (let i = 0; i < waarde.length; i += 1) {
    getal = (getal * 31 + waarde.charCodeAt(i)) | 0;
  }
  return String(getal);
}

export type Begrenzing = {
  toegestaan: boolean;
  /** Seconden tot het volgende verzoek weer mag. */
  wachtSeconden: number;
};

export function begrens(
  sleutel: string,
  { maximum, vensterSeconden }: { maximum: number; vensterSeconden: number },
): Begrenzing {
  const nu = Date.now();
  const grens = nu - vensterSeconden * 1000;
  const id = hash(sleutel);

  // Simpele opruiming: bij te veel sleutels beginnen we opnieuw. Dat kan een
  // enkele bezoeker een extra poging opleveren en voorkomt geheugengroei.
  if (vensters.size > MAX_SLEUTELS) vensters.clear();

  const venster = vensters.get(id) ?? { tijden: [] };
  const recent = venster.tijden.filter((tijd) => tijd > grens);

  if (recent.length >= maximum) {
    const oudste = Math.min(...recent);
    vensters.set(id, { tijden: recent });
    return {
      toegestaan: false,
      wachtSeconden: Math.max(
        1,
        Math.ceil((oudste + vensterSeconden * 1000 - nu) / 1000),
      ),
    };
  }

  recent.push(nu);
  vensters.set(id, { tijden: recent });
  return { toegestaan: true, wachtSeconden: 0 };
}

/** Herkenning van de bezoeker voor de begrenzing, uit de proxy-headers. */
export function bezoekerSleutel(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "onbekend"
  );
}
