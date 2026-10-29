#!/usr/bin/env tsx
/**
 * Add frontmatter to all remaining pages
 * Covers SDK pages and any other pages missing frontmatter
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

const DOCS_ROOT = join(import.meta.dirname, "..");
const DRY_RUN = process.argv.includes("--dry-run");

const platforms = [
  "flutter", "dart", "serverpod", "javascript", "react", 
  "nextjs", "node", "php", "laravel", "silverstripe"
];

function addFrontmatter(path: string, fm: any) {
  const fullPath = join(DOCS_ROOT, path);
  if (!existsSync(fullPath)) {
    console.log(`  ⚠️  Skip: ${path} not found`);
    return false;
  }
  
  const file = readFileSync(fullPath, "utf-8");
  const parsed = matter(file);
  
  // Only add if missing or incomplete
  if (parsed.data.id && parsed.data.lastReviewed) {
    console.log(`  ✓ ${path} already has frontmatter`);
    return false;
  }
  
  // Merge
  const merged = { ...parsed.data, ...fm };
  const newContent = matter.stringify(parsed.content, merged);
  
  console.log(`  + ${path}`);
  if (!DRY_RUN) {
    writeFileSync(fullPath, newContent, "utf-8");
  }
  return true;
}

console.log("📝 Adding frontmatter to remaining pages\n");
console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}\n`);

let count = 0;

// SDK overview pages (README.md)
console.log("SDK overviews:");
for (const platform of platforms) {
  const added = addFrontmatter(`sdk/${platform}/README.md`, {
    id: `${platform}`,
    title: `${platform.charAt(0).toUpperCase() + platform.slice(1)} SDK`,
    navTitle: "Overview",
    description: `Install the Talaria ${platform} SDK and capture errors, logs, and traces from your ${platform} application.`,
    type: "quickstart",
    section: "platforms",
    platform: [platform],
    feature: [],
    order: 10,
    lastReviewed: "2026-10-29",
    owner: "docs",
  });
  if (added) count++;
}

// SDK errors pages
console.log("\nSDK errors pages:");
for (const platform of platforms) {
  const added = addFrontmatter(`sdk/${platform}/errors.md`, {
    id: `${platform}-errors`,
    title: `${platform.charAt(0).toUpperCase() + platform.slice(1)} errors, logs, and breadcrumbs`,
    navTitle: "Errors and logs",
    description: `Capture exceptions, logs, breadcrumbs, and user context in ${platform} with Talaria.`,
    type: "guide",
    section: "platforms",
    platform: [platform],
    feature: ["issues", "logs"],
    order: 20,
    lastReviewed: "2026-10-29",
    owner: "docs",
  });
  if (added) count++;
}

// Flutter navigation (special case)
console.log("\nFlutter navigation:");
const navAdded = addFrontmatter(`sdk/flutter/navigation.md`, {
  id: "flutter-navigation",
  title: "Flutter navigation and screens",
  navTitle: "Navigation",
  description: "Track screen navigation and short transactions with TalariaNavigatorObserver in Flutter.",
  type: "guide",
  section: "platforms",
  platform: ["flutter"],
  feature: ["performance"],
  order: 40,
  lastReviewed: "2026-10-29",
  owner: "docs",
});
if (navAdded) count++;

// Flutter troubleshooting
console.log("\nFlutter troubleshooting:");
const troubleAdded = addFrontmatter(`sdk/flutter/troubleshooting.md`, {
  id: "flutter-troubleshooting",
  title: "Flutter troubleshooting",
  navTitle: "Troubleshooting",
  description: "Common Flutter integration mistakes and how to verify Talaria is working correctly.",
  type: "troubleshooting",
  section: "platforms",
  platform: ["flutter"],
  feature: [],
  order: 60,
  lastReviewed: "2026-10-29",
  owner: "docs",
});
if (troubleAdded) count++;

// PHP & Silverstripe upgrade pages
console.log("\nUpgrade pages:");
for (const platform of ["php", "silverstripe"]) {
  const added = addFrontmatter(`sdk/${platform}/upgrade.md`, {
    id: `${platform}-upgrade`,
    title: `${platform.charAt(0).toUpperCase() + platform.slice(1)} upgrade guide`,
    navTitle: "Upgrade",
    description: `Upgrade the Talaria ${platform} SDK with breaking changes for major versions.`,
    type: "guide",
    section: "platforms",
    platform: [platform],
    feature: [],
    order: 70,
    lastReviewed: "2026-10-29",
    owner: "docs",
  });
  if (added) count++;
}

// Remaining guide pages
console.log("\nGuide pages:");
addFrontmatter(`guides/upload-javascript-source-maps.md`, {
  id: "upload-javascript-source-maps",
  title: "Upload JavaScript source maps",
  navTitle: "Upload source maps",
  description: "Upload minified bundle source maps in local dev and CI so stack frames show original files and line numbers.",
  type: "guide",
  section: "guides",
  platform: ["javascript", "react", "nextjs"],
  feature: ["issues"],
  order: 10,
  lastReviewed: "2026-10-29",
  owner: "docs",
  aliases: ["sdk/javascript/source-maps.md"],
  redirectFrom: ["/docs/sdk/javascript/source-maps"],
});
count++;

// SDK hub
console.log("\nSDK hub:");
addFrontmatter(`sdk/README.md`, {
  id: "sdk",
  title: "Platforms",
  navTitle: "Choose SDK",
  description: "Official Talaria SDKs for Flutter, Dart, Serverpod, JavaScript, React, Next.js, Node.js, PHP, Laravel, and Silverstripe.",
  type: "hub",
  section: "platforms",
  platform: [],
  feature: [],
  order: 10,
  lastReviewed: "2026-10-29",
  owner: "docs",
});
count++;

// Main docs landing
console.log("\nDocs landing:");
addFrontmatter(`README.md`, {
  id: "docs",
  title: "Talaria docs",
  description: "Canonical Markdown docs for humans and coding agents: install SDKs, switch on features, or let your agent set it up.",
  type: "hub",
  section: "root",
  platform: [],
  feature: [],
  order: 1,
  lastReviewed: "2026-10-29",
  owner: "docs",
});
count++;

// Migration hub (will be deleted, but add frontmatter for now)
console.log("\nMigration (to be deleted):");
addFrontmatter(`migration/README.md`, {
  id: "migration",
  title: "Migration and upgrade guides",
  description: "Upgrade guides for Talaria SDK major versions with breaking changes.",
  type: "hub",
  section: "platforms",
  platform: [],
  feature: [],
  order: 999,
  lastReviewed: "2026-10-29",
  owner: "docs",
  redirectFrom: ["/docs/migration"],
  aliases: ["migration/README.md"],
});
count++;

console.log(`\n✅ Added frontmatter to ${count} pages\n`);
