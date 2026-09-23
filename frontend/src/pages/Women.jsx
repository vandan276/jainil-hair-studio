import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Sparkles, 
  ShieldCheck, 
  Heart, 
  ArrowRight, 
  Check, 
  Clock, 
  Calendar, 
  Phone, 
  Lock, 
  Layers, 
  Award, 
  ChevronRight,
  UserCheck,
  Star
} from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";

export default function Women() {
  const { t } = useLang();
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const SOLUTIONS = [
    {
      id: "topper",
      title: "Silk Crown Toppers",
      sub: "Ideal for widening hair partitions, crown thinning, and hormonal hair loss.",
      desc: "Our handcrafted silk-base toppers feature multi-directional parting that looks identical to a natural scalp. Lightweight and secured with tension-free micro-clips that never pull your biological roots.",
      image: "/assets/beautiful_female_model_202604251523.jpeg",
      tag: "Best for Crown Thinning",
      price: "From ₹12,500",
      time: "45 min fitting"
    },
    {
      id: "extensions",
      title: "Seamless Volume Extensions",
      sub: "Instant natural volume, length, and density without root stress.",
      desc: "Premium 100% Virgin Indian Remy hair extensions. Available in seamless clip-in or gentle tape-in methods, hand-blended with your natural hair texture, highlights, or balayage.",
      image: "/assets/make_the_girl_202604251826.jpeg",
      tag: "Instant Density & Length",
      price: "From ₹8,999",
      time: "60 min session"
    },
    {
      id: "hairline",
      title: "Front Lace Hairline Enhancers",
      sub: "Designed for receding temples, high foreheads, and delicate frontal zones.",
      desc: "Featherlight Swiss lace meticulously hand-knotted with baby hairs for an invisible frontal contour. Can be styled pulled back, into ponytails, or swept to the side.",
      image: "/assets/realistic_human_hair_202604251524.jpeg",
      tag: "Undetectable Front",
      price: "From ₹11,999",
      time: "45 min fitting"
    },
    {
      id: "medical",
      title: "Full Cap Medical Systems",
      sub: "Featherlight cranial prosthesis for alopecia or extensive thinning.",
      desc: "Silky, hypoallergenic breathable cap bases engineered specifically for sensitive scalps. Provides 360-degree natural coverage with maximum ventilation and featherlight comfort.",
      image: "/assets/after_indian.png",
      tag: "Complete Coverage",
      price: "From ₹19,999",
      time: "90 min fitting"
    }
  ];

  const PRIVACY_PILLARS = [
    {
      icon: Lock,
      title: "100% Private Styling Suites",
      desc: "Never sit in an open salon floor. Enjoy completely private, soundproof executive suites dedicated solely to your comfort."
    },
    {
      icon: UserCheck,
      title: "Female Specialists on Request",
      desc: "Our team includes certified senior female hair restoration technicians and master colorists trained in London and Mumbai."
    },
    {
      icon: Heart,
      title: "Tension-Free & Non-Damaging",
      desc: "Zero heat, zero harsh chemicals, and no pulling. Our gentle attachment methods preserve and nurture your natural growing hair."
    },
    {
      icon: Award,
      title: "100% Virgin Human Hair",
      desc: "Ethically sourced natural virgin human hair with intact cuticles, custom color-matched to your exact shade and natural wave."
    }
  ];

  const JOURNEY_STEPS = [
    {
      step: 1,
      title: "Confidential Consultation",
      desc: "Relax in your private suite. We evaluate your scalp, hair texture, and thinning pattern over herbal tea."
    },
    {
      step: 2,
      title: "Custom Shade & Texture Match",
      desc: "We analyze your hair's undertones, curl pattern, and density percentage to select your ideal match."
    },
    {
      step: 3,
      title: "Artisanal Blending & Cut",
      desc: "Our aesthetic stylist trims, layers, and styles the topper to seamlessly integrate with your biological hair."
    },
    {
      step: 4,
      title: "Self-Care & Styling Masterclass",
      desc: "We teach you how to easily clip, style, wash, and care for your piece at home in under 2 minutes."
    }
  ];

  const REVIEWS = [
    {
      name: "Pooja S.",
      location: "Vadodara",
      treatment: "Silk Crown Topper",
      quote: "After postpartum hair loss, my partition widened noticeably. The silk topper from Jainil Hair Studio looks so natural that not even my close family could tell. The private suite gave me immense comfort.",
      stars: 5
    },
    {
      name: "Meera K.",
      location: "Sama-Savli Branch",
      treatment: "Seamless Volume Extensions",
      quote: "I was always self-conscious about my fine hair. Sneha matched the highlights to my hair color with extreme precision. It feels completely weightless and so full!",
      stars: 5
    },
    {
      name: "Ananya R.",
      location: "Sevasi Studio",
      treatment: "Frontal Hairline Lace Piece",
      quote: "The discretion and warmth here is unlike any other salon. They treat hair loss with dignity, care, and absolute artistry. Highly recommended for every woman.",
      stars: 5
    }
  ];

  const FAQS = [
    {
      q: "Will wearing a hair topper pull or damage my biological hair?",
      a: "No. Our hair toppers use ultra-gentle, silicone-padded micro-clips that distribute tension evenly across your scalp without tugging or pulling at the roots. Your biological hair continues to breathe and grow naturally underneath."
    },
    {
      q: "Can I wash, curl, straighten, and style the hair topper?",
      a: "Yes, 100%! All our hair enhancers are crafted from authentic virgin human hair. You can shampoo, condition, blow-dry, flat-iron, curl, and use your regular styling products just like your biological hair."
    },
    {
      q: "How is complete privacy maintained during my visit?",
      a: "Both our Sama-Savli and Sevasi studios feature dedicated, fully private styling suites with private entrances. No other clients can see or hear your consultation, ensuring 100% confidentiality."
    },
    {
      q: "Can I tie my hair into a high ponytail, braid, or messy bun?",
      a: "Yes! Because the hair topper seamlessly integrates with your natural hair along the sides and back, you can effortlessly gather your hair into updos, braids, ponytails, or half-up styles."
    },
    {
      q: "What is the difference between a full wig and a crown hair topper?",
      a: "A wig covers your entire head, whereas a hair topper only covers the thinning area (such as the parting line or crown) while blending into your existing hair. Toppers are significantly lighter, cooler, and more natural for everyday wear."
    }
  ];

  return (
    <div className="bg-[#FAFDFB] text-[#142820] font-sans antialiased selection:bg-[#0F5A3B] selection:text-white">
      
      {/* ─── HERO SECTION ──────────────────────────────────────────────────────── */}
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-14 md:pb-20 overflow-hidden border-b border-[#E0EBE5]">
        {/* Soft background accents */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#F0F7F4]/80 to-transparent pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#E8F3EE]/60 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#E8F3EE] border border-[#D5E4DD] text-[#0F5A3B] text-[11px] font-semibold uppercase tracking-[0.2em]">
                <Sparkles size={13} className="text-[#0F5A3B]" />
                <span>Bespoke Hair Solutions for Women · 100% Private Suites</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light text-[#142820] leading-[1.12]">
                Restore Natural Volume, <br />
                <span className="italic font-normal text-[#0F5A3B]">Crown & Confidence.</span>
              </h1>

              <p className="text-[#556B61] text-base sm:text-lg font-light leading-relaxed max-w-xl">
                Bespoke silk-base crown toppers, seamless volume extensions, and undetectable hairline integration. Handcrafted with 100% virgin human hair in our confidential private suites in Vadodara.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-3">
                <Link
                  to="/book"
                  className="inline-flex items-center justify-center gap-3 bg-[#0F5A3B] hover:bg-[#0A3D27] text-white px-8 py-4 rounded-full font-medium text-xs uppercase tracking-[0.18em] transition-all duration-300 shadow-sm hover:shadow-md group"
                >
                  <Calendar size={14} />
                  <span>Book Private Consultation</span>
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/consultancy"
                  className="inline-flex items-center justify-center gap-2 border border-[#0F5A3B] text-[#0F5A3B] hover:bg-[#E8F3EE] px-8 py-4 rounded-full font-medium text-xs uppercase tracking-[0.18em] transition-all duration-300"
                >
                  <span>Take Scalp Quiz</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-[#E0EBE5] flex flex-wrap items-center gap-6 text-xs text-[#556B61]">
                <span className="flex items-center gap-1.5 text-[#0F5A3B] font-semibold">
                  <Lock size={14} />
                  <span>100% Discreet & Private</span>
                </span>
                <span className="text-[#D5E4DD]">•</span>
                <span>Female Specialists Available</span>
                <span className="text-[#D5E4DD]">•</span>
                <span>Tension-Free Attachments</span>
              </div>
            </div>

            {/* Right Visual Collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-[#D5E4DD] shadow-xl bg-white aspect-[4/5] max-w-md mx-auto lg:max-w-none">
                <img
                  src="/assets/beautiful_female_model_202604251523.jpeg"
                  alt="Women's Hair Enhancement"
                  className="w-full h-full object-cover"
                />
                
                {/* Floating Discreet Guarantee Badge */}
                <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-[#E0EBE5] shadow-lg flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F3EE] text-[#0F5A3B] flex items-center justify-center shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#142820]">
                      100% Private Executive Cabin
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

      {/* ─── PRIVACY & CARE PILLARS ───────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-[#F6FAF8] border-b border-[#E0EBE5]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#0F5A3B]">
              Compassionate Care
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#142820]">
              Designed with Discretion & Dignity
            </h2>
            <div className="w-12 h-px bg-[#0F5A3B] mx-auto mt-4" />
            <p className="text-sm text-[#556B61] font-light leading-relaxed pt-2">
              We understand that hair thinning can feel deeply personal. Every detail of our service is curated to provide peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {PRIVACY_PILLARS.map((p, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-3xl p-8 border border-[#E0EBE5] hover:border-[#0F5A3B] hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#E8F3EE] text-[#0F5A3B] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                    <p.icon size={22} />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-[#142820] mb-3">
                    {p.title}
                  </h3>
                  <p className="text-xs text-[#556B61] font-light leading-relaxed">
                    {p.desc}
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

      {/* ─── BESPOKE SOLUTIONS FOR WOMEN ──────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-white border-b border-[#E0EBE5]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="space-y-3 max-w-2xl">
              <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#0F5A3B]">
                Curated Solutions
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#142820]">
                Tailored Enhancements for Every Need
              </h2>
              <p className="text-sm text-[#556B61] font-light leading-relaxed">
                Whether you desire discreet crown coverage for widening partings or voluminous length, we tailor the exact match.
              </p>
            </div>

            <Link
              to="/book"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-semibold text-[#0F5A3B] hover:text-[#0A3D27] pb-1 border-b border-[#0F5A3B]/30 hover:border-[#0F5A3B] transition-all self-start md:self-end"
            >
              <span>Explore All Solutions</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {SOLUTIONS.map((sol) => (
              <div 
                key={sol.id} 
                className="bg-[#FAFDFB] rounded-3xl p-6 border border-[#E0EBE5] hover:border-[#0F5A3B] hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-[#E8F3EE] relative">
                    <img
                      src={sol.image}
                      alt={sol.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[#0F5A3B] text-[9px] uppercase tracking-wider font-bold px-3 py-1 rounded-full border border-[#D5E4DD]">
                      {sol.tag}
                    </div>
                  </div>

                  <h3 className="font-serif text-xl font-medium text-[#142820] mb-2 group-hover:text-[#0F5A3B] transition-colors">
                    {sol.title}
                  </h3>

                  <p className="text-xs text-[#0F5A3B] font-medium mb-3">
                    {sol.sub}
                  </p>

                  <p className="text-xs text-[#556B61] font-light leading-relaxed mb-6">
                    {sol.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E0EBE5]">
                  <div className="flex items-center justify-between text-xs mb-4">
                    <span className="text-[#556B61] flex items-center gap-1">
                      <Clock size={12} className="text-[#0F5A3B]" />
                      {sol.time}
                    </span>
                    <span className="font-bold text-[#142820]">{sol.price}</span>
                  </div>

                  <Link
                    to="/book"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#E8F3EE] hover:bg-[#0F5A3B] text-[#0F5A3B] hover:text-white py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors duration-300"
                  >
                    <span>Book Trial</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── BEFORE / AFTER TRANSFORMATION ────────────────────────────────────── */}
      <BeforeAfterSlider />

      {/* ─── THE 4-STEP TRANSFORMATION JOURNEY ─────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-[#F6FAF8] border-t border-[#E0EBE5]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#0F5A3B]">
              Effortless Process
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#142820]">
              The Women's Transformation Journey
            </h2>
            <div className="w-12 h-px bg-[#0F5A3B] mx-auto mt-4" />
            <p className="text-sm text-[#556B61] font-light leading-relaxed pt-2">
              From our first private conversation to walking out with full, flowing hair.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {JOURNEY_STEPS.map((step) => (
              <div 
                key={step.step}
                className="bg-white rounded-3xl p-8 border border-[#E0EBE5] relative shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-[#0F5A3B] text-white flex items-center justify-center font-serif text-lg font-bold mb-6 shadow-sm">
                    0{step.step}
                  </div>
                  <h3 className="font-serif text-xl font-medium text-[#142820] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#556B61] font-light leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                <div className="pt-6 border-t border-[#F0F5F2] mt-6 text-[10px] uppercase tracking-wider text-[#0F5A3B] font-semibold">
                  Step 0{step.step} of 04
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── REAL CLIENT EXPERIENCES ───────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-white border-t border-[#E0EBE5]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#0F5A3B]">
              Real Women, Real Stories
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#142820]">
              Confidence Restored with Grace
            </h2>
            <div className="w-12 h-px bg-[#0F5A3B] mx-auto mt-4" />
            <p className="text-sm text-[#556B61] font-light leading-relaxed pt-2">
              Read how our discreet hair enhancement rituals transformed the daily lives of women in Vadodara.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {REVIEWS.map((rev, idx) => (
              <div
                key={idx}
                className="bg-[#FAFDFB] p-8 rounded-3xl border border-[#E0EBE5] flex flex-col justify-between hover:shadow-md transition-shadow"
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
                    <Check size={11} /> Verified Client
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── FREQUENTLY ASKED QUESTIONS ────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-[#FAFDFB] border-t border-[#E0EBE5]">
        <div className="max-w-[900px] mx-auto px-6 lg:px-12">
          
          <div className="text-center mb-16 space-y-3">
            <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#0F5A3B]">
              Transparency & Advice
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#142820]">
              Frequently Asked Questions
            </h2>
            <div className="w-12 h-px bg-[#0F5A3B] mx-auto mt-4" />
            <p className="text-sm text-[#556B61] font-light leading-relaxed pt-2">
              Everything you need to know about our women's hair enhancements and private suite consultations.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-2xl border border-[#E0EBE5] overflow-hidden transition-colors"
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
            Confidential · Private VIP Suite Booking
          </span>

          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light leading-tight">
            Rediscover the Joy of Full, <br className="hidden sm:block" />
            <span className="italic font-normal text-[#D1EADB]">Flowing Hair.</span>
          </h2>

          <p className="text-white/80 max-w-xl mx-auto text-sm sm:text-base font-light leading-relaxed">
            Experience our 100% private styling suites at Sama-Savli Road and Sevasi in Vadodara. Schedule a confidential trial session with our master hair directors.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/book"
              className="inline-flex items-center gap-3 bg-white text-[#0F5A3B] hover:bg-[#F0F7F4] px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-lg group"
            >
              <Calendar size={15} />
              <span>Book Confidential Consultation</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="https://wa.me/917779055771?text=Hello%20Jainil%20Hair%20Studio,%20I%20would%20like%20to%20inquire%20about%20hair%20toppers%20for%20women."
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
