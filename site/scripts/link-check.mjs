#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const out = path.join(process.cwd(), "out");
if (!fs.existsSync(out)) {
  console.error("linkcheck: site/out is missing; run npm run build first");
  process.exit(1);
}

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith(".html")) acc.push(full);
  }
  return acc;
}

function existsOnSite(pathname) {
  const clean = pathname.split("?")[0].split("#")[0];
  if (!clean.startsWith("/")) return true;
  // directories use trailingSlash index.html
  const candidates = [
    path.join(out, clean.slice(1)),
    path.join(out, clean.slice(1), "index.html"),
    path.join(out, `${clean.slice(1).replace(/\/$/, "")}.html`),
    path.join(out, `${clean.slice(1).replace(/\/$/, "")}.md`),
  ];
  return candidates.some((p) => fs.existsSync(p));
}

const hrefRe = /(?:href|src)="([^"]+)"/g;
const missing = [];
for (const file of walk(out)) {
  const html = fs.readFileSync(file, "utf8");
  for (const match of html.matchAll(hrefRe)) {
    const href = match[1];
    if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("data:") || href === "#") {
      continue;
    }
    const from = "/" + path.relative(out, path.dirname(file)).replaceAll(path.sep, "/");
    const resolved = href.startsWith("/")
      ? href
      : path.posix.normalize(`${from === "/." ? "" : from}/${href}`);
    if (!existsOnSite(resolved)) {
      missing.push(`${path.relative(out, file)} -> ${href}`);
    }
  }
}

if (missing.length) {
  console.error(`linkcheck: ${missing.length} missing target(s)\n` + missing.join("\n"));
  process.exit(1);
}
console.log(`linkcheck: ok (${walk(out).length} html files)`);
