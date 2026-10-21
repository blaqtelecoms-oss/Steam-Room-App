import React, { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GlassCard from "@/components/ui/GlassCard";
import SectionHeading from "@/components/ui/SectionHeading";

const contactInfo = [
  { icon: MapPin, label: "Visit Us", value: "Mf23 St, Madadeni, Newcastle, 2951, South Africa" },
  { icon: Phone, label: "Call Us", value: "072 735 9745" },
  { icon: Mail, label: "Email Us", value: "brian.buthelezi@srfitnesscenter.com" },
  { icon: Clock, label: "Hours", value: "Mon–Fri: 5:00 AM – 9:00 PM · Sat–Sun & Holidays: 7:00 AM – 2:00 PM" },
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  return (
    <div className="pt-28 pb-20">
      {/* Header */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 w-96 h-96 bg-accent/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Get in Touch"
            title="We'd Love to Hear From You"
            subtitle="Have questions about membership, signature sessions, or anything else? Reach out and we'll get back to you within 24 hours."
          />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            {contactInfo.map((info, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className="p-5 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <info.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-0.5">{info.label}</p>
                    <p className="text-muted-foreground text-sm">{info.value}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <GlassCard className="h-56 overflow-hidden p-0">
                <iframe
                  title="Steam Room Fitness Center location"
                  src="https://www.google.com/maps?q=Madadeni,Newcastle,2951,South+Africa&output=embed"
                  className="w-full h-full border-0 grayscale invert opacity-80"
                  loading="lazy"
                />
              </GlassCard>
            </motion.div>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <GlassCard className="p-6 md:p-8">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="font-space font-bold text-xl mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground text-sm">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="font-space font-bold text-xl mb-1">Send a Message</h3>
                  <p className="text-muted-foreground text-sm mb-6">Fill out the form below and our team will respond shortly.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                      <Input
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        className="rounded-xl bg-white/5 border-white/10 focus:border-primary/50 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Email</label>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                        className="rounded-xl bg-white/5 border-white/10 focus:border-primary/50 h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Subject</label>
                    <Select
                      value={form.subject}
                      onValueChange={(val) => setForm({ ...form, subject: val })}
                    >
                      <SelectTrigger className="rounded-xl bg-white/5 border-white/10 h-11">
                        <SelectValue placeholder="Choose a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="membership">Membership Inquiry</SelectItem>
                        <SelectItem value="classes">Signature Sessions</SelectItem>
                        <SelectItem value="training">Personal Training</SelectItem>
                        <SelectItem value="corporate">Corporate Plans</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Message</label>
                    <Textarea
                      placeholder="Tell us how we can help..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      required
                      rows={5}
                      className="rounded-xl bg-white/5 border-white/10 focus:border-primary/50 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-12 font-semibold shadow-lg shadow-primary/25 group"
                  >
                    Send Message
                    <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </form>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}