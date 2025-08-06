"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DeckForm } from "./deck-form";
import type { Deck } from "@/lib/deckApi";

export function DeckSidePanel({
  deck,
  onClose,
  onSave,
}: {
  deck: Deck | null;
  onClose: () => void;
  onSave: (id: number, data: { name: string; description: string }) => void;
}) {
  return (
    <Sheet open={!!deck} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-[550px]">
        <SheetHeader>
          <SheetTitle>Edit Deck</SheetTitle>
        </SheetHeader>
        {deck && (
  <DeckForm
    deck={deck}
    onAddDeck={(data) => onSave(deck.id, data)}
  />
)}
      </SheetContent>
    </Sheet>
  );
}