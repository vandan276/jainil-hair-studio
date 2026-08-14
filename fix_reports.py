import re

with open("frontend/src/pages/Admin.jsx", "r") as f:
    content = f.read()

# 1. Fix Employee Report Logic
emp_report_old = """  filteredOrders.forEach(o => {
    const empId = o.employee_id || o.stylist_id;
    if (!empId) return;

    if (!employeeSummary[empId]) {
      employeeSummary[empId] = {
        id: empId,
        name: o.employee_name || o.stylist_name || "Unknown Stylist",
        phone: "",
        total_clients: 0,
        total_services: 0,
        service_amount: 0,
        service_commission: 0,
        total_products: 0,
        product_amount: 0,
        product_commission: 0,
        package_commission: 0,
        member_commission: 0,
        total_membership: 0,
        membership_amount: 0,
        total_packages: 0,
        package_amount: 0,
        actual_amount: 0,
        discount: 0,
        total_amount: 0
      };
    }

    const summary = employeeSummary[empId];
    summary.total_clients += 1;
    summary.discount += (o.discount || 0);
    summary.total_amount += (o.total || 0);

    o.items?.forEach(it => {
      const price = (it.price || 0) * (it.quantity || 1);
      if (it.type === "product") {
        summary.total_products += (it.quantity || 1);
        summary.product_amount += price;
      } else if (it.type === "package") {
        summary.total_packages += (it.quantity || 1);
        summary.package_amount += price;
      } else if (it.type === "membership") {
        summary.total_membership += (it.quantity || 1);
        summary.membership_amount += price;
      } else {
        summary.total_services += (it.quantity || 1);
        summary.service_amount += price;
      }
    });
  });"""

emp_report_new = """  filteredOrders.forEach(o => {
    const orderTopEmpId = o.employee_id || o.stylist_id;
    const employeesOnOrder = new Set();
    
    // Top-level discount / total attribution fallback
    if (orderTopEmpId && !employeeSummary[orderTopEmpId]) {
      employeeSummary[orderTopEmpId] = {
        id: orderTopEmpId, name: o.employee_name || o.stylist_name || "Unknown Stylist", phone: "",
        total_clients: 0, total_services: 0, service_amount: 0, service_commission: 0,
        total_products: 0, product_amount: 0, product_commission: 0, package_commission: 0, member_commission: 0,
        total_membership: 0, membership_amount: 0, total_packages: 0, package_amount: 0,
        actual_amount: 0, discount: 0, total_amount: 0
      };
    }
    if (orderTopEmpId) {
      employeeSummary[orderTopEmpId].discount += (o.discount || 0);
      employeeSummary[orderTopEmpId].total_amount += (o.total || 0);
    }

    o.items?.forEach(it => {
      let itemEmpId = it.service_provider_id;
      if (!itemEmpId && it.service_provider) {
        // Fallback if ID wasn't explicitly saved
        const matched = employees.find(e => e.id === it.service_provider || e.name === it.service_provider);
        if (matched) itemEmpId = matched.id;
      }
      if (!itemEmpId) itemEmpId = orderTopEmpId;
      if (!itemEmpId) return;

      if (!employeeSummary[itemEmpId]) {
        const empRec = employees.find(e => e.id === itemEmpId);
        employeeSummary[itemEmpId] = {
          id: itemEmpId,
          name: empRec ? empRec.name : (it.service_provider || o.employee_name || o.stylist_name || "Unknown Stylist"),
          phone: "",
          total_clients: 0, total_services: 0, service_amount: 0, service_commission: 0,
          total_products: 0, product_amount: 0, product_commission: 0, package_commission: 0, member_commission: 0,
          total_membership: 0, membership_amount: 0, total_packages: 0, package_amount: 0,
          actual_amount: 0, discount: 0, total_amount: 0
        };
      }

      const summary = employeeSummary[itemEmpId];
      if (!employeesOnOrder.has(itemEmpId)) {
        summary.total_clients += 1;
        employeesOnOrder.add(itemEmpId);
      }

      const price = (it.price || 0) * (it.quantity || 1);
      if (it.type === "product") {
        summary.total_products += (it.quantity || 1);
        summary.product_amount += price;
      } else if (it.type === "package") {
        summary.total_packages += (it.quantity || 1);
        summary.package_amount += price;
      } else if (it.type === "membership") {
        summary.total_membership += (it.quantity || 1);
        summary.membership_amount += price;
      } else {
        summary.total_services += (it.quantity || 1);
        summary.service_amount += price;
      }
    });
  });"""

content = content.replace(emp_report_old, emp_report_new)

# 2. Fix Job Card Logic
job_card_old = """  // 3. JOB CARD REPORT
  const jobCardOrders = filteredOrders.filter(o => {
    if (!jobCardProviderId) return true;
    return (o.employee_id === jobCardProviderId) || (o.stylist_id === jobCardProviderId);
  });

  let jServicesQty = 0; let jServicesPrice = 0;
  let jProductsQty = 0; let jProductsPrice = 0;
  let jPackagesQty = 0; let jPackagesPrice = 0;
  let jMembershipsQty = 0; let jMembershipsPrice = 0;

  const serviceListItems = [];
  jobCardOrders.forEach(o => {
    o.items?.forEach(it => {
      const price = (it.price || 0) * (it.quantity || 1);
      if (it.type === "product") {
        jProductsQty += (it.quantity || 1);
        jProductsPrice += price;
      } else if (it.type === "package") {
        jPackagesQty += (it.quantity || 1);
        jPackagesPrice += price;
      } else if (it.type === "membership") {
        jMembershipsQty += (it.quantity || 1);
        jMembershipsPrice += price;
      } else {
        jServicesQty += (it.quantity || 1);
        jServicesPrice += price;
      }

      serviceListItems.push({
        client: o.full_name || o.user_name || "Unknown",
        item: it.name,
        price: price
      });
    });
  });"""

job_card_new = """  // 3. JOB CARD REPORT
  let jServicesQty = 0; let jServicesPrice = 0;
  let jProductsQty = 0; let jProductsPrice = 0;
  let jPackagesQty = 0; let jPackagesPrice = 0;
  let jMembershipsQty = 0; let jMembershipsPrice = 0;

  const serviceListItems = [];
  filteredOrders.forEach(o => {
    o.items?.forEach(it => {
      let itemEmpId = it.service_provider_id;
      if (!itemEmpId && it.service_provider) {
        const matched = employees.find(e => e.id === it.service_provider || e.name === it.service_provider);
        if (matched) itemEmpId = matched.id;
      }
      if (!itemEmpId) itemEmpId = o.employee_id || o.stylist_id;
      
      if (jobCardProviderId && itemEmpId !== jobCardProviderId) return;

      const price = (it.price || 0) * (it.quantity || 1);
      if (it.type === "product") {
        jProductsQty += (it.quantity || 1);
        jProductsPrice += price;
      } else if (it.type === "package") {
        jPackagesQty += (it.quantity || 1);
        jPackagesPrice += price;
      } else if (it.type === "membership") {
        jMembershipsQty += (it.quantity || 1);
        jMembershipsPrice += price;
      } else {
        jServicesQty += (it.quantity || 1);
        jServicesPrice += price;
      }

      serviceListItems.push({
        client: o.full_name || o.user_name || "Unknown",
        item: it.name,
        price: price
      });
    });
  });"""

content = content.replace(job_card_old, job_card_new)

with open("frontend/src/pages/Admin.jsx", "w") as f:
    f.write(content)
