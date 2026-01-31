import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from "@/components/ui/collapsible";

import { ChevronDown } from "lucide-react";

const AddDevicePage: React.FC = () => {
    const [deviceName, setDeviceName] = useState("");
    const [location, setLocation] = useState("");
    const [ipAddress, setIpAddress] = useState("");
    const [description, setDescription] = useState("");
    const [advancedOpen, setAdvancedOpen] = useState(false);

    return (
        <div className="max-w-4xl space-y-6 p-6 justify-evenly mx-auto">

            {/* Title */}
            <h1 className="text-2xl font-semibold tracking-tight">
                Add Device
            </h1>

            <Card>
                <CardContent className="space-y-6 p-6">

                    {/* Device Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Device Name</label>
                        <Input
                            placeholder="Science Lab 3"
                            value={deviceName}
                            onChange={(e) => setDeviceName(e.target.value)}
                        />
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Location</label>
                        <Select value={location} onValueChange={setLocation}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="science-lab">Science Lab</SelectItem>
                                <SelectItem value="block-a">Block A</SelectItem>
                                <SelectItem value="block-b">Block B</SelectItem>
                                <SelectItem value="main-gate">Main Gate</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* IP Address + Validate */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">IP Address</label>
                            <Input
                                placeholder="192.168.1.20"
                                value={ipAddress}
                                onChange={(e) => setIpAddress(e.target.value)}
                            />
                        </div>

                        <Button variant="secondary">
                            Validate
                        </Button>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                            placeholder="Device for Science Lab 3 attendance"
                            value={description}
                            maxLength={150}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <div className="text-right text-xs text-muted-foreground">
                            {description.length} / 150
                        </div>
                    </div>

                    <Separator />

                    {/* Advanced Settings */}
                    <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border px-4 py-3 text-sm font-medium hover:bg-muted">
                            Advanced Settings (optional)
                            <ChevronDown
                                className={`h-4 w-4 transition-transform ${advancedOpen ? "rotate-180" : ""
                                    }`}
                            />
                        </CollapsibleTrigger>

                        <CollapsibleContent className="mt-4 space-y-4 px-1">
                            {/* Placeholder for future settings */}
                            <div className="text-sm text-muted-foreground">
                                Additional configuration options can be added here.
                            </div>
                        </CollapsibleContent>
                    </Collapsible>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4">
                        <Button variant="outline">
                            Cancel
                        </Button>

                        <Button>
                            Add Device
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
};

export default AddDevicePage;
