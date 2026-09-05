import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Dashboard } from "./Dashboard";

describe("Dashboard", () => {
  it("renders input fields and submit button on initial load", () => {
    render(<Dashboard />);

    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Repository")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fetch" })).toBeInTheDocument();
  });

  it("provides valid username and repository and checks result", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      status: 200,
      json: async () => await import("../../Mocks/overview.valid.json"),
    } as Response);

    render(<Dashboard />);

    const usernameField = screen.getByPlaceholderText("Username");
    const repositoryField = screen.getByPlaceholderText("Repository");
    const fetchButton = screen.getByRole("button", { name: "Fetch" });

    await userEvent.type(usernameField, "microsoft");
    await userEvent.type(repositoryField, "vscode");
    await userEvent.click(fetchButton);

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/repository/microsoft/vscode/overview",
    );

    expect(await screen.findByText(/Stars: \d+/)).toBeInTheDocument();
    expect(
      await screen.findByText(/Last Updated: \d{4}.\d{2}.\d{2}/),
    ).toBeInTheDocument();
    expect(await screen.findByText(/Forks: \d+/)).toBeInTheDocument();
    expect(await screen.findByText(/Issues: \d+/)).toBeInTheDocument();
  });

  it("provides invalid repository and checks result", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      status: 404,
      json: async () => await import("../../Mocks/overview.invalid.json"),
    } as Response);

    render(<Dashboard />);

    const username = "microsoft";
    const repository = "angular";

    const usernameField = screen.getByPlaceholderText("Username");
    const repositoryField = screen.getByPlaceholderText("Repository");
    const fetchButton = screen.getByRole("button", { name: "Fetch" });

    await userEvent.type(usernameField, username);
    await userEvent.type(repositoryField, repository);
    await userEvent.click(fetchButton);

    expect(fetchSpy).toHaveBeenCalledWith(
      `http://127.0.0.1:8000/repository/${username}/${repository}/overview`,
    );

    expect(
      await screen.findByText("The repository does not exist or is private."),
    ).toBeInTheDocument();
  });
});
