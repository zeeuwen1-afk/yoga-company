/**
 * Datum- en tijdweergave voor het rooster, in het Nederlands en in de
 * Nederlandse tijdzone. Zonder die vaste tijdzone zou een les van 19:00 op een
 * server in een andere zone als 18:00 in beeld komen.
 */

const TIJDZONE = "Europe/Amsterdam";

const dagFormatter = new Intl.DateTimeFormat("nl-NL", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: TIJDZONE,
});

const tijdFormatter = new Intl.DateTimeFormat("nl-NL", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TIJDZONE,
});

const dagSleutelFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: TIJDZONE,
});

/** "maandag 18 augustus" */
export function formateerDag(iso: string): string {
  return dagFormatter.format(new Date(iso));
}

/** "19:00" */
export function formateerTijd(iso: string): string {
  return tijdFormatter.format(new Date(iso));
}

/** "19:00 – 20:15" */
export function formateerTijdvak(iso: string, duurMinuten: number): string {
  const begin = new Date(iso);
  const eind = new Date(begin.getTime() + duurMinuten * 60_000);
  return `${tijdFormatter.format(begin)} – ${tijdFormatter.format(eind)}`;
}

/** Sleutel om lessen op dezelfde dag te groeperen: "2026-08-18". */
export function dagSleutel(iso: string): string {
  return dagSleutelFormatter.format(new Date(iso));
}

/** Groepeert een gesorteerd rooster per dag, met behoud van de volgorde. */
export function groepeerPerDag<T extends { begintOp: string }>(
  lessen: T[],
): { sleutel: string; label: string; lessen: T[] }[] {
  const dagen: { sleutel: string; label: string; lessen: T[] }[] = [];

  for (const les of lessen) {
    const sleutel = dagSleutel(les.begintOp);
    const laatste = dagen[dagen.length - 1];

    if (laatste?.sleutel === sleutel) {
      laatste.lessen.push(les);
    } else {
      dagen.push({ sleutel, label: formateerDag(les.begintOp), lessen: [les] });
    }
  }

  return dagen;
}
