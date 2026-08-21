-- =============================================================================
-- De docentenlaag: kaarten, afboekingen en maandstaten.
--
-- De kern van deze laag is een belofte aan de docenten onderling: je ziet je
-- eigen verkoop en wat daarop gebeurt, en verder niets van een collega. Dat is
-- geen keuze in een scherm maar een regel in de database, en hier staat het
-- bewijs.
--
-- De drie docenten worden in dít bestand aangemaakt en niet in de gedeelde
-- fixtures. Zouden ze daar staan, dan schuiven de aantallen in de bestaande
-- tests die absolute tellingen doen.
--
--   docent A  77777777-…  verkoopt de kaart
--   docent B  88888888-…  geeft de les
--   docent C  99999999-…  staat er buiten en mag niets zien
--
-- Let op bij het kiezen van nieuwe UUID's: de runner draait alle testbestanden
-- in één transactie en rolt alleen terug wanneer een bestand faalt. Een
-- geslaagd bestand laat zijn rijen dus staan voor de volgende. `44444444-…`
-- was daardoor al bezet door 06_registratie.sql.
-- =============================================================================

do $$
declare
  v_klant_a uuid := '11111111-1111-1111-1111-111111111111';
  v_klant_b uuid := '22222222-2222-2222-2222-222222222222';
  v_docent_a uuid := '77777777-7777-7777-7777-777777777777';
  v_docent_b uuid := '88888888-8888-8888-8888-888888888888';
  v_docent_c uuid := '99999999-9999-9999-9999-999999999999';
  v_studio uuid := 'bbbbbbbb-0000-0000-0000-000000000001';
  v_studio_2 uuid := 'bbbbbbbb-0000-0000-0000-000000000002';
  v_product uuid := 'cccccccc-0000-0000-0000-000000000001';
  v_snuffel uuid := 'cccccccc-0000-0000-0000-000000000002';
  v_les_b uuid := 'dddddddd-1111-0000-0000-000000000001';
  v_les_a uuid := 'dddddddd-1111-0000-0000-000000000002';
  v_kaart uuid := 'eeeeeeee-0000-0000-0000-000000000001';
  v_kaart_b uuid := 'eeeeeeee-0000-0000-0000-000000000002';
  v_afboeking uuid;
  v_staat uuid := 'ffffffff-0000-0000-0000-000000000001';
  v_bevroren int;
