import { z } from "zod";
import type { Registries } from "./registries.js";

const kebab = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const enumOf = (ids: string[], what: string) =>
  z.string().refine(
    (v) => ids.includes(v),
    (v) => ({ message: `Unknown ${what} "${v}". Add it to _registry first.` })
  );

export const PAGE_TYPES = [
  "hub",
  "quickstart",
  "guide",
  "feature",
  "concept",
  "reference",
  "troubleshooting",
] as const;

export const STATUSES = ["stable", "beta", "preview", "deprecated"] as const;

export const LOOP_STAGES = [
  "get-started",
  "instrument",
  "observe",
  "triage",
  "verify",
] as const;

export function frontmatterSchema(reg: Registries) {
  const platform = enumOf(
    reg.platforms.map((p) => p.id),
    "platform"
  );
  const feature = enumOf(
    reg.features.map((f) => f.id),
    "feature"
  );
  const client = enumOf(
    reg.mcpClients.map((c) => c.id),
    "MCP client"
  );
  const ci = enumOf(
    reg.ciProviders.map((c) => c.id),
    "CI provider"
  );
  const host = enumOf(
    reg.hosts.map((h) => h.id),
    "host"
  );
  const apiVersion = enumOf(
    reg.apiVersions.map((v) => v.id),
    "API version"
  );
  const section = enumOf(
    reg.sections.map((s) => s.id),
    "section"
  );
  const owner = enumOf(
    reg.owners.map((o) => o.id),
    "owner"
  );

  return z
    .object({
      id: z.string().regex(kebab, "id must be kebab-case"),
      title: z
        .string()
        .min(3)
        .max(70)
        .refine((t) => !t.endsWith("."), "Page titles have no full stop"),
      navTitle: z.string().min(2).max(30).optional(),
      description: z.string().min(50).max(160),
      type: z.enum(PAGE_TYPES),
      section,
      platform: z.array(platform).default([]),
      feature: z.array(feature).default([]),
      ci: ci.optional(),
      host: host.optional(),
      clients: z.array(client).default([]),
      apiVersion: apiVersion.optional(),
      versionOf: z.string().regex(kebab).optional(),
      status: z.enum(STATUSES).default("stable"),
      replacedBy: z.string().regex(kebab).optional(),
      loopStage: z.array(z.enum(LOOP_STAGES)).default([]),
      audience: z
        .array(z.enum(["human", "agent"]))
        .min(1)
        .default(["human"]),
      visibility: z.enum(["public", "contributor"]).default("public"),
      package: z.string().optional(),
      minVersion: z
        .string()
        .regex(/^\d+\.\d+\.\d+$/, "minVersion must be semver X.Y.Z")
        .optional(),
      order: z.number().int().min(0).max(999).optional(),
      tags: z.array(z.string().regex(kebab)).max(16).default([]),
      related: z.array(z.string().regex(kebab)).max(6).default([]),
      lastReviewed: z
        .string()
        .regex(isoDate, "lastReviewed must be YYYY-MM-DD")
        .refine(
          (d) => new Date(d) <= new Date(),
          "lastReviewed cannot be in the future"
        ),
      owner,
      nav: z.boolean().default(true),
      noindex: z.boolean().default(false),
    })
    .strict() // Reject unknown keys (including legacy `sdk:`)
    .superRefine((fm, ctx) => {
      const fail = (message: string, path: string) =>
        ctx.addIssue({ code: "custom", message, path: [path] });

      // Section-specific validation
      if (fm.section === "platforms") {
        if (fm.type !== "hub" && fm.platform.length !== 1) {
          fail("Platforms pages need exactly one platform", "platform");
        }
        if (
          !["hub", "quickstart", "guide", "troubleshooting", "reference"].includes(
            fm.type
          )
        ) {
          fail("Invalid type for Platforms", "type");
        }
      }

      if (fm.type === "feature" && fm.feature.length !== 1) {
        fail("Feature pages document exactly one feature", "feature");
      }

      if (fm.section === "deploy" && fm.type === "guide") {
        // Deploy & CI guide pages must have either ci or host
        if (!fm.ci && !fm.host) {
          fail("Deploy & CI pages must set either ci or host", "ci");
        }
        if (fm.ci && fm.host) {
          fail("Deploy & CI pages cannot set both ci and host", "ci");
        }
      }

      if (fm.clients.length > 0 && fm.section !== "agents") {
        fail("clients only in Agents and MCP", "clients");
      }

      if (fm.apiVersion && fm.section !== "reference") {
        fail("apiVersion only on Reference pages", "apiVersion");
      }

      if (fm.versionOf && !fm.apiVersion) {
        fail("versionOf needs apiVersion", "versionOf");
      }

      if (fm.status === "deprecated" && !fm.replacedBy) {
        fail("Deprecated pages need replacedBy", "replacedBy");
      }

      if (fm.section !== "platforms" && fm.order === undefined) {
        fail("order is required outside Platforms", "order");
      }

      const effectiveLabel = fm.navTitle ?? fm.title;
      if (effectiveLabel.length > 30) {
        fail("Sidebar label too long: set navTitle (≤ 30)", "navTitle");
      }

      // Reject legacy sdk: field
      if ("sdk" in fm) {
        fail('Use platform: [id] instead of sdk:', "sdk");
      }
    });
}

export type Frontmatter = z.infer<ReturnType<typeof frontmatterSchema>>;
