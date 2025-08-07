"use client";

import { useState, useEffect } from "react";
import { ActionButton } from "@/components/ui/ActionButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
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
import type { Deck } from "@/lib/deckApi";
import { toast } from "sonner";

interface EditDeckDrawerProps {
  deck: Deck | null;
  onClose: () => void;
  onSave: (id: number, data: { name: string; description: string; status: boolean }) => void;
}

export function EditDeckDrawer({ deck, onClose, onSave }: EditDeckDrawerProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ name: "", description: "" });

  useEffect(() => {
    if (deck) {
      setName(deck.name);
      setDescription(deck.description);
      setStatus(deck.status ? "Active" : "Inactive");
      setErrors({ name: "", description: "" }); // Clear errors on deck change
    }
  }, [deck]);

  const validateField = (fieldName: string, value: string) => {
    const nameRegex = /^[a-zA-Z\s]*$/;
    let errorMessage = "";

    if (!value.trim()) {
      errorMessage = `${fieldName === "name" ? "Deck name" : "Description"} is required.`;
    } else if (!nameRegex.test(value)) {
      errorMessage = `${fieldName === "name" ? "Deck name" : "Description"} can only contain letters and spaces.`;
    }
    setErrors((prevErrors) => ({ ...prevErrors, [fieldName]: errorMessage }));
    return errorMessage === "";
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setName(value);
    validateField("name", value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setDescription(value);
    validateField("description", value);
  };

  const handleSave = async () => {
    if (deck) {
      const isNameValid = validateField("name", name);
      const isDescriptionValid = validateField("description", description);

      if (!isNameValid || !isDescriptionValid) {
        return;
      }

      setIsLoading(true);
      try {
        await onSave(deck.id, { name, description, status: status === "Active" });
        onClose();
      } finally {
        setTimeout(() => setIsLoading(false), 500);
      }
    }
  };

  return (
    <Drawer open={!!deck} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="p-6">
        <DrawerHeader className="text-left pb-4">
          <DrawerTitle className="text-left">Edit Deck</DrawerTitle>
          <DrawerDescription className="text-left">Make changes to your deck here. Click save when you're done.</DrawerDescription>
        </DrawerHeader>
        <div className="p-4 pb-0">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 space-y-2">
              <Label htmlFor="name">Deck Name<span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={name}
                onChange={handleNameChange}
                disabled={isLoading}
                isInvalid={!!errors.name}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>
            <div className="col-span-1 space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: "Active" | "Inactive") => setStatus(value)} disabled={isLoading}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-3 row-span-2 space-y-2">
              <Label htmlFor="description">Deck Description<span className="text-red-500">*</span></Label>
              <Textarea
                id="description"
                value={description}
                onChange={handleDescriptionChange}
                className="h-full"
                disabled={isLoading}
                isInvalid={!!errors.description}
              />
              {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
            </div>
            <div className="col-span-3 flex justify-center gap-2 mt-4">
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save changes"}
              </Button>
              <DrawerClose asChild>
                <ActionButton variant="outline" onClick={onClose} disabled={isLoading}>
                  Cancel
                </ActionButton>
              </DrawerClose>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
