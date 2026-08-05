import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Calendar, User, Phone, Clock, Search, CheckCircle2, Scissors,
  XCircle, AlertCircle, Sparkles, UserCheck, DollarSign, CalendarCheck
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import BillingPanel from "@/components/BillingPanel";
import RecessControls from "@/components/RecessControls";

const STATUS_COLORS = {
  "pending": "bg-amber-50 text-amber-700 border-amber-200",
  "confirmed": "bg-blue-50 text-blue-700 border-blue-200",
  "completed": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "cancelled": "bg-rose-50 text-rose-700 border-rose-200"
};

export default function ServicePanel() {
  const { user, attendanceVerified, shiftCompleted } = useAuth();
  const { t } = useLang();
  const nav = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [leads, setLeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("my"); // "my", "unassigned", "today", "all", "billing"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "service") {
      toast.error("Unauthorized access to Service Panel");
      nav("/dashboard");
    }
  }, [user, nav]);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/bookings");
      setBookings(res.data);
    } catch (err) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await api.get("/leads?all=true");
      setLeads(res.data || []);
    } catch (err) {
      console.error("Failed to load leads", err);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    fetchLeads();
  }, [fetchBookings, fetchLeads]);

  const handleUpdateStatus = async (bid, status) => {
    try {
      await api.patch(`/bookings/${bid}`, { status });
      toast.success(`Booking marked as ${status}`);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update booking status");
    }
  };

  // --- Filtering & Stats ---
  const todayStr = new Date().toISOString().split("T")[0];

  const myBookings = bookings.filter(b => 
    b.stylist_id === user?.id || 
    (b.stylist_name && b.stylist_name.toLowerCase() === user?.name?.toLowerCase())
  );

  const unassignedBookings = bookings.filter(b => 
    !b.stylist_id || 
    b.stylist_name === "Any available" || 
    b.stylist_name?.toLowerCase() === "any available"
  );

  const todayBookings = bookings.filter(b => b.date === todayStr);

  const getFilteredBookings = () => {
    let list = bookings;
    if (activeTab === "my") list = myBookings;
    else if (activeTab === "unassigned") list = unassignedBookings;
    else if (activeTab === "today") list = todayBookings;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(b =>
        b.user_name?.toLowerCase().includes(q) ||
        b.service_name?.toLowerCase().includes(q) ||
        b.notes?.toLowerCase().includes(q) ||
        b.id?.toLowerCase().includes(q)
      );
    }
    return list;
  };

  // Statistics calculations
  const stats = {
    myTotal: myBookings.length,
    myPending: myBookings.filter(b => b.status === "pending").length,
    myCompleted: myBookings.filter(b => b.status === "completed").length,
    myToday: myBookings.filter(b => b.date === todayStr).length,
    earnings: myBookings
      .filter(b => b.status === "completed")
      .reduce((sum, b) => sum + (b.service_price || 0), 0)
  };

  const filteredList = getFilteredBookings();

  return (
    <div className="min-h-screen bg-[#F8F5F1] py-12 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Profile / Greeting Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <span className="bg-eminence-gold/10 text-eminence-gold p-2 rounded-xl">
                <Sparkles size={20} />
              </span>
              <p className="overline tracking-widest text-xs text-eminence-muted">Service Provider Portal</p>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl mt-2 text-gray-900">
              Welcome, {user?.name || "Stylist"}
            </h1>
            <p className="text-sm text-eminence-muted mt-1">
              Manage your schedule, update appointment statuses, and track your daily services.
            </p>
          </div>

          {/* Attendance indicator */}
          <div className="flex items-center justify-between gap-4 border border-eminence-border/30 p-4 rounded-2xl bg-gray-50/50 w-full md:w-auto">
            <div className="flex items-center gap-4">
              {shiftCompleted ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-800">Shift Completed</p>
                    <p className="text-[10px] text-blue-600">Check-out verified successfully</p>
                  </div>
                </>
              ) : attendanceVerified ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Attendance Logged</p>
                    <p className="text-[10px] text-emerald-600">You are verified for today</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-rose-800">Attendance Required</p>
                    <button 
                      onClick={() => { window.location.href = "/attendance-verify"; }}
                      className="text-[10px] text-eminence-gold font-bold hover:underline uppercase tracking-widest block mt-0.5"
                    >
                      Verify Now &rarr;
                    </button>
                  </div>
                </>
              )}
            </div>
            {attendanceVerified && !shiftCompleted && (
              <div className="flex items-center gap-4 ml-4">
                <RecessControls />
                <button
                  onClick={() => { window.location.href = "/consultancy"; }}
                  className="border border-eminence-gold text-eminence-gold hover:bg-eminence-gold hover:text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
                >
                  <Scissors size={14} /> Consultancy
                </button>
                <button
                  onClick={() => { window.location.href = "/attendance-verify?checkout=true"; }}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Complete Shift
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-2xl border-l-4 border-l-eminence-gold">
            <div className="flex justify-between items-center mb-4">
              <span className="overline text-xs text-eminence-muted">My Bookings</span>
              <Calendar size={18} className="text-eminence-gold" />
            </div>
            <p className="text-3xl font-serif text-gray-900">{stats.myTotal}</p>
            <p className="text-xs text-eminence-muted mt-1">Total appointments assigned to you</p>
          </div>

          <div className="glass-card p-6 rounded-2xl border-l-4 border-l-blue-500">
            <div className="flex justify-between items-center mb-4">
              <span className="overline text-xs text-eminence-muted">Pending Today</span>
              <Clock size={18} className="text-blue-500" />
            </div>
            <p className="text-3xl font-serif text-gray-900">{stats.myToday}</p>
            <p className="text-xs text-eminence-muted mt-1">Appointments scheduled for today</p>
          </div>

          <div className="glass-card p-6 rounded-2xl border-l-4 border-l-emerald-500">
            <div className="flex justify-between items-center mb-4">
              <span className="overline text-xs text-eminence-muted">Services Done</span>
              <CalendarCheck size={18} className="text-emerald-500" />
            </div>
            <p className="text-3xl font-serif text-gray-900">{stats.myCompleted}</p>
            <p className="text-xs text-eminence-muted mt-1">Completed bookings</p>
          </div>

          <div className="glass-card p-6 rounded-2xl border-l-4 border-l-gray-900">
            <div className="flex justify-between items-center mb-4">
              <span className="overline text-xs text-eminence-muted">Total Value</span>
              <DollarSign size={18} className="text-gray-900" />
            </div>
            <p className="text-3xl font-serif text-eminence-gold">₹{stats.earnings.toLocaleString("en-IN")}</p>
            <p className="text-xs text-eminence-muted mt-1">From completed bookings</p>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex gap-2 flex-wrap bg-white p-1 rounded-full border border-gray-200">
            {[
              { id: "my", label: "My Bookings" },
              { id: "today", label: "Today's Schedule" },
              { id: "unassigned", label: "Unassigned/General" },
              { id: "all", label: "All Bookings" }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${
                  activeTab === t.id ? "bg-gray-900 text-white shadow" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search client, service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-eminence-border rounded-xl focus:outline-none focus:border-eminence-gold text-sm"
            />
          </div>
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm animate-pulse text-eminence-muted uppercase tracking-[0.2em] text-xs">
            Loading your schedule...
          </div>
        ) : filteredList.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
            <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="font-serif text-xl text-gray-900 mb-1">No Bookings Found</h3>
            <p className="text-sm text-eminence-muted">There are no matches for your selected filter or search query.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredList.map((b) => (
              <div 
                key={b.id} 
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-4 flex-1">
                  {/* Header info */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-eminence-muted">
                      ID: #{b.id?.slice(0, 8)}
                    </span>
                    <span className="text-[10px] text-gray-300">&bull;</span>
                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] uppercase font-bold tracking-wider ${
                      STATUS_COLORS[b.status] || "bg-gray-50 border-gray-200 text-gray-600"
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Customer Info */}
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-eminence-muted font-bold">Client</p>
                      <h4 className="font-serif text-lg text-gray-900">{b.user_name || "Guest Customer"}</h4>
                      {b.user_email && <p className="text-xs text-eminence-muted flex items-center gap-1.5">{b.user_email}</p>}
                      {b.user_phone && (
                        <a href={`tel:${b.user_phone}`} className="text-xs text-eminence-gold hover:underline flex items-center gap-1.5 mt-1 font-medium">
                          <Phone size={12} /> {b.user_phone}
                        </a>
                      )}
                    </div>

                    {/* Service Info */}
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-eminence-muted font-bold">Service</p>
                      <h4 className="font-serif text-lg text-gray-900">{b.service_name}</h4>
                      <p className="text-sm font-bold text-eminence-gold">₹{(b.service_price || 0).toLocaleString("en-IN")}</p>
                      <p className="text-xs text-eminence-muted mt-1 font-medium">
                        Stylist: <span className="text-gray-950 font-bold">{b.stylist_name || "Any available"}</span>
                      </p>
                    </div>

                    {/* Date/Time Info */}
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-eminence-muted font-bold">Schedule</p>
                      <div className="flex items-center gap-2 text-gray-900 text-sm font-semibold mt-1">
                        <Calendar size={14} className="text-eminence-gold" />
                        <span>{new Date(b.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-eminence-muted text-xs mt-1">
                        <Clock size={14} />
                        <span>{b.time}</span>
                      </div>
                    </div>
                  </div>

                  {b.notes && (
                    <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-eminence-border/20 text-xs text-eminence-muted leading-relaxed">
                      <span className="font-bold text-gray-900 block mb-1">Notes:</span>
                      {b.notes}
                    </div>
                  )}
                </div>

                {/* Status action buttons */}
                <div className="flex flex-row sm:flex-col lg:flex-row gap-2 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100">
                  {b.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(b.id, "confirmed")}
                        className="flex-1 lg:flex-none bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(b.id, "cancelled")}
                        className="flex-1 lg:flex-none border border-rose-200 text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {b.status === "confirmed" && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(b.id, "completed")}
                        className="flex-1 lg:flex-none bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(b.id, "cancelled")}
                        className="flex-1 lg:flex-none border border-rose-200 text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {b.status === "completed" && (
                    <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-100">
                      <CheckCircle2 size={16} /> Completed
                    </div>
                  )}

                  {b.status === "cancelled" && (
                    <div className="flex items-center gap-1.5 text-rose-600 text-xs font-bold bg-rose-50 px-4 py-2.5 rounded-xl border border-rose-100">
                      <XCircle size={16} /> Cancelled
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
