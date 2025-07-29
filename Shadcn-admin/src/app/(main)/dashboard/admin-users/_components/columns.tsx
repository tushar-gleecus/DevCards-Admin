"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Admin } from "@/types/admin";
import { Funnel, ListFilter, MoreVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useState } from "react";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends unknown, TValue> {
    label?: string;
  }
}

export const adminColumns = (
  handleEdit: (admin: Admin) => void,
  handleDelete: (admin: Admin) => void,
): ColumnDef<Admin>[] => {
  return [
    {
      id: "first_name",
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
      meta: { label: "First Name" },
    },
    {
      id: "last_name",
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
      meta: { label: "Last Name" },
    },
    {
      id: "email",
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
      meta: { label: "Email" },
    },
    {
      id: "role",
      accessorKey: "role",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <span>Role</span>
          <ListFilter
            className="text-muted-foreground h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
          <FilterDropdown column={column} options={["Admin", "SuperAdmin"]} />
        </div>
      ),
      cell: ({ row }) => <div>{row.getValue("role")}</div>,
      enableSorting: true,
      enableColumnFilter: true,
      meta: { label: "Role" },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const admin = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(admin)}>View</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(admin)} className="text-red-600">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};

// Custom filter dropdown with checkbox or input field
function FilterDropdown({ column, options }: { column: any; options?: string[] }) {
  const [value, setValue] = useState<string>();

  const applyFilter = () => {
    column.setFilterValue(value || undefined);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
          <img src="\funnel.svg" style={{ color: "#CBCDD1" }} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52 space-y-2 p-2">
        <DropdownMenuLabel>Filter</DropdownMenuLabel>
        {options ? (
          options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option}
              checked={value === option}
              onCheckedChange={(checked) => {
                setValue(checked ? option : undefined);
                column.setFilterValue(checked ? option : undefined);
              }}
            >
              {option}
            </DropdownMenuCheckboxItem>
          ))
        ) : (
          <Input
            placeholder="Contains..."
            value={value || ""}
            onChange={(e) => setValue(e.target.value)}
            onBlur={applyFilter}
          />
        )}

        <DropdownMenuSeparator />
        <Button variant="outline" size="sm" onClick={() => column.setFilterValue(undefined)}>
          Clear
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
