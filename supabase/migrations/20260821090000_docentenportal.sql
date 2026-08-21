-- =============================================================================
-- YogaCompany — de docentenportal: collega's zien en een maand afsluiten
--
-- Twee dingen die de vorige migration nog niet kon.
--
-- 1. Een docent moet de naam van een collega kunnen tonen. Op zijn maandstaat
--    staat "3 lessen van Sanne"; zonder naam wordt dat een uuid. Maar RLS op
--    `profiles` laat alleen het eigen profiel door, en dat hoort zo te blijven:
--    het klantenbestand van een collega gaat niemand aan. Er komt daarom een
--    smalle doorkijk die uitsluitend voor- en achternaam geeft, en uitsluitend
--    van mensen die bij dezelfde studio lesgeven. Wie er lesgeeft staat toch al
--    in het rooster.
--
-- 2. Een maand afsluiten. Dat is het moment waarop de bedragen vastliggen en
--    de factuurnummers worden uitgedeeld — en precies daarom mag het niet in
--    de applicatiecode gebeuren. Nummers moeten doorlopen zonder gaten, ook
--    wanneer twee docenten tegelijk op de knop drukken.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Collega's bij naam
-- -----------------------------------------------------------------------------
create or replace function collega_namen()
returns table (profile_id uuid, naam text)
language sql stable security definer set search_path = public as $$
  select distinct p.id, p.first_name || ' ' || p.last_name
    from profiles p
    join studio_teachers st on st.profile_id = p.id
   where p.deleted_at is null
     and st.studio_id in (
       select studio_id from studio_teachers where profile_id = auth.uid()
     );
$$;

comment on function collega_namen is
  'Voor- en achternaam van docenten bij dezelfde studio. Bewust niets meer: geen adres, geen e-mail, geen klanten.';

revoke execute on function collega_namen() from anon, public;
grant execute on function collega_namen() to authenticated;

-- -----------------------------------------------------------------------------
-- 1b. Klanten bij naam
--
-- Op de maandstaat staat "6 aug — M. de Wit — 10-strip". Zonder naam is dat
-- een uuid, en dan kan een docent zijn eigen administratie niet nakijken.
--
-- Een policy op `profiles` zou hier te grof zijn: die geeft de hele rij, dus
-- ook telefoonnummer, geboortedatum en toestemming voor mailings. Vandaar
-- opnieuw een smalle doorkijk met alleen de naam, en alleen van mensen met wie
-- deze docent daadwerkelijk iets te maken heeft:
--
--   * klanten aan wie hij zelf een kaart heeft verkocht — hij factureert erop;
--   * klanten die geboekt hebben op een les die hij geeft — hij moet weten wie
--     er voor de deur staat.
--
-- Alles daarbuiten blijft dicht. Het klantenbestand van een collega gaat een
-- docent niets aan, ook niet als het maar om een naam gaat.
-- -----------------------------------------------------------------------------
create or replace function klant_namen()
returns table (profile_id uuid, naam text)
language sql stable security definer set search_path = public as $$
  select distinct p.id, p.first_name || ' ' || p.last_name
    from profiles p
   where p.deleted_at is null
     and (
       exists (
         select 1 from passes k
          where k.profile_id = p.id
            and k.uitgevende_docent_id = auth.uid()
       )
       or exists (
         select 1 from bookings b
           join class_sessions c on c.id = b.class_session_id
          where b.profile_id = p.id
            and c.docent_id = auth.uid()
       )
     );
$$;

comment on function klant_namen is
  'Namen van klanten met wie de aanroepende docent iets te maken heeft: een door hem verkochte kaart, of een boeking op zijn eigen les.';

revoke execute on function klant_namen() from anon, public;
grant execute on function klant_namen() to authenticated;

-- -----------------------------------------------------------------------------
-- 1c. Eén klant opzoeken om een kaart aan uit te geven
--
-- Een docent kan de klantenlijst niet opvragen, en dat hoort zo: dat zou het
-- hele bestand van de studio openzetten voor iedereen die er lesgeeft. Maar hij
-- moet wél een kaart kunnen vastleggen voor iemand die zojuist bij hem heeft
-- betaald.
--
-- Daarom geen lijst maar een opzoeking: hij typt het adres dat hij van de klant
-- kreeg, en krijgt één naam terug of niets. Wie het adres niet kent, komt hier
-- niet verder.
-- -----------------------------------------------------------------------------
create or replace function zoek_klant_op_email(p_email text)
returns table (profile_id uuid, naam text)
language sql stable security definer set search_path = public as $$
  select p.id, p.first_name || ' ' || p.last_name
    from profiles p
   where is_docent()
     and p.deleted_at is null
     and lower(p.email) = lower(trim(p_email))
   limit 1;
$$;

comment on function zoek_klant_op_email is
  'Zoekt één klant op e-mailadres, zodat een docent een kaart kan vastleggen. Geeft nooit een lijst.';

revoke execute on function zoek_klant_op_email(text) from anon, public;
grant execute on function zoek_klant_op_email(text) to authenticated;

