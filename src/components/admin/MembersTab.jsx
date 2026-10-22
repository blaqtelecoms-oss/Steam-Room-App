import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search, Snowflake, CheckCircle, KeyRound, Loader2, Phone, ChevronRight, Mail, MailCheck, UserPlus } from "lucide-react";
import AddMemberForm from "@/components/admin/AddMemberForm";

export default function MembersTab({ usersById }) {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState("");
  const [invitingAll, setInvitingAll] = useState(false);
  const [inviteState, setInviteState] = useState({});
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    const res = await base44.entities.Member.list("-created_date", 500);
    setMembers(res);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggleStatus = async (m) => {
    setBusyId(m.id);
    const next = m.status === "frozen" ? "active" : "frozen";
    await base44.entities.Member.update(m.id, { status: next });
    setMembers((ms) => ms.map((x) => (x.id === m.id ? { ...x, status: next } : x)));
    setBusyId(null);
  };

  const resetPassword = async (m) => {
    const email = m.email || usersById[m.created_by_id]?.email;
    if (!email) { setMsg(`No email on file for ${m.full_name}.`); return; }
    setBusyId(m.id);
    try {
      await base44.auth.resetUserPassword(email);
      setMsg(`Password reset email sent to ${email}.`);
    } catch (e) {
      setMsg(e?.message || "Failed to send reset email.");
    }
    setBusyId(null);
  };

  const inviteOne = async (m) => {
    if (!m.email) { setMsg(`${m.full_name} has no email on file.`); return; }
    setBusyId(m.id);
    try {
      await base44.users.inviteUser(m.email, "user");
      setInviteState((s) => ({ ...s, [m.id]: "done" }));
      setMsg(`Invite sent to ${m.email}.`);
    } catch (e) {
      setInviteState((s) => ({ ...s, [m.id]: "error" }));
      setMsg(e?.message || `Failed to invite ${m.email}.`);
    }
    setBusyId(null);
  };

  const inviteAll = async () => {
    const withEmail = members.filter((m) => m.email);
    if (withEmail.length === 0) { setMsg("No members with email addresses found."); return; }
    if (!confirm(`Send invites to ${withEmail.length} members?`)) return;
    setInvitingAll(true);
    let ok = 0, fail = 0;
    for (const m of withEmail) {
      try {
        await base44.users.inviteUser(m.email, "user");
        setInviteState((s) => ({ ...s, [m.id]: "done" }));
        ok++;
      } catch (e) {
        setInviteState((s) => ({ ...s, [m.id]: "error" }));
        fail++;
      }
    }
    setMsg(`Invites sent: ${ok} successful, ${fail} failed.`);
    setInvitingAll(false);
  };

  const filtered = members.filter((m) => m.full_name?.toLowerCase().includes(q.toLowerCase()));

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search members..." className="w-full rounded-xl bg-white/[0.03] border border-primary/20 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary" />
      </div>
      {msg && <p className="text-xs text-primary bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">{msg}</p>}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground whitespace-nowrap">{filtered.length} member(s)</p>
        <div className="flex gap-2">
          <button onClick={() => setShowAdd((s) => !s)} className="flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/20 rounded-lg px-3 py-2 hover:bg-primary/10">
            <UserPlus className="w-3.5 h-3.5" /> Add Member
          </button>
          <button onClick={inviteAll} disabled={invitingAll} className="flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/20 rounded-lg px-3 py-2 hover:bg-primary/10 disabled:opacity-50">
            {invitingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MailCheck className="w-3.5 h-3.5" />} Invite All
          </button>
        </div>
      </div>

      {showAdd && <AddMemberForm onDone={() => { setShowAdd(false); load(); }} />}
      {filtered.map((m) => (
        <div key={m.id} className="rounded-2xl border border-primary/15 bg-card p-4">
          <button onClick={() => navigate(`/admin/member/${m.id}`)} className="w-full flex items-start justify-between gap-3 text-left">
            <div>
              <p className="font-semibold text-sm">{m.full_name}</p>
              <p className="text-xs text-muted-foreground">{m.membership_tier} · joined {m.date_joined}</p>
              {m.phone && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Phone className="w-3 h-3" />{m.phone}</p>}
              {m.email && <p className="text-xs text-muted-foreground mt-0.5">{m.email}</p>}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-full whitespace-nowrap ${m.status === "active" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>{m.status}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </button>
          <div className="flex gap-2 mt-3">
            <button onClick={() => toggleStatus(m)} disabled={busyId === m.id} className="flex items-center gap-1.5 text-xs font-semibold rounded-lg border border-primary/20 px-3 py-2 hover:bg-primary/10">
              {m.status === "frozen" ? <CheckCircle className="w-3.5 h-3.5 text-primary" /> : <Snowflake className="w-3.5 h-3.5" />}
              {m.status === "frozen" ? "Activate" : "Freeze"}
            </button>
            <button onClick={() => resetPassword(m)} disabled={busyId === m.id} className="flex items-center gap-1.5 text-xs font-semibold rounded-lg border border-primary/20 px-3 py-2 hover:bg-primary/10">
              <KeyRound className="w-3.5 h-3.5" /> Reset Password
            </button>
            <button onClick={() => inviteOne(m)} disabled={busyId === m.id || !m.email} className="flex items-center gap-1.5 text-xs font-semibold rounded-lg border border-primary/20 px-3 py-2 hover:bg-primary/10 disabled:opacity-40">
              {busyId === m.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : inviteState[m.id] === "done" ? <MailCheck className="w-3.5 h-3.5 text-primary" /> : <Mail className="w-3.5 h-3.5" />}
              {inviteState[m.id] === "done" ? "Invited" : "Invite"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}