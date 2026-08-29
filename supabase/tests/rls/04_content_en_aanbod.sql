-- Betaalde content is pas zichtbaar na een betaalde inschrijving; proeflessen
-- zijn voor iedereen toegankelijk (BOUWPROMPT §6, §12).

do $$
declare
  v_klant_a uuid := '11111111-1111-1111-1111-111111111111';  -- heeft betaald
  v_klant_b uuid := '22222222-2222-2222-2222-222222222222';  -- in afwachting
  v_admin uuid := '33333333-3333-3333-3333-333333333333';
begin
  -- --- anonieme bezoeker -----------------------------------------------------
  perform tests.act_as_anon();

  perform tests.expect(
    tests.visible_count('select 1 from content_items') = 1,
    'een anonieme bezoeker ziet uitsluitend de proefles'
  );

  perform tests.expect(
    tests.visible_count(
      'select 1 from content_items where is_preview = false'
    ) = 0,
    'een anonieme bezoeker ziet geen betaalde content'
  );

  perform tests.expect(
    tests.visible_count('select 1 from courses') = 1,
    'een anonieme bezoeker ziet alleen actief aanbod'
  );

  perform tests.expect(
    tests.visible_count('select 1 from courses where is_active = false') = 0,
    'inactief aanbod blijft verborgen'
  );

  -- --- klant B: ingeschreven maar nog niet betaald ---------------------------
  perform tests.act_as(v_klant_b);

  perform tests.expect(
    tests.visible_count('select 1 from content_items') = 1,
    'klant B ziet zonder betaling alleen de proefles'
  );

  perform tests.expect(
    tests.visible_count(
      'select 1 from content_items where is_preview = false'
    ) = 0,
    'een inschrijving in afwachting geeft geen toegang tot betaalde content'
  );

  -- --- klant A: betaald ------------------------------------------------------
  perform tests.act_as(v_klant_a);

  perform tests.expect(
    tests.visible_count('select 1 from content_items') = 2,
    'klant A ziet na betaling alle content van de opleiding'
  );

  perform tests.expect(
    tests.mutation_blocked(
      'update content_items set title = ''Gekaapt'' '
      || 'where id = ''dddddddd-0000-0000-0000-000000000001'''
    ),
    'klant A kan content wel lezen maar niet wijzigen'
  );

  -- --- CMS-blokken: concepten mogen niet uitlekken ---------------------------
  perform tests.act_as_anon();

  perform tests.expect(
    tests.visible_count('select 1 from content_blocks_public') = 2,
    'de publieke view toont gepubliceerde blokken'
  );

  -- Een verborgen blok blijft in de view staan, maar zonder zijn inhoud. De
  -- rij is nodig omdat de site anders terugvalt op de startinhoud uit de code;
  -- de tekst is dat niet, en een aankondiging die nog niet mag hoort niet
  -- vandaag al in de API te staan.
  perform tests.expect(
    (select zichtbaar from content_blocks_public
     where block_key = 'banner_tekst') = false,
    'de publieke view vertelt dat een blok verborgen is'
  );

  perform tests.expect(
    (select value from content_blocks_public
     where block_key = 'banner_tekst') is null,
    'de inhoud van een verborgen blok verlaat de database niet'
  );

  perform tests.expect(
    (select value ->> 'text' from content_blocks_public
     where block_key = 'hero_titel') = 'Gepubliceerde titel',
    'de publieke view toont de gepubliceerde tekst'
  );

  perform tests.expect(
    tests.visible_count('select 1 from content_blocks') = 0,
    'de blokkentabel zelf is niet publiek leesbaar, dus concepten lekken niet'
  );

  perform tests.act_as(v_klant_a);

  perform tests.expect(
    tests.visible_count('select 1 from content_blocks') = 0,
    'ook een ingelogde klant ziet geen concepten'
  );

  -- --- admin -----------------------------------------------------------------
  perform tests.act_as(v_admin);

  perform tests.expect(
    tests.visible_count('select 1 from content_items') = 2,
    'de admin ziet alle content'
  );

  perform tests.expect(
    tests.visible_count('select 1 from courses') = 2,
    'de admin ziet ook inactief aanbod'
  );

  perform tests.expect(
    (select draft_value ->> 'text' from content_blocks
     where block_key = 'hero_titel') = 'GEHEIM CONCEPT',
    'de admin ziet het concept wel'
  );

  perform tests.act_as_owner();
end;
$$;
