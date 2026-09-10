-- Het certificaatniveau van een cursus: welke badge van de Yoga Company Academy
-- erbij hoort. Foundation is één module van 50 uur, Advanced twee modules samen
-- (Blok A, Blok B of twee losse modules tegelijk), Professional een volledige
-- opleiding van 200 uur. Leeg betekent: geen badge, zoals bij de trainingen.
--
-- Bewust een eigen kolom en geen berekening uit het curriculum: vijf
-- opleidingen hebben geen curriculum met uren, en een badge is een belofte die
-- iemand met de hand hoort te zetten.
alter table courses
  add column certificate_level text
    constraint courses_certificate_level_bekend
    check (certificate_level in ('foundation', 'advanced', 'professional'));

-- De tien bestaande opleidingen, volgens de indeling van de Academy. Op een
-- lege database raakt dit niets; de seed vult het niveau dan zelf in.
update courses set certificate_level = 'foundation'
 where slug in (
   'yogaopleiding-module-1-hatha-vinyasa',
   'yogaopleiding-module-2-anatomie-filosofie-meditatie',
   'yin-niveau-1-basis',
   'yin-niveau-2-zenuwstelsel-meridiaanleer',
   'yin-niveau-3-chinese-geneeskunde',
   'yin-niveau-4-herstel-revalidatie'
 );

update courses set certificate_level = 'advanced'
 where slug in ('yogaopleiding-blok-a', 'yogaopleiding-blok-b');

update courses set certificate_level = 'professional'
 where slug in ('200-uurs-yogaopleiding', '200-uurs-yin-yoga-specialist');
