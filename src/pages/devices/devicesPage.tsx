import { useMemo, useState } from "react";

import { devicesData } from "@/data/devices";
import type { Device, DeviceStatus } from "@/data/devices";
import type { DeviceAction } from "@/types/device-action";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

import {
  Sheet,
  SheetContent,
  SheetDescription,
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
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  Search,
  Plus,
  MoreVertical,
  Power,
  Circle,
  Eye,
  Pencil,
  Edit3,
  UserPlus,
  PauseCircle,
  Trash2
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";

import { Field, FieldLabel } from "@/components/ui/field";
import AddDevice from "@/components/device/AddDevice";

const DevicePageNew: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>(devicesData);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<DeviceStatus | "all">("all");
  const [location, setLocation] = useState("all");

  const [addOpen, setAddOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [action, setAction] = useState<DeviceAction>(null);

  const [renameValue, setRenameValue] = useState("");
  const [assignValue, setAssignValue] = useState("");

  const [openOrg, setOpenOrg] = useState<string | null>(null);

  /* ================= FILTERING ================= */
  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      const matchesSearch = device.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        status === "all" ? true : device.status === status;

      const matchesLocation =
        location === "all"
          ? true
          : device.location.toLowerCase() === location.toLowerCase();

      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [devices, search, status, location]);

  const devicesByOrganization = useMemo(() => {
    const map: Record<string, Device[]> = {};

    filteredDevices.forEach((device) => {
      if (!map[device.organization]) {
        map[device.organization] = [];
      }
      map[device.organization].push(device);
    });

    return map;
  }, [filteredDevices]);


  /* ================= ACTION CONTROL ================= */
  const openAction = (device: Device, action: DeviceAction) => {
    setSelectedDevice(device);
    setAction(action);

    if (action === "rename") {
      setRenameValue(device.name);
    }

    if (action === "assign") {
      setAssignValue(device.organization);
    }
  };

  const closeAction = () => {
    setSelectedDevice(null);
    setAction(null);
    setRenameValue("");
    setAssignValue("");
  };

  /* ================= ACTION HANDLERS ================= */
  const handleRename = () => {
    if (!selectedDevice) return;

    setDevices((prev) =>
      prev.map((d) =>
        d.id === selectedDevice.id ? { ...d, name: renameValue } : d
      )
    );

    closeAction();
  };

  const handleAssign = () => {
    if (!selectedDevice) return;

    setDevices((prev) =>
      prev.map((d) =>
        d.id === selectedDevice.id
          ? { ...d, organization: assignValue }
          : d
      )
    );

    closeAction();
  };

  const handleSuspend = () => {
    if (!selectedDevice) return;

    setDevices((prev) =>
      prev.map((d) =>
        d.id === selectedDevice.id ? { ...d, status: "inactive" } : d
      )
    );

    closeAction();
  };

  const handleDelete = () => {
    if (!selectedDevice) return;

    setDevices((prev) =>
      prev.filter((d) => d.id !== selectedDevice.id)
    );

    closeAction();
  };

  const handleActivate = () => {
    if (!selectedDevice) return;

    setDevices((prev) =>
      prev.map((d) =>
        d.id === selectedDevice.id
          ? { ...d, status: "active" }
          : d
      )
    );

    closeAction();
  };

  const toggleOrganization = (org: string) => {
    setOpenOrg((prev) => (prev === org ? null : org));
  };


  /* ================= PAGE ================= */
  return (
    <>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">Devices</h1>
            <span className="rounded-md bg-muted px-2 py-0.5 text-sm">
              {devices.length}
            </span>
          </div>

          <Button onClick={() => setAddOpen(true)} className="gap-2 bg-primary">
            <Plus className="h-4 w-4" />
            Add Device
          </Button>
        </div>

        <Separator />

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8 w-56"
              placeholder="Search devices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="Main Gate">Main Gate</SelectItem>
              <SelectItem value="Admin Building">Admin Building</SelectItem>
              <SelectItem value="Library">Library</SelectItem>
              <SelectItem value="Lab 1">Lab 1</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={(v) => setStatus(v as any)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Online</SelectItem>
              <SelectItem value="inactive">Offline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent>
            {Object.entries(devicesByOrganization).map(
              ([organization, orgDevices]) => {
                const isOpen = openOrg === organization;

                return (
                  <Card key={organization} className="my-2">
                    <CardContent>
                      {/* ===== Organization Header (Clickable) ===== */}
                      <button
                        onClick={() => toggleOrganization(organization)}
                        className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-muted transition"
                      >
                        <div>
                          <h2 className="text-lg font-semibold">
                            {organization}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {orgDevices.length} devices
                          </p>
                        </div>

                        <span className="text-sm text-muted-foreground">
                          {isOpen ? "Hide" : "Show"}
                        </span>
                      </button>

                      {/* ===== Devices (Hidden / Visible) ===== */}
                      {isOpen && (
                        <div className="px-6 pb-6">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Device ID</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Seen</TableHead>
                                <TableHead>Power</TableHead>
                                <TableHead className="text-right">
                                  Actions
                                </TableHead>
                              </TableRow>
                            </TableHeader>

                            <TableBody>
                              {orgDevices.map((device) => (
                                <TableRow key={device.id}>
                                  <TableCell className="font-medium">
                                    {device.name}
                                  </TableCell>

                                  <TableCell>{device.location}</TableCell>

                                  <TableCell>
                                    <span
                                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs
                          ${device.status === "active"
                                          ? "bg-green-100 text-green-700"
                                          : "bg-red-100 text-red-700"
                                        }`}
                                    >
                                      <Circle className="h-2 w-2 fill-current" />
                                      {device.status === "active"
                                        ? "Online"
                                        : "Offline"}
                                    </span>
                                  </TableCell>

                                  <TableCell className="text-muted-foreground">
                                    {device.lastSeen}
                                  </TableCell>

                                  <TableCell className="flex items-center gap-2">
                                    <Power className="h-4 w-4 text-green-600" />
                                    Powered
                                  </TableCell>

                                  <TableCell className="text-right">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                        >
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>

                                      <DropdownMenuContent
                                        align="end"
                                        className="w-56"
                                      >
                                        <DropdownMenuItem
                                          onClick={() =>
                                            openAction(device, "view")
                                          }
                                        >
                                          <Eye className="mr-2 h-4 w-4" />
                                          View Details
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                          onClick={() =>
                                            openAction(device, "edit")
                                          }
                                        >
                                          <Pencil className="mr-2 h-4 w-4" />
                                          Edit
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                          onClick={() =>
                                            openAction(device, "rename")
                                          }
                                        >
                                          <Edit3 className="mr-2 h-4 w-4" />
                                          Rename
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                          onClick={() =>
                                            openAction(device, "assign")
                                          }
                                        >
                                          <UserPlus className="mr-2 h-4 w-4" />
                                          Assign Organization
                                        </DropdownMenuItem>

                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem
                                          className="text-amber-600"
                                          onClick={() =>
                                            openAction(device, "suspend")
                                          }
                                        >
                                          <PauseCircle className="mr-2 h-4 w-4" />
                                          Suspend
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                          className="text-red-600"
                                          onClick={() =>
                                            openAction(device, "delete")
                                          }
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              }
            )}


          </CardContent>

          <Separator />

          {/* Pagination */}
          <div className="flex items-center justify-end gap-6 px-4">
            <Field orientation="horizontal" className="w-fit gap-2">
              <FieldLabel htmlFor="select-rows-per-page">
                Rows per page
              </FieldLabel>

              <Select defaultValue="25">
                <SelectTrigger className="h-8 w-20" id="select-rows-per-page">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent align="start">
                  <SelectGroup>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Pagination className="mx-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>

        </Card>
      </div>

      {/* ================= ADD DEVICE ================= */}
      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Add Device</SheetTitle>
            <SheetDescription>Enter device details</SheetDescription>
          </SheetHeader>
          <AddDevice onClose={() => setAddOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* ================= ACTION CONTROLLER ================= */}
      {selectedDevice && action && (
        <>
          {(action === "view" || action === "edit") && (
            <Sheet open onOpenChange={closeAction}>
              <SheetContent side="right" className="sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Device Details</SheetTitle>
                </SheetHeader>

                <div className="mt-4 space-y-2 text-sm mx-4">
                  <p><b>ID:</b> {selectedDevice.id}</p>
                  <p><b>Location:</b> {selectedDevice.location}</p>
                  <p><b>Organization:</b> {selectedDevice.organization}</p>
                  <p>
                    <b>Status:</b>{" "}
                    <span
                      className={
                        selectedDevice.status === "active"
                          ? "text-green-600 font-medium"
                          : "text-red-600 font-medium"
                      }
                    >
                      {selectedDevice.status}
                    </span>
                  </p>
                  <p><b>Last Seen:</b> {selectedDevice.lastSeen}</p>
                </div>

                {/* ✅ Activate button (only if inactive) */}
                {selectedDevice.status === "inactive" && (
                  <div className="mt-6 mx-4">
                    <Button
                      className="w-full bg-primary"
                      onClick={handleActivate}
                    >
                      Activate Device
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          )}


          {action === "rename" && (
            <Dialog open onOpenChange={closeAction}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rename Device</DialogTitle>
                </DialogHeader>

                <Input
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                />

                <DialogFooter>
                  <Button
                    className="bg-primary"
                    onClick={handleRename}
                    disabled={!renameValue.trim()}
                  >
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {action === "assign" && (
            <Dialog open onOpenChange={closeAction}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Organization</DialogTitle>
                </DialogHeader>

                <Select value={assignValue} onValueChange={setAssignValue}>
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
                  <Button
                    className="bg-primary"
                    onClick={handleAssign}
                    disabled={!assignValue}
                  >
                    Assign
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {action === "suspend" && (
            <Dialog open onOpenChange={closeAction}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Suspend Device</DialogTitle>
                </DialogHeader>

                <p className="text-sm text-muted-foreground">
                  Are you sure you want to suspend this device?
                </p>

                <DialogFooter>
                  <Button variant="outline" onClick={closeAction}>
                    Cancel
                  </Button>
                  <Button onClick={handleSuspend}>
                    Confirm
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {action === "delete" && (
            <Dialog open onOpenChange={closeAction}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Device</DialogTitle>
                </DialogHeader>

                <p className="text-sm text-muted-foreground">
                  This action cannot be undone.
                </p>

                <DialogFooter>
                  <Button variant="outline" onClick={closeAction}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}
    </>
  );
};

export default DevicePageNew;
