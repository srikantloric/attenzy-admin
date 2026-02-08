import type { NavItemType } from "@/types/menu";
import { FingerprintPattern, Hotel, Notebook, SatelliteDish, User, Users } from "lucide-react";
import { IconLayoutDashboard } from '@tabler/icons-react';
// icons
const icons = {
    dashboard: IconLayoutDashboard,
    user: User,
    device: SatelliteDish,
    report: Notebook,
    attendance: FingerprintPattern,
    orgnization: Hotel,
    partners: Users
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
            roles: ["ORGANIZATION"],
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
            roles: ['CHANNEL_PARTNER', 'ORGANIZATION', "PLATFORM_ADMIN"],
            children: [
                {
                    id: "devices",
                    title: "List Devices",
                    url: "/list-device",
                    roles: ['CHANNEL_PARTNER', "ORGANIZATION", "PLATFORM_ADMIN"]
                },
                {
                    id: "device-health",
                    title: "Device Health",
                    url: "/device-health",
                    roles: ['ORGANIZATION',"CHANNEL_PARTNER"]
                },
            ]
        },
        {
            id: 'organizations',
            title: 'Organizations',
            type: 'item',
            url: '/organizations',
            icon: icons.orgnization,
            roles: ["CHANNEL_PARTNER", "PLATFORM_ADMIN"]
        },
        {
            id: 'partners',
            title: 'Partners',
            type: 'item',
            url: '/partners',
            icon: icons.partners,
            roles: ["PLATFORM_ADMIN"]
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