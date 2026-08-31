-- =============================================================================
-- YogaCompany — startinhoud (BOUWPROMPT §19)
--
-- GEGENEREERD BESTAND. Niet met de hand aanpassen.
-- Wijzig de inhoud in src/content/ en draai: pnpm db:generate-seed
--
-- Herhaalbaar: bestaande rijen worden bijgewerkt op slug of sleutel.
-- =============================================================================

-- Opleidingen en trainingen -------------------------------------------------

insert into courses (
  type, title, slug, summary, description, audience, requirements, curriculum,
  study_load_text, location, max_participants, certificate_text,
  price_cents, has_digital_content, is_active, sort
) values (
  'opleiding', '200-uurs Yin Yoga Specialist Opleiding', '200-uurs-yin-yoga-specialist',
  'Vier modules van 50 uur, van de basis van Yin Yoga naar specialist in herstel en revalidatie. Per module een certificaat Yin Yoga niveau 1 t/m 4; na alle vier de modules het diploma Yin Yoga Specialist.', 'De 200-uurs Yin Yoga Specialist Opleiding brengt je van de fundamenten van Yin Yoga naar het punt waarop je de vorm kunt inzetten bij herstel en revalidatie.

De opleiding bestaat uit vier modules van elk 50 uur. Je volgt ze achter elkaar of verspreid over een langere periode; de modules zijn ook los te volgen. Elke module sluit je af met een certificaat. Rond je alle vier af, dan ontvang je het diploma Yin Yoga Specialist.

We werken in kleine groepen van maximaal twaalf deelnemers. Dat is een bewuste keuze: je krijgt persoonlijke begeleiding en er is ruimte om te oefenen met echte mensen en echte lichamen.',
  'Yogadocenten die zich willen specialiseren, professionals in zorg en beweging die Yin Yoga in hun werk willen inzetten, en mensen die zich vanuit persoonlijke interesse grondig willen verdiepen.', 'Voor module 1 is geen vooropleiding vereist. Ervaring met yoga is prettig, maar geen voorwaarde. Wil je lesgeven, dan is een afgeronde basisopleiding tot yogadocent aan te raden.',
  '[{"nummer":1,"titel":"De basis van Yin Yoga","uren":50,"samenvatting":"Je leert waar Yin Yoga vandaan komt, hoe de houdingen werken en wat ze met het lichaam doen.","blokken":[{"titel":"Fundamenten van yin en yang","onderdelen":["Het onderscheid tussen yin en yang in beweging en in rust","Waar de vorm vandaan komt en welke visie eronder ligt"]},{"titel":"Basisprincipes","onderdelen":["De drie principes van een yin-houding","Tijd, diepte en de rol van stilte","Hulpmiddelen inzetten voor verschillende lichamen"]},{"titel":"Houdingen en hun werking","onderdelen":["De kernhoudingen en hun varianten","Werking op bindweefsel, gewrichten en botten","Anatomische verschillen en wat die betekenen voor je lesgeven"]}]},{"nummer":2,"titel":"Het zenuwstelsel & de basis van de meridiaanleer","uren":50,"samenvatting":"Waarom Yin Yoga rust brengt, en de eerste kennismaking met de meridianen.","blokken":[{"titel":"Het zenuwstelsel","onderdelen":["Sympathisch en parasympathisch: spanning en herstel","Wat langdurige stress met het lichaam doet","Hoe een yin-les het herstelvermogen aanspreekt"]},{"titel":"Basis van de meridiaanleer","onderdelen":["Wat meridianen zijn en hoe ze zijn geordend","De verbinding tussen houding en meridiaan","Eerste toepassing in het opbouwen van een les"]}]},{"nummer":3,"titel":"Chinese geneeskunde en Yin Yoga","uren":50,"samenvatting":"Werken met meridianen, de vijf elementen en de orgaanklok.","blokken":[{"titel":"Werken met meridianen","onderdelen":["De meridianen in de praktijk van een yin-les","Houdingen kiezen op basis van wat iemand nodig heeft"]},{"titel":"De elementen","onderdelen":["De vijf elementen en hun onderlinge samenhang","Seizoenen en wat ze vragen"]},{"titel":"De orgaanklok","onderdelen":["Het ritme van de dag en de organen","Een les afstemmen op tijd en seizoen"]}]},{"nummer":4,"titel":"Herstel & revalidatie","uren":50,"samenvatting":"Alle kennis komt samen: je leert Yin Yoga inzetten bij herstel en revalidatie, en persoonlijke lessen maken.","blokken":[{"titel":"Kennis integreren","onderdelen":["De vier modules samenbrengen in één werkwijze","Kijken naar de mens tegenover je, niet naar de houding"]},{"titel":"Herstel en revalidatie","onderdelen":["Yin Yoga bij overbelasting, blessures en langdurige klachten","Grenzen van je vak: wanneer je doorverwijst"]},{"titel":"Persoonlijke lessen maken","onderdelen":["Een programma opbouwen voor één persoon","Begeleiden, bijstellen en opvolgen"]}]}]'::jsonb,
  'Per module: 5 lesdagen (± 32 contacturen) + ± 18 uur zelfstudie en eindopdracht', 'Studio van YogaCompany (adres volgt)',
  12, 'Certificaat Yin Yoga niveau 1 t/m 4 per module; diploma Yin Yoga Specialist na alle vier de modules. Modules zijn ook los te volgen',
  279500, false, true, 1
)
on conflict (slug) do update set
  type = excluded.type,
  title = excluded.title,
  summary = excluded.summary,
  description = excluded.description,
  audience = excluded.audience,
  requirements = excluded.requirements,
  curriculum = excluded.curriculum,
  study_load_text = excluded.study_load_text,
  location = excluded.location,
  max_participants = excluded.max_participants,
  certificate_text = excluded.certificate_text,
  price_cents = excluded.price_cents,
  has_digital_content = excluded.has_digital_content,
  sort = excluded.sort;

insert into courses (
  type, title, slug, summary, description, audience, requirements, curriculum,
  study_load_text, location, max_participants, certificate_text,
  price_cents, has_digital_content, is_active, sort
) values (
  'opleiding', 'Yin Yoga niveau 1: De basis van Yin Yoga', 'yin-niveau-1-basis',
  'Je leert waar Yin Yoga vandaan komt, hoe de houdingen werken en wat ze met het lichaam doen. Module 1 van 50 uur, af te sluiten met het certificaat Yin Yoga niveau 1.', 'Module 1 van de 200-uurs Yin Yoga Specialist Opleiding, ook los te volgen.

Je leert waar Yin Yoga vandaan komt, hoe de houdingen werken en wat ze met het lichaam doen.

Je sluit de module af met het certificaat **Yin Yoga niveau 1**. Volg je alle vier de modules, dan ontvang je het diploma Yin Yoga Specialist.',
  'Yogadocenten en professionals die zich willen verdiepen, en mensen die deze module als losse verdieping willen volgen.', 'Geen vooropleiding vereist. Ervaring met yoga is prettig, maar geen voorwaarde.',
  '[{"nummer":1,"titel":"De basis van Yin Yoga","uren":50,"samenvatting":"Je leert waar Yin Yoga vandaan komt, hoe de houdingen werken en wat ze met het lichaam doen.","blokken":[{"titel":"Fundamenten van yin en yang","onderdelen":["Het onderscheid tussen yin en yang in beweging en in rust","Waar de vorm vandaan komt en welke visie eronder ligt"]},{"titel":"Basisprincipes","onderdelen":["De drie principes van een yin-houding","Tijd, diepte en de rol van stilte","Hulpmiddelen inzetten voor verschillende lichamen"]},{"titel":"Houdingen en hun werking","onderdelen":["De kernhoudingen en hun varianten","Werking op bindweefsel, gewrichten en botten","Anatomische verschillen en wat die betekenen voor je lesgeven"]}]}]'::jsonb,
  'Per module: 5 lesdagen (± 32 contacturen) + ± 18 uur zelfstudie en eindopdracht', 'Studio van YogaCompany (adres volgt)',
  12, 'Certificaat Yin Yoga niveau 1',
  79500, false, true, 11
)
on conflict (slug) do update set
  type = excluded.type,
  title = excluded.title,
  summary = excluded.summary,
  description = excluded.description,
  audience = excluded.audience,
  requirements = excluded.requirements,
  curriculum = excluded.curriculum,
  study_load_text = excluded.study_load_text,
  location = excluded.location,
  max_participants = excluded.max_participants,
  certificate_text = excluded.certificate_text,
  price_cents = excluded.price_cents,
  has_digital_content = excluded.has_digital_content,
  sort = excluded.sort;

insert into courses (
  type, title, slug, summary, description, audience, requirements, curriculum,
  study_load_text, location, max_participants, certificate_text,
  price_cents, has_digital_content, is_active, sort
) values (
  'opleiding', 'Yin Yoga niveau 2: Het zenuwstelsel & de basis van de meridiaanleer', 'yin-niveau-2-zenuwstelsel-meridiaanleer',
  'Waarom Yin Yoga rust brengt, en de eerste kennismaking met de meridianen. Module 2 van 50 uur, af te sluiten met het certificaat Yin Yoga niveau 2.', 'Module 2 van de 200-uurs Yin Yoga Specialist Opleiding, ook los te volgen.

Waarom Yin Yoga rust brengt, en de eerste kennismaking met de meridianen.

Je sluit de module af met het certificaat **Yin Yoga niveau 2**. Volg je alle vier de modules, dan ontvang je het diploma Yin Yoga Specialist.',
  'Yogadocenten en professionals die zich willen verdiepen, en mensen die deze module als losse verdieping willen volgen.', 'Afronding van module 1, of een vergelijkbare basis in overleg.',
  '[{"nummer":2,"titel":"Het zenuwstelsel & de basis van de meridiaanleer","uren":50,"samenvatting":"Waarom Yin Yoga rust brengt, en de eerste kennismaking met de meridianen.","blokken":[{"titel":"Het zenuwstelsel","onderdelen":["Sympathisch en parasympathisch: spanning en herstel","Wat langdurige stress met het lichaam doet","Hoe een yin-les het herstelvermogen aanspreekt"]},{"titel":"Basis van de meridiaanleer","onderdelen":["Wat meridianen zijn en hoe ze zijn geordend","De verbinding tussen houding en meridiaan","Eerste toepassing in het opbouwen van een les"]}]}]'::jsonb,
  'Per module: 5 lesdagen (± 32 contacturen) + ± 18 uur zelfstudie en eindopdracht', 'Studio van YogaCompany (adres volgt)',
  12, 'Certificaat Yin Yoga niveau 2',
  79500, false, true, 12
)
on conflict (slug) do update set
  type = excluded.type,
  title = excluded.title,
  summary = excluded.summary,
  description = excluded.description,
  audience = excluded.audience,
  requirements = excluded.requirements,
  curriculum = excluded.curriculum,
  study_load_text = excluded.study_load_text,
  location = excluded.location,
  max_participants = excluded.max_participants,
  certificate_text = excluded.certificate_text,
  price_cents = excluded.price_cents,
  has_digital_content = excluded.has_digital_content,
  sort = excluded.sort;

insert into courses (
  type, title, slug, summary, description, audience, requirements, curriculum,
  study_load_text, location, max_participants, certificate_text,
  price_cents, has_digital_content, is_active, sort
) values (
  'opleiding', 'Yin Yoga niveau 3: Chinese geneeskunde en Yin Yoga', 'yin-niveau-3-chinese-geneeskunde',
  'Werken met meridianen, de vijf elementen en de orgaanklok. Module 3 van 50 uur, af te sluiten met het certificaat Yin Yoga niveau 3.', 'Module 3 van de 200-uurs Yin Yoga Specialist Opleiding, ook los te volgen.

Werken met meridianen, de vijf elementen en de orgaanklok.

Je sluit de module af met het certificaat **Yin Yoga niveau 3**. Volg je alle vier de modules, dan ontvang je het diploma Yin Yoga Specialist.',
  'Yogadocenten en professionals die zich willen verdiepen, en mensen die deze module als losse verdieping willen volgen.', 'Afronding van module 2, of een vergelijkbare basis in overleg.',
  '[{"nummer":3,"titel":"Chinese geneeskunde en Yin Yoga","uren":50,"samenvatting":"Werken met meridianen, de vijf elementen en de orgaanklok.","blokken":[{"titel":"Werken met meridianen","onderdelen":["De meridianen in de praktijk van een yin-les","Houdingen kiezen op basis van wat iemand nodig heeft"]},{"titel":"De elementen","onderdelen":["De vijf elementen en hun onderlinge samenhang","Seizoenen en wat ze vragen"]},{"titel":"De orgaanklok","onderdelen":["Het ritme van de dag en de organen","Een les afstemmen op tijd en seizoen"]}]}]'::jsonb,
  'Per module: 5 lesdagen (± 32 contacturen) + ± 18 uur zelfstudie en eindopdracht', 'Studio van YogaCompany (adres volgt)',
  12, 'Certificaat Yin Yoga niveau 3',
  79500, false, true, 13
)
on conflict (slug) do update set
  type = excluded.type,
  title = excluded.title,
  summary = excluded.summary,
  description = excluded.description,
  audience = excluded.audience,
  requirements = excluded.requirements,
  curriculum = excluded.curriculum,
  study_load_text = excluded.study_load_text,
  location = excluded.location,
  max_participants = excluded.max_participants,
  certificate_text = excluded.certificate_text,
  price_cents = excluded.price_cents,
  has_digital_content = excluded.has_digital_content,
  sort = excluded.sort;

