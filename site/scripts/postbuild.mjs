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

// Home twin
fs.writeFileSync(
  path.join(out, "index.md"),
  "# Set up Talaria in your app\n\nGet a first event into Talaria, then add a collector, a feature, or a fix.\n\n- [Set up with your agent](/agents/)\n- [Set up from the terminal](/cli/)\n- [JavaScript SDK](/sdk/javascript/)\n- [SiteHost containers](/guides/collectors/sitehost/)\n",
);

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

console.log("postbuild: markdown twins, Pagefind, and secret-lint ok");
