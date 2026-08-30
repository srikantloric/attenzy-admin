import { useEffect, useState, useRef } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { addDevice, getDeviceById } from "@/api/device";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";
import { getOrganizationById } from "@/api/organization";

interface OrgAddDeviceProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess?: () => void;
}

const OrgAddDevice: React.FC<OrgAddDeviceProps> = ({
  open,
  setOpen,
  onSuccess,
}) => {
  const { user } = useAuth();
  const orgId = user?.orgId;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // 🔹 Debounce for deviceId only
  const deviceCheckTimer = useRef<number | null>(null);
  const [checkingDeviceId, setCheckingDeviceId] = useState(false);

  const [form, setForm] = useState({
    deviceId: "",
    serialNumber: "",
    location: "",
    description: "",
  });

  const [deviceIdError, setDeviceIdError] = useState<string | null>(null);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm({
      deviceId: "",
      serialNumber: "",
      location: "",
      description: "",
    });
    setDeviceIdError(null);
    setSuccess(false);
  };

  useEffect(() => {
    if (!form.deviceId) {
      setDeviceIdError(null);
      return;
    }

    if (deviceCheckTimer.current) {
      clearTimeout(deviceCheckTimer.current);
    }

    deviceCheckTimer.current = window.setTimeout(async () => {
      try {
        setCheckingDeviceId(true);
        const existing = await getDeviceById(form.deviceId);

        if (existing) {
          setDeviceIdError("Device ID already exists");
          return;
        }

        setDeviceIdError(null);
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message;

        if (msg === "Device not found") {
          setDeviceIdError(null);
          return;
        }

        setDeviceIdError("Unable to verify device ID");
      } finally {
        setCheckingDeviceId(false);
      }
    }, 500);
  }, [form.deviceId]);

  const handleSubmit = async () => {
    if (!orgId) {
      toast.error("Organization is missing partner mapping.");
      return;
    }

    //fetch partnerId from orgId
    const orgDetails = await getOrganizationById(orgId);

    try {
      setLoading(true);

      // 🔐 Final authoritative backend check (deviceId)
    //   const existing = await getDeviceById(form.deviceId);
    //   if (existing) {
    //     toast.error("Device already exists", {
    //       description: "This Device ID already exists in the system.",
    //     });
    //     return;
    //   }

      // Backend will enforce serialNumber uniqueness if applicable
      await addDevice({
        deviceId: form.deviceId,
        serialNumber: form.serialNumber,
        location: form.location,
        description: form.description,
        orgId: orgId,
        partnerId: orgDetails.item.partnerId,
      });

      onSuccess?.();
      setSuccess(true);

      toast.success("Device added successfully");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet
      modal={false}
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          resetForm();
        }
        setOpen(v);
      }}
    >
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="mt-4">Add Device</SheetTitle>
          <SheetDescription>
            Register a new device to an organization
          </SheetDescription>
        </SheetHeader>

        <div className="mx-4 space-y-5">
          {success ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              ✅ Device added successfully.
              <div className="mt-3 flex justify-end">
                <Button
                  className="bg-primary"
                  onClick={() => {
                    resetForm();
                    setOpen(false);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Device ID */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Device ID</label>
                <Input
                  placeholder="attenzy001"
                  value={form.deviceId}
                  onChange={(e) =>
                    handleChange("deviceId", e.target.value.trim())
                  }
                />

                {checkingDeviceId && (
                  <p className="text-xs text-muted-foreground">
                    Checking device ID...
                  </p>
                )}

                {deviceIdError && (
                  <p className="text-xs text-red-600">{deviceIdError}</p>
                )}
              </div>

              {/* Serial Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Serial Number</label>
                <Input
                  placeholder="SN001"
                  value={form.serialNumber}
                  onChange={(e) =>
                    handleChange("serialNumber", e.target.value.trim())
                  }
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  placeholder="Main Gate"
                  value={form.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                />
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
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setOpen(false);
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
                    checkingDeviceId ||
                    !!deviceIdError ||
                    !form.deviceId ||
                    !form.serialNumber ||
                    !form.location
                  }
                >
                  {loading ? "Saving..." : "Add Device"}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default OrgAddDevice;
