#!/usr/bin/env tsx
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { tmpdir } from "node:os";
import { execSync } from "node:child_process";
import matter from "gray-matter";
import { loadRegistries, validateRegistries } from "./registries.js";
import { frontmatterSchema } from "./schema.js";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { buildManifest, yamlStringifyOptions } from "./build-manifest.js";

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
    // TIS v0.2 naming standard (hard cut, no backward compat)
    { pattern: /TALARIA_DSN/g, name: "TALARIA_DSN (use TALARIA_URL)" },
    { pattern: /TALARIA_BROWSER_DSN/g, name: "TALARIA_BROWSER_DSN (use TALARIA_URL + TALARIA_BROWSER_API_KEY)" },
    { pattern: /TALARIA_BASE_URL/g, name: "TALARIA_BASE_URL (use TALARIA_URL)" },
    { pattern: /TALARIA_ENVIRONMENT/g, name: "TALARIA_ENVIRONMENT (the key chooses the environment)" },
    { pattern: /TALARIA_SERVICE_NAME/g, name: "TALARIA_SERVICE_NAME (use OTEL_SERVICE_NAME)" },
    { pattern: /TALARIA_CONTAINER_NAME/g, name: "TALARIA_CONTAINER_NAME (use OTEL_RESOURCE_ATTRIBUTES)" },
    { pattern: /\bDSN\b/g, name: "DSN references (use URL or API key)" },
    { pattern: /\bdsn\b/g, name: "dsn lowercase (use url)" },
    { pattern: /\bdsn:/g, name: "dsn: in init (use url:)" },
    { pattern: /\{dsn\}/g, name: "{dsn} placeholder (use {url})" },
    { pattern: /\bbaseUrl:/g, name: "baseUrl: in init (use url:)" },
    { pattern: /\{baseUrl\}/g, name: "{baseUrl} placeholder (use {url})" },
    { pattern: /tal_live_/g, name: "retired live key prefix" },
    { pattern: /TALARIA_PING_TOKEN/g, name: "TALARIA_PING_TOKEN (use TALARIA_MONITOR_TOKEN)" },
    { pattern: /\bpingToken\b/g, name: "pingToken (use monitor-token)" },
    { pattern: /\bping token\b/gi, name: "ping token (use monitor token)" },
    { pattern: /X-Monitor-Token/g, name: "retired monitor header (use Authorization Bearer)" },
    { pattern: /tal_ping_/g, name: "tal_ping_ prefix (use tal_mon_)" },
    { pattern: /\/monitors\/ping\b/g, name: "/monitors/ping endpoint (use /v1/check-ins)" },
    { pattern: /monitors\/checkIn\b/g, name: "monitors/checkIn endpoint (use /v1/check-ins or /v1/monitors/{slug}/check-ins)" },
    { pattern: /\/monitors\/heartbeat\b/g, name: "/monitors/heartbeat endpoint (use /v1/check-ins or /v1/monitors/{slug}/check-ins)" },
    { pattern: /\bheartbeat\b/gi, name: "heartbeat references (use check-ins)" },
    { pattern: /\/releases\/setCommits\b/g, name: "/releases/setCommits endpoint (use /v1/releases)" },
    { pattern: /\/sourceMaps\/upload\b/g, name: "/sourceMaps/upload endpoint (use /v1/source-maps)" },
    { pattern: /sourceMaps\.upload\b/g, name: "sourceMaps.upload (use POST /v1/source-maps)" },
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
    { pattern: /\/otlp\/mcp\b/g, name: "/otlp/mcp (MCP stays on the api host /mcp path)" },
    { pattern: /\bk8scluster\b/g, name: "k8scluster (use k8s_cluster)" },
    { pattern: /\botlphttp\b/g, name: "otlphttp (use otlp_http)" },
    { pattern: /\/sdk\/getConfig\b/g, name: "/sdk/getConfig (don't document as route)" },
    { pattern: /\bsdk\/getConfig\b/g, name: "sdk/getConfig (describe config fetch instead)" },
    { pattern: /(NEXT_PUBLIC_|VITE_)TALARIA_API_KEY\b/g, name: "public-prefixed TALARIA_API_KEY (never use NEXT_PUBLIC_ or VITE_ with API_KEY)" },
    { pattern: /(NEXT_PUBLIC_|VITE_)TALARIA_RELEASE_KEY\b/g, name: "public-prefixed TALARIA_RELEASE_KEY (never use NEXT_PUBLIC_ or VITE_ with RELEASE_KEY)" },
    { pattern: /(NEXT_PUBLIC_|VITE_)TALARIA_DSN\b/g, name: "public-prefixed TALARIA_DSN (use BROWSER_API_KEY)" },
  ];
  
  // Check pages
  for (const page of pages) {
    if (page.frontmatter.visibility === "contributor") continue;
    
    const content = readFileSync(page.path, "utf-8");
    const { content: body } = matter(content);
    
    for (const { pattern, name } of forbiddenPatterns) {
      // Use matchAll to get all matches with their indices
      const matches = Array.from(body.matchAll(pattern));
      
      if (matches.length > 0) {
        // Allow-list warning sentences about public prefixes
        if (name.includes("public-prefixed")) {
          // Check each match individually using its actual index
          for (const match of matches) {
            const matchIndex = match.index!;
            
            // Find the sentence or line containing this match
            // Look backward to the previous sentence boundary or line start
            let sentenceStart = matchIndex;
            for (let i = matchIndex - 1; i >= 0; i--) {
              if (body[i] === '\n') {
                sentenceStart = i + 1;
                break;
              }
              if (body[i] === '.' && i > 0 && body[i - 1] !== '.') {
                sentenceStart = i + 1;
                break;
              }
              if (i === 0) {
                sentenceStart = 0;
                break;
              }
            }
            
            // Look forward to the next sentence boundary or line end
            let sentenceEnd = matchIndex + match[0].length;
            for (let i = sentenceEnd; i < body.length; i++) {
              if (body[i] === '\n') {
                sentenceEnd = i;
                break;
              }
              if (body[i] === '.' && (i === body.length - 1 || body[i + 1] === ' ' || body[i + 1] === '\n')) {
                sentenceEnd = i + 1;
                break;
              }
              if (i === body.length - 1) {
                sentenceEnd = body.length;
                break;
              }
            }
            
            const sentence = body.substring(sentenceStart, sentenceEnd);
            
            // Allow only if the same sentence/line contains "Never" or "must never"
            const isInWarning = sentence.includes("**Never**") || 
                sentence.includes("must never") ||
                (sentence.trim().startsWith(">") && (sentence.includes("Never") || sentence.includes("must never")));
            
            if (!isInWarning) {
              errors.push(
                `🚫 ${page.relativePath}: contains ${name} (${match[0]})`
              );
            }
          }
        } else if (pattern.source.includes("deploys")) {
          for (const match of matches) {
            const index = match.index ?? 0;
            if (!body.slice(Math.max(0, index - 80), index + 80).includes("501")) {
              errors.push(
                `🚫 ${page.relativePath}: contains ${name} (${match[0]})`
              );
              break;
            }
          }
        } else {
          errors.push(
            `🚫 ${page.relativePath}: contains ${name} (${matches[0][0]})`
          );
        }
      }
    }
    checkUnresolvedTemplates(page.relativePath, body);
  }
  
  // Check registry files
  const registryDir = join(DOCS_ROOT, "_registry");
  const registryFiles = readdirSync(registryDir).filter(f => f.endsWith(".yaml"));
  
  for (const file of registryFiles) {
    const content = readFileSync(join(registryDir, file), "utf-8");
    
    for (const { pattern, name } of forbiddenPatterns) {
      if (file === "snippets.yaml" && name.startsWith("dsn")) continue;
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        errors.push(
          `🚫 _registry/${file}: contains ${name} (${matches[0]})`
        );
      }
    }
    checkUnresolvedTemplates(`_registry/${file}`, content);
  }
}

