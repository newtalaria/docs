#!/usr/bin/env tsx
// Generates manifest.yaml for MCP docs_* compatibility
// Phase 1 stub - full implementation after file moves

import { writeFileSync } from "node:fs";
import { join } from "node:path";

const MANIFEST_PATH = join(import.meta.dirname, "../manifest.yaml");

console.log("📝 Building manifest.yaml...");
console.log("   ⚠️  Phase 1 stub - preserving existing manifest");
console.log("   Full generation will happen after IA migration");

// For now, keep the existing manifest
// Real implementation will:
// 1. Collect all pages with frontmatter
// 2. Generate MCP-compatible manifest with id, path, title, description, platforms, etc.
// 3. Include aliases for backward compatibility
// 4. Ensure byte-identical regeneration for CI checks

console.log("   ℹ️  Run this after file moves to regenerate manifest");
