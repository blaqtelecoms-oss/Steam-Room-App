import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ThumbsUp, LogIn, Trophy, ImageOff } from "lucide-react";

export default function ChallengeVoting() {
  const [user, setUser] = useState(null);
  const [authed, setAuthed] = useState(null);
  const [finalists, setFinalists] = useState([]);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState(null);

  const load = async () => {
    const [fs, vs] = await Promise.all([
      base44.entities.Challenge.filter({ status: { $in: ["approved", "winner"] } }, "-created_date", 100),
      base44.entities.Vote.list("-created_date", 1000),
    ]);
    setFinalists(fs);
    setVotes(vs);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      try {
        const isAuthed = await base44.auth.isAuthenticated();
        setAuthed(isAuthed);
        if (isAuthed) setUser(await base44.auth.me());
      } catch {
        setAuthed(false);
      }
      load().catch(() => setLoading(false));
    })();
  }, []);

  const voteCount = (cid) => votes.filter((v) => v.challenge_id === cid).length;
  const alreadyVoted = (cid) => authed && votes.some((v) => v.challenge_id === cid && v.created_by_id === user?.id);

  const castVote = async (cid) => {
    if (!authed) { base44.auth.redirectToLogin("/challenge"); return; }
    if (alreadyVoted(cid)) return;
    setVotingId(cid);
    try {
      await base44.entities.Vote.create({ challenge_id: cid });
      const vs = await base44.entities.Vote.list("-created_date", 1000);
      setVotes(vs);
    } finally {
      setVotingId(null);
    }
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;

  if (finalists.length === 0) {
    return (
      <div className="rounded-2xl border border-primary/15 bg-card p-8 text-center">
        <Trophy className="w-8 h-8 text-primary/50 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Finalists will appear here once voting opens.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-center">
        <p className="text-xs text-foreground">🗳️ Public voting is open. Tap <span className="text-primary font-semibold">Vote</span> for your favourite transformation. One vote per member.</p>
      </div>

      {finalists.map((f) => {
        const count = voteCount(f.id);
        const voted = alreadyVoted(f.id);
        const isWinner = f.status === "winner";
        return (
          <div key={f.id} className={`rounded-2xl border bg-card overflow-hidden ${isWinner ? "border-yellow-500/50" : "border-primary/20"}`}>
            {isWinner && <div className="bg-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase tracking-widest text-center py-1">🏆 Winner</div>}
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold text-sm">{f.full_name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{f.division}</p>
                </div>
                {f.ai_score != null && (
                  <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">AI {f.ai_score}/100</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase mb-1">Before</p>
                  {f.before_front ? (
                    <img src={f.before_front} alt="before" className="w-full h-32 object-cover rounded-lg border border-primary/15" />
                  ) : (
                    <div className="w-full h-32 rounded-lg border border-primary/10 flex items-center justify-center"><ImageOff className="w-5 h-5 text-muted-foreground" /></div>
                  )}
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase mb-1">After</p>
                  {f.after_front ? (
                    <img src={f.after_front} alt="after" className="w-full h-32 object-cover rounded-lg border border-primary/15" />
                  ) : (
                    <div className="w-full h-32 rounded-lg border border-primary/10 flex items-center justify-center text-[10px] text-muted-foreground">Pending</div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5 text-primary" /> {count} vote{count === 1 ? "" : "s"}
                </span>
                <button
                  onClick={() => castVote(f.id)}
                  disabled={voted || votingId === f.id}
                  className={`flex items-center gap-1.5 text-xs font-semibold rounded-lg px-4 py-2 border transition-colors ${
                    voted ? "border-primary/30 bg-primary/10 text-primary opacity-60" : "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}>
                  {votingId === f.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : voted ? <ThumbsUp className="w-3.5 h-3.5" /> : <ThumbsUp className="w-3.5 h-3.5" />}
                  {voted ? "Voted" : !authed ? <span className="flex items-center gap-1"><LogIn className="w-3.5 h-3.5" /> Vote</span> : "Vote"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}