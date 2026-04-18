import { lazy } from "react";

// project imports
import Loadable from "@/components/Lodable";
import DashboardLayout from "@/layout/Dashboard";

import FacultyPage from "@/pages/people/faculty";
import StudentsPage from "@/pages/people/students";
import StaffPage from "@/pages/people/staff";
import RFIDMappingPage from "@/pages/people/rfid-mapping";

import ManualAttendancePage from "@/pages/attendance/manualAttendance";

import PartnersPage from "@/pages/partners/PartnersPage";
import PartnerDetailsPage from "@/components/partners/PartnerDetailsPage";


import DevelopersPage from "@/pages/developers/DevelopersPage";
import OverviewTab from "@/pages/developers/OverviewTab";
import ApiKeysTab from "@/pages/developers/ApiKeysTab";
import WebhooksTab from "@/pages/developers/WebhooksTab";
import ApiReferenceTab from "@/pages/developers/ApiReferenceTab";
import DevicePage from "@/pages/devices";
import DeviceHealth from "@/pages/devices/health";
import ReportPage from "@/pages/reports/ReportPage";
import SettingsPage from "@/pages/settings/SettingsPage";
import AcademicSetupTab from "@/pages/settings/AcademicSetupTab";

import StudentsDetailsPage from "@/pages/people/students-details/UserDetailsPage";
import StudentsProfileTab from "@/pages/people/students-details/tabs/UserProfileTab";
import StudentAttendanceTab from "@/pages/people/students-details/tabs/StudentAttendanceTab";

import IotAttendance from "@/pages/attendance/iotAttendance";
import StudentAttendance from "@/pages/reports/analytics/dailyAttendance";

import ClassAttendance from "@/pages/reports/analytics/ClassAttendance";

import CalendarViewPage from "@/pages/reports/analytics/CalendarViewPage";
import FacultyAttendance from "@/pages/reports/analytics/facultyAttendance";
import StaffAttendance from "@/pages/reports/analytics/staffAttendance";
import AttendanceTrendGraph from "@/pages/reports/analytics/attendanceTrendGraph";
import OrganizationAttendance from "@/pages/reports/analytics/organizationAttendance";
import TopAbsentees from "@/pages/reports/leaderboard/topAbsentees";
import StudentLeaderboard from "@/pages/reports/leaderboard/studentLeaderboard";
import ImportExportTab from "@/pages/settings/ImportExportTab";
import CalanderWorkingDayTab from "@/pages/settings/CalanderWorkingDayTab";
import AlertsNotificationsTab from "@/pages/settings/AlertsNotificationsTab";
import AccessControlsTab from "@/pages/settings/AccessControlsTab";
import AddPeoplePage from "@/pages/people/add-people";
import OrganizationsPage from "@/pages/organizations";

// lazy pages
const Dashboard = Loadable(lazy(() => import("@/pages/dashboard")));
const Attendance = Loadable(
  lazy(() => import("@/pages/attendance/manualAttendance")),
);

const OrgDetailsPage = Loadable(
  lazy(() => import("@/pages/organizations/OrganizationDetailsPage")),
);

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
            },
          ],
        },
      ],
    },
    {
      path: "add-people",
      element: <AddPeoplePage />,
      handle: { breadcrumb: "Add People" },
    },
    {
      path: "faculty",
      handle: { breadcrumb: "Faculty" },
      children: [
        {
          index: true,
          element: <FacultyPage />,
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
          ],
        },
      ],
    },

    {
      path: "staff",
      handle: { breadcrumb: "Staff" },
      children: [
        {
          index: true,
          element: <StaffPage />,
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
          ],
        },
      ],
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
      element: <OrganizationsPage />,
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
          handle: { breadcrumb: "Daily Attendance" },
        },
        {
          path: "class-attendance-percentage",
          element: <ClassAttendance />,
          handle: { breadcrumb: "Class Attendance" },
        },
        {
          path: "faculty-attendance-percentage",
          element: <FacultyAttendance />,
          handle: { breadcrumb: "Faculty Attendance" },
        },
        {
          path: "staff-attendance-percentage",
          element: <StaffAttendance />,
          handle: { breadcrumb: "Staff Attendance" },
        },
        {
          path: "org-attendance-percentage",
          element: <OrganizationAttendance />,
          handle: { breadcrumb: "Organization Attendance" },
        },
        {
          path: "attendance-trend-graph",
          element: <AttendanceTrendGraph />,
          handle: { breadcrumb: "Attendance Trend Graph" },
        },

        {
          path: "calendar-view",
          element: <CalendarViewPage />,
          handle: { breadcrumb: "Student Attendance" },
        },

        {
          path: "top-absentees",
          element: <TopAbsentees />,
          handle: { breadcrumb: "Top Absentees" },
        },

        {
          path: "rank-students",
          element: <StudentLeaderboard />,
          handle: { breadcrumb: "Student Leaderboard" },
        },
      ],
    },

    {
      path: "organizations/:organizationId",
      element: <OrgDetailsPage />,
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
        {
          path: "calander-working-days",
          element: <CalanderWorkingDayTab />,
          handle: { breadcrumb: "Calendar & Working Days" },
        },
        {
          path: "alerts-notifications",
          element: <AlertsNotificationsTab />,
          handle: { breadcrumb: "Alerts & Notifications" },
        },
        {
          path: "access-controls",
          element: <AccessControlsTab />,
          handle: { breadcrumb: "Access Controls" },
        },
        {
          path: "import-export",
          element: <ImportExportTab />,
          handle: { breadcrumb: "Import/Export" },
        },
      ],
    },
    // 404
    {
      path: "*",
      element: <h1>Page Not Found</h1>,
    },
  ],
};

export default MainRoutes;
