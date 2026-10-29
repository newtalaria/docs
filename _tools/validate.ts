#!/usr/bin/env tsx
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { execSync } from "node:child_process";
import matter from "gray-matter";
import { loadRegistries, validateRegistries } from "./registries.js";
import { frontmatterSchema } from "./schema.js";

const DOCS_ROOT = join(import.meta.dirname, "..");
const errors: string[] = [];
const warnings: string[] = [];

interface PageFile {
  path: string;
  relativePath: string;
  frontmatter: any;
}

function collectMarkdownFiles(dir: string, files: PageFile[] = []): PageFile[] {
  const entries = readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip underscore-prefixed directories
      if (entry.startsWith("_")) continue;
      collectMarkdownFiles(fullPath, files);
    } else if (entry.endsWith(".md") && !entry.startsWith("_")) {
      const content = readFileSync(fullPath, "utf-8");
      const { data } = matter(content);
      files.push({
        path: fullPath,
        relativePath: relative(DOCS_ROOT, fullPath),
        frontmatter: data,
      });
    }
  }
  
  return files;
}

function validatePage(page: PageFile, schema: ReturnType<typeof frontmatterSchema>): boolean {
  try {
    schema.parse(page.frontmatter);
    return true;
  } catch (error: any) {
    errors.push(`\n📄 ${page.relativePath}:`);
    if (error.errors) {
      for (const issue of error.errors) {
        errors.push(`  • ${issue.path.join(".")}: ${issue.message}`);
      }
    } else {
      errors.push(`  • ${error.message}`);
    }
    return false;
  }
}

function checkFreshnessWarnings(pages: PageFile[]): void {
  const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  
  for (const page of pages) {
    const { lastReviewed } = page.frontmatter;
    if (!lastReviewed) continue;
    
    const reviewedDate = new Date(lastReviewed).getTime();
    if (now - reviewedDate > SIX_MONTHS_MS) {
      warnings.push(
        `⏰ ${page.relativePath}: lastReviewed is > 180 days old (${lastReviewed})`
      );
    }
  }
}

