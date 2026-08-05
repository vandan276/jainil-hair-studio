import React, { useState } from "react";

export default function ReportTable({ data, loading, totals, headers }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fmt = (n) => `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center bg-white border border-[#E5DCD0] rounded-2xl shadow-sm">
        <div className="w-10 h-10 border-4 border-[#C9A57B] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Loading Report Data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-24 text-center bg-white border border-[#E5DCD0] rounded-2xl shadow-sm">
        <p className="text-sm italic text-gray-500">No report records found for the selected range.</p>
      </div>
    );
  }

  // Pagination Logic
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = data.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Table Wrapper */}
      <div className="overflow-x-auto max-h-[600px] border border-[#E5DCD0] rounded-2xl bg-white shadow-sm scrollbar-thin">
        <table className="w-full border-collapse text-xs text-left">
          {/* Header */}
          <thead className="sticky top-0 z-20">
            <tr className="bg-[#1A1A1A] text-white">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className={`px-4 py-3.5 font-bold uppercase tracking-wider text-center border-b border-[#E5DCD0] whitespace-nowrap`}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-[#FAF7F2] hover:bg-[#FAF7F2]/50 transition-colors duration-150"
              >
                <td className="px-4 py-3 text-center font-medium text-gray-400">{startIndex + idx + 1}</td>
                <td className="px-4 py-3 text-center font-semibold text-gray-800">{row.date}</td>
                <td className="px-4 py-3 text-right">{fmt(row.service)}</td>
                <td className="px-4 py-3 text-right">{fmt(row.product)}</td>
                <td className="px-4 py-3 text-right">{fmt(row.package)}</td>
                <td className="px-4 py-3 text-right">{fmt(row.membership)}</td>
                <td className="px-4 py-3 text-right">{fmt(row.wallet)}</td>
                <td className="px-4 py-3 text-right">{fmt(row.pendingRec)}</td>
                <td className="px-4 py-3 text-right">{fmt(row.advance)}</td>
                <td className="px-4 py-3 text-right text-amber-600 font-medium">{fmt(row.pendingPay)}</td>
                <td className="px-4 py-3 text-right font-semibold">{fmt(row.totalInvoice)}</td>
                <td className="px-4 py-3 text-right text-red-600">{fmt(row.discount)}</td>
                <td className="px-4 py-3 text-right font-semibold text-[#1A1A1A]">{fmt(row.netSale)}</td>
                <td className="px-4 py-3 text-right">{fmt(row.tax)}</td>
                <td className="px-4 py-3 text-right font-bold text-[#C9A57B]">{fmt(row.grandSale)}</td>
                <td className="px-4 py-3 text-right font-bold text-[#1A1A1A]">{fmt(row.totalCollection)}</td>
                <td className="px-4 py-3 text-right">{fmt(row.cash)}</td>
                <td className="px-4 py-3 text-right">{fmt(row.card)}</td>
                <td className="px-4 py-3 text-right">{fmt(row.cheque)}</td>
                <td className="px-4 py-3 text-right">{fmt(row.online)}</td>
                <td className="px-4 py-3 text-right">{fmt(row.paytm)}</td>
                <td className="px-4 py-3 text-right">{fmt(row.ewallet)}</td>
                <td className="px-4 py-3 text-right">{fmt(row.reward)}</td>
                <td className="px-4 py-3 text-right">{fmt(row.phonePe)}</td>
                <td className="px-4 py-3 text-right">{fmt(row.gpay)}</td>
              </tr>
            ))}
          </tbody>

          {/* Footer (Totals) */}
          <tfoot className="sticky bottom-0 z-10 bg-[#FAF7F2] border-t-4 border-[#E5DCD0]">
            <tr className="font-bold text-black text-right border-t border-[#E5DCD0]">
              <td className="px-4 py-3 text-center uppercase tracking-wider text-gray-500 font-bold" colSpan={2}>
                TOTALS
              </td>
              <td className="px-4 py-3">{fmt(totals.service)}</td>
              <td className="px-4 py-3">{fmt(totals.product)}</td>
              <td className="px-4 py-3">{fmt(totals.package)}</td>
              <td className="px-4 py-3">{fmt(totals.membership)}</td>
              <td className="px-4 py-3">{fmt(totals.wallet)}</td>
              <td className="px-4 py-3">{fmt(totals.pendingRec)}</td>
              <td className="px-4 py-3">{fmt(totals.advance)}</td>
              <td className="px-4 py-3 text-amber-600 font-extrabold">{fmt(totals.pendingPay)}</td>
              <td className="px-4 py-3 font-extrabold">{fmt(totals.totalInvoice)}</td>
              <td className="px-4 py-3 text-red-600">{fmt(totals.discount)}</td>
              <td className="px-4 py-3 font-extrabold text-[#1A1A1A]">{fmt(totals.netSale)}</td>
              <td className="px-4 py-3">{fmt(totals.tax)}</td>
              <td className="px-4 py-3 font-extrabold text-[#C9A57B]">{fmt(totals.grandSale)}</td>
              <td className="px-4 py-3 font-extrabold text-[#1A1A1A]">{fmt(totals.totalCollection)}</td>
              <td className="px-4 py-3">{fmt(totals.cash)}</td>
              <td className="px-4 py-3">{fmt(totals.card)}</td>
              <td className="px-4 py-3">{fmt(totals.cheque)}</td>
              <td className="px-4 py-3">{fmt(totals.online)}</td>
              <td className="px-4 py-3">{fmt(totals.paytm)}</td>
              <td className="px-4 py-3">{fmt(totals.ewallet)}</td>
              <td className="px-4 py-3">{fmt(totals.reward)}</td>
              <td className="px-4 py-3">{fmt(totals.phonePe)}</td>
              <td className="px-4 py-3">{fmt(totals.gpay)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-[#E5DCD0] rounded bg-white"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-[#E5DCD0] rounded-lg disabled:opacity-40 font-semibold"
            >
              Prev
            </button>
            <span className="font-bold text-black">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-[#E5DCD0] rounded-lg disabled:opacity-40 font-semibold"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
