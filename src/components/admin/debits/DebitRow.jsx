import React from "react";
import { Send } from "lucide-react";

export default function DebitRow({ record, member, note, tone, reminderLink }) {
  return (
    <div className="rounded-xl border border-primary/15 bg-card p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{member?.full_name || "Unknown member"}</p>
          <p className="text-[11px] text-muted-foreground truncate">{record.reference} · {record.action_date}{note ? ` · ${note}` : ""}</p>
        </div>
        <p className={`font-display text-sm shrink-0 ${tone}`}>R{record.amount}</p>
      </div>
      {reminderLink && (
        <a href={reminderLink} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold rounded-lg border border-primary/20 px-3 py-1.5 hover:bg-primary/10">
          <Send className="w-3 h-3 text-primary" /> Send reminder
        </a>
      )}
    </div>
  );
}