import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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

import { db } from "@/contexts/FirebaseContext";
import {
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore";

import { toast } from "sonner";
import { generateDeviceId } from "@/lib/generateDeviceId";

interface AddDeviceProps {
  onClose?: () => void;
}

const AddDevice: React.FC<AddDeviceProps> = ({ onClose }) => {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    deviceName: "",
    serialNumber: "",
    deviceModel: "",
    orgId: "",
    partnerId: "",
    location: "",
    ipAddress: "",
    description: ""
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const deviceId = await generateDeviceId();

      await addDoc(collection(db, "devices"), {
        deviceId,
        deviceName: form.deviceName,
        serialNumber: form.serialNumber,
        deviceModel: form.deviceModel,
        orgId: form.orgId,
        partnerId: form.partnerId,
        location: form.location,
        description: form.description,
        status: "inactive",
        createdAt: serverTimestamp()
      });

      toast.success("Device added", {
        description: "Device registered successfully."
      });

      onClose?.();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add device", {
        description: "Something went wrong while saving device."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2 space-y-6">

      {/* Device Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Device Name</label>
        <Input
          placeholder="Science Lab 3"
          value={form.deviceName}
          onChange={(e) => handleChange("deviceName", e.target.value)}
        />
      </div>

      {/* Serial Number */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Serial Number</label>
        <Input
          placeholder="SN-00123"
          value={form.serialNumber}
          onChange={(e) => handleChange("serialNumber", e.target.value)}
        />
      </div>

      {/* Device Model */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Device Model</label>
        <Input
          placeholder="ESP32-RFID"
          value={form.deviceModel}
          onChange={(e) => handleChange("deviceModel", e.target.value)}
        />
      </div>

      {/* Org + Partner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Org ID</label>
          <Input
            placeholder="ORG-1001"
            value={form.orgId}
            onChange={(e) => handleChange("orgId", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Partner ID</label>
          <Input
            placeholder="PARTNER-01"
            value={form.partnerId}
            onChange={(e) => handleChange("partnerId", e.target.value)}
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Location</label>
        <Select
          value={form.location}
          onValueChange={(v) => handleChange("location", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Science Lab">Science Lab</SelectItem>
            <SelectItem value="Block A">Block A</SelectItem>
            <SelectItem value="Block B">Block B</SelectItem>
            <SelectItem value="Main Gate">Main Gate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          maxLength={150}
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
        <div className="text-right text-xs text-muted-foreground">
          {form.description.length} / 150
        </div>
      </div>

      <Separator />

      {/* Advanced */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border px-4 py-3 text-sm font-medium">
          Advanced Settings
          <ChevronDown
            className={`h-4 w-4 transition-transform ${advancedOpen ? "rotate-180" : ""
              }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 text-sm text-muted-foreground">
          Additional configuration options can be added later.
        </CollapsibleContent>
      </Collapsible>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button className="bg-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Add Device"}
        </Button>
      </div>
    </div>
  );
};

export default AddDevice;
