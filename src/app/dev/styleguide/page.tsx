import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

const colors = [
  {
    token: "--color-petrol",
    value: "#1F4D58",
    use: "de hoofdachtergrond — uit het merkbeeld",
  },
  {
    token: "--color-petrol-deep",
    value: "#133B45",
    use: "voettekst en de waas over de herofoto",
  },
  {
    token: "--color-petrol-card",
    value: "#275965",
    use: "kaarten en panelen op een petrol vlak",
  },
  {
    token: "--color-accent",
    value: "#EA976E",
    use: "abrikoos — knoppen; niet als kleine tekst op licht",
  },
  {
    token: "--color-accent-light",
    value: "#F0A87F",
    use: "links en labels op donker (4,69:1)",
  },
  {
    token: "--color-accent-deep",
    value: "#9E4E2B",
    use: "links en tekst op een licht eiland (5,63:1)",
  },
  { token: "--color-sand", value: "#DECCAA", use: "zand — banner, merkteken" },
  {
    token: "--color-sand-light",
    value: "#F3EBDC",
    use: "rustige lichte sectie",
  },
  {
    token: "--color-paper-warm",
    value: "#FCFAF6",
    use: "warm wit — tekst op donker, lichte vlakken",
  },
  {
    token: "--color-muted",
    value: "#B4C7CC",
    use: "bijschriften op petrol (5,30:1)",
  },
  {
    token: "--color-ink-dark",
    value: "#16323A",
    use: "bodytekst op een licht eiland",
  },
  {
    token: "--color-muted-dark",
    value: "#4E6970",
    use: "bijschriften op een licht eiland",
  },
  { token: "--color-line", value: "#3D7683", use: "lijnen en kaders" },
  {
    token: "--color-line-strong",
    value: "#8FA9AE",
    use: "randen van formuliervelden (3,74:1)",
  },
  { token: "--color-hover", value: "#2F6674", use: "vlak dat oplicht" },
  { token: "--color-error", value: "#C4523C", use: "foutmeldingen" },
  { token: "--color-success", value: "#3E6B4F", use: "bevestigingen" },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line py-12">
      <h2 className="mb-6 text-2xl">{title}</h2>
      {children}
    </section>
  );
}

export default function StyleguidePage() {
  // Alleen beschikbaar tijdens ontwikkeling; nooit in productie bereikbaar.
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl">Styleguide</h1>
      <p className="mt-3 max-w-2xl text-muted">
        De designtokens en basiscomponenten van YogaCompany. Deze pagina is
        alleen tijdens ontwikkeling bereikbaar.
      </p>

      <Section title="Kleuren">
        <ul className="grid gap-4 sm:grid-cols-2">
          {colors.map((color) => (
            <li
              key={color.token}
              className="flex items-center gap-4 rounded-[var(--radius-card)] border border-line p-3"
            >
              <span
                aria-hidden
                className="size-12 shrink-0 rounded-lg border border-line"
                style={{ backgroundColor: color.value }}
              />
              <span className="min-w-0">
                <code className="block text-sm font-semibold text-ink">
                  {color.token}
                </code>
                <span className="block text-sm text-muted">
                  {color.value} — {color.use}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Typografie">
        <div className="space-y-4">
          <h1 className="text-5xl">Kop 1 — Cormorant Garamond 600</h1>
          <h2 className="text-3xl">Kop 2 — Cormorant Garamond 600</h2>
          <h3 className="text-xl">Kop 3 — Cormorant Garamond 600</h3>
          <p className="max-w-2xl">
            Bodytekst in Jost, 16px met een ruime regelafstand van 1,6. Rustig,
            warm en direct — we schrijven in de je-vorm en houden het kort. Elke
            pagina heeft één duidelijke call-to-action.
          </p>
          <p className="max-w-2xl text-sm text-muted">
            Bijschrift in de gedempte kleur, voor toelichtingen en metadata.
          </p>
          <p className="label-klein">Label in kleinkapitaal</p>
        </div>
      </Section>

      <Section title="Knoppen">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Inschrijven</Button>
          <Button variant="secondary">Meer lezen</Button>
          <Button variant="ghost">Annuleren</Button>
          <Button variant="danger">Verwijderen</Button>
          <Button disabled>Uitgeschakeld</Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button size="sm">Klein</Button>
          <Button size="md">Normaal</Button>
          <Button size="lg">Groot</Button>
        </div>
      </Section>

      <Section title="Kaarten">
        <div className="grid gap-5 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>200-uurs Yin Yoga Specialist</CardTitle>
              <CardDescription>
                Opleiding · 4 modules van 50 uur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Van de basis van Yin Yoga naar specialist in herstel en
                revalidatie.
              </p>
              <p className="mt-3 font-semibold text-green-dark">€ 2.795</p>
            </CardContent>
            <CardFooter>
              <Button size="sm">Bekijk opleiding</Button>
            </CardFooter>
          </Card>

          <Card className="bg-cream">
            <CardHeader>
              <CardTitle>Kaart op crème</CardTitle>
              <CardDescription>Variant voor secties</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Dezelfde kaart met een zachte achtergrond, voor afwisseling
                binnen een sectie.
              </p>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="Formuliervelden">
        <form className="max-w-md space-y-5">
          <div>
            <Label htmlFor="sg-naam">Naam</Label>
            <Input id="sg-naam" placeholder="Je naam" />
          </div>
          <div>
            <Label htmlFor="sg-email">E-mailadres</Label>
            <Input id="sg-email" type="email" placeholder="jij@voorbeeld.nl" />
          </div>
          <div>
            <Label htmlFor="sg-fout">Veld met fout</Label>
            <Input id="sg-fout" aria-invalid defaultValue="onjuiste invoer" />
            <p className="mt-1.5 text-sm text-error">
              Vul een geldig e-mailadres in.
            </p>
          </div>
          <div>
            <Label htmlFor="sg-bericht">Bericht</Label>
            <Textarea
              id="sg-bericht"
              placeholder="Waar kunnen we je mee helpen?"
            />
          </div>
          <Button type="button">Versturen</Button>
        </form>
      </Section>

      <Section title="Statusmeldingen">
        <div className="space-y-3">
          <p className="rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
            Je inschrijving is bevestigd. Je ontvangt een e-mail met de
            praktische informatie.
          </p>
          <p className="rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
            Er ging iets mis. Probeer het opnieuw of neem contact met ons op.
          </p>
        </div>
      </Section>
    </div>
  );
}
