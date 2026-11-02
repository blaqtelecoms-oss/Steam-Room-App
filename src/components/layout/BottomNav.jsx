import React from "react";
import { useLocation } from "react-router-dom";
import { Home, ShoppingBag, LayoutDashboard, CreditCard, Trophy, Dumbbell, Users } from "lucide-react";
import BottomNavBar from "@/components/layout/BottomNavBar";

const mainTabs = [
  { label: "Home", path: "/", icon: Home },
  { label: "Shop", path: "/shop", icon: ShoppingBag },
  { label: "Portal", path: "/portal", icon: LayoutDashboard },
  { label: "Pricing", path: "/pricing", icon: CreditCard },
];

const moreTabs = [
  { label: "Challenge", path: "/challenge", icon: Trophy },
  { label: "Classes", path: "/classes", icon: Dumbbell },
  { label: "Trainers", path: "/trainers", icon: Users },
];

const toItem = (tab, pathname) => ({
  key: tab.path,
  label: tab.label,
  icon: tab.icon,
  to: tab.path,
  active: pathname === tab.path,
});

export default function BottomNav() {
  const location = useLocation();

  // The member portal and the admin console own their bottom navigation.
  if (location.pathname === "/portal" || location.pathname.startsWith("/admin")) return null;

  return (
    <BottomNavBar
      items={mainTabs.map((t) => toItem(t, location.pathname))}
      moreItems={moreTabs.map((t) => toItem(t, location.pathname))}
    />
  );
}
