import Link from "next/link";

import { cn } from "@/lib/utils";
import type { EnrollmentStatus, RequestStatus } from "@/lib/supabase/types";

/** Kop van een beheerscherm, met optionele actie rechts. */
export function AdminKop({
  titel,
  toelichting,
  actie,
  kruimel,
}: {
  titel: string;
  toelichting?: string;
  actie?: React.ReactNode;
  kruimel?: { href: string; label: string };
}) {
  return (
    <div className="mb-6">
      {kruimel ? (
        <nav aria-label="Kruimelpad" className="mb-2 text-sm text-muted">
          <Link href={kruimel.href} className="underline hover:text-green">
            {kruimel.label}
          </Link>
        </nav>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl">{titel}</h1>
          {toelichting ? (
            <p className="mt-1 text-muted">{toelichting}</p>
          ) : null}
        </div>
        {actie}
      </div>
    </div>
  );
}

/** Blok met witte achtergrond, de standaardcontainer in het beheer. */
export function Paneel({
  titel,
  actie,
  className,
  children,
}: {
  titel?: string;
  actie?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-[var(--radius-card)] border border-line bg-white",
        className,
      )}
    >
      {titel ? (
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 className="text-lg">{titel}</h2>
          {actie}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/** Kerncijfer op het dashboard. */
export function Kerncijfer({
  label,
  waarde,
  toelichting,
  href,
}: {
  label: string;
  waarde: string | number;
  toelichting?: string;
  href?: string;
}) {
  const inhoud = (
    <>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-serif text-3xl font-semibold text-green-dark">
        {waarde}
      </p>
      {toelichting ? (
        <p className="mt-1 text-sm text-muted">{toelichting}</p>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-[var(--radius-card)] border border-line bg-white p-5 transition-colors hover:border-green/40"
      >
        {inhoud}
      </Link>
    );
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-white p-5">
      {inhoud}
    </div>
  );
}

const ENROLLMENT_LABEL: Record<EnrollmentStatus, string> = {
  in_afwachting: "In afwachting",
  betaald: "Betaald",
  geannuleerd: "Geannuleerd",
  afgerond: "Afgerond",
};

/** Statuslabel voor een inschrijving. */
export function StatusPil({ status }: { status: EnrollmentStatus }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap",
        status === "betaald" && "bg-success/10 text-success",
        status === "afgerond" && "bg-sand text-green-dark",
        status === "in_afwachting" && "bg-sand-light text-muted",
        status === "geannuleerd" && "bg-error/10 text-error",
      )}
    >
      {ENROLLMENT_LABEL[status]}
    </span>
  );
}

const AANVRAAG_LABEL: Record<RequestStatus, string> = {
  open: "Open",
  in_behandeling: "In behandeling",
  afgerond: "Afgerond",
};

export function AanvraagPil({ status }: { status: RequestStatus }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap",
        status === "afgerond" && "bg-success/10 text-success",
        status === "in_behandeling" && "bg-sand text-green-dark",
        status === "open" && "bg-error/10 text-error",
      )}
    >
      {AANVRAAG_LABEL[status]}
    </span>
  );
}

/** Melding wanneer een lijst leeg is. */
export function LegeLijst({ children }: { children: React.ReactNode }) {
  return <p className="px-5 py-8 text-center text-muted">{children}</p>;
}

export function datumKort(iso: string | null) {
  if (!iso) return "n.v.t.";
  return new Date(iso).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function datumTijd(iso: string | null) {
  if (!iso) return "n.v.t.";
  return new Date(iso).toLocaleString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
