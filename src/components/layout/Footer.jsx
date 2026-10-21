import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Music2, MapPin, Phone, Mail } from "lucide-react";

const SR_LOGO = "/media/cbd45cfc4_708958679_122105616411299702_3106745369025167558_n.jpg";

export default function Footer() {
  return (
    <footer className="relative bg-background border-t border-white/5">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center overflow-hidden">
                <img src="/media/137ce0856_WhatsApp_Image_2026-09-12_at_41151_PM.jpeg" alt="SR FITS" className="w-full h-full object-cover" />
              </div>
              <span className="font-display text-sm tracking-widest leading-tight">
                STEAM ROOM
                <span className="block text-primary text-[10px] tracking-[0.3em]">FITNESS CENTER</span>
              </span>
            </Link>
            

            
            <div className="flex gap-3">
              <a
                href="https://instagram.com/sr_fits_"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/30 transition-all">
                
                <Instagram className="w-4 h-4 text-muted-foreground" />
              </a>
              <a
                href="https://tiktok.com/@sr_fits_"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/30 transition-all">
                
                <Music2 className="w-4 h-4 text-muted-foreground" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-space font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h4>
            <div className="space-y-2.5">
              {["Home", "Classes", "Trainers", "Pricing", "Contact"].map((link) =>
              <Link
                key={link}
                to={link === "Home" ? "/" : `/${link.toLowerCase()}`}
                className="block text-muted-foreground text-sm hover:text-primary transition-colors">
                
                  {link}
                </Link>
              )}
              <Link to="/trainer-bookings" className="block text-muted-foreground text-sm hover:text-primary transition-colors">Trainer Portal</Link>
            </div>
          </div>

          {/* Classes */}
          <div>
            <h4 className="font-space font-semibold text-sm uppercase tracking-wider mb-4">Signature Sessions</h4>
            <div className="space-y-2.5">
              {["Signature Leg Day", "Back Day Wednesdays", "Strength Training", "HIIT Inferno", "Boxing"].map((c) =>
              <span key={c} className="block text-muted-foreground text-sm">{c}</span>
              )}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-space font-semibold text-sm uppercase tracking-wider mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground text-sm">Mf23 St, Madadeni, Newcastle, 2951, South Africa</span>
              </div>
              <a href="tel:0727359745" className="flex items-center gap-3 text-muted-foreground text-sm hover:text-primary transition-colors">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                072 735 9745
              </a>
              <a href="mailto:brian.buthelezi@srfitnesscenter.com" className="flex items-center gap-3 text-muted-foreground text-sm hover:text-primary transition-colors break-all">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                brian.buthelezi@srfitnesscenter.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-xs">
            © 2026 Steam Room Fitness Center. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-muted-foreground text-xs hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="text-muted-foreground text-xs hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
        <div className="mt-6 text-center">
          <a
            href="https://www.purpleblaq.co.za/"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-[11px] font-medium text-primary/80 hover:text-primary hover:border-primary hover:bg-primary/10 transition-all"
          >
            Design by Purple Blaq Media
            <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H8M17 7v9"/></svg>
          </a>
        </div>
      </div>
    </footer>);

}