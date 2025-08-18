"use client";

import { Button } from "@/components/ui/button";
import { Cross2Icon } from "@radix-ui/react-icons";
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
import { useEffect, useState } from "react";
import { getUserName } from "@/lib/userApi";
import { format } from "date-fns";

interface ViewCardDrawerProps {
  cardContent: CardContent | null;
  onClose: () => void;
  categoryMap: Record<number, { name: string; deckName: string }>;
}

export function ViewCardDrawer({ cardContent, onClose, categoryMap }: ViewCardDrawerProps) {
  const [createdByName, setCreatedByName] = useState<string>("");
  const [updatedByName, setUpdatedByName] = useState<string>("");

  useEffect(() => {
    if (cardContent?.created_by) {
      getUserName(cardContent.created_by).then(setCreatedByName);
    } else {
      setCreatedByName("");
    }
    if (cardContent?.updated_by) {
      getUserName(cardContent.updated_by).then(setUpdatedByName);
    } else {
      setUpdatedByName("");
    }
  }, [cardContent]);

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
        <DrawerHeader className="flex items-center justify-between pb-4 relative">
          <div className="flex flex-row items-center gap-2">
            <DrawerTitle>View Card</DrawerTitle>
          </div>
          <DrawerClose asChild>
            <button
              type="button"
              aria-label="Close"
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <Cross2Icon className="h-5 w-5" />
            </button>
          </DrawerClose>
        </DrawerHeader>
        {cardContent && (
          <div className="flex flex-col gap-8 p-4 flex-grow overflow-y-auto">
            <section>
              <h2 className="text-2xl font-bold mb-2">{cardContent.name}</h2>
              <div className="flex flex-wrap gap-6 text-base">
                <div><span className="font-semibold">Deck:</span> {categoryMap[cardContent.category_id]?.deckName || "N/A"}</div>
                <div><span className="font-semibold">Category:</span> {categoryMap[cardContent.category_id]?.name || "N/A"}</div>
                <div><span className="font-semibold">Status:</span> <Badge className={getStatusBadgeClass(cardContent.status)}>{cardContent.status}</Badge></div>
                <div><span className="font-semibold">Read Time:</span> {cardContent.read_time} min</div>
                <div><span className="font-semibold">Created At:</span> {cardContent.created_at ? format(new Date(cardContent.created_at), "PPP") : "N/A"}</div>
                <div><span className="font-semibold">Updated At:</span> {cardContent.updated_at ? format(new Date(cardContent.updated_at), "PPP") : "N/A"}</div>
                <div><span className="font-semibold">Created By:</span> {createdByName || cardContent.created_by || "N/A"}</div>
                <div><span className="font-semibold">Updated By:</span> {updatedByName || cardContent.updated_by || "N/A"}</div>
              </div>
            </section>
            <section>
              <h3 className="font-semibold mb-1">Short Description</h3>
              <div className="border p-3 rounded-md min-h-[60px] bg-muted/50">
                {cardContent.short_description}
              </div>
            </section>
            <section>
              <h3 className="font-semibold mb-1">Card Content</h3>
              <div
                className="border p-3 rounded-md prose dark:prose-invert max-w-none min-h-[200px] bg-muted/50"
                dangerouslySetInnerHTML={{ __html: cardContent.description }}
              />
            </section>
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
