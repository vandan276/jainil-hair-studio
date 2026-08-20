import React, { useState } from "react";
import { MessageCircle, Instagram, Video, X } from "lucide-react";
import ConsultationModal from "./ConsultationModal";

const PHONE = "917779055771";
const INSTA_URL = "https://www.instagram.com/jainil_hair_studio/"; 
const CONSULT_MSG = "Hi Jainil Hair Studio! I'd like to book a live video consultancy with an expert.";

export default function FloatingActions() {
  const [waOpen, setWaOpen] = useState(false);
  const [consultOpen, setConsultOpen] = useState(false);
  const [msg, setMsg] = useState("Hi Jainil Hair Studio! I'd like to book an appointment.");

  const sendWa = () => {
    const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    setWaOpen(false);
  };

  const consultExpert = () => {
    setConsultOpen(true);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3 pointer-events-none">
      {/* 1. WHATSAPP BUTTON & POPUP */}
      <div className="relative pointer-events-auto">
        {waOpen && (
          <div className="absolute bottom-16 right-0 w-[300px] bg-white border border-eminence-border shadow-2xl rounded-lg overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between p-4 bg-[#25D366] text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle size={18} />
                </div>
                <div>
                  <div className="font-semibold text-xs">Jainil Hair Studio</div>
                  <div className="text-[10px] opacity-90">Online Now</div>
                </div>
              </div>
              <button onClick={() => setWaOpen(false)} className="text-white/80 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="p-4">
              <textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                rows={2}
                className="w-full border border-eminence-border p-2 text-xs focus:outline-none focus:border-[#25D366] rounded mb-3"
              />
              <button onClick={sendWa} className="w-full bg-[#25D366] hover:bg-[#1faa55] text-white py-2 text-[10px] uppercase tracking-wider font-bold transition-colors rounded">
                Send Message
              </button>
            </div>
          </div>
        )}
        <button
          onClick={() => setWaOpen(!waOpen)}
          className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1faa55] text-white shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
        >
          {waOpen ? <X size={24} /> : <MessageCircle size={28} />}
        </button>
      </div>

      {/* 2. INSTAGRAM BUTTON */}
      <a
        href={INSTA_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto w-14 h-14 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
      >
        <Instagram size={28} />
      </a>

      {/* 3. EXPERT CONSULTATION WIDGET (NOW AT BOTTOM) */}
      <button 
        onClick={consultExpert}
        className="pointer-events-auto group flex items-center gap-3 bg-eminence-gold text-white px-6 py-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20"
      >
        <div className="relative">
          <Video size={20} className="drop-shadow-md" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Consult Expert</span>
      </button>

      <ConsultationModal 
        isOpen={consultOpen} 
        onClose={() => setConsultOpen(false)} 
      />
    </div>
  );
}
