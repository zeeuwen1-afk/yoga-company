"use client";

import { useEffect } from "react";

/**
 * Klikken in de voorvertoning brengt je naar het juiste veld.
 *
 * Op de startpagina staan negenendertig blokken. Zoeken welk veld die ene kop
 * ook alweer was, is precies het werk dat een scherm van je hoort over te
 * nemen. Je ziet het staan, dus je wijst het aan.
 *
 * Dit component draait alleen in de voorvertoning, en alleen als die in het
 * bewerkscherm hangt. Staat de pagina los in een tabblad, dan gebeurt er niets:
 * dan is er ook niemand om het bericht aan te sturen.
 *
 * De secties dragen hun naam als `data-sectie`. Bij een klik zoeken we de
 * dichtstbijzijnde sectie omhoog in de opbouw van de pagina, en sturen die naam
 * naar het venster eromheen. Het bewerkscherm klapt hem open en scrollt ernaartoe.
 *
 * Links en knoppen worden bewust onderschept: in de voorvertoning wil je niet
 * wegnavigeren, je wilt bewerken wat je aanwijst.
 */
export function Aanwijzen() {
  useEffect(() => {
    // Los tabblad: geen bewerkscherm om iets aan te sturen.
    if (window.parent === window) return;

    const stijl = document.createElement("style");
    stijl.textContent = `
      [data-sectie] { cursor: pointer; }
      [data-sectie]:hover { outline: 2px solid #ea976e; outline-offset: -2px; }
    `;
    document.head.appendChild(stijl);

    function klik(gebeurtenis: MouseEvent) {
      const doel = gebeurtenis.target;
      if (!(doel instanceof Element)) return;

      const sectie = doel.closest<HTMLElement>("[data-sectie]");
      if (!sectie?.dataset.sectie) return;

      // Niet wegnavigeren: in de voorvertoning is een klik een aanwijzing.
      gebeurtenis.preventDefault();
      gebeurtenis.stopPropagation();

      window.parent.postMessage(
        { type: "yc-blok-aangewezen", sectie: sectie.dataset.sectie },
        window.location.origin,
      );
    }

    document.addEventListener("click", klik, true);
    return () => {
      document.removeEventListener("click", klik, true);
      stijl.remove();
    };
  }, []);

  return null;
}
