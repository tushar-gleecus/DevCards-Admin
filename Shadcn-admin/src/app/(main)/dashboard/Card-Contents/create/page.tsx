"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
import { createCardContent } from "@/lib/cardContentApi";

const MuiTipTapEditor = dynamic(() => import("../_components/Editor"), {
  ssr: false,
});

export default function CreateCardPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [category, setCategory] = useState<number | null>(null);
  const [richText, setRichText] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const handleSave = async (saveAsDraft: boolean = false) => {
    if (name && shortDesc && category && richText) {
      try {
        await createCardContent({
          name,
          shortDesc,
          richText,
          categoryId: category,
          deckId: 2, // TODO: Replace with actual selected deck id if needed
          status: saveAsDraft ? "draft" : "published",
        });

        router.push("/dashboard/Card-Contents");
      } catch (error) {
        console.error("Failed to create card:", error);
        // Optionally, show an error message to the user
      }
    }
  };

  return (
    <div className="space-y-6 p-4">
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
              <Link href="/dashboard/Card-Contents">Content Management</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Create Card</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle>Card Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="name">Name</label>
            <Input
              id="name"
              placeholder="Enter card name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border"
            />
          </div>
          <div>
            <label htmlFor="short_desc">Short Description</label>
            <Textarea
              id="short_desc"
              placeholder="Enter a short description"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              className="border"
            />
          </div>
          <div>
            <label htmlFor="category">Category</label>
            <Select onValueChange={(value) => setCategory(Number(value))}>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Card Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ minHeight: '200px' }}>
            <MuiTipTapEditor content={richText} onContentChange={setRichText} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button variant="outline" onClick={() => handleSave(true)}>
          Save as Draft
        </Button>
        <Button onClick={() => handleSave(false)}>Publish</Button>
      </div>
    </div>
  );
}
