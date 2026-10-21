import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2 } from "lucide-react";

export default function TrainerPhoto({ trainer }) {
  const [open, setOpen] = useState(false);
  const fit = trainer.image_fit || "cover";
  const pos = trainer.image_position || "top";
  const fitClass = fit === "contain" ? "object-contain" : "object-cover";
  const posClass = pos === "center" ? "object-center" : pos === "bottom" ? "object-bottom" : "object-top";

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setOpen(false), 2800);
    return () => clearTimeout(t);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View ${trainer.name} photo`}
        className="relative w-full sm:w-56 h-64 sm:h-auto shrink-0 overflow-hidden bg-black/30 p-0 m-0 border-0 cursor-pointer"
      >
        <img
          src={trainer.image}
          alt={trainer.name}
          className={`w-full h-full ${fitClass} ${posClass} group-hover:scale-105 transition-transform duration-700`}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/50 hidden sm:block pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent sm:hidden pointer-events-none" />
        <span className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black/50 border border-white/20 flex items-center justify-center backdrop-blur-sm">
          <Maximize2 className="w-3.5 h-3.5 text-white" />
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.img
              src={trainer.image}
              alt={trainer.name}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}