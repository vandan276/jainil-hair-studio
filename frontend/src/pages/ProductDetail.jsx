import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api, { getMediaUrl } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useLang } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Minus, Plus, ChevronLeft } from "lucide-react";

const DEMO_REVIEWS = [
  { id: "d1", rating: 5, comment: "Absolutely stunning quality! The texture is so natural and it blends perfectly with my hair. Highly recommend!", user_name: "Sarah M.", created_at: new Date().toISOString() },
  { id: "d2", rating: 5, comment: "The best extensions I've ever used. Salon-grade quality that lasts. Worth every rupee!", user_name: "Priya S.", created_at: new Date().toISOString() },
  { id: "d3", rating: 4, comment: "Very happy with the purchase. The color match is excellent and the customer support was very helpful.", user_name: "Anjali K.", created_at: new Date().toISOString() }
];

export default function ProductDetail() {
  const { t } = useLang();
  const { user } = useAuth();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const { add } = useCart();

  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editReviewData, setEditReviewData] = useState({ rating: 5, comment: "" });
  const [updatingReview, setUpdatingReview] = useState(false);

  const [activeMedia, setActiveMedia] = useState(null);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((r) => {
        setProduct(r.data);
        setActiveMedia(r.data.video_url || r.data.image_url);
      })
      .catch(() => {});
    api.get(`/products/${id}/reviews`)
      .then((r) => {
        const fetched = Array.isArray(r.data) ? r.data : [];
        setReviews(fetched.length > 0 ? fetched : DEMO_REVIEWS);
      })
      .catch(() => setReviews(DEMO_REVIEWS));
  }, [id]);

  const [selectedColor, setSelectedColor] = useState("#1a1512");
  const COLORS = [
    { name: "Natural Black", hex: "#1a1512" },
    { name: "Dark Brown", hex: "#4a3728" },
    { name: "Medium Brown", hex: "#8b6b4e" },
    { name: "Golden Blonde", hex: "#c5a076" },
  ];

  if (!product) return <div className="max-w-[1400px] mx-auto px-6 py-20 text-eminence-muted font-serif">✦ Loading…</div>;

  const onAdd = () => {
    const colorName = COLORS.find(c => c.hex === selectedColor)?.name;
    add({ ...product, selectedColor: colorName }, qty);
    toast.success(`${product.name} (${colorName}) added to cart.`);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!newReview.comment.trim()) return;
    setSubmitting(true);
    try {
      const r = await api.post(`/products/${id}/reviews`, newReview);
      setReviews([r.data, ...reviews]);
      setNewReview({ rating: 5, comment: "" });
      toast.success("Review submitted!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login to leave a review.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (review) => {
    setEditingReviewId(review.id);
    setEditReviewData({ rating: review.rating, comment: review.comment });
  };

  const cancelEdit = () => {
    setEditingReviewId(null);
    setEditReviewData({ rating: 5, comment: "" });
  };

  const saveEdit = async (reviewId) => {
    if (!editReviewData.comment.trim()) return;
    setUpdatingReview(true);
    try {
      const response = await api.patch(`/reviews/${reviewId}`, editReviewData);
      setReviews(reviews.map((r) => (r.id === reviewId ? response.data : r)));
      toast.success("Review updated successfully!");
      cancelEdit();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update review.");
    } finally {
      setUpdatingReview(false);
    }
  };

  // Combine all images and video for the gallery
  const gallery = [];
  if (product.video_url) gallery.push({ url: product.video_url, type: "video" });
  if (product.image_url) gallery.push({ url: product.image_url, type: "image" });
  if (product.images && product.images.length > 0) {
    product.images.forEach(img => gallery.push({ url: img, type: "image" }));
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-20" data-testid="product-detail-page">
      <Link to="/shop" className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-eminence-muted hover:text-eminence-gold mb-10" data-testid="back-to-shop">
        <ChevronLeft size={14} /> Shop
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* GALLERY THUMBS */}
        <div className="lg:col-span-1 order-2 lg:order-1 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
          {gallery.map((m, idx) => (
            <button key={idx} onClick={() => setActiveMedia(m.url)}
              className={`flex-shrink-0 w-20 h-20 border-2 transition-all ${activeMedia === m.url ? "border-eminence-gold scale-105" : "border-transparent opacity-60 hover:opacity-100"}`}>
              {m.type === "video" ? (
                <div className="w-full h-full bg-black flex items-center justify-center text-[10px] text-white">VIDEO</div>
              ) : (
                <img src={getMediaUrl(m.url)} className="w-full h-full object-cover" alt="" />
              )}
            </button>
          ))}
        </div>

        {/* MAIN VIEW */}
        <div className="lg:col-span-6 order-1 lg:order-2 aspect-square bg-eminence-surface overflow-hidden border border-eminence-border/30">
          {activeMedia?.match(/\.(mp4|webm|ogg)$/i) || gallery.find(g => g.url === activeMedia)?.type === "video" ? (
            <video key={activeMedia} src={getMediaUrl(activeMedia)} className="w-full h-full object-cover" autoPlay muted loop playsInline
              onError={(e) => { e.target.style.display = "none"; }} />
          ) : activeMedia ? (
            <img key={activeMedia} src={getMediaUrl(activeMedia)} alt={product.name} className="w-full h-full object-cover animate-fade-in"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&size=800&background=f5f0eb&color=2a2118&font-size=0.15&bold=true`;
              }} />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-eminence-muted gap-3">
              <span className="text-6xl opacity-10">✦</span>
              <span className="text-xs uppercase tracking-widest">No Image</span>
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="lg:col-span-5 order-3">
          <p className="overline mb-3">{product.category}</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light leading-tight mb-4">{product.name}</h1>
          <p className="font-serif text-3xl text-eminence-gold mb-6">₹{product.price.toLocaleString("en-IN")}</p>
          {/* PRODUCT INFO ACCORDIONS */}
          <div className="border-t border-eminence-border/30 mt-12 pt-8 space-y-6">
            <details className="group">
              <summary className="list-none flex items-center justify-between cursor-pointer py-2">
                <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-eminence-text">{t("description")}</span>
                <Plus size={14} className="group-open:hidden text-eminence-gold" />
                <Minus size={14} className="hidden group-open:block text-eminence-gold" />
              </summary>
              <div className="mt-6 text-eminence-muted text-sm leading-relaxed whitespace-pre-line animate-fade-down">
                {product.description}
              </div>
            </details>

            <details className="group">
              <summary className="list-none flex items-center justify-between cursor-pointer py-2 border-t border-eminence-border/10 pt-6">
                <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-eminence-text">{t("specifications")}</span>
                <Plus size={14} className="group-open:hidden text-eminence-gold" />
                <Minus size={14} className="hidden group-open:block text-eminence-gold" />
              </summary>
              <div className="mt-6 text-eminence-muted text-sm leading-relaxed animate-fade-down">
                <ul className="space-y-3">
                  <li className="flex justify-between border-b border-eminence-border/5 pb-2">
                    <span className="opacity-60">{t("material")}</span>
                    <span className="font-medium">{t("premiumHair")}</span>
                  </li>
                  <li className="flex justify-between border-b border-eminence-border/5 pb-2">
                    <span className="opacity-60">{t("style")}</span>
                    <span className="font-medium">{t("salonFinish")}</span>
                  </li>
                  <li className="flex justify-between border-b border-eminence-border/5 pb-2">
                    <span className="opacity-60">{t("durability")}</span>
                    <span className="font-medium">{t("longLasting")}</span>
                  </li>
                </ul>
              </div>
            </details>

            <details className="group">
              <summary className="list-none flex items-center justify-between cursor-pointer py-2 border-t border-eminence-border/10 pt-6">
                <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-eminence-text">{t("shippingReturns")}</span>
                <Plus size={14} className="group-open:hidden text-eminence-gold" />
                <Minus size={14} className="hidden group-open:block text-eminence-gold" />
              </summary>
              <div className="mt-6 text-eminence-muted text-sm leading-relaxed animate-fade-down">
                <p>{t("freeShipIndia")}</p>
                <p className="mt-4">{t("hygienePolicy")}</p>
              </div>
            </details>
          </div>

          {/* COLOR SELECTION */}
          <div className="mb-10">
            <label className="text-[10px] uppercase tracking-[0.3em] text-eminence-muted block mb-4 font-bold">{t("selectColor")}</label>
            <div className="flex gap-4">
              {COLORS.map((c) => (
                <button 
                  key={c.hex} 
                  onClick={() => setSelectedColor(c.hex)}
                  className={`group relative flex flex-col items-center gap-2`}
                >
                  <div className={`w-8 h-8 rounded-full border-2 p-1 transition-all ${selectedColor === c.hex ? "border-eminence-gold scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"}`}>
                    <div className="w-full h-full rounded-full" style={{ backgroundColor: c.hex }} />
                  </div>
                  <span className={`text-[8px] uppercase tracking-wider transition-opacity ${selectedColor === c.hex ? "opacity-100 font-bold" : "opacity-0"}`}>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6 mb-12">
            <span className="overline">{t("qty")}</span>
            <div className={`flex items-center border border-eminence-border ${product.stock === 0 ? "opacity-30 pointer-events-none" : ""}`}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:text-eminence-gold" data-testid="qty-minus"><Minus size={14} /></button>
              <span className="px-4" data-testid="qty-value">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className={`px-3 py-2 hover:text-eminence-gold ${qty >= product.stock ? "opacity-30 pointer-events-none" : ""}`} data-testid="qty-plus"><Plus size={14} /></button>
            </div>
            {product.stock > 0 && product.stock <= 5 && <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Only {product.stock} left!</span>}
          </div>

          <button 
            onClick={onAdd} 
            disabled={product.stock === 0}
            className={`w-full md:w-auto ${product.stock === 0 ? "bg-gray-200 text-gray-500 cursor-not-allowed px-12 py-5 uppercase tracking-widest text-[11px]" : "btn-gold"}`} 
            data-testid="add-to-cart-btn"
          >
            {product.stock === 0 ? "Out of Stock" : t("addToCart")}
          </button>

          <div className="mt-12 border-t border-eminence-border pt-6 grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="overline mb-1">{t("stock")}</p>
              <p className={`${product.stock === 0 ? "text-red-500 font-bold" : "text-eminence-muted"}`}>
                {product.stock === 0 ? "Out of Stock" : `${product.stock} ${t("units")}`}
              </p>
            </div>
            <div><p className="overline mb-1">{t("delivery")}</p><p className="text-eminence-muted">3–5 days · Vadodara</p></div>
          </div>
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <div className="mt-24 max-w-4xl">
        <h2 className="font-serif text-3xl mb-12">{t("guestReviews")}</h2>
        
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            {reviews.length === 0 ? (
              <p className="text-eminence-muted italic">{t("noReviews")}</p>
            ) : (
              <div className="space-y-8">
                {reviews.map((r) => (
                  <div key={r.id} className="border-b border-eminence-border pb-6 last:border-0" data-testid={`review-${r.id}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <p className="font-medium">{r.user_name}</p>
                        {user && (r.user_id === user.id || user.role === "admin") && editingReviewId !== r.id && (
                          <button onClick={() => startEdit(r)} className="text-xs text-eminence-gold hover:underline uppercase tracking-wider text-[10px]" data-testid={`edit-review-btn-${r.id}`}>
                            {t("edit") || "Edit"}
                          </button>
                        )}
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < r.rating ? "text-eminence-gold" : "text-eminence-border"}>★</span>
                        ))}
                      </div>
                    </div>
                    {editingReviewId === r.id ? (
                      <div className="bg-eminence-surface p-4 border border-eminence-border space-y-4 mt-2">
                        <div>
                          <label className="text-[9px] uppercase tracking-[0.2em] mb-1.5 block">{t("rating")}</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button key={s} type="button" onClick={() => setEditReviewData({ ...editReviewData, rating: s })}
                                className={`text-xl transition-colors ${s <= editReviewData.rating ? "text-eminence-gold" : "text-eminence-border"}`}>
                                ★
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-[9px] uppercase tracking-[0.2em] mb-1.5 block">{t("comment")}</label>
                          <textarea value={editReviewData.comment} onChange={(e) => setEditReviewData({ ...editReviewData, comment: e.target.value })}
                            className="w-full bg-transparent border border-eminence-border p-3 text-sm focus:border-eminence-gold outline-none h-20 resize-none"
                            placeholder={t("comment")}></textarea>
                        </div>
                        <div className="flex gap-3 justify-end text-xs">
                          <button onClick={cancelEdit} disabled={updatingReview} className="px-4 py-2 border border-eminence-border text-eminence-muted hover:text-white uppercase tracking-wider text-[10px]">
                            {t("cancel") || "Cancel"}
                          </button>
                          <button onClick={() => saveEdit(r.id)} disabled={updatingReview} className="btn-gold px-4 py-2 uppercase tracking-wider text-[10px]">
                            {updatingReview ? (t("saving") || "Saving...") : (t("save") || "Save")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-eminence-muted leading-relaxed">{r.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-eminence-surface p-8 border border-eminence-border h-fit">
            <h3 className="font-serif text-xl mb-6">{t("writeReview")}</h3>
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] mb-2 block">{t("rating")}</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} type="button" onClick={() => setNewReview({ ...newReview, rating: s })}
                      className={`text-2xl transition-colors ${s <= newReview.rating ? "text-eminence-gold" : "text-eminence-border"}`}>
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] mb-2 block">{t("comment")}</label>
                <textarea value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="w-full bg-transparent border border-eminence-border p-3 text-sm focus:border-eminence-gold outline-none h-24 resize-none"
                  placeholder={t("comment")}></textarea>
              </div>
              <button type="submit" disabled={submitting} className="btn-gold w-full text-xs uppercase tracking-widest">
                {submitting ? t("posting") : t("postReview")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
