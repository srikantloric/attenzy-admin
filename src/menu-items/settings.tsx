import type { NavItemType } from "@/types/menu";
import { CircleDollarSign, Webhook } from "lucide-react";

// icons
const icons = {
    billing: CircleDollarSign,
    webhook: Webhook
};

const settings: NavItemType = {
    id: 'group-settings',
    title: 'Settings',
    type: 'group',
    children: [
        {
            id: 'billing-plan',
            title: 'Billing & Plan',
            type: 'item',
            url: '/dashboard',
            icon: icons.billing,
        },
        {
            id: 'integrations',
            title: 'API / Webhooks',
            type: 'item',
            url: '/dashboard',
            icon: icons.webhook,
        },
    ],


}
export default settings;