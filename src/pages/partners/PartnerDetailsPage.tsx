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

  const [permissions, setPermissions] = useState({
    partners: true,
    devices: true,
    reports: true,
    users: true,
    billing: true,
    audit: true
  })

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
    try {
      await axios.patch(`${BASE_URL}/partners/${partner.partnerId}`, {
        partnerName,
        partnerCompany,
        partnerPhone,
        partnerAddress
      })
      navigate("/partners")
    } catch (err) {
      console.error("Failed to update partner", err)
    }
  }

  const handleToggleStatus = async () => {
    try {
      await axios.patch(`${BASE_URL}/partners/${partner.partnerId}`, {
        status: partner.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
      })
      navigate("/partners")
    } catch (err) {
      console.error("Failed to update status", err)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Delete this partner?")) return
    try {
      await axios.delete(`${BASE_URL}/partners/${partner.partnerId}`)
      navigate("/partners")
    } catch (err) {
      console.error("Failed to delete partner", err)
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
        <Card className="lg:col-span-2 py-8">
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
                <Button variant="destructive" onClick={handleToggleStatus}>
                  {partner.status === "ACTIVE" ? "Suspend Account" : "Activate Account"}
                </Button>

                <Button
                  variant="ghost"
                  className="text-red-600 ml-1"
                  onClick={handleDelete}
                >
                  Delete Partner
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate("/partners")}>
                  Cancel
                </Button>
                <Button className="bg-primary" onClick={handleSave}>
                  Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default PartnerDetailsPage
