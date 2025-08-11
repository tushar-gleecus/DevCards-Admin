
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AdminForm from "./AdminForm";
import { Admin } from "@/types/admin";

interface CreateAdminDialogProps {
  onAddAdmin: (adminData: Omit<Admin, "id">) => Promise<void>;
  currentUserRole?: "Admin" | "SuperAdmin";
}

export function CreateAdminDialog({ onAddAdmin, currentUserRole }: CreateAdminDialogProps) {
  const [open, setOpen] = useState(false);

  const handleAddAdmin = async (adminData: Omit<Admin, "id">) => {
    await onAddAdmin(adminData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Admin</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Admin</DialogTitle>
          <DialogDescription>
            Fill out the form to create a new admin user.
          </DialogDescription>
        </DialogHeader>
        <AdminForm onAddAdmin={handleAddAdmin} currentUserRole={currentUserRole} />
      </DialogContent>
    </Dialog>
  );
}
