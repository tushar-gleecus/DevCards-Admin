"use client";

import { useEffect, useState } from "react";
import { Admin } from "@/types/admin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export function EditAdminDialog({
  open,
  onOpenChange,
  data,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Admin | null;
  onSubmit: (admin: Admin) => void;
}) {
  const [form, setForm] = useState<Admin | null>(data);

  useEffect(() => {
    setForm(data);
  }, [data]);

  const handleChange = (field: keyof Admin, value: string) => {
    if (!form) return;
    setForm({ ...form, [field]: value as Admin[keyof Admin] });
  };

  const handleSubmit = () => {
    if (form) {
      onSubmit(form);
    }
  };

  if (!form) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Admin</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="mt-6 space-y-5"
        >
          <div className="flex gap-4">
            <div className="w-1/2">
              <Label className="mb-1 block">First Name</Label>
              <Input
                className="border border-zinc-400 bg-white focus:border-zinc-600"
                value={form.first_name}
                onChange={(e) => handleChange("first_name", e.target.value)}
              />
            </div>
            <div className="w-1/2">
              <Label className="mb-1 block">Last Name</Label>
              <Input
                className="border border-zinc-400 bg-white focus:border-zinc-600"
                value={form.last_name}
                onChange={(e) => handleChange("last_name", e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label className="mb-1 block">Email</Label>
            <Input
              className="border border-zinc-400 bg-white focus:border-zinc-600"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1 block">Role</Label>
            <Select value={form.role} onValueChange={(value) => handleChange("role", value as Admin["role"])}>
              <SelectTrigger className="border border-zinc-400 bg-white focus:border-zinc-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="SuperAdmin">SuperAdmin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Button type="submit" className="w-full">
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
