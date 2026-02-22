import { Separator } from "@/components/ui/separator"
import { MapPin, Phone } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

function StudentsProfileTab() {
  return (
    <div className="flex flex-col lg:flex-row gap-3 h-full">
      
      {/* LEFT PROFILE CARD */}
      <div className="
        w-full lg:w-72
        border flex flex-col rounded-md
        items-center justify-center
        p-4
      ">
        <img
          className="rounded-full h-20 w-20 object-cover"
          src="https://storage.googleapis.com/nmnp-school-prod-fd42d.firebasestorage.app/students%2FNMNP20250215.jpg"
          alt=""
        />

        <span className="text-lg font-semibold mt-2 text-center">
          Sonakshi Kumari
        </span>
        <span className="text-sm text-muted-foreground">
          NMONS2026454
        </span>

        <Separator className="my-4" />

        <div className="flex items-center gap-4 text-sm">
          <div className="flex flex-col items-center">
            <span className="font-medium">LKG</span>
            <span className="text-muted-foreground text-xs">Grade</span>
          </div>
          <Separator orientation="vertical" />
          <div className="flex flex-col items-center">
            <span className="font-medium">A</span>
            <span className="text-muted-foreground text-xs">Section</span>
          </div>
          <Separator orientation="vertical" />
          <div className="flex flex-col items-center">
            <span className="font-medium">0</span>
            <span className="text-muted-foreground text-xs">Roll</span>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex flex-col w-full gap-3 border rounded-lg p-3 bg-secondary/70">
          <div className="flex items-center gap-2 text-sm">
            <Phone size={16} />
            <span className="break-all">+91-7979080633</span>
          </div>

          <div className="flex items-start gap-2 text-sm">
            <MapPin size={16} className="mt-0.5" />
            <p className="break-words">
              At-Chilga,P.O-Sonardih,Jamua,Giridh
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
            <Input defaultValue="Sonakshi" />
          </div>

          <div className="space-y-1">
            <Label>Last Name</Label>
            <Input defaultValue="Kumari" />
          </div>

          <div className="space-y-1">
            <Label>Admission No</Label>
            <Input defaultValue="NMONS2026454" />
          </div>

          <div className="space-y-1">
            <Label>Grade</Label>
            <Input defaultValue="LKG" />
          </div>

          <div className="space-y-1">
            <Label>Section</Label>
            <Input defaultValue="A" />
          </div>

          <div className="space-y-1">
            <Label>Roll No</Label>
            <Input defaultValue="0" />
          </div>

          <div className="space-y-1">
            <Label>Phone</Label>
            <Input defaultValue="+91-7979080633" />
          </div>

          <div className="space-y-1 sm:col-span-2 lg:col-span-3">
            <Label>Address</Label>
            <Input defaultValue="At-Chilga,P.O-Sonardih,Jamua,Giridh" />
          </div>

          <div className="space-y-1">
            <Label>Date of Birth</Label>
            <Input type="date" />
          </div>

          <div className="space-y-1">
            <Label>Gender</Label>
            <Input defaultValue="Female" />
          </div>

          <div className="space-y-1">
            <Label>Guardian Name</Label>
            <Input />
          </div>

        </div>
      </div>
    </div>
  )
}

export default StudentsProfileTab