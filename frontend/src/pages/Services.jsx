import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { Clock } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

export default function Services() {
  const { t } = useLang();
  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState("All");

  const [stylists, setStylists] = useState([]);

  useEffect(() => {
    api.get("/services").then((r) => setServices(r.data));
    api.get("/stylists").then((r) => setStylists(r.data));
  }, []);

  const cats = ["All", ...new Set(services.map((s) => s.category))];
  const filtered = filter === "All" ? services : services.filter((s) => s.category === filter);

  return (
    <div className="max-w-[1500px] mx-auto px-6 lg:px-12 py-20" data-testid="services-page">
      <div className="text-center mb-16">
        <p className="text-[11px] tracking-[0.4em] uppercase text-eminence-muted mb-4">{t("ourAtelier")}</p>
        <h1 className="font-serif text-4xl md:text-6xl font-light text-eminence-text">{t("servicesRituals")}</h1>
        <p className="text-eminence-muted max-w-md mx-auto mt-6">{t("servicesSub")}</p>
      </div>

      <div className="flex flex-wrap gap-1 justify-center mb-14 border-b border-eminence-border pb-6">
        {cats.map((c) => (
          <button key={c} onClick={() => setFilter(c)} data-testid={`filter-${c}`}
            className={`text-[11px] uppercase tracking-[0.18em] px-5 py-2 transition-colors ${filter === c ? "bg-eminence-text text-white" : "text-eminence-muted hover:text-eminence-text"}`}>
            {c === "All" ? t("home") : c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-32">
        {filtered.map((s) => (
          <div key={s.id} className="product-card flex flex-col bg-eminence-surface" data-testid={`service-${s.id}`}>
            {s.image_url && <div className="product-image-wrap aspect-[4/3]"><img src={s.image_url} alt={s.name} className="w-full h-full object-cover" /></div>}
            <div className="p-7 flex-1 flex flex-col">
              <p className="text-[10px] uppercase tracking-[0.3em] text-eminence-gold mb-2">{s.category}</p>
              <h3 className="font-serif text-2xl text-eminence-text mb-3">{s.name}</h3>
              <p className="text-eminence-muted text-sm leading-relaxed mb-6 flex-1">{s.description}</p>
              <div className="flex items-center justify-between border-t border-eminence-border pt-5">
                <div className="flex items-center gap-2 text-eminence-muted text-sm">
                  <Clock size={14} /> {s.duration_min} {t("min")}
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-eminence-muted">{t("from")}</div>
                  <div className="font-serif text-2xl text-eminence-text">₹{s.price.toLocaleString("en-IN")}</div>
                </div>
              </div>
              <Link to="/book" state={{ service: s }} className="btn-gold mt-5 text-center" data-testid={`book-${s.id}`}>{t("bookAppointment")}</Link>
            </div>
          </div>
        ))}
      </div>

      {/* STYLISTS PORTFOLIO */}
      <div className="mt-20">
        <div className="text-center mb-16">
          <p className="text-[11px] tracking-[0.4em] uppercase text-eminence-muted mb-4">{t("theTeam")}</p>
          <h2 className="font-serif text-4xl md:text-5xl font-light text-eminence-text">{t("ourArtisans")}</h2>
        </div>

        <div className="grid grid-cols-1 gap-20">
          {stylists.map((st) => (
            <div key={st.id} className="grid lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-4">
                <div className="aspect-[3/4] overflow-hidden mb-6">
                  <img src={st.image_url} alt={st.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-serif text-3xl mb-2">{st.name}</h3>
                <p className="text-eminence-gold text-xs uppercase tracking-widest mb-4">{st.role}</p>
                <p className="text-eminence-muted text-sm leading-relaxed mb-6">{st.bio}</p>
                <div className="flex flex-wrap gap-2">
                  {st.specialties.map((spec) => (
                    <span key={spec} className="px-3 py-1 bg-eminence-surface border border-eminence-border text-[10px] uppercase tracking-wider">{spec}</span>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-8">
                <p className="text-[10px] uppercase tracking-[0.2em] text-eminence-muted mb-6">{t("portfolioGallery")}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {st.portfolio && st.portfolio.length > 0 ? (
                    st.portfolio.map((img, idx) => (
                      <div key={idx} className="aspect-square overflow-hidden group cursor-pointer border border-eminence-border">
                        <img src={img} alt={`${st.name} work ${idx}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center border border-dashed border-eminence-border text-eminence-muted italic">
                      {t("portfolioSoon")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
