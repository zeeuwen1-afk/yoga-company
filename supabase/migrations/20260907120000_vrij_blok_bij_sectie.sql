-- Een vrij blok kan voortaan onder een bepaalde sectie hangen in plaats van
-- alleen onderaan de pagina.
--
-- Leeg betekent "onderaan", precies zoals het tot nu toe was. Elk bestaand blok
-- houdt daarmee zijn plek zonder dat er iets gemigreerd hoeft te worden.
--
-- Geen verwijzing naar een tabel: de secties staan in code, niet in de
-- database. Verdwijnt een sectie ooit, dan valt een blok dat eraan hing terug
-- naar onderaan de pagina in plaats van onvindbaar te worden.
alter table pagina_blokken add column sectie text;

comment on column pagina_blokken.sectie is
  'Onder welke sectie dit blok staat; leeg is onderaan de pagina. De namen komen uit groepeerInSecties() in de code.';

-- De volgorde geldt binnen een sectie, dus de index moet dat weerspiegelen.
drop index if exists pagina_blokken_pagina_idx;
create index pagina_blokken_pagina_idx
  on pagina_blokken (page_key, sectie, volgorde);
