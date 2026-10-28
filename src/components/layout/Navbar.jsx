import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle, User, RefreshCw } from "lucide-react";
import ThemeToggle from "@/components/layout/ThemeToggle";

const SESSION_KEY = "srfits_portal_member";

// Desktop-only top navigation (hidden below the lg breakpoint, where the bottom nav is used)
const desktopLinks = [
  { label: "Home", path: "/" },
  { label: "Classes", path: "/classes" },
  { label: "Trainers", path: "/trainers" },
  { label: "Shop", path: "/shop" },
  { label: "Pricing", path: "/pricing" },
  { label: "Challenge", path: "/challenge" },
  { label: "Gallery", path: "/gallery" },
  { label: "Portal", path: "/portal" },
  { label: "Contact", path: "/contact" },
];

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [member, setMember] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = () => {
    setRefreshing(true);
    window.location.reload();
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      setMember(raw ? JSON.parse(raw) : null);
    } catch {
      setMember(null);
    }
  }, [location.pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled ? "bg-background/80 backdrop-blur-xl border-b border-primary/15" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-md px-4 lg:max-w-7xl lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center overflow-hidden group-hover:border-primary transition-colors">
              <img
                src="/media/137ce0856_WhatsApp_Image_2026-09-12_at_41151_PM.jpeg"
                alt="SR FITS"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-display text-xs tracking-widest leading-tight">
              STEAM ROOM
              <span className="block text-primary text-[9px] tracking-[0.3em]">FITNESS CENTER</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            {desktopLinks.map((l) => {
              const active = l.path === "/" ? location.pathname === "/" : location.pathname.startsWith(l.path);
              return (
                <Link
                  key={l.path}
                  to={l.path}
                  className={`relative px-2.5 xl:px-3.5 py-2 text-[13px] xl:text-sm font-medium tracking-wide transition-colors ${
                    active ? "text-primary" : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  {l.label}
                  {active && <span className="absolute left-2.5 right-2.5 xl:left-3.5 xl:right-3.5 -bottom-0.5 h-0.5 rounded-full bg-primary shadow-[0_0_8px_hsl(43_74%_61%)]" />}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={refresh}
              aria-label="Refresh"
              className="lg:hidden w-9 h-9 rounded-xl border border-primary/20 bg-white/[0.03] flex items-center justify-center text-primary hover:border-primary/50 transition-colors"
            >
              <RefreshCw className={`w-4.5 h-4.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>

            <Link
              to="/contact"
              aria-label="Contact"
              className="lg:hidden w-9 h-9 rounded-xl border border-primary/20 bg-white/[0.03] flex items-center justify-center text-primary hover:border-primary/50 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
            </Link>

            <Link to="/join">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4 h-9 text-xs font-semibold shadow-lg shadow-primary/25">
                Join Now
              </Button>
            </Link>

            {member && (
              <Link
                to="/portal?tab=profile"
                aria-label="My profile"
                className="w-9 h-9 rounded-full border border-primary/50 bg-primary/10 overflow-hidden flex items-center justify-center hover:border-primary transition-colors"
              >
                {member.avatar_url ? (
                  <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-primary font-semibold text-sm">
                    {(member.full_name || "M").charAt(0).toUpperCase()}
                  </span>
                )}
              </Link>
            )}
            {!member && location.pathname !== "/portal" && (
              <Link
                to="/portal"
                aria-label="Sign in"
                className="lg:hidden w-9 h-9 rounded-full border border-primary/20 bg-white/[0.03] flex items-center justify-center text-primary hover:border-primary/50 transition-colors"
              >
                <User className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}