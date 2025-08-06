"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CategoryForm } from "./category-form";
import type { Category } from "@/lib/categoryApi";

export function CategorySidePanel({
  category,
  decks,
  onClose,
  onSave,
}: {
  category: Category | null;
  decks: { id: number; name: string }[];
  onClose: () => void;
  onSave: (id: number, data: { name: string; description: string; deckId: number }) => void;
}) {
  return (
    <Sheet open={!!category} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="sm:max-w-md right-0 left-auto p-4">
        <SheetHeader>
          <SheetTitle>Edit Category</SheetTitle>
        </SheetHeader>
        {category && <CategoryForm category={category} decks={decks} onSave={(data) => onSave(category.id, data)} />}
      </SheetContent>
    </Sheet>
  );
}