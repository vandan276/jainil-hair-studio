import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, MapPin, Phone, Mail } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="bg-[#F6FAF8] text-[#1B362A] border-t border-[#E1ECE7]">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand Column */}
        <div className="md:col-span-1">
          <img src="/assets/Logo/Jainil Studio.svg" alt="Jainil Hair Studio Logo" className="h-14 w-auto object-contain mb-4" />
          <p className="text-[11px] tracking-[0.3em] uppercase text-[#6B877B] mb-5 font-semibold">VADODARA</p>
          <p className="text-sm text-[#4E6B5E] leading-relaxed">
            A premium salon and curated beauty store. Modern technique with the warmth of Indian hospitality.
          </p>
          <div className="flex gap-4 mt-6">
            <a href="https://www.instagram.com/jainil_hair_studio/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white border border-[#D5E4DD] flex items-center justify-center text-[#2A4D3E] hover:text-[#0F5A3B] hover:border-[#0F5A3B] transition-colors shadow-sm">
              <Instagram size={15} />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-white border border-[#D5E4DD] flex items-center justify-center text-[#2A4D3E] hover:text-[#0F5A3B] hover:border-[#0F5A3B] transition-colors shadow-sm">
              <Facebook size={15} />
            </a>
          </div>
        </div>

        {/* Explore */}
        <div>
          <p className="text-[11px] tracking-[0.25em] uppercase text-[#2A4D3E] font-bold mb-5">EXPLORE</p>
          <ul className="space-y-3 text-sm text-[#4E6B5E]">
            <li><Link to="/services" className="hover:text-[#0F5A3B] transition-colors">Our Services</Link></li>
            <li><Link to="/book" className="hover:text-[#0F5A3B] transition-colors">Book Appointment</Link></li>
            <li><Link to="/dashboard" className="hover:text-[#0F5A3B] transition-colors">My Account</Link></li>
          </ul>
        </div>

        {/* Visit */}
        <div>
          <p className="text-[11px] tracking-[0.25em] uppercase text-[#2A4D3E] font-bold mb-5">VISIT</p>
          <ul className="space-y-4 text-sm text-[#4E6B5E]">
            <li className="flex gap-2.5 items-start">
              <MapPin size={15} className="mt-0.5 text-[#0F5A3B] shrink-0" /> 
              <span>FF-06/07, Earth Eon, opp. Urmi School,<br />Sama Savli Road, Near Urmi School Over Bridge,<br />Vadodara, Gujarat 390024</span>
            </li>
            <li className="flex gap-2.5 items-center">
              <Phone size={15} className="text-[#0F5A3B] shrink-0" /> 
              <a href="tel:+917779055771" className="hover:text-[#0F5A3B] font-medium transition-colors">+91 77790 55771</a>
            </li>
            <li className="flex gap-2.5 items-center">
              <Mail size={15} className="text-[#0F5A3B] shrink-0" /> 
              <a href="mailto:jainilhairstudio@gmail.com" className="hover:text-[#0F5A3B] transition-colors">jainilhairstudio@gmail.com</a>
            </li>
          </ul>
        </div>

        {/* Hours */}
        <div>
          <p className="text-[11px] tracking-[0.25em] uppercase text-[#2A4D3E] font-bold mb-5">HOURS</p>
          <ul className="space-y-2 text-sm text-[#4E6B5E]">
            <li>Sunday — Fri : 10:00 am – 9:00 pm</li>
            <li>Saturday : 10:00 am – 7:00 pm</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#E1ECE7] bg-[#EFF6F3]">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12 py-5 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-[#5D7A6E]">
          <span>© 2026 Jainil Hair Studio Vadodara. All rights reserved.</span>
          <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#355B4C]">
            <a href="https://fyndevs.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#0F5A3B] transition-colors">COOKING BY FYNDEVS</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
