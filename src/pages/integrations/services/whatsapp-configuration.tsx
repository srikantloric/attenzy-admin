import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ChevronDown, Check } from "lucide-react";
import {
    Bell,
    Clock,
    Settings2,
    ShieldCheck,
    MessageSquare,
} from "lucide-react";
import { AppBreadcrumb } from "@/components/AppBreadCrumb";

export default function WhatsAppConfiguration() {

    return (
        <div className="lg:p-6 md:p-3 space-y-6">
            <AppBreadcrumb />

            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold">
                    Configuration Settings
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage WhatsApp messaging settings and control usage of Fast2SMS.
                </p>
            </div>

            {/* Message Categories */}
            <Card className="rounded-xl">
                <CardContent className="p-5 space-y-4">
                    <SectionHeader
                        icon={<Bell />}
                        title="Message Categories"
                        desc="Choose what types of messages to send via WhatsApp using Fast2SMS."
                    />

                    <div className="grid md:grid-cols-3 gap-4">
                        <ToggleCard
                            icon={<Bell />}
                            title="Attendance Alerts"
                            desc="Send automatic attendance notifications."
                            defaultChecked
                        />
                        <ToggleCard
                            icon={<MessageSquare />}
                            title="Low Attendance Warnings"
                            desc="Alert users when attendance falls below threshold."
                        />
                        <ToggleCard
                            icon={<Clock />}
                            title="Reminders"
                            desc="Send meeting reminders and event alerts."
                            defaultChecked
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Middle Section */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Delivery Limits */}
                <Card className="rounded-xl">
                    <CardContent className="p-5 space-y-4">
                        <SectionHeader
                            icon={<Settings2 />}
                            title="Delivery Limits"
                            desc="Set limits on messages sent per day."
                        />

                        <div className="flex items-center justify-between">
                            <label className="text-sm">Daily Message Limit</label>
                            <Select defaultValue="500">
                                <SelectTrigger className="mt-1 w-20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="100">100</SelectItem>
                                    <SelectItem value="500">500</SelectItem>
                                    <SelectItem value="1000">1000</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="text-sm">
                                Message per User per Day Limit
                            </label>
                            <Select defaultValue="5">
                                <SelectTrigger className="mt-1 w-20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1</SelectItem>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                </SelectContent>
                            </Select>

                        </div>

                        <p className="text-xs text-muted-foreground mt-1">
                            Restrict how many messages a single user can receive in one day.
                        </p>

                    </CardContent>
                </Card>

                {/* Consent */}
                <Card className="rounded-xl">
                    <CardContent className="p-5 space-y-4">
                        <SectionHeader
                            icon={<ShieldCheck />}
                            title="Consent & Opt-In"
                            desc="Manage user consent settings for WhatsApp messaging."
                        />

                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium">
                                    Require User Opt-In
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Only send messages to users who have explicitly opted in.
                                </p>
                            </div>
                            <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <label className="text-sm mr-2">Opt-Out Keyword</label>
                                <Input defaultValue="STOP" className="w-60 mr-3" />
                            </div>
                            <div className="flex justify-end">
                                <Switch defaultChecked />
                            </div>
                        </div>

                    </CardContent>
                </Card>
            </div>

            {/* Bottom Section */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Send Preferences */}
                <Card className="rounded-xl">
                    <CardContent className="p-5 space-y-4">
                        <SectionHeader
                            icon={<Clock />}
                            title="Send Preferences"
                            desc="Control when and how messages are sent via WhatsApp."
                        />

                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-medium">Respect Quiet Hours</p>
                                <p className="text-sm text-muted-foreground">
                                    Avoid sending messages during specific hours.
                                </p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                {/* Automated Notifications */}
                <Card className="rounded-xl">
                    <CardContent className="p-5 space-y-4">
                        <SectionHeader
                            icon={<Bell />}
                            title="Automated Notifications"
                            desc="Receive automatic alerts when usage limits are reached."
                        />

                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-medium">Admin Notifications</p>
                                <p className="text-sm text-muted-foreground">
                                    Notify admin when daily limits are exceeded.
                                </p>
                            </div>
                            <Switch defaultChecked />
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center border rounded-md px-2 py-1">
                                👤 450
                            </div>
                            <span className="text-sm text-muted-foreground">
                                WhatsApp messages sent per day
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Save Settings
                </Button>
            </div>
        </div>
    );
}

/* Header */
function SectionHeader({ icon, title, desc }: any) {
    return (
        <div className="flex items-start justify-between">

            {/* Left */}
            <div className="flex gap-3">

                <div className="w-9 h-9 flex items-center justify-center bg-muted rounded-md shrink-0">
                    {icon}
                </div>

                {/* TEXT */}
                <div>
                    <h2 className="font-semibold">{title}</h2>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
            </div>

            {/* Right */}
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        </div>
    );
}

/* Toggle Card */
function ToggleCard({ icon, title, desc, defaultChecked }: any) {
    return (
        <div className="border rounded-xl p-4 flex items-center justify-between gap-4">

            {/* Left */}
            <div className="flex items-start gap-3">

                <div className="w-10 h-10 flex items-center justify-center bg-muted rounded-md shrink-0">
                    {icon}
                </div>

                {/* TEXT */}
                <div className="flex-1">
                    <h3 className="font-medium">{title}</h3>
                    <p className="text-sm text-muted-foreground">
                        {desc}
                    </p>
                </div>
            </div>

            {/* SWITCH */}
            <Switch defaultChecked={defaultChecked} />

        </div>
    );
}