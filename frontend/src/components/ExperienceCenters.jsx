import React, { useState } from "react";
import { Phone, MessageCircle, MapPin } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

const LOCATIONS = [
  {
    id: "vadodara",
    city: "Vadodara",
    address: ["Shreenath Complex, GF6,", "High Tension Rd, near Reliance & Indian Petrol Pump,", "Subhanpura, Vadodara, Gujarat 390023"],
    phone: "+91 87992 88809",
    whatsapp: "+918799288809",
    mapUrl: "https://maps.app.goo.gl/N9Sm2PNJnKVLyGsQ6",
    // Premium salon interior — warm gold tones, mirrors, styling chairs
    img: "/assets/vadodara_salon.png",
  },
  {
    id: "surat",
    city: "Surat",
    address: ["The Galleria Business Hub, 61,", "New Pal Rd, nr. Sanjeev Kumar Auditorium Road,", "Adajan Gam, Adajan, Surat, Gujarat 395009"],
    phone: "+91 87992 88809",
    whatsapp: "+919512188809",
    mapUrl: "https://maps.app.goo.gl/Xj73RqJicvp6MWfMA",
    // Premium salon interior — modern minimalist design, clean lines, bright lighting
    video: "/assets/surat_video.mp4",
  },
];

export default function ExperienceCenters() {
  const { t } = useLang();
  const [active, setActive] = useState("vadodara");
  const loc = LOCATIONS.find((l) => l.id === active);

  return (
    <section className="py-24 md:py-32 bg-eminence-surfaceAlt">
      <div className="max-w-[1500px] mx-auto px-0 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[11px] tracking-[0.5em] uppercase text-eminence-gold mb-6 font-semibold">
            {t("ourLocations")}
          </p>
          <h2 className="font-serif text-4xl md:text-6xl font-light text-eminence-text mb-6">
            {t("expCenters")}
          </h2>
          <div className="w-16 h-px bg-eminence-gold mx-auto mb-8" />
          <p className="text-eminence-muted max-w-lg mx-auto text-sm md:text-base font-light leading-relaxed">
            {t("expCentersSub")}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center gap-0 mb-14 border-b border-eminence-border">
          {LOCATIONS.map((l) => (
            <button
              key={l.id}
              onClick={() => setActive(l.id)}
              className={`
                px-10 py-3 text-xs uppercase tracking-[0.3em] font-semibold transition-all duration-300 relative
                ${active === l.id
                  ? "text-eminence-text border-b-2 border-eminence-gold -mb-px"
                  : "text-eminence-muted hover:text-eminence-text"
                }
              `}
            >
              {l.city}
            </button>
          ))}
        </div>

        {/* Content Card */}
        <div className="grid lg:grid-cols-2 gap-0 overflow-hidden border-y lg:border border-eminence-border/30 shadow-xl bg-white">
          {/* Image */}
          <div className="relative h-[320px] lg:h-full min-h-[320px] overflow-hidden bg-black">
            {loc.video ? (
              <video
                key={loc.id}
                src={loc.video}
                className="absolute inset-0 w-full h-full object-cover object-center"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img
                key={loc.id}
                src={loc.img}
                alt={`Eminence Salon ${loc.city}`}
                className="absolute inset-0 w-full h-full object-cover object-center"
                style={{ animation: "fadeIn 0.6s ease" }}
              />
            )}
          </div>

          {/* Details */}
          <div className="bg-white p-12 lg:p-16 flex flex-col justify-center">
            <p className="text-[10px] uppercase tracking-[0.5em] text-eminence-gold font-bold mb-4">
              {t("experienceCenter")}
            </p>
            <h3 className="font-serif text-4xl md:text-5xl text-eminence-text font-light mb-8">
              {loc.city}
            </h3>

            {/* Divider */}
            <div className="w-10 h-px bg-eminence-gold mb-8" />

            {/* Address */}
            <div className="flex items-start gap-3 mb-8">
              <MapPin size={16} className="text-eminence-gold mt-1 shrink-0" strokeWidth={1.5} />
              <div className="text-eminence-muted text-sm leading-loose font-light">
                {loc.address.map((line, i) => (
                  <span key={i} className="block">{line}</span>
                ))}
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3 mb-10">
              <Phone size={16} className="text-eminence-gold shrink-0" strokeWidth={1.5} />
              <a
                href={`tel:${loc.phone.replace(/\s/g, "")}`}
                className="text-eminence-muted text-sm hover:text-eminence-gold transition-colors"
              >
                {loc.phone}
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <a
                href={`tel:${loc.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2 border border-eminence-text text-eminence-text text-[10px] uppercase tracking-[0.2em] px-6 py-3.5 font-semibold hover:bg-eminence-text hover:text-white transition-all duration-300"
              >
                <Phone size={13} />
                {t("contact")}
              </a>
              <a
                href={`https://wa.me/${loc.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-eminence-gold text-eminence-gold text-[10px] uppercase tracking-[0.2em] px-6 py-3.5 font-semibold hover:bg-eminence-gold hover:text-white transition-all duration-300"
              >
                <MessageCircle size={13} />
                {t("whatsapp")}
              </a>
              <a
                href={loc.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-eminence-border text-eminence-muted text-[10px] uppercase tracking-[0.2em] px-6 py-3.5 font-semibold hover:border-eminence-text hover:text-eminence-text transition-all duration-300"
              >
                <MapPin size={13} />
                {t("getDirections")}
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(1.02); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </section>
  );
}
