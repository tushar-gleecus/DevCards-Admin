"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Deck } from "@/lib/deckApi";

export function DeckForm({ onAddDeck }: { onAddDeck: (data: { name: string; description: string }) => void }) {
  const [form, setForm] = useState({ name: "", description: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim()) return;
    onAddDeck(form);
    setForm({ name: "", description: "" });
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="deck-name" className="mb-2 block">
          Deck Name
        </Label>
        <Input
          id="deck-name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Enter deck name"
          required
        />
      </div>
      <div>
        <Label htmlFor="deck-desc" className="mb-2 block">
          Deck Description
        </Label>
        <Input
          id="deck-desc"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Enter deck description"
          required
        />
      </div>
      <Button type="submit" className="w-full">
        Create Deck
      </Button>
    </form>
  );
}
