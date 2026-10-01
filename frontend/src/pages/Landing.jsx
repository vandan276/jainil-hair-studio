import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import { 
  Calendar, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  Star,
  CheckCircle2,
  Clock,
  Phone,
  MessageCircle,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Award,
  Layers,
  HeartHandshake,
  Check,
  Building2
} from "lucide-react";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";

const TRUST_PILLARS = [
  {
    icon: ShieldCheck,
    title: "Confidential Consultation",
    desc: "Private individual styling suites ensuring complete discretion and comfort."
  },
  {
    icon: Layers,
    title: "Custom Base Engineering",
    desc: "Ultra-thin French lace, skin poly, and breathable bases mapped to your scalp."
  },
  {
    icon: Award,
    title: "100% Virgin Human Hair",
    desc: "Natural hair direction, custom density blending, and exact color matching."
  },
  {
    icon: HeartHandshake,
    title: "Dedicated Aftercare",
    desc: "Routine hygiene servicing, re-bonding, and styling advice for longevity."
  }
];

const FALLBACK_SERVICES = [
  {
    id: 1,
    name: "Non-Surgical Hair Replacement",
    category: "Hair Systems",
    description: "Custom-fitted, breathable patch systems seamlessly blended with your natural hair for an undetectable finish.",
    duration: "60-90 min",
    image_url: "/assets/slider/slide1.jpeg"
  },
  {
    id: 2,
    name: "System Servicing & Re-Bonding",
    category: "Maintenance",
    description: "Complete hygiene deep-cleanse, base re-taping with medical-grade adhesives, scalp detox, and restyling.",
    duration: "45-60 min",
    image_url: "/assets/professional_hairstylist_working_202604251521.jpeg"
  },
  {
    id: 3,
    name: "Scalp Therapy & Anti-Thinning",
    category: "Scalp Health",
    description: "Botanical scalp exfoliation, oxygen infusion, and follicular revitalizing rituals for natural hair vitality.",
    duration: "45 min",
    image_url: "/assets/realistic_human_hair_202604251524.jpeg"
  },
  {
    id: 4,
    name: "Master Haircut & Precision Blend",
    category: "Styling",
    description: "Artisanal scissor and clipper contouring specifically tailored to integrate hair systems with natural growth.",
    duration: "40 min",
    image_url: "/assets/realistic_men's_hair_202604251529.jpeg"
  }
];

const FALLBACK_STYLISTS = [
  {
    id: 1,
    name: "Jainil Panchal",
    role: "Master Hair Restoration Specialist",
    bio: "Over 8 years specializing in custom hair patch systems, hairline density calibration, and undetectable integration.",
    image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: 2,
    name: "Sneha Patel",
    role: "Senior Colorist & Aesthetic Director",
    bio: "Expert in natural tone matching, multi-dimensional color blending, and luxury bridal styling rituals.",
    image_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: 3,
    name: "Rahul Dave",
    role: "Hair System Senior Technician",
    bio: "Certified specialist in breathable French lace bases, micro-knotting, and hypoallergenic scalp bonding techniques.",
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80"
  }
];

const BRANCHES = [
  {
    id: "sama-savli",
    name: "Sama-Savli Branch",
    tag: "Flagship Studio",
    address: "FF-06/07, Earth Eon, opp. Urmi School, Sama Savli Road, Near Urmi School Over Bridge, Vadodara, Gujarat 390024",
    phone: "+91 77790 55771",
    hours: "10:00 AM – 8:30 PM (Mon – Sun)",
    mapUrl: "https://maps.app.goo.gl/N9Sm2PNJnKVLyGsQ6",
    features: ["Private Consultation Suites", "Custom Fitting Lab", "Scalp Care Spa"]
  },
  {
    id: "sevasi",
    name: "Sevasi Branch",
    tag: "Studio & Service Center",
    address: "Sevasi Main Road, Sevasi, Vadodara, Gujarat",
    phone: "+91 77790 55771",
    hours: "10:00 AM – 8:30 PM (Mon – Sun)",
    mapUrl: "https://maps.app.goo.gl/N9Sm2PNJnKVLyGsQ6",
    features: ["Hair System Servicing", "Precision Styling & Re-Bonding", "Consultations"]
  }
];

