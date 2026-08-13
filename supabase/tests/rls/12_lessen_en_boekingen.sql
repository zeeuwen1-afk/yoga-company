-- Het lesrooster is openbaar, de boekingen zijn dat beslist niet. En de
-- capaciteit moet houden, ook als iemand de applicatie omzeilt.

do $$
declare
  v_klant_a uuid := '11111111-1111-1111-1111-111111111111';
  v_klant_b uuid := '22222222-2222-2222-2222-222222222222';
  v_admin uuid := '33333333-3333-3333-3333-333333333333';
  v_les uuid;
  v_vol uuid;
  v_verborgen uuid;
  v_status booking_status;
begin
  perform tests.act_as_owner();

  -- Eén plek in de eerste les: dan is met twee testklanten al te zien dat de
  -- capaciteit houdt en dat de tweede op de wachtlijst belandt.
  insert into class_sessions (title, starts_at, location, capacity)
  values ('Yin op maandag', now() + interval '3 days', 'Studio', 1)
  returning id into v_les;

  insert into class_sessions (title, starts_at, location, capacity)
  values ('Kleine les', now() + interval '4 days', 'Studio', 1)
  returning id into v_vol;

  insert into class_sessions (title, starts_at, location, capacity, is_published)
  values ('Nog niet af', now() + interval '5 days', 'Studio', 10, false)
  returning id into v_verborgen;

  -- --- bezoeker -------------------------------------------------------------
  perform tests.act_as_anon();

  perform tests.expect(
    tests.visible_count(
      'select 1 from class_sessions_public where id = ' || quote_literal(v_les)
    ) = 1,
    'een bezoeker ziet het gepubliceerde rooster'
  );

  perform tests.expect(
    tests.visible_count(
      'select 1 from class_sessions_public where id = ' || quote_literal(v_verborgen)
    ) = 0,
    'een bezoeker ziet een concept-les niet'
  );

  perform tests.expect(
    tests.visible_count('select 1 from bookings') = 0,
    'een bezoeker ziet geen boekingen'
  );

  perform tests.expect(
    not has_function_privilege('anon', 'boek_les(uuid)', 'execute'),
    'een bezoeker kan niet boeken zonder in te loggen'
  );

  -- --- klant A boekt --------------------------------------------------------
  perform tests.act_as(v_klant_a);

  select boek_les(v_les) into v_status;
  perform tests.expect(v_status = 'geboekt', 'klant A krijgt een plek');

  perform tests.expect(
    tests.mutation_blocked('select boek_les(' || quote_literal(v_les) || ')'),
    'twee keer dezelfde les boeken kan niet'
  );

  perform tests.expect(
    tests.mutation_blocked(
      'select boek_les(' || quote_literal(v_verborgen) || ')'
    ),
    'een concept-les is niet te boeken'
  );

  -- --- klantscheiding -------------------------------------------------------
  perform tests.act_as(v_klant_b);

  perform tests.expect(
    tests.visible_count('select 1 from bookings') = 0,
    'klant B ziet de boeking van klant A niet'
  );

  -- --- de capaciteit houdt --------------------------------------------------
  select boek_les(v_les) into v_status;
  perform tests.expect(
    v_status = 'wachtlijst',
    'wie te laat is komt op de wachtlijst in plaats van in een volle les'
  );

  perform tests.expect(
    tests.visible_count('select 1 from bookings') = 1,
    'klant B ziet uitsluitend de eigen boeking'
  );

  perform tests.act_as_owner();
  perform tests.expect(vrije_plekken(v_les) = 0, 'de les zit vol');

  perform tests.expect(
    (select count(*) from bookings
      where class_session_id = v_les and status = 'geboekt') = 1,
    'er staan niet meer mensen in de les dan er plekken zijn'
  );

  -- --- een klant kan de wachtlijst niet omzeilen ----------------------------
  perform tests.act_as(v_klant_b);
  perform tests.expect(
    tests.mutation_blocked(
      'update bookings set status = ''geboekt'' where profile_id = '
      || quote_literal(v_klant_b)
    ),
    'de eigen boeking van wachtlijst naar geboekt zetten kan niet via de tabel'
  );

  perform tests.expect(
    tests.mutation_blocked(
      'insert into bookings (class_session_id, profile_id, status) values ('
      || quote_literal(v_vol) || ', ' || quote_literal(v_klant_b)
      || ', ''geboekt'')'
    ),
    'een klant kan zichzelf niet rechtstreeks in een les schrijven'
  );

  perform tests.expect(
    tests.mutation_blocked(
      'insert into class_sessions (title, starts_at, location, capacity) '
      || 'values (''Eigen les'', now() + interval ''1 day'', ''Thuis'', 5)'
    ),
    'een klant kan geen les aan het rooster toevoegen'
  );

  -- --- annuleren laat de wachtlijst doorschuiven ----------------------------
  perform tests.act_as(v_klant_a);
  perform annuleer_boeking(v_les);

  perform tests.act_as_owner();
  perform tests.expect(
    (select status from bookings
      where class_session_id = v_les and profile_id = v_klant_b) = 'geboekt',
    'de eerste wachtlijster schuift door zodra er een plek vrijkomt'
  );

  perform tests.expect(
    (select status from bookings
      where class_session_id = v_les and profile_id = v_klant_a) = 'geannuleerd',
    'de annulering staat geregistreerd'
  );

  -- --- annuleren kan niet vlak voor aanvang ---------------------------------
  perform tests.act_as_owner();
  update class_sessions set starts_at = now() + interval '1 hour'
   where id = v_vol;

  perform tests.act_as(v_klant_a);
  select boek_les(v_vol) into v_status;
  perform tests.expect(v_status = 'geboekt', 'klant A boekt de kleine les');

  perform tests.expect(
    tests.mutation_blocked(
      'select annuleer_boeking(' || quote_literal(v_vol) || ')'
    ),
    'annuleren binnen vier uur voor aanvang wordt geweigerd'
  );

  -- --- een les die al is begonnen is niet meer te boeken --------------------
  perform tests.act_as_owner();
  update class_sessions set starts_at = now() - interval '1 hour'
   where id = v_vol;

  perform tests.act_as(v_klant_b);
  perform tests.expect(
    tests.mutation_blocked('select boek_les(' || quote_literal(v_vol) || ')'),
    'een les uit het verleden is niet te boeken'
  );

  -- --- de beheerder ---------------------------------------------------------
  perform tests.act_as(v_admin);
  perform tests.expect(
    tests.visible_count(
      'select 1 from bookings where class_session_id = ' || quote_literal(v_les)
    ) = 2,
    'de beheerder ziet de volledige deelnemerslijst, ook de annulering'
  );

  perform tests.expect(
    tests.visible_count(
      'select 1 from class_sessions where id = ' || quote_literal(v_verborgen)
    ) = 1,
    'de beheerder ziet ook de concepten in het rooster'
  );
end $$;
