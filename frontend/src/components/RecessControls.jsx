import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import { Coffee, CheckSquare } from "lucide-react";

export default function RecessControls() {
  const { recessStartTime, recessEndTime, refresh } = useAuth();
  const [timer, setTimer] = useState("00:00");
  const [isOverTime, setIsOverTime] = useState(false);

  useEffect(() => {
    let interval;
    if (recessStartTime && !recessEndTime) {
      interval = setInterval(() => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        // Time is in HH:MM:SS format from the backend, so we construct a local Date object.
        const startDt = new Date(`${todayStr}T${recessStartTime}`);
        
        let diff = Math.floor((now - startDt) / 1000);
        if (diff < 0) diff = 0;
        const mins = Math.floor(diff / 60);
        const secs = diff % 60;
        
        if (mins >= 35) {
          setIsOverTime(true);
        } else {
          setIsOverTime(false);
        }
        
        setTimer(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [recessStartTime, recessEndTime]);

  const handleStartRecess = async () => {
    try {
      await api.post("/attendance/recess/start");
      toast.success("Recess started");
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to start recess");
    }
  };

  const handleEndRecess = async () => {
    try {
      const { data } = await api.post("/attendance/recess/end");
      if (data.half_day_penalty) {
        toast.error("Recess exceeded 35 mins! Half-day penalty applied.");
      } else {
        toast.success("Recess completed successfully.");
      }
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to end recess");
    }
  };

  if (recessEndTime) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-gray-500 text-xs font-bold uppercase tracking-wider">
        <CheckSquare size={16} /> Recess Completed
      </div>
    );
  }

  if (recessStartTime) {
    return (
      <div className="flex items-center gap-4">
        <div className={`px-4 py-2 rounded-xl text-xs font-bold font-mono ${isOverTime ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
          {timer}
        </div>
        <button
          onClick={handleEndRecess}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
        >
          <CheckSquare size={16} /> Complete Recess
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleStartRecess}
      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
    >
      <Coffee size={16} /> Start Recess Break
    </button>
  );
}
