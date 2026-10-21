import React from "react";
import { QrCode, ShieldCheck } from "lucide-react";

export default function MemberCard({ member }) {
  const cardId = member.card_id || member.id;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=0&color=000000&bgcolor=FFFFFF&data=${encodeURIComponent("SR-FITS:" + cardId)}`;

  return (
    <div className="relative rounded-2xl border border-primary/40 bg-gradient-to-br from-card via-background to-card p-5 overflow-hidden shadow-xl shadow-primary/10">
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/5 blur-2xl" />
      <div className="relative flex items-start justify-between mb-4">
        <div>
          <p className="font-display text-[10px] tracking-widest text-primary">STEAM ROOM</p>
          <p className="font-display text-[8px] tracking-[0.3em] text-muted-foreground">FITNESS CENTER</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-primary/15 border border-primary/40 text-primary text-[10px] font-semibold uppercase tracking-wide">
          {member.membership_tier}
        </span>
      </div>
      <div className="relative flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Member</p>
          <h3 className="font-space font-bold text-lg truncate">{member.full_name}</h3>
          <p className="text-xs text-muted-foreground mt-2">Member since</p>
          <p className="text-sm font-medium text-lime-soft">
            {new Date(member.date_joined).toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric" })}
          </p>
          <div className="flex items-center gap-1.5 mt-3">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">{member.status}</span>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-[140px] h-[140px] rounded-xl bg-white p-2">
            <img src={qrUrl} alt="Entry QR" className="w-full h-full object-contain" />
          </div>
          <p className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1.5">
            <QrCode className="w-3 h-3" /> Scan to enter
          </p>
          <p className="text-[9px] font-mono text-muted-foreground mt-0.5">{cardId}</p>
        </div>
      </div>
    </div>
  );
}