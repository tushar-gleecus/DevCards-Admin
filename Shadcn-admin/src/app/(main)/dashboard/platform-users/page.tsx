//platform-user
"use client";

import { useState, useEffect } from "react";
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

type PlatformUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: "Pending" | "Done";
};

const cards = [
  {
    title: "Total Users",
    value: "$1,250.00",
    change: "+12.5%",
    direction: "up",
    subtitle: "Trending up this month",
    desc: "Visitors for the last 6 months",
    badgeColor: "text-green-600 bg-green-100",
  },
  {
    title: "Active Users",
    value: "1,000",
    change: "-8.0%",
    direction: "down",
    subtitle: "Down 8% this period",
    desc: "Acquisition needs attention",
    badgeColor: "text-red-600 bg-red-100",
  },
  {
    title: "Pending Users",
    value: "234",
    change: "+4.5%",
    direction: "up",
    subtitle: "Pending increased",
    desc: "Check onboarding process",
    badgeColor: "text-green-600 bg-green-100",
  },
  {
    title: "Growth",
    value: "4.5%",
    change: "+2.1%",
    direction: "up",
    subtitle: "Steady performance increase",
    desc: "Meets growth projections",
    badgeColor: "text-green-600 bg-green-100",
  },
];

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

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/api/users/");
      setUsers(res.data);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // This is called by your columns "Delete" button to open the modal
  const handleDelete = (user: PlatformUser) => {
    setUserToDelete(user);
  };

  // This deletes the user via API and closes the modal
  const confirmDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/api/users/${userToDelete.id}/`);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setUserToDelete(null);
    } catch (err) {
      alert("Error deleting user.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title} className="border bg-white shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex w-full flex-row items-center justify-between">
                <CardTitle className="text-base font-normal">{card.title}</CardTitle>
                <span className={"rounded-md px-2 py-0.5 text-xs font-medium " + card.badgeColor}>{card.change}</span>
              </div>
              <CardDescription className="pt-2 pb-1 text-3xl font-bold text-black">{card.value}</CardDescription>
              <div className="text-muted-foreground text-xs font-medium">{card.subtitle}</div>
              <div className="text-muted-foreground text-xs">{card.desc}</div>
            </CardHeader>
          </Card>
        ))}
      </div>

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
        <CardHeader>
          <CardTitle>Platform Users</CardTitle>
          <CardDescription>Manage users registered on your platform.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Optional: Add User Form (if you created it) */}
          {/* <AddUserForm onUserAdded={fetchUsers} /> */}

          {loading ? (
            <div className="py-8 text-center">Loading users...</div>
          ) : error ? (
            <div className="py-8 text-center text-red-600">{error}</div>
          ) : (
            <DataTable columns={platformUserColumns(handleDelete)} data={users} />
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
