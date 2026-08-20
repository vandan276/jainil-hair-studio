import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { formatApiError } from "@/lib/api";
import { toast } from "sonner";

import api from "@/lib/api";

export default function Register() {
  const { t } = useLang();
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success(t("regSuccess"));
      nav("/dashboard");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-32" data-testid="register-page">
      <p className="overline mb-4">{t("joinJainil")}</p>
      <h1 className="font-serif text-5xl font-light mb-10">{t("createAccount")}</h1>
      <form onSubmit={submit} className="space-y-6">
        <div>
          <label className="overline block mb-2">{t("fullName")}</label>
          <input type="text" required value={form.name} onChange={set("name")}
            className="w-full bg-jainil-surface border border-jainil-border px-4 py-3 focus:outline-none focus:border-jainil-gold" />
        </div>

        <div>
          <label className="overline block mb-2">{t("email")}</label>
          <input type="email" required value={form.email} onChange={set("email")}
            className="w-full bg-jainil-surface border border-jainil-border px-4 py-3 focus:outline-none focus:border-jainil-gold" />
        </div>

        <div>
          <label className="overline block mb-2">{t("phone")}</label>
          <input type="tel" value={form.phone} onChange={set("phone")}
            className="w-full bg-jainil-surface border border-jainil-border px-4 py-3 focus:outline-none focus:border-jainil-gold" />
        </div>

        <div>
          <label className="overline block mb-2">{t("password")}</label>
          <input type="password" required value={form.password} onChange={set("password")}
            className="w-full bg-jainil-surface border border-jainil-border px-4 py-3 focus:outline-none focus:border-jainil-gold" />
        </div>

        <button type="submit" disabled={loading} className="btn-gold w-full py-4 mt-4 disabled:opacity-50" data-testid="register-submit-btn">
          {loading ? t("placing") : t("createAccount")}
        </button>
      </form>
      <p className="text-sm text-jainil-muted mt-8">
        {t("haveAccount")} <Link to="/login" className="text-jainil-gold" data-testid="register-login-link">{t("signInTitle")}</Link>
      </p>
    </div>
  );
}
