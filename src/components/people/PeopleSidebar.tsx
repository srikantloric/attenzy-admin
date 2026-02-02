import { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription
} from "@/components/ui/sheet";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { PEOPLE_FORM_CONFIG } from "@/data/people-form-config";
import type { PeopleType } from "@/types/people";

import { db } from "@/contexts/FirebaseContext";
import {
    addDoc,
    collection,
    serverTimestamp,
    query,
    where,
    getDocs,
    updateDoc,
    doc
} from "firebase/firestore";

import { generatePeopleId } from "@/lib/generatePeopleId";
import { toast } from "sonner";

interface PeopleSidebarProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: PeopleType;
}

export const PeopleSidebar = ({
    open,
    onOpenChange,
    type
}: PeopleSidebarProps) => {
    const fields = PEOPLE_FORM_CONFIG[type];

    // 🔹 form state
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const [isUpdateMode, setIsUpdateMode] = useState(false);
    const [existingDocId, setExistingDocId] = useState<string | null>(null);

    const [rfidConflict, setRfidConflict] = useState(false);

    const handleChange = async (name: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        if (name === "rfidCode" && value.length >= 6) {
            await checkRFIDExists(value);
        }
    };

    const checkRFIDExists = async (rfidCode: string) => {
        if (!rfidCode) return;

        const collectionsToCheck = ["students", "faculty", "staff"];
        const currentCollection =
            type === "student"
                ? "students"
                : type === "faculty"
                    ? "faculty"
                    : "staff";

        for (const col of collectionsToCheck) {
            const q = query(
                collection(db, col),
                where("rfidCode", "==", rfidCode)
            );

            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const docSnap = snapshot.docs[0];

                // 🚫 RFID belongs to another role
                if (col !== currentCollection) {
                    toast.error("RFID already assigned", {
                        description: `This RFID is already assigned to a ${col.slice(0, -1)}.`
                    });

                    // keep only RFID, reset rest
                    setFormData({ rfidCode });
                    setIsUpdateMode(false);
                    setExistingDocId(null);
                    setRfidConflict(true);
                    return;
                }

                // ✅ RFID belongs to same collection → UPDATE MODE
                setFormData(docSnap.data() as Record<string, string>);
                setExistingDocId(docSnap.id);
                setIsUpdateMode(true);
                setRfidConflict(false);

                toast.info("Existing record found", {
                    description: "You can update this record."
                });

                return;
            }
        }

        // 🆕 RFID not found anywhere → ADD MODE
        setIsUpdateMode(false);
        setExistingDocId(null);
        setRfidConflict(false);
    };


    const handleSubmit = async () => {
        try {
            setLoading(true);

            const collectionName =
                type === "student"
                    ? "students"
                    : type === "faculty"
                        ? "faculty"
                        : "staff";

            if (isUpdateMode && existingDocId) {
                // 🔁 UPDATE
                await updateDoc(
                    doc(db, collectionName, existingDocId),
                    {
                        ...formData,
                        updatedAt: serverTimestamp()
                    }
                );

                toast.success("Updated successfully", {
                    description: `${type} details updated`
                });
            } else {
                // ➕ ADD
                const numericId = await generatePeopleId(type);

                await addDoc(collection(db, collectionName), {
                    ...formData,
                    id: numericId,
                    createdAt: serverTimestamp()
                });

                toast.success("Added successfully", {
                    description: `${type} created with ID ${numericId}`
                });
            }

            setFormData({});
            setIsUpdateMode(false);
            setExistingDocId(null);
            onOpenChange(false);
        } catch (error) {
            console.error(error);

            toast.error("Operation failed", {
                description: "Something went wrong."
            });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({});
        setIsUpdateMode(false);
        setExistingDocId(null);
        setRfidConflict(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-lg px-6 py-6"
            >
                {/* Header */}
                <SheetHeader className="-ml-4">
                    <SheetTitle>
                        Add {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SheetTitle>

                    <SheetDescription>
                        Enter details to create a new {type}.
                    </SheetDescription>
                </SheetHeader>


                {/* Form */}
                <div className="space-y-5">
                    {fields.map((field) => (
                        <div key={field.name} className="space-y-2">
                            <label className="text-sm font-medium">
                                {field.label}
                            </label>
                            <Input
                                value={formData[field.name] || ""}
                                onChange={(e) =>
                                    handleChange(field.name, e.target.value)
                                }
                                disabled={isUpdateMode && field.name === "rfidCode"}
                                className={
                                    isUpdateMode && field.name === "rfidCode"
                                        ? "cursor-not-allowed opacity-70"
                                        : ""
                                }
                            />

                        </div>
                    ))}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6">

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
                            className="bg-primary"
                            onClick={handleSubmit}
                            disabled={
                                loading ||
                                (!isUpdateMode && rfidConflict) ||
                                (!formData.rfidCode)
                            }
                        >
                            {loading
                                ? "Saving..."
                                : isUpdateMode
                                    ? "Update"
                                    : "Add"}
                        </Button>

                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};
