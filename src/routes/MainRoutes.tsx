import { lazy } from "react"

// project imports
import Loadable from "@/components/Lodable"
import DashboardLayout from "@/layout/Dashboard"

import FacultyPage from "@/pages/people/faculty"
import StudentsPage from "@/pages/people/students"
import StaffPage from "@/pages/people/staff"
import RFIDMappingPage from "@/pages/people/rfid-mapping"


import ManualAttendancePage from "@/pages/attendance/attendance"

import PartnersPage from "@/pages/partners/PartnersPage"
import PartnerDetailsPage from "@/components/partners/PartnerDetailsPage"

import Organizations from "@/pages/organizations/organizationsPage"
import OrganizationDetailsPage from "@/components/organizations/OrganizationDetailsPage"

import DevelopersPage from "@/pages/developers/DevelopersPage"
import OverviewTab from "@/pages/developers/OverviewTab"
import ApiKeysTab from "@/pages/developers/ApiKeysTab"
import WebhooksTab from "@/pages/developers/WebhooksTab"
import ApiReferenceTab from "@/pages/developers/ApiReferenceTab"
import DevicePage from "@/pages/devices"
import DeviceHealth from "@/pages/devices/health"
import ReportPage from "@/pages/reports/ReportPage"
import SettingsPage from "@/pages/settings/SettingsPage"
import AcademicSetupTab from "@/pages/settings/AcademicSetupTab"

import StudentsDetailsPage from "@/pages/people/students-details/StudentDetailsPage"
import StudentsProfileTab from "@/pages/people/students-details/tabs/StudentsProfileTab"
import StudentAttendanceTab from "@/pages/people/students-details/tabs/StudentAttendanceTab"

import IotAttendance from "@/pages/attendance/iotAttendance"
import StudentAttendance from "@/components/reports/StudentAttendance"
import ClassAttendance from "@/components/reports/ClassAttendance"

// lazy pages
const Dashboard = Loadable(lazy(() => import("@/pages/dashboard")))
const Attendance = Loadable(lazy(() => import("@/pages/attendance/attendance")))

// ==============================|| MAIN ROUTES ||============================== //
const MainRoutes = {
    path: "/",
    element: <DashboardLayout />,
    handle: { breadcrumb: "Dashboard" },

    children: [
        {
            index: true,
            element: <Dashboard />,
        },
        {
            path: "dashboard",
            element: <Dashboard />,
            handle: { breadcrumb: "Dashboard" },
        },
        {
            path: "overview",
            element: <Dashboard />,
            handle: { breadcrumb: "Overview" },
        },

        // Attendance
        {
            path: "attendance",
            element: <Attendance />,
            handle: { breadcrumb: "Attendance" },
        },
        {
            path: "manual-entry",
            element: <ManualAttendancePage />,
            handle: { breadcrumb: "Manual Entry" },
        },
        {
            path: "attendance-dashboard",
            element: <IotAttendance />,
            handle: { breadcrumb: "Attendance Dashboard" },
        },

        // People
        {
            path: "students",
            handle: { breadcrumb: "Students" },
            children: [
                {
                    index: true,
                    element: <StudentsPage />,
                },
                {
                    path: ":id",
                    element: <StudentsDetailsPage />,
                    handle: {
                        breadcrumb: ({ params }: any) => params.id ?? "Details",
                    },
                    children: [
                        {
                            index: true,
                            element: <StudentsProfileTab />,
                        },
                        {
                            path: "attendance",
                            element: <StudentAttendanceTab />,
                        }
                    ]
                },
            ],
        },
        {
            path: "faculty",
            element: <FacultyPage />,
            handle: { breadcrumb: "Faculty" },
        },
        {
            path: "staff",
            element: <StaffPage />,
            handle: { breadcrumb: "Staff" },
        },
        {
            path: "rfid-mapping",
            element: <RFIDMappingPage />,
            handle: { breadcrumb: "RFID Mapping" },
        },

        // Devices
        {
            path: "list-device",
            element: <DevicePage />,
            handle: { breadcrumb: "Devices" },
        },
        {
            path: "device-health",
            element: <DeviceHealth />,
            handle: { breadcrumb: "Device Health" },
        },

        // Partners
        {
            path: "partners",
            element: <PartnersPage />,
            handle: { breadcrumb: "Partners" },
        },
        {
            path: "partners/:partnerId",
            element: <PartnerDetailsPage />,
            handle: { breadcrumb: "Partner Details" },
        },

        // Organizations
        {
            path: "organizations",
            element: <Organizations />,
            handle: { breadcrumb: "Organizations" },
        },

        {
            path: "reports",
            element: <ReportPage />,
            handle: { breadcrumb: "Reports" },

            children: [
                {
                    path: "student-attendance-percentage",
                    element: <StudentAttendance />,
                    handle: { breadcrumb: "Student Attendance" },
                },
                {
                    path: "class-attendance-percentage",
                    element: <ClassAttendance />,
                    handle: { breadcrumb: "Class Attendance" },
                }
            ]
        },

        {
            path: "organizations/:organizationId",
            element: <OrganizationDetailsPage />,
            handle: { breadcrumb: "Organization Details" },
        },
        // Developers (nested tabs)
        {
            path: "developers",
            element: <DevelopersPage />,
            handle: { breadcrumb: "Developers" },

            children: [
                {
                    index: true,
                    element: <OverviewTab />,
                    handle: { breadcrumb: "Overview" },
                },
                {
                    path: "keys",
                    element: <ApiKeysTab />,
                    handle: { breadcrumb: "API Keys" },
                },
                {
                    path: "webhooks",
                    element: <WebhooksTab />,
                    handle: { breadcrumb: "Webhooks" },
                },
                {
                    path: "apis",
                    element: <ApiReferenceTab />,
                    handle: { breadcrumb: "API Reference" },
                },
            ],
        },
        {
            path: "settings",
            element: <SettingsPage />,
            handle: { breadcrumb: "Settings" },

            children: [
                {
                    index: true,
                    element: <AcademicSetupTab />,
                    handle: { breadcrumb: "academics" },
                },
            ]
        },
        // 404
        {
            path: "*",
            element: <h1>Page Not Found</h1>,
        },
    ],
}

export default MainRoutes
