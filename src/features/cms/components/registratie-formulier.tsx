"use client";

import { useActionState } from "react";

import {
  FieldError,
  FormMessage,
  Honeypot,
} from "@/components/ui/form-message";
import { Input, Label, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { NIVEAU_KEUZES } from "@/content/niveaus";

import {
  verstuurRegistratie,
  type RegistratieResultaat,
} from "../server/registratie";

const BEGIN: RegistratieResultaat = { status: "idle" };

/**
 * Registratie van een opleiding aanvragen bij de Academy.
 *
 * De documenten (opleidingsplan, diploma's, ervaringsoverzicht, verzekering)
 * volgen per e-mail; het formulier zegt dat. Het veld voor de website van de
 * opleider heet bewust "webadres": "website" is de spamval die alleen robots
 * invullen, en een opleider hoort juist zijn site te kunnen opgeven.
 */
export function RegistratieFormulier() {
  const [resultaat, actie] = useActionState(verstuurRegistratie, BEGIN);
  const velden = resultaat.status === "fout" ? resultaat.velden : undefined;

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

      {resultaat.status === "fout" && !velden ? (
        <FormMessage variant="fout">{resultaat.bericht}</FormMessage>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="registratie-naam">Je naam</Label>
          <Input
            id="registratie-naam"
            name="name"
            required
            autoComplete="name"
            aria-invalid={velden?.name ? true : undefined}
          />
          <FieldError>{velden?.name}</FieldError>
        </div>
        <div>
          <Label htmlFor="registratie-organisatie">
            Naam van je onderneming of school
          </Label>
          <Input
            id="registratie-organisatie"
            name="organisatie"
            required
            autoComplete="organization"
            aria-invalid={velden?.organisatie ? true : undefined}
          />
          <FieldError>{velden?.organisatie}</FieldError>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="registratie-email">E-mailadres</Label>
          <Input
            id="registratie-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            aria-invalid={velden?.email ? true : undefined}
          />
          <FieldError>{velden?.email}</FieldError>
        </div>
        <div>
          <Label htmlFor="registratie-telefoon">
            Telefoon (niet verplicht)
          </Label>
          <Input
            id="registratie-telefoon"
            name="phone"
            type="tel"
            autoComplete="tel"
            aria-invalid={velden?.phone ? true : undefined}
          />
          <FieldError>{velden?.phone}</FieldError>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
        <div>
          <Label htmlFor="registratie-opleiding">Naam van de opleiding</Label>
          <Input
            id="registratie-opleiding"
            name="opleiding"
            required
            placeholder="Bijvoorbeeld: Yin Yoga Docentenopleiding"
            aria-invalid={velden?.opleiding ? true : undefined}
          />
          <FieldError>{velden?.opleiding}</FieldError>
        </div>
        <div>
          <Label htmlFor="registratie-niveau">Niveau</Label>
          <select
            id="registratie-niveau"
            name="niveau"
            defaultValue=""
            required
            className="h-11 w-full rounded-lg border border-line-strong bg-background px-3 sm:w-52"
            aria-invalid={velden?.niveau ? true : undefined}
          >
            <option value="" disabled>
              Kies een niveau
            </option>
            {NIVEAU_KEUZES.map((keuze) => (
              <option key={keuze.code} value={keuze.code}>
                {keuze.label}
              </option>
            ))}
          </select>
          <FieldError>{velden?.niveau}</FieldError>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="registratie-plaats">Plaats van de opleiding</Label>
          <Input
            id="registratie-plaats"
            name="plaats"
            autoComplete="address-level2"
            aria-invalid={velden?.plaats ? true : undefined}
          />
          <FieldError>{velden?.plaats}</FieldError>
        </div>
        <div>
          <Label htmlFor="registratie-webadres">Website (niet verplicht)</Label>
          <Input
            id="registratie-webadres"
            name="webadres"
            type="url"
            inputMode="url"
            placeholder="https://"
            autoComplete="url"
            aria-invalid={velden?.webadres ? true : undefined}
          />
          <FieldError>{velden?.webadres}</FieldError>
        </div>
      </div>

      <div>
        <Label htmlFor="registratie-bericht">
          Toelichting (niet verplicht)
        </Label>
        <Textarea
          id="registratie-bericht"
          name="body"
          rows={4}
          placeholder="Bijvoorbeeld: hoeveel uur de opleiding is, uit welke modules hij bestaat, en sinds wanneer je lesgeeft."
          aria-invalid={velden?.body ? true : undefined}
        />
        <FieldError>{velden?.body}</FieldError>
      </div>

      <SubmitButton bezigLabel="Versturen…">Vraag registratie aan</SubmitButton>

      <p className="text-sm text-muted">
        Je hoort binnen twee werkdagen van ons. Het opleidingsplan, je
        diploma&apos;s, je ervaringsoverzicht en het verzekeringsbewijs stuur je
        daarna per e-mail; die bewaren we niet op de website.
      </p>
    </form>
  );
}
