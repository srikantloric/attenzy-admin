import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  ChevronDown,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Pencil,
  Ban,
  CopyIcon,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import AddOrganizationForm from "@/components/organizations/AddOrganizationForm";
import type { OrganizationUI, OrganizationStatus } from "@/types/organization";

import {
  getOrganizationsByPartner,
  listAllOrganizations,
} from "@/api/organization";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useAuth from "@/hooks/useAuth";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import { toast } from "sonner";
import axios from "axios";
import { AppBreadcrumb } from "@/components/AppBreadCrumb";
import DataPagination from "@/components/Pagination";

function OrganizationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAllowedRole =
    user?.role === "PLATFORM_ADMIN" || user?.role === "CHANNEL_PARTNER";
  const isPlatformAdmin = user?.role === "PLATFORM_ADMIN";
  const isChannelPartner = user?.role === "CHANNEL_PARTNER";

  const partnerId = user?.partnerId;

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<"All" | OrganizationStatus>(
    "All",
  );

  const [openAddOrg, setOpenAddOrg] = useState(false);
  const [organizations, setOrganizations] = useState<OrganizationUI[]>([]);
  const [loading, setLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  const [orgToSuspend, setOrgToSuspend] = useState<OrganizationUI | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const canAddOrganization = Boolean(partnerId);

  const fetchOrganizations = useCallback(async () => {
    if (!isPlatformAdmin && !partnerId) return;

    setLoading(true);

    try {
      const res = isPlatformAdmin
        ? await listAllOrganizations()
        : await getOrganizationsByPartner(partnerId as string);

      const mapped: OrganizationUI[] = res.items.map((o) => ({
        id: o.orgId,
        name: o.orgName,
        email: o.orgEmail,
        phone: o.orgPhone,
        address: o.orgAddress,
        partnerId: o.partnerId,
        devices: o.deviceCount,
        status: o.status,
        password: o.password,
        joined: new Date(o.createdAt).toLocaleDateString(),
      }));

      setOrganizations(mapped);
    } catch (error) {
      console.error("Failed to load organizations", error);
    } finally {
      setLoading(false);
    }
  }, [isPlatformAdmin, partnerId]);

  const handleSuspendOrganization = async () => {
    if (!orgToSuspend) return;

    const newStatus = orgToSuspend.status === "Active" ? "Inactive" : "Active";

    try {
      await axios.put(`${BASE_URL}/organizations`, {
        orgId: orgToSuspend.id,
        status: newStatus,
      });

      toast.success(
        newStatus === "Active"
          ? "Organization activated successfully"
          : "Organization suspended successfully",
      );

      fetchOrganizations();
    } catch (err) {
      toast.error("Failed to update organization status");
    } finally {
      setOpenConfirm(false);
      setOrgToSuspend(null);
    }
  };

  const openOrganizationAdmin = (org: OrganizationUI) => {
    navigate(`/organizations/${org.id}`, {
      state: { organization: org },
    });
  };

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  if (!isAllowedRole) {
    return (
      <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
        You are not authorized to view this page.
      </div>
    );
  }

  if (isChannelPartner && !partnerId) {
    return (
      <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
        Partner information not available. Please login again.
      </div>
    );
  }

  const filteredOrganizations = organizations.filter((o) => {
    const matchesSearch = o.name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "All" || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const paginatedOrganizations = filteredOrganizations.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  return (
    <div className="space-y-6 mt-4">
      <AppBreadcrumb />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Organizations</h1>

        {canAddOrganization && (
          <Button
            className="gap-2 bg-primary"
            onClick={() => setOpenAddOrg(true)}
          >
            <Plus className="h-4 w-4" />
            Add Organization
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Total Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{organizations.length}</div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Search & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-6 min-w-0">
        <div className="relative w-full max-w-sm min-w-0">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Organizations..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                {statusFilter === "All" ? "All Statuses" : statusFilter}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter("All")}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Active")}>
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Inactive")}>
                Inactive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="gap-2 bg-primary">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="px-4">
        {loading ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            Loading organizations...
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Org Id</TableHead>
                <TableHead>Organization</TableHead>
                {isPlatformAdmin && <TableHead>Partner Id</TableHead>}
                <TableHead>Devices</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Password</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedOrganizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="w-18">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={org.profileImageUrl} />
                      <AvatarFallback className="bg-muted text-primary text-md font-semibold">
                        {org.name
                          ?.split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((word) => word.charAt(0).toUpperCase())
                          .join("") || "?"}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>

                  <TableCell className="font-medium">{org.id}</TableCell>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      {org.name}
                      {org.address && (
                        <span className="text-xs text-muted-foreground">
                          {org.address}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  {isPlatformAdmin && (
                    <TableCell className="font-medium text-muted-foreground">
                      {org.partnerId}
                    </TableCell>
                  )}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-2 border-secondary text-secondary"
                    >
                      {org.devices}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        org.status === "Active"
                          ? "border-green-600 text-green-600"
                          : "border-red-500 text-red-500"
                      }
                    >
                      {org.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{org.joined}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <p>{org.password && "*******"}</p>
                      <Button
                        variant={"ghost"}
                        onClick={() => {
                          if (!org?.password) {
                            toast.error("No password available to copy");
                            return;
                          }
                          const textToCopy =
                            "OrgId: " +
                            org.id +
                            "\nName: " +
                            org.name +
                            "\nPassword: " +
                            org.password;

                          navigator.clipboard
                            .writeText(textToCopy)
                            .then(() => {
                              toast.success("Password copied to clipboard");
                            })
                            .catch(() => {
                              toast.error("Failed to copy password");
                            });
                        }}
                      >
                        <CopyIcon />
                      </Button>
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => openOrganizationAdmin(org)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => openOrganizationAdmin(org)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => {
                            setOrgToSuspend(org);
                            setOpenConfirm(true);
                          }}
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          {org.status === "Active" ? "Suspend" : "Activate"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Separator />

        <DataPagination
          totalItems={filteredOrganizations.length}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
        />
      </Card>

      {/* Add Organization Dialog */}
      <Dialog open={openAddOrg} onOpenChange={setOpenAddOrg}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Organization</DialogTitle>
            <DialogDescription>
              Enter details to add a new organization.
            </DialogDescription>
          </DialogHeader>

          <AddOrganizationForm
            onSuccess={() => {
              fetchOrganizations();
              setOpenAddOrg(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={openConfirm}
        title={
          orgToSuspend?.status === "Active"
            ? "Suspend Organization?"
            : "Activate Organization?"
        }
        description={
          orgToSuspend?.status === "Active"
            ? "This organization will lose access until reactivated."
            : "This organization will regain access to the platform."
        }
        confirmText="Yes, Continue"
        variant={orgToSuspend?.status === "Active" ? "destructive" : "default"}
        onCancel={() => {
          setOpenConfirm(false);
          setOrgToSuspend(null);
        }}
        onConfirm={handleSuspendOrganization}
      />
    </div>
  );
}

export default OrganizationsPage;
