"use client";

import { useActionState } from "react";

import { FormMessage } from "@/components/ui/form-message";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { nodigKlantUit, type AdminResultaat } from "../server/acties";

const BEGIN: AdminResultaat = { status: "idle" };

export function UitnodigenFormulier() {
  const [resultaat, actie] = useActionState(nodigKlantUit, BEGIN);

  return (
    <form action={actie} className="space-y-5" noValidate>
      {resultaat.status === "gelukt" ? (
        <FormMessage variant="gelukt">{resultaat.bericht}</FormMessage>
      ) : null}
      {resultaat.status === "fout" ? (
        <FormMessage variant="fout">{resultaat.bericht}</FormMessage>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="uitn-voornaam">Voornaam</Label>
          <Input id="uitn-voornaam" name="first_name" required />
        </div>
        <div>
          <Label htmlFor="uitn-achternaam">Achternaam</Label>
          <Input id="uitn-achternaam" name="last_name" required />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="uitn-email">E-mailadres</Label>
          <Input id="uitn-email" name="email" type="email" required />
        </div>
        <div>
          <Label htmlFor="uitn-rol">Rol</Label>
          <select
            id="uitn-rol"
            name="rol"
            defaultValue="klant"
            className="h-11 w-full rounded-lg border border-line bg-white px-3"
          >
            <option value="klant">Klant</option>
            <option value="admin">Beheerder</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="uitn-telefoon">Telefoonnummer (optioneel)</Label>
          <Input id="uitn-telefoon" name="phone" />
        </div>
        <div>
          <Label htmlFor="uitn-woonplaats">Woonplaats (optioneel)</Label>
          <Input id="uitn-woonplaats" name="city" />
        </div>
      </div>

      <div>
        <Label htmlFor="uitn-gevonden">
          Hoe heeft deze persoon ons gevonden? (optioneel)
        </Label>
        <Input
          id="uitn-gevonden"
          name="how_found"
          placeholder="Via een vriendin, Google, Instagram…"
        />
      </div>

      <p className="text-sm text-muted">
        De rest — geboortedatum, ervaring, doelen, interesses en eventuele
        gezondheidsgegevens — vul je aan op de klantenkaart, zodra je die
        informatie hebt.
      </p>

      <SubmitButton bezigLabel="Versturen…">Uitnodiging versturen</SubmitButton>

      <p className="text-sm text-muted">
        De ontvanger krijgt een link om zelf een wachtwoord te kiezen; wij
        stellen er nooit een in. Beheerders moeten bij de eerste keer inloggen
        verplicht tweestapsverificatie instellen.
      </p>
    </form>
  );
}
