import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Scissors, 
  Droplets, 
  Layers, 
  Palette, 
  User, 
  Calendar,
  Check,
  Search,
  ChevronRight
} from "lucide-react";
import { useLang } from "@/context/LanguageContext";

const SERVICE_DESCRIPTIONS = {
  "Patch Washing": "Deep cleansing and hygiene wash for hair patch and scalp, removing residual buildup and conditioning fibers.",
  "Patch Service (one time glue)": "Full base removal, gentle scalp detox, re-application of medical-grade adhesive, and precision restyling.",
  "Hair cut": "Master scissor and clipper contouring specifically tailored to integrate hair systems with natural growth.",
  "Beard set": "Artisanal beard shaping, hairline lining, and hot towel facial symmetry finish.",
  "Head Massage": "Pressure-point scalp therapy using nourishing botanical oils to relieve stress and stimulate circulation.",
  "Pro D-ten": "Gentle anti-tan exfoliation and botanical brightening treatment for face and neck.",
  "Basic Clean up": "Deep pore cleansing, steam extraction, and refreshing cucumber-aloe hydrating mask.",
  "Basic Facial": "Rejuvenating skin therapy enhancing elasticity and clearing dead skin cells.",
  "Standard Facial": "Comprehensive deep-cleansing ritual, facial lymphatic massage, and collagen renewal pack.",
  "Hydra Facial": "Hydro-dermabrasion, intensive oxygen infusion, and hyaluronic acid hydration for radiant glow.",
  "Adavance Hydra Facial": "Advanced hydro-infusion with peptide serum boosters, LED phototherapy, and cellular revitalizing mask.",
  "Hair Colour": "Ammonia-free tone-matching color application for natural blending and grey coverage.",
  "Patch Colour": "Custom color calibration and tone-matching specifically formulated for hair replacement systems.",
  "Patch spa colour": "Nourishing color restorative spa treatment for hair system vibrancy and softness.",
  "Patch chemical colour spa": "Deep cuticle reconstruction, keratin protein infusion, and rich multi-dimensional color revival."
};

const getCategoryIcon = (category = "") => {
  const cat = category.toLowerCase();
  if (cat.includes("facial")) return Sparkles;
  if (cat.includes("cut") || cat.includes("beard")) return Scissors;
  if (cat.includes("service") || cat.includes("patch") || cat.includes("system")) return Layers;
  if (cat.includes("color") || cat.includes("colour")) return Palette;
  if (cat.includes("massage") || cat.includes("spa")) return Droplets;
  return Sparkles;
};

