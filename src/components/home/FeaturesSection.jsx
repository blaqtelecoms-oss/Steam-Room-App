import React from "react";
import { motion } from "framer-motion";
import { Dumbbell, Zap, Clock, Shield, Cpu, Heart } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import SectionHeading from "@/components/ui/SectionHeading";

const features = [
  { icon: Dumbbell, title: "Premium Equipment", description: "Heavy-duty plate-loaded rigs and racks, constantly maintained and kept to a premium standard." },
  { icon: Cpu, title: "Premium Aesthetic", description: "Modern industrial facility with premium finishes and a focused training atmosphere." },
  { icon: Zap, title: "Signature Sessions", description: "Signature Leg Day, Back Day Wednesdays and ladies-only programming built for results." },
  { icon: Shield, title: "Members Only", description: "A focused, supportive community. Secure lockers and a dedicated space to train hard." },
  { icon: Clock, title: "Flexible Hours", description: "Open 5am–9pm weekdays and 7am–2pm weekends & holidays — train on your schedule." },
  { icon: Heart, title: "Expert Coaching", description: "Certified trainers who push your limits while keeping every session safe and fun." },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 md:py-28 relative">
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Why SR FITS"
          title="More Than a Gym"
          subtitle="We've built the ultimate training ground where every detail is designed for your transformation."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <GlassCard className="p-6 md:p-8 h-full group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <feat.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-space font-semibold text-lg mb-2">{feat.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feat.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}