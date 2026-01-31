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
    children: [
        {
            id: 'settings',
            title: 'Settings',
            type: 'item',
            url: '/dashboard',
            icon: icons.settings,
        },
        {
            id: 'developers',
            title: 'Developers',
            type: 'collapse',
            url: '/developers',
            icon: icons.code,
            children: [
                {
                    id: 'overview',
                    title: 'Overview',
                    type: 'item',
                    url: '/overview',
                },
                {
                    id: 'api-keys',
                    title: 'API Keys',
                    type: 'item',
                    url: '/api-keys',
                },
                {
                    id: 'webhooks',
                    title: 'Webhooks',
                    type: 'item',
                    url: '/webhooks',
                },
            ]
        },
    ],


}
export default settings;