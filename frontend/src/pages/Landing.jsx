import React, { useEffect, useState } from "react"; // Last Updated: 2026-04-28T16:38:00Z
import { Link } from "react-router-dom";
import api, { API, getMediaUrl } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import { ChevronRight, Calendar, Truck, MessageSquare, Star, Quote } from "lucide-react";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import ExperienceCenters from "@/components/ExperienceCenters";
import { isProductForMen, isProductForWomen, isProductForAccessories } from "@/lib/genderUtils";

const SLIDER_IMAGES = [
  "/assets/slider/slide6.jpeg",
  "/assets/slider/slide1.jpeg",
  "/assets/slider/slide2.jpeg",
  "/assets/slider/slide4.jpeg",
  "/assets/slider/slide5.jpeg",
  "/assets/slider/remove_that_line_around_the_202604291523.jpeg.jpeg",
];

const SALON_INTERIOR = "/assets/professional_hairstylist_working_202604251521.jpeg";
const STORY_IMG = "/assets/realistic_human_hair_202604251524.jpeg";

export default function Landing() {
  const { t } = useLang();
  const [products, setProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeGender, setActiveGender] = useState("Women");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    api.get("/products").then((r) => setProducts(Array.isArray(r.data) ? r.data : [])).catch(() => { });
  }, []);

  // (Removed local duplicate of isProductForMen)

  // Helper to filter sub-categories based on active gender
  const getSubCategories = () => {
    const relevantProducts = products.filter(p => {
      if (activeGender === "Men") return isProductForMen(p);
      if (activeGender === "Accessories") return isProductForAccessories(p);
      return isProductForWomen(p);
    });
    return ["All", ...new Set(relevantProducts.map(p => p.category).filter(Boolean))];
  };

  const subCats = getSubCategories();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDER_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div data-testid="landing-page">
      {/* HERO — image slider, full visibility, no cropping */}
      <section className="relative aspect-[4/5] md:aspect-auto md:h-screen min-h-[400px] md:min-h-[600px] flex items-center justify-center overflow-hidden bg-[#f5f0eb]">
        {SLIDER_IMAGES.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? "opacity-100" : "opacity-0"}`}
          >
            <img
              src={img}
              alt={`Slide ${idx + 1}`}
              className="w-full h-full object-contain md:object-cover"
            />
            {/* Elegant Overlay Layer */}
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent opacity-80" />
          </div>
        ))}

        {/* Subtle Navigation Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {SLIDER_IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? "bg-eminence-gold w-6 shadow-sm" : "bg-eminence-muted/40 hover:bg-eminence-muted/60"}`}
            />
          ))}
        </div>
      </section>

      {/* TAGLINE STRIP */}
      <section className="py-4 border-y border-eminence-border/20 overflow-hidden bg-[#1a1512]">
        <div className="announcement-track text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-eminence-gold font-bold">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="px-8 whitespace-nowrap">{t("tagline")}</span>
          ))}
        </div>
      </section>

      {/* BEST SELLERS — product grid */}
      <section className="py-24 md:py-32 bg-section-pattern">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-20">
            <p className="text-[11px] tracking-[0.5em] uppercase text-eminence-gold mb-6 font-semibold">{t("ourCollection")}</p>
            <h2 className="font-serif text-4xl md:text-6xl font-light text-eminence-text mb-6">{t("exploreCollection")}</h2>
            <div className="w-16 h-px bg-eminence-gold mx-auto mb-8" />


            {/* TOP-LEVEL GENDER TABS */}
            <div className="flex justify-center gap-8 mb-12 border-b border-eminence-border/30 max-w-sm mx-auto pb-4">
              {["Women", "Men", "Accessories"].map((gender) => (
                <button
                  key={gender}
                  onClick={() => { setActiveGender(gender); setActiveCategory("All"); }}
                  className={`text-sm uppercase tracking-[0.4em] transition-all duration-300 ${activeGender === gender
                      ? "text-eminence-gold font-bold scale-110"
                      : "text-eminence-muted hover:text-eminence-text"
                    }`}
                >
                  {t(gender.toLowerCase())}
                </button>
              ))}
            </div>

            {/* INTERNAL CATEGORY TABS */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-12 mt-6 mb-16">
              {subCats.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-[11px] md:text-xs uppercase tracking-[0.3em] pb-2 border-b transition-all duration-300 ${activeCategory === cat
                      ? "border-eminence-gold text-eminence-gold font-bold"
                      : "border-transparent text-eminence-muted hover:text-eminence-text"
                    }`}
                >
                  {cat === "All" ? t("all") : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {products
              .filter(p => {
                let genderMatch = false;
                if (activeGender === "Men") genderMatch = isProductForMen(p);
                else if (activeGender === "Accessories") genderMatch = isProductForAccessories(p);
                else genderMatch = isProductForWomen(p);

                const categoryMatch = activeCategory === "All" || p.category === activeCategory;
                return genderMatch && categoryMatch;
              })
              .slice(0, 8)
              .map((p, i) => (
                <Link to={`/shop/${p.id}`} key={p.id} className="group block bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-eminence-border/10" data-testid={`product-${p.id}`}>
                  <div className="relative aspect-[3/4] overflow-hidden bg-eminence-surface rounded-t-3xl">
                    {/* BADGE */}
                    {i < 2 && (
                      <div className="absolute top-4 left-4 z-20 bg-eminence-gold text-white text-[9px] uppercase tracking-[0.2em] px-2.5 py-1 font-bold shadow-lg">
                        {t("bestSeller")}
                      </div>
                    )}

                    {/* IMAGE/VIDEO WITH REVEAL HOVER */}
                    <div className="w-full h-full transition-transform duration-1000 group-hover:scale-105 relative">
                      {p.video_url ? (
                        <>
                          <video src={getMediaUrl(p.video_url)} className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0" autoPlay muted loop playsInline
                            onError={(e) => { e.target.style.display = "none"; }} />
                          {p.image_url && (
                            <img src={getMediaUrl(p.image_url)} alt={p.name} className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          )}
                        </>
                      ) : p.image_url ? (
                        <img src={getMediaUrl(p.image_url)} alt={p.name} className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&size=400&background=f5f0eb&color=2a2118&font-size=0.2&bold=true`;
                          }} />
                      ) : (
                        <div className="w-full h-full bg-eminence-surface flex items-center justify-center text-eminence-muted italic text-xs">No image</div>
                      )}
                    </div>

                    {/* OVERLAY ON HOVER */}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-20">
                      <button className="w-full bg-white text-eminence-text text-[10px] uppercase tracking-[0.2em] py-3.5 font-bold shadow-2xl hover:bg-eminence-gold hover:text-white transition-colors">
                        {t("quickView")}
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 text-center space-y-3">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-eminence-gold font-bold">{p.category}</p>
                    <h3 className="font-serif text-lg md:text-xl text-eminence-text leading-snug group-hover:text-eminence-gold transition-colors duration-300 flex items-center justify-center h-14 overflow-hidden">
                      {p.name}
                    </h3>

                    {/* COLOR SELECTION SWATCHES */}
                    <div className="flex justify-center gap-2 py-2">
                      {["#1a1512", "#4a3728", "#8b6b4e", "#c5a076"].map((color, idx) => (
                        <div key={idx} className="w-3.5 h-3.5 rounded-full border border-eminence-border/50 p-0.5 hover:border-eminence-gold transition-colors cursor-pointer">
                          <div className="w-full h-full rounded-full" style={{ backgroundColor: color }} />
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-8 h-px bg-eminence-border mb-3" />
                      <p className="text-eminence-text font-medium tracking-tight">
                        <span className="text-[10px] text-eminence-muted mr-1">MRP</span>
                        <span className="text-lg">₹{p.price.toLocaleString("en-IN")}</span>
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
          </div>

          <div className="text-center mt-24">
            <Link to={`/shop?gender=${activeGender.toLowerCase()}`} className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] font-bold border-b-2 border-eminence-gold pb-2 hover:gap-5 transition-all text-eminence-text" data-testid="view-all-products-btn">
              {t("viewCollection")} <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* HAIR TRANSFORMATION */}
      <BeforeAfterSlider
        before="/assets/new_before.jpeg"
        after="/assets/new_after.jpeg"
      />

      {/* MEN'S SECTION — The Modern Man */}
      <section className="py-24 md:py-32 bg-[#1a1512] text-white overflow-hidden">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="aspect-[3/4] overflow-hidden">
                  <img src="/assets/realistic_men's_hair_202604251529.jpeg" alt="Men's Hair System" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="aspect-[3/4] overflow-hidden mt-12">
                  <img src="/assets/professional_hairstylist_working_202604251521.jpeg" alt="Precision Grooming" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
              </div>
              <div className="absolute -top-8 -left-8 w-32 h-32 border border-eminence-gold/20 z-0" />
              <div className="absolute -bottom-8 -right-8 w-32 h-32 border border-eminence-gold/20 z-0" />
            </div>

            <div className="order-1 lg:order-2">
              <p className="text-[11px] tracking-[0.5em] uppercase text-eminence-gold mb-8 font-semibold">{t("mensSection")}</p>
              <h2 className="font-serif text-4xl md:text-6xl font-light leading-tight mb-8">
                {t("mensGrooming")}<br />
                <span className="italic text-eminence-gold">& {t("hairSystems")}</span>
              </h2>
              <p className="text-eminence-muted/80 text-lg md:text-xl font-light leading-relaxed mb-10 max-w-xl">
                {t("mensGroomingSub")}
              </p>

              <div className="flex flex-wrap gap-8">
                <Link to="/shop?gender=men" className="btn-gold px-10 py-4 text-xs font-bold uppercase tracking-widest">
                  {t("mensShop")}
                </Link>
                <Link to="/book" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold border-b border-white pb-2 hover:gap-4 transition-all">
                  {t("bookAppointment")} <ChevronRight size={14} />
                </Link>
              </div>

              <div className="mt-16 grid grid-cols-2 gap-10 border-t border-white/10 pt-10">
                <div>
                  <h4 className="text-eminence-gold font-serif text-2xl mb-2">100%</h4>
                  <p className="text-[10px] uppercase tracking-widest text-eminence-muted">Natural Appearance</p>
                </div>
                <div>
                  <h4 className="text-eminence-gold font-serif text-2xl mb-2">Non-Surgical</h4>
                  <p className="text-[10px] uppercase tracking-widest text-eminence-muted">Instant Results</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ACCESSORIES SECTION — Complete Your Look */}
      <section className="py-24 md:py-32 bg-white overflow-hidden">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <p className="text-[11px] tracking-[0.5em] uppercase text-eminence-gold mb-8 font-semibold">{t("accessories")}</p>
              <h2 className="font-serif text-4xl md:text-6xl font-light leading-tight text-eminence-text mb-8">
                {t("accessoriesSection")}<br />
                <span className="italic text-eminence-gold">& {t("essentials")}</span>
              </h2>
              <p className="text-eminence-muted text-lg md:text-xl font-light leading-relaxed mb-10 max-w-xl">
                {t("accessoriesSub")}
              </p>

              <div className="flex flex-wrap gap-8">
                <Link to="/shop?category=Accessories" className="bg-eminence-text text-white px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-eminence-gold transition-colors">
                  {t("accessoriesShop")}
                </Link>
                <Link to="/shop" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold border-b border-eminence-text pb-2 hover:gap-4 transition-all text-eminence-text">
                  {t("viewCollection")} <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="aspect-[3/4] overflow-hidden mt-12">
                  <img src="/assets/realistic_human_hair_202604251524.jpeg" alt="Hair Accessories" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="aspect-[3/4] overflow-hidden">
                  <img src="/assets/professional_hairstylist_working_202604251521.jpeg" alt="Care Products" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
              </div>
              <div className="absolute -top-8 -right-8 w-32 h-32 border border-eminence-gold/20 z-0" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 border border-eminence-gold/20 z-0" />
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="py-24 border-y border-eminence-border bg-section-pattern">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {[
            { icon: Calendar, t: "trustEasyBooking", s: "trustEasyBookingSub" },
            { icon: Truck, t: "trustWorldwide", s: "trustWorldwideSub" },
            { icon: MessageSquare, t: "trustWA", s: "trustWASub" },
            { icon: Star, t: "trustSince", s: "trustSinceSub" },
          ].map((b, i) => (
            <div key={i} className="flex flex-col items-center group" data-testid={`trust-${i}`}>
              <div className="w-16 h-16 rounded-full bg-eminence-surface flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110">
                <b.icon size={28} className="text-eminence-gold stroke-[1.25px]" />
              </div>
              <h4 className="font-serif text-xl text-eminence-text mb-2 tracking-tight">{t(b.t)}</h4>
              <p className="text-sm text-eminence-muted font-light leading-relaxed max-w-[200px] mx-auto">{t(b.s)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY EMINENCE — editorial split */}
      <section className="py-24 md:py-32 bg-section-pattern">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="grid grid-cols-2 gap-4">
            <img src={SALON_INTERIOR} alt="Eminence interior" className="w-full aspect-[3/4] object-cover" />
            <img src="/assets/realistic_men's_hair_202604251529.jpeg" alt="Stylist" className="w-full aspect-[3/4] object-cover mt-12" />
          </div>
          <div>
            <p className="text-[11px] tracking-[0.4em] uppercase text-eminence-muted mb-6">{t("whyOverline")}</p>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-eminence-text leading-tight mb-8">
              {t("whyTitle")}
            </h2>
            <ul className="space-y-4 text-eminence-muted">
              <li className="flex gap-4"><span className="text-eminence-gold font-serif text-2xl">·</span><span>{t("whyP1")}</span></li>
              <li className="flex gap-4"><span className="text-eminence-gold font-serif text-2xl">·</span><span>{t("whyP2")}</span></li>
              <li className="flex gap-4"><span className="text-eminence-gold font-serif text-2xl">·</span><span>{t("whyP3")}</span></li>
              <li className="flex gap-4"><span className="text-eminence-gold font-serif text-2xl">·</span><span>{t("whyP4")}</span></li>
            </ul>
            <Link to="/shop" className="inline-flex items-center gap-2 mt-10 text-[11px] uppercase tracking-[0.18em] font-medium border-b border-eminence-text pb-1 text-eminence-text hover:gap-4 transition-all" data-testid="our-values-btn">
              {t("ourValues")} <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <ExperienceCenters />

      {/* TESTIMONIALS */}
      <section className="py-24 md:py-32 relative overflow-hidden bg-section-pattern">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center mb-16">
            <p className="text-[11px] tracking-[0.5em] uppercase text-eminence-gold mb-6 font-semibold">
              {t("clientExp")}
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-eminence-text mb-6">
              {t("whatTheySay")}
            </h2>
            <div className="w-16 h-px bg-eminence-gold mx-auto" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Aanya R.",
                loc: "Vadodara",
                text: "I walked in with no plan and walked out feeling like the most polished version of myself. The team listens, advises, and delivers.",
                stars: 5
              },
              {
                name: "Meera K.",
                loc: "Surat",
                text: "The hair restoration results were beyond my expectations. It feels completely natural and the quality is simply unmatched.",
                stars: 5
              },
              {
                name: "Priya S.",
                loc: "Ahmedabad",
                text: "Finally a salon that understands premium aesthetics. The ambiance is calming and the service is truly world-class.",
                stars: 5
              }
            ].map((rev, i) => (
              <div key={i} className="bg-white p-8 border border-eminence-border/30 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-6">
                    {Array.from({ length: rev.stars }).map((_, j) => (
                      <Star key={j} size={14} className="fill-eminence-gold text-eminence-gold" />
                    ))}
                  </div>
                  <p className="text-eminence-text italic font-light leading-relaxed mb-8">"{rev.text}"</p>
                </div>
                <div className="border-t border-eminence-border/50 pt-6">
                  <p className="text-xs uppercase tracking-[0.2em] font-bold text-eminence-text">{rev.name}</p>
                  <p className="text-[10px] uppercase tracking-widest text-eminence-muted mt-1">{rev.loc}, GJ</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 md:py-32 bg-section-pattern border-t border-eminence-border">
        <div className="max-w-[1000px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <p className="text-[11px] tracking-[0.5em] uppercase text-eminence-gold mb-6 font-semibold">{t("commonQueries")}</p>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-eminence-text">{t("frequentlyAsked")}</h2>
            <div className="w-16 h-px bg-eminence-gold mx-auto mt-6" />
          </div>
          <div className="space-y-6">
            {[
              { q: "faq1q", a: "faq1a" },
              { q: "faq2q", a: "faq2a" },
              { q: "faq3q", a: "faq3a" },
              { q: "faq4q", a: "faq4a" },
              { q: "faq5q", a: "faq5a" }
            ].map((item, i) => (
              <details key={i} className="group border-b border-eminence-border/50 pb-6 cursor-pointer">
                <summary className="list-none flex items-center justify-between font-serif text-xl md:text-2xl text-eminence-text py-2">
                  <span>{t(item.q)}</span>
                  <span className="text-eminence-gold group-open:rotate-180 transition-transform duration-300">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                  </span>
                </summary>
                <div className="mt-4 text-eminence-muted leading-relaxed max-w-3xl overflow-hidden animate-fade-down">
                  {t(item.a)}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
