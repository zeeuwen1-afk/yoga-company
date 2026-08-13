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
  'Vier modules van 50 uur — van de basis van Yin Yoga naar specialist in herstel en revalidatie. Per module een certificaat Yin Yoga niveau 1 t/m 4; na alle vier de modules het diploma Yin Yoga Specialist.', 'De 200-uurs Yin Yoga Specialist Opleiding brengt je van de fundamenten van Yin Yoga naar het punt waarop je de vorm kunt inzetten bij herstel en revalidatie.

De opleiding bestaat uit vier modules van elk 50 uur. Je volgt ze achter elkaar of verspreid over een langere periode — de modules zijn ook los te volgen. Elke module sluit je af met een certificaat. Rond je alle vier af, dan ontvang je het diploma Yin Yoga Specialist.

We werken in kleine groepen van maximaal twaalf deelnemers. Dat is een bewuste keuze: je krijgt persoonlijke begeleiding en er is ruimte om te oefenen met echte mensen en echte lichamen.',
  'Yogadocenten die zich willen specialiseren, professionals in zorg en beweging die Yin Yoga in hun werk willen inzetten, en mensen die zich vanuit persoonlijke interesse grondig willen verdiepen.', 'Voor module 1 is geen vooropleiding vereist. Ervaring met yoga is prettig, maar geen voorwaarde. Wil je lesgeven, dan is een afgeronde basisopleiding tot yogadocent aan te raden.',
  '[{"nummer":1,"titel":"De basis van Yin Yoga","uren":50,"samenvatting":"Je leert waar Yin Yoga vandaan komt, hoe de houdingen werken en wat ze met het lichaam doen.","blokken":[{"titel":"Fundamenten van yin en yang","onderdelen":["Het onderscheid tussen yin en yang in beweging en in rust","Waar de vorm vandaan komt en welke visie eronder ligt"]},{"titel":"Basisprincipes","onderdelen":["De drie principes van een yin-houding","Tijd, diepte en de rol van stilte","Hulpmiddelen inzetten voor verschillende lichamen"]},{"titel":"Houdingen en hun werking","onderdelen":["De kernhoudingen en hun varianten","Werking op bindweefsel, gewrichten en botten","Anatomische verschillen en wat die betekenen voor je lesgeven"]}]},{"nummer":2,"titel":"Het zenuwstelsel & de basis van de meridiaanleer","uren":50,"samenvatting":"Waarom Yin Yoga rust brengt, en de eerste kennismaking met de meridianen.","blokken":[{"titel":"Het zenuwstelsel","onderdelen":["Sympathisch en parasympathisch: spanning en herstel","Wat langdurige stress met het lichaam doet","Hoe een yin-les het herstelvermogen aanspreekt"]},{"titel":"Basis van de meridiaanleer","onderdelen":["Wat meridianen zijn en hoe ze zijn geordend","De verbinding tussen houding en meridiaan","Eerste toepassing in het opbouwen van een les"]}]},{"nummer":3,"titel":"Chinese geneeskunde en Yin Yoga","uren":50,"samenvatting":"Werken met meridianen, de vijf elementen en de orgaanklok.","blokken":[{"titel":"Werken met meridianen","onderdelen":["De meridianen in de praktijk van een yin-les","Houdingen kiezen op basis van wat iemand nodig heeft"]},{"titel":"De elementen","onderdelen":["De vijf elementen en hun onderlinge samenhang","Seizoenen en wat ze vragen"]},{"titel":"De orgaanklok","onderdelen":["Het ritme van de dag en de organen","Een les afstemmen op tijd en seizoen"]}]},{"nummer":4,"titel":"Herstel & revalidatie","uren":50,"samenvatting":"Alle kennis komt samen: je leert Yin Yoga inzetten bij herstel en revalidatie, en persoonlijke lessen maken.","blokken":[{"titel":"Kennis integreren","onderdelen":["De vier modules samenbrengen in één werkwijze","Kijken naar de mens tegenover je, niet naar de houding"]},{"titel":"Herstel en revalidatie","onderdelen":["Yin Yoga bij overbelasting, blessures en langdurige klachten","Grenzen van je vak: wanneer je doorverwijst"]},{"titel":"Persoonlijke lessen maken","onderdelen":["Een programma opbouwen voor één persoon","Begeleiden, bijstellen en opvolgen"]}]}]'::jsonb,
  'Per module: 5 lesdagen (± 32 contacturen) + ± 18 uur zelfstudie en eindopdracht', 'Studio van YogaCompany (adres volgt)',
  12, 'Certificaat Yin Yoga niveau 1 t/m 4 per module; diploma Yin Yoga Specialist na alle vier de modules — modules zijn ook los te volgen',
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
  'opleiding', 'Yin Yoga niveau 1 — De basis van Yin Yoga', 'yin-niveau-1-basis',
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
  'opleiding', 'Yin Yoga niveau 2 — Het zenuwstelsel & de basis van de meridiaanleer', 'yin-niveau-2-zenuwstelsel-meridiaanleer',
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
  'opleiding', 'Yin Yoga niveau 3 — Chinese geneeskunde en Yin Yoga', 'yin-niveau-3-chinese-geneeskunde',
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
  'opleiding', 'Yin Yoga niveau 4 — Herstel & revalidatie', 'yin-niveau-4-herstel-revalidatie',
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
  'training', 'Eerst Jij — 8-weeks online herstelprogramma', 'eerst-jij',
  'Acht weken online, in je eigen tempo, met begeleiding. Voor wie leeg is en weer wil opbouwen — stap voor stap, zonder te forceren.', 'Eerst Jij is een programma van acht weken voor mensen die op zijn. Uitgeput, oververmoeid, of hersteld verklaard maar nog lang niet de oude.

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

