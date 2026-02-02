import { useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import { Calendar } from "@/components/ui/calendar";

interface AssignRFIDSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type AssignType = "student" | "faculty" | "staff";

export const AssignRFIDSidebar = ({
  open,
  onOpenChange
}: AssignRFIDSidebarProps) => {
  const [assignType, setAssignType] = useState<AssignType>("student");
  const [rfidCard, setRfidCard] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg px-8 py-6"
      >
        {/* Header */}
        <SheetHeader className="-mx-4">
          <SheetTitle>Assign RFID Card</SheetTitle>
        </SheetHeader>

        {/* Form */}
        <div className="space-y-5">

          {/* Assign Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Assign RFID To
            </label>
            <Select
              value={assignType}
              onValueChange={(v) => setAssignType(v as AssignType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Select Person */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Select {assignType}
            </label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${assignType}`} />
              </SelectTrigger>
              <SelectContent>
                {/* Dummy options – replace with real data */}
                <SelectItem value="1">John Doe</SelectItem>
                <SelectItem value="2">Jane Smith</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* RFID Card */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              RFID Card Number
            </label>
            <Input
              placeholder="Scan or enter RFID card number"
              value={rfidCard}
              onChange={(e) => setRfidCard(e.target.value)}
            />
          </div>

          {/* RFID Device (optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              RFID Device (optional)
            </label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select device" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gate-a">Main Gate</SelectItem>
                <SelectItem value="lab-1">Science Lab</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Effective Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Effective From
            </label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              classNames={{
                day_selected:
                  "bg-primary text-primary-foreground hover:bg-primary",
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button className="bg-primary">
              Assign RFID
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
