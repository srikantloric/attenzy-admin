import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Camera } from "lucide-react"

import {
  getPartnerById,
  updatePartner,
  deletePartner
} from "@/store/partnerStore"


function PartnerDetailsPage() {
  const { partnerId } = useParams()
  const navigate = useNavigate()

  /* ---------- load partner ---------- */
  const partner = getPartnerById(partnerId!)

  if (!partner) {
    return <div className="p-6">Partner not found</div>
  }

  /* ---------- editable state ---------- */
  const [name, setName] = useState(partner.name)

  const [permissions, setPermissions] = useState({
    partners: true,
    devices: true,
    reports: true,
    users: true,
    billing: true,
    audit: true
  })

  return (
    <div className="space-y-6 mt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Partners · Platform Admin
          </p>
          <h1 className="text-2xl font-semibold">
            {name}
          </h1>
        </div>

        <Button className="gap-2 bg-primary">
          Update Admin
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT PANEL */}
        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-24 w-24">
                <AvatarImage src="https://i.pravatar.cc/150" />
                <AvatarFallback>
                  {name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <Button size="sm" className="gap-2 bg-primary">
                <Camera className="h-4 w-4" />
                Upload New Photo
              </Button>
            </div>

            <Separator />

            <Tabs defaultValue="account">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="account">Account Info</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
              </TabsList>

              <TabsContent value="account" className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input defaultValue="admin@attenzy.com" disabled />
                </div>

                <div>
                  <Label>Role</Label>
                  <Input defaultValue="PLATFORM ADMIN" disabled />
                </div>
              </TabsContent>

              <TabsContent value="password" className="space-y-4">
                <div>
                  <Label>New Password</Label>
                  <Input type="password" />
                </div>

                <div>
                  <Label>Confirm Password</Label>
                  <Input type="password" />
                </div>
              </TabsContent>
            </Tabs>

          </CardContent>
        </Card>

        {/* RIGHT PANEL */}
        <Card className="lg:col-span-2 py-8">
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {[
              ["partners", "Manage Partners and Organizations"],
              ["devices", "Manage Devices and Settings"],
              ["reports", "Manage Reports and Alerts"],
              ["users", "Manage Users (All Roles)"],
              ["billing", "Manage Billing and Plans"],
              ["audit", "Access Audit Log"]
            ].map(([key, label]) => (
              <div key={key} className="flex items-center gap-3">
                <Checkbox
                  checked={permissions[key as keyof typeof permissions]}
                  onCheckedChange={(checked) =>
                    setPermissions(prev => ({
                      ...prev,
                      [key]: !!checked
                    }))
                  }
                />
                <span>{label}</span>
              </div>
            ))}

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-2">
                {/* Suspend */}
                <Button
                  variant="destructive"
                  onClick={() => {
                    updatePartner({
                      ...partner,
                      status:
                        partner.status === "Active"
                          ? "Inactive"
                          : "Active"
                    })
                    navigate("/partners")
                  }}
                >
                  {partner.status === "Active"
                    ? "Suspend Account"
                    : "Activate Account"}
                </Button>

                {/* Delete */}
                <Button
                  variant="ghost"
                  className="text-red-600"
                  onClick={() => {
                    if (!confirm("Delete this partner?")) return
                    deletePartner(partner.id)
                    navigate("/partners")
                  }}
                >
                  Delete Account
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate("/partners")}>
                  Cancel
                </Button>

                <Button
                  className="bg-primary"
                  onClick={() => {
                    updatePartner({
                      ...partner,
                      name
                    })
                    navigate("/partners")
                  }}
                >
                  Save Changes
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