begin
  -- --- Opbouw ---------------------------------------------------------------
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  )
  values
    ('00000000-0000-0000-0000-000000000000', v_docent_a, 'authenticated',
     'authenticated', 'docent-a@rls-test.invalid', 'x', now(), now(), now(),
     '{"first_name":"Docent","last_name":"A"}'::jsonb),
    ('00000000-0000-0000-0000-000000000000', v_docent_b, 'authenticated',
     'authenticated', 'docent-b@rls-test.invalid', 'x', now(), now(), now(),
     '{"first_name":"Docent","last_name":"B"}'::jsonb),
    ('00000000-0000-0000-0000-000000000000', v_docent_c, 'authenticated',
     'authenticated', 'docent-c@rls-test.invalid', 'x', now(), now(), now(),
     '{"first_name":"Docent","last_name":"C"}'::jsonb);

  insert into studios (id, naam, plaats, max_deelnemers)
  values
    (v_studio, 'Teststudio Almere', 'Almere', 8),
    (v_studio_2, 'Teststudio elders', 'Aalsmeer', 8);

  insert into studio_teachers (studio_id, profile_id)
  values (v_studio, v_docent_a), (v_studio, v_docent_b), (v_studio, v_docent_c);

  insert into pass_products (
    id, studio_id, naam, aantal_lessen, prijs_centen, verrekenwaarde_centen,
    geldigheid_dagen, kruisgebruik_toegestaan
  )
  values
    (v_product, v_studio, '10-strippenkaart', 10, 14500, 1330, 90, true),
    (v_snuffel, v_studio, 'Snuffelkaart', 3, 900, null, 30, false);

  insert into class_sessions (
    id, title, starts_at, location, capacity, studio_id, docent_id
  )
  values
    (v_les_b, 'Les van docent B', now() + interval '7 days',
     'Almere', 8, v_studio, v_docent_b),
    (v_les_a, 'Les van docent A', now() + interval '8 days',
     'Almere', 8, v_studio, v_docent_a);

  insert into passes (
    id, profile_id, product_id, uitgevende_docent_id, saldo, geldig_tot
  )
  values
    (v_kaart, v_klant_a, v_product, v_docent_a, 10, current_date + 90),
    (v_kaart_b, v_klant_b, v_product, v_docent_b, 10, current_date + 90);

  -- --- Klant A boekt met zijn kaart een les bij docent B ---------------------
  perform tests.act_as(v_klant_a);
  perform boek_les(v_les_b, v_kaart);
  perform tests.act_as_owner();

  select id into v_afboeking from pass_usages where pass_id = v_kaart;

  perform tests.expect(
    v_afboeking is not null,
    'boeken met een kaart levert een afboeking op'
  );

  perform tests.expect(
    (select is_kruisgebruik from pass_usages where id = v_afboeking),
    'een les bij een andere docent telt als kruisgebruik'
  );

  perform tests.expect(
    (select saldo from passes where id = v_kaart) = 9,
    'er gaat één strip van de kaart af'
  );

  -- --- De verrekenwaarde is bevroren ----------------------------------------
  -- Dit is de belangrijkste belofte van het hele ontwerp: een tarief wijzigen
  -- mag een verstuurde factuur nooit veranderen.
  select verrekenwaarde_centen into v_bevroren
    from pass_usages where id = v_afboeking;

  update pass_products set verrekenwaarde_centen = 9999 where id = v_product;

  perform tests.expect(
    (select verrekenwaarde_centen from pass_usages where id = v_afboeking)
      = v_bevroren
      and v_bevroren = 1330,
    'een tariefwijziging raakt een bestaande afboeking niet'
  );

  update pass_products set verrekenwaarde_centen = 1330 where id = v_product;

  -- --- Een kaart geldt bij precies één studio -------------------------------
  update class_sessions set studio_id = v_studio_2 where id = v_les_a;
  perform tests.act_as(v_klant_a);

  perform tests.expect(
    tests.mutation_blocked(
      'select boek_les(' || quote_literal(v_les_a) || ', '
        || quote_literal(v_kaart) || ')'
    ),
    'een kaart van de ene studio werkt niet bij een les van de andere'
  );

  perform tests.act_as_owner();
  update class_sessions set studio_id = v_studio where id = v_les_a;

  -- --- Een kaart zonder kruisgebruik blijft bij de eigen docent -------------
  insert into passes (profile_id, product_id, uitgevende_docent_id, saldo)
  values (v_klant_b, v_snuffel, v_docent_a, 3);

  perform tests.act_as(v_klant_b);

  perform tests.expect(
    tests.mutation_blocked(
      'select boek_les(' || quote_literal(v_les_b) || ', '
        || quote_literal((select id from passes
                           where profile_id = '22222222-2222-2222-2222-222222222222'
                             and product_id = 'cccccccc-0000-0000-0000-000000000002')) || ')'
    ),
    'een snuffelkaart geldt niet bij een andere docent'
  );

  -- --- Klanten zien elkaars kaarten niet ------------------------------------
  perform tests.act_as(v_klant_b);

  perform tests.expect(
    tests.visible_count(
      'select 1 from passes where id = ' || quote_literal(v_kaart)
    ) = 0,
    'klant B ziet de kaart van klant A niet'
  );

  perform tests.act_as(v_klant_a);

  perform tests.expect(
    tests.visible_count(
      'select 1 from passes where id = ' || quote_literal(v_kaart)
    ) = 1,
    'klant A ziet zijn eigen kaart wel'
  );

  -- --- Docenten zien elkaars kaarten niet -----------------------------------
  perform tests.act_as(v_docent_b);

  perform tests.expect(
    tests.visible_count(
      'select 1 from passes where id = ' || quote_literal(v_kaart)
    ) = 0,
    'docent B kan de kaart van docent A niet lezen'
  );

  perform tests.act_as(v_docent_a);

  perform tests.expect(
    tests.visible_count(
      'select 1 from passes where id = ' || quote_literal(v_kaart)
    ) = 1,
    'docent A ziet de kaart die hij zelf uitgaf'
  );

  perform tests.expect(
    tests.visible_count(
      'select 1 from passes where id = ' || quote_literal(v_kaart_b)
    ) = 0,
    'docent A ziet de kaart van docent B niet'
  );

  -- --- De uitgever ziet wat er bij een collega gebeurt ----------------------
  -- Hij betaalt ervoor, dus hij moet het kunnen nakijken.
  perform tests.expect(
    tests.visible_count(
      'select 1 from pass_usages where id = ' || quote_literal(v_afboeking)
    ) = 1,
    'docent A ziet de afboeking die bij docent B plaatsvond'
  );

  perform tests.act_as(v_docent_b);

  perform tests.expect(
    tests.visible_count(
      'select 1 from pass_usages where id = ' || quote_literal(v_afboeking)
    ) = 1,
    'docent B ziet de afboeking van de les die hij gaf'
  );

  perform tests.act_as(v_docent_c);

  perform tests.expect(
    tests.visible_count(
      'select 1 from pass_usages where id = ' || quote_literal(v_afboeking)
    ) = 0,
    'docent C staat er buiten en ziet de afboeking niet'
  );

  -- --- De deelnemerslijst hoort bij de eigen les ----------------------------
  perform tests.act_as(v_docent_b);

  perform tests.expect(
    tests.visible_count(
      'select 1 from bookings where class_session_id = ' || quote_literal(v_les_b)
    ) = 1,
    'docent B ziet wie er in zijn eigen les zit'
  );

  perform tests.act_as(v_docent_c);

  perform tests.expect(
    tests.visible_count(
      'select 1 from bookings where class_session_id = ' || quote_literal(v_les_b)
    ) = 0,
    'docent C ziet de deelnemerslijst van een andere docent niet'
  );

  -- --- Maandstaten zijn van de twee betrokkenen ----------------------------
  perform tests.act_as_owner();

  insert into settlements (
    id, periode, van_docent_id, naar_docent_id,
    subtotaal_centen, btw_centen, totaal_centen
  )
  values (
    v_staat, date_trunc('month', current_date)::date, v_docent_a, v_docent_b,
    1330, 279, 1609
  );

  perform tests.act_as(v_docent_a);
  perform tests.expect(
    tests.visible_count(
      'select 1 from settlements where id = ' || quote_literal(v_staat)
    ) = 1,
    'docent A ziet de maandstaat waarop hij moet betalen'
  );

  perform tests.act_as(v_docent_b);
  perform tests.expect(
    tests.visible_count(
      'select 1 from settlements where id = ' || quote_literal(v_staat)
    ) = 1,
    'docent B ziet de maandstaat waarop hij ontvangt'
  );

  perform tests.act_as(v_docent_c);
  perform tests.expect(
    tests.visible_count(
      'select 1 from settlements where id = ' || quote_literal(v_staat)
    ) = 0,
    'docent C ziet de maandstaat tussen A en B niet'
  );

  -- --- Een docent kan geen kaart op naam van een collega uitgeven -----------
  perform tests.act_as(v_docent_c);

  perform tests.expect(
    tests.mutation_blocked(
      'insert into passes (profile_id, product_id, uitgevende_docent_id, saldo) '
      || 'values (' || quote_literal(v_klant_a) || ', '
      || quote_literal(v_product) || ', ' || quote_literal(v_docent_a) || ', 10)'
    ),
    'een docent kan geen kaart uitgeven op naam van een collega'
  );

  -- --- De capaciteit van een les past in de ruimte --------------------------
  perform tests.act_as_owner();

  perform tests.expect(
    tests.mutation_blocked(
      'update class_sessions set capacity = 20 where id = ' || quote_literal(v_les_b)
    ),
    'een les kan niet meer plekken krijgen dan de studio heeft'
  );

  -- --- Factuurgegevens blijven privé ---------------------------------------
  insert into teacher_billing (
    profile_id, bedrijfsnaam, adres, postcode, plaats
  ) values (v_docent_a, 'Docent A', 'Straat 1', '1300 AA', 'Almere');

  perform tests.act_as(v_docent_b);

  perform tests.expect(
    tests.visible_count(
      'select 1 from teacher_billing where profile_id = ' || quote_literal(v_docent_a)
    ) = 0,
    'een docent ziet de factuurgegevens van een collega niet'
  );

  perform tests.act_as_owner();
end;
$$;
