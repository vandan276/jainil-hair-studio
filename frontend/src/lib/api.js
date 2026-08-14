import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || (['localhost', '127.0.0.1'].includes(window.location.hostname) ? "http://localhost:8000" : "");
export const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
  withCredentials: true,
  timeout: 2500,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("eminence_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && [401, 403].includes(error.response.status)) {
      const isLoginUrl = error.config.url?.endsWith("/auth/login");
      if (!isLoginUrl) {
        localStorage.removeItem("eminence_token");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export function getMediaUrl(url) {
  if (!url) return "";
  let cleanUrl = url;
  if (typeof url === "string") {
    cleanUrl = url.replace("http://localhost:8000", "");
  }
  if (cleanUrl.startsWith("http") || cleanUrl.startsWith("blob:") || cleanUrl.startsWith("data:")) return cleanUrl;
  return `${BACKEND_URL}${cleanUrl}`;
}

export function formatApiError(err) {
  if (!err) return "Something went wrong. Please try again.";
  
  // Handle Axios error object
  const detail = err.response?.data?.detail || err.response?.data || err.message;
  const status = err.response?.status;

  if (status === 429 || (typeof detail === 'string' && detail.includes("Quota exceeded"))) {
    return "Database quota exceeded. Please try again tomorrow.";
  }

  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}
