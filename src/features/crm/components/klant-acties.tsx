"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input, Label, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  herstelTweestapsverificatie,
  stuurWachtwoordHerstel,
  verwijderKlantAvg,
  voegNotitieToe,
  werkKlantBij,
  wijzigRol,
  zetKlantActief,
  type AdminResultaat,
} from "../server/acties";

const BEGIN: AdminResultaat = { status: "idle" };

export function GegevensBewerken({
  profileId,
  voornaam,
  achternaam,
  telefoon,
  geboortedatum,
  woonplaats,
  hoeGevonden,
  ervaring,
  doelen,
  interesses,
}: {
  profileId: string;
  voornaam: string;
  achternaam: string;
  telefoon: string | null;
  geboortedatum: string | null;
  woonplaats: string | null;
  hoeGevonden: string | null;
  ervaring: string | null;
  doelen: string | null;
  interesses: string[];
}) {
  const [resultaat, actie] = useActionState(werkKlantBij, BEGIN);

  return (
    <form action={actie} className="space-y-4" noValidate>
      <input type="hidden" name="profile_id" value={profileId} />

      {resultaat.status !== "idle" ? (
        <FormMessage
          variant={resultaat.status === "gelukt" ? "gelukt" : "fout"}
        >
          {resultaat.bericht}
        </FormMessage>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="k-voornaam">Voornaam</Label>
          <Input
            id="k-voornaam"
            name="first_name"
            defaultValue={voornaam}
            required
          />
        </div>
        <div>
          <Label htmlFor="k-achternaam">Achternaam</Label>
          <Input
            id="k-achternaam"
            name="last_name"
            defaultValue={achternaam}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="k-telefoon">Telefoonnummer</Label>
          <Input id="k-telefoon" name="phone" defaultValue={telefoon ?? ""} />
        </div>
        <div>
          <Label htmlFor="k-geboorte">Geboortedatum</Label>
          <Input
            id="k-geboorte"
            name="birth_date"
            type="date"
            defaultValue={geboortedatum ?? ""}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="k-woonplaats">Woonplaats</Label>
          <Input
            id="k-woonplaats"
            name="city"
            defaultValue={woonplaats ?? ""}
            placeholder="Alleen de plaats, geen adres"
          />
        </div>
        <div>
          <Label htmlFor="k-gevonden">Hoe heeft deze klant ons gevonden?</Label>
          <Input
            id="k-gevonden"
            name="how_found"
            defaultValue={hoeGevonden ?? ""}
            placeholder="Via een vriendin, Google, Instagram…"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="k-ervaring">Ervaring met yoga</Label>
        <Input
          id="k-ervaring"
          name="experience_level"
          defaultValue={ervaring ?? ""}
          placeholder="Beginner, twee jaar Hatha, docent sinds 2019…"
        />
      </div>

      <div>
        <Label htmlFor="k-doelen">Wat wil deze klant bereiken?</Label>
        <Textarea
          id="k-doelen"
          name="goals"
          rows={3}
          defaultValue={doelen ?? ""}
          placeholder="Waar komt iemand voor, en waar wil hij naartoe?"
        />
      </div>

      <div>
        <Label htmlFor="k-interesses">Interesses</Label>
        <Input
          id="k-interesses"
          name="interests"
          defaultValue={interesses.join(", ")}
          placeholder="yin, ademwerk, meridianen"
        />
        <p className="mt-1.5 text-sm text-muted">
          Onderwerpen, gescheiden door komma&apos;s. Gebruikt om mailings
          gericht te versturen — alleen bij klanten die daar toestemming voor
          gaven.
        </p>
      </div>

      <p className="text-sm text-muted">
        Blessures en klachten horen hier niet thuis; die leg je vast bij
        Gezondheid, want daar gelden strengere regels voor.
      </p>

      <SubmitButton bezigLabel="Opslaan…">Opslaan</SubmitButton>
    </form>
  );
}

export function NotitieFormulier({ profileId }: { profileId: string }) {
  const [resultaat, actie] = useActionState(voegNotitieToe, BEGIN);

  return (
    <form action={actie} className="space-y-3" noValidate>
      <input type="hidden" name="profile_id" value={profileId} />

      <label htmlFor="notitie" className="sr-only">
        Notitie
      </label>
      <Textarea
        id="notitie"
        name="body"
        rows={3}
        required
        placeholder="Interne notitie — alleen zichtbaar voor beheerders."
      />

      {resultaat.status === "fout" ? (
        <FormMessage variant="fout">{resultaat.bericht}</FormMessage>
      ) : null}

      <SubmitButton size="sm" bezigLabel="Opslaan…">
        Notitie toevoegen
      </SubmitButton>
    </form>
  );
}

export function AccountSchakelaars({
  profileId,
  isActief,
  isAdmin,
  heeftTweestaps,
}: {
  profileId: string;
  isActief: boolean;
  isAdmin: boolean;
  /**
   * Of er een authenticator-app gekoppeld is. `null` betekent onbekend —
   * dat gebeurt zolang de service-role sleutel ontbreekt. De knop blijft dan
   * bruikbaar; de actie zelf meldt wat er werkelijk aan de hand is.
   */
  heeftTweestaps: boolean | null;
}) {
  const [melding, setMelding] = useState<AdminResultaat>(BEGIN);
  const [bezig, startOvergang] = useTransition();
  const router = useRouter();

  function voerUit(handeling: () => Promise<AdminResultaat>) {
    startOvergang(async () => {
      const uitkomst = await handeling();
      setMelding(uitkomst);
      if (uitkomst.status === "gelukt") router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {melding.status !== "idle" ? (
        <FormMessage variant={melding.status === "gelukt" ? "gelukt" : "fout"}>
          {melding.bericht}
        </FormMessage>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={bezig}
          onClick={() => voerUit(() => zetKlantActief(profileId, !isActief))}
        >
          {isActief ? "Account deactiveren" : "Account weer activeren"}
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={bezig}
          onClick={() =>
            voerUit(() => wijzigRol(profileId, isAdmin ? "klant" : "admin"))
          }
        >
          {isAdmin ? "Beheerdersrol intrekken" : "Beheerder maken"}
        </Button>
      </div>

      <div className="space-y-3 border-t border-line pt-4">
        <p className="text-sm font-semibold text-ink">Toegang herstellen</p>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={bezig}
            onClick={() => voerUit(() => stuurWachtwoordHerstel(profileId))}
          >
            Wachtwoord laten herstellen
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={bezig || heeftTweestaps === false}
            onClick={() =>
              voerUit(() => herstelTweestapsverificatie(profileId))
            }
          >
            {heeftTweestaps === false
              ? "Geen tweestapsverificatie"
              : "Tweestapsverificatie loskoppelen"}
          </Button>
        </div>

        <p className="text-sm text-muted">
          De klant krijgt een e-mail en kiest zelf een nieuw wachtwoord — jij
          krijgt het nooit te zien, want het account is van de klant.
          Loskoppelen van de tweestapsverificatie is voor wie zijn telefoon
          kwijt is; bij de volgende keer inloggen stelt hij hem opnieuw in.
          Beide handelingen komen in het logboek.
        </p>
      </div>

      <p className="text-sm text-muted">
        Deactiveren blokkeert het inloggen maar bewaart alle gegevens. Voor het
        écht verwijderen van persoonsgegevens gebruik je de knop hieronder.
      </p>
    </div>
  );
}

/**
 * AVG-verwijdering (BOUWPROMPT §13, §17.7).
 *
 * Onomkeerbaar, dus achter twee drempels: het paneel moet worden opengeklapt,
 * en het woord VERWIJDEREN moet worden overgetypt. Dat is geen wantrouwen maar
 * bescherming tegen een misklik met blijvende gevolgen.
 */
export function AvgVerwijderen({
  profileId,
  naam,
}: {
  profileId: string;
  naam: string;
}) {
  const [resultaat, actie] = useActionState(verwijderKlantAvg, BEGIN);
  const [open, setOpen] = useState(false);

  if (resultaat.status === "gelukt") {
    return <FormMessage variant="gelukt">{resultaat.bericht}</FormMessage>;
  }

  if (!open) {
    return (
      <div>
        <p className="text-sm text-muted">
          Verwijdert de persoonsgegevens van {naam} definitief. Inschrijvingen
          en omzet blijven geanonimiseerd staan voor de boekhouding, zoals de
          wet vereist.
        </p>
        <Button
          type="button"
          variant="danger"
          size="sm"
          className="mt-3"
          onClick={() => setOpen(true)}
        >
          Gegevens verwijderen (AVG)
        </Button>
      </div>
    );
  }

  return (
    <form action={actie} className="space-y-4" noValidate>
      <input type="hidden" name="profile_id" value={profileId} />

      <FormMessage variant="fout">
        Dit verwijdert naam, e-mailadres, telefoonnummer, berichten, aanvragen,
        notities en voortgang van {naam}. Het inlogaccount wordt opgeheven. Dit
        kan niet ongedaan worden gemaakt.
      </FormMessage>

      <div>
        <Label htmlFor="avg-reden">Reden</Label>
        <Input
          id="avg-reden"
          name="reden"
          required
          placeholder="Bijvoorbeeld: verzoek van de klant per e-mail"
        />
      </div>

      <div>
        <Label htmlFor="avg-bevestiging">
          Typ <span className="font-mono">VERWIJDEREN</span> om te bevestigen
        </Label>
        <Input
          id="avg-bevestiging"
          name="bevestiging"
          required
          autoComplete="off"
        />
      </div>

      {resultaat.status === "fout" ? (
        <FormMessage variant="fout">{resultaat.bericht}</FormMessage>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <SubmitButton variant="danger" size="sm" bezigLabel="Verwijderen…">
          Definitief verwijderen
        </SubmitButton>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(false)}
        >
          Annuleren
        </Button>
      </div>
    </form>
  );
}
