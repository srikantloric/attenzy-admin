import type { Device } from "@/data/devices";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import type { DeviceAction } from "@/types/device-action";

type Props = {
  device: Device | null;
  action: DeviceAction;
  onClose: () => void;
};

export default function DeviceActionController({
  device,
  action,
  onClose
}: Props) {
  if (!device || !action) return null;

  /* ================= VIEW / EDIT (Sheet) ================= */
  if (action === "view" || action === "edit") {
    return (
      <Sheet open onOpenChange={onClose}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {action === "view" ? "Device Details" : "Edit Device"}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-3 text-sm">
            <p><b>ID:</b> {device.id}</p>
            <p><b>Location:</b> {device.location}</p>
            <p><b>Organization:</b> {device.organization}</p>
            <p><b>Status:</b> {device.status}</p>
            <p><b>Last Seen:</b> {device.lastSeen}</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  /* ================= RENAME ================= */
  if (action === "rename") {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Device</DialogTitle>
          </DialogHeader>

          <Input defaultValue={device.name} />

          <DialogFooter>
            <Button onClick={onClose}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  /* ================= ASSIGN ORGANIZATION ================= */
  if (action === "assign") {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Organization</DialogTitle>
          </DialogHeader>

          <Select defaultValue={device.organization}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Unified Tech">Unified Tech</SelectItem>
              <SelectItem value="Connect Solutions">Connect Solutions</SelectItem>
              <SelectItem value="EduSmart Technologies">EduSmart Technologies</SelectItem>
            </SelectContent>
          </Select>

          <DialogFooter>
            <Button onClick={onClose}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  /* ================= SUSPEND / DELETE ================= */
  if (action === "suspend" || action === "delete") {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "delete" ? "Delete Device" : "Suspend Device"}
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Are you sure you want to {action} this device?
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant={action === "delete" ? "destructive" : "default"}
              onClick={onClose}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}
