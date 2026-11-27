"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/headings";

function TocLinks({ headings, active }: { headings: Heading[]; active: string | null }) {
  return (
    <ol>
      {headings.map((h) => (
        <li key={h.id} className={h.level === 3 ? "toc-h3" : undefined}>
          <a href={`#${h.id}`} className={active === h.id ? "is-active" : undefined}>
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

function useActiveHeading(ids: string[]) {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);
  useEffect(() => {
    if (ids.length === 0) return;
    const visible = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target.id) visible.set(entry.target.id, entry.isIntersecting);
        }
        const current = ids.find((id) => visible.get(id));
        if (current) setActive(current);
      },
      { rootMargin: "-52px 0px -70% 0px", threshold: 0 },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids.join(" ")]);
  return active;
}

export function OnThisPage({ headings }: { headings: Heading[] }) {
  const ids = headings.map((h) => h.id);
  const active = useActiveHeading(ids);
  if (headings.length < 2) return null;
  return (
    <nav className="toc" aria-label="On this page">
      <p className="toc-title">On this page</p>
      <TocLinks headings={headings} active={active} />
    </nav>
  );
}

export function MobileOnThisPage({ headings }: { headings: Heading[] }) {
  const ids = headings.map((h) => h.id);
  const active = useActiveHeading(ids);
  if (headings.length < 2) return null;
  return (
    <details className="toc-mobile">
      <summary>On this page</summary>
      <nav className="toc-mobile-nav" aria-label="On this page">
        <TocLinks headings={headings} active={active} />
      </nav>
    </details>
  );
}
