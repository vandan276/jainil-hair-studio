import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getMediaUrl } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import { 
  ChevronRight, 
  Calendar, 
  Truck, 
  MessageSquare, 
  Star, 
  Quote, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";

const HERO_SLIDES = [
  "/assets/slider/slide1.jpeg",
  "/assets/slider/slide2.jpeg",
  "/assets/slider/slide4.jpeg",
  "/assets/slider/slide5.jpeg",
  "/assets/slider/slide6.jpeg",
];

export default function Landing() {
  const { t } = useLang();
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeGender, setActiveGender] = useState("Women");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    api.get("/products").then((r) => setProducts(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    api.get("/services").then((r) => setServices(Array.isArray(r.data) ? r.data.slice(0, 4) : [])).catch(() => {});
    api.get("/stylists").then((r) => setStylists(Array.isArray(r.data) ? r.data.slice(0, 3) : [])).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div data-testid="landing-page" className="overflow-hidden bg-[#FAFCFA]">
      {/* HERO SECTION — JAINIL HAIR STUDIO FLAGSHIP */}
      <section className="relative min-h-screen pt-32 pb-20 md:py-40 flex flex-col justify-between overflow-hidden bg-[#FAFCFA] border-b border-[#D8E6DF]">
        {/* Background Image Carousel with soft gradient overlay */}
        <div className="absolute right-0 top-0 w-full lg:w-3/5 h-full opacity-35 lg:opacity-85 overflow-hidden z-0">
          {HERO_SLIDES.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Slide ${idx + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                idx === currentSlide ? "opacity-100 scale-105" : "opacity-0 scale-100"
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAFCFA] via-[#FAFCFA]/60 to-transparent" />
        </div>

        {/* Hero Left Content */}
        <div className="relative z-10 max-w-[1500px] mx-auto px-6 lg:px-12 w-full my-auto space-y-8">
          <div className="space-y-4 max-w-4xl">
            <div className="mb-2">
              <img
                src="/assets/Logo/Jainil Studio.svg"
                alt="Jainil Hair Studio Logo"
                className="h-16 sm:h-20 md:h-24 w-auto object-contain drop-shadow-sm"
              />
            </div>
            
            <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.4em] font-bold text-[#0F5A3B]">
              <span className="w-8 h-[2px] bg-[#0F5A3B]" />
              <span>Vadodara Flagship Studio</span>
            </div>

            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-black tracking-tight leading-[0.9] text-[#1A2E26] uppercase">
              Jainil Hair<br />
              <span className="italic font-light text-[#0F5A3B] lowercase tracking-normal font-serif">
                Studio
              </span>
            </h1>

            <p className="text-[#4D665A] text-base md:text-xl font-normal max-w-xl leading-relaxed pt-2">
              The art of non-surgical hair restoration, custom human hair systems, and luxury color styling rituals in Vadodara.
            </p>
          </div>

          <div className="pt-6 flex flex-wrap items-center gap-6">
            <Link
              to="/book"
              className="inline-flex items-center gap-4 text-xs uppercase tracking-[0.25em] font-bold text-white bg-[#0F5A3B] hover:bg-[#167C52] px-8 py-4 rounded-xl shadow-lg transition-all"
              data-testid="hero-book-btn"
            >
              <span>Book Appointment</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.25em] font-bold text-[#0F5A3B] border-b-2 border-[#0F5A3B] pb-1 hover:text-[#167C52] hover:border-[#167C52] transition-all"
              data-testid="hero-services-btn"
            >
              <span>Explore Services</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Carousel indicators & location badge */}
        <div className="relative z-10 max-w-[1500px] mx-auto px-6 lg:px-12 w-full pt-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-mono text-[#4D665A]">
          <div className="flex items-center gap-4">
            <span className="font-bold text-[#0F5A3B]">01 / 05</span>
            <div className="flex gap-2">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentSlide ? "bg-[#0F5A3B] w-8" : "bg-[#D8E6DF] w-2"
                  }`}
                />
              ))}
            </div>
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] font-sans font-semibold text-[#0F5A3B]">
            Sama Savli Road · Vadodara
          </span>
        </div>
      </section>

      {/* ANNOUNCEMENT STRIP */}
      <section className="py-4 border-b border-[#D8E6DF] overflow-hidden bg-[#0F5A3B]">
        <div className="announcement-track text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-[#E8F5E9] font-bold">
          {Array.from({ length: 8 }).map((_, s) => (
            <span key={s} className="px-8 whitespace-nowrap">
              Jainil Hair Studio · Non-Surgical Hair Restoration & Salon · Vadodara
            </span>
          ))}
        </div>
      </section>

      {/* 01 — SIGNATURE SERVICES */}
      <section className="py-24 md:py-36 bg-[#FAFCFA] border-b border-[#D8E6DF]">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 pb-8 border-b border-[#D8E6DF]">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-[0.4em] font-mono font-bold text-[#0F5A3B]">
                01 — SERVICES
              </span>
              <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#1A2E26]">
                Signature Rituals
              </h2>
            </div>
            <div className="max-w-md space-y-4">
              <p className="text-[#4D665A] text-sm leading-relaxed font-light">
                Explore our selection of premier haircuts, custom coloring rituals, non-surgical bonding, and professional hair systems.
              </p>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-bold text-[#0F5A3B] border-b border-[#0F5A3B] pb-1 hover:gap-4 transition-all"
                data-testid="view-services-link"
              >
                <span>View Full Menu</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.length > 0 ? (
              services.map((service) => (
                <div
                  key={service.id}
                  className="group flex flex-col justify-between space-y-6 pb-6 border-b border-[#D8E6DF] sheen-hover"
                  data-testid={`service-${service.id}`}
                >
                  <div className="space-y-5">
                    <div className="mirror-frame-arch">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-t-[130px] rounded-b-xl bg-[#F0F7F4]">
                        {service.image_url ? (
                          <img
                            src={service.image_url}
                            alt={service.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center italic text-xs text-[#4D665A]">
                            Service Image
                          </div>
                        )}
                        <span className="absolute top-3 left-3 bg-white/95 text-[#0F5A3B] px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold border border-[#D8E6DF]">
                          {service.category || "Ritual"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-display text-2xl text-[#1A2E26] font-bold group-hover:text-[#0F5A3B] transition-colors">
                          {service.name}
                        </h3>
                      </div>
                      <p className="text-xs text-[#4D665A] font-light line-clamp-2 leading-relaxed">
                        {service.description || "Masterfully tailored styling and restoration ritual for effortless elegance."}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-end">
                    <Link
                      to="/book"
                      state={{ service }}
                      className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A2E26] group-hover:text-[#0F5A3B] transition-colors"
                      data-testid={`book-service-${service.id}`}
                    >
                      <span>Book Session</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              [
                { title: "Hair Replacement Systems", desc: "100% natural, undetectable custom hair patch systems fitted with precision.", tag: "Restoration" },
                { title: "Precision Hair Styling", desc: "Bespoke styling and structural haircuts crafted to highlight your facial features.", tag: "Styling" },
                { title: "Keratin & Scalp Therapy", desc: "Revitalizing botanical scalp therapies and deep keratin nourishing treatments.", tag: "Care" },
                { title: "Bridal & Event Rituals", desc: "Flawless hair transformations designed for grand weddings and celebrations.", tag: "Events" }
              ].map((item, idx) => (
                <div key={idx} className="group flex flex-col justify-between space-y-6 pb-6 border-b border-[#D8E6DF]">
                  <div className="space-y-5">
                    <div className="aspect-[4/3] overflow-hidden rounded-t-[130px] rounded-b-xl bg-[#F0F7F4] flex items-center justify-center p-6 text-center">
                      <p className="font-serif text-[#0F5A3B] font-bold text-lg">{item.title}</p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-display text-2xl text-[#1A2E26] font-bold">{item.title}</h3>
                      <p className="text-xs text-[#4D665A] font-light leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center justify-end">
                    <Link to="/book" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-[#0F5A3B]">
                      <span>Book Session</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 02 — VIRTUAL DIAGNOSTICS */}
      <section className="py-24 md:py-36 bg-[#F0F7F4] text-[#1A2E26] border-b border-[#D8E6DF] overflow-hidden">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8">
              <span className="text-xs uppercase tracking-[0.4em] font-mono font-bold text-[#0F5A3B]">
                02 — DIAGNOSTICS
              </span>
              <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[0.95] text-[#1A2E26]">
                Virtual Scalp & Hair<br />
                <span className="italic font-light text-[#0F5A3B] font-serif">Consultation</span>
              </h2>
              <p className="text-[#4D665A] text-base md:text-lg font-light leading-relaxed max-w-xl">
                Take our quick, interactive hair diagnostic quiz. Tell us about your hair density, scalp concerns, and styling goals for custom recommendations.
              </p>
              <div className="pt-2">
                <Link
                  to="/consultancy"
                  className="inline-flex items-center gap-4 text-xs uppercase tracking-[0.25em] font-bold text-white bg-[#0F5A3B] hover:bg-[#167C52] px-8 py-4 rounded-xl shadow-md transition-all"
                  data-testid="start-consultation-btn"
                >
                  <span>Start Diagnostics Quiz</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-6">
              <div className="mirror-frame-arch">
                <div className="aspect-[3/4] rounded-t-[130px] rounded-b-xl overflow-hidden bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80"
                    alt="Hair consultation detail"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="mirror-frame-arch mt-10">
                <div className="aspect-[3/4] rounded-t-[130px] rounded-b-xl overflow-hidden bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80"
                    alt="Salon styling"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER SLIDER */}
      <BeforeAfterSlider
        before="https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&q=80"
        after="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80"
      />

      {/* 03 — MASTER STYLISTS */}
      <section className="py-24 md:py-36 bg-[#FAFCFA] border-b border-[#D8E6DF]">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 pb-8 border-b border-[#D8E6DF]">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-[0.4em] font-mono font-bold text-[#0F5A3B]">
                03 — HAIR ARTISANS
              </span>
              <h2 className="font-display text-4xl md:text-6xl font-bold text-[#1A2E26]">
                Our Master Stylists
              </h2>
            </div>
            <p className="text-[#4D665A] max-w-md text-sm leading-relaxed font-light">
              Trained globally, based in Vadodara. Dedicated to crafting your bespoke hair experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stylists.length > 0 ? (
              stylists.map((s) => (
                <div
                  key={s.id}
                  className="bg-white p-6 rounded-3xl border border-[#D8E6DF] shadow-sm flex flex-col group hover:shadow-md transition-all duration-500"
                >
                  <div className="mirror-frame-arch mb-6">
                    <div className="aspect-[3/4] overflow-hidden rounded-t-[130px] rounded-b-xl bg-[#F0F7F4]">
                      <img
                        src={s.image_url}
                        alt={s.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                  <h3 className="font-display text-2xl text-[#1A2E26] font-bold mb-1">{s.name}</h3>
                  <span className="text-[10px] uppercase tracking-widest text-[#0F5A3B] font-bold mb-4 block">
                    {s.role}
                  </span>
                  <p className="text-xs text-[#4D665A] leading-relaxed font-light mb-6 flex-grow">{s.bio}</p>
                </div>
              ))
            ) : (
              [
                { name: "Jainil Panchal", role: "Master Hair Restoration Specialist", bio: "Over 8+ years specializing in seamless non-surgical hair systems and precision density blending.", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800" },
                { name: "Sneha Patel", role: "Senior Colorist & Stylist", bio: "Artistic director in Balayage, keratin transformations, and luxury bridal styling rituals.", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800" },
                { name: "Rahul Dave", role: "Hair System Technician", bio: "Certified specialist in custom lace base fitting, breathable micro-knotting, and scalp bonding.", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800" }
              ].map((st, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-[#D8E6DF] shadow-sm flex flex-col group hover:shadow-md transition-all duration-500">
                  <div className="aspect-[3/4] overflow-hidden rounded-t-[130px] rounded-b-xl bg-[#F0F7F4] mb-6">
                    <img src={st.img} alt={st.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <h3 className="font-display text-2xl text-[#1A2E26] font-bold mb-1">{st.name}</h3>
                  <span className="text-[10px] uppercase tracking-widest text-[#0F5A3B] font-bold mb-4 block">{st.role}</span>
                  <p className="text-xs text-[#4D665A] leading-relaxed font-light mb-6 flex-grow">{st.bio}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="py-24 border-b border-[#D8E6DF] bg-[#F0F7F4]">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {[
            { icon: Calendar, title: "Easy Booking", sub: "Confirm online in 60 seconds" },
            { icon: Truck, title: "Custom Hair Systems", sub: "Shipped across India with fitting guide" },
            { icon: MessageSquare, title: "WhatsApp Expert Support", sub: "Direct consultation with master stylists" },
            { icon: ShieldCheck, title: "Trusted Since 2019", sub: "8,000+ happy transformations in Gujarat" }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center group">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
                <item.icon size={26} className="text-[#0F5A3B]" />
              </div>
              <h4 className="font-display text-xl text-[#1A2E26] font-bold mb-2">{item.title}</h4>
              <p className="text-sm text-[#4D665A] font-light leading-relaxed max-w-[200px] mx-auto">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 md:py-32 bg-white relative overflow-hidden">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center mb-16">
            <p className="text-[11px] tracking-[0.5em] uppercase text-[#0F5A3B] mb-6 font-semibold">
              Client Experiences
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-[#1A2E26] mb-6">
              What They Say About Jainil
            </h2>
            <div className="w-16 h-px bg-[#0F5A3B] mx-auto" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Aanya R.", loc: "Subhanpura, Vadodara", text: "I walked in with no plan and walked out feeling like the most polished version of myself. The team listens, advises, and delivers.", stars: 5 },
              { name: "Meera K.", loc: "Akota, Vadodara", text: "The hair styling and color results were beyond my expectations. It feels completely natural and the quality is simply unmatched.", stars: 5 },
              { name: "Priya S.", loc: "Alkapuri, Vadodara", text: "Finally a salon that understands premium aesthetics. The ambiance is calming and the service is truly world-class.", stars: 5 }
            ].map((t, idx) => (
              <div key={idx} className="bg-[#F0F7F4] p-8 rounded-3xl border border-[#D8E6DF] shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-6">
                    {Array.from({ length: t.stars }).map((_, s) => (
                      <Star key={s} size={14} className="fill-[#0F5A3B] text-[#0F5A3B]" />
                    ))}
                  </div>
                  <p className="text-[#1A2E26] italic font-light leading-relaxed mb-8">"{t.text}"</p>
                </div>
                <div className="border-t border-[#D8E6DF] pt-6">
                  <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#1A2E26]">{t.name}</p>
                  <p className="text-[10px] uppercase tracking-widest text-[#4D665A] mt-1">{t.loc}, GJ</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
