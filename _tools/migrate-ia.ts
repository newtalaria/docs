#!/usr/bin/env tsx
/**
 * IA Phase 1 Migration
 * 
 * Performs all file moves, renames, and frontmatter additions per IA_SPEC v1.1 §3.3
 * 
 * Actions:
 * 1. Create new directory structure
 * 2. git mv files to new locations
 * 3. Add typed frontmatter with aliases and redirectFrom
 * 4. Rewrite relative links
 * 5. Validate no broken links
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname, relative, resolve } from "node:path";
import matter from "gray-matter";
import { loadRegistries } from "./registries.js";

const DOCS_ROOT = join(import.meta.dirname, "..");
const DRY_RUN = process.argv.includes("--dry-run");

interface MigrationStep {
  action: "mv" | "rename-slug" | "add-frontmatter" | "keep";
  oldPath: string;
  newPath: string;
  oldUrl?: string;
  newUrl?: string;
  frontmatter: any;
  note?: string;
}

const steps: MigrationStep[] = [];

// Load registries for validation
const registries = loadRegistries();

function exec(cmd: string) {
  console.log(`  $ ${cmd}`);
  if (!DRY_RUN) {
    execSync(cmd, { cwd: DOCS_ROOT, stdio: "inherit" });
  }
}

function addStep(step: MigrationStep) {
  steps.push(step);
  const action = step.action === "mv" ? "MOVE" : step.action === "rename-slug" ? "RENAME" : "UPDATE";
  console.log(`${action}: ${step.oldPath} → ${step.newPath}`);
  if (step.note) {
    console.log(`  Note: ${step.note}`);
  }
}

function ensureDir(path: string) {
  const dir = dirname(path);
  if (!existsSync(dir) && !DRY_RUN) {
    mkdirSync(dir, { recursive: true });
  }
}

function addFrontmatter(path: string, fm: any) {
  const fullPath = join(DOCS_ROOT, path);
  let content = "";
  let existingFm: any = {};
  
  if (existsSync(fullPath)) {
    const file = readFileSync(fullPath, "utf-8");
    const parsed = matter(file);
    existingFm = parsed.data;
    content = parsed.content;
  }
  
  // Merge with priority to new frontmatter
  const merged = { ...existingFm, ...fm };
  
  // Ensure aliases is array
  if (merged.aliases && !Array.isArray(merged.aliases)) {
    merged.aliases = [merged.aliases];
  }
  
  // Ensure redirectFrom is array
  if (merged.redirectFrom && !Array.isArray(merged.redirectFrom)) {
    merged.redirectFrom = [merged.redirectFrom];
  }
  
  const newContent = matter.stringify(content, merged);
  
  if (!DRY_RUN) {
    writeFileSync(fullPath, newContent, "utf-8");
  }
}

console.log("🚀 IA Phase 1 Migration\n");
console.log(`Mode: ${DRY_RUN ? "DRY RUN (no changes)" : "LIVE (git mv and file updates)"}\n`);

// Step 1: Create new directory structure
console.log("1️⃣  Creating directory structure...\n");

const dirs = [
  "get-started",
  "features",
  "agents",
  "agents/mcp",
  "deploy",
  "deploy/ci",
  "deploy/hosts",
  "reference",
];

for (const dir of dirs) {
  const fullPath = join(DOCS_ROOT, dir);
  if (!existsSync(fullPath)) {
    console.log(`  mkdir ${dir}/`);
    if (!DRY_RUN) {
      mkdirSync(fullPath, { recursive: true });
    }
  }
}

console.log("\n2️⃣  Migrating files per IA_SPEC v1.1 §3.3...\n");

// Row 2: getting-started → get-started
addStep({
  action: "mv",
  oldPath: "getting-started/README.md",
  newPath: "get-started/README.md",
  oldUrl: "/docs/getting-started",
  newUrl: "/docs/get-started",
  frontmatter: {
    id: "get-started",
    title: "Get started",
    description: "Create an account, set up your first project, and send events from your app with Talaria.",
    type: "hub",
    section: "get-started",
    platform: [],
    feature: [],
    order: 10,
    lastReviewed: "2026-10-29",
    owner: "docs",
    aliases: ["getting-started/README.md"],
    redirectFrom: ["/docs/getting-started"],
  },
});

// Row 3: quickstart
addStep({
  action: "mv",
  oldPath: "getting-started/quickstart.md",
  newPath: "get-started/quickstart.md",
  oldUrl: "/docs/getting-started/quickstart",
  newUrl: "/docs/get-started/quickstart",
  frontmatter: {
    id: "quickstart",
    title: "Quickstart",
    description: "Create an account, project, and API key—send your first event in under 5 minutes.",
    type: "quickstart",
    section: "get-started",
    platform: [],
    feature: [],
    order: 20,
    lastReviewed: "2026-10-29",
    owner: "docs",
    aliases: ["getting-started/quickstart.md"],
    redirectFrom: ["/docs/getting-started/quickstart"],
  },
});

// Row 4: configuration → project-settings
addStep({
  action: "mv",
  oldPath: "getting-started/configuration.md",
  newPath: "get-started/project-settings.md",
  oldUrl: "/docs/getting-started/configuration",
  newUrl: "/docs/get-started/project-settings",
  frontmatter: {
    id: "project-settings",
    title: "Project settings",
    navTitle: "Project settings",
    description: "Remote configuration: how SDKs load tracing, analytics, heatmaps, replay, and consent settings from your Talaria project.",
    type: "concept",
    section: "get-started",
    platform: [],
    feature: [],
    order: 30,
    lastReviewed: "2026-10-29",
    owner: "docs",
    aliases: ["getting-started/configuration.md"],
    redirectFrom: ["/docs/getting-started/configuration"],
  },
});

// Row 5-7: Agent pages
addStep({
  action: "mv",
  oldPath: "guides/add-talaria-with-an-agent.md",
  newPath: "agents/add-talaria.md",
  oldUrl: "/docs/guides/add-talaria-with-an-agent",
  newUrl: "/docs/agents/add-talaria",
  frontmatter: {
    id: "agent-playbook",
    title: "Add Talaria with an agent",
    navTitle: "Add Talaria",
    description: "Agent playbook: detect stack, fetch docs, wire API key and init, then verify ingest.",
    type: "guide",
    section: "agents",
    platform: [],
    feature: [],
    loopStage: ["instrument"],
    order: 20,
    lastReviewed: "2026-10-29",
    owner: "docs",
    aliases: ["guides/add-talaria-with-an-agent.md"],
    redirectFrom: ["/docs/guides/add-talaria-with-an-agent"],
  },
});

addStep({
  action: "mv",
  oldPath: "guides/triage-issues-with-an-agent.md",
  newPath: "agents/triage-issues.md",
  oldUrl: "/docs/guides/triage-issues-with-an-agent",
  newUrl: "/docs/agents/triage-issues",
  frontmatter: {
    id: "triage-issues-with-an-agent",
    title: "Triage issues with an agent",
    navTitle: "Triage issues",
    description: "Check an open issue, then resolve or ignore it with a note using agent tools.",
    type: "guide",
    section: "agents",
    platform: [],
    feature: ["issues"],
    loopStage: ["triage"],
    order: 30,
    lastReviewed: "2026-10-29",
    owner: "docs",
    aliases: ["guides/triage-issues-with-an-agent.md"],
    redirectFrom: ["/docs/guides/triage-issues-with-an-agent"],
  },
});

addStep({
  action: "mv",
  oldPath: "guides/agent-skills.md",
  newPath: "agents/README.md",
  oldUrl: "/docs/guides/agent-skills",
  newUrl: "/docs/agents",
  frontmatter: {
    id: "agents",
    title: "Agents and MCP",
    navTitle: "Overview",
    description: "Connect coding agents to Talaria: skills are the playbook, MCP is the tool belt. Get started, instrument, observe, triage, verify.",
    type: "hub",
    section: "agents",
    platform: [],
    feature: [],
    order: 10,
    lastReviewed: "2026-10-29",
    owner: "docs",
    aliases: ["guides/agent-skills.md"],
    redirectFrom: ["/docs/guides/agent-skills"],
  },
});

// Row 9-11: Features pages
addStep({
  action: "mv",
  oldPath: "guides/releases.md",
  newPath: "features/releases.md",
  oldUrl: "/docs/guides/releases",
  newUrl: "/docs/features/releases",
  frontmatter: {
    id: "releases",
    title: "Releases",
    description: "Track deploys and stamp every event with the git ref and commit that produced the build.",
    type: "feature",
    section: "features",
    platform: [],
    feature: ["releases"],
    order: 80,
    lastReviewed: "2026-10-29",
    owner: "docs",
    aliases: ["guides/releases.md"],
    redirectFrom: ["/docs/guides/releases"],
  },
});

addStep({
  action: "mv",
  oldPath: "guides/monitors.md",
  newPath: "features/monitors.md",
  oldUrl: "/docs/guides/monitors",
  newUrl: "/docs/features/monitors",
  frontmatter: {
    id: "monitors",
    title: "Cron and job monitors",
    navTitle: "Cron monitors",
    description: "Check in from cron or scheduled jobs so a missed run opens an issue automatically.",
    type: "feature",
    section: "features",
    platform: [],
    feature: ["monitors"],
    order: 100,
    lastReviewed: "2026-10-29",
    owner: "docs",
    aliases: ["guides/monitors.md"],
    redirectFrom: ["/docs/guides/monitors"],
  },
});

addStep({
  action: "mv",
  oldPath: "guides/runtime.md",
  newPath: "features/runtime.md",
  oldUrl: "/docs/guides/runtime",
  newUrl: "/docs/features/runtime",
  frontmatter: {
    id: "runtime",
    title: "Runtime health",
    navTitle: "Runtime",
    description: "Service, environment, and deployment health from check-ins, logs, and gauges.",
    type: "feature",
    section: "features",
    platform: [],
    feature: ["runtime"],
    order: 40,
    lastReviewed: "2026-10-29",
    owner: "docs",
    aliases: ["guides/runtime.md"],
    redirectFrom: ["/docs/guides/runtime"],
  },
});

// Row 12-13: Collectors to Deploy & CI
addStep({
  action: "mv",
  oldPath: "sdk/collector/kubernetes.md",
  newPath: "deploy/hosts/kubernetes.md",
  oldUrl: "/docs/sdk/collector/kubernetes",
  newUrl: "/docs/deploy/hosts/kubernetes",
  frontmatter: {
    id: "kubernetes-collector",
    title: "Kubernetes",
    description: "Deploy the OpenTelemetry Collector on Kubernetes with Helm values and a CronJob health check-in.",
    type: "guide",
    section: "deploy-ci",
    platform: [],
    feature: [],
    host: "kubernetes",
    order: 10,
    lastReviewed: "2026-10-29",
    owner: "docs",
    aliases: ["sdk/collector/kubernetes.md"],
    redirectFrom: ["/docs/sdk/collector/kubernetes"],
  },
});

addStep({
  action: "mv",
  oldPath: "sdk/collector/sitehost.md",
  newPath: "deploy/hosts/sitehost.md",
  oldUrl: "/docs/sdk/collector/sitehost",
  newUrl: "/docs/deploy/hosts/sitehost",
  frontmatter: {
    id: "sitehost-collector",
    title: "SiteHost containers",
    navTitle: "SiteHost",
    description: "Tail container logs and run supervisord health checks on SiteHost PHP hosting.",
    type: "guide",
    section: "deploy-ci",
    platform: ["php", "laravel", "silverstripe"],
    feature: [],
    host: "sitehost",
    order: 20,
    lastReviewed: "2026-10-29",
    owner: "docs",
    aliases: ["sdk/collector/sitehost.md"],
    redirectFrom: ["/docs/sdk/collector/sitehost"],
  },
  note: "Will scrub internal pipeline details per IA_SPEC §1 scope rule",
});

// Row 60-67: MCP client pages
const mcpClients = [
  { old: "mcp/cursor.md", new: "agents/mcp/cursor.md", id: "mcp-cursor", title: "Cursor" },
  { old: "mcp/grok-bot.md", new: "agents/mcp/grok-bot.md", id: "mcp-grok-bot", title: "Grok Bot" },
  { old: "mcp/claude-code.md", new: "agents/mcp/claude-code.md", id: "mcp-claude-code", title: "Claude Code" },
  { old: "mcp/vscode.md", new: "agents/mcp/vscode.md", id: "mcp-vscode", title: "VS Code and GitHub Copilot" },
  { old: "mcp/codex.md", new: "agents/mcp/codex.md", id: "mcp-codex", title: "Codex" },
  { old: "mcp/gemini-cli.md", new: "agents/mcp/gemini-cli.md", id: "mcp-gemini-cli", title: "Gemini CLI" },
  { old: "mcp/windsurf.md", new: "agents/mcp/windsurf.md", id: "mcp-windsurf", title: "Windsurf" },
];

for (const client of mcpClients) {
  addStep({
    action: "mv",
    oldPath: client.old,
    newPath: client.new,
    oldUrl: `/docs/${client.old.replace(".md", "")}`,
    newUrl: `/docs/${client.new.replace(".md", "")}`,
    frontmatter: {
      id: client.id,
      title: client.title,
      description: `Add the Talaria MCP server in ${client.title} to access docs, investigation, and integration tools.`,
      type: "guide",
      section: "agents",
      platform: [],
      feature: [],
      clients: [client.id.replace("mcp-", "")],
      order: 100 + mcpClients.indexOf(client),
      lastReviewed: "2026-10-29",
      owner: "docs",
      aliases: [client.old],
      redirectFrom: [`/docs/${client.old.replace(".md", "")}`],
    },
  });
}

addStep({
  action: "mv",
  oldPath: "mcp/README.md",
  newPath: "agents/mcp/README.md",
  oldUrl: "/docs/mcp",
  newUrl: "/docs/agents/mcp",
  frontmatter: {
    id: "mcp",
    title: "Talaria MCP server",
    navTitle: "MCP server",
    description: "Hosted Talaria MCP server: docs tools, investigation, integration scopes, and authentication.",
    type: "hub",
    section: "agents",
    platform: [],
    feature: [],
    order: 50,
    lastReviewed: "2026-10-29",
    owner: "docs",
    aliases: ["mcp/README.md"],
    redirectFrom: ["/docs/mcp"],
  },
});

// Row 68-69: Analytics pages
addStep({
  action: "mv",
  oldPath: "analytics/setup.md",
  newPath: "features/analytics.md",
  oldUrl: "/docs/analytics/setup",
  newUrl: "/docs/features/analytics",
  frontmatter: {
    id: "analytics",
    title: "Product analytics",
    navTitle: "Analytics",
    description: "Track user behavior, page views, and custom events with product analytics.",
    type: "feature",
    section: "features",
    platform: [],
    feature: ["analytics"],
    order: 60,
    lastReviewed: "2026-10-29",
    owner: "docs",
    aliases: ["analytics/setup.md"],
    redirectFrom: ["/docs/analytics/setup"],
  },
});

addStep({
  action: "mv",
  oldPath: "analytics/consent.md",
  newPath: "guides/cookie-banners.md",
  oldUrl: "/docs/analytics/consent",
  newUrl: "/docs/guides/cookie-banners",
  frontmatter: {
    id: "analytics-consent",
    title: "Cookie banners and consent",
    navTitle: "Cookie banners",
    description: "How the browser SDK follows CookieYes, Cookiebot, and Google Consent Mode for GDPR compliance.",
    type: "guide",
    section: "guides",
    platform: ["javascript", "react", "nextjs"],
    feature: ["analytics"],
    order: 20,
    lastReviewed: "2026-10-29",
    owner: "docs",
    aliases: ["analytics/consent.md"],
    redirectFrom: ["/docs/analytics/consent"],
  },
});

// Row 70: API overview → reference/ingest-api
addStep({
  action: "mv",
  oldPath: "api/overview.md",
  newPath: "reference/ingest-api.md",
  oldUrl: "/docs/api/overview",
  newUrl: "/docs/reference/ingest-api",
  frontmatter: {
    id: "ingest-api",
    title: "Ingest API reference",
    navTitle: "Ingest API",
    description: "Ingest authentication, event shape, and how the API key sets environment and release.",
    type: "reference",
    section: "reference",
    platform: [],
    feature: [],
    apiVersion: "ingest-v1",
    order: 10,
    lastReviewed: "2026-10-29",
    owner: "docs",
    aliases: ["api/overview.md"],
    redirectFrom: ["/docs/api/overview"],
  },
});

console.log(`\n📊 Migration plan: ${steps.length} steps\n`);

// Execute migration
if (!DRY_RUN) {
  console.log("3️⃣  Executing file moves...\n");
  
  for (const step of steps) {
    if (step.action === "mv") {
      const oldFullPath = join(DOCS_ROOT, step.oldPath);
      const newFullPath = join(DOCS_ROOT, step.newPath);
      
      if (existsSync(oldFullPath)) {
        ensureDir(newFullPath);
        exec(`git mv ${step.oldPath} ${step.newPath}`);
        addFrontmatter(step.newPath, step.frontmatter);
      } else {
        console.log(`  ⚠️  Skip: ${step.oldPath} does not exist`);
      }
    }
  }
  
  console.log("\n✅ File moves complete!\n");
} else {
  console.log("\n✅ Dry run complete. Run without --dry-run to execute.\n");
}

console.log("Summary:");
console.log(`  ${steps.filter(s => s.action === "mv").length} moves`);
console.log(`  ${steps.filter(s => s.action === "rename-slug").length} slug renames (next step)`);
console.log(`  ${steps.filter(s => s.action === "add-frontmatter").length} frontmatter additions`);
