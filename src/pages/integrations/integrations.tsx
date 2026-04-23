import { useNavigate } from "react-router-dom";
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
            <Card className="border-green-200">
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* <div className="bg-green-100 p-3 rounded-xl">
                                <MessageSquare className="text-green-600" />
                            </div> */}

                            <svg className="w-10 h-12 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path fill="currentColor" fill-rule="evenodd" d="M12 4a8 8 0 0 0-6.895 12.06l.569.718-.697 2.359 2.32-.648.379.243A8 8 0 1 0 12 4ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10a9.96 9.96 0 0 1-5.016-1.347l-4.948 1.382 1.426-4.829-.006-.007-.033-.055A9.958 9.958 0 0 1 2 12Z" clip-rule="evenodd" />
                                <path fill="currentColor" d="M16.735 13.492c-.038-.018-1.497-.736-1.756-.83a1.008 1.008 0 0 0-.34-.075c-.196 0-.362.098-.49.291-.146.217-.587.732-.723.886-.018.02-.042.045-.057.045-.013 0-.239-.093-.307-.123-1.564-.68-2.751-2.313-2.914-2.589-.023-.04-.024-.057-.024-.057.005-.021.058-.074.085-.101.08-.079.166-.182.249-.283l.117-.14c.121-.14.175-.25.237-.375l.033-.066a.68.68 0 0 0-.02-.64c-.034-.069-.65-1.555-.715-1.711-.158-.377-.366-.552-.655-.552-.027 0 0 0-.112.005-.137.005-.883.104-1.213.311-.35.22-.94.924-.94 2.16 0 1.112.705 2.162 1.008 2.561l.041.06c1.161 1.695 2.608 2.951 4.074 3.537 1.412.564 2.081.63 2.461.63.16 0 .288-.013.4-.024l.072-.007c.488-.043 1.56-.599 1.804-1.276.192-.534.243-1.117.115-1.329-.088-.144-.239-.216-.43-.308Z" />
                            </svg>


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

                        <Button onClick={() => navigate("/integrations/whatsapp")} className="bg-green-600 hover:bg-green-700">
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