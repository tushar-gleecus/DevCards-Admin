"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DeckForm } from "./_components/deck-form";
import { DecksDataTable } from "./_components/deck-table";
import { Chart } from "./_components/chart";
import { toast } from "sonner";
import { getDecks, createDeck, updateDeck, deleteDeck, Deck } from "@/lib/deckApi";

const cards = [
  { title: "Total Decks", value: "—", change: "", badgeColor: "text-green-600 bg-green-100" },
  { title: "Active Decks", value: "—", change: "", badgeColor: "text-blue-600 bg-blue-100" },
  { title: "Inactive Decks", value: "—", change: "", badgeColor: "text-red-600 bg-red-100" },
  { title: "Growth", value: "—", change: "", badgeColor: "text-green-600 bg-green-100" },
];

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  // Load decks from API
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getDecks();
        setDecks(data);
      } catch (err: any) {
        toast.error("Failed to load decks");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Add deck via API
  const handleAddDeck = async (deck: { name: string; description: string }) => {
    try {
      const newDeck = await createDeck(deck);
      setDecks((prev) => [newDeck, ...prev]);
      toast.success("Deck created!");
    } catch (err: any) {
      toast.error("Failed to create deck");
    }
  };

  // Edit deck via API
  const handleEditDeck = async (id: number, data: { name: string; description: string }) => {
    try {
      const updated = await updateDeck(id, data);
      setDecks((prev) => prev.map((d) => (d.id === id ? updated : d)));
      toast.success("Deck updated!");
    } catch (err: any) {
      toast.error("Failed to update deck");
    }
  };

  // Delete deck via API
  const handleDeleteDeck = async (id: number) => {
    try {
      await deleteDeck(id);
      setDecks((prev) => prev.filter((d) => d.id !== id));
      toast.success("Deck deleted!");
    } catch (err: any) {
      toast.error("Failed to delete deck");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Decks</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Top Cards (optionally update values based on decks.length, etc.) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title} className="border bg-white shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex w-full flex-row items-center justify-between">
                <CardTitle className="text-base font-normal">{card.title}</CardTitle>
                <span className={"rounded-md px-2 py-0.5 text-xs font-medium " + card.badgeColor}>{card.change}</span>
              </div>
              <CardDescription className="pt-2 pb-1 text-3xl font-bold text-black">{card.value}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Chart + Form */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Decks Overview</CardTitle>
            <CardDescription>Deck creation trend</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Create Deck</CardTitle>
            <CardDescription>Add a new deck below</CardDescription>
          </CardHeader>
          <CardContent>
            <DeckForm onAddDeck={handleAddDeck} />
          </CardContent>
        </Card>
      </div>

      {/* Deck Table */}
      <Card className="border bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Decks</CardTitle>
          <CardDescription>Manage all decks on your platform</CardDescription>
        </CardHeader>
        <CardContent>
          <DecksDataTable decks={decks} onEditDeck={handleEditDeck} onDeleteDeck={handleDeleteDeck} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}
