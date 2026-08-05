import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Shield, Zap, Info, ArrowRight, MessageSquare, Plus, Play } from "lucide-react";
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

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get("/products").then((r) => setProducts(Array.isArray(r.data) ? r.data : [])).catch(() => { });
  }, []);

  const menProducts = products.filter(isProductForMen);

  const heroSlider = [
    "/assets/men_slider/make_image_width_more_2K_202605011110.jpeg",
    "/assets/men_slider/make_image_width_more_2K_202605011112.jpeg",
    "/assets/men_slider/make_this_image_width_more_202605011110.jpeg",
  ];

  const features = [
    { title: t("menFeature1Title"), sub: t("menFeature1Sub"), icon: Shield },
    { title: t("menFeature2Title"), sub: t("menFeature2Sub"), icon: Zap },
    { title: t("menFeature3Title"), sub: t("menFeature3Sub"), icon: CheckCircle },
  ];

  const systems = [
    {
      title: t("menSystemLaceTitle"),
      sub: t("menSystemLaceSub"),
      img: "https://images.unsplash.com/photo-1599351431247-f132f82f23b9?w=800",
    },
    {
      title: t("menSystemSilkTitle"),
      sub: t("menSystemSilkSub"),
      img: "https://images.unsplash.com/photo-1519085188583-6ad28a745b55?w=800",
    },
    {
      title: t("menSystemMonoTitle"),
      sub: t("menSystemMonoSub"),
      img: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800",
    },
  ];

  const clientVideos = [
    "/assets/men_videos/client/AQMbGRmRf-JQbB3Unc3Bj93BfMm1HSVsgRZwDsO34tokz4OiVMfOZXE1j7HhEyCNnTVRk0fQgse_WW1IME-DEie3Y17l5_3PsoxHBI8.mp4",
    "/assets/men_videos/client/client2.mp4",
    "/assets/men_videos/client/client3.mp4",
  ];

  const faqVideos = [
    { url: "/assets/men_videos/faq/AQM_V0O2sDQQdQ-Th63DBVND77ply48FouNHfGupX1zLJzR6GsonUkSpYuKP4_JqRgkcBpBqaXDRa1xUAdFYaciofelkIazwwtHvJVA.mp4", title: "How to Select a Wig ?" },
    { url: "/assets/men_videos/faq/AQN6iH_qtr2W8Ekk7zMLOoFsyEcgxmK8YWTqqlSNEuClbHsbhNSjboatfkSdEdC5OYet0nDb_m6UKz8R_YmAS-6ajrqF7V5z5yhRW0E.mp4", title: "Natural Look Kaise ?" },
    { url: "/assets/men_videos/faq/AQNG9cCoBgj2qUZHdefqZP8fLk2ep0mKn3VV2jgx-oI_V2wTUT91nVDtglW6Krtl0tPgdoGGtO8y2G8MI2dt-6M3dWwbgZqR7ckwp_E.mp4", title: "Price of a Wig" },
    { url: "/assets/men_videos/faq/AQNKRGp2u3A1KX2njPtAXsES7dyvoCu4ag4d1Qjb5nJvg9UfVi46ftsUVndAhIfc43mh6kvmaXzGPRcrfFWuUiqxqVPUs_tFAmsRdXg.mp4", title: "Wig or Hair ?" },
    { url: "/assets/men_videos/faq/AQOZxDjq6uKhtO7WPqmKAf7ZYEMUveWIlmTx4751TKmzcN-1T1kmYtIRxAj3rsu-j598AeZBI36OrIJAi5_C1V1RR1M3agBZCaricXQ.mp4", title: "How to Fix a Wig ?" },
    { url: "/assets/men_videos/faq/AQP8yvb34GNoEpL5cSBdd3T1o6I6W_N_kxv4cwKQtTHCBsIiITdlv1ARDLfjuBsd_qlC-3Cfx-kcuH2C7MVryEVsmldAX6TRzC0SQGs.mp4", title: "Wig Maintanance" },
    { url: "/assets/men_videos/faq/AQPCCy5LrmfEHq8jfsOhSPSj4dkPS_pLPJYsuNYo4DErSvS66oni7IA9XOvsMyvziGYrTaxBGeTG5h2m81YZuM0w3BILWBb9IGJt6Kw.mp4", title: "Permanent Solution for Baldness" },
    { url: "/assets/men_videos/faq/AQPJo4GAj72lljtTotNDdrrgNLlBi-G3a8SXZ51WnCUK2DVVSh1zebymKroQZsdQD2pKwQrKHJnRBYLscBQ8vZfTfXh8yaVog-zK9NU.mp4", title: "Wig after care" },
  ];

  const informativeVideos = [
    { url: "/assets/men_videos/Informative Videos/AQM6qn7r7zzMSPhxGCM-8L1tifmWfSTMDstEK2qxOuB9kLvQ4Mj0sZa3gEQSr_9dIrQzKux2ZIPBZVArIjIDy5Z3GezRFvSjGIVt7ec.mp4", title: "Expert Advice" },
    { url: "/assets/men_videos/Informative Videos/AQMbGRmRf-JQbB3Unc3Bj93BfMm1HSVsgRZwDsO34tokz4OiVMfOZXE1j7HhEyCNnTVRk0fQgse_WW1IME-DEie3Y17l5_3PsoxHBI8.mp4", title: "Hair System Care" },
    { url: "/assets/men_videos/Informative Videos/AQPks84sC6Tpm7XJbul3oghyG0eajEW3CHFYz8IpR1HSmHZKEoje3mMGqXN8EP_Ra4c4G6Ic6m4oEPmPEncj4YZe3AdRuxIBEbi_XPw.mp4", title: "Maintenance Tips" },
  ];

  const clientReviews = [
    { url: "/assets/men_videos/Client Reviews/AQNDAmdCXPPLc-Ga0QATgkivUakLn8oonEQ-q9OJWVWuayMTncSbAjsv0BaCu-qnw9W0u7f57VuEW1K843awbPzNl-Iab0rT9ydnJWQ.mp4", title: "Rohan's Experience" },
    { url: "/assets/men_videos/Client Reviews/AQO9_TAgR4HOZVxBJO3JpxZXv0Zv4GiEFyWji8mhZwSXCYFuCVGFZq670vtrQ8Nk9IknnWQ5UyHwEOOH-cAVx3kubluHbtURlYQ8jcM.mp4", title: "Vikram's Review" },
    { url: "/assets/men_videos/Client Reviews/AQOuUnBp-OhxovNHkfdfG7_yRLcR-Ly-82bdkurhF0MapNO_YyKUkNCYcXq8h3G4T9Qpi1Qm9yz5ndX2EJL99WmbR9kjpBWo0qB6zA4.mp4", title: "Ankit's Transformation" },
  ];

  return (
    <div className="bg-white overflow-hidden selection:bg-eminence-gold selection:text-white">
      {/* HERO SECTION SLIDER */}
      <section className="relative h-auto overflow-hidden" ref={emblaRef}>
        <div className="flex w-full">
          {heroSlider.map((src, i) => (
            <div key={i} className="relative flex-[0_0_100%] min-w-0">
              <img
                src={src}
                alt={`Men's Transformation ${i + 1}`}
                className="w-full h-auto block"
              />
            </div>
          ))}
        </div>
      </section>

      {/* INFORMATIVE VIDEOS SECTION */}
      <section className="py-24 md:py-32 bg-eminence-surface">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-eminence-text mb-4">Informative Guides</h2>
            <p className="text-eminence-muted text-sm uppercase tracking-widest">Learn everything about your hair journey</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 max-w-[1500px] mx-auto">
            {informativeVideos.map((v, i) => (
              <div key={i} className="group relative aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl cursor-pointer">
                <video src={v.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500" />
                <div className="video-overlay transition-opacity duration-500">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:scale-110 transition-transform duration-500">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30 shadow-2xl">
                      <Play className="text-white fill-white ml-1" size={32} />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                    <h3 className="text-white font-serif text-2xl">{v.title}</h3>
                  </div>
                </div>
                <button
                  className="absolute inset-0 z-30"
                  onClick={(e) => {
                    const video = e.currentTarget.parentElement.querySelector('video');
                    const overlay = e.currentTarget.parentElement.querySelector('.video-overlay');
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
        </div>
      </section>

      {/* WHY CHOOSE SECTION */}
      <section className="py-24 md:py-32 bg-eminence-surface">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-20">
            <h2 className="font-serif text-4xl md:text-6xl text-eminence-text mb-6">
              {t("menWhyTitle")}
            </h2>
            <div className="w-16 h-px bg-eminence-gold mx-auto mb-8" />
            <p className="text-eminence-muted max-w-xl mx-auto text-sm md:text-base">
              {t("menWhySub")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {features.map((f, i) => (
              <div key={i} className="text-center space-y-6 group">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-eminence-border/30 group-hover:border-eminence-gold transition-colors duration-500">
                  <f.icon className="text-eminence-gold" size={32} strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-2xl text-eminence-text">{f.title}</h3>
                <p className="text-eminence-muted text-sm leading-relaxed px-4">{f.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLIENT VIDEOS (LOOP) */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-eminence-text mb-4">Real Transformations</h2>
            <p className="text-eminence-muted text-sm uppercase tracking-widest">Watch our clients' new look in action</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {clientVideos.map((v, i) => (
              <div key={i} className="aspect-[9/16] max-w-sm mx-auto w-full bg-black rounded-xl overflow-hidden shadow-2xl">
                <video src={v} autoPlay muted loop playsInline className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BEFORE/AFTER SLIDER */}
      <BeforeAfterSlider
        before="/assets/men_before.jpeg"
        after="/assets/men_after.jpeg"
        aspect="aspect-square"
      />

      {/* CLIENT REVIEWS SECTION */}
      <section className="py-24 md:py-32 bg-eminence-surface">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-eminence-text mb-4">What Our Clients Say</h2>
            <p className="text-eminence-muted text-sm uppercase tracking-widest">Real stories from real men</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 max-w-[1500px] mx-auto">
            {clientReviews.map((v, i) => (
              <div key={i} className="group relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl cursor-pointer">
                <video src={v.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500" />
                <div className="video-overlay transition-opacity duration-500">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:scale-110 transition-transform duration-500">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30 shadow-2xl">
                      <Play className="text-white fill-white ml-1" size={32} />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                    <h3 className="text-white font-serif text-2xl">{v.title}</h3>
                  </div>
                </div>
                <button
                  className="absolute inset-0 z-30"
                  onClick={(e) => {
                    const video = e.currentTarget.parentElement.querySelector('video');
                    const overlay = e.currentTarget.parentElement.querySelector('.video-overlay');
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
        </div>
      </section>

      {/* FAQ VIDEOS (ON CLICK) */}
      <section className="py-24 md:py-32 bg-eminence-surface">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-eminence-text mb-4">Common Questions</h2>
            <p className="text-eminence-muted text-sm uppercase tracking-widest">Video guides for your hair system</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {faqVideos.map((v, i) => (
              <div key={i} className="group relative aspect-[9/16] bg-black rounded-lg overflow-hidden cursor-pointer shadow-lg">
                <video src={v.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="faq-overlay absolute inset-0 bg-eminence-gold/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center group-hover:bg-eminence-gold/95 transition-all duration-500">
                  <p className="text-white text-xs md:text-sm lg:text-base uppercase tracking-[0.2em] font-bold leading-tight mb-6 drop-shadow-sm">
                    {v.title}
                  </p>
                  <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center border border-white/40 shadow-xl group-hover:scale-110 transition-transform duration-500">
                    <Play className="text-white fill-white ml-1" size={24} />
                  </div>
                </div>
                {/* Overlay that triggers play on click */}
                <button
                  className="absolute inset-0 z-30"
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
        </div>
      </section>

      {/* SYSTEMS GRID */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-20">
            <h2 className="font-serif text-4xl md:text-6xl text-eminence-text mb-6">
              {t("menSystemsTitle")}
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
            {[...menProducts, ...systems].slice(0, 6).map((item, i) => {
              const isProduct = !!item._id;
              const linkUrl = isProduct ? `/product/${item._id}` : "#";
              const imageSrc = isProduct ? (item.images?.[0] ? getMediaUrl(item.images[0]) : "https://images.unsplash.com/photo-1599351431247-f132f82f23b9?w=800") : item.img;
              const title = (isProduct ? item.name : item.title) || "Hair System";
              const sub = isProduct ? (item.description ? item.description.substring(0, 80) + "..." : "Premium quality hair replacement system.") : item.sub;

              return (
                <Link to={linkUrl} key={i} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 flex flex-col">
                  <div className="aspect-[4/5] overflow-hidden relative">
                    <img
                      src={imageSrc}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1599351431247-f132f82f23b9?w=800"; }}
                    />
                    {isProduct && (
                      <div className="absolute top-4 left-4 bg-eminence-gold text-white text-[9px] uppercase tracking-widest px-3 py-1 font-bold rounded-full">
                        Premium
                      </div>
                    )}
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-eminence-gold font-bold mb-4">
                      {isProduct ? (item.category || "Hair System") : "Handcrafted"}
                    </p>
                    <h3 className="font-serif text-2xl text-eminence-text mb-4 leading-tight group-hover:text-eminence-gold transition-colors">{title}</h3>
                    <p className="text-eminence-muted text-xs leading-relaxed mb-6 line-clamp-2">
                      {sub}
                    </p>
                    
                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                      {isProduct ? (
                        <span className="text-xl font-bold text-eminence-text">₹{item.price.toLocaleString("en-IN")}</span>
                      ) : (
                        <span className="text-[11px] uppercase tracking-widest text-eminence-gold font-bold">Consultation Required</span>
                      )}
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-eminence-gold transition-colors duration-500">
                        <ArrowRight size={14} className="text-eminence-muted group-hover:text-white" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROCESS TIMELINE */}
      <section className="py-24 md:py-32 bg-eminence-surfaceAlt">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <h2 className="font-serif text-4xl md:text-6xl text-eminence-text text-center mb-24">
            {t("menProcessTitle")}
          </h2>

          <div className="grid md:grid-cols-4 gap-8 md:gap-12">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex flex-col items-center text-center group">
                <div className="relative w-full aspect-[4/5] mb-8 overflow-hidden rounded-lg shadow-xl">
                  <img
                    src={`/assets/men_journey/step${step}.png`}
                    alt={t(`menStep${step}Title`)}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-full flex items-center justify-center text-eminence-gold font-serif text-2xl shadow-lg border-2 border-white">
                    {step}
                  </div>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                </div>
                <div>
                  <h4 className="font-serif text-2xl text-eminence-text mb-3">{t(`menStep${step}Title`)}</h4>
                  <p className="text-eminence-muted text-sm leading-relaxed px-4">{t(`menStep${step}Sub`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* FINAL CTA */}
      <section className="py-24 bg-eminence-text text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-eminence-gold/5 skew-x-12 transform translate-x-32" />
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12 text-center relative z-10">
          <h2 className="font-serif text-4xl md:text-7xl mb-10 leading-tight">
            Ready to change <br className="hidden md:block" /> your life?
          </h2>
          <Link to="/book" className="btn-light px-12 py-5 text-[11px] uppercase tracking-widest inline-flex items-center gap-4">
            {t("bookAppointment")}
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
