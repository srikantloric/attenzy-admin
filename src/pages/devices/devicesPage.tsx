import { useMemo, useState } from "react";

import { devicesData } from "@/data/devices";
import type { Device, DeviceStatus } from "@/data/devices";

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
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { Search, Plus } from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";

import AddDevice from "./addDevice";

const DevicesPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<DeviceStatus | "all">("all");
  const [addOpen, setAddOpen] = useState(false);

  const filteredDevices = useMemo<Device[]>(() => {
    return devicesData.filter((device) => {
      const matchesSearch = device.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" ? true : device.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  const countByStatus = (status: DeviceStatus) =>
    devicesData.filter((d) => d.status === status).length;

  return (
    <>
      {/* ================= Devices List ================= */}
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              Devices
            </h1>
            <span className="rounded-md bg-muted px-2 py-0.5 text-sm text-muted-foreground">
              {devicesData.length}
            </span>
          </div>

          <Button className="gap-2 bg-primary" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Device
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          Active:
          <span className="ml-1 font-medium text-foreground">
            {countByStatus("active")}
          </span>
          <span className="ml-3">
            Inactive:
            <span className="ml-1 font-medium text-foreground">
              {countByStatus("inactive")}
            </span>
          </span>
        </div>

        <Separator />

        {/* Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={filter === "active" ? "default" : "outline"}
              onClick={() => setFilter("active")}
            >
              Active
            </Button>
            <Button
              size="sm"
              variant={filter === "inactive" ? "default" : "outline"}
              onClick={() => setFilter("inactive")}
            >
              Inactive
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="w-64 pl-8"
              placeholder="Search devices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">
                    Last Seen
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredDevices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-medium">
                      {device.name}
                    </TableCell>

                    <TableCell>{device.location}</TableCell>

                    <TableCell className="font-mono text-sm">
                      {device.ip}
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={
                          device.status === "active"
                            ? "bg-primary "
                            : "bg-destructive"
                        }
                      >
                        {device.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right text-muted-foreground">
                      {device.lastSeen}
                    </TableCell>
                  </TableRow>
                ))}

              </TableBody>
            </Table>
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

      {/* ================= Right Sidebar ================= */}
      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md px-6 py-4">
          <SheetHeader className="-mx-4">
            <SheetTitle>Add Device</SheetTitle>
          </SheetHeader>

          {/* ONLY the form is rendered */}
          <AddDevice onClose={() => setAddOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
};

export default DevicesPage;
