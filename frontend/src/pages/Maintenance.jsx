import React from "react";
import { Hammer, MessageSquare, MapPin, Clock } from "lucide-react";

export default function Maintenance() {
  const handleWhatsAppClick = () => {
    const phone = "917779055771";
    const msg = "Hi Jainil Hair Studio! I'd like to make an inquiry / appointment.";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col justify-between items-center px-4 py-10 relative overflow-hidden font-sans select-none">
      
      {/* Premium Cinematic Background Effects */}
      <div className="absolute top-[-30%] left-[-30%] w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-emerald-600/10 to-transparent blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: "8s" }} />
      <div className="absolute bottom-[-30%] right-[-30%] w-[800px] h-[800px] rounded-full bg-gradient-to-bl from-emerald-600/10 to-transparent blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: "6s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.01)_0%,transparent_70%)] pointer-events-none" />

      {/* Header / Brand Logo */}
      <header className="w-full max-w-6xl flex justify-center items-center z-10 animate-fade-in py-4">
        <img 
          src="/assets/logo_white.svg" 
          alt="Jainil Hair Studio Logo" 
          className="h-16 md:h-20 w-auto object-contain hover:scale-105 transition-transform duration-500" 
        />
      </header>

      {/* Main Glassmorphic Card Container */}
      <main className="max-w-xl w-full text-center z-10 animate-slide-up px-4 my-auto">
        <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-12 shadow-[0_10px_50px_rgba(0,0,0,0.8),0_0_80px_rgba(16,185,129,0.03)] hover:border-emerald-600/20 transition-all duration-700 group">
          
          {/* Animated Icon Container */}
          <div className="relative mx-auto w-24 h-24 rounded-full border border-emerald-600/20 bg-gradient-to-b from-[#181818] to-[#121212] flex items-center justify-center mb-8 shadow-inner group-hover:border-emerald-600/50 transition-colors duration-500">
            <div className="absolute inset-[-4px] rounded-full bg-gradient-to-r from-emerald-600/20 to-transparent blur animate-spin opacity-60" style={{ animationDuration: "15s" }} />
            <div className="absolute inset-0 rounded-full border border-emerald-600/10 animate-ping opacity-20 duration-3000" />
            <Hammer className="text-emerald-500 w-10 h-10 animate-bounce" style={{ animationDuration: "2s" }} />
          </div>

          {/* Clarity Maintenance Badges */}
          <span className="inline-block text-[10px] font-bold text-emerald-400 uppercase tracking-[0.25em] bg-emerald-950/40 border border-emerald-600/20 px-4 py-1.5 rounded-full mb-6 select-none animate-pulse">
            System Upgrades In Progress
          </span>

          {/* Heading and Clarifying Subtitles */}
          <div className="space-y-4 mb-8">
            <h2 className="text-3xl md:text-4xl font-serif font-light tracking-wide text-white leading-tight">
              Polishing Our <span className="text-emerald-400">Atelier</span>
            </h2>
            <div className="w-12 h-[1px] bg-emerald-500/40 mx-auto rounded" />
            <p className="text-sm text-gray-400 leading-relaxed font-light max-w-md mx-auto">
              We are currently upgrading our booking system and digital services to enhance your experience. Our physical salon remains fully operational.
            </p>
          </div>

          {/* Quick Contact & Details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-xs border-y border-white/5 py-6 mb-8 text-gray-400 font-light">
            <div className="flex items-center gap-3 bg-[#161616]/40 p-3.5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
              <Clock className="text-emerald-500 shrink-0" size={16} />
              <div>
                <p className="font-bold text-white text-[10px] uppercase tracking-wider">Salon Hours</p>
                <p className="text-[11px] mt-0.5">Sun–Fri: 10AM–9PM · Sat: 10AM–7PM</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#161616]/40 p-3.5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
              <MapPin className="text-emerald-500 shrink-0" size={16} />
              <div>
                <p className="font-bold text-white text-[10px] uppercase tracking-wider">Location</p>
                <p className="text-[11px] mt-0.5">Sama Savli & Sevasi (Vadodara)</p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-5">
            <button
              onClick={handleWhatsAppClick}
              className="w-full bg-eminence-gold hover:bg-[#c5a030] text-black py-4.5 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs flex justify-center items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_8px_30px_rgba(212,175,55,0.2)] cursor-pointer"
            >
              <MessageSquare size={16} fill="currentColor" />
              Book via WhatsApp
            </button>
            
            <p className="text-[10px] text-eminence-muted/70 tracking-[0.2em] uppercase font-medium">
              We will be back online shortly
            </p>
          </div>

        </div>
      </main>

      {/* Footer & Staff Access */}
      <footer className="w-full max-w-6xl text-center z-10 animate-fade-in flex flex-col items-center gap-2.5 py-4">
        <span className="text-[9px] tracking-[0.25em] uppercase text-gray-600 font-semibold">
          Developed by{" "}
          <a
            href="https://fyndevs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-eminence-gold transition-colors duration-300"
          >
            FynDevs
          </a>
        </span>
        <a
          href="/login"
          className="text-[9px] tracking-[0.3em] uppercase text-eminence-muted/20 hover:text-eminence-gold transition-colors duration-300 font-medium py-1 px-3 border border-white/0 hover:border-eminence-gold/10 hover:bg-eminence-gold/5 rounded-full"
        >
          Staff Atelier Access
        </a>
      </footer>

    </div>
  );
}
