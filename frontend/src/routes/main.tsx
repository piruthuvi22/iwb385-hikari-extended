import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import Lessons from "../pages/Lessons";
import RecordStudySession from "../pages/RecordStudySession";
import Profile from "../pages/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <div>404 Not Found</div>,
  },
  {
    path: "/auth/login",
    element: <Login />,
  },
  {
    path: "/auth/signup",
    element: <Signup />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/lessons",
    element: <Lessons />,
  },
  {
    path: "/record-study-session",
    element: <RecordStudySession />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
]);
