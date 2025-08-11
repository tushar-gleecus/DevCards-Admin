//platform-user
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { DataTable } from "./_components/data-table"; // Corrected path
import { platformUserColumns } from "./_components/columns";
import { PlatformUser } from "@/types/platform-user";
import { ViewUserDrawer } from "./_components/view-user-drawer";
import { DeleteUserDialog } from "./_components/delete-user-dialog"; // Corrected path
import { DataTablePagination } from "./_components/data-table-pagination"; // Corrected path
import { Toolbar } from "./_components/toolbar"; // Corrected path

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbLink,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { toast } from "sonner";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";
import apiClient from "@/lib/api-client";

import { SectionCards } from "./_components/SectionCards";
import { ChartAreaInteractive } from "./_components/ChartAreaInteractive"; // Import the actual graph component

export default function PlatformUsersPage() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const fetchUsers = useCallback(async () => {
    try {
      const res = await apiClient.get("/api/users/"); // Assuming API endpoint for platform users
      setUsers(res.data);
    } catch (err) {
      toast.error("Could not load platform users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleView = useCallback((user: PlatformUser) => {
    setSelectedUser(user);
    setViewOpen(true);
  }, []);

  const handleDelete = useCallback((user: PlatformUser) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedUser) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/api/users/${selectedUser.id}/`); // Assuming API endpoint for deleting user
      setDeleteOpen(false);
      toast.success("Platform user deleted successfully!");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Error deleting platform user.");
    } finally {
      setIsDeleting(false);
    }
  }, [selectedUser, fetchUsers]);

  const columns = useMemo(
    () => platformUserColumns(handleView, handleDelete),
    [handleView, handleDelete]
  );

  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  function exportToCSV(data: PlatformUser[], filename: string) {
    if (!data.length) return;
    const headers = table
      .getVisibleLeafColumns()
      .map((c) => c.columnDef.meta?.label || c.id)
      .filter((h) => h !== "actions");

    const rows = table.getRowModel().rows.map((row) =>
      table
        .getVisibleLeafColumns()
        .map((cell) => cell.id)
        .filter((id) => id !== "actions")
        .map((id) => {
          const value = row.original[id as keyof PlatformUser] ?? "";
          return `"${String(value).replace(/"/g, '""')}"`
        })
        .join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard/platform-users">User Management</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Platform User</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <SectionCards /> {/* KPI cards, already handles 4-column layout */}

      {/* Actual Graph component, stretches 4 columns */}
      <ChartAreaInteractive />


      <Card>
        <CardHeader>
          <Toolbar table={table} exportData={() => exportToCSV(users, "platform-users.csv")} />
        </CardHeader>
        <CardContent>
          <DataTable table={table} />
          <DataTablePagination table={table} />
        </CardContent>
      </Card>

      <ViewUserDrawer 
        user={viewOpen ? selectedUser : null} 
        onClose={() => {
          setViewOpen(false);
          setSelectedUser(null);
        }} 
      />
      <DeleteUserDialog open={deleteOpen} onOpenChange={setDeleteOpen} onConfirm={handleConfirmDelete} isLoading={isDeleting} />
    </div>
  );
}