import { useEffect, useState } from "react"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

import { getOrganizationsByPartner } from "@/api/organization"
import useAuth from "@/hooks/useAuth"
import { toast } from "sonner"

import type { Organization } from "@/types/organization"
import type { Device } from "@/types/device"

interface AddDeviceProps {
  open: boolean
  setOpen: (status: boolean) => void
  onClose?: () => void
  existingDevices: Device[]
}

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL

const AddDevice: React.FC<AddDeviceProps> = ({
  open,
  setOpen,
  onClose,
  existingDevices,
}) => {
  const { user } = useAuth()
  const partnerId = user?.partnerId

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)

  const selectedOrg = organizations.find((o) => o.orgId === selectedOrgId)

  const [form, setForm] = useState({
    deviceId: "",
    serialNumber: "",
    orgId: "",
    location: "",
    description: "",
  })

  const [deviceIdError, setDeviceIdError] = useState<string | null>(null)
  const [serialError, setSerialError] = useState<string | null>(null)

  const resetForm = () => {
    setForm({
      deviceId: "",
      serialNumber: "",
      orgId: "",
      location: "",
      description: "",
    })
    setSelectedOrgId(null)
    setDeviceIdError(null)
    setSerialError(null)
    setSuccess(false)
  }

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    if (!partnerId) {
      toast.error("Partner information missing. Please login again.")
      return
    }

    try {
      setLoading(true)

      const res = await fetch(`${BACKEND_BASE_URL}/devices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, partnerId }),
      })

      if (res.status === 409) {
        toast.error("Device already assigned", {
          description:
            "This device ID or serial number is already assigned.",
        })
        return
      }

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to add device")
      }

      setSuccess(true)
      toast.success("Device added successfully")
    } catch (err: any) {
      toast.error(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!partnerId) return

    const loadOrgs = async () => {
      try {
        const res = await getOrganizationsByPartner(partnerId)
        setOrganizations(res.items as Organization[])
      } catch {
        toast.error("Failed to load organizations")
      }
    }

    loadOrgs()
  }, [partnerId])

  return (
    <Sheet
      modal={false}
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          resetForm()
          onClose?.()
        }
        setOpen(v)
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
                    resetForm()
                    setOpen(false)
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
                  onChange={(e) => {
                    const value = e.target.value
                    handleChange("deviceId", value)

                    const exists = existingDevices.some(
                      (d) =>
                        d.deviceId.toLowerCase() === value.toLowerCase()
                    )

                    setDeviceIdError(
                      exists ? "Device ID already exists" : null
                    )
                  }}
                />
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
                  onChange={(e) => {
                    const value = e.target.value
                    handleChange("serialNumber", value)

                    const exists = existingDevices.some(
                      (d) =>
                        d.serialNumber.toLowerCase() ===
                        value.toLowerCase()
                    )

                    setSerialError(
                      exists ? "Serial number already exists" : null
                    )
                  }}
                />
                {serialError && (
                  <p className="text-xs text-red-600">{serialError}</p>
                )}
              </div>

              {/* Organization */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Organization</label>

                <Combobox
                  items={organizations.map((o) => o.orgId)}
                  value={selectedOrgId}
                  onValueChange={(value) => {
                    if (!value) return
                    setSelectedOrgId(value)
                    handleChange("orgId", value)
                  }}
                >
                  <ComboboxInput
                    placeholder="Select organization"
                    value={selectedOrg?.orgName ?? ""}
                  />

                  <ComboboxContent>
                    <ComboboxEmpty>No organizations found.</ComboboxEmpty>

                    <ComboboxList>
                      {(id) => {
                        const org = organizations.find(
                          (o) => o.orgId === id
                        )!
                        return (
                          <ComboboxItem
                            key={org.orgId}
                            value={org.orgId}
                          >
                            {org.orgName}
                          </ComboboxItem>
                        )
                      }}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  placeholder="Main Gate"
                  value={form.location}
                  onChange={(e) =>
                    handleChange("location", e.target.value)
                  }
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  maxLength={150}
                  value={form.description}
                  onChange={(e) =>
                    handleChange("description", e.target.value)
                  }
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
                    resetForm()
                    setOpen(false)
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
                    !!deviceIdError ||
                    !!serialError ||
                    !form.deviceId ||
                    !form.serialNumber ||
                    !form.orgId ||
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
  )
}

export default AddDevice
