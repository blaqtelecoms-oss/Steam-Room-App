import React from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, FileText, Users, GraduationCap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/ui/GlassCard";
import SectionHeading from "@/components/ui/SectionHeading";

const fees = [
  { label: "Joining Fee", value: "R280" },
  { label: "Admin Fee", value: "R150" },
];

const packages = [
  {
    name: "24 Month Contract",
    price: 305,
    length: "24 months",
    icon: Sparkles,
    tag: "Best Value",
    popular: true,
    perks: ["Lowest monthly rate", "Full facility access", "All group classes"],
  },
  {
    name: "12 Month Contract",
    price: 350,
    length: "12 months",
    icon: Check,
    perks: ["Great middle-ground", "Full facility access", "All group classes"],
  },
  {
    name: "6 Month Contract",
    price: 440,
    length: "6 months",
    icon: Check,
    perks: ["Shorter commitment", "Full facility access", "All group classes"],
  },
  {
    name: "Month-to-Month",
    price: 530,
    length: "No fixed term",
    icon: Check,
    tag: "Most Flexible",
    perks: ["Cancel anytime", "Full facility access", "All group classes"],
  },
  {
    name: "2 People · 24 Month Contract",
    price: 530,
    length: "24 months",
    icon: Users,
    tag: "Couples",
    perks: ["Train together", "Full facility access", "All group classes"],
  },
  {
    name: "Students & Seniors (65+)",
    price: 280,
    length: "6 month contract",
    icon: GraduationCap,
    tag: "Concession",
    perks: ["Valid ID required", "Full facility access", "All group classes"],
  },
];

const WA_LINK = "https://wa.me/27727359745";

export default function Pricing() {
  return (
    <div className="pt-28 pb-20">
      {/* Header */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-primary/15 rounded-full blur-[150px] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Membership"
            title="Membership Packages & Pricing"
            subtitle="Simple, transparent contract options. Pick the term that fits you — no hidden fees."
          />

          {/* Fees box */}
          <GlassCard className="mt-8 max-w-2xl mx-auto p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-display text-[11px] tracking-widest text-primary">FEES & IMPORTANT INFORMATION</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {fees.map((fee) => (
                <div key={fee.label} className="rounded-xl border border-primary/15 bg-white/[0.02] px-4 py-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">{fee.label}</span>
                  <span className="font-space font-bold text-lg text-primary">{fee.value}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-3 text-center">
              One-time fees payable at sign-up. Monthly dues billed per your chosen contract.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* Packages */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {packages.map((pkg, i) => {
            const Icon = pkg.icon;
            return (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <GlassCard
                  className={`p-6 h-full flex flex-col relative ${
                    pkg.popular ? "border-primary/40 bg-primary/5 shadow-xl shadow-primary/10" : ""
                  }`}
                >
                  {pkg.tag && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-lg ${
                        pkg.popular ? "bg-primary text-primary-foreground shadow-primary/30" : "bg-white/10 border border-primary/30 text-primary"
                      }`}>
                        {pkg.popular && <Sparkles className="w-3 h-3" />}
                        {pkg.tag}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-4 mt-1">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-space font-bold text-sm leading-tight">{pkg.name}</h3>
                      <p className="text-[11px] text-muted-foreground">{pkg.length}</p>
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="flex items-baseline gap-1">
                      <span className="font-space font-bold text-4xl text-primary">R{pkg.price}</span>
                      <span className="text-muted-foreground text-sm">/month</span>
                    </div>
                  </div>

                  <div className="space-y-2.5 mb-6 flex-1">
                    {pkg.perks.map((perk) => (
                      <div key={perk} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-primary" />
                        </div>
                        <span className="text-xs text-foreground/80">{perk}</span>
                      </div>
                    ))}
                  </div>

                  <a href={WA_LINK} target="_blank" rel="noreferrer" className="block">
                    <Button
                      className={`w-full rounded-xl h-11 font-semibold text-sm group ${
                        pkg.popular
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                          : "bg-white/5 border border-white/10 hover:bg-white/10 text-foreground"
                      }`}
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </a>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="text-center mb-10">
          <h3 className="font-space font-bold text-2xl mb-2">Questions?</h3>
          <p className="text-muted-foreground text-sm">Here are some common ones.</p>
        </div>
        <div className="space-y-4">
          {[
            { q: "Can I cancel anytime?", a: "Month-to-month members can cancel anytime. Fixed-term contracts run for the signed duration." },
            { q: "Is there a free trial?", a: "Yes! All new members get a free 7-day trial to experience everything Steam Room Fitness Center has to offer." },
            { q: "What are the one-time fees?", a: "A R280 joining fee and R150 admin fee are payable at sign-up, regardless of contract length." },
            { q: "Do you offer corporate plans?", a: "Yes, we offer special rates for companies with 10+ employees. Contact us for a custom quote." },
          ].map((faq, i) => (
            <GlassCard key={i} className="p-5">
              <h4 className="font-semibold text-sm mb-1">{faq.q}</h4>
              <p className="text-muted-foreground text-sm">{faq.a}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}