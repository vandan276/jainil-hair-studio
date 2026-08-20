import React, { useState, useRef } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Upload, Loader2, X } from "lucide-react";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  (["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "http://localhost:8000"
    : "");

/**
 * Image/video upload field for admin CRUD forms.
 * Uses POST /api/admin/upload (multipart form-data).
 */
export default function ImageUpload({ value, onChange, testId = "image-upload" }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const ref = useRef(null);

  const upload = async (file) => {
    if (!file) return;
    setBusy(true);
    setProgress(0);
    try {
      // Strategy 1: Direct multipart server upload to /api/admin/upload
      const formData = new FormData();
      formData.append("file", file);

      try {
        const { data } = await api.post("/admin/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
          },
        });
        const fullUrl = `${BACKEND_URL}${data.url}`;
        onChange(fullUrl);
        toast.success("Media uploaded successfully!");
        return;
      } catch (err) {
        console.warn("Direct upload error:", err);
      }

      // Strategy 2: Base64 data URL for images under 5MB (fail-safe fallback)
      if (file.size < 5 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = (e) => {
          onChange(e.target.result);
          toast.success("Media loaded successfully!");
        };
        reader.readAsDataURL(file);
        return;
      }

      throw new Error("Upload failed. File too large or network error.");

    } catch (err) {
      console.error("Upload error detail:", err);
      const detail = err.response?.data?.detail;
      const msg = typeof detail === "string" ? detail : (err.message || "Upload failed");
      toast.error(msg, { duration: 5000 });
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={busy}
          data-testid={`${testId}-button`}
          className="inline-flex items-center gap-2 border border-eminence-border px-3 py-2 text-xs uppercase tracking-[0.15em] hover:border-eminence-text disabled:opacity-50 whitespace-nowrap shrink-0"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {busy ? `Uploading… ${progress}%` : "Upload File"}
        </button>
        <input
          ref={ref}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => {
            upload(e.target.files?.[0]);
            e.target.value = ""; // allow re-uploading same file
          }}
          data-testid={`${testId}-input`}
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="…or paste image/video URL"
          data-testid={`${testId}-url`}
          className="flex-1 min-w-[140px] bg-eminence-surface border border-eminence-border px-3 py-2 text-sm focus:outline-none focus:border-eminence-text"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-eminence-muted hover:text-red-500 transition-colors shrink-0"
            title="Clear media"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Upload progress bar */}
      {busy && (
        <div className="h-1 bg-eminence-surface rounded overflow-hidden">
          <div
            className="h-full bg-eminence-gold transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Preview */}
      {value && !busy && (
        value.match(/\.(mp4|webm|ogg)$/i) ? (
          <video
            src={value}
            className="w-28 h-28 object-cover border border-eminence-border rounded"
            autoPlay
            muted
            loop
            playsInline
            data-testid={`${testId}-preview`}
          />
        ) : (
          <img
            src={value}
            alt="preview"
            className="w-28 h-28 object-cover border border-eminence-border rounded"
            data-testid={`${testId}-preview`}
          />
        )
      )}
    </div>
  );
}
