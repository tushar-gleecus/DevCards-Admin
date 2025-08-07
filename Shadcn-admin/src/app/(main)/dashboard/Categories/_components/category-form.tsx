"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import type { Category, Deck } from "@/lib/categoryApi";
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
  deckId: z.number().min(1, "Deck is required"),
});

export function CategoryForm({
  category,
  decks,
  onCreate,
  onSave,
}: {
  category?: Category;
  decks: Deck[];
  onCreate?: (cat: {
    name: string;
    description: string;
    deckId: number;
  }) => void;
  onSave?: (cat: {
    name: string;
    description: string;
    deckId: number;
  }) => void;
}) {
  const [form, setForm] = useState({ name: "", description: "", deckId: 0 });
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
        deckId: category.deck,
      });
    } else if (decks.length > 0) {
      setForm({ name: "", description: "", deckId: Number(decks[0].id) });
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

  const handleSelectChange = (value: string) => {
    setForm({ ...form, deckId: Number(value) });
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, description: true, deckId: true });
    if (!validate()) return;

    setIsLoading(true);
    try {
      if (category && onSave) {
        await onSave(form);
      } else if (onCreate) {
        await onCreate(form);
      }
      setForm({
        name: "",
        description: "",
        deckId: decks.length > 0 ? Number(decks[0].id) : 0,
      });
      setTouched({});
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const isFormInvalid = Object.keys(errors).length > 0;

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3">
        <Label htmlFor="name">
          Name<span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {errors.name && touched.name && (
          <p className="text-red-500 text-xs">{errors.name[0]}</p>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <Label htmlFor="description">
          Description<span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          onBlur={handleBlur}
          className="min-h-[96px]"
        />
        {errors.description && touched.description && (
          <p className="text-red-500 text-xs">{errors.description[0]}</p>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <Label htmlFor="deckId">
          Deck<span className="text-red-500">*</span>
        </Label>
        <Select
          name="deckId"
          value={form.deckId.toString()}
          onValueChange={handleSelectChange}
        >
          <SelectTrigger id="deckId" className="w-full">
            <SelectValue placeholder="Select a deck" />
          </SelectTrigger>
          <SelectContent>
            {decks.map((deck) => (
              <SelectItem key={deck.id} value={deck.id.toString()}>
                {deck.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.deckId && touched.deckId && (
          <p className="text-red-500 text-xs">{errors.deckId[0]}</p>
        )}
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || isFormInvalid}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
            {category ? "Saving Changes..." : "Creating Category..."}
          </>
        ) : category ? (
          "Save Changes"
        ) : (
          "Create Category"
        )}
      </Button>
    </form>
  );
}