import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, CheckCircle, Trophy, ImageOff, Sparkles } from "lucide-react";

const photos = [
  { key: "before_front", label: "Before · Front" },
  { key: "before_side", label: "Before · Side" },
  { key: "before_back", label: "Before · Back" },
  { key: "after_front", label: "After · Front" },
  { key: "after_side", label: "After · Side" },
  { key: "after_back", label: "After · Back" },
];

export default function ApplicationsTab() {
  const [entries, setEntries] = useState([]);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [aiId, setAiId] = useState(null);

  const load = async () => {
    const [res, vs] = await Promise.all([
      base44.entities.Challenge.list("-created_date", 500),
      base44.entities.Vote.list("-created_date", 1000),
    ]);
    setEntries(res);
    setVotes(vs);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const voteCount = (cid) => votes.filter((v) => v.challenge_id === cid).length;
  const composite = (e) => (e.ai_score || 0) + voteCount(e.id) * 5;

  const setStatus = async (e, status) => {
    setBusyId(e.id);
    await base44.entities.Challenge.update(e.id, { status });
    setEntries((es) => es.map((x) => (x.id === e.id ? { ...x, status } : x)));
    setBusyId(null);
  };

  const runAI = async (e) => {
    setAiId(e.id);
    try {
      const file_urls = photos.map((p) => e[p.key]).filter(Boolean);
      if (file_urls.length < 3) {
        alert("Need at least the 3 before photos to run AI analysis.");
        setAiId(null);
        return;
      }
      const res = await base44.integrations.Core.InvokeLLM({
        prompt:
          "You are an expert bodybuilding & transformation judge. Compare the BEFORE photos (front, side, back) with the AFTER photos (front, side, back). Evaluate the physical improvement based on body composition change, muscle definition, symmetry, and overall transformation. Return a score from 0 to 100 (higher = better transformation) and a short 1-2 sentence feedback.",
        file_urls,
        response_json_schema: {
          type: "object",
          properties: {
            score: { type: "number" },
            feedback: { type: "string" },
          },
        },
      });
      await base44.entities.Challenge.update(e.id, { ai_score: res.score, ai_feedback: res.feedback });
      setEntries((es) => es.map((x) => (x.id === e.id ? { ...x, ai_score: res.score, ai_feedback: res.feedback } : x)));
    } catch (err) {
      alert(err?.message || "AI analysis failed.");
    } finally {
      setAiId(null);
    }
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;

  const ranked = [...entries].sort((a, b) => composite(b) - composite(a));

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{entries.length} entr{entries.length === 1 ? "y" : "ies"} · ranked by AI score + public votes</p>
      {entries.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No applications yet.</p>}
      {ranked.map((e) => {
        const vc = voteCount(e.id);
        return (
          <div key={e.id} className="rounded-2xl border border-primary/15 bg-card p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="font-semibold text-sm">{e.full_name}</p>
                <p className="text-xs text-muted-foreground">{e.division} division</p>
              </div>
              <div className="text-right">
                <span className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-full whitespace-nowrap ${e.status === "winner" ? "bg-yellow-500/15 text-yellow-400" : e.status === "approved" ? "bg-primary/15 text-primary" : "bg-white/5 text-muted-foreground"}`}>{e.status}</span>
                <p className="text-[10px] text-muted-foreground mt-1">Combined: {composite(e)}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              {photos.map((p) => (
                <div key={p.key}>
                  <p className="text-[9px] text-muted-foreground uppercase mb-1">{p.label}</p>
                  {e[p.key] ? (
                    <a href={e[p.key]} target="_blank" rel="noreferrer">
                      <img src={e[p.key]} alt={p.label} className="w-full h-20 object-cover rounded-lg border border-primary/15" />
                    </a>
                  ) : (
                    <div className="w-full h-20 rounded-lg border border-primary/10 flex items-center justify-center"><ImageOff className="w-4 h-4 text-muted-foreground" /></div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 mb-3 text-xs">
              <span className="flex items-center gap-1 text-primary">AI: <b>{e.ai_score != null ? `${e.ai_score}/100` : "—"}</b></span>
              <span className="flex items-center gap-1 text-primary">Votes: <b>{vc}</b></span>
            </div>

            {e.ai_feedback && (
              <p className="text-[11px] text-muted-foreground bg-white/[0.03] border border-primary/10 rounded-lg px-3 py-2 mb-3">
                <Sparkles className="w-3 h-3 inline mr-1 text-primary" />{e.ai_feedback}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <button onClick={() => setStatus(e, "approved")} disabled={busyId === e.id} className="flex items-center gap-1.5 text-xs font-semibold rounded-lg border border-primary/20 px-3 py-2 hover:bg-primary/10">
                <CheckCircle className="w-3.5 h-3.5 text-primary" /> Approve
              </button>
              <button onClick={() => setStatus(e, "winner")} disabled={busyId === e.id} className="flex items-center gap-1.5 text-xs font-semibold rounded-lg border border-yellow-500/30 px-3 py-2 hover:bg-yellow-500/10">
                <Trophy className="w-3.5 h-3.5 text-yellow-400" /> Mark Winner
              </button>
              <button onClick={() => runAI(e)} disabled={aiId === e.id} className="flex items-center gap-1.5 text-xs font-semibold rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 hover:bg-primary/20">
                {aiId === e.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-primary" />} Run AI Analysis
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}