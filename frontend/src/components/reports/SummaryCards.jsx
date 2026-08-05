import React from "react";

export default function SummaryCards({ totals }) {
  const fmt = (n) => `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  const cards = [
    { label: "Total Sales", value: fmt(totals.sales), color: "text-[#1A1A1A]" },
    { label: "Total Collection", value: fmt(totals.collection), color: "text-[#C9A57B]" },
    { label: "Total Tax", value: fmt(totals.tax), color: "text-gray-700" },
    { label: "Total Discounts", value: fmt(totals.discount), color: "text-red-600" },
    { label: "Total Pending Payments", value: fmt(totals.pending), color: "text-amber-600" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 mb-8">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-white border border-[#E5DCD0] rounded-2xl p-5 shadow-sm hover:border-[#C9A57B] hover:shadow-md transition-all duration-300"
        >
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
            {card.label}
          </div>
          <div className={`text-xl font-bold font-serif ${card.color}`}>
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}
