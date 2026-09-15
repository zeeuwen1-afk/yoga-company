-- =============================================================================
-- Wanneer een cursus plaatsvindt
--
-- De cursustabel had wel een locatie en een studiebelasting, maar geen datum.
-- De enige datumregel op een cursuspagina kwam uit een tekstblok dat álle
-- cursuspagina's delen ("Neem contact op voor de eerstvolgende startdatum"),
-- dus een datum invullen voor één workshop zette diezelfde datum onder elke
-- opleiding.
--
-- Bewust tekst en geen date-kolom. Wat hier staat is "zondag 25 oktober,
-- 10:00-17:00" of "vier zondagen vanaf 12 januari": een reeks, een dagdeel, een
-- voorbehoud. Een echte datumkolom zou dat platslaan tot één dag en alsnog een
-- tweede veld vragen voor de tijden. Komt er ooit een rooster dat op datums
-- rekent — afgelopen cursussen verbergen, sorteren op eerstvolgende — dan hoort
-- dat in een eigen tabel met een rij per lesdag, niet half in deze kolom.
-- =============================================================================

alter table courses add column if not exists dates_text text;

comment on column courses.dates_text is
  'Wanneer de cursus plaatsvindt, als vrije tekst. Leeg = de pagina toont de algemene regel uit de gedeelde cursusteksten.';
