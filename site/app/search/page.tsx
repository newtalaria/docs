import type { Metadata } from "next";
import { Suspense } from "react";
import { allDocs } from "@/lib/content";
import { sections } from "@/lib/nav";
import { platforms } from "@/lib/platforms";
import { SearchPanel } from "@/components/SearchPanel";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = {
  title: "Search",
};

export default function SearchPage() {
  const pages = allDocs();
  const groups = sections
    .map((s) => ({
      title: s.title,
      pages: pages.filter((p) => p.section === s.id || p.slug === s.id || p.slug.startsWith(`${s.id}/`)),
    }))
    .filter((g) => g.pages.length);

  return (
    <Shell path="/search/" wide headerSearch={false}>
      <h1>Search</h1>
      <p className="lede">Search every page of the Talaria docs.</p>
      <div className="search-js-fallback">
        <form className="search-form" action="/search/" method="get" role="search">
          <label className="visually-hidden" htmlFor="q-nojs">
            Search the docs
          </label>
          <input id="q-nojs" type="search" name="q" placeholder="Search the docs" />
          <label className="visually-hidden" htmlFor="platform-nojs">
            Platform
          </label>
          <select id="platform-nojs" name="platform" defaultValue="">
            <option value="">Any platform</option>
            {platforms.map((plat) => (
              <option key={plat.id} value={plat.id}>
                {plat.title}
              </option>
            ))}
          </select>
          <button type="submit" className="md-btn">
            Search
          </button>
        </form>
        <p className="lede">
          Search needs JavaScript. Every page is listed below by section.
        </p>
      </div>
      <Suspense fallback={<p className="lede search-js">Loading search…</p>}>
        <SearchPanel />
      </Suspense>
      <div className="search-page-groups">
        <h2>All pages</h2>
        {groups.map((g) => (
          <section key={g.title} className="search-group">
            <h3 className="search-group-title">{g.title}</h3>
            <nav className="page-index" aria-label={g.title}>
              {g.pages.map((p) => (
                <a key={p.slug} href={`/${p.slug}/`}>
                  {p.title}
                </a>
              ))}
            </nav>
          </section>
        ))}
      </div>
    </Shell>
  );
}
