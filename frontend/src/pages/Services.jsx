import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { Clock, ArrowRight, Sparkles, Check } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

const FALLBACK_SERVICES = [
  {
    id: 1,
    name: "Non-Surgical Hair Replacement",
    category: "Hair Systems",
    description: "Custom-fitted, breathable patch systems seamlessly blended with your natural hair for an undetectable finish.",
    duration_min: 75,
    price: 14999,
    image_url: "/assets/slider/slide1.jpeg"
  },
  {
    id: 2,
    name: "Women's Silk Crown Topper Fitting",
    category: "Women's Solutions",
    description: "Multi-directional parting silk toppers for crown thinning, widening partitions, and featherlight volume.",
    duration_min: 60,
    price: 12500,
    image_url: "/assets/beautiful_female_model_202604251523.jpeg"
  },
  {
    id: 3,
    name: "System Servicing & Re-Bonding",
    category: "Maintenance",
    description: "Complete hygiene deep-cleanse, base re-taping with medical-grade adhesives, scalp detox, and restyling.",
    duration_min: 45,
    price: 1200,
    image_url: "/assets/professional_hairstylist_working_202604251521.jpeg"
  },
  {
    id: 4,
    name: "Seamless Volume Extensions",
    category: "Women's Solutions",
    description: "Premium 100% Virgin Indian Remy hair extensions for luxurious thickness, bounce, and natural length.",
    duration_min: 60,
    price: 8999,
    image_url: "/assets/make_the_girl_202604251826.jpeg"
  },
  {
    id: 5,
    name: "Scalp Therapy & Anti-Thinning",
    category: "Scalp Health",
    description: "Botanical scalp exfoliation, oxygen infusion, and follicular revitalizing rituals for natural hair vitality.",
    duration_min: 45,
    price: 2500,
    image_url: "/assets/realistic_human_hair_202604251524.jpeg"
  },
  {
    id: 6,
    name: "Master Haircut & Precision Blend",
    category: "Styling",
    description: "Artisanal scissor and clipper contouring specifically tailored to integrate hair systems with natural growth.",
    duration_min: 40,
    price: 800,
    image_url: "/assets/realistic_men's_hair_202604251529.jpeg"
  }
];

export default function Services() {
  const { t } = useLang();
  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get("/services")
      .then((r) => {
        if (Array.isArray(r.data) && r.data.length > 0) {
          setServices(r.data);
        } else {
          setServices(FALLBACK_SERVICES);
        }
      })
      .catch(() => setServices(FALLBACK_SERVICES));
  }, []);

  const serviceList = services.length > 0 ? services : FALLBACK_SERVICES;
  const cats = ["All", ...new Set(serviceList.map((s) => s.category).filter(Boolean))];
  const filtered = filter === "All" ? serviceList : serviceList.filter((s) => s.category === filter);

  return (
    <div className="bg-[#FAFDFB] min-h-screen text-[#142820] py-16 sm:py-24" data-testid="services-page">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8F3EE] border border-[#D5E4DD] text-[#0F5A3B] text-[11px] font-semibold uppercase tracking-[0.2em]">
            <Sparkles size={13} />
            <span>Vadodara Studios · Sama-Savli & Sevasi</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-[#142820]">
            Bespoke Services & <br />
            <span className="italic font-normal text-[#0F5A3B]">Aesthetic Rituals</span>
          </h1>
          <div className="w-12 h-px bg-[#0F5A3B] mx-auto mt-4" />
          <p className="text-[#556B61] text-sm sm:text-base font-light leading-relaxed">
            Crafted for men and women seeking undetectable hair replacement, crown volume restoration, and master servicing.
          </p>
        </div>

        {/* Quick Gender Jump Cards */}
        <div className="grid sm:grid-cols-2 gap-6 mb-14">
          <Link
            to="/men"
            className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E0EBE5] hover:border-[#0F5A3B] hover:shadow-lg transition-all group flex items-center justify-between"
          >
            <div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#0F5A3B] bg-[#E8F3EE] px-3 py-1 rounded-full">
                Men's Studio
              </span>
              <h3 className="font-serif text-2xl font-medium text-[#142820] mt-3 group-hover:text-[#0F5A3B] transition-colors">
                Men's Hair Systems
              </h3>
              <p className="text-xs text-[#556B61] font-light mt-1">
                Breathable French lace, skin poly, and undetectable hairline integration.
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#E8F3EE] text-[#0F5A3B] flex items-center justify-center shrink-0 group-hover:bg-[#0F5A3B] group-hover:text-white transition-colors">
              <ArrowRight size={16} />
            </div>
          </Link>

          <Link
            to="/women"
            className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E0EBE5] hover:border-[#0F5A3B] hover:shadow-lg transition-all group flex items-center justify-between"
          >
            <div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#0F5A3B] bg-[#E8F3EE] px-3 py-1 rounded-full">
                Women's Studio
              </span>
              <h3 className="font-serif text-2xl font-medium text-[#142820] mt-3 group-hover:text-[#0F5A3B] transition-colors">
                Women's Crown Toppers & Extensions
              </h3>
              <p className="text-xs text-[#556B61] font-light mt-1">
                100% private soundproof suites, natural volume, and delicate hair toppers.
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#E8F3EE] text-[#0F5A3B] flex items-center justify-center shrink-0 group-hover:bg-[#0F5A3B] group-hover:text-white transition-colors">
              <ArrowRight size={16} />
            </div>
          </Link>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              data-testid={`filter-${c}`}
              className={`text-xs uppercase tracking-wider px-5 py-2.5 rounded-full font-medium transition-all ${
                filter === c
                  ? "bg-[#0F5A3B] text-white shadow-sm"
                  : "bg-white text-[#556B61] hover:text-[#142820] border border-[#E0EBE5] hover:border-[#0F5A3B]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-3xl overflow-hidden border border-[#E0EBE5] hover:border-[#0F5A3B] hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              data-testid={`service-${s.id}`}
            >
              <div>
                <div className="aspect-[16/10] overflow-hidden relative bg-[#E8F3EE]">
                  <img
                    src={s.image_url || "/assets/slider/slide1.jpeg"}
                    alt={s.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/assets/slider/slide1.jpeg";
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[#0F5A3B] text-[9px] uppercase tracking-wider font-bold px-3 py-1 rounded-full border border-[#D5E4DD]">
                    {s.category || "Hair Service"}
                  </div>
                </div>

                <div className="p-7 space-y-3">
                  <h3 className="font-serif text-2xl font-medium text-[#142820] group-hover:text-[#0F5A3B] transition-colors">
                    {s.name}
                  </h3>
                  <p className="text-xs text-[#556B61] font-light leading-relaxed line-clamp-3">
                    {s.description}
                  </p>
                </div>
              </div>

              <div className="p-7 pt-0 space-y-4">
                <div className="pt-4 border-t border-[#F0F5F2] flex items-center justify-between text-xs text-[#556B61]">
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-[#0F5A3B]" />
                    <span>{s.duration_min || 45} min</span>
                  </span>
                  {s.price && (
                    <span className="font-bold text-[#142820]">
                      From ₹{Number(s.price).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>

                <Link
                  to="/book"
                  state={{ service: s }}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#0F5A3B] hover:bg-[#0A3D27] text-white py-3 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 shadow-sm"
                  data-testid={`book-${s.id}`}
                >
                  <span>Book This Service</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