export default function Services() {
  const { t } = useLang();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [genderFilter, setGenderFilter] = useState("All"); // All | Men | Women
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get("/services")
      .then((r) => {
        if (Array.isArray(r.data) && r.data.length > 0) {
          setServices(r.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Standardize categories
  const categories = useMemo(() => {
    const raw = services.map((s) => s.category?.trim()).filter(Boolean);
    const unique = Array.from(new Set(raw));
    return ["All", ...unique];
  }, [services]);

  // Filtered services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      // Category match
      const catMatch = activeCategory === "All" || (s.category?.trim().toLowerCase() === activeCategory.toLowerCase());
      
      // Gender match
      let genderMatch = true;
      if (genderFilter === "Men") {
        genderMatch = s.service_for?.toLowerCase().includes("men");
      } else if (genderFilter === "Women") {
        genderMatch = s.service_for?.toLowerCase().includes("women");
      }

      // Search match
      const searchMatch = !searchQuery || 
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category?.toLowerCase().includes(searchQuery.toLowerCase());

      return catMatch && genderMatch && searchMatch;
    });
  }, [services, activeCategory, genderFilter, searchQuery]);

  return (
    <div className="bg-[#FAFDFB] text-[#142820] font-sans antialiased min-h-screen selection:bg-[#0F5A3B] selection:text-white" data-testid="services-page">
      
      {/* ─── HERO HEADER SECTION ──────────────────────────────────────────────── */}
      <section className="relative pt-28 sm:pt-36 md:pt-40 pb-12 sm:pb-16 border-b border-[#E0EBE5] bg-gradient-to-b from-[#F2F7F4]/60 to-[#FAFDFB]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8F3EE] border border-[#D5E4DD] text-[#0F5A3B] text-[11px] font-semibold uppercase tracking-[0.2em] mb-4">
            <Sparkles size={13} />
            <span>Vadodara Studios · Sama-Savli & Sevasi</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-[#142820] leading-tight mb-4">
            Artisanal Salon Menu & <br />
            <span className="italic font-normal text-[#0F5A3B]">Restoration Rituals</span>
          </h1>
          <div className="w-12 h-px bg-[#0F5A3B] mx-auto mb-5" />
          <p className="text-[#556B61] text-sm sm:text-base font-light leading-relaxed max-w-xl mx-auto">
            From medical-grade hair system re-bonding to luxury skin cleanses and master precision haircutting. All performed in private suites.
          </p>

          {/* Dedicated Studio Jump Cards */}
          <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto mt-10 text-left">
            <Link
              to="/men"
              className="bg-white rounded-2xl p-6 border border-[#E0EBE5] hover:border-[#0F5A3B] hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#0F5A3B] bg-[#E8F3EE] px-2.5 py-0.5 rounded-full">
                  Dedicated Studio
                </span>
                <h3 className="font-serif text-xl font-medium text-[#142820] mt-2 group-hover:text-[#0F5A3B] transition-colors">
                  Men's Hair Systems
                </h3>
                <p className="text-xs text-[#556B61] font-light mt-0.5">
                  French lace, skin poly, and undetectable hairline restoration.
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#E8F3EE] text-[#0F5A3B] flex items-center justify-center shrink-0 group-hover:bg-[#0F5A3B] group-hover:text-white transition-colors ml-4">
                <ArrowRight size={15} />
              </div>
            </Link>

            <Link
              to="/women"
              className="bg-white rounded-2xl p-6 border border-[#E0EBE5] hover:border-[#0F5A3B] hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#0F5A3B] bg-[#E8F3EE] px-2.5 py-0.5 rounded-full">
                  Dedicated Studio
                </span>
                <h3 className="font-serif text-xl font-medium text-[#142820] mt-2 group-hover:text-[#0F5A3B] transition-colors">
                  Women's Crown Toppers & Volume
                </h3>
                <p className="text-xs text-[#556B61] font-light mt-0.5">
                  100% private suites, silk-base partings, and gentle extensions.
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#E8F3EE] text-[#0F5A3B] flex items-center justify-center shrink-0 group-hover:bg-[#0F5A3B] group-hover:text-white transition-colors ml-4">
                <ArrowRight size={15} />
              </div>
            </Link>
          </div>

        </div>
      </section>

      {/* ─── FILTER & SERVICE CATALOG SECTION ─────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          
          {/* Controls Bar: Category Pills + Gender Selector */}
          <div className="space-y-6 mb-12">
            
            {/* Top row: Gender Pills & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 bg-[#E8F3EE] p-1 rounded-full border border-[#D5E4DD]">
                {["All", "Men", "Women"].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGenderFilter(g)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                      genderFilter === g
                        ? "bg-[#0F5A3B] text-white shadow-xs"
                        : "text-[#556B61] hover:text-[#142820]"
                    }`}
                  >
                    {g === "All" ? "All Clients" : `For ${g}`}
                  </button>
                ))}
              </div>

              {/* Quick Search */}
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#556B61]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search service..."
                  className="w-full pl-9 pr-4 py-2 rounded-full border border-[#E0EBE5] bg-white text-xs text-[#142820] placeholder-[#889E94] focus:outline-hidden focus:border-[#0F5A3B] transition-colors"
                />
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E0EBE5]">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`text-xs uppercase tracking-wider px-4 py-2 rounded-full font-medium transition-all ${
                    activeCategory.toLowerCase() === c.toLowerCase()
                      ? "bg-[#0F5A3B] text-white shadow-xs"
                      : "bg-white text-[#556B61] hover:text-[#142820] border border-[#E0EBE5] hover:border-[#0F5A3B]"
                  }`}
                >
                  {c === "All" ? "All Categories" : c}
                </button>
              ))}
            </div>

          </div>

          {/* Services Grid (Luxury Editorial Service Cards) */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-3 border-[#0F5A3B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-xs uppercase tracking-widest text-[#556B61]">Loading Studio Menu...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-[#D8E6DF] p-8">
              <Sparkles size={28} className="text-[#0F5A3B] mx-auto mb-3" />
              <h3 className="font-serif text-xl text-[#142820] mb-1">No services found</h3>
              <p className="text-xs text-[#556B61] max-w-sm mx-auto mb-4">
                Try selecting a different category or clearing your search term.
              </p>
              <button
                onClick={() => { setActiveCategory("All"); setGenderFilter("All"); setSearchQuery(""); }}
                className="text-xs font-semibold text-[#0F5A3B] uppercase tracking-wider underline hover:opacity-80"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredServices.map((s) => {
                const IconComponent = getCategoryIcon(s.category);
                const cleanName = s.name?.trim() || "Service";
                const desc = s.description?.trim() || SERVICE_DESCRIPTIONS[cleanName] || "Premium treatment conducted in our private Vadodara styling suites.";

                return (
                  <div
                    key={s.id}
                    className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E2ECE6] hover:border-[#0F5A3B] hover:shadow-[0_12px_32px_rgba(15,90,59,0.08)] transition-all duration-300 flex flex-col justify-between group"
                    data-testid={`service-${s.id}`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-[#0F5A3B] bg-[#E8F3EE] px-3 py-1 rounded-full border border-[#D5E4DD]">
                          <IconComponent size={13} className="shrink-0 text-[#0F5A3B]" />
                          <span>{s.category || "Ritual"}</span>
                        </span>

                        {s.service_for && (
                          <span className="inline-flex items-center text-[10px] uppercase tracking-wider font-semibold text-[#556B61] bg-[#FAFDFB] border border-[#E0EBE5] px-2.5 py-1 rounded-full">
                            {s.service_for}
                          </span>
                        )}
                      </div>

                      {/* Service Title */}
                      <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#142820] group-hover:text-[#0F5A3B] transition-colors leading-snug mt-4 mb-2">
                        {cleanName}
                      </h3>

                      {/* Service Description */}
                      <p className="text-sm text-[#556B61] font-light leading-relaxed min-h-[44px] line-clamp-2">
                        {desc}
                      </p>

                      {/* Session Specs Bar */}
                      <div className="mt-4 pt-3.5 pb-3 border-t border-b border-[#EDF4F0] flex items-center justify-between text-xs text-[#556B61]">
                        <span className="inline-flex items-center gap-1.5 font-medium text-[#142820]">
                          <Clock size={13} className="text-[#0F5A3B]" />
                          <span>{s.duration_min || 30} mins session</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0F5A3B] bg-[#E8F3EE] px-2.5 py-0.5 rounded-full">
                          <Sparkles size={11} />
                          <span>Private Suite</span>
                        </span>
                      </div>
                    </div>

                    {/* Card Footer: Starting Price & Book Button */}
                    <div className="mt-5 pt-1 flex items-center justify-between gap-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-[#889E94] font-medium leading-none">Starting from</span>
                        <span className="font-serif text-2xl font-medium text-[#142820] leading-none mt-1">
                          ₹{Number(s.price || 0).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <Link
                        to="/book"
                        state={{ service: s }}
                        className="inline-flex items-center gap-1.5 bg-[#0F5A3B] hover:bg-[#142820] text-white px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow-xs hover:shadow-md group/btn shrink-0"
                        data-testid={`book-${s.id}`}
                      >
                        <span>Book Service</span>
                        <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* ─── NEED GUIDANCE BANNER ─────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-[#0F5A3B] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 text-center relative z-10 space-y-5">
          <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-[#D1EADB] text-[10px] uppercase tracking-[0.25em] font-semibold">
            Confidential Consultation · 100% Private Suites
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light leading-tight">
            Not Sure Which Service You Need?
          </h2>

          <p className="text-white/80 max-w-lg mx-auto text-xs sm:text-sm font-light leading-relaxed">
            Take our quick 2-minute diagnostic questionnaire or speak privately with our senior hair specialists in Vadodara.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/consultancy"
              className="inline-flex items-center gap-2 bg-white text-[#0F5A3B] hover:bg-[#F0F7F4] px-7 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md"
            >
              <Sparkles size={14} />
              <span>Start Scalp Diagnostics</span>
            </Link>

            <a
              href="https://wa.me/917779055771?text=Hello%20Jainil%20Hair%20Studio,%20I%20would%20like%20to%20inquire%20about%20your%20services."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-white/40 text-white hover:bg-white/10 px-7 py-3.5 rounded-full font-medium text-xs uppercase tracking-wider transition-colors"
            >
              <span>WhatsApp Consultation</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