insert into courses (
  type, title, slug, summary, description, audience, requirements, curriculum,
  study_load_text, location, max_participants, certificate_text,
  price_cents, has_digital_content, is_active, sort
) values (
  'opleiding', 'Yin Yoga niveau 4: Herstel & revalidatie', 'yin-niveau-4-herstel-revalidatie',
  'Alle kennis komt samen: je leert Yin Yoga inzetten bij herstel en revalidatie, en persoonlijke lessen maken. Module 4 van 50 uur, af te sluiten met het certificaat Yin Yoga niveau 4.', 'Module 4 van de 200-uurs Yin Yoga Specialist Opleiding, ook los te volgen.

Alle kennis komt samen: je leert Yin Yoga inzetten bij herstel en revalidatie, en persoonlijke lessen maken.

Je sluit de module af met het certificaat **Yin Yoga niveau 4**. Volg je alle vier de modules, dan ontvang je het diploma Yin Yoga Specialist.',
  'Yogadocenten en professionals die zich willen verdiepen, en mensen die deze module als losse verdieping willen volgen.', 'Afronding van module 3, of een vergelijkbare basis in overleg.',
  '[{"nummer":4,"titel":"Herstel & revalidatie","uren":50,"samenvatting":"Alle kennis komt samen: je leert Yin Yoga inzetten bij herstel en revalidatie, en persoonlijke lessen maken.","blokken":[{"titel":"Kennis integreren","onderdelen":["De vier modules samenbrengen in één werkwijze","Kijken naar de mens tegenover je, niet naar de houding"]},{"titel":"Herstel en revalidatie","onderdelen":["Yin Yoga bij overbelasting, blessures en langdurige klachten","Grenzen van je vak: wanneer je doorverwijst"]},{"titel":"Persoonlijke lessen maken","onderdelen":["Een programma opbouwen voor één persoon","Begeleiden, bijstellen en opvolgen"]}]}]'::jsonb,
  'Per module: 5 lesdagen (± 32 contacturen) + ± 18 uur zelfstudie en eindopdracht', 'Studio van YogaCompany (adres volgt)',
  12, 'Certificaat Yin Yoga niveau 4',
  79500, false, true, 14
)
on conflict (slug) do update set
  type = excluded.type,
  title = excluded.title,
  summary = excluded.summary,
  description = excluded.description,
  audience = excluded.audience,
  requirements = excluded.requirements,
  curriculum = excluded.curriculum,
  study_load_text = excluded.study_load_text,
  location = excluded.location,
  max_participants = excluded.max_participants,
  certificate_text = excluded.certificate_text,
  price_cents = excluded.price_cents,
  has_digital_content = excluded.has_digital_content,
  sort = excluded.sort;

insert into courses (
  type, title, slug, summary, description, audience, requirements, curriculum,
  study_load_text, location, max_participants, certificate_text,
  price_cents, has_digital_content, is_active, sort
) values (
  'training', 'Eerst Jij: 8-weeks online herstelprogramma', 'eerst-jij',
  'Acht weken online, in je eigen tempo, met begeleiding. Voor wie leeg is en weer wil opbouwen: stap voor stap, zonder te forceren.', 'Eerst Jij is een programma van acht weken voor mensen die op zijn. Uitgeput, oververmoeid, of hersteld verklaard maar nog lang niet de oude.

Elke week krijg je een korte video, een yogales die past bij waar je op dat moment staat, en een schrijfopdracht. Je doet het online, in je eigen tempo, thuis. In de begeleide variant kun je je vragen kwijt en kijken we samen mee.

Het programma gaat langzaam. Dat is geen tekortkoming maar het uitgangspunt: herstel laat zich niet opjagen.',
  'Voor jezelf, als je merkt dat je energie op is en je niet weet waar je moet beginnen. Ook geschikt als je werkgever meedenkt over duurzame inzetbaarheid.', null,
  null,
  'Acht weken, ongeveer twee uur per week. In je eigen tempo te volgen.', 'Online',
  null, 'Geen certificering; dit is een persoonlijk programma.',
  79700, true, true, 20
)
on conflict (slug) do update set
  type = excluded.type,
  title = excluded.title,
  summary = excluded.summary,
  description = excluded.description,
  audience = excluded.audience,
  requirements = excluded.requirements,
  curriculum = excluded.curriculum,
  study_load_text = excluded.study_load_text,
  location = excluded.location,
  max_participants = excluded.max_participants,
  certificate_text = excluded.certificate_text,
  price_cents = excluded.price_cents,
  has_digital_content = excluded.has_digital_content,
  sort = excluded.sort;

insert into courses (
  type, title, slug, summary, description, audience, requirements, curriculum,
  study_load_text, location, max_participants, certificate_text,
  price_cents, has_digital_content, is_active, sort
) values (
  'training', 'Hormoonyoga-training', 'hormoonyoga',
  'Een praktische training in hormoonyoga: houdingen, ademhaling en ritme, afgestemd op wat het lichaam in verschillende levensfasen vraagt.', 'In deze training leer je hoe je met houdingen, ademhaling en ritme kunt werken aan hormonale balans.

We kijken naar wat het lichaam in verschillende levensfasen nodig heeft en hoe je daar in een les rekening mee houdt. Praktijkgericht: je oefent zelf en leert de opbouw kennen die je daarna kunt toepassen.',
  'Yogadocenten die hun aanbod willen verbreden, en mensen die hormoonyoga voor zichzelf willen leren.', null,
  null,
  'Zie de lesdata; neem gerust contact op voor de planning.', 'Studio van YogaCompany (adres volgt)',
  12, null,
  29500, false, true, 21
)
on conflict (slug) do update set
  type = excluded.type,
  title = excluded.title,
  summary = excluded.summary,
  description = excluded.description,
  audience = excluded.audience,
  requirements = excluded.requirements,
  curriculum = excluded.curriculum,
  study_load_text = excluded.study_load_text,
  location = excluded.location,
  max_participants = excluded.max_participants,
  certificate_text = excluded.certificate_text,
  price_cents = excluded.price_cents,
  has_digital_content = excluded.has_digital_content,
  sort = excluded.sort;

-- Digitale content ----------------------------------------------------------
-- De bestandspaden verwijzen naar de bucket 'protected-content'. De bestanden
-- zelf uploadt de admin via de beheeromgeving; tot die tijd staat de structuur
-- klaar zonder dat er iets af te spelen valt.

do $seed$
declare
  v_course uuid;
  v_module uuid;
  v_lesson uuid;
begin
  select id into v_course from courses where slug = 'eerst-jij';

  select id into v_module from course_modules
   where course_id = v_course and title = 'Week 1';

  if v_module is null then
    insert into course_modules (course_id, title, sort)
    values (v_course, 'Week 1', 0)
    returning id into v_module;
  end if;

  select id into v_lesson from lessons
   where module_id = v_module and title = 'Week 1';

  if v_lesson is null then
    insert into lessons (module_id, title, sort)
    values (v_module, 'Week 1', 0)
    returning id into v_lesson;
  end if;

  if not exists (
    select 1 from content_items
     where lesson_id = v_lesson and title = 'Weekvideo 1'
  ) then
    insert into content_items (lesson_id, kind, title, body, storage_path, is_preview, sort)
    values (v_lesson, 'video', 'Weekvideo 1', null,
            'eerst-jij/week-1/weekvideo.mp4', true, 0);
  end if;

  if not exists (
    select 1 from content_items
     where lesson_id = v_lesson and title = 'Yogavideo week 1'
  ) then
    insert into content_items (lesson_id, kind, title, body, storage_path, is_preview, sort)
    values (v_lesson, 'video', 'Yogavideo week 1', null,
            'eerst-jij/week-1/yogavideo.mp4', false, 1);
  end if;

  if not exists (
    select 1 from content_items
     where lesson_id = v_lesson and title = 'Schrijfopdracht week 1'
  ) then
    insert into content_items (lesson_id, kind, title, body, storage_path, is_preview, sort)
    values (v_lesson, 'pdf', 'Schrijfopdracht week 1', null,
            'eerst-jij/week-1/schrijfopdracht.pdf', false, 2);
  end if;
end
$seed$;
-- mod_eerst_jij_0

do $seed$
declare
  v_course uuid;
  v_module uuid;
  v_lesson uuid;
begin
  select id into v_course from courses where slug = 'eerst-jij';

  select id into v_module from course_modules
   where course_id = v_course and title = 'Week 2';

  if v_module is null then
    insert into course_modules (course_id, title, sort)
    values (v_course, 'Week 2', 1)
    returning id into v_module;
  end if;

  select id into v_lesson from lessons
   where module_id = v_module and title = 'Week 2';

  if v_lesson is null then
    insert into lessons (module_id, title, sort)
    values (v_module, 'Week 2', 0)
    returning id into v_lesson;
  end if;

  if not exists (
    select 1 from content_items
     where lesson_id = v_lesson and title = 'Weekvideo 2'
  ) then
    insert into content_items (lesson_id, kind, title, body, storage_path, is_preview, sort)
    values (v_lesson, 'video', 'Weekvideo 2', null,
            'eerst-jij/week-2/weekvideo.mp4', false, 0);
  end if;

  if not exists (
    select 1 from content_items
     where lesson_id = v_lesson and title = 'Yogavideo week 2'
  ) then
    insert into content_items (lesson_id, kind, title, body, storage_path, is_preview, sort)
    values (v_lesson, 'video', 'Yogavideo week 2', null,
            'eerst-jij/week-2/yogavideo.mp4', false, 1);
  end if;

  if not exists (
    select 1 from content_items
     where lesson_id = v_lesson and title = 'Schrijfopdracht week 2'
  ) then
    insert into content_items (lesson_id, kind, title, body, storage_path, is_preview, sort)
    values (v_lesson, 'pdf', 'Schrijfopdracht week 2', null,
            'eerst-jij/week-2/schrijfopdracht.pdf', false, 2);
  end if;
end
$seed$;
-- mod_eerst_jij_1

do $seed$
declare
  v_course uuid;
  v_module uuid;
  v_lesson uuid;
begin
  select id into v_course from courses where slug = 'eerst-jij';

  select id into v_module from course_modules
   where course_id = v_course and title = 'Week 3';

  if v_module is null then
    insert into course_modules (course_id, title, sort)
    values (v_course, 'Week 3', 2)
    returning id into v_module;
  end if;

  select id into v_lesson from lessons
   where module_id = v_module and title = 'Week 3';

  if v_lesson is null then
    insert into lessons (module_id, title, sort)
    values (v_module, 'Week 3', 0)
    returning id into v_lesson;
  end if;

  if not exists (
    select 1 from content_items
     where lesson_id = v_lesson and title = 'Weekvideo 3'
  ) then
    insert into content_items (lesson_id, kind, title, body, storage_path, is_preview, sort)
    values (v_lesson, 'video', 'Weekvideo 3', null,
            'eerst-jij/week-3/weekvideo.mp4', false, 0);
  end if;

  if not exists (
    select 1 from content_items
     where lesson_id = v_lesson and title = 'Yogavideo week 3'
  ) then
    insert into content_items (lesson_id, kind, title, body, storage_path, is_preview, sort)
    values (v_lesson, 'video', 'Yogavideo week 3', null,
            'eerst-jij/week-3/yogavideo.mp4', false, 1);
  end if;

  if not exists (
    select 1 from content_items
     where lesson_id = v_lesson and title = 'Schrijfopdracht week 3'
  ) then
    insert into content_items (lesson_id, kind, title, body, storage_path, is_preview, sort)
    values (v_lesson, 'pdf', 'Schrijfopdracht week 3', null,
            'eerst-jij/week-3/schrijfopdracht.pdf', false, 2);
  end if;
