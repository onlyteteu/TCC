import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WorkspaceBrand } from "./workspace-brand";

describe("WorkspaceBrand", () => {
  it("renders the fixed two-line name beside the symbol", () => {
    render(<WorkspaceBrand href="/painel/startup/1" />);

    const link = screen.getByRole("link", { name: "Startup Quest" });
    expect(link).toHaveTextContent("Startup");
    expect(link).toHaveTextContent("Quest");
    expect(link.querySelectorAll("span[data-brand-line]")).toHaveLength(2);
  });
});
