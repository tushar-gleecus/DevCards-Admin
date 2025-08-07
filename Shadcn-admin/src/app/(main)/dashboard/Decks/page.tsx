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

import { SectionCards } from "../default/_components/section-cards";

const cards = [
  { title: "Total Decks", value: "—", change: "", badgeColor: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900" },
  { title: "Active Decks", value: "—", change: "", badgeColor: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900" },
  { title: "Inactive Decks", value: "—", change: "", badgeColor: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900" },
  { title: "Growth", value: "—", change: "", badgeColor: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900" },
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
  const handleEditDeck = async (id: number, data: { name: string; description: string; status: boolean }) => {
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
    <div className="flex flex-col gap-6 p-6 @container/main">
      {/* Breadcrumbs */}
      <Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink asChild>
        <Link href="/dashboard">Dashboard</Link>
      </BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink asChild>
        <Link href="/dashboard/Categories">Content Management</Link>
      </BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Decks</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>


      {/* Top Cards (optionally update values based on decks.length, etc.) */}
      <SectionCards />

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
      <Card className="border bg-background shadow-sm">
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
