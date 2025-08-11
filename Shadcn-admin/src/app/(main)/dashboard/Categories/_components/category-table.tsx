"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/ui/ActionButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { EditCategoryDrawer } from "./edit-category-drawer";
import { MoreHorizontal, Funnel, ArrowUpAZ, Eye, EyeOff, Download, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Category as APICategory } from "@/lib/categoryApi";
import { UIDeck, UICategory } from "@/types/category-ui";

type CategoryTableProps = {
  categories: UICategory[];
  decks: UIDeck[];
  onEditCategory: (
    id: number,
    data: { name: string; description: string; deckId: number; status: string }
  ) => void;
  onDeleteCategory: (id: number) => void;
  loading?: boolean;
};

// Helper for CSV export
function exportCSV(
  data: any[],
  columns: { key: string; label: string }[],
  filename: string
) {
  const csvRows = [
    columns.map((col) => `"${col.label}"`).join(","),
    ...data.map((row) =>
      columns.map((col) => `"${String(row[col.key] ?? "")}"`).join(",")
    ),
  ];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
a.href = url;
a.download = filename;
a.click();
  window.URL.revokeObjectURL(url);
}

function truncateDescription(description: string, wordLimit: number) {
  const words = description.split(' ');
  if (words.length > wordLimit) {
    return words.slice(0, wordLimit).join(' ') + '...';
  }
  return description;
}

type SortKey = "name" | "description" | "deck_name" | "status";
type SortOrder = "asc" | "desc";

const COLUMN_CONFIG = [
  { key: "name", label: "Category Name" },
  { key: "description", label: "Category Description" },
  { key: "deck_name", label: "Deck" },
  { key: "status", label: "Status" },
  { key: "created_at", label: "Created At" },
];

import { categoryColumns } from "./columns";