const TESTIMONIALS = [
  {
    name: "Amit V.",
    location: "Sama-Savli Studio",
    treatment: "Full Crown Hair System",
    quote: "Jainil Hair Studio transformed my daily life. The hairline is completely undetectable even up close, and the privacy at the Sama-Savli studio is unmatched.",
    stars: 5
  },
  {
    name: "Meera K.",
    location: "Sevasi Studio",
    treatment: "Hair Volumizing System",
    quote: "The consultations at the Sevasi branch were very transparent and reassuring. They matched my hair texture and color perfectly. It feels light and completely natural.",
    stars: 5
  },
  {
    name: "Rohan P.",
    location: "Vadodara",
    treatment: "Custom Lace Patch & Servicing",
    quote: "I regularly visit for my monthly servicing. The quality of virgin hair and the hygienic bonding technique are hands down the best in town.",
    stars: 5
  }
];

const HERO_SLIDES = [
  {
    id: "flagship-4k",
    image: "/assets/hero/hero_web.jpg",
    fallbackImage: "/assets/hero/Create_website_hero_background_logo_4K_20260926164550.jpg",
    tabLabel: "Studio Flagship",
    tag: "Vadodara Flagship · Sama-Savli & Sevasi",
    title: "Natural Hair Systems,",
    titleHighlight: "Crafted with Precision.",
    desc: "Vadodara’s premier destination for undetectable non-surgical hair restoration across our Sama-Savli and Sevasi branches. Experience 100% natural virgin human hair, custom breathable bases, and private consultation suites.",
    ctaPrimary: { text: "Book Consultation", link: "/book" },
    ctaSecondary: { text: "Explore Services", link: "/services" },
    features: ["4.9★ Google Rating", "8,000+ Happy Clients", "100% Virgin Hair"]
  },
  {
    id: "breathable-base",
    image: "/assets/slider/slide4.jpeg",
    fallbackImage: "/assets/slider/slide1.jpeg",
    tabLabel: "Breathable Bases",
    tag: "Custom Base Engineering · Featherlight",
    title: "100% Breathable Base,",
    titleHighlight: "Featherlight Comfort.",
    desc: "Ultra-thin French lace, skin poly, and breathable honeycomb mesh mapped to your scalp contour. Undetectable hairline blending, hypoallergenic bonding, and maximum scalp ventilation.",
    ctaPrimary: { text: "Explore Hair Systems", link: "/services" },
    ctaSecondary: { text: "Take Scalp Quiz", link: "/consultancy" },
    features: ["Medical-Grade Bonding", "Hypoallergenic", "Active Scalp Ventilation"]
  },
  {
    id: "mens-restoration",
    image: "/assets/men_ai_hero.jpg",
    fallbackImage: "/assets/slider/slide3.jpeg",
    tabLabel: "Men's Systems",
    tag: "Men's Non-Surgical Hair Replacement",
    title: "Confidence Restored,",
    titleHighlight: "Completely Undetectable.",
    desc: "Custom-fitted hair patch systems tailored for modern active men facing crown or frontal thinning. Seamless integration, zero surgery, swimmable & gym-ready from day one.",
    ctaPrimary: { text: "View Men's Collection", link: "/men" },
    ctaSecondary: { text: "Book Consultation", link: "/book" },
    features: ["Seamless Natural Hairline", "Gym & Swim Ready", "Zero Downtime"]
  },
  {
    id: "luxury-suites",
    image: "/assets/slider/slide6.jpeg",
    fallbackImage: "/assets/professional_hairstylist_working_202604251521.jpeg",
    tabLabel: "Private Suites",
    tag: "Private 1-on-1 Suites · Total Discretion",
    title: "Private Consultation Suites,",
    titleHighlight: "Master Stylist Care.",
    desc: "Experience total confidentiality in our executive private styling suites at Sama-Savli Road & Sevasi. One-on-one personalized density calibration and master scissor contouring.",
    ctaPrimary: { text: "Visit Our Studios", link: "/services" },
    ctaSecondary: { text: "Call +91 77790 55771", isPhone: true, link: "tel:+917779055771" },
    features: ["100% Confidential Suites", "Private Fitting Lab", "Certified Specialists"]
  },
  {
    id: "virgin-hair",
    image: "/assets/slider/slide2.jpeg",
    fallbackImage: "/assets/realistic_human_hair_202604251524.jpeg",
    tabLabel: "Virgin Human Hair",
    tag: "Ethical Sourcing · Master Color Blending",
    title: "100% Virgin Human Hair,",
    titleHighlight: "Masterful Tone Matching.",
    desc: "Ethically sourced cuticle-intact virgin hair that moves, reacts, and reflects light just like natural growth. Artisanal density tuning and luxury multidimensional color blending.",
    ctaPrimary: { text: "Book Consultation", link: "/book" },
    ctaSecondary: { text: "Take Scalp Quiz", link: "/consultancy" },
    features: ["Cuticle Intact", "Multidimensional Tone", "Tangle-Free Natural Feel"]
  }
];

