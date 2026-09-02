import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  rbac: {
    canManageUsers: vi.fn(() => true),
    isAdmin: vi.fn(() => true),
    hasPermission: vi.fn(() => true),
  },
}));

vi.mock("../../contexts/RBACContext", () => ({ useRBAC: () => state.rbac }));
vi.mock("../../contexts/FullscreenContext", () => ({
  useFullscreen: () => ({ isFullscreen: false, exitFullscreen: vi.fn() }),
}));

import AdminLayout from "./AdminLayout";

const renderLayout = () =>
  render(
    <MemoryRouter initialEntries={["/admin"]}>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<h2>Dashboard content</h2>} />
          <Route path="training" element={<h2>Training content</h2>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe("AdminLayout mobile navigation", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("requestAnimationFrame", (callback) => {
      callback();
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  it("opens as a modal drawer, closes with Escape, and restores focus", async () => {
    renderLayout();
    const openButton = screen.getByRole("button", {
      name: "Open admin navigation",
    });

    fireEvent.click(openButton);
    expect(openButton).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("dialog", { name: "Admin navigation" }),
    ).toHaveAttribute("aria-modal", "true");

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(openButton).toHaveFocus();
    expect(document.body.style.overflow).toBe("");
  });

  it("closes after navigation and renders the selected workspace", async () => {
    renderLayout();
    fireEvent.click(
      screen.getByRole("button", { name: "Open admin navigation" }),
    );
    fireEvent.click(screen.getByRole("link", { name: "Training" }));

    expect(
      await screen.findByRole("heading", { name: "Training content" }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });
});
