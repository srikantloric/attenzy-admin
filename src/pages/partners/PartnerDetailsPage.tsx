import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
 
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Camera } from "lucide-react"

import type { Partner } from "@/types/partner"
import { toast } from "sonner"

import ConfirmDialog from "@/components/common/ConfirmDialog"

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL

function PartnerDetailsPage() {
  const { partnerId } = useParams<{ partnerId: string }>()
  const navigate = useNavigate()

  const [partner, setPartner] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(true)

  /* Editable fields */
  const [partnerName, setPartnerName] = useState("")
  const [partnerCompany, setPartnerCompany] = useState("")
  const [partnerPhone, setPartnerPhone] = useState("")
  const [partnerAddress, setPartnerAddress] = useState("")

  const [openConfirm, setOpenConfirm] = useState(false)

  const [permissions, setPermissions] = useState({
    partners: true,
    devices: true,
    reports: true,
    users: true,
    billing: true,
    audit: true
  })

  const isDirty =
    partnerName !== (partner?.partnerName ?? "") ||
    partnerCompany !== (partner?.partnerCompany ?? "") ||
    partnerPhone !== (partner?.partnerPhone ?? "") ||
    partnerAddress !== (partner?.partnerAddress ?? "")

  /* ---------------- FETCH PARTNER ---------------- */
  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/partners`)
        const foundPartner = res.data.items.find(
          (p: Partner) => p.partnerId === partnerId
        )

        if (!foundPartner) {
          setPartner(null)
          return
        }

        setPartner(foundPartner)

        /* populate state */
        setPartnerName(foundPartner.partnerName)
        setPartnerCompany(foundPartner.partnerCompany)
        setPartnerPhone(foundPartner.partnerPhone)
        setPartnerAddress(foundPartner.partnerAddress || "")
      } catch (err) {
        console.error("Failed to fetch partner", err)
        setPartner(null)
      } finally {
        setLoading(false)
      }
    }

    if (partnerId) fetchPartner()
  }, [partnerId])

  if (loading) return <div className="p-6">Loading partner...</div>
  if (!partner) return <div className="p-6">Partner not found</div>

  /* ---------------- ACTIONS ---------------- */

  const handleSave = async () => {
    if (!partner) return

    setPartner(prev =>
      prev
        ? {
          ...prev,
          partnerName,
          partnerCompany,
          partnerPhone,
          partnerAddress
        }
        : prev
    )

    try {
      await axios.put(`${BASE_URL}/partners`, {
        partnerId: partner.partnerId,
        partnerName,
        partnerCompany,
        partnerPhone,
        partnerAddress,
        status: partner.status
      })

      toast.success("Partner updated successfully")

      navigate("/partners")
    } catch (err) {
      toast.error("Failed to update partner details")

      // rollback
      try {
        const res = await axios.get(`${BASE_URL}/partners`)
        const fresh = res.data.items.find(
          (p: Partner) => p.partnerId === partner.partnerId
        )
        if (fresh) setPartner(fresh)
      } catch { }
    }
  }


  const handleToggleStatus = async () => {
    if (!partner) return

    const newStatus =
      partner.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"

    setPartner(prev =>
      prev ? { ...prev, status: newStatus } : prev
    )

    try {
      await axios.put(`${BASE_URL}/partners`, {
        partnerId: partner.partnerId,
        partnerName: partner.partnerName,
        status: newStatus
      })

      toast.success(
        newStatus === "ACTIVE"
          ? "Partner activated successfully"
          : "Partner suspended successfully"
      )
    } catch (err) {
      toast.error("Failed to update partner status")

      // rollback
      setPartner(prev =>
        prev
          ? {
            ...prev,
            status: newStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE"
          }
          : prev
      )
    }
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-6 mt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Partners · Platform Admin
          </p>
          <h1 className="text-2xl font-semibold">{partnerName}</h1>
        </div>

        <Button className="gap-2 bg-primary" onClick={handleSave}>
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT PANEL */}
        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-24 w-24">
                <AvatarImage src="" />
                <AvatarFallback className="bg-muted text-primary text-3xl font-semibold">
                  {partnerName
                    ?.split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map(word => word.charAt(0).toUpperCase())
                    .join("") || "?"}
                </AvatarFallback>
              </Avatar>


              <Button size="sm" className="gap-2 bg-primary">
                <Camera className="h-4 w-4" />
                Upload Photo
              </Button>
            </div>

            <Separator />

            <Tabs defaultValue="account">
              <TabsList className="grid grid-cols-2 mb-2">
                <TabsTrigger value="account">Account Info</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              <TabsContent value="account" className="space-y-4">
                <div>
                  <Label className="mb-1">Partner Name</Label>
                  <Input value={partnerName} onChange={(e) => setPartnerName(e.target.value)} />
                </div>

                <div>
                  <Label className="mb-1">Company</Label>
                  <Input value={partnerCompany} onChange={(e) => setPartnerCompany(e.target.value)} />
                </div>

                <div>
                  <Label className="mb-1">Email</Label>
                  <Input value={partner.partnerEmail} disabled />
                </div>

                <div>
                  <Label className="mb-1">Phone</Label>
                  <Input value={partnerPhone} onChange={(e) => setPartnerPhone(e.target.value)} />
                </div>

                <div>
                  <Label className="mb-1">Address</Label>
                  <Input value={partnerAddress} onChange={(e) => setPartnerAddress(e.target.value)} />
                </div>

                <div>
                  <Label className="mb-1">Status</Label>
                  <Input value={partner.status} disabled />
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Password reset should be handled via email or admin action.
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* RIGHT PANEL */}
        <Card className="lg:col-span-2 py-14 ">
          <CardHeader>
            <CardTitle>Overview & Permissions</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Organizations</p>
                <p className="text-2xl font-semibold">{partner.orgCount}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Devices</p>
                <p className="text-2xl font-semibold">{partner.deviceCount}</p>
              </div>
            </div>

            <Separator />

            {/* Permissions */}
            {[
              ["partners", "Manage Partners & Orgs"],
              ["devices", "Manage Devices"],
              ["reports", "View Reports"],
              ["users", "Manage Users"],
              ["billing", "Billing Access"],
              ["audit", "Audit Logs"]
            ].map(([key, label]) => (
              <div key={key} className="flex items-center gap-3">
                <Checkbox
                  checked={permissions[key as keyof typeof permissions]}
                  onCheckedChange={(checked) =>
                    setPermissions((prev) => ({
                      ...prev,
                      [key]: !!checked
                    }))
                  }
                />
                <span>{label}</span>
              </div>
            ))}

            <Separator />

            {/* Actions */}
            <div className="flex justify-between">
              <div className="space-y-2">
                <Button
                  variant="destructive"
                  onClick={() => setOpenConfirm(true)}
                >
                  {partner.status === "ACTIVE" ? "Suspend Account" : "Activate Account"}
                </Button>

              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate("/partners")}>
                  Cancel
                </Button>
                <Button
                  className="bg-primary"
                  onClick={handleSave}
                  disabled={!isDirty}
                >
                  Save
                </Button>

              </div>
            </div>


          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={openConfirm}
        title={
          partner.status === "ACTIVE"
            ? "Suspend Partner Account?"
            : "Activate Partner Account?"
        }
        description={
          partner.status === "ACTIVE"
            ? "This partner will lose access to the platform until reactivated."
            : "This partner will regain access to the platform."
        }
        confirmText="Yes, Continue"
        variant={partner.status === "ACTIVE" ? "destructive" : "default"}
        onCancel={() => {
          setOpenConfirm(false)
        }}
        onConfirm={() => {
          handleToggleStatus()
          setOpenConfirm(false)
        }}
      />

    </div>
  )
}

export default PartnerDetailsPage
