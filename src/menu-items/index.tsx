// project-imports
import pages from "./pages";
import payroll from "./payroll";
import report from "./report";
import settings from "./settings";

// types
import type { NavItemType } from "@/types/menu";

// ==============================|| MENU ITEMS ||============================== //

const menuItems: { items: NavItemType[] } = {
  items: [pages, payroll, report, settings],
};

export default menuItems;
