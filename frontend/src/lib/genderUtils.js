/**
 * Shared utilities for detecting product gender/audience.
 * Used to ensure consistency across Landing, Shop, and Admin pages.
 */

export const isProductForAccessories = (p) => {
  if (!p) return false;
  
  const audience = (p.target_audience || "").toLowerCase();
  if (audience === "accessories") return true;

  const cat = (p.category || "").toLowerCase();
  const name = (p.name || "").toLowerCase();
  
  // Specific keywords for accessories/care
  const accRegex = /\b(accessories|accessory|care|bun|patch|brush|shampoo|conditioner|serum|comb|clips|kit|gift)\b/i;
  return accRegex.test(cat) || accRegex.test(name);
};

export const isProductForMen = (p) => {
  if (!p) return false;
  if (isProductForAccessories(p)) return false; // Exclude accessories from gender tabs

  const audience = p.target_audience?.toLowerCase();
  
  // Explicit audience takes precedence
  if (audience === "men") return true;
  if (audience === "unisex") return true;
  if (audience === "women") return false;
  
  // Fallback to name/category analysis with robust regex
  const name = (p.name || "").toLowerCase();
  const cat = (p.category || "").toLowerCase();
  const desc = (p.description || "").toLowerCase();
  
  const menRegex = /\b(men|mens|male|gents|gentlemen|grooming|beard|moustache)\b/i;
  
  return menRegex.test(name) || menRegex.test(cat) || menRegex.test(desc);
};

export const isProductForWomen = (p) => {
  if (!p) return false;
  if (isProductForAccessories(p)) return false; // Exclude accessories from gender tabs

  const audience = p.target_audience?.toLowerCase();
  
  // Explicit audience takes precedence
  if (audience === "women") return true;
  if (audience === "unisex") return true;
  if (audience === "men") return false;
  
  const name = (p.name || "").toLowerCase();
  const cat = (p.category || "").toLowerCase();
  
  const isMen = isProductForMen(p);
  
  const womenRegex = /\b(women|womens|female|lady|ladies|girls)\b/i;
  if (womenRegex.test(name) || womenRegex.test(cat)) return true;

  return !isMen;
};

export const getRelevantGender = (p) => {
  if (isProductForAccessories(p)) return "Accessories";
  const isMen = isProductForMen(p);
  const isWomen = isProductForWomen(p);
  
  if (isMen && isWomen) return "Unisex";
  if (isMen) return "Men";
  return "Women";
};
