import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import api from "@/lib/api";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { downloadOrderInvoice } from "@/lib/utils";

const STATUS_COLORS = {
  pending: "text-yellow-400",
  confirmed: "text-eminence-gold",
  completed: "text-green-400",
  cancelled: "text-red-400",
  placed: "text-eminence-gold",
  shipped: "text-blue-400",
  delivered: "text-green-400",
};

export default function Dashboard() {
  const { t } = useLang();
  const { user } = useAuth();
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api.get("/bookings/me").then((r) => setBookings(r.data || [])).catch(() => setBookings([]));
    api.get("/orders/me").then((r) => setOrders(r.data || [])).catch(() => setOrders([]));
  }, []);

  const downloadInvoice = async (oid) => {
    try {
      await downloadOrderInvoice(api, oid);
    } catch (err) {
      toast.error("Failed to download invoice.");
    }
  };

  const tabs = [
    { k: "orders", label: t("orders") },
    { k: "profile", label: t("profile") },
  ];

  return (
    <div className="max-w-[1300px] mx-auto px-6 lg:px-12 py-20" data-testid="dashboard-page">
      <p className="overline mb-4">{t("account")}</p>
      <h1 className="font-serif text-5xl font-light mb-2">{t("welcome")}, {user?.name}.</h1>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <p className="text-eminence-muted">{t("manageAppts")}</p>
        
        {/* POINTS CARD */}
        <div className="bg-eminence-surfaceAlt border border-eminence-gold/20 p-5 px-8 flex items-center gap-6 shadow-sm rounded-sm">
          <div className="w-12 h-12 bg-eminence-gold/10 rounded-full flex items-center justify-center">
            <span className="text-eminence-gold font-serif text-2xl font-bold">★</span>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-eminence-muted mb-1">{t("yourLoyalty")}</p>
            <p className="font-serif text-3xl text-eminence-text">{user?.points || 0} <span className="text-sm font-sans font-light opacity-60">{t("points")}</span></p>
            <p className="text-[10px] text-eminence-gold mt-1 font-bold">{t("worth")}: ₹{((user?.points || 0) / 10).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* STAFF WORKSPACE ACCESS CARD */}
      {user && ["admin", "sales", "service", "receptionist"].includes(user.role) && (
        <div className="mb-12 bg-eminence-surfaceAlt border border-eminence-gold/30 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 rounded-sm shadow-sm" data-testid="staff-workspace-banner">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-eminence-gold font-bold bg-eminence-gold/10 px-3 py-1 rounded-sm">
              Staff Portal
            </span>
            <h3 className="font-serif text-2xl mt-3 text-eminence-text">Workspace Access</h3>
            <p className="text-sm text-eminence-muted mt-1">
              You are logged in with the <strong className="capitalize">{user.role}</strong> role. Click the button to open your specific management panel.
            </p>
          </div>
          <Link
            to={
              user.role === "admin"
                ? "/admin"
                : user.role === "sales"
                ? "/sales-panel"
                : user.role === "service"
                ? "/service-panel"
                : "/receptionist-panel"
            }
            className="btn-gold text-center whitespace-nowrap w-full md:w-auto px-6 py-3 font-medium uppercase tracking-[0.18em] text-xs hover:shadow-lg transition-all"
          >
            Go to {user.role === "admin" ? "Admin Panel" : user.role === "sales" ? "Sales Panel" : user.role === "service" ? "Service Panel" : "Receptionist Panel"}
          </Link>
        </div>
      )}

      <div className="flex gap-2 border-b border-eminence-border mb-10">
        {tabs.map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)} data-testid={`tab-${t.k}`}
            className={`px-5 py-3 text-xs uppercase tracking-[0.2em] border-b-2 -mb-px ${tab === t.k ? "border-eminence-gold text-eminence-gold" : "border-transparent text-eminence-muted hover:text-eminence-gold"}`}>
            {t.label}
          </button>
        ))}
      </div>


      {tab === "orders" && (
        <div className="space-y-3" data-testid="orders-list">
          {orders.length === 0 && <p className="text-eminence-muted">{t("noOrders")}</p>}
          {orders.map((o) => (
            <div key={o.id} className="eminence-card p-5" data-testid={`order-${o.id}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="overline mb-1">{t("order")}</p>
                  <p className="font-mono text-xs text-eminence-muted">#{o.id.slice(0, 8)}</p>
                </div>
                <div className="text-right">
                  <p className={`uppercase text-xs tracking-[0.2em] ${STATUS_COLORS[o.status] || "text-eminence-muted"}`}>{o.status}</p>
                  <p className="text-eminence-gold font-serif text-xl mt-1">₹{(o.total || 0).toLocaleString("en-IN")}</p>
                  
                  {o.points_earned > 0 && (
                    <p className="text-[9px] uppercase tracking-[0.1em] text-green-600 mt-1 font-bold">+{o.points_earned} {t("pointsEarnedShort")}</p>
                  )}
                  {o.points_used > 0 && (
                    <p className="text-[9px] uppercase tracking-[0.1em] text-blue-600 mt-1">-{o.points_used} {t("pointsUsed")}</p>
                  )}

                  <button onClick={() => downloadInvoice(o.id)} className="flex items-center gap-1 text-[10px] uppercase tracking-[0.1em] text-eminence-muted hover:text-eminence-gold mt-3 ml-auto">
                    <Download size={12} /> {t("invoice")}
                  </button>
                </div>
              </div>
              <div className="border-t border-eminence-border pt-3 space-y-1 text-sm">
                {o.items.map((it, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-eminence-muted">{it.name} × {it.quantity}</span>
                    <span>₹{(it.line_total || (it.price * it.quantity) || 0).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "profile" && (
        <div className="eminence-card p-8 max-w-xl" data-testid="profile-card">
          <p className="overline mb-2">{t("fullName")}</p><p className="font-serif text-2xl mb-6">{user?.name}</p>
          <p className="overline mb-2">{t("email")}</p><p className="text-eminence-muted mb-6">{user?.email}</p>
          <p className="overline mb-2">{t("phone")}</p><p className="text-eminence-muted mb-6">{user?.phone || t("notProvided")}</p>
          <p className="overline mb-2">{t("role")}</p><p className="text-eminence-muted mb-6">{user?.role}</p>
          <p className="overline mb-2">{t("currentPoints")}</p><p className="text-eminence-gold font-bold">{user?.points || 0} {t("points")}</p>
        </div>
      )}
    </div>
  );
}
