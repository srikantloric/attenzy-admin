import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera } from "lucide-react"

interface AddOrganizationFormProps {
  onSuccess: () => void
}

function AddOrganizationForm({ onSuccess }: AddOrganizationFormProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    photo: ""
  })

  const passwordsMatch =
    form.password &&
    form.password === form.confirmPassword

  const canSubmit =
    form.name &&
    form.email &&
    form.password &&
    passwordsMatch

  const handleSubmit = () => {
    if (!canSubmit) return

    // 🔥 Later: Firestore + Auth logic here
    console.log("New organization:", form)

    onSuccess()
  }

  return (
    <div className="space-y-6">
      {/* Profile Photo */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={form.photo} />
          <AvatarFallback>
            {form.name.slice(0, 2).toUpperCase() || "O"}
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
        <div className="space-y-1.5">
          <Label>Organization Name *</Label>
          <Input
            className="h-11"
            placeholder="e.g. Greenfield High School"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label>Email *</Label>
          <Input
            className="h-11"
            type="email"
            placeholder="admin@organization.com"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />
        </div>
      </div>

      {/* Security */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label>Password *</Label>
            <Input
              className="h-11"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label>Confirm Password *</Label>
            <Input
              className="h-11"
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
            className={`text-sm ${
              passwordsMatch
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

      {/* Address */}
      <div className="space-y-1.5">
        <Label>Address</Label>
        <Textarea
          className="min-h-[90px]"
          placeholder="Full address"
          value={form.address}
          onChange={(e) =>
            setForm({ ...form, address: e.target.value })
          }
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button className="bg-primary" disabled={!canSubmit} onClick={handleSubmit}>
          Add Organization
        </Button>
      </div>
    </div>
  )
}

export default AddOrganizationForm
