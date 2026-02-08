import { createBrowserRouter } from "react-router";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Blog from "./pages/Blog";
import Dashboard from "./pages/Dashboard";
import AdminLayout from "./layouts/AdminLayout";
import AddPost from "./pages/Admin/AddPost";
import AllPost from "./pages/Admin/AllPost";
import Settings from "./pages/Admin/Settings";
import Profile from "./pages/Admin/Profile";
import Messages from "./pages/Admin/Messages";
import Comments from "./pages/Admin/Comments";
import SinglePost from "./pages/SinglePost";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: "/blog",
        element: <Blog />
      },
      {
        path: "/about",
        element: <About />
      },
      {
        path: "/contact",
        element: <Contact />
      },
      {
        path: "/login",
        element: <Login />
      },
      {
        path: "/post/:id",
        element: <SinglePost />
      }
    ]
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        path: "/admin/dashboard",
        element: <Dashboard />
      },
      {
        path: "/admin/add-post",
        element: <AddPost />
      },
      {
        path: "/admin/edit-post/:id",
        element: <AddPost />
      },
      {
        path: "/admin/all-post",
        element: <AllPost />
      },
      {
        path: "/admin/settings",
        element: <Settings />
      },
      {
        path: "/admin/profile",
        element: <Profile />
      },
      {
        path: "/admin/messages",
        element: <Messages />
      },
      {
        path: "/admin/comments",
        element: <Comments />
      }
    ]
  }
]);

export default router;