end
$seed$;
-- mod_eerst_jij_2

do $seed$
declare
  v_course uuid;
  v_module uuid;
  v_lesson uuid;
begin
  select id into v_course from courses where slug = 'eerst-jij';

  select id into v_module from course_modules
   where course_id = v_course and title = 'Week 4';

  if v_module is null then
    insert into course_modules (course_id, title, sort)
    values (v_course, 'Week 4', 3)
    returning id into v_module;
  end if;

  select id into v_lesson from lessons
   where module_id = v_module and title = 'Week 4';

  if v_lesson is null then
    insert into lessons (module_id, title, sort)
    values (v_module, 'Week 4', 0)
    returning id into v_lesson;
  end if;

  if not exists (
    select 1 from content_items
     where lesson_id = v_lesson and title = 'Weekvideo 4'
  ) then
    insert into content_items (lesson_id, kind, title, body, storage_path, is_preview, sort)
    values (v_lesson, 'video', 'Weekvideo 4', null,
            'eerst-jij/week-4/weekvideo.mp4', false, 0);
  end if;

  if not exists (
    select 1 from content_items
     where lesson_id = v_lesson and title = 'Yogavideo week 4'
  ) then
    insert into content_items (lesson_id, kind, title, body, storage_path, is_preview, sort)
    values (v_lesson, 'video', 'Yogavideo week 4', null,
            'eerst-jij/week-4/yogavideo.mp4', false, 1);
  end if;

  if not exists (
    select 1 from content_items
     where lesson_id = v_lesson and title = 'Schrijfopdracht week 4'
  ) then
    insert into content_items (lesson_id, kind, title, body, storage_path, is_preview, sort)
    values (v_lesson, 'pdf', 'Schrijfopdracht week 4', null,
            'eerst-jij/week-4/schrijfopdracht.pdf', false, 2);
  end if;
end
$seed$;
-- mod_eerst_jij_3

do $seed$
declare
  v_course uuid;
  v_module uuid;
  v_lesson uuid;
begin
  select id into v_course from courses where slug = 'eerst-jij';

  select id into v_module from course_modules
   where course_id = v_course and title = 'Week 5';

  if v_module is null then
    insert into course_modules (course_id, title, sort)
    values (v_course, 'Week 5', 4)
    returning id into v_module;
  end if;

  select id into v_lesson from lessons
   where module_id = v_module and title = 'Week 5';

  if v_lesson is null then
    insert into lessons (module_id, title, sort)
    values (v_module, 'Week 5', 0)
    returning id into v_lesson;
  end if;

  if not exists (
    select 1 from content_items
     where lesson_id = v_lesson and title = 'Weekvideo 5'
  ) then
    insert into content_items (lesson_id, kind, title, body, storage_path, is_preview, sort)
    values (v_lesson, 'video', 'Weekvideo 5', null,
            'eerst-jij/week-5/weekvideo.mp4', false, 0);
  end if;

  if not exists (
    select 1 from content_items
     where lesson_id = v_lesson and title = 'Yogavideo week 5'
  ) then
    insert into content_items (lesson_id, kind, title, body, storage_path, is_preview, sort)
    values (v_lesson, 'video', 'Yogavideo week 5', null,
            'eerst-jij/week-5/yogavideo.mp4', false, 1);
  end if;

  if not exists (
    select 1 from content_items
     where lesson_id = v_lesson and title = 'Schrijfopdracht week 5'
  ) then
    insert into content_items (lesson_id, kind, title, body, storage_path, is_preview, sort)
    values (v_lesson, 'pdf', 'Schrijfopdracht week 5', null,
            'eerst-jij/week-5/schrijfopdracht.pdf', false, 2);
  end if;
end
$seed$;
-- mod_eerst_jij_4

do $seed$
declare
  v_course uuid;
  v_module uuid;
  v_lesson uuid;
begin
  select id into v_course from courses where slug = 'eerst-jij';

  select id into v_module from course_modules
   where course_id = v_course and title = 'Week 6';

  if v_module is null then
    insert into course_modules (course_id, title, sort)
    values (v_course, 'Week 6', 5)
    returning id into v_module;
  end if;

  select id into v_lesson from lessons
   where module_id = v_module and title = 'Week 6';

  if v_lesson is null then
    insert into lessons (module_id, title, sort)
    values (v_module, 'Week 6', 0)
    returning id into v_lesson;
  end if;

  if not exists (
    select 1 from content_items
     where lesson_id = v_lesson and title = 'Weekvideo 6'
  ) then
    insert into content_items (lesson_id, kind, title, body, storage_path, is_preview, sort)
    values (v_lesson, 'video', 'Weekvideo 6', null,
            'eerst-jij/week-6/weekvideo.mp4', false, 0);
  end if;

  if not exists (
    select 1 from content_items
     where lesson_id = v_lesson and title = 'Yogavideo week 6'
  ) then
    insert into content_items (lesson_id, kind, title, body, storage_path, is_preview, sort)
    values (v_lesson, 'video', 'Yogavideo week 6', null,
            'eerst-jij/week-6/yogavideo.mp4', false, 1);
  end if;

  if not exists (
    select 1 from content_items
     where lesson_id = v_lesson and title = 'Schrijfopdracht week 6'
  ) then
    insert into content_items (lesson_id, kind, title, body, storage_path, is_preview, sort)
    values (v_lesson, 'pdf', 'Schrijfopdracht week 6', null,
            'eerst-jij/week-6/schrijfopdracht.pdf', false, 2);
  end if;
end
$seed$;
-- mod_eerst_jij_5

do $seed$
declare
  v_course uuid;
  v_module uuid;
  v_lesson uuid;
begin
  select id into v_course from courses where slug = 'eerst-jij';

  select id into v_module from course_modules
   where course_id = v_course and title = 'Week 7';

  if v_module is null then
    insert into course_modules (course_id, title, sort)
    values (v_course, 'Week 7', 6)
    returning id into v_module;
  end if;

  select id into v_lesson from lessons
   where module_id = v_module and title = 'Week 7';

  if v_lesson is null then
    insert into lessons (module_id, title, sort)
    values (v_module, 'Week 7', 0)
    returning id into v_lesson;
  end if;

  if not exists (
    select 1 from content_items
     where lesson_id = v_lesson and title = 'Weekvideo 7'
  ) then
    insert into content_items (lesson_id, kind, title, body, storage_path, is_preview, sort)
    values (v_lesson, 'video', 'Weekvideo 7', null,
            'eerst-jij/week-7/weekvideo.mp4', false, 0);
  end if;

  if not exists (
    select 1 from content_items
     where lesson_id = v_lesson and title = 'Yogavideo week 7'
  ) then
    insert into content_items (lesson_id, kind, title, body, storage_path, is_preview, sort)
    values (v_lesson, 'video', 'Yogavideo week 7', null,
            'eerst-jij/week-7/yogavideo.mp4', false, 1);
  end if;

  if not exists (
    select 1 from content_items
     where lesson_id = v_lesson and title = 'Schrijfopdracht week 7'
  ) then
    insert into content_items (lesson_id, kind, title, body, storage_path, is_preview, sort)
    values (v_lesson, 'pdf', 'Schrijfopdracht week 7', null,
            'eerst-jij/week-7/schrijfopdracht.pdf', false, 2);
  end if;
end
$seed$;
-- mod_eerst_jij_6

do $seed$
declare
  v_course uuid;
  v_module uuid;
  v_lesson uuid;
begin
  select id into v_course from courses where slug = 'eerst-jij';

  select id into v_module from course_modules
   where course_id = v_course and title = 'Week 8';

  if v_module is null then
    insert into course_modules (course_id, title, sort)
    values (v_course, 'Week 8', 7)
    returning id into v_module;
  end if;

  select id into v_lesson from lessons
   where module_id = v_module and title = 'Week 8';

  if v_lesson is null then
    insert into lessons (module_id, title, sort)
    values (v_module, 'Week 8', 0)
    returning id into v_lesson;
  end if;

  if not exists (
    select 1 from content_items
     where lesson_id = v_lesson and title = 'Weekvideo 8'
  ) then
    insert into content_items (lesson_id, kind, title, body, storage_path, is_preview, sort)
    values (v_lesson, 'video', 'Weekvideo 8', null,
            'eerst-jij/week-8/weekvideo.mp4', false, 0);
  end if;

  if not exists (
    select 1 from content_items
     where lesson_id = v_lesson and title = 'Yogavideo week 8'
  ) then
    insert into content_items (lesson_id, kind, title, body, storage_path, is_preview, sort)
    values (v_lesson, 'video', 'Yogavideo week 8', null,
            'eerst-jij/week-8/yogavideo.mp4', false, 1);
  end if;

  if not exists (
    select 1 from content_items
     where lesson_id = v_lesson and title = 'Schrijfopdracht week 8'
  ) then
    insert into content_items (lesson_id, kind, title, body, storage_path, is_preview, sort)
    values (v_lesson, 'pdf', 'Schrijfopdracht week 8', null,
            'eerst-jij/week-8/schrijfopdracht.pdf', false, 2);
  end if;
end
$seed$;
-- mod_eerst_jij_7

-- Studio en producten -------------------------------------------------------

insert into studios (id, naam, plaats, max_deelnemers)
values ('0a5e1c40-0000-4000-8000-000000000001', 'Rinske Yoga Almere', 'Almere', 8)
on conflict (id) do update set
  naam = excluded.naam,
  plaats = excluded.plaats,
  max_deelnemers = excluded.max_deelnemers;

insert into pass_products (
  id, studio_id, naam, aantal_lessen, prijs_centen, verrekenwaarde_centen,
  geldigheid_dagen, uitloop_dagen, kruisgebruik_toegestaan,
  max_kruislessen_per_maand, volgorde
)
values (
  '0a5e1c40-0000-4000-8000-000000000101', '0a5e1c40-0000-4000-8000-000000000001', 'Snuffelkaart',
  3, 900,
  null, 30,
  0, false,
  null, 0
)
on conflict (id) do update set
  naam = excluded.naam,
  aantal_lessen = excluded.aantal_lessen,
  prijs_centen = excluded.prijs_centen,
  verrekenwaarde_centen = excluded.verrekenwaarde_centen,
  geldigheid_dagen = excluded.geldigheid_dagen,
  uitloop_dagen = excluded.uitloop_dagen,
  kruisgebruik_toegestaan = excluded.kruisgebruik_toegestaan,
  max_kruislessen_per_maand = excluded.max_kruislessen_per_maand,
  volgorde = excluded.volgorde;

insert into pass_products (
  id, studio_id, naam, aantal_lessen, prijs_centen, verrekenwaarde_centen,
  geldigheid_dagen, uitloop_dagen, kruisgebruik_toegestaan,
  max_kruislessen_per_maand, volgorde
)
values (
  '0a5e1c40-0000-4000-8000-000000000102', '0a5e1c40-0000-4000-8000-000000000001', 'Losse les',
  1, 1700,
  1560, null,
  0, true,
  null, 1
)
on conflict (id) do update set
  naam = excluded.naam,
  aantal_lessen = excluded.aantal_lessen,
  prijs_centen = excluded.prijs_centen,
  verrekenwaarde_centen = excluded.verrekenwaarde_centen,
  geldigheid_dagen = excluded.geldigheid_dagen,
  uitloop_dagen = excluded.uitloop_dagen,
  kruisgebruik_toegestaan = excluded.kruisgebruik_toegestaan,
  max_kruislessen_per_maand = excluded.max_kruislessen_per_maand,
  volgorde = excluded.volgorde;

insert into pass_products (
  id, studio_id, naam, aantal_lessen, prijs_centen, verrekenwaarde_centen,
  geldigheid_dagen, uitloop_dagen, kruisgebruik_toegestaan,
  max_kruislessen_per_maand, volgorde
)
values (
  '0a5e1c40-0000-4000-8000-000000000103', '0a5e1c40-0000-4000-8000-000000000001', '3-strippenkaart',
  3, 4750,
  1453, 30,
  15, true,
  null, 2
)
on conflict (id) do update set
  naam = excluded.naam,
  aantal_lessen = excluded.aantal_lessen,
  prijs_centen = excluded.prijs_centen,
  verrekenwaarde_centen = excluded.verrekenwaarde_centen,
  geldigheid_dagen = excluded.geldigheid_dagen,
  uitloop_dagen = excluded.uitloop_dagen,
  kruisgebruik_toegestaan = excluded.kruisgebruik_toegestaan,
  max_kruislessen_per_maand = excluded.max_kruislessen_per_maand,
  volgorde = excluded.volgorde;

