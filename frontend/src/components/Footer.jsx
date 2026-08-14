import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, MapPin, Phone, Mail } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="bg-eminence-text text-white">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 py-20 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-1">
          <img src="/assets/logo.png" alt="Logo" className="h-12 w-auto object-contain mb-4 brightness-0 invert" />
          <p className="text-[11px] tracking-[0.3em] uppercase text-white/50 mb-6">Vadodara · Est. 2019</p>
          <p className="text-sm text-white/70 leading-relaxed">
            {t("footerPitch")}
          </p>
          <div className="flex gap-4 mt-6">
            <a href="#" className="text-white/60 hover:text-white"><Instagram size={18} /></a>
            <a href="#" className="text-white/60 hover:text-white"><Facebook size={18} /></a>
          </div>
        </div>

        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-white/50 mb-5">{t("explore_label")}</p>
          <ul className="space-y-3 text-sm text-white/80">
            <li><Link to="/shop" className="hover:text-eminence-gold">{t("shopProducts")}</Link></li>
            <li><Link to="/dashboard" className="hover:text-eminence-gold">{t("myAccount")}</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-white/50 mb-5">{t("visit")}</p>
          <ul className="space-y-4 text-sm text-white/80">
            <li className="flex gap-2">
              <MapPin size={14} className="mt-0.5 text-eminence-gold shrink-0" /> 
              <span>Shreenath Complex, GF6, High Tension Rd,<br />Subhanpura, Vadodara, Gujarat 390023</span>
            </li>
            <li className="flex gap-2"><Phone size={14} className="mt-0.5 text-eminence-gold shrink-0" /> +91 87992 88809</li>
            <li className="flex gap-2"><Mail size={14} className="mt-0.5 text-eminence-gold shrink-0" /> jainilhairstudio@gmail.com</li>
          </ul>
        </div>

        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-white/50 mb-5">{t("hours")}</p>
          <ul className="space-y-2 text-sm text-white/80">
            <li>{t("weekdays")}</li>
            <li>{t("sunday")}</li>
          </ul>
          <p className="text-[11px] tracking-[0.3em] uppercase text-white/50 mt-8 mb-3">{t("customerCare")}</p>
          <p className="text-sm text-white/80">{t("return14")}</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12 py-6 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-white/50">
          <span>{t("rights")}</span>
          <span className="text-[11px] tracking-[0.2em] uppercase">
            <a href="https://fyndevs.com" target="_blank" rel="noopener noreferrer" className="hover:text-eminence-gold transition-colors">Cooking By FynDevs</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
