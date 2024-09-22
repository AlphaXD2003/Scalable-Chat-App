import App from "@/App";
import LoginPage from "@/pages/LoginPage";
import RegsiterPage from "@/pages/RegsiterPage";

export interface SingleRoute {
  path: string;
  element: React.ReactElement;
  children?: SingleRoute[];
}

const routes: SingleRoute[] = [
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegsiterPage />,
  },
];

export { routes };
