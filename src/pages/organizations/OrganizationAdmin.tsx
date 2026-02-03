import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"

import {
    getOrganizationById,
    updateOrganization,
    deleteOrganization
} from "@/store/organizationStore"

import type { Organization } from "@/types/organization"
import { AvatarImage } from "@radix-ui/react-avatar"
import { Camera } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function OrganizationAdmin() {
    const { organizationId } = useParams()
    const navigate = useNavigate()

    const organization = getOrganizationById(organizationId!)

    if (!organization) {
        return <div className="p-6">Organization not found</div>
    }

    const [name, setName] = useState(organization.name)

    const [permissions, setPermissions] = useState({
        devices: true,
        users: true,
        reports: true,
        attendance: true,
        settings: false
    })


    return (
        <div className="space-y-6 mt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">
                        Organizations · Profile
                    </p>
                    <h1 className="text-2xl font-semibold">
                        {name}
                    </h1>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* LEFT */}
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
                            <TabsList className="grid grid-cols-2 mb-2">
                                <TabsTrigger value="account">Account Info</TabsTrigger>
                                <TabsTrigger value="password">Password</TabsTrigger>
                            </TabsList>
                            <TabsContent value="account" className="space-y-4">
                                <div>
                                    <Label className="mb-2">Organization Name</Label>
                                    <Input
                                        className="h-11"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Status</Label>
                                    <Input value={organization.status} disabled />
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Devices</Label>
                                    <Input value={organization.devices} disabled />
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

                {/* RIGHT */}
                <Card className="lg:col-span-2 py-12">
                    <CardHeader>
                        <CardTitle>Organization Permissions</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {[
                            ["devices", "Manage Devices"],
                            ["users", "Manage Users (Staff & Students)"],
                            ["reports", "View Reports & Logs"],
                            ["attendance", "Manage Attendance"],
                            ["settings", "Modify Organization Settings"]
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

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        updateOrganization({
                                            ...organization,
                                            status:
                                                organization.status === "Active"
                                                    ? "Inactive"
                                                    : "Active"
                                        })
                                        navigate("/organizations")
                                    }}
                                >
                                    {organization.status === "Active"
                                        ? "Suspend Organization"
                                        : "Activate Organization"}
                                </Button>

                                <Button
                                    variant="ghost"
                                    className="text-red-600"
                                    onClick={() => {
                                        if (!confirm("Delete this organization?")) return
                                        deleteOrganization(organization.id)
                                        navigate("/organizations")
                                    }}
                                >
                                    Delete Organization
                                </Button>
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => navigate("/organizations")}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => {
                                        updateOrganization({
                                            ...organization,
                                            name
                                        })
                                        navigate("/organizations")
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

export default OrganizationAdmin
