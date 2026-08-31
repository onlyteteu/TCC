import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WorkspaceSidebar } from "./workspace-sidebar";

describe("WorkspaceSidebar", () => {
  it("shows only the three destinations that already work", () => {
    render(<WorkspaceSidebar activeSection="home" startupId={7} />);

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/painel/startup/7"
    );
    expect(screen.getByRole("link", { name: "Jornada" })).toHaveAttribute(
      "href",
      "/painel/startup/7/jornada"
    );
    expect(screen.getByRole("link", { name: "Missões" })).toHaveAttribute(
      "href",
      "/painel/startup/7/missoes"
    );
    expect(screen.getAllByRole("link")).toHaveLength(3);
    expect(screen.queryByText("Experimentos")).not.toBeInTheDocument();
    expect(screen.queryByText("Conquistas")).not.toBeInTheDocument();
  });

  it("disables startup navigation when no startup exists", () => {
    render(<WorkspaceSidebar activeSection="home" startupId={null} />);

    expect(screen.queryByRole("link", { name: "Home" })).not.toBeInTheDocument();
    expect(screen.getByText("Home").closest("span")).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    expect(screen.getAllByText("Crie uma startup para acessar")).toHaveLength(3);
    expect(screen.queryByText("Em breve")).not.toBeInTheDocument();
  });
});
