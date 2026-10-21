import React from "react";
import HeroSection from "@/components/home/HeroSection";
import ClassesCarousel from "@/components/home/ClassesCarousel";
import FeaturesSection from "@/components/home/FeaturesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CTASection from "@/components/home/CTASection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ClassesCarousel />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}