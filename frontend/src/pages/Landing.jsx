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
    image: "/assets/slider/slide4.jpeg",
    title: "100% Breathable Base",
    desc: "Undetectable hairline blending & featherlight comfort"
  },
  {
    image: "/assets/slider/slide6.jpeg",
    title: "Luxury Vadodara Studio",
    desc: "Private 1-on-1 suites & artisanal styling rituals"
  },
  {
    image: "/assets/slider/slide2.jpeg",
    title: "Virgin Human Hair",
    desc: "Ethically sourced, customized density & texture"
  }
];

export default function Landing() {
  const { t } = useLang();
  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [heroSlide, setHeroSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

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
      {/* ─── HERO SECTION ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 sm:pt-32 md:pt-40 pb-12 md:pb-16 border-b border-[#E0EBE5]">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#EBF5F0]/60 to-transparent pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#E8F3EE]/50 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#E8F3EE] border border-[#D5E4DD] text-[#0F5A3B] text-[11px] font-semibold uppercase tracking-[0.2em]">
                <span className="w-2 h-2 rounded-full bg-[#0F5A3B] animate-pulse" />
                <span>Vadodara · Sama-Savli & Sevasi Studios</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light text-[#142820] leading-[1.1] tracking-tight">
                Natural Hair Systems, <br />
                <span className="font-normal italic text-[#0F5A3B]">Crafted with Precision.</span>
              </h1>

              <p className="text-[#556B61] text-base sm:text-lg font-light leading-relaxed max-w-xl">
                Vadodara’s premier destination for undetectable non-surgical hair restoration across our Sama-Savli and Sevasi branches. Experience 100% natural virgin human hair, custom breathable bases, and private consultation suites.
              </p>

              {/* Minimalist CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                <Link
                  to="/book"
                  className="inline-flex items-center justify-center gap-3 bg-[#0F5A3B] hover:bg-[#0A3D27] text-white px-8 py-4 rounded-full font-medium text-xs uppercase tracking-[0.18em] transition-all duration-300 shadow-sm hover:shadow-md group"
                >
                  <span>Book Consultation</span>
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/services"
                  className="inline-flex items-center justify-center gap-2 border border-[#0F5A3B] text-[#0F5A3B] hover:bg-[#E8F3EE] px-8 py-4 rounded-full font-medium text-xs uppercase tracking-[0.18em] transition-all duration-300"
                >
                  <span>Explore Services</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-[#E0EBE5] flex flex-wrap items-center gap-6 text-xs text-[#556B61]">
                <div className="flex items-center gap-1.5 font-semibold text-[#0F5A3B]">
                  <div className="flex text-[#0F5A3B]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-[#0F5A3B]" />
                    ))}
                  </div>
                  <span>4.9 / 5.0 Rating</span>
                </div>
                <span className="text-[#D5E4DD]">•</span>
                <span>8,000+ Happy Clients</span>
                <span className="text-[#D5E4DD]">•</span>
                <Link to="/consultancy" className="text-[#0F5A3B] font-medium hover:underline inline-flex items-center gap-1">
                  <span>Take Scalp Quiz</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>

            {/* Right Showcase Image Slider */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-[#D5E4DD] shadow-lg bg-[#FAFDFB] aspect-[4/5] max-w-md mx-auto lg:max-w-none">
                {HERO_SLIDES.map((slide, idx) => (
                  <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                      idx === heroSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                    }`}
                  >
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}

                {/* Subtle Dots Indicator */}
                <div className="absolute top-4 right-4 z-20 flex gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                  {HERO_SLIDES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setHeroSlide(i)}
                      aria-label={`Slide ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === heroSlide ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>

                {/* Floating Minimalist Info Pill */}
                <div className="absolute bottom-5 left-5 right-5 z-20 bg-white/95 backdrop-blur-sm p-4 rounded-2xl border border-[#E0EBE5] shadow-sm flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F3EE] text-[#0F5A3B] flex items-center justify-center shrink-0">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#142820] tracking-wide">
                      {HERO_SLIDES[heroSlide].title}
                    </p>
                    <p className="text-[11px] text-[#556B61] font-light">
                      {HERO_SLIDES[heroSlide].desc}
                    </p>
                  </div>
                </div>
              </div>
            </div>

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
