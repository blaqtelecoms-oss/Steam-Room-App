import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/ui/GlassCard";
import SectionHeading from "@/components/ui/SectionHeading";

const defaultTestimonials = [
{
  name: "Bongani M.",
  role: "",
  text: "SR FITS completely transformed my training. The sessions are intense and the atmosphere is electric. Best gym in Madadeni, hands down.",
  rating: 5,
  initials: "BM"
},
{
  name: "Thandi K.",
  role: "",
  text: "The ladies-only Leg Day is my favourite. The trainers push you to your limits and the community is incredibly supportive. I've never felt stronger.",
  rating: 5,
  initials: "TK"
},
{
  name: "Sipho N.",
  role: "Member for 3 years",
  text: "From the moment I walked in, I knew this was different. The premium equipment and elite atmosphere make every workout feel elite.",
  rating: 5,
  initials: "SN"
},
{
  name: "Lerato D.",
  role: "Member for 6 months",
  text: "Back Day Wednesdays live on TikTok is genius — training with the whole community keeps me accountable. Already seeing amazing results.",
  rating: 5,
  initials: "LD"
},
{
  name: "Mandla Z.",
  role: "Member for 1.5 years",
  text: "Being able to train at 5am before work in a premium facility is a game changer. The hexagonal lighting and neon setup just hits different.",
  rating: 5,
  initials: "MZ"
}];


export default function TestimonialsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [memberTestimonials, setMemberTestimonials] = useState([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    base44.entities.Testimonial.filter({ status: "approved" }, "-created_date", 20)
      .then((rows) => {
        setMemberTestimonials(
          rows.map((t) => ({
            name: t.member_name,
            role: "SR FITS Member",
            text: t.text,
            rating: t.rating || 5,
            initials: (t.member_name || "").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase(),
          }))
        );
      })
      .catch(() => {});
  }, []);

  const testimonials = [...memberTestimonials, ...defaultTestimonials];

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Testimonials"
          title="What Members Say"
          subtitle="Real stories from the SR FITS community who transformed their lives with us." />
        

        <div ref={emblaRef} className="overflow-hidden -mx-2">
          <div className="flex">
            {testimonials.map((t, i) =>
            <div key={i} className="flex-none w-[90%] sm:w-[48%] lg:w-[33%] px-2">
                <GlassCard className="p-6 md:p-8 h-full flex flex-col">
                  <Quote className="w-8 h-8 text-primary/30 mb-4" />
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) =>
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  )}
                  </div>
                  <p className="text-foreground/80 text-sm leading-relaxed flex-1 mb-6">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold">
                      {t.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-muted-foreground text-xs">{t.role}</p>
                    </div>
                  </div>
                </GlassCard>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-10">
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10"
            onClick={() => emblaApi?.scrollPrev()}>
            
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex gap-2">
            {testimonials.map((_, i) =>
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === selectedIndex ? "bg-primary w-6" : "bg-white/20"}`
              } />

            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10"
            onClick={() => emblaApi?.scrollNext()}>
            
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>);

}