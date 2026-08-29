-- =============================================================================
-- Een fotoreeks op de docentpagina
--
-- De bestaande blokken nemen elk één foto: het portret in de kop, het beeld
-- naast "over mij", en het losse fotoblok over de volle breedte. Wie wil laten
-- zien hoe het er bij hem uitziet, heeft daar te weinig aan.
--
-- De lijst met toegestane types staat als check-constraint op de tabel en niet
-- als enum: zo is een type erbij zetten één regel, en blijft het tegelijk
-- onmogelijk om een blok op te slaan dat de pagina niet kan tekenen. Postgres
-- kan een constraint niet uitbreiden, dus hij gaat eraf en komt terug met de
-- volledige lijst.
-- =============================================================================

alter table docent_blokken drop constraint docent_blokken_type;

alter table docent_blokken add constraint docent_blokken_type check (
  type in (
    'kop_portret', 'over_mij', 'tekst', 'beeld', 'fotoreeks', 'citaat',
    'video', 'vraag_antwoord', 'contact', 'mijn_lessen', 'wat_het_kost'
  )
);
