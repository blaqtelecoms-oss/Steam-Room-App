import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Send } from "lucide-react";

export default function NotificationsTab({ usersById }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");

  useEffect(() => {
    base44.entities.Member.list("-created_date", 500).then((res) => { setMembers(res); setLoading(false); });
  }, []);

  const send = async () => {
    if (!subject || !body) { setResult("Add a subject and message first."); return; }
    setSending(true);
    setResult("");
    let sent = 0, failed = 0;
    for (const m of members) {
      const email = usersById[m.created_by_id]?.email;
      if (!email) { failed++; continue; }
      try {
        await base44.integrations.Core.SendEmail({ to: email, subject, body });
        sent++;
      } catch {
        failed++;
      }
    }
    setSending(false);
    setResult(`Sent to ${sent} member(s)${failed ? `, ${failed} skipped (no email on file)` : ""}.`);
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-primary/15 bg-card p-4">
        <p className="text-xs text-muted-foreground mb-3">Broadcast an email to all {members.length} member(s) with an email on file.</p>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="w-full rounded-xl bg-white/[0.03] border border-primary/20 px-4 py-2.5 text-sm outline-none focus:border-primary mb-2" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message..." rows={5} className="w-full rounded-xl bg-white/[0.03] border border-primary/20 px-4 py-2.5 text-sm outline-none focus:border-primary resize-none" />
        <button onClick={send} disabled={sending} className="w-full mt-3 bg-primary text-primary-foreground py-3 rounded-xl text-sm font-semibold uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-60">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send Broadcast
        </button>
        {result && <p className="text-xs text-primary mt-3">{result}</p>}
      </div>
    </div>
  );
}