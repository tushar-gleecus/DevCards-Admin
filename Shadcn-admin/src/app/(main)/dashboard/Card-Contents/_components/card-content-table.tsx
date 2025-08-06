"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
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
import { Eye, EyeOff, MoreHorizontal, ArrowUpAZ, Funnel, Download, Loader2 } from "lucide-react";
import type { CardContent } from "@/types/card-content";

const COLUMN_CONFIG = [
  { key: "name", label: "Name" },
  { key: "short_desc", label: "Short Description" },
  { key: "deck_name", label: "Deck" },
  { key: "category_name", label: "Category" },
  { key: "status", label: "Status" },
];

function exportCSV(
  data: any[],
  columns: { key: string; label: string }[],
  filename: string
) {
  const csvRows = [
    columns.map((col) => `\"${col.label}\"`).join(","),
    ...data.map((row) =>
      columns.map((col) => `\"${String(row[col.key] ?? "")}\"`).join(",")
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

type SortKey = keyof Pick<CardContent, "name" | "status"> | "deck_name" | "category_name" | "short_desc";
type SortOrder = "asc" | "desc";

export function CardContentTable({
  data,
  categoryMap,
  loading,
  onEdit,
  onDelete,
  onUpdateStatus,
  onView,
}: {
  data: CardContent[];
  categoryMap: Record<number, { name: string; deckName: string }>;
  loading: boolean;
  onEdit: (data: CardContent) => void;
  onDelete: (id: number) => void;
  onUpdateStatus: (data: CardContent) => void;
  onView: (data: CardContent) => void;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [visibleCols, setVisibleCols] = useState<Record<SortKey, boolean>>({
    name: true,
    short_desc: true,
    deck_name: true,
    category_name: true,
    status: true,
  });
  const [filters, setFilters] = useState<Partial<Record<SortKey, string>>>({});
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteCardId, setDeleteCardId] = useState<number | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (deleteCardId) {
      setIsDeleting(true);
      try {
        await onDelete(deleteCardId);
        setConfirmDeleteOpen(false);
        setDeleteCardId(null);
      } finally {
        setTimeout(() => setIsDeleting(false), 500);
      }
    }
  };
  const [filterOpen, setFilterOpen] = useState<{
    [key in SortKey]?: boolean;
  }>({});

  const filtered = data
    .filter((row) => {
      return Object.entries(filters).every(([key, val]) => {
        const rowValue = key === 'deck_name' ? categoryMap[row.category_id]?.deckName : key === 'category_name' ? categoryMap[row.category_id]?.name : row[key as keyof CardContent];
        return rowValue?.toString().toLowerCase().includes(val.toLowerCase());
      });
    })
    .filter(
      (row) =>
        row.name.toLowerCase().includes(search.toLowerCase()) ||
        row.short_description.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = (a[sortKey as keyof CardContent]?.toString() ?? "").toLowerCase();
      const bVal = (b[sortKey as keyof CardContent]?.toString() ?? "").toLowerCase();
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const pagedData = filtered.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const toggleCol = (key: SortKey) => {
    setVisibleCols((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const truncate = (text: string, words: number) => {
    if (!text) return "";
    return text.split(" ").slice(0, words).join(" ") + (text.split(" ").length > words ? "..." : "");
  };

  const capitalize = (s: string | null) => {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between gap-2">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline"><Eye className="h-4 w-4 mr-2" /> Columns</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {COLUMN_CONFIG.map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.key}
                    checked={visibleCols[col.key as SortKey]}
                    onCheckedChange={() => toggleCol(col.key as SortKey)}
                  >
                    {visibleCols[col.key as SortKey] ? <Eye className="mr-2 h-4 w-4" /> : <EyeOff className="mr-2 h-4 w-4" />}
                    {col.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              variant="outline"
              className="flex gap-1"
              onClick={() => {
                const exportCols = COLUMN_CONFIG.filter(
                  (col) => visibleCols[col.key as keyof typeof visibleCols]
                );
                exportCSV(filtered, exportCols, "card-content.csv");
              }}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                {COLUMN_CONFIG.filter((c) => visibleCols[c.key as SortKey]).map((col) => (
                  <TableHead
                    key={col.key}
                    onClick={() => setSortKey(col.key as SortKey)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-1">
                          {col.label}
                          <DropdownMenu
                            open={filterOpen[col.key as SortKey]}
                            onOpenChange={(open) =>
                              setFilterOpen((fo) => ({ ...fo, [col.key]: open }))
                            }
                          >
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="ml-1 h-6 w-6 px-1"
                              >
                                <Funnel className="text-muted-foreground h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                              <div className="px-2 py-2">
                                <div className="text-muted-foreground mb-1 text-xs">
                                  Filter by {col.label}
                                </div>
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
                              sortKey === col.key && sortOrder === "desc"
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </div>
                  </TableHead>
                ))}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={COLUMN_CONFIG.length + 1} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : (
                pagedData.map((item) => (
                  <TableRow key={item.id}>
                    {visibleCols.name && <TableCell>{item.name}</TableCell>}
                    {visibleCols.short_desc && <TableCell>{truncate(item.short_description, 4)}</TableCell>}
                    {visibleCols.deck_name && <TableCell>{categoryMap[item.category_id]?.deckName}</TableCell>}
                    {visibleCols.category_name && <TableCell>{categoryMap[item.category_id]?.name}</TableCell>}
                    {visibleCols.status && (
                      <TableCell>
                        <span
                          className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                            item.status.toLowerCase() === "published"
                              ? "bg-green-100 text-green-800"
                              : item.status.toLowerCase() === "draft"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {capitalize(item.status)}
                        </span>
                      </TableCell>
                    )}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(item)}>
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/Card-Contents/edit/${item.id}`)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateStatus(item)}>
                            Update Status
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setDeleteCardId(item.id || null);
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

        <div className="flex items-center justify-between">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <span>
              Page {page} of {totalPages}
            </span>
            <span>|</span>
            <span>Total {filtered.length} cards</span>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="rows-per-page" className="text-sm">
              Rows per page:</label>
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
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
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
      </div>

      <AlertDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              card.
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
    </>
  );
}