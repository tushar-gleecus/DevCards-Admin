'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  Category as APICategory,
} from '@/lib/categoryApi';
import { getDecks } from '@/lib/deckApi';
import { CategoryTable } from './_components/category-table';
import { CategoryForm } from './_components/category-form';
import { CategoriesChart } from './_components/chart';
// import { Input } from '@/components/ui/input';
import { SectionCards } from "../default/_components/section-cards";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import { UIDeck, UICategory } from "@/types/category-ui";

function kpiCount(arr: UICategory[], fn: (cat: UICategory) => boolean) {
  return arr.filter(fn).length;
}

export default function CategoriesPage() {
  const [decks, setDecks] = useState<UIDeck[]>([]);
  const [categories, setCategories] = useState<UICategory[]>([]);
  const [loading, setLoading] = useState(true);
  // const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [decksData, categoriesData] = await Promise.all([
          getDecks(),
          getCategories(),
        ]);
        setDecks(
          decksData.map((deck) => ({ id: deck.id, name: deck.name }))
        );
        setCategories(
          categoriesData.map((cat) => ({
            id: cat.id.toString(),
            name: cat.name,
            description: cat.description,
            status: cat.status,
            created_at: cat.created_at,
            updated_at: cat.updated_at,
            deck: cat.deck,
            deckId: cat.deck.toString(),
            deck_name:
              decksData.find((d) => d.id === cat.deck)?.name || 'Unknown Deck',
            created_by: cat.created_by,
            updated_by: cat.updated_by,
          }))
        );
      } catch {
        toast.error('Failed to load decks or categories');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleCreateCategory = async (data: {
    name: string;
    description: string;
    deckId: number;
  }) => {
    try {
      const newCat = await createCategory({
        name: data.name,
        description: data.description,
        deck: Number(data.deckId),
      });
      setCategories((prev) => [
        {
          ...newCat,
          id: newCat.id.toString(),
          deckId: newCat.deck.toString(),
          deck_name:
            decks.find((d) => d.id === newCat.deck)?.name ||
            'Unknown Deck',
          status: newCat.status, // Changed to directly use newCat.status
        },
        ...prev,
      ]);
      toast.success('Category created!');
    } catch {
      toast.error('Failed to create category');
    }
  };

  const handleEditCategory = async (
    id: number,
    data: { name: string; description: string; deckId: number; status: string }
  ) => {
    console.log("handleEditCategory - Received ID:", id, "Data:", data);
    try {
      const updatedCat = await updateCategory(id, {
        name: data.name,
        description: data.description,
        deck: data.deckId,
        status: data.status,
      });
      console.log("handleEditCategory - API Response (updatedCat):", updatedCat);
      setCategories((prev) => {
        const newCategories = prev.map((cat) => {
          console.log("Mapping - Current cat.id:", cat.id, "Comparing to id.toString():", id.toString(), "Match:", cat.id === id.toString());
          if (cat.id === id.toString()) {
            console.log("Mapping - Before update - cat.status:", cat.status);
            const updatedCategory = {
              ...cat,
              name: updatedCat.name,
              description: updatedCat.description,
              deck: updatedCat.deck,
              status: updatedCat.status, 
              deck_name:
                decks.find((d) => d.id === updatedCat.deck)?.name ||
                'Unknown Deck',
            };
            console.log("Mapping - After update - updatedCategory.status:", updatedCategory.status);
            return updatedCategory;
          }
          return cat;
        });
        console.log("handleEditCategory - New categories state:", newCategories);
        return newCategories;
      });
      toast.success('Category updated!');
    } catch (error) {
      console.error("handleEditCategory - Error updating category:", error);
      toast.error('Failed to update category');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await deleteCategory(Number(id));
      setCategories((prev) => prev.filter((cat) => cat.id !== id.toString()));
      toast.success('Category deleted!');
    } catch {
      toast.error('Failed to delete category');
    }
  };

  const kpis = [
    { title: 'Total Categories', value: categories.length, trend: '' },
    {
      title: 'Active Categories',
      value: kpiCount(categories, (c) => c.status === "Active"),
      trend: '',
    },
    {
      title: 'Inactive Categories',
      value: kpiCount(categories, (c) => c.status === "Inactive"),
      trend: '',
    },
    { title: 'Growth', value: '12%', trend: '+2%' },
  ];

  // const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setSearch(e.target.value);
  // };

  // const filteredCategories = categories.filter((cat) =>
  //   cat.name.toLowerCase().includes(search.toLowerCase())
  // );

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
            <BreadcrumbPage>Categories</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* KPI Cards */}
      <SectionCards />

      {/* Chart + Create Form */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Categories Overview</CardTitle>
            <CardDescription>Category creation trend</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoriesChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Create Category</CardTitle>
            <CardDescription>Add a new category below</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryForm decks={decks} onCreate={handleCreateCategory} />
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="mt-2 rounded-xl border bg-background shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold">Categories</CardTitle>
          <CardDescription className="text-muted-foreground mt-1 mb-2 text-sm">
            Manage all categories on your platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryTable
            categories={categories}
            decks={decks}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}