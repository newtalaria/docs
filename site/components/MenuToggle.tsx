"use client";
import { useState } from "react";
export function MenuToggle() {
  const [open, setOpen] = useState(false);
  return (
    <button type="button" className="menu-btn" aria-controls="docs-sidebar" aria-expanded={open}
      onClick={() => { const next = !open; document.getElementById("docs-sidebar")?.classList.toggle("open", next); setOpen(next); }}>
      {open ? "Close" : "Menu"}
    </button>
  );
}
