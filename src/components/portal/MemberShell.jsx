import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const SESSION_KEY = "srfits_portal_member";

// A signed-in member gets their portal instead of the public app pages.
// Logging out (clearing the member session) gives the public site back.
export default function MemberShell() {
  const location = useLocation();

  let member = null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    member = raw ? JSON.parse(raw) : null;
  } catch {
    member = null;
  }

  if (member && location.pathname !== "/portal") {
    return <Navigate to="/portal" replace />;
  }

  return <Outlet />;
}
