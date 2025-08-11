//admin-user
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import AdminForm from "./_components/AdminForm";
import { DataTable } from "./_components/data-table";
import { adminColumns } from "./_components/columns";
import { Admin } from "@/types/admin";
import { EditAdminDrawer } from "./_components/edit-admin-drawer";
import { DeleteAdminDialog } from "./_components/delete-admin-dialog";
import { DataTablePagination } from "./_components/data-table-pagination";
import { Toolbar } from "./_components/toolbar";

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

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const fetchAdmins = useCallback(async () => {
    try {
      const res = await apiClient.get("/api/admins/");
      setAdmins(res.data);
    } catch (err) {
      toast.error("Could not load admins");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleAddAdmin = useCallback(
    async (adminData: Omit<Admin, "id">) => {
      try {
        await apiClient.post("/api/admins/", adminData);
        toast.success("Admin user added!");
        fetchAdmins();
      } catch (err: any) {
        console.error(err.response);
        toast.error(err.response?.data?.detail || "Error adding admin.");
      }
    },
    [fetchAdmins]
  );

  const handleEdit = useCallback((admin: Admin) => {
    setSelectedAdmin(admin);
    setEditOpen(true);
  }, []);

  const handleRoleChange = useCallback(
    async (admin: Admin, newRole: "Admin" | "SuperAdmin") => {
      try {
        const updatedAdmin = { ...admin, role: newRole };
        await apiClient.put(`/api/admins/update/${admin.id}/`, updatedAdmin);
        fetchAdmins();
      } catch (err: any) {
        toast.error(err.response?.data?.detail || "Error updating role.");
      }
    },
    [fetchAdmins]
  );

  const handleSaveEdit = useCallback(
    async (updated: Admin) => {
      try {
        await apiClient.put(`/api/admins/update/${updated.id}/`, updated);
        setEditOpen(false);
        toast.success("Admin updated successfully!");
        fetchAdmins();
      } catch (err: any) {
        toast.error(err.response?.data?.detail || "Error updating admin.");
      }
    },
    [fetchAdmins]
  );

  const handleDelete = useCallback((admin: Admin) => {
    setSelectedAdmin(admin);
    setDeleteOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedAdmin) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/api/admins/${selectedAdmin.id}/`);
      setDeleteOpen(false);
      toast.success("Admin deleted successfully!");
      fetchAdmins();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Error deleting admin.");
    } finally {
      setIsDeleting(false);
    }
  }, [selectedAdmin, fetchAdmins]);

  const [currentUserRole, setCurrentUserRole] = useState<"Admin" | "SuperAdmin">();

  useEffect(() => {
    const fetchCurrentUserRole = async () => {
      try {
        const adminId = localStorage.getItem("admin_id");
        if (adminId) {
          const res = await apiClient.get("/api/admins/");
          const currentUser = res.data.find((admin: Admin) => admin.id === parseInt(adminId, 10));
          if (currentUser) {
            setCurrentUserRole(currentUser.role);
          }
        }
      } catch (err) {
        console.error("Error fetching current user role:", err);
        toast.error("Could not load current user role.");
      }
    };
    fetchCurrentUserRole();
  }, []);

  const columns = useMemo(
    () => adminColumns(handleEdit, handleDelete, handleRoleChange, currentUserRole),
    [handleEdit, handleDelete, handleRoleChange, currentUserRole]
  );

  const table = useReactTable({
    data: admins,
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

  function exportToCSV(data: Admin[], filename: string) {
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
          const value = row.original[id as keyof Admin] ?? "";
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
          <CardTitle>Create Admin User</CardTitle>
          <CardDescription>Fill out the form to create a new admin user.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminForm onAddAdmin={handleAddAdmin} currentUserRole={currentUserRole} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Toolbar table={table} exportData={() => exportToCSV(admins, "admin-users.csv")} />
        </CardHeader>
        <CardContent className="space-y-4">
          <DataTable table={table} />
          <DataTablePagination table={table} />
        </CardContent>
      </Card>

      <EditAdminDrawer open={editOpen} onOpenChange={setEditOpen} data={selectedAdmin} onSubmit={handleSaveEdit} />
      <DeleteAdminDialog open={deleteOpen} onOpenChange={setDeleteOpen} onConfirm={handleConfirmDelete} isLoading={isDeleting} />
    </div>
  );
}
