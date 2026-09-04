import { Alineas } from "@/components/ui/alineas";
import { cn } from "@/lib/utils";

/**
 * Paginabrede sectie met vaste marges en een keuze uit twee achtergronden.
 *
 * Met een `id` is de sectie aan te linken vanuit een knop: `/lessen#rooster`
 * springt naar de sectie met dat id. De namen staan in `SECTIES` hieronder,
 * zodat de site-editor kan laten zien wat er te kiezen valt; verzin er dus geen
 * losse bij zonder ze daar te noemen.
 */
export function Sectie({
  id,
  sectie,
  achtergrond = "wit",
  lijnBoven = false,
  className,
  children,
}: {
  id?: string;
  /**
   * Bij welke groep blokken hoort deze sectie? Alleen een naamkaartje: in de
   * voorvertoning van de site-editor kun je erop klikken om naar de bijbehorende
   * velden te springen. Op de gewone site doet het niets.
   */
  sectie?: string;
  achtergrond?: "wit" | "creme" | "zand";
  lijnBoven?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      data-sectie={sectie}
      // Zonder deze ruimte verdwijnt de kop van een aangelinkte sectie achter
      // de menubalk, die blijft staan bij het scrollen.
      className={cn(
        id && "scroll-mt-24",
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
        <div className="mt-4">
          <Alineas tekst={inleiding} className="text-lg text-muted" />
        </div>
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
