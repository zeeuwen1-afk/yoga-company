import { z } from "zod";

/**
 * Environment variables worden gevalideerd op het moment dat ze nodig zijn,
 * niet bij het laden van de module. Zo kan de applicatie gebouwd worden in een
 * omgeving zonder secrets (bijvoorbeeld CI) en falen ontbrekende waarden alsnog
 * met een duidelijke melding zodra ze echt worden gebruikt.
 */

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(
    "NEXT_PUBLIC_SUPABASE_URL is geen geldige URL",
  ),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY ontbreekt"),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY ontbreekt"),
});

function parse<T extends z.ZodType>(schema: T, values: unknown): z.infer<T> {
  const result = schema.safeParse(values);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.message}`)
      .join("\n");
    throw new Error(
      `Ontbrekende of ongeldige environment variables:\n${details}\n` +
        "Kopieer .env.example naar .env.local en vul de waarden in.",
    );
  }
  return result.data;
}

let publicCache: z.infer<typeof publicSchema> | undefined;
let serverCache: z.infer<typeof serverSchema> | undefined;

/** Waarden die ook in de browser beschikbaar zijn. */
export function publicEnv() {
  publicCache ??= parse(publicSchema, {
    // Next vervangt deze verwijzingen bij het bouwen; daarom voluit schrijven.
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });
  return publicCache;
}

/** Waarden die de browser nooit mag zien. */
export function serverEnv() {
  if (typeof window !== "undefined") {
    throw new Error(
      "serverEnv() mag niet vanuit de browser worden aangeroepen",
    );
  }
  serverCache ??= parse(serverSchema, {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
  return serverCache;
}
