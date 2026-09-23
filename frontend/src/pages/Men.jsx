import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Shield, 
  Zap, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Calendar, 
  Phone, 
  Check, 
  Award,
  Layers,
  ChevronRight,
  Droplets,
  Wind,
  Cpu,
  Activity
} from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";

export default function Men() {
  const { t } = useLang();
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    { 
      title: "100% Virgin Human Hair", 
      sub: "Ethically sourced natural hair perfectly calibrated to match your natural density, texture, and wave pattern.", 
      icon: Award 
    },
    { 
      title: "Undetectable Swiss Lace", 
      sub: "Ultra-thin, breathable base mapped directly to your scalp contour for invisible front hairlines even up close.", 
      icon: Layers 
    },
    { 
      title: "Active Lifestyle Resilient", 
      sub: "Engineered with medical-grade adhesives so you can swim, gym, sweat, and shower with complete confidence.", 
      icon: Zap 
    },
    { 
      title: "Confidential 1-on-1 Suites", 
      sub: "Private executive styling cabins in both Sama-Savli and Sevasi branches ensuring 100% discretion.", 
      icon: Shield 
    },
  ];

  const systems = [
    {
      title: "French Lace System",
      sub: "The most breathable and natural-looking base, perfectly suited for warm climates and active gym routines.",
      img: "/assets/slider/slide4.jpeg",
      tag: "Best for Breathability",
      life: "3-5 Months",
      price: "On Consultation"
    },
    {
      title: "Silk Top Skin Base",
      sub: "Multi-directional scalp illusion where hair appears to grow straight out of your skin with zero visible knots.",
      img: "/assets/slider/slide2.jpeg",
      tag: "Undetectable Parting",
      life: "4-6 Months",
      price: "On Consultation"
    },
    {
      title: "Hybrid Monofilament",
      sub: "Reinforced monofilament center with featherlight lace perimeter for long-lasting durability and easy home care.",
      img: "/assets/slider/slide1.jpeg",
      tag: "Maximum Durability",
      life: "6-9 Months",
      price: "On Consultation"
    },
  ];

  const engineeringHighlights = [
    {
      icon: Wind,
      title: "Micro-Porous Ventilation",
      desc: "Honeycomb Swiss lace weave allows maximum air and moisture transfer, preventing heat buildup during high activity."
    },
    {
      icon: Droplets,
      title: "Hydrophobic Poly Adhesion",
      desc: "Medical-grade hypoallergenic polymers repel water, sweat, and sebum, ensuring strong 4-week bonding hold."
    },
    {
      icon: Cpu,
      title: "Single-Knot Hairline Blending",
      desc: "Micro hand-tied single knots along the frontal rim create a gradual density transition identical to natural hair growth."
    },
    {
      icon: Activity,
      title: "Active Movement Calibration",
      desc: "Featherlight base adapts dynamically to scalp movement, facial expressions, and high-intensity workouts."
    }
  ];

  const faqs = [
    {
      q: "Can I shower, swim, or hit the gym with a hair system?",
      a: "Yes, absolutely. We use medical-grade, dermatologically tested bonding adhesives and waterproof tapes that resist intense sweating, swimming pool chlorine, and daily hot showers."
    },
    {
      q: "How long does a men's hair patch system last?",
      a: "Depending on your chosen base material and routine care, a premium virgin hair system lasts between 4 to 9 months. With regular monthly hygiene re-bonding, it stays soft and vibrant."
    },
    {
      q: "Will anyone be able to tell that I'm wearing a hair patch?",
      a: "No. We hand-knot each hair with graduated density along the front hairline, simulating natural growth. The featherlight lace base melts seamlessly onto your scalp skin."
    },
    {
      q: "How often do I need servicing or re-bonding?",
      a: "We recommend a quick 45-minute service every 3 to 4 weeks. Our technicians deep-cleanse your scalp, detox the base, replace tapes, and give you a fresh precision blend."
    },
    {
      q: "What makes Jainil Hair Studio different from ordinary wig shops?",
      a: "We are an artisanal restoration studio, not a generic wig seller. We offer 100% private 1-on-1 suites in Vadodara, custom scalp mapping, medical adhesives, and bespoke haircuts tailored to your facial symmetry."
    }
  ];

  return (
    <div className="bg-[#FAFDFB] text-[#142820] font-sans antialiased selection:bg-[#0F5A3B] selection:text-white">
      
      {/* ─── HERO SECTION ──────────────────────────────────────────────────────── */}
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-14 md:pb-20 overflow-hidden border-b border-[#E0EBE5]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8F3EE] border border-[#D5E4DD] text-[#0F5A3B] text-[11px] font-semibold uppercase tracking-[0.2em]">
                <Sparkles size={13} className="text-[#0F5A3B]" />
                <span>Men's Non-Surgical Hair Restoration · Vadodara</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light text-[#142820] leading-[1.12]">
                Undetectable Hair Systems, <br />
                <span className="italic font-normal text-[#0F5A3B]">Engineered for Modern Men.</span>
              </h1>

              <p className="text-[#556B61] text-base sm:text-lg font-light leading-relaxed max-w-xl">
                Restore a full head of natural hair in a single 90-minute session. 100% virgin human hair, custom breathable Swiss lace bases, and private consultation suites at Sama-Savli & Sevasi.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-3">
                <Link
                  to="/book"
                  className="inline-flex items-center justify-center gap-2.5 bg-[#0F5A3B] hover:bg-[#0A3D27] text-white px-8 py-4 rounded-full font-medium text-xs uppercase tracking-[0.18em] transition-all duration-300 shadow-sm hover:shadow-md group"
                >
                  <Calendar size={14} />
                  <span>Book Confidential Trial</span>
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/consultancy"
                  className="inline-flex items-center justify-center gap-2 border border-[#0F5A3B] text-[#0F5A3B] hover:bg-[#E8F3EE] px-8 py-4 rounded-full font-medium text-xs uppercase tracking-[0.18em] transition-all duration-300"
                >
                  <span>Take Scalp Quiz</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-[#E0EBE5] flex flex-wrap items-center gap-6 text-xs text-[#556B61]">
                <span className="flex items-center gap-1.5 text-[#0F5A3B] font-semibold">
                  <Shield size={14} />
                  <span>100% Private Executive Suites</span>
                </span>
                <span className="text-[#D5E4DD]">•</span>
                <span>Active Gym & Swim Safe</span>
                <span className="text-[#D5E4DD]">•</span>
                <span>Zero Surgery or Downtime</span>
              </div>
            </div>

            {/* Right Hero Image (AI-Generated Editorial Model) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-[#D5E4DD] shadow-xl bg-white aspect-[4/5] max-w-md mx-auto lg:max-w-none">
                <img
                  src="/assets/men_ai_hero.jpg"
                  alt="Men's Hair Restoration"
                  className="w-full h-full object-cover"
                />
                
                {/* Floating Studio Info Badge */}
                <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-[#E0EBE5] shadow-lg flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F3EE] text-[#0F5A3B] flex items-center justify-center shrink-0">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#142820]">
                      Natural Hairline Integration
                    </p>
                    <p className="text-[11px] text-[#556B61] font-light">
                      Sama-Savli & Sevasi Studios · Vadodara
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── WHY CHOOSE JAINIL SYSTEMS ────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-[#F6FAF8] border-b border-[#E0EBE5]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#0F5A3B]">
              The Jainil Distinction
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#142820]">
              Why Men Choose Our Systems
            </h2>
            <div className="w-12 h-px bg-[#0F5A3B] mx-auto mt-4" />
            <p className="text-sm text-[#556B61] font-light leading-relaxed pt-2">
              We replace baldness and thinning with effortless confidence. No surgery, zero downtime, and complete natural freedom.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div 
                key={i} 
                className="bg-white rounded-3xl p-8 border border-[#E0EBE5] hover:border-[#0F5A3B] hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#E8F3EE] text-[#0F5A3B] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                    <f.icon size={22} />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-[#142820] mb-3">
                    {f.title}
                  </h3>
                  <p className="text-xs text-[#556B61] font-light leading-relaxed">
                    {f.sub}
                  </p>
                </div>
                <div className="pt-6 border-t border-[#F0F5F2] mt-6 flex items-center gap-1.5 text-[11px] text-[#0F5A3B] font-semibold">
                  <Check size={13} />
                  <span>Guaranteed Standards</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── AI SIMULATION VIDEO & ENGINEERING ARCHITECTURE ───────────────────── */}
      <section className="py-20 md:py-28 bg-white border-b border-[#E0EBE5]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left AI Video Showcase */}
            <div className="lg:col-span-6">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#D8E6DF] bg-black aspect-[16/10]">
                <video
                  src="/assets/A_highly_realistic_202604251840.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none p-6 sm:p-8 flex flex-col justify-end">
                  <span className="text-[10px] uppercase tracking-widest text-[#52D19D] font-bold mb-1">
                    AI Micro-Structure Simulation
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl text-white font-light">
                    Breathable Base & Follicle Architecture
                  </h3>
                </div>
              </div>
            </div>

            {/* Right Engineering Pillars */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-3">
                <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#0F5A3B]">
                  Advanced Engineering
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#142820]">
                  How Natural Hairline Integration Works
                </h2>
                <p className="text-sm text-[#556B61] font-light leading-relaxed">
                  Every hair system base is crafted with microscopic precision. Our French lace and skin polymers replicate the exact light reflectivity and porosity of real human scalp tissue.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                {engineeringHighlights.map((eh, idx) => (
                  <div key={idx} className="bg-[#FAFDFB] p-5 rounded-2xl border border-[#E0EBE5] space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-[#E8F3EE] text-[#0F5A3B] flex items-center justify-center">
                      <eh.icon size={18} />
                    </div>
                    <h4 className="font-serif text-base font-medium text-[#142820]">{eh.title}</h4>
                    <p className="text-xs text-[#556B61] font-light leading-relaxed">{eh.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── BEFORE / AFTER SLIDER (AI-GENERATED ASSETS) ──────────────────────── */}
      <BeforeAfterSlider />

      {/* ─── OUR HAIR SYSTEM BASES ─────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-[#FAFDFB] border-t border-[#E0EBE5]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#0F5A3B]">
              Custom Base Architecture
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#142820]">
              Engineered Base Types
            </h2>
            <div className="w-12 h-px bg-[#0F5A3B] mx-auto mt-4" />
            <p className="text-sm text-[#556B61] font-light leading-relaxed pt-2">
              Every scalp is unique. During your consultation, we examine your scalp sebum, sweat activity, and hairline structure to select the exact base.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {systems.map((item, i) => (
              <div 
                key={i} 
                className="bg-white rounded-3xl overflow-hidden border border-[#E0EBE5] hover:border-[#0F5A3B] hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="aspect-[4/3] overflow-hidden relative bg-[#E8F3EE]">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[#0F5A3B] text-[9px] uppercase tracking-wider font-bold px-3 py-1 rounded-full border border-[#D5E4DD]">
                      {item.tag}
                    </div>
                  </div>

                  <div className="p-7 space-y-3">
                    <h3 className="font-serif text-2xl font-medium text-[#142820] group-hover:text-[#0F5A3B] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#556B61] font-light leading-relaxed">
                      {item.sub}
                    </p>

                    <div className="pt-4 border-t border-[#F0F5F2] flex items-center justify-between text-xs text-[#556B61]">
                      <span className="flex items-center gap-1.5">
                        <Clock size={13} className="text-[#0F5A3B]" />
                        <span>Lifespan: {item.life}</span>
                      </span>
                      <span className="font-semibold text-[#0F5A3B] text-[11px] uppercase tracking-wider bg-[#E8F3EE] px-2.5 py-0.5 rounded-full border border-[#D5E4DD]">
                        On Consultation
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-7 pt-0">
                  <Link
                    to="/book"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#FAFDFB] hover:bg-[#0F5A3B] text-[#0F5A3B] hover:text-white border border-[#0F5A3B]/30 hover:border-[#0F5A3B] py-3 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300"
                  >
                    <span>Book Trial Session</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── THE 4-STEP TRANSFORMATION JOURNEY ─────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-[#F6FAF8] border-t border-[#E0EBE5]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#0F5A3B]">
              Seamless Experience
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#142820]">
              The 4-Step Transformation
            </h2>
            <div className="w-12 h-px bg-[#0F5A3B] mx-auto mt-4" />
            <p className="text-sm text-[#556B61] font-light leading-relaxed pt-2">
              From your private consultation to walking out with a restored hairline in 90 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                title: "Scalp Analysis",
                desc: "We analyze your hair density, crown pattern, and lifestyle in a private 1-on-1 suite."
              },
              {
                step: 2,
                title: "Custom Base Mapping",
                desc: "Precise measurements and base contouring to match your exact head curve and natural hair angle."
              },
              {
                step: 3,
                title: "Artisanal Blending",
                desc: "Our master stylist cuts and contours the hair system to blend undetectably with your existing hair."
              },
              {
                step: 4,
                title: "Aftercare Guidance",
                desc: "Walk out with full confidence. We provide home-care tips and easy monthly maintenance schedules."
              }
            ].map((st) => (
              <div key={st.step} className="bg-white rounded-3xl p-6 border border-[#E0EBE5] flex flex-col justify-between group">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-[#0F5A3B] text-white flex items-center justify-center font-serif text-base font-bold mb-6 shadow-sm">
                    0{st.step}
                  </div>

                  <h3 className="font-serif text-xl font-medium text-[#142820] mb-2">
                    {st.title}
                  </h3>
                  <p className="text-xs text-[#556B61] font-light leading-relaxed">
                    {st.desc}
                  </p>
                </div>
                <div className="pt-6 border-t border-[#F0F5F2] mt-6 text-[10px] uppercase tracking-wider text-[#0F5A3B] font-semibold">
                  Step 0{st.step} of 04
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── KNOWLEDGE BASE & FREQUENTLY ASKED QUESTIONS ───────────────────────── */}
      <section className="py-20 md:py-28 bg-white border-t border-[#E0EBE5]">
        <div className="max-w-[900px] mx-auto px-6 lg:px-12">
          
          <div className="text-center mb-16 space-y-3">
            <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#0F5A3B]">
              Transparency & Care
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#142820]">
              Frequently Asked Questions
            </h2>
            <div className="w-12 h-px bg-[#0F5A3B] mx-auto mt-4" />
            <p className="text-sm text-[#556B61] font-light leading-relaxed pt-2">
              Everything you need to know about our non-surgical hair systems and maintenance in Vadodara.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-[#FAFDFB] rounded-2xl border border-[#E0EBE5] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full text-left px-6 py-4 sm:py-5 flex items-center justify-between gap-4 font-serif text-base sm:text-lg text-[#142820] hover:text-[#0F5A3B]"
                >
                  <span>{faq.q}</span>
                  <span className={`w-7 h-7 rounded-full bg-[#E8F3EE] text-[#0F5A3B] flex items-center justify-center text-sm font-bold shrink-0 transition-transform ${activeFaq === idx ? "rotate-45" : ""}`}>
                    +
                  </span>
                </button>
                {activeFaq === idx && (
                  <div className="px-6 pb-6 text-xs sm:text-sm text-[#556B61] font-light leading-relaxed border-t border-[#F0F5F2] pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── FINAL CTA BANNER ─────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-[#0F5A3B] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 text-center relative z-10 space-y-6">
          <span className="inline-block px-3.5 py-1 rounded-full bg-white/15 text-[#D1EADB] text-[10px] uppercase tracking-[0.25em] font-semibold">
            Confidential Consultation · 100% Private Suites
          </span>

          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light leading-tight">
            Ready to Regain Your Hair & <br className="hidden sm:block" />
            <span className="italic font-normal text-[#D1EADB]">Unstoppable Confidence?</span>
          </h2>

          <p className="text-white/80 max-w-xl mx-auto text-sm sm:text-base font-light leading-relaxed">
            Visit our Vadodara studio at Sama-Savli Road or Sevasi. Experience an undetectable hair system trial with zero obligation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/book"
              className="inline-flex items-center gap-3 bg-white text-[#0F5A3B] hover:bg-[#F0F7F4] px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-lg group"
            >
              <Calendar size={15} />
              <span>Book Appointment</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="https://wa.me/917779055771?text=Hello%20Jainil%20Hair%20Studio,%20I%20would%20like%20to%20inquire%20about%20men's%20hair%20systems."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-white/40 text-white hover:bg-white/10 px-8 py-4 rounded-full font-medium text-xs uppercase tracking-widest transition-colors"
            >
              <Phone size={14} />
              <span>WhatsApp Inquiries</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
