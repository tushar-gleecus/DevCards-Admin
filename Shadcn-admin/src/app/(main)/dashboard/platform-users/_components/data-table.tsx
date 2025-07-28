"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Eye, Download } from "lucide-react";

// CSV export helper
function exportToCSV<T>(rows: T[], columns: ColumnDef<T>[], filename = "data.csv") {
  // Only include columns with an accessorKey
  const dataCols = columns.filter((col: any) => col.accessorKey);

  // Improved header extraction for export
  const headers = dataCols.map((col: any) => {
    if (typeof col.header === "string") return col.header;
    if (typeof col.header === "function") {
      // Try to render header function with fake context for text extraction
      const rendered = col.header({ column: { columnDef: col } } as any);
      if (typeof rendered === "string") return rendered;
      if (rendered && rendered.props) {
        if (typeof rendered.props.children === "string") return rendered.props.children;
        if (Array.isArray(rendered.props.children)) {
          return rendered.props.children
            .map((child: any) => (typeof child === "string" ? child : child?.props?.children || ""))
            .join(" ");
        }
      }
    }
    // Fallback to accessorKey
    return col.accessorKey || col.id || "";
  });

  // Get each row as an array of cell values for each accessorKey
  const csvRows = rows.map((row) =>
    dataCols
      .map((col: any) => {
        const accessor = col.accessorKey;
        return accessor ? String((row as any)[accessor] ?? "") : "";
      })
      .join(","),
  );

  const csvContent = [headers.join(","), ...csvRows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

type DataTableProps<TData> = {
  columns: ColumnDef<TData>[];
  data: TData[];
  enableExport?: boolean;
  enableColumnToggle?: boolean;
};

export function DataTable<TData>({
  columns,
  data,
  enableExport = true,
  enableColumnToggle = true,
}: DataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // For CSV export: get only filtered & sorted rows & visible columns
  const filteredRows = useMemo(() => table.getRowModel().rows.map((r) => r.original), [table.getRowModel().rows]);
  const visibleCols = useMemo(
    () =>
      table
        .getAllLeafColumns()
        .filter((col) => col.getIsVisible())
        .map((col) => col.columnDef),
    [table.getAllLeafColumns()],
  );

  // All columns for toggling
  const toggleableColumns = table.getAllLeafColumns().filter(
    (col) => col.id !== "actions", // don't allow hiding actions
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder="Search..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-xs border border-zinc-400 focus:border-zinc-600"
        />

        <div className="flex items-center gap-2">
          {enableColumnToggle && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Eye className="h-4 w-4" /> Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {toggleableColumns.map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={col.getIsVisible()}
                    onCheckedChange={() => col.toggleVisibility()}
                  >
                    {col.id.charAt(0).toUpperCase() + col.id.slice(1).replace("_", " ")}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {enableExport && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={() => exportToCSV(filteredRows, visibleCols, "platform-users.csv")}
            >
              <Download className="h-4 w-4" /> Export
            </Button>
          )}
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- Pagination Bar --- */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-2">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">
            Page <strong>{table.getState().pagination.pageIndex + 1}</strong> of <strong>{table.getPageCount()}</strong>
          </span>
          <select
            className="ml-4 rounded border border-zinc-300 px-2 py-1 text-sm"
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {[20, 40, 50, 80, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
