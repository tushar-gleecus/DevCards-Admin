"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { EditDeckDialog } from "./edit-deck-dialog";
import type { Deck } from "@/lib/deckApi";

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
  onEditDeck: (id: number, data: Deck) => void;
  onDeleteDeck: (id: number) => void;
  loading?: boolean;
}) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState("");
  const [editDeck, setEditDeck] = useState<Deck | null>(null);
  const [editOpen, setEditOpen] = useState(false);
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
              <Button size="sm" variant="outline" className="flex gap-1">
                <Eye className="h-4 w-4" />
                <span>Columns</span>
              </Button>
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
          <Button
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
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
<TableHeader className="bg-muted">
  <TableRow>
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
              <Button variant="ghost" size="icon" className="h-6 w-6 p-1">
                <Funnel className="h-4 w-4 text-muted-foreground" />
              </Button>
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
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full"
                onClick={() => setFilters((f) => ({ ...f, [col.key]: "" }))}
              >
                Clear Filter
              </Button>
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
              <TableRow key={deck.id} className="hover:bg-muted/40 border-b transition">
                {visibleCols.name && <TableCell>{deck.name}</TableCell>}
                {visibleCols.description && <TableCell>{deck.description}</TableCell>}
                {visibleCols.status && (
                  <TableCell>
                    <span
                      className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                        String(deck.status) === "Active"
                          ? "bg-green-100 text-green-800"
                          : String(deck.status) === "Inactive"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-700"
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
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditDeck(deck);
                          setEditOpen(true);
                        }}
                      >
                        View/Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDeleteDeck(deck.id)} className="text-red-600">
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

      <EditDeckDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        deck={editDeck}
        onSave={onEditDeck}
      />
    </div>
  );
}
