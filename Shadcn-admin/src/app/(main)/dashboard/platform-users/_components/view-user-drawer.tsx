"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { XIcon } from "lucide-react";
import type { PlatformUser } from "@/types/platform-user";
import { format } from "date-fns";

interface ViewUserDrawerProps {
  user: PlatformUser | null;
  onClose: () => void;
}

export function ViewUserDrawer({ user, onClose }: ViewUserDrawerProps) {

  return (
    <Drawer open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="px-6 pb-6 pt-0">
        <DrawerHeader className="relative">
          <DrawerTitle className="text-left">View User</DrawerTitle>
          <DrawerDescription className="text-left">User details and information</DrawerDescription>
          <DrawerClose className="absolute right-0 top-0 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DrawerClose>
        </DrawerHeader>
        {user && (
          <div className="p-4 pb-0">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-muted-foreground">First Name</h3>
                <p className="text-base">{user.first_name}</p>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-muted-foreground">Last Name</h3>
                <p className="text-base">{user.last_name}</p>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-muted-foreground">Email</h3>
                <p className="text-base">{user.email}</p>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-muted-foreground">Email Verified</h3>
                <p className="text-base">{user.email_verified ? "Yes" : "No"}</p>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-muted-foreground">Created At</h3>
                <p className="text-base">{user.created_at ? format(new Date(user.created_at), "PPP") : "N/A"}</p>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-muted-foreground">Updated At</h3>
                <p className="text-base">{user.updated_at ? format(new Date(user.updated_at), "PPP") : "N/A"}</p>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-muted-foreground">Last Login</h3>
                <p className="text-base">{user.last_login ? format(new Date(user.last_login), "PPP") : "N/A"}</p>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-muted-foreground">Status</h3>
                <p className="text-base">{user.status}</p>
              </div>
            </div>
          </div>
        )}

      </DrawerContent>
    </Drawer>
  );
}