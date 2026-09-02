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
      json: async () => ({ star_count: 1000 }),
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

    expect(await screen.findByText("Stars: 1000")).toBeInTheDocument();
  });

  it("provides invalid repository and checks result", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      status: 404,
      json: async () => ({
        detail: "The repository does not exist or is private.",
      }),
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
      screen.getByText("The repository does not exist or is private."),
    ).toBeInTheDocument();
  });
});
