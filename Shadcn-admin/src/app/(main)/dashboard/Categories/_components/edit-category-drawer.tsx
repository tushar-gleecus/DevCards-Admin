"use client";

import { useState, useEffect } from "react";
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
import { UICategory, UIDeck } from "@/types/category-ui";

interface EditCategoryDrawerProps {
  category: UICategory | null;
  decks: UIDeck[];
  onClose: () => void;
  onSave: (id: number, data: { name: string; description: string; status: string; deckId: number }) => void;
}

export function EditCategoryDrawer({ category, decks = [], onClose, onSave }: EditCategoryDrawerProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string>("true");
  const [deckId, setDeckId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description);
      setStatus(category.status ? "true" : "false");
      setDeckId(category.deck.toString());
    } else if (decks.length > 0) {
      setDeckId(decks[0].id.toString());
    }
  }, [category, decks]);

  const handleSave = async () => {
    if (category) {
      setIsLoading(true);
      try {
        await onSave(Number(category.id), { name, description, status: status === "true" ? "Active" : "Inactive", deckId: Number(deckId) });
        onClose();
      } finally {
        setTimeout(() => setIsLoading(false), 500);
      }
    }
  };

  return (
    <Drawer open={!!category} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="p-6">
        <DrawerHeader className="text-left pb-4">
          <DrawerTitle className="text-left">Edit Category</DrawerTitle>
          <DrawerDescription className="text-left">Make changes to your category here. Click save when you're done.</DrawerDescription>
        </DrawerHeader>
        <div className="p-4 pb-0">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 space-y-2">
              <Label htmlFor="name">Category Name<span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="col-span-1 space-y-2">
              <Label htmlFor="deckId">Deck<span className="text-red-500">*</span></Label>
              <Select name="deckId" value={deckId} onValueChange={setDeckId} disabled={isLoading}>
                <SelectTrigger id="deckId" className="w-full">
                  <SelectValue placeholder="Select a deck" />
                </SelectTrigger>
                <SelectContent>
                  {decks.map((deck) => (
                    <SelectItem key={deck.id} value={String(deck.id)}>
                      {deck.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-1 space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus} disabled={isLoading}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-3 row-span-2 space-y-2">
              <Label htmlFor="description">Category Description<span className="text-red-500">*</span></Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-full"
                disabled={isLoading}
              />
            </div>
            <div className="col-span-3 flex justify-center gap-2 mt-4">
              <Button onClick={handleSave} disabled={isLoading}>
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
