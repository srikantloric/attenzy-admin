import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Calendar, Slack, Smartphone } from "lucide-react";
import { AppBreadcrumb } from "@/components/AppBreadCrumb";

export default function IntegrationsPage() {
  const navigate = useNavigate();
  return (
    <div className="lg:p-6 md:p-3 space-y-6">
      <AppBreadcrumb />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Integrations</h1>
        <p className="text-sm text-muted-foreground">
          Connect external services to automate attendance notifications
        </p>
      </div>

      {/* WhatsApp Integration */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="whatsapp-icon.png" alt="WhatsApp" className="h-15" />
              <div>
                <h2 className="text-lg font-semibold">WhatsApp Integration</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Send attendance notifications and alerts via WhatsApp
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                navigate("/integrations/whatsapp");
              }}
            >
              Set Up
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Other Services */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Other Services</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email */}
          <IntegrationCard
            icon={<Mail />}
            title="Email Integration"
            desc="Send attendance updates via email"
            type="email"
            connected={false}
          />

          {/* SMS */}
          <IntegrationCard
            icon={<Smartphone />}
            title="SMS API"
            desc="Send SMS notifications via Fast2SMS API"
            type="sms"
            connected={false}
          />

          {/* Slack */}
          <IntegrationCard
            icon={<Slack />}
            title="Slack Integration"
            desc="Send attendance updates via Slack"
            type="slack"
            connected={false}
          />

          {/* Google Calendar */}
          <IntegrationCard
            icon={<Calendar />}
            title="Google Calendar"
            desc="Sync events and schedules"
            type="calender"
            connected={false}
          />
        </div>
      </div>
    </div>
  );
}

/* Reusable Card */
function IntegrationCard({
  icon,
  title,
  desc,
  type,
  connected,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  type: string;
  connected?: boolean;
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/integrations/${type}`);
  };

  return (
    <Card>
      <CardContent className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-muted p-3 rounded-xl">{icon}</div>

          <div>
            <h3 className="font-medium flex items-center gap-3">
              {title}

              {connected ? (
                <span className="text-green-600 text-xs bg-green-100 px-2 py-1 rounded-md">
                  Connected
                </span>
              ) : (
                <span className="text-red-500 text-xs bg-gray-100 px-2 py-1 rounded-md">
                  Not Connected
                </span>
              )}
            </h3>

            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        </div>

        <Button variant="outline" onClick={handleClick}>
          {connected ? "Manage" : "Set Up"}
        </Button>
      </CardContent>
    </Card>
  );
}
