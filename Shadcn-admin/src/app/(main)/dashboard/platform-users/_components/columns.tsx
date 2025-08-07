"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Funnel, ListFilter, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useState } from "react";

// Inline PlatformUser type
type PlatformUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: "Pending" | "Done";
};

export const platformUserColumns = (handleDelete: (user: PlatformUser) => void): ColumnDef<PlatformUser>[] => [
  {
    accessorKey: "first_name",
    header: ({ column }) => (
      <div className="flex items-center gap-2">
        <span>First Name</span>
        <ListFilter
          className="text-muted-foreground h-4 w-4 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
        <FilterDropdown column={column} />
      </div>
    ),
    cell: ({ row }) => <div>{row.getValue("first_name")}</div>,
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      label: "First Name"
    }
  },
  {
    accessorKey: "last_name",
    header: ({ column }) => (
      <div className="flex items-center gap-2">
        <span>Last Name</span>
        <ListFilter
          className="text-muted-foreground h-4 w-4 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
        <FilterDropdown column={column} />
      </div>
    ),
    cell: ({ row }) => <div>{row.getValue("last_name")}</div>,
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      label: "Last Name"
    }
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <div className="flex items-center gap-2">
        <span>Email</span>
        <ListFilter
          className="text-muted-foreground h-4 w-4 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
        <FilterDropdown column={column} />
      </div>
    ),
    cell: ({ row }) => <div>{row.getValue("email")}</div>,
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      label: "Email"
    }
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <div className="flex items-center gap-2">
        <span>Status</span>
        {/* (Your filter/sort controls if any) */}
      </div>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as "Pending" | "Done";
      return (
        <span
          className={
            status === "Done"
              ? "inline-block rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
              : "inline-block rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700"
          }
        >
          {status}
        </span>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      label: "Status"
    }
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => handleDelete(user)}>
          <Trash2 className="text-destructive h-4 w-4" />
        </Button>
      );
    },
  },
];

// Filter dropdown for per-column filtering
function FilterDropdown({ column, options }: { column: any; options?: string[] }) {
  const [value, setValue] = useState<string>();
  const applyFilter = () => {
    column.setFilterValue(value || undefined);
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
          <Funnel className="text-muted-foreground h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52 space-y-2 p-2">
        {options ? (
          options.map((option) => (
            <DropdownMenuItem
              key={option}
              onClick={() => {
                setValue(option);
                column.setFilterValue(option);
              }}
              className={value === option ? "font-bold" : ""}
            >
              {option}
            </DropdownMenuItem>
          ))
        ) : (
          <Input
            placeholder="Contains..."
            value={value || ""}
            onChange={(e) => setValue(e.target.value)}
            onBlur={applyFilter}
          />
        )}
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => {
            setValue("");
            column.setFilterValue(undefined);
          }}
        >
          Clear
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
