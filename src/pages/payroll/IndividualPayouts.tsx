import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useLocation } from "react-router-dom";

import useAuth from "@/hooks/useAuth";
import {
  listIndividualPayouts,
  getIndividualPayoutStats,
  deleteIndividualPayout,
  createIndividualPayout,
  listPayrollDues,
  listPayrollPayees,
  listPayrollPaymentDetails,
} from "@/api/payrollManagement";
import type {
  IndividualPayout,
  PayrollDue,
  PayrollPayeeOption,
  PayrollPaymentDetailsRecord,
} from "@/types/payroll-management";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function money(value: number): string {
  return `INR ${value.toLocaleString("en-IN")}`;
}

function statusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "PAID") return "default";
  if (status === "PROCESSING") return "secondary";
  if (status === "FAILED") return "destructive";
  return "outline";
}

function CreatePayoutDialog({
  isOpen,
  onOpenChange,
  onSuccess,
  payees,
  paymentDetails,
  currentMonth,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  payees: PayrollPayeeOption[];
  paymentDetails: PayrollPaymentDetailsRecord[];
  currentMonth: string;
}) {
  const { user } = useAuth();
  const orgId = user?.orgId ?? "";
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    month: currentMonth,
    grossAmount: "0",
    deductionAmount: "0",
  });

  const selectedPayee = useMemo(() => {
    return payees.find((p) => p.userId === formData.userId);
  }, [formData.userId, payees]);

  const selectedPaymentDetails = useMemo(() => {
    return paymentDetails.find((p) => p.userId === formData.userId);
  }, [formData.userId, paymentDetails]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: string[] = [];
    if (!formData.userId) errors.push("Employee is required");
    if (!formData.month || formData.month.length < 7)
      errors.push("Month is required");
    if (Number(formData.grossAmount) <= 0)
      errors.push("Gross amount must be positive");
    if (Number(formData.deductionAmount) < 0)
      errors.push("Deduction must be non-negative");

    if (!selectedPaymentDetails?.isActive) {
      errors.push(
        "Selected employee does not have active payment details configured.",
      );
    }

    if (!selectedPayee) {
      errors.push("Selected employee not found");
    }

    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    setIsLoading(true);
    try {
      const grossAmount = Number(formData.grossAmount);
      const deductionAmount = Number(formData.deductionAmount);

      await createIndividualPayout(orgId, {
        userId: formData.userId,
        userName: selectedPayee!.userName,
        userType: selectedPayee!.userType,
        department: selectedPayee!.department,
        month: formData.month,
        grossAmount: grossAmount,
        deductionAmount: deductionAmount,
        netAmount: grossAmount - deductionAmount,
        paymentMode: selectedPaymentDetails!.paymentMode,
      });

      setFormData({
        userId: "",
        month: currentMonth,
        grossAmount: "0",
        deductionAmount: "0",
      });
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      alert(
        `Error creating payout: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const grossAmount = Number(formData.grossAmount) || 0;
  const deductionAmount = Number(formData.deductionAmount) || 0;
  const netAmount = grossAmount - deductionAmount;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Individual Payout</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Employee</Label>
            <Select
              value={formData.userId}
              onValueChange={(value) =>
                setFormData({ ...formData, userId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {payees
                  .filter((p) =>
                    paymentDetails.some(
                      (pd) => pd.userId === p.userId && pd.isActive,
                    ),
                  )
                  .map((payee) => (
                    <SelectItem key={payee.userId} value={payee.userId}>
                      {payee.userName} ({payee.userType})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPayee && (
            <div className="space-y-2 p-3 bg-muted rounded-lg text-sm">
              <p>
                <span className="font-medium">Department:</span>{" "}
                {selectedPayee.department}
              </p>
              {selectedPaymentDetails && (
                <p>
                  <span className="font-medium">Mode:</span>{" "}
                  {selectedPaymentDetails.paymentMode}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Month</Label>
            <Input
              type="month"
              value={formData.month}
              onChange={(e) =>
                setFormData({ ...formData, month: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Gross Amount (INR)</Label>
            <Input
              type="number"
              placeholder="0"
              step="0.01"
              value={formData.grossAmount}
              onChange={(e) =>
                setFormData({ ...formData, grossAmount: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Deduction Amount (INR)</Label>
            <Input
              type="number"
              placeholder="0"
              step="0.01"
              value={formData.deductionAmount}
              onChange={(e) =>
                setFormData({ ...formData, deductionAmount: e.target.value })
              }
            />
          </div>

          {grossAmount > 0 && deductionAmount >= 0 && (
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm font-medium">
                Net Amount: INR {netAmount.toLocaleString("en-IN")}
              </p>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Payout
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeletePayoutDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  payoutId,
  employeeName,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: string) => Promise<void>;
  payoutId: string;
  employeeName: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm(payoutId);
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogTitle>Delete Payout</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete the payout for{" "}
          <strong>{employeeName}</strong>? This action can only be performed on
          pending payouts.
        </AlertDialogDescription>
        <div className="flex gap-2 justify-end">
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function IndividualPayouts() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const orgId = user?.orgId ?? "";

  const [payouts, setPayouts] = useState<IndividualPayout[]>([]);
  const [dues, setDues] = useState<PayrollDue[]>([]);
  const [payees, setPayees] = useState<PayrollPayeeOption[]>([]);
  const [paymentDetails, setPaymentDetails] = useState<
    PayrollPaymentDetailsRecord[]
  >([]);
  const [activeTab, setActiveTab] = useState<"payouts" | "dues">("payouts");
  const [stats, setStats] = useState({
    totalPayouts: 0,
    totalAmount: 0,
    pendingCount: 0,
    processingCount: 0,
    paidCount: 0,
    failedCount: 0,
  });

  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM"),
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialogState, setDeleteDialogState] = useState<{
    isOpen: boolean;
    payoutId: string;
    employeeName: string;
  }>({ isOpen: false, payoutId: "", employeeName: "" });

  useEffect(() => {
    setActiveTab(pathname.endsWith("/dues") ? "dues" : "payouts");
  }, [pathname]);

  useEffect(() => {
    if (!orgId) return;

    const load = async () => {
      try {
        const [
          payoutsData,
          duesData,
          payeesData,
          paymentDetailsData,
          statsData,
        ] = await Promise.all([
          listIndividualPayouts(orgId, { month: selectedMonth }),
          listPayrollDues(orgId),
          listPayrollPayees(orgId),
          listPayrollPaymentDetails(orgId),
          getIndividualPayoutStats(orgId, selectedMonth),
        ]);

        setPayouts(payoutsData);
        setDues(duesData);
        setPayees(payeesData);
        setPaymentDetails(paymentDetailsData);
        setStats(statsData);
      } catch (error) {
        console.error("Error loading payouts:", error);
      }
    };

    load();
  }, [orgId, selectedMonth]);

  const monthOptions = useMemo(() => {
    const allMonths = payouts.map((item) => item.month);
    const uniqueMonths = Array.from(new Set(allMonths));
    return uniqueMonths.sort().reverse();
  }, [payouts]);

  const handleRefresh = () => {
    if (!orgId) return;
    Promise.all([
      listIndividualPayouts(orgId, { month: selectedMonth }),
      listPayrollDues(orgId),
      getIndividualPayoutStats(orgId, selectedMonth),
    ])
      .then(([payoutsData, duesData, statsData]) => {
        setPayouts(payoutsData);
        setDues(duesData);
        setStats(statsData);
      })
      .catch((error) => console.error("Error refreshing:", error));
  };

  const outstandingDues = useMemo(
    () => dues.filter((item) => item.status !== "CLOSED"),
    [dues],
  );

  const totalOutstanding = useMemo(
    () => outstandingDues.reduce((sum, item) => sum + item.amount, 0),
    [outstandingDues],
  );

  const handleDeletePayout = async (payoutId: string) => {
    if (!orgId) return;
    try {
      await deleteIndividualPayout(orgId, payoutId);
      handleRefresh();
    } catch (error) {
      alert(
        `Error deleting payout: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Payouts and Dues
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage individual payouts and track outstanding dues in one place.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "payouts" | "dues")}
      >
        <TabsList>
          <TabsTrigger value="payouts">Individual Payouts</TabsTrigger>
          <TabsTrigger value="dues">Dues</TabsTrigger>
        </TabsList>

        <TabsContent value="payouts" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">Total Payouts</p>
                <p className="text-2xl font-semibold">{stats.totalPayouts}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-semibold">
                  {money(stats.totalAmount)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-2xl font-semibold text-yellow-600">
                  {stats.pendingCount}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">Paid</p>
                <p className="text-2xl font-semibold text-green-600">
                  {stats.paidCount}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Payout Records</CardTitle>
              </div>
              <div className="flex gap-2">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <CreatePayoutDialog
                  isOpen={isCreateDialogOpen}
                  onOpenChange={setIsCreateDialogOpen}
                  onSuccess={handleRefresh}
                  payees={payees}
                  paymentDetails={paymentDetails}
                  currentMonth={selectedMonth}
                />
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New Payout
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0 overflow-auto">
              <table className="w-full min-w-500 text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="p-3 text-left">Employee</th>
                    <th className="p-3 text-left">Department</th>
                    <th className="p-3 text-left">Mode</th>
                    <th className="p-3 text-right">Gross</th>
                    <th className="p-3 text-right">Deduction</th>
                    <th className="p-3 text-right">Net</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="border-t hover:bg-muted/50">
                      <td className="p-3 font-medium">{payout.userName}</td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {payout.department}
                      </td>
                      <td className="p-3 text-sm">{payout.paymentMode}</td>
                      <td className="p-3 text-right">
                        {money(payout.grossAmount)}
                      </td>
                      <td className="p-3 text-right text-red-600">
                        {money(payout.deductionAmount)}
                      </td>
                      <td className="p-3 text-right text-green-700 font-medium">
                        {money(payout.netAmount)}
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={statusVariant(payout.status)}>
                          {payout.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        {payout.status === "PENDING" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setDeleteDialogState({
                                isOpen: true,
                                payoutId: payout.id,
                                employeeName: payout.userName,
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {payouts.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="p-4 text-center text-muted-foreground"
                      >
                        No payouts for {selectedMonth}. Create one to get
                        started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dues" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Outstanding: {money(totalOutstanding)}</CardTitle>
            </CardHeader>

            <CardContent className="p-0 overflow-auto">
              <table className="w-full min-w-220 text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="p-3 text-left">Employee</th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Month</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3 text-left">Reason</th>
                    <th className="p-3 text-left">Due Date</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dues.map((due) => (
                    <tr key={due.id} className="border-t">
                      <td className="p-3 font-medium">{due.employeeName}</td>
                      <td className="p-3">{due.userType}</td>
                      <td className="p-3">{due.month}</td>
                      <td className="p-3 text-right">{money(due.amount)}</td>
                      <td className="p-3">{due.reason}</td>
                      <td className="p-3">{due.dueDate}</td>
                      <td className="p-3 text-center">
                        <Badge
                          variant={
                            due.status === "CLOSED" ? "default" : "secondary"
                          }
                        >
                          {due.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {dues.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-4 text-center text-muted-foreground"
                      >
                        No dues available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DeletePayoutDialog
        isOpen={deleteDialogState.isOpen}
        onOpenChange={(open) =>
          setDeleteDialogState((prev) => ({ ...prev, isOpen: open }))
        }
        onConfirm={handleDeletePayout}
        payoutId={deleteDialogState.payoutId}
        employeeName={deleteDialogState.employeeName}
      />
    </div>
  );
}
