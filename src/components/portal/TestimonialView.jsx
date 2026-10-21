import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Star, Loader2, MessageSquarePlus, CheckCircle2, Clock, X, Sparkles } from "lucide-react";

const POPUP_KEY = "srfits_review_prompt_seen";

export default function TestimonialView({ member }) {
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const all = await base44.entities.Testimonial.list("-created_date", 50);
        const mineRows = all.filter((t) => t.member_id === member.id);
        setMine(mineRows);
        if (mineRows.length === 0) {
          const seen = sessionStorage.getItem(POPUP_KEY);
          if (!seen) setShowPrompt(true);
        }
      } catch {}
      setLoading(false);
    })();
  }, [member?.id]);

  const hasReviewed = mine.length > 0;

  const dismissPrompt = () => {
    setShowPrompt(false);
    sessionStorage.setItem(POPUP_KEY, "1");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const created = await base44.entities.Testimonial.create({
        member_id: member.id,
        member_name: member.full_name,
        text: text.trim(),
        rating,
        status: "pending",
      });
      setMine([created, ...mine]);
      setText("");
      setRating(5);
      sessionStorage.setItem(POPUP_KEY, "1");
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Could not submit. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-5 lg:max-w-3xl">
      <div>
        <p className="font-display text-[10px] tracking-widest text-primary">SHARE YOUR STORY</p>
        <h2 className="font-space font-bold text-xl mt-0.5">Write a Testimonial</h2>
        <p className="text-xs text-muted-foreground mt-1">Tell others about your experience at SR FITS. One review per member.</p>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
      ) : hasReviewed ? (
        <div className="rounded-2xl border border-primary/20 bg-white/[0.02] p-5 text-center">
          <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-3" />
          <p className="font-space font-semibold text-base mb-1">Thank you for your review!</p>
          <p className="text-xs text-muted-foreground">You've already submitted a testimonial. Members can only submit one review.</p>
          <div className="mt-4 rounded-xl border border-primary/15 bg-white/[0.03] p-4 text-left">
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-0.5">
                {Array.from({ length: mine[0].rating }).map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-primary text-primary" />
                ))}
              </div>
              {mine[0].status === "approved" ? (
                <span className="flex items-center gap-1 text-[10px] text-primary uppercase tracking-wide">
                  <CheckCircle2 className="w-3 h-3" /> Live
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-accent uppercase tracking-wide">
                  <Clock className="w-3 h-3" /> Pending
                </span>
              )}
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">"{mine[0].text}"</p>
            <p className="text-[10px] text-muted-foreground mt-2">{new Date(mine[0].created_date).toLocaleDateString("en-ZA")}</p>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="rounded-2xl border border-primary/20 bg-white/[0.02] p-4 space-y-3">
          <div>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Your rating</span>
            <div className="flex gap-1.5 mt-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)} className="p-0.5" aria-label={`${n} stars`}>
                  <Star className={`w-7 h-7 transition-colors ${n <= rating ? "fill-primary text-primary" : "text-muted-foreground/40"}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Your testimony</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your experience at SR FITS..."
              rows={5}
              maxLength={500}
              className="mt-1.5 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2.5 text-sm outline-none focus:border-primary resize-none"
            />
            <p className="text-[10px] text-muted-foreground mt-1 text-right">{text.length}/500</p>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold uppercase tracking-wide disabled:opacity-60"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><MessageSquarePlus className="w-4 h-4" /> Submit Testimonial</>}
          </button>
        </form>
      )}

      {showPrompt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-5 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-primary/30 bg-card p-6 text-center relative animate-in fade-in zoom-in duration-300">
            <button onClick={dismissPrompt} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/40 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-space font-bold text-lg mb-2">Share your SR FITS story</h3>
            <p className="text-xs text-muted-foreground mb-5">Your experience can inspire others to start their fitness journey. Take 30 seconds to leave a review — it only takes one!</p>
            <button
              onClick={() => setShowPrompt(false)}
              className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold uppercase tracking-wide mb-2"
            >
              Write my review
            </button>
            <button onClick={dismissPrompt} className="w-full text-xs text-muted-foreground hover:text-foreground py-1">
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}