function checkContentRules(pages: PageFile[]): void {
  const forbiddenPatterns = [
    { pattern: /localhost:\d+/gi, name: "localhost URLs" },
    { pattern: /harnesses\//gi, name: "internal harness paths" },
    // Match prices like "$10 per GB" but not SQL placeholders like "$1"
    { pattern: /\$\d+(?:\.\d+)?\s+(?:per|\/)\s+\w+/g, name: "hardcoded prices" },
    
    // TIS v0.2 naming standard (hard cut, no backward compat)
    { pattern: /TALARIA_DSN/g, name: "TALARIA_DSN (use TALARIA_URL)" },
    { pattern: /TALARIA_BASE_URL/g, name: "TALARIA_BASE_URL (use TALARIA_URL)" },
    { pattern: /\bdsn:/g, name: "dsn: in init (use url:)" },
    { pattern: /\bbaseUrl:/g, name: "baseUrl: in init (use url:)" },
    { pattern: /tal_live_/g, name: "tal_live_ prefix (use tal_prod_/tal_stg_/tal_test_/tal_dev_)" },
    { pattern: /TALARIA_PING_TOKEN/g, name: "TALARIA_PING_TOKEN (use TALARIA_MONITOR_TOKEN)" },
    { pattern: /X-Monitor-Token/g, name: "X-Monitor-Token header (use X-Talaria-Monitor-Token)" },
    { pattern: /tal_ping_/g, name: "tal_ping_ prefix (use tal_mon_)" },
    { pattern: /\/monitors\/ping\b/g, name: "/monitors/ping endpoint (use /v1/check-ins)" },
    { pattern: /\/monitors\/checkIn\b/g, name: "/monitors/checkIn endpoint (use /v1/check-ins or /v1/monitors/{slug}/check-ins)" },
    { pattern: /\/releases\/setCommits\b/g, name: "/releases/setCommits endpoint (use /v1/releases)" },
    { pattern: /\/sourceMaps\/upload\b/g, name: "/sourceMaps/upload endpoint (use /v1/source-maps)" },
    { pattern: /\bcheckInId\b/g, name: "checkInId (use runId)" },
    { pattern: /\bsearch_errors\b/g, name: "search_errors MCP tool (use search_issues)" },
    { pattern: /\bget_error\b/g, name: "get_error MCP tool (use get_issue)" },
    { pattern: /\bget_projects\b/g, name: "get_projects MCP tool (use list_projects)" },
    { pattern: /\bget_logs\b/g, name: "get_logs MCP tool (use search_logs)" },
    { pattern: /\bget_suspect_commits\b/g, name: "get_suspect_commits MCP tool (use list_suspect_commits)" },
    { pattern: /\bget_issue_links\b/g, name: "get_issue_links MCP tool (use list_issue_links)" },
    { pattern: /newtalaria\/source-maps@v1/g, name: "newtalaria/source-maps@v1 action (use newtalaria/release@v1)" },
    { pattern: /talaria\/sitehost\/monitors\.json/g, name: "talaria/sitehost/monitors.json (use talaria/monitors.yaml)" },
    { pattern: /api\.newtalaria\.com\/otlp/g, name: "api.newtalaria.com/otlp (use ingest.newtalaria.com/otlp)" },
  ];
  
  for (const page of pages) {
    if (page.frontmatter.visibility === "contributor") continue;
    
    const content = readFileSync(page.path, "utf-8");
    const { content: body } = matter(content);
    
    for (const { pattern, name } of forbiddenPatterns) {
      const matches = body.match(pattern);
      if (matches && matches.length > 0) {
        errors.push(
          `🚫 ${page.relativePath}: contains legacy naming: ${name}`
        );
      }
    }
  }
}

function checkDuplicateIds(pages: PageFile[]): void {
  const ids = new Map<string, string>();
  
  for (const page of pages) {
    const id = page.frontmatter.id;
    if (!id) continue;
    
    if (ids.has(id)) {
      errors.push(
        `🔁 Duplicate id "${id}":\n  • ${ids.get(id)}\n  • ${page.relativePath}`
      );
    } else {
      ids.set(id, page.relativePath);
    }
  }
}

function checkIntegrationUniqueness(pages: PageFile[]): void {
  const integrations = new Map<string, string>();
  
  for (const page of pages) {
    const integrationId = page.frontmatter.integration;
    if (!integrationId) continue;
    
    if (integrations.has(integrationId)) {
      errors.push(
        `🔁 Integration "${integrationId}" used on multiple pages:\n  • ${integrations.get(integrationId)}\n  • ${page.relativePath}`
      );
    } else {
      integrations.set(integrationId, page.relativePath);
    }
  }
}

function checkTaskPageStructure(pages: PageFile[], registries: Registries): void {
  const taskPageHeadings = registries.pageTemplates["task-page"].headings;
  
  for (const page of pages) {
    const fm = page.frontmatter;
    
    // Determine if this is a task page (v1.2 §6.0.2)
    const isTaskPage = 
      (fm.section === "guides" && fm.type === "guide") ||
      (fm.section === "deploy" && fm.type === "guide") ||
      (fm.section === "agents" && (fm.type === "guide" || fm.type === "quickstart")) ||
      (fm.section === "platforms" && (fm.type === "quickstart" || fm.type === "guide"));
    
    if (!isTaskPage) continue;
    
    const isPlatformGuide = fm.section === "platforms" && fm.type === "guide";
    
    // Check frontmatter fields (warnings only until phase 3b)
    if (!fm.outcome) {
      warnings.push(`⚠️  ${page.relativePath}: Task page missing 'outcome' field`);
    }
    if (!fm.verify) {
      warnings.push(`⚠️  ${page.relativePath}: Task page missing 'verify' field`);
    }
    if (!fm.next || fm.next.length < 2) {
      warnings.push(`⚠️  ${page.relativePath}: Task page needs 2–4 'next' page IDs`);
    }
    if (!isPlatformGuide) {
      if (!fm.timeMinutes) {
        warnings.push(`⚠️  ${page.relativePath}: Task page missing 'timeMinutes'`);
      }
      if (!fm.why) {
        warnings.push(`⚠️  ${page.relativePath}: Task page missing 'why' field`);
      }
      if (!fm.notFor || fm.notFor.length < 1) {
        warnings.push(`⚠️  ${page.relativePath}: Task page needs at least one 'notFor' entry`);
      }
      if (!fm.credentials || fm.credentials.length < 1) {
        warnings.push(`⚠️  ${page.relativePath}: Task page missing 'credentials' field`);
      }
    }
  }
}

function checkAliasCollisions(pages: PageFile[]): void {
  const aliases = new Map<string, string>();
  
  for (const page of pages) {
    const pageAliases = page.frontmatter.aliases || [];
    for (const alias of pageAliases) {
      if (aliases.has(alias)) {
        errors.push(
          `🔁 Duplicate alias "${alias}":\n  • ${aliases.get(alias)}\n  • ${page.relativePath}`
        );
      } else {
        aliases.set(alias, page.relativePath);
      }
    }
  }
}

function validateManifestFresh() {
  // For now, just check that manifest.yaml exists
  // TODO: Add proper freshness check in CI workflow
  const manifestPath = join(DOCS_ROOT, "manifest.yaml");
  try {
    readFileSync(manifestPath, "utf-8");
  } catch {
    errors.push("manifest.yaml is missing - run 'cd _tools && npm run build:manifest'");
  }
}

function main() {
  console.log("🔍 Validating Talaria docs...\n");
  
  // Step 1: Load and validate registries
  console.log("1️⃣  Loading registries...");
  const registries = loadRegistries();
  validateRegistries(registries);
  console.log("   ✅ Registries valid\n");
  
  // Step 2: Collect and validate frontmatter
  console.log("2️⃣  Validating frontmatter...");
  const pages = collectMarkdownFiles(DOCS_ROOT);
  const schema = frontmatterSchema(registries);
  
  let validCount = 0;
  for (const page of pages) {
    // Skip docs infrastructure files and root README
    if ([
      "CONTRIBUTING.md",
      "PHASE1_STATUS.md",
      "_tools/README.md",
      "_data/README.md",
      "_generated/README.md"
    ].includes(page.relativePath)) {
      continue;
    }
    
    // Root README is the docs landing page, so validate it
    if (validatePage(page, schema)) {
      validCount++;
    }
  }
  
  if (errors.length === 0) {
    console.log(`   ✅ ${validCount} pages validated\n`);
  }
  
  // Step 3: Check for duplicate IDs and aliases
  console.log("3️⃣  Checking uniqueness...");
  checkDuplicateIds(pages);
  checkAliasCollisions(pages);
  checkIntegrationUniqueness(pages);
  if (errors.length === 0) {
    console.log("   ✅ No duplicates found\n");
  }
  
  // Step 3b: Task-page structure (v1.2) - warnings only until phase 3b
  checkTaskPageStructure(pages, registries);
  
  // Step 4: Content rules
  console.log("4️⃣  Checking content rules...");
  checkContentRules(pages);
  if (errors.length === 0) {
    console.log("   ✅ Content rules pass\n");
  }
  
  // Step 5: Freshness warnings
  console.log("5️⃣  Checking freshness...");
  checkFreshnessWarnings(pages);
  if (warnings.length === 0) {
    console.log("   ✅ All pages recently reviewed\n");
  }
  
  // Step 6: Generated outputs freshness
  console.log("6️⃣  Checking generated outputs...");
  validateManifestFresh();
  // TODO: Add redirects.json freshness check in phase 2
  if (errors.length === 0) {
    console.log("   ✅ Generated outputs fresh\n");
  }
  
  // Report results
  if (warnings.length > 0) {
    console.log("\n⚠️  Warnings:");
    for (const warning of warnings) {
      console.log(warning);
    }
  }
  
  if (errors.length > 0) {
    console.error("\n❌ Validation failed:");
    for (const error of errors) {
      console.error(error);
    }
    process.exit(1);
  }
  
  console.log("\n✅ All validation checks passed!");
}

main();
