"use client";

import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Eye, Download } from "lucide-react";
import { CardTitle, CardDescription } from "@/components/ui/card";

interface ToolbarProps<TData> {
  table: Table<TData>;
  exportData: () => void;
}

export function Toolbar<TData>({ table, exportData }: ToolbarProps<TData>) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <CardTitle>Platform Users</CardTitle>
        <CardDescription>Manage users registered on your platform.</CardDescription>
      </div>
      <div className="flex flex-1 items-center justify-end gap-2">
        <Input
          placeholder="Search..."
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex gap-2">
              <Eye className="h-4 w-4" />
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="text-muted-foreground px-2 py-1 text-xs font-medium">
              Toggle columns
            </div>
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          size="sm"
          className="flex gap-2"
          onClick={exportData}
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  );
}