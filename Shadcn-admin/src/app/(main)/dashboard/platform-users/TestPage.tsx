"use client";

import { useState } from "react";
import { ViewUserDrawer } from "./_components/view-user-drawer";
import { PlatformUser } from "@/types/platform-user";
import { Button } from "@/components/ui/button";

export default function TestPage() {
  const [user, setUser] = useState<PlatformUser | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  const dummyUser: PlatformUser = {
    id: 1,
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@example.com",
    email_verified: true,
    status: "Done",
    created_at: "2023-01-01T10:00:00Z",
    updated_at: "2023-01-01T11:00:00Z",
    last_login: "2023-01-01T12:00:00Z",
  };

  const handleView = () => {
    setUser(dummyUser);
    setViewOpen(true);
  };

  const handleClose = () => {
    setUser(null);
    setViewOpen(false);
  };

  return (
    <div className="p-4">
      <Button onClick={handleView}>Open View Drawer</Button>
      <ViewUserDrawer user={user} onClose={handleClose} />
    </div>
  );
}
