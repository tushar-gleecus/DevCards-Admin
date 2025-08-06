'use client';

import { getPublicCards, updateCardStatus, deleteCardContent } from '@/lib/cardContentApi';
import { CardContent } from '@/types/card-content';
import { getCategories, Category } from "@/lib/categoryApi";
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent as CardContentComponent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

import { SectionCards } from './_components/section-cards';
import { ChartAreaInteractive } from './_components/chart-area-interactive';
import { CardContentTable } from './_components/card-content-table';
import { EditCardContentDrawer } from './_components/edit-card-content-drawer';
import { ViewCardDrawer } from './_components/view-card-drawer';

const MuiTipTapEditor = dynamic(() => import('./_components/Editor'), {
  ssr: false,
});

export default function CardContentPage() {
  const [loading, setLoading] = useState(true);
  const [cardContents, setCardContents] = useState<CardContent[]>([]);
  const [editingCardContent, setEditingCardContent] = useState<CardContent | null>(null);
  const [viewingCardContent, setViewingCardContent] = useState<CardContent | null>(null);
  const [categoryMap, setCategoryMap] = useState<Record<number, { name: string; deckName: string }>>({});
  const [isCreatingCard, setIsCreatingCard] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cards, categories] = await Promise.all([
          getPublicCards(),
          getCategories(),
        ]);

        const newCategoryMap: Record<number, { name: string; deckName: string }> = {};
        for (const cat of categories) {
          newCategoryMap[cat.id] = { name: cat.name, deckName: cat.deck_name };
        }
        setCategoryMap(newCategoryMap);

        setCardContents(cards);
      } catch (error) {
        console.error('Failed to fetch page data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpdateStatus = async (id: number, { status }: { status: "Published" | "Inactive" }) => {
    try {
      await updateCardStatus(id.toString(), status.toLowerCase() as "published" | "inactive");
      const data = await getPublicCards();
      setCardContents(data);
    } catch (error) {
      console.error(`Failed to update card status to ${status}:`, error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCardContent(id.toString());
      const data = await getPublicCards();
      setCardContents(data);
    } catch (error) {
      console.error('Failed to delete card content:', error);
    }
  };

  return (
    <div className="p-4 space-y-6">
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
              <Link href="/dashboard/Card-Contents">Content Management</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Card Content</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <SectionCards />
      <ChartAreaInteractive />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Card Content</CardTitle>
            <Button
              onClick={async () => {
                setIsCreatingCard(true);
                await new Promise(resolve => setTimeout(resolve, 500));
                window.location.href = "/dashboard/Card-Contents/create";
              }}
              disabled={isCreatingCard}
            >
              {isCreatingCard ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : "+ Create Card"}
            </Button>
          </div>
        </CardHeader>
        <CardContentComponent>
          <CardContentTable
            data={cardContents}
            categoryMap={categoryMap}
            loading={loading}
            onEdit={(cardContent) => setEditingCardContent(cardContent)}
            onDelete={handleDelete}
            onUpdateStatus={(cardContent) => setEditingCardContent(cardContent)}
            onView={(cardContent) => setViewingCardContent(cardContent)}
          />
        </CardContentComponent>
      </Card>

      <EditCardContentDrawer
        cardContent={editingCardContent}
        onClose={() => setEditingCardContent(null)}
        onSave={handleUpdateStatus}
      />

      <ViewCardDrawer
        cardContent={viewingCardContent}
        onClose={() => setViewingCardContent(null)}
        categoryMap={categoryMap}
      />
    </div>
  );
}
