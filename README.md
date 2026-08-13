# YogaCompany Platform

Platform voor YogaCompany, opleidingsinstituut voor yoga: publieke site,
klantportaal met digitale content en een adminomgeving met CRM.

De volledige specificatie staat in `BOUWPROMPT.md`, de voortgang in
`PROGRESS.md`.

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

| Commando         | Wat het doet                                  |
| ---------------- | --------------------------------------------- |
| `pnpm dev`       | Ontwikkelserver op poort 3000                 |
| `pnpm build`     | Productiebuild                                |
| `pnpm start`     | Productieserver                               |
| `pnpm typecheck` | TypeScript controleren                        |
| `pnpm lint`      | ESLint                                        |
| `pnpm format`    | Code opmaken met Prettier                     |
| `pnpm test`      | Unittests (Vitest)                            |
| `pnpm test:e2e`  | End-to-end-tests (Playwright)                 |
| `pnpm verify`    | Typecheck + lint + opmaakcontrole + unittests |

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
