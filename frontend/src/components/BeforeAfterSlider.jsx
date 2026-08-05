import React, { useState, useRef, useEffect } from "react";
import { ArrowLeftRight } from "lucide-react";

export default function BeforeAfterSlider({ before, after, aspect = "aspect-[4/3] md:aspect-[16/9]" }) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

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
    <section className="py-16 md:py-32 bg-[#f9f7f4] overflow-hidden">
      {/* Heading */}
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 text-center mb-12 md:mb-20">
        <p className="text-[10px] md:text-[11px] tracking-[0.4em] md:tracking-[0.5em] uppercase text-eminence-gold mb-4 md:mb-6 font-semibold">
          Real Results
        </p>
        <h2 className="font-serif text-3xl md:text-6xl font-light text-eminence-text mb-6 md:mb-8 leading-tight">
          Stunning Transformations
        </h2>
        <div className="w-12 h-px bg-eminence-gold mx-auto mb-6 md:mb-10" />
        <p className="text-eminence-muted max-w-lg mx-auto text-sm md:text-base font-light leading-relaxed">
          Slide to reveal the professional touch. Our expertise ensures a natural, premium finish every time.
        </p>
      </div>

      {/* Slider Container */}
      <div className="max-w-3xl mx-auto px-4 md:px-12">
        <div
          ref={containerRef}
          className={`relative ${aspect} overflow-hidden cursor-col-resize select-none shadow-2xl rounded-sm border border-eminence-border/20`}
          onClick={onContainerClick}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* AFTER image — full background */}
          <img
            src={after}
            alt="After hair transformation"
            className="absolute inset-0 w-full h-full object-cover object-top scale-[1.05]"
            draggable={false}
          />

          {/* BEFORE image — clipped left side */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          >
            <img
              src={before}
              alt="Before hair transformation"
              className="absolute inset-0 w-full h-full object-cover object-top scale-[1.05]"
              draggable={false}
            />
            {/* Slight darkening on before side */}
            <div className="absolute inset-0 bg-black/5" />
          </div>

          {/* Divider line */}
          <div
            className="absolute inset-y-0 w-[2px] bg-white z-20 shadow-[0_0_12px_rgba(0,0,0,0.4)]"
            style={{ left: `calc(${position}% - 1px)` }}
          />

          {/* Drag handle */}
          <div
            className="absolute top-1/2 z-30 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center"
            style={{ left: `${position}%` }}
            onMouseDown={onMouseDown}
          >
            <div
              className={`w-10 h-10 md:w-14 md:h-14 bg-white rounded-full shadow-2xl flex items-center justify-center border-2 border-white transition-transform duration-150 ${
                isDragging ? "scale-110" : "scale-100"
              }`}
            >
              <ArrowLeftRight size={16} className="text-eminence-text md:w-5 md:h-5" strokeWidth={2.5} />
            </div>
          </div>

          {/* Labels */}
          <div
            className="absolute top-4 left-4 z-10 px-2.5 py-1 md:px-4 md:py-2 text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-eminence-text shadow-sm"
            style={{
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(4px)",
              display: position < 10 ? "none" : "block",
            }}
          >
            Before
          </div>
          <div
            className="absolute top-4 right-4 z-10 px-2.5 py-1 md:px-4 md:py-2 text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-white shadow-sm"
            style={{
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
              display: position > 90 ? "none" : "block",
            }}
          >
            After
          </div>
        </div>

        {/* Caption row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8 px-2">
          <span className="text-[10px] md:text-xs text-eminence-muted font-light order-2 md:order-1">↖ Natural Texture</span>
          <span className="text-eminence-gold text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-bold order-1 md:order-2 bg-eminence-gold/5 px-4 py-1.5 rounded-full">
            Slide to Compare
          </span>
          <span className="text-[10px] md:text-xs text-eminence-muted font-light text-right order-3">Eminence Finish ↗</span>
        </div>
      </div>

      {/* Stats strip */}
      <div className="max-w-5xl mx-auto px-6 md:px-12 mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center border-t border-eminence-border pt-12 md:pt-16">
        {[
          { num: "8,000+", label: "Happy Clients" },
          { num: "10+ Years", label: "of Experience" },
          { num: "3 Centers", label: "Surat · Vadodara · Ahmedabad" },
        ].map((s, i) => (
          <div key={i} className="space-y-1">
            <p className="font-serif text-3xl md:text-5xl text-eminence-text">{s.num}</p>
            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-eminence-muted font-medium">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
