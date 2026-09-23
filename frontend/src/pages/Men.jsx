import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  CheckCircle, 
  Shield, 
  Zap, 
  ArrowRight, 
  Play, 
  Sparkles, 
  Clock, 
  Calendar, 
  Phone, 
  Check, 
  HelpCircle,
  Award,
  Layers,
  ChevronRight
} from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import api, { getMediaUrl } from "@/lib/api";
import { isProductForMen } from "@/lib/genderUtils";

export default function Men() {
  const { t } = useLang();
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);
  const [products, setProducts] = useState([]);
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get("/products")
      .then((r) => setProducts(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
  }, []);

  const menProducts = products.filter(isProductForMen);

  const heroSlider = [
    "/assets/men_slider/make_image_width_more_2K_202605011110.jpeg",
    "/assets/men_slider/make_image_width_more_2K_202605011112.jpeg",
    "/assets/men_slider/make_this_image_width_more_202605011110.jpeg",
  ];

  const features = [
    { 
      title: "100% Virgin Human Hair", 
      sub: "Ethically sourced Indian hair perfectly matched to your natural density, texture, wave pattern, and curl.", 
      icon: Award 
    },
    { 
      title: "Undetectable French Lace", 
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
      sub: "The most breathable and natural-looking base, perfectly suited for warm Indian climates and active gym routines.",
      img: "https://images.unsplash.com/photo-1599351431247-f132f82f23b9?w=800",
      tag: "Best for Breathability",
      life: "3-5 Months",
      price: "₹14,999"
    },
    {
      title: "Silk Top Skin Base",
      sub: "Multi-directional scalp illusion where hair appears to grow straight out of your skin with zero visible knots.",
      img: "https://images.unsplash.com/photo-1519085188583-6ad28a745b55?w=800",
      tag: "Undetectable Parting",
      life: "4-6 Months",
      price: "₹18,999"
    },
    {
      title: "Hybrid Monofilament",
      sub: "Reinforced monofilament center with featherlight lace perimeter for long-lasting durability and easy home care.",
      img: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800",
      tag: "Maximum Durability",
      life: "6-9 Months",
      price: "₹16,499"
    },
  ];

  const clientVideos = [
    {
      url: "/assets/men_videos/client/AQMbGRmRf-JQbB3Unc3Bj93BfMm1HSVsgRZwDsO34tokz4OiVMfOZXE1j7HhEyCNnTVRk0fQgse_WW1IME-DEie3Y17l5_3PsoxHBI8.mp4",
      caption: "Natural Hairline Integration"
    },
    {
      url: "/assets/men_videos/client/client2.mp4",
      caption: "Crown Thinning Transformation"
    },
    {
      url: "/assets/men_videos/client/client3.mp4",
      caption: "Active Lifestyle Blend"
    }
  ];

  const informativeVideos = [
    { 
      url: "/assets/men_videos/Informative Videos/AQM6qn7r7zzMSPhxGCM-8L1tifmWfSTMDstEK2qxOuB9kLvQ4Mj0sZa3gEQSr_9dIrQzKux2ZIPBZVArIjIDy5Z3GezRFvSjGIVt7ec.mp4", 
      title: "Expert Advice on Hair Loss Stages" 
    },
    { 
      url: "/assets/men_videos/Informative Videos/AQMbGRmRf-JQbB3Unc3Bj93BfMm1HSVsgRZwDsO34tokz4OiVMfOZXE1j7HhEyCNnTVRk0fQgse_WW1IME-DEie3Y17l5_3PsoxHBI8.mp4", 
      title: "Daily Hair System Care & Washing" 
    },
    { 
      url: "/assets/men_videos/Informative Videos/AQPks84sC6Tpm7XJbul3oghyG0eajEW3CHFYz8IpR1HSmHZKEoje3mMGqXN8EP_Ra4c4G6Ic6m4oEPmPEncj4YZe3AdRuxIBEbi_XPw.mp4", 
      title: "Maintenance Tips & Longevity" 
    },
  ];

  const faqVideos = [
    { url: "/assets/men_videos/faq/AQM_V0O2sDQQdQ-Th63DBVND77ply48FouNHfGupX1zLJzR6GsonUkSpYuKP4_JqRgkcBpBqaXDRa1xUAdFYaciofelkIazwwtHvJVA.mp4", title: "How to Select a Wig / Patch?" },
    { url: "/assets/men_videos/faq/AQN6iH_qtr2W8Ekk7zMLOoFsyEcgxmK8YWTqqlSNEuClbHsbhNSjboatfkSdEdC5OYet0nDb_m6UKz8R_YmAS-6ajrqF7V5z5yhRW0E.mp4", title: "Natural Look Kaise Aata Hai?" },
    { url: "/assets/men_videos/faq/AQNG9cCoBgj2qUZHdefqZP8fLk2ep0mKn3VV2jgx-oI_V2wTUT91nVDtglW6Krtl0tPgdoGGtO8y2G8MI2dt-6M3dWwbgZqR7ckwp_E.mp4", title: "Pricing & Longevity" },
    { url: "/assets/men_videos/faq/AQNKRGp2u3A1KX2njPtAXsES7dyvoCu4ag4d1Qjb5nJvg9UfVi46ftsUVndAhIfc43mh6kvmaXzGPRcrfFWuUiqxqVPUs_tFAmsRdXg.mp4", title: "Wig vs Hair Replacement System" },
    { url: "/assets/men_videos/faq/AQOZxDjq6uKhtO7WPqmKAf7ZYEMUveWIlmTx4751TKmzcN-1T1kmYtIRxAj3rsu-j598AeZBI36OrIJAi5_C1V1RR1M3agBZCaricXQ.mp4", title: "How We Fix & Bond" },
    { url: "/assets/men_videos/faq/AQP8yvb34GNoEpL5cSBdd3T1o6I6W_N_kxv4cwKQtTHCBsIiITdlv1ARDLfjuBsd_qlC-3Cfx-kcuH2C7MVryEVsmldAX6TRzC0SQGs.mp4", title: "System Maintenance Guide" },
    { url: "/assets/men_videos/faq/AQPCCy5LrmfEHq8jfsOhSPSj4dkPS_pLPJYsuNYo4DErSvS66oni7IA9XOvsMyvziGYrTaxBGeTG5h2m81YZuM0w3BILWBb9IGJt6Kw.mp4", title: "Permanent Solution for Baldness" },
    { url: "/assets/men_videos/faq/AQPJo4GAj72lljtTotNDdrrgNLlBi-G3a8SXZ51WnCUK2DVVSh1zebymKroQZsdQD2pKwQrKHJnRBYLscBQ8vZfTfXh8yaVog-zK9NU.mp4", title: "Aftercare & Routine Hygiene" },
  ];

  const clientReviews = [
    { url: "/assets/men_videos/Client Reviews/AQNDAmdCXPPLc-Ga0QATgkivUakLn8oonEQ-q9OJWVWuayMTncSbAjsv0BaCu-qnw9W0u7f57VuEW1K843awbPzNl-Iab0rT9ydnJWQ.mp4", title: "Rohan's Confidence Story" },
    { url: "/assets/men_videos/Client Reviews/AQO9_TAgR4HOZVxBJO3JpxZXv0Zv4GiEFyWji8mhZwSXCYFuCVGFZq670vtrQ8Nk9IknnWQ5UyHwEOOH-cAVx3kubluHbtURlYQ8jcM.mp4", title: "Vikram's Experience at Sama-Savli" },
    { url: "/assets/men_videos/Client Reviews/AQOuUnBp-OhxovNHkfdfG7_yRLcR-Ly-82bdkurhF0MapNO_YyKUkNCYcXq8h3G4T9Qpi1Qm9yz5ndX2EJL99WmbR9kjpBWo0qB6zA4.mp4", title: "Ankit's Undetectable Look" },
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
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-12 md:pb-16 overflow-hidden border-b border-[#E0EBE5]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          
          {/* Hero Header Text */}
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8F3EE] border border-[#D5E4DD] text-[#0F5A3B] text-[11px] font-semibold uppercase tracking-[0.2em]">
              <Sparkles size={13} className="text-[#0F5A3B]" />
              <span>Men's Non-Surgical Hair Restoration</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-[#142820] leading-[1.15]">
              Undetectable Hair Systems, <br />
              <span className="italic font-normal text-[#0F5A3B]">Engineered for Modern Men.</span>
            </h1>

            <p className="text-[#556B61] text-base sm:text-lg font-light leading-relaxed max-w-2xl mx-auto">
              Restore a full head of natural hair in a single 90-minute session. 100% virgin human hair, custom breathable Swiss lace bases, and private consultation suites at Sama-Savli & Sevasi.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
              <Link
                to="/book"
                className="inline-flex items-center justify-center gap-2.5 bg-[#0F5A3B] hover:bg-[#0A3D27] text-white px-8 py-4 rounded-full font-medium text-xs uppercase tracking-[0.18em] transition-all duration-300 shadow-sm hover:shadow-md group"
              >
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
          </div>

          {/* Hero Carousel Banner */}
          <div className="rounded-3xl overflow-hidden shadow-xl border border-[#D8E6DF] bg-black" ref={emblaRef}>
            <div className="flex w-full">
              {heroSlider.map((src, i) => (
                <div key={i} className="relative flex-[0_0_100%] min-w-0 aspect-[16/9] sm:aspect-[21/9]">
                  <img
                    src={src}
                    alt={`Men's Transformation ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6 sm:p-10">
                    <span className="text-white text-xs sm:text-sm font-light tracking-wide">
                      Real client hairline integration · Jainil Hair Studio Vadodara
                    </span>
                  </div>
                </div>
              ))}
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
                  <span>Guaranteed Quality</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── REAL TRANSFORMATIONS VIDEOS ──────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-white border-b border-[#E0EBE5]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="space-y-3 max-w-xl">
              <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#0F5A3B]">
                Real Transformations
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#142820]">
                Watch Our Clients in Action
              </h2>
              <p className="text-sm text-[#556B61] font-light leading-relaxed">
                See unedited results from clients visiting our Sama-Savli and Sevasi studios in Vadodara.
              </p>
            </div>

            <Link
              to="/book"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-semibold text-[#0F5A3B] hover:text-[#0A3D27] pb-1 border-b border-[#0F5A3B]/30 hover:border-[#0F5A3B] transition-all self-start md:self-end"
            >
              <span>Book Your Transformation</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {clientVideos.map((v, i) => (
              <div 
                key={i} 
                className="group relative aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-lg border border-[#E0EBE5]"
              >
                <video 
                  src={v.url} 
                  autoPlay 
                  muted 
                  loop 
                  playsInline 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none flex flex-col justify-end p-6">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] uppercase tracking-wider font-semibold w-fit mb-2">
                    Client Result {i + 1}
                  </span>
                  <h3 className="text-white font-serif text-lg leading-snug">
                    {v.caption}
                  </h3>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── BEFORE / AFTER SLIDER ────────────────────────────────────────────── */}
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
                      <span className="font-bold text-[#142820]">From {item.price}</span>
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
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-6 bg-[#E8F3EE] shadow-sm">
                    <img
                      src={`/assets/men_journey/step${st.step}.png`}
                      alt={st.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-[#0F5A3B] text-white flex items-center justify-center font-serif text-sm font-bold shadow-md">
                      0{st.step}
                    </div>
                  </div>

                  <h3 className="font-serif text-xl font-medium text-[#142820] mb-2">
                    {st.title}
                  </h3>
                  <p className="text-xs text-[#556B61] font-light leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── VIDEO FAQS & COMMON QUESTIONS ────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-white border-t border-[#E0EBE5]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#0F5A3B]">
              Got Questions?
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#142820]">
              Video Guides & Answers
            </h2>
            <div className="w-12 h-px bg-[#0F5A3B] mx-auto mt-4" />
            <p className="text-sm text-[#556B61] font-light leading-relaxed pt-2">
              Watch quick 30-second video answers by our master hair technicians.
            </p>
          </div>

          {/* Video FAQ Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
            {faqVideos.slice(0, 8).map((v, i) => (
              <div 
                key={i} 
                className="group relative aspect-[9/16] bg-black rounded-2xl overflow-hidden cursor-pointer shadow-md border border-[#E0EBE5]"
              >
                <video 
                  src={v.url} 
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" 
                />
                
                {/* Overlay with play */}
                <div className="faq-overlay absolute inset-0 bg-[#0F5A3B]/80 backdrop-blur-xs flex flex-col items-center justify-between p-4 text-center group-hover:bg-[#0F5A3B]/90 transition-all">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-[10px] font-bold">
                    0{i + 1}
                  </div>
                  <div>
                    <div className="w-12 h-12 rounded-full bg-white text-[#0F5A3B] flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform">
                      <Play size={18} className="fill-[#0F5A3B] ml-0.5" />
                    </div>
                    <p className="text-white text-xs sm:text-sm font-medium leading-snug drop-shadow-xs">
                      {v.title}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-[#D1EADB] font-semibold">
                    Tap to Play
                  </span>
                </div>

                <button
                  className="absolute inset-0 z-30"
                  aria-label={`Play FAQ video: ${v.title}`}
                  onClick={(e) => {
                    const video = e.currentTarget.parentElement.querySelector('video');
                    const overlay = e.currentTarget.parentElement.querySelector('.faq-overlay');
                    if (video.paused) {
                      video.play();
                      video.controls = true;
                      overlay.style.opacity = '0';
                      overlay.style.pointerEvents = 'none';
                    } else {
                      video.pause();
                      overlay.style.opacity = '1';
                      overlay.style.pointerEvents = 'auto';
                    }
                  }}
                />
              </div>
            ))}
          </div>

          {/* Written Accordion FAQ */}
          <div className="max-w-3xl mx-auto space-y-4 pt-6 border-t border-[#E0EBE5]">
            <h3 className="font-serif text-2xl font-light text-center text-[#142820] mb-8">
              Frequently Asked Questions
            </h3>
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-[#FAFDFB] rounded-2xl border border-[#E0EBE5] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 font-serif text-base text-[#142820] hover:text-[#0F5A3B]"
                >
                  <span>{faq.q}</span>
                  <span className={`w-6 h-6 rounded-full bg-[#E8F3EE] text-[#0F5A3B] flex items-center justify-center text-sm font-bold shrink-0 transition-transform ${activeFaq === idx ? "rotate-45" : ""}`}>
                    +
                  </span>
                </button>
                {activeFaq === idx && (
                  <div className="px-6 pb-5 text-xs sm:text-sm text-[#556B61] font-light leading-relaxed border-t border-[#F0F5F2] pt-3">
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
