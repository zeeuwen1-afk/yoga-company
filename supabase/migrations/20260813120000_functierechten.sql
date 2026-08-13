-- =============================================================================
-- YogaCompany — uitvoerrechten op functies dichtzetten
--
-- BEVEILIGINGSHERSTEL. Gevonden op 13 augustus 2026 bij het inrichten van het
-- echte Supabase-project.
--
-- Wat er mis was
-- --------------
-- De beheerfuncties bewaken zichzelf met:
--
--     if not (is_admin() or auth.uid() is null) then raise ...
--
-- De gedachte was: "geen sessie betekent dat de server ons aanroept". Dat klopt
-- niet. Een anonieme aanroep via de REST-API heeft óók geen sessie, dus
-- `auth.uid()` is daar eveneens null en de bewaking laat hem door.
--
-- Tegelijk geeft Supabase via `alter default privileges` standaard EXECUTE op
-- alles in `public` aan `anon` en `authenticated`. Het `revoke ... from public`
-- in de eerdere migrations haalt die expliciete rechten er niet af: revoke van
-- PUBLIC laat een aparte grant aan `anon` gewoon staan.
--
-- Samen betekende dat: iedereen met de publieke sleutel — en die staat in de
-- browser van elke bezoeker — kon
--
--     POST /rest/v1/rpc/zet_profiel_rol {"p_profile_id": "…", "p_rol": "admin"}
--
-- aanroepen en zichzelf beheerder maken. Ook `anonimiseer_profiel` (wist de
-- berichten, aanvragen en voortgang van een willekeurige klant) en
-- `opruimen_bewaartermijnen` stonden open.
--
-- De oplossing
-- ------------
-- EXECUTE intrekken bij `anon`. Daarmee weigert PostgREST de aanroep al vóór de
-- functie draait. De bewaking in de functie blijft staan en klopt daarna ook
-- weer: de enige overgebleven aanroepers zijn `authenticated` (heeft altijd een
-- `auth.uid()`, dus moet admin zijn) en de service-role of een migration
-- (geen sessie, en die zitten server-side).
--
-- Triggerfuncties horen sowieso nooit via de API aanroepbaar te zijn. Postgres
-- controleert bij een trigger geen EXECUTE-recht, dus intrekken breekt niets.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Beheerfuncties — weg bij anon, blijven voor admins en server-side
-- -----------------------------------------------------------------------------
revoke execute on function anonimiseer_profiel(uuid) from anon, public;
revoke execute on function zet_profiel_actief(uuid, boolean) from anon, public;
revoke execute on function zet_profiel_rol(uuid, user_role) from anon, public;
revoke execute on function opruimen_bewaartermijnen() from anon, public;

-- -----------------------------------------------------------------------------
-- 2. Triggerfuncties — nooit rechtstreeks aanroepbaar
-- -----------------------------------------------------------------------------
revoke execute on function handle_new_user() from anon, authenticated, public;
revoke execute on function sync_profile_email() from anon, authenticated, public;
revoke execute on function guard_profile_columns() from anon, authenticated, public;
revoke execute on function guard_laatste_admin() from anon, authenticated, public;
revoke execute on function touch_progress_updated_at() from anon, authenticated, public;
revoke execute on function touch_content_block_updated_at()
  from anon, authenticated, public;

-- -----------------------------------------------------------------------------
-- 3. Vast zoekpad op de twee resterende functies
--
-- Zonder vast `search_path` kan een aanroeper de functie naar eigen tabellen
-- omleiden. Bij deze twee kan dat weinig kwaad, maar het is de laatste plek
-- waar het nog ontbrak.
-- -----------------------------------------------------------------------------
alter function touch_progress_updated_at() set search_path = public;
alter function touch_content_block_updated_at() set search_path = public;

-- -----------------------------------------------------------------------------
-- 4. Nieuwe functies staan voortaan niet meer standaard open voor anon
--
-- Dit is de structurele kant: zonder deze regel krijgt élke functie die later
-- in `public` wordt aangemaakt opnieuw automatisch EXECUTE voor `anon`, en dan
-- is dezelfde fout zo weer gemaakt. Functies die het publiek wél nodig heeft
-- krijgen hun grant voortaan expliciet, zoals `is_admin` hieronder.
-- -----------------------------------------------------------------------------
alter default privileges in schema public revoke execute on functions from anon;

-- `is_admin`, `has_course_access` en `course_id_for_lesson` worden gebruikt in
-- policies die ook voor niet-ingelogde bezoekers gelden. Ze geven alleen een
-- boolean of een id terug en zijn ongevaarlijk; hun recht bevestigen we hier
-- expliciet, zodat punt 4 hierboven ze niet meeneemt.
grant execute on function is_admin() to anon, authenticated;
grant execute on function course_id_for_lesson(uuid) to anon, authenticated;
grant execute on function has_course_access(uuid) to authenticated;
