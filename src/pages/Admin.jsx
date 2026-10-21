import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Lock, Users, Trophy, CreditCard, Bell, Shield, LogOut, Megaphone, LogIn, Dumbbell, Calendar, Wallet, Package, ShoppingCart, Briefcase } from "lucide-react";
import MembersTab from "@/components/admin/MembersTab";
import ApplicationsTab from "@/components/admin/ApplicationsTab";
import PaymentsTab from "@/components/admin/PaymentsTab";
import NotificationsTab from "@/components/admin/NotificationsTab";
import AdvertsTab from "@/components/admin/AdvertsTab";
import TrainersTab from "@/components/admin/TrainersTab";
import BookingsTab from "@/components/admin/BookingsTab";
import FinanceTab from "@/components/admin/FinanceTab";
import InventoryTab from "@/components/admin/InventoryTab";
import OrdersTab from "@/components/admin/OrdersTab";
import EmployeesTab from "@/components/admin/EmployeesTab";
import DebitsTab from "@/components/admin/DebitsTab";

const ADMIN_PASSWORD = "Admin2026";

const tabs = [
  { id: "members", label: "Members", icon: Users },
  { id: "applications", label: "Applications", icon: Trophy },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "finance", label: "Finance", icon: Wallet },
  { id: "debits", label: "Debits", icon: CreditCard },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "notifications", label: "Notify", icon: Bell },
  { id: "adverts", label: "Adverts", icon: Megaphone },
  { id: "trainers", label: "Trainers", icon: Dumbbell },
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "employees", label: "Staff", icon: Briefcase },
];

export default function Admin() {
  const { user, isAuthenticated, isLoadingAuth, navigateToLogin } = useAuth();
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("sr_admin") === "1");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [tab, setTab] = useState("members");
  const [usersById, setUsersById] = useState({});
  const [employeeAccess, setEmployeeAccess] = useState(null);

  const isAdmin = isAuthenticated && user?.role === "admin";

  useEffect(() => {
    if (authed && isAdmin) {
      base44.entities.User.list().then((users) => {
        const map = {};
        users.forEach((u) => { map[u.id] = u; });
        setUsersById(map);
      }).catch(() => {});
    }
  }, [authed, isAdmin]);

  useEffect(() => {
    if (isAuthenticated) {
      base44.functions.invoke("GetEmployeeAccess", { email: user?.email })
        .then((res) => setEmployeeAccess(res.data))
        .catch(() => setEmployeeAccess({ employee: null }));
    }
  }, [isAuthenticated, user]);

  const isEmployee = employeeAccess?.employee && employeeAccess?.employee.active;
  const permittedTabs = isEmployee ? (employeeAccess.employee.permitted_tabs || []) : tabs.map((t) => t.id);
  const visibleTabs = tabs.filter((t) => permittedTabs.includes(t.id));

  useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.find((t) => t.id === tab)) {
      setTab(visibleTabs[0].id);
    }
  }, [employeeAccess]);

  const unlock = () => {
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true);
      sessionStorage.setItem("sr_admin", "1");
    } else {
      setErr(true);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("sr_admin");
    setAuthed(false);
    setPw("");
  };

  // Not logged in → prompt login
  if (isLoadingAuth) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-primary/25 bg-card p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center mb-3 mx-auto">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-display text-sm tracking-widest text-primary mb-2">ADMIN ACCESS</h1>
          <p className="text-xs text-muted-foreground mb-5">You must sign in with an admin account to use the console.</p>
          <button onClick={navigateToLogin} className="w-full bg-primary text-primary-foreground py-3 rounded-xl text-sm font-semibold uppercase tracking-wide flex items-center justify-center gap-2">
            <LogIn className="w-4 h-4" /> Sign In
          </button>
        </div>
      </div>
    );
  }

  // Logged in but not admin
  if (!isAdmin) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-destructive/25 bg-card p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 border border-destructive/40 flex items-center justify-center mb-3 mx-auto">
            <Shield className="w-6 h-6 text-destructive" />
          </div>
          <h1 className="font-display text-sm tracking-widest text-destructive mb-2">ACCESS DENIED</h1>
          <p className="text-xs text-muted-foreground mb-2">Your account ({user?.email}) does not have admin rights.</p>
          <p className="text-xs text-muted-foreground mb-5">Ask a workspace admin to set your role to "admin" in App Users.</p>
        </div>
      </div>
    );
  }

  // Logged in as admin → password gate
  if (!authed) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-primary/25 bg-card p-6">
          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center mb-3">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h1 className="font-display text-sm tracking-widest text-primary">ADMIN ACCESS</h1>
            <p className="text-xs text-muted-foreground mt-1">Signed in as {user?.email}. Enter password to continue.</p>
          </div>
          <input
            type="password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setErr(false); }}
            onKeyDown={(e) => e.key === "Enter" && unlock()}
            placeholder="Password"
            className="w-full rounded-xl bg-white/[0.03] border border-primary/20 px-4 py-3 text-sm outline-none focus:border-primary"
          />
          {err && <p className="text-xs text-destructive mt-2">Incorrect password.</p>}
          <button onClick={unlock} className="w-full mt-4 bg-primary text-primary-foreground py-3 rounded-xl text-sm font-semibold uppercase tracking-wide">
            Unlock
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 pb-8 px-4 min-h-screen lg:pt-24 lg:pb-16 lg:px-8 lg:max-w-7xl lg:mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <div>
            <p className="font-display text-[10px] tracking-widest text-primary">SR FITS</p>
            <h1 className="font-space font-bold text-xl">Admin Console</h1>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-primary/20 rounded-lg px-3 py-2">
          <LogOut className="w-3.5 h-3.5" /> Lock
        </button>
      </div>
      <div className="lg:flex lg:gap-8 lg:items-start">
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 lg:flex-col lg:w-56 lg:shrink-0 lg:overflow-visible lg:mb-0 lg:pb-0 lg:sticky lg:top-24">
        {visibleTabs.map((t) => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 rounded-full px-4 py-2 lg:rounded-xl lg:justify-start lg:py-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-transparent border-primary/20 text-muted-foreground"}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>
      <div className="lg:flex-1 lg:min-w-0">
      {tab === "members" && <MembersTab usersById={usersById} />}
      {tab === "applications" && <ApplicationsTab />}
      {tab === "payments" && <PaymentsTab usersById={usersById} />}
      {tab === "finance" && <FinanceTab />}
      {tab === "debits" && <DebitsTab />}
      {tab === "inventory" && <InventoryTab />}
      {tab === "orders" && <OrdersTab />}
      {tab === "notifications" && <NotificationsTab usersById={usersById} />}
      {tab === "adverts" && <AdvertsTab />}
      {tab === "trainers" && <TrainersTab />}
      {tab === "bookings" && <BookingsTab />}
      {tab === "employees" && <EmployeesTab />}
      </div>
      </div>
    </div>
  );
}