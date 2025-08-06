"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


import { Category, Deck } from "@/lib/categoryApi";

export function EditCategoryDialog({
  open,
  setOpen,
  decks,
  category,
  onSave,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  decks: Deck[];
  category: Category | null;
  onSave: (data: Omit<Category, "id">) => void;
}) {
  const [form, setForm] = useState<Omit<Category, "id">>({
    name: "",
    description: "",
    deck: 0,
    status: "",
    created_at: "",
    updated_at: "",
    deck_name: "",
  });

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name,
        description: category.description,
        deck: category.deck,
        status: category.status,
        created_at: category.created_at,
        updated_at: category.updated_at,
        deck_name: category.deck_name,
      });
    }
  }, [category, open]);

  if (!category) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>
        <form
          className="mt-2 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name || !form.description || !form.deck) return;
            onSave(form);
          }}
        >
          <Label htmlFor="edit-category-name">Category Name</Label>
          <Input
            id="edit-category-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Label htmlFor="edit-category-description" className="mt-1">
            Category Description
          </Label>
          <Input
            id="edit-category-description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <Label htmlFor="edit-category-deck">Deck Name</Label>
          <Select value={String(form.deck)} onValueChange={(value) => setForm({ ...form, deck: Number(value) })} required>
            <SelectTrigger id="edit-category-deck">
              <SelectValue placeholder="Select Deck" />
            </SelectTrigger>
            <SelectContent>
              {decks.map((deck) => (
                <SelectItem key={deck.id} value={String(deck.id)}>
                  {deck.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" className="mt-4">
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
