"use client";
import { useState } from "react";
export function CopyMarkdown({ href }: { href: string }) {
  const [label, setLabel] = useState("Copy as Markdown");
  return (
    <span className="md-actions">
      <button type="button" className="md-btn" aria-live="polite" onClick={async () => {
        try { await navigator.clipboard.writeText(await (await fetch(href)).text()); setLabel("Copied"); }
        catch { setLabel("Copy failed"); }
        setTimeout(() => setLabel("Copy as Markdown"), 2000);
      }}>{label}</button>
      <a href={href}>View as Markdown</a>
    </span>
  );
}
