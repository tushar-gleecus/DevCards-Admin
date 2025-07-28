//account-switcher
"use client";

import { useEffect, useState } from "react";
import { LogOut, User as UserIcon, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";

export function AccountSwitcher() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    photo: "",
  });

  // Helper to update user state from localStorage
  const loadUserFromStorage = () => {
    setUser({
      name: localStorage.getItem("admin_name") || "Admin",
      email: localStorage.getItem("admin_email") || "",
      photo: localStorage.getItem("admin_photo") || "/avatars/neutral.jpg",
    });
  };

  useEffect(() => {
    loadUserFromStorage();

    // Listen for changes to localStorage (cross-tab and same tab via custom event)
    function handleStorageChange(e: StorageEvent) {
      if (e.key === "admin_photo" || e.key === "admin_name" || e.key === "admin_email") {
        loadUserFromStorage();
      }
    }
    function handleProfilePhotoChanged() {
      loadUserFromStorage();
    }

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("profile-photo-changed", handleProfilePhotoChanged);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("profile-photo-changed", handleProfilePhotoChanged);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.post("/api/admins/logout/");
      toast.success("Logged out successfully");
      setTimeout(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("admin_id");
        localStorage.removeItem("admin_name");
        localStorage.removeItem("admin_email");
        localStorage.removeItem("admin_photo");
        window.location.href = "/auth/v1/login";
      }, 1500);
    } catch (err) {
      toast.error("Error while logging out");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={user.photo} />
          <AvatarFallback>{user.name ? user.name[0] : "A"}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-0.5">
            <p className="text-sm leading-none font-medium">{user.name}</p>
            <p className="text-muted-foreground text-xs leading-none">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => (window.location.href = "/dashboard/profile")}>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Bell className="mr-2 h-4 w-4" />
          <span>Notifications</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
