import type { EnrollmentStatus } from "@/lib/supabase/types";

/**
 * Welke inschrijvingsstatussen toegang geven tot digitale content
 * (BOUWPROMPT §12).
 *
 * Dit is de applicatiekant van dezelfde regel die `has_course_access()` in de
 * database afdwingt. Beide moeten hetzelfde zeggen; de database is de
 * beslissende. Deze functie is er om schermen te kunnen tekenen zonder eerst
 * te hoeven vragen wat de database ervan vindt.
 *
 * `afgerond` geeft bewust nog toegang: wie een opleiding heeft afgerond mag
 * het lesmateriaal blijven raadplegen.
 */
export const TOEGANG_STATUSSEN = ["betaald", "afgerond"] as const;

export function geeftToegang(status: EnrollmentStatus): boolean {
  return (TOEGANG_STATUSSEN as readonly string[]).includes(status);
}
