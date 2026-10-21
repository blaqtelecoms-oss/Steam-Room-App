import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Plus, X, Mail, Briefcase, CheckCircle2, Clock, Ban, Trash2, Pencil, Save } from "lucide-react";

const AVAILABLE_DUTIES = [
  { id: "finance", label: "Finance", desc: "Financial reports & collections" },
  { id: "payments", label: "Payments", desc: "View & manage member payments" },
  { id: "orders", label: "Orders", desc: "Process merchandise orders" },
  { id: "members", label: "Members", desc: "View & manage member accounts" },
  { id: "applications", label: "Applications", desc: "Review challenge applications" },
  { id: "inventory", label: "Inventory", desc: "Manage shop products & stock" },
  { id: "notifications", label: "Notifications", desc: "Send member notifications" },
  { id: "adverts", label: "Adverts", desc: "Manage home page adverts" },
  { id: "trainers", label: "Trainers", desc: "Manage trainer profiles" },
  { id: "bookings", label: "Bookings", desc: "View & manage bookings" },
];

export default function EmployeesTab() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("list"); // "list" | "invite" | "edit"
  const [form, setForm] = useState({ email: "", full_name: "", permitted_tabs: [] });
  const [editing, setEditing] = useState(null);
  const [editTabs, setEditTabs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    const emps = await base44.entities.Employee.list("-created_date", 500);
    setEmployees(emps);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const invite = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setResult(null);
    try {
      const res = await base44.functions.invoke("InviteEmployee", form);
      setResult(res.data);
      setForm({ email: "", full_name: "", permitted_tabs: [] });
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Could not invite employee.");
    }
    setSaving(false);
  };

  const saveEdit = async () => {
    setSaving(true);
    setError("");
    try {
      await base44.entities.Employee.update(editing.id, { permitted_tabs: editTabs });
      setEmployees((prev) => prev.map((e) => (e.id === editing.id ? { ...e, permitted_tabs: editTabs } : e)));
      setMode("list");
      setEditing(null);
    } catch (e) {
      setError(e?.message || "Could not update duties.");
    }
    setSaving(false);
  };

  const toggleTab = (tabId, currentTabs, setTabs) => {
    if (currentTabs.includes(tabId)) {
      setTabs(currentTabs.filter((t) => t !== tabId));
    } else {
      setTabs([...currentTabs, tabId]);
    }
  };

  const toggleActive = async (emp) => {
    await base44.entities.Employee.update(emp.id, { active: !emp.active });
    setEmployees((prev) => prev.map((e) => (e.id === emp.id ? { ...e, active: !e.active } : e)));
  };

  const remove = async (emp) => {
    if (!confirm(`Delete employee ${emp.emp_number}? This also deletes their linked member record.`)) return;
    if (emp.member_id) {
      try { await base44.entities.Member.delete(emp.member_id); } catch {}
    }
    await base44.entities.Employee.delete(emp.id);
    setEmployees((prev) => prev.filter((e) => e.id !== emp.id));
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;

  // --- Invite Form ---
  if (mode === "invite") {
    return (
      <form onSubmit={invite} className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-display text-sm tracking-wide text-primary">INVITE EMPLOYEE</p>
          <button type="button" onClick={() => { setMode("list"); setResult(null); setError(""); }} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-card p-4 space-y-3">
          <label className="block">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Full Name</span>
            <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary" />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Email</span>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary" />
          </label>
          <div>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Assigned Duties (tick all that apply)</span>
            <div className="mt-1.5 space-y-1.5">
              {AVAILABLE_DUTIES.map((d) => (
                <label key={d.id} className={`flex items-start gap-2.5 rounded-lg border p-2.5 cursor-pointer transition-colors ${form.permitted_tabs.includes(d.id) ? "border-primary bg-primary/10" : "border-primary/15 hover:bg-white/[0.02]"}`}>
                  <input
                    type="checkbox"
                    checked={form.permitted_tabs.includes(d.id)}
                    onChange={() => toggleTab(d.id, form.permitted_tabs, (tabs) => setForm({ ...form, permitted_tabs: tabs }))}
                    className="mt-0.5 accent-primary w-4 h-4"
                  />
                  <div>
                    <p className="text-sm font-medium">{d.label}</p>
                    <p className="text-[11px] text-muted-foreground">{d.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">Leave all unticked for personal information only access.</p>
          </div>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        {result && (
          <div className="rounded-2xl border border-primary/30 bg-primary/10 p-3 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-primary">Employee invited successfully!</p>
              <p className="text-xs text-muted-foreground mt-1">EMP Number: <span className="font-mono font-bold text-primary">{result.emp_number}</span></p>
              <p className="text-[11px] text-muted-foreground mt-1">Share this EMP number with the employee. They'll use it to log into the Employee Portal after accepting the email invitation.</p>
            </div>
          </div>
        )}
        <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold uppercase tracking-wide disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />} Invite & Create EMP
        </button>
      </form>
    );
  }

  // --- Edit Duties Form ---
  if (mode === "edit" && editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-sm tracking-wide text-primary">EDIT DUTIES</p>
            <p className="text-xs text-muted-foreground mt-0.5">{editing.emp_number} · {editing.full_name || editing.email}</p>
          </div>
          <button type="button" onClick={() => { setMode("list"); setEditing(null); setError(""); }} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-card p-4 space-y-1.5">
          {AVAILABLE_DUTIES.map((d) => (
            <label key={d.id} className={`flex items-start gap-2.5 rounded-lg border p-2.5 cursor-pointer transition-colors ${editTabs.includes(d.id) ? "border-primary bg-primary/10" : "border-primary/15 hover:bg-white/[0.02]"}`}>
              <input
                type="checkbox"
                checked={editTabs.includes(d.id)}
                onChange={() => toggleTab(d.id, editTabs, setEditTabs)}
                className="mt-0.5 accent-primary w-4 h-4"
              />
              <div>
                <p className="text-sm font-medium">{d.label}</p>
                <p className="text-[11px] text-muted-foreground">{d.desc}</p>
              </div>
            </label>
          ))}
          <p className="text-[11px] text-muted-foreground mt-2">Leave all unticked for personal information only access.</p>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <button onClick={saveEdit} disabled={saving} className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold uppercase tracking-wide disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Duties
        </button>
      </div>
    );
  }

  // --- Employee List ---
  return (
    <div className="space-y-4">
      <button onClick={() => { setMode("invite"); setResult(null); setError(""); }} className="flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold uppercase tracking-wide">
        <Plus className="w-3.5 h-3.5" /> Invite Employee
      </button>

      {employees.length === 0 ? (
        <div className="rounded-2xl border border-primary/15 bg-white/[0.02] p-6 text-center">
          <Briefcase className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No employees yet. Invite your first employee to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {employees.map((emp) => {
            const tabs = emp.permitted_tabs || [];
            return (
              <div key={emp.id} className="rounded-xl border border-primary/15 bg-card p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-primary">{emp.emp_number}</span>
                      <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${emp.active ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>
                        {emp.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm font-medium mt-1 truncate">{emp.full_name || emp.email}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{emp.email}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {tabs.length > 0 ? (
                        tabs.map((tabId) => {
                          const duty = AVAILABLE_DUTIES.find((d) => d.id === tabId);
                          return <span key={tabId} className="text-[9px] uppercase tracking-wide bg-accent/15 text-accent px-1.5 py-0.5 rounded">{duty?.label || tabId}</span>;
                        })
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">Personal info only</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {emp.accepted_date ? (
                        <span className="flex items-center gap-1 text-[10px] text-primary"><CheckCircle2 className="w-3 h-3" /> Accepted</span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="w-3 h-3" /> Pending</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => { setEditing(emp); setEditTabs(emp.permitted_tabs || []); setMode("edit"); setError(""); }}
                      className="w-7 h-7 rounded border border-primary/20 flex items-center justify-center hover:bg-primary/10"
                      title="Edit duties"
                    >
                      <Pencil className="w-3 h-3 text-primary" />
                    </button>
                    <button onClick={() => toggleActive(emp)} className="w-7 h-7 rounded border border-primary/20 flex items-center justify-center hover:bg-primary/10" title={emp.active ? "Deactivate" : "Activate"}>
                      <Ban className="w-3 h-3 text-muted-foreground" />
                    </button>
                    <button onClick={() => remove(emp)} className="w-7 h-7 rounded border border-destructive/20 flex items-center justify-center hover:bg-destructive/10" title="Delete">
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}