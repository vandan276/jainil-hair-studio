import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendanceVerified, setAttendanceVerified] = useState(false);
  const [shiftCompleted, setShiftCompleted] = useState(false);
  const [recessStartTime, setRecessStartTime] = useState(null);
  const [recessEndTime, setRecessEndTime] = useState(null);

  const checkAttendance = async (userObj) => {
    // Allow seamless access without timing/attendance blockages
    setAttendanceVerified(true);
    if (!userObj || !["sales", "service", "employee"].includes(userObj.role)) {
      setShiftCompleted(false);
      return true;
    }
    try {
      const { data } = await api.get("/attendance/today");
      setShiftCompleted(data.shift_completed || false);
      setRecessStartTime(data.recess_start_time || null);
      setRecessEndTime(data.recess_end_time || null);
      return true;
    } catch {
      setShiftCompleted(false);
      setRecessStartTime(null);
      setRecessEndTime(null);
      return true;
    }
  };

  const fetchMe = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
      await checkAttendance(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchMe(); }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    if (data.token) localStorage.setItem("eminence_token", data.token);
    setUser(data);
    await checkAttendance(data);
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    if (data.token) localStorage.setItem("eminence_token", data.token);
    setUser(data);
    return data;
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    localStorage.removeItem("eminence_token");
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, attendanceVerified, shiftCompleted, recessStartTime, recessEndTime, checkAttendance, login, register, logout, refresh: fetchMe }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
