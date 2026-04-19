import { useEffect, useMemo, useState } from "react";
import { Edit3, Plus } from "lucide-react";
import { toast } from "sonner";

import useAuth from "@/hooks/useAuth";
import { listPayrollPaymentDetails } from "@/api/payrollManagement";
import type {
  PayrollPaymentDetailsRecord,
  PayrollPaymentMode,
  PayrollRecipientType,
} from "@/types/payroll-management";

import PaymentDetailsDialog from "../../components/payroll/PaymentDetailsDialog";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppBreadcrumb } from "@/components/AppBreadCrumb";

function maskAccountNumber(accountNumber?: string): string {
  if (!accountNumber) return "-";
  return `XXXXXX${accountNumber.slice(-4)}`;
}

const paymentModeOptions: Array<{
  value: PayrollPaymentMode;
  label: string;
}> = [
  { value: "BANK", label: "Bank" },
  { value: "UPI", label: "UPI" },
  { value: "BANK_AND_UPI", label: "Bank + UPI" },
];

function paymentModeLabel(mode: PayrollPaymentMode): string {
  return paymentModeOptions.find((item) => item.value === mode)?.label ?? mode;
}

export default function PaymentDetails() {
  const { user } = useAuth();
  const orgId = user?.orgId ?? "";

  const [records, setRecords] = useState<PayrollPaymentDetailsRecord[]>([]);
  const [search, setSearch] = useState("");
  const [filterUserType, setFilterUserType] = useState<
    "ALL" | PayrollRecipientType
  >("ALL");
  const [filterPaymentMode, setFilterPaymentMode] = useState<
    "ALL" | PayrollPaymentMode
  >("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] =
    useState<PayrollPaymentDetailsRecord | null>(null);

  const loadData = async () => {
    if (!orgId) return;

    const recordsData = await listPayrollPaymentDetails(orgId);
    setRecords(recordsData);
  };

  useEffect(() => {
    loadData().catch((error) => {
      console.error(error);
      toast.error("Failed to load payment details");
    });
  }, [orgId]);

  const filteredRecords = useMemo(() => {
    const query = search.toLowerCase().trim();

    return records.filter((record) => {
      const userTypeMatch =
        filterUserType === "ALL" || record.userType === filterUserType;
      const modeMatch =
        filterPaymentMode === "ALL" || record.paymentMode === filterPaymentMode;
      const searchMatch =
        query.length === 0 ||
        record.userName.toLowerCase().includes(query) ||
        record.department.toLowerCase().includes(query) ||
        record.userId.toLowerCase().includes(query);

      return userTypeMatch && modeMatch && searchMatch;
    });
  }, [filterPaymentMode, filterUserType, records, search]);

  const openCreateDialog = () => {
    setEditingRecord(null);
    setDialogOpen(true);
  };

  const openEditDialog = (record: PayrollPaymentDetailsRecord) => {
    setEditingRecord(record);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingRecord(null);
  };

  return (
    <div className="space-y-6 py-6">
      <AppBreadcrumb />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Payment Details
          </h1>
          <p className="text-sm text-muted-foreground">
            Store bank account or UPI details for faculty and staff payroll
            payouts.
          </p>
        </div>

        <Button onClick={openCreateDialog} className="gap-2 self-start">
          <Plus className="h-4 w-4" />
          Add Payment Details
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saved Payment Details</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 rounded-b-xl bg-linear-to-r from-muted/40 via-background to-muted/20 md:flex-row md:items-center">
          <Input
            placeholder="Search by name, department, or employee id"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full md:max-w-sm"
          />

          <Select
            value={filterUserType}
            onValueChange={(value) =>
              setFilterUserType(value as "ALL" | PayrollRecipientType)
            }
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Employee Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="STAFF">Staff</SelectItem>
              <SelectItem value="FACULTY">Faculty</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterPaymentMode}
            onValueChange={(value) =>
              setFilterPaymentMode(value as "ALL" | PayrollPaymentMode)
            }
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Payment Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Modes</SelectItem>
              {paymentModeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>

        <CardContent className="overflow-auto p-0">
          <table className="w-full min-w-275 text-sm">
            <thead className="bg-muted/60">
              <tr>
                <th className="p-3 text-left">Employee</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Department</th>
                <th className="p-3 text-left">Mode</th>
                <th className="p-3 text-left">Account</th>
                <th className="p-3 text-left">IFSC</th>
                <th className="p-3 text-left">UPI</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id} className="border-t">
                  <td className="p-3 font-medium">
                    <div>
                      <p>{record.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {record.userId}
                      </p>
                    </div>
                  </td>
                  <td className="p-3">{record.userType}</td>
                  <td className="p-3">{record.department}</td>
                  <td className="p-3">
                    <Badge variant="secondary">
                      {paymentModeLabel(record.paymentMode)}
                    </Badge>
                  </td>
                  <td className="p-3">
                    {maskAccountNumber(record.bankDetails?.accountNumber)}
                  </td>
                  <td className="p-3">{record.bankDetails?.ifscCode ?? "-"}</td>
                  <td className="p-3">{record.upiDetails?.upiId ?? "-"}</td>
                  <td className="p-3">
                    <Badge variant={record.isActive ? "default" : "secondary"}>
                      {record.isActive ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(record)}
                      className="gap-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="p-6 text-center text-muted-foreground"
                  >
                    No payment details found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <PaymentDetailsDialog
        open={dialogOpen}
        onOpenChange={(nextOpen) =>
          nextOpen ? setDialogOpen(true) : closeDialog()
        }
        orgId={orgId}
        record={editingRecord}
        onSaved={loadData}
      />
    </div>
  );
}
