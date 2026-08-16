import "server-only";

/**
 * Mollie, uitsluitend server-side (bouwprompt §3, §7.6).
 *
 * Geen SDK
 * --------
 * Dit is een handgeschreven client op de REST-API van Mollie in plaats van
 * `@mollie/api-client`. We gebruiken drie eindpunten — betaling aanmaken,
 * betaling opvragen, terugbetalen — en dat weegt niet op tegen een extra
 * afhankelijkheid met een eigen upgradepad (§11.4). De API-versie zit in de
 * URL (`/v2/`), dus hij kan niet onder ons vandaan veranderen.
 *
 * Wat wij bewaren
 * ---------------
 * Alleen het betaal-id, het bedrag en de status. Kaart- en rekeninggegevens
 * komen nooit bij ons binnen: de klant betaalt op de pagina van Mollie.
 */

const BASIS = "https://api.mollie.com/v2";

export type MollieBetaalStatus =
  | "open"
  | "canceled"
  | "pending"
  | "authorized"
  | "expired"
  | "failed"
  | "paid";

export type MollieBetaling = {
  id: string;
  status: MollieBetaalStatus;
  amount: { value: string; currency: string };
  metadata: Record<string, string> | null;
  amountRefunded?: { value: string; currency: string };
  _links?: { checkout?: { href: string } };
};

export class MollieFout extends Error {
  constructor(
    message: string,
    readonly statuscode: number,
  ) {
    super(message);
    this.name = "MollieFout";
  }
}

function sleutel(): string {
  const waarde = process.env.MOLLIE_API_KEY?.trim();
  if (!waarde) {
    throw new MollieFout(
      "MOLLIE_API_KEY ontbreekt. Zie docs/payments.md.",
      500,
    );
  }
  return waarde;
}

/**
 * Is de betaalkoppeling ingericht?
 *
 * Eén sleutel plakken is genoeg om betalen aan te zetten. Wie hem er wél in
 * heeft maar betalen tóch dicht wil houden, zet `PAYMENTS_ENABLED=false`.
 */
export function betalenIngericht(): boolean {
  if (process.env.PAYMENTS_ENABLED?.toLowerCase() === "false") return false;
  return Boolean(process.env.MOLLIE_API_KEY?.trim());
}

/**
 * Test- of live-modus, af te lezen aan de sleutel zelf. Mollie geeft sleutels
 * uit met het voorvoegsel `test_` of `live_`, dus er valt hier niets te raden
 * en niets verkeerd in te stellen.
 */
export function betaalModus(): "test" | "live" | "onbekend" | null {
  const waarde = process.env.MOLLIE_API_KEY?.trim();
  if (!waarde) return null;
  if (waarde.startsWith("test_")) return "test";
  if (waarde.startsWith("live_")) return "live";
  return "onbekend";
}

async function verzoek<T>(
  pad: string,
  opties: {
    methode?: "GET" | "POST";
    body?: unknown;
    idempotentie?: string;
  } = {},
): Promise<T> {
  const koppen: Record<string, string> = {
    Authorization: `Bearer ${sleutel()}`,
    "Content-Type": "application/json",
  };

  // Twee keer klikken mag nooit twee betalingen opleveren. Mollie herkent deze
  // sleutel en geeft de eerste betaling terug in plaats van een tweede te maken.
  if (opties.idempotentie) {
    koppen["Idempotency-Key"] = opties.idempotentie;
  }

  const antwoord = await fetch(`${BASIS}${pad}`, {
    method: opties.methode ?? "GET",
    headers: koppen,
    body: opties.body ? JSON.stringify(opties.body) : undefined,
    // Betaalgegevens nooit uit een cache serveren.
    cache: "no-store",
  });

  if (!antwoord.ok) {
    // De tekst van Mollie is Engels en technisch; die gaat naar het serverlog,
    // niet naar de klant.
    const tekst = await antwoord.text();
    throw new MollieFout(
      `Mollie gaf ${antwoord.status}: ${tekst.slice(0, 300)}`,
      antwoord.status,
    );
  }

  return (await antwoord.json()) as T;
}

/** Centen naar het formaat dat Mollie verwacht: "27.95". */
export function naarMollieBedrag(centen: number): string {
  return (centen / 100).toFixed(2);
}

/** En terug, voor wat er uit een webhook komt. */
export function naarCenten(waarde: string): number {
  return Math.round(Number.parseFloat(waarde) * 100);
}

export async function maakBetaling(invoer: {
  bedragCenten: number;
  valuta: string;
  omschrijving: string;
  retourUrl: string;
  webhookUrl: string;
  metadata: Record<string, string>;
  /** Voorkomt een dubbele betaling bij dubbelklikken. */
  idempotentieSleutel: string;
}): Promise<MollieBetaling> {
  return verzoek<MollieBetaling>("/payments", {
    methode: "POST",
    idempotentie: invoer.idempotentieSleutel,
    body: {
      amount: {
        currency: invoer.valuta.toUpperCase(),
        value: naarMollieBedrag(invoer.bedragCenten),
      },
      description: invoer.omschrijving,
      redirectUrl: invoer.retourUrl,
      webhookUrl: invoer.webhookUrl,
      metadata: invoer.metadata,
      locale: "nl_NL",
    },
  });
}

/**
 * De status van een betaling ophalen.
 *
 * Dit is geen extraatje maar de kern van de webhook: Mollie stuurt in de
 * webhook alléén een id mee, geen status en geen handtekening. De enige
 * betrouwbare bron is deze aanroep. Zie docs/payments.md.
 */
export async function haalBetaling(id: string): Promise<MollieBetaling> {
  return verzoek<MollieBetaling>(`/payments/${encodeURIComponent(id)}`);
}

export async function maakTerugbetaling(invoer: {
  betalingId: string;
  bedragCenten: number;
  valuta: string;
  omschrijving: string;
}): Promise<{ id: string }> {
  return verzoek<{ id: string }>(
    `/payments/${encodeURIComponent(invoer.betalingId)}/refunds`,
    {
      methode: "POST",
      body: {
        amount: {
          currency: invoer.valuta.toUpperCase(),
          value: naarMollieBedrag(invoer.bedragCenten),
        },
        description: invoer.omschrijving,
      },
    },
  );
}
