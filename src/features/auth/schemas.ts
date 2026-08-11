import { z } from "zod";

/**
 * Gedeelde validatieschema's voor client en server (BOUWPROMPT §3).
 * De server valideert altijd opnieuw: clientvalidatie is comfort, geen
 * beveiliging (§17.3).
 */

export const MINIMALE_WACHTWOORDLENGTE = 12;

const email = z
  .string()
  .trim()
  .min(1, "Vul je e-mailadres in")
  .email("Dit lijkt geen geldig e-mailadres")
  .toLowerCase();

const wachtwoord = z
  .string()
  .min(
    MINIMALE_WACHTWOORDLENGTE,
    `Kies een wachtwoord van minstens ${MINIMALE_WACHTWOORDLENGTE} tekens`,
  )
  .max(72, "Een wachtwoord mag maximaal 72 tekens lang zijn");

const naam = (veld: string) =>
  z
    .string()
    .trim()
    .min(1, `Vul je ${veld} in`)
    .max(80, `Je ${veld} mag maximaal 80 tekens bevatten`);

export const registratieSchema = z.object({
  first_name: naam("voornaam"),
  last_name: naam("achternaam"),
  email,
  password: wachtwoord,
  // Honeypot: onzichtbaar veld dat alleen een bot invult (BOUWPROMPT §7).
  website: z.string().max(0, "Ongeldige invoer").optional(),
});

export const inlogSchema = z.object({
  email,
  password: z.string().min(1, "Vul je wachtwoord in"),
});

export const wachtwoordVergetenSchema = z.object({
  email,
  website: z.string().max(0, "Ongeldige invoer").optional(),
});

export const wachtwoordHerstellenSchema = z
  .object({
    password: wachtwoord,
    password_confirm: z.string(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "De twee wachtwoorden zijn niet gelijk",
    path: ["password_confirm"],
  });

export const totpVerificatieSchema = z.object({
  factor_id: z.string().min(1),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Vul de zes cijfers uit je authenticator-app in"),
});

export type RegistratieInvoer = z.infer<typeof registratieSchema>;
export type InlogInvoer = z.infer<typeof inlogSchema>;
export type WachtwoordVergetenInvoer = z.infer<typeof wachtwoordVergetenSchema>;
export type WachtwoordHerstellenInvoer = z.infer<
  typeof wachtwoordHerstellenSchema
>;