-- CMS-blokken ---------------------------------------------------------------
-- De publieke site leest uitsluitend 'value'; 'draft_value' blijft leeg tot
-- iemand in de site-editor een concept maakt (BOUWPROMPT §14).

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'hero_titel', 'text', '{"text":"YogaCompany — opleidingsinstituut voor yoga"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'hero_subtitel', 'text', '{"text":"Opleidingen, trainingen en yogalessen. Deskundig en betrouwbaar, warm en persoonlijk."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'hero_knop', 'text', '{"text":"Bekijk de opleidingen"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'hero_beeld', 'image', '{"url":"","alt":""}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'zakelijk_titel', 'text', '{"text":"Voor je vak"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'zakelijk_tekst', 'richtext', '{"html":"<p>Specialiseren in een vorm die je aanvult in plaats van uitput. Onze opleidingen zijn praktijkgericht en erkend met een certificaat per module, zodat je stap voor stap kunt bouwen.</p><p>Ook voor werkgevers die willen investeren in duurzame inzetbaarheid van hun mensen.</p>"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'persoonlijk_titel', 'text', '{"text":"Voor jezelf"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('home', 'persoonlijk_tekst', 'richtext', '{"html":"<p>Soms is het je eigen lichaam dat om aandacht vraagt. Herstel na een periode van te veel, terugvinden van balans, of gewoon verdieping omdat je nieuwsgierig bent.</p><p>Je hoeft geen doel te hebben om te beginnen.</p>"}'::jsonb)
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
values ('home', 'testimonials', 'richtext', '{"items":[{"citaat":"Voor het eerst een opleiding waar het tempo klopte met wat ik aankon.","naam":"Deelnemer — naam volgt","rol":"Yin Yoga niveau 1 en 2"},{"citaat":"De kleine groep maakte het verschil. Er was echt tijd voor mijn vragen.","naam":"Deelnemer — naam volgt","rol":"200-uurs Yin Yoga Specialist"},{"citaat":"Ik kwam binnen als deelnemer en ging weg met een manier van kijken.","naam":"Deelnemer — naam volgt","rol":"Eerst Jij"}]}'::jsonb)
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
values ('lessen', 'titel', 'text', '{"text":"Yogalessen"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('lessen', 'inleiding', 'text', '{"text":"Wekelijkse lessen in kleine groepen. Kijk wanneer het je uitkomt en boek je plek — met een account gaat dat in één klik."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('trainingen', 'titel', 'text', '{"text":"Trainingen"}'::jsonb)
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
values ('over-ons', 'verhaal', 'richtext', '{"html":"<p>YogaCompany is een opleidingsinstituut voor yoga. We leiden op, we trainen, en we geven les — in die volgorde van nadruk.</p><p>Wat ons bindt is een manier van kijken: yoga is geen prestatie. Een houding die er goed uitziet zegt niets als het lichaam eronder gespannen blijft. We leren onze deelnemers kijken naar de mens tegenover hen, niet naar de vorm.</p><p>Daarom werken we in kleine groepen. Daarom duren onze opleidingen langer dan strikt nodig. En daarom kun je onze modules los volgen: niet iedereen heeft hetzelfde tempo, en dat hoeft ook niet.</p>"}'::jsonb)
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
values ('contact', 'inleiding', 'text', '{"text":"Een vraag over een opleiding, of wil je even overleggen wat past? Stuur ons een bericht — we reageren meestal binnen twee werkdagen."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('contact', 'gegevens', 'richtext', '{"items":[{"label":"E-mail","waarde":"info@yogacompanie.nl"},{"label":"Telefoon","waarde":"Telefoonnummer volgt"},{"label":"Studio","waarde":"Adres volgt"}]}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('footer', 'over', 'text', '{"text":"Opleidingsinstituut voor yoga. Opleidingen, trainingen en yogalessen."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('footer', 'bedrijfsgegevens', 'richtext', '{"items":[{"label":"E-mail","waarde":"info@yogacompanie.nl"},{"label":"KvK","waarde":"KvK-nummer volgt"}]}'::jsonb)
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
values ('privacyverklaring', 'inhoud', 'richtext', '{"html":"\n<h2>1. Wie zijn wij</h2>\n<p>YogaCompany is verantwoordelijk voor de verwerking van je persoonsgegevens zoals beschreven in deze verklaring. Je bereikt ons via info@yogacompanie.nl.</p>\n\n<h2>2. Welke gegevens we verwerken</h2>\n<p>We verwerken zo min mogelijk gegevens. Concreet gaat het om:</p>\n<ul>\n<li><strong>Bij een account:</strong> je voor- en achternaam, e-mailadres en — als je dat zelf invult — je telefoonnummer.</li>\n<li><strong>Bij een inschrijving:</strong> welke opleiding je volgt, de betaalstatus en het bedrag. Betaalgegevens zelf komen nooit bij ons binnen; die verwerkt Stripe.</li>\n<li><strong>Bij digitale content:</strong> waar je in een video of les gebleven bent, zodat je verder kunt waar je stopte.</li>\n<li><strong>Bij berichten:</strong> de inhoud van wat je ons via je eigen omgeving of het contactformulier stuurt.</li>\n<li><strong>Bij toestemming voor mailings:</strong> het moment waarop je die toestemming gaf.</li>\n</ul>\n\n<h2>3. Waarom we ze verwerken</h2>\n<p>Om je opleiding te kunnen leveren en je vragen te beantwoorden (uitvoering van de overeenkomst), om aan onze administratieve en fiscale verplichtingen te voldoen (wettelijke plicht), en — alleen als je daar toestemming voor gaf — om je af en toe iets te mailen over ons aanbod.</p>\n\n<h2>4. Hoe lang we ze bewaren</h2>\n<ul>\n<li>Contactberichten: 12 maanden.</li>\n<li>Accountgegevens: zolang je account bestaat. Na verwijdering anonimiseren we je gegevens; inschrijvings- en omzetgegevens blijven geanonimiseerd staan voor de boekhouding, zoals de wet vereist.</li>\n<li>Logboek van beheerhandelingen: 24 maanden.</li>\n</ul>\n\n<h2>5. Met wie we ze delen</h2>\n<p>We verkopen je gegevens niet. We werken met de volgende dienstverleners, die uitsluitend in onze opdracht handelen en waarmee we een verwerkersovereenkomst hebben:</p>\n<ul>\n<li><strong>Supabase</strong> — database, inloggen en bestandsopslag (servers in Frankfurt, EU)</li>\n<li><strong>Vercel</strong> — hosting van de website (regio Frankfurt, EU)</li>\n<li><strong>Stripe</strong> — betalingen</li>\n<li><strong>Resend</strong> — verzenden van e-mail</li>\n<li><strong>Anthropic</strong> — hulp bij het opstellen van berichten voor sociale media; hier gaan geen klantgegevens naartoe</li>\n<li><strong>Meta</strong> — alleen wanneer wij zelf iets plaatsen op Facebook of Instagram</li>\n</ul>\n\n<h2>6. Waar je gegevens staan</h2>\n<p>Je gegevens staan op servers binnen de Europese Unie. Waar een dienstverlener gegevens buiten de EU zou verwerken, gebeurt dat op basis van de standaardcontractbepalingen van de Europese Commissie.</p>\n\n<h2>7. Beveiliging</h2>\n<p>Verkeer met onze website is versleuteld. Gegevens staan versleuteld opgeslagen. De scheiding tussen klanten is op databaseniveau afgedwongen: het is technisch niet mogelijk dat je de gegevens van een andere klant ziet. Beschermde video''s en documenten zijn alleen bereikbaar via tijdelijke links die verlopen. Beheerders kunnen alleen inloggen met tweestapsverificatie.</p>\n\n<h2>8. Cookies</h2>\n<p>We gebruiken uitsluitend functionele cookies: die zijn nodig om ingelogd te blijven. We volgen je niet en gebruiken geen advertentie- of statistiekcookies. Daarom zie je bij ons geen cookiemelding.</p>\n\n<h2>9. Je rechten</h2>\n<p>Je mag je gegevens inzien, corrigeren, meenemen of laten verwijderen, en je toestemming voor mailings altijd intrekken. Heb je een account, dan doe je dat zelf onder <em>Profiel</em>: je downloadt daar je gegevens als bestand en kunt verwijdering aanvragen. Liever per e-mail? Stuur een bericht naar info@yogacompanie.nl.</p>\n<p>Ben je het oneens met hoe wij met je gegevens omgaan, dan kun je een klacht indienen bij de Autoriteit Persoonsgegevens.</p>\n\n<h2>10. Wijzigingen</h2>\n<p>Verandert deze verklaring, dan passen we de datum bovenaan aan. Bij ingrijpende wijzigingen laten we het je weten.</p>\n"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('privacyverklaring', 'concept_waarschuwing', 'text', '{"text":"Deze tekst is een concept en moet nog juridisch worden getoetst."}'::jsonb)
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
values ('algemene-voorwaarden', 'inhoud', 'richtext', '{"html":"\n<h2>1. Waar deze voorwaarden over gaan</h2>\n<p>Deze voorwaarden gelden voor alle opleidingen, trainingen, lessen en digitale content van YogaCompany.</p>\n\n<h2>2. Inschrijven</h2>\n<p>Je schrijft je in via de website. De inschrijving is definitief zodra we je betaling hebben ontvangen en je van ons een bevestiging per e-mail hebt gekregen. Plaatsing gebeurt op volgorde van betaling; onze groepen zijn klein, dus vol is vol.</p>\n\n<h2>3. Prijzen en betalen</h2>\n<p>Alle genoemde prijzen zijn in euro''s. Betalen kan met iDEAL of creditcard. Betalen in termijnen is in overleg mogelijk — neem daarvoor contact met ons op vóór je inschrijving.</p>\n\n<h2>4. Bedenktijd</h2>\n<p>Schrijf je je als consument online in, dan heb je veertien dagen bedenktijd waarin je zonder opgaaf van reden kunt annuleren. Begint de opleiding binnen die veertien dagen en heb je gevraagd om eerder te starten, dan vervalt de bedenktijd zodra je toegang hebt gekregen tot het lesmateriaal.</p>\n\n<h2>5. Annuleren</h2>\n<ul>\n<li>Meer dan 30 dagen voor aanvang: je krijgt het volledige bedrag terug, minus € 50 administratiekosten.</li>\n<li>Tussen 30 en 14 dagen voor aanvang: je krijgt de helft terug.</li>\n<li>Binnen 14 dagen voor aanvang: geen restitutie. In overleg kun je je plek overdragen aan iemand anders, of doorschuiven naar een volgende groep.</li>\n</ul>\n<p>Word je ziek of overkomt je iets waardoor deelname echt niet gaat, neem dan contact met ons op. We zoeken dan samen naar een oplossing.</p>\n\n<h2>6. Annulering door ons</h2>\n<p>Gaat een opleiding niet door door te weinig aanmeldingen of overmacht, dan krijg je het volledige bedrag terug. Moeten we een lesdag verplaatsen, dan plannen we een vervangende datum.</p>\n\n<h2>7. Digitale content</h2>\n<p>Video''s, documenten en teksten in je eigen omgeving zijn persoonlijk. Je mag ze bekijken en gebruiken voor je eigen leerproces, maar niet delen, doorverkopen of openbaar maken. Je toegang loopt zolang de opleiding loopt en daarna nog een redelijke periode; wij laten het weten als daar iets aan verandert.</p>\n\n<h2>8. Certificaten</h2>\n<p>Je ontvangt een certificaat als je de module hebt afgerond: aanwezig bij de lesdagen en de eindopdracht voldoende afgesloten. Rond je alle vier de modules van de Yin Yoga Specialist Opleiding af, dan ontvang je het diploma.</p>\n\n<h2>9. Wat wij van je vragen</h2>\n<p>Yoga is geen medische behandeling. Heb je klachten, een blessure of ben je zwanger, laat het ons dan vóór aanvang weten en overleg zo nodig met je arts. Je blijft zelf verantwoordelijk voor wat je tijdens een les wel en niet doet — luister naar je lichaam en forceer niets.</p>\n\n<h2>10. Aansprakelijkheid</h2>\n<p>We doen ons werk zorgvuldig. Onze aansprakelijkheid is beperkt tot het bedrag dat je voor de betreffende opleiding hebt betaald, behalve bij opzet of grove nalatigheid van onze kant.</p>\n\n<h2>11. Klachten</h2>\n<p>Ben je ergens niet tevreden over, laat het ons weten via info@yogacompanie.nl. We reageren binnen veertien dagen en zoeken samen naar een oplossing.</p>\n\n<h2>12. Toepasselijk recht</h2>\n<p>Op deze voorwaarden is Nederlands recht van toepassing.</p>\n"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('algemene-voorwaarden', 'concept_waarschuwing', 'text', '{"text":"Deze tekst is een concept en moet nog juridisch worden getoetst."}'::jsonb)
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
values ('cookies', 'inhoud', 'richtext', '{"html":"\n<h2>Kort gezegd</h2>\n<p>We volgen je niet. YogaCompany gebruikt geen advertentiecookies, geen statistiekcookies en geen trackers van derden. Daarom krijg je bij ons geen cookiemelding: die is alleen verplicht voor cookies die wij niet gebruiken.</p>\n\n<h2>Welke cookies dan wel</h2>\n<p>Alleen cookies die nodig zijn om de site te laten werken:</p>\n<ul>\n<li><strong>Inlogcookies.</strong> Zodra je inlogt, onthouden we dat je ingelogd bent. Zonder deze cookie zou je bij elke pagina opnieuw moeten inloggen. Hij verdwijnt als je uitlogt.</li>\n<li><strong>Beveiligingscookies.</strong> Deze beschermen formulieren tegen misbruik.</li>\n</ul>\n<p>Voor functionele cookies is geen toestemming vereist. Je kunt ze in je browser blokkeren, maar dan kun je niet inloggen.</p>\n\n<h2>Cookies van anderen</h2>\n<p>Betaal je via Stripe, dan gebeurt dat op de omgeving van Stripe zelf, dat daar eigen cookies plaatst. Sluiten we ooit een video van YouTube of Vimeo in, dan doen we dat in de privacyvriendelijke modus.</p>\n\n<h2>Vragen</h2>\n<p>Stuur gerust een bericht naar info@yogacompanie.nl.</p>\n"}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;

insert into content_blocks (page_key, block_key, kind, value)
values ('cookies', 'concept_waarschuwing', 'text', '{"text":"Deze tekst is een concept en moet nog juridisch worden getoetst."}'::jsonb)
on conflict (page_key, block_key) do update set
  kind = excluded.kind,
  value = excluded.value;
