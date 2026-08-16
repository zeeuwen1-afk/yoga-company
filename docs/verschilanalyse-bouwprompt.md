# Verschilanalyse — nieuwe bouwprompt vs. bestaande repo

Datum: 13 augustus 2026
Vergeleken: `docs/YogaCompany-claude-code-prompt.md` (nieuw) tegenover de huidige
repo, die volgens `PROGRESS.md` fase 0 t/m 7 heeft afgerond.

**Kern:** het nieuwe document beschrijft grotendeels hetzelfde platform als wat er
al staat, maar schrijft een andere technische stack voor en voegt één ontbrekende
module toe. Het document zegt "dit document wint bij afwijking". Als dat letterlijk
wordt gevolgd, betekent het een herbouw van vrijwel de hele applicatie.

---

## 1. Afwijkingen die een herbouw betekenen

| Onderwerp        | Nieuw document                 | Wat er nu staat                         |
| ---------------- | ------------------------------ | --------------------------------------- |
| Framework        | Vite + React 18 + React Router | Next.js 15.5 App Router + React 19      |
| Datafetching     | TanStack Query                 | React Server Components + servicelaag   |
| Server-side code | Supabase Edge Functions (Deno) | Next.js route handlers + server actions |
| Betaalprovider   | Mollie (iDEAL)                 | Stripe — volledig gebouwd en getest     |

Dit is niet een kwestie van configuratie: het raakt elk scherm, de auth-middleware,
de beveiligde routes en de hele betaalmodule.

**Aandachtspunt bij Vite:** een Vite-SPA rendert niet op de server. Voor een
publieke marketingsite met opleidingsteksten is dat een merkbare achteruitgang in
vindbaarheid (SEO), laadtijd en de Lighthouse-score van ≥ 90 die §4.7 zelf eist.
Ook de eis "geen service-role key in de client" is in een SPA lastiger te borgen
dan in Next.js, waar servercode fysiek gescheiden blijft. De rest van het document
(Supabase, RLS, Vercel, Tailwind, zod) past ongewijzigd op wat er nu staat.

## 2. Afwijkingen die gewoon aanpasbaar zijn

| Onderwerp                 | Nieuw document          | Nu                    | Werk                 |
| ------------------------- | ----------------------- | --------------------- | -------------------- |
| Merknaam                  | YogaCompany             | Yoga Companie         | Zoek/vervang + seed  |
| Koppen-font               | Cormorant Garamond      | EB Garamond           | Fontwissel           |
| Tekst-font                | Jost                    | Source Sans 3         | Fontwissel           |
| Groen                     | `#2F4239`               | `#2e4a3b`             | Token bijwerken      |
| Zand                      | `#DCCBA8` / `#E7DCC2`   | `#eae1ce` / `#f4eedf` | Token bijwerken      |
| Salie `#A9BCA1`           | Nieuw                   | Ontbreekt             | Token toevoegen      |
| Paper `#F9F7F1`           | Achtergrond             | `#ffffff`             | Token bijwerken      |
| Prijs per module          | € 795                   | € 845                 | Seed bijwerken       |
| Prijs volledige opleiding | € 2.795 (bespaar € 385) | € 2.995               | Seed bijwerken       |
| Logo's                    | `public/brand/`         | `public/` is **leeg** | Bestanden aanleveren |

De prijsstelling in het nieuwe document is intern consistent: 4 × € 795 = € 3.180,
min € 2.795 = € 385 korting.

## 3. Naamsverschillen in het datamodel (zelfde functie)

- `products` (nieuw) ↔ `courses` (nu)
- `message_threads` (nieuw) ↔ `conversations` (nu)
- `lessons` betekent in het nieuwe document **geroosterde yogalessen**; in de
  huidige database betekent `lessons` **lesmateriaal binnen een opleiding**. Dit
  is de gevaarlijkste naamsbotsing — bij hernoemen goed uit elkaar houden.

## 4. Wat het nieuwe document toevoegt en nu echt ontbreekt

1. **Lessen en boekingen** — weekrooster, capaciteit, wachtlijst, annuleren,
   deelnemerslijst, no-show. Volledig afwezig; er is geen `bookings`-tabel.
2. **Lesabonnement** — maandelijks, met mandaat en zelf opzeggen in het portaal.
3. **Losse leskaart** (`lesson_card` als producttype).
4. **`faq_items`** — beheerd in admin, getoond in portaal.
5. **`media`-tabel** met alt-teksten.
6. **Termijnbetaling** Eerst Jij Begeleid (3 × € 279).
7. **Boekingsmails** (flow 6: bevestiging en herinnering).

## 5. Wat al klaar is en niet opnieuw hoeft

Auth met verplichte 2FA voor admin, RLS met tien testbestanden, CRM en
klantdossier, site-editor met concept/voorvertoning/publiceren, berichten,
aanvragen, instellingen, audit log, AVG-verwijdering en bewaartermijnen,
socialtool met AI-varianten, mailings met afmeldlink, en de Eerst Jij-inhoud.

## 6. Aanbeveling

Behoud Next.js en pas het bestaande platform aan het nieuwe document aan:
huisstijl-tokens, fonts, merknaam en prijzen bijwerken, de lessen-en-boekingen
module bouwen, FAQ toevoegen, en Stripe vervangen door Mollie als iDEAL de eis is.
Dat levert alles wat het document functioneel vraagt, zonder zeven afgeronde fases
weg te gooien en zonder de SEO van de publieke site op te offeren.
