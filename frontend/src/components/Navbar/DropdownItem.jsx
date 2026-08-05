import React from "react";
import { NavLink } from "react-router-dom";

export default function DropdownItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `block w-full text-left px-4 py-2.5 text-xs uppercase tracking-wider font-semibold rounded-lg transition-all duration-200 ${
          isActive
            ? "bg-eminence-gold text-white shadow-sm"
            : "text-gray-700 hover:bg-gray-100 hover:text-black"
        }`
      }
    >
      {label}
    </NavLink>
  );
}
