import React, { useState } from "react";
import { Phone, MessageCircle, MapPin } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

const LOCATIONS = [
  {
    id: "sama-savli",
    city: "Sama-Savli",
    title: "Sama-Savli Branch (Flagship)",
    address: ["FF-06/07, Earth Eon, opp. Urmi School,", "Sama Savli Road, Near Urmi School Over Bridge,", "Vadodara, Gujarat 390024"],
    phone: "+91 77790 55771",
    whatsapp: "+917779055771",
    mapUrl: "https://maps.app.goo.gl/N9Sm2PNJnKVLyGsQ6",
    img: "/assets/vadodara_salon.png",
  },
  {
    id: "sevasi",
    city: "Sevasi",
    title: "Sevasi Branch",
    address: ["Sevasi Main Road,", "Near Canal Road, Sevasi,", "Vadodara, Gujarat"],
    phone: "+91 77790 55771",
    whatsapp: "+917779055771",
    mapUrl: "https://maps.app.goo.gl/N9Sm2PNJnKVLyGsQ6",
    img: "/assets/professional_hairstylist_working_202604251521.jpeg",
  },
];

export default function ExperienceCenters() {
  const { t } = useLang();
  const [active, setActive] = useState("sama-savli");
  const loc = LOCATIONS.find((l) => l.id === active);

  return (
    <section className="py-24 md:py-32 bg-jainil-surfaceAlt">
      <div className="max-w-[1500px] mx-auto px-0 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[11px] tracking-[0.5em] uppercase text-jainil-gold mb-6 font-semibold">
            {t("ourLocations")}
          </p>
          <h2 className="font-serif text-4xl md:text-6xl font-light text-jainil-text mb-6">
            {t("expCenters")}
          </h2>
          <div className="w-16 h-px bg-jainil-gold mx-auto mb-8" />
          <p className="text-jainil-muted max-w-lg mx-auto text-sm md:text-base font-light leading-relaxed">
            {t("expCentersSub")}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center gap-0 mb-14 border-b border-jainil-border">
          {LOCATIONS.map((l) => (
            <button
              key={l.id}
              onClick={() => setActive(l.id)}
              className={`
                px-10 py-3 text-xs uppercase tracking-[0.3em] font-semibold transition-all duration-300 relative
                ${active === l.id
                  ? "text-jainil-text border-b-2 border-jainil-gold -mb-px"
                  : "text-jainil-muted hover:text-jainil-text"
                }
              `}
            >
              {l.city}
            </button>
          ))}
        </div>

        {/* Content Card */}
        <div className="grid lg:grid-cols-2 gap-0 overflow-hidden border-y lg:border border-jainil-border/30 shadow-xl bg-white">
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
                alt={`Jainil Salon ${loc.city}`}
                className="absolute inset-0 w-full h-full object-cover object-center"
                style={{ animation: "fadeIn 0.6s ease" }}
              />
            )}
          </div>

          {/* Details */}
          <div className="bg-white p-12 lg:p-16 flex flex-col justify-center">
            <p className="text-[10px] uppercase tracking-[0.5em] text-jainil-gold font-bold mb-4">
              {t("experienceCenter")}
            </p>
            <h3 className="font-serif text-4xl md:text-5xl text-jainil-text font-light mb-8">
              {loc.city}
            </h3>

            {/* Divider */}
            <div className="w-10 h-px bg-jainil-gold mb-8" />

            {/* Address */}
            <div className="flex items-start gap-3 mb-8">
              <MapPin size={16} className="text-jainil-gold mt-1 shrink-0" strokeWidth={1.5} />
              <div className="text-jainil-muted text-sm leading-loose font-light">
                {loc.address.map((line, i) => (
                  <span key={i} className="block">{line}</span>
                ))}
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3 mb-10">
              <Phone size={16} className="text-jainil-gold shrink-0" strokeWidth={1.5} />
              <a
                href={`tel:${loc.phone.replace(/\s/g, "")}`}
                className="text-jainil-muted text-sm hover:text-jainil-gold transition-colors"
              >
                {loc.phone}
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <a
                href={`tel:${loc.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2 border border-jainil-text text-jainil-text text-[10px] uppercase tracking-[0.2em] px-6 py-3.5 font-semibold hover:bg-jainil-text hover:text-white transition-all duration-300"
              >
                <Phone size={13} />
                {t("contact")}
              </a>
              <a
                href={`https://wa.me/${loc.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-jainil-gold text-jainil-gold text-[10px] uppercase tracking-[0.2em] px-6 py-3.5 font-semibold hover:bg-jainil-gold hover:text-white transition-all duration-300"
              >
                <MessageCircle size={13} />
                {t("whatsapp")}
              </a>
              <a
                href={loc.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-jainil-border text-jainil-muted text-[10px] uppercase tracking-[0.2em] px-6 py-3.5 font-semibold hover:border-jainil-text hover:text-jainil-text transition-all duration-300"
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
