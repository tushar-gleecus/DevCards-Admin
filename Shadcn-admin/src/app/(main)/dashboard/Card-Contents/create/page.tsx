"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

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
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCategories, Category } from "@/lib/categoryApi";
import { createCardContent } from "@/lib/cardContentApi";

const MuiTipTapEditor = dynamic(() => import("../_components/Editor"), {
  ssr: false,
});

const cardSchema = z.object({
  name: z.string().min(1, "Name is required"),
  shortDesc: z.string().min(1, "Short description is required"),
  category: z.number().min(1, "Category is required"),
  richText: z.string().min(1, "Content is required"),
});

export default function CreateCardPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: "",
    shortDesc: "",
    category: null as number | null,
    richText: "",
  });
  const [errors, setErrors] = useState<any>({});
  const [touched, setTouched] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const validate = () => {
    const result = cardSchema.safeParse(form);
    if (!result.success) {
      setErrors(result.error.formErrors.fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev: any) => ({ ...prev, [field]: true }));
    validate();
  };

  const handleSave = async (saveAsDraft: boolean = false) => {
    setTouched({ name: true, shortDesc: true, category: true, richText: true });
    if (!validate()) return;

    setIsSaving(true);
    try {
      await createCardContent({
        name: form.name,
        shortDesc: form.shortDesc,
        richText: form.richText,
        categoryId: form.category!,
        deckId: 2, // TODO: Replace with actual selected deck id if needed
        status: saveAsDraft ? "draft" : "published",
      });

      router.push("/dashboard/Card-Contents");
    } catch (error) {
      console.error("Failed to create card:", error);
      // Optionally, show an error message to the user
    } finally {
      setTimeout(() => setIsSaving(false), 500);
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
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              onBlur={() => handleBlur("name")}
              className="border"
              disabled={isSaving}
            />
            {touched.name && errors.name && (
              <p className="text-red-500 text-xs">{errors.name[0]}</p>
            )}
          </div>
          <div>
            <label htmlFor="short_desc">Short Description</label>
            <Textarea
              id="short_desc"
              placeholder="Enter a short description"
              value={form.shortDesc}
              onChange={(e) => handleChange("shortDesc", e.target.value)}
              onBlur={() => handleBlur("shortDesc")}
              className="border"
              disabled={isSaving}
            />
            {touched.shortDesc && errors.shortDesc && (
              <p className="text-red-500 text-xs">{errors.shortDesc[0]}</p>
            )}
          </div>
          <div>
            <label htmlFor="category">Category</label>
            <Select
              onValueChange={(value) => handleChange("category", Number(value))}
              onOpenChange={(isOpen) => !isOpen && handleBlur("category")}
              disabled={isSaving}
            >
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
            {touched.category && errors.category && (
              <p className="text-red-500 text-xs">{errors.category[0]}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Card Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ minHeight: "200px" }} onBlur={() => handleBlur("richText")}>
            <MuiTipTapEditor
              content={form.richText}
              onContentChange={(value) => handleChange("richText", value)}
              editable={!isSaving}
            />
          </div>
          {touched.richText && errors.richText && (
            <p className="text-red-500 text-xs">{errors.richText[0]}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          variant="outline"
          onClick={() => handleSave(true)}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Draft...
            </>
          ) : (
            "Save as Draft"
          )}
        </Button>
        <Button onClick={() => handleSave(false)} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...
            </>
          ) : (
            "Publish"
          )}
        </Button>
      </div>
    </div>
  );
}
