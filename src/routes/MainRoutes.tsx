import { lazy } from 'react';

//project-imports
import Loadable from '@/components/Lodable';
import DashboardLayout from '@/layout/Dashboard'
import FacultyPage from '@/pages/people/faculty';
import StudentsPage from '@/pages/people/students';
import StaffPage from '@/pages/people/staff';
import RFIDMappingPage from '@/pages/people/rfid-mapping';
import AddDevicePage from '@/pages/devices/addDevice';
import DeviceHealthPage from '@/pages/devices/deviceHealth';
import ManualAttendancePage from '@/pages/attendance';


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
                { path: 'overview', element: <Dashboard /> },
                { path: 'attendance', element: <Attendance /> },
                { path: 'manual-entry', element: <ManualAttendancePage /> },
                { path: 'students', element: <StudentsPage /> },
                { path: 'faculty', element: <FacultyPage /> },
                { path: 'staff', element: <StaffPage /> },
                { path: 'rfid-mapping', element: <RFIDMappingPage /> },
                { path: 'add-device', element: <AddDevicePage /> },
                { path: 'device-health', element: <DeviceHealthPage /> },

            ]
        },
        { path: '*', element: <h1>Error</h1> }
    ]
};

export default MainRoutes;
