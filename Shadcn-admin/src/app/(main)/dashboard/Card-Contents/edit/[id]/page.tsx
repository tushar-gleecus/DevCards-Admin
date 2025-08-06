"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCategories, Category } from "@/lib/categoryApi";
import { getPublicCard, updateCardContent } from "@/lib/cardContentApi";

const MuiTipTapEditor = dynamic(() => import("../../_components/Editor"), {
  ssr: false,
});

export default function EditCardPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [category, setCategory] = useState<number | null>(null);
  const [richText, setRichText] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "inactive">("draft");

  useEffect(() => {
    getCategories().then(setCategories);

    if (id) {
      getPublicCard(id).then((card) => {
        setName(card.name);
        setShortDesc(card.short_description);
        setCategory(card.category_id);
        setRichText(card.description);
        setStatus(card.status);
      });
    }
  }, [id]);

  const handleSave = async () => {
    if (id && name && shortDesc && category && richText) {
      try {
        await updateCardContent(id, {
          name,
          short_description: shortDesc,
          description: richText,
          category_id: category,
          deck_id: 2, // TODO: Replace with actual selected deck id if needed
          status,
          read_time: 3,
          tags: "",
        });

        router.push("/dashboard/Card-Contents");
      } catch (error) {
        console.error("Failed to update card:", error);
      }
    }
  };

  return (
    <div className="space-y-6 p-4">
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
            <BreadcrumbPage>Edit Card</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle>Card Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name">Name</label>
            <Input
              id="name"
              placeholder="Enter card name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="short_desc">Short Description</label>
            <Textarea
              id="short_desc"
              placeholder="Enter a short description"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              className="border"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="category">Category</label>
            <Select value={category?.toString()} onValueChange={(value) => setCategory(Number(value))}>
              <SelectTrigger id="category" className="border">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label>Card Content</label>
            <MuiTipTapEditor content={richText} onContentChange={setRichText} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
}