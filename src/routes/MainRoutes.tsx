import { lazy } from 'react';

//project-imports
import Loadable from '@/components/Lodable';
import DashboardLayout from '@/layout/Dashboard'
import FacultyPage from '@/pages/people/faculty';
import StudentsPage from '@/pages/people/students';
import StaffPage from '@/pages/people/staff';
import RFIDMappingPage from '@/pages/people/rfid-mapping';
import DeviceHealthPage from '@/pages/devices/deviceHealth';
import ManualAttendancePage from '@/pages/attendance/attendance';
import DevicePageNew from '@/pages/devices/devicePage';

import PartnerDetailsPage from '@/pages/partners/PartnerDetailsPage';
import PartnersPage from '@/pages/partners/PartnersPage';

import Organizations from '@/pages/organizations/organizationsPage';
import OrganizationDetailsPage from '@/pages/organizations/OrganizationDetailsPage';

import DevelopersPage from '@/pages/developers/DevelopersPage';

// pages routing
const Dashboard = Loadable(lazy(() => import('@/pages/dashboard')))
const Attendance = Loadable(lazy(() => import('@/pages/attendance/attendance')))

// ==============================|| MAIN ROUTES ||============================== //
const MainRoutes = {
    path: '/',
    children: [
        {
            element: <DashboardLayout />,
            children: [
                { index: true, element: <Dashboard /> },
                { path: 'dashboard', element: <Dashboard /> },
                { path: 'overview', element: <Dashboard /> },
                { path: 'attendance', element: <Attendance /> },
                { path: 'manual-entry', element: <ManualAttendancePage /> },
                { path: 'students', element: <StudentsPage /> },
                { path: 'faculty', element: <FacultyPage /> },
                { path: 'staff', element: <StaffPage /> },
                { path: 'rfid-mapping', element: <RFIDMappingPage /> },
                { path: 'list-device', element: <DevicePageNew /> },
                { path: 'device-health', element: <DeviceHealthPage /> },
                { path: 'partners', element: <PartnersPage /> },
                { path: "/partners/:partnerId", element: <PartnerDetailsPage /> },
                { path: 'organizations', element: <Organizations /> },
                { path: "/organizations/:organizationId", element: <OrganizationDetailsPage /> },
                { path: "/developers", element: <DevelopersPage /> },

            ]
        },
        { path: '*', element: <h1>Error</h1> }
    ]
};

export default MainRoutes;
