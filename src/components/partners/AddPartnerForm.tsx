import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera } from "lucide-react"

import type { Partner } from "@/types/partner"
import { addPartner } from "@/store/partnerStore"

interface AddPartnerFormProps {
    onSuccess: () => void
}

function AddPartnerForm({ onSuccess }: AddPartnerFormProps) {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        address: "",
        photo: ""
    })

    const passwordsMatch =
        form.password.length > 0 &&
        form.password === form.confirmPassword

    const canSubmit =
        form.name &&
        form.email &&
        form.password &&
        passwordsMatch

    const handleSubmit = () => {
        if (!canSubmit) return

        const newPartner: Partner = {
            id: crypto.randomUUID(),
            name: form.name,
            status: "Active",
            organizations: 0,
            devices: 0
        }

        addPartner(newPartner)
        onSuccess()
    }

    return (
        <div className="space-y-6">
            {/* Profile */}
            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={form.photo} />
                    <AvatarFallback>
                        {form.name.slice(0, 2).toUpperCase() || "P"}
                    </AvatarFallback>
                </Avatar>

                <div>
                    <Label className="block mb-1">Profile Photo</Label>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        asChild
                    >
                        <label>
                            <Camera className="h-4 w-4" />
                            Upload
                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                        setForm({
                                            ...form,
                                            photo: URL.createObjectURL(file)
                                        })
                                    }
                                }}
                            />
                        </label>
                    </Button>
                </div>
            </div>

            <Separator />

            {/* Basic Info */}
            <div className="space-y-4">
                <div>
                    <Label className="mb-2">Partner Name *</Label>
                    <Input
                        placeholder="e.g. Unified Tech"
                        value={form.name}
                        onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                        }
                    />
                </div>

                <div>
                    <Label className="mb-2">Email *</Label>
                    <Input
                        type="email"
                        placeholder="admin@partner.com"
                        value={form.email}
                        onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                        }
                    />
                </div>
            </div>

            {/* Security */}
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label className="mb-2">Password *</Label>
                        <Input
                            type="password"
                            value={form.password}
                            onChange={(e) =>
                                setForm({ ...form, password: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <Label className="mb-2">Confirm Password *</Label>
                        <Input
                            type="password"
                            value={form.confirmPassword}
                            onChange={(e) =>
                                setForm({ ...form, confirmPassword: e.target.value })
                            }
                        />
                    </div>
                </div>

                {form.confirmPassword && (
                    <p
                        className={`text-sm ${passwordsMatch
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                    >
                        {passwordsMatch
                            ? "Passwords match"
                            : "Passwords do not match"}
                    </p>
                )}
            </div>

            {/* Contact */}
            <div className="space-y-4">
                <div>
                    <Label className="mb-2">Contact Number</Label>
                    <Input
                        placeholder="+91 98765 43210"
                        value={form.phone}
                        onChange={(e) =>
                            setForm({ ...form, phone: e.target.value })
                        }
                    />
                </div>

                <div>
                    <Label className="mb-2">Address</Label>
                    <Textarea
                        placeholder="Full address"
                        value={form.address}
                        onChange={(e) =>
                            setForm({ ...form, address: e.target.value })
                        }
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={onSuccess}>
                    Cancel
                </Button>
                <Button className="bg-primary" disabled={!canSubmit} onClick={handleSubmit}>
                    Add Partner
                </Button>
            </div>
        </div>
    )
}

export default AddPartnerForm
