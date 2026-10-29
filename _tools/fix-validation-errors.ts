#!/usr/bin/env tsx
/**
 * Fix validation errors:
 * 1. Remove legacy sdk: field from all pages
 * 2. Fix alias paths (remove leading slashes where needed)
 * 3. Remove localhost URLs and prices from content
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

const DOCS_ROOT = join(import.meta.dirname, "..");

function processFile(path: string): boolean {
  const fullPath = join(DOCS_ROOT, path);
  if (!existsSync(fullPath)) return false;
  
  const file = readFileSync(fullPath, "utf-8");
  const parsed = matter(file);
  let changed = false;
  
  // Remove legacy sdk: field
  if ('sdk' in parsed.data) {
    delete parsed.data.sdk;
    changed = true;
    console.log(`  Removed sdk: from ${path}`);
  }
  
  // Fix invalid tag in project-settings
  if (path === "get-started/project-settings.md" && parsed.data.tags) {
    parsed.data.tags = parsed.data.tags.filter((t: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(t));
    changed = true;
  }
  
  // Remove localhost URLs from content
  let content = parsed.content;
  if (content.includes("localhost:")) {
    content = content.replace(/localhost:\d+/g, "{{mcpUrl}}");
    changed = true;
    console.log(`  Removed localhost from ${path}`);
  }
  
  // Remove hardcoded prices from content
  if (content.match(/\$\d+(?:\.\d+)?(?:\s*(?:per|\/)\s*\w+)?/)) {
    // Link to /pricing instead
    content = content.replace(/\$\d+(?:\.\d+)?\s*per\s+GB/, "See [pricing](/pricing) for storage costs");
    content = content.replace(/\$1\s*per\s+(\w+)/, "Paid plans only");
    changed = true;
    console.log(`  Removed prices from ${path}`);
  }
  
  // Remove harness paths
  if (content.includes("harnesses/")) {
    content = content.replace(/harnesses\/[^\s),]+/g, "");
    changed = true;
    console.log(`  Removed harness paths from ${path}`);
  }
  
  if (changed) {
    const newFile = matter.stringify(content, parsed.data);
    writeFileSync(fullPath, newFile, "utf-8");
    return true;
  }
  
  return false;
}

function walkDir(dir: string, files: string[] = []): string[] {
  const entries = readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const relativePath = fullPath.replace(DOCS_ROOT + "/", "");
    
    if (entry.startsWith("_") || entry === "PHASE1_STATUS.md" || entry === "CONTRIBUTING.md") continue;
    
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath, files);
    } else if (entry.endsWith(".md")) {
      files.push(relativePath);
    }
  }
  
  return files;
}

console.log("🔧 Fixing validation errors\n");

const files = walkDir(DOCS_ROOT);
let fixed = 0;

for (const file of files) {
  if (processFile(file)) {
    fixed++;
  }
}

console.log(`\n✅ Fixed ${fixed} files\n`);
