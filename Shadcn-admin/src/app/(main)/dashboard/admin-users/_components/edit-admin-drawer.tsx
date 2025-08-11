"use client";

import { useEffect, useState } from "react";
import { Admin } from "@/types/admin";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const nameRegex = /^[A-Za-z\s-]+$/;
const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;

import { toast } from "sonner";

export function EditAdminDrawer({
  open,
  onOpenChange,
  data,
  onSubmit,
  currentUserRole,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Admin | null;
  onSubmit: (admin: Admin) => void;
  currentUserRole: "Admin" | "SuperAdmin";
}) {
  const [form, setForm] = useState<Admin | null>(data);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Admin, string>>>({});

  useEffect(() => {
    setForm(data);
    if (data) {
      setErrors(validate(data));
    }
  }, [data]);

  const validate = (values: Admin) => {
    const errs: Partial<Record<keyof Admin, string>> = {};

    if (!values.first_name.trim()) {
      errs.first_name = "First name is required.";
    } else if (!nameRegex.test(values.first_name.trim())) {
      errs.first_name = "First name should only contain letters, spaces, or hyphens.";
    }

    if (!values.last_name.trim()) {
      errs.last_name = "Last name is required.";
    } else if (!nameRegex.test(values.last_name.trim())) {
      errs.last_name = "Last name should only contain letters, spaces, or hyphens.";
    }

    if (!values.email.trim()) {
      errs.email = "Email is required.";
    } else if (!emailRegex.test(values.email.trim())) {
      errs.email = "Enter a valid email address.";
    }

    return errs;
  };

  const handleChange = (field: keyof Admin, value: string) => {
    if (!form) return;
    const updatedForm = { ...form, [field]: value as Admin[keyof Admin] };
    setForm(updatedForm);
    setErrors(validate(updatedForm));
  };

  const handleSubmit = async () => {
    if (!form) return;
    const validationErrors = validate(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(form);
      onOpenChange(false);
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  if (!form) return null;

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="px-6 pb-6 pt-0">
        <DrawerHeader>
          <DrawerTitle className="text-left">Edit Admin</DrawerTitle>
          <DrawerDescription className="text-left">Editable fields are marked with an asterisk (*). Click save when you're done.</DrawerDescription>
        </DrawerHeader>
        <div className="p-4 pb-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={form.first_name}
                onChange={(e) => handleChange("first_name", e.target.value)}
                disabled={isLoading}
                className={errors.first_name ? "border-red-500" : ""}
              />
              {errors.first_name && <p className="text-xs text-red-600">{errors.first_name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={form.last_name}
                onChange={(e) => handleChange("last_name", e.target.value)}
                disabled={isLoading}
                className={errors.last_name ? "border-red-500" : ""}
              />
              {errors.last_name && <p className="text-xs text-red-600">{errors.last_name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                disabled={isLoading}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="created_at">Created At</Label>
              <Input
                id="created_at"
                value={form.created_at ? new Date(form.created_at).toLocaleString() : "N/A"}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="created_by">Created By</Label>
              <Input
                id="created_by"
                value={form.created_by || "N/A"}
                disabled
                
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="updated_at">Updated At</Label>
              <Input
                id="updated_at"
                value={form.updated_at ? new Date(form.updated_at).toLocaleString() : "N/A"}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="updated_by">Updated By</Label>
              <Input
                id="updated_by"
                value={form.updated_by || "N/A"}
                disabled
                
              />
            </div>
            
          </div>
        </div>
        <DrawerFooter className="pt-4 mt-4">
          <div className="flex justify-center space-x-2 w-fit mx-auto">
            <Button
              onClick={() => {
                if (currentUserRole !== "SuperAdmin" && form?.role === "SuperAdmin") {
                  toast.info("Admins do not have this privilege. Contact support.");
                  return;
                }
                handleSubmit();
              }}
              disabled={isLoading || hasErrors}
              size="sm"
            >
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading} size="sm">Cancel</Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
