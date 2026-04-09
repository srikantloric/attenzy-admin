import { Separator } from "@/components/ui/separator";
import { MapPin, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useOutletContext } from "react-router-dom";
import type { User, StudentProfile } from "@/types/users";

function StudentsProfileTab() {
  const { student } = useOutletContext<{ student: User | null }>();

  if (!student) {
    return <p className="text-sm text-muted-foreground">No data found</p>;
  }

  const profile = student.profile as StudentProfile;

  const firstName = student.name?.split(" ")[0] || "";
  const lastName = student.name?.split(" ").slice(1).join(" ") || "";

  return (
    <div className="flex flex-col lg:flex-row gap-3 h-full">
      
      {/* LEFT PROFILE CARD */}
      <div className="w-full lg:w-72 border flex flex-col rounded-md items-center justify-center p-4">
        {/* Profile Image */}
        <div className="w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center">
          {student.profilePhoto ? (
            <img
              className="h-full w-full object-cover"
              src={student.profilePhoto}
              alt={student.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "";
              }}
            />
          ) : (
            <span className="text-lg font-semibold text-muted-foreground">
              {student.name?.charAt(0)?.toUpperCase()}
            </span>
          )}
        </div>

        {/* Name */}
        <span className="text-lg font-semibold mt-2 text-center">
          {student.name}
        </span>

        {/* ID */}
        <span className="text-sm text-muted-foreground">{student.userId}</span>

        <Separator className="my-4" />

        {/* Class Info */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex flex-col items-center">
            <span className="font-medium">{profile?.class || "-"}</span>
            <span className="text-muted-foreground text-xs">Grade</span>
          </div>

          <Separator orientation="vertical" />

          <div className="flex flex-col items-center">
            <span className="font-medium">{profile?.section || "-"}</span>
            <span className="text-muted-foreground text-xs">Section</span>
          </div>

          <Separator orientation="vertical" />

          <div className="flex flex-col items-center">
            <span className="font-medium">{profile?.rollNumber || "-"}</span>
            <span className="text-muted-foreground text-xs">Roll</span>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Contact Info */}
        <div className="flex flex-col w-full gap-3 border rounded-lg p-3 bg-secondary/70">
          <div className="flex items-center gap-2 text-sm">
            <Phone size={16} />
            <span className="break-all">{student.phone || "-"}</span>
          </div>

          <div className="flex items-start gap-2 text-sm">
            <MapPin size={16} className="mt-0.5" />
            <p className="break-words">
              {profile?.address || "Address not available"}
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT DETAILS FORM */}
      <div className="flex-1 border rounded-md">
        <div className="p-4 flex items-center justify-between">
          <p className="font-medium">Personal Details</p>
          <Button size="sm">Save</Button>
        </div>

        <Separator />

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label>First Name</Label>
            <Input defaultValue={firstName} />
          </div>

          <div className="space-y-1">
            <Label>Admission No</Label>
            <Input defaultValue={student.userId} />
          </div>

          <div className="space-y-1">
            <Label>Grade</Label>
            <Input defaultValue={profile?.class} />
          </div>

          <div className="space-y-1">
            <Label>Section</Label>
            <Input defaultValue={profile?.section} />
          </div>

          <div className="space-y-1">
            <Label>Roll No</Label>
            <Input defaultValue={profile?.rollNumber} />
          </div>

          <div className="space-y-1">
            <Label>Phone</Label>
            <Input defaultValue={student.phone} />
          </div>

          <div className="space-y-1 sm:col-span-2 lg:col-span-3">
            <Label>Email</Label>
            <Input defaultValue={student.email || ""} />
          </div>

          <div className="space-y-1">
            <Label>External ID</Label>
            <Input defaultValue={student.externalId || ""} />
          </div>

          <div className="space-y-1">
            <Label>Date of Birth</Label>
            <Input
              type="date"
              defaultValue={profile?.dob ? profile.dob.split("T")[0] : ""}
            />
          </div>

          <div className="space-y-1">
            <Label>Gender</Label>
            <Input
              defaultValue={
                profile?.gender
                  ? profile.gender.charAt(0) +
                    profile.gender.slice(1).toLowerCase()
                  : ""
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Guardian Name</Label>
            <Input defaultValue={profile?.fatherName || ""} />
          </div>

          <div className="space-y-1">
            <Label>Blood Group</Label>
            <Input defaultValue={profile?.bloodGroup || ""} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentsProfileTab;
