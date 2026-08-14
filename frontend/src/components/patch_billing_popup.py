import sys
import re

def apply_patch():
    with open('/Users/panchalvandan/Desktop/hair-saloon3/New-hair-saloon/frontend/src/components/BillingPanel.jsx', 'r') as f:
        content = f.read()

    # 1. State changes: add pendingOrders, and objects to store input values per order
    if "const [pendingOrders, setPendingOrders] = useState([]);" not in content:
        state_str = """  const [addToWallet, setAddToWallet] = useState(false);
  const [showPendingPopup, setShowPendingPopup] = useState(false);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [payAmounts, setPayAmounts] = useState({});
  const [payModes, setPayModes] = useState({});
  const [loadingOrders, setLoadingOrders] = useState(false);
"""
        content = re.sub(r'  const \[addToWallet, setAddToWallet\] = useState\(false\);\n  const \[showPendingPopup, setShowPendingPopup\] = useState\(false\);\n  const \[pendingCollectAmount, setPendingCollectAmount\] = useState\(0\);\n  const \[pendingCollectMethod, setPendingCollectMethod\] = useState\("Cash"\);', state_str, content)

    # 2. Update trigger to fetch orders instead of just showing amount
    if "const fetchPendingOrders =" not in content:
        fetch_str = """  const fetchPendingOrders = async (leadId) => {
    setLoadingOrders(true);
    try {
      const res = await api.get(`/leads/${leadId}/pending-orders`);
      setPendingOrders(res.data || []);
      const initAmounts = {};
      const initModes = {};
      (res.data || []).forEach(o => {
        initAmounts[o.id] = o.unpaid_amount;
        initModes[o.id] = "Cash";
      });
      setPayAmounts(initAmounts);
      setPayModes(initModes);
    } catch (e) {
      toast.error("Failed to load pending bills");
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleCollectPendingPayment"""
        content = content.replace("  const handleCollectPendingPayment", fetch_str)

    # 3. Update selectLead to call fetchPendingOrders
    trigger_str = """      pending_payment: lead.pending_payment || 0
    });
    setAddToWallet(false);
    setAppliedPackageId("");
    if (lead.pending_payment > 0) {
      setShowPendingPopup(true);
      fetchPendingOrders(lead.id);
    }"""
    content = re.sub(r'      pending_payment: lead\.pending_payment \|\| 0\n    \}\);\n    setAddToWallet\(false\);\n    setAppliedPackageId\(""\);\n    if \(lead\.pending_payment > 0\) \{\n      setPendingCollectAmount\(lead\.pending_payment\);\n      setShowPendingPopup\(true\);\n    \}', trigger_str, content)

    refresh_trigger_str = """            pending_payment: found.pending_payment || 0
          });
          if (found.pending_payment > 0 && !clientData) {
            setShowPendingPopup(true);
            fetchPendingOrders(found.id);
          }"""
    content = re.sub(r'            pending_payment: found\.pending_payment \|\| 0\n          \}\);\n          if \(found\.pending_payment > 0 && !clientData\) \{\n            setPendingCollectAmount\(found\.pending_payment\);\n            setShowPendingPopup\(true\);\n          \}', refresh_trigger_str, content)

    # 4. Modify handleCollectPendingPayment for specific order
    new_handler = """  const handlePayOrder = async (orderId) => {
    if (!clientData) return;
    const lead = localLeads.find(l => l.phone?.includes(contactNumber));
    if (!lead) return;
    
    const amount = payAmounts[orderId];
    const mode = payModes[orderId];
    
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    
    try {
      await api.post(`/orders/${orderId}/pay-pending`, {
        amount: amount,
        payment_method: mode,
        lead_id: lead.id
      });
      toast.success("Payment collected successfully!");
      // Re-fetch to update table
      fetchPendingOrders(lead.id);
      refreshLeads();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to collect payment");
    }
  };

  const assignPackageToClient"""
    
    content = re.sub(r'  const handleCollectPendingPayment = async \(\) => \{[\s\S]*?refreshLeads\(\);\n    \} catch \(e\) \{\n      toast\.error\(e\.response\?\.data\?\.detail \|\| "Failed to collect payment"\);\n    \}\n  \};\n\n  const assignPackageToClient', new_handler, content)


    # 5. Replace Modal UI
    modal_ui = """      {/* Pending Payment Collection Modal */}
      {showPendingPopup && clientData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white shadow-2xl w-full max-w-5xl rounded overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
              <h3 className="text-gray-700 font-medium">Pending payments</h3>
            </div>
            
            <div className="p-4 overflow-auto flex-1 bg-white">
              {loadingOrders ? (
                <div className="text-center py-8 text-gray-500">Loading bills...</div>
              ) : pendingOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No pending bills found.</div>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-100 text-left text-gray-600">
                      <th className="pb-3 px-2 font-bold">Branch</th>
                      <th className="pb-3 px-2 font-bold">Id</th>
                      <th className="pb-3 px-2 font-bold">Date</th>
                      <th className="pb-3 px-2 font-bold">Type</th>
                      <th className="pb-3 px-2 font-bold">Pending amount</th>
                      <th className="pb-3 px-2 font-bold">Pay amount</th>
                      <th className="pb-3 px-2 font-bold">Pay mode</th>
                      <th className="pb-3 px-2 font-bold">Send As</th>
                      <th className="pb-3 px-2 font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOrders.map(o => (
                      <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="py-4 px-2">{o.branch || "Subhanpura"}</td>
                        <td className="py-4 px-2 text-gray-600">{o.id.substring(0, 8)}</td>
                        <td className="py-4 px-2">{o.created_at ? o.created_at.substring(0, 10).split('-').reverse().join('-') : "—"}</td>
                        <td className="py-4 px-2">Bill</td>
                        <td className="py-4 px-2">{o.unpaid_amount.toFixed(2)}</td>
                        <td className="py-4 px-2">
                          <input 
                            type="number"
                            className="border border-gray-300 rounded px-2 py-1 w-24 text-sm focus:outline-none focus:border-blue-400"
                            value={payAmounts[o.id] || ""}
                            onChange={(e) => setPayAmounts(prev => ({ ...prev, [o.id]: Number(e.target.value) }))}
                          />
                        </td>
                        <td className="py-4 px-2">
                          <select 
                            className="border border-gray-300 rounded px-2 py-1 w-24 text-sm focus:outline-none focus:border-blue-400 bg-white"
                            value={payModes[o.id] || "Cash"}
                            onChange={(e) => setPayModes(prev => ({ ...prev, [o.id]: e.target.value }))}
                          >
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="UPI">UPI</option>
                          </select>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex flex-col gap-1 text-[11px] text-gray-600">
                            <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" /> SMS</label>
                            <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" /> WhatsApp</label>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <button 
                            onClick={() => handlePayOrder(o.id)}
                            className="bg-[#00c853] hover:bg-[#00b04a] text-white font-bold py-1.5 px-3 rounded text-xs flex items-center gap-1 shadow-sm transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                            Pay now
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="bg-gray-100 p-4 border-t border-gray-200 flex justify-end">
              <button 
                onClick={() => setShowPendingPopup(false)}
                className="bg-[#ff1744] hover:bg-[#e0143c] text-white font-bold py-2 px-5 rounded shadow-sm flex items-center gap-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}"""
    
    content = re.sub(r'      \{/\* Pending Payment Collection Modal \*/\}[\s\S]*?    </div>\n  \);\n\}', modal_ui, content)
    
    with open('/Users/panchalvandan/Desktop/hair-saloon3/New-hair-saloon/frontend/src/components/BillingPanel.jsx', 'w') as f:
        f.write(content)
    print("Patched BillingPanel.jsx successfully")

if __name__ == "__main__":
    apply_patch()
