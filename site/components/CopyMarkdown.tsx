"use client";
import { useEffect, useRef, useState } from "react";
export function CopyMarkdown({ href }: { href: string }) {
  const [label, setLabel] = useState("Copy as Markdown");
  const cached = useRef<string | null>(null);
  useEffect(() => {
    fetch(href).then((r) => (r.ok ? r.text() : null)).then((t) => { cached.current = t; }).catch(() => {});
  }, [href]);
  const done = (ok: boolean) => { setLabel(ok ? "Copied" : "Copy failed"); setTimeout(() => setLabel("Copy as Markdown"), 2000); };
  return (
    <span className="md-actions">
      <button type="button" className="md-btn" aria-live="polite" onClick={async () => {
        try {
          if (cached.current !== null) await navigator.clipboard.writeText(cached.current);
          else await navigator.clipboard.write([new ClipboardItem({ "text/plain": fetch(href).then((r) => r.text()).then((t) => new Blob([t], { type: "text/plain" })) })]);
          done(true);
        } catch { done(false); }
      }}>{label}</button>
      <a href={href}>View as Markdown</a>
    </span>
  );
}
