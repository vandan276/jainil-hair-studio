import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Phone, User, Calendar, MessageSquare, Plus, Search, Scissors,
  CheckCircle2, XCircle, ArrowRight, Clock, MapPin, Star, Bell, ArrowRightLeft, Trophy,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import BillingPanel from "@/components/BillingPanel";
import RecessControls from "@/components/RecessControls";

const STATUSES = ["new", "in process", "visit", "visited", "token received", "recycled", "dead", "converted"];
const TABS = ["All", "New", "In Process", "Visit", "Visited", "Token Received", "Recycled", "Dead", "Converted", "Retargeting", "Consulting Form"];

const STATUS_COLORS = {
  "new": "bg-blue-50 text-blue-700 border-blue-200",
  "in process": "bg-amber-50 text-amber-700 border-amber-200",
  "visit": "bg-purple-50 text-purple-700 border-purple-200",
  "visited": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "token received": "bg-teal-50 text-teal-700 border-teal-200",
  "converted": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "recycled": "bg-gray-100 text-gray-700 border-gray-300",
  "dead": "bg-rose-50 text-rose-700 border-rose-200",
  "not interested": "bg-rose-50 text-rose-700 border-rose-200"
};

const GRADE_COLORS = {
  "Hot": "bg-red-500",
  "Warm": "bg-yellow-500",
  "Cold": "bg-blue-500"
};

// Sub-component to prevent the entire SalesPanel from re-rendering every second
const LiveTimer = ({ isActive, initialSeconds = 0 }) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return <>{m}:{s.toString().padStart(2, '0')}</>;
};

