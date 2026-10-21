import React from "react";
import { cn } from "@/lib/utils";

export default function GlassCard({ children, className, hover = true, ...props }) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-primary/15 bg-white/[0.03] backdrop-blur-xl overflow-hidden",
        hover && "hover:border-primary/40 hover:bg-white/[0.06] transition-all duration-500",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}