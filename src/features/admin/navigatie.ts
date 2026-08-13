import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  Inbox,
  LayoutDashboard,
  Mail,
  MessageSquare,
  ScrollText,
  Settings,
  Share2,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icoon: LucideIcon;
  /** Nog niet gebouwd; toont een uitleg in plaats van een leeg scherm. */
  komtLater?: string;
};

export type AdminNavGroep = { titel: string; items: AdminNavItem[] };

/** De indeling van de beheeromgeving (BOUWPROMPT §13). */
export const ADMIN_NAVIGATIE: AdminNavGroep[] = [
  {
    titel: "Overzicht",
    items: [{ href: "/admin", label: "Dashboard", icoon: LayoutDashboard }],
  },
  {
    titel: "Klanten",
    items: [
      { href: "/admin/klanten", label: "Klanten", icoon: Users },
      {
        href: "/admin/inschrijvingen",
        label: "Inschrijvingen",
        icoon: ClipboardList,
      },
      { href: "/admin/aanvragen", label: "Aanvragen", icoon: Inbox },
      { href: "/admin/berichten", label: "Berichten", icoon: MessageSquare },
      {
        href: "/admin/contactberichten",
        label: "Contactberichten",
        icoon: Mail,
      },
    ],
  },
  {
    titel: "Aanbod",
    items: [
      { href: "/admin/aanbod", label: "Opleidingen", icoon: BookOpen },
      { href: "/admin/lessen", label: "Lesrooster", icoon: CalendarDays },
    ],
  },
  {
    titel: "Website",
    items: [
      { href: "/admin/site-editor", label: "Site-editor", icoon: FileText },
      { href: "/admin/social", label: "Social", icoon: Share2 },
      { href: "/admin/mailings", label: "Mailings", icoon: Mail },
    ],
  },
  {
    titel: "Beheer",
    items: [
      { href: "/admin/instellingen", label: "Instellingen", icoon: Settings },
      { href: "/admin/logboek", label: "Logboek", icoon: ScrollText },
    ],
  },
];

export function isAdminActief(href: string, pad: string): boolean {
  if (href === "/admin") return pad === "/admin";
  return pad === href || pad.startsWith(`${href}/`);
}
