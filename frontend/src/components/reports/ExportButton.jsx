import React from "react";
import { toast } from "sonner";

export default function ExportButton({ data, headers, filename = "daily_report.csv" }) {
  const handleExport = () => {
    if (!data || data.length === 0) {
      toast.error("No data available to export");
      return;
    }

    try {
      const csvRows = [];
      // Header row
      csvRows.push(headers.map(h => `"${h.label}"`).join(","));

      // Data rows
      data.forEach((row, index) => {
        const values = headers.map(h => {
          let val = row[h.key];
          if (h.key === "srNo") {
            val = index + 1;
          }
          // Escape quotes
          const strVal = val !== undefined && val !== null ? String(val).replace(/"/g, '""') : "";
          return `"${strVal}"`;
        });
        csvRows.push(values.join(","));
      });

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV file exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export CSV file");
    }
  };

  return (
    <button
      onClick={handleExport}
      className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest bg-[#C9A57B] text-white border border-[#C9A57B] rounded-xl hover:bg-transparent hover:text-[#C9A57B] transition-all duration-300 flex items-center gap-1.5"
    >
      <span>⬇ Export CSV</span>
    </button>
  );
}
