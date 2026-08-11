"use client";

import { useActionState, useRef, useState } from "react";
import { Check, Copy, Download, ImageIcon, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Label, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { createClient } from "@/lib/supabase/client";

import { DOELEN, PLATFORMS, type SocialPlatform } from "../opties";
import {
  bewaarBericht,
  genereerVarianten,
  type SocialResultaat,
} from "../server/acties";

/**
 * Het werkblad van de socialmediatool (BOUWPROMPT §15).
 *
 * De volgorde volgt hoe iemand daadwerkelijk werkt: eerst zeggen waar het over
 * gaat, dan kiezen uit varianten, dan bijschaven en een beeld erbij, en dan
 * kopiëren. Publiceren via Meta is een extra knop die alleen verschijnt als die
 * koppeling aanstaat; zonder die koppeling is het werkblad volledig bruikbaar.
 */

const LEEG: SocialResultaat = { status: "idle" };
const MAX_BYTES = 10 * 1024 * 1024;

/** Kopieerknop met terugkoppeling: zonder bevestiging weet je het niet. */
function KopieerKnop({ tekst }: { tekst: string }) {
  const [gekopieerd, setGekopieerd] = useState(false);

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={!tekst.trim()}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(tekst);
          setGekopieerd(true);
          setTimeout(() => setGekopieerd(false), 2000);
        } catch {
          setGekopieerd(false);
        }
      }}
    >
      {gekopieerd ? (
        <>
          <Check className="size-4" aria-hidden /> Gekopieerd
        </>
      ) : (
        <>
          <Copy className="size-4" aria-hidden /> Kopieer naar klembord
        </>
      )}
    </Button>
  );
}

