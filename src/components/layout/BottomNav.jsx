import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, LayoutDashboard, CreditCard, Plus, Trophy, Dumbbell, Users, Images } from "lucide-react";

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
  { label: "Gallery", path: "/gallery", icon: Images },
];

export default function BottomNav() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [member, setMember] = useState(null);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("srfits_portal_member");
      setMember(raw ? JSON.parse(raw) : null);
    } catch {
      setMember(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (location.pathname === "/portal" && !member) return null;

  const moreActive = moreTabs.some((t) => location.pathname === t.path);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="mx-auto max-w-md px-6 pb-5">
        {open && (
          <>
            <div className="fixed inset-0 -z-10 bg-black/50 backdrop-blur-[3px]" onClick={() => setOpen(false)} />
            <div className="mx-auto mb-5 w-56 overflow-hidden rounded-2xl border border-primary/20 bg-card/95 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.7)]">
              {moreTabs.map((t, i) => {
                const active = location.pathname === t.path;
                const Icon = t.icon;
                return (
                  <Link
                    key={t.path}
                    to={t.path}
                    className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${
                      i > 0 ? "border-t border-white/5" : ""
                    } ${active ? "text-primary" : "text-foreground/80 hover:text-primary"}`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                    <span className="text-sm font-medium tracking-wide">{t.label}</span>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        <div className="flex h-16 items-center rounded-full border border-primary/15 bg-background/85 px-2 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.55)]">
          {mainTabs.slice(0, 2).map((tab) => (
            <NavSlot key={tab.path} tab={tab} active={location.pathname === tab.path} />
          ))}

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="More"
            aria-expanded={open}
            className={`mx-1 flex h-14 w-14 shrink-0 -translate-y-4 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-background transition-all duration-300 ${
              open || moreActive
                ? "shadow-[0_0_24px_hsl(43_74%_61%/0.55)]"
                : "shadow-[0_4px_16px_hsl(43_74%_61%/0.3)]"
            }`}
          >
            <Plus className={`h-6 w-6 transition-transform duration-300 ${open ? "rotate-45" : ""}`} strokeWidth={2} />
          </button>

          {mainTabs.slice(2).map((tab) => (
            <NavSlot key={tab.path} tab={tab} active={location.pathname === tab.path} />
          ))}
        </div>
      </div>
    </nav>
  );
}

function NavSlot({ tab, active }) {
  const Icon = tab.icon;
  return (
    <Link
      to={tab.path}
      aria-label={tab.label}
      title={tab.label}
      className={`relative flex h-full flex-1 items-center justify-center transition-colors duration-200 ${
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-[22px] w-[22px]" strokeWidth={1.75} />
      {active && <span className="absolute bottom-2.5 h-1 w-1 rounded-full bg-primary shadow-[0_0_6px_hsl(43_74%_61%)]" />}
    </Link>
  );
}