#!/usr/bin/env tsx
/**
 * Generate manifest.yaml from frontmatter
 * Platform DocsCatalog reads ONLY manifest.yaml (not frontmatter)
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import matter from "gray-matter";
import { stringify as stringifyYaml, parse as parseYaml } from "yaml";

const DOCS_ROOT = join(import.meta.dirname, "..");
const MANIFEST_PATH = join(DOCS_ROOT, "manifest.yaml");

interface Page {
  id: string;
  path: string;
  title: string;
  description: string;
  sdk?: string; // legacy field for platform filtering
  package?: string; // legacy field for source maps
  platforms?: string[];
  type?: string;
  section?: string;
  features?: string[];
  clients?: string[];
  family?: string;
  familyLabel?: string;
  status?: string;
  tags?: string[];
  order?: number; // for sorting within section
}

interface Manifest {
  revision: string;
  pages: Page[];
}

function collectMarkdownFiles(dir: string, files: string[] = []): string[] {
  const entries = readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const relativePath = relative(DOCS_ROOT, fullPath);
    
    // Skip underscore-prefixed directories and files
    if (entry.startsWith("_")) continue;
    
    // Skip infrastructure files
    if (["CONTRIBUTING.md", ".gitignore"].includes(entry)) continue;
    
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      collectMarkdownFiles(fullPath, files);
    } else if (entry.endsWith(".md")) {
      files.push(relativePath);
    }
  }
  
  return files;
}

type Ordered = { id: string; order: number; family?: string; label?: string };

function loadRegistry(name: string): Ordered[] {
  return parseYaml(readFileSync(join(DOCS_ROOT, "_registry", name), "utf-8")) as Ordered[];
}

function orderOf(entries: Ordered[]): Map<string, number> {
  return new Map(entries.map((entry) => [entry.id, entry.order]));
}

export function buildManifest(): Manifest {
  console.log("📝 Building manifest.yaml from frontmatter...\n");

  const sections = loadRegistry("sections.yaml") as Array<Ordered & { pageSet?: string[] }>;
  const sectionOrderMap: Record<string, number> = {};
  let pageSet: string[] = [];
  for (const section of sections) {
    sectionOrderMap[section.id] = section.order;
    if (section.id === "platforms" && section.pageSet) pageSet = section.pageSet;
  }
  const families = loadRegistry("platform-families.yaml");
  const familyOrder = orderOf(families);
  const familyLabels = new Map(families.map((entry) => [entry.id, entry.label || entry.id]));
  const platforms = loadRegistry("platforms.yaml");
  const platformById = new Map(platforms.map((entry) => [entry.id, entry]));
  const mcpOrder = orderOf(loadRegistry("mcp-clients.yaml"));
  const hostOrder = orderOf(loadRegistry("hosts.yaml"));
  const ciOrder = orderOf(loadRegistry("ci-providers.yaml"));

  function sortTuple(page: Page): number[] {
    const sectionOrder = sectionOrderMap[page.section || ""] ?? 999;
    const path = page.path;
    const order = page.order ?? 999;

    if (path === "sdk/README.md") return [sectionOrder, 0, 0, 0, 0];
    const sdk = path.match(/^sdk\/([^/]+)\/([^/]+)\.md$/);
    if (sdk) {
      const platform = platformById.get(sdk[1]);
      const file = sdk[2] === "README" ? "overview" : sdk[2];
      const setIndex = pageSet.indexOf(file);
      return [
        sectionOrder,
        1,
        platform ? (familyOrder.get(platform.family || "") ?? 999) : 999,
        platform?.order ?? 999,
        setIndex === -1 ? 999 : setIndex,
      ];
    }

    if (path === "deploy/README.md") return [sectionOrder, 0, 0, 0, 0];
    if (path === "deploy/ci/README.md") return [sectionOrder, 1, 0, 0, 0];
    if (path.startsWith("deploy/ci/") && path.endsWith(".md")) {
      const id = path.slice("deploy/ci/".length, -3);
      return [sectionOrder, 1, 1, ciOrder.get(id) ?? 999, 0];
    }
    if (path === "deploy/hosts/README.md") return [sectionOrder, 2, 0, 0, 0];
    if (path.startsWith("deploy/hosts/") && path.endsWith(".md")) {
      const id = path.slice("deploy/hosts/".length, -3);
      return [sectionOrder, 2, 1, hostOrder.get(id) ?? 999, 0];
    }

    if (path === "agents/mcp/README.md") return [sectionOrder, 1, 0, 0, 0];
    if (path.startsWith("agents/mcp/") && path.endsWith(".md")) {
      const id = path.slice("agents/mcp/".length, -3);
      return [sectionOrder, 1, 1, mcpOrder.get(id) ?? 999, 0];
    }

    return [sectionOrder, 0, order, 0, 0];
  }

  const files = collectMarkdownFiles(DOCS_ROOT);
  const pages: Page[] = [];
  const errors: string[] = [];
  
  for (const file of files) {
    const fullPath = join(DOCS_ROOT, file);
    const content = readFileSync(fullPath, "utf-8");
    const { data: fm } = matter(content);
    
    if (!fm.id) {
      errors.push(`${file}: missing id`);
      continue;
    }
    
    if (!fm.title) {
      errors.push(`${file}: missing title`);
      continue;
    }
    
    if (!fm.description) {
      errors.push(`${file}: missing description`);
      continue;
    }
    
    // Build page entry
    const page: Page = {
      id: fm.id,
      path: file,
      title: fm.title,
      description: fm.description,
    };
    
    // Legacy sdk field for platform filtering (first platform only)
    if (fm.platform && Array.isArray(fm.platform) && fm.platform.length > 0) {
      page.sdk = fm.platform[0];
      page.platforms = fm.platform;
    }
    
    // Optional fields
    if (fm.package) page.package = fm.package;
    if (fm.type) page.type = fm.type;
    if (fm.section) page.section = fm.section;
    if (fm.feature && Array.isArray(fm.feature) && fm.feature.length > 0) {
      page.features = fm.feature;
    }
    if (fm.clients && Array.isArray(fm.clients) && fm.clients.length > 0) {
      page.clients = fm.clients;
    }
    const sdkPage = file.match(/^sdk\/([^/]+)\//);
    if (sdkPage) {
      const platform = platformById.get(sdkPage[1]);
      if (platform) {
        page.family = platform.family;
        const familyLabel = familyLabels.get(platform.family);
        if (familyLabel) page.familyLabel = familyLabel;
      }
    }
    if (fm.status && fm.status !== "stable") page.status = fm.status;
    if (fm.tags && Array.isArray(fm.tags) && fm.tags.length > 0) {
      page.tags = fm.tags;
    }
    if (typeof fm.order === "number") {
      page.order = fm.order;
    }
    
    pages.push(page);
  }
  
  if (errors.length > 0) {
    console.error("\n❌ Frontmatter errors:");
    for (const error of errors) {
      console.error(`  • ${error}`);
    }
    process.exit(1);
  }
  
  // Section order, then registry sibling order (family, platform, page set,
  // MCP client, host, CI provider). Frontmatter order is the fallback.
  pages.sort((a, b) => {
    const ka = sortTuple(a);
    const kb = sortTuple(b);
    for (let i = 0; i < ka.length; i++) {
      if (ka[i] !== kb[i]) return ka[i] - kb[i];
    }
    return a.id.localeCompare(b.id);
  });
  
  console.log(`✅ Generated ${pages.length} page entries\n`);
  
  return {
    revision: "1.0.0",
    pages,
  };
}

function validateManifest(manifest: Manifest): void {
  console.log("🔍 Validating manifest...\n");
  
  const errors: string[] = [];
  
  // Check all paths exist
  for (const page of manifest.pages) {
    const fullPath = join(DOCS_ROOT, page.path);
    if (!existsSync(fullPath)) {
      errors.push(`Path does not exist: ${page.path}`);
    }
  }
  
  // Check for duplicate IDs
  const ids = new Set<string>();
  for (const page of manifest.pages) {
    if (ids.has(page.id)) {
      errors.push(`Duplicate id: ${page.id}`);
    }
    ids.add(page.id);
  }
  
  if (errors.length > 0) {
    console.error("\n❌ Manifest validation failed:");
    for (const error of errors) {
      console.error(`  • ${error}`);
    }
    process.exit(1);
  }
  
  console.log("✅ Manifest valid\n");
}

// Export stringify options for use in validator
export const yamlStringifyOptions = {
  lineWidth: 0, // Don't wrap
};

// Main - only run when executed directly
import { pathToFileURL } from "node:url";
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const manifest = buildManifest();
  validateManifest(manifest);

  // Write manifest.yaml
  const yaml = stringifyYaml(manifest, yamlStringifyOptions);

  writeFileSync(MANIFEST_PATH, yaml, "utf-8");
  console.log(`✅ Wrote manifest.yaml (${manifest.pages.length} pages)\n`);
}
