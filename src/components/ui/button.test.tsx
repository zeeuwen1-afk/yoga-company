import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./button";

describe("Button", () => {
  it("toont het label en is standaard de primaire variant", () => {
    render(<Button>Inschrijven</Button>);

    const button = screen.getByRole("button", { name: "Inschrijven" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-primary");
  });

  it("houdt een tap-target van minimaal 44px aan", () => {
    render(<Button>Verder</Button>);

    // h-11 = 2.75rem = 44px (BOUWPROMPT §11/§18)
    expect(screen.getByRole("button")).toHaveClass("h-11");
  });

  it("is niet klikbaar wanneer uitgeschakeld", () => {
    render(<Button disabled>Verder</Button>);

    expect(screen.getByRole("button")).toBeDisabled();
  });
});
