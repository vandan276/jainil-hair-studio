import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import BillingPanel from "@/components/BillingPanel";

export default function Billing() {
  const location = useLocation();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/leads?all=true")
      .then(res => {
        setLeads(res.data || []);
      })
      .catch(() => {
        toast.error("Failed to load clients list");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F5F1] py-12 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-gray-900">Billing Desk</h1>
          <p className="text-sm text-eminence-muted mt-1">
            Create invoices, assign packages, and process customer service records.
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm animate-pulse text-eminence-muted uppercase tracking-[0.2em] text-xs">
            Loading billing system...
          </div>
        ) : (
          <BillingPanel 
            leads={leads} 
            initialClientName={location.state?.clientName || location.state?.editOrder?.full_name || location.state?.editOrder?.user_name} 
            initialContactNumber={location.state?.contactNumber || location.state?.editOrder?.phone} 
            editOrder={location.state?.editOrder}
          />
        )}
      </div>
    </div>
  );
}
