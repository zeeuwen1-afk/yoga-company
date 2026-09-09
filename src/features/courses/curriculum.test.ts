import { describe, expect, it } from "vitest";

import { AANBOD } from "@/content/aanbod";

import {
  leesOnderdelen,
  naarCurriculum,
  naarInvoer,
  schrijfOnderdelen,
} from "./curriculum";

describe("de inhoud van een module lezen", () => {
  it("maakt van een kopje met streepjes eronder een blok", () => {
    expect(
      leesOnderdelen("Fundamenten\n- Yin en yang\n- Waar het vandaan komt"),
    ).toEqual([
      {
        titel: "Fundamenten",
        onderdelen: ["Yin en yang", "Waar het vandaan komt"],
      },
    ]);
  });

  it("begint bij elk kopje een nieuw blok", () => {
    const blokken = leesOnderdelen("Een\n- a\n\nTwee\n- b\n- c");
    expect(blokken.map((blok) => blok.titel)).toEqual(["Een", "Twee"]);
    expect(blokken[1]?.onderdelen).toEqual(["b", "c"]);
  });

  it("laat een opsomming zonder kopje niet verdwijnen", () => {
    // Anders zou de eerste regel die iemand typt stilzwijgend wegvallen.
    expect(leesOnderdelen("- los onderdeel")).toEqual([
      { titel: "", onderdelen: ["los onderdeel"] },
    ]);
  });

  it("accepteert de streepjes die mensen echt gebruiken", () => {
    const blokken = leesOnderdelen("Kop\n– en\n• dash\n* ster");
    expect(blokken[0]?.onderdelen).toEqual(["en", "dash", "ster"]);
  });

  it("negeert lege regels en losse streepjes", () => {
    expect(leesOnderdelen("\n\nKop\n-\n   \n- iets")).toEqual([
      { titel: "Kop", onderdelen: ["iets"] },
    ]);
  });
});

describe("heen en weer tussen scherm en database", () => {
  /**
   * Het echte curriculum van de opleidingen is de zwaarste toets die er is:
   * vier modules, tientallen blokken, teksten met leestekens erin. Loopt dat
   * ergens vast, dan verliest de beheerder inhoud op het moment dat hij één
   * kopje aanpast — en dat merkt hij pas als de pagina al online staat.
   */
  const metCurriculum = AANBOD.filter(
    (cursus) => (cursus.curriculum?.length ?? 0) > 0,
  );

  it("vindt er genoeg om iets te toetsen", () => {
    expect(metCurriculum.length).toBeGreaterThan(0);
  });

  it.each(metCurriculum.map((cursus) => cursus.slug))(
    "%s komt ongeschonden terug",
    (slug) => {
      const cursus = AANBOD.find((kandidaat) => kandidaat.slug === slug)!;
      const heen = cursus.curriculum!.map(naarInvoer);
      const terug = naarCurriculum(heen);

      // Zonder het nummer, want dat komt bewust uit de volgorde. Drie
      // opleidingen bestaan uit één module die zijn nummer uit de grote
      // opleiding heeft meegenomen — "niveau 4" is daar module 4 van een
      // curriculum dat op die pagina niet staat. Wie daar op opslaan drukt
      // maakt er module 1 van, en dat is ook wat het is; bij één module toont
      // de pagina het nummer niet.
      const zonderNummer = (modules: typeof terug) =>
        modules.map(({ nummer: _nummer, ...rest }) => rest);

      expect(zonderNummer(terug)).toEqual(zonderNummer(cursus.curriculum!));
      expect(terug.map((module) => module.nummer)).toEqual(
        terug.map((_, index) => index + 1),
      );
    },
  );

  it("schrijft blokken zo op dat lezen ze weer oplevert", () => {
    const blokken = [
      { titel: "Kop", onderdelen: ["een", "twee"] },
      { titel: "Andere kop", onderdelen: [] },
    ];
    expect(leesOnderdelen(schrijfOnderdelen(blokken))).toEqual(blokken);
  });
});

describe("de modules omzetten naar wat de pagina toont", () => {
  it("nummert op volgorde, ook na verplaatsen", () => {
    const curriculum = naarCurriculum([
      { titel: "Tweede", uren: "50", samenvatting: "", onderdelen: "" },
      { titel: "Eerste", uren: "25", samenvatting: "", onderdelen: "" },
    ]);
    expect(curriculum.map((module) => [module.nummer, module.titel])).toEqual([
      [1, "Tweede"],
      [2, "Eerste"],
    ]);
  });

  it("laat een module zonder titel weg", () => {
    // Dat is hoe je er een weghaalt, en het voorkomt een naamloos kopje op de
    // site na een per ongeluk toegevoegde lege module.
    expect(
      naarCurriculum([
        { titel: "  ", uren: "10", samenvatting: "iets", onderdelen: "- a" },
      ]),
    ).toEqual([]);
  });

  it("leest een leeg urenveld als nul en niet als NaN", () => {
    // `NaN` in jsonb wordt `null`, en dan telt de omvang in de kolom Praktisch
    // niet meer op.
    const curriculum = naarCurriculum([
      { titel: "Module", uren: "", samenvatting: "", onderdelen: "" },
    ]);
    expect(curriculum[0]?.uren).toBe(0);
  });
});
