# E-mailtemplates in Supabase

Supabase verstuurt zelf de mails voor accountbevestiging, uitnodigingen en
wachtwoordherstel. De standaardtemplates werken **niet** met deze applicatie.
Wie een nieuw Supabase-project inricht moet ze aanpassen, anders komt iedereen
die op een link klikt op het inlogscherm terecht.

Instellen onder **Authentication → Emails → Templates**.

## Waarom de standaard niet werkt

De route `src/app/auth/bevestigen/route.ts` verwacht twee waarden in de link:
`token_hash` en `type`. Daarmee wisselt hij de eenmalige code in voor een
sessie.

De standaardtemplates gebruiken `{{ .ConfirmationURL }}`. Die stuurt de
bezoeker eerst langs de verify-endpoint van Supabase, en die geeft de link
daarna door aan onze site **zonder die twee waarden**. De route ziet dan geen
token, en doet wat hij hoort te doen: doorsturen naar `/inloggen` met
`?fout=link_ongeldig`.

De oplossing is de link zelf opbouwen met `{{ .TokenHash }}`.

## Voorwaarde

**Authentication → URL Configuration → Site URL** moet op `https://yogacompany.eu`
staan, zonder schuine streep aan het eind. `{{ .SiteURL }}` in de templates
hieronder komt daarvandaan.

## Reset password

```html
<h2>Nieuw wachtwoord instellen</h2>
<p>Je hebt een nieuw wachtwoord aangevraagd voor YogaCompany.</p>
<p>
  <a
    href="{{ .SiteURL }}/auth/bevestigen?token_hash={{ .TokenHash }}&type=recovery&volgende=/wachtwoord-herstellen"
  >
    Kies een nieuw wachtwoord
  </a>
</p>
<p>
  Deze link is een uur geldig. Heb je dit niet aangevraagd, dan hoef je niets te
  doen en verandert er niets aan je account.
</p>
```

## Confirm sign up

```html
<h2>Bevestig je e-mailadres</h2>
<p>Welkom bij YogaCompany. Bevestig je adres om je account te activeren.</p>
<p>
  <a
    href="{{ .SiteURL }}/auth/bevestigen?token_hash={{ .TokenHash }}&type=signup"
  >
    E-mailadres bevestigen
  </a>
</p>
```

## Invite user

Voor accounts die vanuit het beheer worden aangemaakt.

```html
<h2>Je bent uitgenodigd</h2>
<p>
  Er is een account voor je aangemaakt bij YogaCompany. Kies hieronder je
  wachtwoord.
</p>
<p>
  <a
    href="{{ .SiteURL }}/auth/bevestigen?token_hash={{ .TokenHash }}&type=invite&volgende=/wachtwoord-herstellen"
  >
    Wachtwoord instellen
  </a>
</p>
```

Let op het verschil in `type=`: `recovery`, `signup` en `invite`. Dat woord
bepaalt hoe Supabase de token controleert en moet per template kloppen.

## Waarom deze links niet met PKCE werken

`createClient()` uit `src/lib/supabase/server.ts` gebruikt PKCE. Supabase legt
dan een geheim in een cookie in de browser waar de aanvraag vandaan kwam, en de
link werkt alleen zolang die cookie er staat. Dat gaat stuk zodra iemand de mail
op een ander apparaat opent dan waar hij de aanvraag deed, wat de gewone gang
van zaken is.

Registreren en wachtwoord vergeten gebruiken daarom `createMailLinkClient()`,
dat op `flowType: "implicit"` staat en een gewone `token_hash` uitgeeft. Die
werkt op elk apparaat. De link blijft eenmalig, verloopt na een uur en komt
alleen aan in het postvak van de rekeninghouder.

Verander dat niet terug zonder de herstelmail op een tweede apparaat te testen.

## Testen

1. Vraag op je laptop een nieuw wachtwoord aan via `/wachtwoord-vergeten`.
2. Open de mail **op je telefoon** en klik de link.
3. Je hoort op `/wachtwoord-herstellen` te landen, niet op `/inloggen`.

Kom je toch op het inlogscherm, kijk dan achteraan de URL:

| Melding               | Betekenis                                            |
| --------------------- | ---------------------------------------------------- |
| `?fout=link_ongeldig` | geen token in de link: template nog niet aangepast   |
| `?fout=link_verlopen` | token afgekeurd: link al gebruikt, verlopen, of PKCE |
