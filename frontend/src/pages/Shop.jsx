import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api, { getMediaUrl } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";
import { isProductForMen, isProductForWomen, isProductForAccessories } from "@/lib/genderUtils";

export default function Shop() {
  const { t } = useLang();
  const { search: query } = useLocation();
  const [products, setProducts] = useState([]);
  const [activeGender, setActiveGender] = useState("Women");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => { 
    const params = new URLSearchParams(query);
    const cat = params.get("category");
    if (cat) setFilter(cat);
    
    // Check for gender in query or default to Women
    const g = params.get("gender");
    if (g) setActiveGender(g.charAt(0).toUpperCase() + g.slice(1).toLowerCase());

    api.get("/products")
      .then((r) => setProducts(Array.isArray(r.data) ? r.data : []))
      .catch(err => {
        console.error("Failed to fetch products:", err);
        setProducts([]);
      });
  }, [query]);

  // (Removed local duplicate of isProductForMen)

  const getSubCategories = () => {
    if (!Array.isArray(products)) return ["All"];
    const relevantProducts = products.filter(p => {
      if (activeGender === "Men") return isProductForMen(p);
      if (activeGender === "Accessories") return isProductForAccessories(p);
      return isProductForWomen(p);
    });
    return ["All", ...new Set(relevantProducts.map(p => p.category).filter(Boolean))];
  };

  const cats = getSubCategories();
  const filtered = products.filter((p) => {
    let genderMatch = false;
    if (activeGender === "Men") genderMatch = isProductForMen(p);
    else if (activeGender === "Accessories") genderMatch = isProductForAccessories(p);
    else genderMatch = isProductForWomen(p);

    const categoryMatch = filter === "All" || p.category?.toLowerCase() === filter.toLowerCase();
    const searchMatch = search === "" || (p.name || "").toLowerCase().includes(search.toLowerCase());
    return genderMatch && categoryMatch && searchMatch;
  });

  return (
    <div className="bg-section-pattern min-h-screen">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 py-20" data-testid="shop-page">
      <div className="text-center mb-16">
        <p className="text-[11px] tracking-[0.4em] uppercase text-eminence-muted mb-4">{t("apothecary")}</p>
        <h1 className="font-serif text-4xl md:text-6xl text-eminence-text">{t("eminenceShop")}</h1>
        <p className="text-eminence-muted max-w-md mx-auto mt-6">{t("shopSub")}</p>
      </div>

      {/* TOP-LEVEL GENDER TABS */}
      <div className="flex justify-center gap-8 mb-12 border-b border-eminence-border/30 max-w-sm mx-auto pb-4">
        {["Women", "Men", "Accessories"].map((gender) => (
          <button
            key={gender}
            onClick={() => { setActiveGender(gender); setFilter("All"); }}
            className={`text-sm uppercase tracking-[0.4em] transition-all duration-300 ${activeGender === gender
                ? "text-eminence-gold font-bold scale-110"
                : "text-eminence-muted hover:text-eminence-text"
              }`}
          >
            {t(gender.toLowerCase())}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between border-b border-eminence-border pb-6 mb-12">
        <div className="flex flex-wrap gap-1">
          {cats.map((c) => {
            let label = c;
            if (c === "All") label = t("all");
            if (c.toLowerCase() === "men") label = t("mensGrooming");
            
            return (
              <button key={c} onClick={() => setFilter(c)} data-testid={`shop-filter-${c}`}
                className={`text-[11px] uppercase tracking-[0.18em] px-4 py-2 transition-colors ${filter === c ? "bg-eminence-text text-white" : "text-eminence-muted hover:text-eminence-text"}`}>
                {label}
              </button>
            );
          })}
        </div>
        <input type="search" placeholder={t("searchProducts")} value={search} onChange={(e) => setSearch(e.target.value)} data-testid="shop-search-input"
          className="border border-eminence-border px-4 py-2 text-sm w-full md:w-64 focus:outline-none focus:border-eminence-text" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {filtered.map((p) => (
          <Link to={`/shop/${p.id}`} key={p.id} className="product-card group block bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500" data-testid={`product-${p.id}`}>
                  {/* IMAGE/VIDEO WITH REVEAL HOVER */}
                  <div className="product-image-wrap aspect-[4/5] bg-eminence-surface overflow-hidden relative rounded-t-3xl">
                    {p.video_url ? (
                      <>
                        <video src={getMediaUrl(p.video_url)} className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0" autoPlay muted loop playsInline
                          onError={(e) => { e.target.style.display = "none"; }} />
                        {p.image_url && (
                          <img src={getMediaUrl(p.image_url)} alt={p.name} className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        )}
                      </>
                    ) : p.image_url ? (
                      <img src={getMediaUrl(p.image_url)} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&size=400&background=f5f0eb&color=2a2118&font-size=0.2&bold=true`;
                        }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-eminence-muted italic text-xs">{t("noProducts")}</div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* OUT OF STOCK OVERLAY */}
                    {p.stock === 0 && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                        <div className="border border-red-500 text-red-500 px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-white">
                          Out of Stock
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="product-info mt-6 text-center space-y-3 px-2 relative">
                    {p.stock <= 5 && p.stock > 0 && (
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                        Limited Stock
                      </span>
                    )}
                    <p className="text-[10px] uppercase tracking-[0.3em] text-eminence-gold font-bold">{p.category}</p>
                    <h3 className="font-serif text-lg text-eminence-text leading-tight group-hover:text-eminence-gold transition-colors duration-300 h-12 overflow-hidden">{p.name}</h3>
                    
                    {/* COLOR SELECTION SWATCHES */}
                    <div className="flex justify-center gap-2 py-1">
                      {["#1a1512", "#4a3728", "#8b6b4e", "#c5a076"].map((color, idx) => (
                        <div key={idx} className="w-3 h-3 rounded-full border border-eminence-border/50 p-0.5 hover:border-eminence-gold transition-colors cursor-pointer">
                          <div className="w-full h-full rounded-full" style={{ backgroundColor: color }} />
                        </div>
                      ))}
                    </div>

                    <p className="text-eminence-text font-medium text-lg">₹{p.price.toLocaleString("en-IN")}</p>
                  </div>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && <p className="text-eminence-muted text-center py-20">{t("noProducts")}</p>}
    </div>
    </div>
  );
}
