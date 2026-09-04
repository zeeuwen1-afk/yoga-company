-- Vrije blokken onder aan een pagina: de bezoeker ziet uitsluitend wat is
-- gepubliceerd én aan staat, en alleen een admin mag ze beheren.
--
-- De publieke policy leunt op één ding: een blok dat nog niet is gepubliceerd
-- heeft geen volgorde. Als die aanname ooit sneuvelt, staan er concepten op de
-- website. Vandaar dat hij hier expliciet wordt vastgelegd.

do $$
declare
  v_klant uuid := '11111111-1111-1111-1111-111111111111';
  v_admin uuid := '33333333-3333-3333-3333-333333333333';
  v_online uuid;
  v_concept uuid;
  v_uit uuid;
begin
  perform tests.act_as_owner();

  insert into pagina_blokken (page_key, type, volgorde, zichtbaar, inhoud)
  values ('home', 'tekst', 1, true, '{"kop":"Online"}'::jsonb)
  returning id into v_online;

  -- Nooit gepubliceerd: geen volgorde.
  insert into pagina_blokken (page_key, type, volgorde, zichtbaar, concept_inhoud)
  values ('home', 'tekst', null, true, '{"kop":"Concept"}'::jsonb)
  returning id into v_concept;

  -- Gepubliceerd maar uitgezet.
  insert into pagina_blokken (page_key, type, volgorde, zichtbaar, inhoud)
  values ('home', 'tekst', 2, false, '{"kop":"Verborgen"}'::jsonb)
  returning id into v_uit;

  -- --- de anonieme bezoeker -------------------------------------------------
  perform tests.act_as_anon();

  perform tests.expect(
    tests.visible_count(
      format('select 1 from pagina_blokken where id = %L', v_online)
    ) = 1,
    'een bezoeker ziet een gepubliceerd blok'
  );

  perform tests.expect(
    tests.visible_count(
      format('select 1 from pagina_blokken where id = %L', v_concept)
    ) = 0,
    'een bezoeker ziet een blok dat nog nooit is gepubliceerd niet'
  );

  perform tests.expect(
    tests.visible_count(
      format('select 1 from pagina_blokken where id = %L', v_uit)
    ) = 0,
    'een bezoeker ziet een blok dat op verborgen staat niet'
  );

  perform tests.expect(
    tests.mutation_blocked(
      'insert into pagina_blokken (page_key, type) values (''home'', ''tekst'')'
    ),
    'een bezoeker kan geen blok toevoegen'
  );

  -- --- een gewone klant ------------------------------------------------------
  perform tests.act_as(v_klant);

  perform tests.expect(
    tests.visible_count(
      format('select 1 from pagina_blokken where id = %L', v_concept)
    ) = 0,
    'een ingelogde klant ziet de concepten van de site niet'
  );

  perform tests.expect(
    tests.mutation_blocked(format(
      'update pagina_blokken set inhoud = ''{"kop":"Gekaapt"}''::jsonb where id = %L',
      v_online
    )),
    'een klant kan een blok op de site niet wijzigen'
  );

  perform tests.expect(
    tests.mutation_blocked(format(
      'delete from pagina_blokken where id = %L', v_online
    )),
    'een klant kan een blok niet weghalen'
  );

  -- --- de beheerder ----------------------------------------------------------
  perform tests.act_as(v_admin);

  perform tests.expect(
    tests.visible_count('select 1 from pagina_blokken') = 3,
    'de admin ziet alles, ook de concepten en het verborgen blok'
  );

  perform tests.expect(
    not tests.mutation_blocked(format(
      'update pagina_blokken set concept_inhoud = ''{"kop":"Nieuw"}''::jsonb where id = %L',
      v_online
    )),
    'de admin kan een concept schrijven'
  );

  -- --- de vangrails op de kolommen -------------------------------------------
  perform tests.act_as_owner();

  perform tests.expect(
    tests.mutation_blocked(
      'insert into pagina_blokken (page_key, type) values (''home'', ''verzonnen'')'
    ),
    'een bloktype dat niet bestaat wordt geweigerd'
  );

  perform tests.expect(
    tests.mutation_blocked(
      'insert into pagina_blokken (page_key, type, volgorde) values (''home'', ''tekst'', 0)'
    ),
    'een volgorde van nul wordt geweigerd'
  );

  delete from pagina_blokken where page_key = 'home';
end;
$$;
