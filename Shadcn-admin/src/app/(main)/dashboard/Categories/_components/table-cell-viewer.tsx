import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CategoryForm } from "./category-form";

import { Category, Deck } from "@/lib/categoryApi";

export function TableCellViewer({ item, decks }: { item: Category, decks: Deck[] }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <div className="font-medium text-primary cursor-pointer">{item.name}</div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Category</SheetTitle>
        </SheetHeader>
        <CategoryForm category={item} decks={decks} />
      </SheetContent>
    </Sheet>
  );
}
