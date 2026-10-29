import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { z } from "zod";

const REGISTRY_DIR = join(import.meta.dirname, "../_registry");

// Base registry entry shape
const baseEntry = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  label: z.string().min(1),
  icon: z.string().optional(),
  status: z.enum(["stable", "beta", "preview", "deprecated", "hidden"]).default("stable"),
  order: z.number().int().min(0),
});

// Optional integration block for registries (platforms, CI providers, hosts, OTEL sources)
const integrationBlockSchema = z.object({
  tier: z.enum(["T1", "T2", "T3", "T4", "T5"]),
  signals: z.array(z.enum(["errors", "logs", "traces", "metrics", "analytics", "replay", "flags", "checkins"])),
  artifacts: z.array(z.object({
    kind: z.enum(["helm-values", "collector", "action", "cli", "snippet"]),
    ref: z.string().optional(),
    upstream: z.string().optional(),
    tested: z.array(z.string()).optional(),
    version: z.string().optional(),
  })).optional(),
  install: z.object({
    steps: z.array(z.string()),
  }).optional(),
  requires: z.array(z.string()).optional(),
  semconv: z.string().optional(),
  conformance: z.object({
    status: z.enum(["pass", "fail", "pending"]),
    last_run: z.string().optional(),
    harness: z.string().optional(),
  }).optional(),
  agent_prompt: z.string().optional(),
  upstream: z.string().optional(),
});

// Sections
const sectionSchema = baseEntry.extend({
  path: z.string(),
  pageSet: z.array(z.string()).optional(),
  pageSetLabels: z.record(z.string()).optional(),
  subgroups: z.array(z.object({
    id: z.string(),
    label: z.string(),
    path: z.string(),
  })).optional(),
  tone: z.enum(["ai"]).optional(),
  versioned: z.boolean().optional(),
});

const landingSchema = z.object({
  hero: z.object({
    title: z.string(),
    lede: z.string(),
    primary: z.string(),
    secondary: z.string(),
  }),
  popular: z.array(z.string()),
});

const sectionsFileSchema = z.array(sectionSchema).min(1);

// Platform families
const platformFamilySchema = baseEntry.omit({ icon: true, status: true });

// Platforms
const platformSchema = baseEntry.extend({
  family: z.string(),
  kind: z.enum(["language", "framework", "runtime"]),
  parent: z.string().optional(),
  package: z.string(),
  packageManager: z.enum(["npm", "pub", "composer"]),
  version: z.string(),
  install: z.object({
    language: z.string(),
    template: z.string(),
  }),
  accent: z.string().regex(/^#[0-9A-F]{6}$/i),
  integration: integrationBlockSchema.optional(),
});

// Features
const featureSchema = baseEntry.extend({
  summary: z.string().max(60),
  productHref: z.string(),
  page: z.boolean(),
  mcpTools: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  support: z.record(z.object({
    level: z.enum(["none", "partial", "full"]),
    note: z.string().optional(),
  })).optional(),
});

// Integrations
const integrationSchema = baseEntry.extend({
  kind: z.enum(["collector", "source-control", "notification"]),
  via: z.string().optional(),
});

// CI Providers
const ciProviderSchema = baseEntry.extend({
  summary: z.string().max(80),
  integration: integrationBlockSchema.optional(),
});

// Hosts
const hostSchema = baseEntry.extend({
  summary: z.string().max(80),
  integration: integrationBlockSchema.optional(),
});

// OTEL Sources (new registry for T2/T3 entries that are neither SDK nor host)
const otelSourceSchema = baseEntry.extend({
  summary: z.string().max(80).optional(),
  integration: integrationBlockSchema.optional(),
});

// MCP Clients
const mcpClientSchema = baseEntry.extend({
  configKey: z.string(),
  connect: z.object({
    kind: z.enum(["config", "prompt", "cli"]),
    text: z.string(),
  }),
  listing: z.object({
    status: z.enum(["live", "pending"]),
    note: z.string().optional(),
  }),
});

// Agent Skills
const agentSkillSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  stage: z.enum(["get-started", "instrument", "observe", "triage", "verify"]),
  label: z.string(),
  description: z.string(),
  order: z.number().int().min(0),
  playbook: z.string().nullable(),
});

