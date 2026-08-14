import sys
import re

def apply_patch():
    with open('/Users/panchalvandan/Desktop/hair-saloon3/New-hair-saloon/frontend/src/pages/Admin.jsx', 'r') as f:
        content = f.read()

    # 1. Rename existing "reports-pending" label
    content = content.replace('{ k: "reports-pending", label: "Received Pending Payments", desc: "Track and confirm pending split payments or post-dated bills." },', 
                              '{ k: "reports-pending", label: "Online Website Orders", desc: "Track and confirm pending split payments or post-dated bills from the website." },')
    content = content.replace('{ k: "reports-pending", label: "Received Pending Payments" },', 
                              '{ k: "reports-pending", label: "Online Website Orders" },')

    # 2. Add the new tab "reports-client-pending" everywhere reports-pending is used
    if '"reports-client-pending"' not in content:
        content = content.replace('"reports-billing", "reports-pending", "reports-history",', 
                                  '"reports-billing", "reports-client-pending", "reports-pending", "reports-history",')
        
        # In sideNav items
        content = content.replace('{ k: "reports-pending", label: "Online Website Orders" },',
                                  '{ k: "reports-client-pending", label: "Client Pending Balances" },\n                      { k: "reports-pending", label: "Online Website Orders" },')

        # In top dropdown
        content = content.replace('{ k: "reports-pending", label: "Online Website Orders" },',
                                  '{ k: "reports-client-pending", label: "Client Pending Balances" },\n      { k: "reports-pending", label: "Online Website Orders" },')

        # In tab condition
        content = content.replace('tab === "reports-pending" ||', 'tab === "reports-client-pending" || tab === "reports-pending" ||')

    # 3. Add the panel rendering
    if 'tab === "reports-client-pending"' not in content:
        panel_call = """          {tab === "reports-client-pending" && (
            <ClientPendingBalancesPanel refresh={refresh} t={t} />
          )}
          {tab === "reports-pending" && ("""
        content = content.replace('{tab === "reports-pending" && (', panel_call)

    # 4. Define the ClientPendingBalancesPanel component
    if "function ClientPendingBalancesPanel" not in content:
        new_component = """function ClientPendingBalancesPanel({ refresh }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [collectAmount, setCollectAmount] = useState(0);
  const [collectMethod, setCollectMethod] = useState("Cash");

  const fetchPendingLeads = async () => {
    try {
      setLoading(true);
      const res = await api.get("/leads?all=true");
      const pendingLeads = (res.data || []).filter(l => Number(l.pending_payment) > 0);
      setLeads(pendingLeads);
    } catch (e) {
      toast.error("Failed to fetch client pending balances");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingLeads();
  }, []);

  const handleOpenPopup = (lead) => {
    setSelectedLead(lead);
    setCollectAmount(Number(lead.pending_payment));
    setCollectMethod("Cash");
    setShowPopup(true);
  };

  const handleCollect = async () => {
    if (!selectedLead) return;
    try {
      await api.post(`/leads/${selectedLead.id}/receive-pending-payment`, {
        amount: collectAmount,
        payment_method: collectMethod
      });
      toast.success("Payment collected successfully!");
      setShowPopup(false);
      fetchPendingLeads();
      refresh();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to collect payment");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h2 className="font-serif text-2xl text-gray-800">Client Pending Balances</h2>
        <p className="text-xs text-eminence-muted">Track and collect outstanding balances from clients.</p>
      </div>

      <div className="eminence-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-eminence-border text-left overline text-eminence-muted">
              <th className="px-6 py-4">Client Name</th>
              <th>Contact Number</th>
              <th>Branch</th>
              <th>Total Pending</th>
              <th className="text-right px-6">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-12">Loading...</td></tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-12 text-eminence-muted italic">All accounts are settled! No pending balances.</td>
              </tr>
            ) : (
              leads.map(l => (
                <tr key={l.id} className="border-b border-eminence-border/30 hover:bg-eminence-surface/30">
                  <td className="px-6 py-4 font-bold">{l.name}</td>
                  <td>{l.phone}</td>
                  <td>{l.branch || "—"}</td>
                  <td className="font-semibold text-rose-600">₹{Number(l.pending_payment).toLocaleString("en-IN")}</td>
                  <td className="text-right px-6">
                    <button onClick={() => handleOpenPopup(l)} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors">
                      Receive Payment
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showPopup && selectedLead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-rose-50/50">
              <div>
                <h3 className="font-serif text-xl text-rose-700">Outstanding Balance</h3>
                <p className="text-xs text-rose-500 font-medium">Record a payment from {selectedLead.name}</p>
              </div>
              <button onClick={() => setShowPopup(false)} className="text-rose-400 hover:text-rose-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-white p-4 rounded-xl border border-rose-100 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-700">Total Pending:</span>
                <span className="text-2xl font-black text-rose-600">₹{Number(selectedLead.pending_payment).toLocaleString("en-IN")}</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Amount Received (₹)</label>
                  <input 
                    type="number" 
                    value={collectAmount}
                    onChange={(e) => setCollectAmount(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-bold text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Payment Method</label>
                  <select 
                    value={collectMethod}
                    onChange={(e) => setCollectMethod(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-bold text-gray-800 appearance-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowPopup(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCollect}
                disabled={!collectAmount || collectAmount <= 0}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-rose-600/20"
              >
                Confirm Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PendingPaymentsPanel"""
        content = content.replace("function PendingPaymentsPanel", new_component)

    with open('/Users/panchalvandan/Desktop/hair-saloon3/New-hair-saloon/frontend/src/pages/Admin.jsx', 'w') as f:
        f.write(content)
    print("Patched Admin.jsx successfully")

if __name__ == "__main__":
    apply_patch()
