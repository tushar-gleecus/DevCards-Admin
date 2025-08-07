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
import { z } from "zod";

const categorySchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters long")
    .regex(/^[a-zA-Z\s]*$/, "Name should not contain numbers"),
  description: z
    .string()
    .min(3, "Description must be at least 3 characters long")
    .regex(/^[a-zA-Z\s]*$/, "Description should not contain numbers"),
  deckId: z.string().min(1, "Deck is required"),
  status: z.string(),
});

interface EditCategoryDrawerProps {
  category: UICategory | null;
  decks: UIDeck[];
  onClose: () => void;
  onSave: (
    id: number,
    data: { name: string; description: string; status: string; deckId: number }
  ) => void;
}

export function EditCategoryDrawer({
  category,
  decks = [],
  onClose,
  onSave,
}: EditCategoryDrawerProps) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "true",
    deckId: "",
  });
  const [errors, setErrors] = useState<{
    name?: string[];
    description?: string[];
    deckId?: string[];
  }>({});
  const [touched, setTouched] = useState<{
    name?: boolean;
    description?: boolean;
    deckId?: boolean;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name,
        description: category.description,
        status: category.status ? "true" : "false",
        deckId: category.deck.toString(),
      });
    } else if (decks.length > 0) {
      setForm((prev) => ({ ...prev, deckId: decks[0].id.toString() }));
    }
  }, [category, decks]);

  const validate = () => {
    const result = categorySchema.safeParse(form);
    if (!result.success) {
      setErrors(result.error.formErrors.fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  useEffect(() => {
    validate();
  }, [form]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const handleSave = async () => {
    if (category) {
      setTouched({ name: true, description: true, deckId: true });
      if (!validate()) return;

      setIsLoading(true);
      try {
        await onSave(Number(category.id), {
          ...form,
          status: form.status === "true" ? "Active" : "Inactive",
          deckId: Number(form.deckId),
        });
        onClose();
      } finally {
        setTimeout(() => setIsLoading(false), 500);
      }
    }
  };

  const isFormInvalid = Object.keys(errors).length > 0;

  return (
    <Drawer open={!!category} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="p-6">
        <DrawerHeader className="text-left pb-4">
          <DrawerTitle className="text-left">Edit Category</DrawerTitle>
          <DrawerDescription className="text-left">
            Make changes to your category here. Click save when you're done.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 pb-0">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 space-y-2">
              <Label htmlFor="name">
                Category Name<span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
              />
              {errors.name && touched.name && (
                <p className="text-red-500 text-xs">{errors.name[0]}</p>
              )}
            </div>
            <div className="col-span-1 space-y-2">
              <Label htmlFor="deckId">
                Deck<span className="text-red-500">*</span>
              </Label>
              <Select
                name="deckId"
                value={form.deckId}
                onValueChange={(value) => handleSelectChange("deckId", value)}
                disabled={isLoading}
              >
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
              {errors.deckId && touched.deckId && (
                <p className="text-red-500 text-xs">{errors.deckId[0]}</p>
              )}
            </div>
            <div className="col-span-1 space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => handleSelectChange("status", value)}
                disabled={isLoading}
              >
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
              <Label htmlFor="description">
                Category Description<span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                onBlur={handleBlur}
                className="h-full"
                disabled={isLoading}
              />
              {errors.description && touched.description && (
                <p className="text-red-500 text-xs">{errors.description[0]}</p>
              )}
            </div>
            <div className="col-span-3 flex justify-center gap-2 mt-4">
              <Button onClick={handleSave} disabled={isLoading || isFormInvalid}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save changes"
                )}
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