const agentSkillsFileSchema = z.array(agentSkillSchema).min(1);

const agentPluginSchema = z.object({
  repo: z.string(),
  directory: z.string().url(),
});

// API Versions
const apiVersionSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  surface: z.enum(["ingest", "mcp"]),
  label: z.string(),
  status: z.enum(["stable", "beta", "deprecated"]),
  current: z.boolean(),
  order: z.number().int().min(0),
});

// Owners
const ownerSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  label: z.string(),
  github: z.string().optional(),
});

// Dashboard Surfaces (v1.2)
const dashboardSurfaceSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  label: z.string(),
  icon: z.string(),
  order: z.number().int().min(0),
});

// Key Scopes (v1.4.2)
const credentialSchema = z.enum([
  "publishable-key",
  "secret-key",
  "release-key",
  "monitor-token",
  "personal-token",
  "oauth",
]);
const keyScopeSchema = z.object({
  id: z.string().regex(/^[a-z0-9:]+$/),
  label: z.string(),
  credential: z.union([credentialSchema, z.array(credentialSchema).min(1)]).optional(),
});

// Page Templates (v1.2)
const pageTemplatesSchema = z.object({
  "task-page": z.object({
    headings: z.array(z.string()).length(7),
  }),
});

function loadYaml<T>(filename: string, schema: z.ZodType<T>): T {
  const path = join(REGISTRY_DIR, filename);
  try {
    const content = readFileSync(path, "utf-8");
    const parsed = parseYaml(content);
    return schema.parse(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`\n❌ Validation failed for ${filename}:`);
      for (const issue of error.issues) {
        console.error(`  • ${issue.path.join(".")}: ${issue.message}`);
      }
      process.exit(1);
    }
    throw error;
  }
}

export interface Registries {
  sections: z.infer<typeof sectionSchema>[];
  landing: z.infer<typeof landingSchema> | null;
  platformFamilies: z.infer<typeof platformFamilySchema>[];
  platforms: z.infer<typeof platformSchema>[];
  features: z.infer<typeof featureSchema>[];
  ciProviders: z.infer<typeof ciProviderSchema>[];
  hosts: z.infer<typeof hostSchema>[];
  otelSources: z.infer<typeof otelSourceSchema>[];
  mcpClients: z.infer<typeof mcpClientSchema>[];
  agentSkills: z.infer<typeof agentSkillSchema>[];
  agentPlugin: { repo: string; directory: string } | null;
  apiVersions: z.infer<typeof apiVersionSchema>[];
  owners: z.infer<typeof ownerSchema>[];
  dashboardSurfaces: z.infer<typeof dashboardSurfaceSchema>[];
  keyScopes: z.infer<typeof keyScopeSchema>[];
  pageTemplates: z.infer<typeof pageTemplatesSchema>;
  mcpTools: { name: string }[];  // Stub for validation; full schema in phase 2
}

