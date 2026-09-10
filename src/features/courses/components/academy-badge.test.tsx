import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AcademyBadge } from "./academy-badge";

describe("AcademyBadge", () => {
  it("benoemt niveau, uren en wat je krijgt voor een schermlezer", () => {
    render(<AcademyBadge niveau="foundation" />);

    expect(
      screen.getByRole("img", {
        name: "Yoga Company Academy Foundation, 50 uur, certificaat",
      }),
    ).toBeInTheDocument();
  });

  it("draagt de naam van de Academy, de letters en het diploma", () => {
    const { container } = render(<AcademyBadge niveau="professional" />);

    expect(container.textContent).toContain("YOGA COMPANY ACADEMY");
    expect(container.textContent).toContain("YAP");
    expect(container.textContent).toContain("200 UUR");
    expect(container.textContent).toContain("DIPLOMA");
  });

  it("geeft elke badge op een pagina eigen bogen voor de ringtekst", () => {
    // Met één gedeeld id zou de tweede badge de boog van de eerste pakken en
    // zijn ringtekst op de verkeerde plek zetten, of helemaal niet tonen.
    const { container } = render(
      <>
        <AcademyBadge niveau="foundation" />
        <AcademyBadge niveau="advanced" />
      </>,
    );

    const ids = [...container.querySelectorAll("defs path")].map((p) => p.id);
    expect(ids).toHaveLength(4);
    expect(new Set(ids).size).toBe(4);
    for (const id of ids) expect(id).toMatch(/^badge-[a-zA-Z0-9-]+$/);
  });
});
