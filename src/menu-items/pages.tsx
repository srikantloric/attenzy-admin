import type { NavItemType } from "@/types/menu";
import { FingerprintPattern, Notebook, SatelliteDish, User } from "lucide-react";
import { IconLayoutDashboard } from '@tabler/icons-react';
// icons
const icons = {
    dashboard: IconLayoutDashboard,
    user: User,
    device: SatelliteDish,
    report: Notebook,
    attendance: FingerprintPattern
};

const pages: NavItemType = {
    id: 'group-pages',
    title: 'Plartform',
    type: 'group',
    roles: ['PLATFORM_ADMIN', 'CHANNEL_PARTNER', 'ORGANIZATION'],
    children: [
        {
            id: 'dashboard',
            title: 'Dashboard',
            type: 'collapse',
            url: '/dashboard',
            icon: icons.dashboard,
            roles: ['PLATFORM_ADMIN', 'CHANNEL_PARTNER', 'ORGANIZATION'],
            children: [
                {
                    id: "overview",
                    title: "Overview",
                    url: "/overview",
                },
                {
                    id: "todays-summary",
                    title: "Today's Summary",
                    url: "todays-summary",
                },
                {
                    id: "alerts-errors",
                    title: "Alers & Errors",
                    url: "alerts-errors",
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
                    url: "manual-entry",
                },
            ]
        },
        {
            id: 'people',
            title: 'People',
            type: "collapse",
            url: '/dashboard',
            icon: icons.user,
            roles: ['ORGANIZATION'],
            children: [
                {
                    id: "students",
                    title: "Students",
                    url: "/students",
                    roles: ['ORGANIZATION']
                },
                {
                    id: "faculty",
                    title: "Faculty",
                    url: "/faculty",
                    roles: ['ORGANIZATION']
                },
                {
                    id: "staff",
                    title: "Staff",
                    url: "/staff",
                    roles: ['ORGANIZATION']
                },
                {
                    id: "id-rfid-mapping",
                    title: "Id/RFID Mapping",
                    url: "/rfid-mapping",
                    roles: ['ORGANIZATION']
                }
            ]
        },
        {
            id: 'devices',
            title: 'Devices',
            type: 'collapse',
            url: '/dashboard',
            icon: icons.device,
            roles: ['CHANNEL_PARTNER', 'ORGANIZATION'],
            children: [
                {
                    id: "devices",
                    title: "List Devices",
                    url: "/list-device",
                    roles: ['CHANNEL_PARTNER']
                },
                {
                    id: "device-health",
                    title: "Device Health",
                    url: "/device-health",
                    roles: ['ORGANIZATION']
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