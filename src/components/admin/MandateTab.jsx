import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Save, Loader2, ExternalLink, FileText } from "lucide-react";
import MandateFormFields, { EMPTY_MANDATE as EMPTY, buildMandatePayload } from "@/components/shared/MandateFormFields";

const MANDATE_URL = "https://www.electronicmandate.com/srfits/";

export default function MandateTab({ memberId, memberName }) {
  const [mandate, setMandate] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.entities.Mandate.filter({ member_id: memberId }, "-created_date", 1);
        if (res[0]) {
          setMandate(res[0]);
          setForm({ ...EMPTY, ...res[0] });
        }
      } catch { /* bubble */ }
      setLoading(false);
    })();
  }, [memberId]);

  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    setMsg("");
    try {
      const payload = buildMandatePayload(form);
      if (mandate) {
        const updated = await base44.entities.Mandate.update(mandate.id, payload);
        setMandate(updated);
      } else {
        const created = await base44.entities.Mandate.create({ ...payload, member_id: memberId });
        setMandate(created);
      }
      setMsg("Mandate saved.");
      setTimeout(() => setMsg(""), 2500);
    } catch (e) {
      setMsg(e?.message || "Save failed.");
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <a href={MANDATE_URL} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 hover:bg-primary/15 transition-colors">
        <div className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-primary" />
          <div>
            <p className="text-sm font-semibold text-primary">Open official mandate form</p>
            <p className="text-[11px] text-muted-foreground">electronicmandate.com/srfits — submit new or updated debit orders here</p>
          </div>
        </div>
      </a>

      <div className="rounded-2xl border border-primary/15 bg-card p-4 space-y-4">
        <p className="font-display text-[10px] tracking-widest text-primary flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> MANDATE DETAILS {memberName ? `· ${memberName}` : ""}</p>

        <MandateFormFields form={form} upd={upd} />

        <div className="flex items-center gap-2 pt-1">
          <button onClick={save} disabled={saving} className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-lg px-4 py-2 text-xs font-semibold">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save mandate
          </button>
          {msg && <p className="text-xs text-primary">{msg}</p>}
        </div>
      </div>
    </div>
  );
}