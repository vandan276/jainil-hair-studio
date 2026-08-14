import sys
import re

def apply_patch():
    with open('/Users/panchalvandan/Desktop/hair-saloon3/New-hair-saloon/frontend/src/components/BillingPanel.jsx', 'r') as f:
        content = f.read()

    # 1. Add state for the pending popup
    if "showPendingPopup" not in content:
        state_str = """  const [addToWallet, setAddToWallet] = useState(false);
  const [showPendingPopup, setShowPendingPopup] = useState(false);
  const [pendingCollectAmount, setPendingCollectAmount] = useState(0);
  const [pendingCollectMethod, setPendingCollectMethod] = useState("Cash");
"""
        content = re.sub(r'  const \[addToWallet, setAddToWallet\] = useState\(false\);', state_str, content)
        
    # 2. Add logic to trigger popup when lead is selected
    if "setShowPendingPopup(true);" not in content:
        # In selectLead
        trigger_str = """      wallet: lead.wallet || 0,
      pending_payment: lead.pending_payment || 0
    });
    setAddToWallet(false);
    setAppliedPackageId("");
    if (lead.pending_payment > 0) {
      setPendingCollectAmount(lead.pending_payment);
      setShowPendingPopup(true);
    }
"""
        content = re.sub(r'      pending_payment: lead\.pending_payment \|\| 0\n    \}\);\n    setAddToWallet\(false\);\n    setAppliedPackageId\(""\);', trigger_str, content)

        # In refreshLeads (when contactNumber matches)
        refresh_trigger_str = """            wallet: found.wallet || 0,
            pending_payment: found.pending_payment || 0
          });
          if (found.pending_payment > 0 && !clientData) {
            setPendingCollectAmount(found.pending_payment);
            setShowPendingPopup(true);
          }
"""
        content = re.sub(r'            pending_payment: found\.pending_payment \|\| 0\n          \}\);', refresh_trigger_str, content)
        
    # 3. Add function to submit pending payment collection
    if "handleCollectPendingPayment" not in content:
        func_str = """  const handleCollectPendingPayment = async () => {
    if (!clientData) return;
    const lead = localLeads.find(l => l.phone?.includes(contactNumber));
    if (!lead) return;
    
    try {
      const res = await api.post(`/leads/${lead.id}/receive-pending-payment`, {
        amount: pendingCollectAmount,
        payment_method: pendingCollectMethod
      });
      toast.success("Payment collected successfully!");
      setShowPendingPopup(false);
      setClientData(prev => ({ ...prev, pending_payment: res.data.new_pending }));
      refreshLeads();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to collect payment");
    }
  };

  const assignPackageToClient"""
        content = content.replace("  const assignPackageToClient", func_str)

    # 4. Add the modal UI
    if "Pending Payment Collection Modal" not in content:
        modal_str = """        </div>
      </div>

      {/* Pending Payment Collection Modal */}
      {showPendingPopup && clientData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-rose-50/50">
              <div>
                <h3 className="font-serif text-xl text-rose-700">Outstanding Balance</h3>
                <p className="text-xs text-rose-500 font-medium">Record a payment from {clientData.name}</p>
              </div>
              <button onClick={() => setShowPendingPopup(false)} className="text-rose-400 hover:text-rose-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-white p-4 rounded-xl border border-rose-100 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-700">Total Pending:</span>
                <span className="text-2xl font-black text-rose-600">₹{Number(clientData.pending_payment).toLocaleString("en-IN")}</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Amount Received (₹)</label>
                  <input 
                    type="number" 
                    value={pendingCollectAmount}
                    onChange={(e) => setPendingCollectAmount(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-bold text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Payment Method</label>
                  <select 
                    value={pendingCollectMethod}
                    onChange={(e) => setPendingCollectMethod(e.target.value)}
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
                onClick={() => setShowPendingPopup(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Skip for Now
              </button>
              <button 
                onClick={handleCollectPendingPayment}
                disabled={!pendingCollectAmount || pendingCollectAmount <= 0}
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
}"""
        content = content.replace("        </div>\n      </div>\n    </div>\n  );\n}", modal_str)
        
    with open('/Users/panchalvandan/Desktop/hair-saloon3/New-hair-saloon/frontend/src/components/BillingPanel.jsx', 'w') as f:
        f.write(content)
    print("Patched BillingPanel.jsx successfully")

if __name__ == "__main__":
    apply_patch()
