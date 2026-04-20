import type { NavItemType } from "@/types/menu";
import { CircleDollarSign, CodeXml, Settings, Webhook, Notebook, MonitorCog } from "lucide-react";

// icons
const icons = {
    billing: CircleDollarSign,
    webhook: Webhook,
    settings: Settings,
    code: CodeXml,
    report: Notebook,
    integration: MonitorCog
};

const others: NavItemType = {
    id: "group-other",
    title: "Other",
    type: "group",
    roles: ["CHANNEL_PARTNER", "ORGANIZATION", "PLATFORM_ADMIN"],
    children: [
        {
            id: "developers",
            title: "Developers",
            type: "item",
            url: "/developers",
            icon: icons.code,
            roles: ["CHANNEL_PARTNER", "PLATFORM_ADMIN"],
        },
        {
            id: "integrations",
            title: "Integrations",
            type: "item",
            url: "/integrations",
            icon: icons.integration,
            roles: ["ORGANIZATION"],
        },
        {
            id: "reports",
            title: "Reports",
            type: "item",
            url: "/reports",
            icon: icons.report,
            roles: ["ORGANIZATION"],
        },
        {
            id: "settings",
            title: "Settings",
            type: "item",
            url: "/settings",
            icon: icons.settings,
            roles: ["ORGANIZATION"],
        },
    ],
};
export default others;
