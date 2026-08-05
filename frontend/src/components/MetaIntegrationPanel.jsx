import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Copy, Save, AlertTriangle, Send, CheckCircle2 } from "lucide-react";

export default function MetaIntegrationPanel() {
  const [config, setConfig] = useState({
    verify_token: "",
    page_access_token: "",
    webhook_secret: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [simLoading, setSimLoading] = useState(false);
  const [simData, setSimData] = useState({
    name: "",
    phone: "",
    campaign: "Facebook Lead Gen Campaign",
  });

  const webhookUrl = `${window.location.origin}/webhooks/facebook`;

  useEffect(() => {
    api.get("/admin/fb-config")
      .then((res) => {
        setConfig({
          verify_token: res.data.verify_token || "",
          page_access_token: res.data.page_access_token || "",
          webhook_secret: res.data.webhook_secret || "",
        });
      })
      .catch((err) => {
        toast.error("Failed to load Facebook configuration.");
      })
      .finally(() => setLoading(false));
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/admin/fb-config", config);
      toast.success("Meta integration settings saved successfully!");
    } catch (err) {
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    if (!simData.name || !simData.phone) {
      toast.error("Please provide Name and Phone for test lead.");
      return;
    }
    setSimLoading(true);
    try {
      // Post to the webhook endpoint directly with the secret key header
      const response = await fetch("/webhooks/facebook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Key": config.webhook_secret || "eminence_secret_123",
        },
        body: JSON.stringify({
          name: simData.name,
          phone_number: simData.phone,
          campaign: simData.campaign,
        }),
      });
      const resData = await response.json();
      if (resData.status === "success") {
        toast.success("Lead simulated successfully! Check CRM leads list.");
        setSimData({ name: "", phone: "", campaign: "Facebook Lead Gen Campaign" });
      } else {
        toast.error(`Simulation ignored or failed: ${resData.status}`);
      }
    } catch (err) {
      toast.error("Failed to trigger webhook simulation.");
    } finally {
      setSimLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <span className="text-eminence-gold font-serif text-lg tracking-wider">Loading Configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10" data-testid="meta-integration-panel">
      {/* HEADER SECTION */}
      <div className="glass-card p-6 md:p-8 rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-eminence-gold/10 rounded-full flex items-center justify-center text-eminence-gold shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h3 className="font-serif text-2xl text-eminence-text mb-2">Meta Ads Lead Webhook Integration</h3>
            <p className="text-sm text-eminence-muted leading-relaxed">
              Capture leads directly from your Facebook and Instagram Lead Ads forms in real-time. Meta uses webhooks to notify the system instantly when a user submits a form.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* WEBHOOK DETAILS CARD */}
        <div className="glass-card p-6 md:p-8 rounded-2xl lg:col-span-2 space-y-6">
          <h4 className="font-serif text-xl text-eminence-text border-b border-eminence-border pb-4">Webhook Details</h4>
          
          <div className="space-y-4">
            <div>
              <label className="overline block text-[10px] text-eminence-muted mb-1.5">Callback Webhook URL</label>
              <div className="flex items-center gap-2 bg-eminence-surface border border-eminence-border p-3 rounded-lg">
                <code className="text-xs text-eminence-text select-all font-mono break-all flex-1">{webhookUrl}</code>
                <button 
                  onClick={() => copyToClipboard(webhookUrl)}
                  className="p-1.5 hover:bg-eminence-gold/10 text-eminence-muted hover:text-eminence-gold rounded transition-colors"
                  title="Copy URL"
                >
                  <Copy size={16} />
                </button>
              </div>
              <p className="text-[11px] text-eminence-muted mt-1.5">
                Paste this URL in the Meta Webhooks Configuration inside your Developer Account.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-5 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="overline block text-[10px] text-eminence-muted mb-1.5">Webhook Verify Token</label>
                  <input
                    type="text"
                    value={config.verify_token}
                    onChange={(e) => setConfig({ ...config, verify_token: e.target.value })}
                    placeholder="e.g. eminence_salon_verify_2026"
                    className="w-full bg-eminence-surface border border-eminence-border px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-eminence-gold"
                  />
                  <p className="text-[10px] text-eminence-muted mt-1">
                    Token defined on Meta App config to verify your endpoint ownership.
                  </p>
                </div>

                <div>
                  <label className="overline block text-[10px] text-eminence-muted mb-1.5">Test Webhook Secret Key</label>
                  <input
                    type="text"
                    value={config.webhook_secret}
                    onChange={(e) => setConfig({ ...config, webhook_secret: e.target.value })}
                    placeholder="e.g. eminence_secret_123"
                    className="w-full bg-eminence-surface border border-eminence-border px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-eminence-gold"
                  />
                  <p className="text-[10px] text-eminence-muted mt-1">
                    Used to authenticate test webhook calls and mock simulator leads.
                  </p>
                </div>
              </div>

              <div>
                <label className="overline block text-[10px] text-eminence-muted mb-1.5">FB Page Access Token</label>
                <textarea
                  rows={4}
                  value={config.page_access_token}
                  onChange={(e) => setConfig({ ...config, page_access_token: e.target.value })}
                  placeholder="Paste Meta Permanent Page Access Token here..."
                  className="w-full bg-eminence-surface border border-eminence-border px-4 py-3 rounded-lg text-sm font-mono focus:outline-none focus:border-eminence-gold"
                />
                <p className="text-[10px] text-eminence-muted mt-1">
                  Required to query Meta Graph API for retrieval of actual lead form values (Name, WhatsApp, Email).
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-3">
                <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  Make sure your Meta Page Access Token is a **Permanent User Token** with standard `pages_read_engagement`, `pages_manage_ads`, and `leads_retrieval` scopes so lead retrieval requests never expire.
                </p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn-gold flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-widest font-bold ml-auto disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? "Saving Settings..." : "Save Settings"}
              </button>
            </form>
          </div>
        </div>

        {/* WEBHOOK SIMULATOR / TEST LEAD GENERATOR */}
        <div className="glass-card p-6 md:p-8 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="font-serif text-xl text-eminence-text border-b border-eminence-border pb-4 mb-6">Ads Simulator</h4>
            
            <p className="text-xs text-eminence-muted mb-6 leading-relaxed">
              Use this simulator to test your webhook integration. Submitting this form sends an authentic request directly to `/webhooks/facebook` to verify that leads register in the CRM database instantly.
            </p>

            <form onSubmit={handleSimulate} className="space-y-4">
              <div>
                <label className="overline block text-[10px] text-eminence-muted mb-1">Test Contact Name</label>
                <input
                  type="text"
                  required
                  value={simData.name}
                  onChange={(e) => setSimData({ ...simData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full bg-eminence-surface border border-eminence-border px-4 py-2.5 rounded-lg text-xs focus:outline-none focus:border-eminence-gold"
                />
              </div>

              <div>
                <label className="overline block text-[10px] text-eminence-muted mb-1">Test Phone Number</label>
                <input
                  type="tel"
                  required
                  value={simData.phone}
                  onChange={(e) => setSimData({ ...simData, phone: e.target.value })}
                  placeholder="e.g. +91 9999988888"
                  className="w-full bg-eminence-surface border border-eminence-border px-4 py-2.5 rounded-lg text-xs focus:outline-none focus:border-eminence-gold"
                />
              </div>

              <div>
                <label className="overline block text-[10px] text-eminence-muted mb-1">Ad Campaign Name</label>
                <input
                  type="text"
                  required
                  value={simData.campaign}
                  onChange={(e) => setSimData({ ...simData, campaign: e.target.value })}
                  placeholder="e.g. Summer Offer campaign"
                  className="w-full bg-eminence-surface border border-eminence-border px-4 py-2.5 rounded-lg text-xs focus:outline-none focus:border-eminence-gold"
                />
              </div>

              <button
                type="submit"
                disabled={simLoading}
                className="btn-gold w-full flex items-center justify-center gap-2 py-3 text-xs uppercase tracking-widest font-bold mt-6 disabled:opacity-50"
              >
                <Send size={12} />
                {simLoading ? "Sending..." : "Send Test Lead"}
              </button>
            </form>
          </div>
          
          <div className="border-t border-eminence-border pt-4 mt-6 text-center">
            <span className="text-[10px] uppercase tracking-wider text-eminence-gold font-bold">
              Meta CRM Connection Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
