//platform-user
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { platformUserColumns } from "./_components/columns";
import { DataTable } from "./_components/data-table";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api-client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Eye, Download } from "lucide-react";

import { SectionCards } from "./_components/SectionCards";
import { DataTablePagination } from "./_components/data-table-pagination";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";

type PlatformUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: "Pending" | "Done";
};

const chartData = [
  { date: "Apr 6", users: 180, pending: 50 },
  { date: "Apr 12", users: 240, pending: 70 },
  { date: "Apr 18", users: 190, pending: 35 },
  { date: "Apr 24", users: 290, pending: 80 },
  { date: "Apr 30", users: 220, pending: 65 },
  { date: "May 6", users: 330, pending: 120 },
  { date: "May 12", users: 370, pending: 100 },
  { date: "May 18", users: 290, pending: 80 },
  { date: "May 24", users: 400, pending: 120 },
  { date: "May 30", users: 320, pending: 90 },
  { date: "Jun 5", users: 380, pending: 110 },
  { date: "Jun 11", users: 340, pending: 85 },
  { date: "Jun 17", users: 410, pending: 120 },
  { date: "Jun 23", users: 430, pending: 140 },
  { date: "Jun 30", users: 380, pending: 100 },
];

export default function PlatformUsersPage() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<PlatformUser | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Helper function to get column header as string
  const getColumnHeaderString = useCallback((column: any) => {
    if (typeof column.header === 'string') {
      return column.header;
    } else if (typeof column.header === 'function') {
      // Attempt to render the header component to a string, or use a fallback
      // This is a simplified approach; a more robust solution might involve ReactDOMServer.renderToStaticMarkup
      return column.id; // Fallback to column ID if header is a function
    }
    return column.id;
  }, []);
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/api/users/");
      setUsers(res.data);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = (user: PlatformUser) => {
    setUserToDelete(user);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/api/users/${userToDelete.id}/`);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setUserToDelete(null);
    } catch (err) {
      alert("Error deleting user.");
    }
    finally {
      setDeleting(false);
    }
  };

  // --- Column and Table Setup ---
  const allCols = useMemo(() => platformUserColumns(handleDelete), [handleDelete]);
  

  const toggleableColumns = allCols.filter((col) => col.id !== "actions");

  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    toggleableColumns.map((col) => col.id as string)
  );

  const visibleCols = allCols.filter(
    (col) => visibleColumns.includes(col.id as string) || col.id === "actions"
  );

  const table = useReactTable({
    data: users,
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

  // --- Export to CSV ---
  function exportToCSV(data: PlatformUser[], filename: string) {
    if (!data.length) return;
    const headers = toggleableColumns
      .filter((c) => visibleColumns.includes(c.id as string))
      .map((c) => getColumnHeaderString(c));

    const rows = data.map((row) =>
      toggleableColumns
        .filter((c) => visibleColumns.includes(c.id as string))
        .map((c) => {
          const value = row.getValue(c.id);
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
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      {/* Breadcrumbs */}
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

      {/* Top Cards */}
      <SectionCards />

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Total Platform Users</CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 12, right: 24, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f8cfb" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#4f8cfb" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFB020" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#FFB020" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="#4f8cfb" fill="url(#colorUsers)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="pending" stroke="#FFB020" fill="url(#colorPending)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Data Table Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Platform Users</CardTitle>
            <CardDescription>Manage users registered on your platform.</CardDescription>
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
                {toggleableColumns.map((col, index) => (
                  <DropdownMenuCheckboxItem
                    key={`${String(col.id)}-${index}`}
                    checked={visibleColumns.includes(col.id as string)}
                    onCheckedChange={(checked) => {
                      if (checked) setVisibleColumns([...visibleColumns, col.id as string]);
                      else setVisibleColumns(visibleColumns.filter((id) => id !== col.id));
                    }}
                  >
                    {getColumnHeaderString(col)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              className="flex gap-2"
              onClick={() => exportToCSV(table.getFilteredRowModel().rows.map((row) => row.original), "platform-users.csv")}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="py-8 text-center">Loading users...</div>
          ) : error ? (
            <div className="py-8 text-center text-red-600">{error}</div>
          ) : (
            <div className="space-y-2">
              <DataTable table={table} />
              <DataTablePagination table={table} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <div>
            Are you sure you want to delete user{" "}
            <span className="font-semibold">
              {userToDelete?.first_name} {userToDelete?.last_name}
            </span>
            ?
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserToDelete(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
