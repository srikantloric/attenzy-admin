import type { NavItemType } from "@/types/menu";
import { Landmark, ReceiptText } from "lucide-react";

const icons = {
  payroll: Landmark,
  report: ReceiptText,
};

const payroll: NavItemType = {
  id: "group-payroll",
  title: "Payroll",
  type: "group",
  roles: ["ORGANIZATION"],
  children: [
    {
      id: "payroll-root",
      title: "Payroll",
      type: "collapse",
      url: "/payroll",
      icon: icons.payroll,
      roles: ["ORGANIZATION"],
      children: [
        {
          id: "payroll-management",
          title: "Overview",
          url: "/payroll/management",
          roles: ["ORGANIZATION"],
        },
        {
          id: "payroll-payouts-dues",
          title: "Payouts & Dues",
          url: "/payroll/individual-payouts",
          roles: ["ORGANIZATION"],
        },
        {
          id: "payroll-payment-setup",
          title: "Payroll Setup",
          url: "/payroll/payment-setup",
          roles: ["ORGANIZATION"],
        },
        {
          id: "payroll-payment-details",
          title: "Bank/UPI Details",
          url: "/payroll/payment-details",
          roles: ["ORGANIZATION"],
        },

        {
          id: "payroll-report",
          title: "Payroll Report",
          url: "/payroll/report",
          roles: ["ORGANIZATION"],
        },
      ],
    },
  ],
};

export default payroll;
