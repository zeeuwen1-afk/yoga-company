import { cn } from "@/lib/utils";

/**
 * Een tekst uit de site-editor, met de witregels erin bewaard.
 *
 * HTML plakt losse regels aan elkaar: wie in een tekstvak op enter drukt, ziet
 * op de site één lange lap tekst terugkomen. Dat was verwarrend, want in de
 * editor stonden de alinea's er wél. Hier wordt op een witregel gesplitst, en
 * elk stuk krijgt zijn eigen `<p>`.
 *
 * Bewust geen HTML in het tekstvak toestaan als oplossing. Dan moet iemand
 * `<p>`-tags gaan typen om een witregel te krijgen, en één vergeten sluittag
 * zet de rest van de pagina scheef. Een lege regel is wat mensen intypen als ze
 * een alinea bedoelen; dat is dus wat het moet betekenen.
 *
 * Een enkele regelovergang blijft een regelovergang binnen dezelfde alinea, zodat
 * een opsomming of een adres niet uit elkaar valt.
 */
export function Alineas({
  tekst,
  className,
}: {
  tekst: string;
  /** Komt op elke alinea. De onderlinge ruimte regelt dit component zelf. */
  className?: string;
}) {
  const alineas = tekst
    .split(/\n\s*\n/)
    .map((stuk) => stuk.trim())
    .filter(Boolean);

  if (alineas.length === 0) return null;

  return (
    <>
      {alineas.map((alinea, index) => (
        <p
          key={index}
          className={cn(
            // Enkele regelovergangen binnen een alinea blijven staan.
            "whitespace-pre-line",
            index > 0 && "mt-4",
            className,
          )}
        >
          {alinea}
        </p>
      ))}
    </>
  );
}
