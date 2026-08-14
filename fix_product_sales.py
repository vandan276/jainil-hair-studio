import re

with open("frontend/src/pages/Admin.jsx", "r") as f:
    content = f.read()

prod_sales_old = """          tax: ((it.price || 0) * (it.quantity || 1) - (it.discount || 0)) * 0.18,
          grandTotal: ((it.price || 0) * (it.quantity || 1) - (it.discount || 0)) * 1.18,
          paymentMethod: o.payment_method || "—",
          soldBy: it.service_provider || o.employee_name || "—"
        });"""

prod_sales_new = """          tax: ((it.price || 0) * (it.quantity || 1) - (it.discount || 0)) * 0.18,
          grandTotal: ((it.price || 0) * (it.quantity || 1) - (it.discount || 0)) * 1.18,
          paymentMethod: o.payment_method || "—",
          soldBy: (it.service_provider_id ? (employees.find(e => e.id === it.service_provider_id)?.name) : (employees.find(e => e.id === it.service_provider)?.name || it.service_provider)) || o.employee_name || o.stylist_name || "—"
        });"""

content = content.replace(prod_sales_old, prod_sales_new)

with open("frontend/src/pages/Admin.jsx", "w") as f:
    f.write(content)
