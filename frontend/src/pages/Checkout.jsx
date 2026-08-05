import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import api, { formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { downloadOrderInvoice } from "@/lib/utils";

export default function Checkout() {
  const { t } = useLang();
  const { items, total, clear } = useCart();
  const { user, refresh } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    full_name: user?.name || "",
    phone: user?.phone || "",
    address: "",
    city: "Vadodara",
    pincode: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState(null);
  const [usePoints, setUsePoints] = useState(false);

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const pointsDiscount = usePoints ? Math.floor((user?.points || 0) / 10) : 0;
  const finalTotal = Math.max(0, total - pointsDiscount);
  const pointsEarned = Math.floor(finalTotal / 100 * 2);

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

  const submit = async (e) => {
    e.preventDefault();
    if (items.length === 0) { toast.error(t("nothingHere")); return; }
    setLoading(true);

    const placeOrder = async (txnId = "") => {
      try {
        const payload = {
          items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
          points_used: usePoints ? user?.points || 0 : 0,
          ...form,
        };
        
        if (txnId) {
          payload.payment_method = "Razorpay";
          payload.split_payments = [{ method: "Razorpay", amount: finalTotal, txn_id: txnId }];
        }

        const res = await api.post("/orders", payload);
        setSuccessId(res.data.id);
        clear();
        if (refresh) refresh();
        toast.success(t("orderPlaced"));
      } catch (err) {
        toast.error(formatApiError(err));
      } finally { setLoading(false); }
    };

    if (finalTotal > 0) {
      try {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          setLoading(false);
          return toast.error("Razorpay SDK failed to load. Are you online?");
        }

        const orderResp = await api.post("/razorpay/create_order", { amount: finalTotal });
        const { id: razorpayOrderId, amount: orderAmount } = orderResp.data;

        let keyId = process.env.REACT_APP_RAZORPAY_KEY_ID;
        if (!keyId) {
          const configResp = await api.get("/razorpay/config");
          keyId = configResp.data.key_id;
        }

        const options = {
          key: keyId,
          amount: orderAmount,
          currency: "INR",
          name: "Eminence Salon",
          description: "Product Purchase",
          order_id: razorpayOrderId,
          prefill: {
            name: form.full_name || "Client",
            contact: form.phone || ""
          },
          theme: { color: "#D4AF37" },
          handler: async function (response) {
            try {
              await api.post("/razorpay/verify", {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              });
              toast.success("Payment verified successfully!");
              await placeOrder(response.razorpay_payment_id);
            } catch (err) {
              setLoading(false);
              toast.error("Payment verification failed.");
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response) {
          setLoading(false);
          toast.error(`Payment failed: ${response.error.description}`);
        });
        rzp.open();
      } catch (err) {
        console.error(err);
        setLoading(false);
        toast.error("Failed to initiate Razorpay: " + (err.response?.data?.detail || err.message));
      }
    } else {
      await placeOrder();
    }
  };

  if (successId) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-40 text-center">
        <div className="inline-block w-20 h-20 bg-eminence-gold/10 rounded-full flex items-center justify-center mb-8 mx-auto">
          <svg className="w-10 h-10 text-eminence-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 className="font-serif text-5xl font-light mb-4">{t("orderPlaced")}</h1>
        <p className="text-eminence-muted text-lg mb-12">
          {t("orderConfirmed").replace("{name}", form.full_name).replace("{id}", successId.slice(0, 8))}
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button onClick={async () => {
            try {
              await downloadOrderInvoice(api, successId);
            } catch (err) {
              toast.error("Failed to generate invoice.");
            }
          }} className="btn-gold px-8">
            {t("downloadInvoice")}
          </button>
          <button onClick={() => nav("/dashboard")} className="px-8 py-4 border border-eminence-border hover:bg-eminence-surface transition-colors uppercase text-xs tracking-[0.2em]">
            {t("viewOrders")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-20" data-testid="checkout-page">
      <p className="overline mb-4">{t("finalTouch")}</p>
      <h1 className="font-serif text-5xl font-light mb-12">{t("checkout")}</h1>
      <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-5">
          {[
            { k: "full_name", label: t("fullName"), req: true },
            { k: "phone", label: t("phone"), req: true },
            { k: "address", label: t("address"), req: true, full: true },
            { k: "city", label: t("city"), req: true },
            { k: "pincode", label: t("pincode"), req: true },
          ].map((f) => (
            <div key={f.k}>
              <label className="overline block mb-2">{f.label}</label>
              <input type="text" required={f.req} value={form[f.k]} onChange={onChange(f.k)} data-testid={`checkout-${f.k}`}
                className="w-full bg-eminence-surface border border-eminence-border px-4 py-3 focus:outline-none focus:border-eminence-gold" />
            </div>
          ))}
          <div>
            <label className="overline block mb-2">{t("notes")}</label>
            <textarea rows="3" value={form.notes} onChange={onChange("notes")} data-testid="checkout-notes"
              className="w-full bg-eminence-surface border border-eminence-border px-4 py-3 focus:outline-none focus:border-eminence-gold" />
          </div>

          {/* LOYALTY POINTS */}
          <div className="bg-eminence-surfaceAlt/50 p-6 border border-eminence-gold/20 rounded-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-serif text-xl text-eminence-text mb-1">{t("loyaltyRewards")}</p>
                {user ? (
                  <p className="text-xs text-eminence-muted uppercase tracking-wider">
                    {t("currentBalance")} <span className="text-eminence-gold font-bold">{user.points || 0} {t("points")}</span> 
                    {user.points > 0 ? ` (${t("worth")} ₹${((user.points || 0)/10).toFixed(2)})` : ` (${t("shopToEarn")})`}
                  </p>
                ) : (
                  <p className="text-xs text-eminence-muted uppercase tracking-wider">{t("loginToUsePoints")}</p>
                )}
              </div>
              {user && user.points > 0 ? (
                <button 
                  type="button"
                  onClick={() => setUsePoints(!usePoints)}
                  className={`px-6 py-2.5 text-[10px] uppercase tracking-[0.2em] font-bold transition-all ${
                    usePoints 
                    ? "bg-eminence-gold text-white" 
                    : "border border-eminence-gold text-eminence-gold hover:bg-eminence-gold/5"
                  }`}
                >
                  {usePoints ? t("pointsApplied") : t("usePoints")}
                </button>
              ) : user && (
                <div className="px-6 py-2.5 text-[9px] uppercase tracking-[0.2em] font-bold text-eminence-muted border border-dashed border-eminence-border">
                  {t("noPoints")}
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-eminence-muted">{t("codNotice")}</p>
        </div>

        <aside className="eminence-card p-6 h-fit">
          <p className="overline mb-4">{t("orderSummary")}</p>
          <div className="space-y-3 mb-6">
            {items.map((it) => (
              <div key={it.id} className="flex justify-between text-sm">
                <span className="text-eminence-muted">{it.name} × {it.quantity}</span>
                <span>₹{(it.price * it.quantity).toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 border-t border-eminence-border pt-4 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-eminence-muted">{t("subtotal")}</span>
              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>
            {usePoints && pointsDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>{t("pointsDiscount")}</span>
                <span>-₹{pointsDiscount.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between font-serif text-2xl text-eminence-gold pt-2 border-t border-eminence-border/30">
              <span>{t("total")}</span>
              <span>₹{finalTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="bg-eminence-surface p-4 border border-eminence-border/50 mb-6 text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-eminence-muted mb-1">{t("pointsEarned")}</p>
            <p className="text-lg text-eminence-gold font-bold">+{pointsEarned} {t("points")}</p>
          </div>

          <button type="submit" disabled={loading} className="btn-gold w-full" data-testid="checkout-submit-btn">
            {loading ? t("placing") : t("placeOrder")}
          </button>
        </aside>
      </form>
    </div>
  );
}
