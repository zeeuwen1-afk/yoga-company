-- De beheerfuncties mogen niet via de API bereikbaar zijn voor wie geen
-- beheerder is. Zie migration 20260813120000_functierechten.sql.
--
-- De aanleiding: de bewaking in die functies luidt "is_admin() of geen sessie".
-- Een anonieme bezoeker heeft óók geen sessie, dus die bewaking alleen is niet
-- genoeg — het uitvoerrecht moet weg bij `anon`. Deze test legt dat vast. Zou
-- iemand de grant later opnieuw uitdelen, dan valt de suite om.

do $$
declare
  v_klant_a uuid := '11111111-1111-1111-1111-111111111111';
  v_klant_b uuid := '22222222-2222-2222-2222-222222222222';
  v_rol_gelukt boolean;
  v_voor text;
  v_na text;
begin
  -- De testbestanden delen één transactie, dus eerdere tests hebben de
  -- fixtures al aangeraakt. We leggen daarom vast hoe klant B er nú bij staat
  -- en kijken achteraf of de aanvallen daar iets aan hebben veranderd.
  perform tests.act_as_owner();
  select coalesce(first_name || '|' || last_name || '|' || email, 'weg')
    into v_voor
    from profiles where id = v_klant_b;

  -- --- anonieme bezoeker ----------------------------------------------------
  perform tests.act_as_anon();

  perform tests.expect(
    not has_function_privilege('anon', 'zet_profiel_rol(uuid, user_role)', 'execute'),
    'anon mag zet_profiel_rol niet uitvoeren'
  );

  perform tests.expect(
    not has_function_privilege('anon', 'anonimiseer_profiel(uuid)', 'execute'),
    'anon mag anonimiseer_profiel niet uitvoeren'
  );

  perform tests.expect(
    not has_function_privilege('anon', 'zet_profiel_actief(uuid, boolean)', 'execute'),
    'anon mag zet_profiel_actief niet uitvoeren'
  );

  perform tests.expect(
    not has_function_privilege('anon', 'opruimen_bewaartermijnen()', 'execute'),
    'anon mag de opschoontaak niet uitvoeren'
  );

  -- Niet alleen het recht op papier: de aanroep zelf moet stuklopen.
  perform tests.expect(
    tests.mutation_blocked(
      'select zet_profiel_rol(' || quote_literal(v_klant_a) || ', ''admin'')'
    ),
    'een anonieme bezoeker kan zichzelf niet tot beheerder maken'
  );

  perform tests.expect(
    tests.mutation_blocked(
      'select anonimiseer_profiel(' || quote_literal(v_klant_b) || ')'
    ),
    'een anonieme bezoeker kan het profiel van een klant niet wissen'
  );

  -- --- ingelogde klant ------------------------------------------------------
  perform tests.act_as(v_klant_a);

  perform tests.expect(
    tests.mutation_blocked(
      'select zet_profiel_rol(' || quote_literal(v_klant_a) || ', ''admin'')'
    ),
    'een klant kan zichzelf niet tot beheerder maken'
  );

  perform tests.expect(
    tests.mutation_blocked(
      'select anonimiseer_profiel(' || quote_literal(v_klant_b) || ')'
    ),
    'een klant kan het profiel van een andere klant niet wissen'
  );

  perform tests.expect(
    tests.mutation_blocked('select opruimen_bewaartermijnen()'),
    'een klant kan de opschoontaak niet uitvoeren'
  );

  -- Het bewijs dat de aanval hierboven ook echt niets heeft uitgericht.
  perform tests.act_as_owner();

  select exists (
    select 1 from profiles where id = v_klant_a and role = 'admin'
  ) into v_rol_gelukt;

  perform tests.expect(
    not v_rol_gelukt,
    'klant A is na alle pogingen nog steeds geen beheerder'
  );

  select coalesce(first_name || '|' || last_name || '|' || email, 'weg')
    into v_na
    from profiles where id = v_klant_b;

  perform tests.expect(
    v_na is not distinct from v_voor,
    'het profiel van klant B is door de pogingen niet veranderd'
  );

  -- --- triggerfuncties zijn niet rechtstreeks aanroepbaar --------------------
  perform tests.expect(
    not has_function_privilege('anon', 'handle_new_user()', 'execute')
    and not has_function_privilege('authenticated', 'handle_new_user()', 'execute'),
    'niemand kan handle_new_user rechtstreeks aanroepen'
  );

  perform tests.expect(
    not has_function_privilege('anon', 'guard_profile_columns()', 'execute')
    and not has_function_privilege(
      'authenticated', 'guard_profile_columns()', 'execute'
    ),
    'niemand kan guard_profile_columns rechtstreeks aanroepen'
  );

  -- --- wat wél open moet blijven --------------------------------------------
  -- Deze drie worden gebruikt in policies die ook voor bezoekers gelden. Staan
  -- ze dicht, dan valt de publieke site om.
  perform tests.expect(
    has_function_privilege('anon', 'is_admin()', 'execute')
    and has_function_privilege('authenticated', 'is_admin()', 'execute'),
    'is_admin blijft aanroepbaar voor de policies'
  );

  perform tests.expect(
    has_function_privilege('anon', 'course_id_for_lesson(uuid)', 'execute')
    and has_function_privilege('authenticated', 'has_course_access(uuid)', 'execute'),
    'de toegangscontroles op lesmateriaal blijven aanroepbaar'
  );
end $$;
