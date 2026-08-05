import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { 
  Calendar, 
  User, 
  Phone, 
  Clock, 
  Search, 
  Trash2, 
  Scissors, 
  UserPlus, 
  Sparkles, 
  FileText, 
  CheckCircle,
  XCircle,
  AlertCircle,
  X
} from "lucide-react";

const TIMES = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
const STATUSES = ["pending", "confirmed", "completed", "cancelled"];

export default function ReceptionistPanel() {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Form State
  const [isGuest, setIsGuest] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [serviceSearchQuery, setServiceSearchQuery] = useState("");
  const [stylistId, setStylistId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    // Load initial lookup data
    api.get("/services").then((r) => setServices(r.data)).catch(console.error);
    api.get("/stylists").then((r) => setStylists(r.data)).catch(console.error);
    api.get("/receptionist/users").then((r) => setUsers(r.data)).catch(console.error);
  }, []);

  useEffect(() => {
    // Load bookings
    setLoading(true);
    api.get("/receptionist/bookings")
      .then((r) => setBookings(r.data))
      .catch((err) => toast.error("Failed to load appointments: " + formatApiError(err)))
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  const today = new Date().toISOString().split("T")[0];

  // Handle customer selection from users dropdown
  const handleUserSelect = (uid) => {
    setSelectedUserId(uid);
    if (!uid) {
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      return;
    }
    const found = users.find(u => u.id === uid);
    if (found) {
      setCustomerName(found.name || "");
      setCustomerPhone(found.phone || "");
      setCustomerEmail(found.email || "");
    }
  };

  // Submit Booking Form
  const handleBook = async (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone || selectedServiceIds.length === 0 || !date || !time) {
      toast.error("Please fill in all required fields (Name, Phone, Services, Date, Time)");
      return;
    }

    try {
      setLoading(true);
      const promises = selectedServiceIds.map(sid => {
        const payload = {
          user_id: isGuest ? null : selectedUserId,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
          service_id: sid,
          stylist_id: stylistId || null,
          date,
          time,
          notes
        };
        return api.post("/receptionist/bookings", payload);
      });

      await Promise.all(promises);
      toast.success(`${selectedServiceIds.length} service appointment(s) booked successfully!`);
      
      // Reset form
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setSelectedUserId("");
      setSelectedServiceIds([]);
      setStylistId("");
      setDate("");
      setTime("");
      setNotes("");
      setIsGuest(true);
      
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      toast.error("Failed to book appointment: " + formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  // Assign or reassign Stylist to Booking
  const handleAssignStylist = async (bookingId, stId) => {
    try {
      await api.patch(`/receptionist/bookings/${bookingId}/assign`, { stylist_id: stId || null });
      toast.success("Stylist updated successfully!");
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      toast.error("Failed to assign stylist: " + formatApiError(err));
    }
  };

  // Change Booking Status
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await api.patch(`/bookings/${bookingId}`, { status: newStatus });
      toast.success("Booking status updated!");
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      toast.error("Failed to update status: " + formatApiError(err));
    }
  };

  // Cancel Booking
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.patch(`/bookings/${bookingId}`, { status: "cancelled" });
      toast.success("Booking cancelled successfully.");
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      toast.error("Failed to cancel booking: " + formatApiError(err));
    }
  };

  // Filter Bookings
  const filteredBookings = bookings.filter(b => {
    const nameMatch = (b.user_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const phoneMatch = (b.user_phone || b.phone || "").toLowerCase().includes(searchQuery.toLowerCase());
    const serviceMatch = (b.service_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSearch = nameMatch || phoneMatch || serviceMatch;
    const matchesDate = !dateFilter || b.date === dateFilter;
    const matchesStatus = !statusFilter || b.status === statusFilter;

    return matchesSearch && matchesDate && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle size={10} /> Confirmed
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
            <CheckCircle size={10} /> Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
            <XCircle size={10} /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
            <AlertCircle size={10} /> Pending
          </span>
        );
    }
  };

  return (
    <div className="max-w-[1500px] mx-auto px-6 lg:px-12 py-12" data-testid="receptionist-panel">
      <div className="mb-10 text-center md:text-left">
        <p className="text-[10px] uppercase tracking-[0.3em] text-eminence-gold font-bold mb-2">Virtual Reception Desk</p>
        <h1 className="font-serif text-4xl text-eminence-text">Appointment Booking Manager</h1>
        <p className="text-eminence-muted text-sm mt-1">Book salon appointments and assign them to stylist employees.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* BOOKING FORM */}
        <form onSubmit={handleBook} className="lg:col-span-1 eminence-card p-6 space-y-5 h-fit bg-white border border-eminence-border/60 shadow-sm rounded-2xl sticky top-24">
          <div className="border-b border-eminence-border/50 pb-3 flex items-center justify-between">
            <h3 className="font-serif text-xl text-eminence-text flex items-center gap-2">
              <Sparkles className="text-eminence-gold" size={18} /> Take Appointment
            </h3>
            <span className="text-[9px] uppercase tracking-wider bg-eminence-gold/10 text-eminence-gold px-2 py-0.5 rounded font-bold">Reception</span>
          </div>

          {/* Customer Mode Selection */}
          <div className="flex gap-2 p-1 bg-eminence-surface border border-eminence-border rounded-xl">
            <button
              type="button"
              onClick={() => { setIsGuest(true); handleUserSelect(""); }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${isGuest ? "bg-white text-eminence-text shadow-sm" : "text-eminence-muted hover:text-eminence-text"}`}
            >
              Guest Walk-in
            </button>
            <button
              type="button"
              onClick={() => setIsGuest(false)}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${!isGuest ? "bg-white text-eminence-text shadow-sm" : "text-eminence-muted hover:text-eminence-text"}`}
            >
              Registered Client
            </button>
          </div>

          {!isGuest && (
            <div>
              <label className="text-[10px] uppercase tracking-wider text-eminence-muted block mb-1.5 font-bold">Select Client Account</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-eminence-gold" />
                <select 
                  value={selectedUserId} 
                  onChange={(e) => handleUserSelect(e.target.value)} 
                  className="w-full bg-eminence-surface border border-eminence-border pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-eminence-gold appearance-none rounded-lg"
                >
                  <option value="">-- Choose Existing Client --</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.phone || "No phone"})</option>)}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] uppercase tracking-wider text-eminence-muted block mb-1.5 font-bold">Client Name *</label>
            <div className="relative">
              <UserPlus size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-eminence-gold" />
              <input 
                required 
                type="text" 
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Client's Full Name"
                className="w-full bg-eminence-surface border border-eminence-border pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-eminence-gold rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-eminence-muted block mb-1.5 font-bold">WhatsApp / Phone *</label>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-eminence-gold" />
              <input 
                required 
                type="tel" 
                value={customerPhone} 
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="e.g. +91 99999 99999"
                className="w-full bg-eminence-surface border border-eminence-border pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-eminence-gold rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-eminence-muted block mb-1.5 font-bold">Email Address (Optional)</label>
            <input 
              type="email" 
              value={customerEmail} 
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="client@email.com"
              className="w-full bg-eminence-surface border border-eminence-border px-4 py-2.5 text-sm focus:outline-none focus:border-eminence-gold rounded-lg"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-eminence-muted block mb-1.5 font-bold">Select Services *</label>
            <div className="border border-eminence-border rounded-xl bg-eminence-surface p-3 space-y-2">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={serviceSearchQuery}
                  onChange={(e) => setServiceSearchQuery(e.target.value)}
                  className="w-full bg-white border border-eminence-border pl-8 pr-3 py-1.5 text-xs rounded-lg focus:outline-none focus:border-eminence-gold text-gray-700 font-normal"
                />
              </div>
              
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {services.filter(s => 
                  s.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()) || 
                  (s.category && s.category.toLowerCase().includes(serviceSearchQuery.toLowerCase()))
                ).map(s => {
                  const isChecked = selectedServiceIds.includes(s.id);
                  return (
                    <label key={s.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white cursor-pointer transition-colors border border-transparent hover:border-eminence-border/30 font-normal">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedServiceIds(selectedServiceIds.filter(id => id !== s.id));
                          } else {
                            setSelectedServiceIds([...selectedServiceIds, s.id]);
                          }
                        }}
                        className="rounded border-eminence-border text-eminence-gold focus:ring-eminence-gold h-4 w-4"
                      />
                      <span className="text-xs text-gray-800 flex-1">{s.name}</span>
                      <span className="text-xs font-bold text-eminence-gold">₹{s.price}</span>
                    </label>
                  );
                })}
                {services.filter(s => 
                  s.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()) || 
                  (s.category && s.category.toLowerCase().includes(serviceSearchQuery.toLowerCase()))
                ).length === 0 && (
                  <p className="text-xs text-center text-eminence-muted py-4 font-normal">No services found</p>
                )}
              </div>
            </div>
            
            {/* Selected Summary Tags */}
            {selectedServiceIds.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {selectedServiceIds.map(id => {
                  const s = services.find(srv => srv.id === id);
                  if (!s) return null;
                  return (
                    <span key={id} className="inline-flex items-center gap-1 bg-eminence-gold/10 text-eminence-gold text-[10px] font-bold px-2.5 py-1 rounded-full border border-eminence-gold/25">
                      {s.name}
                      <button
                        type="button"
                        onClick={() => setSelectedServiceIds(selectedServiceIds.filter(x => x !== id))}
                        className="hover:text-black transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-eminence-muted block mb-1.5 font-bold">Assign Employee / Stylist</label>
            <select 
              value={stylistId} 
              onChange={(e) => setStylistId(e.target.value)}
              className="w-full bg-eminence-surface border border-eminence-border px-4 py-2.5 text-sm focus:outline-none focus:border-eminence-gold appearance-none rounded-lg"
            >
              <option value="">-- Auto/Any Available --</option>
              {stylists.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role || "Stylist"})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-eminence-muted block mb-1.5 font-bold">Date *</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-eminence-gold" />
                <input 
                  required 
                  type="date" 
                  min={today}
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-eminence-surface border border-eminence-border pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-eminence-gold rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-eminence-muted block mb-1.5 font-bold">Time *</label>
              <div className="relative">
                <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-eminence-gold" />
                <select 
                  required
                  value={time} 
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-eminence-surface border border-eminence-border pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-eminence-gold appearance-none rounded-lg"
                >
                  <option value="">-- Time --</option>
                  {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-eminence-muted block mb-1.5 font-bold">Reception Notes</label>
            <div className="relative">
              <FileText size={14} className="absolute left-3 top-3 text-eminence-gold" />
              <textarea 
                rows="2" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter client specifications, concerns..."
                className="w-full bg-eminence-surface border border-eminence-border pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-eminence-gold rounded-lg resize-none"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-eminence-gold hover:bg-eminence-gold/90 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-eminence-gold/15 transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            Confirm & Save Booking
          </button>
        </form>

        {/* BOOKINGS LIST & MANAGEMENT */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SEARCH & FILTERS */}
          <div className="eminence-card p-5 bg-white border border-eminence-border/60 rounded-2xl flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-eminence-gold" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by client, phone, or service..."
                className="w-full bg-eminence-surface border border-eminence-border pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-eminence-gold rounded-xl"
              />
            </div>
            
            <div className="w-[160px]">
              <input 
                type="date" 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full bg-eminence-surface border border-eminence-border px-3 py-2.5 text-xs focus:outline-none focus:border-eminence-gold rounded-xl"
              />
            </div>

            <div className="w-[140px]">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-eminence-surface border border-eminence-border px-3 py-2.5 text-xs focus:outline-none focus:border-eminence-gold appearance-none rounded-xl"
              >
                <option value="">All Statuses</option>
                {STATUSES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
              </select>
            </div>
          </div>

          {/* LIST */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-20 animate-pulse text-eminence-muted font-bold text-xs uppercase tracking-widest">
                Fetching appointments...
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-eminence-border rounded-2xl bg-white text-eminence-muted italic text-sm">
                No appointments found matching filters.
              </div>
            ) : (
              filteredBookings.map(b => (
                <div key={b.id} className={`eminence-card p-5 bg-white border ${b.status === "cancelled" ? "border-rose-100 bg-rose-50/[0.01]" : "border-eminence-border/60 hover:shadow-md"} rounded-2xl transition-all flex flex-col md:flex-row gap-5 justify-between items-start md:items-center`}>
                  
                  {/* Left Column: Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-serif text-lg text-gray-800 font-bold">{b.user_name}</h4>
                      {getStatusBadge(b.status)}
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-eminence-muted">
                      <span className="flex items-center gap-1">
                        <Phone size={12} className="text-eminence-gold" /> {b.user_phone || b.phone || "No Phone"}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-eminence-gold">
                        <Sparkles size={12} /> {b.service_name} · ₹{b.service_price}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-eminence-muted">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {b.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {b.time}
                      </span>
                    </div>
                    {b.notes && (
                      <p className="text-[11px] bg-eminence-surface/60 p-2 rounded-lg border border-eminence-border/20 text-eminence-muted leading-relaxed max-w-lg italic">
                        Notes: {b.notes}
                      </p>
                    )}
                  </div>

                  {/* Right Column: Actions & Assign */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                    {/* Assigner */}
                    <div className="min-w-[180px]">
                      <label className="text-[9px] uppercase tracking-wider text-eminence-muted block mb-1 font-bold">Assign Stylist</label>
                      <select
                        disabled={b.status === "cancelled"}
                        value={b.stylist_id || ""}
                        onChange={(e) => handleAssignStylist(b.id, e.target.value)}
                        className="w-full bg-eminence-surface border border-eminence-border px-3 py-2 text-xs focus:outline-none focus:border-eminence-gold rounded-lg appearance-none disabled:opacity-50"
                      >
                        <option value="">-- Unassigned --</option>
                        {stylists.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role || "Stylist"})</option>)}
                      </select>
                    </div>

                    {/* Status Changer */}
                    <div className="min-w-[140px]">
                      <label className="text-[9px] uppercase tracking-wider text-eminence-muted block mb-1 font-bold">Status</label>
                      <select
                        value={b.status}
                        onChange={(e) => handleStatusChange(b.id, e.target.value)}
                        className="w-full bg-eminence-surface border border-eminence-border px-3 py-2 text-xs focus:outline-none focus:border-eminence-gold rounded-lg appearance-none"
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                      </select>
                    </div>

                    {/* Quick Cancel Button */}
                    {b.status !== "cancelled" && b.status !== "completed" && (
                      <button
                        type="button"
                        onClick={() => handleCancelBooking(b.id)}
                        className="p-2.5 text-eminence-muted hover:text-red-500 border border-eminence-border/60 hover:border-red-200 hover:bg-red-50 rounded-lg transition-all flex items-center justify-center self-end sm:self-center"
                        title="Cancel Appointment"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
