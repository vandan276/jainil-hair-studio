import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import DropdownItem from "./DropdownItem";

export default function ReportsDropdown({ label }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Check if any report route is active
  const isReportsActive = location.pathname.startsWith("/admin/reports");

  const reportItems = [
    { to: "/admin/reports/daily-reports", label: "Daily Reports" },
    { to: "/admin/reports/day-summary", label: "Day Summary" },
    { to: "/admin/reports/billing-reports", label: "Billing Reports" },
    { to: "/admin/reports/enquiry-reports", label: "Enquiry Reports" },
    { to: "/admin/reports/service-provider-reports", label: "Service Provider Reports" },
    { to: "/admin/reports/pending-payments", label: "Received Pending Payments" },
    { to: "/admin/reports/history", label: "History" },
    { to: "/admin/reports/balance-reports", label: "Balance Reports" },
    { to: "/admin/reports/advance-reports", label: "Advance Reports" },
    { to: "/admin/reports/attendance-report", label: "Attendance Report" },
    { to: "/admin/reports/sms-history", label: "SMS History" },
  ];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={`pill-tab flex items-center gap-1.5 ${
          isReportsActive
            ? "bg-gray-900 text-white shadow-lg"
            : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
        }`}
      >
        <span>{label}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute left-0 mt-2 w-72 bg-white border border-eminence-border rounded-2xl shadow-xl p-2 z-50 flex flex-col gap-1 animate-fade-in origin-top-left"
        >
          {reportItems.map((item) => (
            <DropdownItem
              key={item.to}
              to={item.to}
              label={item.label}
              onClick={() => setIsOpen(false)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
