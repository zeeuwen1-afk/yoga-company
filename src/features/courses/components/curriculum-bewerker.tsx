"use client";

import { useActionState, useId, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input, Label, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

import { naarInvoer, type ModuleInvoer } from "../curriculum";
import { bewaarCurriculum, type AanbodResultaat } from "../server/admin-acties";
import type { Cursus } from "../server/queries";

const BEGIN: AanbodResultaat = { status: "idle" };

const LEEG: ModuleInvoer = {
  titel: "",
  uren: "",
  samenvatting: "",
  onderdelen: "",
};

/**
 * Het curriculum van een opleiding of training bewerken.
 *
 * Dit was het laatste stuk van een cursuspagina dat vastzat in de code: de
 * modules, hun uren en alles wat erin behandeld wordt stonden als één blok
 * gegevens in de database, zonder scherm om ze aan te raken. Wie een module
 * wilde hernoemen moest daarvoor bij de bouwer zijn.
 *
 * Wat er per module in behandeld wordt is één tekstveld en geen boom met
 * knoppen. Zie `../curriculum.ts` voor waarom: drie niveaus diep met een
 * "toevoegen"-knop per niveau levert een scherm op waarin je de goede knop
 * moet zoeken, terwijl de vorm die je toch al zou typen precies past.
 *
 * De nummering komt uit de volgorde. Een module tussenvoegen zou anders
 * betekenen dat je alle nummers erna met de hand bijwerkt, en één vergeten
 * nummer levert twee keer "Module 3" op de pagina op.
 */
export function CurriculumBewerker({
  cursus,
  cursusId,
}: {
  cursus: Cursus;
  cursusId: string;
}) {
  const [resultaat, actie] = useActionState(bewaarCurriculum, BEGIN);
  const [modules, setModules] = useState<ModuleInvoer[]>(() =>
    cursus.curriculum.map(naarInvoer),
  );
  const veldId = useId();

  function wijzig(index: number, veld: keyof ModuleInvoer, waarde: string) {
    setModules((vorig) =>
      vorig.map((module, plek) =>
        plek === index ? { ...module, [veld]: waarde } : module,
      ),
    );
  }

  function verplaats(index: number, richting: -1 | 1) {
    setModules((vorig) => {
      const doel = index + richting;
      if (doel < 0 || doel >= vorig.length) return vorig;
      const nieuw = [...vorig];
      [nieuw[index], nieuw[doel]] = [nieuw[doel]!, nieuw[index]!];
      return nieuw;
    });
  }

  function verwijder(index: number) {
    setModules((vorig) => vorig.filter((_, plek) => plek !== index));
  }

  const totaalUren = modules.reduce(
    (som, module) => som + (Number.parseInt(module.uren, 10) || 0),
    0,
  );

  return (
    <form action={actie} className="space-y-5" noValidate>
      <input type="hidden" name="id" value={cursusId} />
      {/* De hele lijst gaat in één keer mee; zie `bewaarCurriculum`. */}
      <input
        type="hidden"
        name="modules"
        value={JSON.stringify(modules)}
        readOnly
      />

      {resultaat.status !== "idle" ? (
        <FormMessage
          variant={resultaat.status === "gelukt" ? "gelukt" : "fout"}
        >
          {resultaat.bericht}
        </FormMessage>
      ) : null}

      <p className="text-sm text-muted">
        Dit is de uitklapbare lijst onderaan de cursuspagina. In{" "}
        <span className="font-semibold">Wat er in deze module gebeurt</span> is
        elke regel met een streepje ervoor een onderdeel, en elke andere regel
        een kopje daarboven. De uren onder elkaar vormen de{" "}
        <span className="font-semibold">Omvang</span> in de kolom Praktisch
        {totaalUren > 0 ? `, nu ${totaalUren} uur` : ""}.
      </p>

      {modules.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-6 text-center text-muted">
          Nog geen modules. Zonder modules staat er geen curriculum op de
          pagina.
        </p>
      ) : null}

      {modules.map((module, index) => (
        <div
          key={index}
          className="space-y-4 rounded-[var(--radius-card)] border border-line p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold">Module {index + 1}</p>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={index === 0}
                onClick={() => verplaats(index, -1)}
                aria-label={`Module ${index + 1} naar boven`}
              >
                <ArrowUp aria-hidden />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={index === modules.length - 1}
                onClick={() => verplaats(index, 1)}
                aria-label={`Module ${index + 1} naar beneden`}
              >
                <ArrowDown aria-hidden />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => verwijder(index)}
                aria-label={`Module ${index + 1} verwijderen`}
              >
                <Trash2 aria-hidden />
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
            <div>
              <Label htmlFor={`${veldId}-titel-${index}`}>Titel</Label>
              <Input
                id={`${veldId}-titel-${index}`}
                value={module.titel}
                onChange={(event) => wijzig(index, "titel", event.target.value)}
                placeholder="Bijvoorbeeld: De basis van Yin Yoga"
              />
            </div>
            <div>
              <Label htmlFor={`${veldId}-uren-${index}`}>Uren</Label>
              <Input
                id={`${veldId}-uren-${index}`}
                type="number"
                min={0}
                max={9999}
                value={module.uren}
                onChange={(event) => wijzig(index, "uren", event.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor={`${veldId}-samenvatting-${index}`}>
              Waar deze module over gaat
            </Label>
            <Textarea
              id={`${veldId}-samenvatting-${index}`}
              rows={2}
              className="min-h-0"
              value={module.samenvatting}
              onChange={(event) =>
                wijzig(index, "samenvatting", event.target.value)
              }
              placeholder="Eén of twee zinnen; die staan bovenaan als je de module uitklapt."
            />
          </div>

          <div>
            <Label htmlFor={`${veldId}-onderdelen-${index}`}>
              Wat er in deze module gebeurt
            </Label>
            <Textarea
              id={`${veldId}-onderdelen-${index}`}
              rows={8}
              value={module.onderdelen}
              onChange={(event) =>
                wijzig(index, "onderdelen", event.target.value)
              }
              placeholder={
                "Fundamenten van yin en yang\n- Het onderscheid tussen yin en yang\n- Waar de vorm vandaan komt\n\nBasisprincipes\n- De drie principes van een yin-houding"
              }
            />
          </div>
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setModules((vorig) => [...vorig, { ...LEEG }])}
          disabled={modules.length >= 20}
        >
          <Plus aria-hidden />
          Module toevoegen
        </Button>
        <SubmitButton bezigLabel="Opslaan…">Curriculum opslaan</SubmitButton>
      </div>

      <p className="text-sm text-muted">
        Een module zonder titel wordt niet opgeslagen. Zo haal je er een weg, en
        zo blijft een lege module die je per ongeluk toevoegde van de site.
      </p>
    </form>
  );
}
