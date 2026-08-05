import React from "react";

export default function PendingPayments() {
  return (
    <div className="p-8 bg-white border border-eminence-border rounded-2xl shadow-sm max-w-4xl mx-auto my-6">
      <h2 className="text-3xl font-serif text-eminence-text mb-4">Received Pending Payments</h2>
      <div className="h-[2px] w-12 bg-eminence-gold mb-6" />
      <p className="text-sm text-eminence-muted leading-relaxed">
        This is a placeholder for the Received Pending Payments dashboard.
      </p>
    </div>
  );
}
