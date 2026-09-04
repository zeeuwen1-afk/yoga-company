import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Alineas } from "./alineas";

/**
 * Wat iemand in de site-editor intypt moet op de site hetzelfde betekenen.
 * Een lege regel is een alinea; een enkele regelovergang is dat niet.
 */

describe("Alineas", () => {
  it("maakt van elke witregel een eigen alinea", () => {
    const { container } = render(
      <Alineas tekst={"Eerste alinea.\n\nTweede alinea.\n\nDerde."} />,
    );

    const alineas = container.querySelectorAll("p");
    expect(alineas).toHaveLength(3);
    expect(alineas[0]).toHaveTextContent("Eerste alinea.");
    expect(alineas[2]).toHaveTextContent("Derde.");
  });

  it("telt meerdere lege regels als één alineagrens", () => {
    // Wie drie keer op enter drukt bedoelt geen twee lege alinea's.
    const { container } = render(
      <Alineas tekst={"Boven.\n\n\n\n   \n\nOnder."} />,
    );

    expect(container.querySelectorAll("p")).toHaveLength(2);
  });

  it("houdt een enkele regelovergang binnen dezelfde alinea", () => {
    // Een opsomming of een adres mag niet uit elkaar vallen.
    const { container } = render(
      <Alineas tekst={"Kleine groepen\nCertificaat per module"} />,
    );

    expect(container.querySelectorAll("p")).toHaveLength(1);
  });

  it("toont niets bij een lege tekst", () => {
    // Zonder deze regel zou er een lege alinea ontstaan die ruimte inneemt op
    // een plek waar bewust niets is ingevuld.
    const { container } = render(<Alineas tekst={"   \n\n  "} />);

    expect(container.querySelectorAll("p")).toHaveLength(0);
  });

  it("toont gewone tekst zonder witregels als één alinea", () => {
    render(<Alineas tekst="Yoga is training voor het echte leven." />);

    expect(
      screen.getByText("Yoga is training voor het echte leven."),
    ).toBeInTheDocument();
  });
});