export function SocialWerkblad({
  metaAan,
  aiAan,
}: {
  metaAan: boolean;
  aiAan: boolean;
}) {
  const [generatie, genereerActie] = useActionState(genereerVarianten, LEEG);
  const [bewaard, bewaarActie] = useActionState(bewaarBericht, LEEG);

  const [caption, setCaption] = useState("");
  const [platform, setPlatform] = useState<SocialPlatform>("beide");
  const [onderwerp, setOnderwerp] = useState("");
  const [doel, setDoel] = useState("inschrijvingen");
  const [beeldPad, setBeeldPad] = useState("");
  const [beeldUrl, setBeeldUrl] = useState("");
  const [uploadFout, setUploadFout] = useState<string | null>(null);
  const [bezigMetUpload, setBezigMetUpload] = useState(false);
  const bestandRef = useRef<HTMLInputElement>(null);

  const varianten =
    generatie.status === "varianten" ? generatie.varianten : null;

  async function upload(bestand: File) {
    setUploadFout(null);

    if (!bestand.type.startsWith("image/")) {
      setUploadFout("Kies een afbeelding.");
      return;
    }
    if (bestand.size > MAX_BYTES) {
      setUploadFout("Deze afbeelding is groter dan 10 MB.");
      return;
    }

    setBezigMetUpload(true);

    const veiligeNaam = bestand.name
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, "-")
      .replace(/^-|-$/g, "");
    const pad = `social/${Date.now()}-${veiligeNaam}`;

    const supabase = createClient();
    const { error } = await supabase.storage
      .from("public-media")
      .upload(pad, bestand, { cacheControl: "31536000", upsert: false });

    setBezigMetUpload(false);

    if (error) {
      setUploadFout("De upload is mislukt. Probeer het opnieuw.");
      return;
    }

    const { data } = supabase.storage.from("public-media").getPublicUrl(pad);
    setBeeldPad(pad);
    setBeeldUrl(data.publicUrl);
  }

  function kiesVariant(tekst: string, hashtags: string[]) {
    setCaption(
      hashtags.length > 0
        ? `${tekst}\n\n${hashtags.map((tag) => `#${tag}`).join(" ")}`
        : tekst,
    );
  }

  return (
    <div className="space-y-6">
      {/* Stap 1 — waar gaat het over? */}
      <section className="rounded-[var(--radius-card)] border border-line bg-white p-5">
        <h2 className="mb-1 text-lg">1. Waar gaat het bericht over?</h2>
        <p className="mb-4 text-sm text-muted">
          Beschrijf het in je eigen woorden. Bijvoorbeeld: &ldquo;de 200-uurs
          opleiding start in september, er zijn nog plekken&rdquo;.
        </p>

        {!aiAan ? (
          <FormMessage variant="fout">
            De AI-koppeling is nog niet ingericht (zie docs/beheer.md §10). Je
            kunt hieronder wel zelf een tekst schrijven en bewaren.
          </FormMessage>
        ) : (
          <form action={genereerActie} className="space-y-4">
            <div>
              <Label htmlFor="onderwerp">Onderwerp</Label>
              <Textarea
                id="onderwerp"
                name="onderwerp"
                required
                maxLength={500}
                value={onderwerp}
                onChange={(event) => setOnderwerp(event.target.value)}
                placeholder="Waar gaat dit bericht over?"
              />
            </div>

            <fieldset>
              <legend className="mb-1.5 text-sm font-semibold">Doel</legend>
              <div className="flex flex-wrap gap-3">
                {DOELEN.map((optie) => (
                  <label
                    key={optie.waarde}
                    className="flex cursor-pointer items-start gap-2 rounded-lg border border-line px-3 py-2 text-sm has-[:checked]:border-green has-[:checked]:bg-cream"
                  >
                    <input
                      type="radio"
                      name="doel"
                      value={optie.waarde}
                      checked={doel === optie.waarde}
                      onChange={() => setDoel(optie.waarde)}
                      className="mt-1"
                    />
                    <span>
                      <span className="font-semibold">{optie.label}</span>
                      <span className="block text-muted">{optie.uitleg}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-1.5 text-sm font-semibold">Platform</legend>
              <div className="flex flex-wrap gap-3">
                {PLATFORMS.map((optie) => (
                  <label
                    key={optie.waarde}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm has-[:checked]:border-green has-[:checked]:bg-cream"
                  >
                    <input
                      type="radio"
                      name="platform"
                      value={optie.waarde}
                      checked={platform === optie.waarde}
                      onChange={() => setPlatform(optie.waarde)}
                    />
                    {optie.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <SubmitButton bezigLabel="De AI schrijft…">
              Schrijf drie varianten
            </SubmitButton>

            {generatie.status === "fout" ? (
              <FormMessage variant="fout">{generatie.bericht}</FormMessage>
            ) : null}
          </form>
        )}
      </section>

      {/* Stap 2 — kiezen */}
      {varianten ? (
        <section className="rounded-[var(--radius-card)] border border-line bg-white p-5">
          <h2 className="mb-1 text-lg">2. Kies een variant</h2>
          <p className="mb-4 text-sm text-muted">
            Alles is nog aan te passen nadat je hebt gekozen.
          </p>

          <ul className="space-y-3">
            {varianten.map((variant, index) => (
              <li
                key={index}
                className="rounded-lg border border-line bg-cream p-4"
              >
                <p className="mb-2 text-sm font-semibold text-green-dark">
                  {variant.invalshoek}
                </p>
                <p className="text-sm whitespace-pre-wrap">{variant.tekst}</p>
                {variant.hashtags.length > 0 ? (
                  <p className="mt-2 text-sm text-muted">
                    {variant.hashtags.map((tag) => `#${tag}`).join(" ")}
                  </p>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  className="mt-3"
                  onClick={() => kiesVariant(variant.tekst, variant.hashtags)}
                >
                  Deze gebruiken
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Stap 3 — bijschaven, beeld, bewaren */}
      <section className="rounded-[var(--radius-card)] border border-line bg-white p-5">
        <h2 className="mb-1 text-lg">3. Bijschaven en plaatsen</h2>
        <p className="mb-4 text-sm text-muted">
          Lees de tekst na voordat je hem plaatst. Jij bent verantwoordelijk
          voor wat er online komt te staan, niet de AI.
        </p>

        <form action={bewaarActie} className="space-y-4">
          <input type="hidden" name="platform" value={platform} />
          <input type="hidden" name="image_path" value={beeldPad} />
          <input type="hidden" name="onderwerp" value={onderwerp} />
          <input type="hidden" name="doel" value={doel} />

          <div>
            <Label htmlFor="caption">Tekst van het bericht</Label>
            <Textarea
              id="caption"
              name="caption"
              required
              rows={10}
              className="min-h-48"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="Schrijf hier je bericht, of kies eerst een variant hierboven."
            />
            <p className="mt-1.5 text-sm text-muted">{caption.length} tekens</p>
          </div>

          <div>
            <Label>Afbeelding</Label>
            {beeldUrl ? (
              // Bewust een gewone img: de bron is een opslag-URL die
              // next/image niet vooraf kent, en dit is een beheerscherm.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={beeldUrl}
                alt="De gekozen afbeelding bij dit bericht"
                className="max-h-56 rounded-lg border border-line object-cover"
              />
            ) : (
              <div className="flex h-28 items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-cream text-sm text-muted">
                <ImageIcon className="size-5" aria-hidden />
                Nog geen afbeelding gekozen
              </div>
            )}

            <input
              ref={bestandRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                const bestand = event.target.files?.[0];
                if (bestand) void upload(bestand);
              }}
            />

            <div className="mt-3 flex flex-wrap gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={bezigMetUpload}
                onClick={() => bestandRef.current?.click()}
              >
                <Upload className="size-4" aria-hidden />
                {bezigMetUpload
                  ? "Bezig met uploaden…"
                  : beeldUrl
                    ? "Andere afbeelding"
                    : "Afbeelding kiezen"}
              </Button>

              {beeldUrl ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    // download-attribuut werkt niet over origins heen; een
                    // nieuw tabblad laat de beheerder het beeld zelf opslaan.
                    window.open(beeldUrl, "_blank", "noopener");
                  }}
                >
                  <Download className="size-4" aria-hidden />
                  Download afbeelding
                </Button>
              ) : null}
            </div>

            {uploadFout ? (
              <FormMessage variant="fout">{uploadFout}</FormMessage>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
            <KopieerKnop tekst={caption} />
            <SubmitButton variant="ghost" bezigLabel="Bezig…">
              Bewaar als concept
            </SubmitButton>
          </div>

          {bewaard.status === "fout" ? (
            <FormMessage variant="fout">{bewaard.bericht}</FormMessage>
          ) : null}
          {bewaard.status === "gelukt" ? (
            <FormMessage variant="gelukt">{bewaard.bericht}</FormMessage>
          ) : null}
        </form>

        <p className="mt-4 border-t border-line pt-4 text-sm text-muted">
          {metaAan
            ? "Publiceren via Instagram of Facebook kan met de knop bij het bewaarde bericht in het overzicht hieronder."
            : "Publiceren gaat handmatig: kopieer de tekst, download de afbeelding en plaats ze in de app van Instagram of Facebook. De directe koppeling met Meta staat uit."}
        </p>
      </section>
    </div>
  );
}
