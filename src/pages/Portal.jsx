import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import MemberOnboarding from "@/components/portal/MemberOnboarding";
import DashboardView from "@/components/portal/DashboardView";
import PaymentsView from "@/components/portal/PaymentsView";
import ProgramView from "@/components/portal/ProgramView";
import FormsView from "@/components/portal/FormsView";
import PortalGate from "@/components/portal/PortalGate";
import BookPtView from "@/components/portal/BookPtView";
import ProfileView from "@/components/portal/ProfileView";
import TestimonialView from "@/components/portal/TestimonialView";
import GalleryView from "@/components/portal/GalleryView";
import BottomNavBar from "@/components/layout/BottomNavBar";
import { LayoutDashboard, CreditCard, Dumbbell, FileSignature, Calendar, User, MessageSquareQuote, Images, LogOut } from "lucide-react";

const tabs = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard },
  { id: "payments", label: "Pay", icon: CreditCard },
  { id: "book", label: "Book PT", icon: Calendar },
  { id: "program", label: "Program", icon: Dumbbell },
  { id: "forms", label: "Forms", icon: FileSignature },
  { id: "testimony", label: "Review", icon: MessageSquareQuote },
  { id: "gallery", label: "Gallery", icon: Images },
  { id: "profile", label: "Profile", icon: User },
];

// Shown in the mobile bottom bar; everything else lives behind its centre button.
const primaryTabIds = ["dashboard", "payments", "book", "profile"];

const SESSION_KEY = "srfits_portal_member";

export default function Portal() {
  const [member, setMember] = useState(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [tab, setTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("tab") || "dashboard";
  });
  const [registering, setRegistering] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get("tab");
    if (t && t !== tab) setTab(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const unlock = (m) => {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(m)); } catch {}
    setMember(m);
  };
  const lock = () => {
    try { sessionStorage.removeItem(SESSION_KEY); } catch {}
    setMember(null);
  };

  if (registering) {
    return (
      <div className="pt-20 pb-4 px-4 min-h-screen lg:pt-28 lg:px-8 lg:max-w-3xl lg:mx-auto">
        <button onClick={() => setRegistering(false)} className="text-xs text-muted-foreground mb-3 hover:text-primary">← Back to login</button>
        <MemberOnboarding onCreated={(m) => { unlock(m); setRegistering(false); }} />
      </div>
    );
  }

  if (!member) {
    return <PortalGate onUnlock={unlock} onRegister={() => setRegistering(true)} />;
  }

  return (
    <div className="pt-16 pb-28 px-4 min-h-screen lg:pt-24 lg:pb-16 lg:px-8 lg:max-w-7xl lg:mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          <div>
            <p className="font-display text-[10px] tracking-widest text-primary">SR FITS</p>
            <h1 className="font-space font-bold text-xl">Member Portal</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={lock} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-primary/20 rounded-lg px-3 py-2">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>
      <div className="lg:flex lg:gap-8 lg:items-start">
      <div className="hidden lg:flex lg:flex-col lg:gap-2 lg:w-56 lg:shrink-0 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-1">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 rounded-full px-4 py-2 lg:rounded-xl lg:justify-start lg:py-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-transparent border-primary/20 text-muted-foreground"}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>
      <div className="lg:flex-1 lg:min-w-0">
      {tab === "dashboard" && <DashboardView member={member} onTab={setTab} />}
      {tab === "payments" && <PaymentsView member={member} />}
      {tab === "book" && <BookPtView member={member} />}
      {tab === "program" && <ProgramView member={member} />}
      {tab === "forms" && <FormsView member={member} />}
      {tab === "testimony" && <TestimonialView member={member} />}
      {tab === "gallery" && <GalleryView />}
      {tab === "profile" && <ProfileView member={member} onUpdate={unlock} onLock={lock} />}
      </div>
      </div>
      <BottomNavBar
        items={tabs.filter((t) => primaryTabIds.includes(t.id)).map(toBottomItem(tab, setTab))}
        moreItems={tabs.filter((t) => !primaryTabIds.includes(t.id)).map(toBottomItem(tab, setTab))}
      />
    </div>
  );
}

const toBottomItem = (activeTab, setTab) => (t) => ({
  key: t.id,
  label: t.label,
  icon: t.icon,
  active: activeTab === t.id,
  onClick: () => setTab(t.id),
});