import { z } from "zod";

/** Validatie van het contactformulier (BOUWPROMPT §8.5, §17.3). */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Vul je naam in")
    .max(80, "Je naam mag maximaal 80 tekens bevatten"),
  email: z
    .string()
    .trim()
    .min(1, "Vul je e-mailadres in")
    .email("Dit lijkt geen geldig e-mailadres")
    .toLowerCase(),
  phone: z
    .string()
    .trim()
    .max(30, "Dit telefoonnummer lijkt te lang")
    .optional()
    .or(z.literal("")),
  body: z
    .string()
    .trim()
    .min(10, "Schrijf iets meer, dan kunnen we je beter helpen")
    .max(3000, "Houd het bericht onder de 3000 tekens"),
  // Honeypot: alleen bots vullen dit in.
  website: z.string().max(0, "Ongeldige invoer").optional(),
});

export type ContactInvoer = z.infer<typeof contactSchema>;

/**
 * Een aanvraag vanaf een organisatiepagina.
 *
 * Bouwt voort op het contactformulier — dezelfde velden, dezelfde honeypot,
 * dezelfde begrenzing — met vier vragen erbij die bepalen wat het antwoord
 * kost. Zonder die vier wordt elke aanvraag een mailwisseling van vier
 * heen-en-weertjes voordat er een prijs genoemd kan worden.
 */
const kortVeld = (max: number, tekst: string) =>
  z.string().trim().max(max, tekst).optional().or(z.literal(""));

export const aanvraagSchema = contactSchema.extend({
  // Welke pagina de aanvraag stuurde; komt bovenaan het bericht te staan.
  onderwerp: z.string().trim().min(1).max(40),
  organisatie: z
    .string()
    .trim()
    .min(2, "Vul de naam van je organisatie in")
    .max(120, "Dit is wel erg lang"),
  omvang: kortVeld(80, "Houd het kort"),
  periode: kortVeld(80, "Houd het kort"),
  locatie: kortVeld(120, "Houd het kort"),
});

export type AanvraagInvoer = z.infer<typeof aanvraagSchema>;

/**
 * Een aanmelding voor een opleiding, module of blok.
 *
 * Bewust niet dezelfde route als inschrijven in het portaal. Dat vraagt een
 * account en een betaling, en dat is een drempel op het moment dat iemand net
 * besloten heeft dat hij mee wil doen. Dit formulier stuurt een bericht; de
 * betaling en de plek volgen in het antwoord.
 *
 * Het bericht is hier niet verplicht: wie zich aanmeldt voor een module heeft
 * meestal niets toe te lichten, en een verplicht veld zou hem dwingen "graag"
 * in te typen om verder te komen.
 */
export const aanmeldingSchema = contactSchema.omit({ body: true }).extend({
  /** Welke module, blok of de volledige opleiding. */
  variant: z
    .string()
    .trim()
    .min(2, "Kies waarvoor je je aanmeldt")
    .max(120, "Dit is wel erg lang"),
  /** Van welke pagina de aanmelding kwam; komt bovenaan het bericht te staan. */
  onderwerp: z.string().trim().min(1).max(60),
  body: z
    .string()
    .trim()
    .max(3000, "Houd het bericht onder de 3000 tekens")
    .optional()
    .or(z.literal("")),
});

export type AanmeldingInvoer = z.infer<typeof aanmeldingSchema>;
