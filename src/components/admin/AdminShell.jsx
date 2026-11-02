import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import Admin from "@/pages/Admin";

// A signed-in admin gets the admin console instead of the public app pages.
// Everyone else (visitors, members, staff) sees the normal page.
export default function AdminShell() {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && user?.role === "admin";

  if (!isAdmin) return <Outlet />;

  return (
    <div className="min-h-screen bg-background">
      <Admin />
    </div>
  );
}
