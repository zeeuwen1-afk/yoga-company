import {
  GraduationCap,
  Home,
  Inbox,
  MessageSquare,
  User,
  type LucideIcon,
} from "lucide-react";

/**
 * De navigatie van het klantportaal (BOUWPROMPT §11).
 *
 * Op de telefoon zijn het er bewust vier: meer past niet comfortabel en meer
 * keuzes maken het schermpje onrustig. De vijfde ingang (Aanvragen) staat op
 * de telefoon binnen het profiel, en in de zijbalk op grotere schermen.
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
