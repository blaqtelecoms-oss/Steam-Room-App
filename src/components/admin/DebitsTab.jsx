import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, RefreshCw } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import DebitRow from "@/components/admin/debits/DebitRow";
import DebitUpload from "@/components/admin/debits/DebitUpload";

const SECTIONS = [
  { id: "unsuccessful", label: "Unsuccessful", tone: "text-destructive" },
  { id: "unpaid", label: "Unpaid accounts", tone: "text-destructive" },
  { id: "unreported", label: "Debited, not reported", tone: "text-yellow-400" },
  { id: "notdebited", label: "Not debited", tone: "text-muted-foreground" },
  { id: "debited", label: "Debited", tone: "text-primary" },
];

export default function DebitsTab() {
  const [months, setMonths] = useState([]);
  const [month, setMonth] = useState("");
  const [records, setRecords] = useState([]);
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [section, setSection] = useState("unsuccessful");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const [mo, mem] = await Promise.all([
        base44.entities.DebitRecord.list({ distinct: "month" }),
        base44.entities.Member.list("-created_date", 1000),
      ]);
      const sorted = (mo.items || []).sort().reverse();
      setMonths(sorted);
      setMembers(mem);
      setMonth(sorted[0] || "");
    })();
  }, []);

  const load = async (m) => {
    setLoading(true);
    const range = { $gte: `${m}-01`, $lte: `${m}-31` };
    const [recs, pays] = await Promise.all([
      base44.entities.DebitRecord.filter({ month: m }, { limit: 1000 }),
      base44.entities.Payment.filter({ $or: [{ date: range }, { due_date: range }] }, { limit: 1000 }),
    ]);
    setRecords(recs.items);
    setPayments(pays.items);
    setLoading(false);
  };

  useEffect(() => { if (month) load(month); }, [month]);

  const byId = useMemo(() => Object.fromEntries(members.map((m) => [m.id, m])), [members]);

  const data = useMemo(() => {
    const debited = records.filter((r) => r.outcome === "debited");
    const unsuccessful = records.filter((r) => r.outcome === "unsuccessful");
    const debitedIds = new Set(debited.map((r) => r.member_id).filter(Boolean));
    const unpaid = unsuccessful.filter((r) => !r.member_id || !debitedIds.has(r.member_id));
    const isReported = (r) => payments.some((p) => p.invoice_no === `${r.reference}-${r.action_date}` || (p.member_id === r.member_id && p.status === "paid"));
    const unreported = debited.filter((r) => !isReported(r));
    const recordIds = new Set(records.map((r) => r.member_id).filter(Boolean));
    const notdebited = members
      .filter((m) => (m.card_id || "").includes("DC") && m.status !== "expired" && (!m.date_joined || m.date_joined <= `${month}-31`) && !debitedIds.has(m.id))
      .map((m) => ({ id: m.id, member_id: m.id, reference: m.card_id, action_date: month, amount: m.monthly_premium || m.next_payment_amount || 0, _noRecord: !recordIds.has(m.id) }));
    return { debited, unsuccessful, unpaid, unreported, notdebited };
  }, [records, payments, members, month]);

  const sum = (arr) => arr.reduce((s, r) => s + (Number(r.amount) || 0), 0);

  const reminderLink = (r) => {
    const m = byId[r.member_id];
    const phone = (m?.phone || "").replace(/[^0-9]/g, "");
    if (!phone) return null;
    const text = encodeURIComponent(`Hi ${m?.full_name || ""}, your debit of R${r.amount} on ${r.action_date} was unsuccessful. Please settle to keep your membership active. SR FITS.`);
    return `https://wa.me/${phone}?text=${text}`;
  };

  const syncHistory = async () => {
    setSyncing(true);
    const toCreate = [];
    data.unreported.forEach((r) => {
      if (!r.member_id) return;
      toCreate.push({ member_id: r.member_id, amount: r.amount, date: r.action_date, due_date: r.action_date, status: "paid", type: "membership", method: "Debit order", invoice_no: `${r.reference}-${r.action_date}`, description: `Debit order ${month}` });
    });
    data.unpaid.forEach((r) => {
      if (!r.member_id) return;
      const inv = `${r.reference}-${r.action_date}`;
      if (payments.some((p) => p.invoice_no === inv)) return;
      toCreate.push({ member_id: r.member_id, amount: r.amount, date: r.action_date, due_date: r.action_date, status: "overdue", type: "membership", method: "Debit order", invoice_no: inv, description: `Unsuccessful debit ${month}` });
    });
    if (toCreate.length) await base44.entities.Payment.bulkCreate(toCreate);
    setMsg(`${toCreate.length} payment record(s) added to member histories.`);
    await load(month);
    setSyncing(false);
  };

  const list = data[section] || [];
  const active = SECTIONS.find((s) => s.id === section);

  return (
    <div className="space-y-4">
      <DebitUpload members={members} onDone={() => load(month)} />
      <div className="flex flex-wrap items-center gap-2">
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-[160px] h-9 text-xs rounded-lg border-primary/20 bg-card"><SelectValue placeholder="Month" /></SelectTrigger>
          <SelectContent>{months.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
        </Select>
        <button onClick={syncHistory} disabled={syncing || loading} className="flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold uppercase tracking-wide disabled:opacity-60">
          {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Update payment history
        </button>
      </div>
      {msg && <p className="text-xs text-primary">{msg}</p>}

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
        {SECTIONS.map((s) => (
          <button key={s.id} onClick={() => setSection(s.id)} className={`rounded-xl border p-3 text-left ${section === s.id ? "border-primary bg-primary/10" : "border-primary/15 bg-card"}`}>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className={`font-display text-lg ${s.tone}`}>{data[s.id].length}</p>
            <p className="text-[10px] text-muted-foreground">R{sum(data[s.id])}</p>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
      ) : list.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Nothing in this list for {month}.</p>
      ) : (
        <div className="space-y-2">
          {list.map((r, i) => (
            <DebitRow key={r.id + i} record={r} member={byId[r.member_id]} tone={active.tone} note={r._noRecord ? "No debit record this month" : ""} reminderLink={(section === "unsuccessful" || section === "unpaid") ? reminderLink(r) : null} />
          ))}
        </div>
      )}
    </div>
  );
}