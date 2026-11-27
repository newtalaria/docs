import GithubSlugger from "github-slugger";

export type Heading = { id: string; text: string; level: 2 | 3 };

/** Headings from Markdown, skipping fenced code. Ids match rehype-slug (github-slugger). */
export function headingsFromMarkdown(source: string): Heading[] {
  const slugger = new GithubSlugger();
  const out: Heading[] = [];
  let fence: string | null = null;
  for (const line of source.split(/\r?\n/)) {
    const fenceOpen = line.match(/^(`{3,}|~{3,})/);
    if (fenceOpen) {
      const mark = fenceOpen[1];
      if (!fence) fence = mark[0];
      else if (mark[0] === fence) fence = null;
      continue;
    }
    if (fence) continue;
    const m = line.match(/^(#{2,3})\s+(.+?)\s*#*\s*$/);
    if (!m) continue;
    const text = m[2].replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/`([^`]+)`/g, "$1").trim();
    if (!text) continue;
    out.push({ id: slugger.slug(text), text, level: m[1].length as 2 | 3 });
  }
  return out;
}
