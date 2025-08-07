"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Admin } from "@/types/admin";
import { Funnel, ListFilter, MoreVertical } from "lucide-react";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends unknown, TValue> {
    label?: string;
  }
}

const RoleChanger = ({
  row,
  onRoleChange,
  currentUserRole,
}: {
  row: any;
  onRoleChange: (admin: Admin, newRole: "Admin" | "SuperAdmin") => void;
  currentUserRole: "Admin" | "SuperAdmin";
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const admin = row.original as Admin;

  const handleRoleChange = async (newRole: "Admin" | "SuperAdmin") => {
    if (currentUserRole !== "SuperAdmin") {
      toast.info("Only Super Admins have this privilege. Please contact support.");
      return;
    }
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onRoleChange(admin, newRole);
      toast.success("Role updated successfully!");
    } catch (error) {
      toast.error("Failed to update role.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-32 h-10 rounded-md">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <Select
      defaultValue={row.getValue("role")}
      onValueChange={handleRoleChange}
    >
      <SelectTrigger
        className={`w-32 ${isLoading || currentUserRole !== "SuperAdmin" ? 'border-transparent opacity-50' : ''}`}
        onClick={() => {
          if (currentUserRole !== "SuperAdmin") {
            toast.info("Only Super Admins have this privilege. Please contact support.");
          }
        }}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Admin">Admin</SelectItem>
        <SelectItem value="SuperAdmin">Super Admin</SelectItem>
      </SelectContent>
    </Select>
  );
};

export const adminColumns = (
  handleEdit: (admin: Admin) => void,
  handleDelete: (admin: Admin) => void,
  onRoleChange: (admin: Admin, newRole: "Admin" | "SuperAdmin") => void,
  currentUserRole: "Admin" | "SuperAdmin",
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
      cell: ({ row }) => (
        <RoleChanger row={row} onRoleChange={onRoleChange} />
      ),
      enableSorting: true,
      enableColumnFilter: true,
      meta: { label: "Role" },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const admin = row.original;
        const isDeleteDisabled = currentUserRole !== "SuperAdmin";

        const handleDeleteClick = () => {
          if (isDeleteDisabled) {
            toast.info("Only Super Admins have this privilege. Please contact support.");
          } else {
            handleDelete(admin);
          }
        };

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(admin)}>Edit</DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDeleteClick}
                className={`text-red-600 ${isDeleteDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
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
