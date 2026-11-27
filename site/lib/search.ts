import { sectionForPath, sections } from "@/lib/nav";
import { platformById } from "@/lib/platforms";

export function looksLikeKey(query: string): boolean {
  return /\btal_(pk|sk|mon|org)_/.test(query);
}

/** Trim a Pagefind excerpt so it starts at the first <mark>. */
export function startExcerptAtMatch(excerpt: string): string {
  const i = excerpt.indexOf("<mark>");
  if (i <= 0) return excerpt;
  const trimmed = excerpt.slice(i).trim();
  return trimmed.startsWith("<mark>") ? `…${trimmed}` : trimmed;
}

export function pathFromUrl(url: string): string {
  try {
    const u = url.startsWith("http") ? new URL(url) : new URL(url, "https://docs.newtalaria.com");
    return u.pathname;
  } catch {
    return url;
  }
}

export function sectionTitleForUrl(url: string): string {
  const pathname = pathFromUrl(url);
  if (pathname === "/" || pathname === "") return "Home";
  return sectionForPath(pathname)?.title ?? "Docs";
}

export const sectionOrder = ["Home", ...sections.map((s) => s.title), "Docs"];

export type SearchHit = { url: string; title: string; excerpt: string; score?: number };

export function groupHits(hits: SearchHit[]): { title: string; hits: SearchHit[] }[] {
  const buckets = new Map<string, SearchHit[]>();
  for (const hit of hits) {
    const title = sectionTitleForUrl(hit.url);
    const list = buckets.get(title) ?? [];
    list.push(hit);
    buckets.set(title, list);
  }
  return sectionOrder.filter((t) => buckets.has(t)).map((title) => ({ title, hits: buckets.get(title)! }));
}

export function boostByPlatform(hits: SearchHit[], platformId: string | null | undefined): SearchHit[] {
  const href = platformById(platformId)?.href;
  if (!href) return hits;
  const prefix = href.replace(/\/$/, "");
  return [...hits].sort((a, b) => {
    const as = pathFromUrl(a.url).replace(/\/$/, "").startsWith(prefix) ? 1 : 0;
    const bs = pathFromUrl(b.url).replace(/\/$/, "").startsWith(prefix) ? 1 : 0;
    return bs - as;
  });
}
