import "server-only";

import { render } from "@react-email/render";
import { Resend } from "resend";

/**
 * Verzenden van e-mail via Resend (BOUWPROMPT §10).
 *
 * Twee uitgangspunten:
 *
 *  - **Nooit blokkerend.** Een mail die niet weggaat mag geen betaling of
 *    inschrijving laten mislukken. Functies hier gooien niet; ze melden of het
 *    gelukt is en laten de aanroeper doorgaan.
 *  - **Geen persoonsgegevens in logs** (§17.11). We loggen het onderwerp en de
 *    uitkomst, nooit het adres of de inhoud.
 *
 * Ontbreekt `RESEND_API_KEY`, dan wordt er niets verstuurd en zegt de functie
 * dat eerlijk. Zo werkt de applicatie ook lokaal en in CI.
 */

let client: Resend | null = null;

function resend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  client ??= new Resend(process.env.RESEND_API_KEY);
  return client;
}

export function mailIngericht(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

function afzender(): string {
  return process.env.EMAIL_FROM ?? "Yoga Companie <info@yogacompanie.nl>";
}

/** Het adres waarop Yoga Companie notificaties ontvangt. */
export function adminAdres(): string {
  return process.env.SEED_ADMIN_EMAIL ?? "info@yogacompanie.nl";
}

export type MailResultaat = {
  verstuurd: boolean;
  reden?: string;
};

/**
 * Verstuurt een React-template als e-mail. Er gaat altijd een tekstversie mee:
 * niet elke ontvanger leest HTML, en spamfilters kijken ernaar.
 */
export async function verstuurMail({
  aan,
  onderwerp,
  template,
}: {
  aan: string | string[];
  onderwerp: string;
  template: React.ReactElement;
}): Promise<MailResultaat> {
  const dienst = resend();

  if (!dienst) {
    console.info(
      `[mail] niet verstuurd, RESEND_API_KEY ontbreekt: ${onderwerp}`,
    );
    return { verstuurd: false, reden: "mailkoppeling niet ingericht" };
  }

  try {
    const [html, tekst] = await Promise.all([
      render(template),
      render(template, { plainText: true }),
    ]);

    const { error } = await dienst.emails.send({
      from: afzender(),
      to: Array.isArray(aan) ? aan : [aan],
      subject: onderwerp,
      html,
      text: tekst,
    });

    if (error) {
      console.error(`[mail] verzenden mislukt: ${onderwerp} — ${error.name}`);
      return { verstuurd: false, reden: error.message };
    }

    console.info(`[mail] verstuurd: ${onderwerp}`);
    return { verstuurd: true };
  } catch (fout) {
    console.error(
      `[mail] verzenden mislukt: ${onderwerp} — ${
        fout instanceof Error ? fout.message : "onbekende fout"
      }`,
    );
    return {
      verstuurd: false,
      reden: fout instanceof Error ? fout.message : "onbekende fout",
    };
  }
}
