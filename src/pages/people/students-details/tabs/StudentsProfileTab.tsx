import { Separator } from "@/components/ui/separator"
import { MapPin, Phone } from "lucide-react"

function StudentsProfileTab() {
  return (
    <div className="flex h-full gap-3">
      <div className="w-62.5 border flex flex-col rounded-md h-full items-center justify-center p-3">
        <img
          className="rounded-full h-18 w-18"
          src="https://storage.googleapis.com/nmnp-school-prod-fd42d.firebasestorage.app/students%2FNMNP20250215.jpg" alt="" />
        <span className="text-lg font-semibold">Sonakshi Kumari</span>
        <span className="text-sm">NMONS2026454</span>
        <Separator className="mt-4 mb-4" />
        <div className="flex items-center gap-2 text-sm md:gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-medium">LKG</span>
            <span className="text-muted-foreground text-xs">
              Grade
            </span>
          </div>
          <Separator orientation="vertical" />
          <div className="flex flex-col gap-1">
            <span className="font-medium">A</span>
            <span className="text-muted-foreground text-xs">
              Section
            </span>
          </div>
          <Separator orientation="vertical" className="hidden md:block" />
          <div className="hidden flex-col gap-1 md:flex">
            <span className="font-medium">0</span>
            <span className="text-muted-foreground text-xs">Roll No</span>
          </div>
        </div>
        <Separator className="mt-4" />
        <div className="flex flex-col w-full gap-2 mt-4 border rounded-lg p-3 bg-secondary/70">
          <div className="flex justify-between">
            <Phone size={16} />
            <span className="text-sm">
              +91-7979080633
            </span>
          </div>
          <div className="flex justify-between w-full">
            <MapPin size={22} />
            <p className="text-sm text-end">
              At-Chilga,P.O-Sonardih,Jamua,Giridh
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 border rounded-md">
        <p className="p-3">
          Personal Details
        </p>
        <Separator />
      </div>
    </div>
  )
}

export default StudentsProfileTab