import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Mail,
    MessageSquare,
    Calendar,
    Slack,
    Smartphone,
} from "lucide-react";
import { AppBreadcrumb } from "@/components/AppBreadCrumb";

export default function IntegrationsPage() {
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
            <Card className="border-green-200">
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-green-100 p-3 rounded-xl">
                                <MessageSquare className="text-green-600" />
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold">
                                    WhatsApp Integration
                                </h2>

                                <div className="flex items-center gap-2 mt-1">
                                    <Badge className="bg-blue-100 text-blue-700">
                                        Meta Verified
                                    </Badge>
                                </div>

                                <p className="text-sm text-muted-foreground mt-1">
                                    Send attendance notifications and alerts via WhatsApp
                                </p>
                            </div>
                        </div>

                        <Button variant="outline">Set Default</Button>
                    </div>

                    {/* Meta Verification */}
                    <div className="border rounded-xl p-4 flex items-center justify-between bg-muted/40">
                        <div>
                            <h3 className="font-medium">
                                Meta Tech Provider Verification
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Verify your business with Meta to enable WhatsApp API messaging
                            </p>
                        </div>

                        <Button className="bg-green-600 hover:bg-green-700">
                            Verify & Set Up
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
                    />

                    {/* SMS */}
                    <IntegrationCard
                        icon={<Smartphone />}
                        title="SMS API"
                        desc="Send SMS notifications via Fast2SMS API"
                    />

                    {/* Slack */}
                    <IntegrationCard
                        icon={<Slack />}
                        title="Slack Integration"
                        desc="Send attendance updates via Slack"
                    />

                    {/* Google Calendar */}
                    <IntegrationCard
                        icon={<Calendar />}
                        title="Google Calendar"
                        desc="Sync events and schedules"
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
}: {
    icon: React.ReactNode;
    title: string;
    desc: string;
}) {
    return (
        <Card>
            <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-muted p-3 rounded-xl">{icon}</div>

                    <div>
                        <h3 className="font-medium">{title}</h3>
                        <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                </div>

                <Button variant="outline">Set Up</Button>
            </CardContent>
        </Card>
    );
}