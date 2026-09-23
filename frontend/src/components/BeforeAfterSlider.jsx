import React, { useState, useRef, useEffect } from "react";
import { ArrowLeftRight, Sparkles } from "lucide-react";

const TRANSFORMATION_SETS = [
  {
    id: "men",
    label: "Men's Hair System",
    before: "/assets/men_before.jpeg",
    after: "/assets/men_after.jpeg",
    beforeLabel: "Before System",
    afterLabel: "JHS Hair System",
    desc: "Non-surgical breathable hair patch system with natural hairline integration."
  },
  {
    id: "women",
    label: "Women's Hair Ritual",
    before: "/assets/before_indian.png",
    after: "/assets/after_indian.png",
    beforeLabel: "Before Treatment",
    afterLabel: "Styling & Volume",
    desc: "Volumizing restoration and artisanal styling in our private luxury suites."
  }
];

export default function BeforeAfterSlider() {
  const [activeSet, setActiveSet] = useState("men");
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const current = TRANSFORMATION_SETS.find(s => s.id === activeSet) || TRANSFORMATION_SETS[0];

  const getNewPosition = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    return Math.max(0, Math.min(100, (x / rect.width) * 100));
  };

  // Mouse events
  const onMouseDown = (e) => { e.preventDefault(); setIsDragging(true); };
  const onMouseMove = (e) => {
    if (!isDragging) return;
    setPosition(getNewPosition(e.clientX));
  };
  const onMouseUp = () => setIsDragging(false);

  // Touch events
  const onTouchStart = () => setIsDragging(true);
  const onTouchMove = (e) => {
    if (!isDragging) return;
    setPosition(getNewPosition(e.touches[0].clientX));
  };
  const onTouchEnd = () => setIsDragging(false);

  // Click anywhere on container
  const onContainerClick = (e) => setPosition(getNewPosition(e.clientX));

  useEffect(() => {
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
    };
  });

  return (
    <section className="py-20 md:py-32 bg-white overflow-hidden border-t border-[#E0EBE5]">
      {/* Heading */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 text-center mb-10 md:mb-14">
        <span className="inline-block px-3.5 py-1 rounded-full bg-[#E8F3EE] text-[#0F5A3B] text-[10px] uppercase tracking-[0.25em] font-semibold mb-4">
          Real Results
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#142820] mb-4 leading-tight">
          Visible Transformations
        </h2>
        <div className="w-12 h-px bg-[#0F5A3B] mx-auto mb-6" />
        <p className="text-[#556B61] max-w-lg mx-auto text-sm md:text-base font-light leading-relaxed">
          Slide to reveal the seamless finish. Undetectable hairline integration and natural density restoration.
        </p>

        {/* Tab switchers */}
        <div className="flex justify-center gap-3 mt-8">
          {TRANSFORMATION_SETS.map((set) => (
            <button
              key={set.id}
              onClick={() => { setActiveSet(set.id); setPosition(50); }}
              className={`px-5 py-2.5 rounded-full text-xs font-medium tracking-wider transition-all duration-300 ${
                activeSet === set.id
                  ? "bg-[#0F5A3B] text-white shadow-sm"
                  : "bg-[#F6FAF8] text-[#556B61] hover:text-[#142820] border border-[#E0EBE5]"
              }`}
            >
              {set.label}
            </button>
          ))}
        </div>
      </div>

      {/* Slider Container */}
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <div
          ref={containerRef}
          className="relative aspect-[4/5] sm:aspect-[3/4] overflow-hidden cursor-col-resize select-none shadow-xl rounded-3xl border border-[#D8E6DF] bg-[#FAFDFB]"
          onClick={onContainerClick}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* AFTER image — full background */}
          <img
            src={current.after}
            alt={current.afterLabel}
            className="absolute inset-0 w-full h-full object-cover object-center"
            draggable={false}
          />

          {/* BEFORE image — clipped left side */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          >
            <img
              src={current.before}
              alt={current.beforeLabel}
              className="absolute inset-0 w-full h-full object-cover object-center"
              draggable={false}
            />
          </div>

          {/* Divider line */}
          <div
            className="absolute inset-y-0 w-[2px] bg-white z-20 shadow-[0_0_8px_rgba(0,0,0,0.5)]"
            style={{ left: `calc(${position}% - 1px)` }}
          />

          {/* Drag handle */}
          <div
            className="absolute top-1/2 z-30 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none"
            style={{ left: `${position}%` }}
          >
            <div
              className={`w-11 h-11 bg-white rounded-full shadow-xl flex items-center justify-center border border-[#D8E6DF] text-[#0F5A3B] transition-transform duration-150 ${
                isDragging ? "scale-110" : "scale-100"
              }`}
            >
              <ArrowLeftRight size={17} strokeWidth={2.5} />
            </div>
          </div>

          {/* Labels */}
          <div
            className="absolute top-4 left-4 z-10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-bold text-[#142820] rounded-full shadow-sm"
            style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(4px)",
              display: position < 12 ? "none" : "block",
            }}
          >
            Before
          </div>
          <div
            className="absolute top-4 right-4 z-10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-bold text-white rounded-full shadow-sm"
            style={{
              background: "rgba(15,90,59,0.9)",
              backdropFilter: "blur(4px)",
              display: position > 88 ? "none" : "block",
            }}
          >
            After (JHS)
          </div>
        </div>

        {/* Caption row */}
        <div className="flex justify-between items-center mt-6 px-3 text-xs text-[#556B61] font-light">
          <span>↖ Natural Scalp</span>
          <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#0F5A3B] bg-[#E8F3EE] px-4 py-1.5 rounded-full border border-[#D5E4DD]">
            Drag to compare
          </span>
          <span>Seamless Hairline ↗</span>
        </div>
      </div>

      {/* Stats strip */}
      <div className="max-w-4xl mx-auto px-6 mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-t border-[#E0EBE5] pt-12 md:pt-14">
        {[
          { num: "8,000+", label: "Happy Clients" },
          { num: "10+ Years", label: "of Experience" },
          { num: "2 Studios", label: "Sama-Savli · Sevasi (Vadodara)" },
        ].map((s, i) => (
          <div key={i} className="space-y-1">
            <p className="font-serif text-3xl md:text-4xl text-[#142820] font-light">{s.num}</p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#556B61] font-medium">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
