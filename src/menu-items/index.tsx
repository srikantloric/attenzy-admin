// project-imports
import pages from "./pages";
import payroll from "./payroll";
import report from "./report";
import settings from "./settings";
import others from "./others";

// types
import type { NavItemType } from "@/types/menu";

// ==============================|| MENU ITEMS ||============================== //

const menuItems: { items: NavItemType[] } = {
  items: [pages, payroll, others],
};

export default menuItems;
