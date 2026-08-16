-- Bestellingen zijn de financiële kant van een aankoop. Een klant mag de eigen
-- bestellingen inzien en verder niets: het bedrag bepaalt de server, niet de
-- browser.

do $$
declare
  v_klant_a uuid := '11111111-1111-1111-1111-111111111111';
  v_klant_b uuid := '22222222-2222-2222-2222-222222222222';
  v_admin uuid := '33333333-3333-3333-3333-333333333333';
  v_bestelling_a uuid;
  v_bestelling_b uuid;
  v_cursus uuid;
begin
  perform tests.act_as_owner();

  select id into v_cursus from courses limit 1;

  insert into orders (profile_id, status, amount_cents, description)
  values (v_klant_a, 'paid', 79500, 'Yin Yoga niveau 1')
  returning id into v_bestelling_a;

  insert into orders (profile_id, status, amount_cents, description)
  values (v_klant_b, 'open', 279500, '200-uurs opleiding')
  returning id into v_bestelling_b;

  insert into order_items (order_id, course_id, description, amount_cents)
  values (v_bestelling_a, v_cursus, 'Yin Yoga niveau 1', 79500);

  insert into order_items (order_id, course_id, description, amount_cents)
  values (v_bestelling_b, v_cursus, '200-uurs opleiding', 279500);

  -- --- bezoeker -------------------------------------------------------------
  perform tests.act_as_anon();

  perform tests.expect(
    tests.visible_count('select 1 from orders') = 0,
    'een bezoeker ziet geen bestellingen'
  );

  perform tests.expect(
    tests.visible_count('select 1 from order_items') = 0,
    'een bezoeker ziet geen bestelregels'
  );

  -- --- klantscheiding -------------------------------------------------------
  perform tests.act_as(v_klant_a);

  perform tests.expect(
    tests.visible_count('select 1 from orders') = 1,
    'klant A ziet uitsluitend de eigen bestelling'
  );

  perform tests.expect(
    tests.visible_count(
      'select 1 from orders where id = ' || quote_literal(v_bestelling_b)
    ) = 0,
    'klant A ziet de bestelling van klant B niet'
  );

  perform tests.expect(
    tests.visible_count(
      'select 1 from order_items where order_id = ' || quote_literal(v_bestelling_b)
    ) = 0,
    'klant A ziet de regels van klant B niet'
  );

  perform tests.expect(
    tests.visible_count(
      'select 1 from order_items where order_id = ' || quote_literal(v_bestelling_a)
    ) = 1,
    'klant A ziet wél de eigen bestelregel'
  );

  -- --- een klant bepaalt zijn eigen prijs niet ------------------------------
  perform tests.expect(
    tests.mutation_blocked(
      'insert into orders (profile_id, status, amount_cents, description) '
      || 'values (' || quote_literal(v_klant_a) || ', ''paid'', 1, ''Koopje'')'
    ),
    'een klant kan zichzelf geen bestelling van één cent geven'
  );

  perform tests.expect(
    tests.mutation_blocked(
      'update orders set amount_cents = 1 where id = ' || quote_literal(v_bestelling_a)
    ),
    'een klant kan het bedrag van de eigen bestelling niet aanpassen'
  );

  perform tests.expect(
    tests.mutation_blocked(
      'update orders set status = ''paid'' where id = ' || quote_literal(v_bestelling_a)
    ),
    'een klant kan een bestelling niet zelf op betaald zetten'
  );

  perform tests.expect(
    tests.mutation_blocked(
      'delete from orders where id = ' || quote_literal(v_bestelling_a)
    ),
    'een klant kan de eigen bestelling niet wissen'
  );

  perform tests.expect(
    tests.mutation_blocked(
      'insert into order_items (order_id, description, amount_cents) values ('
      || quote_literal(v_bestelling_a) || ', ''Erbij'', 0)'
    ),
    'een klant kan geen regel aan een bestelling toevoegen'
  );

  -- Het betaal-id van Mollie hoort bij niemand anders thuis dan bij de eigenaar.
  perform tests.act_as(v_klant_b);
  perform tests.expect(
    tests.visible_count(
      'select 1 from orders where mollie_payment_id is not null'
    ) = 0,
    'klant B kan niet via het betaal-id bij andermans bestelling'
  );

  -- --- de beheerder ---------------------------------------------------------
  perform tests.act_as(v_admin);

  perform tests.expect(
    tests.visible_count('select 1 from orders') = 2,
    'de beheerder ziet alle bestellingen'
  );

  perform tests.expect(
    tests.visible_count('select 1 from order_items') = 2,
    'de beheerder ziet alle bestelregels'
  );

  -- --- AVG: bestellingen blijven staan, zonder herleidbare omschrijving -----
  perform tests.act_as_owner();
  perform anonimiseer_profiel(v_klant_b);

  perform tests.expect(
    (select count(*) from orders where profile_id = v_klant_b) = 1,
    'de bestelling blijft staan voor de boekhouding'
  );

  perform tests.expect(
    (select description from orders where id = v_bestelling_b) = 'Verwijderde klant',
    'de omschrijving is niet meer herleidbaar tot de persoon'
  );

  perform tests.expect(
    (select amount_cents from orders where id = v_bestelling_b) = 279500,
    'het bedrag blijft bewaard, zoals de fiscus vraagt'
  );
end $$;
