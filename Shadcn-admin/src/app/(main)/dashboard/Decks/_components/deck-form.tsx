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
          Name
        </Label>
        <Input
          id="deck-name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Enter deck name"
          required
          className="border border-zinc-400 focus:border-zinc-600"
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
<div className="mt-2">
  <textarea
    id="description"
    name="description"
    placeholder="Enter detailed deck description"
    value={form.description}
    onChange={handleChange}
    className="min-h-[100px] w-full rounded-md border border-zinc-400 p-2 text-sm focus:border-zinc-600 focus:outline-none"
  ></textarea>
</div>

      </div>
      <Button type="submit" className="w-full">
        Create Deck
      </Button>
    </form>
  );
}
