#!/usr/bin/env tsx
/**
 * Generate manifest.yaml from frontmatter
 * Platform DocsCatalog reads ONLY manifest.yaml (not frontmatter)
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import matter from "gray-matter";
import { stringify as stringifyYaml } from "yaml";

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
  status?: string;
  tags?: string[];
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

function buildManifest(): Manifest {
  console.log("📝 Building manifest.yaml from frontmatter...\n");
  
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
    if (fm.type) page.type = fm.type;
    if (fm.section) page.section = fm.section;
    if (fm.feature && Array.isArray(fm.feature) && fm.feature.length > 0) {
      page.features = fm.feature;
    }
    if (fm.clients && Array.isArray(fm.clients) && fm.clients.length > 0) {
      page.clients = fm.clients;
    }
    if (fm.status && fm.status !== "stable") page.status = fm.status;
    if (fm.tags && Array.isArray(fm.tags) && fm.tags.length > 0) {
      page.tags = fm.tags;
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
  
  // Sort by section, then by id for stable output
  pages.sort((a, b) => {
    const sectionOrder = (s: string | undefined) => {
      if (!s) return 999;
      const order: Record<string, number> = {
        "get-started": 1,
        "platforms": 2,
        "features": 3,
        "deploy-ci": 4,
        "agents": 5,
        "guides": 6,
        "reference": 7,
      };
      return order[s] || 999;
    };
    
    const sectionDiff = sectionOrder(a.section) - sectionOrder(b.section);
    if (sectionDiff !== 0) return sectionDiff;
    
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
  
  // Load old manifest if exists and check all old paths resolve
  const oldManifestPath = MANIFEST_PATH;
  if (existsSync(oldManifestPath)) {
    const oldContent = readFileSync(oldManifestPath, "utf-8");
    const oldManifest = matter(oldContent).data as any;
    
    if (oldManifest && oldManifest.pages) {
      console.log(`Checking ${oldManifest.pages.length} old manifest paths resolve...\n`);
      
      // Build resolution map: paths point to pages (no aliases)
      const resolutionMap = new Map<string, string>();
      
      for (const page of manifest.pages) {
        // Current path resolves to itself
        resolutionMap.set(page.path, page.id);
        resolutionMap.set(page.path.replace(/\.md$/, ""), page.id);
      }
      
      // Check each old path
      let unresolved = 0;
      for (const oldPage of oldManifest.pages) {
        const oldPath = oldPage.path;
        const oldPathNoExt = oldPath.replace(/\.md$/, "");
        
        if (!resolutionMap.has(oldPath) && !resolutionMap.has(oldPathNoExt)) {
          console.log(`  ⚠️  Old path unresolved: ${oldPath} (id: ${oldPage.id})`);
          unresolved++;
        }
      }
      
      if (unresolved > 0) {
        console.log(`⚠️  ${unresolved} old manifest paths do not resolve (greenfield docs, no aliases needed)\n`);
      } else {
        console.log(`✅ All old paths resolve\n`);
      }
    }
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

// Main
const manifest = buildManifest();
validateManifest(manifest);

// Write manifest.yaml
const yaml = stringifyYaml(manifest, {
  lineWidth: 0, // Don't wrap
  defaultStringType: "QUOTE_DOUBLE",
});

writeFileSync(MANIFEST_PATH, yaml, "utf-8");
console.log(`✅ Wrote manifest.yaml (${manifest.pages.length} pages)\n`);
