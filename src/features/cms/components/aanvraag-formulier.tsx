"use client";

import { useActionState } from "react";
import Link from "next/link";

import {
  FieldError,
  FormMessage,
  Honeypot,
} from "@/components/ui/form-message";
import { Input, Label, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { verstuurAanvraag, type AanvraagResultaat } from "../server/aanvraag";

const BEGIN: AanvraagResultaat = { status: "idle" };

/** Wat er per pagina in de velden staat als voorbeeld. */
const VOORBEELDEN: Record<
  string,
  { organisatie: string; omvang: string; periode: string; locatie: string }
> = {
  bedrijfsyoga: {
    organisatie: "Bedrijfsnaam, plaats",
    omvang: "12 deelnemers",
    periode: "vanaf oktober, wekelijks",
    locatie: "onze eigen kantine",
  },
  sportclubs: {
    organisatie: "Naam van de club, plaats",
    omvang: "één selectieteam, 18 spelers",
    periode: "het hele seizoen, op donderdagavond",
    locatie: "de kantine of de gymzaal",
  },
  onderwijs: {
    organisatie: "School of instelling, plaats",
    omvang: "4 klassen, bovenbouw havo",
    periode: "aanloop naar de toetsweek in januari",
    locatie: "in de eigen lokalen",
  },
};

/**
 * Het aanvraagformulier op een organisatiepagina.
 *
 * Vier vragen meer dan het contactformulier, en dat is de hele bedoeling: met
 * de omvang, de periode en de locatie erbij kan er meteen een prijs worden
 * genoemd. Zonder die vier wordt elke aanvraag een mailwisseling van vier
 * heen-en-weertjes.
 *
 * De aanvraag komt binnen bij **Beheer → Contactberichten**, samen met de
 * andere berichten van mensen zonder account.
 */
export function AanvraagFormulier({ pageKey }: { pageKey: string }) {
  const [resultaat, actie] = useActionState(verstuurAanvraag, BEGIN);
  const velden = resultaat.status === "fout" ? resultaat.velden : undefined;
  const voorbeeld = VOORBEELDEN[pageKey] ?? VOORBEELDEN.bedrijfsyoga!;

  if (resultaat.status === "gelukt") {
    return <FormMessage variant="gelukt">{resultaat.bericht}</FormMessage>;
  }

  return (
    <form
      action={actie}
      className="space-y-5 rounded-[var(--radius-card)] border border-line bg-background p-6 sm:p-8"
      noValidate
    >
      <Honeypot />
      <input type="hidden" name="onderwerp" value={pageKey} />

      {resultaat.status === "fout" && !velden ? (
        <FormMessage variant="fout">{resultaat.bericht}</FormMessage>
      ) : null}

      <div>
        <Label htmlFor="organisatie">Organisatie en plaats</Label>
        <Input
          id="organisatie"
          name="organisatie"
          required
          placeholder={voorbeeld.organisatie}
          aria-invalid={velden?.organisatie ? true : undefined}
        />
        <FieldError>{velden?.organisatie}</FieldError>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="omvang">Om hoeveel mensen of groepen gaat het?</Label>
          <Input
            id="omvang"
            name="omvang"
            placeholder={voorbeeld.omvang}
            aria-invalid={velden?.omvang ? true : undefined}
          />
          <FieldError>{velden?.omvang}</FieldError>
        </div>
        <div>
          <Label htmlFor="periode">Wanneer, en hoe vaak?</Label>
          <Input
            id="periode"
            name="periode"
            placeholder={voorbeeld.periode}
            aria-invalid={velden?.periode ? true : undefined}
          />
          <FieldError>{velden?.periode}</FieldError>
        </div>
      </div>

      <div>
        <Label htmlFor="locatie">Waar zou het plaatsvinden?</Label>
        <Input
          id="locatie"
          name="locatie"
          placeholder={voorbeeld.locatie}
          aria-invalid={velden?.locatie ? true : undefined}
        />
        <FieldError>{velden?.locatie}</FieldError>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Je naam</Label>
          <Input
            id="name"
            name="name"
            required
            autoComplete="name"
            aria-invalid={velden?.name ? true : undefined}
          />
          <FieldError>{velden?.name}</FieldError>
        </div>
        <div>
          <Label htmlFor="email">E-mailadres</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            aria-invalid={velden?.email ? true : undefined}
          />
          <FieldError>{velden?.email}</FieldError>
        </div>
      </div>

      <div>
        <Label htmlFor="phone">
          Telefoonnummer <span className="text-muted">(niet verplicht)</span>
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          aria-invalid={velden?.phone ? true : undefined}
        />
        <FieldError>{velden?.phone}</FieldError>
      </div>

      <div>
        <Label htmlFor="body">Iets wat we moeten weten</Label>
        <Textarea
          id="body"
          name="body"
          rows={4}
          required
          aria-invalid={velden?.body ? true : undefined}
        />
        <FieldError>{velden?.body}</FieldError>
      </div>

      <SubmitButton bezigLabel="Versturen…">Verstuur de aanvraag</SubmitButton>

      <p className="text-sm text-muted">
        Je gegevens gaan naar YogaCompany en nergens anders heen. Zie de{" "}
        <Link href="/privacyverklaring" className="underline">
          privacyverklaring
        </Link>
        .
      </p>
    </form>
  );
}
