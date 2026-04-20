import type { NavItemType } from "@/types/menu";
import {  Notebook } from "lucide-react"; 

// icons
const icons = {
  report: Notebook,
};

const report: NavItemType = {
  id: "group-other",
  title: "Other",
  type: "group",
  roles: ["CHANNEL_PARTNER", "ORGANIZATION", "PLATFORM_ADMIN"],
  children: [
    {
      id: "reports",
      title: "Reports",
      type: "item",
      url: "/reports",
      icon: icons.report,
      roles: ["ORGANIZATION"],
    },
  ],
};
export default report;
