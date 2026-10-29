#!/usr/bin/env tsx
/**
 * Rename SDK slugs: instrumentation → tracing, best-practices → configuration
 * Per IA_SPEC v1.1 §3.3 rows 18-59
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

const DOCS_ROOT = join(import.meta.dirname, "..");
const DRY_RUN = process.argv.includes("--dry-run");

const platforms = [
  "flutter", "dart", "serverpod", "javascript", "react", 
  "nextjs", "node", "php", "laravel", "silverstripe"
];

const renames = [
  { from: "instrumentation.md", to: "tracing.md", type: "guide" },
  { from: "best-practices.md", to: "configuration.md", type: "guide" },
];

function exec(cmd: string) {
  console.log(`  $ ${cmd}`);
  if (!DRY_RUN) {
    execSync(cmd, { cwd: DOCS_ROOT, stdio: "inherit" });
  }
}

function addFrontmatter(path: string, fm: any) {
  const fullPath = join(DOCS_ROOT, path);
  if (!existsSync(fullPath)) {
    console.log(`  ⚠️  Skip: ${path} does not exist`);
    return;
  }
  
  const file = readFileSync(fullPath, "utf-8");
  const parsed = matter(file);
  
  // Merge, giving priority to new frontmatter
  const merged = { ...parsed.data, ...fm };
  
  // Ensure arrays
  if (merged.aliases && !Array.isArray(merged.aliases)) {
    merged.aliases = [merged.aliases];
  }
  if (merged.redirectFrom && !Array.isArray(merged.redirectFrom)) {
    merged.redirectFrom = [merged.redirectFrom];
  }
  
  const newContent = matter.stringify(parsed.content, merged);
  
  if (!DRY_RUN) {
    writeFileSync(fullPath, newContent, "utf-8");
  }
}

console.log("🔄 Renaming SDK slugs per IA_SPEC v1.1\n");
console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}\n`);

let count = 0;

for (const platform of platforms) {
  console.log(`\n${platform}:`);
  
  for (const rename of renames) {
    const oldPath = `sdk/${platform}/${rename.from}`;
    const newPath = `sdk/${platform}/${rename.to}`;
    const oldUrl = `/docs/sdk/${platform}/${rename.from.replace(".md", "")}`;
    const newUrl = `/docs/sdk/${platform}/${rename.to.replace(".md", "")}`;
    
    const fullOldPath = join(DOCS_ROOT, oldPath);
    
    if (existsSync(fullOldPath)) {
      console.log(`  ${rename.from} → ${rename.to}`);
      exec(`git mv ${oldPath} ${newPath}`);
      
      // Add frontmatter with aliases and redirectFrom
      const slug = rename.to.replace(".md", "");
      const oldSlug = rename.from.replace(".md", "");
      
      addFrontmatter(newPath, {
        id: `${platform}-${slug}`,
        navTitle: slug === "tracing" ? "Tracing" : "Configuration",
        type: rename.type,
        section: "platforms",
        platform: [platform],
        feature: slug === "tracing" ? [] : ["analytics", "feature-flags"],
        order: slug === "tracing" ? 30 : 50,
        lastReviewed: "2026-10-29",
        owner: "docs",
        aliases: [`sdk/${platform}/${rename.from}`],
        redirectFrom: [oldUrl],
      });
      
      count++;
    } else {
      console.log(`  ⚠️  Skip: ${oldPath} not found`);
    }
  }
}

console.log(`\n✅ Renamed ${count} SDK files\n`);
