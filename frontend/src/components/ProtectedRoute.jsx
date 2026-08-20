import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false, serviceOnly = false, receptionistOnly = false }) {
  const { user, loading, attendanceVerified } = useAuth();
  const location = useLocation();

  // Persist attendance verification in sessionStorage to survive route-change re-renders
  if (attendanceVerified) {
    sessionStorage.setItem("attendance_verified", "true");
  }
  const sessionVerified = sessionStorage.getItem("attendance_verified") === "true";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-eminence-bg">
        <div className="text-eminence-gold font-serif text-2xl tracking-wider">Loading…</div>
      </div>
    );
  }
  if (!user) {
    sessionStorage.removeItem("attendance_verified");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (adminOnly && user.role !== "admin") return <Navigate to="/dashboard" replace />;
  if (serviceOnly && user.role !== "service" && user.role !== "admin") return <Navigate to="/dashboard" replace />;
  if (receptionistOnly && user.role !== "receptionist" && user.role !== "admin") return <Navigate to="/dashboard" replace />;

  // Attendance Interceptor - Allow direct panel access without timing/verification blockages
  // (Staff can still optionally verify attendance if navigated directly)
  // const isStaffRoute = location.pathname.startsWith("/admin") ||
  //                      location.pathname.startsWith("/sales-panel") ||
  //                      location.pathname.startsWith("/consultancy") ||
  //                      location.pathname.startsWith("/service-panel") ||
  //                      location.pathname.startsWith("/receptionist-panel") ||
  //                      location.pathname.startsWith("/billing");
  // if (isStaffRoute && !sessionVerified && location.pathname !== "/attendance-verify") {
  //   return <Navigate to="/attendance-verify" state={{ from: location }} replace />;
  // }

  return children;
}