export function CategoryTable({
  categories,
  decks,
  onEditCategory,
  onDeleteCategory,
  loading,
}: CategoryTableProps) {
  const columns = categoryColumns(decks);
  console.log("CategoryTable - Received categories prop:", categories);
  const [editCategory, setEditCategory] = useState<UICategory | null>(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [search, setSearch] = useState("");
  const [visibleCols, setVisibleCols] = useState({
    name: true,
    description: true,
    deck_name: true,
    status: true,
    created_at: true,
  });
  const [filterOpen, setFilterOpen] = useState<{ [key in SortKey]?: boolean }>(
    {}
  );
  const [filters, setFilters] = useState<{ [key in SortKey]?: string }>({});
  const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (deleteCategoryId) {
      setIsDeleting(true);
      try {
        await onDeleteCategory(deleteCategoryId);
        setConfirmDeleteOpen(false);
        setDeleteCategoryId(null);
      } finally {
        setTimeout(() => setIsDeleting(false), 500);
      }
    }
  }

  function applyFilters(list: UICategory[]): UICategory[] {
    return list.filter((category) => {
      if (
        filters.name &&
        !category.name.toLowerCase().includes(filters.name.toLowerCase())
      )
        return false;
      if (
        filters.description &&
        !category.description
          .toLowerCase()
          .includes(filters.description.toLowerCase())
      )
        return false;
      if (
        filters.deck_name &&
        !category.deck_name
          .toLowerCase()
          .includes(filters.deck_name.toLowerCase())
      )
        return false;
      if (filters.status && category.status.toLowerCase() !== filters.status.toLowerCase())
        return false;
      return true;
    });
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  }

  let filteredCategories = categories
    .map((cat) => ({
      ...cat,
      deck_name: decks.find((d) => d.id === Number(cat.deckId))?.name || cat.deck_name,
    }))
    .filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
    );

  filteredCategories = applyFilters(filteredCategories);
  filteredCategories = filteredCategories.sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    
    // Fallback for other types or if comparison is not string
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCategories.length / rowsPerPage)
  );
  const pageCategories = filteredCategories.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  function toggleCol(key: keyof typeof visibleCols) {
    setVisibleCols((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="space-y-4">
  <Card className="bg-background shadow-sm">
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <Input
              type="text"
              placeholder="Search..."
              className="max-w-sm"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <ActionButton size="sm" variant="outline" className="flex gap-1" onClick={() => {}}>
                    <Eye className="h-4 w-4" />
                    <span>Columns</span>
                  </ActionButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {COLUMN_CONFIG.map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col.key}
                      checked={visibleCols[col.key as keyof typeof visibleCols]}
                      onCheckedChange={() => toggleCol(col.key as keyof typeof visibleCols)}
                    >
                      {visibleCols[col.key as keyof typeof visibleCols] ? (
                        <Eye className="mr-2 inline h-4 w-4" />
                      ) : (
                        <EyeOff className="mr-2 inline h-4 w-4" />
                      )}
                      {col.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <ActionButton
                size="sm"
                variant="outline"
                className="flex gap-1"
                onClick={() => {
                  const exportCols = COLUMN_CONFIG.filter(
                    (col) => visibleCols[col.key as keyof typeof visibleCols]
                  );
                  exportCSV(filteredCategories, exportCols, "categories.csv");
                }}
              >
                <Download className="h-4 w-4" />
                Export
              </ActionButton>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground py-12 text-center">
              Loading categories...
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg">
              <Table className="bg-background">
                <TableHeader className="bg-muted">
                  <TableRow>
                    {COLUMN_CONFIG.filter((col) => visibleCols[col.key as keyof typeof visibleCols]).map((col) => (
                      <TableHead
                        key={col.key}
                        className="relative cursor-pointer select-none"
                        onClick={() => handleSort(col.key as SortKey)}
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          <DropdownMenu
                            open={filterOpen[col.key as SortKey]}
                            onOpenChange={(open) => setFilterOpen((fo) => ({ ...fo, [col.key]: open }))}
                          >
                            <DropdownMenuTrigger asChild>
                              <ActionButton variant="ghost" size="icon" className="h-6 w-6 p-1" onClick={() => {}}>
                                <Funnel className="h-4 w-4 text-muted-foreground" />
                              </ActionButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48 p-2">
                              <div className="text-xs text-muted-foreground mb-1">
                                Filter by {col.label}
                              </div>
                              <Input
                                className="w-full rounded border px-2 py-1 text-sm"
                                placeholder="Contains..."
                                value={filters[col.key as SortKey] ?? ""}
                                onChange={(e) => setFilters((f) => ({ ...f, [col.key]: e.target.value }))}
                              />
                              <ActionButton
                                variant="ghost"
                                size="sm"
                                className="mt-2 w-full"
                                onClick={() => setFilters((f) => ({ ...f, [col.key]: "" }))}
                              >
                                Clear Filter
                              </ActionButton>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <ArrowUpAZ
                            className={`h-4 w-4 transition-transform ${sortKey === col.key && sortOrder === "desc" ? "rotate-180" : ""}`}
                          />
                        </div>
                      </TableHead>
                    ))}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageCategories.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={COLUMN_CONFIG.length + 1}
                        className="text-muted-foreground py-6 text-center"
                      >
                        No categories found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pageCategories.map((cat) => (
                      <TableRow key={cat.id} className="hover:bg-muted/40 border-b border-border transition">
                        {visibleCols.name && <TableCell className="text-foreground">{cat.name}</TableCell>}
                        {visibleCols.description && (
                          <TableCell className="text-foreground">{truncateDescription(cat.description, 5)}</TableCell>
                        )}
                        {visibleCols.deck_name && (
                          <TableCell className="text-foreground">{cat.deck_name}</TableCell>
                        )}
                        {visibleCols.status && (
                          <TableCell>
                            <span
                              className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                                cat.status === "Active"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400"
                                  : cat.status === "Inactive"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-400"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-400"
                              }`}
                            >
                              {cat.status}
                            </span>
                          </TableCell>
                        )}
                        {visibleCols.created_at && (
                          <TableCell className="text-foreground">
                            {new Date(cat.created_at).toLocaleDateString()}
                          </TableCell>
                        )}
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <ActionButton variant="ghost" size="icon" onClick={() => {}}>
                                <MoreHorizontal className="h-4 w-4" />
                              </ActionButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditCategory(cat);
                                }}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setDeleteCategoryId(Number(cat.id));
                                  setConfirmDeleteOpen(true);
                                }}
                                className="text-red-600"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <span>
            Page {page} of {totalPages}
          </span>
          <span>|</span>
          <span>Total {filteredCategories.length} categories</span>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="rows-per-page" className="text-sm">
            Rows per page:
          </label>
          <select
            id="rows-per-page"
            className="rounded border px-2 py-1 text-sm"
            value={rowsPerPage}
            onChange={(e) => {
              setPage(1);
              setRowsPerPage(Number(e.target.value));
            }}
          >
            {[10, 20, 30, 40, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>

      <EditCategoryDrawer
        category={editCategory}
        decks={decks}
        onClose={() => setEditCategory(null)}
        onSave={(id, data) => {
          onEditCategory(id, data);
          setEditCategory(null);
        }}
      />
      <AlertDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : "Confirm Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}