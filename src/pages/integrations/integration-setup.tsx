import { Outlet, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import WhatsAppSection from "./services/whatsapp-section";
import { AppBreadcrumb } from "@/components/AppBreadCrumb";

export default function IntegrationSetup() {
    const { type } = useParams();

    const integrationsConfig = {
        whatsapp: {
            title: "WhatsApp Connect",
            description:
                "Send attendance notifications via WhatsApp Cloud API",
            provider: "Meta / Fast2SMS",
            subText: "+91 XXXXX XXXXX",
            buttonText: "Verify & Connect",
            fields: [
                {
                    name: "accessToken",
                    label: "Access Token",
                    placeholder: "Enter WhatsApp API token",
                    type: "text",
                },
                {
                    name: "phoneNumberId",
                    label: "Phone Number ID",
                    placeholder: "Enter phone number ID",
                    type: "text",
                },
            ],
        },

        slack: {
            title: "Slack Integration",
            description: "Send attendance alerts to Slack channels",
            provider: "Slack",
            subText: "Not connected",
            buttonText: "Connect Slack",
            fields: [
                {
                    name: "webhookUrl",
                    label: "Webhook URL",
                    placeholder: "Enter Slack webhook URL",
                    type: "text",
                },
            ],
        },

        calendar: {
            title: "Google Calendar Integration",
            description: "Sync attendance events with Google Calendar",
            provider: "Google",
            subText: "Not connected",
            buttonText: "Connect Google",
            fields: [],
        },

        email: {
            title: "Email Integration",
            description: "Send attendance notifications via email",
            provider: "SMTP / SendGrid",
            subText: "Not connected",
            buttonText: "Connect Email",
            fields: [
                {
                    name: "email",
                    label: "Sender Email",
                    placeholder: "Enter email",
                    type: "email",
                },
                {
                    name: "password",
                    label: "Password / API Key",
                    placeholder: "Enter password",
                    type: "password",
                },
            ],
        },

        sms: {
            title: "SMS API",
            description: "Send SMS notifications via Fast2SMS",
            provider: "Fast2SMS",
            subText: "Not connected",
            buttonText: "Connect SMS",
            fields: [
                {
                    name: "apiKey",
                    label: "API Key",
                    placeholder: "Enter Fast2SMS API key",
                    type: "text",
                },
            ],
        },
    };

    const config = integrationsConfig[type as keyof typeof integrationsConfig];

    if (!config) {
        return <div>Invalid Integration</div>;
    }

    if (type === "whatsapp") {
        return <WhatsAppSection />;
    }

    return (
        <div className="p-6 space-y-6">
            <AppBreadcrumb />

            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold">{config.title}</h1>
                <p className="text-sm text-muted-foreground">
                    {config.description}
                </p>
            </div>

            {/* Connection Card */}
            <Card className="border-green-200">
                <CardContent className="p-5 flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold">{config.provider}</h2>
                        <p className="text-sm text-muted-foreground">
                            {config.subText}
                        </p>
                    </div>

                    <Button className="bg-green-600 hover:bg-green-700">
                        {config.buttonText}
                    </Button>
                </CardContent>
            </Card>

            {/* Dynamic Fields */}
            {config.fields.length > 0 && (
                <Card>
                    <CardContent className="p-5 space-y-4">
                        {config.fields.map((field) => (
                            <div key={field.name}>
                                <label className="text-sm font-medium">
                                    {field.label}
                                </label>
                                <input
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    className="w-full border rounded-md p-2 mt-1"
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            <Outlet />
        </div>
    );
}