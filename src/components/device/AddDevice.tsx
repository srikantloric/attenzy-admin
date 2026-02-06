import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { db } from "@/contexts/FirebaseContext";
import {
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";

import { toast } from "sonner";
import { generateDeviceId } from "@/lib/generateDeviceId";

interface AddDeviceProps {
  onClose?: () => void;
}


const AddDevice: React.FC<AddDeviceProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [existingDocId, setExistingDocId] = useState<string | null>(null);
  const [serialConflict, setSerialConflict] = useState(false);
  const [checkingSerial, setCheckingSerial] = useState(false);


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

  const resetForm = () => {
    setForm({
      deviceName: "",
      serialNumber: "",
      deviceModel: "",
      orgId: "",
      partnerId: "",
      location: "",
      ipAddress: "",
      description: ""
    });
    setIsUpdateMode(false);
    setExistingDocId(null);
    setSerialConflict(false);
  };


  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const checkSerialExists = async (serial: string) => {
    if (!serial) return;

    setCheckingSerial(true);

    try {
      const snapshot = await getDocs(collection(db, "devices"));

      const existing = snapshot.docs.find(
        (d) => d.data().serialNumber === serial
      );

      if (existing) {
        setIsUpdateMode(true);
        setExistingDocId(existing.id);
        setSerialConflict(false);

        setForm({
          deviceName: existing.data().deviceName || "",
          serialNumber: existing.data().serialNumber || "",
          deviceModel: existing.data().deviceModel || "",
          orgId: existing.data().orgId || "",
          partnerId: existing.data().partnerId || "",
          location: existing.data().location || "",
          ipAddress: existing.data().ipAddress || "",
          description: existing.data().description || ""
        });

        toast.info("Existing device found", {
          description: "You can update the device details."
        });
      } else {
        setIsUpdateMode(false);
        setExistingDocId(null);
        setSerialConflict(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingSerial(false);
    }
  };


  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (isUpdateMode && existingDocId) {
        // 🔁 UPDATE
        await updateDoc(doc(db, "devices", existingDocId), {
          ...form,
          updatedAt: serverTimestamp()
        });

        toast.success("Device updated", {
          description: "Device details updated successfully."
        });
      } else {
        // ➕ ADD
        const deviceId = await generateDeviceId();

        await addDoc(collection(db, "devices"), {
          ...form,
          deviceId,
          status: "inactive",
          createdAt: serverTimestamp()
        });

        toast.success("Device added", {
          description: "Device registered successfully."
        });
      }

      resetForm();
      onClose?.();
    } catch (error) {
      console.error(error);
      toast.error("Operation failed", {
        description: "Something went wrong."
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="mx-4 space-y-6">

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
          disabled={isUpdateMode}
          onChange={(e) => {
            const value = e.target.value;
            handleChange("serialNumber", value);

            if (value.length >= 4) {
              checkSerialExists(value);
            }
          }}
          className={
            isUpdateMode ? "cursor-not-allowed opacity-70" : ""
          }
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

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          variant="outline"
          onClick={() => {
            resetForm();
            onClose?.();
          }}
          disabled={loading}
        >
          Cancel
        </Button>


        <Button
          className="bg-primary"
          onClick={handleSubmit}
          disabled={
            loading ||
            !form.serialNumber ||
            checkingSerial
          }
        >
          {loading
            ? "Saving..."
            : isUpdateMode
              ? "Update Device"
              : "Add Device"}
        </Button>

      </div>
    </div>
  );
};

export default AddDevice;
