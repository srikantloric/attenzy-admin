import { lazy } from 'react';

//project-imports
import Loadable from '@/components/Lodable';
import DashboardLayout from '@/layout/Dashboard'


// pages routing
const Dashboard = Loadable(lazy(() => import('@/pages/dashboard')))
const Attendance = Loadable(lazy(() => import('@/pages/attendance')))

// ==============================|| MAIN ROUTES ||============================== //
const MainRoutes = {
    path: '/',
    children: [
        {
            element: <DashboardLayout />,
            children: [
                { index: true, element: <Dashboard /> },
                { path: 'dashboard', element: <Dashboard /> },
                { path: 'attendance', element: <Attendance /> },

            ]
        },
        { path: '*', element: <h1>Error</h1> }
    ]
};

export default MainRoutes;
