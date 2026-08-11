import "server-only";

/**
 * Verzenden van e-mail.
 *
 * In Fase 3 wordt dit ingevuld met Resend en React Email-templates
 * (BOUWPROMPT §10). Tot die tijd is dit een bewuste no-op: het platform mag
 * niet omvallen omdat de mailkoppeling er nog niet is, en een contactbericht
 * dat in de database staat is nooit verloren — de admin ziet het in Fase 5 ook
 * in het overzicht.
 *
 * Er wordt met opzet geen inhoud gelogd: geen persoonsgegevens in platte logs
 * (§17.11).
 */

export type Bericht = {
  aan: string;
  onderwerp: string;
  tekst: string;
};

export async function verstuurMail(bericht: Bericht): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.info(
      `[mail] Niet verstuurd: RESEND_API_KEY ontbreekt (onderwerp: ${bericht.onderwerp})`,
    );
    return false;
  }

  // Fase 3: Resend-aanroep met React Email-template.
  console.info(`[mail] Nog niet geïmplementeerd (Fase 3)`);
  return false;
}

/** Het adres waarop Yoga Companie notificaties ontvangt. */
export function adminAdres(): string {
  return process.env.SEED_ADMIN_EMAIL ?? "info@yogacompanie.nl";
}
