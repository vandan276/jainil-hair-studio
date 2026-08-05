import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { formatApiError } from "@/lib/api";
import { toast } from "sonner";

export default function Login() {
  const { t } = useLang();
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      toast.success(t("welcomeBack").replace("{name}", u.name));
      nav(
        u.role === "admin"
          ? "/admin"
          : u.role === "sales"
          ? "/sales-panel"
          : u.role === "service"
          ? "/service-panel"
          : u.role === "receptionist"
          ? "/receptionist-panel"
          : (loc.state?.from?.pathname || "/dashboard")
      );
    } catch (err) {
      toast.error(formatApiError(err));
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-32" data-testid="login-page">
      <p className="overline mb-4">{t("welcome")}</p>
      <h1 className="font-serif text-5xl font-light mb-10">{t("signInTitle")}</h1>
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="overline block mb-2">{t("email")}</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} data-testid="login-email-input"
            className="w-full bg-eminence-surface border border-eminence-border px-4 py-3 focus:outline-none focus:border-eminence-gold" />
        </div>
        <div>
          <label className="overline block mb-2">{t("password")}</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} data-testid="login-password-input"
            className="w-full bg-eminence-surface border border-eminence-border px-4 py-3 focus:outline-none focus:border-eminence-gold" />
        </div>
        <button type="submit" disabled={loading} className="btn-gold w-full" data-testid="login-submit-btn">
          {loading ? t("placing") : t("signInTitle")}
        </button>
      </form>
      <p className="text-sm text-eminence-muted mt-8">
        {t("newToEminence")} <Link to="/register" className="text-eminence-gold hover:text-eminence-goldHover" data-testid="login-register-link">{t("createAccount")}</Link>
      </p>
    </div>
  );
}
