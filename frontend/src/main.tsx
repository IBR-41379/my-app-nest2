import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.tsx";
import AnnouncementsList from "./modules/announcements/AnnouncementsList.tsx";
import AnnouncementDetail from "./modules/announcements/AnnouncementDetail.tsx";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <AnnouncementsList /> },
      { path: "announcements/:id", element: <AnnouncementDetail /> }
    ]
  }
]);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