insert into pass_products (
  id, studio_id, naam, aantal_lessen, prijs_centen, verrekenwaarde_centen,
  geldigheid_dagen, uitloop_dagen, kruisgebruik_toegestaan,
  max_kruislessen_per_maand, volgorde
)
values (
  '0a5e1c40-0000-4000-8000-000000000104', '0a5e1c40-0000-4000-8000-000000000001', '10-strippenkaart',
  10, 14500,
  1330, 90,
  30, true,
  null, 3
)
on conflict (id) do update set
  naam = excluded.naam,
  aantal_lessen = excluded.aantal_lessen,
  prijs_centen = excluded.prijs_centen,
  verrekenwaarde_centen = excluded.verrekenwaarde_centen,
  geldigheid_dagen = excluded.geldigheid_dagen,
  uitloop_dagen = excluded.uitloop_dagen,
  kruisgebruik_toegestaan = excluded.kruisgebruik_toegestaan,
  max_kruislessen_per_maand = excluded.max_kruislessen_per_maand,
  volgorde = excluded.volgorde;

insert into pass_products (
  id, studio_id, naam, aantal_lessen, prijs_centen, verrekenwaarde_centen,
  geldigheid_dagen, uitloop_dagen, kruisgebruik_toegestaan,
  max_kruislessen_per_maand, volgorde
)
values (
  '0a5e1c40-0000-4000-8000-000000000105', '0a5e1c40-0000-4000-8000-000000000001', '20-strippenkaart',
  20, 28000,
  1284, 180,
  30, true,
  null, 4
)
on conflict (id) do update set
  naam = excluded.naam,
  aantal_lessen = excluded.aantal_lessen,
  prijs_centen = excluded.prijs_centen,
  verrekenwaarde_centen = excluded.verrekenwaarde_centen,
  geldigheid_dagen = excluded.geldigheid_dagen,
  uitloop_dagen = excluded.uitloop_dagen,
  kruisgebruik_toegestaan = excluded.kruisgebruik_toegestaan,
  max_kruislessen_per_maand = excluded.max_kruislessen_per_maand,
  volgorde = excluded.volgorde;

insert into pass_products (
  id, studio_id, naam, aantal_lessen, prijs_centen, verrekenwaarde_centen,
  geldigheid_dagen, uitloop_dagen, kruisgebruik_toegestaan,
  max_kruislessen_per_maand, volgorde
)
values (
  '0a5e1c40-0000-4000-8000-000000000106', '0a5e1c40-0000-4000-8000-000000000001', 'Maandabonnement',
  null, 5850,
  1239, 30,
  0, true,
  2, 5
)
on conflict (id) do update set
  naam = excluded.naam,
  aantal_lessen = excluded.aantal_lessen,
  prijs_centen = excluded.prijs_centen,
  verrekenwaarde_centen = excluded.verrekenwaarde_centen,
  geldigheid_dagen = excluded.geldigheid_dagen,
  uitloop_dagen = excluded.uitloop_dagen,
  kruisgebruik_toegestaan = excluded.kruisgebruik_toegestaan,
  max_kruislessen_per_maand = excluded.max_kruislessen_per_maand,
  volgorde = excluded.volgorde;

insert into pass_products (
  id, studio_id, naam, aantal_lessen, prijs_centen, verrekenwaarde_centen,
  geldigheid_dagen, uitloop_dagen, kruisgebruik_toegestaan,
  max_kruislessen_per_maand, volgorde
)
values (
  '0a5e1c40-0000-4000-8000-000000000107', '0a5e1c40-0000-4000-8000-000000000001', 'Kwartaalabonnement',
  null, 16900,
  1193, 90,
  0, true,
  2, 6
)
on conflict (id) do update set
  naam = excluded.naam,
  aantal_lessen = excluded.aantal_lessen,
  prijs_centen = excluded.prijs_centen,
  verrekenwaarde_centen = excluded.verrekenwaarde_centen,
  geldigheid_dagen = excluded.geldigheid_dagen,
  uitloop_dagen = excluded.uitloop_dagen,
  kruisgebruik_toegestaan = excluded.kruisgebruik_toegestaan,
  max_kruislessen_per_maand = excluded.max_kruislessen_per_maand,
  volgorde = excluded.volgorde;

insert into pass_products (
  id, studio_id, naam, aantal_lessen, prijs_centen, verrekenwaarde_centen,
  geldigheid_dagen, uitloop_dagen, kruisgebruik_toegestaan,
  max_kruislessen_per_maand, volgorde
)
values (
  '0a5e1c40-0000-4000-8000-000000000108', '0a5e1c40-0000-4000-8000-000000000001', 'Halfjaarabonnement',
  null, 31600,
  1115, 180,
  0, true,
  2, 7
)
on conflict (id) do update set
  naam = excluded.naam,
  aantal_lessen = excluded.aantal_lessen,
  prijs_centen = excluded.prijs_centen,
  verrekenwaarde_centen = excluded.verrekenwaarde_centen,
  geldigheid_dagen = excluded.geldigheid_dagen,
  uitloop_dagen = excluded.uitloop_dagen,
  kruisgebruik_toegestaan = excluded.kruisgebruik_toegestaan,
  max_kruislessen_per_maand = excluded.max_kruislessen_per_maand,
  volgorde = excluded.volgorde;

