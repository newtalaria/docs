import type { Metadata } from "next";
import { Suspense } from "react";
import { allDocs } from "@/lib/content";
import { SearchPanel } from "@/components/SearchPanel";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = {
  title: "Search",
};

export default function SearchPage() {
  const pages = allDocs();

  return (
    <Shell path="/search/" wide headerSearch={false}>
      <h1>Search</h1>
      <p className="lede">
        Search every page of the Talaria docs.
      </p>
      <noscript>
        <form className="search-form" action="/search/" method="get" role="search">
          <input type="search" name="q" placeholder="Search the docs" />
        </form>
        <p className="lede">Search needs JavaScript. Every page is listed below.</p>
      </noscript>
      <Suspense fallback={<p className="lede">Loading search…</p>}>
        <SearchPanel />
      </Suspense>
      <h2>All pages</h2>
      <nav className="page-index" aria-label="All documentation pages">
        {pages.map((p) => (
          <a key={p.slug} href={`/${p.slug}/`}>
            {p.title}
          </a>
        ))}
      </nav>
    </Shell>
  );
}
