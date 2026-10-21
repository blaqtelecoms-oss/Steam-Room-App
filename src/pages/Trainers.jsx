import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Instagram, Award, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/ui/GlassCard";
import SectionHeading from "@/components/ui/SectionHeading";
import TrainerPhoto from "@/components/trainers/TrainerPhoto";

const FALLBACK = [
  {
    name: "Brian Buthelezi",
    specialty: "Strength & Conditioning",
    image: "https://media.base44.com/images/public/6a97c26ed514254a3c28d235/1ea11b04f_720830621_122107515681299702_5487666510300205399_n.jpg",
    bio: "Founder and head coach of Steam Room Fitness Center. Brian built the SR FITS brand and leads our signature strength programming.",
    certifications: ["Strength Coach", "Founder"],
    experience: "12 years",
    rating: 5.0,
  },
  {
    name: "Thandi Mthembu",
    specialty: "Ladies Only & Leg Day",
    image: "https://media.base44.com/images/public/6a97c26ed514254a3c28d235/b17e111f5_716483188_122106810411299702_7175398778005251319_n.jpg",
    bio: "Leads the Signature Leg Day for ladies. Thandi blends intensity with technique to help every woman find her strongest self.",
    certifications: ["Personal Trainer", "Women's Strength Specialist"],
    experience: "8 years",
    rating: 4.9,
  },
  {
    name: "Sipho Ndlovu",
    specialty: "Boxing & HIIT",
    image: "https://media.base44.com/images/public/6a97c26ed514254a3c28d235/a5a0330fc_715120582_122106809361299702_6022963897640236782_n.jpg",
    bio: "Brings the fire to HIIT Inferno and Boxing Fundamentals. Sipho's high-energy sessions keep members coming back for more.",
    certifications: ["Boxing Coach", "HIIT Specialist"],
    experience: "10 years",
    rating: 4.9,
  },
  {
    name: "Lerato Dlamini",
    specialty: "Back Day & Functional",
    image: "https://media.base44.com/images/public/6a97c26ed514254a3c28d235/93168050d_715466521_122106810207299702_4382867746132126529_n.jpg",
    bio: "Hosts Back Day Wednesdays live on TikTok. Lerato specializes in functional power and athletic performance.",
    certifications: ["Functional Trainer", "Content Coach"],
    experience: "7 years",
    rating: 4.8,
  },
];

export default function Trainers() {
  const [trainers, setTrainers] = useState([]);

  useEffect(() => {
    base44.entities.Trainer.filter({ active: true }, "order", 100)
      .then((res) => setTrainers(res || []))
      .catch(() => {});
  }, []);

  const list = trainers.length ? trainers : FALLBACK;

  return (
    <div className="pt-28 pb-20">
      {/* Header */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-accent/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Our Team"
            title="World-Class Trainers"
            subtitle="Our certified coaches bring passion, expertise and elite energy to help you reach your full potential."
          />
        </div>
      </section>

      {/* Trainers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {list.map((trainer, i) => (
            <motion.div
              key={trainer.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard className="group overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <TrainerPhoto trainer={trainer} />
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-space font-bold text-xl">{trainer.name}</h3>
                        <p className="text-primary text-sm font-medium">{trainer.specialty}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 rounded-lg px-2.5 py-1">
                        <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                        <span className="text-primary text-xs font-bold">{trainer.rating}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">{trainer.bio}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(trainer.certifications || []).map((cert) => (
                        <span
                          key={cert}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-medium text-muted-foreground"
                        >
                          <Award className="w-3 h-3 text-accent" />
                          {cert}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <span className="text-muted-foreground text-xs">{trainer.experience} experience</span>
                      <a href="https://instagram.com/sr_fits_" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/30 transition-all">
                        <Instagram className="w-4 h-4 text-muted-foreground" />
                      </a>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}