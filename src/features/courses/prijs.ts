/**
 * Bedragen worden in centen opgeslagen en pas bij het tonen omgezet, zodat er
 * nooit met kommagetallen gerekend wordt (BOUWPROMPT §6).
 */
export function formateerPrijs(centen: number, valuta = "eur"): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: valuta.toUpperCase(),
    // Hele bedragen tonen we zonder centen: € 2.995 leest rustiger dan € 2.995,00
    minimumFractionDigits: centen % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(centen / 100);
}
