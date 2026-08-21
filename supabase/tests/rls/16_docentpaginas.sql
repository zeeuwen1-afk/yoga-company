-- =============================================================================
-- Docentenpagina's: van wie is de etalage, en wanneer staat hij aan.
--
-- Dit is de gevaarlijkste tabel van het systeem. Bij de kaarten leverde een
-- fout hooguit een verkeerd bedrag op; hier kan een docent de pagina van een
-- collega beschrijven, en die staat publiek. Vandaar dat de eigendomsregel
-- hier van twee kanten wordt beproefd: lezen én schrijven, en ook de omweg
-- van "een blok toevoegen aan andermans pagina".
--
-- De docenten en het abonnement komen uit 15_docentenlaag.sql: de runner
-- draait alle bestanden in één transactie en laat een geslaagd bestand staan.
--   docent A  77777777-…  betaalt, heeft een pagina
--   docent B  88888888-…  betaalt, heeft een pagina
--   docent C  99999999-…  betaalt niet
-- =============================================================================

do $$
declare
  v_klant_a uuid := '11111111-1111-1111-1111-111111111111';
  v_docent_a uuid := '77777777-7777-7777-7777-777777777777';
  v_docent_b uuid := '88888888-8888-8888-8888-888888888888';
  v_docent_c uuid := '99999999-9999-9999-9999-999999999999';
  v_blok_a uuid;
  v_aantal int;