export function loadRegistries(): Registries {
  const sections = loadYaml("sections.yaml", sectionsFileSchema);
  const landing = loadYaml("landing.yaml", landingSchema);
  const agentSkills = loadYaml("agent-skills.yaml", agentSkillsFileSchema);

  // Load agent plugin separately
  let agentPlugin = null;
  try {
    agentPlugin = loadYaml("agent-plugin.yaml", agentPluginSchema);
  } catch {
    // Optional file
  }

  return {
    sections,
    landing,
    platformFamilies: loadYaml("platform-families.yaml", z.array(platformFamilySchema)),
    platforms: loadYaml("platforms.yaml", z.array(platformSchema)),
    features: loadYaml("features.yaml", z.array(featureSchema)),
    ciProviders: loadYaml("ci-providers.yaml", z.array(ciProviderSchema)),
    hosts: loadYaml("hosts.yaml", z.array(hostSchema)),
    otelSources: loadYaml("otel-sources.yaml", z.array(otelSourceSchema)),
    mcpClients: loadYaml("mcp-clients.yaml", z.array(mcpClientSchema)),
    agentSkills,
    agentPlugin,
    apiVersions: loadYaml("api-versions.yaml", z.array(apiVersionSchema)),
    owners: loadYaml("owners.yaml", z.array(ownerSchema)),
    dashboardSurfaces: loadYaml("dashboard-surfaces.yaml", z.array(dashboardSurfaceSchema)),
    keyScopes: loadYaml("key-scopes.yaml", z.array(keyScopeSchema)),
    pageTemplates: loadYaml("page-templates.yaml", pageTemplatesSchema),
    mcpTools: [],  // Stub: populated from _data/mcp-tools.json in phase 2
  };
}

export function validateRegistries(reg: Registries): void {
  const errors: string[] = [];

  // Check for duplicate IDs in each registry
  const checkDuplicates = <T extends { id: string }>(
    items: T[],
    name: string
  ) => {
    const ids = new Set<string>();
    for (const item of items) {
      if (ids.has(item.id)) {
        errors.push(`Duplicate ${name} id: ${item.id}`);
      }
      ids.add(item.id);
    }
  };

  checkDuplicates(reg.sections, "section");
  checkDuplicates(reg.platformFamilies, "platform family");
  checkDuplicates(reg.platforms, "platform");
  checkDuplicates(reg.features, "feature");
  checkDuplicates(reg.ciProviders, "CI provider");
  checkDuplicates(reg.hosts, "host");
  checkDuplicates(reg.otelSources, "OTEL source");
  checkDuplicates(reg.mcpClients, "MCP client");
  checkDuplicates(reg.agentSkills, "agent skill");
  checkDuplicates(reg.apiVersions, "API version");
  checkDuplicates(reg.owners, "owner");
  checkDuplicates(reg.dashboardSurfaces, "dashboard surface");
  checkDuplicates(reg.keyScopes, "key scope");

  // Check platform family references
  const familyIds = new Set(reg.platformFamilies.map((f) => f.id));
  for (const platform of reg.platforms) {
    if (!familyIds.has(platform.family)) {
      errors.push(`Platform ${platform.id} references unknown family: ${platform.family}`);
    }
    if (platform.parent) {
      const parent = reg.platforms.find((p) => p.id === platform.parent);
      if (!parent) {
        errors.push(`Platform ${platform.id} references unknown parent: ${platform.parent}`);
      }
    }
  }

  // Check skill stage values match LOOP_STAGES
  const validStages = new Set(["get-started", "instrument", "observe", "triage", "verify"]);
  for (const skill of reg.agentSkills) {
    if (!validStages.has(skill.stage)) {
      errors.push(`Agent skill ${skill.id} has invalid stage: ${skill.stage}`);
    }
  }

  // Check integration conformance rule: stable entries with integration block must have conformance.status == pass
  const checkConformanceRule = <T extends { id: string; status: string; integration?: { conformance?: { status: string } } }>(
    items: T[],
    name: string
  ) => {
    for (const item of items) {
      if (item.status === "stable" && item.integration && item.integration.conformance) {
        if (item.integration.conformance.status !== "pass") {
          errors.push(`${name} ${item.id} has status "stable" but conformance status is "${item.integration.conformance.status}" (must be "pass")`);
        }
      }
    }
  };

  checkConformanceRule(reg.platforms, "Platform");
  checkConformanceRule(reg.ciProviders, "CI provider");
  checkConformanceRule(reg.hosts, "Host");
  checkConformanceRule(reg.otelSources, "OTEL source");

  if (errors.length > 0) {
    console.error("\n❌ Registry validation failed:");
    for (const error of errors) {
      console.error(`  • ${error}`);
    }
    process.exit(1);
  }
}
