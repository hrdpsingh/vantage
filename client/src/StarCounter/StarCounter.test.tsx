import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StarCounter } from "./StarCounter";

describe("StarCounter", () => {
  it("renders inputs and submit button on initial load", () => {
    render(<StarCounter />);

    expect(screen.getByPlaceholderText(/owner/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/repository/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /fetch/i })).toBeInTheDocument();
  });
});