begin
  -- --- Opbouw ---------------------------------------------------------------
  perform tests.act_as_owner();

  insert into docent_paginas (profile_id, slug, status)
  values
    (v_docent_a, 'trisha', 'gepubliceerd'),
    (v_docent_b, 'sanne', 'concept');

  insert into docent_blokken (pagina_id, type, volgorde, inhoud)
  values (v_docent_a, 'kop_portret', 1, '{"titel":"Rust is geen beloning"}'::jsonb)
  returning id into v_blok_a;

  insert into docent_blokken (pagina_id, type, volgorde, inhoud)
  values
    (v_docent_a, 'over_mij', 2, '{"tekst":"Twaalf jaar geleden…"}'::jsonb),
    (v_docent_b, 'kop_portret', 1, '{"titel":"Sanne"}'::jsonb);

  -- --- Wat een bezoeker ziet ------------------------------------------------
  perform tests.act_as_anon();

  perform tests.expect(
    tests.visible_count('select 1 from docent_paginas') = 1,
    'een bezoeker ziet alleen de gepubliceerde pagina'
  );

  perform tests.expect(
    tests.visible_count(
      'select 1 from docent_paginas where slug = ''sanne'''
    ) = 0,
    'een bezoeker ziet een conceptpagina niet'
  );

  perform tests.expect(
    tests.visible_count('select 1 from docent_blokken') = 2,
    'een bezoeker ziet alleen de blokken van de gepubliceerde pagina'
  );

  -- --- Een blok dat alleen als concept bestaat --------------------------------
  -- `volgorde` leeg betekent: nog niet gepubliceerd. Het mag publiek niet
  -- opduiken, ook niet doordat de pagina zelf wel gepubliceerd is.
  perform tests.act_as_owner();
  insert into docent_blokken (pagina_id, type, volgorde, concept_volgorde, concept_inhoud)
  values (v_docent_a, 'citaat', null, 3, '{"citaat":"nog niet online"}'::jsonb);

  perform tests.act_as_anon();
  perform tests.expect(
    tests.visible_count('select 1 from docent_blokken') = 2,
    'een blok dat alleen als concept bestaat blijft onzichtbaar'
  );

  -- --- Een verborgen blok ---------------------------------------------------
  perform tests.act_as_owner();
  update docent_blokken set zichtbaar = false
   where pagina_id = v_docent_a and type = 'over_mij';

  perform tests.act_as_anon();
  perform tests.expect(
    tests.visible_count('select 1 from docent_blokken') = 1,
    'een verborgen blok verdwijnt van de publieke pagina'
  );

  perform tests.act_as_owner();
  update docent_blokken set zichtbaar = true
   where pagina_id = v_docent_a and type = 'over_mij';

  -- --- Een docent en zijn eigen pagina --------------------------------------
  perform tests.act_as(v_docent_a);

  perform tests.expect(
    tests.visible_count(
      'select 1 from docent_paginas where profile_id = ' || quote_literal(v_docent_a)
    ) = 1,
    'een docent ziet zijn eigen pagina'
  );

  perform tests.expect(
    not tests.mutation_blocked(
      'update docent_blokken set concept_inhoud = ''{"titel":"nieuw"}''::jsonb '
      || 'where id = ' || quote_literal(v_blok_a)
    ),
    'een docent met abonnement kan zijn eigen blok bewerken'
  );

  -- --- En de pagina van een collega -----------------------------------------
  perform tests.act_as(v_docent_b);

  perform tests.expect(
    tests.visible_count(
      'select 1 from docent_paginas where profile_id = ' || quote_literal(v_docent_a)
    ) = 1,
    'docent B ziet de pagina van A alleen omdat die gepubliceerd is'
  );

  perform tests.expect(
    tests.mutation_blocked(
      'update docent_paginas set slug = ''gekaapt'' where profile_id = '
      || quote_literal(v_docent_a)
    ),
    'docent B kan de pagina van docent A niet wijzigen'
  );

  perform tests.expect(
    tests.mutation_blocked(
      'update docent_blokken set concept_inhoud = ''{"titel":"gekaapt"}''::jsonb '
      || 'where id = ' || quote_literal(v_blok_a)
    ),
    'docent B kan een blok van docent A niet beschrijven'
  );

  -- De omweg: niet het blok van een ander wijzigen maar er een bijzetten.
  perform tests.expect(
    tests.mutation_blocked(
      'insert into docent_blokken (pagina_id, type, volgorde) values ('
      || quote_literal(v_docent_a) || ', ''tekst'', 9)'
    ),
    'docent B kan geen blok toevoegen aan de pagina van docent A'
  );

  perform tests.expect(
    tests.mutation_blocked(
      'delete from docent_blokken where id = ' || quote_literal(v_blok_a)
    ),
    'docent B kan een blok van docent A niet weggooien'
  );

  -- --- Zonder abonnement: kijken mag, aanraken niet -------------------------
  perform tests.act_as_owner();
  insert into docent_paginas (profile_id, slug, status)
  values (v_docent_c, 'ilse', 'gepubliceerd');

  perform tests.act_as_anon();
  perform tests.expect(
    tests.visible_count(
      'select 1 from docent_paginas where slug = ''ilse'''
    ) = 0,
    'de pagina van een docent zonder abonnement staat niet online'
  );

  perform tests.act_as(v_docent_c);
  perform tests.expect(
    tests.visible_count(
      'select 1 from docent_paginas where profile_id = ' || quote_literal(v_docent_c)
    ) = 1,
    'die docent ziet zijn eigen pagina zelf nog wel'
  );

  perform tests.expect(
    tests.mutation_blocked(
      'update docent_paginas set seo_titel = ''x'' where profile_id = '
      || quote_literal(v_docent_c)
    ),
    'zonder abonnement kan een docent zijn eigen pagina niet bewerken'
  );

  -- --- Het respijt van dertig dagen -----------------------------------------
  perform tests.act_as_owner();
  insert into teacher_subscriptions (profile_id, bedrag_centen, ingangsdatum, actief, respijt_tot)
  values (v_docent_c, 2500, current_date - 60, false, current_date + 10);

  perform tests.act_as_anon();
  perform tests.expect(
    tests.visible_count(
      'select 1 from docent_paginas where slug = ''ilse'''
    ) = 1,
    'tijdens het respijt blijft de pagina online'
  );

  perform tests.act_as(v_docent_c);
  perform tests.expect(
    tests.mutation_blocked(
      'update docent_paginas set seo_titel = ''x'' where profile_id = '
      || quote_literal(v_docent_c)
    ),
    'maar bewerken is tijdens het respijt al gestopt'
  );

  perform tests.act_as_owner();
  update teacher_subscriptions set respijt_tot = current_date - 1
   where profile_id = v_docent_c;

  perform tests.act_as_anon();
  perform tests.expect(
    tests.visible_count(
      'select 1 from docent_paginas where slug = ''ilse'''
    ) = 0,
    'na het respijt valt de pagina offline'
  );

  -- --- Een klant is geen docent ---------------------------------------------
  perform tests.act_as(v_klant_a);
  perform tests.expect(
    tests.mutation_blocked(
      'insert into docent_paginas (profile_id, slug) values ('
      || quote_literal(v_klant_a) || ', ''klantpagina'')'
    ),
    'een klant kan geen docentenpagina aanmaken'
  );

  -- --- Publiceren -----------------------------------------------------------
  -- De kop hoort altijd voorop te blijven staan, ook als de docent er een blok
  -- bovenop probeerde te zetten.
  perform tests.act_as_owner();
  update docent_blokken set concept_volgorde = 1
   where pagina_id = v_docent_a and type = 'over_mij';

  perform tests.act_as(v_docent_a);
  select publiceer_docentpagina() into v_aantal;

  perform tests.act_as_owner();

  perform tests.expect(
    (select volgorde from docent_blokken
      where pagina_id = v_docent_a and type = 'kop_portret') = 1,
    'de kop met het portret blijft na publiceren op de eerste plaats staan'
  );

  perform tests.expect(
    (select count(*) from docent_blokken
      where pagina_id = v_docent_a and concept_volgorde is not null) = 0,
    'na publiceren zijn de conceptkolommen leeg'
  );

  perform tests.expect(
    (select volgorde is not null from docent_blokken
      where pagina_id = v_docent_a and type = 'citaat'),
    'een blok dat alleen als concept bestond staat na publiceren wel online'
  );

  -- --- Weggooien gebeurt pas bij publiceren ---------------------------------
  update docent_blokken set concept_verwijderd = true
   where pagina_id = v_docent_a and type = 'citaat';

  perform tests.act_as_anon();
  perform tests.expect(
    tests.visible_count(
      'select 1 from docent_blokken where pagina_id = ' || quote_literal(v_docent_a)
    ) = 2,
    'een blok dat weggegooid gaat worden verdwijnt meteen van de publieke pagina'
  );

  perform tests.act_as(v_docent_a);
  perform publiceer_docentpagina();

  perform tests.act_as_owner();
  perform tests.expect(
    (select count(*) from docent_blokken
      where pagina_id = v_docent_a and type = 'citaat') = 0,
    'en is na publiceren echt weg'
  );

  -- --- Zonder abonnement kun je niet publiceren -----------------------------
  perform tests.act_as(v_docent_c);
  perform tests.expect(
    tests.mutation_blocked('select publiceer_docentpagina()'),
    'publiceren zonder lopend abonnement wordt geweigerd'
  );

  -- --- De slug is streng ----------------------------------------------------
  perform tests.act_as_owner();

  perform tests.expect(
    tests.mutation_blocked(
      'insert into docent_paginas (profile_id, slug) values ('
      || quote_literal(v_klant_a) || ', ''Trisha Yoga'')'
    ),
    'een slug met hoofdletters en spaties wordt geweigerd'
  );

  perform tests.expect(
    tests.mutation_blocked(
      'insert into docent_paginas (profile_id, slug) values ('
      || quote_literal(v_klant_a) || ', ''admin'')'
    ),
    'een gereserveerd woord kan het pad niet kapen'
  );

  -- --- Beeld blijft in de eigen map -----------------------------------------
  perform tests.expect(
    tests.mutation_blocked(
      'insert into docent_media (profile_id, pad, bestandsnaam, bytes) values ('
      || quote_literal(v_docent_a) || ', ''docent/'
      || v_docent_b::text || '/foto.jpg'', ''foto.jpg'', 1000)'
    ),
    'een foto kan niet worden weggeschreven in de map van een collega'
  );

  perform tests.expect(
    tests.mutation_blocked(
      'insert into docent_media (profile_id, pad, bestandsnaam, bytes) values ('
      || quote_literal(v_docent_a) || ', ''docent/' || v_docent_a::text
      || '/groot.jpg'', ''groot.jpg'', 5000000)'
    ),
    'een bestand van vijf megabyte wordt geweigerd'
  );

  perform tests.act_as_owner();
end;
$$;
