import type { NavItemType } from "@/types/menu";
import { CircleDollarSign, CodeXml, Settings, Webhook } from "lucide-react";

// icons
const icons = {
    billing: CircleDollarSign,
    webhook: Webhook,
    settings: Settings,
    code: CodeXml
};

const settings: NavItemType = {
    id: 'group-other',
    title: 'Other',
    type: 'group',
    roles: ["CHANNEL_PARTNER", "ORGANIZATION", "PLATFORM_ADMIN"],
    children: [
        {
            id: 'developers',
            title: 'Developers',
            type: 'item',
            url: '/developers',
            icon: icons.code,
            roles: ["CHANNEL_PARTNER", "PLATFORM_ADMIN"],
        },
        {
            id: 'settings',
            title: 'Settings',
            type: 'item',
            url: '/settings',
            icon: icons.settings,
        },
    ],


}
export default settings;