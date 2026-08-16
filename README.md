# YogaCompany Platform

Platform voor YogaCompany, opleidingsinstituut voor yoga: publieke site,
klantportaal met digitale content en een adminomgeving met CRM.

**Begin bij [`PROGRESS.md`](PROGRESS.md)** — daar staat waar we gebleven zijn,
wat er af is en wat er nog moet.

De specificatie is sinds 13 augustus 2026
[`docs/YogaCompany-claude-code-prompt.md`](docs/YogaCompany-claude-code-prompt.md).
`BOUWPROMPT.md` is de vorige versie; die blijft staan omdat hij verklaart
waarom de code is zoals hij is.

## Documentatie

| Document                                                                           | Waarvoor                                                 |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------- |
| [`PROGRESS.md`](PROGRESS.md)                                                       | Waar we gebleven zijn, per fase afgevinkt                |
| [`docs/YogaCompany-claude-code-prompt.md`](docs/YogaCompany-claude-code-prompt.md) | De specificatie; leidend bij twijfel                     |
| [`docs/aannames.md`](docs/aannames.md)                                             | Elke afwijking van die specificatie, met de reden        |
| [`docs/verschilanalyse-bouwprompt.md`](docs/verschilanalyse-bouwprompt.md)         | Wat het nieuwe document anders vraagt dan er stond       |
| [`docs/beheer.md`](docs/beheer.md)                                                 | Handleiding: accounts inrichten en dagelijks beheer      |
| [`docs/supabase-project.md`](docs/supabase-project.md)                             | Welk project, wat erop staat, en het beveiligingsherstel |
| [`docs/payments.md`](docs/payments.md)                                             | Mollie koppelen, testen en de webhook                    |
| [`docs/lessen-en-boekingen.md`](docs/lessen-en-boekingen.md)                       | Lesrooster, wachtlijst en de regels eromheen             |
| [`docs/avg.md`](docs/avg.md)                                                       | Verwerkers, bewaartermijnen en rechten van betrokkenen   |

## Aan de slag

Vereist: Node.js 20.9 of hoger en pnpm.

```bash
pnpm install
cp .env.example .env.local   # vul de waarden in
pnpm dev                     # http://localhost:3000
```

De designtokens en basiscomponenten bekijk je op
[`/dev/styleguide`](http://localhost:3000/dev/styleguide) (alleen tijdens
ontwikkeling bereikbaar).

## Commando's

| Commando            | Wat het doet                                     |
| ------------------- | ------------------------------------------------ |
| `pnpm dev`          | Ontwikkelserver op poort 3000                    |
| `pnpm build`        | Productiebuild                                   |
| `pnpm start`        | Productieserver                                  |
| `pnpm typecheck`    | TypeScript controleren                           |
| `pnpm lint`         | ESLint                                           |
| `pnpm format`       | Code opmaken met Prettier                        |
| `pnpm test`         | Unittests (Vitest)                               |
| `pnpm test:e2e`     | End-to-end-tests (Playwright)                    |
| `pnpm verify`       | Alles hierboven, plus de RLS- en seedcontrole    |
| `pnpm test:rls`     | Klantscheiding tegen een wegwerpdatabase         |
| `pnpm db:migrate`   | Migrations toepassen (vereist `SUPABASE_DB_URL`) |
| `pnpm db:seed`      | Aanbod en teksten inladen                        |
| `pnpm brand:assets` | Merkbestanden opnieuw uit de logo-PDF snijden    |

Draai voor de e2e-tests eenmalig `pnpm exec playwright install chromium webkit`.

## Architectuur in het kort

```
src/app/(public)   publieke site
src/app/(auth)     inloggen, registreren, 2FA
src/app/portaal    klantomgeving
src/app/admin      adminomgeving
src/app/api/v1     geversioneerde API en webhooks
src/features/*     businesslogica per feature (components/ + server/)
src/components     UI-bouwstenen zonder datatoegang
src/lib            clients en hulpfuncties
supabase/          migrations, seed en RLS-tests
```

Features praten uitsluitend met elkaar via hun publieke `index.ts`.
UI-componenten bevatten nooit datatoegang. Alle datatoegang loopt via de
service-laag in `features/*/server/`. ESLint bewaakt deze regels.

## Beveiliging

Geheimen staan uitsluitend in environment variables en nooit in git. Elke
databasetabel krijgt Row Level Security; klantscheiding wordt op
databaseniveau afgedwongen, niet in applicatiecode.
