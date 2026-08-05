import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { Trash2 } from "lucide-react";

export default function Cart() {
  const { t } = useLang();
  const { items, updateQty, remove, total } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-[1100px] mx-auto px-6 py-32 text-center" data-testid="cart-empty">
        <p className="overline mb-4">{t("cart")}</p>
        <h1 className="font-serif text-5xl md:text-6xl font-light mb-6">{t("nothingHere")}</h1>
        <Link to="/shop" className="btn-gold" data-testid="cart-shop-btn">{t("browseShop")}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-20" data-testid="cart-page">
      <p className="overline mb-4">{t("yourBag")}</p>
      <h1 className="font-serif text-5xl font-light mb-12">{t("cart")} ({items.length})</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          {items.map((it) => (
            <div key={it.id} className="eminence-card p-4 flex gap-4 items-center" data-testid={`cart-item-${it.id}`}>
              {it.image_url && <img src={it.image_url} alt={it.name} className="w-24 h-24 object-cover" />}
              <div className="flex-1">
                <p className="overline mb-1">{it.category}</p>
                <h3 className="font-serif text-xl">{it.name}</h3>
                <p className="text-eminence-gold mt-1">₹{it.price.toLocaleString("en-IN")}</p>
              </div>
              <div className="flex items-center border border-eminence-border">
                <button onClick={() => updateQty(it.id, it.quantity - 1)} className="px-3 py-1 hover:text-eminence-gold" data-testid={`cart-minus-${it.id}`}>−</button>
                <span className="px-3">{it.quantity}</span>
                <button onClick={() => updateQty(it.id, it.quantity + 1)} className="px-3 py-1 hover:text-eminence-gold" data-testid={`cart-plus-${it.id}`}>+</button>
              </div>
              <button onClick={() => remove(it.id)} className="text-eminence-muted hover:text-eminence-gold" data-testid={`cart-remove-${it.id}`}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        <aside className="eminence-card p-6 h-fit">
          <p className="overline mb-4">{t("summary")}</p>
          <div className="flex justify-between mb-2 text-sm"><span className="text-eminence-muted">{t("subtotal")}</span><span>₹{total.toLocaleString("en-IN")}</span></div>
          <div className="flex justify-between mb-4 text-sm"><span className="text-eminence-muted">{t("shipping")}</span><span>{t("free")}</span></div>
          <div className="border-t border-eminence-border pt-4 flex justify-between font-serif text-2xl text-eminence-gold mb-6">
            <span>{t("total")}</span><span>₹{total.toLocaleString("en-IN")}</span>
          </div>
          <button onClick={() => nav(user ? "/checkout" : "/login")} className="btn-gold w-full" data-testid="cart-checkout-btn">{t("checkout")}</button>
        </aside>
      </div>
    </div>
  );
}
