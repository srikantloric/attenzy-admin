import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { PEOPLE_FORM_CONFIG } from "@/data/people-form-config";
import type { PeopleType } from "@/types/people";

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg px-6 py-8"
      >
        {/* Header */}
        <SheetHeader className="-mx-4">
          <SheetTitle>
            Add {type.charAt(0).toUpperCase() + type.slice(1)}
          </SheetTitle>
        </SheetHeader>

        {/* Form */}
        <div className="space-y-5">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <label className="text-sm font-medium">
                {field.label}
              </label>
              <Input />
            </div>
          ))}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button className="bg-primary">Add</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
