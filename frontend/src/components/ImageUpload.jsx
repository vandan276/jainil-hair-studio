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
      // Strategy 1: Direct multipart upload (best for local dev)
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
        // If it's a size limit or not found (Vercel limit), try Strategy 2
        console.warn("Direct upload failed, trying Signed URL fallback...", err.response?.status);
        if (err.response?.status !== 413 && err.response?.status !== 404 && BACKEND_URL) {
          throw err; // If it's a real error (like 401), don't retry
        }
      }

      // Strategy 2: Signed URL (best for Vercel production / large files)
      const { data: signData } = await api.post("/admin/signed-url", {
        filename: file.name,
        contentType: file.type || "application/octet-stream"
      });

      const { uploadUrl, publicUrl } = signData;

      // Upload directly to storage (using axios without the base 'api' instance to avoid prefixing)
      const axiosDirect = (await import("axios")).default;
      await axiosDirect.put(uploadUrl, file, {
        headers: { "Content-Type": file.type || "application/octet-stream" },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });

      onChange(`${BACKEND_URL}${publicUrl}`);
      toast.success("Media uploaded successfully (via cloud storage)!");

    } catch (err) {
      console.error("Upload error detail:", err);
      let msg = "Upload failed";
      if (err.message === "Network Error") {
        msg = "Network Error: This usually means Firebase Storage CORS is not configured. Please see the instructions.";
      } else {
        const detail = err.response?.data?.detail;
        msg = typeof detail === "string" ? detail : (err.message || "Upload failed");
      }
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
