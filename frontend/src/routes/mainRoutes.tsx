import App from "@/App";
import Protected from "@/components/Protected";
import NotFound from "@/pages/404";
import LoginPage from "@/pages/LoginPage";
import RegsiterPage from "@/pages/RegsiterPage";
import Test from "@/pages/Test";

export interface SingleRoute {
  path: string;
  element: React.ReactElement;
  children?: SingleRoute[];
}

const routes: SingleRoute[] = [
  {
    path: "*",
    element: <NotFound />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegsiterPage />,
  },
  {
    path: "/",
    element: <Protected />,
    children: [
      {
        path: "",
        element: <App />,
      },
      {
        path: "test",
        element: <Test />,
      },
    ],
  },
];

export { routes };
