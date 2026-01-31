import AuthLayout from "@/layout/Auth";
import { lazy } from "react";

// project-imports
import Loadable from "@/components/Lodable";

// render - login
const AuthLogin = Loadable(lazy(() => import('@/pages/auth/login')));

const LoginRoutes = {
    path: "/",
    children: [
        {
            path: '/',
            element: <AuthLayout />,
        },
        {
            path: 'login',
            element: <AuthLogin />
        },
    ]
}

export default LoginRoutes;
