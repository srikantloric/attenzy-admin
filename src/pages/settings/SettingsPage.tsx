import { AppBreadcrumb } from "@/components/AppBreadCrumb";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircleIcon,
  ArrowDownUp,
  CalendarClock,
  Settings,
  Shield,
} from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

function SettingsPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const tab = pathname.split("/")[2] ?? "master-config";

  return (
    <div className="space-y-6 p-6">
      <AppBreadcrumb />
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Settings</h1>
        </div>
      </div>
      <Tabs
        defaultValue="master-config"
        value={tab}
        onValueChange={(value) =>
          navigate(value === "master-config" ? "." : value)
        }
        className="space-y-4"
      >
        <TabsList variant={"line"}>
          <TabsTrigger value="master-config">
            <Settings />
            Academic Setup
          </TabsTrigger>
          <TabsTrigger value="calander-working-days">
            <CalendarClock />
            Calendar & Working Days
          </TabsTrigger>
          <TabsTrigger value="alerts-notifications">
            <AlertCircleIcon />
            Alerts & Notifications
          </TabsTrigger>
          <TabsTrigger value="access-controls">
            <Shield />
            Access Control
          </TabsTrigger>
          <TabsTrigger value="import-export">
            <ArrowDownUp />
            Import/Export
          </TabsTrigger>
        </TabsList>
        <Outlet />
      </Tabs>
    </div>
  );
}

export default SettingsPage;
