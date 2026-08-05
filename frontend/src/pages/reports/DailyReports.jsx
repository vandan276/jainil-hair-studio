import React, { useState, useEffect } from "react";
import ReportFilterBar from "@/components/reports/ReportFilterBar";
import ReportTable from "@/components/reports/ReportTable";
import SummaryCards from "@/components/reports/SummaryCards";

// Helper to generate 30 days of realistic daily report mock data
const generateMockData = () => {
  const data = [];
  const today = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split("T")[0];

    const service = Math.round(5000 + Math.random() * 10000);
    const product = Math.round(1000 + Math.random() * 4000);
    const pkg = Math.round(Math.random() > 0.5 ? 2000 + Math.random() * 3000 : 0);
    const membership = Math.round(Math.random() > 0.6 ? 1500 + Math.random() * 2000 : 0);
    const wallet = Math.round(Math.random() > 0.7 ? 500 + Math.random() * 1000 : 0);
    const pendingRec = Math.round(Math.random() > 0.6 ? 500 + Math.random() * 1500 : 0);
    const advance = Math.round(Math.random() > 0.7 ? 500 + Math.random() * 1000 : 0);
    const pendingPay = Math.round(Math.random() > 0.8 ? 500 + Math.random() * 1500 : 0);

    const totalInvoice = service + product + pkg + membership + wallet;
    const discount = Math.round(100 + Math.random() * 900);
    const netSale = totalInvoice - discount;
    const tax = Math.round(netSale * 0.18);
    const grandSale = netSale + tax;
    const totalCollection = grandSale - pendingPay + pendingRec + advance;

    // Distribute collection randomly across payment modes
    let remaining = totalCollection;
    const cash = Math.round(remaining * (0.2 + Math.random() * 0.2));
    remaining -= cash;
    const card = Math.round(remaining * (0.2 + Math.random() * 0.2));
    remaining -= card;
    const online = Math.round(remaining * (0.2 + Math.random() * 0.2));
    remaining -= online;
    
    // Split the rest among other e-wallets
    const share = Math.round(remaining / 6);
    const cheque = Math.max(0, share);
    const paytm = Math.max(0, share);
    const ewallet = Math.max(0, share);
    const reward = Math.max(0, share);
    const phonePe = Math.max(0, share);
    const gpay = Math.max(0, totalCollection - (cash + card + online + cheque + paytm + ewallet + reward + phonePe));

    data.push({
      date: dateString,
      service,
      product,
      package: pkg,
      membership,
      wallet,
      pendingRec,
      advance,
      pendingPay,
      totalInvoice,
      discount,
      netSale,
      tax,
      grandSale,
      totalCollection,
      cash,
      card,
      cheque,
      online,
      paytm,
      ewallet,
      reward,
      phonePe,
      gpay
    });
  }
  return data;
};

export default function DailyReports() {
  const mockDatabase = React.useMemo(() => generateMockData(), []);

  const today = new Date().toISOString().split("T")[0];
  const monthStart = new Date(new Date().setDate(1)).toISOString().split("T")[0];

  // States
  const [startDate, setStartDate] = useState(monthStart);
  const [endDate, setEndDate] = useState(today);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState([]);

  // Perform Filtering
  const handleFilter = React.useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      let result = mockDatabase.filter(
        (item) => item.date >= startDate && item.date <= endDate
      );

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        result = result.filter(
          (item) =>
            item.date.includes(query) ||
            String(item.totalInvoice).includes(query)
        );
      }

      setFilteredData(result);
      setLoading(false);
    }, 400); // Small delay to simulate loading state
  }, [startDate, endDate, searchQuery, mockDatabase]);

  // Run filter on initial render & date range changes
  useEffect(() => {
    handleFilter();
  }, [handleFilter]);

  const handleClear = () => {
    setStartDate(monthStart);
    setEndDate(today);
    setSearchQuery("");
  };

  // Calculate totals for summary cards & table footer
  const totals = React.useMemo(() => {
    const keys = [
      "service", "product", "package", "membership", "wallet", "pendingRec",
      "advance", "pendingPay", "totalInvoice", "discount", "netSale", "tax",
      "grandSale", "totalCollection", "cash", "card", "cheque", "online",
      "paytm", "ewallet", "reward", "phonePe", "gpay"
    ];

    const result = keys.reduce((acc, key) => {
      acc[key] = filteredData.reduce((sum, row) => sum + (row[key] || 0), 0);
      return acc;
    }, {});

    // Metrics for summary cards
    return {
      ...result,
      sales: result.grandSale,
      collection: result.totalCollection,
      tax: result.tax,
      discount: result.discount,
      pending: result.pendingPay
    };
  }, [filteredData]);

  // Headers for CSV exports
  const headers = [
    { key: "srNo", label: "Sr No" },
    { key: "date", label: "Bill Date" },
    { key: "service", label: "Service Amount" },
    { key: "product", label: "Product Amount" },
    { key: "package", label: "Package Amount" },
    { key: "membership", label: "Membership Amount" },
    { key: "wallet", label: "Wallet Amount" },
    { key: "pendingRec", label: "Pending Amount Received" },
    { key: "advance", label: "Appointment Advance" },
    { key: "pendingPay", label: "Pending Payment" },
    { key: "totalInvoice", label: "Total Invoice Amount" },
    { key: "discount", label: "Discount" },
    { key: "netSale", label: "Net Sale" },
    { key: "tax", label: "Tax" },
    { key: "grandSale", label: "Grand Sale" },
    { key: "totalCollection", label: "Total Collection" },
    { key: "cash", label: "Cash" },
    { key: "card", label: "Credit/Debit Card" },
    { key: "cheque", label: "Cheque" },
    { key: "online", label: "Online Payment" },
    { key: "paytm", label: "Paytm" },
    { key: "ewallet", label: "E-Wallet" },
    { key: "reward", label: "Reward Points" },
    { key: "phonePe", label: "PhonePe" },
    { key: "gpay", label: "GPay" },
  ];

  return (
    <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-serif text-[#1A1A1A] mb-1">Daily Reports</h2>
        <p className="text-sm text-gray-500">Track daily sales and transaction reports</p>
      </div>

      {/* Summary Cards */}
      <SummaryCards totals={totals} />

      {/* Filter Bar */}
      <ReportFilterBar
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onFilter={handleFilter}
        onClear={handleClear}
        dataToExport={filteredData}
        headers={headers}
      />

      {/* Report Table */}
      <ReportTable
        data={filteredData}
        loading={loading}
        totals={totals}
        headers={headers}
      />
    </div>
  );
}
