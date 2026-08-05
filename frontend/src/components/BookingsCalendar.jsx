import React, { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  confirmed: "bg-emerald-100 text-emerald-800 border-emerald-300",
  completed: "bg-eminence-text text-white border-eminence-text",
  cancelled: "bg-red-100 text-red-800 border-red-300",
};

const MONTH_NAMES = [
  "January","February","March","April","May","June","July","August","September","October","November","December",
];

function daysInMonth(y, m) {
  return new Date(y, m, 0).getDate();
}

function pad(n) { return n.toString().padStart(2, "0"); }

export default function BookingsCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-12
  const [data, setData] = useState({ days: {} });
  const [selected, setSelected] = useState(null);

  const load = async (y, m) => {
    try {
      const r = await api.get(`/admin/bookings/calendar?year=${y}&month=${m}`);
      setData(r.data);
    } catch {
      toast.error("Failed to load calendar");
    }
  };

  useEffect(() => { load(year, month); }, [year, month]);

  const totalDays = daysInMonth(year, month);
  const firstWeekday = new Date(year, month - 1, 1).getDay(); // 0=Sun

  const grid = useMemo(() => {
    const cells = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${pad(month)}-${pad(d)}`;
      cells.push({ d, dateStr, bookings: data.days[dateStr] || [] });
    }
    return cells;
  }, [year, month, totalDays, firstWeekday, data]);

  const prev = () => {
    if (month === 1) { setYear(year - 1); setMonth(12); }
    else setMonth(month - 1);
    setSelected(null);
  };
  const next = () => {
    if (month === 12) { setYear(year + 1); setMonth(1); }
    else setMonth(month + 1);
    setSelected(null);
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/bookings/${id}`, { status });
      toast.success("Updated");
      load(year, month);
    } catch {
      toast.error("Update failed");
    }
  };

  const todayKey = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const selectedBookings = selected ? (data.days[selected] || []) : [];

  return (
    <div className="space-y-6" data-testid="bookings-calendar">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={prev} className="p-2 border border-eminence-border hover:border-eminence-text" data-testid="cal-prev"><ChevronLeft size={16} /></button>
          <h3 className="font-serif text-2xl">{MONTH_NAMES[month - 1]} {year}</h3>
          <button onClick={next} className="p-2 border border-eminence-border hover:border-eminence-text" data-testid="cal-next"><ChevronRight size={16} /></button>
        </div>
        <div className="text-sm text-eminence-muted">
          Total this month: <span className="text-eminence-text font-semibold">{Object.values(data.days).reduce((s, arr) => s + arr.length, 0)}</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-eminence-border border border-eminence-border">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
          <div key={d} className="bg-eminence-surface text-center py-2 text-[10px] uppercase tracking-[0.2em] text-eminence-muted font-semibold">{d}</div>
        ))}
        {grid.map((cell, i) => {
          if (!cell) return <div key={`empty-${i}`} className="bg-white aspect-[5/4]" />;
          const isToday = cell.dateStr === todayKey;
          const isSel = cell.dateStr === selected;
          const cnt = cell.bookings.length;
          // detect conflict
          const slotMap = {};
          let hasConflict = false;
          cell.bookings.forEach(b => {
            const k = `${b.stylist_id || "any"}-${b.time}`;
            if (slotMap[k]) hasConflict = true;
            slotMap[k] = true;
          });
          return (
            <button
              key={cell.dateStr}
              onClick={() => setSelected(cell.dateStr)}
              data-testid={`cal-day-${cell.dateStr}`}
              className={`bg-white aspect-[5/4] p-2 text-left hover:bg-eminence-surface transition-colors ${isSel ? "ring-2 ring-eminence-text ring-inset" : ""}`}
            >
              <div className={`text-sm font-semibold ${isToday ? "text-eminence-gold" : "text-eminence-text"}`}>{cell.d}</div>
              {cnt > 0 && (
                <div className="mt-1">
                  <span className={`inline-block text-[10px] px-2 py-0.5 ${hasConflict ? "bg-red-100 text-red-800" : "bg-eminence-surfaceAlt text-eminence-text"}`}>
                    {cnt} {cnt === 1 ? "booking" : "bookings"}{hasConflict ? " · conflict" : ""}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="border border-eminence-border bg-white p-6" data-testid="cal-day-detail">
          <h4 className="font-serif text-xl mb-4">{selected} · {selectedBookings.length} {selectedBookings.length === 1 ? "booking" : "bookings"}</h4>
          {selectedBookings.length === 0 ? (
            <p className="text-eminence-muted text-sm">No bookings on this day.</p>
          ) : (
            <div className="space-y-2">
              {selectedBookings.map((b) => (
                <div key={b.id} className="flex items-center gap-4 p-3 border border-eminence-border" data-testid={`cal-booking-${b.id}`}>
                  <div className="w-20 font-mono text-sm text-eminence-text">{b.time}</div>
                  <div className="flex-1">
                    <div className="font-semibold">{b.user_name}</div>
                    <div className="text-xs text-eminence-muted">{b.service_name} · with {b.stylist_name}</div>
                  </div>
                  <select value={b.status} onChange={(e) => updateStatus(b.id, e.target.value)}
                    className={`text-[10px] uppercase tracking-wider px-2 py-1 border ${STATUS_COLORS[b.status] || ""}`}
                    data-testid={`cal-status-${b.id}`}>
                    {["pending","confirmed","completed","cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div className="w-20 text-right text-eminence-gold font-semibold">₹{b.service_price.toLocaleString("en-IN")}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
