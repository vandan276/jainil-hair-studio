import React, { createContext, useContext, useEffect, useState } from "react";

const CartCtx = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("eminence_cart") || "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("eminence_cart", JSON.stringify(items));
  }, [items]);

  const add = (product, qty = 1) => {
    setItems((prev) => {
      const ex = prev.find((p) => p.id === product.id);
      if (ex) return prev.map((p) => p.id === product.id ? { ...p, quantity: p.quantity + qty } : p);
      return [...prev, { ...product, quantity: qty }];
    });
  };

  const remove = (id) => setItems((p) => p.filter((x) => x.id !== id));
  const updateQty = (id, q) => setItems((p) => p.map((x) => x.id === id ? { ...x, quantity: Math.max(1, q) } : x));
  const clear = () => setItems([]);
  const total = items.reduce((s, x) => s + x.price * x.quantity, 0);
  const count = items.reduce((s, x) => s + x.quantity, 0);

  return (
    <CartCtx.Provider value={{ items, add, remove, updateQty, clear, total, count }}>
      {children}
    </CartCtx.Provider>
  );
}

export const useCart = () => useContext(CartCtx);
