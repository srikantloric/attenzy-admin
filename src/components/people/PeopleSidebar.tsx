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
    serverTimestamp
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

    const handleChange = (name: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
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

            const numericId = await generatePeopleId(type);

            await addDoc(collection(db, collectionName), {
                ...formData,
                id: numericId,
                createdAt: serverTimestamp()
            });

            toast.success("Added successfully", {
                description: `${type.charAt(0).toUpperCase() + type.slice(1)} created with ID ${numericId}`
            });

            setFormData({});
            onOpenChange(false);
        } catch (error) {
            console.error("Error adding document:", error);

            toast.error("Failed to add", {
                description: "Something went wrong while saving data."
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
                            />
                        </div>
                    ))}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading ? "Saving..." : "Add"}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};
