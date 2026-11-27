#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import matter from "gray-matter";

const root = process.cwd();
const out = path.join(root, "out");
const content = path.join(root, "content");

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith(".md")) acc.push(full);
  }
  return acc;
}

if (!fs.existsSync(out)) {
  console.error("postbuild: site/out is missing; run next build first");
  process.exit(1);
}

// Markdown twins at the page URL: /sdk/javascript.md
for (const file of walk(content)) {
  const rel = path.relative(content, file).replaceAll(path.sep, "/");
  const slug = rel.replace(/\/index\.md$/, "").replace(/\.md$/, "");
  const dest = path.join(out, `${slug}.md`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const raw = fs.readFileSync(file, "utf8");
  const { data, content: body } = matter(raw);
  const title = data.title ? `# ${data.title}\n\n` : "";
  fs.writeFileSync(dest, title + body.trim() + "\n");
  fs.chmodSync(dest, 0o644);
}

// Home twin (keep in sync with site/lib/home.md and app/page.tsx)
const homeMd = fs.readFileSync(path.join(root, "lib/home.md"), "utf8").trim() + "\n";
fs.writeFileSync(path.join(out, "index.md"), homeMd);
fs.chmodSync(path.join(out, "index.md"), 0o644);

// llms.txt, llms-full.txt, docs.manifest.json
const pages = [];
for (const file of walk(content)) {
  const rel = path.relative(content, file).replaceAll(path.sep, "/");
  const slug = rel.replace(/\/index\.md$/, "").replace(/\.md$/, "");
  const raw = fs.readFileSync(file, "utf8");
  const { data, content: body } = matter(raw);
  const title = String(data.title ?? slug);
  const description = data.description ? String(data.description) : "";
  const mdPath = `/${slug}.md`;
  const htmlPath = `/${slug}/`;
  pages.push({ slug, title, description, mdPath, htmlPath, body: (data.title ? `# ${title}\n\n` : "") + body.trim() + "\n" });
}
pages.sort((a, b) => a.slug.localeCompare(b.slug));

const origin = "https://docs.newtalaria.com";
const llms = [
  "# Talaria documentation",
  "",
  "> Official documentation for Talaria SDKs, collectors, the CLI, and MCP.",
  "",
  "Each page has a Markdown twin at the same path with a `.md` suffix. Concatenated corpus: [llms-full.txt](https://docs.newtalaria.com/llms-full.txt).",
  "",
  "## Docs",
  "",
  `- [Set up Talaria in your app](${origin}/index.md): Get a first event into Talaria, then add a collector, a feature, or a fix.`,
  ...pages.map((p) => `- [${p.title}](${origin}${p.mdPath}): ${p.description}`.replace(/: $/, "")),
  "",
].join("\n");
fs.writeFileSync(path.join(out, "llms.txt"), llms);
fs.chmodSync(path.join(out, "llms.txt"), 0o644);

const fullParts = [homeMd, ...pages.map((p) => p.body)];
fs.writeFileSync(path.join(out, "llms-full.txt"), fullParts.join("\n---\n\n"));
fs.chmodSync(path.join(out, "llms-full.txt"), 0o644);

fs.writeFileSync(
  path.join(out, "docs.manifest.json"),
  JSON.stringify(
    {
      origin,
      pages: [
        { path: "/", title: "Set up Talaria in your app", md: "/index.md" },
        ...pages.map((p) => ({ path: p.htmlPath, title: p.title, description: p.description, md: p.mdPath })),
      ],
    },
    null,
    2,
  ) + "\n",
);
fs.chmodSync(path.join(out, "docs.manifest.json"), 0o644);

const pf = spawnSync(
  "npx",
  ["--no-install", "pagefind", "--site", "out", "--output-path", "out/pagefind"],
  { stdio: "inherit", cwd: root },
);
if (pf.status !== 0) {
  console.error("postbuild: pagefind failed");
  process.exit(pf.status ?? 1);
}

const lint = spawnSync("node", ["scripts/secret-lint.mjs", "out", "content"], {
  stdio: "inherit",
  cwd: root,
});
if (lint.status !== 0) process.exit(lint.status ?? 1);

console.log("postbuild: markdown twins, llms.txt, Pagefind, and secret-lint ok");
