"use client";
import { useEffect } from "react";
export function SearchShortcut() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      const hit = (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing);
      if (!hit) return;
      e.preventDefault();
      const field = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="search"][name="q"]')).find((f) => f.offsetParent !== null);
      if (field) { field.focus(); field.select(); } else { window.location.href = "/search/"; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
