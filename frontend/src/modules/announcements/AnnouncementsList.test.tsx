import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import App from "../../App";
import AnnouncementsList from "./AnnouncementsList";
import AnnouncementDetail from "./AnnouncementDetail";

function renderApp() {
  const router = createMemoryRouter(
    [
      { path: "/", element: <App />, children: [
        { index: true, element: <AnnouncementsList /> },
        { path: "announcements/:id", element: <AnnouncementDetail /> }
      ] }
    ],
    { initialEntries: ["/"] }
  );
  render(<RouterProvider router={router} />);
}

describe("AnnouncementsList", () => {
  it("renders list with aggregates", async () => {
    renderApp();
    await waitFor(() => expect(screen.getByText(/Water supply maintenance/i)).toBeInTheDocument());
    expect(screen.getByText("💬 2")).toBeInTheDocument();
    expect(screen.getByText("👍 3")).toBeInTheDocument();
    expect(screen.getByText("❤️ 5")).toBeInTheDocument();
  });
});
