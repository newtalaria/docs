#!/usr/bin/env node
/**
 * Fail if a Talaria secret-shaped key appears in the static export or content.
 * Placeholders (ellipsis, angle-bracket tokens, YOUR_, PLACEHOLDER) are allowed.
 */
import fs from "node:fs";
import path from "node:path";

const roots = process.argv.slice(2);
const targets = roots.length ? roots : ["out", "content"];
const KEY = /tal_(sk|mon)_[A-Za-z0-9_<>…·.-]*/g;
const PLACEHOLDER = /[…<>]|YOUR_|PLACEHOLDER|example/i;

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

const hits = [];
for (const root of targets) {
  for (const file of walk(root)) {
    if (!/\.(html|md|js|txt|json|xml|css|mjs|ts|tsx|yaml|yml)$/.test(file)) continue;
    const text = fs.readFileSync(file, "utf8");
    for (const match of text.matchAll(KEY)) {
      if (PLACEHOLDER.test(match[0])) continue;
      // tal_sk_ or tal_sk_dev without a secret body is still a name, not a key
      if (/^tal_(sk|mon)_$/.test(match[0])) continue;
      if (/^tal_(sk|mon)_(env|cell|dev|live|prod)?_?$/.test(match[0])) continue;
      hits.push(`${file}: ${match[0]}`);
    }
  }
}

if (hits.length) {
  console.error("secret-lint: secret-shaped strings found:\n" + hits.join("\n"));
  process.exit(1);
}
console.log("secret-lint: ok");
