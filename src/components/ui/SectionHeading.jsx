import React from "react";
import { motion } from "framer-motion";

export default function SectionHeading({ badge, title, subtitle, center = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      className={`mb-12 md:mb-16 ${center ? "text-center" : ""}`}
    >
      {badge && (
        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-4">
          {badge}
        </span>
      )}
      <h2 className="font-space font-bold text-3xl md:text-4xl lg:text-5xl tracking-tight mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}