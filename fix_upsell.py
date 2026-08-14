import re

with open("frontend/src/pages/Admin.jsx", "r") as f:
    content = f.read()

upsell_old = """      o.items?.forEach(it => {
        const isProd = it.type === "product" || (!it.is_service && !it.is_package);
        if (isProd) {
          records.push({
            orderId: o.id,
            date: o.created_at ? o.created_at.split("T")[0] : "Unknown",
            clientName: o.full_name || o.user_name || "Unknown",
            contactNumber: o.phone || "—",
            productName: it.name,
            providerId: it.service_provider || o.employee_id || "—",
            amount: (it.price || 0) * (it.quantity || 1),
            quantity: it.quantity || 1
          });
        }
      });"""

upsell_new = """      o.items?.forEach(it => {
        const isProd = it.type === "product" || (!it.is_service && !it.is_package);
        if (isProd) {
          let itemEmpId = it.service_provider_id;
          if (!itemEmpId && it.service_provider) {
            const matched = employees.find(e => e.id === it.service_provider || e.name === it.service_provider);
            if (matched) itemEmpId = matched.id;
          }
          if (!itemEmpId) itemEmpId = o.employee_id || o.stylist_id || "—";
          
          records.push({
            orderId: o.id,
            date: o.created_at ? o.created_at.split("T")[0] : "Unknown",
            clientName: o.full_name || o.user_name || "Unknown",
            contactNumber: o.phone || "—",
            productName: it.name,
            providerId: itemEmpId,
            amount: (it.price || 0) * (it.quantity || 1),
            quantity: it.quantity || 1
          });
        }
      });"""

content = content.replace(upsell_old, upsell_new)

with open("frontend/src/pages/Admin.jsx", "w") as f:
    f.write(content)
