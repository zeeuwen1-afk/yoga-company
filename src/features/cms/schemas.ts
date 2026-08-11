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
