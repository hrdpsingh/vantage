import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Dashboard } from "./Dashboard";

describe("Dashboard", () => {
  it("renders input fields and submit button on initial load", () => {
    render(<Dashboard />);

    expect(screen.getByPlaceholderText(/owner/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/repository/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /fetch/i })).toBeInTheDocument();
  });

  it("provides valid username and repository and checks result", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ stargazers_count: 1000 }),
    } as Response);

    render(<Dashboard />);

    const username = screen.getByPlaceholderText(/owner/i);
    const repository = screen.getByPlaceholderText(/repository/i);
    const button = screen.getByRole("button", { name: /fetch/i });

    await userEvent.type(username, "hrdpsingh");
    await userEvent.type(repository, "insight");
    await userEvent.click(button);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/repository/hrdpsingh/insight/stars",
    );

    expect(await screen.findByText(/Stars: 1000/)).toBeInTheDocument();
  });

  it("provides invalid username and repository and checks result", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      status: 404,
      json: async () => ({ status_code: 404, detail: "Repository not found" }),
    } as Response);

    render(<Dashboard />);

    const username = screen.getByPlaceholderText(/owner/i);
    const repository = screen.getByPlaceholderText(/repository/i);
    const button = screen.getByRole("button", { name: /fetch/i });

    await userEvent.type(username, "hrdpsingh");
    await userEvent.type(repository, "react");
    await userEvent.click(button);

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/repository/hrdpsingh/react/stars",
    );

    expect(
      await screen.findByText(/Repository not found./),
    ).toBeInTheDocument();
  });
});
