import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Flame, Users, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/ui/GlassCard";
import SectionHeading from "@/components/ui/SectionHeading";

const categories = ["All", "Strength", "Cardio", "Ladies Only", "Combat"];

const allClasses = [
  { title: "Signature Leg Day", image: "https://media.base44.com/images/public/6a97c26ed514254a3c28d235/b17e111f5_716483188_122106810411299702_7175398778005251319_n.jpg", duration: "60 min", calories: "650", capacity: "20", level: "Ladies Only", category: "Ladies Only", schedule: "Tue, Thu — 5:30 PM", description: "Signature leg session — heavy squats, presses and lunges under the lights." },
  { title: "Back Day Wednesdays", image: "https://media.base44.com/images/public/6a97c26ed514254a3c28d235/1ea11b04f_720830621_122107515681299702_5487666510300205399_n.jpg", duration: "60 min", calories: "600", capacity: "25", level: "All Levels", category: "Strength", schedule: "Wed — 8:00 PM (Live on TikTok)", description: "Pull-day power every Wednesday at 8pm. Live on TikTok — train with the whole community." },
  { title: "Strength Training", image: "https://media.base44.com/images/public/6a97c26ed514254a3c28d235/93168050d_715466521_122106810207299702_4382867746132126529_n.jpg", duration: "55 min", calories: "450", capacity: "12", level: "Intermediate", category: "Strength", schedule: "Mon, Wed, Fri — 4:00 PM", description: "Compound lifts and progressive overload for serious muscle building on premium plate-loaded rigs." },
  { title: "HIIT Inferno", image: "https://media.base44.com/images/public/6a97c26ed514254a3c28d235/f9c5b211e_713685068_122106810363299702_5254549405020815113_n.jpg", duration: "45 min", calories: "600", capacity: "20", level: "Advanced", category: "Cardio", schedule: "Mon, Wed, Fri — 6:00 AM", description: "Explosive intervals on the turf lane to maximize fat burn and boost your metabolism." },
  { title: "Boxing Fundamentals", image: "https://media.base44.com/images/public/6a97c26ed514254a3c28d235/a5a0330fc_715120582_122106809361299702_6022963897640236782_n.jpg", duration: "50 min", calories: "700", capacity: "15", level: "All Levels", category: "Combat", schedule: "Tue, Thu — 5:30 PM", description: "Striking, footwork and defense — burn serious calories while learning real technique." },
  { title: "Functional Fitness", image: "https://media.base44.com/images/public/6a97c26ed514254a3c28d235/f9c5b211e_713685068_122106810363299702_5254549405020815113_n.jpg", duration: "45 min", calories: "500", capacity: "16", level: "All Levels", category: "Strength", schedule: "Mon-Sat — 7:00 AM", description: "Real-world movements on the turf lane to improve everyday performance and athleticism." },
  { title: "Power Spin", image: "https://media.base44.com/images/public/6a97c26ed514254a3c28d235/a5a0330fc_715120582_122106809361299702_6022963897640236782_n.jpg", duration: "45 min", calories: "550", capacity: "30", level: "All Levels", category: "Cardio", schedule: "Mon-Fri — 12:00 PM", description: "High-energy indoor cycling with immersive beats and neon-lit atmosphere." },
  { title: "Kickboxing", image: "https://media.base44.com/images/public/6a97c26ed514254a3c28d235/1ea11b04f_720830621_122107515681299702_5487666510300205399_n.jpg", duration: "50 min", calories: "650", capacity: "18", level: "All Levels", category: "Combat", schedule: "Wed, Sat — 10:00 AM", description: "Combine martial arts and cardio for a full-body power workout." },
];

export default function Classes() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
    ? allClasses
    : allClasses.filter((c) => c.category === activeCategory);

  return (
    <div className="pt-28 pb-20">
      {/* Header */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Signature Sessions"
            title="Find Your Perfect Workout"
            subtitle="Over 40 sessions per week across strength, cardio, combat and ladies-only programming. There's something for everyone."
          />
        </div>
      </section>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-xl ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "border-white/10 bg-white/5 hover:bg-white/10 text-muted-foreground"
              }`}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((cls, i) => (
              <motion.div
                key={cls.title}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <GlassCard className="group cursor-pointer h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={cls.image}
                      alt={cls.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 text-primary text-[10px] font-semibold">
                        {cls.level}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-foreground text-[10px] font-semibold">
                        {cls.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-space font-bold text-base mb-1">{cls.title}</h3>
                    <p className="text-muted-foreground text-xs mb-3 line-clamp-2 flex-1">{cls.description}</p>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-3">
                      <Calendar className="w-3 h-3 text-primary" />
                      <span>{cls.schedule}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-3 border-t border-white/5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-primary" />
                        {cls.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-accent" />
                        {cls.calories} cal
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {cls.capacity}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}