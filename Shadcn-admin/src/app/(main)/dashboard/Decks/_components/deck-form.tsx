"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Deck } from "@/lib/deckApi";
import { Loader2 } from "lucide-react";

export function DeckForm({ deck, onAddDeck }: { deck?: Deck, onAddDeck: (data: { name: string; description: string }) => void }) {
  const [form, setForm] = useState({ name: "", description: "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (deck) {
      setForm({ name: deck.name, description: deck.description });
    }
  }, [deck]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim()) return;

    setIsLoading(true);
    try {
      await onAddDeck(form);
      setForm({ name: "", description: "" });
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3">
        <Label htmlFor="name">Name<span className="text-red-500">*</span></Label>
        <Input id="name" name="name" value={form.name} onChange={handleChange} disabled={isLoading} />
      </div>
      <div className="flex flex-col gap-3">
        <Label htmlFor="description">Description<span className="text-red-500">*</span></Label>
        <Textarea id="description" name="description" value={form.description} onChange={handleChange} className="min-h-[96px]" disabled={isLoading} />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {deck ? "Saving Changes..." : "Creating Deck..."}</> : (deck ? "Save Changes" : "Create Deck")}
      </Button>
    </form>
  );
}