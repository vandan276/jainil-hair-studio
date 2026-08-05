import React, { useState } from "react";
import { X, Calendar, User, Phone, CheckCircle2 } from "lucide-react";
import api from "../lib/api";

export default function ConsultationModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: "",
    time: "11:00 AM",
    concern: "General Hair Health",
  });

  if (!isOpen) return null;

  const TIME_SLOTS = ["10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"];
  const CONCERNS = ["General Hair Health", "Hair Extensions", "Bridal Styling", "Hair Restoration", "Product Recommendation"];

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      // 1. Save to backend for Admin Panel
      await api.post("/consultations", {
        name: form.name,
        phone: form.phone,
        date: form.date,
        time: form.time,
        concerns: form.concern
      });

      // 2. Open WhatsApp for direct contact
      const msg = `Hi Eminence! I'd like to book an expert consultancy.\n\nName: ${form.name}\nPhone: ${form.phone}\nDate: ${form.date}\nTime: ${form.time}\nConcern: ${form.concern}`;
      const url = `https://wa.me/912652468800?text=${encodeURIComponent(msg)}`;
      window.open(url, "_blank");
      
      setStep(2);
    } catch (error) {
      console.error("Booking error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in pointer-events-auto">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-eminence-muted hover:text-eminence-text transition-colors">
          <X size={20} />
        </button>

        {step === 1 ? (
          <form onSubmit={handleBook} className="p-8">
            <div className="mb-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-eminence-gold font-bold mb-2">Virtual Suite</p>
              <h2 className="font-serif text-3xl text-eminence-text">Book Expert Consultancy</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-eminence-muted block mb-2 font-bold">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-eminence-gold" />
                  <input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                    placeholder="John Doe" className="w-full bg-eminence-surface border border-eminence-border pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-eminence-gold" />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-eminence-muted block mb-2 font-bold">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-eminence-gold" />
                  <input required value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})}
                    placeholder="+91 00000 00000" className="w-full bg-eminence-surface border border-eminence-border pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-eminence-gold" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-eminence-muted block mb-2 font-bold">Date</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-eminence-gold" />
                    <input type="date" required value={form.date} onChange={(e) => setForm({...form, date: e.target.value})}
                      className="w-full bg-eminence-surface border border-eminence-border pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-eminence-gold" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-eminence-muted block mb-2 font-bold">Time</label>
                  <select value={form.time} onChange={(e) => setForm({...form, time: e.target.value})}
                    className="w-full bg-eminence-surface border border-eminence-border px-4 py-3 text-sm focus:outline-none focus:border-eminence-gold appearance-none">
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-eminence-muted block mb-2 font-bold">Primary Concern</label>
                <select value={form.concern} onChange={(e) => setForm({...form, concern: e.target.value})}
                  className="w-full bg-eminence-surface border border-eminence-border px-4 py-3 text-sm focus:outline-none focus:border-eminence-gold appearance-none">
                  {CONCERNS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" className="w-full mt-10 bg-eminence-gold hover:bg-eminence-goldHover text-white py-4 text-xs uppercase tracking-[0.2em] font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-95">
              Confirm & Request Slot
            </button>
          </form>
        ) : (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 size={40} className="text-green-500" />
            </div>
            <h2 className="font-serif text-3xl text-eminence-text mb-4">Request Sent</h2>
            <p className="text-eminence-muted text-sm leading-relaxed mb-10">
              We've received your request for <strong>{form.date}</strong> at <strong>{form.time}</strong>. 
              Please check your WhatsApp—our expert will confirm the video link shortly.
            </p>
            <button onClick={onClose} className="btn-gold w-full">
              Back to Site
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
