"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input, Label, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  bewaarGezondheid,
  maakGespreksverslag,
  verwijderGespreksverslag,
  type DossierResultaat,
} from "../server/dossier-acties";

const BEGIN: DossierResultaat = { status: "idle" };

function Melding({ resultaat }: { resultaat: DossierResultaat }) {
  if (resultaat.status === "idle") return null;
  return (
    <FormMessage variant={resultaat.status === "gelukt" ? "gelukt" : "fout"}>
      {resultaat.bericht}
    </FormMessage>
  );
}

/**
 * Gezondheidsgegevens (bouwprompt §8.3).
 *
 * Ze staan achter een knop en niet gewoon op de pagina. Dat is geen omslag:
 * elke inzage wordt gelogd, en dan hoort er ook een bewuste handeling tegenover
 * te staan in plaats van "het stond er nu eenmaal".
 */
export function Gezondheid({
  profileId,
  bestaand,
}: {
  profileId: string;
  bestaand: {
    tekst: string;
    toestemmingOp: string;
    toestemmingNotitie: string | null;
  } | null;
}) {
  const [resultaat, actie] = useActionState(bewaarGezondheid, BEGIN);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted">
          {bestaand
            ? "Er zijn gezondheidsgegevens vastgelegd."
            : "Er zijn nog geen gezondheidsgegevens vastgelegd."}{" "}
          Dit zijn bijzondere persoonsgegevens; elke keer dat je ze opent wordt
          dat vastgelegd in het logboek.
        </p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setOpen(true)}
        >
          {bestaand ? "Inzien en bewerken" : "Gegevens vastleggen"}
        </Button>
      </div>
    );
  }

  return (
    <form action={actie} className="space-y-4">
      <input type="hidden" name="profile_id" value={profileId} />

      <div>
        <Label htmlFor="gez-body">Blessures, klachten, aandachtspunten</Label>
        <Textarea
          id="gez-body"
          name="body"
          rows={5}
          maxLength={4000}
          defaultValue={bestaand?.tekst ?? ""}
          placeholder="Bijvoorbeeld: lage rugklachten sinds 2024, voorzichtig met voorwaartse buigingen."
        />
        <p className="mt-1.5 text-sm text-muted">
          Leegmaken en opslaan verwijdert de gegevens.
        </p>
      </div>

      <div>
        <Label htmlFor="gez-notitie">
          Hoe is de toestemming gegeven? (optioneel)
        </Label>
        <Input
          id="gez-notitie"
          name="consent_note"
          maxLength={300}
          defaultValue={bestaand?.toestemmingNotitie ?? ""}
          placeholder="Bijvoorbeeld: mondeling bij de intake op 3 maart"
        />
      </div>

      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          name="toestemming"
          className="mt-1 size-5 accent-[var(--color-green)]"
        />
        <span className="text-sm">
          De klant heeft hier <strong>uitdrukkelijk toestemming</strong> voor
          gegeven.
          <span className="block text-muted">
            Zonder toestemming mag dit niet worden vastgelegd. Bij het
            verwijderen hoef je niets aan te vinken.
          </span>
        </span>
      </label>

      <Melding resultaat={resultaat} />

      <div className="flex flex-wrap gap-3">
        <SubmitButton size="sm" bezigLabel="Opslaan…">
          Opslaan
        </SubmitButton>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(false)}
        >
          Sluiten
        </Button>
      </div>
    </form>
  );
}

