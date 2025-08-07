"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ActionButton } from "@/components/ui/ActionButton";
import { Label } from "@/components/ui/label";
import type { Deck } from "@/lib/deckApi";
import { toast } from "sonner";

export function EditDeckDialog({
  open,
  onOpenChange,
  deck,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deck: Deck | null;
  onSave: (id: number, data: Deck) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");
  const [errors, setErrors] = useState({ name: "", description: "" });

  useEffect(() => {
    if (deck) {
      setName(deck.name);
      setDescription(deck.description);
      setStatus(String(deck.status));
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

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setDescription(value);
    validateField("description", value);
  };

  if (!deck) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Deck</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={handleNameChange} isInvalid={!!errors.name} />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={description}
              onChange={handleDescriptionChange}
              isInvalid={!!errors.description}
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded border border-zinc-400 px-2 py-2 text-sm focus:border-zinc-600"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <ActionButton variant="outline" onClick={async () => { onOpenChange(false); await new Promise(res => setTimeout(res, 400)); }}>
  Cancel
</ActionButton>
          </DialogClose>
          <ActionButton
  onClick={async () => {
    const isNameValid = validateField("name", name);
    const isDescriptionValid = validateField("description", description);

    if (!isNameValid || !isDescriptionValid) {
      return;
    }

    onSave(deck.id, {
      ...deck,
      name,
      description,
      status: status === "Active",
    });
    await new Promise(res => setTimeout(res, 400));
  }}
>
  Save Changes
</ActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}