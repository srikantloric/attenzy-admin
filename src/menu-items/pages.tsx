import type { NavItemType } from "@/types/menu";
import { FingerprintPattern, Gauge, Notebook, SatelliteDish, User } from "lucide-react";

// icons
const icons = {
    dashboard: Gauge,
    user: User,
    device: SatelliteDish,
    report: Notebook,
    attendance: FingerprintPattern
};

const pages: NavItemType = {
    id: 'group-pages',
    title: 'Plartform',
    type: 'group',
    children: [
        {
            id: 'dashboard',
            title: 'Dashboard',
            type: 'collapse',
            url: '/dashboard',
            icon: icons.dashboard,
            children: [
                {
                    id: "overview",
                    title: "Overview",
                    url: "#",
                },
                {
                    id: "todays-summary",
                    title: "Today's Summary",
                    url: "#",
                },
                {
                    id: "alerts-errors",
                    title: "Alers & Errors",
                    url: "#",
                },
            ]
        },
        {
            id: 'attendance',
            title: 'Attendance',
            type: 'collapse',
            url: '/dashboard',
            icon: icons.attendance,
            children: [
                {
                    id: "manual-entry",
                    title: "Manual Entry",
                    url: "#",
                },
            ]
        },
        {
            id: 'people',
            title: 'People',
            type: "collapse",
            url: '/dashboard',
            icon: icons.user,
            children: [
                {
                    id: "students",
                    title: "Students",
                    url: "#",
                },
                {
                    id: "faculty",
                    title: "Faculty",
                    url: "#",
                },
                {
                    id: "staff",
                    title: "Staff",
                    url: "#",
                },
                {
                    id: "id-rfid-mapping",
                    title: "Id/RFID Mapping",
                    url: "#",
                }
            ]
        },
        {
            id: 'devices',
            title: 'Devices',
            type: 'collapse',
            url: '/dashboard',
            icon: icons.device,
            children: [
                {
                    id: "devices",
                    title: "Devices List",
                    url: "#",
                },
                {
                    id: "device-health",
                    title: "Device Health",
                    url: "#",
                },
            ]
        },
        {
            id: 'reports',
            title: 'Reports',
            type: 'item',
            url: '/dashboard',
            icon: icons.report,
        },


    ],


}
export default pages;