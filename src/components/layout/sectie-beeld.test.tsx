import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SectieBeeld, type SectieFoto } from "./sectie-beeld";

const foto: SectieFoto = {
  url: "/beeld/opleidingen-zaal.jpg",
  alt: "Een zaal met matten",
  focus: "50% 50%",
  layout: "breed",
  waas: "normaal",
  maat: "normaal",
};

describe("SectieBeeld", () => {
  it("is zonder foto een gewone sectie met dezelfde inhoud", () => {
    const { container } = render(
      <SectieBeeld beeld={null} sectie="niveaus" id="niveaus">
        <h2>Drie niveaus</h2>
      </SectieBeeld>,
    );

    expect(
      screen.getByRole("heading", { name: "Drie niveaus" }),
    ).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("#niveaus")).not.toBeNull();
  });

  it("zet de tekst op de foto bij de plaatsing achtergrond, met anker", () => {
    const { container } = render(
      <SectieBeeld beeld={{ ...foto, layout: "achtergrond" }} id="niveaus">
        <h2>Drie niveaus</h2>
      </SectieBeeld>,
    );

    expect(
      screen.getByRole("img", { name: "Een zaal met matten" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Drie niveaus" }),
    ).toBeInTheDocument();
    expect(container.querySelector("#niveaus")).not.toBeNull();
  });

  it.each(["breed", "links", "rechts", "onder"] as const)(
    "toont bij plaatsing %s de foto én de tekst",
    (layout) => {
      const { container } = render(
        <SectieBeeld beeld={{ ...foto, layout }}>
          <p>Tekst van de sectie</p>
        </SectieBeeld>,
      );

      expect(
        screen.getByRole("img", { name: "Een zaal met matten" }),
      ).toBeInTheDocument();
      expect(screen.getByText("Tekst van de sectie")).toBeInTheDocument();
      // De foto staat in de opbouw altijd vóór de tekst, behalve eronder.
      const html = container.innerHTML;
      const fotoEerst =
        html.indexOf("<img") < html.indexOf("Tekst van de sectie");
      expect(fotoEerst).toBe(layout !== "onder");
    },
  );
});
