import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routes } from "@/routes/mainRoutes.tsx";
import UserContextProvider from "./context/UserContext.tsx";
import SocketProvider from "./context/SocketContext.tsx";
const router = createBrowserRouter(routes);
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <UserContextProvider>
        <RouterProvider router={router} />
      </UserContextProvider>
    </ThemeProvider>
  </StrictMode>
);
