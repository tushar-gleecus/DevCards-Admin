//admin-user
"use client";

import { useEffect, useState } from "react";
import AdminForm from "./_components/AdminForm";
import { DataTable } from "./_components/data-table";
import { adminColumns } from "./_components/columns";
import { Admin } from "@/types/admin";
import { EditAdminDialog } from "./_components/edit-admin-dialog";
import { DeleteAdminDialog } from "./_components/delete-admin-dialog";
import { DataTablePagination } from "./_components/data-table-pagination";

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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Eye, Download } from "lucide-react";
import apiClient from "@/lib/api-client";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  // --- API Handlers ---
  async function handleAddAdmin(adminData: Omit<Admin, "id">) {
    try {
      const res = await apiClient.post("/api/admins/", adminData);
      setAdmins((prev) => [...prev, res.data]);
      toast.success("Admin user added!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Error adding admin.");
    }
  }

  function handleEdit(admin: Admin) {
    setSelectedAdmin(admin);
    setEditOpen(true);
  }

  async function handleSaveEdit(updated: Admin) {
    try {
      const res = await apiClient.put(`/api/admins/update/${updated.id}/`, updated);
      setAdmins((prev) => prev.map((a) => (a.id === res.data.id ? res.data : a)));
      setEditOpen(false);
      toast.success("Admin updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Error updating admin.");
    }
  }

  function handleDelete(admin: Admin) {
    setSelectedAdmin(admin);
    setDeleteOpen(true);
  }

  async function handleConfirmDelete() {
    if (!selectedAdmin) return;
    try {
      await apiClient.delete(`/api/admins/${selectedAdmin.id}/`);
      setAdmins((prev) => prev.filter((a) => a.id !== selectedAdmin.id));
      setDeleteOpen(false);
      toast.success("Admin deleted successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Error deleting admin.");
    }
  }

  // --- Column and Table Setup ---
  const allCols = adminColumns(handleEdit, handleDelete);
  const toggleableColumns = allCols.filter((col) => col.id !== "actions");

  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    toggleableColumns.map((col) => col.id as string)
  );

  const visibleCols = allCols.filter(
    (col) => visibleColumns.includes(col.id as string) || col.id === "actions"
  );

  const table = useReactTable({
    data: admins,
    columns: visibleCols,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // --- Data Fetching ---
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await apiClient.get("/api/admins/");
        setAdmins(res.data);
      } catch (err) {
        toast.error("Could not load admins");
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
    // eslint-disable-next-line
  }, []);

  // --- Export to CSV ---
  function exportToCSV(data: Admin[], filename: string) {
    if (!data.length) return;
    const headers = toggleableColumns
      .filter((c) => visibleColumns.includes(c.id as string))
      .map((c) => c.meta?.label || c.id);

    const rows = data.map((row) =>
      toggleableColumns
        .filter((c) => visibleColumns.includes(c.id as string))
        .map((c) => {
          const value = c.id ? row[c.id as keyof Admin] : "";
          return `"${String(value).replace(/"/g, '""')}"`;
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
                    <Link href="/dashboard/admin-users">User Management</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Admin User</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle>Add Admin User</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminForm onAddAdmin={handleAddAdmin} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Admin Users</CardTitle>
            <CardDescription>Manage administrators in your system.</CardDescription>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex gap-2">
                  <Eye className="h-4 w-4" />
                  View
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="text-muted-foreground px-2 py-1 text-xs font-medium">Toggle columns</div>
                {toggleableColumns.map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={visibleColumns.includes(col.id as string)}
                    onCheckedChange={(checked) => {
                      if (checked) setVisibleColumns([...visibleColumns, col.id as string]);
                      else setVisibleColumns(visibleColumns.filter((id) => id !== col.id));
                    }}
                  >
                    {col.meta?.label || col.id}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              className="flex gap-2"
              onClick={() => exportToCSV(admins, "admin-users.csv")}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <DataTable table={table} />
            <DataTablePagination table={table} />
          </div>
        </CardContent>
      </Card>

      <EditAdminDialog open={editOpen} onOpenChange={setEditOpen} data={selectedAdmin} onSubmit={handleSaveEdit} />
      <DeleteAdminDialog open={deleteOpen} onOpenChange={setDeleteOpen} onConfirm={handleConfirmDelete} />
    </div>
  );
}