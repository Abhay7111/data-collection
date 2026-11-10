import { createBrowserRouter } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import UploadData from "./features/data/pages/UploadData";
import Dashboard from "./features/data/pages/Dashboard";
import AdminPanel from "./features/data/pages/AdminPanel";

export const router = createBrowserRouter([
    { path: '/', element: <UploadData /> },
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },
    { path: '/dashboard', element: <Dashboard /> },
    { path: '/admin', element: <AdminPanel /> },
])