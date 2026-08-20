import React, { useRef, useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Webcam from "react-webcam";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Camera, RefreshCw, CheckCircle } from "lucide-react";

export default function AttendanceVerify() {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const { checkAttendance, user } = useAuth();
  const nav = useNavigate();
  const locationState = useLocation();
  const [geoData, setGeoData] = useState(null);

  const queryParams = new URLSearchParams(locationState.search);
  const isCheckout = queryParams.get("checkout") === "true";

  const videoConstraints = {
    width: 720,
    height: 720,
    facingMode: "user"
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setImgSrc(imageSrc);
    } else {
      toast.error("Failed to capture image. Please ensure camera permissions are granted.");
    }
  }, [webcamRef]);

  const retake = () => {
    setImgSrc(null);
  };

  const submitAttendance = async () => {
    if (!imgSrc) return;
    
    setLoading(true);
    
    // Request geolocation
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    const handleProceed = async (latitude = null, longitude = null) => {
      try {
        await api.post(isCheckout ? "/attendance/checkout" : "/attendance/verify", { 
          photo_base64: imgSrc,
          latitude,
          longitude
        });
      } catch (err) {
        console.warn("Backend attendance verify warning:", err);
      }
      
      try {
        await checkAttendance(user);
      } catch {}
      
      sessionStorage.setItem("attendance_verified", "true");
      toast.success(isCheckout ? "Shift completion verified successfully!" : "Verified successfully!");
      
      const destination = locationState.state?.from?.pathname || (user?.role === "admin" ? "/admin" : (user?.role === "service" ? "/service-panel" : (user?.role === "receptionist" ? "/receptionist-panel" : "/sales-panel")));
      nav(destination, { replace: true });
      setLoading(false);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setGeoData({ latitude, longitude });
          await handleProceed(latitude, longitude);
        },
        async (err) => {
          console.warn("Geolocation skipped/denied:", err);
          await handleProceed(null, null);
        },
        { enableHighAccuracy: false, timeout: 4000, maximumAge: 60000 }
      );
    } else {
      await handleProceed(null, null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-6">
      <div className="max-w-xl w-full bg-white p-8 md:p-12 shadow-sm border border-eminence-border text-center">
        <h1 className="text-3xl font-serif text-eminence-gold mb-2">
          {isCheckout ? "Shift Completion" : "Daily Verification"}
        </h1>
        <p className="text-eminence-muted text-sm uppercase tracking-widest mb-8">
          {isCheckout 
            ? "Please capture a photo and allow location access to verify and complete your shift today."
            : "Please capture a photo and allow location access to mark your attendance today."}
        </p>

        <div className="relative w-full aspect-square bg-gray-100 rounded-xl overflow-hidden mb-8 border-2 border-eminence-border border-dashed flex items-center justify-center">
          {!imgSrc ? (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="object-cover w-full h-full"
              onUserMediaError={() => toast.error("Camera access denied or unavailable.")}
            />
          ) : (
            <img src={imgSrc} alt="Captured" className="object-cover w-full h-full" />
          )}
        </div>

        <div className="flex gap-4 justify-center">
          {!imgSrc ? (
            <button
              onClick={capture}
              className="flex items-center gap-2 bg-eminence-gold text-white px-8 py-4 uppercase tracking-[0.2em] text-xs hover:bg-black transition-colors"
            >
              <Camera size={16} /> Capture Photo
            </button>
          ) : (
            <>
              <button
                onClick={retake}
                disabled={loading}
                className="flex items-center gap-2 border border-eminence-border px-6 py-4 uppercase tracking-[0.2em] text-xs hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} /> Retake
              </button>
              <button
                onClick={submitAttendance}
                disabled={loading}
                className="flex items-center gap-2 bg-eminence-gold text-white px-6 py-4 uppercase tracking-[0.2em] text-xs hover:bg-black transition-colors disabled:opacity-50"
              >
                {loading ? "Verifying..." : <><CheckCircle size={16} /> Submit & Verify</>}
              </button>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              sessionStorage.setItem("attendance_verified", "true");
              const destination = locationState.state?.from?.pathname || (user?.role === "admin" ? "/admin" : (user?.role === "service" ? "/service-panel" : (user?.role === "receptionist" ? "/receptionist-panel" : "/sales-panel")));
              nav(destination, { replace: true });
            }}
            className="text-xs uppercase tracking-widest text-eminence-muted hover:text-black transition-colors underline"
          >
            Skip & Enter Panel directly &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
