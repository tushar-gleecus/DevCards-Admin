"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { CardContent } from "@/types/card-content";

interface EditCardContentDrawerProps {
  cardContent: CardContent | null;
  onClose: () => void;
  onSave: (id: number, data: { status: "Published" | "Inactive" }) => void;
}

export function EditCardContentDrawer({ cardContent, onClose, onSave }: EditCardContentDrawerProps) {
  const [newStatus, setNewStatus] = useState<"Published" | "Inactive" | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setNewStatus(undefined);
  }, [cardContent]);

  const handleSave = async () => {
    if (cardContent && newStatus && typeof cardContent.id === 'number') {
      setIsLoading(true);
      try {
        await onSave(cardContent.id, { status: newStatus });
        onClose();
      } finally {
        setTimeout(() => setIsLoading(false), 500);
      }
    }
  };

  const renderStatusOptions = () => {
    if (!cardContent) return null;

    switch (cardContent.status.toLowerCase()) {
      case "draft":
        return <SelectItem value="Published">Publish</SelectItem>;
      case "published":
        return <SelectItem value="Inactive">Make Inactive</SelectItem>;
      case "inactive":
        return <SelectItem value="Published">Republish</SelectItem>;
      default:
        return null;
    }
  };

  return (
    <Drawer open={!!cardContent} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="p-6">
        <DrawerHeader className="text-left pb-4">
          <DrawerTitle className="text-left">Update Card Status</DrawerTitle>
          <DrawerDescription className="text-left">
            Current status: {cardContent?.status}. Select the new status below.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 pb-0">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 space-y-2">
              <Label htmlFor="status">Action</Label>
              <Select value={newStatus} onValueChange={(value: "Published" | "Inactive") => setNewStatus(value)} disabled={isLoading}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select action..." />
                </SelectTrigger>
                <SelectContent>
                  {renderStatusOptions()}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-3 flex justify-center gap-2 mt-4">
              <Button onClick={handleSave} disabled={!newStatus || isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save changes"}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" onClick={onClose} disabled={isLoading}>
                  Cancel
                </Button>
              </DrawerClose>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
