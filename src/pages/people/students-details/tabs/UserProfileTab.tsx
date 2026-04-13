import { Separator } from "@/components/ui/separator";
import { MapPin, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useOutletContext } from "react-router-dom";
import type { User } from "@/types/users";
import { useState } from "react";
import { updateUser } from "@/api/users";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

function StudentsProfileTab() {
  const { user } = useOutletContext<{ user: User | null }>();

  if (!user) {
    return <p className="text-sm text-muted-foreground">No data found</p>;
  }

  const profile = user.profile;

  /* ================= STATE ================= */

  const [loading, setLoading] = useState(false);

  const initialData = {
    name: user.name || "",
    phone: user.phone || "",
    email: user.email || "",
    dob: user.dob || "",
    gender: user.gender?.toUpperCase() as
      | "MALE"
      | "FEMALE"
      | "OTHER"
      | undefined,
    fatherName: user.fatherName || "",
    bloodGroup: user.bloodGroup?.toUpperCase() as
      | "A+"
      | "A-"
      | "B+"
      | "B-"
      | "O+"
      | "O-"
      | "AB+"
      | "AB-"
      | undefined,
    address: user.address || "",
    externalId: user.externalId || "",
    profile: { ...user.profile },
  };

  const [formData, setFormData] = useState(initialData);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  /* ================= SAVE ================= */

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
      };

      console.log("UPDATE PAYLOAD:", payload);

      await updateUser(user.orgId, user.userId, payload);

      toast.success("User updated successfully");
    } catch (err: any) {
      console.error(err);

      toast.error(err?.message || "Something went wrong while updating user");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-3 h-full">
      {/* LEFT PROFILE CARD */}
      <div className="w-full lg:w-72 border flex flex-col rounded-md items-center justify-center p-4">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center">
          {user.profilePhoto ? (
            <img
              className="h-full w-full object-cover"
              src={user.profilePhoto}
              alt={user.name}
            />
          ) : (
            <span className="text-lg font-semibold text-muted-foreground">
              {user.name?.charAt(0)?.toUpperCase()}
            </span>
          )}
        </div>

        <span className="text-lg font-semibold mt-2 text-center">
          {user.name}
        </span>

        <span className="text-sm text-muted-foreground">{user.userId}</span>

        <Separator className="my-4" />

        {/* ✅ DYNAMIC PROFILE */}
        <div className="flex items-center gap-4 text-sm">
          {user.userType === "STUDENT" && (
            <>
              <div className="flex flex-col items-center">
                <span className="font-medium">{user.profile.class || "-"}</span>
                <span className="text-xs text-muted-foreground">Grade</span>
              </div>

              <Separator orientation="vertical" />

              <div className="flex flex-col items-center">
                <span className="font-medium">
                  {user.profile.section || "-"}
                </span>
                <span className="text-xs text-muted-foreground">Section</span>
              </div>

              <Separator orientation="vertical" />

              <div className="flex flex-col items-center">
                <span className="font-medium">
                  {user.profile.rollNumber || "-"}
                </span>
                <span className="text-xs text-muted-foreground">Roll</span>
              </div>
            </>
          )}

          {user.userType === "FACULTY" && (
            <>
              <div className="flex flex-col items-center">
                <span className="font-medium">
                  {user.profile.department || "-"}
                </span>
                <span className="text-xs text-muted-foreground">
                  Department
                </span>
              </div>

              <Separator orientation="vertical" />

              <div className="flex flex-col items-center">
                <span className="font-medium">
                  {user.profile.subjects || "-"}
                </span>
                <span className="text-xs text-muted-foreground">Subjects</span>
              </div>
            </>
          )}

          {user.userType === "STAFF" && (
            <>
              <div className="flex flex-col items-center">
                <span className="font-medium">
                  {user.profile.designation || "-"}
                </span>
                <span className="text-xs text-muted-foreground">
                  Designation
                </span>
              </div>

              <Separator orientation="vertical" />

              <div className="flex flex-col items-center">
                <span className="font-medium">
                  {user.profile.department || "-"}
                </span>
                <span className="text-xs text-muted-foreground">
                  Department
                </span>
              </div>
            </>
          )}
        </div>

        <Separator className="my-4" />

        <div className="flex flex-col w-full gap-3 border rounded-lg p-3 bg-secondary/70">
          <div className="flex items-center gap-2 text-sm">
            <Phone size={16} />
            <span className="break-all">{user.phone || "-"}</span>
          </div>

          <div className="flex items-start gap-2 text-sm">
            <MapPin size={16} className="mt-0.5" />
            <p className="break-words">
              {user.address || "Address not available"}
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT DETAILS FORM */}
      <div className="flex-1 border rounded-md">
        <div className="p-4 flex items-center justify-between">
          <p className="font-medium">Personal Details</p>
          <Button size="sm" onClick={handleSave} disabled={loading || !isDirty}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>

        <Separator />

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label>First Name</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <Label>User ID</Label>
            <Input value={user.userId} readOnly />
          </div>

          {/* STUDENT */}
          {user.userType === "STUDENT" && (
            <>
              <div className="space-y-1">
                <Label>Grade</Label>
                <Input
                  value={user.profile.class}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: {
                        ...formData.profile,
                        class: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-1">
                <Label>Section</Label>
                <Input
                  value={user.profile.section}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: {
                        ...formData.profile,
                        section: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-1">
                <Label>Roll No</Label>
                <Input
                  value={user.profile.rollNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: {
                        ...formData.profile,
                        rollNumber: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </>
          )}

          {/* FACULTY */}
          {user.userType === "FACULTY" && (
            <>
              <div className="space-y-1">
                <Label>Department</Label>
                <Input
                  value={user.profile.department}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: {
                        ...formData.profile,
                        department: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-1">
                <Label>Subjects</Label>
                <Input
                  value={user.profile.subjects}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: {
                        ...formData.profile,
                        subjects: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </>
          )}

          {/* STAFF */}
          {user.userType === "STAFF" && (
            <>
              <div className="space-y-1">
                <Label>Designation</Label>
                <Input
                  value={user.profile.designation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: {
                        ...formData.profile,
                        designation: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-1">
                <Label>Department</Label>
                <Input
                  value={user.profile.department}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: {
                        ...formData.profile,
                        department: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <Label>Phone</Label>
            <Input
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>

          <div className="space-y-1 sm:col-span-2 lg:col-span-3">
            <Label>Email</Label>
            <Input
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <Label>External ID</Label>
            <Input
              value={formData.externalId}
              onChange={(e) =>
                setFormData({ ...formData, externalId: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Date of Birth</Label>
            <Input
              type="date"
              value={
                formData.dob
                  ? new Date(formData.dob).toLocaleDateString("en-CA")
                  : ""
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dob: new Date(e.target.value).toISOString(),
                })
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Gender</Label>

            <Select
              value={formData.gender ?? ""}
              onValueChange={(val) =>
                setFormData({
                  ...formData,
                  gender: val as "MALE" | "FEMALE" | "OTHER",
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Guardian Name</Label>
            <Input
              value={formData.fatherName}
              onChange={(e) =>
                setFormData({ ...formData, fatherName: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Blood Group</Label>

            <Select
              value={formData.bloodGroup ?? ""}
              onValueChange={(val) =>
                setFormData({
                  ...formData,
                  bloodGroup: val as
                    | "A+"
                    | "A-"
                    | "B+"
                    | "B-"
                    | "O+"
                    | "O-"
                    | "AB+"
                    | "AB-",
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentsProfileTab;
