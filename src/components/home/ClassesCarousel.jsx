import React, { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, Flame, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/ui/GlassCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { Link } from "react-router-dom";

const classes = [
  {
    title: "Signature Leg Day",
    image: "https://media.base44.com/images/public/6a97c26ed514254a3c28d235/b17e111f5_716483188_122106810411299702_7175398778005251319_n.jpg",
    duration: "60 min",
    calories: "650",
    capacity: "20",
    level: "Ladies Only",
    description: "Signature leg session — heavy squats, presses and lunges under the lights.",
  },
  {
    title: "Back Day Wednesdays",
    image: "https://media.base44.com/images/public/6a97c26ed514254a3c28d235/1ea11b04f_720830621_122107515681299702_5487666510300205399_n.jpg",
    duration: "60 min",
    calories: "600",
    capacity: "25",
    level: "All Levels",
    description: "Pull-day power every Wednesday at 8pm. Live on TikTok — train with the whole community.",
  },
  {
    title: "Strength Training",
    image: "https://media.base44.com/images/public/6a97c26ed514254a3c28d235/93168050d_715466521_122106810207299702_4382867746132126529_n.jpg",
    duration: "55 min",
    calories: "450",
    capacity: "12",
    level: "Intermediate",
    description: "Compound lifts and progressive overload for serious muscle building on premium plate-loaded rigs.",
  },
  {
    title: "HIIT Inferno",
    image: "https://media.base44.com/images/public/6a97c26ed514254a3c28d235/f9c5b211e_713685068_122106810363299702_5254549405020815113_n.jpg",
    duration: "45 min",
    calories: "600",
    capacity: "20",
    level: "Advanced",
    description: "Explosive intervals on the turf lane to maximize fat burn and boost your metabolism.",
  },
  {
    title: "Boxing Fundamentals",
    image: "https://media.base44.com/images/public/6a97c26ed514254a3c28d235/a5a0330fc_715120582_122106809361299702_6022963897640236782_n.jpg",
    duration: "50 min",
    calories: "700",
    capacity: "15",
    level: "All Levels",
    description: "Striking, footwork and defense — burn serious calories while learning real technique.",
  },
];

export default function ClassesCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[200px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <SectionHeading
            badge="Signature Sessions"
            title="Train Your Way"
            subtitle="From signature lifts to high-intensity intervals — find the session that fits your grind."
            center={false}
          />
          <div className="hidden md:flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30"
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canScrollPrev}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30"
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canScrollNext}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div ref={emblaRef} className="overflow-hidden -mx-2">
          <div className="flex">
            {classes.map((cls, i) => (
              <div key={i} className="flex-none w-[85%] sm:w-[45%] lg:w-[32%] px-2">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <GlassCard className="group cursor-pointer">
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={cls.image}
                        alt={cls.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                      <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 text-primary text-xs font-semibold">
                        {cls.level}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-space font-bold text-lg mb-2">{cls.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{cls.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          {cls.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-accent" />
                          {cls.calories} cal
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {cls.capacity} spots
                        </span>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link to="/classes">
            <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 px-8">
              View All Classes
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}