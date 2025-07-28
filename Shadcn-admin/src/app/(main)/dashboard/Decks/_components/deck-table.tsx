"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Funnel, ArrowUpAZ, Eye, EyeOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input"; // Import Input component
import { EditDeckDialog } from "./edit-deck-dialog";
import type { Deck } from "@/lib/deckApi"; // <-- IMPORTANT

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

type SortKey = "name" | "description";
type SortOrder = "asc" | "desc";

const COLUMN_CONFIG = [
  { key: "name", label: "Deck Name" },
  { key: "description", label: "Deck Description" },
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
  // Table state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState("");
  const [editDeck, setEditDeck] = useState<Deck | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // Sorting
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Column visibility (toggling)
  const [visibleCols, setVisibleCols] = useState({
    name: true,
    description: true,
  });

  // Filter modals
  const [filterOpen, setFilterOpen] = useState<{ [key in SortKey]?: boolean }>({});
  const [filters, setFilters] = useState<{ [key in SortKey]?: string }>({});

  // --- Filter Logic
  function applyFilters(list: Deck[]): Deck[] {
    return list.filter((deck) => {
      if (filters.name && !deck.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.description && !deck.description.toLowerCase().includes(filters.description.toLowerCase()))
        return false;
      return true;
    });
  }

  // --- Sorting
  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  }

  // --- Data pipeline: search, filter, sort, paginate
  let filteredDecks = decks.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) || d.description.toLowerCase().includes(search.toLowerCase()),
  );
  filteredDecks = applyFilters(filteredDecks);
  filteredDecks = filteredDecks.sort((a, b) => {
    const aVal = a[sortKey].toLowerCase();
    const bVal = b[sortKey].toLowerCase();
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(filteredDecks.length / rowsPerPage));
  const pageDecks = filteredDecks.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Column toggling
  function toggleCol(key: SortKey) {
    setVisibleCols((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  // Render
  return (
    <div className="space-y-4">
      {/* Search bar and column visibility/export */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <Input
          type="text"
          placeholder="Search decks..."
          className="max-w-sm"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <div className="flex gap-2">
          {/* Column toggling */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="flex gap-1">
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
          {/* Export */}
          <Button
            size="sm"
            variant="outline"
            className="flex gap-1"
            onClick={() => {
              const exportCols = COLUMN_CONFIG.filter((col) => visibleCols[col.key as SortKey]);
              exportCSV(filteredDecks, exportCols, "decks.csv");
            }}
          >
            Export
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-muted-foreground py-12 text-center">Loading decks...</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                {visibleCols.name && (
                  <TableHead className="relative cursor-pointer select-none" onClick={() => handleSort("name")}>
                    Deck Name
                    {/* Filter and Sort Icons */}
                    <DropdownMenu
                      open={filterOpen.name}
                      onOpenChange={(open) => setFilterOpen((fo) => ({ ...fo, name: open }))}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="ml-1 h-6 w-6 px-1">
                          <Funnel className="text-muted-foreground h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        <div className="px-2 py-2">
                          <div className="text-muted-foreground mb-1 text-xs">Filter by Deck Name</div>
                          <Input
                            className="w-full rounded border px-2 py-1 text-sm"
                            placeholder="Contains..."
                            value={filters.name ?? ""}
                            onChange={(e) =>
                              setFilters((f) => ({
                                ...f,
                                name: e.target.value,
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
                                name: "",
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
                        sortKey === "name" && sortOrder === "desc" ? "rotate-180" : ""
                      }`}
                    />
                  </TableHead>
                )}
                {visibleCols.description && (
                  <TableHead className="relative cursor-pointer select-none" onClick={() => handleSort("description")}>
                    Deck Description
                    {/* Filter and Sort Icons */}
                    <DropdownMenu
                      open={filterOpen.description}
                      onOpenChange={(open) => setFilterOpen((fo) => ({ ...fo, description: open }))}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="ml-1 h-6 w-6 px-1">
                          <Funnel className="text-muted-foreground h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        <div className="px-2 py-2">
                          <div className="text-muted-foreground mb-1 text-xs">Filter by Description</div>
                          <Input
                            className="w-full rounded border px-2 py-1 text-sm"
                            placeholder="Contains..."
                            value={filters.description ?? ""}
                            onChange={(e) =>
                              setFilters((f) => ({
                                ...f,
                                description: e.target.value,
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
                                description: "",
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
                        sortKey === "description" && sortOrder === "desc" ? "rotate-180" : ""
                      }`}
                    />
                  </TableHead>
                )}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageDecks.map((deck) => (
                <TableRow key={deck.id} className="hover:bg-muted/40 border-b transition">
                  {visibleCols.name && <TableCell>{deck.name}</TableCell>}
                  {visibleCols.description && <TableCell>{deck.description}</TableCell>}
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
      )}
      {/* Pagination controls */}
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
      {/* Edit Dialog */}
      <EditDeckDialog open={editOpen} onOpenChange={setEditOpen} deck={editDeck} onSave={onEditDeck} />
    </div>
  );
}
