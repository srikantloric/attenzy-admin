import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  FileText,
  Activity,
  Settings,
  Plus,
} from "lucide-react";
import { AppBreadcrumb } from "@/components/AppBreadCrumb";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

export default function WhatsAppSection() {
  const location = useLocation();
  const isChildRoute = location.pathname.includes("/configuration");

  if (isChildRoute) {
    return <Outlet />;
  }

  return (
    <div className="lg:p-6 md:p-3 space-y-6">
      <AppBreadcrumb />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">WhatsApp Connect</h1>
        <p className="text-sm text-muted-foreground">
          Manage WhatsApp messaging via Fast2SMS.
        </p>
      </div>

      {/* Connection Card */}
      <Card className="border-green-200">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <MessageSquare className="text-green-600" />
            </div>

            <div>
              <h2 className="font-semibold flex items-center gap-2">
                Fast2SMS
                <Badge className="bg-green-100 text-green-700">
                  Connected
                </Badge>
              </h2>
              <p className="text-sm text-muted-foreground">
                +91 XXXXX XXXXX
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <p className="text-sm font-medium">
              WhatsApp Credits:
              <span className="text-green-600 ml-1">580</span>
            </p>

            <Button className="bg-green-600 hover:bg-green-700">
              Buy Credits
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActionCard
          icon={<FileText />}
          title="Manage Templates"
          desc="Create and manage templates"
        />
        <ActionCard
          icon={<Activity />}
          title="Log Activity"
          desc="Track message logs"
        />
        <ActionCard
          icon={<Settings />}
          title="Configuration Settings"
          desc="Control limits & preferences"
          route="/integrations/whatsapp/configuration"
        />
      </div>

      {/* Templates Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Templates</TabsTrigger>
              <TabsTrigger value="alerts">Attendance Alerts</TabsTrigger>
              <TabsTrigger value="custom">Custom Messages</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2">
            <Input placeholder="Search templates" />
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-1" />
              Create Template
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="p-3 text-left">Template Name</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Content</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                <TemplateRow
                  name="Student Attendance Alert"
                  category="Alerts"
                />
                <TemplateRow
                  name="Low Attendance Warning"
                  category="Warnings"
                />
                <TemplateRow
                  name="Meeting Reminder"
                  category="Reminders"
                />
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <Outlet />

    </div>
  );
}

/* Reusable components */

function ActionCard({ icon, title, desc, route }: any) {
  const navigate = useNavigate();

  return (
    <Card
      onClick={() => navigate(route)}
      className="cursor-pointer hover:shadow-md transition"
    >
      <CardContent className="p-5 flex gap-4">
        <div className="bg-muted p-3 rounded-xl">{icon}</div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TemplateRow({ name, category }: any) {
  return (
    <tr className="border-b">
      <td className="p-3">{name}</td>
      <td className="p-3 text-muted-foreground">{category}</td>
      <td className="p-3 text-muted-foreground">
        Sample message preview...
      </td>
      <td className="p-3">
        <Badge className="bg-green-100 text-green-700">
          Approved
        </Badge>
      </td>
      <td className="p-3 text-right">
        <Button variant="ghost">•••</Button>
      </td>
    </tr>
  );
}