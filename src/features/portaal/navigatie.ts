import {
  CalendarDays,
  GraduationCap,
  Home,
  Inbox,
  MessageSquare,
  User,
  type LucideIcon,
} from "lucide-react";

/**
 * De navigatie van het klantportaal (bouwprompt §9).
 *
 * Op de telefoon zijn het er vijf — Home, Opleidingen, Lessen, Berichten en
 * Profiel — en dat is ook het maximum dat §9 toestaat. Aanvragen staat op de
 * telefoon binnen het profiel, en in de zijbalk op grotere schermen.
 */

export type NavItem = {
  href: string;
  label: string;
  icoon: LucideIcon;
  /** Toont dit item ook op de mobiele bottom-navigatie? */
  mobiel: boolean;
  /** Sleutel van de teller die erbij hoort, indien van toepassing. */
  teller?: "ongelezen" | "openAanvragen";
};

export const PORTAAL_NAVIGATIE: NavItem[] = [
  { href: "/portaal", label: "Home", icoon: Home, mobiel: true },
  {
    href: "/portaal/opleidingen",
    label: "Opleidingen",
    icoon: GraduationCap,
    mobiel: true,
  },
  {
    href: "/portaal/lessen",
    label: "Lessen",
    icoon: CalendarDays,
    mobiel: true,
  },
  {
    href: "/portaal/berichten",
    label: "Berichten",
    icoon: MessageSquare,
    mobiel: true,
    teller: "ongelezen",
  },
  {
    href: "/portaal/aanvragen",
    label: "Aanvragen",
    icoon: Inbox,
    mobiel: false,
    teller: "openAanvragen",
  },
  { href: "/portaal/profiel", label: "Profiel", icoon: User, mobiel: true },
];

/** Is dit item de actieve pagina? `/portaal` alleen bij een exacte match. */
export function isActief(href: string, pad: string): boolean {
  if (href === "/portaal") return pad === "/portaal";
  return pad === href || pad.startsWith(`${href}/`);
}
