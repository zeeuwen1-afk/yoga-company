# Het Supabase-project

Ingericht op 13 augustus 2026.

## Welk project

|       |                                            |
| ----- | ------------------------------------------ |
| Naam  | `zeeuwen1-afk's Project`                   |
| Ref   | `hfsxncotxlenxrkycxsv`                     |
| URL   | `https://hfsxncotxlenxrkycxsv.supabase.co` |
| Regio | `eu-west-1` (Ierland)                      |

Dit was een leeg, ongebruikt project in de organisatie: nul tabellen, nul
gebruikers. Het is hergebruikt in plaats van een nieuw project aan te maken,
omdat de organisatie al twee projecten heeft en een derde **$10 per maand**
kost. Wil je alsnog een eigen project, dan is dat die $10 waard of niet — de
migrations draaien er in een paar minuten opnieuw op.

**Over de regio.** `PROGRESS.md` noemde Frankfurt; dit project staat in
Ierland. Beide liggen in de EU en voldoen daarmee aan §3 ("Supabase, EU-regio")
en aan `docs/avg.md`. De regio van een bestaand project is niet te wijzigen.

## Wat er al op staat

Alle acht migrations uit `supabase/migrations/`, bijgehouden in de tabel
`schema_migrations` zodat `pnpm db:migrate` ze niet nog eens draait:

```
20260811190000_schema
20260811190100_rls
20260811190200_triggers
20260811190300_storage
20260811210000_avg_functies
20260811220000_mailings_en_bewaartermijnen
20260813120000_functierechten          ← beveiligingsherstel, zie hieronder
20260813130000_lessen_en_boekingen
```

## Nog te doen — twee geheime waarden

Deze twee zijn alleen via het dashboard op te halen en horen in `.env.local`:

| Variabele                   | Waar                                                  |
| --------------------------- | ----------------------------------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → `service_role`               |
| `SUPABASE_DB_URL`           | Project Settings → Database → Connection string (URI) |

Zonder de service-role sleutel werkt het beheer niet: geen klantenkaart, geen
site-editor die publiceert, geen `pnpm db:seed-admin`.

Daarna:

```bash
pnpm db:seed          # 7 cursussen en 39 tekstblokken
pnpm db:seed-admin    # jouw beheerdersaccount, via een uitnodiging
SUPABASE_DB_URL=… pnpm test:rls   # de RLS-suite één keer tegen het échte project
```

Die laatste is geen overbodige luxe. De lokale testdatabase bootst Supabase na
maar ís het niet — en juist dat verschil verborg het lek hieronder.

Voor livegang zijn verder nog nodig: `MAILING_UNSUBSCRIBE_SECRET` en
`CRON_SECRET`, allebei te maken met `openssl rand -base64 32`.

## Het lek dat hierbij aan het licht kwam

Bij het inrichten bleek dat `anon` — de rol achter de publieke sleutel die in
de browser van elke bezoeker staat — uitvoerrecht had op de beheerfuncties. Die
functies bewaken zichzelf met "is_admin() **of geen sessie**", in de gedachte
dat "geen sessie" server-side betekent. Een anonieme API-aanroep heeft echter
óók geen sessie.

Concreet kon iedereen met de publieke sleutel dit doen:

```
POST /rest/v1/rpc/zet_profiel_rol  {"p_profile_id": "…", "p_rol": "admin"}
```

en zichzelf beheerder maken. Ook `anonimiseer_profiel` (wist de berichten,
aanvragen en voortgang van een willekeurige klant) en
`opruimen_bewaartermijnen` stonden open.

Gedicht in `20260813120000_functierechten.sql`: uitvoerrecht ingetrokken bij
`anon`, triggerfuncties helemaal dicht, en `alter default privileges` zorgt dat
nieuwe functies in `public` niet opnieuw automatisch opengaan. RLS-test 11 voert
de aanval uit en controleert dat hij faalt.

**De oorzaak dat de tests dit misten:** Supabase deelt via
`alter default privileges` standaard EXECUTE uit aan `anon`, en het
`revoke … from public` in de oude migrations haalt zo'n expliciete grant er
niet af. De testopstelling in `supabase/tests/bootstrap.sql` bootste die
standaardrechten wél na, maar geen enkele test riep de beheerfuncties aan als
anonieme bezoeker. Dat doet test 11 nu.
