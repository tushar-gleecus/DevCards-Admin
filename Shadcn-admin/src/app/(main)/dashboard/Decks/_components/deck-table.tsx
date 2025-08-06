'use client';
import { useState } from "react";
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
import { ActionButton } from "@/components/ui/ActionButton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MoreHorizontal,
  Funnel,
  ArrowUpAZ,
  Eye,
  EyeOff,
  Download,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { EditDeckDrawer } from "./edit-deck-drawer";
import type { Deck } from "@/lib/deckApi";

function truncateDescription(description: string, wordLimit: number) {
  const words = description.split(' ');
  if (words.length > wordLimit) {
    return words.slice(0, wordLimit).join(' ') + '...';
  }
  return description;
}

function exportCSV(data: any[], columns: { key: string; label: string }[], filename: string) {
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

type SortKey = keyof Pick<Deck, "name" | "description" | "status" | "created_at">;
type SortOrder = "asc" | "desc";

const COLUMN_CONFIG = [
  { key: "name", label: "Deck Name" },
  { key: "description", label: "Deck Description" },
  { key: "status", label: "Status" },
  { key: "created_at", label: "Created At" },
];

export function DecksDataTable({
  decks,
  onEditDeck,
  onDeleteDeck,
  loading,
}: {
  decks: Deck[];
  onEditDeck: (id: number, data: { name: string; description: string }) => void;
  onDeleteDeck: (id: number) => void;
  loading?: boolean;
}) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState("");
  const [editDeck, setEditDeck] = useState<Deck | null>(null);
  const [deckToDelete, setDeckToDelete] = useState<number | null>(null); // New state for deck to delete
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [visibleCols, setVisibleCols] = useState<Record<SortKey, boolean>>({
    name: true,
    description: true,
    status: true,
    created_at: true,
  });
  const [filterOpen, setFilterOpen] = useState<Partial<Record<SortKey, boolean>>>({});
  const [filters, setFilters] = useState<Partial<Record<SortKey, string>>>({});
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (deckToDelete) {
      setIsDeleting(true);
      try {
        await onDeleteDeck(deckToDelete);
        setDeckToDelete(null);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  function applyFilters(list: Deck[]): Deck[] {
    return list.filter((deck) => {
      return Object.entries(filters).every(([key, value]) => {
        const deckValue = String(deck[key as SortKey] ?? "").toLowerCase();
        return deckValue.includes(value?.toLowerCase() ?? "");
      });
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

  function toggleCol(key: SortKey) {
    setVisibleCols((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  let filteredDecks = decks.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase())
  );
  filteredDecks = applyFilters(filteredDecks);
  filteredDecks = filteredDecks.sort((a, b) => {
    const aVal = String(a[sortKey] ?? "").toLowerCase();
    const bVal = String(b[sortKey] ?? "").toLowerCase();
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(filteredDecks.length / rowsPerPage));
  const pageDecks = filteredDecks.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <div className="space-y-4">
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
                  checked={visibleCols[col.key as SortKey]}
                  onCheckedChange={() => toggleCol(col.key as SortKey)}
                >
                  {visibleCols[col.key as SortKey] ? (
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
                (col) => visibleCols[col.key as SortKey]
              );
              exportCSV(filteredDecks, exportCols, "decks.csv");
            }}
          >
            <Download className="h-4 w-4" />
            Export
          </ActionButton>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table className="bg-background">
<TableHeader className="bg-muted">
  <TableRow className="border-border">
    {COLUMN_CONFIG.filter((col) => visibleCols[col.key as SortKey]).map((col) => (
      <TableHead
        key={col.key}
        className="relative cursor-pointer select-none"
        onClick={() => handleSort(col.key as SortKey)}
      >
        <div className="flex items-center gap-1">
          {col.label}
          {/* Filter Icon */}
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
                onChange={(e) =>
                  setFilters((f) => ({ ...f, [col.key]: e.target.value }))
                }
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

          {/* Sort Arrow */}
          <ArrowUpAZ
            className={`h-4 w-4 transition-transform ${
              sortKey === col.key && sortOrder === "desc" ? "rotate-180" : ""
            }`}
          />
        </div>
      </TableHead>
    ))}
    <TableHead>Actions</TableHead>
  </TableRow>
</TableHeader>
          <TableBody>
            {pageDecks.map((deck: Deck) => (
              <TableRow key={deck.id} className="hover:bg-muted/40 border-b border-border transition">
                {visibleCols.name && <TableCell className="text-foreground">{deck.name}</TableCell>}
                {visibleCols.description && <TableCell className="text-foreground">{truncateDescription(deck.description, 5)}</TableCell>}
                {visibleCols.status && (
                  <TableCell>
                    <span
                      className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                        String(deck.status) === "Active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400"
                          : String(deck.status) === "Inactive"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-400"
                      }`}
                    >
                      {String(deck.status)}
                    </span>
                  </TableCell>
                )}
                {visibleCols.created_at && (
                  <TableCell>{new Date(deck.created_at).toLocaleDateString()}</TableCell>
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
                          setEditDeck(deck);
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          console.log("Attempting to delete deck with ID:", deck.id);
                          setDeckToDelete(deck.id);
                        }} // Open confirmation modal
                        className="text-red-600"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <span>
            Page {page} of {totalPages}
          </span>
          <span>|</span>
          <span>Total {filteredDecks.length} decks</span>
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
          <ActionButton variant="outline" size="sm" disabled={page === 1} onClick={async () => { setPage((p) => Math.max(1, p - 1)); await new Promise(res => setTimeout(res, 400)); }}>
            Previous
          </ActionButton>
          <ActionButton
            variant="outline"
            size="sm"
            disabled={page === totalPages || totalPages === 0}
            onClick={async () => { setPage((p) => Math.min(totalPages, p + 1)); await new Promise(res => setTimeout(res, 400)); }}
          >
            Next
          </ActionButton>
        </div>
      </div>

      <div>
        <EditDeckDrawer
          deck={editDeck}
          onClose={() => setEditDeck(null)}
          onSave={onEditDeck}
        />
        <EditDeckDrawer
          deck={editDeck}
          onClose={() => setEditDeck(null)}
          onSave={onEditDeck}
        />
      </div>

      {/* Confirmation Modal for Delete */}
      <AlertDialog open={!!deckToDelete} onOpenChange={(open) => {
        console.log("AlertDialog onOpenChange. Open state:", open);
        !open && setDeckToDelete(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              deck.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeckToDelete(null)} disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}