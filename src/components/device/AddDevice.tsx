import { useState } from "react"

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

import { useEffect } from "react"
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

interface AddDeviceProps {
  open: boolean
  setOpen: (status: boolean) => void
  onClose?: () => void
}

type OrgOption = {
  orgId: string
  orgName: string
}

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL

const AddDevice: React.FC<AddDeviceProps> = ({
  open,
  setOpen,
  onClose,
}) => {
  const { user } = useAuth()
  const partnerId = user?.partnerId

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [organizations, setOrganizations] = useState<OrgOption[]>([])
  const [selectedOrg, setSelectedOrg] = useState<OrgOption | null>(null)

  const [form, setForm] = useState({
    deviceId: "",
    serialNumber: "",
    orgId: "",
    location: "",
    description: "",
  })

  const resetForm = () => {
    setForm({
      deviceId: "",
      serialNumber: "",
      orgId: "",
      location: "",
      description: "",
    })
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          partnerId,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to add device")
      }

      setSuccess(true)

      toast.success("Device added successfully", {
        description: `Device ${form.deviceId} has been registered.`,
      })
    } catch (err: any) {
      console.error(err)
      toast.error("Failed to add device", {
        description: err.message || "Something went wrong",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!partnerId) return

    const loadOrgs = async () => {
      try {
        const res = await getOrganizationsByPartner(partnerId)

        const mapped = res.items.map((o) => ({
          orgId: o.orgId,
          orgName: o.orgName,
        }))

        setOrganizations(mapped)
      } catch (err) {
        console.error("Failed to load organizations", err)
        toast.error("Failed to load organizations")
      }
    }

    loadOrgs()
  }, [partnerId])


  return (
    <Sheet
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
                  placeholder="dev003"
                  value={form.deviceId}
                  onChange={(e) =>
                    handleChange("deviceId", e.target.value)
                  }
                />
              </div>

              {/* Serial Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Serial Number</label>
                <Input
                  placeholder="SN003"
                  value={form.serialNumber}
                  onChange={(e) =>
                    handleChange("serialNumber", e.target.value)
                  }
                />
              </div>

              {/* Organization Combobox */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Organization</label>

                <Combobox<OrgOption>
                  items={organizations}
                  onValueChange={(org) => {
                    if (!org) return
                    handleChange("orgId", org.orgId)
                  }}
                >
                  <ComboboxInput placeholder="Search organization by name or ID" />

                  <ComboboxContent>
                    <ComboboxEmpty>No organization found.</ComboboxEmpty>

                    <ComboboxList>
                      {(org) => (
                        <ComboboxItem key={org.orgId} value={org}>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {org.orgName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {org.orgId}
                            </span>
                          </div>
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>


              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  placeholder="Class 5A"
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
