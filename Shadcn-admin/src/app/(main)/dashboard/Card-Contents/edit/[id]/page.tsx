"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { getPublicCard, updateCardContent } from "@/lib/cardContentApi";

const MuiTipTapEditor = dynamic(() => import("../../_components/Editor"), {
  ssr: false,
});

const cardSchema = z.object({
  name: z.string().min(1, "Name is required"),
  shortDesc: z.string().min(1, "Short description is required"),
  category: z.number().min(1, "Category is required"),
  richText: z.string().min(1, "Content is required"),
});

export default function EditCardPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: "",
    shortDesc: "",
    category: null as number | null,
    richText: "",
  });
  const [errors, setErrors] = useState<any>({});
  const [touched, setTouched] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories);

    if (id) {
      getPublicCard(id).then((card) => {
        setForm({
          name: card.name,
          shortDesc: card.short_description,
          category: card.category_id,
          richText: card.description,
        });
      });
    }
  }, [id]);

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

  const handleSave = async () => {
    setTouched({ name: true, shortDesc: true, category: true, richText: true });
    if (!validate()) return;

    setIsLoading(true);
    try {
      await updateCardContent(id, {
        name: form.name,
        short_description: form.shortDesc,
        description: form.richText,
        category_id: form.category!,
        deck_id: 2, // TODO: Replace with actual selected deck id if needed
        status: "published",
        read_time: 3,
        tags: "",
      });

      router.push("/dashboard/Card-Contents");
    } catch (error) {
      console.error("Failed to update card:", error);
    } finally {
      setTimeout(() => setIsLoading(false), 500);
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
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              onBlur={() => handleBlur("name")}
              className="border"
              disabled={isLoading}
            />
            {touched.name && errors.name && (
              <p className="text-red-500 text-xs">{errors.name[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="short_desc">Short Description</label>
            <Textarea
              id="short_desc"
              placeholder="Enter a short description"
              value={form.shortDesc}
              onChange={(e) => handleChange("shortDesc", e.target.value)}
              onBlur={() => handleBlur("shortDesc")}
              className="border"
              disabled={isLoading}
            />
            {touched.shortDesc && errors.shortDesc && (
              <p className="text-red-500 text-xs">{errors.shortDesc[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="category">Category</label>
            <Select
              value={form.category?.toString()}
              onValueChange={(value) => handleChange("category", Number(value))}
              onOpenChange={(isOpen) => !isOpen && handleBlur("category")}
              disabled={isLoading}
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
          <div className="space-y-2">
            <label>Card Content</label>
            <div onBlur={() => handleBlur("richText")}>
              <MuiTipTapEditor
                content={form.richText}
                onContentChange={(value) => handleChange("richText", value)}
                editable={!isLoading}
              />
            </div>
            {touched.richText && errors.richText && (
              <p className="text-red-500 text-xs">{errors.richText[0]}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}
