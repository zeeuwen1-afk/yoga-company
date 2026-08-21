"use client";

import { useActionState } from "react";

import { FormMessage } from "@/components/ui/form-message";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { geefKaartUit, type DocentResultaat } from "../server/acties";

const BEGIN: DocentResultaat = { status: "idle" };

/**
 * Een kaart vastleggen die zojuist bij deze docent is betaald.
 *
 * Er is bewust geen keuzelijst met klanten: die zou het hele klantenbestand
 * van de studio openzetten voor iedereen die er lesgeeft. De docent typt het
 * adres van degene die bij hém heeft afgerekend — dat weet hij, en een ander
 * niet.
 */
export function KaartUitgeven({
  producten,
}: {
  producten: { id: string; naam: string; prijs_centen: number }[];
}) {
  const [resultaat, actie] = useActionState(geefKaartUit, BEGIN);

  return (
    <form action={actie} className="space-y-4">
      {resultaat.status === "gelukt" ? (
        <FormMessage variant="gelukt">{resultaat.bericht}</FormMessage>
      ) : null}
      {resultaat.status === "fout" ? (
        <FormMessage variant="fout">{resultaat.bericht}</FormMessage>
      ) : null}

      <div>
        <Label htmlFor="kaart-email">E-mailadres van de klant</Label>
        <Input
          id="kaart-email"
          name="email"
          type="email"
          required
          autoComplete="off"
          placeholder="naam@voorbeeld.nl"
        />
      </div>

      <div>
        <Label htmlFor="kaart-product">Welke kaart</Label>
        <select
          id="kaart-product"
          name="product_id"
          required
          className="mt-1 h-11 w-full rounded-lg border border-line-strong bg-background px-3 text-ink"
        >
          {producten.map((product) => (
            <option key={product.id} value={product.id}>
              {product.naam} — €{" "}
              {(product.prijs_centen / 100).toFixed(2).replace(".", ",")}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="kaart-opmerking">Aantekening (niet verplicht)</Label>
        <Input
          id="kaart-opmerking"
          name="opmerking"
          placeholder="Contant betaald, 21 augustus"
        />
      </div>

      <SubmitButton bezigLabel="Vastleggen…">Kaart uitgeven</SubmitButton>

      <p className="text-sm text-muted">
        Je legt hier vast wat je hebt verkocht. Het geld staat al op je eigen
        rekening — dit platform raakt het niet aan.
      </p>
    </form>
  );
}