-- -----------------------------------------------------------------------------
-- 2. Een maand afsluiten
--
-- Aangeroepen door de docent die factureert — hij gaf de lessen. Voor elke
-- collega van wie hij dit tijdvak kaarten heeft afgeboekt ontstaat één
-- maandstaat en één factuur.
--
-- Waarom het factuurnummer hier wordt uitgedeeld en niet in de applicatie: de
-- reeks moet doorlopen zonder gaten. `for update` op de regel in
-- `teacher_billing` zorgt dat een tweede aanroep wacht; en omdat het ophogen
-- en het invoegen in dezelfde transactie zitten, laat een mislukte poging geen
-- gat achter.
-- -----------------------------------------------------------------------------
create or replace function sluit_maand_af(p_periode date)
returns int
language plpgsql security definer set search_path = public as $$
declare
  v_mij uuid := auth.uid();
  v_start date := date_trunc('month', p_periode)::date;
  v_eind date := (date_trunc('month', p_periode) + interval '1 month')::date;
  v_billing teacher_billing;
  v_groep record;
  v_staat uuid;
  v_subtotaal int;
  v_btw int;
  v_nummer int;
  v_aantal int := 0;
begin
  if v_mij is null or not is_docent() then
    raise exception 'Alleen docenten kunnen een maand afsluiten'
      using errcode = 'insufficient_privilege';
  end if;

  -- Een maand die nog loopt afsluiten zou betekenen dat er later nog lessen
  -- bij komen die niet meer op de factuur passen.
  if v_eind > current_date then
    raise exception 'Deze maand is nog niet voorbij'
      using errcode = 'check_violation';
  end if;

  select * into v_billing from teacher_billing
   where profile_id = v_mij for update;

  if not found then
    raise exception 'Vul eerst je factuurgegevens in'
      using errcode = 'check_violation';
  end if;

  -- Per collega één staat: alle kruislessen die ik in dit tijdvak gaf op een
  -- kaart die hij heeft uitgegeven.
  for v_groep in
    select p.uitgevende_docent_id as schuldenaar,
           sum(u.verrekenwaarde_centen)::int as subtotaal
      from pass_usages u
      join passes p on p.id = u.pass_id
     where u.docent_die_lesgaf_id = v_mij
       and u.is_kruisgebruik
       and u.status = 'open'
       and u.afgeboekt_op >= v_start
       and u.afgeboekt_op < v_eind
     group by p.uitgevende_docent_id
  loop
    v_subtotaal := v_groep.subtotaal;
    v_btw := round(v_subtotaal * v_billing.btw_tarief_promille / 1000.0);

    insert into settlements (
      periode, van_docent_id, naar_docent_id,
      subtotaal_centen, btw_tarief_promille, btw_centen, totaal_centen,
      status, zichtbaar_vanaf, definitief_op
    ) values (
      v_start, v_groep.schuldenaar, v_mij,
      v_subtotaal, v_billing.btw_tarief_promille, v_btw, v_subtotaal + v_btw,
      'definitief', now(), now()
    )
    on conflict (periode, van_docent_id, naar_docent_id) do nothing
    returning id into v_staat;

    -- Bestond de staat al, dan is deze maand tegenover deze collega al
    -- afgesloten en slaan we hem over. Twee facturen voor dezelfde maand is
    -- erger dan geen.
    if v_staat is null then
      continue;
    end if;

    insert into settlement_lines (settlement_id, pass_usage_id, bedrag_centen)
    select v_staat, u.id, u.verrekenwaarde_centen
      from pass_usages u
      join passes p on p.id = u.pass_id
     where u.docent_die_lesgaf_id = v_mij
       and u.is_kruisgebruik
       and u.status = 'open'
       and p.uitgevende_docent_id = v_groep.schuldenaar
       and u.afgeboekt_op >= v_start
       and u.afgeboekt_op < v_eind;

    update pass_usages u
       set status = 'verrekend'
      from settlement_lines sl
     where sl.settlement_id = v_staat and sl.pass_usage_id = u.id;

    v_nummer := v_billing.volgend_factuurnummer;

    insert into invoices (
      settlement_id, docent_id, factuurnummer, factuurdatum, type,
      subtotaal_centen, btw_tarief_promille, btw_centen, totaal_centen,
      afzender_gegevens, ontvanger_gegevens
    ) values (
      v_staat, v_mij,
      v_billing.factuur_voorvoegsel || '-' ||
        to_char(v_start, 'YYYY') || '-' || lpad(v_nummer::text, 3, '0'),
      current_date, 'factuur',
      v_subtotaal, v_billing.btw_tarief_promille, v_btw, v_subtotaal + v_btw,
      -- Gekopieerd, niet gekoppeld: verhuist een docent volgend jaar, dan mag
      -- deze factuur niet meeveranderen.
      to_jsonb(v_billing) - 'volgend_factuurnummer',
      coalesce(
        (select to_jsonb(b) - 'volgend_factuurnummer' from teacher_billing b
          where b.profile_id = v_groep.schuldenaar),
        jsonb_build_object('profile_id', v_groep.schuldenaar)
      )
    );

    v_billing.volgend_factuurnummer := v_nummer + 1;
    update settlements set status = 'gefactureerd' where id = v_staat;
    v_aantal := v_aantal + 1;
  end loop;

  update teacher_billing
     set volgend_factuurnummer = v_billing.volgend_factuurnummer
   where profile_id = v_mij;

  return v_aantal;
end;
$$;

comment on function sluit_maand_af is
  'Sluit één maand af voor de aanroepende docent: maandstaten, regels en facturen. Deelt de factuurnummers uit onder een vergrendeling, zodat de reeks geen gaten krijgt.';

revoke execute on function sluit_maand_af(date) from anon, public;
grant execute on function sluit_maand_af(date) to authenticated;
