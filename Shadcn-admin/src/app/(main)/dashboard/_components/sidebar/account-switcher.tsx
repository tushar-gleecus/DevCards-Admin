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

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const loadUserFromStorage = () => {
    setUser({
      name: localStorage.getItem("admin_name") || "Admin",
      email: localStorage.getItem("admin_email") || "",
      photo: localStorage.getItem("admin_photo") || "/avatars/neutral.jpg",
    });
  };

  useEffect(() => {
    loadUserFromStorage();

    function handleStorageChange(e: StorageEvent) {
      if (
        e.key === "admin_photo" ||
        e.key === "admin_name" ||
        e.key === "admin_email"
      ) {
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
    setIsLoggingOut(true);
    setMenuOpen(true); // Keep dropdown open

    try {
      await apiClient.post("/api/admins/logout/");
      toast.success("Logged out successfully");

      setTimeout(() => {
        localStorage.clear();
        document.cookie =
          "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        window.location.href = "/auth/v1/login";
      }, 1500);
    } catch (err) {
      toast.error("Error while logging out");
      setIsLoggingOut(false);
      setMenuOpen(true); // Keep it open in case of failure
    }
  };

  return (
    <DropdownMenu open={menuOpen} onOpenChange={(open) => !isLoggingOut && setMenuOpen(open)}>
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
            <p className="text-muted-foreground text-xs leading-none">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            if (!isLoggingOut) {
              window.location.href = "/dashboard/profile";
            }
          }}
        >
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            if (!isLoggingOut) {
              toast.info("No notifications to show");
            }
          }}
        >
          <Bell className="mr-2 h-4 w-4" />
          <span>Notifications</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={!isLoggingOut ? handleLogout : undefined}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <div className="flex items-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-foreground border-t-transparent rounded-full" />
              Logging out...
            </div>
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
