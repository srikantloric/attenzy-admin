import { lazy } from "react"

// project imports
import Loadable from "@/components/Lodable"
import DashboardLayout from "@/layout/Dashboard"

import FacultyPage from "@/pages/people/faculty"
import StudentsPage from "@/pages/people/students"
import StaffPage from "@/pages/people/staff"
import RFIDMappingPage from "@/pages/people/rfid-mapping"

import DeviceHealthPage from "@/pages/devices/deviceHealth"

import ManualAttendancePage from "@/pages/attendance/attendance"

import PartnersPage from "@/pages/partners/PartnersPage"
import PartnerDetailsPage from "@/pages/partners/PartnerDetailsPage"

import Organizations from "@/pages/organizations/organizationsPage"
import OrganizationDetailsPage from "@/pages/organizations/OrganizationDetailsPage"

import DevelopersPage from "@/pages/developers/DevelopersPage"
import OverviewTab from "@/pages/developers/OverviewTab"
import ApiKeysTab from "@/pages/developers/ApiKeysTab"
import WebhooksTab from "@/pages/developers/WebhooksTab"
import ApiReferenceTab from "@/pages/developers/ApiReferenceTab"
import DevicePage from "@/pages/devices"

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

        // People
        {
            path: "students",
            element: <StudentsPage />,
            handle: { breadcrumb: "Students" },
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
            element: <DeviceHealthPage />,
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

        // 404
        {
            path: "*",
            element: <h1>Page Not Found</h1>,
        },
    ],
}

export default MainRoutes
