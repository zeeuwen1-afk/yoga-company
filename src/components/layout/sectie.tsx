import { cn } from "@/lib/utils";

/** Paginabrede sectie met vaste marges en een keuze uit twee achtergronden. */
export function Sectie({
  achtergrond = "wit",
  lijnBoven = false,
  className,
  children,
}: {
  achtergrond?: "wit" | "creme" | "zand";
  lijnBoven?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "px-4 py-16 sm:px-6 sm:py-20",
        achtergrond === "creme" && "bg-cream",
        achtergrond === "zand" && "bg-sand-light",
        lijnBoven && "border-t border-line",
        className,
      )}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

/** Kop van een sectie, met optionele inleiding eronder. */
export function SectieKop({
  titel,
  inleiding,
  gecentreerd = false,
}: {
  titel: string;
  inleiding?: string;
  gecentreerd?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", gecentreerd && "mx-auto text-center")}>
      <h2 className="text-3xl sm:text-4xl">{titel}</h2>
      {inleiding ? (
        <p className="mt-4 text-lg text-muted">{inleiding}</p>
      ) : null}
    </div>
  );
}

/**
 * Richtext uit het CMS. De inhoud komt uit de site-editor en wordt daar
 * beperkt tot vet, cursief, koppen, lijsten en links (BOUWPROMPT §14); alleen
 * admins kunnen hem wijzigen.
 */
export function Richtext({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  if (!html) return null;
  return (
    <div
      className={cn(
        "space-y-4 [&_a]:underline [&_a:hover]:text-green [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-semibold",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
