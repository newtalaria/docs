import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type DocMeta = {
  title: string;
  description?: string;
  section?: string;
  order?: number;
  slug: string; // no leading/trailing slash, '' for section index? we use 'get-started'
};

export type DocPage = DocMeta & {
  body: string;
  file: string;
};

const CONTENT = path.join(process.cwd(), "content");

function walk(dir: string, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith(".md")) acc.push(full);
  }
  return acc;
}

function fileToSlug(file: string): string {
  const rel = path.relative(CONTENT, file).replaceAll(path.sep, "/");
  return rel.replace(/\/index\.md$/, "").replace(/\.md$/, "");
}

export function allDocs(): DocPage[] {
  return walk(CONTENT)
    .map((file) => {
      const raw = fs.readFileSync(file, "utf8");
      const { data, content } = matter(raw);
      const slug = fileToSlug(file);
      return {
        title: String(data.title ?? slug),
        description: data.description ? String(data.description) : undefined,
        section: data.section ? String(data.section) : slug.split("/")[0],
        order: typeof data.order === "number" ? data.order : 100,
        slug,
        body: content,
        file,
      };
    })
    .sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
}

export function getDoc(slug: string): DocPage | undefined {
  return allDocs().find((d) => d.slug === slug);
}

export function docsInSection(sectionId: string): DocPage[] {
  return allDocs().filter((d) => d.section === sectionId || d.slug === sectionId || d.slug.startsWith(`${sectionId}/`));
}

export function allSlugs(): string[] {
  return allDocs().map((d) => d.slug);
}
