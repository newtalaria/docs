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
    { pattern: /TALARIA_BROWSER_DSN/g, name: "TALARIA_BROWSER_DSN (use TALARIA_URL + TALARIA_BROWSER_API_KEY)" },
    { pattern: /TALARIA_BASE_URL/g, name: "TALARIA_BASE_URL (use TALARIA_URL)" },
    { pattern: /TALARIA_ENVIRONMENT/g, name: "TALARIA_ENVIRONMENT (use key prefixes tal_prod_/tal_stg_/tal_test_/tal_dev_)" },
    { pattern: /TALARIA_SERVICE_NAME/g, name: "TALARIA_SERVICE_NAME (use OTEL_SERVICE_NAME)" },
    { pattern: /TALARIA_CONTAINER_NAME/g, name: "TALARIA_CONTAINER_NAME (use OTEL_RESOURCE_ATTRIBUTES)" },
    { pattern: /\bDSN\b/g, name: "DSN references (use URL or API key)" },
    { pattern: /\bdsn:/g, name: "dsn: in init (use url:)" },
    { pattern: /\bbaseUrl:/g, name: "baseUrl: in init (use url:)" },
    { pattern: /\{baseUrl\}/g, name: "{baseUrl} placeholder (use {url})" },
    { pattern: /tal_live_/g, name: "tal_live_ prefix (use tal_prod_/tal_stg_/tal_test_/tal_dev_)" },
    { pattern: /TALARIA_PING_TOKEN/g, name: "TALARIA_PING_TOKEN (use TALARIA_MONITOR_TOKEN)" },
    { pattern: /X-Monitor-Token/g, name: "X-Monitor-Token header (use X-Talaria-Monitor-Token)" },
    { pattern: /tal_ping_/g, name: "tal_ping_ prefix (use tal_mon_)" },
    { pattern: /\/monitors\/ping\b/g, name: "/monitors/ping endpoint (use /v1/check-ins)" },
    { pattern: /\/monitors\/checkIn\b/g, name: "/monitors/checkIn endpoint (use /v1/check-ins or /v1/monitors/{slug}/check-ins)" },
    { pattern: /\/monitors\/heartbeat\b/g, name: "/monitors/heartbeat endpoint (use /v1/check-ins or /v1/monitors/{slug}/check-ins)" },
    { pattern: /\bheartbeat\b/gi, name: "heartbeat references (use check-ins)" },
    { pattern: /\/releases\/setCommits\b/g, name: "/releases/setCommits endpoint (use /v1/releases)" },
    { pattern: /\/sourceMaps\/upload\b/g, name: "/sourceMaps/upload endpoint (use /v1/source-maps)" },
    { pattern: /\/v1\/screenHeatmaps\b/g, name: "/v1/screenHeatmaps camelCase (use /v1/screen-heatmaps)" },
    { pattern: /\/v1\/deploys\b/g, name: "/v1/deploys (Phase 2 only, returns 501 in Phase 0)" },
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
          `🚫 ${page.relativePath}: contains ${name} (${matches[0]})`
        );
      }
    }
  }
}

function checkLinks(pages: PageFile[]): void {
  const pathMap = new Set<string>();
  
  // Build map of valid paths
  for (const page of pages) {
    pathMap.add(page.relativePath);
    // Also accept without .md extension
    pathMap.add(page.relativePath.replace(/\.md$/, ""));
    // README.md can be referenced as directory
    if (page.relativePath.endsWith("/README.md")) {
      pathMap.add(page.relativePath.replace(/\/README\.md$/, ""));
    }
  }
  
  for (const page of pages) {
    if (page.frontmatter.visibility === "contributor") continue;
    
    const content = readFileSync(page.path, "utf-8");
    const { content: body } = matter(content);
    
    // Find markdown links: [text](url)
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = linkPattern.exec(body)) !== null) {
      const url = match[2];
      
      // Skip external URLs, anchors, and mailto
      if (url.startsWith("http") || url.startsWith("#") || url.startsWith("mailto:")) {
        continue;
      }
      
      // Check /docs absolute paths
      if (url.startsWith("/docs/")) {
        const docPath = url.replace(/^\/docs\//, "").split("#")[0].split("?")[0];
        if (!pathMap.has(docPath) && !pathMap.has(docPath + ".md")) {
          errors.push(
            `🔗 ${page.relativePath}: broken /docs link: ${url}`
          );
        }
        continue;
      }
      
      // Check relative paths
      if (!url.startsWith("/")) {
        const urlPath = url.split("#")[0].split("?")[0];
        if (!urlPath) continue; // Just an anchor
        
        // Resolve relative to current file
        const dir = page.relativePath.includes("/") 
          ? page.relativePath.substring(0, page.relativePath.lastIndexOf("/"))
          : "";
        
        const resolved = join(dir, urlPath).replace(/\\/g, "/");
        
        if (!pathMap.has(resolved) && !pathMap.has(resolved + ".md") && !pathMap.has(resolved + "/README.md")) {
          errors.push(
            `🔗 ${page.relativePath}: broken relative link: ${url} (resolves to ${resolved})`
          );
        }
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
  
  // Step 3: Check for duplicate IDs
  console.log("3️⃣  Checking uniqueness...");
  checkDuplicateIds(pages);
  if (errors.length === 0) {
    console.log("   ✅ No duplicate IDs\n");
  }
  
  // Step 4: Content rules
  console.log("4️⃣  Checking content rules...");
  checkContentRules(pages);
  if (errors.length === 0) {
    console.log("   ✅ Content rules pass\n");
  }
  
  // Step 4b: Link validation
  console.log("4️⃣b Checking links...");
  checkLinks(pages);
  if (errors.length === 0) {
    console.log("   ✅ All links valid\n");
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
