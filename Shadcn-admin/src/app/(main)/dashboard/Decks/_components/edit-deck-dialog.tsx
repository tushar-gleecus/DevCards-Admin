"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Deck } from "@/lib/deckApi"; // <-- IMPORTANT

export function EditDeckDialog({
  open,
  onOpenChange,
  deck,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deck: Deck | null;
  onSave: (id: number, data: { name: string; description: string }) => void;
}) {
  const [form, setForm] = useState<Deck | null>(deck);

  useEffect(() => {
    if (deck) setForm(deck);
  }, [deck]);

  if (!deck) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Deck</DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form) return;
            onSave(form.id, { name: form.name, description: form.description });
            onOpenChange(false);
          }}
        >
          <div>
            <Label>Deck Name</Label>
            <Input
              value={form?.name ?? ""}
              onChange={(e) => setForm((f) => (f ? { ...f, name: e.target.value } : null))}
              required
            />
          </div>
          <div className="mt-3">
            <Label>Deck Description</Label>
            <Input
              value={form?.description ?? ""}
              onChange={(e) => setForm((f) => (f ? { ...f, description: e.target.value } : null))}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
