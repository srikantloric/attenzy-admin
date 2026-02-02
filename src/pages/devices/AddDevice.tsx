import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";

interface AddDeviceProps {
  onClose?: () => void;
}

const AddDevice: React.FC<AddDeviceProps> = ({ onClose }) => {
  const [description, setDescription] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div className="mt-2 space-y-6 ">

      {/* Device Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Device Name
        </label>
        <Input placeholder="Science Lab 3" />
      </div>

      {/* Location */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Location
        </label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Science Lab" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="science-lab">Science Lab</SelectItem>
            <SelectItem value="block-a">Block A</SelectItem>
            <SelectItem value="block-b">Block B</SelectItem>
            <SelectItem value="main-gate">Main Gate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* IP Address + Validate */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            IP Address
          </label>
          <Input placeholder="192.168.1.20" />
        </div>

        <Button
          variant="secondary"
          className="h-10 px-6"
        >
          Validate
        </Button>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Description
        </label>
        <Textarea
          placeholder="Device for Science Lab 3 attendance"
          maxLength={150}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[100px]"
        />
        <div className="text-right text-xs text-muted-foreground">
          {description.length} / 150
        </div>
      </div>

      <Separator />

      {/* Advanced Settings */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border px-4 py-3 text-sm font-medium hover:bg-muted transition-colors">
          Advanced Settings
          <span className="flex items-center gap-1 text-muted-foreground">
            (optional)
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                advancedOpen ? "rotate-180" : ""
              }`}
            />
          </span>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-4 space-y-3 px-1 text-sm text-muted-foreground">
          {/* Placeholder */}
          Additional configuration options can be added here.
        </CollapsibleContent>
      </Collapsible>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button className="px-6 bg-primary">
          Add Device
        </Button>
      </div>
    </div>
  );
};

export default AddDevice;
