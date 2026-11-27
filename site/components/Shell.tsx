import type { ReactNode } from "react";
import { sections, sectionForPath } from "@/lib/nav";
import type { DocPage } from "@/lib/content";
import { MenuToggle } from "@/components/MenuToggle";
import { SearchForm } from "@/components/SearchForm";
import { SearchShortcut } from "@/components/SearchShortcut";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Shell({
  path,
  sidebar,
  children,
  wide = false,
  headerSearch = true,
}: {
  path: string;
  sidebar?: DocPage[];
  children: ReactNode;
  wide?: boolean;
  headerSearch?: boolean;
}) {
  const current = sectionForPath(path);
  const showSidebar = Boolean(sidebar && sidebar.length);

  return (
    <>
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      <SearchShortcut />
      <header className="header">
        <MenuToggle />
        <a className="brand" href="/">
          <span className="brand-name">Talaria</span>
          <span className="brand-docs">Docs</span>
        </a>
        <nav className="nav-sections" aria-label="Documentation sections">
          {sections.map((s) => (
            <a key={s.id} href={s.href} className={current?.id === s.id ? "active" : undefined}>
              {s.title}
            </a>
          ))}
        </nav>
        <div className="header-tools">
          {headerSearch ? (
            <>
              <SearchForm compact defaultQuery="" />
              <a className="icon-btn search-link" href="/search/" aria-label="Search the docs">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              </a>
            </>
          ) : null}
          <a className="header-link" href="https://one.newtalaria.com">Dashboard</a>
          <ThemeToggle />
        </div>
      </header>
      <div className={showSidebar ? "frame" : "frame no-sidebar"}>
        <aside className="sidebar" id="docs-sidebar">
          <nav className="sidebar-sections" aria-label="All sections">
            {sections.map((s) => (
              <a key={s.id} href={s.href} className={current?.id === s.id ? "active" : undefined}>{s.title}</a>
            ))}
          </nav>
          {showSidebar ? (
            <>
              <p className="sidebar-title">{current?.title ?? "Pages"}</p>
              <nav aria-label="Section pages">
                {(() => {
                  const all = sidebar!;
                  const slugs = new Set(all.map((p) => p.slug));
                  const parentOf = (slug: string): string | null => {
                    const parts = slug.split("/");
                    while (parts.length > 1) {
                      parts.pop();
                      const s = parts.join("/");
                      if (slugs.has(s)) return s;
                    }
                    return null;
                  };
                  const here = path.replace(/^\/+|\/+$/g, "");
                  const inside = (slug: string) => here === slug || here.startsWith(`${slug}/`);
                  const chain = (slug: string) => {
                    const out: string[] = [];
                    for (let p = parentOf(slug); p && p !== current?.id; p = parentOf(p)) out.push(p);
                    return out;
                  };
                  const collapse = current?.id === "sdk";
                  const label = (p: DocPage) => {
                    if (p.slug === current?.id) return "Overview";
                    const parent = parentOf(p.slug);
                    const pt = parent && parent !== current?.id ? all.find((x) => x.slug === parent)?.title : undefined;
                    if (!pt || !p.title.startsWith(`${pt} `)) return p.title;
                    const rest = p.title.slice(pt.length + 1);
                    return rest.charAt(0).toUpperCase() + rest.slice(1);
                  };
                  return all
                    .filter((p) => !collapse || chain(p.slug).every(inside))
                    .map((p) => {
                      const active = here === p.slug;
                      const depth = Math.min(chain(p.slug).length, 2);
                      const cls = [active ? "active" : "", depth ? `depth-${depth}` : ""].join(" ").trim();
                      return (
                        <a key={p.slug} href={`/${p.slug}/`} className={cls || undefined} aria-current={active ? "page" : undefined}>
                          {label(p)}
                        </a>
                      );
                    });
                })()}
              </nav>
            </>
          ) : null}
        </aside>
        <main className="main" id="content">
          <div className={wide ? "article article-wide" : "article"}>{children}</div>
        </main>
      </div>
      <footer className="footer">
        <nav aria-label="Talaria">
          <a href="https://www.newtalaria.com">Talaria</a>
          <a href="https://www.newtalaria.com/pricing">Pricing</a>
          <a href="https://one.newtalaria.com">Open the dashboard</a>
        </nav>
      </footer>
    </>
  );
}
