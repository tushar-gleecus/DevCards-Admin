"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import type { CardContent } from "@/types/card-content";
import { format } from "date-fns";

interface ViewCardDrawerProps {
  cardContent: CardContent | null;
  onClose: () => void;
  categoryMap: Record<number, { name: string; deckName: string }>;
}

export function ViewCardDrawer({ cardContent, onClose, categoryMap }: ViewCardDrawerProps) {
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "published":
        return "bg-green-500 text-white";
      case "draft":
        return "bg-yellow-500 text-white";
      case "inactive":
        return "bg-gray-500 text-white";
      default:
        return "";
    }
  };

  return (
    <Drawer open={!!cardContent} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="p-6 flex flex-col h-full max-h-[90vh]">
        <DrawerHeader className="flex items-center justify-between pb-4">
          <div className="flex flex-row items-center gap-2">
            <DrawerTitle>View Card</DrawerTitle>
          </div>
        </DrawerHeader>
        {cardContent && (
          <div className="grid grid-cols-3 gap-6 p-4 flex-grow overflow-y-auto">
            {/* Row 1 */}
            <div className="space-y-2">
              <h3 className="font-semibold">Name</h3>
              <div className="border p-2 rounded-md min-h-[40px]">{cardContent.name}</div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Deck</h3>
              <div className="border p-2 rounded-md min-h-[40px]">
                {categoryMap[cardContent.category_id]?.deckName || "N/A"}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Status</h3>
              <div className="border p-2 rounded-md min-h-[40px]">
                <Badge className={getStatusBadgeClass(cardContent.status)}>
                  {cardContent.status}
                </Badge>
              </div>
            </div>

            {/* Row 2 */}
            <div className="space-y-2">
              <h3 className="font-semibold">Category</h3>
              <div className="border p-2 rounded-md min-h-[40px]">
                {categoryMap[cardContent.category_id]?.name || "N/A"}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Created At</h3>
              <div className="border p-2 rounded-md min-h-[40px]">
                {cardContent.created_at
                  ? format(new Date(cardContent.created_at), "PPP")
                  : "N/A"}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Updated At</h3>
              <div className="border p-2 rounded-md min-h-[40px]">
                {cardContent.updated_at
                  ? format(new Date(cardContent.updated_at), "PPP")
                  : "N/A"}
              </div>
            </div>

            {/* Row 3 */}
            <div className="col-span-3 space-y-2">
              <h3 className="font-semibold">Short Description</h3>
              <div className="border p-2 rounded-md min-h-[80px]">
                {cardContent.short_description}
              </div>
            </div>

            {/* Row 4 */}
            <div className="col-span-3 space-y-2">
              <h3 className="font-semibold">Card Content</h3>
              <div
                className="border p-2 rounded-md prose dark:prose-invert max-w-none min-h-[200px]"
                dangerouslySetInnerHTML={{ __html: cardContent.description }}
              />
            </div>
          </div>
        )}
        <div className="pt-4 flex justify-end">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
