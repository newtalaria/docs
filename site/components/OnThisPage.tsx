import type { Heading } from "@/lib/headings";

export function OnThisPage({ headings }: { headings: Heading[] }) {
  if (headings.length < 2) return null;
  return (
    <nav className="toc" aria-label="On this page">
      <p className="toc-title">On this page</p>
      <ol>
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "toc-h3" : undefined}>
            <a href={`#${h.id}`}>{h.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
