import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Upload, FileUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function DebitUpload({ members, onDone }) {
  const [outcome, setOutcome] = useState("debited");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  const process = async () => {
    if (!file) { setErr("Choose a PDF first."); return; }
    setBusy(true); setErr(""); setResult(null);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file, bucket: "documents" });
      const ext = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: file_uri,
        json_schema: {
          type: "object",
          properties: {
            records: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  reference: { type: "string" },
                  account_holder: { type: "string" },
                  amount: { type: "number" },
                  action_date: { type: "string" },
                },
                required: ["reference", "amount", "action_date"],
              },
            },
          },
        },
      });
      if (ext.status !== "success" || !ext.output) throw new Error(ext.details || "Extraction failed");
      const raw = Array.isArray(ext.output) ? ext.output : (ext.output.records || []);
      const norm = (d) => { const s = String(d || "").trim(); if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s; const dt = new Date(s); return isNaN(dt) ? null : dt.toISOString().slice(0, 10); };
      const amt = (a) => { const n = typeof a === "number" ? a : Number(String(a || "").replace(/[^0-9.]/g, "")); return isNaN(n) ? 0 : n; };
      const records = raw.map((r) => ({ reference: String(r.reference || "").toUpperCase().trim(), amount: amt(r.amount), action_date: norm(r.action_date) })).filter((r) => r.reference && r.action_date);
      if (!records.length) throw new Error("No valid rows found in the document.");

      const map = {};
      members.forEach((m) => { if (m.card_id) map[m.card_id] = m.id; });
      const withMember = records.map((r) => ({ reference: r.reference, amount: r.amount, action_date: r.action_date, member_id: map[r.reference] || "", month: r.action_date.slice(0, 7), outcome }));

      const months = [...new Set(withMember.map((r) => r.month))];
      const existing = [];
      for (const m of months) { const p = await base44.entities.DebitRecord.filter({ month: m }, { limit: 1000 }); existing.push(...p.items); }
      const exKeys = new Set(existing.map((r) => `${r.reference}|${r.action_date}`));
      const newRecords = withMember.filter((r) => !exKeys.has(`${r.reference}|${r.action_date}`));
      for (let i = 0; i < newRecords.length; i += 100) { await base44.entities.DebitRecord.bulkCreate(newRecords.slice(i, i + 100)); }

      const dates = withMember.map((r) => r.action_date).sort();
      const minD = dates[0], maxD = dates[dates.length - 1];
      const pays = await base44.entities.Payment.filter({ $or: [{ date: { $gte: minD, $lte: maxD } }, { due_date: { $gte: minD, $lte: maxD } }] }, { limit: 1000 });
      const invSet = new Set(pays.items.map((p) => p.invoice_no));
      const toCreate = [];
      withMember.forEach((r) => {
        if (!r.member_id) return;
        const inv = `${r.reference}-${r.action_date}`;
        if (invSet.has(inv)) return;
        toCreate.push({ member_id: r.member_id, amount: r.amount, date: r.action_date, due_date: r.action_date, status: outcome === "debited" ? "paid" : "overdue", type: "membership", method: "Debit order", invoice_no: inv, description: outcome === "debited" ? `Debit order ${r.month}` : `Unsuccessful debit ${r.month}` });
      });
      for (let i = 0; i < toCreate.length; i += 100) { await base44.entities.Payment.bulkCreate(toCreate.slice(i, i + 100)); }

      setResult({ extracted: records.length, debitsCreated: newRecords.length, paymentsCreated: toCreate.length, unmatched: withMember.filter((r) => !r.member_id).length });
      onDone();
    } catch (e) {
      setErr(e?.message || "Processing failed.");
    }
    setBusy(false);
  };

  return (
    <div className="rounded-2xl border border-primary/25 bg-card p-4 space-y-3">
      <p className="font-display text-[10px] tracking-widest text-primary">UPLOAD DEBIT ORDER PDF</p>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={outcome} onValueChange={setOutcome}>
          <SelectTrigger className="w-[170px] h-9 text-xs rounded-lg border-primary/20 bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="debited">Successful debits</SelectItem>
            <SelectItem value="unsuccessful">Unsuccessful debits</SelectItem>
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 rounded-lg border border-primary/20 px-3 py-2 text-xs cursor-pointer hover:bg-primary/10">
          <Upload className="w-3.5 h-3.5 text-primary" />
          <span className="truncate max-w-[140px]">{file ? file.name : "Choose PDF…"}</span>
          <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>
        <button onClick={process} disabled={busy} className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wide disabled:opacity-60">
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileUp className="w-3.5 h-3.5" />} Process
        </button>
      </div>
      {err && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {err}</p>}
      {result && (
        <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 text-xs space-y-1">
          <p className="flex items-center gap-1.5 text-primary font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /> Processed {result.extracted} rows</p>
          <p className="text-muted-foreground">{result.debitsCreated} debit record(s) saved · {result.paymentsCreated} payment(s) added to member histories · {result.unmatched} unmatched reference(s).</p>
        </div>
      )}
      <p className="text-[10px] text-muted-foreground">Upload the successful-debits PDF with "Successful debits" selected, then the unsuccessful-debits PDF with "Unsuccessful debits" selected. The system reads each row, matches references to members, and writes records to every member's history.</p>
    </div>
  );
}