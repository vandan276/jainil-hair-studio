import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useLang, LANGUAGES } from "@/context/LanguageContext";
import { 
  Menu, 
  X, 
  User, 
  Globe, 
  LogOut, 
  Calendar, 
  Phone, 
  ChevronDown
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const nav = useNavigate();
  const location = useLocation();
  const langRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const isStaff = user && ["admin", "sales", "service", "employee", "receptionist"].includes(user.role);

  // Main customer links
  const customerLinks = [
    { to: "/", label: t("home") || "Home", testId: "nav-home" },
    { to: "/men", label: t("men") || "Men", testId: "nav-men", badge: "Systems" },
    { to: "/women", label: t("women") || "Women", testId: "nav-women", badge: "Toppers" },
    { to: "/services", label: t("services") || "Services", testId: "nav-services" },
    { to: "/consultancy", label: "Hair Quiz", testId: "nav-consultancy" },
  ];

  // Staff specific links
  const staffLinks = user?.role === "receptionist" ? [
    { to: "/receptionist-panel", label: "Receptionist Panel" },
    { to: "/billing", label: t("billing") || "Billing" }
  ] : user?.role === "service" ? [
    { to: "/service-panel", label: "Service Panel" },
    { to: "/billing", label: t("billing") || "Billing" }
  ] : user?.role === "sales" ? [
    { to: "/sales-panel", label: "Sales Panel" },
    { to: "/billing", label: t("billing") || "Billing" }
  ] : user?.role === "admin" ? [
    { to: "/admin", label: "Admin Dashboard" },
    { to: "/billing", label: t("billing") || "Billing" }
  ] : [];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top subtle announcement/studio branch bar */}
      <div className="bg-[#0F5A3B] text-white text-[11px] py-1 px-4 sm:px-6 hidden md:block">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between font-light tracking-wide">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[#D1EADB]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#52D19D] animate-pulse" />
              Vadodara Studios · Sama-Savli & Sevasi Branches
            </span>
            <span className="text-white/30">•</span>
            <span className="text-white/80">100% Private 1-on-1 Styling Suites</span>
          </div>

          <div className="flex items-center gap-5">
            <a 
              href="tel:+917779055771" 
              className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors"
            >
              <Phone size={12} className="text-[#D1EADB]" />
              <span>+91 77790 55771</span>
            </a>
            <span className="text-white/30">•</span>
            <Link to="/book" className="text-[#D1EADB] hover:text-white font-medium transition-colors">
              Book Confidential Trial
            </Link>
          </div>
        </div>
      </div>

      {/* Main Glassmorphism Navigation Bar */}
      <div 
        className={`transition-all duration-300 ${
          scrolled 
            ? "bg-[#FAFDFB]/95 backdrop-blur-md border-b border-[#E0EBE5] shadow-[0_4px_20px_-4px_rgba(15,90,59,0.08)] py-2 sm:py-2.5" 
            : "bg-[#FAFDFB]/90 backdrop-blur-sm border-b border-[#E0EBE5]/80 py-2.5 sm:py-3.5"
        }`}
      >
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group shrink-0" 
            data-testid="nav-logo"
            aria-label="Jainil Hair Studio Home"
          >
            <img 
              src="/assets/Logo/Jainil Studio.svg" 
              alt="Jainil Hair Studio" 
              className="h-9 sm:h-11 md:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]" 
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {customerLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                data-testid={l.testId}
                className={({ isActive }) =>
                  `relative px-3.5 py-1.5 rounded-full text-[12px] uppercase tracking-[0.16em] font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? "bg-[#E8F3EE] text-[#0F5A3B] font-semibold shadow-xs"
                      : "text-[#142820] hover:text-[#0F5A3B] hover:bg-[#F2F7F4]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{l.label}</span>
                    {l.badge && (
                      <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded-full tracking-wider font-semibold transition-colors ${
                        isActive 
                          ? "bg-[#0F5A3B] text-white" 
                          : "bg-[#E0EBE5] text-[#556B61]"
                      }`}>
                        {l.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}

            {/* Quick staff links if logged in as staff */}
            {isStaff && staffLinks.length > 0 && (
              <div className="flex items-center ml-2 pl-2 border-l border-[#D8E6DF] gap-1">
                {staffLinks.map((sl) => (
                  <a
                    key={sl.to}
                    href={sl.to}
                    className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[#0F5A3B] bg-[#E8F3EE] hover:bg-[#D5E6DE] px-3 py-1.5 rounded-full transition-colors"
                  >
                    {sl.label}
                  </a>
                ))}
              </div>
            )}
          </nav>

          {/* Right Action Icons & Book CTA */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            
            {/* Language Switcher */}
            <div className="relative" ref={langRef}>
              <button 
                onClick={() => setLangOpen(!langOpen)} 
                className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] font-medium text-[#142820] hover:text-[#0F5A3B] hover:bg-[#F2F7F4] px-2.5 py-1.5 rounded-full border border-transparent hover:border-[#E0EBE5] transition-all"
                data-testid="nav-language"
                aria-label="Select Language"
              >
                <Globe size={14} className="text-[#0F5A3B]" />
                <span className="font-semibold">{LANGUAGES.find((l) => l.code === lang)?.label || "EN"}</span>
                <ChevronDown size={12} className={`text-[#556B61] transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
              </button>

              {langOpen && (
                <div 
                  className="absolute right-0 top-full mt-2 bg-white rounded-2xl border border-[#D8E6DF] min-w-[150px] shadow-xl py-1.5 z-50 animate-fade-in overflow-hidden" 
                  data-testid="lang-dropdown"
                >
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-[#556B61] border-b border-[#F0F5F2] font-semibold">
                    Language / ભાષા
                  </div>
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setLangOpen(false); }}
                      data-testid={`lang-${l.code}`}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                        lang === l.code 
                          ? "bg-[#E8F3EE] text-[#0F5A3B] font-semibold" 
                          : "text-[#142820] hover:bg-[#F6FAF8]"
                      }`}
                    >
                      <span>{l.name}</span>
                      {lang === l.code && <span className="w-1.5 h-1.5 rounded-full bg-[#0F5A3B]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Account / Staff Dashboard / Login Button */}
            {user ? (
              <div className="flex items-center gap-1.5">
                <a 
                  href={user.role === "admin" ? "/admin" : (user.role === "sales" ? "/sales-panel" : (user.role === "service" ? "/service-panel" : (user.role === "receptionist" ? "/receptionist-panel" : "/dashboard")))} 
                  className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] font-semibold text-[#0F5A3B] bg-[#E8F3EE] hover:bg-[#D5E6DE] border border-[#0F5A3B]/20 px-3 py-1.5 rounded-full transition-colors" 
                  data-testid="nav-dashboard"
                >
                  <User size={13} className="text-[#0F5A3B]" /> 
                  <span>{user.role === "admin" ? "Admin" : (user.role === "sales" ? "Sales" : (user.role === "service" ? "Service" : (user.role === "receptionist" ? "Reception" : "Dashboard")))}</span>
                </a>
                <button 
                  onClick={() => { logout(); nav("/"); }} 
                  className="p-1.5 rounded-full text-rose-500 hover:bg-rose-50 border border-rose-200 transition-all" 
                  title="Logout"
                  data-testid="nav-logout"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] font-semibold text-[#142820] hover:text-[#0F5A3B] bg-white hover:bg-[#E8F3EE] border border-[#D8E6DF] hover:border-[#0F5A3B] px-3.5 py-1.5 rounded-full shadow-2xs transition-all" 
                data-testid="nav-login"
              >
                <User size={14} className="text-[#0F5A3B]" />
                <span>Login</span>
              </Link>
            )}

            {/* Book Appointment CTA Button */}
            <Link
              to="/book"
              className="inline-flex items-center gap-2 bg-[#0F5A3B] hover:bg-[#0A3D27] text-white px-4 sm:px-5 py-2 rounded-full font-medium text-[11px] sm:text-xs uppercase tracking-[0.16em] transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              data-testid="nav-book-button"
            >
              <Calendar size={13} />
              <span className="hidden xs:inline">Book</span>
              <span>Appointment</span>
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button 
              onClick={() => setOpen(!open)} 
              className="lg:hidden p-2 rounded-xl text-[#142820] hover:bg-[#F2F7F4] transition-colors border border-transparent hover:border-[#E0EBE5]" 
              data-testid="nav-menu-toggle"
              aria-label="Toggle navigation menu"
            >
              {open ? <X size={22} className="text-[#0F5A3B]" /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {open && (
          <div className="lg:hidden border-t border-[#E0EBE5] bg-white/98 backdrop-blur-md px-5 py-6 space-y-6 shadow-2xl animate-fade-in">
            {/* Navigation Links */}
            <div className="flex flex-col space-y-1.5">
              {customerLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-2xl text-xs uppercase tracking-[0.18em] font-medium flex items-center justify-between transition-all ${
                      isActive
                        ? "bg-[#E8F3EE] text-[#0F5A3B] font-bold"
                        : "text-[#142820] hover:bg-[#F6FAF8]"
                    }`
                  }
                >
                  <span>{l.label}</span>
                  {l.badge && (
                    <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-[#0F5A3B]/10 text-[#0F5A3B] font-bold">
                      {l.badge}
                    </span>
                  )}
                </NavLink>
              ))}

              {/* Staff links in mobile menu if logged in */}
              {isStaff && staffLinks.length > 0 && (
                <div className="pt-3 border-t border-[#E0EBE5] space-y-1.5">
                  <div className="px-4 text-[10px] uppercase tracking-wider text-[#556B61] font-bold">
                    Staff Portal
                  </div>
                  {staffLinks.map((sl) => (
                    <a
                      key={sl.to}
                      href={sl.to}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold text-[#0F5A3B] bg-[#E8F3EE]"
                    >
                      {sl.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Studio Info & Quick WhatsApp in Mobile Drawer */}
            <div className="bg-[#FAFDFB] p-4 rounded-2xl border border-[#E0EBE5] space-y-3">
              <div className="flex items-center justify-between text-xs text-[#556B61]">
                <span>Vadodara Studios:</span>
                <span className="font-semibold text-[#0F5A3B]">Sama-Savli & Sevasi</span>
              </div>
              <div className="flex gap-2">
                <a
                  href="tel:+917779055771"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#FAFDFB] hover:bg-[#E8F3EE] text-[#0F5A3B] border border-[#0F5A3B]/30 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  <Phone size={13} />
                  <span>Call Us</span>
                </a>
                <a
                  href="https://wa.me/917779055771?text=Hello%20Jainil%20Hair%20Studio,%20I%20would%20like%20to%20inquire%20about%20an%20appointment."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#0F5A3B] hover:bg-[#0A3D27] text-white py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  <Calendar size={13} />
                  <span>Book Consultation</span>
                </a>
              </div>
            </div>

            {/* Auth in Mobile Drawer */}
            <div className="pt-2 border-t border-[#E0EBE5] flex items-center justify-between">
              {user ? (
                <>
                  <div className="text-xs text-[#142820]">
                    Signed in as <span className="font-bold">{user.name || user.email}</span>
                  </div>
                  <button
                    onClick={() => { logout(); setOpen(false); nav("/"); }}
                    className="flex items-center gap-1.5 text-xs font-bold text-rose-500 uppercase tracking-wider px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut size={13} />
                    <span>{t("signOut")}</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-[#D8E6DF] text-xs uppercase tracking-wider font-semibold text-[#142820] hover:bg-[#F2F7F4] transition-colors"
                >
                  {t("signIn")}
                </Link>
              )}
            </div>

          </div>
        )}
      </div>
    </header>
  );
}
