import { useEffect, useMemo, useState } from "react"
import { Camera, KeyRound, UserRound } from "lucide-react"
import { toast } from "sonner"

import useAuth from "@/hooks/useAuth"
import { getSignedUploadUrl } from "@/api/users"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

type AccountSettingsModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: {
    name?: string
    email?: string
    avatar?: string
  }
}

type AccountSection = "profile" | "security" | "photo"

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"]

export default function AccountSettingsModal({
  open,
  onOpenChange,
  user,
}: AccountSettingsModalProps) {
  const { updateProfile, changePassword } = useAuth()

  const [activeSection, setActiveSection] = useState<AccountSection>("profile")

  const [displayName, setDisplayName] = useState("")
  const [avatarPreview, setAvatarPreview] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  useEffect(() => {
    if (!open) return

    setActiveSection("profile")
    setDisplayName(user.name || "")
    setAvatarPreview(user.avatar || "")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }, [open, user.name, user.avatar])

  const initials = useMemo(() => {
    const name = (displayName || user.name || "User").trim()
    if (!name) return "U"

    const parts = name.split(" ").filter(Boolean)
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }, [displayName, user.name])

  const handleSaveProfile = async () => {
    const trimmedName = displayName.trim()

    if (!trimmedName) {
      toast.error("Name is required")
      return
    }

    if (trimmedName === (user.name || "").trim()) {
      toast.message("No profile changes to save")
      return
    }

    try {
      setSavingProfile(true)
      await updateProfile({ name: trimmedName })
      toast.success("Profile updated")
    } catch (error: any) {
      toast.error(error?.message || "Failed to update profile")
    } finally {
      setSavingProfile(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required")
      return
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Password confirmation does not match")
      return
    }

    try {
      setSavingPassword(true)
      await changePassword(currentPassword, newPassword)
      toast.success("Password updated successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      toast.error(error?.message || "Failed to update password")
    } finally {
      setSavingPassword(false)
    }
  }

  const handleUploadPhoto = async (file?: File) => {
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Only JPG, JPEG and PNG images are allowed")
      return
    }

    if (file.size > MAX_SIZE) {
      toast.error("Max file size is 5MB")
      return
    }

    try {
      setUploadingPhoto(true)

      const { uploadUrl, publicUrl } = await getSignedUploadUrl(
        file.name,
        file.type,
        file.size
      )

      await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      })

      await updateProfile({ avatar: publicUrl })
      setAvatarPreview(publicUrl)
      toast.success("Profile picture updated")
    } catch (error: any) {
      toast.error(error?.message || "Failed to upload profile picture")
    } finally {
      setUploadingPhoto(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-240 overflow-hidden p-0 sm:max-w-240">
        <div className="flex max-h-[80vh] min-h-140 flex-col md:flex-row">
          <aside className="w-full border-b bg-neutral-50 p-4 md:w-56 md:border-r md:border-b-0">
            <DialogHeader className="mb-4 text-left">
              <DialogTitle>General</DialogTitle>
              <DialogDescription>
                Manage your account preferences and security.
              </DialogDescription>
            </DialogHeader>

            <nav className="space-y-1">
              <Button
                variant={activeSection === "profile" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveSection("profile")}
              >
                <UserRound className="h-4 w-4" />
                Profile details
              </Button>

              <Button
                variant={activeSection === "security" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveSection("security")}
              >
                <KeyRound className="h-4 w-4" />
                Update password
              </Button>

              <Button
                variant={activeSection === "photo" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveSection("photo")}
              >
                <Camera className="h-4 w-4" />
                Profile picture
              </Button>
            </nav>
          </aside>

          <section className="flex-1 overflow-y-auto p-6">
            {activeSection === "profile" && (
              <div className="max-w-xl space-y-6">
                <div>
                  <h3 className="text-lg font-semibold">Profile details</h3>
                  <p className="text-sm text-muted-foreground">
                    Update your visible account information.
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="account-name">Full name</Label>
                  <Input
                    id="account-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-email">Email</Label>
                  <Input
                    id="account-email"
                    value={user.email || ""}
                    readOnly
                    disabled
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={savingProfile}>
                    {savingProfile ? "Saving..." : "Save profile"}
                  </Button>
                </div>
              </div>
            )}

            {activeSection === "security" && (
              <div className="max-w-xl space-y-6">
                <div>
                  <h3 className="text-lg font-semibold">Update password</h3>
                  <p className="text-sm text-muted-foreground">
                    Use your current password to set a new one.
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="current-password">Current password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleUpdatePassword}
                    disabled={savingPassword}
                  >
                    {savingPassword ? "Updating..." : "Update password"}
                  </Button>
                </div>
              </div>
            )}

            {activeSection === "photo" && (
              <div className="max-w-xl space-y-6">
                <div>
                  <h3 className="text-lg font-semibold">Profile picture</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload a profile picture in JPG or PNG format.
                  </p>
                </div>

                <Separator />

                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 rounded-xl">
                    <AvatarImage src={avatarPreview} alt={user.name || "User"} />
                    <AvatarFallback className="rounded-xl text-base">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-2">
                    <Label
                      htmlFor="profile-picture"
                      className="inline-flex cursor-pointer"
                    >
                      <span className="sr-only">Upload profile picture</span>
                      <Button
                        type="button"
                        asChild
                        disabled={uploadingPhoto}
                        variant="outline"
                      >
                        <span>
                          {uploadingPhoto ? "Uploading..." : "Upload new picture"}
                        </span>
                      </Button>
                    </Label>

                    <Input
                      id="profile-picture"
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={(e) => handleUploadPhoto(e.target.files?.[0])}
                      disabled={uploadingPhoto}
                    />

                    <p className="text-xs text-muted-foreground">
                      Recommended: square image, up to 5MB.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
