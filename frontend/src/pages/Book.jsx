import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api, { formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { useLang } from "@/context/LanguageContext";

const TIMES = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

export default function Book() {
  const { t } = useLang();
  const location = useLocation();
  const nav = useNavigate();
  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [serviceId, setServiceId] = useState(location.state?.service?.id || "");
  const [stylistId, setStylistId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/services").then((r) => setServices(r.data));
    api.get("/stylists").then((r) => setStylists(r.data));
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const submit = async (e) => {
    e.preventDefault();
    if (!serviceId || !date || !time) { toast.error(t("chooseServiceError")); return; }
    setLoading(true);
    try {
      await api.post("/bookings", { service_id: serviceId, stylist_id: stylistId || null, date, time, notes });
      toast.success(t("bookSuccess"));
      nav("/dashboard");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally { setLoading(false); }
  };

  const selectedService = services.find((s) => s.id === serviceId);

  return (
    <div className="max-w-[1100px] mx-auto px-6 lg:px-12 py-20" data-testid="book-page">
      <p className="overline mb-4">{t("reserve")}</p>
      <h1 className="font-serif text-5xl md:text-6xl font-light mb-10">{t("bookYourAppointment")}</h1>

      <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label className="overline block mb-3">{t("service")}</label>
            <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} required data-testid="book-service-select"
              className="w-full bg-eminence-surface border border-eminence-border px-4 py-3 text-eminence-text focus:outline-none focus:border-eminence-gold">
              <option value="">{t("selectService")}</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name} · ₹{s.price.toLocaleString("en-IN")}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="overline block mb-3">{t("stylist")}</label>
            <select value={stylistId} onChange={(e) => setStylistId(e.target.value)} data-testid="book-stylist-select"
              className="w-full bg-eminence-surface border border-eminence-border px-4 py-3 text-eminence-text focus:outline-none focus:border-eminence-gold">
              <option value="">{t("anyAvailable")}</option>
              {stylists.map((s) => (
                <option key={s.id} value={s.id}>{s.name} · {s.role}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="overline block mb-3">{t("date")}</label>
              <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} required data-testid="book-date-input"
                className="w-full bg-eminence-surface border border-eminence-border px-4 py-3 focus:outline-none focus:border-eminence-gold" />
            </div>
            <div>
              <label className="overline block mb-3">{t("time")}</label>
              <div className="grid grid-cols-5 gap-2">
                {TIMES.map((t_item) => (
                  <button key={t_item} type="button" onClick={() => setTime(t_item)} data-testid={`book-time-${t_item}`}
                    className={`text-xs py-2 border transition-colors ${time === t_item ? "bg-eminence-gold text-white border-eminence-gold" : "border-eminence-border text-eminence-muted hover:border-eminence-gold hover:text-eminence-gold"}`}>
                    {t_item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="overline block mb-3">{t("notes")}</label>
            <textarea rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} data-testid="book-notes-input"
              placeholder={t("notesPlaceholder")}
              className="w-full bg-eminence-surface border border-eminence-border px-4 py-3 text-eminence-text focus:outline-none focus:border-eminence-gold" />
          </div>
        </div>

        <aside className="eminence-card p-6 h-fit">
          <p className="overline mb-4">{t("summary")}</p>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-eminence-muted">{t("service")}</span><span>{selectedService?.name || "—"}</span></div>
            <div className="flex justify-between"><span className="text-eminence-muted">{t("duration")}</span><span>{selectedService?.duration_min || "—"} {t("min")}</span></div>
            <div className="flex justify-between"><span className="text-eminence-muted">{t("date")}</span><span>{date || "—"}</span></div>
            <div className="flex justify-between"><span className="text-eminence-muted">{t("time")}</span><span>{time || "—"}</span></div>
            <div className="border-t border-eminence-border pt-3 flex justify-between text-eminence-gold font-serif text-2xl">
              <span>{t("total")}</span>
              <span>₹{selectedService ? selectedService.price.toLocaleString("en-IN") : 0}</span>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-gold w-full mt-6" data-testid="book-submit-btn">
            {loading ? t("confirming") : t("confirmBooking")}
          </button>
          <p className="text-xs text-eminence-muted mt-4 leading-relaxed">{t("payAtSalon")}</p>
        </aside>
      </form>
    </div>
  );
}
