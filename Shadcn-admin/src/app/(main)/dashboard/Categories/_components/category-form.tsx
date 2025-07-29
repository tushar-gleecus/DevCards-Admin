"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Deck = { id: string; name: string };

export function CategoryForm({
  decks,
  onCreate,
}: {
  decks: Deck[];
  onCreate: (cat: { name: string; description: string; deckId: string }) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    deckId: decks.length > 0 ? decks[0].id : "",
  });

  return (
    <Card className="rounded-xl border border-zinc-200 shadow-sm">
      <CardHeader>
        <CardTitle>Create Category</CardTitle>
        <CardDescription>Add a new category below</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name || !form.description || !form.deckId) return;
            onCreate(form);
            setForm({ name: "", description: "", deckId: decks.length > 0 ? decks[0].id : "" });
          }}
        >
            <Label htmlFor="category-name">Name</Label>
            <Input
            id="category-name"
            placeholder="Enter category name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="border border-zinc-300"
            />
            <Label htmlFor="category-description">Description</Label>
            <textarea
              id="category-description"
              placeholder="Enter category description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              className="border border-zinc-300 rounded-md p-2 min-h-[80px] resize-y"
            />
            <Label htmlFor="deck-dropdown">Deck Name</Label>
            <Select value={form.deckId} onValueChange={(value) => setForm({ ...form, deckId: value })} required>
            <SelectTrigger id="deck-dropdown" className="border border-zinc-300">
              <SelectValue placeholder="Select Deck" />
            </SelectTrigger>
            <SelectContent>
              {decks.map((deck) => (
              <SelectItem key={deck.id} value={deck.id}>
                {deck.name}
              </SelectItem>
              ))}
            </SelectContent>
            </Select>
          <Button type="submit" className="mt-2 w-full">
            Create Category
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
