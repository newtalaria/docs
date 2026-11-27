"use client";

import { useEffect, useState } from "react";

type Hit = { url: string; title: string; excerpt: string };

async function loadPagefind(): Promise<{
  options: (opts: { excerptLength: number }) => Promise<void>;
  search: (q: string) => Promise<{ results: Array<{ data: () => Promise<{ url: string; meta?: { title?: string }; excerpt?: string }> }> }>;
}> {
  const href = `${window.location.origin}/pagefind/pagefind.js`;
  return import(/* webpackIgnore: true */ href);
}

export function SearchResults({ query }: { query: string }) {
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setHits([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const pf = await loadPagefind();
        await pf.options({ excerptLength: 30 });
        const search = await pf.search(query);
        const results: Hit[] = [];
        for (const r of search.results.slice(0, 25)) {
          const data = await r.data();
          results.push({
            url: data.url,
            title: data.meta?.title || data.url,
            excerpt: data.excerpt || "",
          });
        }
        if (!cancelled) setHits(results);
      } catch {
        if (!cancelled) {
          setError("Search is unavailable right now. Every page is listed below.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query]);

  if (error) return <div className="lede">{error}</div>;
  if (hits === null) return <p className="lede">Searching…</p>;
  if (hits.length === 0) return <p className="lede">No results for “{query}”. Try fewer words, or browse every page below.</p>;

  return (
    <ul className="search-results">
      {hits.map((h) => (
        <li key={h.url}>
          <a href={h.url}>{h.title}</a>
          <p dangerouslySetInnerHTML={{ __html: h.excerpt }} />
        </li>
      ))}
    </ul>
  );
}
