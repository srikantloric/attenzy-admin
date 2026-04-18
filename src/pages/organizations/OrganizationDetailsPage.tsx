import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Camera, CopyIcon } from "lucide-react";

import { toast } from "sonner";
import ConfirmDialog from "@/components/common/ConfirmDialog";

import type { OrganizationApi } from "@/types/organization";
import useAuth from "@/hooks/useAuth";
import { AppBreadcrumb } from "@/components/AppBreadCrumb";
import {
  getOrganizationById,
  getOrganizationsByPartner,
} from "@/api/organization";

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

function OrganizationDetailsPage() {
  const { organizationId } = useParams<{ organizationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canAddOrganization = user?.role !== "PLATFORM_ADMIN";
  const partnerId = user?.partnerId;
  const isPlatformAdmin = user?.role === "PLATFORM_ADMIN";
  const isChannelPartner = user?.role === "CHANNEL_PARTNER";
  const isAllowedRole = isPlatformAdmin || isChannelPartner;

  const [organization, setOrganization] = useState<OrganizationApi | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  /* Editable fields */
  const [orgName, setOrgName] = useState("");
  const [orgPhone, setOrgPhone] = useState("");
  const [orgAddress, setOrgAddress] = useState("");
  const [orgPassword, setOrgPassword] = useState("");

  const [openConfirm, setOpenConfirm] = useState(false);

  const isDirty =
    orgName !== organization?.orgName ||
    orgPhone !== organization?.orgPhone ||
    orgAddress !== organization?.orgAddress;

  useEffect(() => {
    if (!isAllowedRole || !organizationId) return;
    if (isChannelPartner && !partnerId) return;

    const fetchOrganization = async () => {
      try {
        let found: OrganizationApi | null = null;

        if (isPlatformAdmin) {
          // Platform Admin: fetch directly by organization ID
          const res = await getOrganizationById(organizationId);
          found = res.item;
        } else if (isChannelPartner && partnerId) {
          // Channel Partner: fetch partner-scoped organizations
          const res = await getOrganizationsByPartner(partnerId);
          found =
            res.items.find(
              (o: OrganizationApi) => o.orgId === organizationId,
            ) || null;
        }

        if (!found) {
          setOrganization(null);
          return;
        }

        setOrganization(found);
        setOrgName(found.orgName);
        setOrgPhone(found.orgPhone);
        setOrgAddress(found.orgAddress || "");
        setOrgPassword(found.password || "");
      } catch (err) {
        console.error("Failed to fetch organization", err);
        setOrganization(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [isPlatformAdmin, isChannelPartner, partnerId, organizationId]);

  if (!isAllowedRole) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        You are not authorized to view this page.
      </div>
    );
  }

  if (isChannelPartner && !partnerId) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Partner information not available. Please login again.
      </div>
    );
  }

  if (loading) return <div className="p-6">Loading organization...</div>;

  if (!organization) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Organization not found
      </div>
    );
  }

  const handleSave = async () => {
    if (!organization) return;

    try {
      await axios.put(`${BASE_URL}/organizations`, {
        orgId: organization.orgId,
        orgName,
        orgPhone,
        orgAddress,
      });

      setOrganization((prev) =>
        prev
          ? {
              ...prev,
              orgName,
              orgPhone,
              orgAddress,
            }
          : prev,
      );

      toast.success("Organization updated successfully");
    } catch (err) {
      toast.error("Failed to update organization details");
    }
  };

  const handleToggleStatus = async () => {
    if (!organization) return;

    const newStatus = organization.status === "Active" ? "Inactive" : "Active";

    setOrganization((prev) => (prev ? { ...prev, status: newStatus } : prev));

    try {
      await axios.put(`${BASE_URL}/organizations`, {
        orgId: organization.orgId,
        status: newStatus,
      });

      toast.success(
        newStatus === "Active"
          ? "Organization activated successfully"
          : "Organization suspended successfully",
      );
    } catch (err) {
      toast.error("Failed to update organization status");

      // rollback
      setOrganization((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus === "Active" ? "Inactive" : "Active",
            }
          : prev,
      );
    }
  };

  const handleCopyCredentials = async () => {
    const credentialMessage = [
      `Partner ID: ${organization.partnerId || partnerId || "N/A"}`,
      `Organization Name: ${organization.orgName || orgName || "N/A"}`,
      `Password: ${orgPassword || "Not Set"}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(credentialMessage);
      toast.success("Credentials copied to clipboard");
    } catch {
      toast.error("Failed to copy credentials");
    }
  };

  return (
    <div className="space-y-6 mt-6">
      <AppBreadcrumb />
      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT */}
        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-muted text-primary text-3xl font-semibold">
                  {orgName
                    .split(" ")
                    .slice(0, 2)
                    .map((w) => w[0]?.toUpperCase())
                    .join("")}
                </AvatarFallback>
              </Avatar>

              {canAddOrganization && (
                <Button size="sm" className="gap-2 bg-primary">
                  <Camera className="h-4 w-4" />
                  Upload Photo
                </Button>
              )}
            </div>

            <Separator />

            <Tabs defaultValue="account">
              <TabsList className="grid grid-cols-2 mb-2">
                <TabsTrigger value="account">Account Info</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              <TabsContent value="account" className="space-y-4">
                <div>
                  <Label>Organization Name</Label>
                  <Input
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input value={organization.orgEmail} disabled />
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input
                    value={orgPhone}
                    onChange={(e) => setOrgPhone(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Address</Label>
                  <Input
                    value={orgAddress}
                    onChange={(e) => setOrgAddress(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Status</Label>
                  <Input value={organization.status} disabled />
                </div>
              </TabsContent>

              <TabsContent value="security">
                <div className="space-y-4">
                  <div>
                    <Label>Password</Label>
                    <div className="flex items-center justify-between border p-2 mt-2 rounded-md">
                      <h3>{orgPassword || "Not Set"}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopyCredentials}
                        aria-label="Copy organization credentials"
                      >
                        <CopyIcon />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* RIGHT */}
        <Card className="lg:col-span-2 py-14">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Devices</p>
                <p className="text-2xl font-semibold">
                  {organization.deviceCount}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between">
              <div className="space-y-2">
                <Button
                  variant="destructive"
                  onClick={() => setOpenConfirm(true)}
                >
                  {organization.status === "Active"
                    ? "Suspend Organization"
                    : "Activate Organization"}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate("/organizations")}
                >
                  Cancel
                </Button>

                <Button
                  className="bg-primary"
                  onClick={handleSave}
                  disabled={!isDirty}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={openConfirm}
        title={
          organization.status === "Active"
            ? "Suspend Organization?"
            : "Activate Organization?"
        }
        description="This action will update organization access."
        confirmText="Yes, Continue"
        variant={organization.status === "Active" ? "destructive" : "default"}
        onCancel={() => setOpenConfirm(false)}
        onConfirm={() => {
          handleToggleStatus();
          setOpenConfirm(false);
        }}
      />
    </div>
  );
}

export default OrganizationDetailsPage;