export default function Landing() {
  const { t } = useLang();
  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [activeHeroIdx, setActiveHeroIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const heroScrollRef = React.useRef(null);

  const handleHeroScroll = () => {
    if (!heroScrollRef.current) return;
    const { scrollLeft, clientWidth } = heroScrollRef.current;
    if (clientWidth > 0) {
      const newIdx = Math.round(scrollLeft / clientWidth);
      if (newIdx !== activeHeroIdx && newIdx >= 0 && newIdx < HERO_SLIDES.length) {
        setActiveHeroIdx(newIdx);
      }
    }
  };

  const scrollToSlide = (idx) => {
    if (!heroScrollRef.current) return;
    const clientWidth = heroScrollRef.current.clientWidth;
    heroScrollRef.current.scrollTo({
      left: idx * clientWidth,
      behavior: "smooth"
    });
    setActiveHeroIdx(idx);
  };

  const nextHeroSlide = () => {
    const nextIdx = (activeHeroIdx + 1) % HERO_SLIDES.length;
    scrollToSlide(nextIdx);
  };

  const prevHeroSlide = () => {
    const prevIdx = (activeHeroIdx - 1 + HERO_SLIDES.length) % HERO_SLIDES.length;
    scrollToSlide(prevIdx);
  };

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      if (heroScrollRef.current) {
        const nextIdx = (activeHeroIdx + 1) % HERO_SLIDES.length;
        const clientWidth = heroScrollRef.current.clientWidth;
        heroScrollRef.current.scrollTo({
          left: nextIdx * clientWidth,
          behavior: "smooth"
        });
        setActiveHeroIdx(nextIdx);
      }
    }, 6000);
    return () => clearInterval(timer);
  }, [activeHeroIdx, isPaused]);

  useEffect(() => {
    api.get("/services")
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setServices(res.data.slice(0, 4));
        } else {
          setServices(FALLBACK_SERVICES);
        }
      })
      .catch(() => setServices(FALLBACK_SERVICES));

    api.get("/stylists")
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setStylists(res.data.slice(0, 3));
        } else {
          setStylists(FALLBACK_STYLISTS);
        }
      })
      .catch(() => setStylists(FALLBACK_STYLISTS));
  }, []);

  return (
    <div data-testid="landing-page" className="bg-[#FAFDFB] text-[#142820] font-sans antialiased selection:bg-[#0F5A3B] selection:text-white">
      {/* ─── SCROLLABLE HERO SECTION ────────────────────────────────────────── */}
      <section 
        className="relative overflow-hidden pt-24 sm:pt-28 bg-[#040e08] border-b border-[#0F5A3B]/30"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Scrollable Track */}
        <div
          ref={heroScrollRef}
          onScroll={handleHeroScroll}
          className="flex w-full overflow-x-auto snap-x snap-mandatory scroll-smooth select-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {HERO_SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className="w-full shrink-0 min-w-full snap-start relative min-h-[820px] sm:min-h-[860px] lg:min-h-[900px] flex items-center overflow-hidden"
            >
              {/* Background Image with Fallback */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                  src={slide.image}
                  onError={(e) => {
                    if (slide.fallbackImage && e.target.src !== slide.fallbackImage) {
                      e.target.src = slide.fallbackImage;
                    }
                  }}
                  alt={slide.title}
                  className={`w-full h-full object-cover object-center transition-transform duration-1000 ease-out ${
                    activeHeroIdx === idx ? "scale-105" : "scale-100"
                  }`}
                />

                {/* Cinematic Luxury Dark Gradients - smooth transition covering background text on left while keeping model bright */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#030c07] via-[#030c07]/90 sm:via-[#030c07]/80 via-40% to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030c07] via-transparent to-[#030c07]/60 z-10" />
              </div>

              {/* Slide Content with Bulletproof Solid Frosted Dark Card */}
              <div className="relative z-20 max-w-[1400px] w-full mx-auto px-6 lg:px-12 pt-16 pb-28 sm:pt-20 sm:pb-32">
                <div 
                  style={{ 
                    backgroundColor: "rgba(5, 18, 12, 0.88)", 
                    backdropFilter: "blur(28px)", 
                    WebkitBackdropFilter: "blur(28px)",
                    boxShadow: "0 32px 64px -16px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(16, 185, 129, 0.25)"
                  }}
                  className="max-w-2xl lg:max-w-[700px] rounded-3xl p-8 sm:p-11 lg:p-12 space-y-6 sm:space-y-7 text-white"
                >

                  {/* Overline Badge */}
                  <div 
                    style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", borderColor: "rgba(52, 211, 153, 0.35)" }}
                    className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border text-emerald-300 text-[11px] font-bold uppercase tracking-[0.2em] shadow-sm"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-300 font-bold">{slide.tag}</span>
                  </div>

                  {/* Heading */}
                  <h1 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-light text-white leading-[1.18] tracking-tight drop-shadow-md">
                    {slide.title} <br className="hidden sm:inline" />
                    <span className="font-normal italic text-emerald-400">{slide.titleHighlight}</span>
                  </h1>

                  {/* Description */}
                  <p className="text-gray-200 text-sm sm:text-base font-light leading-relaxed max-w-xl">
                    {slide.desc}
                  </p>

                  {/* 100% Guaranteed High-Contrast CTA Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-1">
                    <Link
                      to={slide.ctaPrimary.link}
                      style={{ backgroundColor: "#10B981", color: "#000000" }}
                      className="inline-flex items-center justify-center gap-3 font-extrabold px-8 py-4 rounded-full text-xs uppercase tracking-[0.18em] transition-all duration-300 shadow-xl shadow-emerald-950/50 hover:scale-[1.03] group hover:brightness-110 active:scale-95"
                    >
                      <span style={{ color: "#000000" }} className="font-black text-black text-xs uppercase tracking-wider">
                        {slide.ctaPrimary.text}
                      </span>
                      <ArrowRight size={16} style={{ color: "#000000" }} className="group-hover:translate-x-1.5 transition-transform text-black stroke-[3]" />
                    </Link>

                    {slide.ctaSecondary.isPhone ? (
                      <a
                        href={slide.ctaSecondary.link}
                        style={{ backgroundColor: "#ffffff", color: "#000000" }}
                        className="inline-flex items-center justify-center gap-2.5 font-extrabold px-8 py-4 rounded-full text-xs uppercase tracking-[0.18em] transition-all duration-300 shadow-lg hover:scale-[1.03] active:scale-95 border-2 border-white hover:bg-gray-100"
                      >
                        <Phone size={15} style={{ color: "#000000" }} className="text-black stroke-[3]" />
                        <span style={{ color: "#000000" }} className="font-black text-black text-xs uppercase tracking-wider">
                          {slide.ctaSecondary.text}
                        </span>
                      </a>
                    ) : (
                      <Link
                        to={slide.ctaSecondary.link}
                        style={{ backgroundColor: "#ffffff", color: "#000000" }}
                        className="inline-flex items-center justify-center gap-2.5 font-extrabold px-8 py-4 rounded-full text-xs uppercase tracking-[0.18em] transition-all duration-300 shadow-lg hover:scale-[1.03] active:scale-95 border-2 border-white hover:bg-gray-100"
                      >
                        <span style={{ color: "#000000" }} className="font-black text-black text-xs uppercase tracking-wider">
                          {slide.ctaSecondary.text}
                        </span>
                      </Link>
                    )}
                  </div>

                  {/* Features Trust Strip */}
                  <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                      {slide.features.map((feat, fIdx) => (
                        <div key={fIdx} className="inline-flex items-center gap-2 text-gray-200 font-medium text-xs">
                          <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                    <Link 
                      to="/consultancy" 
                      className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold text-xs transition-colors hover:underline"
                    >
                      <span>Take Scalp Quiz</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Navigation Arrows - Sleek Frosted Glass with Glowing Hover */}
        <button
          onClick={prevHeroSlide}
          aria-label="Previous slide"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.65)", color: "#ffffff" }}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full border border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 text-white hover:text-emerald-400 hover:border-emerald-400/60 cursor-pointer shadow-2xl"
        >
          <ChevronLeft size={22} className="stroke-[2.5]" />
        </button>

        <button
          onClick={nextHeroSlide}
          aria-label="Next slide"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.65)", color: "#ffffff" }}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full border border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 text-white hover:text-emerald-400 hover:border-emerald-400/60 cursor-pointer shadow-2xl"
        >
          <ChevronRight size={22} className="stroke-[2.5]" />
        </button>

        {/* Bottom Interactive Thumbnail & Tab Strip */}
        <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 z-30 max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Slide Tab Buttons */}
          <div 
            style={{ 
              backgroundColor: "rgba(4, 16, 10, 0.95)", 
              backdropFilter: "blur(20px)",
              scrollbarWidth: "none" 
            }} 
            className="flex items-center gap-2 overflow-x-auto max-w-full p-1.5 rounded-full border border-emerald-500/30 shadow-2xl"
          >
            {HERO_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => scrollToSlide(idx)}
                style={
                  activeHeroIdx === idx
                    ? { backgroundColor: "#10B981", color: "#000000" }
                    : { color: "#ffffff", backgroundColor: "transparent" }
                }
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all duration-300 flex items-center gap-2 ${
                  activeHeroIdx === idx
                    ? "shadow-lg scale-105"
                    : "hover:text-emerald-300 hover:bg-white/10"
                }`}
              >
                <span 
                  style={{ backgroundColor: activeHeroIdx === idx ? "#000000" : "#10B981" }}
                  className="w-1.5 h-1.5 rounded-full" 
                />
                <span className="whitespace-nowrap">{`0${idx + 1}`} · {s.tabLabel}</span>
              </button>
            ))}
          </div>

          {/* Slide Counter & Mode Indicator */}
          <div 
            style={{ backgroundColor: "rgba(4, 16, 10, 0.95)", backdropFilter: "blur(20px)" }}
            className="hidden sm:flex items-center gap-3 text-xs font-mono text-gray-200 px-4 py-2 rounded-full border border-emerald-500/30 shadow-2xl"
          >
            <span className="font-bold text-emerald-400">
              {`0${activeHeroIdx + 1}`} / {`0${HERO_SLIDES.length}`}
            </span>
            <span className="text-white/30">•</span>
            <span className="text-[10px] uppercase tracking-wider text-emerald-200">
              {isPaused ? "Paused" : "Auto-playing"}
            </span>
          </div>
        </div>
      </section>

      {/* ─── TRUST PILLARS STRIP ───────────────────────────────────────────────── */}
      <section className="py-8 bg-[#F6FAF8] border-b border-[#E0EBE5]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {TRUST_PILLARS.map((item, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-white border border-[#D8E6DF] text-[#0F5A3B] flex items-center justify-center shrink-0 shadow-sm">
                <item.icon size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-base font-semibold text-[#142820]">{item.title}</h3>
                <p className="text-xs text-[#556B61] font-light leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── DEDICATED STUDIOS: MEN & WOMEN ────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-[#FAFDFB] border-b border-[#E0EBE5]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#0F5A3B]">
              Specialized Care
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#142820]">
              Dedicated Studios for Men & Women
            </h2>
            <div className="w-12 h-px bg-[#0F5A3B] mx-auto mt-3" />
            <p className="text-sm text-[#556B61] font-light leading-relaxed">
              Explore specialized non-surgical hair restoration engineered for your unique lifestyle and crown density.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Men's Studio Card */}
            <Link
              to="/men"
              className="group relative rounded-3xl overflow-hidden border border-[#D5E4DD] bg-white shadow-md hover:shadow-xl transition-all duration-500 flex flex-col justify-between"
            >
              <div className="aspect-[16/10] overflow-hidden relative bg-[#E8F3EE]">
                <img
                  src="/assets/slider/slide4.jpeg"
                  alt="Men's Hair Systems"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-[#0F5A3B] text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border border-[#D5E4DD]">
                  Men's Studio
                </div>
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <h3 className="font-serif text-2xl sm:text-3xl font-normal leading-snug">
                    Men's Hair Systems
                  </h3>
                  <p className="text-white/80 text-xs sm:text-sm font-light mt-1 line-clamp-2">
                    Undetectable Swiss lace, poly skin hairlines, and active lifestyle durability.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-white flex items-center justify-between border-t border-[#E0EBE5]">
                <span className="text-xs uppercase tracking-[0.16em] font-semibold text-[#0F5A3B] group-hover:text-[#0A3D27] flex items-center gap-2">
                  <span>Explore Men's Hair Systems</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="text-[11px] text-[#556B61] font-medium bg-[#E8F3EE] px-2.5 py-1 rounded-full">
                  100% Breathable
                </span>
              </div>
            </Link>

            {/* Women's Studio Card */}
            <Link
              to="/women"
              className="group relative rounded-3xl overflow-hidden border border-[#D5E4DD] bg-white shadow-md hover:shadow-xl transition-all duration-500 flex flex-col justify-between"
            >
              <div className="aspect-[16/10] overflow-hidden relative bg-[#E8F3EE]">
                <img
                  src="/assets/beautiful_female_model_202604251523.jpeg"
                  alt="Women's Hair Enhancements"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-[#0F5A3B] text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border border-[#D5E4DD]">
                  Women's Studio
                </div>
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <h3 className="font-serif text-2xl sm:text-3xl font-normal leading-snug">
                    Women's Crown Toppers & Volume
                  </h3>
                  <p className="text-white/80 text-xs sm:text-sm font-light mt-1 line-clamp-2">
                    100% private suites, silk-base partings, and gentle tension-free volume.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-white flex items-center justify-between border-t border-[#E0EBE5]">
                <span className="text-xs uppercase tracking-[0.16em] font-semibold text-[#0F5A3B] group-hover:text-[#0A3D27] flex items-center gap-2">
                  <span>Explore Women's Solutions</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="text-[11px] text-[#0F5A3B] font-medium bg-[#E8F3EE] px-2.5 py-1 rounded-full">
                  100% Private Suites
                </span>
              </div>
            </Link>
          </div>

        </div>
      </section>

      {/* ─── SIGNATURE SERVICES ────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="space-y-3 max-w-2xl">
              <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#0F5A3B]">
                Signature Rituals
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#142820] leading-tight">
                Precision Hair Restoration & <br />
                <span className="italic font-normal text-[#0F5A3B]">Aesthetic Care</span>
              </h2>
              <p className="text-sm text-[#556B61] font-light leading-relaxed">
                Meticulously designed solutions for men and women experiencing hair thinning, receding hairlines, or seeking custom hair patch systems.
              </p>
            </div>
            
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-semibold text-[#0F5A3B] hover:text-[#0A3D27] pb-1 border-b border-[#0F5A3B]/30 hover:border-[#0F5A3B] transition-all self-start md:self-end"
            >
              <span>View All Services</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(services.length > 0 ? services : FALLBACK_SERVICES).map((srv) => (
              <div
                key={srv.id}
                className="group bg-[#FAFDFB] rounded-3xl p-6 border border-[#E0EBE5] hover:border-[#0F5A3B] hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Service Image */}
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-[#E8F3EE] relative">
                    <img
                      src={srv.image_url || "/assets/slider/slide2.jpeg"}
                      alt={srv.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/assets/slider/slide1.jpeg";
                      }}
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#0F5A3B] text-[9px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border border-[#D5E4DD]">
                      {srv.category || "Hair System"}
                    </div>
                  </div>

                  <h3 className="font-serif text-xl font-medium text-[#142820] mb-2.5 group-hover:text-[#0F5A3B] transition-colors">
                    {srv.name}
                  </h3>

                  <p className="text-xs text-[#556B61] font-light leading-relaxed mb-6 line-clamp-3">
                    {srv.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E0EBE5] flex items-center justify-between">
                  <span className="text-[11px] text-[#556B61] flex items-center gap-1">
                    <Clock size={12} className="text-[#0F5A3B]" />
                    {srv.duration || "Bespoke Timing"}
                  </span>

                  <Link
                    to="/book"
                    state={{ service: srv }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F5A3B] hover:text-[#0A3D27] uppercase tracking-wider group-hover:translate-x-0.5 transition-all"
                  >
                    <span>Book</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── DIAGNOSTICS BANNER (SOLID GREEN) ─────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 my-8 md:my-16">
        <div className="bg-[#0F5A3B] text-white rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-xl">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-black/10 rounded-full blur-2xl pointer-events-none" />

          <div className="grid lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* Left Description */}
            <div className="lg:col-span-7 space-y-5">
              <span className="inline-block px-3.5 py-1 rounded-full bg-white/15 text-[#D1EADB] text-[10px] uppercase tracking-[0.25em] font-semibold">
                Online Consultation · 2 Minutes
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light leading-tight">
                Not Sure Which Hair Solution <br />
                <span className="italic font-normal text-[#D1EADB]">Fits Your Lifestyle?</span>
              </h2>

              <p className="text-white/80 text-sm sm:text-base font-light leading-relaxed max-w-xl">
                Answer 4 simple questions about your hair density, crown area, and daily activity. Our diagnostic tool calculates the recommended base material, density percentage, and maintenance schedule.
              </p>

              <div className="pt-2">
                <Link
                  to="/consultancy"
                  className="inline-flex items-center gap-3 bg-white text-[#0F5A3B] hover:bg-[#F0F7F4] px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-md group"
                >
                  <span>Start Diagnostics Quiz</span>
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Steps Card */}
            <div className="lg:col-span-5 bg-white/10 rounded-2xl p-6 sm:p-8 border border-white/15 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-white text-[#0F5A3B] font-bold text-xs flex items-center justify-center shrink-0">
                  01
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Identify Thinning Area</h4>
                  <p className="text-xs text-white/70 font-light mt-0.5">Select frontal receding, crown vertex, or full thinning.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-white text-[#0F5A3B] font-bold text-xs flex items-center justify-center shrink-0">
                  02
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Match Lifestyle & Base</h4>
                  <p className="text-xs text-white/70 font-light mt-0.5">Gym, swimming, or professional wear matched with lace or poly skin.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-white text-[#0F5A3B] font-bold text-xs flex items-center justify-center shrink-0">
                  03
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Instant Consultation Plan</h4>
                  <p className="text-xs text-white/70 font-light mt-0.5">Receive your customized hair solution and book an in-studio trial.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── BEFORE / AFTER TRANSFORMATION ────────────────────────────────────── */}
      <BeforeAfterSlider
        before="/assets/new_before.jpeg"
        after="/assets/new_after.jpeg"
      />

      {/* ─── MASTER SPECIALISTS ────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 bg-[#FAFDFB] border-t border-[#E0EBE5]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#0F5A3B]">
              The Craft Masters
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#142820]">
              Meet Our Specialists
            </h2>
            <div className="w-12 h-px bg-[#0F5A3B] mx-auto mt-4" />
            <p className="text-sm text-[#556B61] font-light leading-relaxed pt-2">
              Certified hair restoration technicians and stylists dedicated to crafting natural, seamless confidence with complete privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(stylists.length > 0 ? stylists : FALLBACK_STYLISTS).map((st) => (
              <div
                key={st.id}
                className="bg-white rounded-3xl p-6 border border-[#E0EBE5] hover:border-[#0F5A3B] transition-all duration-300 text-center flex flex-col items-center group"
              >
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden mb-6 border-2 border-[#D8E6DF] p-1 bg-[#FAFDFB]">
                  <img
                    src={st.image_url || "/assets/professional_hairstylist_working_202604251521.jpeg"}
                    alt={st.name}
                    className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600";
                    }}
                  />
                </div>

                <h3 className="font-serif text-xl font-medium text-[#142820] mb-1">
                  {st.name}
                </h3>
                <p className="text-[11px] uppercase tracking-wider text-[#0F5A3B] font-semibold mb-3">
                  {st.role}
                </p>
                <p className="text-xs text-[#556B61] font-light leading-relaxed max-w-xs mb-6">
                  {st.bio}
                </p>

                <Link
                  to="/book"
                  className="mt-auto inline-flex items-center gap-2 text-xs font-semibold text-[#0F5A3B] hover:text-[#0A3D27] uppercase tracking-wider pt-2 border-t border-[#E0EBE5] w-full justify-center"
                >
                  <span>Book with {st.name.split(" ")[0]}</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── CLIENT EXPERIENCES (TESTIMONIALS) ─────────────────────────────────── */}
      <section className="py-24 md:py-32 bg-white border-t border-[#E0EBE5]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#0F5A3B]">
              Real Client Stories
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#142820]">
              Confidence Restored
            </h2>
            <div className="w-12 h-px bg-[#0F5A3B] mx-auto mt-4" />
            <p className="text-sm text-[#556B61] font-light leading-relaxed pt-2">
              Hear directly from clients who visited our Sama-Savli and Sevasi studios in Vadodara.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((rev, idx) => (
              <div
                key={idx}
                className="bg-[#FAFDFB] p-8 rounded-3xl border border-[#E0EBE5] flex flex-col justify-between hover:shadow-sm transition-shadow"
              >
                <div>
                  <div className="flex gap-1 mb-4 text-[#0F5A3B]">
                    {[...Array(rev.stars)].map((_, i) => (
                      <Star key={i} size={15} className="fill-[#0F5A3B]" />
                    ))}
                  </div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-[#0F5A3B] mb-3">
                    {rev.treatment}
                  </p>
                  <p className="text-[#142820] text-sm font-light italic leading-relaxed mb-6">
                    "{rev.quote}"
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E0EBE5] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#142820] uppercase tracking-wider">{rev.name}</h4>
                    <p className="text-[10px] text-[#556B61] mt-0.5">{rev.location}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] text-[#0F5A3B] font-medium bg-[#E8F3EE] px-2.5 py-1 rounded-full border border-[#D5E4DD]">
                    <Check size={11} /> Verified
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── VADODARA STUDIOS (SAMA-SAVLI & SEVASI) ───────────────────────────── */}
      <section className="py-20 bg-[#F6FAF8] border-t border-[#E0EBE5]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#0F5A3B]">
              Our Locations
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#142820]">
              Two Studios in Vadodara
            </h2>
            <div className="w-12 h-px bg-[#0F5A3B] mx-auto mt-4" />
            <p className="text-sm text-[#556B61] font-light leading-relaxed pt-2">
              Visit us at our flagship Sama-Savli studio or our Sevasi center for private consultations and expert maintenance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {BRANCHES.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-3xl border border-[#D8E6DF] p-8 sm:p-10 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#0F5A3B] bg-[#E8F3EE] px-3 py-1 rounded-full border border-[#D5E4DD]">
                      {b.tag}
                    </span>
                    <Building2 size={18} className="text-[#0F5A3B]" />
                  </div>

                  <h3 className="font-serif text-2xl font-medium text-[#142820]">
                    {b.name}
                  </h3>

                  <div className="space-y-3 text-sm text-[#556B61] font-light pt-2">
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-[#0F5A3B] shrink-0 mt-1" />
                      <span>{b.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-[#0F5A3B] shrink-0" />
                      <a href={`tel:${b.phone.replace(/\s/g, "")}`} className="hover:text-[#0F5A3B] font-medium transition-colors">
                        {b.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock size={16} className="text-[#0F5A3B] shrink-0" />
                      <span>{b.hours}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t border-[#E0EBE5]">
                    {b.features.map((feat, i) => (
                      <span key={i} className="text-[10px] font-medium text-[#556B61] bg-[#FAFDFB] border border-[#E0EBE5] px-2.5 py-1 rounded-full">
                        ✓ {feat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-8 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/book"
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-[#0F5A3B] hover:bg-[#0A3D27] text-white px-5 py-3 rounded-full font-medium text-xs uppercase tracking-wider transition-colors shadow-sm text-center"
                  >
                    <Calendar size={14} />
                    <span>Book at {b.name.split(" ")[0]}</span>
                  </Link>

                  <a
                    href="https://wa.me/917779055771?text=Hello%20Jainil%20Hair%20Studio,%20I%20would%20like%20to%20inquire%20about%20an%20appointment."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 border border-[#0F5A3B] text-[#0F5A3B] hover:bg-[#E8F3EE] px-5 py-3 rounded-full font-medium text-xs uppercase tracking-wider transition-colors text-center"
                  >
                    <MessageCircle size={14} />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
}
