import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Image, Scale, Trophy, Users, User, Star } from "lucide-react";
import ChallengeForm from "@/components/challenge/ChallengeForm";
import ChallengeVoting from "@/components/challenge/ChallengeVoting";

const entryInfo = [
{ icon: Users, text: "Members-only competition" },
{ icon: Trophy, text: "R100 joining fee" },
{ icon: Calendar, text: "Applications start: 31st August 2026" },
{ icon: Calendar, text: "Applications end: 6th September 2026" }];

const winInfo = [
{ icon: Image, text: "3 before photos (front, side, back) required" },
{ icon: Image, text: "3 after photos due at final weigh-in (Oct 6th)" },
{ icon: Scale, text: "Not about weight lost!" },
{ icon: Star, text: "Judged by AI analysis + public vote" }];

const prizes = [
{ label: "Women's Winner", amount: "R1000", icon: User },
{ label: "Men's Winner", amount: "R1000", icon: User },
{ label: "Elite Athlete Winner", amount: "R1000", icon: Star }];

export default function Challenge() {
  const [tab, setTab] = useState("enter");
  return (
    <div className="pt-16 pb-8 px-4 min-h-screen lg:pt-28 lg:pb-16 lg:px-8 lg:max-w-6xl lg:mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-6">
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 lg:w-20 lg:h-20 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center overflow-hidden">
            <img src="/media/137ce0856_WhatsApp_Image_2026-09-12_at_41151_PM.jpeg" alt="SR FITS" className="w-full h-full object-cover" />
          </div>
        </div>
        <p className="text-[10px] lg:text-xs tracking-[0.25em] text-muted-foreground uppercase mb-2">Steam Room Fitness Center Presents</p>
        <h1 className="font-display text-base lg:text-3xl leading-relaxed tracking-wider text-foreground">
          SUMMER BODY <span className="text-primary">TRANSFORMATION</span> CHALLENGE
        </h1>
        <p className="mt-2 text-sm lg:text-base font-semibold text-foreground">ARE YOU READY FOR THE CHANGE?</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-3 mb-6 lg:grid-cols-2 lg:gap-6 lg:mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-primary/25 bg-card overflow-hidden">
          <div className="bg-primary text-primary-foreground px-4 py-2 text-xs font-bold uppercase tracking-widest">Entry &amp; Dates</div>
          <div className="p-4 space-y-3">
            {entryInfo.map((i) =>
            <div key={i.text} className="flex items-center gap-3">
                <i.icon className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm text-foreground">{i.text}</span>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl border border-primary/25 bg-card overflow-hidden">
          <div className="bg-primary text-primary-foreground px-4 py-2 text-xs font-bold uppercase tracking-widest">How To Win</div>
          <div className="p-4 space-y-3">
            {winInfo.map((i) =>
            <div key={i.text} className="flex items-center gap-3">
                <i.icon className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm text-foreground">{i.text}</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-primary/30 bg-card overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-yellow-600/30 via-yellow-500/20 to-yellow-600/30 border-b border-yellow-500/30 px-4 py-2.5 text-center">
          <h2 className="font-display text-sm tracking-widest text-yellow-400">THE PRIZE</h2>
        </div>
        <div className="p-4 space-y-2.5 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-4 lg:p-6">
          {prizes.map((p) =>
          <div key={p.label} className="flex items-center justify-between rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3">
              <div className="flex items-center gap-3">
                <p.icon className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-semibold text-foreground">{p.label}</span>
              </div>
              <span className="font-display text-sm text-yellow-400">{p.amount}</span>
            </div>
          )}
          <p className="text-center text-xs text-muted-foreground pt-1 lg:col-span-3">Winner announced: 6th October 2026</p>
        </div>
      </motion.div>

      <div className="flex gap-2 mb-4 lg:max-w-3xl lg:mx-auto">
        <button onClick={() => setTab("enter")} className={`flex-1 rounded-xl py-2.5 text-xs font-semibold uppercase tracking-wide border ${tab === "enter" ? "bg-primary text-primary-foreground border-primary" : "border-primary/20 text-muted-foreground"}`}>Enter Now</button>
        <button onClick={() => setTab("vote")} className={`flex-1 rounded-xl py-2.5 text-xs font-semibold uppercase tracking-wide border ${tab === "vote" ? "bg-primary text-primary-foreground border-primary" : "border-primary/20 text-muted-foreground"}`}>Vote</button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-2xl border border-primary/25 bg-card p-5 lg:max-w-3xl lg:mx-auto lg:p-8">
        {tab === "enter" ?
        <>
            <h2 className="font-display text-sm tracking-widest text-primary mb-1">ENTER NOW</h2>
            <p className="text-xs text-muted-foreground mb-5">Select your division and upload 3 before photos (front, side, back) to submit.</p>
            <ChallengeForm />
          </> :

        <>
            <h2 className="font-display text-sm tracking-widest text-primary mb-1">FINALISTS &amp; VOTING</h2>
            <p className="text-xs text-muted-foreground mb-5">View approved transformations and vote for your favourite.</p>
            <ChallengeVoting />
          </>
        }
      </motion.div>

      <p className="text-center text-[10px] text-muted-foreground mt-6 leading-relaxed">
        Terms &amp; Conditions Apply. See rules.<br />
        Steam Room Fitness Center is a brand under SR Fits.
      </p>
    </div>);

}