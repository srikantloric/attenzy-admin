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
import DevicesPage from '@/pages/devices/devicesPage';
import Partners from '@/pages/partners/partners';
import Organizations from '@/pages/organizations/organizations';
import PartnerAdmin from '@/pages/partners/PartnerAdmin';
import OrganizationAdmin from "@/pages/organizations/OrganizationAdmin"

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
                { path: 'list-device', element: <DevicesPage /> },
                { path: 'device-health', element: <DeviceHealthPage /> },
                { path: 'partners', element: <Partners /> },
                { path: "/partners/:partnerId/admin", element: <PartnerAdmin /> },
                { path: 'organizations', element: <Organizations /> },
                { path: "/organizations/:organizationId/admin", element: <OrganizationAdmin /> },

            ]
        },
        { path: '*', element: <h1>Error</h1> }
    ]
};

export default MainRoutes;