/** Een notitie of een verslag toevoegen. */
export function NotitieOfVerslag({
  profileId,
  actie,
}: {
  profileId: string;
  actie: (
    vorige: DossierResultaat,
    formData: FormData,
  ) => Promise<DossierResultaat>;
}) {
  const [resultaat, verstuur] = useActionState(actie, BEGIN);
  const [soort, setSoort] = useState<"notitie" | "verslag">("notitie");

  return (
    <form action={verstuur} className="space-y-3">
      <input type="hidden" name="profile_id" value={profileId} />
      <input type="hidden" name="kind" value={soort} />

      <div className="flex gap-2">
        {(["notitie", "verslag"] as const).map((optie) => (
          <button
            key={optie}
            type="button"
            onClick={() => setSoort(optie)}
            aria-pressed={soort === optie}
            className={
              soort === optie
                ? "rounded-lg border border-primary bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
                : "rounded-lg border border-line px-3 py-1.5 text-sm text-green-dark"
            }
          >
            {optie === "notitie" ? "Korte notitie" : "Verslag"}
          </button>
        ))}
      </div>

      {soort === "verslag" ? (
        <div>
          <Label htmlFor="verslag-titel">Waar ging het over?</Label>
          <Input
            id="verslag-titel"
            name="title"
            maxLength={160}
            placeholder="Bijvoorbeeld: intakegesprek, of evaluatie module 2"
          />
        </div>
      ) : null}

      <Textarea
        name="body"
        rows={soort === "verslag" ? 6 : 3}
        maxLength={8000}
        placeholder={
          soort === "verslag"
            ? "Wat is er besproken, wat viel op, wat spraken jullie af?"
            : "Korte observatie…"
        }
        aria-label={soort === "verslag" ? "Verslag" : "Notitie"}
      />

      <Melding resultaat={resultaat} />

      <SubmitButton size="sm" bezigLabel="Opslaan…">
        {soort === "verslag" ? "Verslag opslaan" : "Notitie opslaan"}
      </SubmitButton>
    </form>
  );
}

/**
 * De analyseknop.
 *
 * De tekst boven de knop is er niet voor de sier: wie hierop drukt, stuurt
 * gegevens naar een externe partij. Dat hoort te blijken uit het scherm en niet
 * alleen uit de documentatie.
 */
export function Gespreksverslag({
  profileId,
  heeftGezondheid,
  aiIngericht,
}: {
  profileId: string;
  heeftGezondheid: boolean;
  aiIngericht: boolean;
}) {
  const [resultaat, actie] = useActionState(maakGespreksverslag, BEGIN);

  return (
    <form action={actie} className="space-y-4">
      <input type="hidden" name="profile_id" value={profileId} />

      <p className="text-sm text-muted">
        Maakt een verslag van alles wat er over deze klant bekend is, om samen
        door te nemen.{" "}
        <strong>
          Naam, e-mailadres, telefoonnummer en woonplaats gaan niet mee
        </strong>{" "}
        — de AI krijgt de inhoud zonder te weten wie het is. Jij bepaalt wat je
        ervan deelt; de klant ziet het verslag niet.
      </p>

      {heeftGezondheid ? (
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="met_gezondheid"
            className="mt-1 size-5 accent-[var(--color-green)]"
          />
          <span className="text-sm">
            Gezondheidsgegevens meesturen
            <span className="block text-muted">
              Levert een bruikbaarder verslag, maar stuurt bijzondere
              persoonsgegevens naar Anthropic. Alleen doen als dat past bij de
              toestemming die de klant heeft gegeven.
            </span>
          </span>
        </label>
      ) : null}

      <Melding resultaat={resultaat} />

      <SubmitButton
        size="sm"
        bezigLabel="Bezig met schrijven…"
        disabled={!aiIngericht}
      >
        {aiIngericht ? "Gespreksverslag maken" : "AI nog niet ingericht"}
      </SubmitButton>
    </form>
  );
}

export function VerwijderVerslag({ analyseId }: { analyseId: string }) {
  const [bezig, startOvergang] = useTransition();
  const [bevestig, setBevestig] = useState(false);
  const router = useRouter();

  if (!bevestig) {
    return (
      <button
        type="button"
        onClick={() => setBevestig(true)}
        className="text-sm text-muted underline hover:text-error"
      >
        Verwijderen
      </button>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <button
        type="button"
        disabled={bezig}
        onClick={() =>
          startOvergang(async () => {
            await verwijderGespreksverslag(analyseId);
            router.refresh();
          })
        }
        className="text-sm font-semibold text-error underline"
      >
        Ja, weg
      </button>
      <button
        type="button"
        onClick={() => setBevestig(false)}
        className="text-sm text-muted underline"
      >
        Annuleren
      </button>
    </span>
  );
}