export default function SalesPanel() {
  const { user, attendanceVerified, shiftCompleted } = useAuth();
  const location = useLocation();
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [consultations, setConsultations] = useState([]);

  const getBusyTimeSlots = (dateStr) => {
    if (!dateStr) return [];
    return leads
      .filter(l => l.status === "visit" && l.follow_up_date === dateStr && l.follow_up_time)
      .map(l => {
        const t = l.follow_up_time.trim();
        if (t.toLowerCase().includes("am") || t.toLowerCase().includes("pm")) {
          let [time, modifier] = t.split(" ");
          let [hours, minutes] = time.split(":");
          if (hours === "12") hours = "00";
          if (modifier.toLowerCase() === "pm") hours = String(parseInt(hours, 10) + 12);
          return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
        }
        return t.length === 4 ? `0${t}` : t;
      });
  };

  
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [myLeaves, setMyLeaves] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth() + 1); // 1-12

  const fetchLeaves = async () => {
    if (!user) return;
    try {
      const res = await api.get("/users/me/leaves");
      setMyLeaves(res.data.leaves || []);
      setLeaveRequests(res.data.requests || []);
    } catch (err) {
      console.error("Failed to load leaves:", err);
    }
  };

  useEffect(() => {
    fetchLeaves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  
  // Initialize from URL param if available
  const initialTab = new URLSearchParams(location.search).get("tab") || "All";
  const [activeTab, setActiveTab] = useState(TABS.includes(initialTab) ? initialTab : "All");

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get("tab");
    if (tab && TABS.includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);
  const [search, setSearch] = useState("");
  const [leadFilterStartDate, setLeadFilterStartDate] = useState("");
  const [leadFilterEndDate, setLeadFilterEndDate] = useState("");
  const [sectionFilter, setSectionFilter] = useState("All"); // Default to All sections for admin
  const [activeStatFilter, setActiveStatFilter] = useState(null);
  const [dashboardDate, setDashboardDate] = useState(new Date().toISOString().split("T")[0]);
  const [dashboardPeriod, setDashboardPeriod] = useState("daily");
  const [dashboardStartDate, setDashboardStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [dashboardEndDate, setDashboardEndDate] = useState(new Date().toISOString().split("T")[0]);

  const [resultsDate, setResultsDate] = useState(new Date().toISOString().split("T")[0]);
  const [resultsPeriod, setResultsPeriod] = useState("monthly");
  const [resultsStartDate, setResultsStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [resultsEndDate, setResultsEndDate] = useState(new Date().toISOString().split("T")[0]);

  const [selectedLead, setSelectedLead] = useState(null);
  const [callingMode, setCallingMode] = useState(false);
  const [callActive, setCallActive] = useState(false); // is the call actually running?
  const [callOutcome, setCallOutcome] = useState("Interested (Follow-up)");
  const [callForm, setCallForm] = useState({ 
    comment: "", 
    grade: "", 
    nextDate: "", 
    nextTime: "", 
    saleAmount: "",
    paymentMode: "UPI",
    consultedBy: ""
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  const [showEditLeadModal, setShowEditLeadModal] = useState(false);
  const [editLeadForm, setEditLeadForm] = useState(null);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferEmail, setTransferEmail] = useState("");
  const [transferTargetId, setTransferTargetId] = useState("");
  const [allEmployees, setAllEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [visitForm, setVisitForm] = useState({ liked: null, serviceDays: 10, note: "" });

  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: "",
    phone: "",
    secondary_phone: "",
    branch: "Baroda",
    section: "Men",
    source: "Manual",
    grade: "Cold",
    city: "",
    hair_condition: "",
    notes: ""
  });

  // Retargeting States
  const [selectedLeadsForBulk, setSelectedLeadsForBulk] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkMessage, setBulkMessage] = useState("Hello! We haven't seen you in a while at Eminence. We have some exciting new offers for you. Would you like to book an appointment?");
  const [retargetingStatusFilter, setRetargetingStatusFilter] = useState("all");
  const [retargetingGradeFilter, setRetargetingGradeFilter] = useState("all");

  const callStartTimeRef = useRef(null);
  const callDurationRef = useRef(0);
  const nav = useNavigate(); // added useNavigate

  const duplicateCount = React.useMemo(() => {
    const byPhone = {};
    leads.forEach(l => {
      const phone = l.phone;
      if (phone) {
        const phoneClean = phone.replace(/\D/g, "");
        if (phoneClean.length >= 10) {
          const key = phoneClean.slice(-10);
          byPhone[key] = (byPhone[key] || 0) + 1;
        }
      }
    });
    return Object.values(byPhone).filter(cnt => cnt > 1).length;
  }, [leads]);

  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "sales") {
      toast.error("Unauthorized access to Sales Panel");
      nav("/");
    }
  }, [user, nav]);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await api.get("/leads");
      setLeads(res.data);
    } catch (err) {
      toast.error("Failed to load leads");
    }
  }, []);

  const fetchConsultations = useCallback(async () => {
    try {
      const res = await api.get("/consultations");
      setConsultations(res.data);
    } catch (err) {
      console.error("Failed to load consultations:", err);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const statsRes = await api.get(`/sales/dashboard?date=${dashboardDate}&period=${dashboardPeriod}&results_date=${resultsDate}&results_period=${resultsPeriod}&start_date=${dashboardStartDate}&end_date=${dashboardEndDate}&res_start_date=${resultsStartDate}&res_end_date=${resultsEndDate}`);
      setStats(statsRes.data);
    } catch (err) {
      toast.error("Failed to load CRM stats");
    }
  }, [dashboardDate, dashboardPeriod, resultsDate, resultsPeriod, dashboardStartDate, dashboardEndDate, resultsStartDate, resultsEndDate]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.hidden) return; // Skip polling when tab is not visible/active
      fetchLeads();
      fetchStats();
      fetchConsultations();
    }, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchLeads, fetchStats, fetchConsultations]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchLeads();
        fetchStats();
        fetchConsultations();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchLeads, fetchStats, fetchConsultations]);

  // --- Calling System ---
  const startCall = (leadToCall = null) => {
    const target = leadToCall || selectedLead;
    if (!target) return;

    if (leadToCall) setSelectedLead(leadToCall);
    setCallingMode(true);
    setCallActive(false);
    setCallForm(prev => ({ ...prev, grade: (leadToCall || selectedLead)?.grade || "" }));
  };

  const triggerActualCall = () => {
    if (!selectedLead) return;
    setCallActive(true);
    callStartTimeRef.current = Date.now();
    callDurationRef.current = 0;

    // Open dialer automatically
    window.location.href = `tel:${selectedLead.phone}`;
  };

  const endCall = () => {
    setCallActive(false);
    if (callStartTimeRef.current) {
      callDurationRef.current = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
    }
  };

  const saveCallLog = async (e) => {
    e.preventDefault();
    try {
      let finalDuration = callDurationRef.current;
      if (callActive && callStartTimeRef.current) {
        finalDuration = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
      }

      const payload = {
        duration: finalDuration,
        talk_time: finalDuration,
        outcome: callOutcome,
        comment: callForm.comment,
        grade: callForm.grade || selectedLead.grade,
        next_followup_date: callForm.nextDate,
        next_followup_time: callForm.nextTime,
        sale_amount: parseFloat(callForm.saleAmount) || null,
        payment_mode: (callOutcome === "Token Received" || callOutcome === "Converted") ? callForm.paymentMode : null,
        consulted_by: callOutcome === "Visited" ? callForm.consultedBy : null
      };

      await api.post(`/leads/${selectedLead.id}/calls`, payload);

      // Feature 1: If Picked Up and visit date is set, schedule visit
      if (callOutcome === "Picked Up" && callForm.nextDate) {
        await api.patch(`/leads/${selectedLead.id}/visit`, {
          visit_date: callForm.nextDate,
          visit_time: callForm.nextTime
        });
      }

      toast.success("Call logged successfully");
      setCallingMode(false);
      setCallActive(false);
      callDurationRef.current = 0;
      setCallForm({ comment: "", grade: "", nextDate: "", nextTime: "", saleAmount: "", paymentMode: "UPI", consultedBy: "" });
      setSelectedLead(null);
      fetchLeads();
      fetchStats();
    } catch (err) {
      toast.error("Failed to log call");
    }
  };

  const openTransferModal = async () => {
    setShowTransferModal(true);
    setTransferTargetId("");
    setEmployeesLoading(true);
    try {
      const res = await api.get("/admin/employees");
      // Filter to only sales/employee staff — exclude current user
      const staff = res.data.filter(
        e => e.role === "sales" && e.id !== user?.id
      );
      setAllEmployees(staff);
    } catch {
      toast.error("Could not load employee list");
    } finally {
      setEmployeesLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!transferTargetId) { toast.error("Please select an employee"); return; }
    try {
      await api.post(`/leads/${selectedLead.id}/transfer`, { target_id: transferTargetId });
      toast.success("Lead transferred successfully");
      setShowTransferModal(false);
      setTransferTargetId("");
      setSelectedLead(null);
      fetchLeads();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to transfer lead");
    }
  };

  const handleVisitOutcome = async (liked) => {
    try {
      await api.patch(`/leads/${selectedLead.id}/visit`, {
        liked,
        service_days: visitForm.serviceDays,
        note: visitForm.note
      });
      toast.success("Visit outcome saved");
      setSelectedLead(null);
      fetchLeads();
      fetchStats();
    } catch (err) {
      toast.error("Failed to update visit outcome");
    }
  };

  const markConverted = async () => {
    try {
      await api.patch(`/leads/${selectedLead.id}`, { status: "converted" });
      toast.success("Lead converted!");
      setSelectedLead(null);
      fetchLeads();
      fetchStats();
    } catch (err) {
      toast.error("Failed to convert lead");
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    try {
      await api.post("/leads", newLeadForm);
      toast.success("Lead added successfully");
      setShowAddLeadModal(false);
      setNewLeadForm({
        name: "",
        phone: "",
        secondary_phone: "",
        branch: "Baroda",
        section: "Men",
        source: "Manual",
        grade: "Cold",
        city: "",
        hair_condition: "",
        notes: ""
      });
      fetchLeads();
      fetchStats();
    } catch (err) {
      toast.error("Failed to add lead");
    }
  };

  const handleEditLead = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/leads/${editLeadForm.id}`, editLeadForm);
      toast.success("Lead updated successfully");
      setShowEditLeadModal(false);
      setEditLeadForm(null);
      // Update selectedLead with new data
      const updated = leads.find(l => l.id === editLeadForm.id);
      setSelectedLead({ ...updated, ...editLeadForm });
      fetchLeads();
      fetchStats();
    } catch (err) {
      toast.error("Failed to update lead");
    }
  };

  const openEditModal = (lead) => {
    setEditLeadForm({
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      secondary_phone: lead.secondary_phone || "",
      branch: lead.branch,
      section: lead.section,
      city: lead.city || "",
      hair_condition: lead.hair_condition || "",
      status: lead.status,
      grade: lead.grade,
      total_sale_amount: lead.total_sale_amount || 0
    });
    setShowEditLeadModal(true);
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // --- Filtering ---
  // Get leads for the current selected section
  const sectionLeads = leads.filter(l => user?.role === "admin" ? (sectionFilter === "All" ? true : l.section === sectionFilter) : true);

  const getFilteredLeads = () => {
    let filtered = sectionLeads;

    // Apply Stat Filter
    if (activeStatFilter) {
      const today = new Date().toISOString().split("T")[0];
      if (activeStatFilter === "overdue") {
        filtered = filtered.filter(d => d.follow_up_date && d.follow_up_date < today && !["converted", "dead"].includes(d.status));
      } else if (activeStatFilter === "due_today") {
        filtered = filtered.filter(d => d.follow_up_date === today && !["converted", "dead"].includes(d.status));
      } else if (activeStatFilter === "hot_warm") {
        filtered = filtered.filter(d => ["Hot", "Warm"].includes(d.grade) && !["converted", "dead"].includes(d.status));
      } else if (activeStatFilter === "assigned") {
        filtered = filtered; // No additional filtering needed for assigned
      } else if (activeStatFilter === "converted") {
        filtered = filtered.filter(d => ["converted", "closed"].includes(d.status));
      } else if (activeStatFilter === "token") {
        filtered = filtered.filter(d => d.status === "token received");
      } else if (activeStatFilter === "visited") {
        filtered = filtered.filter(d => d.status === "visited");
      } else if (activeStatFilter === "dead") {
        filtered = filtered.filter(d => d.status === "dead");
      } else if (activeStatFilter === "won") {
        filtered = filtered.filter(d => ["converted", "closed"].includes(d.status) && ["Hot", "Warm"].includes(d.grade));
      } else if (activeStatFilter === "hold") {
        filtered = filtered.filter(d => d.status === "in process" && d.grade === "Cold");
      }
    } else {
      // Apply Tab Filter only if no stat filter is active
      if (activeTab !== "All" && activeTab !== "Retargeting") {
        filtered = filtered.filter(l => l.status === activeTab.toLowerCase());
      }
      if (activeTab === "Retargeting") {
        filtered = filtered.filter(l => ["recycled", "dead"].includes(l.status));
        if (retargetingStatusFilter !== "all") filtered = filtered.filter(l => l.status === retargetingStatusFilter);
        if (retargetingGradeFilter !== "all") filtered = filtered.filter(l => l.grade === retargetingGradeFilter);
      }
    }

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(l =>
        l.name.toLowerCase().includes(s) ||
        l.phone.includes(s) ||
        (l.lead_number && l.lead_number.toLowerCase().includes(s))
      );
    }
    
    if (leadFilterStartDate) {
      filtered = filtered.filter(l => {
        if (!l.created_at) return false;
        const leadDate = new Date(l.created_at).toISOString().split("T")[0];
        return leadDate >= leadFilterStartDate;
      });
    }
    
    if (leadFilterEndDate) {
      filtered = filtered.filter(l => {
        if (!l.created_at) return false;
        const leadDate = new Date(l.created_at).toISOString().split("T")[0];
        return leadDate <= leadFilterEndDate;
      });
    }

    return filtered;
  };

  const toggleLeadSelection = (id) => {
    setSelectedLeadsForBulk(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectAllFiltered = () => {
    const filtered = getFilteredLeads();
    const allIds = filtered.map(l => l.id);
    setSelectedLeadsForBulk(selectedLeadsForBulk.length === allIds.length ? [] : allIds);
  };

  const sendBulkMessages = () => {
    if (selectedLeadsForBulk.length === 0) return;
    const selectedData = leads.filter(l => selectedLeadsForBulk.includes(l.id));
    selectedData.forEach((lead, index) => {
      setTimeout(() => {
        const url = `https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(bulkMessage)}`;
        window.open(url, '_blank');
      }, index * 1000);
    });
    setShowBulkModal(false);
  };

  // Calculate dynamic stats based on sectionLeads (so dashboard updates when switching sections)
  const todayStr = new Date().toISOString().split("T")[0];

  // Per-lead follow-up dismissed state (localStorage-backed)
  const DISMISSED_KEY = (id, date) => `followup_dismissed_${id}_${date}`;
  const followUpLeads = sectionLeads.filter(
    l => l.follow_up_date === todayStr && !["converted", "dead"].includes(l.status)
  );
  const [dismissedFollowUps, setDismissedFollowUps] = useState(() => {
    const r = {};
    followUpLeads.forEach(l => { r[l.id] = !!localStorage.getItem(DISMISSED_KEY(l.id, todayStr)); });
    return r;
  });
  // Sync when leads reload
  useEffect(() => {
    setDismissedFollowUps(prev => {
      const next = { ...prev };
      followUpLeads.forEach(l => { if (!(l.id in next)) next[l.id] = !!localStorage.getItem(DISMISSED_KEY(l.id, todayStr)); });
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionLeads]);
  const dismissFollowUp = (id) => {
    localStorage.setItem(DISMISSED_KEY(id, todayStr), "1");
    setDismissedFollowUps(prev => ({ ...prev, [id]: true }));
  };
  const visibleFollowUpLeads = followUpLeads.filter(l => !dismissedFollowUps[l.id]);

  const overdueCount = sectionLeads.filter(d => d.follow_up_date && d.follow_up_date < todayStr && !["converted", "dead"].includes(d.status)).length;
  const newLeadsToday = sectionLeads.filter(d => d.created_at?.startsWith(todayStr) && d.status === "new").length;

  // Badge count = summary items + undismissed per-lead follow-ups
  const summaryNotifCount = (overdueCount > 0 ? 1 : 0) + (newLeadsToday > 0 ? 1 : 0);
  const totalBadgeCount = summaryNotifCount + visibleFollowUpLeads.length;

  const currentStats = {
    open: {
      overdues: sectionLeads.filter(d => d.follow_up_date && d.follow_up_date < todayStr && !["converted", "dead"].includes(d.status)).length,
      due_today: sectionLeads.filter(d => d.follow_up_date === todayStr && !["converted", "dead"].includes(d.status)).length,
      total_assigned: sectionLeads.length,
      opportunities: sectionLeads.filter(d => ["Hot", "Warm"].includes(d.grade) && !["converted", "dead"].includes(d.status)).length,
    },
    periodic: stats?.periodic || {
      leads: 0,
      calls_made: 0,
      activities_completed: 0,
      messages_sent: 0,
      sales: 0
    },
    result: {
      converted: sectionLeads.filter(d => ["converted", "closed"].includes(d.status)).length,
      recycled: sectionLeads.filter(d => d.status === "recycled").length,
      dead: sectionLeads.filter(d => d.status === "dead").length,
      closed_won: sectionLeads.filter(d => ["converted", "closed"].includes(d.status) && ["Hot", "Warm"].includes(d.grade)).length,
      on_hold: sectionLeads.filter(d => d.status === "in process" && d.grade === "Cold").length,
      closed_lost: sectionLeads.filter(d => d.status === "dead" && ["Hot", "Warm"].includes(d.grade)).length,
    }
  };

  const getLeadRowClass = (lead) => {
    if (lead.follow_up_date === todayStr) return "bg-yellow-50"; // Due Today
    if (lead.follow_up_date && lead.follow_up_date < todayStr && !["converted", "dead"].includes(lead.status)) return "bg-red-50"; // Overdue
    return "bg-white hover:bg-gray-50";
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20 pb-12 px-4 md:px-6">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* Top Header */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Welcome, {user?.name || "Team Member"}</h1>
            <p className="text-sm text-gray-500">
              {user?.role === "admin" ? "Global Sales Dashboard" : `${user?.branch} - ${user?.section} Section Dashboard`}
            </p>
          </div>

          <div className="flex gap-4 items-center">
            {user?.role === "admin" && (
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setSectionFilter("All")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${sectionFilter === "All" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                >
                  All Sections
                </button>
                <button
                  onClick={() => setSectionFilter("Men")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${sectionFilter === "Men" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Men Section
                </button>
                <button
                  onClick={() => setSectionFilter("Female")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${sectionFilter === "Female" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Female Section
                </button>
              </div>
            )}

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-500 hover:text-gray-900 transition-colors relative bg-gray-100 rounded-full"
              >
                <Bell size={20} />
                {totalBadgeCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {totalBadgeCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-200 animate-fade-in">
                  {/* Header */}
                  <div className="bg-gray-900 px-4 py-3 flex items-center justify-between">
                    <h3 className="font-bold text-white text-xs uppercase tracking-widest flex items-center gap-2">
                      <Bell size={13} className="text-amber-400" /> Notifications
                    </h3>
                    {totalBadgeCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{totalBadgeCount}</span>
                    )}
                  </div>

                  <div className="max-h-[480px] overflow-y-auto divide-y divide-gray-50">

                    {/* ── Summary alerts (overdue / new leads) ── */}
                    {overdueCount > 0 && (
                      <div
                        onClick={() => { setActiveStatFilter("overdue"); setShowNotifications(false); }}
                        className="p-3 flex items-start gap-3 hover:bg-red-50 transition-colors cursor-pointer bg-red-50/40"
                      >
                        <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Clock className="text-red-500" size={13} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">Overdue Follow-ups</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">You have <span className="font-bold text-red-600">{overdueCount}</span> overdue follow-up(s). Tap to view.</p>
                        </div>
                      </div>
                    )}
                    {newLeadsToday > 0 && (
                      <div
                        onClick={() => { setActiveTab("New"); setShowNotifications(false); }}
                        className="p-3 flex items-start gap-3 hover:bg-emerald-50 transition-colors cursor-pointer bg-emerald-50/30"
                      >
                        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <User className="text-emerald-500" size={13} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">New Leads Today</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">You received <span className="font-bold text-emerald-600">{newLeadsToday}</span> new lead(s) today.</p>
                        </div>
                      </div>
                    )}

                    {/* ── Per-lead follow-up items ── */}
                    {visibleFollowUpLeads.length > 0 && (
                      <div className="bg-amber-50/40 px-4 py-2 border-y border-amber-100">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-amber-700">📅 Today's Follow-ups — {visibleFollowUpLeads.length} pending</p>
                      </div>
                    )}
                    {visibleFollowUpLeads.map(lead => (
                      <div key={lead.id} className="p-3 hover:bg-amber-50/30 transition-colors bg-white">
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {lead.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-bold text-gray-900 truncate">{lead.name}</p>
                              <button
                                onClick={() => dismissFollowUp(lead.id)}
                                className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0"
                                title="Dismiss"
                              >
                                <XCircle size={14} />
                              </button>
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium">{lead.phone}</p>
                            {/* Badges */}
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {lead.follow_up_time && (
                                <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                  <Clock size={8} /> {lead.follow_up_time}
                                </span>
                              )}
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                                lead.status === "new" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                lead.status === "in process" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                lead.status === "visit" ? "bg-purple-50 text-purple-700 border-purple-200" :
                                "bg-gray-100 text-gray-600 border-gray-200"
                              }`}>{lead.status}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white ${
                                lead.grade === "Hot" ? "bg-red-500" : lead.grade === "Warm" ? "bg-orange-400" : "bg-blue-400"
                              }`}>{lead.grade || "Cold"}</span>
                              {lead.follow_up_type && (
                                <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{lead.follow_up_type}</span>
                              )}
                            </div>
                            {/* View button */}
                            <button
                              onClick={() => { setSelectedLead(lead); setShowNotifications(false); dismissFollowUp(lead.id); }}
                              className="mt-2 w-full bg-gray-900 hover:bg-black text-white text-[10px] font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                              <Phone size={10} /> View Lead
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Empty state */}
                    {totalBadgeCount === 0 && (
                      <div className="px-4 py-10 text-center">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                          <Bell size={18} className="text-gray-300" />
                        </div>
                        <p className="text-xs text-gray-400 italic">No new notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setShowDuplicateModal(true)}
              className="border border-eminence-border hover:border-eminence-gold hover:text-eminence-gold text-eminence-muted px-4 py-2 rounded text-sm flex items-center gap-2 transition-colors bg-white font-medium"
            >
              <User size={16} /> Duplicate Leads
            </button>
            <button 
              onClick={() => setShowLeaveModal(true)}
              className="border border-eminence-border hover:border-eminence-gold hover:text-eminence-gold text-eminence-muted px-4 py-2 rounded text-sm flex items-center gap-2 transition-colors bg-white font-medium"
            >
              <Calendar size={16} /> Manage Leaves
            </button>
            <button
              onClick={() => { window.location.href = "/consultancy"; }}
              className="border border-eminence-gold text-eminence-gold hover:bg-eminence-gold hover:text-white px-4 py-2 rounded text-sm flex items-center gap-2 transition-colors bg-white font-medium"
            >
              <Scissors size={16} /> Consultancy
            </button>
            <button 
              onClick={() => setShowAddLeadModal(true)}
              className="bg-eminence-text text-white px-4 py-2 rounded text-sm flex items-center gap-2 hover:bg-black"
            >
              <Plus size={16} /> Add Lead
            </button>
          </div>
        </div>

        {/* Shift / Attendance Banner */}
        {user && ["sales", "employee"].includes(user.role) && (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${shiftCompleted ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                {shiftCompleted ? <CheckCircle2 size={20} /> : <Clock size={20} />}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">
                  {shiftCompleted ? "Shift Completed" : "Shift In Progress"}
                </p>
                <p className="text-xs text-gray-500">
                  {shiftCompleted ? "Your check-out has been verified for today." : "You are checked in. Don't forget to complete your shift at the end of the day."}
                </p>
              </div>
            </div>
            {attendanceVerified && !shiftCompleted && (
              <div className="flex items-center gap-4">
                <RecessControls />
                <button
                  onClick={() => { window.location.href = "/attendance-verify?checkout=true"; }}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Complete Shift
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3 Dashboard Panels */}
        {leads.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Open Panel */}
            <div className="glass-card rounded-2xl border-t-4 border-t-blue-500 overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="font-bold text-gray-800 uppercase tracking-widest text-[10px] flex items-center gap-2"><Clock size={14} className="text-blue-500" /> Open Panel</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => setActiveStatFilter(activeStatFilter === "overdue" ? null : "overdue")}
                    className={`p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] ${activeStatFilter === "overdue" ? "bg-red-600 text-white border-red-700 shadow-lg" : "bg-red-50 text-red-600 border-red-100"}`}
                  >
                    <p className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${activeStatFilter === "overdue" ? "text-red-100" : "text-red-600"}`}>Overdues</p>
                    <p className={`text-2xl font-serif ${activeStatFilter === "overdue" ? "text-white" : "text-red-700"}`}>{currentStats.open.overdues}</p>
                  </div>
                  <div 
                    onClick={() => setActiveStatFilter(activeStatFilter === "due_today" ? null : "due_today")}
                    className={`p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] ${activeStatFilter === "due_today" ? "bg-amber-500 text-white border-amber-600 shadow-lg" : "bg-amber-50 text-amber-700 border-amber-100"}`}
                  >
                    <p className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${activeStatFilter === "due_today" ? "text-amber-50" : "text-amber-700"}`}>Due Today</p>
                    <p className={`text-2xl font-serif ${activeStatFilter === "due_today" ? "text-white" : "text-amber-800"}`}>{currentStats.open.due_today}</p>
                  </div>
                  <div 
                    onClick={() => setActiveStatFilter(activeStatFilter === "assigned" ? null : "assigned")}
                    className={`p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] ${activeStatFilter === "assigned" ? "bg-gray-800 text-white border-gray-900 shadow-lg" : "bg-gray-50 text-gray-500 border-gray-200"}`}
                  >
                    <p className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${activeStatFilter === "assigned" ? "text-gray-400" : "text-gray-500"}`}>Assigned</p>
                    <p className={`text-2xl font-serif ${activeStatFilter === "assigned" ? "text-white" : "text-gray-900"}`}>{currentStats.open.total_assigned}</p>
                  </div>
                  <div 
                    onClick={() => setActiveStatFilter(activeStatFilter === "hot_warm" ? null : "hot_warm")}
                    className={`p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] ${activeStatFilter === "hot_warm" ? "bg-blue-600 text-white border-blue-700 shadow-lg" : "bg-blue-50 text-blue-600 border-blue-100"}`}
                  >
                    <p className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${activeStatFilter === "hot_warm" ? "text-blue-100" : "text-blue-600"}`}>Hot/Warm</p>
                    <p className={`text-2xl font-serif ${activeStatFilter === "hot_warm" ? "text-white" : "text-blue-700"}`}>{currentStats.open.opportunities}</p>
                  </div>

                  <div 
                    onClick={() => setShowDuplicateModal(true)}
                    className="p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] bg-red-50 text-red-600 border-red-100 col-span-2 flex items-center justify-between mt-2"
                  >
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider mb-1 text-red-600">Duplicate Leads</p>
                      <p className="text-2xl font-serif text-red-700">{duplicateCount}</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest bg-red-100 text-red-700 px-3 py-1 rounded-full border border-red-200">View Checker</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Periodic Panel */}
            <div className="glass-card rounded-2xl border-t-4 border-t-purple-500 overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h2 className="font-bold text-gray-800 uppercase tracking-widest text-[10px] flex items-center gap-2"><Calendar size={14} className="text-purple-500" /> Periodic Panel</h2>
                <div className="flex items-center gap-2">
                  <select
                    value={dashboardPeriod}
                    onChange={e => setDashboardPeriod(e.target.value)}
                    className="text-[9px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg uppercase tracking-wider border-none focus:ring-1 focus:ring-purple-200 cursor-pointer"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                    <option value="custom">Custom</option>
                  </select>
                  <div className="flex items-center gap-1">
                    {dashboardPeriod === "custom" ? (
                      <>
                        <input 
                          type="date" 
                          value={dashboardStartDate} 
                          onChange={e => setDashboardStartDate(e.target.value)}
                          className="text-[9px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg uppercase tracking-wider border-none focus:ring-1 focus:ring-purple-200 cursor-pointer"
                        />
                        <span className="text-[9px] text-gray-400">to</span>
                        <input 
                          type="date" 
                          value={dashboardEndDate} 
                          onChange={e => setDashboardEndDate(e.target.value)}
                          className="text-[9px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg uppercase tracking-wider border-none focus:ring-1 focus:ring-purple-200 cursor-pointer"
                        />
                      </>
                    ) : (
                      <input 
                        type="date" 
                        value={dashboardDate} 
                        onChange={e => setDashboardDate(e.target.value)}
                        className="text-[9px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg uppercase tracking-wider border-none focus:ring-1 focus:ring-purple-200 cursor-pointer"
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{dashboardPeriod.toUpperCase()}'S LEADS</span>
                    <span className="text-3xl font-serif text-gray-800 font-bold">{stats?.periodic?.leads || 0}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">CALLS MADE</span>
                    <span className="text-3xl font-serif text-gray-800 font-bold">{currentStats.periodic.calls_made}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">ACTIVITIES</span>
                    <span className="text-3xl font-serif text-gray-800 font-bold">{currentStats.periodic.activities_completed}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">MESSAGES</span>
                    <span className="text-3xl font-serif text-gray-800 font-bold">{currentStats.periodic.messages_sent}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-emerald-50/30 p-4 rounded-xl border border-emerald-100/50">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{dashboardPeriod.toUpperCase()}'S SALES</span>
                  <span className="text-xl font-serif text-emerald-700 font-bold">₹{(stats?.periodic?.sales || 0).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Result Panel */}
            <div className="glass-card rounded-2xl border-t-4 border-t-emerald-500 overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h2 className="font-bold text-gray-800 uppercase tracking-widest text-[10px] flex items-center gap-2"><Trophy size={14} className="text-emerald-500" /> Result Panel</h2>
                <div className="flex items-center gap-2">
                  <select
                    value={resultsPeriod}
                    onChange={e => setResultsPeriod(e.target.value)}
                    className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider border-none focus:ring-1 focus:ring-emerald-200 cursor-pointer"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                    <option value="custom">Custom</option>
                  </select>
                  <div className="flex items-center gap-1">
                    {resultsPeriod === "custom" ? (
                      <>
                        <input 
                          type="date" 
                          value={resultsStartDate} 
                          onChange={e => setResultsStartDate(e.target.value)}
                          className="text-[9px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg uppercase tracking-wider border-none focus:ring-1 focus:ring-emerald-200 cursor-pointer"
                        />
                        <span className="text-[9px] text-gray-400">to</span>
                        <input 
                          type="date" 
                          value={resultsEndDate} 
                          onChange={e => setResultsEndDate(e.target.value)}
                          className="text-[9px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg uppercase tracking-wider border-none focus:ring-1 focus:ring-emerald-200 cursor-pointer"
                        />
                      </>
                    ) : (
                      <input 
                        type="date" 
                        value={resultsDate} 
                        onChange={e => setResultsDate(e.target.value)}
                        className="text-[9px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg uppercase tracking-wider border-none focus:ring-1 focus:ring-emerald-200 cursor-pointer"
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div 
                    onClick={() => setActiveStatFilter(activeStatFilter === "converted" ? null : "converted")}
                    className={`p-3 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] ${activeStatFilter === "converted" ? "bg-emerald-600 text-white border-emerald-700 shadow-lg" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}
                  >
                    <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${activeStatFilter === "converted" ? "text-emerald-50" : "text-emerald-600"}`}>{resultsPeriod.toUpperCase()} Converted</p>
                    <p className={`text-xl font-serif ${activeStatFilter === "converted" ? "text-white" : "text-emerald-700"}`}>{stats?.result?.converted || 0}</p>
                  </div>
                  <div 
                    onClick={() => setActiveStatFilter(activeStatFilter === "token" ? null : "token")}
                    className={`p-3 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] ${activeStatFilter === "token" ? "bg-teal-600 text-white border-teal-700 shadow-lg" : "bg-teal-50 text-teal-600 border-teal-100"}`}
                  >
                    <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${activeStatFilter === "token" ? "text-teal-50" : "text-teal-600"}`}>{resultsPeriod.toUpperCase()} Token</p>
                    <p className={`text-xl font-serif ${activeStatFilter === "token" ? "text-white" : "text-teal-700"}`}>{stats?.result?.token_received || 0}</p>
                  </div>
                  <div 
                    onClick={() => setActiveStatFilter(activeStatFilter === "visited" ? null : "visited")}
                    className={`p-3 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] ${activeStatFilter === "visited" ? "bg-indigo-600 text-white border-indigo-700 shadow-lg" : "bg-indigo-50 text-indigo-600 border-indigo-100"}`}
                  >
                    <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${activeStatFilter === "visited" ? "text-indigo-50" : "text-indigo-600"}`}>{resultsPeriod.toUpperCase()} Visited</p>
                    <p className={`text-xl font-serif ${activeStatFilter === "visited" ? "text-white" : "text-indigo-700"}`}>{stats?.result?.visited || 0}</p>
                  </div>
                  <div 
                    onClick={() => setActiveStatFilter(activeStatFilter === "dead" ? null : "dead")}
                    className={`p-3 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] ${activeStatFilter === "dead" ? "bg-rose-600 text-white border-rose-700 shadow-lg" : "bg-rose-50 text-rose-600 border-rose-100"}`}
                  >
                    <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${activeStatFilter === "dead" ? "text-rose-50" : "text-rose-600"}`}>{resultsPeriod.toUpperCase()} Dead</p>
                    <p className={`text-xl font-serif ${activeStatFilter === "dead" ? "text-white" : "text-rose-700"}`}>{stats?.result?.dead || 0}</p>
                  </div>
                  <div 
                    onClick={() => setActiveStatFilter(activeStatFilter === "won" ? null : "won")}
                    className={`p-3 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] ${activeStatFilter === "won" ? "bg-emerald-600 text-white border-emerald-700 shadow-lg" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}
                  >
                    <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${activeStatFilter === "won" ? "text-emerald-50" : "text-emerald-600"}`}>{resultsPeriod.toUpperCase()} Won</p>
                    <p className={`text-xl font-serif ${activeStatFilter === "won" ? "text-white" : "text-emerald-700"}`}>{stats?.result?.closed_won || 0}</p>
                  </div>
                  <div 
                    onClick={() => setActiveStatFilter(activeStatFilter === "hold" ? null : "hold")}
                    className={`p-3 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] ${activeStatFilter === "hold" ? "bg-amber-500 text-white border-amber-600 shadow-lg" : "bg-amber-50 text-amber-600 border-amber-100"}`}
                  >
                    <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${activeStatFilter === "hold" ? "text-amber-50" : "text-amber-600"}`}>{resultsPeriod.toUpperCase()} Hold</p>
                    <p className={`text-xl font-serif ${activeStatFilter === "hold" ? "text-white" : "text-amber-700"}`}>{stats?.result?.on_hold || 0}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Monthly Target</span>
                    <span className="text-[10px] font-bold text-gray-900">₹{(stats?.result?.monthly_sales || 0).toLocaleString("en-IN")} / ₹{(stats?.result?.monthly_target || 100000).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="gold-gradient h-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, ((stats?.result?.monthly_sales || 0) / (stats?.result?.monthly_target || 100000)) * 100)}%` }}
                    />
                  </div>
                  <p className="text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    {Math.round(((stats?.result?.monthly_sales || 0) / (stats?.result?.monthly_target || 100000)) * 100)}% achieved this month
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="glass-card rounded-2xl p-1.5 mb-8 flex gap-2 flex-wrap bg-gray-100/30 w-fit backdrop-blur-md border border-gray-200">
          {TABS.map(tab => {
            const count = tab === "All" ? sectionLeads.length : 
                          (tab === "Retargeting" ? sectionLeads.filter(l => ["recycled", "dead"].includes(l.status)).length : 
                           (tab === "Consulting Form" ? consultations.length : 
                            sectionLeads.filter(l => l.status === tab.toLowerCase()).length));
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pill-tab flex items-center gap-2 ${isActive ? "bg-gray-900 text-white shadow-lg" : "text-gray-500 hover:text-gray-900 hover:bg-white"}`}
              >
                {tab}
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {activeTab === "Consulting Form" ? (
          <ConsultationsPanel consultations={consultations} />
        ) : (
          <>
            {/* Search Bar */}
            <div className="p-4 bg-gray-50/50 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search leads..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-eminence-gold focus:ring-1 focus:ring-eminence-gold"
                  />
                </div>
                
                {/* Date Filter */}
                <div className="flex items-center gap-2">
                  <input 
                    type="date"
                    value={leadFilterStartDate}
                    onChange={(e) => setLeadFilterStartDate(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-600 focus:outline-none focus:border-eminence-gold"
                    title="Start Date (Created At)"
                  />
                  <span className="text-gray-400 text-sm">to</span>
                  <input 
                    type="date"
                    value={leadFilterEndDate}
                    onChange={(e) => setLeadFilterEndDate(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-600 focus:outline-none focus:border-eminence-gold"
                    title="End Date (Created At)"
                  />
                  {(leadFilterStartDate || leadFilterEndDate) && (
                    <button 
                      onClick={() => { setLeadFilterStartDate(""); setLeadFilterEndDate(""); }}
                      className="text-gray-400 hover:text-red-500"
                      title="Clear Date Filter"
                    >
                      <XCircle size={16} />
                    </button>
                  )}
                </div>
                
                {activeTab === "Retargeting" && (
                  <div className="flex gap-2">
                    <select 
                      value={retargetingStatusFilter}
                      onChange={e => setRetargetingStatusFilter(e.target.value)}
                      className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-500"
                    >
                      <option value="all">All Recycle Status</option>
                      <option value="recycled">Recycled Only</option>
                      <option value="dead">Dead Only</option>
                    </select>
                    <select 
                      value={retargetingGradeFilter}
                      onChange={e => setRetargetingGradeFilter(e.target.value)}
                      className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-500"
                    >
                      <option value="all">All Grades</option>
                      <option value="Hot">Hot Only</option>
                      <option value="Warm">Warm Only</option>
                      <option value="Cold">Cold Only</option>
                    </select>
                    <button 
                      onClick={() => setShowBulkModal(true)}
                      disabled={selectedLeadsForBulk.length === 0}
                      className="bg-eminence-gold text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-black disabled:opacity-50 disabled:hover:bg-eminence-gold transition-colors"
                    >
                      <MessageSquare size={14} /> Bulk WhatsApp ({selectedLeadsForBulk.length})
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {activeStatFilter && (
                  <button 
                    onClick={() => setActiveStatFilter(null)}
                    className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded border border-red-200 hover:bg-red-500 hover:text-white transition-colors uppercase tracking-widest"
                  >
                    Clear Stat Filter: {activeStatFilter.replace('_', ' ')}
                  </button>
                )}
                <div className="text-xs text-gray-400 font-medium uppercase tracking-widest">
                  Showing {getFilteredLeads().length} leads
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto glass-card rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-[10px] text-gray-400 uppercase bg-gray-50/80 backdrop-blur-sm border-b border-gray-100">
                    {activeTab === "Retargeting" && (
                      <th className="px-6 py-4 text-center">
                        <input 
                          type="checkbox" 
                          onChange={selectAllFiltered}
                          className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                          checked={selectedLeadsForBulk.length > 0 && selectedLeadsForBulk.length === getFilteredLeads().length}
                        />
                      </th>
                    )}
                    <th className="px-6 py-4 tracking-widest font-bold">Client Information</th>
                    <th className="px-6 py-4 tracking-widest font-bold">Direct Contact</th>
                    <th className="px-6 py-4 tracking-widest font-bold">Next Follow-up</th>
                    <th className="px-6 py-4 tracking-widest font-bold">Pipeline Status</th>
                    <th className="px-6 py-4 tracking-widest font-bold text-center">Visiting Today?</th>
                    <th className="px-6 py-4 tracking-widest font-bold">Context</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {getFilteredLeads().map(lead => (
                    <tr
                      key={lead.id}
                      className={`group cursor-pointer transition-all duration-300 hover:bg-gray-50/80 ${getLeadRowClass(lead)}`}
                    >
                      {activeTab === "Retargeting" && (
                        <td className="px-6 py-5 text-center">
                          <input 
                            type="checkbox" 
                            checked={selectedLeadsForBulk.includes(lead.id)}
                            onChange={() => toggleLeadSelection(lead.id)}
                            className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                            onClick={e => e.stopPropagation()}
                          />
                        </td>
                      )}
                      <td className="px-6 py-5" onClick={() => setSelectedLead(lead)}>
                        <div className="flex items-center gap-3">
                          <div className="relative group/star">
                            <Star 
                              size={16} 
                              fill={lead.is_favorite ? "#C9A57B" : "none"} 
                              className={`transition-colors ${lead.is_favorite ? "text-eminence-gold" : "text-gray-300 group-hover/star:text-gray-400"}`} 
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 text-base group-hover:text-eminence-gold transition-colors">{lead.name}</span>
                              {lead.is_transferred && (
                                <div className="bg-purple-50 text-purple-600 p-1 rounded-full border border-purple-100" title={`Transferred from ${lead.transferred_from_name}`}>
                                  <ArrowRightLeft size={10} />
                                </div>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">
                              {lead.lead_number || "LD-NEW"} • {lead.city || "No City"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-gray-700 tracking-tight">{lead.phone}</span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}`, '_blank'); }} 
                              className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                            >
                              <MessageSquare size={14} />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); startCall(lead); }} 
                              className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            >
                              <Phone size={14} />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-bold">{lead.follow_up_date ? new Date(lead.follow_up_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "Not Scheduled"}</span>
                          {lead.follow_up_time && (
                            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">
                              <Clock size={10} /> {lead.follow_up_time} • {lead.follow_up_type || "Call"}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-2 items-start">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${STATUS_COLORS[lead.status]}`}>
                            {lead.status}
                          </span>
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 rounded-full border border-gray-100">
                            <div className={`w-1.5 h-1.5 rounded-full ${GRADE_COLORS[lead.grade] || "bg-gray-300"}`}></div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{lead.grade || "No Grade"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        {lead.status === "visit" && lead.follow_up_date === new Date().toISOString().split("T")[0] ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Yes ({lead.follow_up_time || "—"})
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-bold capitalize text-xs tracking-wide">{lead.source}</span>
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                            {lead.branch} • {lead.section}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {getFilteredLeads().length === 0 && (
                    <tr>
                      <td colSpan={activeTab === "Retargeting" ? 7 : 6} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center">
                          <div className="p-4 bg-gray-50 rounded-full mb-4">
                            <Search size={32} className="text-gray-300" />
                          </div>
                          <p className="text-gray-500 font-medium">No leads found matching your criteria</p>
                          <p className="text-gray-400 text-xs mt-1 uppercase tracking-widest">Try adjusting your filters or search query</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>


      {/* LEAD DETAIL & CALLING MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 z-[999] flex items-start justify-center p-4 pt-32 overflow-y-auto bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => !callingMode && setSelectedLead(null)} />

          <div className="relative bg-gray-50 w-full max-w-5xl mb-8 rounded-xl shadow-2xl flex flex-col overflow-hidden">

            {/* Modal Header */}
            <div className="bg-white px-6 py-4 border-b flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-eminence-gold/10 text-eminence-gold rounded-full flex items-center justify-center font-bold text-xl">
                  {selectedLead.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900">{selectedLead.name}</h2>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${STATUS_COLORS[selectedLead.status]}`}>
                      {selectedLead.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{selectedLead.lead_number || "LD-NEW"} • Created {new Date(selectedLead.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {!callingMode ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openEditModal(selectedLead)}
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded font-medium hover:bg-gray-200 transition-colors shadow-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => startCall()}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <Phone size={18} /> Initiate Call
                  </button>
                  <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-gray-700">
                    <XCircle size={24} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  {callActive ? (
                    <>
                      <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded font-bold border border-red-200 shadow-inner uppercase text-sm">
                        <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                        On Active Call...
                      </div>
                      <button 
                        onClick={endCall} 
                        className="bg-red-600 text-white px-6 py-2 rounded font-bold hover:bg-red-700 shadow-md transition-all flex items-center gap-2"
                      >
                        <CheckCircle2 size={18} /> Call Done
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded font-bold border border-emerald-200 uppercase text-sm">
                      <CheckCircle2 size={16} /> Call Completed
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Body */}
            <div className="flex-1 flex overflow-hidden">

              {/* Left Column - Main Details */}
              <div className="flex-1 overflow-y-auto p-6 bg-white border-r">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 border-b pb-2">Overview Information</h3>

                <div className="grid grid-cols-2 gap-y-6 gap-x-8 mb-8">
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wide">Phone Number</label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="font-semibold text-gray-800 text-lg">{selectedLead.phone}</p>
                      <a href={`https://wa.me/${selectedLead.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-green-500 hover:text-green-600"><MessageSquare size={18} /></a>
                    </div>
                  </div>

                  {selectedLead.secondary_phone && (
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wide">Secondary Number</label>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="font-semibold text-gray-800 text-lg">{selectedLead.secondary_phone}</p>
                        <a href={`https://wa.me/${selectedLead.secondary_phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-green-500 hover:text-green-600"><MessageSquare size={18} /></a>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wide">Branch / Section</label>
                    <p className="font-medium text-gray-800 mt-1">{selectedLead.branch} — {selectedLead.section}</p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wide">City</label>
                    <p className="font-medium text-gray-800 mt-1">{selectedLead.city || "Not Provided"}</p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wide">Hair Condition</label>
                    <p className="font-medium text-gray-800 mt-1">{selectedLead.hair_condition || "Not Provided"}</p>
                  </div>
                </div>

                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 border-b pb-2">Activity & Comments History</h3>
                <div className="space-y-4">
                  {(selectedLead.notes || []).map((note, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-sm text-gray-800">{note.author}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12} /> {new Date(note.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{note.text}</p>
                    </div>
                  ))}
                  {(!selectedLead.notes || selectedLead.notes.length === 0) && (
                    <p className="text-gray-400 text-sm italic">No history logged yet.</p>
                  )}
                </div>
              </div>

              {/* Right Column - Action / System */}
              <div className="w-96 bg-gray-50 overflow-y-auto flex flex-col">

                {callingMode ? (
                  <div className={`p-6 bg-white border-b-4 ${callActive ? 'border-gray-200 opacity-50' : 'border-blue-500'} h-full transition-opacity`}>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Phone className={callActive ? "text-gray-400" : "text-blue-500"} /> Log Call Outcome
                      </h3>
                      <div className="flex gap-2">
                        {!callActive && (
                          <button 
                            onClick={triggerActualCall}
                            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 shadow-sm flex items-center gap-2 text-xs font-bold transition-all active:scale-95"
                          >
                            <Phone size={14} /> CALL
                          </button>
                        )}
                        <button 
                          onClick={() => { setCallingMode(false); setCallActive(false); }}
                          className="bg-gray-100 text-gray-400 p-2 rounded-lg hover:bg-gray-200 hover:text-gray-600 transition-all"
                        >
                          <XCircle size={14} />
                        </button>
                      </div>
                    </div>
                    
                    {callActive && (
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6 text-blue-800 text-sm font-medium">
                        Call in progress... You can write your <strong>Discussion Comments</strong> below while talking. Other fields will enable once the call is done.
                      </div>
                    )}

                    <form onSubmit={saveCallLog} className="space-y-5">
                      <fieldset disabled={callActive} className="space-y-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Call Outcome *</label>
                          <select
                            required
                            value={callOutcome}
                            onChange={e => setCallOutcome(e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="Interested (Follow-up)">Interested (Follow-up)</option>
                            <option value="Visit Scheduled">Visit Scheduled</option>
                            <option value="Visited">Visited</option>
                            <option value="Token Received">Token Received</option>
                            <option value="Converted">Converted</option>
                            <option value="Not Picked Up">Not Picked Up / Busy</option>
                            <option value="Said No">Said No / Not Interested</option>
                          </select>
                        </div>

                        {["Interested (Follow-up)", "Visit Scheduled", "Visited", "Not Picked Up"].includes(callOutcome) && (
                          <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Lead Grade</label>
                            <div className="flex gap-2">
                              {(callOutcome === "Not Picked Up" ? ["Dead"] : ["Hot", "Warm", "Cold"]).map(g => (
                                <button
                                  type="button"
                                  key={g}
                                  onClick={() => setCallForm({ ...callForm, grade: (callForm.grade === g ? "" : g) })}
                                  className={`flex-1 py-2 text-sm rounded font-medium border ${callForm.grade === g ? (g === 'Dead' ? 'bg-red-600 text-white border-red-600' : 'bg-gray-800 text-white border-gray-800') : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                >
                                  {g}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {callOutcome === "Visited" && (
                          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-5 shadow-sm">
                            <label className="block text-sm font-bold text-blue-800 mb-2">Consulted By *</label>
                            <input
                              type="text"
                              required
                              placeholder="Enter employee name"
                              value={callForm.consultedBy}
                              onChange={e => setCallForm({ ...callForm, consultedBy: e.target.value })}
                              className="w-full border-blue-200 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        )}

                        {["Token Received", "Converted"].includes(callOutcome) && (
                          <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 mb-5 shadow-sm space-y-4">
                            <div>
                              <label className="block text-xs font-bold text-emerald-800 uppercase tracking-widest mb-2">Sale Amount (₹) *</label>
                              <input
                                type="number"
                                required
                                placeholder="Enter total amount"
                                value={callForm.saleAmount}
                                onChange={e => setCallForm({ ...callForm, saleAmount: e.target.value })}
                                className="w-full border-emerald-200 rounded-xl p-3 text-2xl font-black text-emerald-900 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs font-bold text-emerald-800 uppercase tracking-widest mb-2">Payment Mode *</label>
                              <div className="grid grid-cols-3 gap-2">
                                {["UPI", "Cash", "Card"].map(mode => (
                                  <button
                                    type="button"
                                    key={mode}
                                    onClick={() => setCallForm({ ...callForm, paymentMode: mode })}
                                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${callForm.paymentMode === mode ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-100'}`}
                                  >
                                    {mode}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {["Interested (Follow-up)", "Visit Scheduled", "Not Picked Up"].includes(callOutcome) && (() => {
                          const TIME_SLOTS = [];
                          for (let h = 9; h <= 20; h++) {
                            for (let m of ["00", "30"]) {
                              const hour12 = h > 12 ? h - 12 : h;
                              const ampm = h >= 12 ? "PM" : "AM";
                              const value24 = `${String(h).padStart(2, "0")}:${m}`;
                              const label12 = `${String(hour12).padStart(2, "0")}:${m} ${ampm}`;
                              TIME_SLOTS.push({ value: value24, label: label12 });
                            }
                          }
                          const busySlots = getBusyTimeSlots(callForm.nextDate);
                          return (
                            <div className="grid grid-cols-2 gap-3 mb-5">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  {callOutcome === "Visit Scheduled" ? "Visit Date" : (callOutcome === "Not Picked Up" ? "Reminder Date" : "Next Follow-up")}
                                </label>
                                <input type="date" value={callForm.nextDate} onChange={e => setCallForm({ ...callForm, nextDate: e.target.value })} className="w-full border rounded p-2 text-sm" />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
                                {callOutcome === "Visit Scheduled" ? (
                                  <select
                                    value={callForm.nextTime}
                                    onChange={e => setCallForm({ ...callForm, nextTime: e.target.value })}
                                    className="w-full border rounded p-2 text-sm bg-white"
                                  >
                                    <option value="">Select Time Slot</option>
                                    {TIME_SLOTS.map(slot => {
                                      const isBooked = busySlots.includes(slot.value);
                                      return (
                                        <option key={slot.value} value={slot.value} disabled={isBooked}>
                                          {slot.label} {isBooked ? "(Booked)" : ""}
                                        </option>
                                      );
                                    })}
                                  </select>
                                ) : (
                                  <input type="time" value={callForm.nextTime} onChange={e => setCallForm({ ...callForm, nextTime: e.target.value })} className="w-full border rounded p-2 text-sm" />
                                )}
                              </div>
                            </div>
                          );
                        })()}

                      </fieldset>
                      
                      <div className="mt-5">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Discussion Comments</label>
                        <textarea
                          rows="4"
                          value={callForm.comment}
                          onChange={e => setCallForm({ ...callForm, comment: e.target.value })}
                          placeholder="What was discussed? (You can type during the call)"
                          className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        ></textarea>
                      </div>

                      <button 
                        type="submit" 
                        disabled={callActive}
                        className="w-full bg-blue-600 text-white py-3 mt-5 rounded-md font-medium hover:bg-blue-700 transition-colors shadow-lg disabled:bg-gray-300 disabled:shadow-none"
                      >
                        Save Log & Update Lead
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="p-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 border-b pb-2">System Information</h3>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between border-b pb-2 border-gray-200">
                        <span className="text-gray-500">Assigned To</span>
                        <span className="font-medium">{selectedLead.assigned_to_name || "Unassigned"}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2 border-gray-200">
                        <span className="text-gray-500">Lead Source</span>
                        <span className="font-medium capitalize">{selectedLead.source}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2 border-gray-200">
                        <span className="text-gray-500">Created By</span>
                        <span className="font-medium">{selectedLead.created_by}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2 border-gray-200">
                        <span className="text-gray-500">Created At</span>
                        <span className="font-medium text-right">{new Date(selectedLead.created_at).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2 border-gray-200">
                        <span className="text-gray-500">Last Updated</span>
                        <span className="font-medium text-right">{new Date(selectedLead.updated_at).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      {selectedLead.status === "visit" && (
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 space-y-4">
                          <h4 className="font-bold text-purple-800 text-xs uppercase">Visit Outcome</h4>
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setVisitForm({ ...visitForm, liked: true })}
                                className={`flex-1 py-2 text-xs font-bold rounded border ${visitForm.liked === true ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-600 border-emerald-200'}`}
                              >
                                Client Liked
                              </button>
                              <button
                                onClick={() => setVisitForm({ ...visitForm, liked: false })}
                                className={`flex-1 py-2 text-xs font-bold rounded border ${visitForm.liked === false ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-rose-600 border-rose-200'}`}
                              >
                                Not Interested
                              </button>
                            </div>

                            {visitForm.liked === true && (
                              <div>
                                <label className="block text-[10px] text-gray-500 uppercase mb-1">Service Ready in (Days)</label>
                                <input
                                  type="number"
                                  value={visitForm.serviceDays}
                                  onChange={e => setVisitForm({ ...visitForm, serviceDays: parseInt(e.target.value) })}
                                  className="w-full border rounded p-2 text-sm"
                                />
                                <button
                                  onClick={() => handleVisitOutcome(true)}
                                  className="w-full bg-emerald-600 text-white mt-3 py-2 rounded text-sm font-bold"
                                >
                                  Mark as In Progress
                                </button>
                              </div>
                            )}

                            {visitForm.liked === false && (
                              <div>
                                <label className="block text-[10px] text-gray-500 uppercase mb-1">Reason / Note</label>
                                <textarea
                                  value={visitForm.note}
                                  onChange={e => setVisitForm({ ...visitForm, note: e.target.value })}
                                  className="w-full border rounded p-2 text-sm"
                                  placeholder="Why not interested?"
                                />
                                <button
                                  onClick={() => handleVisitOutcome(false)}
                                  className="w-full bg-rose-600 text-white mt-3 py-2 rounded text-sm font-bold"
                                >
                                  Mark as Not Interested
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {selectedLead.status === "in process" && (
                        <button
                          onClick={markConverted}
                          className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 hover:bg-emerald-700"
                        >
                          <CheckCircle2 size={18} /> Mark as Converted
                        </button>
                      )}

                      <button
                        onClick={() => openTransferModal()}
                        className="w-full border-2 border-dashed border-gray-300 text-gray-500 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center gap-2"
                      >
                        <ArrowRightLeft size={16} /> Transfer Lead
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      )}

      {/* TRANSFER MODAL */}
      {showTransferModal && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                <ArrowRightLeft size={18} className="text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Transfer Lead</h3>
                <p className="text-xs text-gray-400">{selectedLead?.name}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-5 mt-3">Select a staff member to reassign this lead to.</p>

            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Assign To</label>
                {employeesLoading ? (
                  <div className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-400 animate-pulse">
                    Loading employees...
                  </div>
                ) : (
                  <select
                    required
                    value={transferTargetId}
                    onChange={e => setTransferTargetId(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-eminence-gold focus:outline-none bg-white"
                  >
                    <option value="">— Select employee —</option>
                    {allEmployees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                    {allEmployees.length === 0 && (
                      <option disabled>No other employees found</option>
                    )}
                  </select>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowTransferModal(false); setTransferTargetId(""); }}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!transferTargetId || employeesLoading}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-gray-900 rounded-xl hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Transfer Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK MESSAGE MODAL */}
      <BulkMessageModal 
        show={showBulkModal} 
        onClose={() => setShowBulkModal(false)} 
        onSend={sendBulkMessages} 
        message={bulkMessage} 
        setMessage={setBulkMessage} 
        selectedCount={selectedLeadsForBulk.length} 
      />

      {/* ADD LEAD MODAL */}
      {showAddLeadModal && (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center p-4 pt-32 overflow-y-auto bg-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-fade-in border border-white/20">
            <div className="bg-gray-900 px-8 py-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Add New Lead</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Manual Entry System</p>
              </div>
              <button onClick={() => setShowAddLeadModal(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-all">
                <XCircle size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddLead} className="p-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Full Name *</label>
                  <input
                    required
                    type="text"
                    value={newLeadForm.name}
                    onChange={e => setNewLeadForm({...newLeadForm, name: e.target.value})}
                    placeholder="Enter client name"
                    className="w-full border border-gray-100 bg-gray-50/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Phone Number *</label>
                  <input
                    required
                    type="tel"
                    value={newLeadForm.phone}
                    onChange={e => setNewLeadForm({...newLeadForm, phone: e.target.value})}
                    placeholder="+91 00000 00000"
                    className="w-full border border-gray-100 bg-gray-50/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Secondary Number</label>
                  <input
                    type="tel"
                    value={newLeadForm.secondary_phone}
                    onChange={e => setNewLeadForm({...newLeadForm, secondary_phone: e.target.value})}
                    placeholder="+91 00000 00000"
                    className="w-full border border-gray-100 bg-gray-50/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Branch</label>
                  <select
                    value={newLeadForm.branch}
                    onChange={e => setNewLeadForm({...newLeadForm, branch: e.target.value})}
                    className="w-full border border-gray-100 bg-gray-50/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none appearance-none transition-all"
                  >
                    <option value="Baroda">Baroda</option>
                    <option value="Surat">Surat</option>
                    <option value="Not Decided">Not Decided</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Section</label>
                  <select
                    value={newLeadForm.section}
                    onChange={e => setNewLeadForm({...newLeadForm, section: e.target.value})}
                    className="w-full border border-gray-100 bg-gray-50/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none appearance-none transition-all"
                  >
                    <option value="Men">Men</option>
                    <option value="Female">Female</option>
                    <option value="Not Decided">Not Decided</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Source</label>
                  <select
                    value={newLeadForm.source}
                    onChange={e => setNewLeadForm({...newLeadForm, source: e.target.value})}
                    className="w-full border border-gray-100 bg-gray-50/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none appearance-none transition-all"
                  >
                    <option value="Manual">Manual Entry</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Referral">Referral</option>
                    <option value="Facebook">Facebook Ads</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">City</label>
                  <input
                    type="text"
                    value={newLeadForm.city}
                    onChange={e => setNewLeadForm({...newLeadForm, city: e.target.value})}
                    placeholder="e.g. Vadodara"
                    className="w-full border border-gray-100 bg-gray-50/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Hair Condition</label>
                  <input
                    type="text"
                    value={newLeadForm.hair_condition}
                    onChange={e => setNewLeadForm({...newLeadForm, hair_condition: e.target.value})}
                    placeholder="e.g. Hair Fall, Thinning"
                    className="w-full border border-gray-100 bg-gray-50/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Notes</label>
                  <textarea
                    value={newLeadForm.notes}
                    onChange={e => setNewLeadForm({...newLeadForm, notes: e.target.value})}
                    placeholder="Add any initial context..."
                    className="w-full border border-gray-100 bg-gray-50/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none h-24 transition-all"
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-4 pt-8">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="flex-1 px-6 py-4 text-xs font-bold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 text-xs font-bold text-white bg-gray-900 rounded-xl hover:premium-gradient transition-all uppercase tracking-widest shadow-lg hover:shadow-xl"
                >
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT LEAD MODAL */}
      {showEditLeadModal && editLeadForm && (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center p-4 pt-32 overflow-y-auto bg-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-fade-in border border-white/20">
            <div className="bg-gray-900 px-8 py-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Edit Lead</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Updating client records</p>
              </div>
              <button onClick={() => setShowEditLeadModal(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-all">
                <XCircle size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditLead} className="p-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Full Name *</label>
                  <input
                    required
                    type="text"
                    value={editLeadForm.name}
                    onChange={e => setEditLeadForm({...editLeadForm, name: e.target.value})}
                    placeholder="Enter client name"
                    className="w-full border border-gray-100 bg-gray-50/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Phone Number *</label>
                  <input
                    required
                    type="tel"
                    value={editLeadForm.phone}
                    onChange={e => setEditLeadForm({...editLeadForm, phone: e.target.value})}
                    placeholder="+91 00000 00000"
                    className="w-full border border-gray-100 bg-gray-50/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Secondary Number</label>
                  <input
                    type="tel"
                    value={editLeadForm.secondary_phone}
                    onChange={e => setEditLeadForm({...editLeadForm, secondary_phone: e.target.value})}
                    placeholder="+91 00000 00000"
                    className="w-full border border-gray-100 bg-gray-50/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Branch</label>
                  <select
                    value={editLeadForm.branch}
                    onChange={e => setEditLeadForm({...editLeadForm, branch: e.target.value})}
                    className="w-full border border-gray-100 bg-gray-50/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none appearance-none transition-all"
                  >
                    <option value="Baroda">Baroda</option>
                    <option value="Surat">Surat</option>
                    <option value="Not Decided">Not Decided</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Section</label>
                  <select
                    value={editLeadForm.section}
                    onChange={e => setEditLeadForm({...editLeadForm, section: e.target.value})}
                    className="w-full border border-gray-100 bg-gray-50/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none appearance-none transition-all"
                  >
                    <option value="Men">Men</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Status</label>
                  <select
                    value={editLeadForm.status}
                    onChange={e => setEditLeadForm({...editLeadForm, status: e.target.value})}
                    className="w-full border border-gray-100 bg-gray-50/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none appearance-none transition-all"
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">City</label>
                  <input
                    type="text"
                    value={editLeadForm.city}
                    onChange={e => setEditLeadForm({...editLeadForm, city: e.target.value})}
                    placeholder="e.g. Vadodara"
                    className="w-full border border-gray-100 bg-gray-50/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                  />
                </div>
                {editLeadForm.status === "converted" && (
                  <div className="col-span-2 animate-fade-in">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Closure Amount (₹)</label>
                    <input
                      type="number"
                      required
                      value={editLeadForm.total_sale_amount || ""}
                      onChange={e => setEditLeadForm({...editLeadForm, total_sale_amount: parseFloat(e.target.value) || 0})}
                      placeholder="Enter closure amount"
                      className="w-full border border-gray-100 bg-gray-50/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all font-serif"
                    />
                  </div>
                )}
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Hair Condition</label>
                  <input
                    type="text"
                    value={editLeadForm.hair_condition}
                    onChange={e => setEditLeadForm({...editLeadForm, hair_condition: e.target.value})}
                    placeholder="e.g. Hair Fall, Thinning"
                    className="w-full border border-gray-100 bg-gray-50/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-8">
                <button
                  type="button"
                  onClick={() => setShowEditLeadModal(false)}
                  className="flex-1 px-6 py-4 text-xs font-bold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 text-xs font-bold text-white bg-gray-900 rounded-xl hover:premium-gradient transition-all uppercase tracking-widest shadow-lg hover:shadow-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Calendar Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col animate-fade-in text-left">
            <button 
              onClick={() => setShowLeaveModal(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-950 transition-colors z-10 p-1 hover:bg-gray-100 rounded-full"
            >
              <XCircle size={24} />
            </button>
            
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-serif text-xl text-gray-800 font-bold">Manage My Leaves</h3>
              <p className="text-xs text-gray-500 mt-1">Tick the days on the calendar when you are on leave. Leads will automatically route to other employees on these days.</p>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Month Selector */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => {
                      if (calendarMonth === 1) {
                        setCalendarYear(calendarYear - 1);
                        setCalendarMonth(12);
                      } else {
                        setCalendarMonth(calendarMonth - 1);
                      }
                    }} 
                    className="p-2 border border-gray-200 hover:border-gray-900 rounded-lg transition-colors bg-white hover:bg-gray-50"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <h4 className="font-serif text-lg font-bold text-gray-800 select-none">
                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][calendarMonth - 1]} {calendarYear}
                  </h4>
                  <button 
                    type="button"
                    onClick={() => {
                      if (calendarMonth === 12) {
                        setCalendarYear(calendarYear + 1);
                        setCalendarMonth(1);
                      } else {
                        setCalendarMonth(calendarMonth + 1);
                      }
                    }} 
                    className="p-2 border border-gray-200 hover:border-gray-950 rounded-lg transition-colors bg-white hover:bg-gray-50"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                
                <div className="text-xs text-gray-500 font-semibold bg-red-50 text-red-600 px-3 py-1.5 rounded-full border border-red-100 select-none">
                  Total marked: {myLeaves.filter(d => d.startsWith(`${calendarYear}-${calendarMonth.toString().padStart(2, '0')}`)).length} days
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 bg-gray-100 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((day) => (
                  <div key={day} className="bg-gray-50 text-center py-2.5 text-[10px] uppercase tracking-widest text-gray-400 font-bold border-b border-gray-100">{day}</div>
                ))}
                
                {(() => {
                  const totalDays = new Date(calendarYear, calendarMonth, 0).getDate();
                  const firstWeekday = new Date(calendarYear, calendarMonth - 1, 1).getDay();
                  const todayStr = new Date().toISOString().split("T")[0];
                  
                  const cells = [];
                  for (let i = 0; i < firstWeekday; i++) {
                    cells.push(<div key={`empty-${i}`} className="bg-white aspect-square" />);
                  }
                  
                  for (let d = 1; d <= totalDays; d++) {
                    const dateStr = `${calendarYear}-${calendarMonth.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
                    const req = leaveRequests.find(r => r.date === dateStr);
                    const isApproved = myLeaves.includes(dateStr) || req?.status === "approved";
                    const isPendingSuper = req?.status === "pending";
                    const isPendingBranch = req?.status === "super_approved";
                    const isRejected = req?.status === "rejected";
                    
                    const isToday = dateStr === todayStr;
                    
                    let bgClass = "bg-white text-gray-800 hover:bg-gray-50";
                    let label = "";
                    let labelClass = "";
                    
                    if (isApproved) {
                      bgClass = "bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 border-emerald-200";
                      label = "On Leave";
                      labelClass = "text-emerald-500 bg-emerald-100/50";
                    } else if (isPendingSuper) {
                      bgClass = "bg-amber-50 text-amber-700 hover:bg-amber-100/80 border-amber-200";
                      label = "Pending Super";
                      labelClass = "text-amber-600 bg-amber-100/50";
                    } else if (isPendingBranch) {
                      bgClass = "bg-orange-50 text-orange-700 hover:bg-orange-100/80 border-orange-200";
                      label = "Pending Branch";
                      labelClass = "text-orange-600 bg-orange-100/50";
                    } else if (isRejected) {
                      bgClass = "bg-rose-50 text-rose-700 hover:bg-rose-100/80 border-rose-200";
                      label = "Rejected";
                      labelClass = "text-rose-500 bg-rose-100/50";
                    }

                    cells.push(
                      <button
                        key={dateStr}
                        type="button"
                        onClick={async () => {
                          if (isApproved || isPendingSuper || isPendingBranch || isRejected) {
                            if (window.confirm(`Do you want to cancel your leave/request for ${dateStr}?`)) {
                              try {
                                await api.post("/users/me/leaves/cancel", { date: dateStr });
                                toast.success("Leave/Request cancelled successfully");
                                fetchLeaves();
                              } catch (err) {
                                toast.error("Failed to cancel leave/request");
                              }
                            }
                          } else {
                            try {
                              await api.post("/users/me/leaves/request", { date: dateStr });
                              toast.success("Leave request submitted for approval");
                              fetchLeaves();
                            } catch (err) {
                              toast.error(err.response?.data?.detail || "Failed to request leave");
                            }
                          }
                        }}
                        className={`aspect-square p-2 flex flex-col justify-between text-left transition-all border ${bgClass}`}
                      >
                        <span className={`text-xs font-bold ${isToday ? "bg-eminence-gold text-white w-5 h-5 rounded-full flex items-center justify-center -m-1" : ""}`}>{d}</span>
                        {label && (
                          <span className={`text-[8px] font-bold uppercase tracking-wide px-1 rounded block text-center w-full ${labelClass}`}>{label}</span>
                        )}
                      </button>
                    );
                  }
                  return cells;
                })()}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                className="px-6 py-3 bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showDuplicateModal && (
        <DuplicateLeadsModal 
          show={showDuplicateModal} 
          onClose={() => setShowDuplicateModal(false)}
          onViewLead={(lead) => {
            setSelectedLead(lead);
            setShowDuplicateModal(false);
          }}
        />
      )}
    </div>
  );
}

const DuplicateLeadsModal = ({ show, onClose, onViewLead }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (show) {
      setLoading(true);
      api.get("/leads/duplicates")
        .then(res => {
          setData(res.data);
        })
        .catch(err => {
          console.error("Failed to load duplicate leads:", err);
          toast.error("Failed to load duplicate leads");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [show]);

  if (!show) return null;

  const secret = data?.secret || "eminence_secret_123";
  const duplicates = data?.duplicates || {};
  const duplicateGroups = Object.entries(duplicates);

  const prodWebhookUrl = `${window.location.origin}/webhooks/duplicate-leads?key=${secret}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(prodWebhookUrl);
    setCopied(true);
    toast.success("Webhook URL copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden relative max-h-[85vh] flex flex-col animate-fade-in text-left">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-950 transition-colors z-10 p-1 hover:bg-gray-100 rounded-full"
        >
          <XCircle size={24} />
        </button>
        
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-serif text-xl text-gray-800 font-bold flex items-center gap-2">
            <User className="text-red-500" size={20} /> Duplicate Leads Checker
          </h3>
          <p className="text-xs text-gray-500 mt-1">Below are the leads grouped by matching phone numbers. You can view each lead or copy the webhook integration URL.</p>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Webhook Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Integration Webhook URL (GET)</p>
            <div className="flex gap-2">
              <input 
                type="text" 
                readOnly 
                value={prodWebhookUrl}
                className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-600 focus:outline-none"
              />
              <button 
                onClick={handleCopy}
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
              >
                {copied ? "Copied!" : "Copy URL"}
              </button>
            </div>
            <p className="text-[9px] text-gray-400 mt-2">Use this webhook in your automations (e.g. Zapier, Make) to fetch a live JSON feed of all duplicate leads.</p>
          </div>

          {/* Duplicates List */}
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
              <span className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Checking for duplicates…</span>
            </div>
          ) : duplicateGroups.length === 0 ? (
            <div className="text-center py-16 text-gray-400 italic text-sm">
              No duplicate leads found. All lead phone numbers are unique!
            </div>
          ) : (
            <div className="space-y-6">
              {duplicateGroups.map(([phone, groupLeads]) => (
                <div key={phone} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-red-50/50 px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-red-700">Phone: {phone}</span>
                    <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full">{groupLeads.length} matches</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-400">
                          <th className="px-4 py-2.5">Name</th>
                          <th className="px-4 py-2.5">Status</th>
                          <th className="px-4 py-2.5">Grade</th>
                          <th className="px-4 py-2.5">Assigned To</th>
                          <th className="px-4 py-2.5">Created</th>
                          <th className="px-4 py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {groupLeads.map(lead => (
                          <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-gray-800">{lead.name}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                lead.status === "new" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                                lead.status === "in process" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                                lead.status === "converted" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                                "bg-gray-100 text-gray-600 border border-gray-200"
                              }`}>{lead.status || "new"}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold text-white ${
                                lead.grade === "Hot" ? "bg-red-500" : lead.grade === "Warm" ? "bg-orange-400" : "bg-blue-400"
                              }`}>{lead.grade || "Cold"}</span>
                            </td>
                            <td className="px-4 py-3 text-gray-500">{lead.assigned_to_name || "Unassigned"}</td>
                            <td className="px-4 py-3 text-gray-400">{lead.created_at?.split("T")[0] || "—"}</td>
                            <td className="px-4 py-3 text-right">
                              <button 
                                onClick={() => onViewLead(lead)}
                                className="px-3 py-1 bg-gray-900 hover:bg-black text-white text-[10px] font-bold rounded-lg transition-colors"
                              >
                                View Lead
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const BulkMessageModal = ({ show, onClose, onSend, message, setMessage, selectedCount }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Send Bulk Message</h3>
        <p className="text-sm text-gray-500 mb-6">You have selected <span className="font-bold text-gray-800">{selectedCount} clients</span>. This will open WhatsApp for each client sequentially.</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Message Template</label>
            <textarea 
              rows="6"
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-4 text-sm focus:ring-2 focus:ring-eminence-gold focus:outline-none bg-gray-50"
              placeholder="Type your message here..."
            ></textarea>
            <p className="text-[10px] text-gray-400 mt-2">Note: Personalized names are not yet supported in bulk mode. Use a general greeting.</p>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-bold text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button 
              onClick={onSend}
              className="flex-1 px-4 py-3 text-sm font-bold text-white bg-eminence-text rounded-lg hover:bg-black"
            >
              Start Sending
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function ConsultationsPanel({ consultations, refresh }) {
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState("");
  const [editingConsultation, setEditingConsultation] = useState(null);

  const filtered = consultations.filter(c => {
    const term = search.toLowerCase();
    return (
      (c.name || "").toLowerCase().includes(term) ||
      (c.phone || "").toLowerCase().includes(term) ||
      (c.consulted_by || "").toLowerCase().includes(term) ||
      (c.location || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Search Bar for Consultations */}
      <div className="p-4 bg-white border border-gray-200 rounded-xl flex flex-wrap justify-between items-center gap-4 shadow-sm">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search consultations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-eminence-gold focus:ring-1 focus:ring-eminence-gold"
          />
        </div>
        <div className="text-xs text-gray-400 font-medium uppercase tracking-widest">
          Showing {filtered.length} consultations
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((c) => (
          <div key={c.id} className="eminence-card bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-300">
            <div className="p-5 flex flex-wrap lg:flex-nowrap items-center justify-between gap-4">
              
              <div className="flex items-center gap-4 min-w-[250px]">
                <div className="w-10 h-10 rounded-full bg-eminence-gold/10 flex items-center justify-center text-eminence-gold">
                  <User size={18} />
                </div>
                <div>
                  <p className="font-serif text-lg leading-tight text-gray-800">{c.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone size={12} className="text-eminence-muted" />
                    <span className="text-xs text-eminence-muted">{c.phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 md:gap-12 text-center md:text-left">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-eminence-muted mb-1">Date</p>
                  <p className="text-sm font-medium">{c.date || "N/A"}</p>
                </div>
                
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-eminence-muted mb-1">Location</p>
                  <p className="text-sm font-medium flex items-center gap-1">
                    <MapPin size={12} className="text-eminence-gold" />
                    {c.location || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-eminence-muted mb-1">Consulted By</p>
                  <p className="text-sm font-medium">{c.consulted_by || "Unknown"}</p>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-eminence-muted mb-1">Status</p>
                  <span className="text-xs uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                    {c.status || "New"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setEditingConsultation(c)}
                  className="text-xs uppercase tracking-widest text-gray-500 hover:text-black transition-colors flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50"
                >
                  Edit
                </button>
                <button 
                  onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                  className="text-xs uppercase tracking-widest text-eminence-gold hover:text-black transition-colors flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50"
                >
                  {expandedId === c.id ? "Hide Details" : "View Details"}
                  {expandedId === c.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>
            </div>

            {/* Expanded Details Section */}
            {expandedId === c.id && (
              <div className="border-t border-gray-200/50 bg-gray-50/50 p-6 animate-in slide-in-from-top-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[10px] uppercase font-bold tracking-widest text-eminence-gold mb-1">Expected Look</h4>
                      <p className="text-sm text-gray-700">{c.expected_look || "Not Specified"}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] uppercase font-bold tracking-widest text-eminence-gold mb-1">Lifestyle</h4>
                      <p className="text-sm text-gray-700">{c.lifestyle || "Not Specified"}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] uppercase font-bold tracking-widest text-eminence-gold mb-1">Reason for Visit</h4>
                      <p className="text-sm text-gray-700">{c.reason || "Not Specified"}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[10px] uppercase font-bold tracking-widest text-eminence-gold mb-1">Past Treatments</h4>
                      {c.past_treatments && c.past_treatments.length > 0 ? (
                        <ul className="list-disc pl-4 text-sm text-gray-700">
                          {c.past_treatments.map((pt, i) => <li key={i}>{pt}</li>)}
                        </ul>
                      ) : <p className="text-sm text-gray-500 italic">None reported</p>}
                    </div>
                    <div>
                      <h4 className="text-[10px] uppercase font-bold tracking-widest text-eminence-gold mb-1">Additional Queries</h4>
                      {c.additional_questions && c.additional_questions.length > 0 ? (
                        <ul className="list-disc pl-4 text-sm text-gray-700">
                          {c.additional_questions.map((aq, i) => <li key={i}>{aq}</li>)}
                        </ul>
                      ) : <p className="text-sm text-gray-500 italic">None reported</p>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white p-4 border border-gray-200 rounded shadow-sm">
                      <h4 className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-2 border-b border-gray-200 pb-1">Internal Details</h4>
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-400">Budget Range:</span>
                          <span className="text-xs font-bold">{c.budget_range || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-400">Expected Rev:</span>
                          <span className="text-xs font-bold text-emerald-600">₹{c.revenue || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-400">Source:</span>
                          <span className="text-xs font-bold">{c.source || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-400">Size / Color:</span>
                          <span className="text-xs font-bold">{c.size_color || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-400">Follow Up:</span>
                          <span className="text-xs font-bold text-eminence-gold">{c.follow_up_date || "None"}</span>
                        </div>
                      </div>
                    </div>
                    
                    {c.notes && (
                      <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                        <h4 className="text-[10px] uppercase font-bold tracking-widest text-yellow-800 mb-1 flex items-center gap-1">
                          <MessageSquare size={10} /> Notes
                        </h4>
                        <p className="text-xs text-yellow-900 leading-relaxed">{c.notes}</p>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div className="py-20 text-center text-eminence-muted">
          <p className="italic">No consultations found.</p>
        </div>
      )}

      {editingConsultation && (
        <EditConsultationModal
          show={!!editingConsultation}
          onClose={() => setEditingConsultation(null)}
          consultation={editingConsultation}
          onSave={() => {
            setEditingConsultation(null);
            if (refresh) refresh();
          }}
        />
      )}
    </div>
  );
}

const EditConsultationModal = ({ show, onClose, onSave, consultation }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (consultation) setFormData(consultation);
  }, [consultation]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/consultations/${consultation.id}`, formData);
      toast.success("Consultation updated successfully!");
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update consultation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto pt-32">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-fade-in border border-white/20">
        <div className="bg-gray-900 px-8 py-6 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Edit Consultation</h3>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-all">
            <XCircle size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Name</label>
              <input type="text" value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-100 bg-gray-50/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all" required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Phone</label>
              <input type="text" value={formData.phone || ""} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-gray-100 bg-gray-50/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all" required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Expected Look</label>
              <input type="text" value={formData.expected_look || ""} onChange={e => setFormData({...formData, expected_look: e.target.value})} className="w-full border border-gray-100 bg-gray-50/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Budget Range</label>
              <input type="text" value={formData.budget_range || ""} onChange={e => setFormData({...formData, budget_range: e.target.value})} className="w-full border border-gray-100 bg-gray-50/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Status</label>
              <select value={formData.status || ""} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border border-gray-100 bg-gray-50/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none appearance-none transition-all">
                <option value="Hot">Hot</option>
                <option value="Warm">Warm</option>
                <option value="Cold">Cold</option>
                <option value="Token">Token</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Expected Rev</label>
              <input type="number" value={formData.revenue || ""} onChange={e => setFormData({...formData, revenue: e.target.value})} className="w-full border border-gray-100 bg-gray-50/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Size / Color</label>
              <input type="text" value={formData.size_color || ""} onChange={e => setFormData({...formData, size_color: e.target.value})} className="w-full border border-gray-100 bg-gray-50/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Follow Up Date</label>
              <input type="date" value={formData.follow_up_date || ""} onChange={e => setFormData({...formData, follow_up_date: e.target.value})} className="w-full border border-gray-100 bg-gray-50/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Token Amount (₹)</label>
              <input type="number" value={formData.token_amount || ""} onChange={e => setFormData({...formData, token_amount: e.target.value})} className="w-full border border-gray-100 bg-gray-50/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all" placeholder="Enter token amount" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Comment for Token Received</label>
              <input type="text" value={formData.token_comment || ""} onChange={e => setFormData({...formData, token_comment: e.target.value})} className="w-full border border-gray-100 bg-gray-50/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all" placeholder="Token comments..." />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Notes</label>
            <textarea value={formData.notes || ""} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full border border-gray-100 bg-gray-50/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none h-24 transition-all"></textarea>
          </div>
          
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-4 text-xs font-bold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all uppercase tracking-widest">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-6 py-4 text-xs font-bold text-white bg-gray-900 rounded-xl hover:bg-black transition-all uppercase tracking-widest shadow-lg hover:shadow-xl">{loading ? "Saving..." : "Save Changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

