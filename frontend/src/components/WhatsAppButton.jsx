import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";

const PHONE = "912652468800"; // E.164 without +
const DEFAULT_MSG = "Hi Eminence Salon! I'd like to book an appointment.";

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState(DEFAULT_MSG);

  const send = () => {
    const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    setOpen(false);
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-8 z-[60] w-[320px] bg-white border border-eminence-border shadow-2xl rounded-lg overflow-hidden" data-testid="whatsapp-popup">
          <div className="flex items-center justify-between p-4 bg-[#25D366] text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.014 12.032c0 2.12.549 4.19 1.595 6.027L0 24l6.135-1.61a11.81 11.81 0 005.911 1.586h.005c6.637 0 12.032-5.396 12.036-12.032.002-3.215-1.248-6.237-3.519-8.51z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-sm">Eminence Salon</div>
                <div className="text-xs opacity-90">Typically replies in minutes</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/90 hover:text-white" data-testid="whatsapp-close">
              <X size={18} />
            </button>
          </div>
          <div className="p-4">
            <p className="text-xs text-eminence-muted mb-2 uppercase tracking-[0.18em]">Your message</p>
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              rows={3}
              data-testid="whatsapp-message"
              className="w-full border border-eminence-border p-3 text-sm focus:outline-none focus:border-[#25D366] rounded"
            />
            <button onClick={send} data-testid="whatsapp-send" className="w-full mt-3 bg-[#25D366] hover:bg-[#1faa55] text-white py-3 text-xs uppercase tracking-[0.18em] font-semibold transition-colors rounded shadow-lg">
              Send via WhatsApp
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Chat on WhatsApp"
        data-testid="whatsapp-fab"
        className="fixed bottom-8 right-8 z-[60] w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1faa55] text-white shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
      >
        {open ? (
          <X size={24} />
        ) : (
          <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor" className="drop-shadow-md">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.014 12.032c0 2.12.549 4.19 1.595 6.027L0 24l6.135-1.61a11.81 11.81 0 005.911 1.586h.005c6.637 0 12.032-5.396 12.036-12.032.002-3.215-1.248-6.237-3.519-8.51z" />
          </svg>
        )}
      </button>
    </>
  );
}