const UNRESOLVED_TEMPLATE = /(?<!\$)\{\{[^}]+\}\}/g;

function checkUnresolvedTemplates(label: string, content: string): void {
  const matches = content.match(UNRESOLVED_TEMPLATE);
  if (matches && matches.length > 0) {
    errors.push(`🚫 ${label}: unresolved template (${matches[0]})`);
  }
}

function githubSlug(heading: string): string {
  return heading
    .trim()
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function headingAnchors(body: string): Set<string> {
  const withoutFences = body.replace(/```[\s\S]*?```/g, "");
  const counts = new Map<string, number>();
  const anchors = new Set<string>();
  for (const match of withoutFences.matchAll(/^#{1,6}\s+(.+)$/gm)) {
    const base = githubSlug(match[1]);
    if (!base) continue;
    const seen = counts.get(base) ?? 0;
    counts.set(base, seen + 1);
    anchors.add(seen === 0 ? base : `${base}-${seen}`);
  }
  for (const match of withoutFences.matchAll(/\bid=["']([^"']+)["']/g)) {
    anchors.add(match[1]);
  }
  for (const match of withoutFences.matchAll(/\{#([A-Za-z0-9_-]+)\}/g)) {
    anchors.add(match[1]);
  }
  return anchors;
}

function checkLinks(pages: PageFile[]): void {
  const pathMap = new Set<string>();
  const anchorsByPath = new Map<string, Set<string>>();
  
  // Build map of valid paths and heading anchors (GitHub slug rules).
  for (const page of pages) {
    pathMap.add(page.relativePath);
    pathMap.add(page.relativePath.replace(/\.md$/, ""));
    if (page.relativePath.endsWith("/README.md")) {
      pathMap.add(page.relativePath.replace(/\/README\.md$/, ""));
    }
    const { content: body } = matter(readFileSync(page.path, "utf-8"));
    anchorsByPath.set(page.relativePath, headingAnchors(body));
  }

  const resolvePage = (from: string, urlPath: string): string | null => {
    if (!urlPath) return from;
    let candidate = urlPath;
    if (urlPath.startsWith("/docs/")) {
      candidate = urlPath.replace(/^\/docs\//, "");
    } else if (urlPath.startsWith("/")) {
      return null;
    } else {
      const dir = from.includes("/") ? from.substring(0, from.lastIndexOf("/")) : "";
      candidate = join(dir, urlPath).replace(/\\/g, "/");
    }
    if (anchorsByPath.has(candidate)) return candidate;
    if (anchorsByPath.has(candidate + ".md")) return candidate + ".md";
    if (anchorsByPath.has(candidate + "/README.md")) return candidate + "/README.md";
    return null;
  };

  const checkAnchor = (from: string, url: string, target: string | null): void => {
    const hash = url.includes("#") ? url.slice(url.indexOf("#") + 1) : "";
    if (!hash || !target) return;
    let anchor = hash;
    try {
      anchor = decodeURIComponent(hash);
    } catch {
      anchor = hash;
    }
    const anchors = anchorsByPath.get(target);
    if (!anchors?.has(anchor)) {
      errors.push(
        `🔗 ${from}: broken anchor ${url} (no heading #${anchor} on ${target})`
      );
    }
  };
  
  for (const page of pages) {
    if (page.frontmatter.visibility === "contributor") continue;
    
    const content = readFileSync(page.path, "utf-8");
    const { content: body } = matter(content);
    
    // Find markdown links: [text](url)
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = linkPattern.exec(body)) !== null) {
      const url = match[2];
      
      if (url.startsWith("http") || url.startsWith("mailto:")) {
        continue;
      }

      if (url.startsWith("#")) {
        checkAnchor(page.relativePath, url, page.relativePath);
        continue;
      }
      
      // Check /docs absolute paths
      if (url.startsWith("/docs/")) {
        const docPath = url.replace(/^\/docs\//, "").split("#")[0].split("?")[0];
        if (!pathMap.has(docPath) && !pathMap.has(docPath + ".md")) {
          errors.push(
            `🔗 ${page.relativePath}: broken /docs link: ${url}`
          );
        } else {
          checkAnchor(page.relativePath, url, resolvePage(page.relativePath, docPath));
        }
        continue;
      }
      
      // Check relative paths
      if (!url.startsWith("/")) {
        const urlPath = url.split("#")[0].split("?")[0];
        if (!urlPath) {
          checkAnchor(page.relativePath, url, page.relativePath);
          continue;
        }
        
        const dir = page.relativePath.includes("/") 
          ? page.relativePath.substring(0, page.relativePath.lastIndexOf("/"))
          : "";
        
        const resolved = join(dir, urlPath).replace(/\\/g, "/");
        
        if (!pathMap.has(resolved) && !pathMap.has(resolved + ".md") && !pathMap.has(resolved + "/README.md")) {
          errors.push(
            `🔗 ${page.relativePath}: broken relative link: ${url} (resolves to ${resolved})`
          );
        } else {
          checkAnchor(page.relativePath, url, resolvePage(page.relativePath, urlPath));
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

const TASK_H2S = [
  "What you're setting up",
  "Why use this",
  "Before you start",
  "Steps",
  "Check it worked",
  "Troubleshooting",
  "Next steps",
];

function requiredTaskH2s(page: PageFile): string[] | null {
  const fm = page.frontmatter;
  const rel = page.relativePath;
  const file = rel.split("/").pop()?.replace(/\.md$/, "") ?? "";
  const platformGuide = new Set([
    "errors",
    "tracing",
    "navigation",
    "configuration",
    "analytics-and-flags",
  ]);

  // §6.0.2: optional blocks may be omitted. These kinds are errors.
  if (fm.section === "deploy" && fm.type === "guide") return TASK_H2S;
  if (fm.section === "get-started" && fm.type === "quickstart") return TASK_H2S;
  if (fm.section === "guides" && fm.type === "guide") return TASK_H2S;
  if (fm.section === "agents" && fm.type === "guide") return TASK_H2S;
  if (fm.section === "platforms" && (fm.type === "quickstart" || (fm.type === "guide" && file === "upgrade"))) {
    return TASK_H2S.filter((heading) => heading !== "Troubleshooting");
  }
  if (fm.section === "platforms" && fm.type === "guide" && platformGuide.has(file)) {
    return [
      "What you're setting up",
      "Steps",
      "Check it worked",
      "Next steps",
    ];
  }
  return null;
}

function isTaskPage(page: PageFile): boolean {
  const fm = page.frontmatter;
  return (
    (fm.section === "guides" && fm.type === "guide") ||
    (fm.section === "deploy" && fm.type === "guide") ||
    (fm.section === "get-started" && fm.type === "quickstart") ||
    (fm.section === "agents" && (fm.type === "guide" || fm.type === "quickstart")) ||
    (fm.section === "platforms" && (fm.type === "quickstart" || fm.type === "guide"))
  );
}

function taskH2s(page: PageFile): string[] {
  const content = readFileSync(page.path, "utf-8");
  const { content: body } = matter(content);
  const h2s: string[] = [];
  for (const match of body.matchAll(/^## (.+)$/gm)) {
    h2s.push(match[1].trim());
  }
  return h2s.filter((heading) => heading !== "For agents");
}

function h2sFollowFlow(actual: string[]): boolean {
  let last = -1;
  for (const heading of actual) {
    const index = TASK_H2S.indexOf(heading);
    if (index === -1 || index <= last) return false;
    last = index;
  }
  return true;
}

function checkTaskPageH2Order(pages: PageFile[]): void {
  for (const page of pages) {
    if (!isTaskPage(page)) continue;
    const coreH2s = taskH2s(page);
    const required = requiredTaskH2s(page);
    const follows = h2sFollowFlow(coreH2s);
    const missing = required?.filter((heading) => !coreH2s.includes(heading)) ?? [];

    if (required) {
      if (!follows || missing.length > 0) {
        errors.push(
          `📋 ${page.relativePath}: task page H2s must follow §6.0 (missing: ${missing.join(", ") || "none"}; found: ${coreH2s.join(", ")})`
        );
      }
      continue;
    }

    const allSeven = follows && TASK_H2S.every((heading) => coreH2s.includes(heading));
    if (!allSeven) {
      warnings.push(
        `📋 ${page.relativePath}: task page should have all 7 H2s in order (found: ${coreH2s.join(", ")})`
      );
    }
  }
}

function checkNavPaths(registries: ReturnType<typeof loadRegistries>): void {
  const manifest = parseYaml(readFileSync(join(DOCS_ROOT, "manifest.yaml"), "utf-8")) as {
    pages: { path: string }[];
  };
  const paths = new Set(manifest.pages.map((page) => page.path));
  const expected: string[] = [];
  for (const section of registries.sections) {
    expected.push(`${section.path}/README.md`);
    for (const subgroup of section.subgroups ?? []) {
      expected.push(`${subgroup.path}/README.md`);
    }
  }
  for (const path of expected) {
    if (!paths.has(path)) {
      errors.push(`🧭 nav path has no manifest page: ${path}`);
    }
  }
}

function checkSiblingOrder(): void {
  const registries = loadRegistries();
  const manifest = parseYaml(readFileSync(join(DOCS_ROOT, "manifest.yaml"), "utf-8")) as {
    pages: { path: string }[];
  };
  const paths = manifest.pages.map((page) => page.path);

  const expectOrder = (label: string, wanted: string[]) => {
    const present = wanted.filter((path) => paths.includes(path));
    const actual = paths.filter((path) => present.includes(path));
    if (actual.join("\n") !== present.join("\n")) {
      errors.push(
        `↕️ manifest sibling order for ${label} does not follow the registry (found: ${actual.join(", ")})`
      );
    }
  };

  const platformHubs = [...registries.platforms]
    .sort((a, b) => a.order - b.order)
    .map((platform) => `sdk/${platform.id}/README.md`);
  expectOrder("platforms", platformHubs);

  const pageSet = registries.sections.find((section) => section.id === "platforms")?.pageSet ?? [];
  for (const platform of registries.platforms) {
    const wanted = pageSet.map((key) =>
      key === "overview" ? `sdk/${platform.id}/README.md` : `sdk/${platform.id}/${key}.md`
    );
    expectOrder(`${platform.id} pages`, wanted);
  }

  const mcpClients = [...registries.mcpClients]
    .sort((a, b) => a.order - b.order)
    .map((client) => `agents/mcp/${client.id}.md`);
  expectOrder("MCP clients", mcpClients);

  const hosts = [...registries.hosts]
    .filter((host) => host.status !== "hidden")
    .sort((a, b) => a.order - b.order)
    .map((host) => `deploy/hosts/${host.id}.md`);
  expectOrder("hosts", hosts);

  const providers = [...registries.ciProviders]
    .filter((provider) => provider.status !== "hidden" && provider.status !== "unpublished")
    .sort((a, b) => a.order - b.order)
    .map((provider) => `deploy/ci/${provider.id}.md`);
  expectOrder("CI providers", providers);
}

function checkMcpTools(pages: PageFile[]): void {
  // Load MCP tools from features.yaml
  const registries = loadRegistries();
  const mcpTools = new Set<string>();
  
  for (const feature of registries.features) {
    if (feature.mcpTools) {
      for (const tool of feature.mcpTools) {
        mcpTools.add(tool);
      }
    }
  }
  
  // Check verify.mcp.tool references
  for (const page of pages) {
    const verify = page.frontmatter.verify;
    if (verify && typeof verify === "object" && "mcp" in verify) {
      const mcp = verify.mcp as any;
      if (mcp && typeof mcp === "object" && "tool" in mcp) {
        const tool = mcp.tool;
        if (typeof tool === "string" && !mcpTools.has(tool)) {
          errors.push(
            `🔧 ${page.relativePath}: verify.mcp.tool "${tool}" not found in features.yaml mcpTools`
          );
        }
      }
    }
  }
}

function validateManifestFresh() {
  // Build manifest in memory and compare with committed version
  try {
    const currentManifest = readFileSync(join(DOCS_ROOT, "manifest.yaml"), "utf-8");
    
    // Temporarily redirect console.log to suppress build output
    const originalLog = console.log;
    const logs: string[] = [];
    console.log = (...args) => logs.push(args.join(" "));
    
    const manifest = buildManifest();
    
    // Restore console.log
    console.log = originalLog;
    
    const rebuiltManifest = stringifyYaml(manifest, yamlStringifyOptions);
    
    if (currentManifest !== rebuiltManifest) {
      errors.push("📦 manifest.yaml is stale - run `npm run build-manifest` and commit");
    }
  } catch (e) {
    errors.push(`📦 manifest.yaml freshness check failed: ${e}`);
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
  
  // Step 4c: Task-page H2 order
  console.log("4️⃣c Checking task-page H2 order...");
  checkTaskPageH2Order(pages);
  if (errors.length === 0 && warnings.length === 0) {
    console.log("   ✅ Task pages follow H2 order\n");
  }

  console.log("4️⃣e Checking nav paths and sibling order...");
  checkNavPaths(registries);
  checkSiblingOrder();
  if (errors.length === 0) {
    console.log("   ✅ Nav paths and sibling order match the registries\n");
  }
  
  // Step 4d: MCP tool references
  console.log("4️⃣d Checking MCP tool references...");
  checkMcpTools(pages);
  if (errors.length === 0) {
    console.log("   ✅ MCP tool references valid\n");
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
