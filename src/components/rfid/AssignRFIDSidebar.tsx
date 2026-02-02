import { useEffect, useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription
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

import { db } from "@/contexts/FirebaseContext";
import {
    collection,
    getDocs,
    updateDoc,
    doc,
    Timestamp
} from "firebase/firestore";

import { toast } from "sonner";

type AssignType = "student" | "faculty" | "staff";

interface PersonOption {
    docId: string;   // Firestore document id
    name: string;
}

interface AssignRFIDSidebarProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const AssignRFIDSidebar = ({
    open,
    onOpenChange
}: AssignRFIDSidebarProps) => {
    const [assignType, setAssignType] = useState<AssignType>("student");
    const [people, setPeople] = useState<PersonOption[]>([]);
    const [selectedPerson, setSelectedPerson] = useState<string>("");

    const [rfidCard, setRfidCard] = useState("");
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [loading, setLoading] = useState(false);

    /* ---------------------------------------------
       Load people based on selected type
    --------------------------------------------- */
    useEffect(() => {
        const fetchPeople = async () => {
            const snapshot = await getDocs(
                collection(db, assignType === "student"
                    ? "students"
                    : assignType === "faculty"
                        ? "faculty"
                        : "staff")
            );

            const data: PersonOption[] = snapshot.docs.map((doc) => ({
                docId: doc.id,
                name: doc.data().name
            }));

            setPeople(data);
            setSelectedPerson("");
        };

        fetchPeople();
    }, [assignType]);

    /* ---------------------------------------------
       Assign RFID
    --------------------------------------------- */
    const handleAssign = async () => {
        if (!selectedPerson || !rfidCard || !date) {
            toast.warning("Missing information", {
                description: "Please fill all required fields."
            });
            return;
        }

        try {
            setLoading(true);

            const collectionName =
                assignType === "student"
                    ? "students"
                    : assignType === "faculty"
                        ? "faculty"
                        : "staff";

            await updateDoc(
                doc(db, collectionName, selectedPerson),
                {
                    rfidCode: rfidCard,
                    rfidAssignedAt: Timestamp.fromDate(date)
                }
            );

            toast.success("RFID Assigned", {
                description: `RFID card assigned successfully.`
            });

            onOpenChange(false);
        } catch (error) {
            console.error(error);

            toast.error("Assignment failed", {
                description: "Something went wrong while assigning RFID."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-lg px-8 py-6"
            >
                <SheetHeader className="-ml-4">
                    <SheetTitle>Assign RFID Card</SheetTitle>
                    <SheetDescription>
                        Assign an RFID card to a student, faculty, or staff
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-5">

                    {/* Assign Type */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Assign RFID To</label>
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
                        <Select
                            value={selectedPerson}
                            onValueChange={setSelectedPerson}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={`Select ${assignType}`} />
                            </SelectTrigger>
                            <SelectContent>
                                {people.map((p) => (
                                    <SelectItem key={p.docId} value={p.docId}>
                                        {p.name}
                                    </SelectItem>
                                ))}
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
                                    "bg-primary text-primary-foreground hover:bg-primary"
                            }}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAssign}
                            disabled={loading}
                        >
                            {loading ? "Assigning..." : "Assign RFID"}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};
