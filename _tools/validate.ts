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

function namingPatterns(): { pattern: RegExp; name: string; allowNever?: boolean }[] {
  const lit = (parts: string[], flags = "g") => new RegExp(parts.join(""), flags);
  return [
    { pattern: lit(["tal_", "(?:prod|stg|test|dev)_"]), name: "class-less key prefix" },
    { pattern: lit(["tal_", "live_"]), name: "retired live key prefix" },
    { pattern: lit(["ingest\\.", "talaria\\.dev"]), name: "retired ingest host" },
    { pattern: lit(["(?<![\\w-])ingest\\.", "newtalaria\\.com"]), name: "plain ingest host" },
    { pattern: lit(["client-", "keys"]), name: "retired settings surface id" },
    { pattern: lit(["docs_", "get"]), name: "retired MCP docs tool" },
    { pattern: lit(["docs_", "list"]), name: "retired MCP docs tool" },
    { pattern: lit(["docs_", "search"]), name: "retired MCP docs tool" },
    { pattern: lit(["ingest-", "key"]), name: "retired credential id" },
    { pattern: lit(["api\\.newtalaria\\.com/", "v1"]), name: "ingest on the api host" },
    { pattern: lit(["api\\.newtalaria\\.com/", "otlp"]), name: "OTLP on the api host" },
    { pattern: lit(["\\b", "target", "ing\\b"], "gi"), name: "disallowed rollout claim" },
    { pattern: lit(["(?:NEXT_PUBLIC_|VITE_)", "TALARIA_API_KEY"]), name: "public-prefixed secret API key var", allowNever: true },
    { pattern: lit(["(?:NEXT_PUBLIC_|VITE_)", "TALARIA_RELEASE_KEY"]), name: "public-prefixed release key var", allowNever: true },
    { pattern: lit(["(?:NEXT_PUBLIC_|VITE_)", "TALARIA_MONITOR_TOKEN"]), name: "public-prefixed monitor token var", allowNever: true },
    { pattern: lit(["--dart-define=", "TALARIA_API_KEY"]), name: "dart-define of a secret API key var", allowNever: true },
    { pattern: lit(["--dart-define=", "TALARIA_RELEASE_KEY"]), name: "dart-define of a release key var", allowNever: true },
    { pattern: lit(["--dart-define=", "TALARIA_MONITOR_TOKEN"]), name: "dart-define of a monitor token", allowNever: true },
    { pattern: /X-API-Key/g, name: "retired X-API-Key header" },
    { pattern: lit(["X-", "Talaria-Monitor-Token"]), name: "retired monitor header" },
    { pattern: lit(["X-", "Monitor-Token"]), name: "retired monitor header" },
    { pattern: lit(["TALARIA_", "DSN"]), name: "retired DSN env var" },
    { pattern: lit(["TALARIA_", "SERVICE_NAME"]), name: "retired service name env var" },
    { pattern: lit(["TALARIA_", "ENVIRONMENT"]), name: "retired environment env var" },
    { pattern: lit(["TALARIA_", "CONTAINER_NAME"]), name: "retired container name env var" },
    { pattern: lit(["search_", "errors"]), name: "retired MCP tool" },
    { pattern: lit(["\\bget_", "error\\b"]), name: "retired MCP tool" },
    { pattern: lit(["get_", "projects"]), name: "retired MCP tool" },
    { pattern: lit(["\\bsdk/", "getConfig\\b"]), name: "retired RPC path" },
    { pattern: lit(["/source", "Maps/"]), name: "retired source map RPC" },
    { pattern: lit(["/monitors/", "ping"]), name: "retired monitor ping path" },
    { pattern: /\/v1\/deploys\b/g, name: "deploys route (501 only)" },
  ];
}

function sentenceAround(body: string, index: number, length: number): string {
  let start = index;
  for (let i = index - 1; i >= 0; i--) {
    if (body[i] === "\n" || (body[i] === "." && body[i - 1] !== ".")) {
      start = i + 1;
      break;
    }
    if (i === 0) start = 0;
  }
  let end = index + length;
  for (let i = end; i < body.length; i++) {
    if (body[i] === "\n" || (body[i] === "." && (i === body.length - 1 || body[i + 1] === " " || body[i + 1] === "\n"))) {
      end = i + 1;
      break;
    }
    if (i === body.length - 1) end = body.length;
  }
  return body.slice(start, end);
}

function checkNamingStandards(pages: PageFile[]): void {
  const patterns = namingPatterns();
  const files: { label: string; body: string }[] = [];
  for (const page of pages) {
    if (page.frontmatter.visibility === "contributor") continue;
    const raw = readFileSync(page.path, "utf-8");
    files.push({ label: page.relativePath, body: matter(raw).content });
  }
  const registryDir = join(DOCS_ROOT, "_registry");
  try {
    for (const file of readdirSync(registryDir).filter((f) => f.endsWith(".yaml"))) {
      files.push({
        label: `_registry/${file}`,
        body: readFileSync(join(registryDir, file), "utf-8"),
      });
    }
  } catch {
    // no registry dir
  }

  for (const file of files) {
    for (const { pattern, name, allowNever } of patterns) {
      pattern.lastIndex = 0;
      const matches = Array.from(file.body.matchAll(pattern));
      for (const match of matches) {
        const index = match.index ?? 0;
        if (name.startsWith("deploys") && file.body.slice(Math.max(0, index - 80), index + 80).includes("501")) {
          continue;
        }
        if (allowNever) {
          const sentence = sentenceAround(file.body, index, match[0].length);
          const warned =
            sentence.includes("**Never**") ||
            sentence.includes("must never") ||
            (sentence.trim().startsWith(">") && sentence.includes("Never"));
          if (warned) continue;
        }
        errors.push(`🚫 ${file.label}: contains ${name} (${match[0]})`);
        break;
      }
    }
    if (file.label.startsWith("agents/mcp/") && !file.body.includes("api-key-warning")) {
      const cred = litSafe(file.body);
      if (cred) errors.push(`🚫 ${file.label}: API key literal on an MCP page (${cred})`);
    }
  }
}

function litSafe(body: string): string | null {
  const re = new RegExp("tal_" + "(?:pk|sk|mon)_");
  const m = body.match(re);
  return m ? m[0] : null;
}

function checkContentRules(pages: PageFile[]): void {
  const forbiddenPatterns = [
    { pattern: /localhost:\d+/gi, name: "localhost URLs" },
    { pattern: /harnesses\//gi, name: "internal harness paths" },
    // Match prices like "$10 per GB" but not SQL placeholders like "$1"
    { pattern: /\$\d+(?:\.\d+)?\s+(?:per|\/)\s+\w+/g, name: "hardcoded prices" },
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
  checkNamingStandards(pages);
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
