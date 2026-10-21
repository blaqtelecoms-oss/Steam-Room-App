import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Flame, Users, Trophy, X } from "lucide-react";
import { Link } from "react-router-dom";
import AdvertBanner from "@/components/home/AdvertBanner";

const TOUR_VIDEO = "https://media.base44.com/videos/public/6a97c26ed514254a3c28d235/f4bc459c9_Gym.mp4";

const stats = [
{ icon: Flame, value: "500+", label: "Active Members" },
{ icon: Users, value: "3+", label: "Expert Trainers" },
{ icon: Trophy, value: "20+", label: "Classes Weekly" }];


const HERO_IMG = "https://media.base44.com/images/public/6a97c26ed514254a3c28d235/93168050d_715466521_122106810207299702_4382867746132126529_n.jpg";
const HERO_VIDEO = "https://media.base44.com/videos/public/6a97c26ed514254a3c28d235/65cc25db1_Gym.mp4";

export default function HeroSection() {
  const [showTour, setShowTour] = useState(false);
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0">
        <video
          src={HERO_VIDEO}
          poster={HERO_IMG}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover" />
        
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}>
            
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-6">
              <Flame className="w-4 h-4" />
              Madadeni's #1 Fitness Center
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl tracking-tight leading-[1.1] mb-6">
            
            STEAM ROOM
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
              FITNESS CENTER
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-muted-foreground text-lg md:text-xl max-w-xl leading-relaxed mb-10">
            
            Push limits. Break barriers. Train in our premium facility with top-tier equipment and world-class coaching.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap gap-4 mb-16">
            
            <Link to="/challenge">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8 h-14 text-base font-semibold shadow-2xl shadow-primary/30 group">
                
                <Trophy className="w-5 h-5 mr-2" />
                Register for the Challenge
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setShowTour(true)}
              className="rounded-xl px-8 h-14 text-base font-semibold border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10">
              
              <Play className="w-5 h-5 mr-2" />
              Watch Tour
            </Button>
          </motion.div>

          <AdvertBanner />

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap gap-6 md:gap-10">
            
            {stats.map((stat, i) =>
            <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-space font-bold text-2xl">{stat.value}</p>
                  <p className="text-muted-foreground text-xs">{stat.label}</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Tour video modal */}
      {showTour &&
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/95 backdrop-blur-md animate-in fade-in duration-200">
          <button
          onClick={() => setShowTour(false)}
          aria-label="Close tour"
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background border border-primary/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors z-10">
          
            <X className="w-5 h-5" />
          </button>
          <video
          src={TOUR_VIDEO}
          className="max-h-[85vh] max-w-full rounded-xl shadow-2xl shadow-primary/20"
          controls
          autoPlay
          playsInline
          preload="auto" />
        
        </div>
      }
    </section>);

}