import { lazy } from 'react';

//project-imports
import Loadable from '@/components/Lodable';
import DashboardLayout from '@/layout/Dashboard'


// pages routing
const Dashboard = Loadable(lazy(() => import('@/pages/dashboard')))

// ==============================|| MAIN ROUTES ||============================== //
const MainRoutes = {
    path: '/',
    children: [
        {
            element: <DashboardLayout />,
            children: [
                { index: true, element: <Dashboard /> },
                { path: 'dashboard', element: <Dashboard /> },
                { path: 'customers', element: <Dashboard /> },

            ]
        },
        { path: '*', element: <h1>Error</h1> }
    ]
};

export default MainRoutes;
