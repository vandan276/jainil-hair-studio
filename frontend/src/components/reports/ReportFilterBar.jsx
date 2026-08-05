import React from "react";
import ExportButton from "./ExportButton";

export default function ReportFilterBar({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  searchQuery,
  setSearchQuery,
  onFilter,
  onClear,
  onExport,
  dataToExport,
  headers,
}) {
  return (
    <div className="bg-[#FAF7F2] border border-[#E5DCD0] rounded-2xl p-5 mb-8 shadow-sm flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-4">
        {/* Date Filters */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider">From Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-4 py-2.5 border border-[#E5DCD0] rounded-xl text-xs bg-white text-black focus:outline-none focus:border-[#C9A57B] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider">To Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2.5 border border-[#E5DCD0] rounded-xl text-xs bg-white text-black focus:outline-none focus:border-[#C9A57B] transition-colors"
          />
        </div>

        {/* Search Placeholder */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
          <label className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider">Search Invoice / Date</label>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2.5 border border-[#E5DCD0] rounded-xl text-xs bg-white text-black focus:outline-none focus:border-[#C9A57B] transition-colors w-full"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onFilter}
            className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest bg-[#1A1A1A] text-white border border-[#1A1A1A] rounded-xl hover:bg-transparent hover:text-[#1A1A1A] transition-all duration-300"
          >
            Filter
          </button>
          
          <button
            onClick={onClear}
            className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest bg-transparent text-[#dc2626] border border-[#dc2626] rounded-xl hover:bg-[#dc2626]/5 transition-all duration-300"
          >
            ✕ Clear
          </button>

          <ExportButton onExport={onExport} data={dataToExport} headers={headers} />
        </div>
      </div>
    </div>
  );
}
