import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DeckForm } from "./deck-form";

export function TableCellViewer({ item }: { item: any }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <div className="font-medium text-primary cursor-pointer">{item.name}</div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Deck</SheetTitle>
        </SheetHeader>
        <DeckForm deck={item} onAddDeck={() => {}} />
      </SheetContent>
    </Sheet>
  );
}
