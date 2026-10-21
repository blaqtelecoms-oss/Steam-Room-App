import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-accent/10" />
          <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl" />

          {/* Glowing orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/30 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/20 rounded-full blur-[80px]" />

          <div className="relative px-8 py-16 md:px-16 md:py-20 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4 text-accent" />
                Members Only | Join Today
              </div>
              <h2 className="font-display text-2xl md:text-4xl lg:text-5xl tracking-tight mb-6">
                Start Your Journey
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  Today
                </span>
              </h2>
              <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-10">
                Get your first week free. No commitment, no contracts. Just results.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/pricing">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-10 h-14 text-base font-semibold shadow-2xl shadow-primary/30 group"
                  >
                    Claim Free Week
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-xl px-10 h-14 text-base font-semibold border-white/20 bg-white/5 hover:bg-white/10"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}