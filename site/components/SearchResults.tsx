"use client";

import { useEffect, useState } from "react";
import { boostByPlatform, groupHits, looksLikeKey, startExcerptAtMatch, type SearchHit } from "@/lib/search";

async function loadPagefind(): Promise<{
  options: (opts: { excerptLength: number }) => Promise<void>;
  search: (q: string) => Promise<{
    results: Array<{
      data: () => Promise<{ url: string; meta?: { title?: string }; excerpt?: string }>;
    }>;
  }>;
}> {
  const href = `${window.location.origin}/pagefind/pagefind.js`;
  return import(/* webpackIgnore: true */ href);
}

export function SearchResults({
  query,
  platform,
  variant = "page",
  onHits,
}: {
  query: string;
  platform?: string | null;
  variant?: "page" | "dialog";
  onHits?: (count: number) => void;
}) {
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setHits([]);
      onHits?.(0);
      return;
    }
    // Key-shaped queries are never sent to analytics (none is wired).
    void looksLikeKey(query);
    let cancelled = false;
    (async () => {
      try {
        const pf = await loadPagefind();
        await pf.options({ excerptLength: 30 });
        const search = await pf.search(query);
        const results: SearchHit[] = [];
        for (const r of search.results.slice(0, 25)) {
          const data = await r.data();
          results.push({
            url: data.url,
            title: data.meta?.title || data.url,
            excerpt: startExcerptAtMatch(data.excerpt || ""),
          });
        }
        if (!cancelled) {
          const ranked = boostByPlatform(results, platform);
          setHits(ranked);
          onHits?.(ranked.length);
        }
      } catch {
        if (!cancelled) {
          setError(variant === "dialog" ? "Search is unavailable right now." : "Search is unavailable right now. Every page is listed below.");
          onHits?.(0);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query, platform]);

  if (error) return <div className="lede">{error}</div>;
  if (hits === null) return <p className="lede search-js">Searching…</p>;
  if (hits.length === 0) {
    return <p className={variant === "dialog" ? "search-dialog-empty" : "lede"}>No results for “{query}”. Try fewer words{variant === "dialog" ? "." : ", or browse every page below."}</p>;
  }

  const groups = groupHits(hits);
  return (
    <div className={variant === "page" ? "search-page-groups" : "search-groups"}>
      {groups.map((g) => (
        <section key={g.title} className="search-group">
          <h2 className="search-group-title">{g.title}</h2>
          <ul className="search-results">
            {g.hits.map((h) => (
              <li key={h.url}>
                <a href={h.url}>{h.title}</a>
                {h.excerpt ? <p dangerouslySetInnerHTML={{ __html: h.excerpt }} /> : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
