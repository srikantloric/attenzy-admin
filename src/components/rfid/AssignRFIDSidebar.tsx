import { useEffect, useMemo, useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxList,
    ComboboxItem,
} from "@/components/ui/combobox";

import { toast } from "sonner";

import type { User, UserType } from "@/types/users";
import {
    getUsersByOrg,
    assignOrUpdateRFID,
} from "@/api/users";

interface AssignRFIDSidebarProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orgId: string;
}

export const AssignRFIDSidebar = ({
    open,
    onOpenChange,
    orgId,
}: AssignRFIDSidebarProps) => {
    const [assignType, setAssignType] =
        useState<UserType>("STUDENT");

    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] =
        useState<string>("");

    const [rfidCard, setRfidCard] = useState("");

    const [loading, setLoading] = useState(false);


    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getUsersByOrg(orgId);
                setUsers(data);
            } catch (error) {
                toast.error("Failed to load users");
            }
        };

        if (open) fetchUsers();
    }, [open, orgId]);


    const filteredUsers = useMemo(() => {
        return users.filter(
            (user) => user.userType === assignType
        );
    }, [users, assignType]);



    const selectedUser = filteredUsers.find(
        (u) => u.userId === selectedUserId
    );


    const handleAssign = async () => {
        if (!selectedUserId || !rfidCard) {
            toast.warning("Missing information", {
                description: "Please select user and enter RFID.",
            });
            return;
        }

        try {
            setLoading(true);

            const res = await assignOrUpdateRFID(
                orgId,
                selectedUserId,
                rfidCard
            );

            toast.success(res.message);

            onOpenChange(false);
            resetForm();
        } catch (error: any) {
            toast.error(
                error.message || "RFID assignment failed"
            );
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setAssignType("STUDENT");
        setSelectedUserId("");
        setRfidCard("");
    };

    return (
        <Sheet
            modal={false}
            open={open}
            onOpenChange={onOpenChange}
        >
            <SheetContent
                side="right"
                className="w-full sm:max-w-lg px-8 py-6"
            >
                <SheetHeader className="-ml-4">
                    <SheetTitle>Assign RFID Card</SheetTitle>
                    <SheetDescription>
                        Assign RFID to a student, faculty, or staff
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 mt-6">
                    {/* Assign Type */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Assign RFID To
                        </label>
                        <Select
                            value={assignType}
                            onValueChange={(v) =>
                                setAssignType(v as UserType)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="STUDENT">
                                    Student
                                </SelectItem>
                                <SelectItem value="STAFF">
                                    Staff
                                </SelectItem>
                                <SelectItem value="FACULTY">
                                    Faculty
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Combobox User Select */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Select {assignType}
                        </label>

                        <Combobox
                            items={filteredUsers.map(
                                (u) => `${u.name}::${u.userId}`
                            )}
                            value={
                                selectedUserId
                                    ? (() => {
                                        const user = users.find(
                                            (u) => u.userId === selectedUserId
                                        );
                                        return user
                                            ? `${user.name}::${user.userId}`
                                            : "";
                                    })()
                                    : ""
                            }

                            onValueChange={(value) => {
                                if (!value) return;

                                const [, userId] = value.split("::");
                                setSelectedUserId(userId);
                            }}
                        >
                            <ComboboxInput
                                placeholder={`Search ${assignType.toLowerCase()} by name or ID`}
                            />

                            <ComboboxContent className="max-h-60 overflow-y-auto">
                                <ComboboxEmpty>
                                    No users found.
                                </ComboboxEmpty>

                                <ComboboxList>
                                    {(id) => {
                                        const [, userId] = id.split("::");

                                        const user = users.find(
                                            (u) => u.userId === userId
                                        );
                                        if (!user) return null;

                                        return (
                                            <ComboboxItem
                                                key={user.userId}
                                                value={`${user.name}::${user.userId}`}
                                            >
                                                {user.name} ({user.userId})
                                            </ComboboxItem>
                                        );
                                    }}
                                </ComboboxList>

                            </ComboboxContent>
                        </Combobox>

                    </div>

                    {/* RFID Card */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            RFID Card Number
                        </label>
                        <Input
                            placeholder="Scan or enter RFID card number"
                            value={rfidCard}
                            onChange={(e) =>
                                setRfidCard(e.target.value)
                            }
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                resetForm();
                                onOpenChange(false);
                            }}
                            disabled={loading}
                        >
                            Cancel
                        </Button>

                        <Button
                            onClick={handleAssign}
                            disabled={
                                loading ||
                                !selectedUserId ||
                                !rfidCard
                            }
                        >
                            {loading
                                ? "Assigning..."
                                : "Assign RFID"}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};