-- CMS-blokken ---------------------------------------------------------------
-- De publieke site leest uitsluitend 'value'; 'draft_value' blijft leeg tot
-- iemand in de site-editor een concept maakt (BOUWPROMPT §14).

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'banner_tekst', 'text', '{"text":""}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'banner_knop', 'text', '{"text":""}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'banner_link', 'text', '{"text":""}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'banner_kleur', 'text', '{"text":"zand"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'hero_bovenkop', 'text', '{"text":"Opleidingen · trainingen · lessen"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'hero_titel', 'text', '{"text":"Van je eerste les tot je eigen lespraktijk."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'hero_subtitel', 'text', '{"text":"Wekelijkse yogalessen in kleine groepen in Almere, korte trainingen om je te verdiepen, en de 200-uurs Yin Yoga Specialist Opleiding."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'hero_knop', 'text', '{"text":"Bekijk het lesrooster"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'hero_knop_twee', 'text', '{"text":"Ontdek de opleidingen"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'hero_kenmerken', 'text', '{"text":"Kleine groepen · Certificaat per module · Annuleren tot 24 uur vooraf"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'hero_achtergrond', 'image', '{"url":"/beeld/hero-yoga.jpg","alt":"Een vrouw in een voorwaartse buiging over een bolster, op een mat in laag ochtendlicht"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'deuren_titel', 'text', '{"text":"Waar wil je beginnen?"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'deuren_inleiding', 'text', '{"text":"Drie manieren om met ons te werken, elk met een eigen tempo en een eigen prijs."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'deuren', 'richtext', '{"items":[{"label":"Yogalessen","titel":"Elke week op de mat","tekst":"Yin, Vinyasa en Restorative in de studio in Almere. Kleine groepen, dus je wordt gezien.","prijs":"Losse les € 17,00 · 10-strippenkaart € 145,00","knop":"Bekijk het rooster en boek","href":"/lessen"},{"label":"Trainingen","titel":"Verdiep je in één onderwerp","tekst":"Kortere programma''s, online of in de studio. Zoals het 8-weekse herstelprogramma Eerst Jij.","prijs":"Vanaf € 295,00","knop":"Bekijk de trainingen","href":"/trainingen"},{"label":"Opleidingen","titel":"Leer het vak","tekst":"De 200-uurs Yin Yoga Specialist Opleiding in vier modules van 50 uur. Ook los te volgen.","prijs":"€ 795,00 per module · € 2.795,00 in één keer","knop":"Bekijk de opleidingen","href":"/opleidingen"}]}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'rooster_titel', 'text', '{"text":"De eerstvolgende lessen"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'rooster_inleiding', 'text', '{"text":"Reserveer je plek vooraf. Met een account kost dat één klik en gaat er een strip van je kaart af."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'kaarten_titel', 'text', '{"text":"Nog geen kaart?"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'kaarten_inleiding', 'text', '{"text":"Je kaart staat meteen in je eigen omgeving en je saldo loopt vanzelf mee."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'waarom_titel', 'text', '{"text":"Waarom YogaCompany"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'waarom_punten', 'richtext', '{"items":[{"titel":"Ervaren docenten","tekst":"Mensen die zelf jaren lesgeven en blijven leren."},{"titel":"Kleine groepen","tekst":"Maximaal twaalf deelnemers, zodat je gezien wordt."},{"titel":"Praktijkgericht","tekst":"Je oefent met echte mensen en echte lichamen."},{"titel":"Certificaat per module","tekst":"Je bouwt op in stappen die je zelf kunt plannen."}]}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'aanbod_titel', 'text', '{"text":"Opleidingen en trainingen"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'aanbod_inleiding', 'text', '{"text":"De volledige opleiding, één losse module, of een korte training. Je schrijft je online in."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'testimonials', 'richtext', '{"items":[{"citaat":"Voor het eerst een opleiding waar het tempo klopte met wat ik aankon.","naam":"Deelnemer, naam volgt","rol":"Yin Yoga niveau 1 en 2"},{"citaat":"De kleine groep maakte het verschil. Er was echt tijd voor mijn vragen.","naam":"Deelnemer, naam volgt","rol":"200-uurs Yin Yoga Specialist"},{"citaat":"Ik kwam binnen als deelnemer en ging weg met een manier van kijken.","naam":"Deelnemer, naam volgt","rol":"Eerst Jij"}]}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'inlog_titel', 'text', '{"text":"Al bij ons bekend?"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'inlog_inleiding', 'text', '{"text":"Twee deuren, allebei achter dezelfde inlog. Je komt vanzelf in de juiste omgeving terecht."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'inlog_deuren', 'richtext', '{"items":[{"label":"Voor leden","titel":"Mijn omgeving","tekst":"Je lessen, je strippenkaarten met saldo, je opleidingen en het lesmateriaal. En je eigen gegevens, die je kunt inzien en laten wissen.","knop":"Inloggen als lid","href":"/inloggen?vervolg=/portaal"},{"label":"Voor docenten","titel":"Docentenportal","tekst":"Kaarten uitgeven, afboekingen zien, de maand afsluiten met een factuur, en je eigen pagina inrichten.","knop":"Inloggen als docent","href":"/inloggen?vervolg=/docenten"}]}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'organisaties_titel', 'text', '{"text":"Yoga voor een groep die er zelf niet om vroeg"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'organisaties_inleiding', 'text', '{"text":"Op kantoor, op de club of in de klas. Wij komen langs, nemen alles mee en werken met mensen die nog nooit op een mat hebben gestaan."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'organisaties', 'richtext', '{"items":[{"label":"Bedrijven","titel":"Yoga op de werkvloer","tekst":"Een vast moment in de week, een workshop op een teamdag, of een programma rond werkdruk en herstel.","prijs":"Reeks vanaf € 155 per sessie, excl. btw","knop":"Bekijk bedrijfsyoga","href":"/bedrijfsyoga"},{"label":"Sportclubs","titel":"De dag na de wedstrijd","tekst":"Mobiliteit, herstel en ademhaling voor teams en individuele sporters. In de kantine of op het veld, na de training.","prijs":"Blok vanaf € 145 per sessie, excl. btw","knop":"Bekijk yoga bij je club","href":"/sportclubs"},{"label":"Onderwijs","titel":"Een lesuur waarin het stil wordt","tekst":"Voortgezet onderwijs, mbo, hbo en universiteit. In het mentoruur, vóór de examenweek, of voor het team dat er de hele week staat.","prijs":"Dagdeel van drie lessen € 375, excl. btw","knop":"Bekijk yoga in het onderwijs","href":"/onderwijs"}]}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'cta_titel', 'text', '{"text":"Nog niet zeker welke stap past?"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'cta_tekst', 'text', '{"text":"Laat het ons weten. We denken graag mee, zonder dat je ergens aan vastzit."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('bedrijfsyoga', 'label', 'text', '{"text":"Voor werkgevers"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('bedrijfsyoga', 'titel', 'text', '{"text":"Yoga op de werkvloer"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('bedrijfsyoga', 'inleiding', 'text', '{"text":"Vaste lessen op kantoor of online, een workshop op een teamdag, of een programma rond werkdruk en herstel. We komen langs, of jullie komen naar de studio."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('bedrijfsyoga', 'knop', 'text', '{"text":"Vraag een proefles aan"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('bedrijfsyoga', 'beeld', 'image', '{"url":"","alt":""}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('bedrijfsyoga', 'verhaal', 'richtext', '{"html":"<p>Mensen die de hele dag in hun hoofd zitten, merken pas dat ze gespannen zijn als het al te veel is. Een uur per week op de mat verandert dat: even niet presteren, wél merken wat er in je lijf gebeurt.</p><p>We werken met wat er is: een vergaderzaal, een kantine, een hoek van het magazijn, en met mensen die nog nooit yoga hebben gedaan. Geen ingewikkelde houdingen, geen kleedkamer nodig.</p>"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('bedrijfsyoga', 'doelgroepen_titel', 'text', '{"text":""}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('bedrijfsyoga', 'doelgroepen', 'richtext', '{"items":[]}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('bedrijfsyoga', 'vormen_titel', 'text', '{"text":"In welke vorm"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('bedrijfsyoga', 'vormen_inleiding', 'text', '{"text":""}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('bedrijfsyoga', 'vormen', 'richtext', '{"items":[{"naam":"Kennismakingssessie","duur":"60 minuten, eenmalig","tekst":"Om te zien wat het is en of het bij jullie werkt. Start je binnen drie maanden een reeks, dan wordt dit bedrag verrekend.","prijs":"€ 195","uitgelicht":""},{"naam":"Reeks van 8 sessies","duur":"wekelijks, 60 minuten","tekst":"Een vast moment in de week, met dezelfde groep en dezelfde ruimte.","prijs":"€ 1.400 (€ 175 per sessie)","uitgelicht":""},{"naam":"Reeks van 12 sessies","duur":"wekelijks, 60 minuten","tekst":"Lang genoeg om iets te merken. Inclusief een korte energiemeting in week 1 en week 12, anoniem gerapporteerd.","prijs":"€ 1.980 (€ 165 per sessie)","uitgelicht":"ja"},{"naam":"Jaarcontract, 40 sessies","duur":"het hele jaar door","tekst":"Vaste dag, vaste groep, facturatie per maand of kwartaal. Opzegtermijn twee maanden.","prijs":"€ 6.200 (€ 155 per sessie)","uitgelicht":""},{"naam":"Workshop ‘Vertragen’","duur":"2 tot 3 uur, tot 20 deelnemers","tekst":"Op maat gemaakt na een intakegesprek. Werkt goed als onderbreking van een teamdag vol praten.","prijs":"€ 595","uitgelicht":""},{"naam":"Online live sessie","duur":"60 minuten, onbeperkt deelnemers","tekst":"Voor teams die verspreid zitten of thuiswerken. Ook in 30 of 45 minuten, vanaf € 95.","prijs":"€ 140","uitgelicht":""}]}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('bedrijfsyoga', 'praktisch_titel', 'text', '{"text":"Praktisch"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('bedrijfsyoga', 'praktisch', 'richtext', '{"items":[{"titel":"Wat jullie regelen","tekst":"Een ruimte waar iedereen kan liggen, en een kwartier om hem leeg te maken."},{"titel":"Wat wij meenemen","tekst":"Matten, blokken en alles wat er verder bij hoort."},{"titel":"Kleding","tekst":"Gewoon iets waarin je kunt bewegen. Niemand hoeft zich om te kleden voor een les die niet zweterig is."},{"titel":"Groepsgrootte","tekst":"Tot twaalf mensen per groep. Daarboven splitsen we."}]}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('bedrijfsyoga', 'fiscaal', 'richtext', '{"html":"<p>Yoga op de werkvloer onder werktijd valt voor de loonheffingen doorgaans onder de nihilwaardering voor voorzieningen op de werkplek: geen loonheffing, en geen beslag op de vrije ruimte. Online programma''s die medewerkers thuis volgen kunnen worden aangewezen in de vrije ruimte van de werkkostenregeling (2026: 2% over de eerste € 400.000 loonsom).</p><p>Laat de toepassing in jullie situatie bevestigen door de salarisadministratie of een adviseur. Wat wij niet zeggen, en andere aanbieders nog wel: dat dit een vrijgestelde arbovoorziening is. Sinds 2022 geldt die vrijstelling alleen nog voor voorzieningen die rechtstreeks uit de Arbowet volgen.</p>"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('bedrijfsyoga', 'vormen_voetnoot', 'text', '{"text":"Alle bedragen zijn exclusief btw en gelden tot 15 deelnemers; daarboven € 5 per extra deelnemer per sessie. Matten en props nemen we mee. Gratis binnen 20 kilometer van Almere, daarbuiten € 0,35 per gereden kilometer. Reeksen vooraf te voldoen, betaaltermijn 14 dagen."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('bedrijfsyoga', 'cta_titel', 'text', '{"text":"Een keer proberen?"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('bedrijfsyoga', 'cta_tekst', 'text', '{"text":"We komen graag eerst een keer langs voor een proefles, zodat jullie weten waar je ja tegen zegt. Laat weten met hoeveel mensen jullie zijn en waar jullie zitten."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('onderwijs', 'label', 'text', '{"text":"Voor het onderwijs"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('onderwijs', 'titel', 'text', '{"text":"Een lesuur waarin het stil wordt"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('onderwijs', 'inleiding', 'text', '{"text":"Yoga in het voortgezet onderwijs, op het mbo en in het hoger onderwijs. In het eigen lokaal, zonder omkleden en zonder gymzaal, en zonder dat het zweverig wordt, want daar prikken ze binnen een minuut doorheen."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('onderwijs', 'knop', 'text', '{"text":"Vraag een proefles aan"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('onderwijs', 'beeld', 'image', '{"url":"","alt":""}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('onderwijs', 'verhaal', 'richtext', '{"html":"<p>Yoga hoeft er niet uit te zien zoals het op foto''s staat. Wat een klas van vijftien nodig heeft is iets wat genoeg vraagt om de aandacht vast te houden, en daarna vijf minuten waarin er niets hoeft.</p><p>We werken met wat er is: een lokaal met de tafels aan de kant, de aula, of een collegezaal. Geen matten die niemand wil aanraken, geen kleedkamer, geen muziek die je toch niet mooi vindt.</p>"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('onderwijs', 'doelgroepen_titel', 'text', '{"text":"Voor wie"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('onderwijs', 'doelgroepen', 'richtext', '{"items":[{"titel":"Onderbouw voortgezet onderwijs","tekst":"Twaalf tot vijftien: veel prikkels, weinig taal om te zeggen wat er aan de hand is. We werken met houdingen die iets vrágen, want daar zit de aandacht vanzelf, en eindigen met vijf minuten liggen. In het mentoruur of aansluitend op gym.","uitgelicht":""},{"titel":"Examenklassen","tekst":"De weken vóór de toetsweek en het eindexamen. Ademhaling die je in een examenzaal kunt gebruiken, en een manier om je hoofd leeg te maken die niet ''even ontspannen'' heet. Ook als los rustuur tijdens de examenweek.","uitgelicht":""},{"titel":"Mbo","tekst":"Bij zorg, techniek en bouw komt er iets fysieks bij: tillen, staan, herhaalde belasting. Daar gaat het over houding en beweeglijkheid, en over de spanning die stage met zich meebrengt.","uitgelicht":""},{"titel":"Hbo en universiteit","tekst":"Rond tentamenperiodes, in een welzijnsprogramma, of via een studievereniging. Groepen van vijfentwintig tot dertig, in een collegezaal of een lege werkruimte.","uitgelicht":""},{"titel":"Het docenten- en medewerkersteam","tekst":"Een uur op een studiedag, of een blok van zes weken na schooltijd. Het kost geen lestijd, dus de beslissing is kleiner. En wie het zelf heeft gedaan, gunt het zijn klas ook.","uitgelicht":"ja"}]}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('onderwijs', 'praktisch_titel', 'text', '{"text":"Hoe het gaat"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('onderwijs', 'praktisch', 'richtext', '{"items":[{"titel":"Duur","tekst":"Eén lesuur. Veertig minuten werk, de rest is binnenkomen en weer opruimen."},{"titel":"Waar","tekst":"Het eigen lokaal met de tafels aan de kant, de aula, de gymzaal of een collegezaal. Wat er is."},{"titel":"Kleding","tekst":"Wat ze aanhebben. Schoenen uit. Niemand hoeft zich om te kleden; dat is precies de drempel waar de helft op afhaakt."},{"titel":"Telefoons","tekst":"In de tas. Ik neem ze niet in; dat is een afspraak tussen de docent en de klas, niet tussen mij en de klas."},{"titel":"De docent","tekst":"Blijft erbij en doet mee. Een klas die ziet dat een volwassene het ook onhandig vindt, doet zelf ook mee."},{"titel":"Groepsgrootte","tekst":"Eén klas, tot dertig. Grotere groepen splitsen we, anders zie ik niet wie er iets doet wat pijn gaat doen."},{"titel":"Een dagdeel","tekst":"Drie klassen achter elkaar op één ochtend, of vijf op een hele dag. Zo is ook de prijs opgebouwd: hoe meer klassen per bezoek, hoe lager de prijs per les."}]}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('onderwijs', 'vormen_titel', 'text', '{"text":"Wat het kost"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('onderwijs', 'vormen_inleiding', 'text', '{"text":"De prijs hangt aan het dagdeel, niet aan de les. Rijden en opbouwen kost meer tijd dan lesgeven, dus drie klassen op één ochtend is per klas een stuk voordeliger dan één losse les."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('onderwijs', 'vormen', 'richtext', '{"items":[{"naam":"Bezoek met één les","duur":"45 tot 60 minuten","tekst":"Eén klas of groep. Alleen los te boeken als het niet anders kan; per les is dit de duurste vorm.","prijs":"€ 165 excl. btw · € 199,65 incl.","uitgelicht":""},{"naam":"Dagdeel: drie lessen","duur":"aaneengesloten, één ochtend","tekst":"Drie klassen achter elkaar. Dit is de vorm waar de prijs op is gebouwd: € 125 per les.","prijs":"€ 375 excl. btw · € 453,75 incl.","uitgelicht":"ja"},{"naam":"Hele dag: vijf lessen","duur":"ochtend en middag","tekst":"Vijf klassen op één dag, € 115 per les. De voordeligste manier om een hele jaarlaag te bereiken.","prijs":"€ 575 excl. btw · € 695,75 incl.","uitgelicht":""},{"naam":"Examenweek-dagdeel","duur":"drie groepen van 75 minuten","tekst":"Ademhaling en Yin in de week zelf. Ook als los rustuur voor één examenklas, voor € 195 excl. btw.","prijs":"€ 495 excl. btw · € 598,95 incl.","uitgelicht":""},{"naam":"Studiedag voor het team","duur":"2 uur, tot 25 deelnemers","tekst":"‘Vertragen voor de klas’. Past in het scholingsbudget; een hele studiedag met twee groepen kost € 845 excl. btw.","prijs":"€ 495 excl. btw · € 598,95 incl.","uitgelicht":""},{"naam":"Medewerkersreeks","duur":"10 lessen na schooltijd, tot 15","tekst":"Wekelijks een uur voor docenten en ondersteunend personeel. € 155 per les.","prijs":"€ 1.550 excl. btw · € 1.875,50 incl.","uitgelicht":""},{"naam":"Jaarpartner","duur":"een heel schooljaar","tekst":"30 medewerkerslessen, een studiedag-workshop en een examenweek-dagdeel. Los zou dat € 5.640 kosten.","prijs":"€ 4.950 excl. btw · € 5.989,50 incl.","uitgelicht":""}]}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('onderwijs', 'vormen_voetnoot', 'text', '{"text":"Bedragen staan er twee keer bij omdat scholen de btw niet kunnen terugvragen: eerst exclusief, dan inclusief 21%. Inbegrepen tot één klas van 30 leerlingen, of een medewerkersgroep van 15. Matten en props nemen we mee. Gratis binnen 20 kilometer van Almere, daarbuiten € 0,35 per gereden kilometer. Bij een reeks van zes bezoeken gaat er 5% af, bij tien bezoeken 10%."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('onderwijs', 'cta_titel', 'text', '{"text":"Een keer proberen?"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('onderwijs', 'cta_tekst', 'text', '{"text":"Vertel om hoeveel klassen of groepen het gaat en in welke periode het zou moeten vallen, dan stuur ik binnen twee werkdagen een voorstel met een prijs erin."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('sportclubs', 'label', 'text', '{"text":"Voor sportclubs"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('sportclubs', 'titel', 'text', '{"text":"De dag na de wedstrijd"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('sportclubs', 'inleiding', 'text', '{"text":"Mobiliteit, herstel en ademhaling voor teams en individuele sporters. In de kantine, in de gymzaal of gewoon op het veld. Vijfenveertig minuten, na de training of op de hersteldag."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('sportclubs', 'knop', 'text', '{"text":"Vraag een proefsessie aan"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('sportclubs', 'beeld', 'image', '{"url":"","alt":""}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('sportclubs', 'verhaal', 'richtext', '{"html":"<p>Geen kaarsen, geen ohm. Wel werk aan de gewrichten die in jullie sport het meest vastlopen, en aan ademhaling die je onder druk kunt gebruiken.</p><p>Ik kom naar de club en werk met wat er is: de kantine, een zaal, of het veld als het droog is. Matten neem ik mee, maar op gras heb je ze niet eens nodig.</p>"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('sportclubs', 'doelgroepen_titel', 'text', '{"text":"Waar het over gaat"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('sportclubs', 'doelgroepen', 'richtext', '{"items":[{"titel":"Beweeglijkheid","tekst":"De gewrichten die in jullie sport het meest vastlopen. Bij voetbal en hockey zijn dat heupen en enkels, bij volleybal en handbal de schouders.","uitgelicht":""},{"titel":"Herstel","tekst":"Een rustige sessie de dag na een wedstrijd, gericht op weer soepel worden. Geen zware belasting erbovenop.","uitgelicht":""},{"titel":"Ademhaling en focus","tekst":"Rustiger worden op de bank, en terug bij de les komen na een tegendoelpunt. Dit is wat spelers zelf het vaakst noemen.","uitgelicht":""}]}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('sportclubs', 'praktisch_titel', 'text', '{"text":"Voor welke groep"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('sportclubs', 'praktisch', 'richtext', '{"items":[{"titel":"Een selectieteam","tekst":"Wekelijks in het seizoen, of een blok in de voorbereiding. Meestal aansluitend op de training, zodat niemand een extra avond kwijt is."},{"titel":"Jeugdteams","tekst":"Korter en speelser. Werkt goed op een zaterdagochtend, met ouders die kijken; dat levert vaak weer aanmeldingen voor de studio op."},{"titel":"Individuele sporters","tekst":"Hardlopers, wielrenners, tennissers. Een vaste groep uit de club, of een programma voor één iemand die ergens tegenaan loopt."},{"titel":"De trainersstaf","tekst":"Zij bepalen of het blijft. Een sessie met de trainers vóór je bij het team begint, is de beste investering van het hele traject."}]}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('sportclubs', 'vormen_titel', 'text', '{"text":"Wat het kost"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('sportclubs', 'vormen_inleiding', 'text', '{"text":"Per sessie of per blok. Veel clubs betalen dit uit het budget voor blessurepreventie of vanuit een sponsor; vraag ernaar bij je bestuur."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('sportclubs', 'vormen', 'richtext', '{"items":[{"naam":"Kennismakingsclinic","duur":"60 minuten, tot 20 spelers","tekst":"Eén sessie met één team, zodat de trainer kan zien wat het is. Wordt verrekend bij een blok binnen drie maanden.","prijs":"€ 185 excl. btw · € 223,85 incl.","uitgelicht":""},{"naam":"Blok van 6 sessies","duur":"wekelijks, in de trainingsavond","tekst":"Kort genoeg om mee te beginnen, lang genoeg om verschil te merken. € 162,50 per sessie.","prijs":"€ 975 excl. btw · € 1.179,75 incl.","uitgelicht":""},{"naam":"Blok van 12 sessies","duur":"een halve competitie","tekst":"De helft van het seizoen, aansluitend op de training. € 150 per sessie.","prijs":"€ 1.800 excl. btw · € 2.178 incl.","uitgelicht":"ja"},{"naam":"Heel seizoen: 30 sessies","duur":"augustus tot mei","tekst":"Vaste avond, vaste groep. € 145 per sessie; dat is onze ondergrens.","prijs":"€ 4.350 excl. btw · € 5.263,50 incl.","uitgelicht":""},{"naam":"Trainersworkshop","duur":"2 uur, tot 20 trainers","tekst":"Herstel en mobiliteit voor trainers en coaches. Sluit aan op ‘kwaliteit van het kader’ in het lokale sportakkoord.","prijs":"€ 450 excl. btw · € 544,50 incl.","uitgelicht":""},{"naam":"Open ledenles","duur":"vanaf 10 lessen, open inschrijving","tekst":"Voor alle leden in plaats van één team. Met een bijdrage van € 10 per deelnemer is de les voor de club kostenneutraal.","prijs":"€ 145 per les excl. btw · € 175,45 incl.","uitgelicht":""},{"naam":"Tweede team op dezelfde avond","duur":"aansluitend","tekst":"Geen extra reis, wel een extra lesuur. Bij elk blok en elk seizoenscontract.","prijs":"+ € 120 per sessie","uitgelicht":""}]}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('sportclubs', 'vormen_voetnoot', 'text', '{"text":"Bedragen staan er twee keer bij omdat de meeste clubs de btw niet kunnen terugvragen: eerst exclusief, dan inclusief 21%. Inbegrepen tot 20 deelnemers. Matten nemen we mee; op gras heb je ze niet eens nodig. Gratis binnen 20 kilometer van Almere, daarbuiten € 0,35 per gereden kilometer."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('sportclubs', 'cta_titel', 'text', '{"text":"Een keer proberen?"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('sportclubs', 'cta_tekst', 'text', '{"text":"Laat weten om welk team het gaat en op welke avond jullie trainen, dan stuur ik binnen twee werkdagen een voorstel."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('portfolio', 'naam', 'text', '{"text":"Wietske Visser"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('portfolio', 'rol', 'text', '{"text":"Oprichter en hoofddocent · YogaCompany"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('portfolio', 'foto', 'image', '{"url":"","alt":""}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('portfolio', 'intro', 'richtext', '{"html":"<p>[Vertel hier in twee of drie alinea''s wie je bent, hoe je bij yoga terecht bent gekomen en waar je voor staat. Schrijf het zoals je het aan iemand zou vertellen die tegenover je zit.]</p>"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('portfolio', 'ervaring_titel', 'text', '{"text":"Wat ik doe en heb gedaan"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('portfolio', 'ervaring', 'richtext', '{"items":[{"periode":"[jaartal] tot heden","titel":"[Wat je doet]","waar":"[Waar]","tekst":"[Eén of twee zinnen over wat het inhoudt.]"},{"periode":"[jaartal] tot [jaartal]","titel":"[Wat je deed]","waar":"[Waar]","tekst":"[Eén of twee zinnen.]"}]}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('portfolio', 'opleiding_titel', 'text', '{"text":"Opleidingen en certificeringen"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('portfolio', 'opleidingen', 'richtext', '{"items":[{"jaar":"[jaartal]","titel":"[Naam van de opleiding]","instituut":"[Bij wie]"}]}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('portfolio', 'specialisaties_titel', 'text', '{"text":"Waar ik goed in ben"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('portfolio', 'specialisaties', 'richtext', '{"items":[{"titel":"[Specialisatie]","tekst":"[Wat je ermee doet, en voor wie het iets oplevert.]"}]}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('portfolio', 'cta_titel', 'text', '{"text":"Iets samen doen?"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('portfolio', 'cta_tekst', 'text', '{"text":"Voor lessen, een opleiding, yoga op de werkvloer of een samenwerking: laat het weten."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('opleidingen', 'titel', 'text', '{"text":"Opleidingen"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('opleidingen', 'inleiding', 'text', '{"text":"Opleidingen die je stap voor stap opbouwt, in kleine groepen, met een certificaat per module."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('opleidingen', 'beeld', 'image', '{"url":"/beeld/opleidingen-zaal.jpg","alt":"Een zaal met yogamatten en blokken klaargelegd, zonder deelnemers"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('lessen', 'titel', 'text', '{"text":"Yogalessen"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('lessen', 'inleiding', 'text', '{"text":"Wekelijkse lessen in kleine groepen. Kijk wanneer het je uitkomt en boek je plek; met een account gaat dat in één klik."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('lessen', 'beeld', 'image', '{"url":"/beeld/lessen-studio.jpg","alt":"Een rustige ruimte met een houten bank, twee zitkussens en een rond raam"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('trainingen', 'titel', 'text', '{"text":"Trainingen"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('trainingen', 'beeld', 'image', '{"url":"/beeld/trainingen-blad.jpg","alt":"De schaduw van een plant op een lichte muur"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('trainingen', 'inleiding', 'text', '{"text":"Kortere programma''s, gericht op één onderwerp. Online of in de studio."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('over-ons', 'titel', 'text', '{"text":"Over YogaCompany"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('over-ons', 'verhaal', 'richtext', '{"html":"<p>YogaCompany is een opleidingsinstituut voor yoga. We leiden op, we trainen, en we geven les, in die volgorde van nadruk.</p><p>Wat ons bindt is een manier van kijken: yoga is geen prestatie. Een houding die er goed uitziet zegt niets als het lichaam eronder gespannen blijft. We leren onze deelnemers kijken naar de mens tegenover hen, niet naar de vorm.</p><p>Daarom werken we in kleine groepen. Daarom duren onze opleidingen langer dan strikt nodig. En daarom kun je onze modules los volgen: niet iedereen heeft hetzelfde tempo, en dat hoeft ook niet.</p>"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('over-ons', 'beeld', 'image', '{"url":"","alt":""}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('over-ons', 'docenten', 'richtext', '{"items":[{"naam":"Naam volgt","rol":"Oprichter en hoofddocent","bio":"Korte biografie volgt.","foto":""},{"naam":"Naam volgt","rol":"Docent","bio":"Korte biografie volgt.","foto":""}]}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('contact', 'titel', 'text', '{"text":"Contact"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('contact', 'inleiding', 'text', '{"text":"Een vraag over een opleiding, of wil je even overleggen wat past? Stuur ons een bericht; we reageren meestal binnen twee werkdagen."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('contact', 'gegevens', 'richtext', '{"items":[{"label":"E-mail","waarde":"info@yogacompany.eu"},{"label":"Telefoon","waarde":"Telefoonnummer volgt"},{"label":"Studio","waarde":"Adres volgt"}]}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('footer', 'over', 'text', '{"text":"Opleidingsinstituut voor yoga. Opleidingen, trainingen en yogalessen."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('footer', 'bedrijfsgegevens', 'richtext', '{"items":[{"label":"E-mail","waarde":"info@yogacompany.eu"},{"label":"KvK","waarde":"KvK-nummer volgt"}]}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('privacyverklaring', 'titel', 'text', '{"text":"Privacyverklaring"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('privacyverklaring', 'inleiding', 'text', '{"text":"We verwerken zo min mogelijk gegevens, en alleen wat nodig is om je opleiding te kunnen geven. Hieronder lees je precies wat, waarom en hoe lang."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('privacyverklaring', 'inhoud', 'richtext', '{"html":"\n<h2>1. Wie zijn wij</h2>\n<p>YogaCompany is verantwoordelijk voor de verwerking van je persoonsgegevens zoals beschreven in deze verklaring. Je bereikt ons via info@yogacompany.eu.</p>\n\n<h2>2. Welke gegevens we verwerken</h2>\n<p>We verwerken zo min mogelijk gegevens. Concreet gaat het om:</p>\n<ul>\n<li><strong>Bij een account:</strong> je voor- en achternaam, e-mailadres en, als je dat zelf invult, je telefoonnummer.</li>\n<li><strong>Bij een inschrijving:</strong> welke opleiding je volgt, de betaalstatus en het bedrag. Betaalgegevens zelf komen nooit bij ons binnen; die verwerkt Mollie.</li>\n<li><strong>Bij digitale content:</strong> waar je in een video of les gebleven bent, zodat je verder kunt waar je stopte.</li>\n<li><strong>Bij berichten:</strong> de inhoud van wat je ons via je eigen omgeving of het contactformulier stuurt.</li>\n<li><strong>Bij toestemming voor mailings:</strong> het moment waarop je die toestemming gaf.</li>\n</ul>\n\n<h2>3. Waarom we ze verwerken</h2>\n<p>Om je opleiding te kunnen leveren en je vragen te beantwoorden (uitvoering van de overeenkomst), om aan onze administratieve en fiscale verplichtingen te voldoen (wettelijke plicht), en, alleen als je daar toestemming voor gaf, om je af en toe iets te mailen over ons aanbod.</p>\n\n<h2>4. Hoe lang we ze bewaren</h2>\n<ul>\n<li>Contactberichten: 12 maanden.</li>\n<li>Accountgegevens: zolang je account bestaat. Na verwijdering anonimiseren we je gegevens; inschrijvings- en omzetgegevens blijven geanonimiseerd staan voor de boekhouding, zoals de wet vereist.</li>\n<li>Logboek van beheerhandelingen: 24 maanden.</li>\n</ul>\n\n<h2>5. Met wie we ze delen</h2>\n<p>We verkopen je gegevens niet. We werken met de volgende dienstverleners, die uitsluitend in onze opdracht handelen en waarmee we een verwerkersovereenkomst hebben:</p>\n<ul>\n<li><strong>Supabase</strong>: database, inloggen en bestandsopslag (servers in Frankfurt, EU)</li>\n<li><strong>Vercel</strong>: hosting van de website (regio Frankfurt, EU)</li>\n<li><strong>Mollie</strong>: betalingen (Amsterdam, EU)</li>\n<li><strong>Resend</strong>: verzenden van e-mail</li>\n<li><strong>Anthropic</strong>: hulp bij het opstellen van berichten voor sociale media, en bij het maken van een gespreksverslag voor je begeleiding. Voor dat verslag gaan je naam, e-mailadres, telefoonnummer en woonplaats <strong>niet</strong> mee; wel je leeftijd, je doelen, je voortgang en de aantekeningen die wij bij je hebben gemaakt. Heb je toestemming gegeven voor het vastleggen van gezondheidsinformatie, dan gaat die alleen mee als dat voor dat verslag nodig is</li>\n<li><strong>Meta</strong>: alleen wanneer wij zelf iets plaatsen op Facebook of Instagram</li>\n</ul>\n\n<h2>6. Waar je gegevens staan</h2>\n<p>Je gegevens staan op servers binnen de Europese Unie. Waar een dienstverlener gegevens buiten de EU zou verwerken, gebeurt dat op basis van de standaardcontractbepalingen van de Europese Commissie.</p>\n\n<h2>7. Beveiliging</h2>\n<p>Verkeer met onze website is versleuteld. Gegevens staan versleuteld opgeslagen. De scheiding tussen klanten is op databaseniveau afgedwongen: het is technisch niet mogelijk dat je de gegevens van een andere klant ziet. Beschermde video''s en documenten zijn alleen bereikbaar via tijdelijke links die verlopen. Beheerders kunnen alleen inloggen met tweestapsverificatie.</p>\n\n<h2>8. Cookies</h2>\n<p>We gebruiken uitsluitend functionele cookies: die zijn nodig om ingelogd te blijven. We volgen je niet en gebruiken geen advertentie- of statistiekcookies. Daarom zie je bij ons geen cookiemelding.</p>\n\n<h2>9. Je rechten</h2>\n<p>Je mag je gegevens inzien, corrigeren, meenemen of laten verwijderen, en je toestemming voor mailings altijd intrekken. Heb je een account, dan doe je dat zelf onder <em>Profiel</em>: je downloadt daar je gegevens als bestand en kunt verwijdering aanvragen. Liever per e-mail? Stuur een bericht naar info@yogacompany.eu.</p>\n<p>Ben je het oneens met hoe wij met je gegevens omgaan, dan kun je een klacht indienen bij de Autoriteit Persoonsgegevens.</p>\n\n<h2>10. Wijzigingen</h2>\n<p>Verandert deze verklaring, dan passen we de datum bovenaan aan. Bij ingrijpende wijzigingen laten we het je weten.</p>\n"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('privacyverklaring', 'concept_waarschuwing', 'text', '{"text":""}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('algemene-voorwaarden', 'titel', 'text', '{"text":"Algemene voorwaarden"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('algemene-voorwaarden', 'inleiding', 'text', '{"text":"Deze voorwaarden gelden voor alles wat we aanbieden. We hebben ze zo kort en leesbaar mogelijk gehouden."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('algemene-voorwaarden', 'inhoud', 'richtext', '{"html":"\n<h2>1. Waar deze voorwaarden over gaan</h2>\n<p>Deze voorwaarden gelden voor alle opleidingen, trainingen, lessen en digitale content van YogaCompany.</p>\n\n<h2>2. Inschrijven</h2>\n<p>Je schrijft je in via de website. De inschrijving is definitief zodra we je betaling hebben ontvangen en je van ons een bevestiging per e-mail hebt gekregen. Plaatsing gebeurt op volgorde van betaling; onze groepen zijn klein, dus vol is vol.</p>\n\n<h2>3. Prijzen en betalen</h2>\n<p>Alle genoemde prijzen zijn in euro''s. Betalen kan met iDEAL of creditcard. Betalen in termijnen is in overleg mogelijk; neem daarvoor contact met ons op vóór je inschrijving.</p>\n\n<h2>4. Bedenktijd</h2>\n<p>Schrijf je je als consument online in, dan heb je veertien dagen bedenktijd waarin je zonder opgaaf van reden kunt annuleren. Begint de opleiding binnen die veertien dagen en heb je gevraagd om eerder te starten, dan vervalt de bedenktijd zodra je toegang hebt gekregen tot het lesmateriaal.</p>\n\n<h2>5. Annuleren</h2>\n<ul>\n<li>Meer dan 30 dagen voor aanvang: je krijgt het volledige bedrag terug, minus € 50 administratiekosten.</li>\n<li>Tussen 30 en 14 dagen voor aanvang: je krijgt de helft terug.</li>\n<li>Binnen 14 dagen voor aanvang: geen restitutie. In overleg kun je je plek overdragen aan iemand anders, of doorschuiven naar een volgende groep.</li>\n</ul>\n<p>Word je ziek of overkomt je iets waardoor deelname echt niet gaat, neem dan contact met ons op. We zoeken dan samen naar een oplossing.</p>\n\n<h2>6. Annulering door ons</h2>\n<p>Gaat een opleiding niet door door te weinig aanmeldingen of overmacht, dan krijg je het volledige bedrag terug. Moeten we een lesdag verplaatsen, dan plannen we een vervangende datum.</p>\n\n<h2>7. Digitale content</h2>\n<p>Video''s, documenten en teksten in je eigen omgeving zijn persoonlijk. Je mag ze bekijken en gebruiken voor je eigen leerproces, maar niet delen, doorverkopen of openbaar maken. Je toegang loopt zolang de opleiding loopt en daarna nog een redelijke periode; wij laten het weten als daar iets aan verandert.</p>\n\n<h2>8. Certificaten</h2>\n<p>Je ontvangt een certificaat als je de module hebt afgerond: aanwezig bij de lesdagen en de eindopdracht voldoende afgesloten. Rond je alle vier de modules van de Yin Yoga Specialist Opleiding af, dan ontvang je het diploma.</p>\n\n<h2>9. Wat wij van je vragen</h2>\n<p>Yoga is geen medische behandeling. Heb je klachten, een blessure of ben je zwanger, laat het ons dan vóór aanvang weten en overleg zo nodig met je arts. Je blijft zelf verantwoordelijk voor wat je tijdens een les wel en niet doet: luister naar je lichaam en forceer niets.</p>\n\n<h2>10. Aansprakelijkheid</h2>\n<p>We doen ons werk zorgvuldig. Onze aansprakelijkheid is beperkt tot het bedrag dat je voor de betreffende opleiding hebt betaald, behalve bij opzet of grove nalatigheid van onze kant.</p>\n\n<h2>11. Klachten</h2>\n<p>Ben je ergens niet tevreden over, laat het ons weten via info@yogacompany.eu. We reageren binnen veertien dagen en zoeken samen naar een oplossing.</p>\n\n<h2>12. Toepasselijk recht</h2>\n<p>Op deze voorwaarden is Nederlands recht van toepassing.</p>\n"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('algemene-voorwaarden', 'concept_waarschuwing', 'text', '{"text":""}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('cookies', 'titel', 'text', '{"text":"Cookies"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('cookies', 'inleiding', 'text', '{"text":"Een korte pagina, want er valt weinig te melden: we gebruiken alleen cookies die nodig zijn om de site te laten werken."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('cookies', 'inhoud', 'richtext', '{"html":"\n<h2>Kort gezegd</h2>\n<p>We volgen je niet. YogaCompany gebruikt geen advertentiecookies, geen statistiekcookies en geen trackers van derden. Daarom krijg je bij ons geen cookiemelding: die is alleen verplicht voor cookies die wij niet gebruiken.</p>\n\n<h2>Welke cookies dan wel</h2>\n<p>Alleen cookies die nodig zijn om de site te laten werken:</p>\n<ul>\n<li><strong>Inlogcookies.</strong> Zodra je inlogt, onthouden we dat je ingelogd bent. Zonder deze cookie zou je bij elke pagina opnieuw moeten inloggen. Hij verdwijnt als je uitlogt.</li>\n<li><strong>Beveiligingscookies.</strong> Deze beschermen formulieren tegen misbruik.</li>\n</ul>\n<p>Voor functionele cookies is geen toestemming vereist. Je kunt ze in je browser blokkeren, maar dan kun je niet inloggen.</p>\n\n<h2>Cookies van anderen</h2>\n<p>Betaal je via Mollie, dan gebeurt dat op de omgeving van Mollie zelf, dat daar eigen cookies plaatst. Sluiten we ooit een video van YouTube of Vimeo in, dan doen we dat in de privacyvriendelijke modus.</p>\n\n<h2>Vragen</h2>\n<p>Stuur gerust een bericht naar info@yogacompany.eu.</p>\n"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('cookies', 'concept_waarschuwing', 'text', '{"text":""}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('veiligheid', 'titel', 'text', '{"text":"Veiligheid en privacy"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('veiligheid', 'inleiding', 'text', '{"text":"Je vertrouwt ons iets toe: je naam, je voortgang, soms iets over je gezondheid. Hieronder staat wat we daarmee doen, en wat we bewust niet doen."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('veiligheid', 'kern', 'richtext', '{"html":"\n<p>De korte versie, in vier punten.</p>\n<ul>\n<li><strong>Je gegevens staan in Frankfurt</strong>, op servers binnen de Europese Unie.</li>\n<li><strong>Alleen jij ziet jouw dossier.</strong> Dat is geen belofte, maar een regel in de database zelf, die weigert de gegevens van iemand anders uit te leveren, ook wanneer de website een fout zou maken.</li>\n<li><strong>Je wachtwoord kennen we niet.</strong> We kunnen het niet opzoeken en niet doorgeven; we kunnen je alleen helpen een nieuw in te stellen.</li>\n<li><strong>We volgen je niet.</strong> Geen advertentiecookies, geen meekijkende partijen, geen profiel dat ergens verhandeld wordt.</li>\n</ul>\n<p>Wil je weten hoe dat werkt, of waarom je ons daarin zou geloven? Hieronder klapt het open.</p>\n"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('veiligheid', 'sectie_1_vraag', 'text', '{"text":"Hoe weten jullie zo zeker dat niemand anders bij mijn gegevens kan?"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('veiligheid', 'sectie_1_antwoord', 'richtext', '{"html":"\n<p>Bij veel websites is de website zelf de portier: die bepaalt bij elke pagina wie wat te zien krijgt. Sluipt er ergens in die code een fout, dan ligt in één klap alles open. Dat is de manier waarop de meeste datalekken ontstaan.</p>\n<p>Hier ligt de portier een laag dieper: in de database. Elke tabel heeft regels die zeggen <em>geef een rij alleen terug aan degene van wie hij is</em>. Zou de website per ongeluk álles opvragen, dan krijgt hij nog steeds alleen jouw rijen terug. De fout wordt dan een lege lijst in plaats van een lek. Op dit moment zijn dat 45 van zulke regels, verdeeld over alle 22 tabellen.</p>\n<p>Gezondheidsgegevens gaan een stap verder. Die staan in een apart afgeschermd deel van de database waar geen enkele toegangsregel naartoe leidt: ook niet voor jou, ook niet voor een ingelogde beheerder via de gewone weg. Ze bestaan alleen als jij ze zelf hebt gedeeld, en ze zijn alleen te lezen langs de ene route die daar speciaal voor is.</p>\n<p>Het beheergedeelte zit bovendien achter tweestapsverificatie: naast een wachtwoord is een code van zes cijfers nodig die elke dertig seconden verandert. Wie het wachtwoord van een beheerder zou raden, komt er zonder die code nog steeds niet in.</p>\n"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('veiligheid', 'sectie_2_vraag', 'text', '{"text":"Waar staan mijn gegevens precies?"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('veiligheid', 'sectie_2_antwoord', 'richtext', '{"html":"\n<ul>\n<li><strong>Je account, je inschrijvingen en je voortgang</strong>: bij Supabase, in Frankfurt. Dat is de database.</li>\n<li><strong>De website zelf</strong>: bij Vercel, ook in Frankfurt. Daar wordt niets van jou bewaard; die zet alleen de pagina''s in elkaar.</li>\n<li><strong>Beeld en cursusmateriaal</strong>: eveneens Frankfurt, bij dezelfde partij als de database.</li>\n<li><strong>Betalingen</strong>: bij Mollie in Amsterdam. Je kaart- of rekeningnummer komt nooit onze kant op; wij zien alleen dát er betaald is, het bedrag, en een verwijzing.</li>\n<li><strong>E-mail</strong>: via Resend, dat de bevestigings- en herstelmails verstuurt.</li>\n</ul>\n<p>Eén uitzondering, en die noemen we liever zelf dan dat je hem ergens moet opzoeken. Maakt je begeleider een verslag ter voorbereiding van een gesprek, dan gaat een deel van je dossier naar Anthropic, in de Verenigde Staten. Je naam, e-mailadres, telefoonnummer, woonplaats en geboortedatum gaan daarbij <strong>niet</strong> mee. Wel je leeftijd, je doelen, je voortgang en de aantekeningen. Iets over je gezondheid gaat alleen mee als jij daar toestemming voor gaf én je begeleider het per keer aanvinkt.</p>\n<p>Dat is geen anonimiteit, en we doen ook niet alsof: een uitgebreid profiel kan indirect nog steeds naar één persoon leiden. Daarom staat het hier, en in de privacyverklaring.</p>\n"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('veiligheid', 'sectie_3_vraag', 'text', '{"text":"Wat gebeurt er met mijn wachtwoord?"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('veiligheid', 'sectie_3_antwoord', 'richtext', '{"html":"\n<p>Je wachtwoord wordt niet opgeslagen. Wat bewaard wordt is een onleesbare afdruk ervan, gemaakt met een berekening die niet terug te draaien is. Bij het inloggen wordt niet gekeken of je wachtwoord klopt, maar of de afdruk ervan klopt.</p>\n<p>Het gevolg is misschien onhandig maar wel geruststellend: <strong>wij kunnen je wachtwoord niet opzoeken.</strong> Vraag je ernaar, dan is het eerlijke antwoord dat we het echt niet weten. We kunnen alleen een herstelmail sturen naar het adres dat bij je account hoort.</p>\n<p>Je kunt zelf tweestapsverificatie aanzetten in je eigen omgeving. Voor beheerders is dat geen keuze maar een eis: zonder tweede stap komt niemand bij het beheer.</p>\n"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('veiligheid', 'sectie_4_vraag', 'text', '{"text":"Waarmee is deze site gebouwd?"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('veiligheid', 'sectie_4_antwoord', 'richtext', '{"html":"\n<p>Van voor naar achter, zonder jargon:</p>\n<ul>\n<li><strong>De pagina''s</strong> worden op de server in elkaar gezet en kant-en-klaar naar je browser gestuurd. Dat is snel, en het werkt ook wanneer er onderweg iets misgaat met de opmaak of de scripts.</li>\n<li><strong>De opslag</strong> is een gewone database (PostgreSQL) met inloggen en bestandsopslag eromheen, geleverd door Supabase.</li>\n<li><strong>De hosting</strong> loopt via Vercel, met de regio vastgezet op Frankfurt zodat er niets buiten de EU terechtkomt.</li>\n<li><strong>Betalen en mailen</strong> besteden we uit aan partijen die daar goed in zijn, Mollie en Resend, in plaats van dat zelf te bouwen.</li>\n</ul>\n<p>De teksten en foto''s die je hier leest staan niet vastgemetseld in de code. Ze staan in de database en zijn aan te passen via een eigen editor. Een wijziging is eerst een concept dat alleen de beheerder ziet; pas bij publiceren komt hij online, en elke publicatie belandt in een logboek dat niet te wissen is.</p>\n<p>Verder krijgt je browser van ons een lijst mee van de plekken waar deze pagina iets vandaan mag halen. Staat een adres niet op die lijst, dan weigert je browser het, ook als iemand het er via een omweg tussen zou weten te krijgen.</p>\n"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('veiligheid', 'sectie_5_vraag', 'text', '{"text":"Hoe weten jullie dat een wijziging niets stukmaakt?"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('veiligheid', 'sectie_5_antwoord', 'richtext', '{"html":"\n<p>Omdat er niets online gaat voordat een reeks controles automatisch is doorlopen. Die controles kijken niet of de site er mooi uitziet, maar of hij zich gedraagt:</p>\n<ul>\n<li><strong>84 controles op losse onderdelen</strong>: rekent de prijs goed, wordt een te late annulering geweigerd.</li>\n<li><strong>271 controles die juist proberen wat niet mag:</strong> klant A die het dossier van klant B opvraagt, iemand die zichzelf beheerder maakt, betaalde content bekijken zonder betaling, een concepttekst die uitlekt voordat hij gepubliceerd is. Elk van die pogingen hóórt te mislukken, en de controle valt om zodra er ééntje slaagt.</li>\n<li><strong>212 controles die de site in twee echte browsers doorlopen</strong>, op een laptop en op een telefoon, van begin tot eind: inschrijven, inloggen, boeken, annuleren.</li>\n</ul>\n<p>Samen zijn dat ruim vierhonderd controles, en ze draaien bij elke wijziging opnieuw. Springt er één op rood, dan gaat de wijziging niet door. Niet \"we kijken er nog naar\": hij komt er eenvoudigweg niet in.</p>\n"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('veiligheid', 'sectie_6_vraag', 'text', '{"text":"Wat is er bewust nog niet af?"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('veiligheid', 'sectie_6_antwoord', 'richtext', '{"html":"\n<p>Liever eerlijk dan glad:</p>\n<ul>\n<li><strong>Online betalen kan nog niet.</strong> Schrijf je je in, dan wordt dat een aanvraag en nemen we zelf contact met je op over de betaling.</li>\n<li><strong>De juridische teksten zijn concept.</strong> Ze zijn zorgvuldig opgesteld, maar nog niet door een jurist nagekeken. Dat staat er ook bij, op de pagina''s zelf.</li>\n<li><strong>Nieuwsbrieven versturen we nog niet.</strong> Eerst willen we de toestemmingsadministratie sluitend hebben; daarna pas de eerste mailing.</li>\n</ul>\n<p>Zodra hier iets in verandert, verandert deze pagina mee.</p>\n"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('tarieven', 'titel', 'text', '{"text":"Tarieven"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('tarieven', 'locatie', 'text', '{"text":"Lessen Rinske Yoga, Almere"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('tarieven', 'inleiding', 'text', '{"text":"Alle kaarten naast elkaar. Hoe meer lessen op je kaart, hoe voordeliger je per keer uit bent; dat staat in de derde kolom, zodat je het niet zelf hoeft uit te rekenen."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('tarieven', 'tarieven', 'richtext', '{"items":[{"naam":"Snuffelkaart","toelichting":"3 lessen, om kennis te maken","prijs":"€ 9,00","per_les":"€ 3,00","geldig":"n.v.t.","uitgelicht":"","rail":""},{"naam":"Losse les","toelichting":"Eén les, zonder verplichting","prijs":"€ 17,00","per_les":"€ 17,00","geldig":"n.v.t.","uitgelicht":"","rail":"ja"},{"naam":"3-strippenkaart","toelichting":"3 lessen","prijs":"€ 47,50","per_les":"€ 15,83","geldig":"1 maand, uitloop tot 1½","uitgelicht":"","rail":"ja"},{"naam":"10-strippenkaart","toelichting":"10 lessen","prijs":"€ 145,00","per_les":"€ 14,50","geldig":"3 maanden, uitloop tot 4","uitgelicht":"ja","rail":"ja"},{"naam":"20-strippenkaart","toelichting":"20 lessen","prijs":"€ 280,00","per_les":"€ 14,00","geldig":"6 maanden, uitloop tot 7","uitgelicht":"","rail":"ja"},{"naam":"Maandabonnement","toelichting":"1× per week","prijs":"€ 58,50","per_les":"± € 13,50","geldig":"opzegtermijn 1 maand","uitgelicht":"","rail":""},{"naam":"Kwartaalabonnement","toelichting":"1× per week","prijs":"€ 169,00","per_les":"± € 13,00","geldig":"3 maanden","uitgelicht":"","rail":""},{"naam":"Halfjaarabonnement","toelichting":"1× per week","prijs":"€ 316,00","per_les":"± € 12,15","geldig":"6 maanden","uitgelicht":"","rail":""}]}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('tarieven', 'voorwaarden', 'richtext', '{"html":"\n<p>Reserveer je plek vooraf; een kaart geeft toegang tot alle lessen in het weekrooster. Tot <strong>24 uur</strong> voor de les annuleren is kosteloos; daarna kost het een strip.</p>\n<p>Lukt het een keer echt niet, laat het dan weten. We kijken er niet moeilijk over.</p>\n"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('tarieven', 'rail_titel', 'text', '{"text":"Strippenkaarten"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('tarieven', 'rail_voet', 'text', '{"text":"Een kaart geldt voor alle lessen hiernaast."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('voor-yogadocenten', 'titel', 'text', '{"text":"Voor yogadocenten"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('voor-yogadocenten', 'locatie', 'text', '{"text":"Rinske Yoga Almere"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('voor-yogadocenten', 'inleiding', 'text', '{"text":"Geef je les bij Rinske Yoga in Almere? Dan kun je hier je eigen strippenkaarten verkopen, ze bij je collega''s laten gelden, en aan het eind van de maand netjes met elkaar afrekenen."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('voor-yogadocenten', 'uitleg', 'richtext', '{"html":"\n<h2>Hoe het werkt</h2>\n<p>Je verkoopt je eigen kaarten en int dat geld zelf, op je eigen rekening. Je legt in de portal vast wat je hebt verkocht; vanaf dat moment kan je klant lessen boeken en telt zijn saldo af.</p>\n<p>Komt jouw klant met die kaart bij een collega, dan wordt dat geregistreerd en betaal jij die collega per gegeven les. Komt zíjn klant bij jou, dan werkt het andersom. Aan het eind van de maand sluit je af en staan de facturen klaar.</p>\n\n<h2>Wat het kost aan een collega</h2>\n<p>Je betaalt de werkelijke waarde van één les van díé kaart, exclusief btw. Bij een 10-strippenkaart is dat <strong>€ 13,30</strong>: precies wat jij er zelf van overhield nadat je de btw had afgedragen. Je levert er dus niets op in, en je verdient er ook niets aan.</p>\n<p>Op een kennismakingskaart geldt dit niet: die is alleen bij jou geldig. Anders zou je de kennismaking van een collega betalen.</p>\n\n<h2>Het geld loopt niet via ons</h2>\n<p>Wij ontvangen niets en betalen niets door. Jij factureert je collega rechtstreeks, en hij jou. Wij houden bij wat er is gebeurd, rekenen het uit en zetten de factuur klaar met jouw gegevens en jouw nummerreeks.</p>\n\n<h2>Wat je ziet, en wat niet</h2>\n<p>Je ziet de kaarten die jij hebt verkocht en elke afboeking daarop, ook wanneer die bij een collega plaatsvond, want daar factureer je op. Van je eigen lessen zie je wie er komt.</p>\n<p>Je ziet nooit de kaarten, klanten of afrekeningen van een collega waar je zelf niet in zit. Dat is geen instelling in een scherm maar een regel in de database.</p>\n"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('voor-yogadocenten', 'voorwaarden_titel', 'text', '{"text":"Wat je nodig hebt om mee te doen"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('voor-yogadocenten', 'voorwaarden', 'richtext', '{"html":"\n<ul>\n<li>Je geeft les bij een aangesloten studio en huurt daar zelf je plek in het rooster.</li>\n<li>Je bent ingeschreven bij de Kamer van Koophandel en factureert met btw.</li>\n<li>Je vult je factuurgegevens in de portal in: naam, adres, KvK, btw-nummer en de nummerreeks die je zelf gebruikt.</li>\n<li>Je houdt je aan de prijzen van de studio. Die staan vast; daar valt niet mee te schuiven.</li>\n<li>Je neemt een abonnement op de docentenlaag. Wat dat kost hoor je bij de aansluiting.</li>\n</ul>\n<p>Er komt een verwerkersovereenkomst bij: als een klant van jou bij een collega les volgt, deel je noodzakelijkerwijs zijn naam. Dat hoort op papier te staan, en het staat ook in de privacyverklaring.</p>\n"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;
