#!/usr/bin/env tsx
// Syncs shared snippets into page content between <!-- snippet --> markers
// Phase 1 stub - full implementation in phase 2

import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    check: { type: "boolean", default: false },
  },
});

console.log("📋 Snippet sync...");
if (values.check) {
  console.log("   ℹ️  Check mode: verifying snippets are up to date");
} else {
  console.log("   ℹ️  Sync mode: updating snippet markers");
}

console.log("   ⚠️  Phase 2 feature - no snippets to sync yet");
console.log("   Snippets will live in _snippets/ and sync with platform variants");

// Real implementation will:
// 1. Find all <!-- snippet: name platform=X --> markers in pages
// 2. Look up _snippets/name/platform.md (or _default.md)
// 3. Replace content between <!-- snippet --> and <!-- /snippet -->
// 4. In --check mode, exit 1 if any page is stale
// 5. Support {{platform.package}}, {{mcpUrl}} template vars

process.exit(0);
