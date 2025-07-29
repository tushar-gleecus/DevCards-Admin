"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { EditCategoryDialog } from "./edit-category-dialog";
import { MoreHorizontal, Funnel, ArrowUpAZ, Eye, EyeOff } from "lucide-react";
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


// UI prop types
type UIDeck = { id: string; name: string };
type UICategory = {
  id: string;
  name: string;
  description: string;
  deckId: string;
  deck_name: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  created_by?: any;
  updated_by?: any;
};

type CategoryTableProps = {
  categories: UICategory[];
  decks: UIDeck[];
  onEditCategory: (id: string, data: { name: string; description: string; deckId: string }) => void;
  onDeleteCategory: (id: string) => void;
  loading?: boolean;
};

// Helper for CSV export
function exportCSV(data: any[], columns: { key: string; label: string }[], filename: string) {
  const csvRows = [
    columns.map((col) => `\"${col.label}\"`).join(","),
    ...data.map((row) => columns.map((col) => `\"${String(row[col.key] ?? "")}\"`).join(",")),
  ];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

type SortKey = "name" | "description" | "deck_name" | "status";
type SortOrder = "asc" | "desc";

const COLUMN_CONFIG = [
  { key: "name", label: "Name" },
  { key: "description", label: "Description" },
  { key: "deck_name", label: "Deck" },
  { key: "status", label: "Status" },
  { key: "created_at", label: "Created At" },
];

export function CategoryTable({ categories, decks, onEditCategory, onDeleteCategory, loading }: CategoryTableProps) {
  const [editCategory, setEditCategory] = useState<UICategory | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [visibleCols, setVisibleCols] = useState({
    name: true,
    description: true,
    deck_name: true,
    status: true,
    created_at: true,
  });
  const [filterOpen, setFilterOpen] = useState<{ [key in SortKey]?: boolean }>({});
  const [filters, setFilters] = useState<{ [key in SortKey]?: string }>({});
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);


  function applyFilters(list: UICategory[]): UICategory[] {
    return list.filter((category) => {
      if (filters.name && !category.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.description && !category.description.toLowerCase().includes(filters.description.toLowerCase()))
        return false;
      if (filters.deck_name && !category.deck_name.toLowerCase().includes(filters.deck_name.toLowerCase()))
        return false;
      if (filters.status && category.status.toString() !== filters.status) return false;
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

  let filteredCategories = categories.map((cat) => ({
    ...cat,
    deck_name: decks.find((d) => d.id === cat.deckId)?.name || cat.deck_name,
  }));

  filteredCategories = applyFilters(filteredCategories);
  filteredCategories = filteredCategories.sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];

    if (typeof aVal === "boolean" && typeof bVal === "boolean") {
      if (aVal === bVal) return 0;
      if (sortOrder === "asc") return aVal ? -1 : 1;
      return aVal ? 1 : -1;
    }

    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();

    if (aStr < bStr) return sortOrder === "asc" ? -1 : 1;
    if (aStr > bStr) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / rowsPerPage));
  const pageCategories = filteredCategories.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  function toggleCol(key: keyof typeof visibleCols) {
    setVisibleCols((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      {loading ? (
        <div className="text-muted-foreground py-12 text-center">Loading categories...</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                {COLUMN_CONFIG.map(
                  (col) =>
                    visibleCols[col.key as keyof typeof visibleCols] && (
                      <TableHead
                        key={col.key}
                        className="relative cursor-pointer select-none"
                        onClick={() => handleSort(col.key as SortKey)}
                      >
                        {col.label}
                        <DropdownMenu
                          open={filterOpen[col.key as SortKey]}
                          onOpenChange={(open) => setFilterOpen((fo) => ({ ...fo, [col.key]: open }))}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="ml-1 h-6 w-6 px-1">
                              <Funnel className="text-muted-foreground h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-48">
                            <div className="px-2 py-2">
                              <div className="text-muted-foreground mb-1 text-xs">Filter by {col.label}</div>
                              <input
                                className="w-full rounded border px-2 py-1 text-sm"
                                placeholder="Contains..."
                                value={filters[col.key as SortKey] ?? ""}
                                onChange={(e) =>
                                  setFilters((f) => ({
                                    ...f,
                                    [col.key]: e.target.value,
                                  }))
                                }
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2 w-full"
                                onClick={() =>
                                  setFilters((f) => ({
                                    ...f,
                                    [col.key]: "",
                                  }))
                                }
                              >
                                Clear Filter
                              </Button>
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <ArrowUpAZ
                          className={`ml-1 inline h-4 w-4 cursor-pointer align-middle transition-transform ${
                            sortKey === col.key && sortOrder === "desc" ? "rotate-180" : ""
                          }`}
                        />
                      </TableHead>
                    ),
                )}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={COLUMN_CONFIG.length + 1} className="text-muted-foreground py-6 text-center">
                    No categories found.
                  </TableCell>
                </TableRow>
              ) : (
                pageCategories.map((cat) => (
                  <TableRow key={cat.id}>
                    {visibleCols.name && <TableCell>{cat.name}</TableCell>}
                    {visibleCols.description && <TableCell>{cat.description}</TableCell>}
                    {visibleCols.deck_name && <TableCell>{cat.deck_name}</TableCell>}
                    {visibleCols.status && (
                      <TableCell>
  <span
    className={`inline-block rounded px-2 py-1 text-xs font-medium ${
      String(cat.status) === "Active"
        ? "bg-green-100 text-green-800"
        : String(cat.status) === "Inactive"
        ? "bg-yellow-100 text-yellow-800"
        : "bg-gray-100 text-gray-700"
    }`}
  >
    {String(cat.status)}
  </span>
</TableCell>

                    )}
                    {visibleCols.created_at && <TableCell>{new Date(cat.created_at).toLocaleDateString()}</TableCell>}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditCategory(cat);
                              setEditOpen(true);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
  onClick={() => {
    setDeleteCategoryId(cat.id);
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
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
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

      <EditCategoryDialog
        open={editOpen}
        setOpen={setEditOpen}
        category={editCategory}
        decks={decks}
        onSave={(data) => {
          if (editCategory) onEditCategory(editCategory.id, data);
        }}
      />
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete this category.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction
        className="bg-destructive text-white hover:bg-destructive/90"
        onClick={() => {
          if (deleteCategoryId) {
            onDeleteCategory(deleteCategoryId);
            setConfirmDeleteOpen(false);
            setDeleteCategoryId(null);
          }
        }}
      >
        Confirm Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

    </div>
    
  );
}
