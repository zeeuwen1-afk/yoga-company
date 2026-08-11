-- =============================================================================
-- Yoga Companie — AVG-verwijdering en soft delete (BOUWPROMPT §13, §17.7)
--
-- Verwijderen op verzoek betekent hier: anonimiseren, niet wissen. De wet
-- vraagt om verwijdering van persoonsgegevens, maar verplicht ons tegelijk de
-- financiële administratie te bewaren. Door de persoonsgegevens te vervangen
-- en de inschrijvingen te laten staan, voldoen we aan beide.
--
-- Dit staat in de database en niet in applicatiecode, om drie redenen:
--   1. het gebeurt in één transactie, dus half werk is onmogelijk;
--   2. de rechtencontrole zit in de functie zelf en kan niet worden overgeslagen;
--   3. het is toetsbaar met de RLS-tests.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Anonimiseren op verzoek van de klant, of na de bewaartermijn
-- -----------------------------------------------------------------------------
create or replace function anonimiseer_profiel(p_profile_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Alleen een admin mag dit, of een server-side proces zonder sessie (de
  -- maandelijkse opschoontaak uit §17.6).
  if not (is_admin() or auth.uid() is null) then
    raise exception 'Alleen een beheerder kan een profiel anonimiseren'
      using errcode = 'insufficient_privilege';
  end if;

  -- Vrije tekst die de klant zelf schreef, verdwijnt: daar kunnen
  -- persoonsgegevens in staan die wij niet nodig hebben.
  delete from messages
   where conversation_id in (
     select id from conversations where profile_id = p_profile_id
   );
  delete from conversations where profile_id = p_profile_id;
  delete from requests where profile_id = p_profile_id;
  delete from crm_notes where profile_id = p_profile_id;

  -- Voortgang is herleidbaar gedrag en heeft na verwijdering geen doel meer.
  delete from progress where profile_id = p_profile_id;

  -- Inschrijvingen blijven staan voor de boekhouding, maar zonder naam eraan.
  -- Het profiel blijft bestaan als lege huls zodat de verwijzingen kloppen.
  update profiles
     set first_name = 'Verwijderde',
         last_name = 'klant',
         email = 'verwijderd+' || p_profile_id || '@yogacompanie.invalid',
         phone = null,
         marketing_consent_at = null,
         deleted_at = coalesce(deleted_at, now())
   where id = p_profile_id;
end;
$$;

comment on function anonimiseer_profiel is
  'Verwijdert persoonsgegevens en laat de geanonimiseerde administratie staan (BOUWPROMPT §17.7).';

revoke all on function anonimiseer_profiel from public;
grant execute on function anonimiseer_profiel to authenticated;

-- -----------------------------------------------------------------------------
-- Deactiveren: het account op non-actief, gegevens blijven staan
-- -----------------------------------------------------------------------------
create or replace function zet_profiel_actief(p_profile_id uuid, p_actief boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (is_admin() or auth.uid() is null) then
    raise exception 'Alleen een beheerder kan een account deactiveren'
      using errcode = 'insufficient_privilege';
  end if;

  update profiles
     set deleted_at = case when p_actief then null else now() end
   where id = p_profile_id;
end;
$$;

revoke all on function zet_profiel_actief from public;
grant execute on function zet_profiel_actief to authenticated;

-- -----------------------------------------------------------------------------
-- Rol wijzigen: uitsluitend door een admin, en nooit de laatste admin
-- -----------------------------------------------------------------------------
create or replace function zet_profiel_rol(p_profile_id uuid, p_rol user_role)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_aantal_admins int;
begin
  if not (is_admin() or auth.uid() is null) then
    raise exception 'Alleen een beheerder kan rollen wijzigen'
      using errcode = 'insufficient_privilege';
  end if;

  -- Zonder deze controle kan een beheerder zichzelf buitensluiten en is er
  -- niemand meer die er nog bij kan.
  if p_rol <> 'admin' then
    select count(*) into v_aantal_admins
      from profiles
     where role = 'admin' and deleted_at is null and id <> p_profile_id;

    if v_aantal_admins = 0 then
      raise exception 'Er moet ten minste één beheerder overblijven'
        using errcode = 'check_violation';
    end if;
  end if;

  update profiles set role = p_rol where id = p_profile_id;
end;
$$;

revoke all on function zet_profiel_rol from public;
grant execute on function zet_profiel_rol to authenticated;

-- -----------------------------------------------------------------------------
-- Dezelfde bescherming bij het rechtstreeks wijzigen van de rol
-- -----------------------------------------------------------------------------
create or replace function guard_laatste_admin() returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_aantal_admins int;
begin
  -- Alleen ingrijpen wanneer iemand ophoudt admin te zijn.
  if old.role = 'admin'
     and (new.role <> 'admin' or new.deleted_at is not null)
  then
    select count(*) into v_aantal_admins
      from profiles
     where role = 'admin' and deleted_at is null and id <> old.id;

    if v_aantal_admins = 0 then
      raise exception 'Er moet ten minste één beheerder overblijven'
        using errcode = 'check_violation';
    end if;
  end if;

  return new;
end;
$$;

create trigger profiles_guard_laatste_admin
  before update on profiles
  for each row execute function guard_laatste_admin();
